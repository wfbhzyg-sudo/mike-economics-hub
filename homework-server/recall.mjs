import {assert} from './validation.mjs';
import {hash,now} from './store.mjs';
import {fingerprint,optionLabels,publicQuestion} from './self-practice-model.mjs';
import {questionHasTopic} from '../homework/library-packs.js';

const kind='student-recall';
const day=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
const due=r=>r.status==='passed'&&Date.parse(r.finishedAt)<=Date.now()-3*86400000;
const tags=q=>[q.libraryQuestionId||q.id,q.canonicalQuestionId,q.duplicateOf,q.source&&q.number&&fingerprint(q),...(q.questionImages||[]).map(id=>'img:'+id),q.prompt?.length>40&&'text:'+q.prompt.toLowerCase().replace(/\s+/g,' ').trim()].filter(Boolean);
export function recallService({db,studentUnits,eligibleByUnit}){
  async function available(user,request,c){
    const {course,assignmentId,questionId}=request;
    const reviews=await db.find('correction-review',{studentId:user.id,assignmentId},c);
    const review=reviews.find(r=>r.questionId===questionId&&due(r));if(!review)return null;
    const origin=await db.get(review.submissionId,c);if(origin?.studentId!==user.id||origin.status!==(review.mock?'submitted':'published'))return null;
    const ref=(review.mock?origin.questions:origin.rubricSnapshot)?.find(q=>q.id===questionId);
    const refId=ref?.libraryQuestionId||(review.mock?ref?.id:null);if(!refId)return null;
    const original=await db.get(refId,c);
    if(!original?.skill||!original.topic||Number(ref.libraryVersion||ref.version||1)!==Number(original.version||1))return null;
    const units=await studentUnits(user,course,c);
    const unit=units.find(u=>u.id===original.unitId);if(!unit)return null;
    const pool=await eligibleByUnit([unit],c);
    const assignments=await db.studentAssignments(user,c);
    if(!review.mock&&!assignments.some(a=>a.id===review.assignmentId))return null;
    const reserved=await db.scheduledRecallQuestions(user,c);
    const submitted=await db.find('submission',{studentId:user.id},c),mocks=await db.find('self-practice-attempt',{studentId:user.id},c),recalls=await db.find(kind,{studentId:user.id},c);
    const seen=new Set(tags(original));
    for(const q of [...reserved,...assignments.flatMap(a=>a.rubric||[]),...submitted.flatMap(s=>s.rubricSnapshot||[]),...mocks.flatMap(t=>t.questions||[]),...recalls.map(r=>r.question)])for(const tag of tags(q))seen.add(tag);
    return pool[unit.id].find(q=>!q.deletedAt&&!q.manualGradingRequired&&q.skill===original.skill&&questionHasTopic(q,original.topic)&&!tags(q).some(t=>seen.has(t)))||null;
  }
  function view(r){return {id:r.id,course:r.course,status:r.status,question:publicQuestion(r.question),...(r.status==='submitted'?{choice:r.choice,correct:r.choice===r.question.answer,answer:r.question.answer,helped:r.helped}:{} )};}
  async function handle(ctx){
    const {user,method,route,body,req}=ctx;assert(user.role==='student','请使用学生账号',403);
    const b=method==='GET'?Object.fromEntries(new URL(req.url,'http://local').searchParams):await body(req);
    for(const k of ['assignmentId','questionId','course'])assert(typeof b[k]==='string'&&b[k].length>0&&b[k].length<=180,'再练来源无效');
    const key=kind+':'+hash(JSON.stringify([user.id,b.course,b.assignmentId,b.questionId]));
    async function work(c){
      const prior=await db.get(key,c);
      if(prior){
        const units=await studentUnits(user,b.course,c);assert(units.some(u=>u.id===prior.question.unitId),'题库暂未开放',403);
        if(method==='POST'&&route[2]==='submit'&&prior.status!=='submitted'){
          assert(optionLabels(prior.question).includes(b.choice),'请选择一个选项');
          prior.status='submitted';prior.choice=b.choice;prior.helped=b.helped===true;prior.submittedAt=now();await db.put(kind,prior,c);
        }
        return {attempt:view(prior)};
      }
      const previous=await db.find(kind,{studentId:user.id},c);
      if(previous.some(r=>r.day===day()))return {available:false};
      if(route[2]==='submit')assert(false,'请先开始再练',409);
      const candidate=await available(user,b,c);
      if(method==='GET'||!candidate)return {available:!!candidate};
      const record={id:key,studentId:user.id,course:b.course,assignmentId:b.assignmentId,questionId:b.questionId,day:day(),createdAt:now(),status:'active',question:candidate};
      await db.put(kind,record,c);return {attempt:view(record)};
    }
    assert(method==='GET'||method==='POST'&&['start','submit'].includes(route[2]),'不支持此操作',405);
    return method==='GET'?work():db.tx(work,'student-recall:'+user.id);
  }
  async function canRead(file,user,key){
    const r=await db.get(key);
    return r?.id.startsWith(kind+':')&&r.studentId===user.id&&r.question?.questionImages?.includes(file.id)&&(await studentUnits(user,r.course)).some(u=>u.id===r.question.unitId);
  }
  return {handle,canRead};
}
