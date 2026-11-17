import {assert} from './validation.mjs';

// An empty teacher-entered score is an explicit latest result, never a fallback
// to an older attempt. Editing a total leaves question scores and answers intact.
export function editTeacherScore(submission, assignment, body, actor, at) {
  const previous = submission.publishedGrade;
  assert(Number(body.revision) === Number(previous ? previous.revision || 1 : 0), '成绩已在别处更新，请刷新后再修改', 409);
  assert(previous || submission.manualScoreEntry, '请先完成批阅并发布成绩', 409);
  const max = Number(previous?.maxPoints || assignment.maxPoints || (assignment.rubric || []).reduce((sum, q) => sum + Number(q.maxPoints || 0), 0));
  assert(Number.isFinite(max) && max > 0, '这份作业没有有效满分，请先检查作业设置', 400);
  const blank = body.score === null;
  assert(blank || typeof body.score === 'number' && Number.isFinite(body.score) && body.score >= 0 && body.score <= max, `请输入 0–${max} 之间的分数，或选择留空`, 400);
  const total = blank ? null : Math.round(body.score * 10) / 10;
  const next = structuredClone(submission);
  next.gradeHistory = [...(next.gradeHistory || []), ...(previous ? [structuredClone(previous)] : [])];
  next.publishedGrade = {
    ...(previous || {questions: [], scoreOnly: true, source: 'teacher-entry', publishedAt: at}),
    total, maxPoints: max, absent: blank, revision: Number(previous ? previous.revision || 1 : 0) + 1,
    manualTotal: true, updatedAt: at, updatedBy: actor,
  };
  next.updatedAt = at;
  return next;
}
