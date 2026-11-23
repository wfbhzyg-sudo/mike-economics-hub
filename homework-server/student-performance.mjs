import {assignmentCourse} from '../homework/course-scope.js';
import {scoreBand} from '../homework/score-bands.js';

const recency=28*24*3600*1000;
const round=n=>Math.round(n*10)/10;
const rate=points=>points.possible?100*points.earned/points.possible:null;
const numbers=()=>({earned:0,possible:0,raw:0,count:0});
const add=(point,earned,possible,weight)=>{
  point.earned+=earned*weight;point.possible+=possible*weight;point.raw+=possible;point.count++;
};
const sameSkill=value=>String(value||'').match(/^([1-4])(?:[A-Z]|\b)/i)?.[1]||'';

function independentGrade(s){
  if(s.publishedGrade?.total===null || s.status==='returned')return null;
  if(s.offlineEvidence && s.publishedGrade?.questions?.length)return s.publishedGrade;
  const history=s.gradeHistory||[];
  return s.publishedGrade?.manualTotal && s.publishedGrade.questions?.length?
    [...history].reverse().find(g=>!g.manualTotal)||s.publishedGrade : s.publishedGrade;
}

export function testsAllSkills(a){
  if(a.assessmentMode==='exam' || ['progress','progress-check','exam'].includes(a.libraryCollection))return true;
  const label=[a.offlineType,a.assessmentType,a.title].filter(Boolean).join(' ');
  return /\b(?:quizzes|quiz|tests?|exams?|examinations?|progress[\s:-]*check)\b|小测|测验|单元测|随堂测|月考|期中|期末|考试/i.test(label);
}

export function studentPerformance(submissions,assignments,mistakes,classes=[],library=[],at=Date.now()){
  const bank=new Map(library.map(q=>[q.id,q]));
  // For a zero-score redo, the newly graded attempt replaces the earlier evidence.
  const retried=new Set(submissions.filter(s=>s.retryOf && s.status!=='returned' && Number.isFinite(s.publishedGrade?.total)).map(s=>s.assignmentId));
  const evidenceByAssignment=new Map();
  for(const s of submissions){
    const grade=independentGrade(s);
    if(s.status==='draft'||!Number.isFinite(grade?.total)||!(grade.maxPoints>0)||grade.total<0||grade.total>grade.maxPoints)continue;
    const date=s.submittedAt||s.createdAt||grade.publishedAt;
    const old=evidenceByAssignment.get(s.assignmentId);
    const order=old && (String(date).localeCompare(String(old.date)) || s.id.localeCompare(old.s.id));
    if(!old || (retried.has(s.assignmentId)?order>0:order<0)) evidenceByAssignment.set(s.assignmentId,{s,grade,date});
  }
  const bindings=q=>{
    const item=bank.get(q?.libraryQuestionId);
    const bankSkill=item&&(item.version||1)===(q.libraryVersion||1)?item.skill:null;
    const skill=sameSkill(q?.skill||bankSkill);
    return q?.type==='choice'&&skill!=='4'?skill:'';
  };
  const questionSkills=(info,q)=>{
    const choiceSkill=bindings(info);
    if(choiceSkill)return [{skill:choiceSkill,score:q.score,max:q.maxPoints,pointId:''}];
    if(info?.type!=='short')return [];
    return (info.scoringPoints||[]).flatMap(p=>{
      const skill=sameSkill(p.skill),earned=q.pointResults?.find(item=>item.id===p.id)?.earned;
      return skill&&Number.isFinite(earned)&&earned>=0&&earned<=p.maxPoints?[{skill,score:earned,max:p.maxPoints,pointId:p.id}]:[];
    });
  };
  return ['micro','macro'].map(course=>{
    const first=numbers(),transfer=numbers();
    let comprehensiveAssessments=0;
    const skills=Array.from({length:4},()=>({...numbers(),questions:new Set(),references:[]}));
    const available=assignments.filter(a=>a.published&&!a.deletedAt&&assignmentCourse(a,classes)===course);
    const aIds=new Set(available.map(a=>a.id)),verified=new Map();
    for(const m of mistakes){
      if(!aIds.has(m.assignmentId)||m.verification?.status!=='passed')continue;
      const entry=evidenceByAssignment.get(m.assignmentId);
      const q=entry?.s.rubricSnapshot?.find(q=>q.id===m.questionId);
      if(entry?.s.id!==m.submissionId||!q)continue;
      const base=entry.grade.questions.find(q=>q.id===m.questionId);
      if(!base)continue;
      for(const category of new Set(questionSkills(q,base).filter(p=>p.score<p.max).map(p=>p.skill))){
        const times=verified.get(category)||[];
        times.push({date:m.verification.finishedAt,key:q.libraryQuestionId||q.prompt?.trim(),assignmentId:m.assignmentId});
        verified.set(category,times);
      }
    }
    const usedTransfer=new Set(),usedSkills=new Set();
    const ordered=available.sort((a,b)=>String(evidenceByAssignment.get(a.id)?.date||'').localeCompare(String(evidenceByAssignment.get(b.id)?.date||'')));
    for(const a of ordered){
      const source=evidenceByAssignment.get(a.id);
      if(!source)continue;
      const {s,grade,date}=source,parsed=Date.parse(date),weight=Number.isFinite(parsed)&&at-parsed<recency?2:1;
      if(testsAllSkills(a))comprehensiveAssessments++;
      const meta=new Map((s.rubricSnapshot||[]).map(q=>[q.id,q]));
      if(!a.performanceTransfer)add(first,s.offlineEvidence?.total??grade.total,s.offlineEvidence?.maxPoints??grade.maxPoints,weight);
      for(const [i,q] of (grade.questions||[]).entries()){
        if(!Number.isFinite(q.score)||!(q.maxPoints>0)||q.score<0||q.score>q.maxPoints)continue;
        const info=meta.get(q.id),qid=info?.libraryQuestionId||info?.prompt?.trim()||a.id+':'+q.id;
        const samples=questionSkills(info,q);
        if(a.performanceTransfer){
          const categories=Map.groupBy(samples,p=>p.skill);
          for(const [skill,items] of categories){
            const evidence=verified.get(skill)||[];
            const uniq=skill+':'+qid;
            if(!usedTransfer.has(uniq)&&evidence.some(e=>e.key&&e.key!==qid&&e.assignmentId!==a.id&&e.date<date)){
              usedTransfer.add(uniq);add(transfer,items.every(p=>p.score===p.max)?1:0,1,weight);
            }
          }
          continue;
        }
        for(const p of samples){
          const key=JSON.stringify([p.skill,qid,p.pointId]);
          if(usedSkills.has(key))continue;
          usedSkills.add(key);
          const axis=skills[Number(p.skill)-1];
          add(axis,p.score,p.max,weight);axis.questions.add(qid);
          if(axis.references.length<8)axis.references.push({assignmentId:a.id,title:a.title,questionId:q.id,questionNumber:i+1,score:q.score,max:q.maxPoints});
        }
      }
    }
    const a=first.count>=2&&first.raw>=10?rate(first):null;
    const r=transfer.count>=3?rate(transfer):null;
    const index=a===null?null:scoreBand(r===null?a:.8*a+.2*r);
    const axes=skills.map((axis,i)=>{
      const value=axis.raw>=4&&axis.questions.size>=2?scoreBand(rate(axis)):null;
      return {skill:i+1,comprehensiveAssessments,band:value?.level??null,value:value?.value??null,count:axis.questions.size,references:axis.references};
    });
    const focus=axes.filter(axis=>axis.band!==null).sort((a,b)=>a.value-b.value||b.count-a.count||a.skill-b.skill)[0]?.skill||null;
    return {course,index,next:index&&index.level<5?round(index.level*20-index.value):null,first:a===null?null:round(a),
      transfer:r===null?null:round(r),transferCount:transfer.count,works:first.count,points:first.raw,axes,focus,
      corrections:{done:mistakes.filter(m=>aIds.has(m.assignmentId)&&m.verification?.status==='passed').length,total:mistakes.filter(m=>aIds.has(m.assignmentId)).length}};
  });
}

const skillText=['原理与模型','解读','分析推演','绘图'];
export async function performanceAdvice({db,decrypt,studentId,value}){
  const skill=skillText[(value?.focus||0)-1];
  if(!skill)return {text:'做完更多独立练习后，可以查看各项技能的表现。'};
  const axis=value.axes[value.focus-1];
  const fallback={text:'先打开「'+skill+'」查看失分依据，再独立完成一道同技能的新题。'};
  const evidence={course:value.course,skill,value:axis.value,independentQuestions:axis.count};
  const {hash,now}=await import('./store.mjs');
  const key='performance-advice:'+hash(studentId+':'+value.course);
  const version=hash(JSON.stringify(evidence)),old=await db.get(key);
  if(old?.version===version)return {text:old.text};
  try{
    const {deepseek}=await import('./ai.mjs');
    const result=await deepseek(db,decrypt,[
      {role:'system',content:'根据已汇总的 AP 经济学技能证据，生成一句中文练习建议，最多 100 字。只推荐可独立完成的一步，解释做什么。不要推断知识点、评价人格、预测公开考试成绩或给任何题的答案。输出 JSON {"text":"…"}。'},
      {role:'user',content:JSON.stringify(evidence)},
    ],{json:true,maxTokens:200,signal:AbortSignal.timeout(15_000)});
    if(typeof result?.text!=='string'||!result.text.trim()||result.text.length>120)return fallback;
    const text=result.text.trim();
    await db.put('performance-advice',{id:key,studentId,version,text,createdAt:now()});
    return {text};
  }catch{return fallback;}
}
