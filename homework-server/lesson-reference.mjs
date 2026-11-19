const unitPattern = /^(micro|macro)-unit-([1-6])$/;
const topicPattern = /^[1-6]\.\d{1,2}$/;

export function questionLessonReference(question = {}, assignment = {}) {
  assignment ||= {};
  const bank = question.libraryQuestionId || question.lessonReference?.bank || '';
  const known = question.lessonUnit || question.unitId || question.lessonReference?.unit || '';
  let unit = unitPattern.test(known) ? known : '';
  const scope = assignment.libraryUnit || assignment.librarySourceUnit || '';
  const course = String(assignment.libraryCourse || assignment.course || '');
  const subject = unit.match(unitPattern)?.[1] ||
    (/micro|微观/i.test(course) && !/macro|宏观/i.test(course) ? 'micro' :
      /macro|宏观/i.test(course) && !/micro|微观/i.test(course) ? 'macro' : scope.match(unitPattern)?.[1]);
  const taggedTopic = String(question.knowledge || '').match(/^Topic\s+([1-6]\.\d{1,2})(?=\s|$)/i)?.[1];
  const candidate = question.lessonTopic || question.topic || question.lessonReference?.topic || taggedTopic;
  const topic = topicPattern.test(candidate || '') ? candidate : '';
  if (!unit && subject && topic) unit = subject + '-unit-' + topic[0];
  if (!unit && unitPattern.test(scope)) unit = scope;
  return {unit, topic: unit && topic[0] === unit.at(-1) ? topic : '', bank};
}
