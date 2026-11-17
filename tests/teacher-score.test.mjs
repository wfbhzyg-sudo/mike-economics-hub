import test from 'node:test';
import assert from 'node:assert/strict';
import {editTeacherScore} from '../homework-server/teacher-score.mjs';
import {assignmentRecords, gradeSummary, assignmentState} from '../homework/learning-model.js';
import {scoreBand} from '../homework/score-bands.js';
const assignment = {id:'a',maxPoints:10,rubric:[{id:'1',maxPoints:10}]};
const submission = {id:'s',studentId:'u',assignmentId:'a',status:'published',submittedAt:'2026-11-01',text:'original',files:['original'],publishedGrade:{total:8,maxPoints:10,revision:1,questions:[{id:'1',score:8,maxPoints:10}]}};
test('online total changes preserve original work, item marks and each prior score',()=>{
 const zero=editTeacherScore(submission,assignment,{score:0,revision:1},'t','now');
 assert.equal(zero.publishedGrade.total,0);assert.deepEqual(zero.files,submission.files);assert.deepEqual(zero.publishedGrade.questions,submission.publishedGrade.questions);assert.equal(zero.gradeHistory[0].total,8);assert.equal(submission.publishedGrade.total,8);
 const blank=editTeacherScore(zero,assignment,{score:null,revision:2},'t','later');
 assert.equal(blank.publishedGrade.total,null);assert.equal(blank.gradeHistory.at(-1).total,0);
 assert.equal(gradeSummary(assignmentRecords([blank])).average,null);
 assert.equal(gradeSummary(assignmentRecords([zero])).average,0);
});
test('blank newer grade suppresses earlier score rather than falling back',()=>{
 const newer={...submission,id:'new',submittedAt:'2026-11-02',publishedGrade:{total:null,maxPoints:10,absent:true,questions:[]}};
 const record=assignmentRecords([submission,newer])[0];assert.equal(record.effective.id,'new');assert.equal(record.grade.total,null);assert.equal(gradeSummary([record]).count,0);
});
test('invalid scores and stale edits fail without modifying input',()=>{
 for(const score of ['',false,'5',NaN,Infinity,-1,11])assert.throws(()=>editTeacherScore(submission,assignment,{score,revision:1},'t','now'));
 assert.throws(()=>editTeacherScore(submission,assignment,{score:5,revision:0},'t','now'),e=>e.status===409);
 assert.equal(editTeacherScore({...submission,publishedGrade:null,status:'needs_review'},assignment,{score:5,revision:0},'t','now').publishedGrade.total,5);
});
test('blank cells can receive zero, teacher entry is not a student attempt',()=>{
 const entry=editTeacherScore({id:'entry',assignmentId:'a',studentId:'u',status:'published',manualScoreEntry:true},assignment,{score:0,revision:0},'t','now');
 assert.equal(entry.submittedAt,undefined);assert.equal(entry.publishedGrade.revision,1);
 assert.equal(assignmentState({...assignment,allowResubmit:false},[entry]).latest,undefined);
});
test('five average color bands cover exact boundaries, zero and empty',()=>{
 assert.deepEqual([0,19.9,20,39.9,40,59.9,60,79.9,80,100].map(x=>scoreBand(x).level),[1,1,2,2,3,3,4,4,5,5]);assert.equal(scoreBand(null),null);
});

test('missing denominator can be entered explicitly; overrides preserve raw answers and publish',()=>{
 const raw={id:'new',status:'queued',jobId:'job',text:'original',files:['photo'],choices:{1:'A'}};
 const result=editTeacherScore(raw,{rubric:[]},{score:18,maxPoints:20,revision:0},'teacher','now');
 assert.equal(result.publishedGrade.maxPoints,20);assert.equal(result.publishedGrade.total,18);assert.equal(result.status,'published');assert.equal(result.jobId,null);assert.deepEqual(result.choices,raw.choices);
 assert.throws(()=>editTeacherScore(raw,{}, {score:18,maxPoints:0,revision:0},'t','now'));
 assert.throws(()=>editTeacherScore(raw,{}, {score:18,maxPoints:10,revision:0},'t','now'));
});
test('legacy offline full marks: use explicit, then verified peer denominator; adjusted declared max is not silently guessed',async()=>{
 const {scoreMaximum}=await import('../homework/score-entry.js');
 assert.equal(scoreMaximum({declaredMax:10,maxAdjusted:false}),10);
 assert.equal(scoreMaximum({declaredMax:10,maxAdjusted:true}),null);
 assert.equal(scoreMaximum({declaredMax:10,maxAdjusted:true},[{maxPoints:15}]),15);
 assert.equal(scoreMaximum({maxPoints:20},[{maxPoints:15}]),20);
});
