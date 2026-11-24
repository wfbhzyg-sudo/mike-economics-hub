import {subjectInfo} from '../homework/subject-catalog.js';
import {openingEvidence,modelOpening} from './student-report-opening.mjs';
import {deepseek} from './ai.mjs';
import {hash} from './store.mjs';
import {resultParts} from './student-report.mjs';
import {assert} from './validation.mjs';

export const slots = ['S','W','O','T','now','plan','quick','later'];
const day = 24*60*60*1000;
const localDate = new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'});

// Candidates keep private work titles and identifiers on the server. The model sees only structured observations.
export function buildReportAnalysis(report) {
  const candidates=Object.fromEntries(slots.map(s=>[s,[]]));
  const at=Date.parse(report.at);
  for(const c of report.courses){
    const subject=c.label;
    function add(slot,kind,title,text,basis,assignmentId,metrics={},rank=0) {
      const ref=hash(JSON.stringify([slot,kind,c.course,assignmentId||'',title,text,basis])).slice(0,24);
      candidates[slot].push({ref,course:c.course,subject,kind,title,text,basis,assignmentId,metrics,rank});
    }
    for(const axis of c.evidence?.axes||[]){
      if(!subjectInfo(c.course)?.skills[axis.skill-1])continue;
      if(!axis.band||!Number.isFinite(axis.value))continue;
      const name=subjectInfo(c.course)?.skills[axis.skill-1]?.name,strong=axis.band>=4;
      const sample=axis.references?.find(q=>strong?q.score===q.max:q.score<q.max);
      const basis=name+'得分率 '+axis.value+'%，共 '+axis.count+' 道独立题。'+(sample?'《'+sample.title+'》第 '+sample.questionNumber+' 题。':'');
      const metrics={skill:name,band:axis.band,percent:axis.value,count:axis.count};
      if(strong)add('S','独立题技能优势',name+'已有积累',name+'达到第 '+axis.band+' 档，已有 '+axis.count+' 道独立题作为依据。',basis,sample?.assignmentId,metrics,axis.value);
      else if(sample){
        add('W','技能失分',name+'还有提升空间',name+'目前在第 '+axis.band+' 档。'+subjectInfo(c.course).skills[axis.skill-1].practice,basis,sample.assignmentId,metrics,100-axis.value);
        add('plan','技能练习','巩固'+name,subjectInfo(c.course).skills[axis.skill-1].practice,basis,sample.assignmentId,metrics,100-axis.value);
      }
    }
    for(const m of c.practiceItems||[]){
      const ref='《'+m.assignmentTitle+'》第 '+m.questionNumber+' 题';
      add('O','可回看的错题','用原题再练一遍',ref+'保留了原作答，可以对照失分步骤订正。',ref+'仍待订正。',m.assignmentId,{pending:c.pending},10);
      add('plan','订正原题','订正第 '+m.questionNumber+' 题','回看'+ref+'，先圈出第一次判断发生偏差的那一步。',ref+'仍待订正。',m.assignmentId,{pending:c.pending},130);
    }
    const outstanding=c.cells.filter(cell=>cell.status==='todo'&&cell.label!=='尚未开放'&&!cell.assignment.offline&&cell.assignment.format!=='score');
    for(const cell of outstanding){
      const a=cell.assignment,end=Date.parse(a.dueAt),remaining=end-at;
      const title='《'+a.title+'》',basis=title+'已向该生开放。'+(Number.isFinite(end)?'布置截止时间为'+localDate.format(end)+'。':'');
      if(remaining>=0&&remaining<=2*day){
        const text=title+'将于'+localDate.format(end)+'截止，当前尚无提交。';
        add('T','临近作业截止','留意最近的截止时间',text,basis,a.id,{dueAt:new Date(end).toISOString()},-end);
        add('now','应交作业临近截止','先完成最近到期的作业',text,basis,a.id,{dueAt:new Date(end).toISOString()},-end);
      }else if(!Number.isFinite(end)||remaining>0){
        add('O','已开放的作业','用已开放的作业练习',title+'现可作答。先独立完成，再回看无法确定的题。',basis,a.id,{},5);
        add('plan','应交作业','安排下一份作业',title+'现可作答，可以安排一次独立练习。',basis,a.id,{},5);
      }
    }
    for(const cell of c.cells){
      const marks=resultParts(cell);
      if(!marks)continue;
      const a=cell.assignment;
      if(marks.first!==null&&marks.max>0){
        const percent=Math.round(1000*marks.first/marks.max)/10;
        const basis='《'+a.title+'》首次 '+marks.first+' / '+marks.max+'，最终 '+marks.total+' / '+marks.max+'。';
        if(percent>=80)add('S','单份独立作答','这份作业的首答表现较好',basis,basis,a.id,{firstRate:percent},4);
        if(percent<60)add('W','单份作业观察','回看这份作业的首次作答',basis+'先找出最拿不准的一步。',basis,a.id,{firstRate:percent},2);
      }
      if(marks.recovered>0){
        const text='《'+a.title+'》通过订正补回 '+marks.recovered+' 分。';
        add('S','订正成效','订正已经取得进展',text,text+'最终 '+marks.total+' / '+marks.max+'。',a.id,{recovered:marks.recovered},10);
      }
      if(marks.first===marks.max&&marks.max>0){
        add('later','可选巩固','有余力时回看已掌握内容','《'+a.title+'》首次已得满分，可以用一句话归纳解法。','首次 '+marks.first+' / '+marks.max+'。',a.id,{},3);
      }
    }
  }
  for(const slot of slots)candidates[slot]=candidates[slot].sort((a,b)=>b.rank-a.rank).slice(0,4);
  const opening=openingEvidence(report);
  const version=hash(JSON.stringify([4,candidates,opening]));
  return {candidates,opening,version};
}

export function selectedItems(facts,selections={},edits={}) {
  return Object.fromEntries(slots.map(slot=>{
    const options=facts.candidates[slot];
    const chosen=options.find(c=>edits[c.ref])||options.find(c=>c.ref===selections[slot]?.ref)||options[0];
    if(!chosen)return [slot,null];
    const match=selections[slot]?.ref===chosen.ref;
    return [slot,{...chosen,advice:match?selections[slot].advice:'',edited:edits[chosen.ref]||''}];
  }));
}

export function representativeWorks(report,items){
  const priorities=[items.now,items.plan,items.S,items.W,items.O,items.T].filter(Boolean).map(i=>i.assignmentId);
  const rows=report.courses.flatMap(c=>c.cells.filter(cell=>cell.status==='graded').map(cell=>({course:c.course,label:c.label,cell})));
  const rank=r=>{const i=priorities.indexOf(r.cell.assignment.id);if(i>=0)return i;return resultParts(r.cell)?.recovered>0?10:20;};
  const date=r=>r.cell.record.grade.publishedAt||r.cell.record.effective.submittedAt||r.cell.assignment.createdAt||'';
  rows.sort((a,b)=>rank(a)-rank(b)||String(date(b)).localeCompare(String(date(a)))||String(a.cell.assignment.id).localeCompare(String(b.cell.assignment.id)));
  const selected=[];
  for(const course of report.courses){const row=rows.find(r=>r.course===course.course);if(row&&selected.length<3)selected.push(row);}
  for(const row of rows)if(selected.length<3&&!selected.some(r=>r.cell.assignment.id===row.cell.assignment.id)&&
    (!selected.length||rank(row)<20||selected.length<2))selected.push(row);
  return selected;
}

export function reportScope(teacher,query){
  return hash(JSON.stringify([teacher,...['student','class','unit','period','assignment'].map(k=>query.get(k)||'')]));
}
const pending=new Map();
export async function personalizeReport(db,decrypt,scope,facts,request=deepseek){
  const key='report-bento-ai:'+scope+':'+facts.version;
  const cached=await db.get(key);
  if(cached)return cached.selections;
  if(pending.has(key))return pending.get(key);
  const work=(async()=>{
    const input=Object.fromEntries(slots.map(s=>[s,facts.candidates[s].map(c=>({ref:c.ref,subject:c.course,kind:c.kind,...c.metrics}))]));
    if(!facts.opening.length&&!Object.values(input).some(items=>items.length))return {};
    input.openingEvidence=facts.opening;
    const result=await request(db,decrypt,[
      {role:'system',content:'你为学生写学科学习报告。S/W/O/T 是优势、待加强、可用机会、近期风险。now/plan/quick/later 是重要紧急、重要不紧急、非重要紧急、非重要不紧急。逐格选择该格一条最有教学意义的既有证据，各格兼顾报告包含的学科，不重复相同建议。返回 JSON 对象，键为有证据的格名，值为 {"ref":"给定编号","advice":"一句可执行的中文练习建议"}。每条建议不超过40字，只描述动作，不添加数字、知识点、成绩、时间、链接或新的事实。空格省略。另外，openingEvidence 是本期学生的分科学习记录，自主模考与作业分别统计。根据这些记录分析整份报告。如有记录，额外返回 opening:{"observations":["给定的事实id"],"nextStep":"面向学生的一句建议"}。选择一条最能说明进展的事实，必要时再选同科或另一科一条互补的事实。事实会自动原样显示。nextStep 限40字，直接用自然、鼓励的中文，给出与这些事实契合的下一步练习动作。直接对学生说话，省略署名、模型名称和工具来源。不复述数字，不虚构知识点、原因、测验安排或未来成绩。只有总分时避免推断具体技能，无时间序列不判断趋势。'},
      {role:'user',content:JSON.stringify(input)}
    ],{json:true,maxTokens:1150,signal:AbortSignal.timeout(22000)});
    const selections={};
    for(const slot of slots){
      const r=result?.[slot];
      if(!r||!facts.candidates[slot].some(c=>c.ref===r.ref))continue;
      const text=typeof r.advice==='string'?r.advice.trim():'';
      const valid=text.length>0&&text.length<=48&&!/[0-9０-９%<>\r\n]|https?:|考试预测|一定能|明天|今天|截止/.test(text);
      selections[slot]={ref:r.ref,advice:valid?text:''};
    }
    const opening=modelOpening(result?.opening,facts.opening);
    if(facts.opening.length)assert(opening,'本次评语缺少可核对的依据，请重试',503);
    assert(opening||Object.keys(selections).length,'暂未获得有依据的分析',503);
    await db.put('report-bento-ai',{id:key,selections,opening});
    return selections;
  })();
  pending.set(key,work);
  try{return await work;}finally{pending.delete(key);}
}

function reminderSlot(task,at){
  const remaining=Date.parse(task.due)-at;
  const urgent=remaining>=0&&remaining<=2*day;
  return task.important?(urgent?'now':'plan'):(urgent?'quick':'later');
}

export function teacherTasks(tasks,at){
  const time=Date.parse(at),bySlot={};
  for(const t of [...tasks].sort((a,b)=>(Date.parse(a.due)||Infinity)-(Date.parse(b.due)||Infinity))){
    if(t.due&&Date.parse(t.due)<time)continue;
    const slot=reminderSlot(t,time);
    if(!bySlot[slot])bySlot[slot]={ref:t.id,subject:t.subject,course:t.course,title:t.title,text:t.text,
      basis:'教师在本报告中指定。'+(t.due?'办理时间为 '+localDate.format(Date.parse(t.due))+'。':'未设置办理时间。'),manual:true,due:t.due,important:t.important};
  }
  return bySlot;
}

export async function reportState(db,scope,facts){
  const [ai,editor]=await Promise.all([db.get('report-bento-ai:'+scope+':'+facts.version),db.get('report-bento-edit:'+scope)]);
  return {ai:ai?.selections||{},opening:ai?.opening||null,edits:editor?.edits||{},revision:editor?.revision||0,hasAI:Boolean(ai),tasks:editor?.tasks||[]};
}
export async function editReport(db,scope,facts,body,report){
  assert(body.version===facts.version,'学习记录已更新，请刷新报告后修改',409);
  const fact=Object.values(facts.candidates).flat().find(f=>f.ref===body.ref);
  const custom=body.action==='task';
  if(custom){
    assert(report.courses.some(c=>c.course===body.course)&&typeof body.important==='boolean','请选择本报告的学科和重要性');
    assert(typeof body.title==='string'&&body.title.trim()&&body.title.trim().length<=40&&typeof body.text==='string'&&body.text.trim().length<=160,'任务标题限 40 字，说明限 160 字');
    assert(!body.due||typeof body.due==='string'&&Number.isFinite(Date.parse(body.due))&&Date.parse(body.due)>=Date.parse(report.at),'请选择尚未到达的办理时间');
  }else if(body.action!=='remove-task'){
    assert(fact&&typeof body.text==='string'&&body.text.trim().length<=160,'请选择报告中的依据，评语最多 160 字');
  }
  const id='report-bento-edit:'+scope;
  await db.tx(async client=>{
    const old=await db.get(id,client);
    assert((old?.revision||0)===body.revision,'报告已在其他页面修改，请刷新后再保存',409);
    const edits={...old?.edits};
    let tasks=old?.tasks||[];
    if(custom){
      const task={course:body.course,subject:report.courses.find(c=>c.course===body.course).label,title:body.title.trim(),text:body.text.trim(),
        due:body.due?new Date(body.due).toISOString():'',important:body.important};
      task.id='task-'+hash(JSON.stringify(task)).slice(0,20);
      const current=teacherTasks(tasks,report.at)[reminderSlot(task,Date.parse(report.at))];
      assert(!current||current.ref===body.ref||current.ref===task.id,'这个象限已有教师任务，请打开原任务修改',409);
      if(body.ref)assert(tasks.some(t=>t.id===body.ref),'原任务已更新，请刷新报告',409);
      tasks=tasks.filter(t=>t.id!==task.id&&t.id!==body.ref).concat(task);
    }else if(body.action==='remove-task'){
      assert(tasks.some(t=>t.id===body.ref),'任务已更新',409);
      tasks=tasks.filter(t=>t.id!==body.ref);
    }else if(body.text.trim())edits[fact.ref]=body.text.trim();else delete edits[fact.ref];
    await db.put('report-bento-edit',{id,edits,tasks,revision:(old?.revision||0)+1},client);
  },id);
}
