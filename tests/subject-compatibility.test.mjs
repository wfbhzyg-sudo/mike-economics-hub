import assert from 'node:assert/strict';
import test from 'node:test';
import {subjects} from '../homework/subject-definitions.js';

// Only this isolated test process sees a third subject.
const extra={id:'qa-science',label:'综合科学',short:'科学',full:'综合科学课程',english:'Science',aliases:[],units:12,tone:'purple',
  skills:['读图','解释','推理','定义','分析数据'].map((name,i)=>({id:i+1,name,english:'Skill '+(i+1),choice:true,practice:'画图后对照数据。'})).reverse()};
subjects.push(extra);
const {subjectInfo,namedSubject,unitIdentity,validateSubjects}=await import('../homework/subject-catalog.js');
const {assignmentCourse,coursesFor,courseTabs}=await import('../homework/course-scope.js');
const {questionLessonReference}=await import('../homework-server/lesson-reference.mjs');
const {libraryLocation}=await import('../homework/library-navigation.js');
const {buildPacks}=await import('../homework/library-packs.js');
const {scoreBadge}=await import('../homework/score-bands.js');
const {checkContent}=await import('../scripts/check-curriculum.mjs');
const unit={id:'qa-science-unit-12',topics:[{id:'12.1'}]};
const q={id:'stable-question',unitId:unit.id,type:'choice',topic:'12.1',skill:'5',status:'ready',options:['A','B'],answer:'B',questionImages:['img'],number:'1',collection:'bank'};
const base={units:[unit,{id:'micro-unit-2',topics:[{id:'2.1'}]}],files:[{id:'img'}],questions:[q]};

test('registered subjects define filters, class membership, and assessment labels',()=>{
 assert.deepEqual(unitIdentity(unit.id),{course:extra.id,number:12});
 assert.equal(subjectInfo(extra.id).skills[4].name,'分析数据');
 assert.equal(namedSubject('G10 综合科学 1 班'),extra.id);
 assert.equal(assignmentCourse({classIds:['a']},[{id:'a',name:'一班',course:extra.id}]),extra.id);
 assert.deepEqual(coursesFor([],[{id:'a',name:'一班',course:extra.id}]),[extra.id]);
 assert.equal(assignmentCourse({course:'unregistered'}),'unknown');
 assert.match(courseTabs([extra.id],extra.id),/aria-pressed="true">综合科学</);
 assert.match(scoreBadge(85,extra.id),/第 5 档/);
 assert.match(scoreBadge(85,'micro'),/AP 5/);
});
test('invalid subject, alias collision and changed skill identifiers fail explicitly',()=>{
 for(const row of [{...extra,id:'micro'},{...extra,id:'other',aliases:['微观']},{...extra,id:'other',skills:[{...extra.skills[0],id:2}]}]){
  assert.throws(()=>validateSubjects([subjects[0],row]));
 }
});
test('insertion and reordering keep existing links, grade keys and packs stable',()=>{
 const old=structuredClone(base);
 const addition={topicAdditions:[{unitId:unit.id,topic:{id:'12.2'}}],questions:[{...q,id:'new-question',number:'2',topic:'12.2'}]};
 assert.equal(checkContent(addition,base).questions,1);
 assert.deepEqual(base,old);
 const topics=[{id:'12.2'},...unit.topics],units=[{id:'qa-science-unit-2',topics:[{id:'2.1'}]},{...unit,topics}];
 assert.equal(libraryLocation(units,{},unit.id,q.topic).unitId,unit.id);
 assert.equal(libraryLocation(units.reverse(),{},unit.id,q.topic).topicId,'12.1');
 assert.deepEqual(questionLessonReference({...q,libraryQuestionId:q.id}),{unit:unit.id,topic:'12.1',bank:q.id});
 const alt={...q,id:'new-question',number:'2',topic:'12.2'};
 for(const qs of [[q,alt],[alt,q]]){
  const p=buildPacks(qs,{topic:'12.1'}).find(p=>p.id==='skill5:0');
  assert.deepEqual(p.questionIds,[q.id]);
 }
});
test('chapter numbers shared by different subjects keep distinct references',()=>{
 for(const course of ['micro','macro',extra.id])
  assert.deepEqual(questionLessonReference({topic:'2.1'},{libraryCourse:course}),{unit:course+'-unit-2',topic:'2.1',bank:''});
 assert.equal(questionLessonReference({unitId:unit.id,topic:'2.1'}).topic,'');
});
test('read-only import preflight rejects destructive or broken additions, regardless of record order',()=>{
 const valid={...q,id:'new'};
 for(const batch of [{questions:[q]},{files:[{id:q.id}]},{questions:[{...valid,unitId:'missing'}]},{questions:[{...valid,topic:'12.9'}]},
  {questions:[{...valid,answer:'E'}]},{questions:[{...valid,questionImages:['broken']}]},{questions:[{...valid,skill:'6'}]},
  {topicAdditions:[{unitId:unit.id,topic:{id:'12.1'}}]},{topicAdditions:[{unitId:unit.id,topic:{id:'11.1'}}]}])
  assert.throws(()=>checkContent(batch,base));
 assert.throws(()=>checkContent({questions:[{...valid,sourceId:'source-1'}]},{...base,questions:[{...q,sourceId:'source-1'}]}),/原卷题号/);
 assert.equal(checkContent({questions:[{...valid,status:'needs_review',answer:''}]},base).questions,1);
});

test('class releases, file identity and optional textbook links remain subject scoped',async()=>{
 const {fingerprint,visibleUnitsForStudent}=await import('../homework-server/self-practice-model.mjs');
 const {matchedChapterKeys}=await import('../homework-server/review-links.mjs');
 const geo={...unit,owner:'teacher'};
 const econ={id:'micro-unit-2',owner:'teacher'};
 const releases=[{unitId:geo.id,owner:'teacher',classIds:['qa-class']},{unitId:econ.id,owner:'teacher',classIds:['econ-class']}];
 assert.deepEqual(visibleUnitsForStudent([geo,econ],{role:'student',classIds:['econ-class']},releases),[econ]);
 assert.notEqual(fingerprint({...q,source:'Paper',unitId:geo.id}),fingerprint({...q,source:'Paper',unitId:econ.id}));
 assert.deepEqual(matchedChapterKeys({knowledge:'elasticity'},extra.id),[]);
 assert(matchedChapterKeys({knowledge:'elasticity'},'micro').length>0);
});
