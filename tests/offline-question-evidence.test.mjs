import assert from 'node:assert/strict';
import test from 'node:test';
import {mistakeRows} from '../homework-server/learning.mjs';
import {testsAllSkills,studentPerformance} from '../homework-server/student-performance.mjs';
import {applyRecovery} from '../homework-server/correction-review.mjs';
import {hash} from '../homework-server/store.mjs';
import {editTeacherScore} from '../homework-server/teacher-score.mjs';
const q={id:'1',prompt:'Fixture',type:'choice',skill:'2.A',questionImages:['fixture'],correctOptions:['B'],maxPoints:1};
const a={id:'quiz',title:'Unit 1 Monthly Test',libraryCourse:'micro',course:'AP 微观经济学',published:true,offline:true,format:'score',version:1,correctionCredit:true,rubric:[q]};
const s={id:'sub',assignmentId:a.id,studentId:'student',submittedAt:'2026-10-01',status:'published',rubricSnapshot:[q],choices:{1:'A'},version:1,offlineEvidence:{total:8,maxPoints:20},publishedGrade:{total:4,maxPoints:10,revision:1,questions:[{id:'1',type:'choice',score:0,maxPoints:1}]}};
test('offline evidence links source and choice, and preserves the teacher grade when edited',()=>{
 const [wrong]=mistakeRows([s],[a]);
 assert.equal(wrong.originalChoice,'A');assert.deepEqual(wrong.questionImages,['fixture']);
 assert.equal(wrong.correctionFeedback,null);
 const next=editTeacherScore(s,a,{score:7,revision:1},'teacher','2026-11-23');
 assert.deepEqual(next.publishedGrade.questions,s.publishedGrade.questions);assert.deepEqual(next.offlineEvidence,s.offlineEvidence);
});
test('correction credit respects the recorded scale and preserves the independent grade',()=>{
 const review={status:'passed',submissionId:s.id,questionId:'1',rubricHash:hash(JSON.stringify(q))};
 const [next]=applyRecovery([s],[review],[a]);
 assert.equal(next.publishedGrade.total,4.5);assert.equal(next.publishedGrade.scoreSources.recovered,.5);assert.equal(s.publishedGrade.total,4);
});
test('a scored exam covers every skill while each skill score requires its own evidence',()=>{
 for(const title of ['Unit 2 Progress Check FRQ','Monthly Test','Quiz','考试','随堂测','Test 1'])assert(testsAllSkills({title}));
 assert(testsAllSkills({title:'Chapter review',assessmentMode:'exam'}));
 assert(testsAllSkills({title:'Unit 2',libraryCollection:'progress'}));
 assert(!testsAllSkills({title:'Unit 2.1 Homework'}));
 const micro=studentPerformance([s],[a],[]).find(p=>p.course==='micro');
 assert.deepEqual(micro.axes.map(s=>s.comprehensiveAssessments),[1,1,1,1]);assert.deepEqual(micro.axes.map(s=>s.count),[0,1,0,0]);
});

test('teacher sees each recorded choice, reference answer, and result without opening individual questions',async()=>{
 const {offlineAnswers,hasItemScores}=await import('../homework/offline-answers.js');
 const sheet=offlineAnswers(s,String);
 assert.match(sheet,/学生答案/);assert.match(sheet,/<strong>A<\/strong><span>B<\/span>/);
 assert.match(sheet,/错误/);assert.match(sheet,/data-original-src=/);assert.doesNotMatch(sheet,/<img[^>]+\ssrc=/);
 assert(hasItemScores(s));assert(!hasItemScores({publishedGrade:{total:0,questions:[]}}));
 const parts=offlineAnswers({...s,choices:{},rubricSnapshot:[{...q,type:'short'}],publishedGrade:{questions:[{id:'1',type:'short',score:1,maxPoints:2,pointResults:[{id:'a',earned:0,maxPoints:1},{id:'b',earned:1,maxPoints:1}]}]}},String);
 assert.match(parts,/部分得分/);assert.match(parts,/\(a\) 0 \/ 1/);assert.match(parts,/未提供学生作答原文/);
});

test('accepted offline corrections are distinguished from scaled points and capped totals',async()=>{
 const {questionStats}=await import('../homework/learning-analytics-model.js');
 const {resultParts}=await import('../homework-server/student-report.mjs');
 const passed={status:'passed',submissionId:s.id,questionId:'1',rubricHash:hash(JSON.stringify(q))};
 for(const total of [4,10]){
  const original={...s,publishedGrade:{...s.publishedGrade,total}};
  const [next]=applyRecovery([original],[passed],[a]);
  const metrics=questionStats({submissions:[next],assignments:[{...a,questions:[q]}]},a.id).questions[0];
  assert.equal(metrics.correct,0);assert.equal(metrics.corrected,1);assert.equal(metrics.afterRate,100);
  assert.equal(next.publishedGrade.total,Math.min(total+.5,10));
  if(total<10){const out=resultParts({status:'graded',assignment:a,record:{grade:next.publishedGrade,effective:next}});assert.equal(out.first,4);assert.equal(out.recovered,.5);}
 }
});

test('offline zero counts as a recorded submission and a cleared grade stays outside completion and averages',async()=>{
 const {buildRows,overviewStats}=await import('../homework/learning-analytics-model.js');
 const people=[{id:'student',name:'测试',classIds:['c']}];
 const assignments=[{...a,classIds:['c'],audience:{required:true}}];
 for (const total of [0,4,null]){
  const submission={...s,manualScoreEntry:true,publishedGrade:{...s.publishedGrade,total}};
  const data={students:people,assignments,submissions:[submission],mistakes:[]};
  const rows=buildRows(data,people,assignments),summary=overviewStats(rows,assignments);
  assert.equal(rows[0].submitted,total===null?0:1);assert.equal(summary.submitted,total===null?0:1);
  assert.equal(summary.average,total===null?null:total*10);
 }
});

test('only published and graded offline items expose answers in the individual result',async()=>{
  const {offlineResultQuestions,visibleQuestions}=await import('../homework-server/learning.mjs');
  const short={id:'2',type:'short',answer:'The index is 130.',criteria:'private rubric',maxPoints:1};
  const pending={...q,id:'3',manualGradingRequired:true};
  const optional={...q,id:'4'};
  const record={...s,rubricSnapshot:[q,short,pending,optional],publishedGrade:{...s.publishedGrade,questions:[{id:'1',score:0},{id:'2',score:0},{id:'3',score:0},{id:'4',score:null}]}};
  const bare=visibleQuestions(record);
  assert(!bare.some(row=>'correctOptions' in row || 'referenceAnswer' in row));
  const detail=offlineResultQuestions(record,bare);
  assert.deepEqual(detail[0].correctOptions,['B']);assert.equal(detail[1].referenceAnswer,short.answer);
  assert(!('criteria' in detail[1]));assert(!('correctOptions' in detail[2]));assert(!('correctOptions' in detail[3]));
  assert.equal(offlineResultQuestions({...record,status:'draft'},bare),bare);
  assert.equal(offlineResultQuestions({...record,offlineEvidence:null},bare),bare);
});

test('a corrected occurrence remains findable when the same bank question was missed elsewhere',async()=>{
 const {matchingMistakes}=await import('../homework/mistake-navigation.js');
 const done={assignmentId:'old-import',course:'micro',status:'verified'};
 const pending={assignmentId:'new-import',course:'micro',status:'todo',occurrences:[done],mistakeCount:2};
 const scoped=matchingMistakes([pending],row=>row.course==='micro');
 assert.equal(scoped.length,1);assert.equal(scoped[0].mistakeCount,2);
 const verified=matchingMistakes(scoped,row=>row.status==='verified');
 assert.equal(verified.length,1);assert.equal(verified[0].assignmentId,done.assignmentId);
 assert.equal(verified[0].mistakeCount,1);assert.deepEqual(verified[0].occurrences,[]);
});

test('correction topics include every matching occurrence and keep untagged unit questions accessible',async()=>{
 const {matchingMistakes,mistakeTopic,mistakeTopicOptions}=await import('../homework/mistake-navigation.js');
 const row=(course,topic)=>({course,lessonReference:{unit:course+'-unit-2',topic},knowledge:'Topic '+topic+' · Demand'});
 const group={...row('macro','2.2'),occurrences:[row('micro','2.10'),row('micro','2.2'),row('micro','3.1')]};
 const scoped=matchingMistakes([group],m=>m.course==='micro');
 assert.deepEqual(mistakeTopicOptions(scoped),[['2.2','Demand'],['2.10','Demand'],['','']]);
 assert.equal(matchingMistakes(scoped,m=>mistakeTopic(m)==='2.2')[0].mistakeCount,1);
 assert.equal(mistakeTopic({source:'mock',topic:'2.6',libraryUnit:'micro-unit-2'}),'2.6');
 assert.equal(mistakeTopic({libraryUnit:'macro-unit-2',assignmentTitle:'3.1 FRQ'}),'');
});

test('topic totals separate actual review jobs from ordinary saved notes and self-assessment',async()=>{
 const {topicWorkCounts}=await import('../homework/mistake-navigation.js');
 const row=(progressStatus,status)=>({topic:'2.1',progressStatus,verification:status?{status}:null});
 const groups=[{...row('todo','revise'),occurrences:[row('todo'),row('review','manual')]},row('review'),row('verified','passed'),row('review','queued')];
 assert.deepEqual(topicWorkCounts(groups).get('2.1'),{pending:1,waiting:2});
});
