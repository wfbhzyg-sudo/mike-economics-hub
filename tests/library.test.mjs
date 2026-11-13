import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {cleanDrawing,publicUnit,validateSelection,UNIT} from '../homework-server/library-model.mjs';
import {createLibrary} from '../homework-server/library.mjs';
const stroke={tool:'pen',color:'#132941',width:.003,points:[[0,0,0],[1,1,1]]};
test('Drawing limits reject malformed, nonfinite and excessive coordinates without clipping the answer',()=>{
 assert.deepEqual(cleanDrawing({pages:[[stroke]],revision:0,text:'保留原笔记'}).pages,[[stroke]]);
 for(const point of [[-.1,0,.5],[0,1.1,.5],[0,0,NaN],[0,0,2]])assert.throws(()=>cleanDrawing({pages:[[{...stroke,points:[point]}]],revision:0}));
 assert.throws(()=>cleanDrawing({pages:Array.from({length:9},()=>[]),revision:0}));
 assert.throws(()=>cleanDrawing({pages:[[{...stroke,points:Array(8001).fill([0,0,.5])}]],revision:0}));
});
test('Student unit payload excludes teacher answers and teaching notes',()=>{
 const safe=publicUnit({id:UNIT,topics:[{id:'2.1',teacherNotes:'secret',title:'Demand'}],resources:[{fileId:'s',audience:'student'},{fileId:'a',audience:'teacher'}]});
 assert.equal(safe.resources.length,1);assert(!JSON.stringify(safe).includes('secret'));
});
test('Publish rejects unknown, duplicate or unverified questions, while FRQ needs no MCQ taxonomy',()=>{
 const choice={id:'q',type:'choice',status:'ready',answer:'A',questionImages:['f']};
 assert.throws(()=>validateSelection(['q','q'],[choice]));assert.throws(()=>validateSelection(['missing'],[choice]));
 assert.throws(()=>validateSelection(['q'],[{...choice,answer:''}]));assert.throws(()=>validateSelection(['q'],[{...choice,status:'review'}]));
 assert.throws(()=>validateSelection(['f'],[{id:'f',type:'short',status:'ready',questionImages:['img'],criteria:'Key',maxPoints:1,scoringPoints:[]}]));
 assert.equal(validateSelection(['f'],[{id:'f',type:'short',status:'ready',questionImages:['img'],criteria:'Key',maxPoints:1,scoringPoints:[{id:'1',criterion:'Shift demand right',maxPoints:1}]}])[0].id,'f');
});
function fixture(){const records=new Map([[UNIT,{kind:'library-unit',id:UNIT,type:'library-unit',owner:'t',topics:[{id:'2.1',teacherNotes:'private'}],resources:[{fileId:'public',audience:'student',pages:10},{fileId:'key',audience:'teacher',pages:2}]}],['macro-unit-4',{id:'macro-unit-4',kind:'library-unit',type:'library-unit',owner:'t',topics:[],resources:[{fileId:'locked',audience:'class',pages:2}]}],['release',{id:'release',unitId:UNIT,classIds:['c']}]]);
 const db={get:async id=>records.get(id),list:async kind=>[...records.values()].filter(x=>kind==='library-release'?x.id==='release':x.kind===kind),put:async(kind,v)=>{records.set(v.id,{...v,kind});return v},tx:async fn=>fn({}),audit:async()=>{}};
 const library=createLibrary({db,files:{},requireAssignment:async()=>({id:'a',version:1,rubric:[{id:'1',type:'short'}]})});
 const call=async(user,path,method='GET',body)=>{let result;await library.handle({req:Object.assign(Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]),{url:'/api/homework/'+path}),res:{},route:path.split('?')[0].split('/'),method,user,json:(_r,d)=>{result=d},availableClasses:async()=>[{id:'c'}],availableStudents:async()=>[]});return result};return {records,library,call};}
const student={id:'s',role:'student',classIds:['c']},teacher={id:'t',role:'teacher'};
test('Library access is class scoped and teacher keys never inherit student release',async()=>{
 const {library,call}=fixture();await assert.rejects(call({...student,classIds:['other']},'library/unit'));
 await assert.rejects(call({id:'otherTeacher',role:'teacher'},'library/questions'));
 await assert.rejects(call(student,'library/publish','POST',{}));
 assert.deepEqual((await call(student,'library/catalog')).units.map(u=>u.id),[UNIT]);
 assert.equal((await call(teacher,'library/catalog')).units.length,2);
 assert.equal(await library.canReadFile({id:'locked',purpose:'library'},student),false);
 await assert.rejects(call(student,'library/unit?unit=macro-unit-4'),e=>e.status===403);
 assert.equal(await library.canReadFile({id:'public',purpose:'library'},student),true);
 assert.equal(await library.canReadFile({id:'key',purpose:'library'},student),false);
 assert.equal(await library.canReadFile({id:'key',purpose:'library'},teacher),true);
});
test('Notes are owner isolated; stale writes fail and past revisions are retained',async()=>{
 const {call,records}=fixture(),scope={resourceId:'public',page:2},body={...scope,revision:0,text:'original',pages:[[stroke]]};
 const first=(await call(student,'library/notes','PUT',body)).note;
 await assert.rejects(call(student,'library/notes','PUT',body),e=>e.status===409);
 const peer=(await call({...student,id:'peer'},'library/notes?resourceId=public&page=2')).note;assert.equal(peer.revision,0);
 await call(student,'library/notes','PUT',{...body,revision:1,text:'revised'});assert.equal(records.get(first.id+':v1').text,'original');
 await assert.rejects(call(student,'library/notes?resourceId=key&page=1'));
 await assert.rejects(call(student,'library/notes?resourceId=public&page=11'));
});
