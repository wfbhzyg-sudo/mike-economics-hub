import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('production image includes the shared companion entry and stylesheet',async()=>{
 const docker=await readFile(new URL('../Dockerfile',import.meta.url),'utf8');
 const copies=docker.split('\n').filter(line=>line.startsWith('COPY ')).join(' ');
 for(const file of ['companion.js','companion.css'])assert.ok(copies.split(/\s+/).includes(file),'Missing public asset in Docker COPY: '+file);
});
test('homework module dependencies are available through the authenticated asset allowlist',async()=>{
 const {readdir}=await import('node:fs/promises');const server=await readFile(new URL('../unified-server.mjs',import.meta.url),'utf8');
 for(const name of await readdir(new URL('../homework/',import.meta.url))){if(!name.endsWith('.js'))continue;const source=await readFile(new URL('../homework/'+name,import.meta.url),'utf8');for(const m of source.matchAll(/(?:from\s*|import\s*)['"]\.\/([^'"]+\.js)['"]/g))assert.ok(server.includes("'homework/"+m[1]+"'"),'Missing routed dependency: '+name+' -> '+m[1]);}
});
