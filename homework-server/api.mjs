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
import { HttpError, assert, text, boundedText, rubric, grade, automaticGrade } from "./validation.mjs";
import {visibleQuestions, publishedResult, mistakeRows} from './learning.mjs';
import {exportWork} from './export.mjs';
import {captureRecipients,assignmentRoster} from './roster.mjs';
import {capturePaper,paperOf,questionLocation} from './paper.mjs';
const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  username: u.username,
  role: u.role,
  classIds: u.classIds || [],
  unified: Boolean(u.unified),
  canManageGrading: u.role === "teacher" && (!u.unified || u.canManageGrading === true),
});
const publicAssignment = (a) => ({
  id: a.id,
  title: a.title,
  course: a.course,
  instructions: paperOf(a).instructions,
  questionFiles: paperOf(a).questionFiles,
  paper:paperOf(a),readingScope:paperOf(a).readingScope,submissionGuide:paperOf(a).submissionGuide,mainQuestionFile:paperOf(a).mainQuestionFile,
  classIds: a.classIds,
  dueAt: a.dueAt,
  gradingMode:a.gradingMode||"manual", allowLate:Boolean(a.allowLate), allowResubmit:a.allowResubmit!==false,
  version: a.version,
  questions: a.rubric?.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    maxPoints: q.maxPoints, type:q.type||"short", knowledge:q.knowledge||"",
    paperLocation:questionLocation(paperOf(a),q.id),
  })),
  createdAt: a.createdAt,
  deletedAt: a.deletedAt || null,
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
  paper:s.paperSnapshot||null,questions:visibleQuestions(s), reviewRequests:s.reviewRequests||[],
  gradeHistory:s.gradeHistory||[], classIds:s.classIds||[], late:Boolean(s.late),
});
const encodeCookie = (value, age) =>
  `hw_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
export async function createHomework({externalAuth} = {}) {
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
  const rate = (req, kind, maximum, accountId) => {
    const ip = String(
        req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      )
        .split(",")
        .at(-1)
        .trim(),
      key = `${kind}:${accountId || ip}`,
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
    if(externalAuth){
      const signed=await externalAuth.session(req);if(!signed)return null;
      const registeredClasses=await externalAuth.classrooms(signed);
      const user=await db.tx(async c=>{
        let u=await db.get('bookself:'+signed.id,c);
        if(!u){u={id:'bookself:'+signed.id,bookselfId:signed.id,username:signed.username,name:signed.name,role:signed.role,classIds:[],createdAt:now()};await db.put('user',u,c);}
        assert(u && ['student','teacher'].includes(u.role),'账号关联异常，请联系老师',409);
        // New homework belongs only to the signed-in Bookself identity.
        // Legacy records and mappings remain untouched in storage.
        const classIds=registeredClasses.map(x=>x.id);
        const canManageGrading=signed.role==='teacher'&&signed.id===process.env.HOMEWORK_OWNER_BOOKSELF_ID;
        return {...u,classIds,name:signed.name,role:signed.role,unified:true,canManageGrading};
      });
      return {user,session:{id:'unified',csrf:externalAuth.csrf(req),external:true},signed,registeredClasses};
    }
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
        : !a.deletedAt && a.published && a.classIds.some((x) => user.classIds?.includes(x)),
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
    s.paperSnapshot ||= structuredClone(paperOf(a));
    s.version = a.version;
    s.gradingMode = a.gradingMode || "manual";
    s.rubricSnapshot = structuredClone(a.rubric);
    s.status = "queued";
    s.suggestedGrade = null;
    s.teacherReviewDraft = null;
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
        (paperOf(a).questionFiles || []).includes(file.id) &&
        (user.role === "teacher"
          ? a.teacherId === user.id
          : a.published && a.classIds.some((x) => user.classIds?.includes(x)))
      )
        return true;
    for(const s of await db.list("submission"))if(s.studentId===user.id&&s.paperSnapshot?.questionFiles?.includes(file.id))return true;
    if (user.role === "teacher")
      for (const s of await db.list("submission"))
        if (
          s.files?.includes(file.id) &&
          (await db.get(s.assignmentId))?.teacherId === user.id
        )
          return true;
    if(user.role==='teacher')for(const n of await db.list('mistake-note'))if(n.corrections?.some(c=>c.files?.includes(file.id))&&(await db.get(n.assignmentId))?.teacherId===user.id)return true;
    return false;
  };
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/api/homework/")) return false;
    const route = url.pathname
        .slice("/api/homework/".length)
        .split("/")
        .filter(Boolean).map(x=>{try{return decodeURIComponent(x)}catch{return x}}),
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
        const workerMode = req.headers["x-worker-mode"] === "cloud" ? "cloud" : "local";
        if (route[1] === "heartbeat" && method === "POST") {
          const b = await body(req);
          const settings = await db.get("model-settings");
          if ((settings.execution || "local") !== workerMode) return (json(res, { ok: true, standby: true }), true);
          device.execution = workerMode;
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
            const settings = await db.get("model-settings", c);
            if ((settings.execution || "local") !== workerMode ||
                (settings.provider === "openai" && (!settings.apiKeyEncrypted || !settings.cloudConsent))) return null;
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
                target.error = "批改服务多次中断，请检查后重新批改";
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
                result = [2,3].includes(b.protocolVersion) ? automaticGrade(b, job.payload.rubric) : grade(b, job.payload.rubric);
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
                  const settings=await db.get('model-settings',c);
                  const fingerprint=[settings.provider,settings.baseUrl,settings.model].join('|');
                  if(target.gradingMode==='auto' && b.protocolVersion===2 && !result.needsReview && settings.autoPublishValidatedFor===fingerprint){
                    publishedResult(target,result,'worker',now(),'','automatic',settings.model);
                    await db.audit('worker','auto_publish_grade',target.id,c);
                  }
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
      if (externalAuth && ['login','register'].includes(route[0]))
        throw new HttpError(409,'请使用经济一页通的 Bookself 账号登录');
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
      const availableClasses = async () => externalAuth
        ? auth.registeredClasses.map(c=>({...c,...(user.role==='teacher'?{teacherId:user.id}:{})}))
        : (await db.list('class')).filter(c=>user.role==='teacher'?c.teacherId===user.id:user.classIds.includes(c.id));
      const availableStudents = async () => { if(externalAuth)return externalAuth.students(auth.signed);const classes=await availableClasses();return (await db.list('user')).filter(u=>u.role==='student'&&u.classIds?.some(c=>classes.some(k=>k.id===c))); };
      if(externalAuth && route[0]==="device")assert(user.canManageGrading,"批改引擎仅由平台管理员配置",403);
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
          json(res, { user: safeUser(user), csrf: auth.session.csrf, teacherWorkspace:process.env.TEACHER_WORKSPACE_ENABLED==='1' }),
          true
        );
      if(route[0]==='link-account'&&method==='POST'&&externalAuth){
        throw new HttpError(409,'现在直接使用 Bookself 账号，无需关联旧作业账号');
      }
      if (route[0] === "logout" && method === "POST") {
        if(externalAuth){await externalAuth.revoke(externalAuth.token(req));res.setHeader('Set-Cookie',[externalAuth.cookie(externalAuth.cookieName,'',0),encodeCookie('',0)]);return (json(res,{ok:true}),true);}
        await db.remove(auth.session.id);
        res.setHeader("Set-Cookie", encodeCookie("", 0));
        return (json(res, { ok: true }), true);
      }
      if (route[0] === "password" && method === "POST") {
        if(externalAuth)throw new HttpError(409,'请在经济一页通的账户设置中修改 Bookself 密码');
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
              classes: (await availableClasses())
                .map((x) =>
                  user.role === "teacher" ? x : { id: x.id, name: x.name },
                ),
            }),
            true
          );
        teacher();
        if (method === "POST") {
          assert(!externalAuth,"班级统一在 Bookself 管理，作业工作台会自动同步",409);
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
        assert(!externalAuth,"已沿用注册时的班级，无需再次加入；转班请联系老师",409);
        assert(user.role === "student", "请使用学生账号");
        const b = await body(req),
          cls = (await db.list("class")).find(
            (x) => x.invite === text(b.invite, 40).toUpperCase() && !x.archived,
          );
        assert(cls, "班级邀请码不正确");
        const joined = await db.tx(async (c) => {
          const current = await db.get(user.id, c);
          assert(current, "账号不存在", 401);
          current.classIds = [...new Set([...(current.classIds || []), cls.id])];
          await db.put("user", current, c);
          return { ...user, classIds: current.classIds };
        });
        return (json(res, { user: safeUser(joined) }), true);
      }
      const accessibleWork = async (c) => {
        const allAssignments=await db.list('assignment',c), allSubmissions=await db.list('submission',c);
        const assignments=allAssignments.filter(a=>user.role==='teacher'?a.teacherId===user.id:(a.published&&a.classIds.some(x=>user.classIds.includes(x)))||allSubmissions.some(s=>s.studentId===user.id&&s.assignmentId===a.id));
        const submissions=allSubmissions.filter(s=>user.role==='teacher'?assignments.some(a=>a.id===s.assignmentId):s.studentId===user.id);
        return {assignments,submissions};
      };
      if(route[0]==='learning'&&method==='GET'){
        const {assignments,submissions}=await accessibleWork();
        const roster=user.role==='teacher'?(externalAuth?await externalAuth.students(auth.signed):(await db.list('user')).filter(u=>u.role==='student'&&u.classIds?.some(x=>assignments.some(a=>a.classIds.includes(x))))):[];
        const users=await db.list('user');
        const students=roster.map(u=>({id:u.id,name:u.name,username:u.username||'',classIds:u.classIds}));
        for(const x of submissions)if(user.role==='teacher'&&!students.some(u=>u.id===x.studentId))students.push({id:x.studentId,name:users.find(u=>u.id===x.studentId)?.name||'学生',classIds:x.classIds||[],historical:true});
        const privateDrafts=user.role==='student'?(await db.list('mistake-draft')).filter(d=>d.studentId===user.id):[];
        return (json(res,{students,assignments:assignments.map(publicAssignment),submissions:submissions.map(x=>({...publicSubmission(x),studentId:x.studentId,assignment:publicAssignment(assignments.find(a=>a.id===x.assignmentId)||{})})),mistakes:mistakeRows(submissions,assignments,await db.list('mistake-note')).map(m=>({...m,draftUpdatedAt:privateDrafts.find(d=>d.assignmentId===m.assignmentId&&d.questionId===m.questionId&&!d.cleared)?.updatedAt||null}))}),true);
      }
      if(route[0]==='mistakes'&&route[1]&&route[2]&&route[3]==='draft'&&['GET','PUT'].includes(method)){
        assert(user.role==='student','请使用学生账号',403);
        const key='mistake-draft:'+hash(user.id+':'+route[1]+':'+route[2]);
        const b=method==='PUT'?await body(req):null;
        const draft=await db.tx(async c=>{
          const work=await accessibleWork(c);
          assert(mistakeRows(work.submissions,work.assignments).some(r=>r.assignmentId===route[1]&&r.questionId===route[2]),'该题不在你的当前错题集中',404);
          const old=await db.get(key,c);
          if(method==='GET')return old||null;
          const mutationId=boundedText(b.mutationId,120,'草稿标识');assert(mutationId,'缺少草稿标识');
          if(old?.mutationId===mutationId)return old;
          assert(Number(b.revision||0)===(old?.revision||0),'草稿已在另一处更新，请选择要保留的版本',409);
          await files.validate(b.files||[],user.id,'submission',c);
          const entry={id:key,studentId:user.id,assignmentId:route[1],questionId:route[2],correction:boundedText(b.correction,10000,'订正'),note:boundedText(b.note,5000,'笔记'),status:['todo','review','mastered'].includes(b.status)?b.status:'todo',files:b.files||[],revision:(old?.revision||0)+1,mutationId,updatedAt:now(),cleared:false};
          await db.put('mistake-draft',entry,c);return entry;
        });return (json(res,{draft}),true);
      }
      if(route[0]==='mistakes'&&route[1]&&route[2]&&!route[3]&&method==='PUT'){
        assert(user.role==='student','请使用学生账号');const b=await body(req);
        const key='mistake:'+hash(user.id+':'+route[1]+':'+route[2]);
        const saved=await db.tx(async c=>{
          const work=await accessibleWork(c), rows=mistakeRows(work.submissions,work.assignments);
          assert(rows.some(r=>r.assignmentId===route[1]&&r.questionId===route[2]),'该题不在你的当前错题集中',404);
          const old=await db.get(key,c);
          const mutationId=boundedText(b.mutationId,120,'订正标识');
          const mutationHash=hash(JSON.stringify({correction:b.correction||'',note:b.note||'',status:b.status||'todo',files:b.files||[]}));
          if(mutationId&&old?.lastMutationId===mutationId){assert(!old.lastMutationHash||old.lastMutationHash===mutationHash,'这次保存凭证对应另一份内容，请刷新后继续编辑',409);return old;}
          const draftKey='mistake-draft:'+hash(user.id+':'+route[1]+':'+route[2]),draft=await db.get(draftKey,c);
          if(b.draftRevision!==undefined)assert(Number(b.draftRevision)===(draft?.revision||0),'草稿已在另一处更新，请选择要保留的版本',409);
          assert(Number(b.revision||0)===(old?.revision||0),'订正已在另一处更新，请刷新后重试',409);
          const entry={...old,id:key,studentId:user.id,assignmentId:route[1],questionId:route[2],note:boundedText(b.note,5000,'笔记'),status:['todo','review','mastered'].includes(b.status)?b.status:'todo',revision:(old?.revision||0)+1,updatedAt:now(),corrections:old?.corrections||[]};
          if(b.correction||b.files?.length){await files.validate(b.files||[],user.id,'submission',c);entry.corrections.push({id:id(),text:boundedText(b.correction,10000,'订正'),files:b.files||[],createdAt:now()});entry.status='review';}
          entry.lastMutationId=mutationId||null;entry.lastMutationHash=mutationHash;await db.put('mistake-note',entry,c);if(b.draftRevision!==undefined)await db.put('mistake-draft',{id:draftKey,studentId:user.id,assignmentId:route[1],questionId:route[2],revision:(draft?.revision||0)+1,updatedAt:now(),cleared:true},c);return entry;
        });return (json(res,{note:saved}),true);
      }
      if (route[0] === "files") {
        if(route[1]&&route[2]==='reading'&&['GET','PUT'].includes(method)){
          const f=await db.get(route[1]);assert(f?.mime==='application/pdf'&&await authorizeFile(f,user),'附件不存在或无权查看',404);
          const key='reading:'+hash(user.id+':'+f.id);
          if(method==='GET')return (json(res,{position:await db.get(key)||null}),true);
          const b=await body(req);assert(Number.isInteger(b.page)&&b.page>=1&&b.page<=f.pages,'页码超出题纸范围');
          const position={id:key,userId:user.id,fileId:f.id,page:b.page,offset:Math.max(0,Math.min(1,Number(b.offset)||0)),updatedAt:now()};await db.put('reading-position',position);return (json(res,{position}),true);
        }

        if (method === "POST" && route[1] && route[2] === "rotate") {
          const f = await db.get(route[1]);
          assert(
            f?.owner === user.id && f.mime.startsWith("image/"),
            "不能旋转此附件",
            403,
          );
          rate(req, "rotate", 60, user.id);
          return (json(res, { file: await files.rotate(f) }), true);
        }
        if (method === "POST") {
          rate(req, "upload", 100, user.id);
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
            "Content-Length": url.searchParams.has('download')?(f.originalSize||f.size):f.size,
            "Content-Disposition": `${url.searchParams.has('download')?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(f.name)}`,
            ...(url.searchParams.has('download')?{'Content-Type':f.originalMime||f.mime}:{}),
          });
          (await (url.searchParams.has("download")?files.readOriginal(f):files.read(f))).on("error", () => res.destroy()).pipe(res);
          return true;
        }
      }
      if (route[0] === "assignments") {
        if(method==='GET'&&route[1]==='roster-summary'){
          teacher();const students=await availableStudents(),submissions=await db.list('submission');
          const assignments=(await db.list('assignment')).filter(a=>a.teacherId===user.id&&!a.deletedAt);
          return (json(res,{summaries:Object.fromEntries(assignments.map(a=>[a.id,assignmentRoster(a,students,submissions).counts]))}),true);
        }
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
                user.role === "teacher" ? all.filter(a=>url.searchParams.get("trash")==="1"?a.deletedAt:!a.deletedAt) : all.filter(a=>!a.deletedAt).map(publicAssignment),
            }),
            true
          );
        }
        if (method === "POST" && !route[1]) {
          teacher();
          const b = await body(req);
          assert(text(b.title, 120), "请填写作业标题");
          const classes = await availableClasses();
          assert(
            Array.isArray(b.classIds) &&
              b.classIds.length &&
              b.classIds.every((x) => classes.some((c) => c.id === x)),
            "请选择自己的班级",
          );
          assert(!b.dueAt||Number.isFinite(Date.parse(b.dueAt)),"截止时间格式不正确");
          await files.validate(b.questionFiles||[],user.id,"question");
          const a = {
            id: id(),
            type: "assignment",
            teacherId: user.id,
            title: text(b.title, 120),
            course: text(b.course, 80) || "经济学",
            instructions: text(b.instructions, 20000),
            classIds: b.classIds,
            dueAt: b.dueAt ? new Date(b.dueAt).toISOString() : null,
            questionFiles: b.questionFiles||[],
            mainQuestionFile:b.questionFiles?.[0]||null,readingScope:boundedText(b.readingScope,500,"完成范围"),submissionGuide:boundedText(b.submissionGuide,1000,"提交要求"),
            answerFiles: [],
            answerText: "",
            gradingMode:b.gradingMode==="manual"?"manual":"auto",
            allowLate:Boolean(b.allowLate),allowResubmit:b.allowResubmit!==false,
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
          if(route[2]==='roster'&&method==='GET'){
            teacher();const students=await availableStudents(),submissions=await db.list('submission');
            return (json(res,assignmentRoster(a,students,submissions)),true);
          }
          if(route[2]==='recipients'&&method==='POST'){
            teacher();const b=await body(req);assert(b.confirmed===true,'请确认将当前班级学生计入本次应交名单');
            const students=await availableStudents();
            await db.tx(async c=>{const current=await requireAssignment(a.id,user,c);assert(current.published&&!current.deletedAt,'请先发布作业',409);
              const snapshot=captureRecipients(current.classIds,students);
              const prior=(current.recipients?.students||[]).filter(u=>u.classIds.some(id=>current.classIds.includes(id)));
              snapshot.students=[...new Map([...prior,...snapshot.students].map(u=>[u.id,u])).values()];
              current.recipientHistory||=[];if(current.recipients)current.recipientHistory.push(current.recipients);
              current.recipients=snapshot;await db.put('assignment',current,c);await db.audit(user.id,'confirm_recipients',a.id,c);
            });return(json(res,{ok:true}),true);
          }
          if(method==='GET'&&route[2]==='pdf'){
            rate(req,'pdf',40,user.id);
            const bytes=await exportWork({assignment:{...a,...paperOf(a)},readAttachment:async key=>{const f=await db.get(key);return {bytes:Buffer.from(await (await files.read(f)).transformToByteArray()),mime:f.mime};}});
            res.writeHead(200,{'Content-Type':'application/pdf','Content-Length':bytes.length,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(a.title+'-题目.pdf')}`}).end(bytes);return true;
          }
          if (method === "GET")
            return (
              json(res, {
                assignment: user.role === "teacher" ? a : publicAssignment(a),
              }),
              true
            );
          teacher();
          const b = await body(req);
          if(route[2]==='metadata'&&method==='PUT'){
            const classes=await availableClasses();
            await db.tx(async c=>{const current=await requireAssignment(a.id,user,c);
              assert(!current.deletedAt,'请先从回收站恢复作业',409);
              assert(Number(b.editRevision||0)===Number(current.editRevision||0),'作业已在另一处修改，当前输入仍保留，请重新打开核对',409);
              assert(text(b.title,120),'请填写作业名称');
              assert(Array.isArray(b.classIds)&&b.classIds.length&&b.classIds.every(x=>classes.some(k=>k.id===x)),'请选择自己的班级');
              assert(!b.dueAt||Number.isFinite(Date.parse(b.dueAt)),'截止时间格式不正确');
              current.metadataHistory||=[];current.metadataHistory.push({title:current.title,course:current.course,classIds:current.classIds,dueAt:current.dueAt,gradingMode:current.gradingMode,allowLate:current.allowLate,allowResubmit:current.allowResubmit,at:now(),actor:user.id});
              Object.assign(current,{title:boundedText(b.title,120,'作业名称'),course:b.course===undefined?current.course:boundedText(b.course,80,'课程'),classIds:b.classIds,dueAt:b.dueAt?new Date(b.dueAt).toISOString():null,gradingMode:b.gradingMode==='auto'?'auto':'manual',allowLate:Boolean(b.allowLate),allowResubmit:b.allowResubmit!==false,editRevision:(current.editRevision||0)+1,updatedAt:now()});
              await db.put('assignment',current,c);await db.audit(user.id,'edit_assignment',a.id,c);
            });return (json(res,{assignment:await db.get(a.id)}),true);
          }
          if(['archive','restore'].includes(route[2])&&method==='POST'){
            await db.tx(async c=>{const current=await requireAssignment(a.id,user,c),archive=route[2]==='archive';
              if(archive&&!current.deletedAt){
                current.deletedAt=now();current.deletedBy=user.id;current.jobId=null;
                if(['queued','parsing'].includes(current.status))current.status='draft';
                for(const entry of await db.list('submission',c))if(entry.assignmentId===a.id&&['queued','grading'].includes(entry.status)){
                  entry.status='needs_review';entry.error='作业已移入回收站，自动批阅已暂停；恢复后可继续复核。';entry.jobId=null;await db.put('submission',entry,c);
                }
                await c.query(`UPDATE ${db.jobs} SET status='cancelled',finished=now() WHERE status IN ('queued','running') AND (target=$1 OR payload->>'assignmentId'=$1)`,[a.id]);
              }else if(!archive){current.deletedAt=null;current.deletedBy=null;}
              current.updatedAt=now();await db.put('assignment',current,c);await db.audit(user.id,route[2]+'_assignment',a.id,c);
            });return (json(res,{assignment:await db.get(a.id)}),true);
          }
          if(route[2]==='duplicate'&&method==='POST'){
            const classes=await availableClasses();let copy;
            await db.tx(async c=>{const current=await requireAssignment(a.id,user,c);const classIds=current.classIds.filter(x=>classes.some(k=>k.id===x));
              assert(classIds.length,'请先确认原班级仍在你的班级列表中');
              copy={id:id(),type:'assignment',teacherId:user.id,title:('副本 · '+current.title).slice(0,120),course:current.course,classIds,dueAt:null,instructions:current.instructions,questionFiles:[...current.questionFiles],mainQuestionFile:current.mainQuestionFile,readingScope:current.readingScope,submissionGuide:current.submissionGuide,answerFiles:[...current.answerFiles],answerText:current.answerText,draftRubric:structuredClone(current.draftRubric||current.rubric||[]),sourceRevision:0,editRevision:0,gradingMode:current.gradingMode,allowLate:false,allowResubmit:current.allowResubmit!==false,version:0,published:false,status:'draft',copiedFrom:current.id,createdAt:now()};
              await db.put('assignment',copy,c);await db.audit(user.id,'duplicate_assignment',copy.id,c);
            });return (json(res,{assignment:copy},201),true);
          }
          assert(!a.deletedAt,'作业已在回收站，请先恢复再修改或批阅',409);
          if(route[2]==='settings'&&method==='PUT'){
            await db.tx(async c=>{const current=await requireAssignment(a.id,user,c);assert(!current.deletedAt,'请先恢复作业再修改',409);
              current.gradingMode=b.gradingMode==='auto'?'auto':'manual';current.allowLate=Boolean(b.allowLate);current.allowResubmit=b.allowResubmit!==false;
              assert(!b.dueAt||Number.isFinite(Date.parse(b.dueAt)),'截止时间格式不正确');current.dueAt=b.dueAt?new Date(b.dueAt).toISOString():null;current.editRevision=(current.editRevision||0)+1;current.updatedAt=now();
              await db.put('assignment',current,c);await db.audit(user.id,'assignment_settings',a.id,c);
            });return (json(res,{assignment:await db.get(a.id)}),true);
          }
          if (route[2] === "source" && method === "PUT") {
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(!current.deletedAt,"请先恢复作业再修改",409);
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
              if(current.published&&!current.publishedPaper)current.publishedPaper=capturePaper(current);
              current.mainQuestionFile=b.mainQuestionFile||b.questionFiles?.[0]||null;
              assert(!current.mainQuestionFile||(b.questionFiles||[]).includes(current.mainQuestionFile),'请选择题目附件中的主文件');
              if(b.readingScope!==undefined)current.readingScope=boundedText(b.readingScope,500,'完成范围');
              if(b.submissionGuide!==undefined)current.submissionGuide=boundedText(b.submissionGuide,1000,'提交要求');
              current.paperChangeNote=boundedText(b.paperChangeNote,500,'题纸修改说明');
              current.answerFiles = b.answerFiles || [];
              current.questionFiles = b.questionFiles || [];
              current.answerText = boundedText(b.answerText, 40000, "参考答案");
              current.instructions = boundedText(b.instructions, 20000, "作业说明");
              current.sourceRevision = (current.sourceRevision || 0) + 1;
              if(b.draftRubric!==undefined){assert(Array.isArray(b.draftRubric)&&b.draftRubric.length<=100&&JSON.stringify(b.draftRubric).length<=100000,'评分草稿过长');current.draftRubric=b.draftRubric;}else current.draftRubric = null;
              current.status = "draft";
              current.jobId = null;
              await db.put("assignment", current, c);
            });
            return (json(res, { assignment: await db.get(a.id) }), true);
          }
          if (route[2] === "parse" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(!current.deletedAt,"请先恢复作业再修改",409);
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
            const recipients = !a.published && a.version===0 ? captureRecipients(a.classIds,await availableStudents()) : null;
            await db.tx(async (c) => {
              const current = await requireAssignment(a.id, user, c);
              assert(!current.deletedAt,"请先恢复作业再修改",409);
              assert(
                Number(b.sourceRevision || 0) ===
                  Number(current.sourceRevision || 0),
                "答案已更新，请刷新后重新确认",
                409,
              );
              for(const q of questions)if(q.paperFileId||q.paperPage){const f=await db.get(q.paperFileId,c);assert(current.questionFiles.includes(q.paperFileId)&&f?.mime==='application/pdf'&&q.paperPage<=f.pages,'请核对第 '+q.id+' 题对应的 PDF 与页码');}
              if(current.version>0){const previousPaper=paperOf(current);for(const submission of await db.list('submission',c))if(submission.assignmentId===current.id&&!submission.paperSnapshot){submission.paperSnapshot=structuredClone(previousPaper);await db.put('submission',submission,c);}}
              const version = current.version + 1;
              const paper=capturePaper(current,questions,version);paper.files=[];for(const key of paper.questionFiles){const f=await db.get(key,c);paper.files.push({id:f.id,name:f.name,mime:f.mime,pages:f.pages});}
              await db.put(
                "answer-version",
                {
                  id: `${a.id}:v${version}`,
                  assignmentId: a.id,
                  version,
                  rubric: questions,
                  paper,
                  answerText: current.answerText,
                  answerFiles: current.answerFiles,
                  confirmedBy: user.id,
                  confirmedAt: now(),
                },
                c,
              );
              current.publishedPaper=paper;
              current.version = version;
              current.rubric = questions;
              current.draftRubric = questions;
              current.status = "ready";
              current.jobId = null;
              if(recipients && !current.recipients){assert(JSON.stringify(current.classIds)===JSON.stringify(recipients.classIds),'班级已在另一处修改，请重新确认发布',409);current.recipients=recipients;}
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
            const late=Boolean(a.dueAt&&Date.parse(a.dueAt)<Date.now());
            const submissionId = hash(
              `${user.id}:${a.id}:${text(b.clientId, 100)}`,
            );
            assert(text(b.clientId, 100), "缺少提交凭证");
            const previous = await db.get(submissionId, c);
            if (previous && previous.status !== "draft") return previous;
            assert(b.draft||b.paperVersion===undefined||Number(b.paperVersion)===paperOf(a).version,'题纸已更新，请先重新打开作业查看新版；已保存的作答会保留',409);
            const earlier=(await db.list('submission',c)).filter(s=>s.studentId===user.id&&s.assignmentId===a.id&&s.status!=='draft').sort((a,b)=>Date.parse(b.submittedAt)-Date.parse(a.submittedAt));
            assert(!late||a.allowLate||b.draft||earlier[0]?.status==='returned','已超过截止时间，请联系教师开放补交');
            assert(b.draft||a.allowResubmit!==false||!earlier.length||earlier[0].status==='returned','这份作业不允许再次提交，请联系老师');
            await files.validate(b.files || [], user.id, "submission", c);
            const content = boundedText(b.text, 40000, "作业文字");
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
              paperSnapshot:structuredClone(paperOf(a)),
              classIds:[...user.classIds],late,
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
          if(method==='GET'&&route[2]==='paper-pdf'){
            rate(req,'pdf',40,user.id);const a=await db.get(s.assignmentId),paper=s.paperSnapshot||paperOf(a);
            const bytes=await exportWork({assignment:{...a,...paper,rubric:s.rubricSnapshot||a.rubric},readAttachment:async key=>{const f=await db.get(key);return {bytes:Buffer.from(await (await files.read(f)).transformToByteArray()),mime:f.mime};}});
            res.writeHead(200,{'Content-Type':'application/pdf','Content-Length':bytes.length,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(paper.title+'-原题.pdf')}`}).end(bytes);return true;
          }
          if(method==='GET'&&route[2]==='pdf'){
            rate(req,'pdf',40,user.id);const a=await db.get(s.assignmentId);
            const withGrade=url.searchParams.get('kind')==='grade';assert(!withGrade||s.publishedGrade,'成绩尚未发布');
            const bytes=await exportWork({assignment:{...a,...(s.paperSnapshot||{})},submission:s,grade:withGrade?s.publishedGrade:null,readAttachment:async key=>{const f=await db.get(key);return {bytes:Buffer.from(await (await files.read(f)).transformToByteArray()),mime:f.mime};}});
            res.writeHead(200,{'Content-Type':'application/pdf','Content-Length':bytes.length,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(a.title+(withGrade?'-批改结果':'-我的作业')+'.pdf')}`}).end(bytes);return true;
          }
          if(method==='POST'&&route[2]==='review-request'){
            assert(user.role==='student','请使用学生账号');const b=await body(req);
            await db.tx(async c=>{const current=await requireSubmission(s.id,user,c);assert(current.publishedGrade?.questions.some(q=>q.id===b.questionId),'该题尚无已发布成绩');assert(text(b.reason,1500),'请说明需要复核的地方');
              current.reviewRequests ||= [];assert(!current.reviewRequests.some(r=>r.questionId===b.questionId&&r.status==='open'),'该题已申请复核，老师会处理');
              current.reviewRequests.push({id:id(),questionId:b.questionId,reason:boundedText(b.reason,1500,'复核说明'),status:'open',createdAt:now()});await db.put('submission',current,c);
            });return (json(res,{ok:true}),true);
          }
          if (method === "GET")
            return (
              json(res, {
                submission: {...(user.role === "teacher" ? s : publicSubmission(s)),assignment:publicAssignment(await db.get(s.assignmentId))},
              }),
              true
            );
          teacher();
          const b = await body(req);
          if(route[2]==='review-draft'&&method==='PUT'){
            await db.tx(async c=>{const current=await requireSubmission(s.id,user,c);
              assert(!['queued','grading'].includes(current.status),'批阅还在进行，请完成后再保存',409);
              assert(b.jobId===current.jobId,'批阅版本已更新，请重新打开复核',409);
              assert(Number(b.revision||0)===Number(current.teacherReviewDraft?.revision||0),'另一处已保存复核，请重新打开核对',409);
              const ref=current.rubricSnapshot.find(q=>q.id===b.question?.id);assert(ref,'无效题号');
              const q=b.question;assert(['string','number'].includes(typeof q.score)&&String(q.score).trim()!==''&&Number.isFinite(Number(q.score))&&q.score>=0&&q.score<=ref.maxPoints,'请核对本题得分');
              const entry={id:ref.id,score:Number(q.score),maxPoints:ref.maxPoints,evidence:boundedText(q.evidence,4000,'作答依据'),feedback:boundedText(q.feedback,4000,'反馈'),checked:q.checked===true,needsReview:false};
              assert(entry.checked,'请核对本题得分并勾选确认');
              const old=current.teacherReviewDraft?.jobId===current.jobId?current.teacherReviewDraft.questions:[];
              current.teacherReviewDraft={jobId:current.jobId,revision:(current.teacherReviewDraft?.revision||0)+1,questions:[...old.filter(q=>q.id!==ref.id),entry],savedAt:now(),actor:user.id};
              await db.put('submission',current,c);
            });return (json(res,{draft:(await db.get(s.id)).teacherReviewDraft}),true);
          }
          if(["regrade","publish","return"].includes(route[2]))assert(!(await db.get(s.assignmentId))?.deletedAt,"请先恢复作业再继续批阅",409);
          if (route[2] === "regrade" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireSubmission(s.id, user, c),
                a = await requireAssignment(s.assignmentId, user, c);
              assert(!a.deletedAt,"请先恢复作业再继续批阅",409);
              assert(a.version > 0, "尚未确认参考答案");
              await queueGrade(current, a, c);
              await db.audit(user.id, "regrade", s.id, c);
            });
            return (json(res, { ok: true }), true);
          }
          if (route[2] === "publish" && method === "POST") {
            await db.tx(async (c) => {
              const current = await requireSubmission(s.id, user, c);
              assert(!(await db.get(s.assignmentId,c))?.deletedAt,"请先恢复作业再继续批阅",409);
              assert(
                !["queued", "grading"].includes(current.status),
                "请等待初批完成，或先退回提交",
              );
              assert(
                b.jobId === current.jobId,
                "这份作业已重新批改，请刷新后复核",
                409,
              );
              if(b.reviewRevision!==undefined)assert(Number(b.reviewRevision)===Number(current.teacherReviewDraft?.revision||0),'复核草稿已更新，请重新打开核对',409);
              const reviewed = grade(b, current.rubricSnapshot, {scoreOnly:true});
              assert(
                reviewed.questions.every(
                  (q) => q.score !== null && !q.needsReview,
                ),
                "请逐题核对并确认分数",
              );
              publishedResult(current,reviewed,user.id,now(),text(b.teacherNote,4000));
              current.teacherReviewDraft=null;
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
                    name: settings.execution === "cloud" ? "DeepSeek 云端批改" : d.name,
                    execution: settings.execution || "local",
                    lastSeen: d.lastSeen,
                    online:
                      !d.revoked && (d.execution || "local") === (settings.execution || "local") && Date.now() - Date.parse(d.lastSeen) < 45000,
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
                hasDeepSeekKey: Boolean((await db.get("model-profile:deepseek"))?.apiKeyEncrypted),
              },
            }),
            true
          );
        }
        const b = await body(req);
        if (route[1] === "settings" && method === "PUT") {
          const old = await db.get("model-settings");
          const savedDeepSeek = await db.get("model-profile:deepseek");
          const deepseek = b.provider === "deepseek";
          const provider = deepseek || b.provider === "openai" ? "openai" : "ollama";
          const u = new URL(deepseek ? "https://api.deepseek.com" : text(b.baseUrl, 500));
          assert(provider === "ollama"
            ? ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) && u.protocol === "http:"
            : u.protocol === "https:" && b.cloudConsent === true,
            "本地模型仅使用本机地址；外部 API 需确认传送资料");
          assert(!u.username && !u.password && !u.search && !u.hash, "模型地址不能包含凭据或查询参数");
          const baseUrl = u.toString().replace(/\/$/, "");
          const sameProvider = old.provider === provider && old.baseUrl === baseUrl;
          const apiKeyEncrypted = b.apiKey ? encrypt(text(b.apiKey, 2000)) : sameProvider ? old.apiKeyEncrypted : deepseek ? savedDeepSeek?.apiKeyEncrypted || "" : "";
          assert(provider === "ollama" || apiKeyEncrypted, "请填写此服务商的 API Key");
          const settings = {
            id: "model-settings", provider, baseUrl,
            execution: deepseek ? "cloud" : "local",
            model: deepseek ? "deepseek-flash" : text(b.model, 120),
            apiKeyEncrypted, cloudConsent: provider === "openai", updatedAt: now(),
            autoPublishValidatedFor:b.autoPublishValidated===true?[provider,baseUrl,deepseek?'deepseek-flash':text(b.model,120)].join('|'):'',
          };
          assert(settings.model, "请填写模型名称");
          await db.tx(async c => {
            const running = (await c.query(`SELECT count(*)::int n FROM ${db.jobs} WHERE status='running' AND lease_until>now()`)).rows[0].n;
            assert(!running, "当前批改尚未完成，请稍后切换引擎", 409);
            if (deepseek) await db.put("settings", { id: "model-profile:deepseek", apiKeyEncrypted, updatedAt: now() }, c);
            await db.put("settings", settings, c);
            await db.audit(user.id, "model_settings", "device", c);
          });
          return (json(res, { ok: true }), true);
        }
        if (route[1] === "test" && method === "POST") {
          const settings = await db.get("model-settings");
          assert(settings.provider !== "openai" || (settings.apiKeyEncrypted && settings.cloudConsent), "请先保存 API Key 并确认传送资料");
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
