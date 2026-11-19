import test from 'node:test';
import assert from 'node:assert/strict';
import {paginate,styles} from '../assets/notebook/journal-layout.js';
import {profileView} from '../homework-server/companion-profile.mjs';

test('a long edition continues within the writing area and preserves every character',()=>{
  const measure=(kind,value)=>[...value].length*styles[kind].size;
  const edition={date:'2026-11-19',title:'超长标题'.repeat(63),items:[{title:'关于订正',text:'作业与订正 ABC123 '.repeat(160)}]};
  const pages=paginate([edition],measure);
  assert(pages.length>2);
  assert.equal(pages.flatMap(p=>p.lines.map(l=>l.text)).join(''),edition.date+edition.title+edition.items[0].title+edition.items[0].text);
  for(const [i,page] of pages.entries()){
    assert.equal(page.number,i+1);
    for(const line of page.lines){assert(line.y>=138&&line.y<=718);assert(measure(line.kind,line.text)<=486);}
  }
});
test('each role opens on the newest edition and keeps its own read history',()=>{
  for(const role of ['teacher','student']){
    const {editions}=profileView({},role);
    assert(editions.every((e,i)=>!i||e.date<=editions[i-1].date));
    assert.equal(new Set(editions.map(e=>e.id)).size,editions.length);
    const pages=paginate([...editions].reverse(),(_kind,text)=>text.length*22);
    assert.equal(pages[0].lines[0].text,editions[0].date);
    assert(profileView({read:editions.slice(1).map(e=>e.id)},role).unread);
    assert(!profileView({read:editions.map(e=>e.id)},role).unread);
  }
});
