import test from 'node:test';import assert from 'node:assert/strict';
import {courseFileETag,matchesETag} from '../homework-server/file-cache.mjs';
test('only verified immutable content receives a validator; range and original downloads keep their existing path',()=>{
 const file={id:'source',sha256:'a'.repeat(64)},tag=courseFileETag(file);
 assert.equal(tag,'"sha256-'+file.sha256+'"');
 assert.notEqual(tag,courseFileETag({...file,sha256:'b'.repeat(64)}));
 assert.equal(courseFileETag({id:'student-photo'}),null);
 assert.equal(courseFileETag({...file,sha256:'not-a-hash'}),null);
 assert.equal(courseFileETag(file,{download:true}),null);
 assert.equal(courseFileETag(file,{range:true}),null);
});
test('GET revalidation recognizes lists and weak validators, without matching another resource',()=>{
 const tag='"sha256-'+ 'c'.repeat(64)+'"';
 assert(matchesETag(tag,tag));assert(matchesETag('"other", W/'+tag,tag));assert(matchesETag('*',tag));
 assert.equal(matchesETag('"other"',tag),false);assert.equal(matchesETag(undefined,tag),false);assert.equal(matchesETag('*',null),false);
});
