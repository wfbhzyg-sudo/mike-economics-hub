import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicQuestion,questionEligible} from '../homework-server/self-practice-model.mjs';
import {summarizeMock} from '../homework-server/study-workflow.mjs';
import {questionResult} from '../homework/result-badge.js';
import {topicGrid} from '../homework/topic-grid.js';

test('mock snapshot keeps ordered slices and option text private from answers',()=>{
  const q={id:'test',type:'choice',status:'ready',unitId:'micro-unit-2',topic:'2.3',
    questionImages:['shared','stem','next-page'],options:[{label:'A',text:'Demand rises'},{label:'B',text:'Demand falls'}],answer:'B'};
  const unit={id:q.unitId,topics:[{id:q.topic}]};
  assert(questionEligible(q,{unit}));
  assert(!questionEligible({...q,questionVisualStatus:'incomplete'},{unit}));
  const visible=publicQuestion(q);
  assert.deepEqual(visible.questionImages,['shared','stem','next-page']);
  assert.equal(visible.optionText.B,'Demand falls');
  assert(!Object.hasOwn(visible,'answer'));
});

test('each subject keeps its own topic, coverage counts students and accuracy counts points',()=>{
  const attempt=(studentId,course,score,maxPoints)=>({studentId,course,result:{questions:[{topic:'2.3',score,maxPoints}]}});
  const s=summarizeMock([attempt('a','micro',1,2),attempt('a','micro',2,3),attempt('b','macro',0,2)],4);
  const micro=s.topics.find(t=>t.course==='micro'),macro=s.topics.find(t=>t.course==='macro');
  assert.deepEqual([micro.participants,micro.correct,micro.total],[1,3,5]);
  assert.deepEqual([macro.participants,macro.correct,macro.total],[1,0,2]);
  const html=topicGrid([{...micro,roster:4},{...macro,roster:4}],String);
  assert.match(html,/data-band="4" style="--coverage:25%"/);
  assert.match(html,/data-band="1" style="--coverage:25%"/);
});

test('unanswered, zero, partially correct, full marks and pending are distinct',()=>{
  assert.equal(questionResult({score:0,maxPoints:1,unanswered:true}).label,'未作答');
  assert.equal(questionResult({score:0,maxPoints:1}).key,'wrong');
  assert.equal(questionResult({score:2,maxPoints:3}).key,'partial');
  assert.equal(questionResult({score:3,maxPoints:3}).key,'correct');
  assert.equal(questionResult({score:null,maxPoints:3}).label,'待评分');
});
