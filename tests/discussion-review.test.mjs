import test from 'node:test';
import assert from 'node:assert/strict';
import {createStudyWorkflow} from '../homework-server/study-workflow.mjs';

function setup() {
  const records=new Map();
  const db={
    get:key=>key.startsWith('discussion-policy:')?{policy:'open'}:records.get(key),
    put:(kind,value)=>records.set(value.id,value),
    tx:fn=>fn({}),
  };
  const assignment={id:'a',published:true,classIds:['c'],rubric:[{id:'1'}],version:1};
  const user={id:'s',role:'student',classIds:['c']};
  let decide=()=>({decision:'allow'}),calls=0;
  const {handle}=createStudyWorkflow({db,requireAssignment:()=>assignment,
    reviewModel:(_db,_decrypt,messages)=>{calls++;assert.deepEqual(Object.keys(JSON.parse(messages[1].content)),['studentText']);return decide();}});
  const post=body=>handle({route:['question-discussion','a','1'],method:'POST',req:{url:'/?version=1&classId=c'},
    user,body:()=>body,json:()=>{},sessionActive:()=>true});
  return {post,records,assignment,calls:()=>calls,respond:f=>{decide=f;}};
}
const create={action:'create',clientId:'receipt',body:'先比较曲线移动的方向。'};
test('no post or feed event before approval; retries are idempotent and edited text needs fresh approval',async()=>{
  const x=setup();
  let resolve,entered;
  const called=new Promise(done=>{entered=done;});
  x.respond(()=>new Promise(done=>{resolve=done;entered();}));
  const pending=x.post(create);
  await called;assert.equal(x.records.size,0);
  await assert.rejects(x.post(create),{status:429});
  resolve({decision:'allow'});await pending;await x.post(create);assert.equal(x.calls(),1);
  const original=[...x.records.values()].find(x=>x.threadKey);
  assert.equal(original.aiReview.provider,'deepseek');
  const edit={action:'edit',postId:original.id,revision:1,body:'修改后的思路'};
  for(const [response,status] of [[{decision:'answer'},422],[{decision:'maybe'},503],[null,503],[{decision:'allow',extra:true},503]]){
    x.respond(()=>response);await assert.rejects(x.post(edit),{status});
    assert.deepEqual(x.records.get(original.id),original);
  }
  x.respond(()=>{throw Error('provider unavailable');});await assert.rejects(x.post(edit),{status:503});
  x.respond(()=>({decision:'allow'}));await x.post(edit);
  assert.equal(x.records.get(original.id).revision,2);assert.equal(x.records.get(original.id).body,edit.body);
});
test('publication rechecks the assignment version after review',async()=>{
  const x=setup();x.respond(()=>{x.assignment.version++;return {decision:'allow'};});
  await assert.rejects(x.post(create),{status:409});assert.equal(x.records.size,0);
});
