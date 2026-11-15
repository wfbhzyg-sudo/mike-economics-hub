import {assignmentRecords, assignmentState} from './learning-model.js';
import {studentAssignmentAction} from './assignment-navigation.js';

const DAY = 86400000;

function titleOf(assignment) {
  return assignment?.title || '作业';
}

function rateOf(grade) {
  if (!grade || !(grade.maxPoints > 0) || !Number.isFinite(grade.total)) return null;
  return Math.round((grade.total / grade.maxPoints) * 1000) / 10;
}

function workDate(a) {
  return Date.parse(a.dueAt || a.createdAt || '') || Infinity;
}

function answeredQuestions(assignment, submission) {
  const total = Array.isArray(assignment.questions) ? assignment.questions.length : 0;
  let answered = 0;
  if (submission) {
    answered += Object.keys(submission.choices || {}).length;
    if (submission.text && String(submission.text).trim()) answered += 1;
  }
  if (Number.isFinite(Number(assignment.attemptProgress))) {
    answered = Math.max(answered, Number(assignment.attemptProgress));
  }
  return {answered: total ? Math.min(answered, total) : answered, total};
}

// The one assignment a student should act on first: a saved draft, then the nearest deadline.
export function nextAssignment(assignments, submissions, now = Date.now()) {
  const open = assignments
    .filter(a => a.published !== false && !a.deletedAt)
    .map(a => ({assignment: a, state: assignmentState(a, submissions, now)}))
    .filter(({state}) => state.key === 'todo' || state.key === 'processing');
  open.sort((a, b) => {
    const ad = a.state.draft || a.assignment.attemptProgress ? 1 : 0;
    const bd = b.state.draft || b.assignment.attemptProgress ? 1 : 0;
    return bd - ad || workDate(a.assignment) - workDate(b.assignment);
  });
  if (!open.length) return null;
  const {assignment, state} = open[0];
  const action = studentAssignmentAction(assignment, submissions, now);
  return {
    assignment,
    state,
    action: action.action,
    target: action.target,
    progress: answeredQuestions(assignment, state.draft),
  };
}

export function correctionCounts(mistakes = []) {
  const counts = {open: 0, review: 0, mastered: 0, total: mistakes.length};
  for (const mistake of mistakes) {
    if (mistake.status === 'mastered') counts.mastered += 1;
    else if (mistake.status === 'review') counts.review += 1;
    else counts.open += 1;
  }
  return counts;
}

export function recentResults(assignments, submissions, limit = 3) {
  return assignmentRecords(submissions, assignments)
    .filter(record => record.grade)
    .map(record => ({
      assignment: record.assignment,
      rate: rateOf(record.grade),
      score: record.grade.total,
      total: record.grade.maxPoints,
      when: record.effective?.publishedAt || record.latest?.submittedAt || '',
    }))
    .sort((a, b) => String(b.when).localeCompare(String(a.when)))
    .slice(0, limit);
}

// Keep the trail around the unit the student is working on now.
export function unitTrail(assignments, submissions, next, now = Date.now()) {
  const visible = assignments
    .filter(a => a.published !== false && !a.deletedAt)
    .slice()
    .sort((a, b) => workDate(a) - workDate(b));
  const unit = next?.assignment?.libraryUnit || next?.assignment?.course || '';
  const items = visible
    .filter(a => (unit ? (a.libraryUnit || a.course || '') === unit : true))
    .slice(-8)
    .map(assignment => {
      const state = assignmentState(assignment, submissions, now);
      const record = assignmentRecords(
        submissions.filter(s => s.assignmentId === assignment.id), [assignment])[0];
      return {assignment, key: state.key, label: state.label, rate: rateOf(record?.grade)};
    });
  return {unit, items};
}

export function learningReminders({next, corrections, recent, now = Date.now()}) {
  const out = [];
  if (corrections.open > 0) {
    out.push(`有 ${corrections.open} 道失分题等待订正；订正不会改变原成绩。`);
  }
  if (next) {
    const due = Date.parse(next.assignment.dueAt || '');
    if (Number.isFinite(due)) {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const target = new Date(due); target.setHours(0, 0, 0, 0);
      const days = Math.round((target - start) / DAY);
      const when = due < now ? '已过截止' : days <= 0 ? '今天截止'
        : days === 1 ? '明天截止' : `还有 ${days} 天截止`;
      out.push(`《${titleOf(next.assignment)}》${when}，${next.progress.total
        ? `已保存 ${next.progress.answered}/${next.progress.total} 题。`
        : '尚未保存作答。'}`);
    } else if (next.state.key === 'todo') {
      out.push(`《${titleOf(next.assignment)}》还没有提交。`);
    }
  }
  if (recent.length >= 2 && recent[0].rate != null && recent[1].rate != null) {
    const delta = Math.round((recent[0].rate - recent[1].rate) * 10) / 10;
    out.push(`最近一次《${titleOf(recent[0].assignment)}》得分率 ${recent[0].rate}%，`
      + (delta === 0 ? '与上一次持平。' : `比上一次${delta > 0 ? '高' : '低'} ${Math.abs(delta)} 个百分点。`));
  }
  if (!out.length) {
    out.push(recent.length ? '最近的作业都已完成，可以从成绩页回看原题与订正。'
      : '老师发布作业后，这里会显示最近截止与学习提醒。');
  }
  return out.slice(0, 3);
}

export function studentHomeSummary({assignments = [], submissions = [], mistakes = [], now = Date.now()}) {
  const next = nextAssignment(assignments, submissions, now);
  const corrections = correctionCounts(mistakes);
  const recent = recentResults(assignments, submissions);
  return {
    next,
    corrections,
    recent,
    trail: unitTrail(assignments, submissions, next, now),
    reminders: learningReminders({next, corrections, recent, now}),
  };
}
