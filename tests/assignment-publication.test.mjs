import {test} from 'node:test';
import assert from 'node:assert/strict';
import {byPublication, publicationTime} from '../homework/assignment-navigation.js';

test('published work uses the first release or original paper date in both directions', () => {
  const rows = [
    {id:'draft-2', published:false}, {id:'past', published:true, publishedAt:'2026-10-01T00:00:00Z', updatedAt:'2027-03-20'},
    {id:'draft-1'}, {id:'no-date', published:true, createdAt:'2026-12-01', opensAt:'2027-01-01', dueAt:'2027-03-01', recipients:{at:'2026-12-01'}},
    {id:'paper', published:true, offline:true, opensAt:'2026-11-11T00:00:00+08:00', createdAt:'2026-12-12'},
    {id:'same-b', published:true, publishedAt:'2026-11-15T05:00:00Z'}, {id:'same-a', published:true, publishedAt:'2026-11-15T13:00:00+08:00'}
  ];
  const original = structuredClone(rows);
  const ids = order => byPublication(rows, order).map(row => row.id);
  assert.deepEqual(ids('desc'), ['same-a','same-b','paper','past','no-date','draft-2','draft-1']);
  assert.deepEqual(ids('asc'), ['past','paper','same-a','same-b','no-date','draft-2','draft-1']);
  assert.deepEqual(rows, original);
  assert.equal(publicationTime({published:true, publishedAt:'invalid'}), null);
  assert.equal(publicationTime({published:true, format:'score', createdAt:'2027-01-01'}), null);
});

test('learning order resumes the saved question and keeps the closest open deadline visible',async()=>{
 const {byLearningPriority,studentAssignmentAction}=await import('../homework/assignment-navigation.js');
 const now=Date.parse('2026-11-24T05:00Z');
 const task=(id,extra={})=>({id,published:true,publishedAt:'2026-11-22',format:'mcq',...extra});
 const active=task('active',{attemptProgress:{started:true,index:6,answered:1,updatedAt:'2026-11-24'}});
 const old=task('old',{attemptProgress:{started:true,index:1,updatedAt:'2026-11-23'}});
 const due=task('due',{dueAt:'2026-11-25'}),late=task('late',{dueAt:'2026-11-20',allowLate:true});
 const future=task('not-yet',{opensAt:'2026-11-26',dueAt:'2026-11-27'}),graded=task('graded');
 const subs=[{id:'s',assignmentId:'graded',status:'published',publishedGrade:{total:1}}];
 assert.deepEqual(byLearningPriority([graded,future,late,old,due,active],subs,now).slice(0,4).map(a=>a.id),['active','due','old','late']);
 const resume=studentAssignmentAction(active,subs,now);
 assert.equal(resume.target,'mcq/active');assert.equal(resume.action,'继续第 7 题');
 assert.equal(studentAssignmentAction(future,subs,now).target,null);
});
