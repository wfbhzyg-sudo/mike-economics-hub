import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewDraft} from '../homework-server/learning.mjs';

test('first choice-only manual score saves without an AI job or prior draft',()=>{
  for(const empty of [undefined,null]){
    const s={teacherReviewDraft:empty,suggestedGrade:{total:22}},q={id:'11',score:0,checked:true};
    const draft=reviewDraft(s,q,'teacher','now');
    assert.equal(draft.revision,1);assert.deepEqual(draft.questions,[q]);
    assert.equal(draft.jobId,undefined);assert.equal(s.suggestedGrade.total,22);
  }
});
test('choice review keeps earlier edits and replaces a repeated question exactly once',()=>{
  const s={teacherReviewDraft:reviewDraft({}, {id:'11',score:1},'teacher','first')};
  s.teacherReviewDraft=reviewDraft(s,{id:'2',score:0},'teacher','second');
  const draft=reviewDraft(s,{id:'11',score:0},'teacher','third');
  assert.equal(draft.revision,3);assert.deepEqual(draft.questions,[{id:'2',score:0},{id:'11',score:0}]);
});
test('a new AI grading job cannot inherit edits from an earlier grading result',()=>{
  const draft=reviewDraft({jobId:'new',teacherReviewDraft:{jobId:'old',revision:4,questions:[{id:'1',score:1}]}},{id:'2',score:0},'teacher','now');
  assert.equal(draft.jobId,'new');assert.deepEqual(draft.questions,[{id:'2',score:0}]);
});
