// Deterministic facts + optional AI phrasing for teacher learning reports.
// The teacher always reviews a draft; nothing reaches a student before publish.
import {createHash} from 'node:crypto';
import {deepseek} from './ai.mjs';
import {assignmentLabel, buildRows, classObservations, formatPercent, overviewStats, scopedAssignments, scopedStudents, studentObservations, studentProfile, typeBreakdown} from '../homework/learning-analytics-model.js';

const OBS_MAX = 3;
const STEP_MAX = 3;
const TEXT_MAX = 120;

const clean = (value, max = TEXT_MAX) => {
  const text = String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(1, max - 1));
  const space = cut.lastIndexOf(' ');
  const base = space > max * 0.6 ? cut.slice(0, space) : cut;
  return base.replace(/[\s,;:.!?，；：。！？-]+$/, '') + '…';
};

const pct = value => value === null || value === undefined ? '暂无' : formatPercent(value);

export function insightScope({classId, unit = '', period = '4w', studentId = null}) {
  return {classId: String(classId || ''), unit: String(unit || ''), period: ['4w', 'term', 'all'].includes(period) ? period : '4w', studentId: studentId || null};
}

export function insightData({assignments, submissions, mistakes = [], students}) {
  return {
    students,
    assignments: assignments.map(a => ({...a, audience: {confirmedAt: a.recipients?.at || null, students: (a.recipients?.students || []).map(u => ({id: u.id, classIds: u.classIds || []}))}})),
    submissions,
    mistakes,
  };
}

// Rules version is part of the data version so a report generated under older
// fact-building rules is treated as stale instead of silently re-used.
const FACTS_RULES_VERSION = 2;
const sorted = (list, key = item => item.id) => list.slice().sort((a, b) => String(key(a)).localeCompare(String(key(b))));

export function insightVersion({scope, data}) {
  const scopeKey = {
    classId: scope.classId || '',
    unit: scope.unit || '',
    period: scope.period || '4w',
    studentId: scope.studentId || null,
  };
  const assignments = scopedAssignments(data, scope);
  const ids = new Set(assignments.map(a => a.id));
  const studentInScope = submission => !scope.studentId || submission.studentId === scope.studentId;
  const rows = sorted(assignments.map(a => ({
    id: a.id,
    version: a.version ?? null,
    published: a.published !== false,
    dueAt: a.dueAt || null,
    classIds: sorted(a.classIds || [], value => value),
    audience: a.audience ? {
      confirmedAt: a.audience.confirmedAt || null,
      students: sorted((a.audience.students || []).map(u => ({id: u.id, classIds: sorted(u.classIds || [], value => value)}))),
    } : null,
  })));
  const submissions = sorted(data.submissions
    .filter(s => ids.has(s.assignmentId) && studentInScope(s))
    .map(s => {
      const grade = s.publishedGrade;
      const questions = grade?.questionsSnapshot || grade?.rubricSnapshot || grade?.questions || [];
      return {
        id: s.id,
        assignmentId: s.assignmentId,
        studentId: s.studentId,
        status: s.status,
        version: s.version ?? null,
        submittedAt: s.submittedAt || null,
        updatedAt: s.updatedAt || null,
        total: grade?.total ?? null,
        maxPoints: grade?.maxPoints ?? null,
        revision: grade?.revision ?? null,
        publishedAt: grade?.publishedAt || null,
        questions: sorted(questions.map(q => ({
          id: q.id,
          score: Number.isFinite(q.score) ? q.score : null,
          maxPoints: Number.isFinite(q.maxPoints) ? q.maxPoints : null,
          type: q.type || null,
          knowledge: q.knowledge || null,
        }))),
      };
    }));
  const mistakes = sorted((data.mistakes || [])
    .filter(m => ids.has(m.assignmentId) && studentInScope(m))
    .map(m => ({
      id: m.id || null,
      assignmentId: m.assignmentId,
      studentId: m.studentId,
      questionId: m.questionId,
      status: m.status || null,
      note: m.note || null,
      revision: m.revision ?? null,
      corrections: sorted((m.corrections || []).map(c => ({id: c.id, text: c.text || null, createdAt: c.createdAt || null}))),
    })), m => `${m.assignmentId}:${m.studentId}:${m.questionId}`);
  return createHash('sha256').update(JSON.stringify({
    rulesVersion: FACTS_RULES_VERSION,
    scope: scopeKey,
    assignments: rows,
    submissions,
    mistakes,
  })).digest('hex').slice(0, 16);
}

function knowledgeFacts(data, assignments, studentIds) {
  const scores = new Map();
  for (const assignment of assignments) {
    for (const s of data.submissions) {
      if (s.assignmentId !== assignment.id || !studentIds.has(s.studentId)) continue;
      if (s.status === 'draft' || s.publishedGrade?.total === null || s.publishedGrade?.total === undefined) continue;
      for (const q of s.publishedGrade.questionsSnapshot || s.rubricSnapshot || s.publishedGrade.questions || []) {
        const tag = clean(q.knowledge, 40);
        if (!tag || !Number.isFinite(q.score) || !Number.isFinite(q.maxPoints) || !q.maxPoints) continue;
        const entry = scores.get(tag) || {score: 0, total: 0, graded: 0};
        entry.score += q.score;
        entry.total += q.maxPoints;
        entry.graded += 1;
        scores.set(tag, entry);
      }
    }
  }
  return [...scores.entries()]
    .filter(([, entry]) => entry.graded >= 3 && entry.total > 0)
    .map(([tag, entry]) => ({tag, rate: Math.round(entry.score / entry.total * 1000) / 10, graded: entry.graded}))
    .sort((a, b) => a.rate - b.rate || a.tag.localeCompare(b.tag))
    .slice(0, 3);
}

export function buildInsightFacts({scope, data}) {
  const assignments = scopedAssignments(data, scope);
  const roster = scopedStudents(data, {classId: scope.classId, assignments});
  const rows = scope.studentId
    ? roster.filter(student => student.id === scope.studentId)
    : buildRows(data, roster, assignments);
  if (scope.studentId && !rows.length) throw Object.assign(Error('该学生不在当前班级或没有作业记录'), {status: 404, code: 'STUDENT_NOT_FOUND'});
  const facts = [];
  const add = (id, label, text) => facts.push({id, label, text});
  if (scope.studentId) {
    const student = rows[0];
    const profile = studentProfile(data, student, assignments);
    const graded = profile.row.cells.filter(cell => cell.rate !== null);
    add('s.published', `${graded.length} 份已出分`, `已发布成绩 ${graded.length} 份，平均得分率 ${pct(profile.row.average)}。`);
    add('s.submitted', `完成 ${profile.row.submitted}/${profile.row.total}`, `应完成 ${profile.row.total} 次，已提交 ${profile.row.submitted} 次，未交 ${profile.row.missing} 次。`);
    add('s.corrections', `待订正 ${profile.openCorrections}`, `待订正 ${profile.openCorrections} 道，已提交待复核 ${profile.row.reviewing || 0} 道。`);
    if (graded.length >= 2) {
      const lowest = graded.reduce((worst, cell) => cell.rate < worst.rate ? cell : worst, graded[0]);
      add('s.lowest', `最低 ${assignmentLabel(lowest.assignment)}`, `最低一次是「${assignmentLabel(lowest.assignment)}」，得分率 ${pct(lowest.rate)}。`);
    }
    if (profile.row.trend !== null) add('s.trend', `近期变化 ${profile.row.trend > 0 ? '+' : ''}${profile.row.trend} 分`, `最近三次平均比更早三次${profile.row.trend >= 0 ? '高' : '低'} ${Math.abs(profile.row.trend)} 分。`);
    const types = typeBreakdown(data, student.id);
    if (types.choice.rate !== null) add('s.choice', `选择题 ${pct(types.choice.rate)}`, `选择题平均得分率 ${pct(types.choice.rate)}（${types.choice.questions} 题）。`);
    if (types.written.rate !== null) add('s.written', `书面题 ${pct(types.written.rate)}`, `书面题平均得分率 ${pct(types.written.rate)}（${types.written.questions} 题）。`);
    const weak = knowledgeFacts(data, assignments, new Set([student.id]));
    for (const [index, item] of weak.entries()) add(`k.${index}`, `${item.tag} ${pct(item.rate)}`, `知识标签「${item.tag}」得分率 ${pct(item.rate)}（${item.graded} 题次）。`);
    profile.weak.slice(0, 2).forEach((item, index) => add(`w.${index}`, clean(item.prompt, 24), `薄弱题：${clean(item.prompt, 60)}（得分率 ${pct(item.scoreRate ?? item.rate)}）。`));
    return {facts, data, assignments, rows, student, profile};
  }
  const stats = overviewStats(rows, assignments);
  add('c.students', `${stats.students} 名学生`, `本期范围 ${stats.students} 名学生、${stats.assignments} 次作业，已发布 ${stats.published} 份。`);
  add('c.average', `平均 ${pct(stats.average)}`, `班级平均得分率 ${pct(stats.average)}（仅计已发布成绩）。`);
  add('c.missing', `未交 ${stats.missing}`, `未交 ${stats.missing} 人次。`);
  add('c.review', `待复核 ${stats.needsReview}`, `${stats.needsReview} 份提交等待复核，暂不计入平均。`);
  const studentIds = new Set(rows.map(row => row.student.id));
  const corrections = (data.mistakes || []).filter(item => item.status === 'todo' && studentIds.has(item.studentId) && assignments.some(a => a.id === item.assignmentId));
  add('c.corrections', `待订正 ${corrections.length}`, `${new Set(corrections.map(item => item.studentId)).size} 名学生共有 ${corrections.length} 道题待订正。`);
  const per = assignments.map(assignment => {
    const rates = rows.map(row => row.cells.find(cell => cell.assignment.id === assignment.id)?.rate).filter(rate => rate !== null && rate !== undefined);
    return {assignment, graded: rates.length, average: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length * 10) / 10 : null};
  }).filter(entry => entry.graded >= 2);
  per.sort((a, b) => a.average - b.average);
  if (per[0] && stats.average !== null && stats.average - per[0].average >= 8) add('c.lowest', `最低 ${assignmentLabel(per[0].assignment)}`, `最低一次是「${assignmentLabel(per[0].assignment)}」，平均 ${pct(per[0].average)}。`);
  for (const [index, item] of knowledgeFacts(data, assignments, studentIds).entries()) add(`k.${index}`, `${item.tag} ${pct(item.rate)}`, `知识标签「${item.tag}」班级得分率 ${pct(item.rate)}（${item.graded} 题次）。`);
  return {facts, data, assignments, rows, stats};
}

function ruleItems(scope, built) {
  const items = scope.studentId
    ? studentObservations(built.data, built.student, built.assignments, built.profile)
    : classObservations(built.data, built.rows, built.assignments, built.stats);
  return items.map(item => ({text: clean(item.text), evidence: (item.evidence || []).map(value => clean(value, 24)).filter(Boolean).slice(0, 3)}));
}

export function ruleDraft(scope, built) {
  const observations = ruleItems(scope, built).slice(0, OBS_MAX);
  const weak = built.facts.filter(fact => fact.id.startsWith('k.') || fact.id.startsWith('w.')).slice(0, 2);
  const nextSteps = (weak.length ? weak : built.facts.slice(0, 2)).map(fact => ({
    text: scope.studentId
      ? `先复习「${fact.label}」，再完成对应错题的订正。`
      : `围绕「${fact.label}」安排一次 10 分钟全班回顾。`,
    evidence: [fact.label].slice(0, 2),
  }));
  return {
    observations,
    nextSteps: nextSteps.slice(0, STEP_MAX),
    limitations: scope.studentId
      ? '仅基于本范围内已发布成绩与订正记录；未提交与待复核不计入平均。'
      : '基于本范围已发布成绩的规则汇总；未提交与待复核不计入平均，不代表学生能力。',
    source: 'rules',
  };
}

export function sanitizeAiDraft(raw, facts) {
  const byId = new Map(facts.map(fact => [fact.id, fact]));
  const items = (list, max, textMax) => (Array.isArray(list) ? list : []).map(item => {
    const text = clean(item?.text, textMax);
    const evidence = [...new Set((Array.isArray(item?.evidence) ? item.evidence : []).map(value => String(value)).filter(value => byId.has(value)))].slice(0, 3).map(value => byId.get(value).label);
    return {text, evidence};
  }).filter(item => item.text.length >= 4 && item.evidence.length).slice(0, max);
  return {
    observations: items(raw?.observations, OBS_MAX, 100),
    nextSteps: items(raw?.nextSteps, STEP_MAX, 100),
    limitations: clean(raw?.limitations, 200) || '仅基于本范围已发布成绩；未交与待复核不计入平均。',
  };
}

function promptFor(scope, built) {
  const lines = built.facts.map(fact => `- ${fact.id}: ${fact.text}`).join('\n');
  return [
    {role: 'system', content: `你是经济学课程的教学助理。只可使用下面列出的事实写作，不得补充事实、不得点名或推断学生能力。用中文输出 JSON：{"observations":[{"text":"观察，最多80字","evidence":["事实ID"]}],"nextSteps":[{"text":"下一步建议，最多80字","evidence":["事实ID"]}],"limitations":"一句话说明数据边界"}。观察 2–3 条，下一步 1–2 条，每条至少引用一个事实ID，只可引用列出的 ID。`},
    {role: 'user', content: `范围：${scope.studentId ? '单个学生' : '班级'}；单元：${scope.unit || '全部'}；时间：${scope.period}。\n事实：\n${lines}`},
  ];
}

export async function draftInsight({db, decrypt, scope, built}) {
  const fallback = ruleDraft(scope, built);
  if (!db || !decrypt) return fallback;
  try {
    const raw = await deepseek(db, decrypt, promptFor(scope, built), {json: true, maxTokens: 1200});
    const clean = sanitizeAiDraft(raw, built.facts);
    if (clean.observations.length < 2 || !clean.nextSteps.length) return {...fallback, aiError: 'AI 结果未通过校验，已改用规则草稿'};
    return {...clean, source: 'ai'};
  } catch (error) {
    return {...fallback, aiError: clean(error.message, 120) || 'AI 暂不可用，已改用规则草稿'};
  }
}

export function canViewReport(report, user) {
  if (!report || !user) return false;
  if (report.teacherId === user.id) return true;
  return report.status === 'published' && report.audience?.kind === 'student' && report.audience.studentId === user.id;
}

export function publishTarget(report, body) {
  const confirm = body?.confirm === true;
  if (!confirm) throw Object.assign(Error('请先确认发布'), {status: 409, code: 'CONFIRM_REQUIRED'});
  if (report.scope.studentId) {
    if (body?.audience && body.audience !== 'student') throw Object.assign(Error('个人建议只能发布给该学生'), {status: 422});
    return {kind: 'student', studentId: report.scope.studentId};
  }
  if (body?.audience !== 'class') throw Object.assign(Error('班级汇总仅作为班级存档发布'), {status: 422});
  return {kind: 'class'};
}
