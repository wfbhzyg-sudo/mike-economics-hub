import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonExamples} from '../homework-server/lesson-mcq-data.mjs';
import {expandedLessonFocus} from '../homework-server/lesson-focus-data.mjs';
import {focusMarkup} from '../homework/lesson-panel.js';
import {lessonFocus} from '../homework/lesson-focus.js';
import {exampleMarkup} from '../homework/lesson-examples.js';

test('each course topic has distinct concepts, specific AP skills and independently keyed practice', () => {
  assert.deepEqual(Object.keys(lessonExamples).sort(),Object.keys(expandedLessonFocus).sort());
  const stems=new Set();
  for (const [key,items] of Object.entries(lessonExamples)) {
    assert.ok(new Set(items.map(x=>x.skill)).size>=2,key);
    assert.equal(new Set(items.map(x=>x.term)).size,items.length,key);
    const notes=items.flatMap(item=>item.notes||[]).sort();
    assert.deepEqual([...new Set(notes.map(ref=>ref.split(':')[0]))].sort(),['apply','goal','goals','pitfall','pitfalls','rule'],key);
    for (const field of ['rule','apply','pitfall']) {
      const refs=notes.filter(ref=>ref===field||ref.startsWith(field+':'));
      const original=expandedLessonFocus[key][field];
      const expected=original.replace(/([.!?])\s+(?=[A-Z])/g,'$1\n').split('\n');
      assert.deepEqual(refs,refs.includes(field)?[field]:expected.map((_,i)=>field+':'+i),key+' '+field);
    }
    const page=focusMarkup({...lessonFocus[key],...expandedLessonFocus[key],examples:items},{canPin:true});
    for (const id of ['goals','rule','apply','pitfall']) assert.equal(page.split('id="focus-'+id+'"').length,2,key);
    assert.ok(!page.includes('MCQ focus')&&!page.includes('<section id="focus-'),key);
    assert.equal((page.match(/data-pin-example=/g)||[]).length,items.length,key);
    for (const item of items) {
      assert.equal(item.stem.split(item.clue).length,2,key+' '+item.term);
      assert.ok(item.coach.length>40 && item.coach!==item.rule && item.coach!==item.explanation,key);
      assert.ok(!item.coach.includes('Correct answer'),key);
      assert.match(item.skill,/^(1\.[ABCD]|[23]\.[ABC])$/);
      assert.match(item.translation,/\p{Script=Han}/u);
      for (const field of ['rule','stem','explanation']) assert.ok(item[field].length>20,key+' '+field);
      assert.ok(!stems.has(item.stem),item.stem);stems.add(item.stem);
      assert.equal(new Set(item.options).size,5);
      assert.ok(Number.isInteger(item.correct)&&item.options[item.correct]);
      if(item.table) assert.ok(item.table.rows.every(r=>r.length===item.table.columns.length));
      const markup=exampleMarkup([item],String);
      assert.ok(markup.includes('<mark>'+item.clue+'</mark>') && markup.indexOf(item.coach)<markup.indexOf('data-lf-choice'),key);
      assert.equal((markup.match(/data-lf-choice=/g)||[]).length,5);
      assert.ok(!markup.includes('data-mark=')&&!markup.includes(item.explanation));
    }
  }
});
test('figure and table answer keys agree with the values in their stimuli', () => {
  const graphical=Object.values(lessonExamples).flat().filter(x=>x.figure);
  for(const x of graphical) assert.ok(exampleMarkup([x],String).includes('role="img"'));
  const surplus=graphical.find(x=>x.figure==='market-surplus'), gap=graphical.find(x=>x.figure==='output-gap');
  assert.equal(surplus.options[surplus.correct],'$'+(10-2)*8/2);
  assert.equal(gap.options[gap.correct],(100-80)+' billion');
  const game=lessonExamples['micro:4.5'].find(x=>x.table);
  assert.equal(game.options[game.correct],'Low, Low');
  assert.deepEqual(game.table.rows[1],['Low','(10, 2)','(4, 4)']);
});
