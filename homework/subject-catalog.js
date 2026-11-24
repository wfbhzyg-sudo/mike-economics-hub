import {subjects} from './subject-definitions.js';

const reserved = new Set(['all','mixed','unknown','constructor','prototype','__proto__']);
const plain = s => typeof s==='string' && s.trim()===s && s.length>0 && !/[<>&"'\u0000-\u001f]/u.test(s);
export function validateSubjects(rows) {
  if(!Array.isArray(rows)||!rows.length)throw Error('请至少配置一门学科');
  const ids=new Set(), names=new Map();
  for(const s of rows){
    if(!s||typeof s.id!=='string')throw Error('缺少学科标识');
    if(!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(s.id)||reserved.has(s.id)||ids.has(s.id))throw Error('学科标识无效或重复：'+s.id);
    ids.add(s.id);
    if(![s.label,s.short,s.english,s.full].every(plain)||!Array.isArray(s.aliases)||!s.aliases.every(plain))throw Error('学科名称无效：'+s.id);
    for(const name of [s.id,s.label,s.short,s.full,s.english,...s.aliases]){
      const alias=name.toLowerCase();
      if(names.has(alias)&&names.get(alias)!==s.id)throw Error('学科名称冲突：'+name);
      names.set(alias,s.id);
    }
    if(!Number.isInteger(s.units)||s.units<1||s.units>999||!['blue','green','purple','amber','slate'].includes(s.tone))throw Error('学科单元或配色无效：'+s.id);
    if(!Array.isArray(s.skills)||s.skills.some(k=>!k||!Number.isInteger(k.id)||k.id<1||k.id>s.skills.length)||new Set(s.skills.map(k=>k.id)).size!==s.skills.length||s.skills.some(k=>![k.name,k.english,k.practice].every(plain)||typeof k.choice!=='boolean'))throw Error('学科技能无效：'+s.id);
  }
}
validateSubjects(subjects);
const byId=new Map(subjects.map(s=>[s.id,{...s,skills:s.skills.toSorted((a,b)=>a.id-b.id)}]));
export const subjectIds=Object.freeze(subjects.map(s=>s.id));
export const subjectInfo=id=>byId.get(id);
export const isSubject=id=>byId.has(id);
const names = subjects.flatMap(subject=>[...new Set([subject.id,subject.label,subject.short,subject.full,subject.english,...subject.aliases].map(s=>s.toLowerCase()))].map(name=>({name,id:subject.id})));
const exact = new Map(names.map(({name,id})=>[name,id]));
export function namedSubject(value) {
  const text=String(value??'').trim().toLowerCase();
  if(exact.has(text))return exact.get(text);
  if(!text)return '';
  const found=names.filter(({name})=>text.includes(name));
  const ids=new Set(found.filter(a=>!found.some(b=>b.id!==a.id&&b.name.includes(a.name))).map(m=>m.id));
  return ids.size>1?'mixed':ids.values().next().value||'';
}
export function unitIdentity(value) {
  const id=typeof value==='string'?value:value?.id;
  const m=/^([a-z][a-z0-9-]*)-unit-([1-9]\d{0,2})$/.exec(id||'');
  return m&&Number(m[2])<=byId.get(m[1])?.units?{course:m[1],number:Number(m[2])}:null;
}
export const unitCourse=value=>unitIdentity(value)?.course||'';
export function topicUnitNumber(id) {
  const m=/^([1-9]\d{0,2})\.\d{1,3}$/.exec(id||'');
  return m?Number(m[1]):null;
}
