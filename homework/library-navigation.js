export function libraryLocation(units, last, unitArg = '', topicArg = '', modeArg = '') {
  const explicitUnit = /^(micro|macro)-unit-[1-6]$/.test(unitArg);
  const resume = !unitArg && units.some(unit => unit.id === last.unit);
  const unitId = explicitUnit ? unitArg : unitArg ? 'micro-unit-2' : resume ? last.unit : units.find(unit=>unit.id==='micro-unit-2')?.id || units[0]?.id;
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
