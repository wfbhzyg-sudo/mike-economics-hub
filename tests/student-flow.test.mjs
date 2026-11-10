import test from 'node:test';
import assert from 'node:assert/strict';
import {assignmentState} from '../homework/learning-model.js';
const now=Date.parse('2026-11-10T12:00:00Z');
const assignment={id:'a',dueAt:'2026-11-10T11:00:00Z'};
test('Closed unsubmitted work does not compete with actionable tasks; explicit late permission restores it',()=>{
 assert.equal(assignmentState(assignment,[],now).key,'closed');
 assert.equal(assignmentState({...assignment,allowLate:true},[],now).label,'可补交');
 const returned={id:'r',assignmentId:'a',status:'returned',submittedAt:'2026-11-09'};
 assert(assignmentState(assignment,[returned],now).canSubmit);
 assert.equal(assignmentState(assignment,[returned],now).key,'todo');
});
test('A newer allowed draft is resumable without hiding a previous effective grade',()=>{
 const submitted={id:'s',assignmentId:'a',status:'published',submittedAt:'2026-11-09T12:00:00Z'};
 const draft={id:'d',assignmentId:'a',status:'draft',updatedAt:'2026-11-10T12:00:00Z'};
 const open={id:'a',allowResubmit:true};
 assert.equal(assignmentState(open,[submitted,draft],now).key,'todo');
 assert.equal(assignmentState(open,[submitted,{...draft,updatedAt:'2026-11-08'}],now).key,'done');
 assert.equal(assignmentState({...open,allowResubmit:false},[submitted,draft],now).key,'done');
 assert.equal(assignmentState(assignment,[submitted,draft],now).key,'done');
});
