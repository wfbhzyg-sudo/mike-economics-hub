// Shared workflow wording. Stored status identifiers and grade records are unchanged.
const submissionLabels = Object.freeze({
  draft: '草稿待提交', queued: '排队等待批阅', grading: '正在批阅',
  needs_review: '待教师复核', published: '已出分', returned: '需补充作答',
  failed: '批阅暂未完成',
});
export function submissionLabel(status, role = 'student') {
  if (status === 'needs_review' && role === 'teacher') return '待复核';
  return submissionLabels[status] || '状态待确认';
}
