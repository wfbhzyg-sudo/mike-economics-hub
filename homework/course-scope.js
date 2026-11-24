import {subjectIds,subjectInfo,isSubject,namedSubject,unitCourse} from './subject-catalog.js';
// Course identity is independent of the student's primary class and topic number.
export const classKey = id => String(id || '').replace(/^bookself-class:/, '');
export const namedCourse=namedSubject;
export function singleClassCourse(classroom) {
 const course=namedCourse(classroom?.course)||namedCourse(classroom?.name);
 return isSubject(course)?course:'';
}
export const courseLabel = course => subjectInfo(course)?.label || (course==='mixed'?'跨学科':course==='all'?'全部学科':'未分类');
export function assignmentCourse(a,classes=[]) {
 if(isSubject(a.libraryCourse)||a.libraryCourse==='mixed')return a.libraryCourse;
 const units=[a.libraryUnit,a.librarySourceUnit,...(a.libraryUnits||[])].map(u=>unitCourse(u)||namedCourse(u)).filter(Boolean);
 if(units.length)return new Set(units).size>1?'mixed':units[0];
 const explicit=namedCourse(a.course);if(explicit)return explicit;
 const names=classes.filter(c=>(a.classIds||[]).some(id=>classKey(id)===classKey(c.id))).map(c=>namedCourse(c.course)||namedCourse(c.name)).filter(Boolean);
 return names.length?(new Set(names).size>1?'mixed':names[0]):'unknown';
}
export function coursesFor(assignments,classes=[]) {
 const available=new Set(assignments.map(a=>assignmentCourse(a,classes)));
 for(const c of classes){const v=namedCourse(c.course)||namedCourse(c.name);if(v)available.add(v);}
 return [...subjectIds,'mixed','unknown'].filter(c=>available.has(c));
}
export function selectedCourse(userId,allowed,fallback=allowed[0]||subjectIds[0]) {
 try{const v=sessionStorage.getItem('mike-course:'+userId);if(allowed.includes(v))return v;}catch{}
 return fallback;
}
export function rememberCourse(userId,course){try{sessionStorage.setItem('mike-course:'+userId,course);}catch{}}
// Keep keyboard, active-state and overflow behaviour identical across workspaces.
export function subjectSwitcher(ids,selected,{className='course-scope',attribute='subject',label='筛选学科',english=false,tabs=false}={}){
 const choices=ids.filter(id=>isSubject(id)||['all','mixed','unknown'].includes(id));
 return `<div class="${className}" data-subject-switch role="${tabs?'tablist':'group'}" aria-label="${label}">${choices.map(id=>`<button type="button" data-${attribute}="${id}" ${tabs?'role="tab" aria-selected':'aria-pressed'}="${id===selected}">${english&&isSubject(id)?subjectInfo(id).english:courseLabel(id)}</button>`).join('')}</div>`;
}
export function courseTabs(courses,selected,{all=false}={}) {
 return subjectSwitcher(all?['all',...courses]:courses,selected);
}
