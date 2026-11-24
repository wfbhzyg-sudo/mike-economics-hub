import {unitIdentity,unitCourse,namedSubject,isSubject,topicUnitNumber} from '../homework/subject-catalog.js';

export function questionLessonReference(question = {}, assignment = {}) {
  assignment ||= {};
  const bank = question.libraryQuestionId || question.lessonReference?.bank || '';
  const known = question.lessonUnit || question.unitId || question.lessonReference?.unit || '';
  const scope = assignment.libraryUnit || assignment.librarySourceUnit || '';
  const subject = unitCourse(known) || namedSubject(assignment.libraryCourse || assignment.course) || unitCourse(scope);
  const tagged = String(question.knowledge || '').match(/^Topic\s+(\d+\.\d+)(?=\s|$)/i)?.[1];
  const topic = question.lessonTopic || question.topic || question.lessonReference?.topic || tagged || '';
  const number=topicUnitNumber(topic);
  const candidate=unitIdentity(known)?known:isSubject(subject)&&number?subject+'-unit-'+number:scope;
  const unit=unitIdentity(candidate)?candidate:'';
  return {unit, topic:unit && unitIdentity(unit).number===number?topic:'', bank};
}
