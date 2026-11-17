import test from 'node:test';import assert from 'node:assert/strict';
import {answerSuggestionInput,withAnswerSuggestion} from '../homework-server/library-answer-review.mjs';
test('Text-only answer suggestions reject FRQ, missing text, charts and shared stimulus references',()=>{
 for(const question of [{type:'short',searchText:'x'.repeat(100)},{type:'choice',searchText:'brief'},{type:'choice',searchText:'The graph shown below '+ 'x'.repeat(100)}])assert.throws(()=>answerSuggestionInput(question));
 assert.equal(answerSuggestionInput({type:'choice',searchText:'x'.repeat(100)}).length,100);
});
test('AI suggestions cannot replace keys, clear flags or mark a question reviewed',()=>{
 const q={type:'choice',status:'review',answer:'B',reviewFlags:['missing-stimulus'],optionLabels:['A','B','C','D'],version:3};
 const result=withAnswerSuggestion(q,{answer:'C',reason:'Possible answer',model:'test'},'now');
 assert.equal(result.status,'review');assert.equal(result.answer,'B');assert.equal(result.answerSuggestion.answer,'C');assert.deepEqual(result.reviewFlags,q.reviewFlags);assert.equal(result.reviewedBy,undefined);assert.equal(result.version,4);
 assert.throws(()=>withAnswerSuggestion(q,{answer:'E'},'now'));assert.throws(()=>withAnswerSuggestion(q,{answer:''},'now'));
});
