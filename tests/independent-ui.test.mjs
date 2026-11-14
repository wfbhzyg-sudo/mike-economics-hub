import test from 'node:test';
import assert from 'node:assert/strict';
import {assignmentOpensLater,studentAssignmentAction} from '../homework/assignment-navigation.js';
import {correctionAnswerEvidence} from '../homework/choice-correction.js';
import {pdfPageText} from '../homework/library-navigation.js';
test('scheduled attention changes at opening time while old graded work remains accessible',()=>{
 const now=Date.parse('2026-11-14T10:00Z'),a={id:'a',opensAt:'2026-11-14T10:01Z'};
 assert.equal(assignmentOpensLater(a,now),true);assert.equal(assignmentOpensLater(a,now+60000),false);
 assert.equal(assignmentOpensLater({...a,opensAt:null},now),false);assert.equal(assignmentOpensLater({...a,opensAt:'invalid'},now),false);
 assert.equal(studentAssignmentAction(a,[],now).target,null);
 const old={id:'s',assignmentId:'a',status:'published',submittedAt:'2026-11-13T12:00Z'};
 assert.equal(studentAssignmentAction(a,[old],now).target,'result/s');
});
test('correction uses the explicit MCQ answer rather than unrelated whole-paper text',()=>{
 const s={choices:{'11':'B','12':'E'},text:'1: A\n2: D',files:['unrelated'],answerKey:{'11':'A'}};
 assert.deepEqual(correctionAnswerEvidence(s,{type:'choice',questionId:'11'}),{files:[],text:'本次选择：B'});
 assert.deepEqual(correctionAnswerEvidence({...s,choices:{'11':''}},{type:'choice',questionId:'11'}),{files:[],text:'本次选择：未作答'});
 assert.deepEqual(correctionAnswerEvidence({...s,choices:{'12':'D'}},{type:'choice',questionId:'11'}),{files:[],text:'本次选择：未作答'});
 assert.deepEqual(correctionAnswerEvidence({...s,choices:undefined},{type:'choice',questionId:'11'}),{files:['unrelated'],text:'1: A\n2: D'});
});
test('mixed written corrections retain their linked photos and text, without guessing by order',()=>{
 const s={files:['a','b'],text:'complete legacy response',responses:{'9':{files:['b'],text:'response nine'},'10':{files:[],text:''}}};
 assert.deepEqual(correctionAnswerEvidence(s,{type:'short',questionId:'9'}),{files:['b'],text:'response nine'});
 assert.deepEqual(correctionAnswerEvidence(s,{type:'short',questionId:'10'}),{files:[],text:''});
 assert.deepEqual(correctionAnswerEvidence(s,{type:'short',questionId:'3'}),{files:['a','b'],text:'complete legacy response'});
});
test('PDF reading text preserves original words and line breaks, with no generated filler',()=>{
 assert.equal(pdfPageText([{str:'Demand',hasEOL:true},{str:'Price'},{type:'beginMarkedContent'},{str:'elasticity',hasEOL:true},{str:'ΔQ / ΔP'}]),'Demand\nPrice elasticity\nΔQ / ΔP');
 assert.equal(pdfPageText([]),'');assert.equal(pdfPageText([{str:' '},{str:'',hasEOL:true}]),'');
});
