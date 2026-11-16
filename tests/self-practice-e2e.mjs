// End-to-end: real server + isolated schema + S3 through the public homework API.
// Run inside the isolated environment (DATABASE_URL / S3_* / HOMEWORK_ENCRYPTION_KEY set).
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import pg from 'pg';
import sharp from 'sharp';

const schema = 'sp_e2e_' + Date.now();
const port = 8789;
const base = `http://localhost:${port}/api/homework/`;
const child = spawn(process.execPath, ['server.mjs'], {
  env: {...process.env, HOMEWORK_DB_SCHEMA: schema, PORT: String(port), PUBLIC_ORIGIN: `http://localhost:${port}`, HOMEWORK_TEACHER_PASSWORD: 'e2e-teacher-password-2026'},
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
child.stdout.on('data', (b) => (log += b));
child.stderr.on('data', (b) => (log += b));
const pool = new pg.Pool({connectionString: process.env.DATABASE_URL});
const checks = [];
const check = (name) => checks.push(name);

function client() {
  let cookie = '', csrf = '';
  return {
    get cookie() { return cookie; },
    async request(path, method = 'GET', body, expected = 200) {
      const response = await fetch(base + path, {
        method,
        headers: {Cookie: cookie, 'X-CSRF-Token': csrf, 'Content-Type': 'application/json'},
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
      const data = await response.json();
      assert.equal(response.status, expected, `${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
      if (data.csrf) csrf = data.csrf;
      return data;
    },
    async upload(bytes) {
      const response = await fetch(base + 'files?purpose=answer&name=sp-e2e.jpg', {
        method: 'POST', headers: {Cookie: cookie, 'X-CSRF-Token': csrf}, body: bytes,
      });
      const data = await response.json();
      assert.equal(response.status, 201, JSON.stringify(data));
      return data.file;
    },
  };
}

const teacher = client(), student = client(), outsider = client();
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://localhost:${port}/health`)).ok) break; } catch {}
    await delay(200);
  }
  await teacher.request('login', 'POST', {username: 'mike', password: 'e2e-teacher-password-2026'});
  const cls = (await teacher.request('classes', 'POST', {name: '自主模考验收班'}, 201)).class;
  const other = (await teacher.request('classes', 'POST', {name: '自主模考他班'}, 201)).class;
  await student.request('register', 'POST', {username: 'sp_student', password: 'sp-student-password-2026', name: '模考学生', invite: cls.invite}, 201);
  await outsider.request('register', 'POST', {username: 'sp_other', password: 'sp-other-password-2026', name: '他班学生', invite: other.invite}, 201);
  const studentId = (await student.request('me')).user.id;

  const image = await teacher.upload(await sharp({create: {width: 600, height: 400, channels: 3, background: '#ffffff'}}).jpeg({quality: 80}).toBuffer());
  await pool.query(`UPDATE ${schema}.records SET data = jsonb_set(data, '{purpose}', '"library"') WHERE id = $1`, [image.id]);

  const unitId = 'micro-unit-2';
  const unit = {
    id: unitId, type: 'library-unit', owner: (await teacher.request('me')).user.id, title: 'AP 微观 · Unit 2 供给与需求',
    topics: [{id: '2.1', name: 'Demand', title: '需求'}, {id: '2.2', name: 'Supply', title: '供给'}],
    resources: [{fileId: image.id, kind: 'textbook', pages: 8, classIds: cls.classCode ? [cls.classCode] : []}],
    questionCount: 24, version: 1,
  };
  await pool.query(`INSERT INTO ${schema}.records (id, kind, data) VALUES ($1, 'library-unit', $2)`, [unitId, unit]);
  const releaseId = 'sp-release-' + Date.now();
  await pool.query(`INSERT INTO ${schema}.records (id, kind, data) VALUES ($1, 'library-release', $2)`, [releaseId, {id: releaseId, type: 'library-release', unitId, classIds: [cls.id, `bookself-class:${cls.id}`], releasedAt: new Date().toISOString()}]);
  for (let i = 1; i <= 20; i++) {
    const qid = `sp-q-${i}`;
    await pool.query(`INSERT INTO ${schema}.records (id, kind, data) VALUES ($1, 'library-question', $2)`, [qid, {
      id: qid, type: 'choice', status: 'ready', collection: 'bank', unitId, topic: i <= 12 ? '2.1' : '2.2',
      number: String(i), source: 'AP Micro Unit 2', answer: i <= 16 ? 'A' : 'B', options: ['A', 'B', 'C', 'D', 'E'],
      questionImages: [image.id], maxPoints: 1, version: 1,
    }]);
  }

  const catalog = await student.request('self-practice/catalog?course=micro');
  assert.equal(catalog.units.length, 1);
  assert.equal(catalog.units[0].topics.find((t) => t.id === '2.1').count, 12);
  assert.equal(catalog.units[0].topics.find((t) => t.id === '2.2').count, 8);
  check('catalog counts released eligible topics');

  const created = await student.request('self-practice/attempts', 'POST', {
    clientId: 'e2e-client-' + Date.now(), course: 'micro', topicIds: ['2.1', '2.2'], questionCount: 20, timerMode: 'countup', timeLimitMinutes: 0,
  }, 201);
  const attempt = created.attempt;
  assert.equal(attempt.questions.length, 20);
  assert.equal(attempt.status, 'created');
  assert.equal(attempt.startedAt, null);
  const payload = JSON.stringify(created);
  assert.ok(!payload.includes('"answer"') && !payload.includes('correctOption'), 'answers must stay private before submit');
  assert.equal(new Set(attempt.questions.map((q) => q.id)).size, 20);
  check('20 questions, no duplicates, answers private, timer not started');

  const started = (await student.request(`self-practice/attempts/${attempt.id}/start`, 'POST', {})).attempt;
  assert.ok(started.startedAt);
  const answers = Object.fromEntries(attempt.questions.filter((q) => /^sp-q-(?:[1-9]|1[0-9])$/.test(q.id)).map((q) => [q.id, 'A']));
  for (const q of attempt.questions) if (/^sp-q-1[7-9]$/.test(q.id)) answers[q.id] = 'C';
  await student.request(`self-practice/attempts/${attempt.id}/answers`, 'PUT', {revision: 0, answers});
  const submitted = await student.request(`self-practice/attempts/${attempt.id}/submit`, 'POST', {revision: 1, answers});
  assert.equal(submitted.result.total, 16);
  assert.equal(submitted.result.maxPoints, 20);
  assert.equal(submitted.result.percent, 80);
  const again = await student.request(`self-practice/attempts/${attempt.id}/submit`, 'POST', {revision: 1});
  assert.equal(again.receiptId, submitted.receiptId);
  check('16 correct + 3 wrong + 1 blank = 16/20, one receipt');

  const {rows: leftovers} = await pool.query(`SELECT kind, count(*) FROM ${schema}.records WHERE kind IN ('assignment','submission') GROUP BY kind`);
  assert.equal(leftovers.length, 0);
  check('no assignment or submission records');

  await outsider.request(`self-practice/attempts/${attempt.id}`, 'GET', undefined, 404);
  check('another student cannot read the attempt');

  const result = await student.request(`self-practice/attempts/${attempt.id}/result`);
  assert.equal(result.attempt.result.total, 16);
  assert.ok(result.attempt.result.questions.every((q) => q.correctOption));
  check('result exposes correct options only after submit');

  for (let i = 1; i <= 20; i++) {
    const qid = `sp-q-${i}`;
    await pool.query(`UPDATE ${schema}.records SET data = jsonb_set(data, '{version}', '2') WHERE id = $1`, [qid]);
  }
  await pool.query(`UPDATE ${schema}.records SET data = jsonb_set(data, '{version}', '2') WHERE id = $1`, [unitId]);
  const againCatalog = await student.request('self-practice/catalog?course=micro');
  assert.equal(againCatalog.units[0].questionCount, 20);
  check('unit question count stays consistent');

  console.log(JSON.stringify({passed: checks.length, checks}, null, 2));
} catch (error) {
  console.error(log);
  throw error;
} finally {
  child.kill();
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await pool.end();
}
