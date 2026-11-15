import test from 'node:test';
import assert from 'node:assert/strict';
import {
  correctionCounts,
  learningReminders,
  nextAssignment,
  recentResults,
  studentHomeSummary,
  unitTrail,
} from '../homework/student-home-model.js';

const now = new Date('2026-11-15T12:00:00+08:00').getTime();

function assignment(overrides = {}) {
  return {
    id: 'a1',
    title: 'Unit 2 MCQ',
    unit: 'Unit 2',
    published: true,
    questions: [{id: 'q1'}, {id: 'q2'}, {id: 'q3'}],
    dueAt: '2026-11-16T23:59:00+08:00',
    createdAt: '2026-11-10T09:00:00+08:00',
    audience: {required: true, students: []},
    ...overrides,
  };
}

function submission(overrides = {}) {
  return {
    id: 's1',
    assignmentId: 'a1',
    studentId: 'me',
    status: 'published',
    submittedAt: '2026-11-12T10:00:00+08:00',
    choices: {q1: 'A'},
    publishedGrade: {total: 2, maxPoints: 3, questions: [
      {id: 'q1', score: 1, maxPoints: 1, type: 'choice'},
      {id: 'q2', score: 1, maxPoints: 1, type: 'choice'},
      {id: 'q3', score: 0, maxPoints: 1, type: 'short'},
    ]},
    ...overrides,
  };
}

test('nextAssignment prefers a saved draft over a later deadline', () => {
  const soon = assignment({id: 'a1', title: 'Soon', dueAt: '2026-11-16T23:59:00+08:00'});
  const draft = assignment({id: 'a2', title: 'Draft', dueAt: '2026-11-20T23:59:00+08:00', attemptProgress: 1});
  const next = nextAssignment([soon, draft], [], now);
  assert.equal(next.assignment.id, 'a2');
  assert.equal(next.action, '继续作答');
});

test('nextAssignment ignores closed and unpublished assignments', () => {
  const closed = assignment({id: 'closed', dueAt: '2026-10-01T23:59:00+08:00'});
  const hidden = assignment({id: 'hidden', published: false});
  const open = assignment({id: 'open', dueAt: '2026-11-18T23:59:00+08:00'});
  assert.equal(nextAssignment([closed, hidden], [], now), null);
  assert.equal(nextAssignment([closed, hidden, open], [], now).assignment.id, 'open');
});

test('draft progress counts saved choices and one written answer', () => {
  const draft = assignment({id: 'draft', attemptProgress: 5, questions: [{id: 'q1'}, {id: 'q2'}, {id: 'q3'}]});
  const saved = submission({id: 'd1', status: 'draft', choices: {q1: 'A', q2: 'B'}, text: '我的思路', publishedGrade: null});
  const next = nextAssignment([draft], [saved], now);
  assert.deepEqual(next.progress, {answered: 3, total: 3});
});

test('correctionCounts separates open, review, mastered', () => {
  const counts = correctionCounts([
    {id: 1, status: 'todo'}, {id: 2, status: 'todo'},
    {id: 3, status: 'review'}, {id: 4, status: 'mastered'},
  ]);
  assert.deepEqual(counts, {open: 2, review: 1, mastered: 1, total: 4});
  assert.equal(correctionCounts([]).open, 0);
});

test('recentResults sorts published grades newest first and keeps rates', () => {
  const a1 = assignment({id: 'a1', title: 'Older'});
  const a2 = assignment({id: 'a2', title: 'Newer'});
  const subs = [
    submission({id: 's1', assignmentId: 'a1', publishedGrade: {total: 1, maxPoints: 2, questions: []}}),
    submission({id: 's2', assignmentId: 'a2', submittedAt: '2026-11-14T10:00:00+08:00',
      publishedGrade: {total: 3, maxPoints: 4, questions: []}}),
  ];
  const recent = recentResults([a1, a2], subs);
  assert.deepEqual(recent.map(r => r.assignment.title), ['Newer', 'Older']);
  assert.deepEqual(recent.map(r => r.rate), [75, 50]);
});

test('unitTrail keeps assignments from the current unit only', () => {
  const current = assignment({id: 'a1', libraryUnit: 'Unit 2'});
  const same = assignment({id: 'a2', libraryUnit: 'Unit 2', dueAt: '2026-11-18T23:59:00+08:00'});
  const other = assignment({id: 'a3', libraryUnit: 'Unit 1'});
  const trail = unitTrail([current, same, other], [], {assignment: current}, now);
  assert.equal(trail.unit, 'Unit 2');
  assert.deepEqual(trail.items.map(i => i.assignment.id), ['a1', 'a2']);
});

test('reminders describe corrections, deadline and recent change', () => {
  const next = nextAssignment([assignment()], [], now);
  const recent = [{assignment: {title: 'Unit 1'}, rate: 60}, {assignment: {title: 'Quiz'}, rate: 50}];
  const reminders = learningReminders({next, corrections: {open: 2}, recent, now});
  assert.equal(reminders.length, 3);
  assert.match(reminders[0], /2 道失分题/);
  assert.match(reminders[1], /已保存 0\/3 题/);
  assert.match(reminders[2], /高 10 个百分点/);
});

test('studentHomeSummary works with an empty classroom', () => {
  const summary = studentHomeSummary({assignments: [], submissions: [], mistakes: []});
  assert.equal(summary.next, null);
  assert.deepEqual(summary.recent, []);
  assert.equal(summary.trail.items.length, 0);
  assert.match(summary.reminders[0], /老师发布作业后/);
});

test('studentHomeMarkup renders the next deadline, corrections and reminders', async () => {
  const {studentHomeMarkup} = await import('../homework/student-home.js');
  const h = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (route, label, kind = 'secondary') => `<a class="${kind}" href="#${route}">${label}</a>`;
  const html = studentHomeMarkup({
    state: {
      assignments: [assignment()],
      submissions: [submission({status: 'draft', id: 'd1', choices: {q1: 'A'}, updatedAt: '2026-11-14T10:00:00+08:00', publishedGrade: null})],
      learning: {mistakes: [{id: 'm1', status: 'todo'}, {id: 'm2', status: 'review'}]},
    },
    h, link, date: value => value ? '11/14' : '', now,
  });
  assert.match(html, /最近截止 · 明天 23:59 截止/);
  assert.match(html, /已保存 1\/3 题/);
  assert.match(html, /href="#submit\/a1"[^>]*>继续作答/);
  assert.match(html, /待订正 1 题/);
  assert.match(html, /学习提醒/);
});

test('studentHomeMarkup keeps an empty state when nothing is open', async () => {
  const {studentHomeMarkup} = await import('../homework/student-home.js');
  const h = value => String(value ?? '');
  const link = (route, label, kind = 'secondary') => `<a class="${kind}" href="#${route}">${label}</a>`;
  const html = studentHomeMarkup({state: {assignments: [], submissions: [], learning: {mistakes: []}}, h, link, date: () => '', now});
  assert.match(html, /暂时没有待完成的作业/);
  assert.match(html, /href="#grades"/);
});
