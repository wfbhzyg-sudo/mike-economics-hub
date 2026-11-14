// Only fetch collections a route actually reads. Every visit is fresh: there is
// no response cache, so returning after a publish, transfer or review reloads it.
export function workspaceCollections(route = 'assignments') {
  const [page, detail] = route.split('/');
  if (['library', 'mcq', 'mcq-analysis', 'device', 'trash', 'paper', 'grades',
    'history', 'gradebook', 'mistakes', 'overview'].includes(page)) return [];
  if (page === 'new' && detail !== 'upload') return [];
  if (['new', 'edit', 'answer', 'mcq-import', 'account'].includes(page)) return ['classes'];
  return ['assignments', 'submissions', 'classes'];
}

export async function loadWorkspaceData(api, route, classId = '') {
  const collections = workspaceCollections(route);
  const values = await Promise.all(collections.map(async key => [key, (await api(key))[key]]));
  const data = {assignments: [], submissions: [], classes: [], ...Object.fromEntries(values)};
  if (classId) {
    const id = 'bookself-class:' + classId;
    data.assignments = data.assignments.filter(a => a.classIds.includes(id));
    const assignments = new Set(data.assignments.map(a => a.id));
    data.submissions = data.submissions.filter(s => assignments.has(s.assignmentId));
  }
  return data;
}
