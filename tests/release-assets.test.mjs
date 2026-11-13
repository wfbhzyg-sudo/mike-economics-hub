import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('production image includes the shared companion entry and stylesheet',async()=>{
 const docker=await readFile(new URL('../Dockerfile',import.meta.url),'utf8');
 const copies=docker.split('\n').filter(line=>line.startsWith('COPY ')).join(' ');
 for(const file of ['companion.js','companion.css'])assert.ok(copies.split(/\s+/).includes(file),'Missing public asset in Docker COPY: '+file);
});
