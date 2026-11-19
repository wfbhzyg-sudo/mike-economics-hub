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
