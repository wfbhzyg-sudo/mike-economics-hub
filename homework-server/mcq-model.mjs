import {assert,text} from './validation.mjs';
export function validateRegions(regions,pages){
 assert(Array.isArray(regions)&&regions.length>0&&regions.length<=5,'每题需关联 1–5 个原件区域');
 return regions.map(r=>{assert(Number.isInteger(r.page)&&r.page>=1&&r.page<=pages,'来源页码无效');const v=['x','y','w','h'].map(k=>Number(r[k]));assert(v.every(Number.isFinite)&&v[0]>=0&&v[1]>=0&&v[2]>=.03&&v[3]>=.02&&v[0]+v[2]<=1.00001&&v[1]+v[3]<=1.00001,'裁切边界超出原页或区域过小');return {page:r.page,x:v[0],y:v[1],w:v[2],h:v[3]}});
}
export function validateItems(items,pages){
 assert(Array.isArray(items)&&items.length>0&&items.length<=40,'请选择 1–40 道题');const seen=new Set();
 return items.map((q,i)=>{const id=text(q.id,30)||String(i+1);assert(!seen.has(id),'题号重复');seen.add(id);const prompt=text(q.prompt,12000);assert(prompt,'请补充题干文字，便于搜索与辅助阅读');
 const regions=validateRegions(q.regions,pages);assert(q.checked===true,'请核对每道题的题面与答案');
 if(q.type==='short'){const maxPoints=Number(q.maxPoints);assert(Number.isFinite(maxPoints)&&maxPoints>0&&maxPoints<=100,'简答题分值应为 1–100');assert(text(q.criteria,10000),'请填写简答题参考答案');return {id,type:'short',prompt,regions,options:[],criteria:text(q.criteria,10000),maxPoints,sourcePages:text(q.sourcePages,200),checked:true};}
 const options=(q.options||[]).map(o=>({label:text(o.label,1).toUpperCase(),text:text(o.text,4000)}));
 assert(options.length>=2&&options.length<=5&&options.every((o,j)=>o.label==='ABCDE'[j]&&o.text),'请核对完整选项 A–E');
 const answer=text(q.answer,1).toUpperCase();assert(options.some(o=>o.label===answer),'请确认每题正确答案');assert(text(q.sourcePages,200),'请填写答案出处');
 return {id,type:'choice',prompt,options,regions,answer,sourcePages:text(q.sourcePages,200),checked:true,maxPoints:1};});
}
export function choiceScore(questions,answers){const rows=questions.filter(q=>q.type==='choice').map(q=>{const picked=answers?.[q.id]||'';assert(!picked||q.options?.some(o=>o.label===picked),'选项无效');return {id:q.id,score:picked===q.correctOptions?.[0]?q.maxPoints:0,maxPoints:q.maxPoints,selectedOptions:picked?[picked]:[],needsReview:false,evidence:'',feedback:''};});return {scoreOnly:true,questions:rows,total:rows.reduce((n,q)=>n+q.score,0),maxPoints:rows.reduce((n,q)=>n+q.maxPoints,0),needsReview:false};}
export function combineScores(a,b){const questions=[...a.questions,...b.questions];return {scoreOnly:true,questions,total:questions.some(q=>q.score===null)?null:questions.reduce((n,q)=>n+q.score,0),maxPoints:questions.reduce((n,q)=>n+q.maxPoints,0),needsReview:questions.some(q=>q.needsReview)};}
export function studentItems(a){return (a.rubric||[]).map(q=>({id:q.id,prompt:q.prompt,type:q.type,maxPoints:q.maxPoints,options:q.options||[],questionImages:q.questionImages||[]}));}
export function attemptRules(a,studentId){return {...a,...(a.accommodations?.find(r=>r.studentId===studentId)||{})};}
export function activeExam(t,a,at=Date.now()){if(!t||t.mode!=='exam'||t.submittedId||!a||a.deletedAt||a.version!==t.version)return false;const r=attemptRules(a,t.studentId),end=Math.min(r.timeLimitMinutes?Date.parse(t.startedAt)+r.timeLimitMinutes*60000:Infinity,r.dueAt&&!r.allowLate?Date.parse(r.dueAt):Infinity);return at<end;}
