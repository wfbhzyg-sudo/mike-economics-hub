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
 const singleCourse=courseTabs([extra.id],extra.id);
 assert.match(singleCourse,/>综合科学<\/span>/);
 assert.doesNotMatch(singleCourse,/<button/);
 assert.match(courseTabs(['micro',extra.id],extra.id),/aria-pressed="true">综合科学</);
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

test('old AP topic summaries retain the complete lesson and its exercises in both workspaces',async()=>{
 const {topicLesson}=await import('../homework-server/lesson-content.mjs');
 const {lessonExamples}=await import('../homework-server/lesson-mcq-data.mjs');
 const {focusMarkup}=await import('../homework/lesson-panel.js');
 for(const [key,examples] of Object.entries(lessonExamples)){
  const [subject,id]=key.split(':'),unit=subject+'-unit-'+id.split('.')[0];
  const lesson=topicLesson(unit,{id,focus:'旧版本导入的单元目录摘要'});
  assert(lesson.rule && lesson.goals.length,key);
  assert.deepEqual(lesson.examples,examples,key);
  const html=focusMarkup(lesson);
  assert.equal((html.match(/data-lf-card=/g)||[]).length,examples.length,key);
 }
 const lesson=topicLesson('micro-unit-2',{id:'2.1',focus:{goal:'New goal', examples:[]}});
 assert.equal(lesson.goal,'New goal');
 assert.equal(lesson.examples.length,lessonExamples['micro:2.1'].length);
 assert.equal(topicLesson('qa-science-unit-12',undefined),null);
 assert.deepEqual(topicLesson('qa-science-unit-12',{id:'12.1',focus:'Read this diagram'}),{goal:'Read this diagram'});
 assert.match(focusMarkup(topicLesson('qa-science-unit-12',{id:'12.1',focus:{concept:'Coordinates'}})),/Coordinates/);
 assert.match(focusMarkup('Read this diagram'),/Read this diagram/);
});

test('old course-switch bookmarks and new tab switches keep their intended content',async()=>{
 const {libraryCourseTarget,topicResource,assignmentInUnit}=await import('../homework/library-navigation.js');
 for(const tab of ['slides','textbook','packs','bank','practice','progress','exams']){
  assert.equal(libraryLocation([unit],{},unit.id,tab).mode,tab);
  const [id,topic,mode]=libraryCourseTarget(unit,tab);
  assert.deepEqual(libraryLocation([unit],{},id,topic,mode),{unitId:unit.id,topicId:['progress','exams'].includes(tab)?'all':'12.1',mode:tab});
 }
 assert.deepEqual(libraryCourseTarget(unit,'preview','progress'),[unit.id,'all','progress']);
 const other={kind:'slides',topicId:'12.2'},shared={kind:'slides'},exact={kind:'slides',topicId:'12.1'};
 assert.equal(topicResource([other,shared,exact],'slides','12.1'),exact);
 assert.equal(topicResource([other,shared],'slides','12.1'),shared);
 assert.equal(topicResource([other],'slides','12.1'),undefined);
 assert(assignmentInUnit({libraryUnits:['micro-unit-2',unit.id]},unit.id));
 assert(assignmentInUnit({questions:[{lessonReference:{unit:unit.id}}]},unit.id));
 assert.equal(assignmentInUnit({libraryUnit:'micro-unit-2'},unit.id),false);
});

test('historical item references survive mixed assignments and agree across both clients', async()=>{
 const client=(await import('../homework/lesson-reference.js')).questionLessonReference;
 assert.equal(client,questionLessonReference);
 const snapshot={lessonUnit:unit.id,lessonTopic:'12.1',libraryQuestionId:'q1',libraryUnit:'micro-unit-2'};
 assert.deepEqual(client(snapshot,{libraryUnit:'micro-unit-2'}),{unit:unit.id,topic:'12.1',bank:'q1'});
 assert.deepEqual(client({lessonReference:{unit:unit.id,topic:'12.1'},topic:'2.2'}),{unit:unit.id,topic:'12.1',bank:''});
 assert.deepEqual(client({libraryQuestionId:'q1'},{course:'mixed'}),{unit:'',topic:'',bank:'q1'});
 assert.equal(client({libraryUnit:'macro-unit-1',lessonTopic:'2.3'}).topic,'');
});
