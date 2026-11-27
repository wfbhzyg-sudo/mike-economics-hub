import {classKey} from '../homework/course-scope.js';
import {scoreBand} from '../homework/score-bands.js';
import {unitCourse} from '../homework/subject-catalog.js';
import {questionLessonReference} from './lesson-reference.mjs';
import {workDate} from '../homework/grade-journey-model.js';

const round=n=>Math.round(n*10)/10;
const valid=(v,max)=>Number.isFinite(v)&&Number.isFinite(max)&&max>0&&v>=0&&v<=max;
const order=(a,b)=>a.localeCompare(b,'en',{numeric:true});

export function isReportExam(a){
  return a.assessmentMode==='exam'||['exam','progress','progress-check','quiz','test'].includes(a.libraryCollection)||
    /exam|quiz|test|progress[\s-]*check|小测|月考|期[中末]|考试|测验/i.test([a.assessmentType,a.offlineType].filter(Boolean).join(' '));
}

export function chaptersFor(course,cells,units,bank,mistakes,unitFilter=''){
  const topics=new Map(),coverage={unmapped:0,totalOnly:0};
  for(const u of units.filter(u=>unitCourse(u.id)===course&&(!unitFilter||u.id===unitFilter)))
    for(const t of u.topics||[])topics.set(t.id,{id:t.id,name:t.name||t.title||t.id,unit:u.id,earned:0,possible:0,count:0,passed:0,waiting:0,open:0,recovered:0});
  const lookup=new Map(mistakes.map(m=>[JSON.stringify([m.submissionId,m.questionId]),m]));
  for(const cell of cells){
    if(cell.status!=='graded')continue;
    const attempts=(cell.record.attempts||[]).filter(s=>s.status!=='returned'&&s.publishedGrade&&!s.publishedGrade.absent);
    const first=attempts.findLast(s=>Number.isFinite(s.publishedGrade.total));
    if(!first)continue;
    const initial=[...(first.gradeHistory||[]),first.publishedGrade].find(g=>g&&!g.absent&&Number.isFinite(g.total));
    const g=initial?.questions?.length?initial:first.offlineEvidence?first.publishedGrade:null;
    if(!g?.questions?.some(q=>valid(q.score,q.maxPoints))){coverage.totalOnly++;continue;}
    const source=new Map((first.rubricSnapshot||[]).map(q=>[q.id,q]));
    const seen=new Set(),current=cell.record.effective,credits=current.publishedGrade?.scoreSources?.byQuestion||{};
    for(const q of g.questions){
      if(seen.has(q.id)||!valid(q.score,q.maxPoints))continue;
      seen.add(q.id);
      const meta=source.get(q.id)||{},lib=bank.get(meta.libraryQuestionId);
      let ref=questionLessonReference(meta,cell.assignment);
      if(!ref.topic&&lib&&(lib.version||1)===(meta.libraryVersion||1))ref=questionLessonReference(lib,cell.assignment);
      const t=topics.get(ref.topic);
      if(!t||ref.unit!==t.unit){coverage.unmapped++;continue;}
      t.earned+=q.score;t.possible+=q.maxPoints;t.count++;
      // Question identifiers belong to the attempt version. Never attribute a redo's credit to a different paper.
      if(q.score<q.maxPoints){
        const same=current.id===first.id||(first.version!=null&&current.version===first.version);
        const m=same&&lookup.get(JSON.stringify([current.id,q.id]));
        if(m?.verification?.status==='passed')t.passed++;
        else if(['queued','running','manual'].includes(m?.verification?.status))t.waiting++;
        else if(m||current.id===first.id){
          t.open++;
          if(m)t.firstMistake??={assignmentId:m.assignmentId,questionId:m.questionId};
        }
        if(same)t.recovered+=Number(credits[q.id])||0;
      }
    }
  }
  const rows=[...topics.values()].sort((a,b)=>order(a.id,b.id)).map(t=>({...t,recovered:round(t.recovered),band:scoreBand(t.possible?t.earned/t.possible*100:null)}));
  const weak=rows.filter(t=>t.count>=5&&t.earned/t.possible<.8).sort((a,b)=>a.earned/a.possible-b.earned/b.possible||b.open+b.waiting-a.open-a.waiting||b.count-a.count||order(a.id,b.id)).slice(0,5);
  return {topics:rows,weak,coverage};
}

export function anonymousExam(values){
  const grades=values.filter(v=>valid(v.score,v.max));
  if(grades.length<10)return null;
  const bins=Array.from({length:5},(_,i)=>({from:i*20,to:(i+1)*20,count:0}));
  let total=0,pcts=0;
  for(const g of grades){
    const percent=g.score*100/g.max;
    bins[Math.min(4,Math.floor(percent/20))].count++;total+=g.score;pcts+=percent;
  }
  let i;
  while(bins.length>1&&(i=bins.findIndex(b=>b.count>0&&b.count<3))!==-1){
    const k=i===bins.length-1?i-1:i;
    const [a,b]=bins.splice(k,2);bins.splice(k,0,{from:a.from,to:b.to,count:a.count+b.count});
  }
  const same=grades.every(g=>g.max===grades[0].max);
  return {n:grades.length,mean:round((same?total:pcts)/grades.length),max:same?grades[0].max:100,bins};
}

export function examDistributions(assignments,classes,records){
  const rows=Map.groupBy(records,r=>r.assignment);
  const result=[];
  for(const a of assignments.filter(isReportExam)){
    const assigned=new Set((a.classIds||[]).map(classKey));
    for(const cls of classes.filter(c=>assigned.has(classKey(c.id)))){
      const id=classKey(cls.id),unique=new Map();
      for(const r of rows.get(a.id)||[]){
        if(unique.has(r.person)||!valid(r.score,r.max))continue;
        const members=(r.classes||[]).map(classKey);
        if(members.includes(id)||(!members.length&&assigned.size===1))unique.set(r.person,r);
      }
      const stats=anonymousExam([...unique.values()]);
      if(stats)result.push({assignmentId:a.id,className:cls.name,title:a.title,date:workDate(a),...stats});
    }
  }
  return result.sort((a,b)=>b.date.localeCompare(a.date)||order(a.title,b.title));
}

export function mockHistoryOf(attempts){
  return attempts.filter(a=>valid(a.result?.total,a.result?.maxPoints)).map(a=>({id:a.id,date:a.submittedAt,rate:round(a.result.total*100/a.result.maxPoints),correct:a.result.total,count:a.result.maxPoints,seconds:a.result.durationSeconds})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
