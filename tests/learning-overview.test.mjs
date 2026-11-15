import test from 'node:test';
import assert from 'node:assert/strict';
import {
  periodRange, scopedAssignments, scopedStudents, assignmentLabel, buildRows, overviewStats,
  questionStats, studentProfile, rowStatus, formatPercent, trendLabel, unitsOf,
  typeBreakdown, correctionSummary, assignmentHistory, studentObservations, classObservations, reportText,
  assignmentDiagnostics,
} from '../homework/learning-analytics-model.js';

const CLASS = 'class-1';
const assignment = (id, extra = {}) => ({
  id, title: 'Unit 2.1 MCQ 练习', format: 'mcq', libraryUnit: '2.1', published: true,
  classIds: [CLASS], version: 1, createdAt: '2026-10-01T08:00:00Z', dueAt: '2026-10-05T23:59:00Z',
  questions: [{id: 'q1', prompt: '题干', type: 'choice', maxPoints: 1, options: [{label: 'A'}, {label: 'B'}, {label: 'C'}]}],
  audience: {confirmedAt: '2026-10-01', students: [{id: 's1', classIds: [CLASS]}, {id: 's2', classIds: [CLASS]}]},
  ...extra,
});
const student = id => ({id, name: id, username: id, classIds: [CLASS]});
const submission = (studentId, id, {score = null, maxPoints = 10, at = '2026-10-02T10:00:00Z', status = 'published', choices = {}, version = 1} = {}) => ({
  id, studentId, assignmentId: 'a1', status, submittedAt: at, version, choices,
  publishedGrade: score === null ? null : {total: score, maxPoints, revision: 1, publishedAt: at, questions: [{id: 'q1', score, maxPoints}]},
});
const data = (overrides = {}) => ({students: [student('s1'), student('s2')], assignments: [assignment('a1')], submissions: [], mistakes: [], ...overrides});

test('four week window is inclusive, stable and does not depend on time of day', () => {
  assert.deepEqual(periodRange('4w', new Date(2026, 10, 15, 23, 30)), {from: '2026-10-19', to: '2026-11-15'});
  assert.deepEqual(periodRange('all'), {from: '', to: ''});
  assert.equal(periodRange('term', new Date(2026, 0, 12)).from, '2025-08-01');
});

test('scope keeps only assignments for the class, unit and period', () => {
  const early = assignment('early', {createdAt: '2026-01-01T08:00:00Z', dueAt: '2026-01-02T08:00:00Z'});
  const otherUnit = assignment('other', {libraryUnit: '3.1'});
  const otherClass = assignment('elsewhere', {classIds: ['class-2']});
  const deletedWithHistory = assignment('deleted', {deletedAt: '2026-10-03', published: false});
  const fixture = data({assignments: [assignment('a1'), early, otherUnit, otherClass, deletedWithHistory], submissions: [{...submission('s1', 'd1', {score: 5, at: '2026-10-01T10:00:00Z'}), assignmentId: 'deleted'}]});
  assert.deepEqual(scopedAssignments(fixture, {classId: CLASS, unit: '2.1', period: '4w'}, new Date(2026, 9, 10)).map(item => item.id), ['a1', 'deleted']);
  assert.deepEqual(scopedAssignments(fixture, {classId: CLASS, unit: '2.1', period: '4w'}, new Date(2026, 10, 15)).map(item => item.id), []);
  assert.deepEqual(scopedAssignments(fixture, {classId: CLASS, period: 'all'}).map(item => item.id), ['early', 'a1', 'deleted', 'other']);
});

test('students are kept for the current class or its publish-time audience snapshot', () => {
  const outsider = {id: 'old', name: 'old', classIds: ['class-2']};
  const unrelated = {...submission('old', 'x', {score: 4}), assignmentId: 'other'};
  const fixture = data({students: [student('s1'), outsider], submissions: [unrelated]});
  assert.deepEqual(scopedStudents(fixture, {classId: CLASS, assignments: [assignment('a1')]}).map(item => item.id), ['s1']);
  // A submission alone is not proof of class membership: no snapshot means no guess.
  const withSubmission = data({students: [student('s1'), outsider], submissions: [submission('old', 'x', {score: 4})]});
  assert.deepEqual(scopedStudents(withSubmission, {classId: CLASS, assignments: [assignment('a1')]}).map(item => item.id), ['s1']);
  // Historical members stay through the audience class snapshot; another class on a
  // shared assignment must not be pulled into this class.
  const moved = {id: 'moved', name: 'moved', classIds: ['class-2']};
  const other = {id: 'other', name: 'other', classIds: ['class-2']};
  const shared = assignment('a1', {
    classIds: [CLASS, 'class-2'],
    audience: {confirmedAt: '2026-10-01', students: [
      {id: 's1', classIds: [CLASS]},
      {id: 'moved', classIds: [CLASS]},
      {id: 'other', classIds: ['class-2']},
    ]},
  });
  const sharedData = data({students: [student('s1'), moved, other], assignments: [shared]});
  assert.deepEqual(scopedStudents(sharedData, {classId: CLASS, assignments: [shared]}).map(item => item.id), ['s1', 'moved']);
});

test('rows separate submitted, published, missing and neutrality without zero-filling', () => {
  const a1 = assignment('a1');
  const a2 = assignment('a2', {libraryUnit: '2.2'});
  const fixture = data({assignments: [a1, a2], submissions: [
    {...submission('s1', 'x', {score: 8}), assignmentId: 'a1'},
    {...submission('s1', 'y', {score: 0}), assignmentId: 'a2'},
    {...submission('s2', 'z', {score: null, status: 'needs_review'}), assignmentId: 'a1'},
  ]});
  const rows = buildRows(fixture, fixture.students, [a1, a2]);
  assert.deepEqual(rows.map(row => [row.student.id, row.submitted, row.published, row.missing, row.needsReview, row.average]), [
    ['s1', 2, 2, 0, 0, 40], ['s2', 1, 0, 1, 1, null],
  ]);
  assert.equal(rows[0].completion, 100);
  assert.equal(rows[1].completion, 50);
});

test('class average weights every published assignment equally, not by points', () => {
  const big = assignment('big', {questions: [{id: 'q1', prompt: '', type: 'choice', maxPoints: 100, options: []}]});
  const small = assignment('small', {questions: [{id: 'q1', prompt: '', type: 'choice', maxPoints: 10, options: []}]});
  const fixture = data({assignments: [big, small], submissions: [
    {...submission('s1', 'x', {score: 90, maxPoints: 100}), assignmentId: 'big'},
    {...submission('s1', 'y', {score: 5, maxPoints: 10}), assignmentId: 'small'},
  ]});
  const rows = buildRows(fixture, [fixture.students[0]], [big, small]);
  const stats = overviewStats(rows, [big, small]);
  assert.equal(rows[0].average, 70);
  assert.equal(stats.average, 70);
  assert.equal(stats.due, 2);
  assert.equal(stats.submitted, 2);
  assert.equal(stats.published, 2);
});

test('question distribution uses the latest attempt, ignores drafts and reports unanswered separately', () => {
  const fixture = data({submissions: [
    {...submission('s1', 's1a', {score: 1, maxPoints: 1, choices: {q1: 'A'}}), assignmentId: 'a1'},
    {...submission('s2', 's2a', {score: 0, maxPoints: 1, choices: {q1: 'B'}}), assignmentId: 'a1'},
    {...submission('s3', 's3a', {score: 1, maxPoints: 1, choices: {q1: 'A'}}), assignmentId: 'a1'},
    {...submission('s4', 's4a', {score: 1, maxPoints: 1, choices: {q1: 'C'}, version: 2}), assignmentId: 'a1'},
    {...submission('s5', 's5a', {score: null, status: 'draft', choices: {q1: 'C'}}), assignmentId: 'a1'},
  ]});
  const stats = questionStats(fixture, 'a1');
  assert.equal(stats.graded, 4);
  assert.equal(stats.questions[0].correct, 3);
  assert.equal(stats.questions[0].rate, 75);
  assert.deepEqual(stats.questions[0].distribution.map(item => [item.label, item.count]), [['A', 2], ['B', 1], ['C', 0]]);
  assert.equal(stats.questions[0].answered, 3);
  assert.equal(stats.questions[0].unanswered, 1);
});

test('question stats survive a missing assignment and questions without a grade', () => {
  assert.equal(questionStats(data(), 'missing'), null);
  const fixture = data({submissions: [{...submission('s1', 'x', {score: null}), assignmentId: 'a1', status: 'queued'}]});
  const stats = questionStats(fixture, 'a1');
  assert.equal(stats.graded, 0);
  assert.equal(stats.questions[0].rate, null);
});

test('student profile lists weakest questions first and counts open corrections', () => {
  const fixture = data({mistakes: [
    {studentId: 's1', assignmentId: 'a1', questionId: 'q2', score: 1, maxPoints: 2, status: 'todo'},
    {studentId: 's1', assignmentId: 'a1', questionId: 'q3', score: 0, maxPoints: 2, status: 'mastered'},
    {studentId: 's2', assignmentId: 'a1', questionId: 'q4', score: 0, maxPoints: 1, status: 'todo'},
  ], submissions: [
    {...submission('s1', 'x', {score: 7}), assignmentId: 'a1'},
  ]});
  const profile = studentProfile(fixture, fixture.students[0], [assignment('a1')]);
  assert.deepEqual(profile.weak.map(item => item.questionId), ['q3', 'q2']);
  assert.equal(profile.openCorrections, 1);
  assert.equal(profile.recent.length, 1);
});

test('row status prioritises incomplete work, corrections, review and publication', () => {
  const base = {total: 10, submitted: 10, published: 10, missing: 0, needsReview: 0, openCorrections: 0, completion: 100};
  assert.equal(rowStatus(base).key, 'done');
  assert.equal(rowStatus({...base, missing: 4, completion: 60}).key, 'missing');
  assert.equal(rowStatus({...base, missing: 4, completion: 59}).label, '未完成');
  assert.equal(rowStatus({...base, openCorrections: 2}).label, '待订正 2');
  assert.equal(rowStatus({...base, published: 8, needsReview: 2}).key, 'review');
  assert.equal(rowStatus({...base, published: 0, needsReview: 0}).key, 'progress');
  assert.equal(rowStatus({...base, total: 0, submitted: 0, published: 0, completion: 0}).key, 'none');
});

test('labels are short and keep the unit and question type', () => {
  assert.equal(assignmentLabel(assignment('a1')), '2.1 MCQ');
  assert.equal(assignmentLabel(assignment('a2', {libraryUnit: '', format: 'frq', title: 'Unit 2.3 FRQ 练习'})), 'FRQ 练习');
  assert.equal(assignmentLabel({title: 'Quiz 01', format: 'mcq'}), 'Quiz 01');
  assert.equal(assignmentLabel({title: '一个非常非常长的作业标题名称'}), '一个非常非常长的作业标…');
});

test('percent formatting rounds half up and never prints a fake zero', () => {
  assert.equal(formatPercent(79.96), '80%');
  assert.equal(formatPercent(0), '0%');
  assert.equal(formatPercent(null), '—');
  assert.equal(trendLabel(3.5), '+3.5');
  assert.equal(trendLabel(null), '');
});

test('unit options are unique and numerically sorted', () => {
  const list = [assignment('a', {libraryUnit: '2.10'}), assignment('b', {libraryUnit: '2.2'}), assignment('c', {libraryUnit: '2.2'}), assignment('d', {libraryUnit: ''})];
  assert.deepEqual(unitsOf(list), ['2.2', '2.10']);
});


const graded = (studentId, id, score, maxPoints, {assignmentId = 'a1', at = '2026-10-02T10:00:00Z', type = 'short', questions} = {}) => ({
  id, studentId, assignmentId, status: 'published', submittedAt: at, version: 1, choices: {},
  publishedGrade: {total: score, maxPoints, revision: 1, publishedAt: at,
    questions: questions || [{id: 'q1', score, maxPoints, type}]},
});

test('type breakdown separates automatically scored choices from written answers', () => {
  const fixture = data({submissions: [
    graded('s1', 'x', 6, 10, {questions: [
      {id: 'q1', score: 1, maxPoints: 1, type: 'choice'},
      {id: 'q2', score: 1, maxPoints: 1, type: 'choice'},
      {id: 'q3', score: 4, maxPoints: 8, type: 'short'},
    ]}),
  ]});
  const types = typeBreakdown(fixture, 's1');
  assert.deepEqual([types.choice.questions, types.choice.score, types.choice.total, types.choice.rate], [2, 2, 2, 100]);
  assert.deepEqual([types.written.questions, types.written.score, types.written.total, types.written.rate], [1, 4, 8, 50]);
  assert.equal(typeBreakdown(fixture, 's2').choice.rate, null);
});

test('correction summary counts each state without inventing records', () => {
  const fixture = data({mistakes: [
    {studentId: 's1', assignmentId: 'a1', questionId: 'q1', status: 'todo'},
    {studentId: 's1', assignmentId: 'a1', questionId: 'q2', status: 'review'},
    {studentId: 's1', assignmentId: 'a1', questionId: 'q3', status: 'mastered'},
    {studentId: 's2', assignmentId: 'a1', questionId: 'q1', status: 'todo'},
  ]});
  assert.deepEqual(correctionSummary(fixture, 's1'), {total: 3, open: 1, review: 1, mastered: 1});
  assert.deepEqual(correctionSummary(fixture, 'missing'), {total: 0, open: 0, review: 0, mastered: 0});
});

test('assignment history is newest first and keeps each cell status', () => {
  const early = assignment('early', {dueAt: '2026-09-01T23:59:00Z'});
  const late = assignment('late', {dueAt: '2026-10-20T23:59:00Z'});
  const fixture = data({assignments: [early, late], submissions: [
    {...graded('s1', 'x', 8, 10), assignmentId: 'early'},
    {...graded('s1', 'y', 9, 10), assignmentId: 'late'},
  ]});
  const history = assignmentHistory(fixture, fixture.students[0], [early, late]);
  assert.deepEqual(history.map(cell => [cell.assignment.id, cell.status, cell.rate]), [['late', 'graded', 90], ['early', 'graded', 80]]);
});

test('student observations name the facts behind each sentence', () => {
  const a1 = assignment('a1', {libraryUnit: '2.1'});
  const a2 = assignment('a2', {libraryUnit: '2.3'});
  const fixture = data({assignments: [a1, a2], submissions: [
    {...graded('s1', 'x', 9, 10), assignmentId: 'a1'},
    {...graded('s1', 'y', 4, 10), assignmentId: 'a2'},
  ], mistakes: [
    {studentId: 's1', assignmentId: 'a2', questionId: 'q1', status: 'todo'},
    {studentId: 's1', assignmentId: 'a2', questionId: 'q2', status: 'review'},
  ]});
  const profile = studentProfile(fixture, fixture.students[0], [a1, a2]);
  const items = studentObservations(fixture, fixture.students[0], [a1, a2], profile);
  assert.equal(items[0].key, 'correction');
  assert.match(items[0].text, /1 道失分题未订正，1 道已提交待复核/);
  assert.deepEqual(items[0].evidence.filter(Boolean), ['待订正 1', '待复核 1']);
  assert.equal(items[1].key, 'lowest');
  assert.match(items[1].text, /2\.3/);
  assert.match(items[1].text, /40%.*比个人平均低/);
  assert.ok(items.length <= 3);
});

test('class observations report the weakest assignment, corrections and missing work', () => {
  const a1 = assignment('a1', {libraryUnit: '2.1'});
  const a2 = assignment('a2', {libraryUnit: '2.3'});
  const fixture = data({students: [student('s1'), student('s2')], assignments: [a1, a2], submissions: [
    {...graded('s1', 'x', 9, 10), assignmentId: 'a1'},
    {...graded('s2', 'y', 9, 10), assignmentId: 'a1'},
    {...graded('s1', 'z', 3, 10), assignmentId: 'a2'},
    {...graded('s2', 'w', 5, 10), assignmentId: 'a2'},
  ], mistakes: [
    {studentId: 's1', assignmentId: 'a2', questionId: 'q1', status: 'todo'},
    {studentId: 's2', assignmentId: 'a2', questionId: 'q1', status: 'todo'},
  ]});
  const rows = buildRows(fixture, fixture.students, [a1, a2]);
  const items = classObservations(fixture, rows, [a1, a2], overviewStats(rows, [a1, a2]));
  assert.equal(items[0].key, 'lowest');
  assert.match(items[0].text, /2\.3.*平均 40%.*低 25 个百分点/);
  assert.equal(items[1].key, 'correction');
  assert.match(items[1].text, /2 名学生共有 2 道题待订正/);
  const text = reportText('班级学情摘要', items, '2 人 · 2 次作业');
  assert.match(text, /^班级学情摘要\n1\. /);
  assert.match(text, /数据范围：2 人 · 2 次作业/);
  assert.match(text, /非 AI 结论/);
});

test('assignment diagnosis reports published count, choices and weak written questions', () => {
  const a1 = assignment('a1', {
    questions: [
      {id: 'q1', prompt: '选择题', type: 'choice', maxPoints: 1, knowledge: '2.3', options: [{label: 'A', text: '甲'}, {label: 'B', text: '乙'}, {label: 'C', text: '丙'}]},
      {id: 'q2', prompt: '简答题', type: 'short', maxPoints: 4, knowledge: 'FRQ 分析'},
    ],
  });
  const grade = (id, q1, q2, total) => ({id: `g-${id}`, studentId: id, assignmentId: 'a1', status: 'published', submittedAt: '2026-10-02T10:00:00Z', version: 1,
    choices: {q1: q1 ? 'A' : 'B'},
    publishedGrade: {total, maxPoints: 5, revision: 1, publishedAt: '2026-10-03T10:00:00Z', questions: [{id: 'q1', score: q1, maxPoints: 1, type: 'choice'}, {id: 'q2', score: q2, maxPoints: 4, type: 'short'}]}});
  const fixture = data({assignments: [a1], submissions: [grade('s1', 1, 3, 4), grade('s2', 0, 2, 2), grade('s3', 1, 4, 5)]});
  const [diag] = assignmentDiagnostics(fixture, [a1]);
  assert.equal(diag.published, 3);
  assert.equal(diag.average, 73.3);
  assert.deepEqual(diag.questions.map(item => item.id), ['q1', 'q2']);
  assert.deepEqual(diag.questions[0].distribution.map(item => [item.label, item.count]), [['A', 2], ['B', 1], ['C', 0]]);
  assert.equal(diag.questions[1].average, 3);
  assert.deepEqual(diag.weakWritten.map(item => item.id), ['q2']);
  assert.deepEqual(diag.knowledge.map(item => [item.knowledge, item.rate]), [['2.3', 66.7], ['FRQ 分析', 75]]);
});


test('class scope accepts bookself-class prefixes on either side', () => {
  const data = {
    students: [{ id: 's1', classIds: ['bookself-class:c1'] }],
    assignments: [{
      id: 'a1', title: 'A', published: true, dueAt: new Date(2026, 9, 10).toISOString(),
      classIds: ['bookself-class:c1'], audience: { students: [{ id: 's1', classIds: ['bookself-class:c1'] }] }, questions: []
    }],
    submissions: []
  };
  assert.deepEqual(scopedAssignments(data, { classId: 'c1' }).map(a => a.id), ['a1']);
  assert.equal(scopedStudents(data, { classId: 'c1', assignments: data.assignments }).length, 1);
  assert.deepEqual(scopedAssignments(data, { classId: 'bookself-class:c1' }).map(a => a.id), ['a1']);
});
