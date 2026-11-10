import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import {
  createStore,
  id,
  token,
  hash,
  now,
  passwordHash,
  passwordMatches,
} from "./store.mjs";
import { createFiles, readBody, MAX_FILE } from "./files.mjs";
import { HttpError, assert, text, rubric, grade } from "./validation.mjs";
const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  role: u.role,
  classIds: u.classIds || [],
});
const publicAssignment = (a) => ({
  id: a.id,
  title: a.title,
  course: a.course,
  instructions: a.instructions,
  questionFiles: a.questionFiles,
  classIds: a.classIds,
  dueAt: a.dueAt,
  version: a.version,
  questions: a.rubric?.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    maxPoints: q.maxPoints,
  })),
  createdAt: a.createdAt,
});
const publicSubmission = (s) => ({
  id: s.id,
  assignmentId: s.assignmentId,
  text: s.text,
  files: s.files,
  status: s.status,
  submittedAt: s.submittedAt,
  updatedAt: s.updatedAt,
  publishedGrade: s.publishedGrade,
  version: s.version,
  clientId: s.clientId,
  returnedReason: s.returnedReason,
});
const encodeCookie = (value, age) =>
  `hw_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
export async function createHomework() {
  if (!process.env.DATABASE_URL)
    return async (req, res) => {
      if (req.url.startsWith("/api/homework/")) {
        res
          .writeHead(503, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "作业服务正在准备，请稍后再试" }));
        return true;
      }
      return false;
    };
  const db = createStore(
    process.env.DATABASE_URL,
    process.env.HOMEWORK_DB_SCHEMA || "homework",
  );
  await db.init();
  const files = createFiles(db);
  const limited = new Map();
  const json = (res, value, status = 200) =>
    res
      .writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      })
      .end(JSON.stringify(value));
  const body = async (req) => {
    try {
      return JSON.parse((await readBody(req)).toString() || "{}");
    } catch (e) {
      if (e.status) throw e;
      throw new HttpError(400, "内容格式不正确");
    }
  };
  const rate = (req, kind, maximum) => {
    const ip = String(
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      )
        .split(",")
        .at(-1)
        .trim(),
      key = `${kind}:${ip}`,
      time = Date.now();
    const entry = limited.get(key) || { count: 0, until: time + 600000 };
    if (time > entry.until) {
      entry.count = 0;
      entry.until = time + 600000;
    }
    entry.count++;
    limited.set(key, entry);
    if (limited.size > 10000)
      for (const [k, v] of limited) if (v.until < time) limited.delete(k);
    assert(entry.count <= maximum, "操作过于频繁，请十分钟后再试", 429);
  };
  const secretKey = () =>
    Buffer.from(process.env.HOMEWORK_ENCRYPTION_KEY || "", "hex");
  const encrypt = (value) => {
    assert(secretKey().length === 32, "服务端尚未配置密钥保护");
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
    return Buffer.concat([
      iv,
      cipher.update(value),
      cipher.final(),
      cipher.getAuthTag(),
    ]).toString("base64");
  };
  const decrypt = (value) => {
    if (!value) return "";
    const b = Buffer.from(value, "base64"),
      d = createDecipheriv("aes-256-gcm", secretKey(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(-16));
    return Buffer.concat([d.update(b.subarray(12, -16)), d.final()]).toString();
  };
  const sessionFor = async (req) => {
    const raw = (req.headers.cookie || "")
      .split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("hw_session="))
      ?.slice(11);
    if (!raw) return null;
    const s = await db.get("session:" + hash(raw));
    if (!s || Date.parse(s.expiresAt) < Date.now()) return null;
    const u = await db.get(s.userId);
    return u ? { user: u, session: s } : null;
  };
  const requireAssignment = async (key, user, c) => {
    const a = await db.get(key, c);
    assert(a?.type === "assignment", "未找到这份作业", 404);
    assert(
      user.role === "teacher"
        ? a.teacherId === user.id
        : a.published && a.classIds.some((x) => user.classIds?.includes(x)),
      "没有访问这份作业的权限",
      403,
    );
    return a;
  };
  const requireSubmission = async (key, user, c) => {
    const s = await db.get(key, c);
    assert(s?.type === "submission", "未找到这份提交", 404);
    if (user.role === "student")
      assert(s.studentId === user.id, "没有访问这份提交的权限", 403);
    else await requireAssignment(s.assignmentId, user, c);
    return s;
  };
  const startSession = async (user, res) => {
    const raw = token(),
      s = {
        id: "session:" + hash(raw),
        userId: user.id,
        csrf: token(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      };
    await db.put("session", s);
    res.setHeader("Set-Cookie", encodeCookie(raw, 7 * 86400));
    return { user: safeUser(user), csrf: s.csrf };
  };
  const queueGrade = async (s, a, c) => {
    s.version = a.version;
    s.rubricSnapshot = structuredClone(a.rubric);
    s.status = "queued";
    s.suggestedGrade = null;
    s.error = null;
    s.jobId = await db.enqueue(
      "grade",
      s.id,
      {
        assignmentId: a.id,
        title: a.title,
        instructions: a.instructions,
        version: a.version,
        rubric: a.rubric,
        text: s.text,
        files: s.files,
      },
      c,
    );
    s.updatedAt = now();
    await db.put("submission", s, c);
  };
  const authorizeFile = async (file, user) => {
    if (file.owner === user.id) return true;
    for (const a of await db.list("assignment"))
      if (
        (a.questionFiles || []).includes(file.id) &&
        (user.role === "teacher"
          ? a.teacherId === user.id
          : a.published && a.classIds.some((x) => user.classIds?.includes(x)))
      )
        return true;
    if (user.role === "teacher")
      for (const s of await db.list("submission"))
        if (
          s.files?.includes(file.id) &&
          (await db.get(s.assignmentId))?.teacherId === user.id
        )
          return true;
    return false;
  };
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/api/homework/")) return false;
    const route = url.pathname
        .slice("/api/homework/".length)
        .split("/")
        .filter(Boolean),
      method = req.method;
    try {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      if (!["GET", "POST", "PUT", "DELETE"].includes(method))
        throw new HttpError(405, "不支持的请求方式");
      if (route[0] === "worker") {
        const device = await db.get("device"),
          provided = (req.headers.authorization || "").replace(/^Bearer /, "");
        assert(
          device &&
            !device.revoked &&
            provided &&
            timingSafeEqual(
              Buffer.from(hash(provided)),
              Buffer.from(device.secretHash),
            ),
          "设备未配对或已停用",
          401,
        );
        if (route[1] === "heartbeat" && method === "POST") {
          const b = await body(req);
          device.lastSeen = now();
          device.modelReady = Boolean(b.modelReady);
          device.model = text(b.model, 100);
          device.busy = Boolean(b.busy);
          device.lastError = text(b.error, 300);
          await db.put("device", device);
          return (json(res, { ok: true }), true);
        }
        if (route[1] === "settings" && method === "GET") {
          const s = await db.get("model-settings");
          return (
            json(res, {
              ...s,
              apiKey: decrypt(s.apiKeyEncrypted),
              apiKeyEncrypted: undefined,
            }),
            true
          );
        }
        if (route[1] === "claim" && method === "POST") {
          const job = await db.tx(async (c) => {
            await c.query(
              `UPDATE ${db.jobs} SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,lease=NULL,lease_until=NULL,error='设备中断，等待重试' WHERE status='running' AND lease_until<now()`,
            );
            const failed = await c.query(
              `SELECT id,target,kind FROM ${db.jobs} WHERE status='failed' AND finished IS NULL`,
            );
            for (const j of failed.rows) {
              const target = await db.get(j.target, c);
              if (target?.jobId === j.id) {
                target.status = "needs_review";
                target.error = "本地设备多次中断，请检查后重新批改";
                await db.put(
                  j.kind === "grade" ? "submission" : "assignment",
                  target,
                  c,
                );
              }
              await c.query(
                `UPDATE ${db.jobs} SET finished=now() WHERE id=$1`,
                [j.id],
              );
            }
            const selected = (
              await c.query(
                `SELECT * FROM ${db.jobs} WHERE status='queued' AND (lease_until IS NULL OR lease_until<now()) ORDER BY created FOR UPDATE SKIP LOCKED LIMIT 1`,
              )
            ).rows[0];
            if (!selected) return null;
            const lease = token();
            await c.query(
              `UPDATE ${db.jobs} SET status='running',lease=$2,lease_until=now()+interval '120 seconds',attempts=attempts+1 WHERE id=$1`,
              [selected.id, hash(lease)],
            );
            const target = await db.get(selected.target, c);
            if (target?.jobId === selected.id) {
              target.status = selected.kind === "grade" ? "grading" : "parsing";
              await db.put(
                selected.kind === "grade" ? "submission" : "assignment",
                target,
                c,
              );
            }
            return {
              id: selected.id,
              kind: selected.kind,
              target: selected.target,
              payload: selected.payload,
              lease,
            };
          });
          return (json(res, { job }), true);
        }
        if (route[1] === "jobs" && route[2]) {
          const job = (
            await db.query(`SELECT * FROM ${db.jobs} WHERE id=$1`, [route[2]])
          ).rows[0];
          assert(
            job &&
              job.status === "running" &&
              job.lease === hash(String(req.headers["x-job-lease"] || "")) &&
              new Date(job.lease_until) > new Date(),
            "任务租约已失效",
            409,
          );
          if (route[3] === "files" && route[4] && method === "GET") {
            assert(
              job.payload.files?.includes(route[4]),
              "此附件不属于当前任务",
              403,
            );
            const f = await db.get(route[4]);
            res.writeHead(200, {
              "Content-Type": f.mime,
              "Content-Length": f.size,
              "X-File-Name": encodeURIComponent(f.name),
            });
            (await files.read(f)).on("error", () => res.destroy()).pipe(res);
            return true;
          }
          if (route[3] === "renew" && method === "POST") {
            const r = await db.query(
              `UPDATE ${db.jobs} SET lease_until=now()+interval '120 seconds' WHERE id=$1 AND lease=$2 AND status='running' AND lease_until>now()`,
              [job.id, job.lease],
            );
            assert(r.rowCount, "任务已过期", 409);
            return (json(res, { ok: true }), true);
          }
          if (route[3] === "complete" && method === "POST") {
            const b = await body(req);
            await db.tx(async (c) => {
              const current = (
                await c.query(
                  `SELECT * FROM ${db.jobs} WHERE id=$1 FOR UPDATE`,
                  [job.id],
                )
              ).rows[0];
              assert(
                current.status === "running" &&
                  current.lease === job.lease &&
                  new Date(current.lease_until) > new Date(),
                "任务已过期",
                409,
              );
              let result;
              if (job.kind === "parse")
                result = { questions: rubric(b.questions) };
              else if (job.kind === "grade")
                result = grade(b, job.payload.rubric);
              else
                result = { ok: Boolean(b.ok), message: text(b.message, 1000) };
              await c.query(
                `UPDATE ${db.jobs} SET status='complete',result=$2,finished=now(),lease=NULL WHERE id=$1`,
                [job.id, result],
              );
              const target = await db.get(job.target, c);
              if (target?.jobId === job.id) {
                if (job.kind === "parse") {
                  target.draftRubric = result.questions;
                  target.status = "answer_review";
                } else if (job.kind === "grade") {
                  target.suggestedGrade = result;
                  target.status = "needs_review";
                }
                await db.put(
                  job.kind === "grade" ? "submission" : "assignment",
                  target,
                  c,
                );
              }
            });
            return (json(res, { ok: true }), true);
          }
          if (route[3] === "fail" && method === "POST") {
            const b = await body(req);
            await db.tx(async (c) => {
              const r = await c.query(
                `UPDATE ${db.jobs} SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,error=$3,lease=NULL,lease_until=now()+interval '30 seconds',finished=CASE WHEN attempts>=3 THEN now() ELSE NULL END WHERE id=$1 AND lease=$2 AND status='running' AND lease_until>now() RETURNING status`,
                [job.id, job.lease, text(b.error, 300) || "本地处理失败"],
              );
              assert(r.rowCount, "任务已过期", 409);
              const target = await db.get(job.target, c);
              if (target?.jobId === job.id) {
                target.status =
                  r.rows[0].status === "failed" ? "needs_review" : "queued";
                target.error = text(b.error, 300);
                await db.put(
                  job.kind === "grade" ? "submission" : "assignment",
                  target,
                  c,
                );
              }
            });
            return (json(res, { ok: true }), true);
          }
        }
        throw new HttpError(404, "没有这个设备接口");
      }
      if (method !== "GET") {
        const origin = req.headers.origin,
          allowed = process.env.PUBLIC_ORIGIN || `http://${req.headers.host}`;
        assert(!origin || origin === allowed, "请求来源不匹配", 403);
        assert(
          req.headers["sec-fetch-site"] !== "cross-site",
          "请从本站操作",
          403,
        );
      }
      if (route[0] === "login" && method === "POST") {
        rate(req, "login", 30);
        const b = await body(req);
        const user = (await db.list("user")).find(
          (u) => u.username === text(b.username, 64).toLowerCase(),
        );
        assert(
          user && passwordMatches(String(b.password || ""), user.password),
          "账号或密码不正确",
          401,
        );
        return (json(res, await startSession(user, res)), true);
      }
      if (route[0] === "register" && method === "POST") {
        rate(req, "register", 15);
        const b = await body(req),
          username = text(b.username, 64).toLowerCase();
        assert(
          /^[a-z0-9._-]{3,40}$/.test(username),
          "账号使用 3–40 位英文字母、数字或 ._-",
        );
        assert(
          typeof b.password === "string" &&
            b.password.length >= 10 &&
            b.password.length <= 200,
          "密码需为 10–200 位",
        );
        assert(text(b.name, 80), "请填写姓名");
        const user = await db.tx(async (c) => {
          const cls = (await db.list("class", c)).find(
            (x) => x.invite === text(b.invite, 40).toUpperCase() && !x.archived,
          );
          assert(cls, "班级邀请码不正确");
          assert(
            !(await db.list("user", c)).some((x) => x.username === username),
            "该账号已被使用",
            409,
          );
          return db.put(
            "user",
            {
              id: id(),
              username,
              name: text(b.name, 80),
              password: passwordHash(b.password),
              role: "student",
              classIds: [cls.id],
              createdAt: now(),
            },
            c,
          );
        });
        return (json(res, await startSession(user, res), 201), true);
      }
      const auth = await sessionFor(req);
      assert(auth, "请先登录", 401);
      const user = auth.user;
      if (method !== "GET")
        assert(
          req.headers["x-csrf-token"] === auth.session.csrf,
          "登录已更新，请刷新页面",
          403,
        );
      const teacher = () =>
        assert(user.role === "teacher", "此操作仅对教师开放", 403);
      if (route[0] === "me" && method === "GET")
        return (
          json(res, { user: safeUser(user), csrf: auth.session.csrf }),
          true
        );
      if (route[0] === "logout" && method === "POST") {
        await db.remove(auth.session.id);
        res.setHeader("Set-Cookie", encodeCookie("", 0));
        return (json(res, { ok: true }), true);
      }
      if (route[0] === "password" && method === "POST") {
        const b = await body(req);
        assert(
          passwordMatches(String(b.current || ""), user.password),
          "原密码不正确",
          403,
        );
        assert(
          typeof b.password === "string" &&
            b.password.length >= 10 &&
            b.password.length <= 200,
          "新密码需为 10–200 位",
        );
        user.password = passwordHash(b.password);
        await db.put("user", user);
        for (const s of await db.list("session"))
          if (s.userId === user.id) await db.remove(s.id);
        return (json(res, await startSession(user, res)), true);
      }
      if (route[0] === "classes") {
        if (method === "GET")
          return (
            json(res, {
              classes: (await db.list("class"))
                .filter((x) =>
                  user.role === "teacher"
                    ? x.teacherId === user.id
                    : user.classIds.includes(x.id),
                )
                .map((x) =>
                  user.role === "teacher" ? x : { id: x.id, name: x.name },
                ),
            }),
            true
          );
        teacher();
        if (method === "POST") {
          const b = await body(req);
          assert(text(b.name, 80), "请填写班级名称");
          const cls = {
            id: id(),
            name: text(b.name, 80),
            teacherId: user.id,
            invite: randomBytes(6).toString("hex").toUpperCase(),
            createdAt: now(),
          };
          await db.put("class", cls);
          return (json(res, { class: cls }, 201), true);
        }
      }
      if (route[0] === "join" && method === "POST") {
        assert(user.role === "student", "请使用学生账号");
        const b = await body(req),
          cls = (await db.list("class")).find(
            (x) => x.invite === text(b.invite, 40).toUpperCase() && !x.archived,
          );
        assert(cls, "班级邀请码不正确");
        user.classIds = [...new Set([...user.classIds, cls.id])];
        await db.put("user", user);
        return (json(res, { user: safeUser(user) }), true);
      }
      if (route[0] === "files") {
        if (method === "POST" && route[1] && route[2] === "rotate") {
          const f = await db.get(route[1]);
          assert(
            f?.owner === user.id && f.mime.startsWith("image/"),
            "不能旋转此附件",
            403,
          );
          rate(req, "rotate", 60);
          return (json(res, { file: await files.rotate(f) }), true);
        }
        if (method === "POST") {
          rate(req, "upload", 100);
          const purpose = url.searchParams.get("purpose");
          assert(
            ["answer", "question", "submission"].includes(purpose),
            "附件用途不正确",
          );
          if (purpose !== "submission") teacher();
          const f = await files.upload(await readBody(req, MAX_FILE), {
            owner: user.id,
            purpose,
            name: url.searchParams.get("name"),
          });
          return (json(res, { file: f }, 201), true);
        }
        if (method === "GET" && route[1]) {
          const f = await db.get(route[1]);
          assert(
            f?.mime && (await authorizeFile(f, user)),
            "附件不存在或无权查看",
            404,
          );
          if (url.searchParams.get("meta") === "1")
            return (json(res, { file: f }), true);
          res.writeHead(200, {
            "Content-Type": f.mime,
            "Content-Length": f.size,
            "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`,
          });
          (await files.read(f)).on("error", () => res.destroy()).pipe(res);
          return true;
        }
      }
      if (route[0] === "assignments") {
        if (method === "GET" && !route[1]) {
          const all = (await db.list("assignment")).filter((a) =>
            user.role === "teacher"
              ? a.teacherId === user.id
              : a.published &&
                a.classIds.some((x) => user.classIds.includes(x)),
          );
          return (
            json(res, {
              assignments:
                user.role === "teacher" ? all : all.map(publicAssignment),
            }),
            true
          );
        }
        if (method === "POST" && !route[1]) {
          teacher();
          const b = await body(req);
          assert(text(b.title, 120), "请填写作业标题");
          const classes = (await db.list("class")).filter(
            (x) => x.teacherId === user.id,
          );
          assert(
            Array.isArray(b.classIds) &&
              b.classIds.length &&
              b.classIds.every((x) => classes.some((c) => c.id === x)),
            "请选择自己的班级",
          );
          const a = {
            id: id(),
            type: "assignment",
            teacherId: user.id,
            title: text(b.title, 120),
            course: text(b.course, 80) || "AP Economics",
            instructions: text(b.instructions, 20000),
            classIds: b.classIds,
            dueAt: b.dueAt ? new Date(b.dueAt).toISOString() : null,
            questionFiles: [],
            answerFiles: [],
            answerText: "",
            version: 0,
            published: false,
            status: "draft",
            createdAt: now(),
          };
          await db.put("assignment", a);
          return (json(res, { assignment: a }, 201), true);
        }
        if (route[1]) {
          const a = await requireAssignment(route[1], user);
          if (method === "GET")
            return (
              json(res, {
                assignment: user.role === "teacher" ? a : publicAssignment(a),
              }),
              true
            );
          teacher();
          const b = await body(req);
          if (route[2] === "source" && method === "PUT") {
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(
                Number(b.sourceRevision || 0) ===
                  Number(current.sourceRevision || 0),
                "答案已在另一处更新，请刷新后重试",
                409,
              );
              await files.validate(b.answerFiles || [], user.id, "answer", c);
              await files.validate(
                b.questionFiles || [],
                user.id,
                "question",
                c,
              );
              current.answerFiles = b.answerFiles || [];
              current.questionFiles = b.questionFiles || [];
              current.answerText = text(b.answerText, 40000);
              current.instructions = text(b.instructions, 20000);
              current.sourceRevision = (current.sourceRevision || 0) + 1;
              current.draftRubric = null;
              current.status = "draft";
              current.jobId = null;
              await db.put("assignment", current, c);
            });
            return (json(res, { assignment: await db.get(a.id) }), true);
          }
          if (route[2] === "parse" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(
                current.answerText || current.answerFiles?.length,
                "请先上传或填写参考答案",
              );
              current.jobId = await db.enqueue(
                "parse",
                a.id,
                {
                  text: current.answerText,
                  files: current.answerFiles,
                  title: current.title,
                  instructions: current.instructions,
                  sourceRevision: current.sourceRevision,
                },
                c,
              );
              current.status = "queued";
              await db.put("assignment", current, c);
            });
            return (json(res, { assignment: await db.get(a.id) }), true);
          }
          if (route[2] === "confirm" && method === "POST") {
            const questions = rubric(b.questions);
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(
                Number(b.sourceRevision || 0) ===
                  Number(current.sourceRevision || 0),
                "答案已更新，请刷新后重新确认",
                409,
              );
              const version = current.version + 1;
              await db.put(
                "answer-version",
                {
                  id: `${a.id}:v${version}`,
                  assignmentId: a.id,
                  version,
                  rubric: questions,
                  answerText: current.answerText,
                  answerFiles: current.answerFiles,
                  confirmedBy: user.id,
                  confirmedAt: now(),
                },
                c,
              );
              current.version = version;
              current.rubric = questions;
              current.draftRubric = questions;
              current.status = "ready";
              current.jobId = null;
              current.published = true;
              await db.put("assignment", current, c);
              await db.audit(
                user.id,
                "confirm_answer",
                `${a.id}:v${version}`,
                c,
              );
            });
            return (json(res, { assignment: await db.get(a.id) }), true);
          }
          if (route[2] === "visibility" && method === "POST") {
            a.published = Boolean(b.published);
            assert(!a.published || a.version > 0, "请先确认参考答案");
            await db.put("assignment", a);
            return (json(res, { assignment: a }), true);
          }
        }
      }
      if (route[0] === "submissions") {
        if (method === "GET" && !route[1]) {
          const assignments = (await db.list("assignment"))
              .filter((a) => a.teacherId === user.id)
              .map((a) => a.id),
            users = await db.list("user");
          const rows = (await db.list("submission")).filter((s) =>
            user.role === "teacher"
              ? assignments.includes(s.assignmentId)
              : s.studentId === user.id,
          );
          return (
            json(res, {
              submissions: rows.map((s) =>
                user.role === "teacher"
                  ? {
                      ...s,
                      studentName:
                        users.find((u) => u.id === s.studentId)?.name || "学生",
                    }
                  : publicSubmission(s),
              ),
            }),
            true
          );
        }
        if (method === "POST" && !route[1]) {
          assert(user.role === "student", "请使用学生账号提交");
          const b = await body(req);
          const result = await db.tx(async (c) => {
            const a = await requireAssignment(b.assignmentId, user, c);
            assert(
              !a.dueAt || Date.parse(a.dueAt) > Date.now() || b.draft,
              "已超过截止时间，请联系教师",
            );
            const submissionId = hash(
              `${user.id}:${a.id}:${text(b.clientId, 100)}`,
            );
            assert(text(b.clientId, 100), "缺少提交凭证");
            const previous = await db.get(submissionId, c);
            if (previous && previous.status !== "draft") return previous;
            await files.validate(b.files || [], user.id, "submission", c);
            const content = text(b.text, 40000);
            assert(
              b.draft || content || (b.files || []).length,
              "请上传附件或填写答案",
            );
            assert(a.version > 0, "教师尚未确认评分标准");
            const s = {
              id: submissionId,
              type: "submission",
              studentId: user.id,
              assignmentId: a.id,
              clientId: text(b.clientId, 100),
              text: content,
              files: b.files || [],
              status: "draft",
              createdAt: previous?.createdAt || now(),
              updatedAt: now(),
            };
            if (!b.draft) {
              s.submittedAt = now();
              await queueGrade(s, a, c);
            } else await db.put("submission", s, c);
            return s;
          });
          return (
            json(res, { submission: publicSubmission(result) }, 201),
            true
          );
        }
        if (route[1]) {
          const s = await requireSubmission(route[1], user);
          if (method === "GET")
            return (
              json(res, {
                submission: user.role === "teacher" ? s : publicSubmission(s),
              }),
              true
            );
          teacher();
          const b = await body(req);
          if (route[2] === "regrade" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireSubmission(s.id, user, c),
                a = await requireAssignment(s.assignmentId, user, c);
              assert(a.version > 0, "尚未确认参考答案");
              await queueGrade(current, a, c);
              await db.audit(user.id, "regrade", s.id, c);
            });
            return (json(res, { ok: true }), true);
          }
          if (route[2] === "publish" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireSubmission(s.id, user, c);
              assert(
                !["queued", "grading"].includes(current.status),
                "请等待初批完成，或先退回提交",
              );
              assert(
                b.jobId === current.jobId,
                "这份作业已重新批改，请刷新后复核",
                409,
              );
              const reviewed = grade(b, current.rubricSnapshot);
              assert(
                reviewed.questions.every(
                  (q) => q.score !== null && !q.needsReview,
                ),
                "请逐题确认分数、依据与反馈",
              );
              current.publishedGrade = {
                ...reviewed,
                teacherNote: text(b.teacherNote, 4000),
                publishedAt: now(),
                answerVersion: current.version,
              };
              current.status = "published";
              current.updatedAt = now();
              await db.put("submission", current, c);
              await db.audit(user.id, "publish_grade", s.id, c);
            });
            return (json(res, { submission: await db.get(s.id) }), true);
          }
          if (route[2] === "return" && method === "POST") {
            assert(text(b.reason, 1000), "请填写退回原因");
            s.status = "returned";
            s.returnedReason = text(b.reason, 1000);
            s.jobId = null;
            await db.put("submission", s);
            await db.audit(user.id, "return", s.id);
            return (json(res, { ok: true }), true);
          }
        }
      }
      if (route[0] === "device") {
        teacher();
        if (method === "GET") {
          const d = await db.get("device"),
            settings = await db.get("model-settings");
          return (
            json(res, {
              device: d
                ? {
                    name: d.name,
                    lastSeen: d.lastSeen,
                    online:
                      !d.revoked && Date.now() - Date.parse(d.lastSeen) < 45000,
                    modelReady: d.modelReady,
                    model: d.model,
                    busy: d.busy,
                    lastError: d.lastError,
                    revoked: d.revoked,
                  }
                : null,
              settings: {
                ...settings,
                apiKeyEncrypted: undefined,
                hasApiKey: Boolean(settings.apiKeyEncrypted),
              },
            }),
            true
          );
        }
        const b = await body(req);
        if (route[1] === "settings" && method === "PUT") {
          const old = await db.get("model-settings"),
            provider = b.provider === "openai" ? "openai" : "ollama",
            u = new URL(text(b.baseUrl, 500));
          assert(
            provider === "ollama"
              ? ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) &&
                  u.protocol === "http:"
              : u.protocol === "https:" && b.cloudConsent === true,
            "本地模型只允许本机地址；外部 API 需使用 HTTPS 并确认传送资料",
          );
          assert(
            !u.username && !u.password && !u.search && !u.hash,
            "模型地址不能包含凭据或查询参数",
          );
          const settings = {
            id: "model-settings",
            provider,
            baseUrl: u.toString().replace(/\/$/, ""),
            model: text(b.model, 120),
            apiKeyEncrypted: b.apiKey
              ? encrypt(text(b.apiKey, 2000))
              : old.apiKeyEncrypted,
            cloudConsent: provider === "openai",
            updatedAt: now(),
          };
          assert(settings.model, "请填写模型名称");
          await db.put("settings", settings);
          await db.audit(user.id, "model_settings", "device");
          return (json(res, { ok: true }), true);
        }
        if (route[1] === "test" && method === "POST") {
          const jobId = await db.enqueue("test", "device-test", {});
          return (json(res, { jobId }), true);
        }
        if (route[1] === "pause" && method === "POST") {
          const d = await db.get("device");
          d.revoked = Boolean(b.paused);
          await db.put("device", d);
          return (json(res, { ok: true }), true);
        }
      }
      if (route[0] === "jobs" && route[1] && method === "GET") {
        teacher();
        const job = (
          await db.query(
            `SELECT id,kind,target,status,result,error FROM ${db.jobs} WHERE id=$1`,
            [route[1]],
          )
        ).rows[0];
        assert(job, "任务不存在", 404);
        if (job.kind === "grade") await requireSubmission(job.target, user);
        else if (job.kind === "parse")
          await requireAssignment(job.target, user);
        return (json(res, { job }), true);
      }
      throw new HttpError(404, "没有找到此接口");
    } catch (error) {
      if (res.headersSent) {
        res.destroy();
        return true;
      }
      if (!error.status)
        console.error("homework request failed", error.code || error.name);
      json(
        res,
        {
          error: error.status ? error.message : "暂时无法完成操作，请稍后重试",
        },
        error.status || 500,
      );
      return true;
    }
  };
}
