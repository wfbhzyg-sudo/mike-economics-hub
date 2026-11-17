import test from 'node:test';import assert from 'node:assert/strict';
import {buildAvailability,buildCatalog,drawPaper,validateCreate} from '../homework-server/self-practice-model.mjs';
import {availableQuestionCount} from '../homework/self-practice.js';
const unit={id:'micro-unit-1',topics:[{id:'1.1'},{id:'1.2'},{id:'1.3'}]};
const questions=Array.from({length:12},(_,i)=>({id:'q'+i,unitId:unit.id,type:'choice',status:'ready',topic:'1.1',relatedTopics:['1.2'],number:i+1,source:'one',answer:'A',options:['A','B'],questionImages:['image']}));
test('shared-topic counts match unique drawable questions and never expose answer keys',()=>{
 const availability=buildAvailability({units:[unit],questionsByUnit:{[unit.id]:questions}});
 assert.deepEqual(availability,[{topics:['1.1','1.2'],count:12}]);
 assert.equal(availableQuestionCount({availability},['1.1']),12);
 assert.equal(availableQuestionCount({availability},['1.1','1.2']),12);
 assert.equal(availableQuestionCount({availability},['1.3']),0);
 assert.throws(()=>drawPaper({questions,topicIds:['1.1','1.2'],count:20}),/不足/);
 assert.equal(drawPaper({questions,topicIds:['1.1','1.2'],count:10}).length,10);
});
test('catalog and availability collapse duplicate source-question identities',()=>{
 const pools={[unit.id]:[...questions,{...questions[0],id:'duplicate-row'}]};
 assert.equal(buildCatalog({units:[unit],questionsByUnit:pools})[0].questionCount,12);
 assert.equal(buildAvailability({units:[unit],questionsByUnit:pools})[0].count,12);
});
test('several whole units may exceed the old 24-topic limit while unreleased topics stay blocked',()=>{
 const topicIds=Array.from({length:32},(_,i)=>'topic-'+i),allowedTopics=new Set(topicIds.map(id=>'micro:'+id));
 const body={clientId:'valid-client-id',course:'micro',topicIds,questionCount:20};
 assert.equal(validateCreate(body,{allowedTopics}).topicIds.length,32);
 assert.throws(()=>validateCreate({...body,topicIds:[...topicIds,'private']},{allowedTopics}),/不在可练习范围/);
});
