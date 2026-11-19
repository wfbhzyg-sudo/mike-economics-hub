import test from 'node:test';
import assert from 'node:assert/strict';
import {bankMatch,draftKey,readBankDraft,writeBankDraft} from '../teacher/question-bank.js';
import {questionReviewEvidence} from '../homework/review-save.js';

test('ordered teacher drafts recover across chapters and never store questions, answers or names',()=>{
  const rows=Array.from({length:15},(_,i)=>({id:'q'+i,answer:'SECRET_ANSWER',studentName:'PRIVATE_NAME',unitId:i%2?'micro-unit-2':'micro-unit-1'}));
  const records=new Map(),storage={getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v)};
  const ordered=[...rows].reverse().slice(0,12);
  writeBankDraft(storage,'one',{selected:new Map(ordered.map(q=>[q.id,q])),course:'micro',unit:'micro-unit-2',topic:'micro-unit-2|2.1',type:'choice',status:'all'});
  assert.doesNotMatch(records.get(draftKey('one')),/SECRET_ANSWER|PRIVATE_NAME/);
  assert.deepEqual([...readBankDraft(storage,'one',rows).selected.keys()],ordered.map(q=>q.id));
  assert.equal(readBankDraft(storage,'one',rows).course,'micro');
  assert.equal(readBankDraft(storage,'two',rows).selected.size,0);
  assert.equal(readBankDraft(storage,'one',rows.slice(0,6)).selected.size,3);
  records.set(draftKey('one'),'invalid');
  assert.equal(readBankDraft(storage,'one',rows).selected.size,0);
});

test('bank search supplies a visible match even near the end of long OCR, and identifies other fields',()=>{
  const q={number:53,searchText:'Quantity '.repeat(120)+'slope decreases',topicTitle:'Elasticity',relatedTopics:['2.3'],source:'Practice Set 4',options:[{label:'C',text:'Total receipts'}]};
  for(const [term,field] of [['SLOPE','题面'],['elasticity','Topic'],['2.3','Topic'],['5','题号'],['Practice','来源'],['receipts','选项']]){
    const hit=bankMatch(q,term);assert.equal(hit.field,field);assert(hit.snippet.toLowerCase().includes(term.toLowerCase()));
  }
  assert.equal(bankMatch(q,'missing'),null);
});

test('review keeps an explicit source with per-question fallback and treats a saved MCQ choice as evidence',()=>{
 const s={rubricSnapshot:[{id:'a',type:'choice',questionImages:['qa']},{id:'b',type:'short',questionImages:['qb']},{id:'c',type:'short',prompt:'A text-only question'},{id:'d',type:'choice',questionImages:['qd']}],choices:{a:'B',d:'C'},responses:{b:{files:['student-page'],text:'written answer'}}};
 assert.deepEqual(questionReviewEvidence(s,'a','answer'),{source:'answer',files:[],text:'学生选择 B'});
 assert.deepEqual(questionReviewEvidence(s,'b','answer'),{source:'answer',files:['student-page'],text:'written answer'});
 assert.deepEqual(questionReviewEvidence(s,'c','answer'),{source:'question',files:[],text:'A text-only question',fallback:'answer'});
 assert.equal(questionReviewEvidence(s,'d','answer').text,'学生选择 C');
 assert.equal(questionReviewEvidence(s,'a').source,'question');
});
