import test from 'node:test';
import assert from 'node:assert/strict';
import {applyRecovery,attachReview} from '../homework-server/correction-review.mjs';
import {studentPerformance} from '../homework-server/student-performance.mjs';
import {hash} from '../homework-server/store.mjs';
import {questionStats} from '../homework/learning-analytics-model.js';

const rubric=[
 {id:'1',type:'choice',skill:'1.A',prompt:'Demand',maxPoints:2},
 {id:'2',type:'short',maxPoints:4,scoringPoints:[{id:'1',skill:'4',maxPoints:4}]},
];
const make=(id,assignmentId,day,score=0)=>({
 id,assignmentId,studentId:'s',status:'published',submittedAt:`2026-11-${day}T12:00:00Z`,rubricSnapshot:rubric,
 publishedGrade:{total:2+score,maxPoints:6,questions:[
   {id:'1',score,maxPoints:2},
   {id:'2',score:2,maxPoints:4,pointResults:[{id:'1',earned:2}]},
 ]},
});
const assignment=id=>({id,title:'需求',published:true,course:'AP 微观经济学',questions:rubric,classIds:['class']});
const event=(s,q,status='passed')=>({submissionId:s.id,assignmentId:s.assignmentId,questionId:q.id,status,rubricHash:hash(JSON.stringify(q)),finishedAt:'2026-11-10T00:00:00Z'});
test('correction leaves original objects and first item statistics intact and preserves a pending replacement',()=>{
 const s=make('s1','a','08'), replacement={...make('s2','a','12'),status:'needs_review',publishedGrade:null};
 const a=assignment('a');
 const corrected=applyRecovery([s,replacement],[event(s,rubric[0])],[a]);
 assert.equal(corrected[0].publishedGrade.total,4);
 assert.equal(s.publishedGrade.total,2);
 const qs=questionStats({assignments:[a],submissions:[corrected[0]]},a.id).questions;
 assert.deepEqual([qs[0].rate,qs[0].afterRate],[0,100]);
 assert.equal(applyRecovery([s,make('s2','a','12')],[event(s,rubric[0])],[a])[1].publishedGrade.total,2);
 assert.equal(applyRecovery([s],[event(s,rubric[0],'revise')],[a])[0].publishedGrade.total,2);
});
test('a teacher total override or blank accounts for credit without replacing prior grades',()=>{
 const s=make('s1','a','08');
 const edited={...s,publishedGrade:{...s.publishedGrade,total:3,manualTotal:true},gradeHistory:[s.publishedGrade]};
 const counted=applyRecovery([edited],[event(s,rubric[0]),event(s,rubric[1])],[assignment('a')])[0].publishedGrade;
 assert.equal(counted.total,3);
 assert.deepEqual([counted.scoreSources.first,counted.scoreSources.recovered,counted.scoreSources.adjustment],[2,4,-3]);
 assert.equal(applyRecovery([{...edited,publishedGrade:{...edited.publishedGrade,total:null}}],[event(s,rubric[0])],[assignment('a')])[0].publishedGrade.total,null);
});
test('correction alone neither raises class-independent skill evidence nor supplies missing sample',()=>{
 const a=assignment('a'),b=assignment('b'),s=make('s1','a','08'),t=make('s2','b','12',2),review=event(s,rubric[0]);
 const at=Date.parse('2026-11-20T00:00:00Z');
 const before=studentPerformance([s,t],[a,b],[],[],[],at);
 const verification=attachReview({submissionId:s.id,assignmentId:a.id,questionId:'1'},review).verification;
 const after=studentPerformance([s,t],[a,b],[{submissionId:s.id,assignmentId:a.id,questionId:'1',verification}],[],[],at);
 assert.equal(before[0].index.value,50);
 assert.equal(after[0].index.value,50);
 assert.equal(after[0].transfer,null);
 assert.equal(after[1].index,null);
 assert.equal(after[0].axes[0].band,null); // Identical content across these two papers is one independent question.
 assert.equal(after[0].corrections.done,1);
});
