import {audienceClasses} from '../homework/assignment-audience.js';
import {classKey} from '../homework/course-scope.js';
import {assert} from './validation.mjs';

export function assignmentAudience(input, classes, students, {allowEmpty = false, priorRecipients = {}} = {}) {
  const available = new Map(classes.map(c => [classKey(c.id), c.id]));
  assert(Array.isArray(input.classIds) && input.classIds.every(id => typeof id === 'string' && available.has(classKey(id))), '请选择自己的班级');
  const keys = [...new Set(input.classIds.map(classKey))];
  assert(allowEmpty || keys.length > 0, '请选择至少一个班级或学生');
  const requested = input.individualRecipients ?? {};
  assert(requested && typeof requested === 'object' && !Array.isArray(requested), '学生名单格式不正确');
  const roster = new Map(students.map(s => [s.id, new Set((s.classIds || []).map(classKey))]));
  const entries = Object.entries(requested).map(([key, ids]) => {
    assert(keys.includes(key) && Array.isArray(ids) && (allowEmpty || ids.length > 0), '请为选中的班级至少选择一名学生');
    assert(ids.every(id => typeof id === 'string' && (roster.get(id)?.has(key) || priorRecipients[key]?.includes(id))), '学生不在所选班级，请重新检查名单');
    return [key, [...new Set(ids)]];
  });
  return {classIds: keys.map(key => available.get(key)), individualRecipients: Object.fromEntries(entries)};
}

export function studentCanAccessAssignment(assignment, student) {
  return Boolean(assignment.published && !assignment.deletedAt && audienceClasses(assignment, student).length);
}

// The predicate is also used in SQL projections so unauthorized work never enters
// the student's desk feed and does not count as missing in their teacher report.
export const audienceSql = (classes, student) => `EXISTS (
  SELECT 1 FROM jsonb_array_elements_text(data->'classIds') cid
  WHERE regexp_replace(cid, '^bookself-class:', '')=ANY(${classes}::text[])
    AND (data->'individualRecipients'->regexp_replace(cid, '^bookself-class:', '') IS NULL
      OR data->'individualRecipients'->regexp_replace(cid, '^bookself-class:', '') ? ${student}::text)
)`;
