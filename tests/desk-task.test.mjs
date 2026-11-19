import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.deepEqual(due,{title:a.title,dueAt:a.dueAt});
});
test('returned work can be resubmitted after its original deadline',async()=>{
  const a=assignment('returned',18);
  assert.deepEqual(await studentTask([assignment('undated',null),a],[{id:'r',assignmentId:a.id,status:'returned'}]),{title:a.title,dueAt:a.dueAt});
});
test('empty paper when all work is closed or already submitted',async()=>{
  assert.equal(await studentTask([assignment('closed',15),assignment('finished',23)],[{id:'p',assignmentId:'finished',status:'published'}]),null);
});
