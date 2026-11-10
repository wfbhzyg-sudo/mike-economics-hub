import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";
import sharp from "sharp";
import pg from "pg";
const schema = "hw_test_" + Date.now(),
  port = 8788,
  base = `http://localhost:${port}/api/homework/`;
const child = spawn(process.execPath, ["server.mjs"], {
  env: {
    ...process.env,
    HOMEWORK_DB_SCHEMA: schema,
    PORT: String(port),
    PUBLIC_ORIGIN: `http://localhost:${port}`,
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
child.stderr.on("data", (b) => (serverLog += b.toString()));
let count = 0;
const checks = [];
const check = (name, fn) => {
  fn();
  checks.push(name);
  count++;
};
function client() {
  let cookie = "",
    csrf = "";
  return {
    async request(path, method = "GET", body, expected = 200, extra = {}) {
      const r = await fetch(base + path, {
        method,
        headers: {
          Cookie: cookie,
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (r.headers.get("set-cookie"))
        cookie = r.headers.get("set-cookie").split(";")[0];
      const data = await r.json();
      assert.equal(
        r.status,
        expected,
        `${method} ${path}: ${JSON.stringify(data)}`,
      );
      if (data.csrf) csrf = data.csrf;
      return data;
    },
    async upload(name, bytes, purpose) {
      const r = await fetch(
        base + `files?purpose=${purpose}&name=${encodeURIComponent(name)}`,
        {
          method: "POST",
          headers: { Cookie: cookie, "X-CSRF-Token": csrf },
          body: bytes,
        },
      );
      const data = await r.json();
      assert.equal(r.status, 201, JSON.stringify(data));
      return data.file;
    },
  };
}
const teacher = client(),
  student = client(),
  outsider = client();
const workerHeaders = {
  Authorization: "Bearer " + process.env.HOMEWORK_WORKER_SECRET,
};
const worker = async (path, data = {}, expected = 200, lease) => {
  const r = await fetch(base + "worker/" + path, {
    method: "POST",
    headers: {
      ...workerHeaders,
      "Content-Type": "application/json",
      ...(lease ? { "X-Job-Lease": lease } : {}),
    },
    body: JSON.stringify(data),
  });
  const b = await r.json();
  assert.equal(r.status, expected, JSON.stringify(b));
  return b;
};
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://localhost:${port}/health`)).ok) break;
    } catch {}
    await delay(200);
  }
  await teacher.request("login", "POST", {
    username: "mike",
    password: process.env.HOMEWORK_TEACHER_PASSWORD,
  });
  check("teacher login", () => assert.ok(true));
  await student.request("classes", "GET", undefined, 401);
  check("anonymous data denied", () => assert.ok(true));
  const cls = (
    await teacher.request("classes", "POST", { name: "验收测试班" }, 201)
  ).class;
  const other = (
    await teacher.request("classes", "POST", { name: "隔离测试班" }, 201)
  ).class;
  await student.request(
    "register",
    "POST",
    {
      username: "test_student",
      password: "test-password-2026",
      name: "测试学生",
      invite: cls.invite,
    },
    201,
  );
  await outsider.request(
    "register",
    "POST",
    {
      username: "other_student",
      password: "test-password-2026",
      name: "另一班学生",
      invite: other.invite,
    },
    201,
  );
  await student.request("classes", "POST", { name: "illegal" }, 403);
  check("student cannot create class", () => assert.ok(true));
  await teacher.request("classes", "POST", { name: "csrf" }, 403, {
    "X-CSRF-Token": "",
  });
  check("CSRF required", () => assert.ok(true));
  const a = (
    await teacher.request(
      "assignments",
      "POST",
      {
        title: "AD–AS 验收",
        course: "AP 宏观经济学",
        instructions: "Explain the effect of increased consumer confidence.",
        classIds: [cls.id],
      },
      201,
    )
  ).assignment;
  const svg =
    '<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="600" fill="white"/><text x="50" y="120" font-size="44" fill="black">Question 1</text><text x="50" y="220" font-size="36">Higher consumer confidence raises consumption.</text><text x="50" y="300" font-size="36">AD shifts right. Price level and real GDP rise</text><text x="50" y="380" font-size="36">in the short run.</text></svg>';
  const image = await sharp(Buffer.from(svg)).png().toBuffer();
  const pdf = await PDFDocument.create(),
    page = pdf.addPage([620, 400]),
    font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("Question 1", { x: 40, y: 340, font, size: 24 });
  page.drawText("Higher consumer confidence raises consumption.", {
    x: 40,
    y: 280,
    font,
    size: 16,
  });
  page.drawText("AD shifts right. Price level and real GDP rise", {
    x: 40,
    y: 240,
    font,
    size: 16,
  });
  page.drawText("in the short run.", { x: 40, y: 200, font, size: 16 });
  const pdfBytes = Buffer.from(await pdf.save());
  await mkdir("test-results/fixtures", { recursive: true });
  await writeFile("test-results/fixtures/answer.png", image);
  await writeFile("test-results/fixtures/answer.pdf", pdfBytes);
  const answer = await teacher.upload("教师参考答案.png", image, "answer");
  const answerText =
    "1. Higher consumer confidence increases consumption, shifting AD right. Price level and real GDP increase in the short run. 2 points: one for rightward AD shift, one for both PL and real GDP rising.";
  await teacher.request("assignments/" + a.id + "/source", "PUT", {
    answerText,
    answerFiles: [answer.id],
    questionFiles: [],
    instructions: a.instructions,
    sourceRevision: 0,
  });
  await teacher.request(
    "assignments/" + a.id + "/source",
    "PUT",
    { answerText: "stale", sourceRevision: 0 },
    409,
  );
  check("stale answer update rejected", () => assert.ok(true));
  await student.request(
    "files/" + answer.id + "?meta=1",
    "GET",
    undefined,
    404,
  );
  check("teacher answer files private", () => assert.ok(true));
  await teacher.request("assignments/" + a.id + "/parse", "POST", {});
  const parsed = (await worker("claim")).job;
  assert.equal(parsed.kind, "parse");
  await worker(`jobs/${parsed.id}/renew`, {}, 200, parsed.lease);
  const questions = [
    {
      id: "1",
      prompt: "Explain the short-run effects of increased consumer confidence.",
      answer: answerText,
      criteria:
        "1 point: AD shifts right as consumption rises. 1 point: both price level and real GDP rise.",
      maxPoints: 2,
      sourcePages: "答案第 1 页",
    },
  ];
  await worker(`jobs/${parsed.id}/complete`, { questions }, 200, parsed.lease);
  await teacher.request("assignments/" + a.id + "/confirm", "POST", {
    questions,
    sourceRevision: 1,
  });
  const publicA = (await student.request("assignments/" + a.id)).assignment;
  check("answer key absent from student response", () => {
    assert.equal(publicA.rubric, undefined);
    assert.equal(publicA.answerText, undefined);
    assert.equal(publicA.answerFiles, undefined);
    assert.equal(publicA.questions[0].answer, undefined);
  });
  await outsider.request("assignments/" + a.id, "GET", undefined, 403);
  check("class isolation enforced", () => assert.ok(true));
  const img = await student.upload("图片作业.png", image, "submission"),
    pd = await student.upload("PDF 作业.pdf", pdfBytes, "submission");
  check("image and PDF durable uploads", () => {
    assert.equal(img.mime, "image/jpeg");
    assert.equal(pd.pages, 1);
  });
  const rotated = (
    await student.request("files/" + img.id + "/rotate", "POST", {})
  ).file;
  check("rotation creates a new correctly oriented image", () => {
    assert.notEqual(rotated.id, img.id);
    assert.equal(rotated.width, img.height);
    assert.equal(rotated.height, img.width);
  });
  await outsider.request("files/" + img.id + "/rotate", "POST", {}, 403);
  check("foreign image rotation denied", () => assert.ok(true));
  await outsider.request("files/" + img.id + "?meta=1", "GET", undefined, 404);
  check("student files isolated", () => assert.ok(true));
  const payload = {
    assignmentId: a.id,
    clientId: "text-test",
    text: "AD shifts right and both price level and real GDP increase.",
    files: [],
  };
  await student.request(
    "submissions",
    "POST",
    { ...payload, draft: true },
    201,
  );
  const submission = (
    await student.request("submissions", "POST", payload, 201)
  ).submission;
  const duplicate = (await student.request("submissions", "POST", payload, 201))
    .submission;
  check("submission idempotent", () =>
    assert.equal(duplicate.id, submission.id),
  );
  const job = (await worker("claim")).job;
  assert.equal(job.kind, "grade");
  await worker(`jobs/${job.id}/complete`, { questions: [] }, 400, job.lease);
  check("incomplete model result rejected", () => assert.ok(true));
  const result = {
    questions: [
      {
        id: "1",
        score: 2,
        evidence: "AD shifts right and both price level and real GDP increase.",
        feedback: "两个评分点均满足。",
        needsReview: false,
      },
    ],
  };
  await worker(`jobs/${job.id}/complete`, result, 200, job.lease);
  await worker(`jobs/${job.id}/complete`, result, 409, job.lease);
  check("duplicate completion rejected", () => assert.ok(true));
  const before = (await student.request("submissions/" + submission.id))
    .submission;
  check("AI grade hidden until teacher publishes", () => {
    assert.equal(before.status, "needs_review");
    assert.equal(before.suggestedGrade, undefined);
    assert.equal(before.publishedGrade, undefined);
  });
  await student.request(
    "submissions/" + submission.id + "/publish",
    "POST",
    result,
    403,
  );
  await teacher.request("submissions/" + submission.id + "/publish", "POST", {
    ...result,
    jobId: job.id,
  });
  const after = (await student.request("submissions/" + submission.id))
    .submission;
  check("teacher-reviewed grade published", () =>
    assert.equal(after.publishedGrade.total, 2),
  );
  for (const [name, file] of [
    ["image", img],
    ["pdf", pd],
  ])
    await student.request(
      "submissions",
      "POST",
      {
        assignmentId: a.id,
        clientId: name + "-test",
        text: "",
        files: [file.id],
      },
      201,
    );
  const leased = (await worker("claim")).job;
  await pool.query(
    `UPDATE ${schema}.jobs SET lease_until=now()-interval '1 second' WHERE id=$1`,
    [leased.id],
  );
  const reclaimed = (await worker("claim")).job;
  check("expired lease reclaimed with new token", () => {
    assert.equal(leased.id, reclaimed.id);
    assert.notEqual(leased.lease, reclaimed.lease);
  });
  await worker(`jobs/${leased.id}/complete`, result, 409, leased.lease);
  check("stale worker cannot publish result", () => assert.ok(true));
  await teacher.request(
    "device/settings",
    "PUT",
    { provider: "ollama", baseUrl: "http://192.168.1.1", model: "x" },
    400,
  );
  check("local model address restricted to loopback", () => assert.ok(true));
  await teacher.request(
    "device/settings",
    "PUT",
    {
      provider: "openai",
      baseUrl: "https://example.invalid/v1",
      model: "x",
      cloudConsent: false,
    },
    400,
  );
  check("external API requires explicit consent", () => assert.ok(true));
  await teacher.request("device/pause", "POST", { paused: true });
  await worker("claim", {}, 401);
  await teacher.request("device/pause", "POST", { paused: false });
  check("device pause revokes access", () => assert.ok(true));
  await teacher.request("assignments/" + a.id + "/confirm", "POST", {
    questions,
    sourceRevision: 1,
  });
  await teacher.request(
    "submissions/" + submission.id + "/regrade",
    "POST",
    {},
  );
  const retained = (await student.request("submissions/" + submission.id))
    .submission;
  check("published grade retained during regrade", () =>
    assert.equal(retained.publishedGrade.total, 2),
  );
  await writeFile(
    "test-results/integration.json",
    JSON.stringify(
      { passed: count, checks, at: new Date().toISOString() },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: count, checks }, null, 2));
} catch (e) {
  console.error(serverLog);
  throw e;
} finally {
  child.kill();
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
}
