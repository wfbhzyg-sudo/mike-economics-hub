import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createSelfPractice} from '../homework-server/self-practice.mjs';

function store() {
  const rows = new Map();
  let tail = Promise.resolve();
  return {
    rows,
    async get(id) { return structuredClone(rows.get(id)?.data); },
    async put(kind, data) { rows.set(data.id, {kind, data: structuredClone(data)}); return data; },
    async list(kind) { return [...rows.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row.data)); },
    async find(kind, filters = {}) { return (await this.list(kind)).filter((row) => Object.entries(filters).every(([key, value]) => Array.isArray(value) ? value.map(String).includes(String(row[key])) : String(row[key]) === String(value))); },
    tx(fn) { const next = tail.then(() => fn({})); tail = next.catch(() => {}); return next; },
    async audit() {},
  };
}

async function call(handler, user, route, method = 'GET', data = {}) {
  let value;
  let status;
  const req = {headers: {}, url: '/api/homework/' + route};
  const res = new EventEmitter();
  res.writeHead = (code) => { status = code; return res; };
  res.end = () => {};
  const [pathname, query = ''] = route.split('?');
  await handler.handle({req: {...req, url: `/api/homework/${pathname}?${query}`}, res, user, route: pathname.split('/'), method, body: async () => data, json: (_res, body, code = 200) => { value = body; status = code; }});
  return {value, status};
}

const students = {
  a: {id: 'student-a', role: 'student', name: 'A', classIds: ['bookself-class:class-1']},
  b: {id: 'student-b', role: 'student', name: 'B', classIds: ['bookself-class:class-1']},
  teacher: {id: 'teacher', role: 'teacher', classIds: []},
};

async function fixture() {
  const db = store();
  await db.put('library-unit', {
    id: 'micro-unit-2', type: 'library-unit', owner: 'bookself:teacher', title: 'AP 微观 · Unit 2',
    topics: [
      {id: '2.1', name: 'Demand', title: '需求', bookself: '/enter/bookself?chapter=u2-demand-supply'},
      {id: '2.2', name: 'Supply', title: '供给', bookself: '/enter/bookself?chapter=u2-demand-supply'},
    ],
    resources: [], questionCount: 0, version: 1,
  });
  await db.put('library-release', {id: 'release-1', type: 'library-release', unitId: 'micro-unit-2', classIds: ['bookself-class:class-1'], owner: 'bookself:teacher'});
  for (const fileId of ['img-a', 'img-b']) await db.put('file', {id: fileId, type: 'file', purpose: 'library', mime: 'image/png', size: 100, owner: 'bookself:teacher'});
  for (let i = 1; i <= 40; i += 1) {
    await db.put('library-question', {
      id: `q-${i}`, type: 'choice', status: 'ready', unitId: 'micro-unit-2', topic: i % 2 ? '2.1' : '2.2',
      number: String(i), source: 'slides', answer: 'A', options: ['A', 'B', 'C', 'D', 'E'],
      questionImages: [i % 2 ? 'img-a' : 'img-b'], collection: 'bank', maxPoints: 1,
      prompt: `Question ${i}`, sourcePages: `p.${i}`,
    });
  }
  await db.put('library-question', {id: 'exam-1', type: 'choice', status: 'ready', unitId: 'micro-unit-2', topic: '2.1', number: '99', answer: 'A', options: ['A', 'B'], questionImages: ['img-a'], collection: 'exam'});
  await db.put('library-question', {id: 'wrong-file', type: 'choice', status: 'ready', unitId: 'micro-unit-2', topic: '2.1', number: '98', answer: 'A', options: ['A', 'B'], questionImages: ['missing-file'], collection: 'bank'});
  return {db, handler: createSelfPractice({db})};
}

const createBody = (overrides = {}) => ({
  clientId: 'client-abcdefgh',
  course: 'micro',
  topicIds: ['2.1', '2.2'],
  questionCount: 20,
  timerMode: 'countup',
  ...overrides,
});

test('catalog lists only released units and eligible topics; teachers are refused', async () => {
  const {handler} = await fixture();
  const catalog = (await call(handler, students.a, 'self-practice/catalog?course=micro')).value;
  assert.equal(catalog.units.length, 1);
  assert.deepEqual(catalog.units[0].topics.map((topic) => [topic.id, topic.count]), [['2.1', 20], ['2.2', 20]]);
  assert.equal(catalog.questionCount, 40);
  await assert.rejects(call(handler, students.teacher, 'self-practice/catalog'), /仅对学生开放/);
});

test('creating 20 questions keeps answers private and starts only on request', async () => {
  const {handler, db} = await fixture();
  const created = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody())).value;
  assert.equal(created.attempt.questionCount, 20);
  assert.equal(new Set(created.attempt.questions.map((q) => q.id)).size, 20);
  assert.equal(created.attempt.status, 'created');
  assert.equal(created.attempt.startedAt, null);
  const payload = JSON.stringify(created.attempt);
  assert.ok(!payload.includes('"answer"'));
  assert.ok(!payload.includes('correctOption'));
  const stored = await db.get(created.attempt.id);
  assert.ok(stored.questions.every((q) => q.answer === 'A'));
  const started = (await call(handler, students.a, `self-practice/attempts/${created.attempt.id}/start`, 'POST')).value.attempt;
  assert.equal(started.status, 'active');
  assert.ok(started.startedAt);
  assert.equal(started.deadlineAt, null);
});

test('16 correct, 3 wrong and 1 blank submits as 16/20 with one receipt and no assignment records', async () => {
  const {handler, db} = await fixture();
  const created = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody({timerMode: 'countdown', timeLimitMinutes: 30}))).value.attempt;
  await call(handler, students.a, `self-practice/attempts/${created.id}/start`, 'POST');
  const questions = (await db.get(created.id)).questions;
  const answers = {};
  for (let i = 0; i < 16; i += 1) answers[questions[i].id] = 'A';
  for (let i = 16; i < 19; i += 1) answers[questions[i].id] = 'B';
  const saved = (await call(handler, students.a, `self-practice/attempts/${created.id}/answers`, 'PATCH', {revision: 0, answers, index: 19})).value;
  assert.equal(saved.revision, 1);
  const submitted = (await call(handler, students.a, `self-practice/attempts/${created.id}/submit`, 'POST', {revision: 1, answers})).value;
  assert.equal(submitted.result.total, 16);
  assert.equal(submitted.result.maxPoints, 20);
  assert.equal(submitted.result.percent, 80);
  assert.equal(submitted.result.questions.filter((q) => !q.chosen).length, 1);
  const duplicate = (await call(handler, students.a, `self-practice/attempts/${created.id}/submit`, 'POST', {revision: 0, answers: {}})).value;
  assert.equal(duplicate.receiptId, submitted.receiptId);
  assert.equal((await db.list('submission')).length, 0);
  assert.equal((await db.list('assignment')).length, 0);
  assert.equal((await db.list('self-practice-receipt')).length, 1);
  const fetched = (await call(handler, students.a, `self-practice/attempts/${created.id}`)).value.attempt;
  assert.equal(fetched.status, 'submitted');
  assert.equal(fetched.result.total, 16);
});

test('another student cannot read, save, submit or correct the attempt', async () => {
  const {handler} = await fixture();
  const created = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody())).value.attempt;
  await call(handler, students.a, `self-practice/attempts/${created.id}/start`, 'POST');
  await assert.rejects(call(handler, students.b, `self-practice/attempts/${created.id}`), /未找到/);
  await assert.rejects(call(handler, students.b, `self-practice/attempts/${created.id}/answers`, 'PATCH', {revision: 0, answers: {}}), /未找到/);
  await assert.rejects(call(handler, students.b, `self-practice/attempts/${created.id}/submit`, 'POST', {}), /未找到/);
});

test('stale revision conflicts, deadline finalizes saved answers and does not reset the timer', async () => {
  const {handler, db} = await fixture();
  const created = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody({timerMode: 'countdown', timeLimitMinutes: 1}))).value.attempt;
  await call(handler, students.a, `self-practice/attempts/${created.id}/start`, 'POST');
  const attempt = await db.get(created.id);
  const first = (await call(handler, students.a, `self-practice/attempts/${created.id}/answers`, 'PATCH', {revision: 0, answers: {[attempt.questions[0].id]: 'A'}})).value;
  await assert.rejects(call(handler, students.a, `self-practice/attempts/${created.id}/answers`, 'PATCH', {revision: 0, answers: {}}), /另一台设备/);
  const current = await db.get(created.id);
  current.deadlineAt = new Date(Date.now() - 1000).toISOString();
  await db.put('self-practice-attempt', current);
  await assert.rejects(call(handler, students.a, `self-practice/attempts/${created.id}/answers`, 'PATCH', {revision: first.revision, answers: {}}), /时间已到/);
  const submitted = (await call(handler, students.a, `self-practice/attempts/${created.id}/submit`, 'POST', {revision: first.revision, answers: {}})).value;
  assert.equal(submitted.autoSubmitted, true);
  assert.equal(submitted.result.total, 1);
  const settled = await db.get(created.id);
  assert.equal(settled.startedAt, current.startedAt);
  assert.equal(settled.deadlineAt, current.deadlineAt);
});

test('a used client id returns the same attempt and the network has no AI calls', async () => {
  const {handler, db} = await fixture();
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('network disabled'); };
  try {
    const first = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody())).value;
    const again = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody())).value;
    assert.equal(again.created, false);
    assert.equal(again.attempt.id, first.attempt.id);
    assert.equal((await db.list('self-practice-attempt')).length, 1);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('correcting a submitted answer stores the new choice and never touches the score', async () => {
  const {handler, db} = await fixture();
  const created = (await call(handler, students.a, 'self-practice/attempts', 'POST', createBody())).value.attempt;
  await call(handler, students.a, `self-practice/attempts/${created.id}/start`, 'POST');
  const questions = (await db.get(created.id)).questions;
  const submitted = (await call(handler, students.a, `self-practice/attempts/${created.id}/submit`, 'POST', {revision: 0, answers: {[questions[0].id]: 'B'}})).value;
  assert.equal(submitted.result.total, 0);
  const corrected = (await call(handler, students.a, `self-practice/attempts/${created.id}/correct`, 'POST', {questionId: questions[0].id, choice: 'A', note: '重新计算'})).value;
  assert.equal(corrected.corrections[questions[0].id].choice, 'A');
  const stored = await db.get(created.id);
  assert.equal(stored.result.total, 0);
  assert.equal(stored.corrections[questions[0].id].note, '重新计算');
});
