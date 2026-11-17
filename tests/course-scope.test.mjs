import test from 'node:test';import assert from 'node:assert/strict';
import {assignmentCourse,coursesFor} from '../homework/course-scope.js';
import {cellsFor,cellSummary} from '../homework/grade-journey-model.js';
const classes=[{id:'bookself-class:m',name:'微观 1'},{id:'M',name:'宏观 1'}];
test('explicit subject wins over primary class; only unambiguous class labels infer missing subjects',()=>{
 assert.equal(assignmentCourse({course:'经济学',classIds:['M']},classes),'macro');
 assert.equal(assignmentCourse({course:'AP Microeconomics',classIds:['M']},classes),'micro');
 assert.equal(assignmentCourse({course:'经济学',libraryCourse:'macro',classIds:['m']},classes),'macro');
 assert.equal(assignmentCourse({course:'经济学',classIds:['m','M']},classes),'mixed');
 assert.equal(assignmentCourse({title:'3.3 MCQ',classIds:['missing']},classes),'unknown');
 assert.deepEqual(coursesFor([],classes),['micro','macro']);
});
test('one multi-class student has independent subject averages with blank omitted and zero counted',()=>{
 const assignments=[{id:'a',course:'AP 微观',classIds:['m'],published:true},{id:'b',course:'AP 宏观',classIds:['M'],published:true},{id:'c',course:'AP 宏观',classIds:['M'],published:true},{id:'d',course:'AP 宏观',classIds:['M'],published:true}];
 const submissions=[80,20,0,null].map((total,i)=>({id:'s'+i,studentId:'s',assignmentId:assignments[i].id,status:'published',submittedAt:'2026-11-17',publishedGrade:{total,maxPoints:100,absent:total===null,questions:[]}}));
 const cells=cellsFor({assignments,submissions},{id:'s',classIds:['m','M']});
 assert.equal(cellSummary(cells.filter(c=>assignmentCourse(c.assignment)==='micro')).average,80);
 assert.equal(cellSummary(cells.filter(c=>assignmentCourse(c.assignment)==='macro')).average,10);
});
