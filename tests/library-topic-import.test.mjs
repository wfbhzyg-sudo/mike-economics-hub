import test from 'node:test';import assert from 'node:assert/strict';
import {buildPacks,canonicalQuestions} from '../homework/library-packs.js';
import {validateSelection} from '../homework-server/library-model.mjs';
import {drawPaper,buildCatalog,questionEligible} from '../homework-server/self-practice-model.mjs';
const question=(id,number,pack,topic='3.6')=>({id,number,type:'choice',topic,status:'ready',collection:'topic',sourceId:pack,assignmentPack:pack?{id:pack,title:'AP Classroom · '+pack}:undefined});
test('Separate imported booklets remain separate named packs while existing topic practice remains available',()=>{
 const rows=[question('old',1,null),...Array.from({length:30},(_,i)=>question('a'+i,i+1,'Part 1')),...Array.from({length:30},(_,i)=>question('b'+i,i+1,'Part 2')),question('other',1,'Other','3.7')];
 const packs=buildPacks(rows,{topic:'3.6'});
 assert.deepEqual(packs.map(p=>p.count),[30,30,1]);
 assert.deepEqual(packs[0].questionIds,Array.from({length:30},(_,i)=>'a'+i));
 assert.equal(new Set(packs.flatMap(p=>p.questionIds)).size,61);
 assert.equal(packs.flatMap(p=>p.questionIds).length,61);
 assert(!packs.some(p=>p.questionIds.includes('other')));
 assert.equal(packs[2].id,'topic:0');
});
test('84-question paper splits into 40/40/4 in original number order without missing or repeated questions',()=>{
 const rows=Array.from({length:84},(_,i)=>question('q'+(84-i),84-i,'3.7 MCQ','3.7'));
 const packs=buildPacks(rows,{topic:'3.7'});
 assert.deepEqual(packs.map(p=>p.count),[40,40,4]);
 assert.deepEqual(packs.flatMap(p=>p.questionIds),Array.from({length:84},(_,i)=>'q'+(i+1)));
 assert(packs.every(p=>p.ready));assert(packs[2].title.endsWith('Part 3'));
});
test('Deduplicated source aliases remain in original exam packs, but cannot appear twice in one paper',()=>{
 const canonical={...question('canonical',7,'new'),questionImages:['new-image']};
 const alias={...question('old-source',35,null),source:'2014 original',questionImages:['old-image'],collection:'exam',canonicalQuestionId:'canonical'};
 assert.deepEqual(canonicalQuestions([canonical,alias]).map(q=>q.id),['canonical']);
 const originalPacks=buildPacks([alias],{collection:'exam'});assert.equal(originalPacks[0].count,1);assert.equal(originalPacks[0].questionIds[0],'old-source');
 assert.equal(validateSelection(['old-source'],[canonical,alias]).length,1);
 assert.throws(()=>validateSelection(['canonical','old-source'],[canonical,alias]),/同一道题/);
});
test('Related chapter access reuses one canonical question and self practice never repeats it',()=>{
 const unit={id:'micro-unit-3',title:'Unit 3',topics:[{id:'3.6'},{id:'3.7'}]};
 const rows=Array.from({length:10},(_,i)=>({...question('q'+i,i+1,'new','3.6'),unitId:unit.id,answer:'A',optionLabels:['A','B','C','D','E'],questionImages:['image'],relatedTopics:['3.7'],assignmentPack:{id:'new',title:'New 3.6',topic:'3.6'}}));
 const alias={...rows[0],id:'old',canonicalQuestionId:'q0'};
 assert.equal(questionEligible(alias,{unit}),false);
 const chapter=buildPacks(rows,{topic:'3.7'});assert.equal(chapter[0].count,10);assert.equal(chapter[0].id,'topic:0');
 const catalog=buildCatalog({units:[unit],questionsByUnit:{[unit.id]:[...rows,alias]}});assert.equal(catalog[0].questionCount,10);assert.deepEqual(catalog[0].topics.map(t=>t.count),[10,10]);
 const paper=drawPaper({questions:rows,topicIds:['3.6','3.7'],count:10,random:()=>.5});assert.equal(new Set(paper.map(q=>q.id)).size,10);
});
