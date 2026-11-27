import test from 'node:test';
import assert from 'node:assert/strict';
import {resultParts} from '../homework-server/student-report.mjs';
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
test('offline report carries a labelled identity, compact offline styling and escaped student text',async()=>{
  const name='小林 <练习>', cls='A & B 班';
  const html=await renderStudentReport({name,classNames:[cls],at:'2026-11-22',period:'全部时间',courses:[]});
  assert.match(html,/小林 &lt;练习&gt;/);assert.match(html,/A &amp; B 班/);
  assert.match(html,/经济学学习报告/);assert.doesNotMatch(html,/data:image|data:font/);
  assert.doesNotMatch(html,/生成/);
  assert(Buffer.byteLength(html)<22_000);assert.doesNotMatch(html,/<练习>/);
  const url=new URL(studentReportUrl('a&b',{classId:'m&n',period:'term',assignmentId:'x#y'}),'http://localhost');
  assert.equal(url.searchParams.get('student'),'a&b');assert.equal(url.searchParams.get('class'),'m&n');
  assert.equal(url.searchParams.get('assignment'),'x#y');
});

test('trend bridges only internal gaps and distinguishes zero from missing in skill bars',async()=>{
  const {skillBars}=await import('../homework-server/report-charts.mjs');
  const {trendFigure}=await import('../homework-server/student-report-figures.mjs');
  const c={course:'macro',cells:[
    cell({total:6,maxPoints:10},[],{title:'最近',offline:true}),
    {status:'missing',assignment:{title:'未交'}},
    cell({total:0,maxPoints:10},[],{title:'最早'})
  ],evidence:{axes:[{skill:1,band:2},{skill:3,band:4}]}};
  const trend=trendFigure(c,2),bars=skillBars(c);
  assert.match(trend,/class="final-line" d="M[^"]+ M/);
  assert.equal((trend.match(/class="final-dot"/g)||[]).length,2);
  assert.equal((trend.match(/class="first-dot"/g)||[]).length,1);
  assert.match(trend,/最早 · 首答 0%/);assert.match(trend,/最近 · 最终 60%/);
  assert.match(trend,/class="gap final-line"/);
  assert.doesNotMatch(trend,/class="gap first-line"/);
  assert.equal((bars.match(/class="rr-skill"/g)||[]).length,4);
  assert.equal((bars.match(/待积累/g)||[]).length,2);
  assert.match(trendFigure({cells:[]},2),/还没有已公布成绩/);
});

test('the editorial report keeps the teacher’s words and shows empty states only where useful',async()=>{
  const course={course:'micro',label:'AP 微观',average:0,trend:null,cells:[],graded:0,pending:0,errors:0,mockHistory:[],advice:[]};
  const report={name:'测试',classNames:['A'],period:'本学期',courses:[course],at:'2026-11-22',includeMock:true,
    latestNote:{headline:'明天一起看看 <曲线>。',publishedAt:'2026-11-22',nextSteps:[]}};
  const body=await renderStudentReport(report);
  assert.match(body,/明天一起看看 &lt;曲线&gt;。/);
  assert.match(body,/<strong class="average">0%/);
  assert.doesNotMatch(body,/近期变化¹|<h3>下一次练习|本期观察/);
  assert.equal((body.match(/<figure /g)||[]).length,0);
  assert.match(body,/本期尚无作业或模考记录/);
  assert.match(body,/保存长图/);assert.doesNotMatch(body,/代表性作业|class="radar"/);
  const active=await renderStudentReport({...report,courses:[{...course,trend:0,mockHistory:[{date:'2026-11-20',rate:0,seconds:60}]}]});
  assert.match(active,/近期变化¹/);assert.match(active,/正确率 0%，用时 1 分 0 秒/);
});
