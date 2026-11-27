import test from 'node:test';
import assert from 'node:assert/strict';
import {buildReportAnalysis,personalizeReport,reportScope,representativeWorks,selectedItems,editReport,teacherTasks} from '../homework-server/student-report-analysis.mjs';

const at='2026-11-23T08:00:00Z';
function grade(course,i,recovered=0) {
  const grade={total:7+recovered,maxPoints:10,scoreSources:{original:7,recovered}};
  return {status:'graded',assignment:{id:course+i,title:'私人名称'+i,createdAt:at},record:{grade,effective:{id:'s'+i},attempts:[]}};
}
function report(){
  return {at,courses:['micro','macro'].map(course=>({course,label:course,graded:5,
    cells:[...Array.from({length:5},(_,i)=>grade(course,i,i===2?1:0)),{assignment:{id:course+'due',title:'未公布姓名',dueAt:'2026-11-24T07:00:00Z'},status:'todo'}],
    practiceItems:[],evidence:{axes:[]}}))};
}
test('representative evidence covers both courses and preserves all graded denominators',()=>{
  const r=report(),f=buildReportAnalysis(r),items=selectedItems(f);
  assert.equal(buildReportAnalysis({...r,at:"2026-11-23T08:00:04Z"}).version,f.version);
  const rows=representativeWorks(r,items);
  assert(rows.length<=3);
  assert.deepEqual(new Set(rows.map(r=>r.course)),new Set(['micro','macro']));
  assert.equal(rows.filter(r=>r.cell.assignment.id.endsWith('2')).length,2);
  assert.equal(r.courses.reduce((n,c)=>n+c.graded,0),10);
  const empty=report();for(const c of empty.courses)c.cells.at(-1).assignment.dueAt=null;
  const open=selectedItems(buildReportAnalysis(empty));assert.equal(open.now,null);assert.equal(open.T,null);
  assert(items.now&&items.T);assert.equal(items.quick,null);
});
test('AI uses opaque references, rejects invented evidence and shares a single in-flight request',async()=>{
  const r=report(),f=buildReportAnalysis(r),rows=new Map();
  const db={get:async k=>rows.get(k),put:async(_,v)=>rows.set(v.id,v)};
  let calls=0;
  const ask=async(d,k,msgs)=>{
    calls++;assert(!msgs[1].content.includes('私人名称'));assert(!msgs[1].content.includes('未公布姓名'));
    await new Promise(resolve=>setTimeout(resolve,8));
    return {opening:{observations:[f.opening[0].id],nextStep:'回到订正过的题目，把关键一步独立写出来。'},S:{ref:f.candidates.S[0].ref,advice:'请回看改动的那一步。'},now:{ref:'invented',advice:'假的'},T:{ref:f.candidates.T[0].ref,advice:'一定能得到100分'}};
  };
  const both=await Promise.all([personalizeReport(db,null,'scope',f,ask),personalizeReport(db,null,'scope',f,ask)]);
  assert.equal(calls,1);assert.equal(both[0].S.advice,'请回看改动的那一步。');assert(!both[0].now);assert.equal(both[0].T.advice,'');
  await personalizeReport(db,null,'scope',f,ask);assert.equal(calls,1);
  assert.notEqual(reportScope('a',new URLSearchParams({student:'1'})),reportScope('b',new URLSearchParams({student:'1'})));
});
test('teacher reminders require real time to be urgent and edits retain optimistic concurrency',async()=>{
  const r=report(),f=buildReportAnalysis(r),rows=new Map();
  const db={get:async k=>rows.get(k),put:async(_,v)=>rows.set(v.id,v),tx:async fn=>fn({})};
  const body={action:'task',title:'带方格纸',text:'试画坐标轴',due:'2026-11-24T00:00:00Z',course:'macro',important:false,revision:0,version:f.version};
  await editReport(db,'scope',f,body,r);
  const tasks=rows.get('report-bento-edit:scope').tasks;
  assert(teacherTasks(tasks,r.at).quick);assert.deepEqual(teacherTasks(tasks,'2026-11-25'),{});
  assert(teacherTasks([{...tasks[0],due:''}],r.at).later);
  await assert.rejects(editReport(db,'scope',f,body,r));
  await assert.rejects(editReport(db,'scope',f,{...body,revision:1,version:'stale'},r));
  await editReport(db,'scope',f,{action:'remove-task',ref:tasks[0].id,revision:1,version:f.version},r);
  assert.equal(rows.get('report-bento-edit:scope').tasks.length,0);
});

test('overview-only grades and mock-only results support an opening without inventing first-attempt or skill evidence',async()=>{
  const {modelOpening,recordOpening}=await import('../homework-server/student-report-opening.mjs');
  const {reportState}=await import('../homework-server/student-report-analysis.mjs');
  const {renderStudentReport}=await import('../homework-server/student-report-view.mjs');
  const r={name:'私人姓名',classNames:['私人班名'],period:'最近四周',at,includeMock:true,courses:[
    {course:'micro',label:'AP 微观',average:0,graded:1,cells:[{...grade('micro',1),assignment:{id:'private',title:'隐私题目',offline:true}}]},
    {course:'macro',label:'AP 宏观',average:null,graded:0,cells:[],mockHistory:[{rate:75}]}]};
  const f=buildReportAnalysis(r);
  assert.deepEqual(f.opening.map(x=>x.id),['micro.average','macro.practice']);
  assert(Object.values(f.candidates).every(v=>!v.length));
  assert.match(recordOpening(f.opening),/0%/);
  const noData=buildReportAnalysis({...r,courses:[]});
  assert.equal(noData.opening.length,0);assert.match(recordOpening([]),/记录还较少/);
  const answer={observations:['micro.average','macro.practice'],nextStep:'先独立写出思路，再对照原作答。'};
  assert.match(modelOpening(answer,f.opening),/0%。宏观最近一次自主模考正确率为 75%。/);
  assert.equal(modelOpening({...answer,observations:['invented']},f.opening),null);
  assert.equal(modelOpening({...answer,nextStep:'你一定能考到5分'},f.opening),null);
  assert.notEqual(buildReportAnalysis({...r,courses:[{...r.courses[0],average:1},r.courses[1]]}).version,f.version);
  const rows=new Map();const db={get:async k=>rows.get(k),put:async(_,v)=>rows.set(v.id,v)};
  const bad=async()=>({opening:{observations:['invalid'],nextStep:'试试。'}});
  await assert.rejects(personalizeReport(db,null,'student',f,bad));assert.equal(rows.size,0);
  await personalizeReport(db,null,'student',f,async(_db,_key,messages)=>{
    assert(!/隐私题目|私人姓名|私人班名/.test(messages[1].content));
    assert.deepEqual(JSON.parse(messages[1].content).openingEvidence,f.opening);
    return {opening:answer};
  });
  const state=await reportState(db,'student',f);
  assert.equal(state.opening,modelOpening(answer,f.opening));
  const page=await renderStudentReport(r,f,state);
  assert(page.includes(state.opening));assert(!/deep[\s-]*seek/i.test(page));
  const legacy=await renderStudentReport(r,f,{...state,opening:'微观得分率为 80%。DeepSeek 建议：先画出均衡点。'});
  assert(!/deepseek/i.test(legacy));assert(legacy.includes('微观得分率为 80%。先画出均衡点。'));
  const fallback=await renderStudentReport(r,f,{...state,opening:'来自 DEEPSEEK。'});
  assert(!/deepseek/i.test(fallback));assert(fallback.includes(recordOpening(f.opening)));
  assert.match(modelOpening({...answer,nextStep:'DeepSeek 建议你先标出均衡点。'},f.opening),/。你先标出均衡点。$/);
  assert.equal(modelOpening({...answer,nextStep:'先画图，再询问 DeepSeek。'},f.opening),'本期 1 份已出分的微观作业，平均得分率为 0%。宏观最近一次自主模考正确率为 75%。');
  assert(page.indexOf('id="opening-title"')<page.indexOf('<section class="report-course"'));
});
