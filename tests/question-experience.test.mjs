import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicQuestion,questionEligible} from '../homework-server/self-practice-model.mjs';
import {createStudyWorkflow,summarizeMock,mockScorePercent} from '../homework-server/study-workflow.mjs';
import {questionResult} from '../homework/result-badge.js';
import {topicGrid} from '../homework/topic-grid.js';

test('mock snapshot keeps ordered slices and option text private from answers',()=>{
  const q={id:'test',type:'choice',status:'ready',unitId:'micro-unit-2',topic:'2.3',
    questionImages:['shared','stem','next-page'],options:[{label:'A',text:'Demand rises'},{label:'B',text:'Demand falls'}],answer:'B'};
  const unit={id:q.unitId,topics:[{id:q.topic}]};
  assert(questionEligible(q,{unit}));
  assert(!questionEligible({...q,questionVisualStatus:'incomplete'},{unit}));
  const visible=publicQuestion(q);
  assert.deepEqual(visible.questionImages,['shared','stem','next-page']);
  assert.equal(visible.optionText.B,'Demand falls');
  assert(!Object.hasOwn(visible,'answer'));
});

test('each subject keeps its own topic, coverage counts students and accuracy counts points',()=>{
  const attempt=(studentId,course,score,maxPoints)=>({studentId,course,result:{questions:[{topic:'2.3',score,maxPoints}]}});
  const s=summarizeMock([attempt('a','micro',1,2),attempt('a','micro',2,3),attempt('b','macro',0,2)],4);
  const micro=s.topics.find(t=>t.course==='micro'),macro=s.topics.find(t=>t.course==='macro');
  assert.deepEqual([micro.participants,micro.correct,micro.total],[1,3,5]);
  assert.deepEqual([macro.participants,macro.correct,macro.total],[1,0,2]);
  const html=topicGrid([{...micro,roster:4},{...macro,roster:4}],String);
  assert.match(html,/data-band="4" style="--coverage:25%"/);
  assert.match(html,/data-band="1" style="--coverage:25%"/);
});

test('unanswered, zero, partially correct, full marks and pending are distinct',()=>{
  assert.equal(questionResult({score:0,maxPoints:1,unanswered:true}).label,'未作答');
  assert.equal(questionResult({score:0,maxPoints:1}).key,'wrong');
  assert.equal(questionResult({score:2,maxPoints:3}).key,'partial');
  assert.equal(questionResult({score:3,maxPoints:3}).key,'correct');
  assert.equal(questionResult({score:null,maxPoints:3}).label,'待评分');
});

test('mock percentage preserves real zero and compares different paper totals',()=>{
  assert.equal(mockScorePercent({total:1,maxPoints:3}),33.3);
  assert.equal(mockScorePercent({total:0,maxPoints:10}),0);
  assert.equal(mockScorePercent({total:null,maxPoints:10}),null);
  assert.equal(mockScorePercent({total:3,maxPoints:0}),null);
});

test('teacher personal mock history keeps scope, chronological pages and snapshot answers',async()=>{
  const micro={id:'micro-class',name:'AP 微观'},macro={id:'macro-class',name:'AP 宏观'};
  const mixed={id:'mixed-class',name:'AP 经济学'};
  const student={id:'student-a',name:'Student',classIds:[micro.id,macro.id,mixed.id]};
  const makeAttempt=(id,course,date,score,chosen='A')=>({
    id,type:'self-practice-attempt',status:'submitted',studentId:student.id,classIds:student.classIds,course,
    submittedAt:date,questions:[{id:'q',topic:'2.3',options:['A','B'],answer:'B'}],
    result:{total:score,maxPoints:1,durationSeconds:0,questions:[{id:'q',topic:'2.3',score,maxPoints:1,chosen}]},
  });
  const recent='2026-11-18T02:00:00.000Z';
  const records=[
    ...Array.from({length:26},(_,i)=>makeAttempt('micro-'+String(i).padStart(2,'0'),'micro',recent,0,i%2?'':'A')),
    makeAttempt('macro-new','macro',recent,1,'B'),
    makeAttempt('micro-old','micro','2026-08-01T02:00:00.000Z',1,'B'),
  ];
  const workflow=createStudyWorkflow({db:{
    find:async (kind,filter)=>kind==='self-practice-attempt'?records.filter(row=>row.studentId===filter.studentId):[],
    list:async()=>[],
    get:async id=>records.find(a=>a.id===id),
  }});
  async function get(path,role='teacher',classes=[micro,macro]){
    let payload;
    const route=path.split('?')[0].split('/').map(decodeURIComponent);
    await workflow.handle({route,req:{url:'/api/homework/'+path},method:'GET',user:{role},
      availableClasses:async()=>classes,availableStudents:async()=>[student],json:(_,data)=>{payload=data;}});
    return payload;
  }
  const base='mock-stats/students/'+student.id;
  const narrow=await get(base+'?classId=micro-class&from=2026-11-18&to=2026-11-18');
  assert.equal(narrow.currentCount,26);
  assert.equal(narrow.authorizedCount,27);
  assert.equal(narrow.attempts[0].id,'micro-25');
  assert.equal(narrow.attempts[0].percent,0);
  assert.equal(narrow.attempts[0].duration,0);
  assert.equal(narrow.chapters[0].answered,13);
  const personalHtml=topicGrid(narrow.chapters,String,{personal:true});
  assert.match(personalHtml,/data-band="1" style="--coverage:50%"/);
  const older=await get(base+'?classId=micro-class&history=all&cursor='+narrow.next);
  assert.deepEqual(older.attempts.map(a=>a.id),['micro-00','micro-old']);
  const all=await get(base+'?history=all');
  assert.deepEqual(new Set(all.chapters.map(c=>c.course)),new Set(['micro','macro']));
  const selectedCourse=await get(base+'?classId=mixed-class&course=micro&history=all','teacher',[mixed]);
  assert.equal(selectedCourse.authorizedCount,27);
  assert.ok(selectedCourse.attempts.every(a=>a.course==='micro'));
  const detail=await get('mock-stats/micro-25?studentId='+student.id+'&review=1');
  assert.equal(detail.review[0].correctOption,'B');
  assert.equal(detail.review[0].chosen,'');
  await assert.rejects(get(base+'?history=all','student'),{status:403});
  await assert.rejects(get(base+'?classId=micro-class&history=all','teacher',[macro]),{status:403});
  await assert.rejects(get('mock-stats/macro-new?classId=micro-class&review=1'),{status:404});
});
