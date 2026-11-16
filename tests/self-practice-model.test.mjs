import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PracticeError,
  attemptIdFor,
  buildCatalog,
  drawPaper,
  finalizeAttempt,
  isOverdue,
  publicAttempt,
  questionEligible,
  scoreAttempt,
  validateCreate,
} from '../homework-server/self-practice-model.mjs';

const options = ['A', 'B', 'C', 'D', 'E'];
const unit = {
  id: 'micro-unit-2',
  title: 'AP 微观 · Unit 2',
  owner: 'bookself:teacher',
  topics: [
    {id: '2.1', name: 'Demand', title: '需求', bookself: '/enter/bookself?x=1'},
    {id: '2.2', name: 'Supply', title: '供给', bookself: '/enter/bookself?x=2'},
  ],
};

function question(index, overrides = {}) {
  return {
    id: `q-${index}`,
    type: 'choice',
    status: 'ready',
    unitId: 'micro-unit-2',
    topic: index % 2 ? '2.1' : '2.2',
    number: String(index),
    source: 'unit2-slides',
    answer: 'B',
    options,
    questionImages: ['file-a'],
    collection: 'bank',
    maxPoints: 1,
    ...overrides,
  };
}

function seeded(seed = 7) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

test('validateCreate keeps defaults and rejects invalid combinations', () => {
  const input = validateCreate({clientId: 'client-12345678', course: 'micro', topicIds: ['2.1'], questionCount: 10});
  assert.equal(input.timerMode, 'countup');
  assert.equal(input.timeLimitMinutes, 0);
  assert.throws(() => validateCreate({clientId: 'x', course: 'micro', topicIds: ['2.1'], questionCount: 10}), PracticeError);
  assert.throws(() => validateCreate({clientId: 'client-12345678', course: 'micro', topicIds: [], questionCount: 10}), /选择一个章节/);
  assert.throws(() => validateCreate({clientId: 'client-12345678', course: 'micro', topicIds: ['2.1'], questionCount: 15}), /10、20 或 30/);
  assert.throws(() => validateCreate({clientId: 'client-12345678', course: 'micro', topicIds: ['2.1'], questionCount: 10, timerMode: 'countdown', timeLimitMinutes: 0}), /1–240/);
  assert.throws(() => validateCreate({clientId: 'client-12345678', course: 'micro', topicIds: ['9.9'], questionCount: 10}, {allowedTopics: new Set(['micro:2.1'])}), /不在可练习范围/);
});

test('eligibility excludes exams, duplicates, flagged, missing images and bad answers', () => {
  const options = {unit, imageExists: (fileId) => fileId === 'file-a'};
  assert.equal(questionEligible(question(1), options), true);
  assert.equal(questionEligible(question(2, {collection: 'exam'}), options), false);
  assert.equal(questionEligible(question(3, {duplicateOf: 'q-1'}), options), false);
  assert.equal(questionEligible(question(4, {reviewFlags: ['answer-key-visible']}), options), false);
  assert.equal(questionEligible(question(5, {answer: 'F'}), options), false);
  assert.equal(questionEligible(question(6, {questionImages: []}), options), false);
  assert.equal(questionEligible(question(7, {questionImages: ['file-missing']}), options), false);
  assert.equal(questionEligible(question(8, {topic: '9.9'}), options), false);
  assert.equal(questionEligible(question(9, {type: 'short'}), options), false);
});

test('catalog counts only eligible questions and drops empty units', () => {
  const questionsByUnit = {
    'micro-unit-2': [question(1), question(2), question(3), question(4, {status: 'draft'})],
    'micro-unit-3': [],
  };
  const catalog = buildCatalog({units: [unit, {...unit, id: 'micro-unit-3', topics: [{id: '3.1', name: 'A', title: 'A'}]}], questionsByUnit, course: 'micro'});
  assert.equal(catalog.length, 1);
  assert.deepEqual(catalog[0].topics.map((topic) => [topic.id, topic.count]), [['2.1', 2], ['2.2', 1]]);
  assert.equal(catalog[0].questionCount, 3);
});

test('drawing exact counts keeps no duplicates and covers selected topics', () => {
  const pool = Array.from({length: 40}, (_, i) => question(i + 1));
  for (const count of [10, 20, 30]) {
    const drawn = drawPaper({questions: pool, topicIds: ['2.1', '2.2'], count, random: seeded(count)});
    assert.equal(drawn.length, count);
    assert.equal(new Set(drawn.map((item) => item.id)).size, count);
    assert.equal(new Set(drawn.map((item) => item.topic)).size, 2);
  }
});

test('underfilled topics fail loudly with the available count', () => {
  const pool = Array.from({length: 9}, (_, i) => question(i + 1));
  assert.throws(() => drawPaper({questions: pool, topicIds: ['2.1', '2.2'], count: 10, random: seeded(1)}), (error) => error.status === 400 && /当前共 9 道/.test(error.message));
});

test('fingerprint dedupe keeps a shared question out of two topic pools', () => {
  const shared = question(1, {topic: '2.1'});
  const twin = question(2, {topic: '2.2', source: 'unit2-slides', number: '1'});
  assert.throws(() => drawPaper({questions: [shared, twin], topicIds: ['2.1', '2.2'], count: 10, random: seeded(3)}), /当前共 1 道/);
});

test('scoring 16 correct, 3 wrong and 1 unanswered is 16/20', () => {
  const questions = Array.from({length: 20}, (_, i) => ({
    ...question(i + 1),
    answer: 'A',
    options,
  }));
  const answers = {};
  for (let i = 0; i < 16; i += 1) answers[questions[i].id] = 'A';
  for (let i = 16; i < 19; i += 1) answers[questions[i].id] = 'B';
  const attempt = {questions, answers, startedAt: new Date(Date.now() - 7000).toISOString()};
  const result = scoreAttempt(attempt);
  assert.equal(result.total, 16);
  assert.equal(result.maxPoints, 20);
  assert.equal(result.percent, 80);
  assert.equal(result.questions.filter((item) => !item.chosen).length, 1);
  assert.equal(result.questions[19].score, 0);
  assert.ok(result.durationSeconds >= 6);
});

test('student payload never leaks correct options', () => {
  const questions = [question(1, {answer: 'C'})];
  const attempt = {id: 'a', course: 'micro', topicIds: ['2.1'], questions, answers: {}, flags: [], revision: 0, status: 'active', createdAt: new Date().toISOString(), timerMode: 'countup', timeLimitMinutes: 0};
  const payload = JSON.stringify(publicAttempt(attempt));
  assert.ok(!payload.includes('"answer"'));
  assert.ok(!payload.includes('"correctOption"'));
  assert.ok(payload.includes('"optionLabels"'));
});

test('attempt ids are deterministic per student and client', () => {
  assert.equal(attemptIdFor('student-a', 'client-1'), attemptIdFor('student-a', 'client-1'));
  assert.notEqual(attemptIdFor('student-a', 'client-1'), attemptIdFor('student-b', 'client-1'));
});

test('deadline finalization uses saved answers and marks auto-submit', () => {
  const questions = [question(1, {answer: 'A'}), question(2, {answer: 'B'})];
  const attempt = {
    id: 'self-practice-attempt:x',
    questions,
    answers: {[questions[0].id]: 'A'},
    revision: 3,
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    deadlineAt: new Date(Date.now() - 1_000).toISOString(),
    status: 'active',
    timerMode: 'countdown',
    timeLimitMinutes: 1,
  };
  assert.equal(isOverdue(attempt), true);
  const finalized = finalizeAttempt(attempt, {autoSubmitted: true, receiptId: 'receipt'});
  assert.equal(finalized.status, 'submitted');
  assert.equal(finalized.autoSubmitted, true);
  assert.equal(finalized.result.total, 1);
  assert.equal(finalized.result.maxPoints, 2);
});
