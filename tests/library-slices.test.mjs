import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {PDFDocument} from 'pdf-lib';
import {cropDrag} from '../teacher/crop-geometry.js';
import {resolveQuestionSource,replaceQuestionSlice} from '../homework-server/library-slices.mjs';
import {createLibrary} from '../homework-server/library.mjs';

test('Crop gestures draw in reverse, move within page and resize all eight handles',()=>{
 const base={width:600,height:800,box:[100,100,300,300],start:[150,150],point:[170,180]};
 assert.deepEqual(cropDrag({...base,mode:'draw',point:[90,80]}),[90,80,150,150]);
 assert.deepEqual(cropDrag({...base,mode:'move'}),[120,130,320,330]);
 assert.deepEqual(cropDrag({...base,mode:'move',point:[600,800]}),[400,600,600,800]);
 for(const mode of ['n','s','e','w','nw','ne','sw','se']){
   const b=cropDrag({...base,mode});
   assert.equal(b[0],mode.includes('w')?120:100);assert.equal(b[2],mode.includes('e')?320:300);
   assert.equal(b[1],mode.includes('n')?130:100);assert.equal(b[3],mode.includes('s')?330:300);
 }
 assert.deepEqual(cropDrag({...base,mode:'nw',point:[599,799]}),[288,288,300,300]);
});
test('Replacing one slice preserves sibling images and appending retains cross-page order and answer',()=>{
 const q={questionImages:['a','b'],regions:[{page:1,bbox:[1,1,30,30]},{page:2,bbox:[1,1,40,40]}],sourcePages:[1,2],answer:'D',version:4};
 const next=replaceQuestionSlice(q,{fileId:'c',page:2,bbox:[5,5,60,70],index:1});
 assert.deepEqual(next.questionImages,['a','c']);assert.equal(q.questionImages[1],'b');assert.equal(next.answer,'D');
 const appended=replaceQuestionSlice(next,{fileId:'d',page:3,bbox:[5,5,80,90],mode:'append'});
 assert.deepEqual(appended.questionImages,['a','c','d']);assert.deepEqual(appended.regions.map(r=>r.page),[1,2,3]);
 assert.throws(()=>replaceQuestionSlice(q,{fileId:'x',index:4}));
});
test('Source lookup prefers exact source id and refuses ambiguous or other-teacher PDFs',async()=>{
 const rows=[{id:'src1',owner:'t',title:'AP Micro · Exam',unitId:'micro-unit-2',fileId:'f1'},{id:'src2',owner:'t',title:'Exam',unitId:'micro-unit-2',fileId:'f2'},{id:'src3',owner:'other',title:'Exam',unitId:'micro-unit-2',fileId:'f3'}];
 const db={list:async()=>rows,get:async id=>id.startsWith('f')?{id,pages:3}:null},q={unitId:'micro-unit-2',source:'Exam',sourcePages:[2]};
 assert.equal(await resolveQuestionSource(db,{id:'t'},q),null);
 assert.equal((await resolveQuestionSource(db,{id:'t'},{...q,sourceId:'src2'})).file.id,'f2');
 assert.equal(await resolveQuestionSource(db,{id:'outsider'},q),null);
});
async function fixture(){
 const pdf=await PDFDocument.create();for(let i=0;i<2;i++)pdf.addPage([600,800]).drawText('Cross-page crop fixture '+(i+1),{x:30,y:700});const bytes=Buffer.from(await pdf.save());
 const records=new Map(),put=(kind,v)=>records.set(v.id,{...v,kind});
 put('library-unit',{id:'micro-unit-2',type:'library-unit',owner:'t',resources:[]});
 put('library-source',{id:'src',owner:'t',fileId:'pdf',unitId:'micro-unit-2',title:'Exam'});
 put('file',{id:'pdf',pages:2});put('library-question',{id:'q',unitId:'micro-unit-2',sourceId:'src',sourcePages:[1],questionImages:['original'],regions:[{page:1,bbox:[20,20,200,200]}],answer:'C',version:1});
 let uploaded=0,failUpload=0,conflict=false;
 const db={get:async id=>records.get(id),list:async kind=>[...records.values()].filter(r=>r.kind===kind),put:async(kind,v)=>{put(kind,v);return v},audit:async()=>{},tx:async fn=>{if(conflict)records.get('q').version++;return fn({});}};
 const files={read:async function*(){yield bytes;},upload:async()=>{uploaded++;if(uploaded===failUpload)throw Error('upload failed');return {id:'new'+uploaded}}};
 const library=createLibrary({db,files}),call=async(body,user={id:'t',role:'teacher'},path='library/questions/q/reslice')=>{let result;await library.handle({req:Object.assign(Readable.from([Buffer.from(JSON.stringify(body))]),{url:'/api/homework/'+path}),res:{},route:path.split('?')[0].split('/'),method:path.includes('source-page')?'GET':'POST',user,json:(_,d)=>result=d});return result;};
 return {records,call,uploads:()=>uploaded,fail:n=>failUpload=n,conflict:()=>conflict=true};
}
const slices=[{mode:'replace',index:0,page:1,bbox:[10,20,300,250]},{mode:'append',page:2,bbox:[20,20,500,300]}];
test('Atomic cross-page save retains original version, answer and all ordered images',async()=>{
 const f=await fixture();const preview=await f.call({},undefined,'library/questions/q/source-page?page=2');assert.equal(preview.totalPages,2);assert.equal(preview.page,2);
 const {question}=await f.call({revision:1,slices});assert.deepEqual(question.questionImages,['new1','new2']);assert.deepEqual(question.regions.map(r=>r.page),[1,2]);assert.equal(question.answer,'C');assert.equal(question.version,2);
 assert.equal([...f.records.values()].filter(v=>v.kind==='library-question-history')[0].snapshot.questionImages[0],'original');
 await assert.rejects(f.call({revision:1,slices}),e=>e.status===409);
});
test('Invalid page, out-of-bounds crop, duplicate replacement and student access never alter question',async()=>{
 for(const invalid of [[{...slices[0],page:3}],[{...slices[0],bbox:[0,0,601,300]}],[slices[0],slices[0]]]){
   const f=await fixture();await assert.rejects(f.call({revision:1,slices:invalid}));assert.equal(f.records.get('q').version,1);assert.equal(f.uploads(),0);
 }
 const f=await fixture();await assert.rejects(f.call({revision:1,slices},{id:'s',role:'student'}),e=>e.status===403);assert.equal(f.uploads(),0);
});
test('Failed second upload or concurrent edit cannot partially replace the original slices',async()=>{
 const f=await fixture();f.fail(2);await assert.rejects(f.call({revision:1,slices}));assert.deepEqual(f.records.get('q').questionImages,['original']);
 const c=await fixture();c.conflict();await assert.rejects(c.call({revision:1,slices}),e=>e.status===409);assert.deepEqual(c.records.get('q').questionImages,['original']);
});
