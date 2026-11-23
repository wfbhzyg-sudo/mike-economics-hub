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
 assert(!testsAllSkills({title:'Unit 2.1 Homework'}));
 const micro=studentPerformance([s],[a],[]).find(p=>p.course==='micro');
 assert.deepEqual(micro.axes.map(s=>s.comprehensiveAssessments),[1,1,1,1]);assert.deepEqual(micro.axes.map(s=>s.count),[0,1,0,0]);
});
