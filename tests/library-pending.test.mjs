import test from 'node:test';import assert from 'node:assert/strict';
import {validateSelection} from '../homework-server/library-model.mjs';
import {choiceScore,manualAssignmentScore} from '../homework-server/mcq-model.mjs';
import {automaticGradeReady,gradingFields} from '../homework/library-grading.js';
import {buildPacks} from '../homework/library-packs.js';
test('Pending MCQ and FRQ remain selectable while incomplete grading stays explicit',()=>{
 const rows=[{id:'c',type:'choice',status:'review',answer:'',questionImages:['f'],topic:'2.1'},{id:'s',type:'short',status:'review',questionImages:['f'],topic:'2.1'}];
 assert.equal(validateSelection(['c','s'],rows).length,2);assert(rows.every(q=>!automaticGradeReady(q)));
 assert.throws(()=>validateSelection(['c'],rows,{requireReady:true}));
 const packs=buildPacks(rows,{topic:'2.1'});assert.equal(packs.length,2);assert(packs.every(p=>!p.ready&&p.questionIds.length===1));
 const fields=gradingFields(rows,s=>String(s));assert(fields.includes('仍可布置'));assert(fields.includes('required value=""'));assert(fields.includes('required value="1"'));
});
test('An unchecked MCQ produces no invented zero, while verified MCQ still scores by key',()=>{
 const verified={id:'1',type:'choice',maxPoints:1,options:[{label:'A'},{label:'B'}],correctOptions:['A']};
 const pending={...verified,id:'2',manualGradingRequired:true,correctOptions:[]};
 const result=choiceScore([verified,pending],{'1':'A','2':'B'});assert.deepEqual(result.questions.map(q=>q.score),[1,null]);assert.equal(result.total,null);assert(result.needsReview);
 const all=manualAssignmentScore([verified,pending,{id:'3',type:'short',maxPoints:6,manualGradingRequired:true}],{'1':'A','2':'B'});
 assert.equal(all.total,null);assert.equal(all.maxPoints,8);assert.deepEqual(all.questions.map(q=>q.score),[1,null,null]);
});
