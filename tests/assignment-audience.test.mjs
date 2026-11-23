import test from 'node:test';
import assert from 'node:assert/strict';
import {assignmentAudience, studentCanAccessAssignment} from '../homework-server/assignment-audience.mjs';
import {assignmentRoster, captureRecipients} from '../homework-server/roster.mjs';
import {cellFor} from '../homework/grade-journey-model.js';

const micro='bookself-class:micro', macro='bookself-class:macro';
const classes=[{id:micro},{id:macro}];
const selected={id:'student1',name:'A',classIds:[micro,macro]};
const classmate={id:'student2',name:'B',classIds:[micro,macro]};
const outside={id:'student3',name:'C',classIds:[macro]};
const students=[selected,classmate,outside];

test('individual recipients must belong to the specified class',()=>{
  assert.throws(()=>assignmentAudience({classIds:[micro],individualRecipients:{micro:[outside.id]}},classes,students),/学生不在/);
  assert.throws(()=>assignmentAudience({classIds:[micro],individualRecipients:{macro:[selected.id]}},classes,students),/至少选择/);
  assert.throws(()=>assignmentAudience({classIds:[micro],individualRecipients:{micro:[]}},classes,students),/至少选择/);
  const draft=assignmentAudience({classIds:[]},classes,students,{allowEmpty:true});
  assert.deepEqual(draft,{classIds:[],individualRecipients:{}});
});

test('the same assignment can target individuals in one class and the whole of another',()=>{
  const rules=assignmentAudience({classIds:[micro,macro],individualRecipients:{micro:[selected.id]}},classes,students);
  const snapshot=captureRecipients(rules.classIds,students,'2026-11-23',rules.individualRecipients);
  const a={id:'a',published:true,...rules,recipients:snapshot,audience:{students:snapshot.students}};
  const rows=assignmentRoster(a,students,[]).rows;
  assert.deepEqual(rows.find(r=>r.id===classmate.id).classIds,[macro]);
  assert.equal(studentCanAccessAssignment(a,{...classmate,classIds:[micro]}),false);
  assert.equal(studentCanAccessAssignment(a,classmate),true);
  assert.equal(studentCanAccessAssignment({...a,published:false},selected),false);
  assert.equal(cellFor(a,classmate,undefined,Date.now(),micro).required,false);
  assert.equal(cellFor(a,classmate,undefined,Date.now(),macro).required,true);
});
