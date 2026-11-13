import {hash} from './store.mjs';
import {assert} from './validation.mjs';
import {choiceScore} from './mcq-model.mjs';
export async function keyChangePlan(db,a,b,c){
 assert(Number(b.version)===a.version,'题目版本已更新，请重新预览',409);
 const q=a.rubric.find(q=>q.id===b.questionId&&q.type==='choice');
 assert(q&&q.options.some(o=>o.label===b.answer),'请选择有效题号与答案');
 assert(q.correctOptions[0]!==b.answer,'答案没有变化');
 const rubric=a.rubric.map(x=>x.id===q.id?{...x,correctOptions:[b.answer],answer:b.answer}:x);
 const latest=new Map();for(const s of (await db.list('submission',c)).filter(s=>s.assignmentId===a.id&&s.choices).sort((x,y)=>Date.parse(x.submittedAt)-Date.parse(y.submittedAt)))latest.set(s.studentId,s);
 const submissions=[...latest.values()].filter(s=>s.version===a.version);
 assert(!submissions.some(s=>['queued','grading'].includes(s.status)),'请等当前批阅完成再修改答案',409);
 const rows=submissions.map(s=>{const base=s.publishedGrade||s.suggestedGrade,short=rubric.filter(q=>q.type!=='choice').map(q=>base?.questions.find(x=>x.id===q.id)?.score),after=short.some(x=>x==null)?null:choiceScore(rubric,s.choices).total+short.reduce((n,x)=>n+x,0);return {submissionId:s.id,studentId:s.studentId,before:base?.total??null,after}});
 const token=hash(JSON.stringify([a.id,a.version,b.questionId,b.answer,submissions.map(s=>[s.id,s.updatedAt,s.status,s.choices,s.publishedGrade,s.teacherReviewDraft])]));
 return {rubric,submissions,rows,token};
}
