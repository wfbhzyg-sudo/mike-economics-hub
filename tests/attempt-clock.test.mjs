import test from 'node:test';
import assert from 'node:assert/strict';
import {attemptClock} from '../homework/mcq-session.js';
const now=Date.parse('2026-11-14T00:00:00Z'),t={startedAt:new Date(now-60000).toISOString()};
test('Untimed homework shows its due date without a multi-day exam countdown',()=>{
 const c=attemptClock({dueAt:'2026-11-17T00:00:00Z'},t,now);
 assert.match(c.label,/^截止 /);assert(!c.label.includes('4320'));assert.equal(c.expired,false);assert.equal(c.urgent,false);
});
test('The earlier hard deadline wins, while late submissions have no automatic due timer',()=>{
 const due=new Date(now+120000).toISOString();
 assert.equal(attemptClock({timeLimitMinutes:10,dueAt:due},t,now).label,'距截止 2:00');
 assert.equal(attemptClock({timeLimitMinutes:10,dueAt:due,allowLate:true},t,now).label,'剩余 9:00');
 assert.equal(attemptClock({dueAt:new Date(now-1000).toISOString(),allowLate:true},t,now).expired,false);
 assert.equal(attemptClock({dueAt:due,allowLate:true},t,now).label,'');
 assert.equal(attemptClock({timeLimitMinutes:10,dueAt:'invalid'},t,now).label,'剩余 9:00');
});
test('Countdown never shows zero seconds before its actual deadline',()=>{
 const a={timeLimitMinutes:1},start={startedAt:new Date(now).toISOString()};
 assert.equal(attemptClock(a,start,now+59999).label,'剩余 0:01');
 assert.equal(attemptClock(a,start,now+59999).expired,false);
 assert.equal(attemptClock(a,start,now+60000).expired,true);
 assert.equal(attemptClock(a,start,now+60001).label,'剩余 0:00');
});
test('Untimed work with no valid hard deadline cannot auto-submit',()=>{
 for(const a of [{},{dueAt:'invalid'},{timeLimitMinutes:10}]){
  const c=attemptClock(a,{},now);assert.equal(c.expired,false);assert.equal(c.label,'');
 }
});
