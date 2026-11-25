import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mergeDraft} from '../homework/attempt-sync.js';
import {labelledParts} from '../homework/frq-parts.js';
import {skillRadarSvg} from '../homework/learning-evidence.js';

test('different devices can change separate answers and attach a photo alongside a text change',()=>{
  const base={answers:{1:'A',2:'A'},responses:{3:{text:'draft',files:[]}},flags:[]};
  const mine={...base,answers:{1:'B',2:'A'},responses:{3:{text:'new',files:[]}},flags:['1']};
  const account={...base,answers:{1:'A',2:'C'},responses:{3:{text:'draft',files:['photo']}},flags:['2']};
  const {merged,conflicts}=mergeDraft(base,mine,account);assert.deepEqual(conflicts,[]);assert.deepEqual(merged.answers,{1:'B',2:'C'});
  assert.deepEqual(merged.responses[3],{text:'new',files:['photo']});assert.deepEqual(merged.flags.sort(),['1','2']);
});
test('different responses to the same question require an explicit decision, including older drafts',()=>{
  const base={responses:{b:{text:'before'}}},local={responses:{b:{text:'on tablet'}}},remote={responses:{b:{text:'on phone'}}};
  for(const ancestor of [base,null]){
    const {merged,conflicts}=mergeDraft(ancestor,local,remote);assert.equal(conflicts.length,1);
    assert.equal(conflicts[0].theirs,'on phone');conflicts[0].choose('on phone');assert.equal(merged.responses.b.text,'on phone');
    assert.equal(local.responses.b.text,'on tablet');
  }
});
test('FRQ subparts require distinct ordered line labels and keep whole introductory material',()=>{
  assert.deepEqual(labelledParts('Shared figure\n(a) Draw.\n(b) Explain.'),{intro:'Shared figure',parts:{a:'Draw.',b:'Explain.'}});
  assert.equal(labelledParts('Refer to point (a) on the curve.'),null);
  assert.equal(labelledParts('(b) Second\n(a) First'),null);
  assert.equal(labelledParts('(a) 1\n(a) 2'),null);
});
test('only the interactive student radar exposes keyboard targets',()=>{
  const axes=[null,1,2,5].map(band=>({band}));assert.equal((skillRadarSvg(axes,true).match(/data-skill-axis/g)||[]).length,4);
  assert.equal((skillRadarSvg(axes).match(/tabindex/g)||[]).length,0);
});
