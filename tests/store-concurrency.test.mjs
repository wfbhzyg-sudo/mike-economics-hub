import test from 'node:test';import assert from 'node:assert/strict';import {createStore} from '../homework-server/store.mjs';
const url=process.env.CAPACITY_TEST_DATABASE_URL;const pause=ms=>new Promise(r=>setTimeout(r,ms));
test('PostgreSQL scopes preserve global exclusion, same-student serialization, filtering and rollback',{skip:!url},async()=>{
 assert(new URL(url).searchParams.get('host')?.startsWith('/tmp/mike-hw-qa-'),'Isolated local DB only');const db=createStore(url,'capacity_lock_test');try{await db.init();await db.put('count',{id:'count',n:0});
 await Promise.all(Array.from({length:40},()=>db.tx(async c=>{const r=await db.get('count',c);r.n++;await db.put('count',r,c)},'count')));assert.equal((await db.get('count')).n,40);
 let unblock,ready;const opened=new Promise(r=>ready=r);const first=db.tx(async()=>{ready();await new Promise(r=>unblock=r)},'a');await opened;
 await db.tx(async()=>{},'b');let globalEntered=false;const global=db.tx(async()=>{globalEntered=true});await pause(30);assert.equal(globalEntered,false);unblock();await Promise.all([first,global]);assert(globalEntered);
 let endGlobal,globalReady;const signaled=new Promise(r=>globalReady=r);const exclusive=db.tx(async()=>{globalReady();await new Promise(r=>endGlobal=r)});await signaled;let entered=false;const scoped=db.tx(async()=>{entered=true},'c');await pause(30);assert.equal(entered,false);endGlobal();await Promise.all([exclusive,scoped]);
 await assert.rejects(db.tx(async c=>{await db.put('count',{id:'count',n:999},c);throw Error('rollback')},'count'));assert.equal((await db.get('count')).n,40);
 for(const [id,studentId,assignmentId,version]of[['a','one','x',1],['b','two','x',1],['c','one','y',2]])await db.put('attempt',{id,studentId,assignmentId,version});
 assert.deepEqual((await db.find('attempt',{studentId:'one',assignmentId:'x',version:1})).map(r=>r.id),['a']);assert.equal((await db.find('attempt',{assignmentId:[]})).length,0);assert.equal((await db.find('attempt',{assignmentId:['x','y']})).length,3);await assert.rejects(db.find('attempt',{"bad'; DROP TABLE":'x'}));
 }finally{await db.pool.end()}
});
