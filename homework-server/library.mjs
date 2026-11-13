import {PDFDocument,rgb} from 'pdf-lib';
import {hash,id,now} from './store.mjs';
import {assert,text} from './validation.mjs';
import {readBody} from './files.mjs';
import {capturePaper} from './paper.mjs';
import {captureRecipients} from './roster.mjs';
import {validateTiming} from './mcq-model.mjs';
import {questionFingerprint} from './review-links.mjs';
import {UNIT,publicUnit,cleanDrawing,validateSelection} from './library-model.mjs';
export function createLibrary({db,files,requireAssignment}){
 async function unitFor(user){const u=await db.get(UNIT);assert(u?.type==='library-unit','Unit 2 教学资料正在准备',404);if(user.role==='teacher'){assert(u.owner===user.id,'这份教学包尚未共享给你',403);return u;}const releases=(await db.list('library-release')).filter(r=>r.unitId===UNIT&&r.classIds.some(c=>user.classIds?.includes(c)));assert(releases.length,'老师尚未向本班开放 Unit 2 教学包',403);return u;}
 async function canReadFile(file,user){if(file.purpose!=='library')return false;try{const u=await unitFor(user);return u.resources.some(r=>r.fileId===file.id&&(user.role==='teacher'||r.audience!=='teacher'));}catch{return false;}}
 async function handle({req,res,route,method,user,json,availableClasses,availableStudents}){
 if(route[0]!=='library')return false;
 const bdy=async()=>{try{return JSON.parse((await readBody(req,3*1024*1024)).toString())}catch(e){if(e.status)throw e;assert(false,'无法读取保存内容')}};
 const teacher=()=>assert(user.role==='teacher','此操作仅对教师开放',403);
 if(route[1]==='unit'&&method==='GET'){const u=await unitFor(user);json(res,{unit:user.role==='teacher'?u:publicUnit(u),releases:user.role==='teacher'?(await db.list('library-release')).filter(r=>r.unitId===UNIT):[]});return true;}
 if(route[1]==='questions'&&method==='GET'){teacher();await unitFor(user);json(res,{questions:(await db.list('library-question')).filter(q=>q.unitId===UNIT)});return true;}
 if(route[1]==='release'&&method==='POST'){teacher();await unitFor(user);const b=await bdy(),classes=await availableClasses();assert(Array.isArray(b.classIds)&&b.classIds.length&&b.classIds.every(x=>classes.some(c=>c.id===x)),'请选择自己的班级');const r=await db.tx(async c=>{const key='library-release:'+hash(user.id+UNIT),old=await db.get(key,c);const r={id:key,unitId:UNIT,owner:user.id,classIds:[...new Set([...(old?.classIds||[]),...b.classIds])],createdAt:old?.createdAt||now(),updatedAt:now()};await db.put('library-release',r,c);await db.audit(user.id,'library_release',UNIT,c);return r;});json(res,{release:r});return true;}
 if(route[1]==='publish'&&method==='POST'){
 teacher();const u=await unitFor(user),b=await bdy(),classes=await availableClasses();assert(Array.isArray(b.classIds)&&b.classIds.length&&b.classIds.every(x=>classes.some(c=>c.id===x)),'请选择自己的班级');assert(typeof b.clientId==='string'&&b.clientId.length>=16&&b.clientId.length<=100,'发布标识无效');const title=text(b.title,120);assert(title,'请填写作业名称');const chosen=validateSelection(b.questionIds,(await db.list('library-question')).filter(q=>q.unitId===UNIT)),timing=validateTiming(b),students=await availableStudents();
 const a=await db.tx(async c=>{const key='library-publish:'+hash(user.id+b.clientId),prior=await db.get(key,c);if(prior)return await db.get(prior.assignmentId,c);
 const rubric=chosen.map((q,i)=>({id:String(i+1),type:q.type,prompt:q.type==='short'?(q.searchText||''):'',sliceOnly:true,options:q.type==='choice'?'ABCDE'.split('').map(label=>({label,text:''})):[],correctOptions:q.type==='choice'?[q.answer]:[],choiceMode:'single',answer:q.answer||q.criteria,maxPoints:q.maxPoints||1,criteria:q.criteria||'与已确认的答案一致得分',scoringPoints:q.scoringPoints||[],questionImages:q.questionImages,sourcePages:q.source+' · 原题 '+q.number+' · p.'+q.sourcePages.join(', '),knowledge:q.topic?('Topic '+q.topic+' · '+(u.topics.find(t=>t.id===q.topic)?.title||'')):'Unit 2 · Supply and Demand',libraryChapter:q.chapterKey||'',libraryQuestionId:q.id,libraryVersion:q.version||1}));
 const a={id:id(),type:'assignment',teacherId:user.id,title,course:'AP 微观经济学',classIds:[...new Set(b.classIds)],...timing,assessmentMode:b.assessmentMode==='exam'?'exam':'practice',format:rubric.some(q=>q.type==='short')?'mixed':'mcq',instructions:'阅读原题并作答。简答题可以手写、输入或上传照片。',questionFiles:[...new Set(rubric.flatMap(q=>q.questionImages))],answerFiles:[],answerText:'',rubric,draftRubric:structuredClone(rubric),published:true,status:'ready',version:1,allowLate:b.allowLate===true,allowResubmit:b.allowResubmit===true,gradingMode:b.gradingMode==='auto'?'auto':'manual',createdAt:now(),recipients:captureRecipients(b.classIds,students),libraryUnit:UNIT,libraryVersion:u.version};a.publishedPaper=capturePaper(a,rubric,1);
 await db.put('assignment',a,c);await db.put('answer-version',{id:a.id+':v1',assignmentId:a.id,version:1,rubric,paper:a.publishedPaper,answerFiles:[],confirmedBy:user.id,confirmedAt:now()},c);await db.put('review-links',{id:'review-links:'+hash(a.id),assignmentId:a.id,defaults:[],questions:rubric.filter(q=>q.libraryChapter).map(q=>({id:q.id,fingerprint:questionFingerprint(q),chapters:[q.libraryChapter]})),revision:1},c);await db.put('library-publication',{id:key,assignmentId:a.id,createdAt:now()},c);await db.audit(user.id,'library_publish',a.id,c);return a;});json(res,{assignment:{id:a.id,title:a.title}},201);return true;}
 if(route[1]==='notes'){
 const query=new URL(req.url,'http://local').searchParams,b=method==='GET'?Object.fromEntries(query):await bdy();let scope;
 if(b.resourceId){const u=await unitFor(user),r=u.resources.find(r=>r.fileId===b.resourceId);assert(r&&(user.role==='teacher'||r.audience!=='teacher'),'无法查看这份资料',403);const page=Number(b.page);assert(Number.isInteger(page)&&page>=1&&page<=r.pages,'页码无效');scope='resource:'+r.fileId+':'+page;}
 else{const a=await requireAssignment(b.assignmentId,user);assert(user.role==='student','手写作答仅用于自己的作业',403);if(b.correctionId){const submission=await db.get(b.correctionId);assert(submission?.studentId===user.id&&submission.assignmentId===a.id&&submission.publishedGrade&&submission.rubricSnapshot?.some(q=>q.id===b.questionId),'无法打开这份订正',403);scope='correction:'+submission.id+':'+b.questionId;}else{const q=a.rubric?.find(q=>q.id===b.questionId);assert(q?.type==='short','请在简答题内手写作答');scope='assignment:'+a.id+':v'+a.version+':'+q.id;}}
 const key='library-note:'+hash(user.id+':'+scope);
 if(method==='GET'){const n=await db.get(key);json(res,{note:n||{id:key,pages:[[]],text:'',revision:0}});return true;}
 assert(method==='PUT'||method==='POST','不支持的操作',405);const d=cleanDrawing(b);
 const n=await db.tx(async c=>{const old=await db.get(key,c);assert(Number.isInteger(d.revision)&&d.revision===(old?.revision||0),'其他设备已更新笔记，本机草稿保留，请先重新读取云端版本',409);const n={...d,id:key,owner:user.id,scope,revision:d.revision+1,updatedAt:now(),createdAt:old?.createdAt||now()};if(old)await db.put('library-note-history',{...old,id:old.id+':v'+old.revision},c);await db.put('library-note',n,c);return n;});
 if(route[2]==='export'){
 assert(!b.resourceId,'请在作业中导出手写答案');const pdf=await PDFDocument.create();for(let i=0;i<n.pages.length;i++){const page=pdf.addPage([595,842]);page.drawText('Question '+b.questionId+' | Handwritten answer | Page '+(i+1),{x:25,y:818,size:10});for(const s of n.pages[i]){const color=rgb(...s.color.slice(1).match(/../g).map(v=>parseInt(v,16)/255));for(let k=0;k<s.points.length;k++){const p=s.points[k],prev=s.points[Math.max(0,k-1)];page.drawLine({start:{x:25+prev[0]*545,y:790-prev[1]*755},end:{x:25+p[0]*545+.001,y:790-p[1]*755},thickness:Math.max(.4,s.width*545*(.5+p[2]/2)),color,opacity:s.tool==='highlight'?.35:1});}}}const file=await files.upload(Buffer.from(await pdf.save()),{owner:user.id,purpose:'submission',name:'第 '+b.questionId+' 题手写作答.pdf'});json(res,{note:n,file});return true;}
 json(res,{note:n});return true;
 }
 assert(false,'没有这个教学包操作',404);
 }
 return {handle,canReadFile};
}
