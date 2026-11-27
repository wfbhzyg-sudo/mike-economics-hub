import test from 'node:test';
import assert from 'node:assert/strict';
import {correctionProgress,questionCorrection,correctionLog,studentRecoveryMarkup} from '../homework/correction-progress.js';
import {assignmentRecords} from '../homework/learning-model.js';
const q={id:'61',score:0,maxPoints:2};
const make=(id,total,max,recovered=0,extra={})=>({id,studentId:'s',assignmentId:id,status:'published',publishedGrade:{total,maxPoints:max,questions:[q],scoreSources:{first:total-recovered,recovered,byQuestion:recovered?{'61':recovered}:{}},...extra}});
const pass=(id,at)=>({submissionId:id,questionId:'61',verification:{status:'passed',finishedAt:at}});
const records=rows=>assignmentRecords(rows,rows.map(s=>({id:s.assignmentId,title:s.assignmentId})));
test('current grades use equal assignment percentages; blanks excluded, zero included, accepted at cap counts once',()=>{
 const rs=records([make('a',8,10,2),make('b',16,20,0),make('z',0,20),make('missing',null,20)]);
 const view=correctionProgress([...rs,rs[0]],[pass('a','2026-11-27'),pass('b','2026-11-26'),pass('a','2026-11-27')]);
 assert.equal(view.count,3);assert.equal(view.passed,2);assert.equal(view.submitted,2);assert.equal(view.recovered,2);
 assert.ok(Math.abs(view.average-160/3)<1e-8);assert.ok(Math.abs(view.gain-20/3)<1e-8);
 assert.deepEqual(view.entries.map(x=>[x.assignmentId,x.credit]),[['a',2],['b',0]]);
 assert.match(studentRecoveryMarkup(view,String),/46.67%.*53.33%/);
});
test('fixed total, retry of the same assignment, practice-only pass and unverified self-rating remain distinct',()=>{
 const fixed=make('a',17,20,2,{manualTotal:true});const old={...make('old',5,20,4),assignmentId:'a',submittedAt:'2026-10-01'};
 fixed.submittedAt='2026-11-27';
 const rows=[pass('old','2026-11-01'),pass('a','2026-11-26'),{submissionId:'b',questionId:'61',progressStatus:'mastered'}];
 const view=correctionProgress(records([old,fixed,make('b',2,10)]),rows);
 assert.equal(view.gain,0);assert.equal(view.fixed,1);assert.equal(view.passed,1);assert.equal(view.submitted,1);assert.equal(view.recovered,2);
 assert.equal(questionCorrection(fixed.publishedGrade,{...q,score:2},null),null);
 assert.equal(questionCorrection({},q,{verification:{status:'manual'},correctionFeedback:{state:'correct'}}).status,'manual');
 assert.equal(correctionProgress([],rows).gain,null);
});
test('empty, pending, returned and legacy matched choices never become approved',()=>{
 const inputs=[{progressStatus:'todo'},{verification:{status:'queued'}},{verification:{status:'revise'}},{correctionFeedback:{state:'correct'}}];
 assert.deepEqual(inputs.map(m=>questionCorrection({},q,m)?.status),[undefined,'queued','revise','matched']);
 assert.match(correctionLog([],String),/没有作业订正记录/);
});
