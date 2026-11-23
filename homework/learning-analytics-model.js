// Pure aggregation for the teacher learning overview.
// Score, audience and neutral-status rules stay in grade-journey-model.js so the
// overview can never disagree with the existing gradebook.
import {visibleAssignments, cellsFor, cellSummary, progressChange, timeRange, inRange, workDate} from './grade-journey-model.js';
import {correctionCounts} from './learning-model.js';
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

const classKey = id => String(id || '').replace(/^bookself-class:/, '');
const inClass = (ids, classId) => (ids || []).some(id => classKey(id) === classKey(classId));

export function scopedAssignments(data, {classId = '', unit = '', period = 'all', assignmentId = ''} = {}, now = new Date()) {
  const range = periodRange(period, now);
  const all = visibleAssignments(data);
  return all.filter(assignment =>
    inRange(assignment, range) &&
    (!classId || inClass(assignment.classIds, classId)) &&
    (!unit || assignment.libraryUnit === unit) &&
    (!assignmentId || assignment.id === assignmentId));
}

// Current class members plus students whose publish-time audience snapshot belongs
// to this class. A shared assignment must not pull another class's students in, and
// a submission alone is not evidence of class membership without a snapshot.
export function scopedStudents(data, {classId = '', assignments = []} = {}) {
  if (!classId) return data.students.slice();
  const snapshot = new Map();
  for (const assignment of assignments) {
    for (const member of assignment.audience?.students || []) {
      if (!member?.id) continue;
      const classes = snapshot.get(member.id) || new Set();
      for (const id of member.classIds || []) classes.add(id);
      snapshot.set(member.id, classes);
    }
  }
  return data.students.filter(student =>
    inClass(student.classIds, classId) || Boolean([...snapshot.get(student.id) || []].some(id => classKey(id) === classKey(classId))));
}

// Short, stable matrix column label. The full title always stays in the tooltip.
export function assignmentLabel(assignment) {
  const title = String(assignment?.title || '').trim();
  const label = title || String(assignment?.libraryUnit || '').trim() || '作业';
  return label.length > 24 ? `${label.slice(0, 23)}…` : label;
}

function countsAsSubmitted(cell){
  if(cell.assignment.offline||cell.assignment.format==='score')return Number.isFinite(cell.record?.grade?.total);
  return Boolean(cell.record && !cell.record.latest.manualScoreEntry);
}

export function buildRows(data, students, assignments, scopeClass = '') {
  const scope = new Set(assignments.map(assignment => assignment.id));
  return students.map(student => {
    const cells = cellsFor(data, student, assignments, scopeClass);
    const summary = cellSummary(cells);
    const submitted = cells.filter(countsAsSubmitted).length;
    const published = cells.filter(cell => cell.rate !== null).length;
    const needsReview = cells.filter(cell => cell.record?.latest?.status === 'needs_review').length;
    const reviewing = cells.filter(cell => ['queued', 'grading'].includes(cell.record?.latest?.status)).length;
    const missing = cells.filter(cell => cell.status === 'missing').length;
    const attention = cells.filter(cell => cell.status === 'attention').length;
    const unconfirmed = cells.filter(cell => cell.status === 'unconfirmed').length;
    const openCorrections = (data.mistakes || []).filter(row => row.studentId === student.id && scope.has(row.assignmentId) && (row.progressStatus || row.status) === 'todo').length;
    const total = cells.filter(cell => cell.required || cell.record).length;
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
  const rates = [], firstRates=[], recoveryRates=[];
  let submitted = 0, published = 0, needsReview = 0, reviewing = 0, missing = 0, attention = 0;
  for (const row of rows) {
    for (const cell of row.cells) {
      if (countsAsSubmitted(cell)) submitted += 1;
      if (cell.rate !== null) { published += 1; rates.push(cell.rate); const g=cell.record.grade;firstRates.push((g.scoreSources?.first??g.total)/g.maxPoints*100);recoveryRates.push((g.scoreSources?.recovered??0)/g.maxPoints*100); }
      if (cell.record?.latest?.status === 'needs_review') needsReview += 1;
      if (['queued', 'grading'].includes(cell.record?.latest?.status)) reviewing += 1;
      if (cell.status === 'missing') missing += 1;
      if (cell.status === 'attention') attention += 1;
    }
  }
  return {
    students: rows.length, assignments: assignments.length,
    due: rows.reduce((sum,row)=>sum+row.total,0),
    submitted, published, needsReview, reviewing, missing, attention,
    firstAverage:firstRates.length?round1(mean(firstRates)):null, recoveryAverage:recoveryRates.length?round1(mean(recoveryRates)):null,
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
    let gradedCount = 0, correct = 0, answered = 0, scoreSum = 0, corrected = 0, recoveredPoints = 0;
    const counts = new Map();
    for (const submission of graded) {
      const hit = (submission.publishedGrade.questions || []).find(item => item.id === question.id);
      if (!hit || hit.score == null) continue;
      gradedCount += 1;
      scoreSum += Number(hit.score) || 0;
      if (hit.score >= hit.maxPoints) correct += 1;
      const added=submission.publishedGrade.scoreSources?.byQuestion?.[question.id]||0;
      recoveredPoints+=added;
      const verified=submission.publishedGrade.verifiedQuestionIds;
      if(hit.score<hit.maxPoints && (verified?verified.includes(question.id):added&&hit.score+added>=hit.maxPoints))corrected++;
      const sameVersion = assignment.version == null || submission.version === assignment.version;
      const choice = sameVersion ? submission.choices?.[question.id] : null;
      if (choice) { counts.set(choice, (counts.get(choice) || 0) + 1); answered += 1; }
    }
    const labels = (question.options || []).map(option => option.label);
    const base = labels.length ? labels : ['A', 'B', 'C', 'D', 'E'];
    // Keep the bars honest if a same-version paper recorded a label the current
    // options no longer list: count it instead of silently dropping the answer.
    const order = base.concat([...counts.keys()].filter(label => !base.includes(label)).sort());
    return {
      id: question.id, prompt: question.prompt || '', type: question.type || 'short',
      maxPoints: question.maxPoints, knowledge: question.knowledge || '',
      graded: gradedCount, correct, scoreSum: round1(scoreSum),
      rate: gradedCount ? round1(correct / gradedCount * 100) : null,
      corrected,recoveredPoints,afterRate:gradedCount?round1((correct+corrected)/gradedCount*100):null,
      average: gradedCount ? round1(scoreSum / gradedCount) : null,
      scoreRate: gradedCount && question.maxPoints ? round1(scoreSum / (gradedCount * question.maxPoints) * 100) : null,
      options: question.options || [], answered,
      questionImages: question.questionImages || [], paperLocation: question.paperLocation || null,
      correctOptions: question.correctOptions || [], sourcePages: question.sourcePages || '',
      distribution: order.map(label => ({label, count: counts.get(label) || 0})),
      unanswered: Math.max(0, gradedCount - answered),
    };
  });
  return {assignment, graded: graded.length, totalStudents: latest.size, questions};
}

function dateStamp(date) {
  const stamp = Date.parse(date);
  return Number.isFinite(stamp) ? stamp : -Infinity;
}

export function newestAssignmentFirst(a, b) {
  return dateStamp(workDate(b)) - dateStamp(workDate(a))
    || dateStamp(b.createdAt) - dateStamp(a.createdAt)
    || String(a.id).localeCompare(String(b.id));
}

export function orderedDiagnosisQuestions(questions, order) {
  const entries = questions.map((question, index) => ({question, index, rate: question.type === 'choice' ? question.rate : question.scoreRate}));
  if (order === 'asc' || order === 'desc') entries.sort((a,b) =>
    Number(a.rate == null) - Number(b.rate == null) ||
    (order === 'asc' ? a.rate - b.rate : b.rate - a.rate) || a.index - b.index);
  return entries;
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
    openCorrections: mistakes.filter(item => (item.progressStatus || item.status) === 'todo').length,
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

// ---------- report facts (deterministic, no model call) ----------
const pct = value => formatPercent(value);

function latestSubmitted(data, studentId, allowed) {
  const latest = new Map();
  for (const submission of data.submissions) {
    if (submission.studentId !== studentId || submission.status === 'draft' || (allowed && !allowed.has(submission.assignmentId))) continue;
    const previous = latest.get(submission.assignmentId);
    if (!previous || stampOf(submission) > stampOf(previous) || (stampOf(submission) === stampOf(previous) && submission.id > previous.id)) latest.set(submission.assignmentId, submission);
  }
  return latest;
}

// Split a student's published points by question type. Choice answers are scored
// automatically; written answers carry teacher-reviewed points in the same grade.
export function typeBreakdown(data, studentId, assignments) {
  const allowed=assignments && new Set(assignments.map(a=>a.id));
  const buckets = {choice: {score: 0, total: 0, questions: 0}, written: {score: 0, total: 0, questions: 0}};
  for (const submission of latestSubmitted(data, studentId, allowed).values()) {
    const grade = submission.publishedGrade;
    if (!grade || !Number.isFinite(grade.total)) continue;
    for (const question of grade.questions || []) {
      if (!(question.maxPoints > 0) || !Number.isFinite(question.score)) continue;
      const bucket = question.type === 'choice' ? buckets.choice : buckets.written;
      bucket.score += question.score;
      bucket.total += question.maxPoints;
      bucket.questions += 1;
    }
  }
  for (const bucket of Object.values(buckets)) bucket.rate = bucket.total ? round1(bucket.score / bucket.total * 100) : null;
  return buckets;
}

export function correctionSummary(data, studentId, assignments) {
  const scope = assignments && new Set(assignments.map(a => a.id));
  return correctionCounts((data.mistakes || []).filter(item => item.studentId === studentId && (!scope || scope.has(item.assignmentId))));
}

export function assignmentHistory(data, student, assignments) {
  return cellsFor(data, student, assignments)
    .slice()
    .sort((a, b) => workDate(b.assignment).localeCompare(workDate(a.assignment)) || String(b.assignment.id).localeCompare(String(a.assignment.id)));
}

// Up to three teacher-facing observations, each with the facts that produced it.
export function studentObservations(data, student, assignments, profile = studentProfile(data, student, assignments)) {
  const items = [];
  const row = profile.row;
  const corrections = correctionSummary(data, student.id, assignments);
  if (corrections.open > 0) {
    items.push({
      key: 'correction',
      text: `还有 ${corrections.open} 道失分题未订正${corrections.review ? `，${corrections.review} 道已提交订正` : ''}。`,
      evidence: [`待订正 ${corrections.open}`, corrections.review ? `已提交订正 ${corrections.review}` : ''],
    });
  }
  const graded = row.cells.filter(cell => cell.rate !== null);
  if (graded.length >= 2) {
    const lowest = graded.reduce((worst, cell) => (cell.rate < worst.rate ? cell : worst), graded[0]);
    const gap = round1(row.average - lowest.rate);
    if (gap >= 8) {
      items.push({
        key: 'lowest',
        text: `「${assignmentLabel(lowest.assignment)}」得分率 ${pct(lowest.rate)}，比个人平均低 ${gap} 个百分点。`,
        evidence: [assignmentLabel(lowest.assignment), `${lowest.rate}%`],
      });
    }
  }
  if (row.missing > 0) {
    items.push({key: 'missing', text: `有 ${row.missing} 次作业未交，补交会进入教师复核。`, evidence: [`未交 ${row.missing}`]});
  }
  if (row.trend !== null && Math.abs(row.trend) >= 3) {
    items.push({
      key: 'trend',
      text: `最近三次平均比更早三次${row.trend > 0 ? '高' : '低'} ${Math.abs(row.trend)} 分。`,
      evidence: [`近期变化 ${trendLabel(row.trend)}`],
    });
  }
  const types = typeBreakdown(data, student.id, assignments);
  if (types.choice.rate !== null && types.written.rate !== null && types.choice.questions >= 3 && types.written.questions >= 3) {
    const gap = round1(Math.abs(types.choice.rate - types.written.rate));
    if (gap >= 15) items.push({
      key: 'type',
      text: `选择题平均 ${pct(types.choice.rate)}%，书面题 ${pct(types.written.rate)}%，相差 ${gap} 个百分点。`,
      evidence: [`选择题 ${pct(types.choice.rate)}`, `书面题 ${pct(types.written.rate)}`],
    });
  }
  if (!items.length) items.push({key: 'steady', text: '本范围内没有待订正、待交或明显波动的记录。', evidence: [`已出分 ${row.published}/${row.total}`]});
  return items.slice(0, 3);
}

export function classObservations(data, rows, assignments, stats = overviewStats(rows, assignments)) {
  const items = [];
  const per = assignments.map(assignment => {
    const rates = rows.map(row => row.cells.find(cell => cell.assignment.id === assignment.id)).filter(cell => cell?.rate !== null && cell?.rate !== undefined).map(cell => cell.rate);
    return {assignment, graded: rates.length, average: rates.length ? round1(mean(rates)) : null};
  }).filter(entry => entry.graded >= 2 && entry.average !== null);
  per.sort((a, b) => a.average - b.average || String(a.assignment.id).localeCompare(String(b.assignment.id)));
  const lowest = per[0];
  if (lowest && stats.average !== null && round1(stats.average - lowest.average) >= 8) {
    items.push({
      key: 'lowest',
      text: `「${assignmentLabel(lowest.assignment)}」已发布 ${lowest.graded} 份，平均 ${pct(lowest.average)}，比本次范围平均（${pct(stats.average)}）低 ${round1(stats.average - lowest.average)} 个百分点。`,
      evidence: [assignmentLabel(lowest.assignment), `${lowest.graded} 份已发布`],
    });
  }
  const mistakes = (data.mistakes || []).filter(item => assignments.some(assignment => assignment.id === item.assignmentId));
  const open = mistakes.filter(item => (item.progressStatus || item.status) === 'todo');
  if (open.length) {
    const students = new Set(open.map(item => item.studentId)).size;
    items.push({key: 'correction', text: `${students} 名学生共有 ${open.length} 道题待订正。`, evidence: [`待订正 ${open.length} 题`]});
  }
  if (stats.missing > 0) {
    const students = rows.filter(row => row.missing > 0).length;
    items.push({key: 'missing', text: `${students} 名学生共 ${stats.missing} 人次未交。`, evidence: [`未交 ${stats.missing} 人次`]});
  }
  if (stats.needsReview > 0) {
    items.push({key: 'review', text: `${stats.needsReview} 份提交等待复核，暂不计入平均。`, evidence: [`待复核 ${stats.needsReview}`]});
  }
  if (!items.length) items.push({key: 'steady', text: `本次范围平均 ${pct(stats.average)}%，没有待订正或未交记录。`, evidence: [`${stats.students} 人`]});
  return items.slice(0, 3);
}

export function reportText(title, items, caption) {
  const lines = items.map((item, index) => `${index + 1}. ${item.text}`);
  return [title, ...lines, '', `数据范围：${caption}`, '规则摘要，基于已发布成绩统计，非 AI 结论。'].join('\n');
}

/**
 * Per-assignment diagnosis used by the teacher "作业诊断" tab: published count,
 * equal-weight average, per-question accuracy/distribution (via questionStats),
 * the weakest written-response questions and the weakest knowledge tags.
 */
export function assignmentDiagnostics(data, assignments) {
  return assignments.slice().sort(newestAssignmentFirst).map(assignment => {
    const stats = questionStats(data, assignment.id) || {graded: 0, questions: []};
    const questions = stats.questions.slice();
    const latest = new Map();
    for (const submission of data.submissions) {
      if (submission.assignmentId !== assignment.id || submission.status === 'draft') continue;
      const previous = latest.get(submission.studentId);
      if (!previous || stampOf(submission) > stampOf(previous)) latest.set(submission.studentId, submission);
    }
    const rates = [];
    for (const submission of latest.values()) {
      const grade = submission.publishedGrade;
      if (!grade || !Number.isFinite(grade.total) || !grade.maxPoints) continue;
      rates.push(grade.total / grade.maxPoints * 100);
    }
    const average = rates.length ? round1(rates.reduce((sum, value) => sum + value, 0) / rates.length) : null;
    const weakWritten = questions
      .filter(question => question.type !== 'choice' && question.scoreRate !== null && question.graded >= 2)
      .sort((a, b) => a.scoreRate - b.scoreRate)
      .slice(0, 3);
    const byKnowledge = new Map();
    for (const question of questions) {
      const knowledge = (question.knowledge || '').trim();
      if (!knowledge || !question.graded) continue;
      const entry = byKnowledge.get(knowledge) || {knowledge, graded: 0, score: 0, max: 0};
      entry.graded += question.graded;
      entry.score += question.scoreSum;
      entry.max += question.maxPoints * question.graded;
      byKnowledge.set(knowledge, entry);
    }
    const knowledge = [...byKnowledge.values()]
      .filter(entry => entry.graded >= 3)
      .map(entry => ({knowledge: entry.knowledge, graded: entry.graded, rate: entry.max ? round1(entry.score / entry.max * 100) : null}))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 4);
    return {assignment, published: stats.graded, totalStudents: stats.totalStudents, average, questions, weakWritten, knowledge};
  });
}
