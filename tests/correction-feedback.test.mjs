import test from 'node:test';
import assert from 'node:assert/strict';
import {correctionFeedback} from '../homework-server/correction-feedback.mjs';
import {mistakeRows} from '../homework-server/learning.mjs';

test('completed corrections use the submitted question key and keep the published score',()=>{
  const q={type:'choice',id:'1',maxPoints:1,correctOptions:['B']};
  const grade={questions:[{id:'1',score:0,maxPoints:1}]};
  const submission={id:'s',assignmentId:'a',studentId:'u',version:1,rubricSnapshot:[q],publishedGrade:grade};
  const assignments=[{id:'a',version:2,rubric:[{...q,correctOptions:['C']}]}];
  const row=(corrections=[])=>mistakeRows([submission],assignments,[{studentId:'u',assignmentId:'a',questionId:'1',corrections}])[0];
  assert.equal(row().correctionFeedback,null);
  const wrong={submissionId:'s',text:'新答案：C'},right={submissionId:'s',text:'新答案：B'};
  assert.deepEqual(row([wrong]).correctionFeedback,{state:'incorrect',choice:'C',answer:'B'});
  assert.deepEqual(row([wrong,right]).correctionFeedback,{state:'correct',choice:'B',answer:'B'});
  assert.equal(row([right]).score,0);
  assert.equal(row([{...right,submissionId:'older'}]).correctionFeedback,null);
});
test('manual keys, attachments, multiple choices and written answers have explicit outcomes',()=>{
  const q={type:'choice',correctOptions:['B','D']};
  assert.equal(correctionFeedback(q,{text:'新答案：DB'}).state,'correct');
  assert.equal(correctionFeedback(q,{files:['x']}).state,'compare');
  assert.deepEqual(correctionFeedback({...q,manualGradingRequired:true},{text:'D'}),{state:'pending'});
  assert.deepEqual(correctionFeedback({type:'short',answer:'Increase in demand',criteria:'private rubric'},{text:'demand rises'}),{state:'compare',answer:'Increase in demand'});
  assert.equal(correctionFeedback(q,{text:'   '}),null);
});

test('worklist, teacher profile and analytics use the same correction progress on the current attempt',async()=>{
  const {attachReview}=await import('../homework-server/correction-review.mjs');
  const {correctionCounts}=await import('../homework/learning-model.js');
  const {correctionSummary}=await import('../homework/learning-analytics-model.js');
  const question={id:'1',type:'choice',correctOptions:['B'],maxPoints:1};
  const a={id:'a',version:1,rubric:[question]},s={id:'current',assignmentId:a.id,studentId:'u',version:1,
    submittedAt:'2026-11-21',rubricSnapshot:[question],publishedGrade:{total:0,questions:[{id:'1',score:0,maxPoints:1}]}};
  const check=(entry,review,expected)=>{
    const note={studentId:'u',assignmentId:'a',questionId:'1',status:'mastered',note:'Private study note',corrections:entry?[entry]:[]};
    for(const compact of [false,true]){
      const [row]=mistakeRows([s],[a],[note],[],{progressOnly:compact});
      const view=attachReview(row,review&&{status:review});
      assert.equal(correctionCounts([view])[expected],1);
      if(!compact)assert.equal(correctionSummary({mistakes:[view]},'u',[a])[expected],1);
    }
    assert.equal(s.publishedGrade.total,0);
  };
  const right={submissionId:'current',text:'新答案：B'};
  check(null,null,'open');
  check({...right,submissionId:'old'},null,'open');
  check({...right,text:'新答案：A'},null,'open');
  check(right,null,'mastered');
  for(const status of ['queued','running','manual'])check(right,status,'review');
  check(right,'revise','open');check(right,'passed','verified');
});
