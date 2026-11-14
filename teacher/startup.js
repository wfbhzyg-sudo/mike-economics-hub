// These independently authorized reads can overlap. Keep no shared response
// cache: every page load still validates its current cookie and current classes.
export async function loadTeacherStartup(request, {homework = false} = {}) {
  const [session, metadata, homeworkSession] = await Promise.all([
    request('/api/portal/session'),
    request('/api/teacher-portal/core/teacher/workspace'),
    homework ? request('/api/homework/me').then(value => ({value}), error => ({error})) : null,
  ]);
  return {session, metadata, homeworkSession};
}
