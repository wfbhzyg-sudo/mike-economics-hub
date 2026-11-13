import test from 'node:test';
import assert from 'node:assert/strict';
import {byteRange} from '../homework-server/file-range.mjs';
import {cleanDrawing} from '../homework-server/library-model.mjs';
import {buildPacks,canonicalQuestions} from '../homework/library-packs.js';
import {drawTypedAnnotations} from '../homework-server/typed-annotations.mjs';

test('PDF byte ranges handle suffix, open end, oversized end and unsatisfiable input',()=>{
 assert.deepEqual(byteRange('bytes=0-99',1000),{start:0,end:99,length:100});
 assert.deepEqual(byteRange('bytes=900-',1000),{start:900,end:999,length:100});
 assert.deepEqual(byteRange('bytes=-100',1000),{start:900,end:999,length:100});
 assert.deepEqual(byteRange('bytes=900-2000',1000),{start:900,end:999,length:100});
 for(const range of ['bytes=1000-','bytes=20-1','bytes=-0','bytes=-','bytes=no']) assert.equal(byteRange(range,1000),false);
 assert.equal(byteRange('bytes=0-1,8-9',1000),null);
});
test('Text annotations validate page and position while old notes remain compatible',()=>{
 const note={revision:0,pages:[[]],text:'legacy',annotations:[{id:'text-0001',page:0,x:.2,y:.4,width:.35,text:'Elasticity 弹性'}]};
 assert.equal(cleanDrawing(note).annotations[0].text,'Elasticity 弹性');
 for(const change of [{page:1},{x:.9},{width:NaN},{text:'a'.repeat(3001)}]) assert.throws(()=>cleanDrawing({...note,annotations:[{...note.annotations[0],...change}]}));
 assert.equal(cleanDrawing({pages:[[]],text:'old',revision:2}).annotations,undefined);
});
test('A missing answer keeps an original ordered packet pending, without silently dropping the question',()=>{
 const rows=[1,2,3].map(n=>({id:'q'+n,number:n,sourceId:'paper',source:'Unit 2',collection:'progress',status:n===2?'needs_review':'ready',type:'choice'}));
 const [pack]=buildPacks(rows,{collection:'progress'});
 assert.equal(pack.ready,false);assert.equal(pack.pending,1);assert.deepEqual(pack.questionIds,['q1','q2','q3']);
});
test('Text near the bottom of an answer page is preserved on continuation pages',()=>{
 const texts=[],pages=[{drawText:t=>texts.push(t)}];
 const pdf={getPages:()=>[...pages],addPage:()=>{const p={drawText:t=>texts.push(t)};pages.push(p);return p;}};
 const content='The answer must survive overflow. '.repeat(80);
 drawTypedAnnotations(pdf,{widthOfTextAtSize:t=>t.length*6},[{page:0,x:.8,y:.98,width:.2,text:content}]);
 assert(pages.length>1);
 assert.equal(texts.filter(t=>!t.startsWith('Text annotation continued')).join(''),content);
});

test('Verified revisions replace legacy choices only in the picker, preserving original pending packets',()=>{
 const old={id:'legacy',source:'PC',number:1,type:'choice',collection:'progress',status:'ready'};
 const fresh={...old,id:'revised',sourceId:'revised-paper',supersedes:['legacy']};
 const pending={...old,id:'pending',sourceId:'pending-paper',status:'needs_review',duplicateOf:'revised'};
 assert.deepEqual(canonicalQuestions([old,fresh,pending]).map(q=>q.id),['revised','pending']);
 const packs=buildPacks([old,fresh,pending],{collection:'progress'});
 assert.equal(packs.length,2);assert(packs[0].ready);assert.equal(packs[1].pending,1);assert.equal(old.status,'ready');
});
