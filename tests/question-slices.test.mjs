import test from 'node:test';
import assert from 'node:assert/strict';
import {questionSlices} from '../homework/question-slices.js';
import {questionView} from '../homework/question-view.js';

test('answer controls share all original slices in source order without a fragment pager',()=>{
  const question={prompt:'Read the table',questionImages:['shared graph','stem','options'],options:[{label:'A',text:'Up'}]};
  const reference=questionSlices(question.questionImages,'第 2 题');
  const active=questionView(question,String,{number:2});
  assert.ok(active.paper.includes(reference));
  assert.deepEqual([...reference.matchAll(/src="([^"]+)"/g)].map(m=>m[1]),['/api/homework/files/shared%20graph','/api/homework/files/stem','/api/homework/files/options']);
  assert.equal([...reference.matchAll(/class="question-retry"/g)].length,3);
  assert.match(active.choices,/data-choice="A"/);
  assert.doesNotMatch(reference,/data-gallery|data-page=/);
  assert.match(questionView({...question,questionImages:[]},String,{number:2}).paper,/A\. Up/);
});
