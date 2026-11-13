import test from 'node:test';
import assert from 'node:assert/strict';
import {menuPlacement} from '../homework/disclosure-menu.js';
import {libraryLocation,packReference,packQuestions} from '../homework/library-navigation.js';
import {studentAssignmentAction} from '../homework/assignment-navigation.js';
import {publicAssignment} from '../homework-server/api.mjs';

test('Reader menus fit narrow screens even after toolbar wrapping or keyboard resize',()=>{
  for(const width of [320,360,390,768]) for(const right of [40,270,width-10]){
    const p=menuPlacement({top:225,bottom:269,right},{width:240,height:208},{width,height:640});
    assert(p.left>=8);assert(p.left+p.width<=width-8);assert(p.top+Math.min(p.maxHeight,208)<=632);
  }
  const p=menuPlacement({top:225,bottom:269,right:280},{width:240,height:208},{width:390,height:320});
  assert(p.top<225);assert(p.top>=8);assert(p.top+Math.min(208,p.maxHeight)<=219);
});
test('Resume returns to the last lesson and reading mode without overriding explicit navigation',()=>{
  const units=[{id:'micro-unit-2'},{id:'macro-unit-3'}],last={unit:'macro-unit-3',topic:'3.2',mode:'textbook'};
  assert.deepEqual(libraryLocation(units,last),{unitId:'macro-unit-3',topicId:'3.2',mode:'textbook'});
  assert.deepEqual(libraryLocation(units,last,'micro-unit-2','2.3','slides'),{unitId:'micro-unit-2',topicId:'2.3',mode:'slides'});
  assert.equal(libraryLocation(units,{...last,unit:'macro-unit-6'}).unitId,'micro-unit-2');
  assert.equal(libraryLocation(units,{...last,mode:'project'}).mode,'');
  assert.deepEqual(packReference('progress:library-source:choice:40'),{collection:'progress',id:'library-source:choice:40'});
  assert.equal(packReference('unknown:x'),null);
});
test('Practice opens published feedback or pending review rather than restarting an attempt',()=>{
  const a={id:'a',format:'mcq',allowResubmit:true};
  const published={id:'s1',assignmentId:'a',studentId:'s',status:'published',submittedAt:'2026-11-13T12:00:00Z',publishedGrade:{total:2,maxPoints:3}};
  assert.equal(studentAssignmentAction(a,[]).target,'submit/a');
  assert.equal(studentAssignmentAction(a,[published]).target,'result/s1');
  assert.equal(studentAssignmentAction(a,[published]).action,'查看反馈');
  const pending={...published,id:'s2',status:'needs_review',submittedAt:'2026-11-13T13:00:00Z'};
  assert.equal(studentAssignmentAction(a,[published,pending]).action,'查看进度');
  assert.equal(studentAssignmentAction(a,[published,pending]).target,'result/s2');
  assert.equal(studentAssignmentAction(a,[{...pending,status:'returned'}]).target,'submit/a');
  assert.equal(studentAssignmentAction({...a,format:'written'},[]).target,'submit/a');
});
test('Scheduled practice cannot appear ready to start; past grades remain reachable',()=>{
  const now=Date.parse('2026-11-14T00:00:00Z'),a={id:'a',opensAt:'2026-11-15T00:00:00Z'};
  assert.equal(studentAssignmentAction(a,[],now).target,null);
  assert.equal(studentAssignmentAction(a,[],now).label,'尚未开放');
  const old={id:'s1',assignmentId:'a',status:'published',submittedAt:'2026-11-12T00:00:00Z'};
  assert.equal(studentAssignmentAction(a,[old],now).target,'result/s1');
});
test('Pack preview uses the exact publication order rather than database insertion order',()=>{
  const questions=[{id:'q3',number:3,answer:'E'},{id:'q1',number:1,answer:'B'},{id:'q2',number:2,answer:'A'}];
  assert.deepEqual(packQuestions(questions,['q1','q2','q3']).map(q=>[q.number,q.answer]),[[1,'B'],[2,'A'],[3,'E']]);
  assert.equal(packQuestions(questions),questions);
});
test('Student assignment carries course navigation without exposing answer keys or reference files',()=>{
  const raw={id:'a',course:'AP Micro',libraryUnit:'micro-unit-2',libraryCollection:'unit',libraryCourse:'micro',
    answerText:'SECRET_REFERENCE',answerFiles:['SECRET_FILE'],rubric:[{id:'1',type:'choice',prompt:'Question',maxPoints:1,correctOptions:['C'],answer:'SECRET_ANSWER',options:[{label:'A'},{label:'C'}]}]};
  const safe=publicAssignment(raw),json=JSON.stringify(safe);
  assert.equal(safe.libraryUnit,'micro-unit-2');assert.equal(safe.libraryCourse,'micro');
  assert(!json.includes('SECRET'));assert(!json.includes('correctOptions'));assert.equal(safe.questions[0].id,'1');
  assert.equal(publicAssignment({...raw,libraryUnit:null,libraryCollection:'exam'}).libraryCollection,'exam');
});
