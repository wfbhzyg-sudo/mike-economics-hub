import {classKey} from './course-scope.js';

// Missing restrictions mean whole-class assignment, including legacy records.
export function audienceClasses(assignment, member) {
  const memberships = new Set((member.classIds || []).map(classKey));
  return (assignment.classIds || []).filter(id => {
    const key = classKey(id);
    const selected = assignment.individualRecipients?.[key];
    return memberships.has(key) && (!selected || selected.includes(member.id));
  });
}

export function audienceCount(assignment, classId) {
  return assignment.individualRecipients?.[classKey(classId)]?.length;
}
