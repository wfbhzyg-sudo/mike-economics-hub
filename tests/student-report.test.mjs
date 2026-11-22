import test from 'node:test';
import assert from 'node:assert/strict';
import {resultParts,readingHighlight} from '../homework-server/student-report.mjs';
import {renderStudentReport} from '../homework-server/student-report-view.mjs';
import {studentReportUrl} from '../homework/student-report-link.js';

function cell(grade,previous=[],assignment={}) {
  const effective={id:'new',publishedGrade:grade};
  return {status:'graded',assignment,record:{grade,effective,attempts:[effective,...previous]}};
}
test('student report keeps a valid zero and reconciles resubmission, recovery and adjustment',()=>{
  const grade={total:8,maxPoints:10,scoreSources:{original:4,first:5,recovered:2,adjustment:1}};
  const before={id:'old',publishedGrade:{total:0,maxPoints:10}};
  assert.deepEqual(resultParts(cell(grade,[before])),{first:0,resubmission:4,recovered:2,adjustment:2,total:8,max:10});
  assert.equal(resultParts(cell(grade,[{...before,publishedGrade:{total:0,maxPoints:6}}])).first,null);
  assert.equal(resultParts(cell({total:0,maxPoints:10},[],{offline:true})).first,null);
  assert.equal(resultParts({status:'missing'}),null);
});
test('feedback uses verified evidence for praise, with no invented achievement for an empty profile',()=>{
  assert.match(readingHighlight({verified:2}),/2 道题/);
  assert.match(readingHighlight({graded:0,mockHistory:[]}),/还没有已公布/);
  const skill={skill:2,band:3,value:50,count:4,references:[{title:'读图练习',questionNumber:4,score:2,max:2}]};
  assert.match(readingHighlight({graded:1,evidence:{axes:[skill]}}),/《读图练习》第 4 题/);
});
test('offline report carries a labelled identity, local artwork and escaped student text',async()=>{
  const name='小林 <练习>', cls='A & B 班';
  const html=await renderStudentReport({name,classNames:[cls],at:'2026-11-22',period:'全部时间',courses:[]});
  assert.match(html,/小林 &lt;练习&gt;/);assert.match(html,/A &amp; B 班/);
  assert.match(html,/data:image\/webp;base64,/);assert.match(html,/data:font\/ttf;base64,/);
  assert.match(html,/--campus:url\("data:image\/webp;base64,/);assert.doesNotMatch(html,/生成/);
  assert(Buffer.byteLength(html)<180_000);assert.doesNotMatch(html,/<练习>/);
  const url=new URL(studentReportUrl('a&b',{classId:'m&n',period:'term',assignmentId:'x#y'}),'http://localhost');
  assert.equal(url.searchParams.get('student'),'a&b');assert.equal(url.searchParams.get('class'),'m&n');
  assert.equal(url.searchParams.get('assignment'),'x#y');
});
