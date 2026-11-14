import test from 'node:test';
import assert from 'node:assert/strict';
import {cellFor} from '../homework/grade-journey-model.js';
import {submissionLabel} from '../homework/ui-labels.js';
import {studentAssignmentAction} from '../homework/assignment-navigation.js';
import {assignmentRecords} from '../homework/learning-model.js';
test('interrupted grading shows a recoverable state without asking for another submission',()=>{
 const assignment={id:'a',published:true,allowResubmit:false};
 const old={id:'s1',assignmentId:'a',studentId:'u',status:'published',submittedAt:'2026-11-12',publishedGrade:{total:8,maxPoints:10,questions:[]}};
 const failed={id:'s2',assignmentId:'a',studentId:'u',status:'failed',submittedAt:'2026-11-13'};
 const next=studentAssignmentAction(assignment,[old,failed]);
 assert.equal(next.label,'批阅暂未完成');assert.equal(next.target,'result/s2');assert.equal(next.action,'查看进度');
 assert.equal(assignmentRecords([old,failed],[assignment])[0].grade.total,8);
 assert.equal(submissionLabel('needs_review','teacher'),'待复核');
 assert.equal(submissionLabel('unrecognized'),'状态待确认');
});

test('scheduled work has the same unavailable label in assignments and the grade journey',()=>{
 const time=Date.parse('2026-11-14T12:00:00Z');
 const a={id:'future',opensAt:'2026-11-15T12:00:00Z',audience:{required:true}};
 assert.equal(cellFor(a,{id:'student'},null,time).label,studentAssignmentAction(a,[],time).label);
 assert.equal(studentAssignmentAction(a,[],time).target,null);
});
