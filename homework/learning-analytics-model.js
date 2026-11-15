// Pure aggregation for the teacher learning overview.
// Score, audience and neutral-status rules stay in grade-journey-model.js so the
// overview can never disagree with the existing gradebook.
import {visibleAssignments, cellsFor, cellSummary, progressChange, timeRange, inRange, workDate} from './grade-journey-model.js';
import {scoreBand} from './score-bands.js';

export const PERIODS = [['4w', '最近四周'], ['term', '本学期'], ['all', '全部时间']];
export const STATUS_FILTERS = [['all', '全部学生'], ['missing', '有未交'], ['review', '有待复核'], ['attention', '需要关注']];
const TYPES = {mcq: 'MCQ', frq: 'FRQ', short: '简答', choice: '选择'};
const round1 = value => Math.round(value * 10) / 10;
const mean = list => list.reduce((sum, value) => sum + value, 0) / list.length;
const dayString = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const stampOf = row => row?.submittedAt || row?.createdAt || '';

// A stable, testable calendar window. "最近四周" means the last 28 days including today.
export function periodRange(period, now = new Date()) {
  if (period === '4w') {
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(end.getTime());
    start.setDate(start.getDate() - 27);
    return {from: dayString(start), to: dayString(end)};
  }
  if (period === 'term') return timeRange('term', '', '', now);
  return {from: '', to: ''};
}

export function scopedAssignments(data, {classId = '', unit = '', period = 'all', assignmentId = ''} = {}, now = new Date()) {
  const range = periodRange(period, now);
  const all = visibleAssignments(data);
  return all.filter(assignment =>
    inRange(assignment, range) &&
    (!classId || assignment.classIds?.includes(classId)) &&
    (!unit || assignment.libraryUnit === unit) &&
    (!assignmentId || assignment.id === assignmentId));
}

// Mirrors the gradebook audience rule: current class members plus anyone with work
// in scope, so historical students never disappear from an existing report.
export function scopedStudents(data, {classId = '', assignments = []} = {}) {
  const inScope = new Set(assignments.map(assignment => assignment.id));
  return data.students.filter(student =>
    !classId ||
    student.classIds?.includes(classId) ||
    assignments.some(assignment => assignment.audience?.students?.some(member => member.id === student.id)) ||
    data.submissions.some(submission => submission.studentId === student.id && inScope.has(submission.assignmentId)));
}

// Short, stable matrix column label. The full title always stays in the tooltip.
export function assignmentLabel(assignment) {
  const title = String(assignment?.title || '').trim();
  const type = TYPES[assignment?.format] || '';
  const unit = String(assignment?.libraryUnit || '').trim();
  if (unit && type) return `${unit} ${type}`;
  if (unit) return unit;
  const stripped = title.replace(/^Unit\s*[\d.]+\s*[-–—:·]?\s*/i, '').trim() || title || '作业';
  return stripped.length > 12 ? `${stripped.slice(0, 11)}…` : stripped;
}

export function buildRows(data, students, assignments) {
  const scope = new Set(assignments.map(assignment => assignment.id));
  return students.map(student => {
    const cells = cellsFor(data, student, assignments);
    const summary = cellSummary(cells);
    const submitted = cells.filter(cell => cell.record).length;
    const published = cells.filter(cell => cell.rate !== null).length;
    const needsReview = cells.filter(cell => cell.record?.latest?.status === 'needs_review').length;
    const reviewing = cells.filter(cell => ['queued', 'grading'].includes(cell.record?.latest?.status)).length;
    const missing = cells.filter(cell => cell.status === 'missing').length;
    const attention = cells.filter(cell => cell.status === 'attention').length;
    const unconfirmed = cells.filter(cell => cell.status === 'unconfirmed').length;
    const openCorrections = (data.mistakes || []).filter(row => row.studentId === student.id && scope.has(row.assignmentId) && row.status === 'todo').length;
    const total = cells.length;
    const average = summary.average;
    return {
      student, cells, summary, average, total, submitted, published, needsReview, reviewing,
      missing, attention, unconfirmed, openCorrections,
      completion: total ? round1(submitted / total * 100) : 0,
      publishedPercent: total ? round1(published / total * 100) : 0,
      band: average === null ? null : scoreBand(average),
      trend: progressChange(cells),
    };
  });
}

export function overviewStats(rows, assignments) {
  const rates = [];
  let submitted = 0, published = 0, needsReview = 0, reviewing = 0, missing = 0, attention = 0;
  for (const row of rows) {
    for (const cell of row.cells) {
      if (cell.record) submitted += 1;
      if (cell.rate !== null) { published += 1; rates.push(cell.rate); }
      if (cell.record?.latest?.status === 'needs_review') needsReview += 1;
      if (['queued', 'grading'].includes(cell.record?.latest?.status)) reviewing += 1;
      if (cell.status === 'missing') missing += 1;
      if (cell.status === 'attention') attention += 1;
    }
  }
  return {
    students: rows.length, assignments: assignments.length,
    due: rows.length * assignments.length,
    submitted, published, needsReview, reviewing, missing, attention,
    average: rates.length ? round1(mean(rates)) : null,
    withWork: rows.filter(row => row.submitted > 0).length,
  };
}

// Per-question class result for the detail panel. Latest non-draft attempt per
// student; option counts only when that attempt matches the published version.
export function questionStats(data, assignmentId) {
  const assignment = data.assignments.find(item => item.id === assignmentId);
  if (!assignment) return null;
  const latest = new Map();
  for (const submission of data.submissions) {
    if (submission.assignmentId !== assignmentId || submission.status === 'draft') continue;
    const previous = latest.get(submission.studentId);
    if (!previous || stampOf(submission) > stampOf(previous) || (stampOf(submission) === stampOf(previous) && submission.id > previous.id)) latest.set(submission.studentId, submission);
  }
  const graded = [...latest.values()].filter(submission => submission.publishedGrade && Number.isFinite(submission.publishedGrade.total));
  const questions = (assignment.questions || []).map(question => {
    let gradedCount = 0, correct = 0, answered = 0;
    const counts = new Map();
    for (const submission of graded) {
      const hit = (submission.publishedGrade.questions || []).find(item => item.id === question.id);
      if (!hit || hit.score == null) continue;
      gradedCount += 1;
      if (hit.score >= hit.maxPoints) correct += 1;
      const sameVersion = assignment.version == null || submission.version === assignment.version;
      const choice = sameVersion ? submission.choices?.[question.id] : null;
      if (choice) { counts.set(choice, (counts.get(choice) || 0) + 1); answered += 1; }
    }
    const labels = (question.options || []).map(option => option.label);
    const order = labels.length ? labels : ['A', 'B', 'C', 'D', 'E'];
    return {
      id: question.id, prompt: question.prompt || '', type: question.type || 'short',
      maxPoints: question.maxPoints, knowledge: question.knowledge || '',
      graded: gradedCount, correct, rate: gradedCount ? round1(correct / gradedCount * 100) : null,
      options: question.options || [], answered,
      distribution: order.map(label => ({label, count: counts.get(label) || 0})),
      unanswered: Math.max(0, gradedCount - answered),
    };
  });
  return {assignment, graded: graded.length, totalStudents: latest.size, questions};
}

export function questionById(stats, questionId) {
  return stats?.questions?.find(question => question.id === questionId) || null;
}

export function studentProfile(data, student, assignments) {
  const row = buildRows(data, [student], assignments)[0];
  const scope = new Set(assignments.map(assignment => assignment.id));
  const mistakes = (data.mistakes || []).filter(item => item.studentId === student.id && scope.has(item.assignmentId));
  const weak = mistakes
    .filter(item => item.maxPoints > 0)
    .sort((a, b) => (a.score / a.maxPoints) - (b.score / b.maxPoints) || String(a.questionId).localeCompare(String(b.questionId)))
    .slice(0, 6);
  return {
    row,
    recent: row.cells.filter(cell => cell.rate !== null).slice(-8).reverse(),
    weak,
    mistakes: mistakes.length,
    openCorrections: mistakes.filter(item => item.status === 'todo').length,
  };
}

export function rowStatus(row) {
  if (!row.total) return {key: 'none', label: '无作业'};
  if (row.missing > 0 && row.completion < 60) return {key: 'incomplete', label: '未完成'};
  if (row.openCorrections > 0 && row.missing === 0 && row.needsReview === 0) return {key: 'correction', label: `待订正 ${row.openCorrections}`};
  if (row.missing > 0) return {key: 'missing', label: `待交 ${row.missing}`};
  if (row.needsReview > 0) return {key: 'review', label: '待复核'};
  if (row.published === row.total) return {key: 'done', label: '已出分'};
  if (row.submitted === row.total) return {key: 'progress', label: '待出分'};
  return {key: 'progress', label: '进行中'};
}

export function formatPercent(value) {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : `${Math.round(value)}%`;
}

export function trendLabel(change) {
  if (change === null || change === undefined) return '';
  return `${change > 0 ? '+' : ''}${round1(change)}`;
}

export function unitsOf(assignments) {
  return [...new Set(assignments.map(assignment => assignment.libraryUnit).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'en', {numeric: true}));
}

export function scopeCaption(stats) {
  return `${stats.students} 人 · ${stats.assignments} 次作业 · 平均仅计已发布成绩`;
}

export {workDate};
