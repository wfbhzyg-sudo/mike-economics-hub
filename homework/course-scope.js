// Course identity is independent of the student's primary class and topic number.
export const classKey = id => String(id || '').replace(/^bookself-class:/, '');
export function namedCourse(value) {
 const text=String(value||'').toLowerCase(),micro=/micro|微观/.test(text),macro=/macro|宏观/.test(text);
 return micro&&macro?'mixed':micro?'micro':macro?'macro':'';
}
export function singleClassCourse(classroom) {
 const course=namedCourse(classroom?.course)||namedCourse(classroom?.name);
 return ['micro','macro'].includes(course)?course:'';
}
export const courseLabel = course => ({micro:'AP 微观',macro:'AP 宏观',mixed:'跨学科',unknown:'未分类',all:'全部学科'})[course] || '未分类';
export function assignmentCourse(a,classes=[]) {
 if(['micro','macro','mixed'].includes(a.libraryCourse))return a.libraryCourse;
 const units=[a.libraryUnit,a.librarySourceUnit,...(a.libraryUnits||[])].map(namedCourse).filter(Boolean);
 if(units.length)return new Set(units).size>1?'mixed':units[0];
 const explicit=namedCourse(a.course);if(explicit)return explicit;
 const names=classes.filter(c=>(a.classIds||[]).some(id=>classKey(id)===classKey(c.id))).map(c=>namedCourse(c.name)).filter(Boolean);
 return names.length?(new Set(names).size>1?'mixed':names[0]):'unknown';
}
export function coursesFor(assignments,classes=[]) {
 const available=new Set(assignments.map(a=>assignmentCourse(a,classes)));
 for(const c of classes){const v=namedCourse(c.name);if(v)available.add(v);}
 return ['micro','macro','mixed','unknown'].filter(c=>available.has(c));
}
export function selectedCourse(userId,allowed,fallback=allowed[0]||'micro') {
 try{const v=sessionStorage.getItem('mike-course:'+userId);if(allowed.includes(v))return v;}catch{}
 return fallback;
}
export function rememberCourse(userId,course){try{sessionStorage.setItem('mike-course:'+userId,course);}catch{}}
export function courseTabs(courses,selected,{all=false}={}) {
 return `<div class="course-scope" role="group" aria-label="筛选学科">${(all?['all',...courses]:courses).map(c=>`<button type="button" data-subject="${c}" aria-pressed="${c===selected}">${courseLabel(c)}</button>`).join('')}</div>`;
}
