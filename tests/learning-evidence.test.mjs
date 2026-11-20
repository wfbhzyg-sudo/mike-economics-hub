import test from 'node:test';
import assert from 'node:assert/strict';
import {applyRecovery,attachReview,evidenceChecked} from '../homework-server/correction-review.mjs';
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

test('model evidence matches normalized student quotes and validates attachment page bounds',()=>{
 const point={id:'reasoning'};
 const check=evidence=>[{id:'reasoning',met:true,evidence}];
 assert(evidenceChecked(point,check('“the good’s own price does not shift demand”'),"The good's own price does not shift demand",0));
 assert(!evidenceChecked(point,check('The supply curve shifts instead'),"The good's own price does not shift demand",0));
 assert(evidenceChecked(point,check('作答第 2 页，供给曲线左移'),'',2));
 assert(!evidenceChecked(point,check('作答第 3 页，供给曲线左移'),'',2));
});

import {performanceMarkup,teacherEvidenceReader} from '../homework/learning-evidence.js';
test('teacher and student cards share bands; only students get personal actions',()=>{
 const s=make('sa','a','08'),t=make('sb','b','12',2);t.rubricSnapshot=rubric.map(q=>({...q,prompt:q.prompt+' (new)'}));
 const [v]=studentPerformance([s,t],[assignment('a'),assignment('b')],[],[],[],Date.parse('2026-11-20'));
 const h=x=>String(x);const own=performanceMarkup(v,h,()=>'<a>错题</a>');
 const teacher=performanceMarkup(v,h,null,{teacher:true});
 assert.match(own,/data-performance-advice=/);assert.match(own,/错题/);
 assert.doesNotMatch(teacher,/data-performance-advice=|href=/);assert.match(teacher,/本教师可见作业/);
 for(const card of [own,teacher]){assert.match(card,/第 3 档/);assert.equal((card.match(/class="evidence-axis-index"/g)||[]).length,4);assert.match(card,/待积累/);}
});
test('profile evidence deduplicates in-flight requests per student and class, and retries after failure',async()=>{
 const calls=[];let fail=true;
 const read=teacherEvidenceReader(async url=>{calls.push(url);if(fail){fail=false;throw Error('temporary');}return {performance:['ok']};});
 await assert.rejects(read('one'));assert.deepEqual(await Promise.all([read('one'),read('one')]),[['ok'],['ok']]);
 await read('two');await read('one','class-2');assert.equal(calls.length,4);assert.equal(new URLSearchParams(calls.at(-1).split('?')[1]).get('class'),'class-2');
});
