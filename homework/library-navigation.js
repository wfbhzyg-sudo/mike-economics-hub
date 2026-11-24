import {unitIdentity,unitCourse} from './subject-catalog.js';
export function libraryLocation(units, last, unitArg = '', topicArg = '', modeArg = '') {
  const explicitUnit = Boolean(unitIdentity(unitArg));
  const resume = !unitArg && units.some(unit => unit.id === last.unit);
  const unitId = explicitUnit ? unitArg : unitArg ? 'micro-unit-2' : resume ? last.unit : units.find(unit=>unit.id==='micro-unit-2')?.id || units[0]?.id;
  // Older course switches omitted the topic segment, e.g. /macro-unit-1/slides.
  if (explicitUnit && !modeArg && ['slides','textbook','project','packs','bank','practice','progress','exams'].includes(topicArg)) {
    return {unitId, topicId:['progress','exams'].includes(topicArg)?'all':'', mode:topicArg};
  }
  return {unitId, topicId:explicitUnit ? topicArg : unitArg || (resume ? last.topic : ''),
    mode:(explicitUnit ? modeArg : topicArg) || (resume && last.mode !== 'project' ? last.mode : '') || ''};
}
export function packReference(detail = '') {
  const boundary = detail.indexOf(':'), collection = detail.slice(0,boundary), id = detail.slice(boundary+1);
  return boundary > 0 && ['topic','progress','exam'].includes(collection) && id ? {collection,id} : null;
}
export function packQuestions(questions, ids) {
  if (!ids) return questions;
  const byId = new Map(questions.map(question => [question.id, question]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}

export function pdfPageText(items = []) {
 return items.map(item => typeof item.str === 'string' ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').replace(/[ \t]+\n/g,'\n').trim();
}

export function libraryCourseTarget(unit, mode, previewCollection) {
  if (mode==='preview') mode=({progress:'progress',exam:'exams'})[previewCollection] || 'packs';
  if (mode==='project') mode='slides';
  const topic=['progress','exams'].includes(mode)?'all':unit.topics?.[0]?.id || 'all';
  return [unit.id,topic,mode];
}
export function topicResource(resources, kind, topicId) {
  return resources.find(r=>r.kind===kind && r.topicId===topicId)
    ?? resources.find(r=>r.kind===kind && !r.topicId);
}
export function assignmentInUnit(assignment,unitId) {
  return assignment.libraryUnit===unitId || assignment.libraryUnits?.includes(unitId) ||
    assignment.libraryCollection==='exam' && assignment.libraryCourse===unitCourse(unitId) ||
    Boolean(assignment.questions?.some(q=>q.lessonReference?.unit===unitId));
}
