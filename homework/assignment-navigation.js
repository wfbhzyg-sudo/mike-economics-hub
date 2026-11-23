import {assignmentState} from './learning-model.js';

// Course practice and the assignment centre must lead to the same next action.
export function studentAssignmentAction(assignment, submissions, time = Date.now()) {
  const info = assignmentState(assignment, submissions, time);
  const offline = Boolean(assignment.offline||assignment.format==='score');
  const opensLater = !info.latest && assignmentOpensLater(assignment, time);
  if(offline && info.canSubmit){
    return {info,target:(assignment.makeupMode==='questions'?'mcq/':'submit/')+assignment.id,action:info.draft||assignment.attemptProgress?'继续补交':'补交作业',opensLater,label:info.label};
  }
  if(offline && info.key==='processing')return {info,target:'result/'+info.latest.id,action:'查看提交',opensLater,label:info.label};
  const target = offline ? (info.key==='done' ? 'result/'+info.latest.id : null)
    : opensLater ? null : info.latest && info.latest.status !== 'returned' && !(info.draft && info.canSubmit)
    ? 'result/' + info.latest.id : 'submit/' + assignment.id;
  const action = offline ? (info.key==='done' ? '查看成绩' : '等待老师录分')
    : opensLater ? '尚未开放' : info.key === 'done' ? '查看成绩' : info.key === 'processing' ? '查看进度'
    : info.draft || assignment.attemptProgress ? '继续作答' : info.latest?.status === 'returned' ? '补充作业' : '查看题目';
  return {info, target, action, opensLater, label:offline ? info.label : opensLater ? '尚未开放' : info.label};
}

// A future activity is not an actionable missing submission yet.
export function assignmentOpensLater(assignment, time = Date.now()) {
  return Boolean(assignment.opensAt && Date.parse(assignment.opensAt) > time);
}

export function publicationTime(a) {
  if (!a.published) return null;
  // Imported paper assignments use the original classroom date. An import, edit
  // or deadline is not evidence of when a teacher distributed the assignment.
  const value = a.publishedAt || ((a.offline || a.format === 'score') && a.opensAt);
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
}

export function byPublication(assignments, order = 'desc') {
  return assignments.map(a => ({a, time: publicationTime(a)})).sort((left, right) => {
    if (Boolean(left.a.published) !== Boolean(right.a.published)) return left.a.published ? -1 : 1;
    if (!left.a.published) return 0;
    if (left.time === null && right.time !== null) return 1;
    if (right.time === null && left.time !== null) return -1;
    const delta = left.time - right.time;
    return (order === 'asc' ? delta : -delta) || left.a.id.localeCompare(right.a.id);
  }).map(item => item.a);
}
