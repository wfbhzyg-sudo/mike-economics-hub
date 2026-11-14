import {assignmentState} from './learning-model.js';

// Course practice and the assignment centre must lead to the same next action.
export function studentAssignmentAction(assignment, submissions, time = Date.now()) {
  const info = assignmentState(assignment, submissions, time);
  const opensLater = !info.latest && assignmentOpensLater(assignment, time);
  const target = opensLater ? null : info.latest && info.latest.status !== 'returned' && !(info.draft && info.canSubmit)
    ? 'result/' + info.latest.id : 'submit/' + assignment.id;
  const action = opensLater ? '尚未开放' : info.key === 'done' ? '查看反馈' : info.key === 'processing' ? '查看进度'
    : info.draft || assignment.attemptProgress ? '继续作答' : info.latest?.status === 'returned' ? '补充作业' : '查看题目';
  return {info, target, action, opensLater, label:opensLater ? '尚未开放' : info.label};
}

// A future activity is not an actionable missing submission yet.
export function assignmentOpensLater(assignment, time = Date.now()) {
  return Boolean(assignment.opensAt && Date.parse(assignment.opensAt) > time);
}
