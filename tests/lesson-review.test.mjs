import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonFocus} from '../homework/lesson-focus.js';
import {expandedLessonFocus} from '../homework-server/lesson-focus-data.mjs';
import {questionLessonReference} from '../homework-server/lesson-reference.mjs';
import {visibleQuestions} from '../homework-server/learning.mjs';
import {focusMarkup} from '../homework/lesson-panel.js';

test('all 78 Micro and Macro topics have four study sections and an original source', () => {
  assert.deepEqual(Object.keys(expandedLessonFocus).sort(), Object.keys(lessonFocus).sort());
  assert.equal(Object.keys(expandedLessonFocus).length, 78);
  for (const [key,focus] of Object.entries(expandedLessonFocus)) {
    for (const field of ['goal', 'rule', 'apply', 'pitfall']) assert.ok(focus[field]?.length > 25, key + ' ' + field);
    if (key.startsWith('micro:')) assert.ok(focus.source.filePage > 0 && focus.source.printedPage > 0);
    else assert.ok(focus.source.path.length >= 2);
  }
  const html = focusMarkup({...lessonFocus['micro:2.3'],...expandedLessonFocus['micro:2.3']},{canPin:true});
  for (const id of ['goals','rule','apply','pitfall']) assert.match(html,new RegExp('id="focus-'+id+'"'));
  assert.match(html,/PDF p\. 30/);
  assert.match(html,/data-pin="rule"/);
  assert.deepEqual(expandedLessonFocus['macro:3.9'].source.path.slice(0,2),
    ['Unit 3','Chapter 2 Multipliers and Automatic Stabilizers']);
});

test('lesson references stay scoped to course and question, including historical snapshots', () => {
  const tagged = {knowledge:'Topic 2.3 · example'};
  assert.deepEqual(questionLessonReference(tagged,{course:'AP 宏观'}),{bank:'',unit:'macro-unit-2',topic:'2.3'});
  assert.deepEqual(questionLessonReference(tagged,{course:'AP 微观'}),{bank:'',unit:'micro-unit-2',topic:'2.3'});
  assert.equal(questionLessonReference({...tagged,libraryQuestionId:'bank-id'},{libraryCourse:'mixed'}).unit,'');
  assert.equal(questionLessonReference({knowledge:'2024 FRQ Question 2.3'},{libraryUnit:'macro-unit-2'}).topic,'');
  const publicItems = visibleQuestions({
    rubricSnapshot:[{id:'1',lessonUnit:'macro-unit-2',lessonTopic:'2.3',libraryQuestionId:'old-bank',answer:'B'}],
    publishedGrade:{questionsSnapshot:[{id:'1',prompt:'Original question'}]},
  });
  assert.equal(publicItems[0].lessonReference.topic,'2.3');
  assert.equal(publicItems[0].lessonReference.bank,'old-bank');
  assert.equal(publicItems[0].answer,undefined);
});
