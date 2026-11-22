export function studentReportUrl(student, {classId, unit, period, assignmentId} = {}) {
  const query = new URLSearchParams({student});
  for (const [key, value] of Object.entries({class:classId, period, unit, assignment:assignmentId})) {
    if (value) query.set(key, value);
  }
  return '/api/homework/learning/student-report?' + query;
}
