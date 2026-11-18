import test from 'node:test';
import assert from 'node:assert/strict';
import {profileView,awardPoint} from '../homework-server/companion-profile.mjs';
test('stage thresholds, Shanghai midnight, daily and lifetime limits',()=>{
 const profile={};
 for(const [points,level] of [[0,0],[19,0],[20,1],[39,1],[40,2],[64,2],[65,3],[84,3],[85,4],[100,4]])assert.equal(profileView({points},'student').level,level);
 for(let i=0;i<8;i++)awardPoint(profile,new Date('2026-11-18T15:59:00Z'));
 assert.equal(profile.points,5);awardPoint(profile,new Date('2026-11-18T16:00:00Z'));assert.equal(profile.points,6);
 profile.points=99;awardPoint(profile);awardPoint(profile);assert.equal(profile.points,100);
});
