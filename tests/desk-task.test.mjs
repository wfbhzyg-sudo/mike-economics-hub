import test from 'node:test';
import assert from 'node:assert/strict';
import {affectsDeskTask,deskPage,onDeskPage} from '../assets/notebook/desk-context.js';
import {deskTask} from '../homework-server/desk-task.mjs';

const clock=Date.parse('2026-11-19T08:00Z');
const assignment=(title,day)=>({title,id:title,dueAt:day?`2026-11-${day}T09:00:00Z`:null});
async function studentTask(assignments,submissions=[]){
  const results=[assignments,submissions];
  const db={query:async()=>({rows:results.shift()})};
  return deskTask(db,{role:'student',id:'learner',classIds:['micro','macro']},clock);
}
test('only actionable work competes for the nearest deadline',async()=>{
  const a=assignment('draft',20);
  const due=await studentTask([assignment('submitted',19),assignment('later',24),a,
    {...assignment('scheduled',19),opensAt:'2026-11-19T08:30Z'},assignment('closed',17),
    {...assignment('late',18),allowLate:true},assignment('independent',null)],
    [{id:'done',assignmentId:'submitted',status:'queued'},{id:'d',assignmentId:a.id,status:'draft'}]);
  assert.deepEqual(due,{id:a.id,title:a.title,dueAt:a.dueAt});
});
test('returned work can be resubmitted after its original deadline',async()=>{
  const a=assignment('returned',18);
  assert.deepEqual(await studentTask([assignment('undated',null),a],[{id:'r',assignmentId:a.id,status:'returned'}]),{id:a.id,title:a.title,dueAt:a.dueAt});
});
test('empty paper when all work is closed or already submitted',async()=>{
  assert.equal(await studentTask([assignment('closed',15),assignment('finished',23)],[{id:'p',assignmentId:'finished',status:'published'}]),null);
});

test('desk task routes keep the logical page, other parameters, and the workbench hash',()=>{
  const entry=new URL(onDeskPage('/teacher/?view=work#work/reviews/queue/requests',3),'https://local.invalid');
  assert.equal(deskPage(entry.searchParams),3);
  assert.equal(entry.searchParams.get('view'),'work');
  assert.equal(entry.hash,'#work/reviews/queue/requests');
  assert.equal(onDeskPage('/',0),'/?deskPage=0');
  for(const invalid of ['', '01','-1','0.5','10000','//elsewhere']){
    assert.equal(deskPage(new URLSearchParams({deskPage:invalid})),null);
  }
  assert.equal(deskPage(new URLSearchParams()),null);
});

test('only completed desk work invalidates the paper, not answer autosaves or draft scores',()=>{
  for(const route of ['mcq/attempt/a/submit','submissions/a/publish','submissions/a/review-request','submissions/a/return']){
    assert.equal(affectsDeskTask(route,{method:'POST'}),true);
    assert.equal(affectsDeskTask(route,{method:'GET'}),false);
  }
  assert.equal(affectsDeskTask('submissions',{method:'POST',body:{draft:false}}),true);
  assert.equal(affectsDeskTask('submissions',{method:'POST',body:{draft:true}}),false);
  assert.equal(affectsDeskTask('mcq/attempt/a',{method:'POST'}),false);
  assert.equal(affectsDeskTask('submissions/a/review-draft',{method:'PUT'}),false);
});

test('desk offers enabled offline makeups and skips pending or recorded work, including zero',async()=>{
  const a={...assignment('makeup',18),offline:true,allowLate:true,makeupMode:'upload'};
  assert.equal((await studentTask([a])).id,a.id);
  assert.equal(await studentTask([a],[{id:'s',assignmentId:a.id,offlineMakeup:true,status:'needs_review'}]),null);
  assert.equal(await studentTask([a],[{id:'s',assignmentId:a.id,manualScoreEntry:true,status:'published',publishedGrade:{total:0}}]),null);
});
