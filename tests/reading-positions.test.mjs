import test from 'node:test';
import assert from 'node:assert/strict';
import {readingPositions} from '../homework/reading-positions.js';

test('scrolling only persists the last reading position and restores legacy question views', t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const store=new Map(), writes=[];
  const device=()=>({getItem:key=>store.get(key),setItem(key,value){writes.push(key);store.set(key,value);},removeItem:key=>store.delete(key)});
  const first={x:0,y:0,text:false,zoom:false};
  const pos=readingPositions('reader:a',{1:first},device);
  for(let step=1;step<=15;step++){pos.set(1,{...first,y:4*step});t.mock.timers.tick(10);}
  assert.deepEqual(writes,[]);
  t.mock.timers.tick(150);assert.deepEqual(writes,['reader:a']);
  const reopened=readingPositions('reader:a',{},device);assert.equal(reopened.get('1').y,60);
  reopened.set(1,{...first,y:60});reopened.flush();assert.equal(writes.length,1);
  assert.equal(readingPositions('reader:b',{},device).get(1),undefined);
  reopened.set(2,{...first,y:24});reopened.flush();assert.equal(writes.length,2);
  reopened.set(2,{...first,y:80});reopened.clear();t.mock.timers.tick(200);
  assert.equal(store.size,0);assert.equal(writes.length,2);
});
