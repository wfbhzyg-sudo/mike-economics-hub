import {scoreMaximum} from '../homework/score-entry.js';
import {assert} from './validation.mjs';

// An empty teacher-entered score is an explicit latest result, never a fallback
// to an older attempt. Editing a total leaves question scores and answers intact.
export function editTeacherScore(submission, assignment, body, actor, at) {
  const previous = submission.publishedGrade;
  assert(Number(body.revision) === Number(previous ? previous.revision || 1 : 0), '成绩已在别处更新，请刷新后再修改', 409);
  const max = body.maxPoints === undefined ? scoreMaximum({...assignment,maxPoints:previous?.maxPoints||assignment.maxPoints}) : body.maxPoints;
  assert(typeof max==='number' && Number.isFinite(max) && max > 0 && max<=1000000, '请填写大于 0 的满分，再保存成绩', 400);
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
  next.status = 'published';
  next.jobId = null; // A delayed worker result must not replace a teacher's explicit total.
  next.updatedAt = at;
  return next;
}
