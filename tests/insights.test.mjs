import test from 'node:test';
import assert from 'node:assert/strict';
import {buildInsightFacts, canViewReport, draftInsight, insightData, insightScope, insightVersion, publishTarget, ruleDraft, sanitizeAiDraft} from '../homework-server/insights.mjs';

const day = offset => new Date(Date.now() + offset * 86400000).toISOString();

function fixture() {
  const students = [{id: 'u1', name: '学生一', classIds: ['c1']}, {id: 'u2', name: '学生二', classIds: ['c1']}];
  const assignments = [
    {id: 'a1', title: 'Quiz 01', classIds: ['c1'], published: true, dueAt: day(-6), version: 2, format: 'mcq', libraryUnit: 'Unit 2',
      questions: [{id: 'q1', prompt: '供给曲线移动', maxPoints: 5, type: 'choice', knowledge: '2.1 供给', options: [{label: 'A', text: 'a'}]}],
      recipients: {at: day(-8), students: [{id: 'u1', classIds: ['c1']}, {id: 'u2', classIds: ['c1']}]}},
    {id: 'a2', title: 'FRQ 01', classIds: ['c1'], published: true, dueAt: day(-2), version: 3, format: 'upload', libraryUnit: 'Unit 2',
      questions: [{id: 'r1', prompt: '税收归宿分析', maxPoints: 5, type: 'short', knowledge: '2.3 税收'}],
      recipients: {at: day(-8), students: [{id: 'u1', classIds: ['c1']}, {id: 'u2', classIds: ['c1']}]}},
  ];
  const submissions = [
    {id: 's1', assignmentId: 'a1', studentId: 'u1', status: 'published', submittedAt: day(-5), updatedAt: day(-5),
      publishedGrade: {total: 12, maxPoints: 15, questions: [
        {id: 'q1', score: 4, maxPoints: 5, type: 'choice', knowledge: '2.1 供给'},
        {id: 'q2', score: 4, maxPoints: 5, type: 'choice', knowledge: '2.1 供给'},
        {id: 'q3', score: 4, maxPoints: 5, type: 'choice', knowledge: '2.1 供给'}]}},
    {id: 's2', assignmentId: 'a2', studentId: 'u1', status: 'published', submittedAt: day(-1), updatedAt: day(-1),
      publishedGrade: {total: 9, maxPoints: 15, questions: [
        {id: 'r1', score: 3, maxPoints: 5, type: 'short', knowledge: '2.3 税收'},
        {id: 'r2', score: 3, maxPoints: 5, type: 'short', knowledge: '2.3 税收'},
        {id: 'r3', score: 3, maxPoints: 5, type: 'short', knowledge: '2.3 税收'}]}},
    {id: 's3', assignmentId: 'a1', studentId: 'u2', status: 'needs_review', submittedAt: day(-4), updatedAt: day(-4), publishedGrade: null},
  ];
  const mistakes = [{assignmentId: 'a1', studentId: 'u1', questionId: 'q1', status: 'todo'}];
  return insightData({assignments, submissions, mistakes, students});
}

test('personal facts include published count and version is stable', () => {
  const data = fixture();
  const scope = insightScope({classId: 'c1', unit: 'Unit 2', period: 'all', studentId: 'u1'});
  const built = buildInsightFacts({scope, data});
  assert.deepEqual(built.rows.map(row => row.id), ['u1']);
  const texts = built.facts.map(fact => fact.text).join('\n');
  assert.match(texts, /已发布成绩 2 份/);
  assert.match(texts, /未交 0 次/);
  assert.match(texts, /知识标签「2.1 供给」/);
  const first = insightVersion({scope, data});
  assert.equal(first, insightVersion({scope, data}));
  const changed = fixture();
  changed.submissions[0].submittedAt = day(-3);
  assert.notEqual(first, insightVersion({scope, data: changed}));
});

test('class facts summarize assignments and corrections without names', () => {
  const data = fixture();
  const scope = insightScope({classId: 'c1', unit: 'Unit 2', period: 'all'});
  const built = buildInsightFacts({scope, data});
  assert.equal(built.rows.length, 2);
  const texts = built.facts.map(fact => fact.text).join('\n');
  assert.match(texts, /2 名学生/);
  assert.match(texts, /道题待订正/);
  assert.ok(!texts.includes('学生一') && !texts.includes('学生二'));
});

test('rule draft is always available and actionable', () => {
  const data = fixture();
  for (const studentId of [null, 'u1']) {
    const scope = insightScope({classId: 'c1', unit: 'Unit 2', period: 'all', studentId});
    const built = buildInsightFacts({scope, data});
    const draft = ruleDraft(scope, built);
    assert.equal(draft.source, 'rules');
    assert.ok(draft.observations.length >= 1 && draft.observations.length <= 3);
    assert.ok(draft.nextSteps.length >= 1);
    assert.ok(draft.observations.every(item => item.evidence.length >= 1));
  }
});

test('AI drafts are sanitized: unknown evidence dropped, HTML and length capped', () => {
  const data = fixture();
  const scope = insightScope({classId: 'c1', unit: '', period: 'all', studentId: 'u1'});
  const built = buildInsightFacts({scope, data});
  const draft = sanitizeAiDraft({
    observations: [
      {text: '<b>最近一次</b>有进步，继续完成订正。', evidence: ['s.lowest', 'bogus']},
      {text: '没有证据的观察', evidence: ['nope']},
      {text: 'x'.repeat(300), evidence: ['s.published']},
    ],
    nextSteps: [{text: '复习「2.3 税收」并重做错题。', evidence: ['k.0']}],
    limitations: '<i>仅基于已发布成绩</i>',
  }, built.facts);
  assert.equal(draft.observations.length, 2);
  assert.ok(!draft.observations[0].text.includes('<'));
  assert.ok(draft.observations[0].text.length <= 100);
  assert.deepEqual(draft.observations[1].evidence, ['2 份已出分']);
  assert.deepEqual(draft.nextSteps[0].evidence, ['2.3 税收 60%']);
  assert.equal(draft.limitations, '仅基于已发布成绩');
});

test('draft falls back to rules when the AI call is unavailable', async () => {
  const data = fixture();
  const scope = insightScope({classId: 'c1', unit: 'Unit 2', period: 'all', studentId: 'u1'});
  const built = buildInsightFacts({scope, data});
  const draft = await draftInsight({db: {get: async () => ({})}, decrypt: () => 'x', scope, built});
  assert.equal(draft.source, 'rules');
  assert.match(draft.aiError, /DeepSeek|API|Key|启用/i);
});

test('publish requires explicit confirmation and a matching audience', () => {
  const personal = {scope: {studentId: 'u1'}};
  const classReport = {scope: {studentId: null}};
  assert.throws(() => publishTarget(personal, {}), error => error.code === 'CONFIRM_REQUIRED');
  assert.deepEqual(publishTarget(personal, {confirm: true}), {kind: 'student', studentId: 'u1'});
  assert.deepEqual(publishTarget(classReport, {confirm: true, audience: 'class'}), {kind: 'class'});
  assert.throws(() => publishTarget(classReport, {confirm: true}), error => error.status === 422);
});

test('published personal reports are visible to that student only', () => {
  const report = {teacherId: 't1', status: 'published', audience: {kind: 'student', studentId: 'u1'}};
  assert.equal(canViewReport(report, {id: 't1'}), true);
  assert.equal(canViewReport(report, {id: 'u1'}), true);
  assert.equal(canViewReport(report, {id: 'u2'}), false);
  assert.equal(canViewReport({...report, status: 'draft'}, {id: 'u1'}), false);
  assert.equal(canViewReport({...report, audience: {kind: 'class'}}, {id: 'u1'}), false);
});
