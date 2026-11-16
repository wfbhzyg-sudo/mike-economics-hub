import {drawTypedAnnotations} from './typed-annotations.mjs';
import {readFile} from 'node:fs/promises';
import fontkit from '@pdf-lib/fontkit';
import {PDFDocument,rgb} from 'pdf-lib';
import {hash,id,now} from './store.mjs';
import {assert,text} from './validation.mjs';
import {readBody} from './files.mjs';
import {capturePaper} from './paper.mjs';
import {captureRecipients} from './roster.mjs';
import {validateTiming} from './mcq-model.mjs';
import {questionFingerprint} from './review-links.mjs';
import {UNIT,publicUnit,cleanDrawing,validateSelection} from './library-model.mjs';
import {canonicalResourcePage} from '../homework/library-page-map.js';
import {deepseek} from './ai.mjs';
import sharp from 'sharp';
import {openPDF,renderPage} from './pdf-pages.mjs';
export function createLibrary({db,files,requireAssignment,decrypt}){
 const visibleTo = (unit, user, releases) =>
   user.role === 'teacher'
     ? unit.owner === user.id
     : releases.some(release =>
         release.unitId === unit.id &&
         (!release.owner || release.owner === unit.owner) &&
         release.classIds.some(classId => user.classIds?.includes(classId)));

 async function unitFor(user, unitId = UNIT) {
   assert(/^(micro|macro)-unit-[1-6]$/.test(unitId), '教学包编号无效', 400);
   const unit = await db.get(unitId);
   assert(unit?.type === 'library-unit', '教学资料正在准备', 404);
   const releases = user.role === 'teacher' ? [] : await db.list('library-release');
   assert(visibleTo(unit, user, releases), user.role === 'teacher'
     ? '这份教学包尚未共享给你'
     : '老师尚未向本班开放此教学包', 403);
   return unit;
 }

 async function canReadFile(file, user) {
   if (file.purpose !== 'library') return false;
   if(user.role==='teacher'&&(await db.list('library-source')).some(s=>s.owner===user.id&&(s.fileId===file.id||s.answerFileId===file.id||s.originalFileId===file.id)))return true;
   const units = await db.list('library-unit');
   const releases = user.role === 'teacher' ? [] : await db.list('library-release');
   return units.some(unit => visibleTo(unit, user, releases) &&
     unit.resources.some(resource => (resource.fileId === file.id || resource.sourceFileId === file.id) &&
       (user.role === 'teacher' || resource.audience !== 'teacher')));
 }
 async function handle({req,res,route,method,user,json,availableClasses,availableStudents}){
 if(route[0]!=='library')return false;
 const bdy=async()=>{try{return JSON.parse((await readBody(req,3*1024*1024)).toString())}catch(e){if(e.status)throw e;assert(false,'无法读取保存内容')}};
 const teacher=()=>assert(user.role==='teacher','此操作仅对教师开放',403);
 const query = new URL(req.url, 'http://local').searchParams;
 const requestedUnit = query.get('unit') || UNIT;
 if (route[1] === 'catalog' && method === 'GET') {
   const releases = user.role === 'teacher' ? [] : await db.list('library-release');
   const units = (await db.list('library-unit'))
     .filter(unit => visibleTo(unit, user, releases))
     .map(({id, title, questionCount, topics=[]}) => ({id, title, questionCount, topics:topics.map(({id,name,title})=>({id,name,title}))}))
     .sort((a, b) => a.id.localeCompare(b.id));
   json(res, {units});
   return true;
 }
 if (route[1] === 'unit' && method === 'GET') {
   const unit = await unitFor(user, requestedUnit);
   const releases = user.role === 'teacher'
     ? (await db.list('library-release')).filter(r => r.unitId === unit.id && r.owner === user.id)
     : [];
   json(res, {unit: user.role === 'teacher' ? unit : publicUnit(unit), releases});
   return true;
 }
 if (route[1] === 'sources' && method === 'GET') {
   teacher();const unit=await unitFor(user, requestedUnit);
   json(res,{sources:(await db.list('library-source')).filter(s=>s.owner===user.id&&(s.unitId===unit.id||(s.collection==='exam'&&s.course===unit.id.split('-')[0])))});return true;
 }
 if (route[1] === 'questions' && method === 'GET') {
   teacher();
   await unitFor(user, requestedUnit);
   json(res, {questions: (await db.list('library-question', undefined, requestedUnit))
     .filter(q => q.unitId === requestedUnit)});
   return true;
 }

 if (route[1] === 'questions' && route[2]) {
   const question = await db.get(route[2]);
   assert(question && question.unitId, '题目不存在', 404);
   if (method === 'PUT' || method === 'PATCH') {
     teacher(); const unit = await unitFor(user, question.unitId); const b = await bdy();
     const patch = {};
     if (b.answer !== undefined) {
       const answer = String(b.answer || '').toUpperCase();
       assert(/^[A-E]$/.test(answer), '请选择 A–E 中的一个答案', 400);
       patch.answer = answer;
       patch.optionLabels = Array.isArray(question.optionLabels) && question.optionLabels.length ? question.optionLabels : ['A','B','C','D','E'];
     }
     if (b.answerFileId !== undefined) {
       const file = await db.get(String(b.answerFileId));
       assert(file && file.owner === user.id && ['answer','question','library'].includes(file.purpose), '答案文件无效', 400);
       patch.answerFileId = file.id;
     }
     if (b.topic !== undefined) {
       const topic = String(b.topic || '');
       assert(!topic || (unit.topics || []).some(t => t.id === topic), 'Topic 不在本单元内', 400);
       patch.topic = topic;
     }
     const confirm = b.confirm === true || b.status === 'ready';
     const finalAnswer = patch.answer || question.answer;
     if (confirm) {
       assert(finalAnswer, '请先选择正确答案', 400);
       assert((question.questionImages || []).length, '题目切片缺失，请先重新切片', 400);
       patch.status = 'ready'; patch.reviewFlags = []; patch.reviewedAt = now(); patch.reviewedBy = user.id;
     } else if (patch.answer) {
       patch.reviewFlags = (question.reviewFlags || []).filter(flag => !/answer/i.test(flag));
     }
     patch.version = Number(question.version || 1) + 1;
     patch.updatedAt = now();
     const next = {...question, ...patch};
     await db.put('library-question', next);
     await db.audit(user.id, 'library_question_review', question.id);
     json(res, {question: next});
     return true;
   }
   if (method === 'POST' && route[3] === 'suggest') {
     teacher(); await unitFor(user, question.unitId);
     const body = String(question.searchText || '').trim();
     assert(body.length >= 80, '这道题缺少可识别的题面文字，请直接选择答案', 422);
     const messages = [
       {role:'system', content:'你是 AP 微观/宏观经济学教师。只根据给出的题目与选项选出唯一正确选项。输出 JSON，字段 answer 为单个大写字母 A-E，reason 为不超过 40 字的中文理由。不要解释不确定，必须给出最可能的答案。'},
       {role:'user', content:`来源：${question.source || '未标注'}，第 ${question.number || ''} 题。\n${body.slice(0, 6000)}`},
     ];
     const out = await deepseek(db, decrypt, messages, {json:true, maxTokens:400});
     const answer = String(out?.answer || '').toUpperCase();
     assert(/^[A-E]$/.test(answer), 'AI 未返回有效答案，请手动选择', 422);
     const reason = text(out?.reason || '', 200);
     const suggestion = {answer, reason, model:'deepseek-flash', at:now()};
     await db.put('library-question', {...question, answerSuggestion:suggestion});
     json(res, {answer, reason, model:'deepseek-flash'});
     return true;
   }
   if (method === 'POST' && route[3] === 'reslice') {
     teacher(); await unitFor(user, question.unitId); const b = await bdy();
     const sources = await db.list('library-source');
     const ownerKey = value => String(value || '').replace(/^bookself:/, '');
     const candidates = sources.filter(s => ownerKey(s.owner) === ownerKey(user.id) && s.title === question.source &&
       (s.unitId === question.unitId || (s.collection === 'exam' && s.course === question.unitId.split('-')[0])));
     let source = null, sourceFile = null;
     for (const candidate of candidates) {
       const file = await db.get(candidate.fileId);
       if (file && Number(file.pages || 0) >= Math.max(...(question.sourcePages || [1]))) { source = candidate; sourceFile = file; break; }
     }
     assert(sourceFile, '未找到这道题的原卷文件', 404);
     const region = (question.regions || [])[0] || {page:(question.sourcePages || [1])[0], bbox:[0,0,600,800]};
     const bbox = Array.isArray(b.bbox) && b.bbox.length === 4 ? b.bbox.map(Number) : region.bbox;
     assert(bbox.every(Number.isFinite) && bbox[2] > bbox[0] && bbox[3] > bbox[1], '切片范围无效', 400);
     const chunks = []; for await (const chunk of await files.read(sourceFile)) chunks.push(chunk);
     const pdf = await openPDF(Buffer.concat(chunks));
     const rendered = await renderPage(pdf, region.page || 1);
     const sx = rendered.width / rendered.baseWidth, sy = rendered.height / rendered.baseHeight;
     const left = Math.max(0, Math.round(bbox[0] * sx) - 6), top = Math.max(0, Math.round(bbox[1] * sy) - 6);
     const right = Math.min(rendered.width, Math.round(bbox[2] * sx) + 6), bottom = Math.min(rendered.height, Math.round(bbox[3] * sy) + 6);
     assert(right - left > 20 && bottom - top > 20, '切片范围过小', 400);
     const cropped = await sharp(rendered.bytes).extract({left, top, width:right-left, height:bottom-top}).png().toBuffer();
     const file = await files.upload(cropped, {owner:user.id, purpose:'question', name:`Question ${question.number || ''} slice.png`});
     const regions = [{...region, bbox:[bbox[0],bbox[1],bbox[2],bbox[3]]}];
     const next = {...question, questionImages:[file.id], regions, version:Number(question.version || 1) + 1, updatedAt:now()};
     await db.put('library-question', next);
     await db.audit(user.id, 'library_question_reslice', question.id);
     json(res, {question: next});
     return true;
   }
 }
 if (route[1] === 'release' && method === 'POST') {
   teacher();
   const b = await bdy();
   const unit = await unitFor(user, b.unitId);
   const classes = await availableClasses();
   assert(Array.isArray(b.classIds) && b.classIds.length &&
     b.classIds.every(x => classes.some(c => c.id === x)), '请选择自己的班级');
   const release = await db.tx(async c => {
     const key = 'library-release:' + hash(user.id + unit.id);
     const old = await db.get(key, c);
     const record = {
       id: key, unitId: unit.id, owner: user.id,
       classIds: [...new Set([...(old?.classIds || []), ...b.classIds])],
       createdAt: old?.createdAt || now(), updatedAt: now()
     };
     await db.put('library-release', record, c);
     await db.audit(user.id, 'library_release', unit.id, c);
     return record;
   });
   json(res, {release});
   return true;
 }
 if(route[1]==='publish'&&method==='POST'){
 teacher();const b=await bdy(),u=await unitFor(user,b.unitId),classes=await availableClasses();assert(Array.isArray(b.classIds)&&b.classIds.length&&b.classIds.every(x=>classes.some(c=>c.id===x)),'请选择自己的班级');assert(typeof b.clientId==='string'&&b.clientId.length>=16&&b.clientId.length<=100,'发布标识无效');const title=text(b.title,120);assert(title,'请填写作业名称');const chosen=validateSelection(b.questionIds,(await db.list('library-question',undefined,u.id)).filter(q=>q.unitId===u.id)),timing=validateTiming(b),students=await availableStudents();
 const a=await db.tx(async c=>{const key='library-publish:'+hash(user.id+b.clientId),prior=await db.get(key,c);if(prior){const saved=await db.get(prior.assignmentId,c);assert((saved?.librarySourceUnit||saved?.libraryUnit)===u.id,'此发布编号已用于另一单元',409);return saved;}
 const rubric=chosen.map((q,i)=>({id:String(i+1),type:q.type,prompt:q.type==='short'?(q.searchText||''):'',sliceOnly:true,options:q.type==='choice'?(q.optionLabels||'ABCDE'.split('')).map(label=>({label,text:''})):[],correctOptions:q.type==='choice'?[q.answer]:[],choiceMode:'single',answer:q.answer||q.criteria,maxPoints:q.maxPoints||1,criteria:q.criteria||'与已确认的答案一致得分',scoringPoints:q.scoringPoints||[],questionImages:q.questionImages,sourcePages:q.source+' · 原题 '+q.number+' · p.'+q.sourcePages.join(', '),knowledge:q.topic?('Topic '+q.topic+' · '+(u.topics.find(t=>t.id===q.topic)?.title||'')):q.collection==='exam'?q.source:u.title,libraryChapter:q.chapterKey||'',libraryQuestionId:q.id,libraryVersion:q.version||1}));
 const a={id:id(),type:'assignment',teacherId:user.id,title,course:u.id.startsWith('macro-')?'AP 宏观经济学':'AP 微观经济学',classIds:[...new Set(b.classIds)],...timing,assessmentMode:b.assessmentMode==='exam'?'exam':'practice',format:rubric.some(q=>q.type==='short')?'mixed':'mcq',instructions:'阅读原题并作答。简答题可以手写、输入或上传照片。',questionFiles:[...new Set(rubric.flatMap(q=>q.questionImages))],answerFiles:[],answerText:'',rubric,draftRubric:structuredClone(rubric),published:true,status:'ready',version:1,allowLate:b.allowLate===true,allowResubmit:b.allowResubmit===true,gradingMode:b.gradingMode==='auto'?'auto':'manual',createdAt:now(),recipients:captureRecipients(b.classIds,students),libraryUnit:chosen.some(q=>q.collection==='exam')?null:u.id,librarySourceUnit:u.id,libraryCollection:chosen.some(q=>q.collection==='exam')?'exam':'unit',libraryCourse:u.id.split('-')[0],libraryVersion:u.version};a.publishedPaper=capturePaper(a,rubric,1);
 await db.put('assignment',a,c);await db.put('answer-version',{id:a.id+':v1',assignmentId:a.id,version:1,rubric,paper:a.publishedPaper,answerFiles:[],confirmedBy:user.id,confirmedAt:now()},c);await db.put('review-links',{id:'review-links:'+hash(a.id),assignmentId:a.id,defaults:[],questions:rubric.filter(q=>q.libraryChapter).map(q=>({id:q.id,fingerprint:questionFingerprint(q),chapters:[q.libraryChapter]})),revision:1},c);await db.put('library-publication',{id:key,assignmentId:a.id,createdAt:now()},c);await db.audit(user.id,'library_publish',a.id,c);return a;});json(res,{assignment:{id:a.id,title:a.title}},201);return true;}
 if(route[1]==='notes'){
 const query=new URL(req.url,'http://local').searchParams,b=method==='GET'?Object.fromEntries(query):await bdy();let scope;
 if(b.resourceId){const u=await unitFor(user,b.unitId);let r=u.resources.find(r=>r.fileId===b.resourceId),canonical=r?canonicalResourcePage(r,b.page):null;if(!canonical){r=u.resources.find(r=>r.sourceFileId===b.resourceId);const page=Number(b.page),max=Number(r?.sourcePages||r?.pages||0);if(r&&Number.isInteger(page)&&page>=1&&page<=max)canonical={fileId:b.resourceId,page};}assert(r&&canonical&&(user.role==='teacher'||r.audience!=='teacher'),'无法查看这份资料',403);scope='resource:'+canonical.fileId+':'+canonical.page;}
 else{const a=await requireAssignment(b.assignmentId,user);assert(user.role==='student','手写作答仅用于自己的作业',403);if(b.correctionId){const submission=await db.get(b.correctionId);assert(submission?.studentId===user.id&&submission.assignmentId===a.id&&submission.publishedGrade&&submission.rubricSnapshot?.some(q=>q.id===b.questionId),'无法打开这份订正',403);scope='correction:'+submission.id+':'+b.questionId;}else{const q=a.rubric?.find(q=>q.id===b.questionId);assert(q?.type==='short','请在简答题内手写作答');scope='assignment:'+a.id+':v'+a.version+':'+q.id;}}
 const key='library-note:'+hash(user.id+':'+scope);
 if(method==='GET'){const n=await db.get(key);json(res,{note:n||{id:key,pages:[[]],text:'',revision:0}});return true;}
 assert(method==='PUT'||method==='POST','不支持的操作',405);if(route[2]==='export')assert(!b.resourceId,'请在作业中导出手写答案');const d=cleanDrawing(b);
 const n=await db.tx(async c=>{const old=await db.get(key,c);assert(Number.isInteger(d.revision)&&d.revision===(old?.revision||0),'其他设备已更新笔记，本机草稿保留，请先重新读取云端版本',409);const n={...d,annotations:d.annotations??old?.annotations??[],id:key,owner:user.id,scope,revision:d.revision+1,updatedAt:now(),createdAt:old?.createdAt||now()};if(old)await db.put('library-note-history',{...old,id:old.id+':v'+old.revision},c);await db.put('library-note',n,c);return n;},'note:'+key);
 if(route[2]==='export'){
 assert(!b.resourceId,'请在作业中导出手写答案');const pdf=await PDFDocument.create();let textFont;if(n.annotations?.length){pdf.registerFontkit(fontkit);textFont=await pdf.embedFont(await readFile(new URL('./fonts/NotoSansSC-Regular.ttf',import.meta.url)),{subset:false});}for(let i=0;i<n.pages.length;i++){const page=pdf.addPage([595,842]);page.drawText('Question '+b.questionId+' | Handwritten answer | Page '+(i+1),{x:25,y:818,size:10});for(const s of n.pages[i]){const color=rgb(...s.color.slice(1).match(/../g).map(v=>parseInt(v,16)/255));for(let k=0;k<s.points.length;k++){const p=s.points[k],prev=s.points[Math.max(0,k-1)];page.drawLine({start:{x:25+prev[0]*545,y:790-prev[1]*755},end:{x:25+p[0]*545+.001,y:790-p[1]*755},thickness:Math.max(.4,s.width*545*(.5+p[2]/2)),color,opacity:s.tool==='highlight'?.35:1});}}}if(textFont)drawTypedAnnotations(pdf,textFont,n.annotations);const file=await files.upload(Buffer.from(await pdf.save()),{owner:user.id,purpose:'submission',name:'第 '+b.questionId+' 题手写作答.pdf'});json(res,{note:n,file});return true;}
 json(res,{note:n});return true;
 }
 assert(false,'没有这个教学包操作',404);
 }
 return {handle,canReadFile};
}
