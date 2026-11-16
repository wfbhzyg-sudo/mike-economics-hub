import test from 'node:test';
import assert from 'node:assert/strict';
import {assignmentState} from '../homework/learning-model.js';
import {studentAssignmentAction} from '../homework/assignment-navigation.js';

const offline={id:'offline-1',title:'Unit Test',format:'score',offline:true,dueAt:'2026-11-20T12:00:00.000Z',classIds:['bookself-class:c1']};

test('offline assignments are read-only until the teacher records a score',()=>{
  const state=assignmentState(offline,[],Date.parse('2026-11-16T00:00:00Z'));
  assert.equal(state.key,'offline');
  assert.equal(state.label,'待老师录分');
  const action=studentAssignmentAction(offline,[],Date.parse('2026-11-16T00:00:00Z'));
  assert.equal(action.target,null);
  assert.equal(action.action,'等待老师录分');
});

test('a published offline score opens the result instead of the submit page',()=>{
  const submission={id:'s1',assignmentId:'offline-1',status:'published',submittedAt:'2026-11-15T00:00:00.000Z',publishedGrade:{total:86,maxPoints:100,scoreOnly:true,questions:[]}};
  const state=assignmentState(offline,[submission],Date.parse('2026-11-16T00:00:00Z'));
  assert.equal(state.key,'done');
  assert.equal(state.label,'已录分');
  const action=studentAssignmentAction(offline,[submission],Date.parse('2026-11-16T00:00:00Z'));
  assert.equal(action.target,'result/s1');
  assert.equal(action.action,'查看成绩');
});
