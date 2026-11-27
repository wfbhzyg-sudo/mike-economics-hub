import {teacherQuestionIssues} from '../homework/student-actions.js';
import {subjectIds,subjectInfo,unitCourse} from '../homework/subject-catalog.js';
import {audiencePicker,bindAudiencePicker} from '/homework/audience-picker.js';
import {studentReportUrl} from '../homework/student-report-link.js';
import {correctionProgress,correctionLog} from '../homework/correction-progress.js';
import {teacherEvidenceReader,showTeacherEvidence} from '../homework/learning-evidence.js';
import {subjectSwitcher,singleClassCourse,classKey} from '../homework/course-scope.js';
import {bindDisclosureMenus} from '../homework/disclosure-menu.js';
import {renderMockStatistics} from '/homework/study-workflow.js';
import {accuracyBadge} from '../homework/score-bands.js';
import {gradingFields,readGradingPoints} from '../homework/library-grading.js';
import {canonicalQuestions,questionHasTopic} from '../homework/library-packs.js';
import {mountCropEditor} from './crop-editor.js';
import {loadTeacherStartup} from './startup.js';
import {bankMatch,bankStem,draftKey,openBankPreview,readBankDraft,writeBankDraft} from './question-bank.js';
import {submissionLabel} from '../homework/ui-labels.js';
import {scoreBadge,scoreLegend} from '../homework/score-bands.js';
import {viewMemory} from '../homework/view-memory.js';
import {prepareForm,validateForm} from '../homework/form-feedback.js';
import {highlightText} from '../homework/search-text.js';
import {renderStimulus,escapeHtml as h} from './graphs.js';
import {hasItemScores} from '../homework/offline-answers.js';
import {assignmentRecords,gradeSummary,correctionCounts} from '../homework/learning-model.js';
import {mountLearningOverview} from '../homework/learning-overview.js';
import {deskPage,onDeskPage} from '../assets/notebook/desk-context.js';
const deskOrigin=deskPage(new URLSearchParams(location.search));
const deskHref=deskOrigin===null?'/':onDeskPage('/',deskOrigin);
document.querySelector('.tw-brand > a').href=deskHref;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const main=$('#workspace'),surface=$('.homework-surface'),status=$('#workspace-status');
const paths={home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8m6 9v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',work:'M9 4H5v17h14V4h-4M9 2h6v5H9zM8 13l3 3 5-6',book:'M12 5v16M12 5C8 2 5 2 2 3v16c4-1 6 0 10 2 4-2 6-3 10-2V3c-3-1-6-1-10 2',game:'M6 8h12l4 10a2 2 0 0 1-3 2l-4-3H9l-4 3a2 2 0 0 1-3-2L6 8ZM7 10v5m-2-2.5h4m7-1h.01m3 2h.01',chat:'M21 11a9 8 0 0 1-9 8H9l-6 3 2-6a8 8 0 1 1 16-5ZM8 11h.01M12 11h.01M16 11h.01',layers:'M12 2 2 7l10 5 10-5-10-5ZM2 12l10 5 10-5M2 17l10 5 10-5',settings:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',more:'M5 12h.01M12 12h.01M19 12h.01',arrow:'M19 12H5m6-6-6 6 6 6',chart:'M4 21V11h4v10m4 0V6h4v15m4 0V2h2v19',bars:'M4 20h16M7 20v-7m5 7V8m5 12v-4'};
const icon=n=>`<svg class="tw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.work}"/></svg>`;
const sections=[['library','课程教学包','book','课程'],['work/assignments','作业管理','work','作业'],['bank','题库','layers','题库'],['work/reviews','作业批阅','chart','批阅'],['analytics','成绩与学情','bars','学情'],['classes','班级与学生','people','班级'],['mock-stats','自主模考统计','chart','模考']];
const courses=[['micro','AP 微观'],['macro','AP 宏观'],['as','AS 经济学'],['al','A Level 经济学']];
const state={user:null,csrf:'',meta:null,classId:'',book:'ap-microeconomics',course:'micro',controller:null,version:0,homework:null,lastHash:'',dirty:false};
const qs=o=>new URLSearchParams(Object.entries(o).filter(([,v])=>v!==undefined&&v!==null&&v!=='')).toString();
const when=v=>v?new Date(v).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'不限时间';
const percent=accuracyBadge;
const locale=v=>typeof v==='object'?(v?.zh||v?.en||''):v||'';
const dateInput=n=>new Date(n-new Date(n).getTimezoneOffset()*60000).toISOString().slice(0,16);
const badge=(s,tone='')=>`<span class="tw-badge" data-tone="${tone}">${h(s)}</span>`;
const button=(route,text,primary=false)=>`<a class="tw-button ${primary?'tw-primary':''}" href="#${route}">${h(text)}</a>`;
const field=(label,name,value='',type='text',extra='')=>`<label class="tw-field"><span>${label}</span><input name="${name}" type="${type}" value="${h(value)}" ${extra}></label>`;
const empty=(title,copy,action='')=>`<div class="tw-empty"><h2>${title}</h2><p>${copy}</p>${action}</div>`;
const tabs=(items,active)=>`<nav class="tw-tabs" aria-label="当前功能">${items.map(([route,title])=>`<a href="#${route}" ${active===route?'aria-current="page"':''}>${title}</a>`).join('')}</nav>`;
const table=(heads,rows)=>{const actions=heads.includes('操作');return `<div class="tw-table-wrap ${actions?'tw-action-table':''}" tabindex="0" role="region" aria-label="${h(heads.join('、'))}"><table class="tw-table"><thead><tr>${heads.map(t=>`<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>{let i=0;return row.replace(/<td(?=[ >])/g,()=>`<td data-label="${h(heads[i++]||'')}"`);}).join('')}</tbody></table></div>${actions?'':'<p class="tw-table-hint">左右滑动查看完整表格</p>'}`;};
function toast(message){const el=$('#tw-toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),4000);}
async function request(url,options={}){const controller=state.controller;const r=await fetch(url,{credentials:'same-origin',cache:'no-store',signal:options.signal||AbortSignal.any([controller?.signal||new AbortController().signal,AbortSignal.timeout(25000)]),...options,headers:{'Content-Type':'application/json','X-CSRF-Token':state.csrf,...options.headers},body:options.body===undefined?undefined:JSON.stringify(options.body)});const value=await r.json();if(!r.ok){if(r.status===401){location.replace('/?next='+encodeURIComponent(location.pathname+location.hash));}const error=Error(value.error||'暂时无法完成，请重试');error.status=r.status;throw error;}return value;}
const api=(path,options)=>request('/api/teacher-portal/core/'+path,options);
const hw=(path,options)=>request('/api/homework/'+path,options);
const mutate=(path,method,body)=>api(path,{method,body});
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const dirtyForms=new Set();
function onForm(selector,action){
 const form=$(selector);if(!form)return;prepareForm(form);let busy=false,revision=0;
 const track=form.id!=='question-filters';let savedStatus;
 if(track){savedStatus=document.createElement('p');savedStatus.className='tw-save-state';savedStatus.setAttribute('role','status');form.append(savedStatus);form.addEventListener('input',()=>{revision++;dirtyForms.add(form);state.dirty=true;savedStatus.textContent='有未保存的修改';savedStatus.dataset.state='pending';});}
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!validateForm(form))return;busy=true;const captured=revision,controls=[...form.elements].map(el=>({el,disabled:el.disabled})),el=$('.tw-form-error',form);if(el)el.textContent='';
  if(savedStatus){savedStatus.textContent='正在保存…';savedStatus.dataset.state='pending';}form.setAttribute('aria-busy','true');
  try{
   // Read callback data synchronously before temporarily locking its fields.
   const pending=action(Object.fromEntries(new FormData(form)),form);controls.forEach(({el})=>el.disabled=true);
   const result=await pending;if(!form.isConnected)return;
   if(result!==false&&captured===revision){dirtyForms.delete(form);state.dirty=dirtyForms.size>0;if(savedStatus){savedStatus.textContent='已保存';savedStatus.dataset.state='saved';}}
   else if(savedStatus)savedStatus.textContent='修改尚未保存';
  }catch(error){if(!form.isConnected||error.name==='AbortError')return;if(savedStatus){savedStatus.textContent='未保存成功，内容仍保留';savedStatus.dataset.state='error';}if(el){el.textContent=error.status===409?'内容已更新或操作条件已改变。'+error.message:error.message;el.tabIndex=-1;el.focus();}else toast(error.message);}
  finally{busy=false;form.setAttribute('aria-busy','false');controls.forEach(({el,disabled})=>el.disabled=disabled);}
 });
}
function bindAction(selector,action){$$(selector).forEach(b=>b.onclick=async()=>{b.disabled=true;try{await action(b);}catch(e){toast(e.message);}finally{b.disabled=false;}});}
function randomPassword(){const alphabet='abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789',bytes=crypto.getRandomValues(new Uint8Array(18));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');}
function classChoices(name,selected=[]){return `<fieldset class="tw-class-choices"><legend>班级（可多选）</legend>${state.meta.classes.filter(c=>!c.archived||selected.includes(c.id)).map(c=>`<label class="tw-check"><input type="checkbox" name="${name}" value="${c.id}" ${selected.includes(c.id)?'checked':''}><span>${h(c.name)} <small>${c.students}/50</small></span></label>`).join('')}</fieldset>`;}
function createStudentDialog(){return `<dialog id="create-student-dialog" class="tw-dialog"><form id="create-student" class="tw-dialog-form"><h2>添加学生账号</h2><p class="tw-note">创建后把用户名和初始密码单独告知学生；学生忘记密码时，可在本页重置。</p>${classChoices('classIds')}<label class="tw-field"><span>展示名</span><input name="name" required maxlength="32" placeholder="例如：张同学"></label><label class="tw-field"><span>用户名（登录用）</span><input name="username" required minlength="3" maxlength="32" pattern="[a-z0-9][a-z0-9_.-]{2,31}" autocomplete="off" placeholder="小写字母、数字、点、横线"></label><label class="tw-field"><span>初始密码</span><input name="password" id="create-student-password" required minlength="12" maxlength="128" autocomplete="new-password"><small class="tw-note">12–128 位；可用下方按钮生成。</small></label><div class="tw-dialog-row"><button type="button" class="tw-button tw-small" id="create-student-generate">生成密码</button><button type="button" class="tw-button tw-small" id="create-student-copy">复制密码</button></div><label class="tw-check"><input type="checkbox" name="confirm" required><span>我确认创建这个学生账号</span></label><p class="tw-form-error" role="alert"></p><div class="tw-dialog-actions"><button type="button" class="tw-button" data-close-create>取消</button><button class="tw-button tw-primary" type="submit">创建账号</button></div></form></dialog>`;}
function accountDrawer(){
 return `<dialog id="account-drawer" class="tw-drawer" aria-label="管理学生账号">
  <form id="account-form" class="tw-drawer-form">
    <header class="tw-drawer-head"><div><h2>管理账号</h2><p id="account-drawer-sub" class="tw-muted"></p></div><button type="button" class="tw-button tw-icon" data-close-account aria-label="关闭">×</button></header>
    <div class="tw-account-fields">${field('显示名称','name','','text','required maxlength="32" autocomplete="off"')}${field('账号（登录名）','username','','text','required minlength="3" maxlength="32" pattern="[a-z0-9][a-z0-9_.-]{2,31}" autocomplete="off"')}</div>
    <label class="tw-field"><span>重置密码（留空不改）</span><div class="tw-password-row"><input id="account-password" name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password" placeholder="≥12 位，可生成"><button type="button" class="tw-button tw-small" id="account-generate">生成</button><button type="button" class="tw-button tw-small" id="account-copy">复制</button></div></label>
    <label class="tw-check"><input type="checkbox" name="confirm" required><span>我确认修改这名学生的登录信息，旧登录信息会立即失效</span></label>
    <div class="tw-drawer-actions"><button class="tw-button tw-primary" type="submit">保存修改</button><button type="button" class="tw-button" data-close-account>取消</button></div>
    <p class="tw-form-error" role="alert"></p>
    <hr>
    <h3>班级归属</h3><p class="tw-note">勾选学生应归属的所有班级，可同时选择宏观和微观班。取消勾选即移出该班，历史记录保留。</p>
    <div id="account-classes">${classChoices("membership")}</div>
    <div class="tw-actions"><button type="button" class="tw-button" id="account-transfer">保存班级归属</button><button type="button" class="tw-text tw-danger" id="account-detach">将学生移出本班</button></div>
  </form>
 </dialog>`;
}
function classroom(){return state.meta.classes.find(c=>c.id===state.classId);}
function classRequired(){if(classroom())return true;main.innerHTML=empty('先选择一个班级','沿用学生注册时填写的通用班级码，所有教学记录都保存在同一账号下。',button('classes','管理班级',true));return false;}
function persist(){try{sessionStorage.setItem('teacher-context:'+state.user.id,JSON.stringify({classId:state.classId,book:state.book,course:state.course}));}catch{}}
async function metadata(value){state.meta=value||await api('teacher/workspace');if(!state.meta.classes.some(c=>c.id===state.classId))state.classId=state.meta.classes.find(c=>!c.archived)?.id||state.meta.classes[0]?.id||'';if(!state.meta.books.some(b=>b.id===state.book))state.book=state.meta.books[0]?.id;persist();}
const mikeDock = '<button type="button" class="teacher-mike" data-open-teacher-mike aria-label="打开 Mike 经济学伙伴"><img src="/assets/mike-pixel.png" width="24" height="24" alt=""><span>Mike</span></button>';
function navigation(section){
 const current=location.hash.slice(1);
 const inReview=/^work\/reviews?(?:\/|$)/.test(current)||(/^work\/overview\//.test(current)&&current.endsWith('/published'));
 const active=id=>id==='library'?section==='library'
  :id==='analytics'?section==='analytics'||/^work\/gradebook/.test(current)
  :id==='work/reviews'?inReview
  :id==='classes'?section==='classes'||section==='student'
  :id==='bank'?section==='bank'
  :id==='mock-stats'?section==='mock-stats'
  :id==='work/assignments'&&section==='work'&&!inReview&&!current.startsWith('work/gradebook');
 const links=sections.map(([id,title,name])=>`<a href="#${id}" ${active(id)?'aria-current="page"':''}>${icon(name)}${title}</a>`).join('');
 const secondary=`<div class="tw-nav-secondary"><a href="#games" ${section==='games'?'aria-current="page"':''}>${icon('chart')}拓展学习记录</a>${state.meta.capabilities.admin?`<a href="#settings" ${section==='settings'?'aria-current="page"':''}>${icon('settings')}设置</a>`:''}</div>`;
 const mobileSections=sections.filter(([id])=>!['classes','work/reviews','mock-stats'].includes(id));
 const mobileLinks=mobileSections.map(([id,title,name,short])=>`<a href="#${id}" ${active(id)?'aria-current="page"':''}>${icon(name)}${short||title}</a>`).join('');
 $('#teacher-navigation').innerHTML=links+secondary+mikeDock;
 $('#mobile-navigation').innerHTML=mobileLinks+mikeDock;
 $$('[data-open-more]').forEach(button=>button.onclick=()=>{state.moreTrigger=button;button.focus({preventScroll:true});$('#more-menu').showModal();});
 $('#more-navigation').innerHTML=`<a href="#work/reviews">${icon('chart')}作业批阅</a><a href="#classes">${icon('people')}班级与学生</a><a href="#mock-stats">${icon('chart')}自主模考统计</a><a href="#games">${icon('chart')}拓展学习记录</a>`+(state.meta.capabilities.admin?`<a href="#settings">${icon('settings')}批改设置</a>`:'')+`<a href="/?account=password">${icon('settings')}修改密码</a><button type="button" data-more-logout>${icon('arrow')}退出登录</button><a href="${deskHref}">${icon('arrow')}返回一页通</a>`;
 const currentMore=[...$('#more-navigation').querySelectorAll('a')].find(a=>{
  const id=a.hash.slice(1);return active(id)||(['games','settings'].includes(id)&&id===section);
 });
 if(currentMore)currentMore.setAttribute('aria-current','page');
 const moreButton=$('.tw-brand-more');
 if(currentMore){moreButton.setAttribute('aria-current','location');moreButton.setAttribute('aria-label','更多教师功能，当前位置：'+currentMore.textContent);}
 else{moreButton.removeAttribute('aria-current');moreButton.setAttribute('aria-label','更多教师功能');}
 $$('[data-more-logout]').forEach(b=>b.onclick=()=>{$('#more-menu')?.close();$('#teacher-logout')?.click();});

}

function controls(section){
 const subject=singleClassCourse(classroom());
 const book=subject&&state.meta.books.find(b=>b.id==='ap-'+subject+'economics');
 if(subject)state.course=subject;
 if(book&&['classes','home','games','student'].includes(section))state.book=book.id;
 $('#context-controls').hidden=['feedback','settings','library','work','bank','analytics','classes','student','mock-stats'].includes(section);const showBook=['books','question'].includes(section)||(section==='home'&&!book),showCourse=!subject&&['home','games'].includes(section);$('#context-controls').innerHTML=`<label><span>班级</span><select id="context-class" aria-label="当前班级"><option value="">${state.meta.classes.length?'选择班级':'尚无班级'}</option>${state.meta.classes.map(c=>`<option value="${c.id}" ${state.classId===c.id?'selected':''}>${h(c.name)}${c.archived?' · 已归档':''}</option>`).join('')}</select></label>${showBook?`<label><span>教材</span><select id="context-book" aria-label="当前教材">${state.meta.books.map(b=>`<option value="${b.id}" ${state.book===b.id?'selected':''}>${h(b.title)}</option>`).join('')}</select></label>`:''}${showCourse?`<label><span>游戏课程</span><select id="context-course" aria-label="游戏课程">${courses.map(([id,t])=>`<option value="${id}" ${state.course===id?'selected':''}>${t}</option>`).join('')}</select></label>`:''}`;
for(const [id,key] of [['class','classId'],['book','book'],['course','course']]){const el=$('#context-'+id);if(el)el.onchange=()=>{if(state.dirty&&!confirm('有尚未保存的修改，确定切换教学范围？')){el.value=state[key];return;}state.dirty=false;state[key]=el.value;persist();void render();};}}
function progress(title,value,total,note){return `<div class="tw-progress-row"><div><strong>${title}</strong><span>${value==null?'暂不可用':`${value}/${total}`}</span></div>${value==null?'':`<progress max="${Math.max(1,total)}" value="${value}" aria-label="${title}"></progress>`}<small>${h(note)}</small></div>`;}
async function home(){
 const version=state.version;
 if(!classRequired())return;const classId=state.classId,params={classId,course:state.course};const results=await Promise.allSettled([api('teacher/performance?'+qs({class:classId,book:state.book})),api('quest/learning/diagnostics?'+qs(params)),hw('assignments'),hw('submissions'),api('teacher/inbox')]);
 if(version!==state.version)return;const [perf,game,work,sub,inbox]=results.map(x=>x.status==='fulfilled'?x.value:null);const assignments=work?.assignments.filter(a=>a.classIds.includes('bookself-class:'+classId))||[],submissions=sub?.submissions.filter(s=>assignments.some(a=>a.id===s.assignmentId))||[];const effective=assignmentRecords(submissions,assignments);const waiting=effective.map(r=>r.latest).filter(s=>s.status==='needs_review'||s.reviewRequests?.some(q=>q.status==='open'));const feedback=inbox?.records.filter(x=>!x.resolved)||[],repair=game?.groups.find(g=>g.wrong>0);const pendingAssignments=assignments.filter(a=>waiting.some(s=>s.assignmentId===a.id));const latest=assignments.filter(a=>a.published).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];const submitted=latest?effective.filter(r=>r.assignmentId===latest.id).length:0;
 const task=(name,title,copy,route,label)=>`<article class="tw-task">${icon(name)}<div><h3>${h(title)}</h3><p>${h(copy)}</p></div>${button(route,label)}</article>`;
 let tasks=pendingAssignments.slice(0,3).map(a=>task('work',a.title,waiting.filter(s=>s.assignmentId===a.id).length+' 份待复核 · '+(a.dueAt?'截止 '+when(a.dueAt):'不限截止时间'),'work/reviews/'+a.id,'开始复核')).join('');if(feedback.length)tasks+=task('chat','教材反馈',feedback.length+' 条待处理 · 仅显示有权查看的记录','feedback','查看反馈');if(repair)tasks+=task('chart',locale(repair.name),repair.wrong+' 人首次尝试有误 · 可查看并布置补练','games','查看学情');if(!tasks)tasks=empty('当前没有待处理事项','可以发布新作业，或从班级学情开始安排下一次练习。',button('work/new','发布作业',true));
 const errors=results.map((r,i)=>r.status==='rejected'?['教材进度','游戏学情','作业列表','提交记录','反馈收件箱'][i]:null).filter(Boolean);if(errors.length)status.textContent=errors.join('、')+'暂时无法读取。可刷新重试，其他功能仍可使用。';
 main.innerHTML=`<div class="tw-grid"><section><h2>今天需要处理</h2>${tasks}</section><aside class="tw-rail"><h2>班级学习概况</h2><div class="tw-progress-list">${progress('教材练习',perf?perf.students.filter(s=>s.attempts>0).length:null,classroom().students,'所选教材 · 有练习记录的学生')}${progress('游戏学习',game?.attempted??null,game?.total||classroom().students,'所选课程 · 有学习尝试的学生')}${progress('作业提交',work&&sub?submitted:null,classroom().students,latest?'最近作业：'+latest.title:'尚无已发布作业')}</div><p class="tw-note">各项独立统计，不合成总分。统计当前班级全部记录。</p></aside></div><section class="tw-section"><div class="tw-section-head"><h2>最近布置</h2>${button('games/new','布置游戏任务')}</div>${assignments.length?table(['作业','来源','截止时间','状态','操作'],assignments.slice(0,6).map(a=>`<tr><td><strong>${h(a.title)}</strong><p>${h(a.course)}</p></td><td>电子作业</td><td>${when(a.dueAt)}</td><td>${badge(a.published?'已发布':'草稿',a.published?'good':'')}</td><td>${button('work/'+(a.published?'overview/':'answer/')+a.id,'查看')}</td></tr>`)):empty('还没有电子作业','上传学生题纸，再设置私密参考答案和评分点。')}${game?.assignments.length?table(['游戏任务','来源','开放时间','截止时间','操作'],game.assignments.slice(0,4).map(a=>`<tr><td>${h(a.title)}</td><td><img src="/assets/econ-quest-logo-816e8870.webp" alt="EconQuest"></td><td>${when(a.opens_at)}</td><td>${when(a.closes_at)}</td><td>${button('games','查看')}</td></tr>`)):''}</section>`;
}
async function classes(){
 const version=state.version;
 const memory=viewMemory(state.user.id+':classes:'+state.classId+':'+state.book);
 const current=classroom();const [data,membership]=current?await Promise.all([api('teacher/performance?'+qs({class:current.id,book:state.book})),hw('students')]):[null,null];
 if(version!==state.version)return;
 main.innerHTML=`<div class="class-workspace"><aside class="class-workspace-nav"><div class="tw-section-head"><h2>我的班级</h2><span class="tw-note">${state.meta.classes.length} 个班</span></div><div class="tw-class-list">${state.meta.classes.map(c=>`<article class="tw-class-row" data-current="${c.id===state.classId}"><div><h3><button type="button" class="class-name-link" data-class-view="${c.id}" aria-label="查看${h(c.name)}名单" aria-pressed="${c.id===state.classId}">${h(c.name)} <span aria-hidden="true">›</span></button> ${c.archived?badge('已归档'):''}</h3><p>${c.students} 位学生${singleClassCourse(c)?' · '+subjectInfo(singleClassCourse(c)).label:''}</p></div><div class="tw-actions tw-class-actions"><details class="tw-class-more"><summary class="tw-button tw-small" aria-label="${h(c.name)}的更多操作" title="班级操作">⋯</summary><div class="tw-class-menu"><button data-add-student="${c.id}">添加学生</button><button data-copy="${h(c.code)}">复制班级码</button><button data-rename="${c.id}">重命名班级</button><button data-archive="${c.id}">${c.archived?'恢复班级':'归档班级'}</button></div></details></div></article>`).join('')||'<p class="tw-muted">还没有班级。创建后把班级码交给学生注册即可。</p>'}</div><details class="tw-new-class" data-has-class="${Boolean(current)}"><summary>新建班级</summary><form class="tw-inline-form" id="create-class">${field('新班级名称','name','','text','required maxlength="80" placeholder="例如：AP 宏观 3 班"')}<button class="tw-button" type="submit">创建班级</button><p class="tw-form-error" role="alert"></p></form></details></aside><div class="class-workspace-main">${data?`<section class="class-roster">
  <div class="class-roster-head"><div><label class="class-mobile-switch"><span class="tw-note">班级</span><select id="class-mobile-switch" aria-label="切换班级">${state.meta.classes.map(c=>`<option value="${h(c.id)}" ${c.id===current.id?'selected':''}>${h(c.name)}${c.archived?' · 已归档':''}</option>`).join('')}</select><small class="class-size">${current.students} 人</small></label><h2 id="class-roster-title" tabindex="-1">${h(current.name)} <small>${current.students} 人</small></h2><p>班级码 <strong class="tw-class-code">${h(current.code)}</strong> <button class="tw-text" type="button" data-copy="${h(current.code)}">复制</button></p></div><button class="tw-button tw-primary" type="button" data-add-student="${current.id}">添加学生</button></div>
  <div class="class-roster-tools"><strong>学生名单</strong><div class="tw-filter">${field('查找学生','studentSearch','','search','id="student-search" placeholder="姓名或账号"')}</div><details class="tw-class-more class-roster-more"><summary class="tw-button tw-small" aria-label="更多名单操作">⋯</summary><div class="tw-class-menu"><button type="button" data-start-class>新建班级</button><button type="button" data-copy="${h(current.code)}">复制班级码</button><button data-rename="${current.id}">重命名班级</button><button data-archive="${current.id}">${current.archived?'恢复班级':'归档班级'}</button><button class="tw-button tw-small" id="export-class">导出学情数据（JSON）</button></div></details></div>
  <div id="roster-table" class="class-roster-scroll" tabindex="0" aria-label="学生名单"></div></section>`:'<p class="tw-note">创建班级后，可在这里管理学生名单。</p>'}</div></div>${createStudentDialog()}${accountDrawer()}`;
 state.viewCleanup=bindDisclosureMenus(main,'.tw-class-more');
 main.querySelectorAll('.tw-class-menu').forEach(menu=>menu.addEventListener('click',e=>{
  if(e.target.closest('button')){const details=menu.parentElement;details.open=false;details.querySelector('summary').focus({preventScroll:true});}
 },true));
 bindAction('[data-start-class]',()=>{const entry=main.querySelector('.tw-new-class');entry.open=true;entry.querySelector('input').focus();});
 onForm('#create-class',async b=>{await mutate('teacher/classes','POST',b);await metadata();toast('班级已创建，学生可使用班级码注册');await render();});
 bindAction('[data-add-student]',async b=>{const dlg=$('#create-student-dialog');if(!dlg)return;dlg.showModal();const form=$('#create-student');form.reset();$$('[name=classIds]',form).forEach(x=>x.checked=x.value===b.dataset.addStudent);const pass=$('#create-student-password');if(pass)pass.type='text';form.elements.name.focus();});
 $('#create-student-dialog').addEventListener('close',()=>{dirtyForms.delete($('#create-student'));state.dirty=dirtyForms.size>0;});
 bindAction('[data-close-create]',()=>$('#create-student-dialog')?.close());
 $('#create-student-generate')?.addEventListener('click',()=>{const input=$('#create-student-password');input.value=randomPassword();input.type='text';toast('已生成初始密码，请复制并单独告知学生');});
 $('#create-student-copy')?.addEventListener('click',async()=>{const input=$('#create-student-password');if(!input.value){toast('先输入或生成密码');input.focus();return;}try{await navigator.clipboard.writeText(input.value);toast('密码已复制');}catch{input.select();document.execCommand('copy');toast('密码已复制');}});
 onForm('#create-student',async (b,form)=>{const classIds=[...new FormData(form).getAll('classIds')];if(!classIds.length)throw Error('请至少选择一个班级');const result=await mutate('teacher/students/account','POST',{classIds,name:b.name,username:b.username.trim().toLowerCase(),password:b.password,confirm:true});$('#create-student-dialog')?.close();await metadata();toast('已创建 '+result.student.username+'，请把初始密码单独告知学生');await render();});
 bindAction('[data-copy]',async b=>{try{await navigator.clipboard.writeText(b.dataset.copy);toast('班级码已复制');}catch{toast('请长按班级码复制');}});
 async function switchClass(classId){
  state.classId=classId;persist();await render();
  const switcher=$('#class-mobile-switch');
  (switcher?.getClientRects().length?switcher:$('#class-roster-title'))?.focus({preventScroll:true});
 }
 bindAction('[data-class-view]',b=>switchClass(b.dataset.classView));
 $('#class-mobile-switch')?.addEventListener('change',e=>{void switchClass(e.target.value);});
 bindAction('[data-rename]',async b=>{const c=state.meta.classes.find(c=>c.id===b.dataset.rename),name=prompt('修改班级名称',c.name);if(!name?.trim())return;await mutate('teacher/classes','PATCH',{id:c.id,name});await metadata();toast('班级名称已更新');await render();});
 bindAction('[data-archive]',async b=>{const c=state.meta.classes.find(c=>c.id===b.dataset.archive);if(!confirm(c.archived?'恢复这个班级？':'归档“'+c.name+'”？学生账号和所有学习、作业记录都会保留。'))return;await mutate('teacher/workspace/class','PATCH',{classId:c.id,archived:!c.archived});await metadata();toast(c.archived?'班级已恢复':'班级已归档，可随时恢复');await render();});
 if(data){
  const rosterHost=$('#roster-table'),search=$('#student-search');
  const memberships=new Map(membership.students.map(s=>[s.id,s.classIds||[]]));
  const classNames=new Map(state.meta.classes.map(c=>[classKey(c.id),c.name]));
  search.value=memory.get('query','');
  function draw(){
   const term=search.value.trim().toLowerCase();
   const roster=data.students.filter(s=>[s.name,s.username].join(' ').toLowerCase().includes(term));
   memory.set({query:term});
   rosterHost.innerHTML=roster.length?table(['学生 / 账号','班级','操作'],roster.map(s=>{
    const enrolled=(memberships.get('bookself:'+s.id)||[]).map(id=>classNames.get(classKey(id))).filter(Boolean);
    return `<tr><td><a class="class-profile-link" href="#student/${encodeURIComponent(s.id)}">${highlightText(s.name,term)}</a><p>${highlightText(s.username,term)}</p></td><td data-label="班级">${h(enrolled.join('、')||current.name)}</td><td><button type="button" class="tw-button tw-small" data-manage="${h(s.id)}" aria-label="管理账号 ${h(s.name)}">管理账号</button></td></tr>`;
   })):(term?empty('未找到匹配的学生','','<button type="button" class="tw-button" data-clear-roster>清除搜索</button>'):empty('班级还没有学生','添加学生，或复制班级码邀请学生。'));
  }
  search.oninput=draw;draw();
  rosterHost.scrollTop=memory.get('rosterTop',0);
  rosterHost.addEventListener('scroll',()=>memory.set({rosterTop:rosterHost.scrollTop}),{passive:true});
  rosterHost.addEventListener('click',e=>{
   if(e.target.closest('[data-clear-roster]')){search.value='';draw();search.focus();return;}
   const manage=e.target.closest('[data-manage]');
   if(manage){openAccount(manage.dataset.manage);return;}
   const link=e.target.closest('a');
   if(link)memory.set({selected:link.getAttribute('href'),top:window.scrollY});
  });
  state.restoreView=()=>{
   window.scrollTo({top:memory.get('top',0),behavior:'instant'});
   rosterHost.scrollTop=memory.get('rosterTop',0);
   $$('#roster-table a').find(x=>x.getAttribute('href')===memory.get('selected',''))?.focus({preventScroll:true});
  };
  const accountDialog=$('#account-drawer');
  function openAccount(sid){const s=data.students.find(x=>x.id===sid);if(!s)return;const form=$('#account-form');form.reset();accountDialog.dataset.studentId=s.id;accountDialog.dataset.oldName=s.name;accountDialog.dataset.oldUsername=s.username;$('#account-drawer-sub').textContent=`${s.name} · @${s.username} · ${current.name}`;form.elements.name.value=s.name;form.elements.username.value=s.username;form.elements.password.type='password';const member=membership.students.find(x=>x.id==='bookself:'+sid);const ids=(member?.classIds||[]).map(x=>x.replace(/^bookself-class:/,''));accountDialog.dataset.membership=JSON.stringify(ids);$('#account-classes').innerHTML=classChoices('membership',ids);accountDialog.showModal();form.elements.name.focus();}
  accountDialog.addEventListener('close',()=>{dirtyForms.delete($('#account-form'));state.dirty=dirtyForms.size>0;});
  bindAction('[data-close-account]',()=>accountDialog.close());
  $('#account-generate').onclick=()=>{const input=$('#account-password');input.value=randomPassword();input.type='text';toast('已生成新密码，请复制并单独告知学生');};
  $('#account-copy').onclick=async()=>{const input=$('#account-password');if(!input.value){toast('先输入或生成密码');input.focus();return;}try{await navigator.clipboard.writeText(input.value);toast('密码已复制');}catch{input.select();document.execCommand('copy');toast('密码已复制');}};
  onForm('#account-form',async b=>{const sid=accountDialog.dataset.studentId,body={classId:state.classId,studentId:sid,confirm:true};if(b.name!==accountDialog.dataset.oldName)body.name=b.name;if(b.username!==accountDialog.dataset.oldUsername)body.username=b.username;if(b.password)body.password=b.password;if(!body.name&&!body.username&&!body.password){toast('没有需要保存的修改');return false;}const invalidates=Boolean(body.username||body.password);if(!confirm('确认修改这名学生的账号信息？'+(invalidates?'旧登录信息会立即失效。':'')+(body.password?'新密码保存后不再显示，请确认已复制。':'')))return false;await mutate('teacher/students/account','PATCH',body);accountDialog.close();toast(invalidates?'账号信息已更新，旧登录信息已失效':'账号信息已更新');await metadata();state.dirty=false;await render();});
  bindAction('#account-transfer',async()=>{const sid=accountDialog.dataset.studentId,classIds=$$('[name=membership]:checked',accountDialog).map(x=>x.value),expectedClassIds=JSON.parse(accountDialog.dataset.membership);if(!classIds.length){toast('请至少选择一个班级；仅移出本班请使用下方按钮');return;}if(!confirm('确认保存勾选的班级归属？未勾选的班级将移出，历史记录保留。'))return;await mutate('teacher/students','PATCH',{classId:state.classId,studentId:sid,classIds,expectedClassIds,confirm:true});accountDialog.close();if(!classIds.includes(state.classId))state.classId=classIds[0];await metadata();state.dirty=false;dirtyForms.clear();toast('班级归属已更新，学习记录保留');await render();});
  $('#account-detach').onclick=async()=>{const sid=accountDialog.dataset.studentId,name=accountDialog.dataset.oldName;if(!confirm('将 '+name+' 移出本班？这不会删除账号和历史记录。'))return;await mutate('teacher/students','DELETE',{classId:state.classId,studentId:sid,confirm:true});accountDialog.close();await metadata();toast('已移出本班，账号和记录保留');await render();};
  $('#export-class').onclick=()=>download(data,'班级学情-'+current.name+'.json');}
}
async function student(id,part='',scope=''){
 const version=state.version,requestId=(state.studentRequest||0)+1;state.studentRequest=requestId;
 const [profile,learning]=await Promise.all([api('teacher/workspace/student?'+qs({studentId:id})),hw('learning')]);
 if(version!==state.version||requestId!==state.studentRequest)return;
 const identity=profile.student,memberships=(identity.classIds||[]).map(x=>x.replace(/^bookself-class:/,''));
 const available=state.meta.classes.filter(c=>memberships.includes(c.id)||learning.assignments.some(a=>a.classIds?.includes('bookself-class:'+c.id)&&learning.submissions.some(x=>x.assignmentId===a.id&&x.studentId==='bookself:'+id)));
 if(scope&&!available.some(c=>c.id===scope))scope='';
 const classAssignments=learning.assignments.filter(a=>a.published!==false&&!a.deletedAt&&(!scope||a.classIds?.includes('bookself-class:'+scope))&&(a.classIds?.some(x=>memberships.includes(x.replace(/^bookself-class:/,'')))||learning.submissions.some(x=>x.assignmentId===a.id&&x.studentId==='bookself:'+id)));
 const records=assignmentRecords(learning.submissions,classAssignments).filter(r=>r.studentId==='bookself:'+id&&classAssignments.some(a=>a.id===r.assignmentId)),sum=gradeSummary(records),total=classAssignments.length,graded=records.filter(r=>r.grade&&r.grade.total!=null).length,offline=records.filter(r=>r.grade&&(r.assignment.offline||r.assignment.format==='score')).length;
 const assignmentIds=new Set(classAssignments.map(a=>a.id));
 const corrections=correctionCounts(learning.mistakes.filter(m=>m.studentId==='bookself:'+id&&assignmentIds.has(m.assignmentId)));
 let s=identity,p=null;const concepts=profile.quest.concepts,className=state.meta.classes.filter(c=>memberships.includes(c.id)).map(c=>c.name).join(' · ');
 if(part==='extended'){
  const selected=available.find(c=>c.id===state.classId&&memberships.includes(c.id))||available.find(c=>memberships.includes(c.id));
  const course=singleClassCourse(selected);
  const book=state.meta.books.find(b=>b.id==='ap-'+course+'economics')?.id||state.book;
  p=await api('teacher/performance?'+qs({class:selected?.id,book,student:id}));if(version!==state.version||requestId!==state.studentRequest)return;s=p.students.find(x=>x.id===id);if(!s)throw Error('拓展学习记录暂时不可用，请返回作业与考试。');}
 const routes=[['student/'+id,'作业与考试'],['student/'+id+'/extended','拓展学习记录']],active='student/'+id+(part==='extended'?'/extended':'');
 const header=`<div class="tw-student-header"><div class="tw-section-head"><div><h2>${h(s.name)}</h2><p class="tw-muted">${h(s.username)} · ${h(className)}</p></div><div class="tw-actions"><a class="tw-button tw-primary" href="${h(studentReportUrl('bookself:'+id,{classId:scope}))}" target="_blank" rel="noopener">查看学习报告</a>${button('classes','返回班级')}</div></div></div>`;
 if(part==='extended'){
  main.innerHTML=`${header}${tabs(routes,active)}<section><h2>教材学习</h2><div class="tw-statline"><span><strong>${s.read}/${s.pages}</strong> 阅读页数</span><span><strong>${percent(s.overall.percent)}</strong> 最近答案正确率</span><span><strong>${s.attempts}</strong> 练习次数</span></div><p class="tw-note">每题取最后一次作答；重复尝试不重复计入正确率。无作答不计零分。教材与游戏记录独立于作业成绩。</p>${table(['章节','阅读','已答题','正确率','复习'],p.columns.map(c=>{const v=s.cells.find(x=>x.topicId===c.id);return `<tr><td>${h(c.title)}</td><td>${v.read}/${v.pages}</td><td>${v.total}</td><td>${percent(v.percent)}</td><td>${v.practiced?'已练习':'待练习'} · 第 ${v.reviewStage} 阶段</td></tr>`;}))}</section><section class="tw-section"><h2>最近教材作答</h2>${s.recent.length?table(['题目','作答','时间'],s.recent.map(a=>`<tr><td><a href="#question/${encodeURIComponent(a.questionId)}">${h(a.preview)}</a></td><td>${h(a.optionId)} · ${a.correct?'正确':'需回顾'}</td><td>${when(a.at)}</td></tr>`)):empty('还没有教材作答','学生开始练习后，会在这里显示逐题记录。')}</section><section class="tw-section"><h2>EconQuest 学习</h2><p class="tw-note">概念证据与游戏掌握独立记录，不与作业分数合并。</p><div class="tw-statline">${courses.map(([c,t])=>`<span><strong>${Object.keys(profile.quest.mastery[c]||{}).length}</strong> ${t} 已掌握路线</span>`).join('')}</div>${concepts.length?table(['概念','证据状态','尝试','回访通过'],concepts.map(c=>`<tr><td>${h(c.id)}</td><td>${h({repair:'需要补练',repaired:'已纠正',independent:'独立完成',revisited:'回访通过',practised:'已练习'}[c.status]||c.status)}</td><td>${c.attempts}</td><td>${c.revisitPasses}</td></tr>`)):empty('暂无游戏学习记录','完成游戏任务后会显示概念掌握与回访情况。')}</section>`;
  return;
 }
 main.innerHTML=`${header}${tabs(routes,active)}<label class="tw-profile-scope"><span>该学生的成绩范围</span><select id="student-grade-scope"><option value="">全部班级</option>${available.map(c=>`<option value="${c.id}" ${scope===c.id?'selected':''}>${h(c.name)}</option>`).join('')}</select></label><section class="student-kpis"><div><span>作业平均</span>${scoreBadge(sum.average)}<small>${graded} 次已出分</small></div><div><span>已完成</span><strong>${graded}<em> / ${total}</em></strong><small>含线下作业</small></div><div><span>线下成绩</span><strong>${offline}</strong><small>已计入均分</small></div><div data-student-corrections><span>待订正</span><strong>${corrections.open}</strong><small>已提交 ${corrections.review} · 已验收 ${corrections.verified}</small></div></section><section class="cr-panel"><div class="cr-heading"><h2>最近订正</h2></div><div data-profile-log>${correctionLog(correctionProgress(records,learning.mistakes).entries,h)}</div></section><div id="profile-evidence"></div><section class="tw-section tw-profile-records"><div class="tw-section-head"><h2>作业与考试记录</h2>${button('analytics','打开学情分析')}</div>${records.length?table(['作业 / 考试','来源','得分','状态','操作'],records.slice().sort((a,b)=>String(b.assignment.dueAt||b.assignment.createdAt||'').localeCompare(String(a.assignment.dueAt||a.assignment.createdAt||''))).map(r=>{const isOffline=r.assignment.offline||r.assignment.format==='score';return `<tr><td><strong>${h(r.assignment.title)}</strong><p>${h(r.assignment.course||'')}${r.assignment.dueAt?' · 截止 '+when(r.assignment.dueAt):''}</p></td><td>${isOffline?badge('线下','warn'):'线上'}</td><td>${r.grade?`${r.grade.total??'—'}/${r.grade.maxPoints}`:'待批阅'}</td><td>${isOffline?(r.grade?.total!=null?'已录分':'待录分'):h(submissionLabel(r.latest.status,'teacher'))}</td><td>${isOffline?(hasItemScores(r.effective)?button('work/review/'+r.effective.id+'/profile','逐题作答'):'仅总分'):button('work/review/'+r.latest.id,'查看')}</td></tr>`;})):empty('暂无作业或考试记录','学生提交或教师录入线下成绩后，会显示在这里。')}</section>`;
 showTeacherEvidence($('#profile-evidence'),{read:teacherEvidenceReader(hw),student:'bookself:'+id,scope,h});
 const counter=$('[data-student-corrections]');
 let reading=false, lastActivityMarkup;
 const refreshCorrections=async()=>{
   if(reading||document.hidden||!counter.isConnected)return;
   reading=true;
   try{
     const {corrections:c,activity}=await hw('learning/student-performance?'+qs({student:'bookself:'+id,class:scope,view:'corrections'}));
     if(!counter.isConnected||requestId!==state.studentRequest||version!==state.version)return;
     const log=$('[data-profile-log]');
     if(log&&activity){
       const markup=correctionLog(activity,h);
       if(lastActivityMarkup!==markup){
         const expanded=log.querySelector('details')?.open;
         log.innerHTML=markup;lastActivityMarkup=markup;
         if(expanded&&log.querySelector('details'))log.querySelector('details').open=true;
       }
     }
     counter.querySelector('strong').textContent=String(c.open);
     counter.querySelector('small').textContent='已提交 '+c.review+' · 已验收 '+c.verified;
   }catch{}finally{reading=false;}
 };
 const timer=setInterval(refreshCorrections,30000);
 document.addEventListener('visibilitychange',refreshCorrections);
 window.addEventListener('focus',refreshCorrections);
 state.viewCleanup=()=>{clearInterval(timer);document.removeEventListener('visibilitychange',refreshCorrections);window.removeEventListener('focus',refreshCorrections);};
 $('#student-grade-scope').onchange=e=>{state.viewCleanup?.();void student(id,part,e.target.value).catch(error=>toast(error.message));};
}

const bankState={course:'all',unit:'',topic:'',type:'',status:'all',q:'',page:1,selected:new Map(),catalog:null,activeUnitIds:new Set()};
let bankOwner='',undoSelection=null;
function persistBank() {
 try { writeBankDraft(localStorage,bankOwner,bankState); }
 catch { toast('浏览器无法保存选题，离开前请完成组卷。'); }
}
const bankTypeLabel={choice:'选择题',short:'简答题'};
const bankCourses=[['all','全部学科'],...subjectIds.map(id=>[id,subjectInfo(id).label])];
function bankUnits(){
 return (bankState.catalog?.units||[]).filter(u=>!u.archived&&(bankState.course==='all'||unitCourse(u)===bankState.course));
}
function bankFiltered(all){
 const {course,unit,topic,type,status}=bankState;
 const term=bankState.q.trim().toLowerCase();
 const separator=topic.indexOf('|');
 const topicUnit=separator<0?'':topic.slice(0,separator),topicId=separator<0?'':topic.slice(separator+1);
 return all.filter(q=>bankState.activeUnitIds.has(q.unitId)&&(course==='all'||q.course===course)&&(!unit||q.unitId===unit)&&
  (!topic||(topic==='unmapped'?!(q.topic||q.relatedTopics?.length):(q.unitId===topicUnit&&questionHasTopic(q,topicId))))&&
  (!type||q.type===type)&&(status==='all'||(status==='ready')===(q.status==='ready'))&&
  (!term||bankMatch(q,term)));
}
function bankUnitLabel(t){return String(t||'').match(/Unit\s*\d+/i)?.[0]||t||'';}
function bankQuestionRow(q){
 const selected=bankState.selected.has(q.id),img=q.questionImages?.[0];
 const stem=bankStem(q)||('题目 '+(q.number||'')),term=bankState.q.trim(),match=bankMatch(q,term);
 const title=match?.field==='题面'?match.snippet:stem.slice(0,108)+(stem.length>108?'…':'');
 const extra=match&&match.field!=='题面'?match.field+' · '+highlightText(match.snippet,term):'';
 return `<article class="bank-row ${selected?'is-selected':''}" data-bank-q="${h(q.id)}"><button type="button" class="bank-pick" data-bank-pick="${h(q.id)}" ${img?'':'disabled'} aria-pressed="${selected}" aria-label="${selected?'移出':'加入'}：${h(stem.slice(0,40))}">${selected?'✓':'+'}</button><button type="button" class="bank-row-preview" data-bank-preview="${h(q.id)}" aria-label="查看第 ${h(q.number||'')} 题原题 · ${h(title)}"><span class="bank-thumb">${img?`<img loading="lazy" src="/api/homework/files/${encodeURIComponent(img)}" alt="">`:'无图'}</span><span class="bank-copy"><strong>${highlightText(q.number||'',term)}. ${highlightText(title,term)}</strong><small>${extra||[bankUnitLabel(q.unitTitle||q.unitId),q.topicTitle,bankTypeLabel[q.type]||q.type].filter(Boolean).map(h).join(' · ')}${q.status!=='ready'?' · '+badge('待核对','warn'):''}</small></span></button><span class="bank-answer">${q.type==='choice'?'答案 '+h(q.answer||'—'):'FRQ'}</span>${q.canEdit!==false?`<button type="button" class="bank-crop-btn" data-bank-crop="${h(q.id)}" title="手动框选图表">补图</button>`:''}</article>`;
}
function bankSelectedMarkup(){
 const items=[...bankState.selected.values()],unset=items.filter(q=>q.type==='short'&&!(q.maxPoints>0)).length,points=items.reduce((sum,q)=>sum+(Number(q.maxPoints)||(q.type==='choice'?1:0)),0);
 return {html:`<div class="bank-cart-head"><div><strong>已选 ${items.length} 道</strong><p>${unset?'已知 '+points+' 分 · '+unset+' 题待设满分':'共 '+points+' 分'}</p></div>${items.length?`<button type="button" class="tw-text" data-bank-clear>清空</button>`:undoSelection?'<button type="button" class="tw-text" data-bank-undo>撤销清空</button>':''}</div>${items.length?`<ol class="bank-cart-list">${items.map(q=>`<li><span>${h(q.number||'')}</span><p>${h(String(q.searchText||q.prompt||'').replace(/\s+/g,' ').slice(0,54))}</p><button type="button" data-bank-remove="${h(q.id)}" aria-label="移出第 ${h(q.number||'')} 题">×</button></li>`).join('')}</ol>`:'<div class="bank-cart-empty"><strong>还没有选题</strong><p>从左侧题库加入任意题目，可跨单元组合。</p></div>'}` ,count:items.length,points,unset};
}
function drawBankCart(){
 const root=$('#bank-cart');if(!root)return;
 const cart=bankSelectedMarkup();
 for(const host of [root,$('#bank-cart-dialog [data-bank-cart-body]')].filter(Boolean)){
  const scroll=host.querySelector('.bank-cart-list')?.scrollTop||0;
  host.innerHTML=cart.html;
  const list=host.querySelector('.bank-cart-list');if(list)list.scrollTop=scroll;
 }
 const bar=$('#bank-mobile-cart');if(bar){bar.hidden=cart.count===0&&!undoSelection;bar.querySelector('[data-bank-count]').textContent=cart.count;bar.querySelector('[data-bank-points]').textContent=cart.unset?'满分待确认':cart.points+' 分';}
 $('#bank-publish').disabled=cart.count===0;$('#bank-publish').textContent=cart.count?'组卷 · '+cart.count+' 题':'组卷';
 $('[data-bank-publish-quick]')?.toggleAttribute('disabled',cart.count===0);
}
function drawBankList(){
 const all=bankState.questions||[],list=bankFiltered(all),pageSize=40,pages=Math.max(1,Math.ceil(list.length/pageSize));bankState.page=Math.min(bankState.page,pages);
 const page=list.slice((bankState.page-1)*pageSize,bankState.page*pageSize);
 $('#bank-count').textContent=`共 ${list.length} 道可选`;
 const summary=$('#bank-current-filters');
 const current=['unit','topic','type','status'].map(key=>{const el=$('#bank-'+key);return el?.selectedIndex>0?el.selectedOptions[0]?.textContent:'';}).filter(Boolean);
 if(summary){summary.hidden=!current.length;summary.textContent=current.join(' · ');}
 const box=$('#bank-list');box.innerHTML=page.length?page.map(bankQuestionRow).join(''):empty('没有匹配的题目','调整课程、单元、题型或关键词后再试。');
 $('#bank-pager').innerHTML=`<button class="tw-button tw-small" data-bank-page="prev" ${bankState.page<=1?'disabled':''}>上一页</button><span>第 ${bankState.page} / ${pages} 页</span><button class="tw-button tw-small" data-bank-page="next" ${bankState.page>=pages?'disabled':''}>下一页</button>`;
}
function toggleBank(id,focus=true){
 if(bankState.selected.has(id))bankState.selected.delete(id);
 else{
  const q=bankState.questions.find(x=>x.id===id);
  if(!q?.questionImages?.length)return toast('请先补全原题');
  bankState.selected.set(id,q);
 }
 undoSelection=null;persistBank();
 const scroll=$('#bank-list').scrollTop;
 drawBankList();$('#bank-list').scrollTop=scroll;drawBankCart();
 if(focus)[...$$('[data-bank-pick]')].find(x=>x.dataset.bankPick===id)?.focus({preventScroll:true});
}
function openBankPublish(){
 const items=[...bankState.selected.values()];if(!items.length)return toast('先从题库选择题目');
 const classes=state.meta.classes.filter(c=>!c.archived);
 const clientId=crypto.randomUUID(),dlg=document.createElement('dialog');dlg.className='tw-dialog bank-publish-dialog';
 dlg.addEventListener('close',()=>dlg.remove(),{once:true});
 dlg.innerHTML=`<form class="tw-dialog-form"><h2>题库组卷</h2><p class="tw-note">已选 ${items.length} 道题</p>
 ${gradingFields(items,h)}<label class="tw-field"><span>作业名称</span><input name="title" required maxlength="120" value="${h(items.length>1?'题库组卷 · '+new Date().toISOString().slice(0,10):'题库练习')}"></label>
 ${audiencePicker(classes,{},h)}
 <label class="tw-field"><span>截止时间（可选）</span><input name="dueAt" type="datetime-local"></label>
 <label class="tw-check"><input type="checkbox" name="allowLate" checked><span>允许补交</span></label><p class="tw-form-error" role="alert"></p>
 <div class="tw-dialog-actions"><button type="button" class="tw-button" data-bank-cancel>取消</button><button type="submit" name="draft" class="tw-button">保存草稿</button><button class="tw-button tw-primary" type="submit">发布作业</button></div></form>`;
 document.body.append(dlg);dlg.showModal();dlg.querySelector('[data-bank-cancel]').onclick=()=>dlg.close();
 const readAudience=bindAudiencePicker(dlg.querySelector('.audience-picker'),{classes,value:{},escape:h,students:()=>hw('students')});
 dlg.querySelector('form').onsubmit=async e=>{
  e.preventDefault();const f=e.currentTarget,err=f.querySelector('.tw-form-error'),draft=e.submitter?.name==='draft';
  const audience=readAudience();err.textContent='';
  if(!draft&&(!audience.classIds.length||Object.values(audience.individualRecipients).some(ids=>!ids.length))){err.textContent='请选择班级或学生';return;}
  const buttons=[...f.querySelectorAll('button[type=submit]')];buttons.forEach(b=>b.disabled=true);
  try{
   const {assignment}=await hw('library/publish',{method:'POST',body:{clientId,draft,...audience,maxPointsByQuestion:readGradingPoints(f),title:f.elements.title.value.trim(),dueAt:f.elements.dueAt.value?new Date(f.elements.dueAt.value).toISOString():null,allowLate:f.elements.allowLate.checked,questionIds:items.map(q=>q.id)}});
   dlg.close();bankState.selected.clear();undoSelection=null;try{localStorage.removeItem(draftKey(bankOwner));}catch{}
   toast(draft?'草稿已保存':'作业已发布');
   location.hash=draft?'work/edit/'+assignment.id:'work/assignments';
  }catch(error){err.textContent=error.message;buttons.forEach(b=>b.disabled=false);}
 };
}
function drawBankFacets(){
 const units=bankUnits();
 const active=units.find(u=>u.id===bankState.unit);
 if(!active)bankState.unit='';
 const options=active?[active]:units;
 const groups=options.map(u=>`<optgroup label="${h(u.title)}">${u.topics.map(t=>`<option value="${h(u.id+'|'+t.id)}">${h(t.id+' '+(t.name||t.title||''))}</option>`).join('')}</optgroup>`).join('');
 const unit=$('#bank-unit'),topic=$('#bank-topic');
 unit.innerHTML='<option value="">全部单元</option>'+units.map(u=>`<option value="${h(u.id)}">${h(bankState.course==='all'?(bankCourses.find(([id])=>unitCourse(u)===id)?.[1]||'')+' · '+bankUnitLabel(u.title):bankUnitLabel(u.title))}</option>`).join('');
 unit.value=bankState.unit;
 topic.innerHTML='<option value="">全部 Topic</option>'+groups+'<option value="unmapped">未归类</option>';
 topic.value=bankState.topic;
 if(topic.selectedIndex<0)topic.value=bankState.topic='';
 for(const button of $$('[data-bank-course]')){
  const selected=button.dataset.bankCourse===bankState.course;
  button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));
 }
}
async function bank(){
 const version=state.version;
 const [catalog,data]=await Promise.all([hw('library/catalog'),hw('library/questions?unit=all')]);
 if(version!==state.version)return;
 bankState.catalog=catalog;
 bankState.activeUnitIds=new Set(catalog.units.filter(u=>!u.archived).map(u=>u.id));
 bankState.questions=canonicalQuestions(data.questions||[]);
 if(bankOwner!==state.user.id){
  bankOwner=state.user.id;undoSelection=null;
  let storage;try{storage=localStorage;}catch{}
  Object.assign(bankState,readBankDraft(storage,bankOwner,bankState.questions),{page:1,q:''});
 }else{
  const latest=new Map(bankState.questions.map(q=>[q.id,q]));
  bankState.selected=new Map([...bankState.selected.keys()].filter(id=>latest.has(id)).map(id=>[id,latest.get(id)]));
 }
 const hasAudit=bankState.questions.some(q=>q.canEdit!==false);
 main.innerHTML=`<div class="bank-head">${subjectSwitcher(bankCourses.map(([id])=>id),bankState.course,{className:'bank-seg',attribute:'bank-course'})}
  <div class="bank-head-actions"><button class="tw-button tw-primary" id="bank-publish" disabled>组卷</button><details class="work-tools bank-more"><summary aria-label="更多题库操作">⋯</summary><div class="work-tools-menu">${hasAudit?'<a href="#bank/crop">图表待补</a>':''}<a href="#bank/issues">学生题面反馈</a><a href="#library">课程教学包</a></div></details></div></div>
  <div id="bank-filter-anchor"><div class="bank-workspace-filters" role="group" aria-label="筛选题目">
  <select id="bank-unit" aria-label="单元"></select><select id="bank-topic" aria-label="Topic"></select>
  <select id="bank-type" aria-label="题型"><option value="">全部题型</option><option value="choice">MCQ</option><option value="short">FRQ</option></select>
  <select id="bank-status" aria-label="核对状态"><option value="all">全部状态</option><option value="ready">已复核</option><option value="needs_review">待核对</option></select>
  <button type="button" class="tw-text" data-bank-reset>清除筛选</button></div></div>
  <dialog id="bank-filter-dialog" class="tw-dialog bank-filter-dialog" aria-label="筛选题库"><div data-bank-filter-fields></div><button type="button" class="tw-button tw-primary" data-bank-filter-done>查看结果</button></dialog>
  <div class="bank-layout bank-workspace-layout"><section class="bank-results" aria-labelledby="bank-result-title">
  <div class="bank-search"><strong id="bank-result-title">匹配题目</strong><button type="button" class="tw-button" data-bank-filters aria-haspopup="dialog">筛选</button><input type="search" id="bank-search" aria-label="搜索题库" placeholder="搜索题干、知识点或题号" value="${h(bankState.q)}"><span id="bank-count" role="status"></span></div>
  <p id="bank-current-filters" hidden></p><div id="bank-list" class="bank-list" tabindex="0" aria-label="题目列表"></div><div id="bank-pager" class="bank-pager"></div></section><aside class="bank-cart" id="bank-cart" aria-label="作业选题"></aside></div>
  <div class="bank-mobile-cart" id="bank-mobile-cart" hidden><button type="button" class="tw-button" data-bank-show-cart>已选 <strong data-bank-count>0</strong> 道 ›</button><span data-bank-points>0 分</span><button type="button" class="tw-button tw-primary" data-bank-publish-quick>组卷</button></div>
  <dialog id="bank-cart-dialog" class="tw-dialog bank-cart-dialog" aria-label="作业选题"><header><strong>作业选题</strong><button type="button" class="tw-button" data-bank-close-cart>关闭</button></header><div data-bank-cart-body></div></dialog>`;
 $('#bank-type').value=bankState.type;$('#bank-status').value=bankState.status;
 drawBankFacets();drawBankList();drawBankCart();
 const filterDialog=$('#bank-filter-dialog'),filterHost=$('#bank-filter-anchor'),fields=filterHost.firstElementChild;
 const filterButton=$('[data-bank-filters]');
 let filterChanged=false;
 function revealFirstQuestion() {
  const results=$('.bank-results');
  if(matchMedia('(max-width:900px)').matches&&results?.getBoundingClientRect().top<0)results.scrollIntoView({block:'start',behavior:'instant'});
 }
 filterButton.onclick=()=>{filterChanged=false;filterDialog.querySelector('[data-bank-filter-fields]').append(fields);filterDialog.showModal();};
 filterDialog.querySelector('[data-bank-filter-done]').onclick=()=>filterDialog.close();
 filterDialog.onclose=()=>{filterHost.append(fields);filterButton.focus({preventScroll:true});if(filterChanged)revealFirstQuestion();};
 const update=({save=true}={})=>{bankState.page=1;$('#bank-list').scrollTop=0;if(save)persistBank();drawBankList();if(filterDialog.open)filterChanged=true;else revealFirstQuestion();};
 $$('[data-bank-course]').forEach(b=>b.onclick=()=>{
  bankState.course=b.dataset.bankCourse;
  if(bankState.unit&&!bankUnits().some(u=>u.id===bankState.unit))bankState.unit='';
  if(bankState.topic==='unmapped')bankState.topic='';
  drawBankFacets();update();
 });
 $('#bank-unit').onchange=e=>{bankState.unit=e.target.value;drawBankFacets();update();};
 for(const key of ['topic','type','status']){
  const select=$('#bank-'+key);select.value=bankState[key];
  select.onchange=()=>{bankState[key]=select.value;update();};
 }
 $('#bank-search').oninput=e=>{bankState.q=e.target.value;update({save:false});};
 $('[data-bank-reset]').onclick=()=>{
  Object.assign(bankState,{unit:'',topic:'',type:'',status:'all',q:''});
  $('#bank-type').value='';$('#bank-status').value='all';$('#bank-search').value='';drawBankFacets();update();
 };
 let preview;
 $('#bank-list').onclick=e=>{
  const from=e.target.closest('[data-bank-preview]');
  if(from){
   const id=from.dataset.bankPreview,question=bankState.questions.find(q=>q.id===id);
   if(question)preview=openBankPreview({question,from,query:bankState.q,isSelected:()=>bankState.selected.has(id),
    toggle:()=>toggleBank(id,false),restore:()=>[...$$('[data-bank-preview]')].find(b=>b.dataset.bankPreview===id),
    sourcePage:page=>hw('library/questions/'+encodeURIComponent(id)+'/source-page?page='+page)});
   return;
  }
  const crop=e.target.closest('[data-bank-crop]');if(crop){location.hash='bank/crop/'+encodeURIComponent(crop.dataset.bankCrop);return;}const pick=e.target.closest('[data-bank-pick]');if(pick)toggleBank(pick.dataset.bankPick);};
 $('#bank-pager').onclick=e=>{const b=e.target.closest('[data-bank-page]');if(!b)return;bankState.page+=b.dataset.bankPage==='next'?1:-1;drawBankList();$('#bank-list').scrollTop=0;$('#bank-list').focus({preventScroll:true});revealFirstQuestion();};
 const dialog=$('#bank-cart-dialog');
 const updateCart=e=>{
  const rm=e.target.closest('[data-bank-remove]');
  if(rm){bankState.selected.delete(rm.dataset.bankRemove);undoSelection=null;}
  else if(e.target.closest('[data-bank-clear]')){undoSelection=new Map(bankState.selected);bankState.selected.clear();}
  else if(e.target.closest('[data-bank-undo]')&&undoSelection){bankState.selected=undoSelection;undoSelection=null;}
  else return;
  const host=e.currentTarget;persistBank();
  drawBankList();drawBankCart();
  (host.querySelector('[data-bank-undo]')||host.querySelector('[data-bank-remove]')||host.querySelector('[data-bank-close-cart]')||$('#bank-search')).focus({preventScroll:true});
 };
 $('#bank-cart').onclick=updateCart;dialog.onclick=updateCart;
 $('[data-bank-show-cart]').onclick=()=>dialog.showModal();
 $('[data-bank-close-cart]').onclick=()=>dialog.close();
 $('#bank-publish').onclick=openBankPublish;
 $('[data-bank-publish-quick]').onclick=openBankPublish;
 const cleanup=bindDisclosureMenus(main,'.bank-more');
 state.viewCleanup=()=>{cleanup();if(preview?.open)preview.close();if(filterDialog.open)filterDialog.close();};
 $('.bank-more').addEventListener('click',e=>{if(e.target.closest('a'))$('.bank-more').open=false;});
}

const cropVisual=/(figure|graph|table|diagram|chart|shown|curve|axis|slope|shift)/i;
function cropCandidate(q){
 if(q.status!=='ready'||q.type!=='choice'||!cropVisual.test(String(q.prompt||q.searchText||'')))return false;
 if(!(q.questionImages||[]).length)return true;
 const b=q.regions?.[0]?.bbox;return Array.isArray(b)&&b.length===4&&b[3]-b[1]>0&&b[3]-b[1]<130;
}
async function bankCrop(focusId=''){
 const version=state.version,data=await hw('library/questions?unit=all');if(version!==state.version)return;
 let queue=data.questions.filter(q=>q.canEdit!==false&&cropCandidate(q));
 const focus=data.questions.find(q=>q.id===focusId&&q.canEdit!==false);if(focus)queue=[focus,...queue.filter(q=>q.id!==focusId)];
 const view=mountCropEditor({main,queue,hw,h,toast,dirty:value=>state.dirty=value});state.viewCleanup=()=>view.destroy();
}

const reviewLabels={pending:'待审核',needs_revision:'需修改',approved:'已通过'};
let questionFilter={q:'',status:'',topic:'',page:1};
async function books(){
 if(!state.meta.capabilities.reviewContent){main.innerHTML=`<h2>教材学习</h2><p class="tw-note">当前账号可查看自己班级的教材进度。题库审核由获授权的课程审核教师处理。</p>${table(['教材','操作'],state.meta.books.map(b=>`<tr><td><span class="tw-bookself">bookself</span><p>${h(b.title)}</p></td><td><button class="tw-button" data-book="${b.id}">查看班级进度</button></td></tr>`))}`;bindAction('[data-book]',async b=>{state.book=b.dataset.book;persist();location.hash='classes';});return;}
 const data=await api('teacher/workspace/questions?'+qs({book:state.book,...questionFilter}));const book=state.meta.books.find(b=>b.id===state.book);
 main.innerHTML=`<div class="tw-section-head"><h2>题库审核</h2><button class="tw-button tw-small" id="export-reviews">导出审核记录</button></div><p class="tw-note">审核对应当前题目版本。题干、图表或答案变更后，需要重新确认。</p><form class="tw-filter" id="question-filters">${field('搜索题干或题号','q',questionFilter.q,'search')}<label class="tw-field"><span>章节</span><select name="topic"><option value="">全部章节</option>${book.topics.map(t=>`<option value="${t.id}" ${questionFilter.topic===t.id?'selected':''}>${h(t.title)}</option>`).join('')}</select></label><label class="tw-field"><span>审核状态</span><select name="status"><option value="">全部状态</option>${Object.entries(reviewLabels).map(([v,t])=>`<option value="${v}" ${v===questionFilter.status?'selected':''}>${t}</option>`).join('')}</select></label><button class="tw-button" type="submit">筛选</button><p class="tw-form-error" role="alert"></p></form><p class="tw-note">${data.total} 道题 · 第 ${data.page}/${data.pages} 页</p>${data.questions.length?table(['题目','状态','操作'],data.questions.map(q=>`<tr><td><strong>${highlightText(q.stem,questionFilter.q)}</strong><p>${highlightText(q.id,questionFilter.q)}</p></td><td>${badge(reviewLabels[q.review?.status||'pending'],q.review?.status==='approved'?'good':'')}</td><td>${button('question/'+encodeURIComponent(q.id),'查看')}</td></tr>`)):empty('没有匹配的题目','可减少关键词、切换章节，或查看全部审核状态。')}<div class="tw-pager"><button class="tw-button" id="prev-page" ${data.page<=1?'disabled':''}>上一页</button><span>${data.page} / ${data.pages}</span><button class="tw-button" id="next-page" ${data.page>=data.pages?'disabled':''}>下一页</button></div>`;
 onForm('#question-filters',async b=>{questionFilter={...b,page:1};state.dirty=false;await render();});$('#prev-page').onclick=()=>{questionFilter.page=data.page-1;void render();};$('#next-page').onclick=()=>{questionFilter.page=data.page+1;void render();};bindAction('#export-reviews',async()=>download(await api('teacher/workspace/review-log'),'题库审核记录.json'));
}
function questionMarkup(q){return `<article class="tw-question"><h2>${highlightText(q.stem,questionFilter.q)}</h2><p class="tw-note">${highlightText(q.id,questionFilter.q)} · ${h(q.skill||'')}</p>${q.modelReference?.length?`<details open><summary>模型与假设</summary>${q.modelReference.map(p=>`<p><strong>${h(p.title)}</strong> ${h(p.text)}</p>`).join('')}</details>`:''}${(q.stimuli||[]).map((s,i)=>renderStimulus(s,'teacher-'+i)).join('')}<ol class="tw-question-options">${(q.options||[]).map(o=>`<li data-correct="${o.id===q.correctOptionId}"><strong>${h(o.id.toUpperCase())}.</strong> ${h(o.text)} ${o.id===q.correctOptionId?badge('正确答案','good'):''}</li>`).join('')}</ol><h3>解释</h3><p>${h(q.explanation)}</p><details><summary>错误选项反馈</summary>${Object.entries(q.distractorFeedback||{}).map(([id,t])=>`<p><strong>${h(id.toUpperCase())}.</strong> ${h(t)}</p>`).join('')}</details></article>`;}
async function question(id){const {question:q}=await api('teacher/question?'+qs({book:state.book,id}));let record=null;if(state.meta.capabilities.reviewContent){const logs=await api('teacher/workspace/review-log');record=logs.records.find(r=>r.question_id===q.id&&r.fingerprint===q.fingerprint);}
 main.innerHTML=`<div class="tw-section-head">${button(state.meta.capabilities.reviewContent?'books':'classes','返回')}${record?badge(reviewLabels[record.status]):''}</div>${questionMarkup(q)}${state.meta.capabilities.reviewContent?`<section class="tw-section"><h2>教师审核</h2><p class="tw-note">勾选全部五项后才可通过。版本记录会保留。</p><form id="question-review" class="tw-form">${field('审核人','reviewer',record?.reviewer||state.user.name,'text','required maxlength="80"')}<fieldset><legend>核对项目</legend>${[['answer','正确答案'],['reasoning','推理与解释'],['diagram','图表与标注'],['language','语言与题意'],['originality','原创性与来源']].map(([id,t])=>`<label class="tw-check"><input type="checkbox" name="${id}" ${record?.checklist?.[id]?'checked':''}>${t}</label>`).join('')}</fieldset><label class="tw-field"><span>修改意见</span><textarea name="notes" maxlength="3000">${h(record?.notes||'')}</textarea></label><label class="tw-field"><span>审核结论</span><select name="status">${Object.entries(reviewLabels).map(([v,t])=>`<option value="${v}" ${record?.status===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="tw-form-error" role="alert"></p><button class="tw-button tw-primary" type="submit">保存当前版本审核</button></form></section>`:''}`;
 onForm('#question-review',async(b,f)=>{const checklist=Object.fromEntries(['answer','reasoning','diagram','language','originality'].map(k=>[k,f.elements[k].checked]));await mutate('teacher/reviews','POST',{...b,questionId:q.id,fingerprint:q.fingerprint,checklist});toast('审核已保存到当前题目版本');state.dirty=false;await render();});}
async function feedback(){const memory=viewMemory(state.user.id+':feedback');const data=await api('teacher/inbox');main.innerHTML=`<div class="tw-section-head"><h2>反馈收件箱</h2><div class="tw-actions"><button class="tw-button tw-small" id="export-feedback">导出反馈</button><button class="tw-button tw-small" id="refresh-feedback">刷新</button></div></div><p class="tw-note">${state.meta.capabilities.admin?'平台管理员可处理历史与当前反馈。':'只显示你所教班级的学生反馈。'} ${data.emailConfigured?'邮件通知已配置。':'邮件通知暂未配置，反馈仍完整保存。'}</p><div class="tw-filter"><label class="tw-field"><span>状态</span><select id="feedback-status"><option value="open">待处理</option><option value="all">全部反馈</option><option value="closed">已处理</option></select></label></div><div id="feedback-list"></div>`;$('#feedback-status').value=memory.get('status','open');
 const draw=()=>{const filter=$('#feedback-status').value,rows=data.records.filter(r=>filter==='all'||filter==='closed'&&r.resolved||filter==='open'&&!r.resolved);memory.set({status:filter});$('#feedback-list').innerHTML=rows.length?rows.map(r=>`<article class="tw-feedback-item"><div class="tw-section-head"><h3>${h(r.payload.category||'学习反馈')}</h3>${badge(r.resolved?'已处理':'待处理',r.resolved?'good':'warn')}</div><p class="tw-prewrap">${h(r.payload.note||'未填写补充说明')}</p><p class="tw-note">${when(r.created_at)} · 邮件：${h({sent:'已发送',failed:'发送失败',pending:'待发送',disabled:'未启用'}[r.email_status]||r.email_status)}</p><details><summary>查看题目与反馈上下文</summary><p>${h(r.payload.questionId||'')}</p><p class="tw-prewrap">${h(r.payload.stem||'')}</p><p>${h(r.payload.selectedOption||'')}</p>${(r.payload.options||[]).map(o=>`<p>${h(typeof o==='string'?o:JSON.stringify(o))}</p>`).join('')}</details><div class="tw-actions"><button class="tw-button tw-small" data-feedback="${r.resolved?'reopen':'resolve'}" data-id="${r.id}">${r.resolved?'重新打开':'标记已处理'}</button>${r.email_status==='failed'?`<button class="tw-button tw-small" data-feedback="retry" data-id="${r.id}">重试邮件</button>`:''}</div></article>`).join(''):empty('这里暂时没有反馈','新的题目反馈会自动进入收件箱；也可以切换到全部反馈查看历史。');bindAction('[data-feedback]',async b=>{await mutate('teacher/feedback','PATCH',{id:b.dataset.id,action:b.dataset.feedback});toast('反馈状态已更新');await render();});};$('#feedback-status').onchange=draw;draw();$('#export-feedback').onclick=()=>download(data,'教师反馈.json');$('#refresh-feedback').onclick=()=>void render();}
const gameTabs=active=>tabs([['games','班级学情'],['games/new','布置任务'],['games/cooperation','班级合作'],...(state.meta.capabilities.reviewContent?[['games/content','路线审核']]:[])],active);
async function games(view='',id=''){
 if(!classRequired())return;
 if(view==='new')return newGame();if(view==='cooperation')return cooperation();if(view==='content')return gameContent(id);if(view==='repair')return repair(id);
 const data=await api('quest/learning/diagnostics?'+qs({classId:state.classId,course:state.course}));const activeGroups=data.groups.filter(g=>g.attempted||g.wrong||g.revisited),unattempted=data.groups.filter(g=>!g.attempted&&!g.wrong&&!g.revisited);main.innerHTML=gameTabs('games')+`<div class="tw-section-head"><h2>概念学习与补练</h2>${button('games/new','布置任务',true)}</div><p class="tw-note">${data.attempted}/${data.total} 人有学习记录。错误人数按各概念首次尝试统计，回访记录单独展示。</p>${activeGroups.length?table(['概念','尝试人数','首次有误','回访通过','操作'],activeGroups.map(g=>`<tr><td><strong>${h(locale(g.name))}</strong><p>${h(locale(g.hint))}</p></td><td>${g.attempted}</td><td>${g.wrong}</td><td>${g.revisited}</td><td>${button('games/repair/'+encodeURIComponent(g.id),'预览与补练')}</td></tr>`)):empty('还没有概念学习记录','学生完成课堂任务后，会在这里显示尝试、错误点与回访情况。')}<section class="tw-section"><h2>课堂任务</h2>${data.assignments.length?table(['名称','开放','截止','路线数'],data.assignments.map(a=>`<tr><td>${h(a.title)}</td><td>${when(a.opens_at)}</td><td>${when(a.closes_at)}</td><td>${a.route_ids.length}</td></tr>`)):empty('还没有课堂任务','先选择路线并发布课堂任务，再为需要的学生布置针对性补练。',button('games/new','布置任务'))}</section><section class="tw-section"><h2>已提交的经济学论述</h2>${data.drafts.length?data.drafts.map((d,i)=>`<article class="tw-feedback-item"><h3>${h(d.name)} · ${h(d.taskId)}</h3><p class="tw-note">已提交版本 ${d.revision} · ${when(d.submittedAt)}</p><p class="tw-prewrap">${h(d.text)}</p><form class="tw-form" id="essay-feedback-${i}"><label class="tw-field"><span>反馈：一个优点与一个下一步问题</span><textarea name="text" required maxlength="2000">${h(d.feedback?.text||'')}</textarea></label><p class="tw-form-error" role="alert"></p><button class="tw-button" type="submit">保存反馈</button></form></article>`).join(''):empty('暂无已提交的论述','只展示学生已提交的版本，不读取他们尚未提交的私密草稿。')}</section>${unattempted.length?`<details class="tw-section tw-concept-catalog"><summary>查看 ${unattempted.length} 个尚未尝试的概念与补练</summary><p class="tw-note">可预览练习内容，提前选择要分配的学生。</p>${table(['概念','操作'],unattempted.map(g=>`<tr><td><strong>${h(locale(g.name))}</strong><p>${h(locale(g.hint))}</p></td><td>${button('games/repair/'+encodeURIComponent(g.id),'预览与补练')}</td></tr>`))}</details>`:''}`;
 data.drafts.forEach((d,i)=>onForm('#essay-feedback-'+i,async b=>{await mutate('quest/learning/feedback?course='+state.course,'PUT',{...b,classId:state.classId,userId:d.userId,taskId:d.taskId,revision:d.revision});toast('反馈已保存到该提交版本');}));
}
async function newGame(){const data=await api('teacher/workspace/routes?course='+state.course);main.innerHTML=gameTabs('games/new')+`<h2>布置游戏课堂任务</h2><p class="tw-note">为 ${h(classroom().name)} 选择最多 40 条路线，任务时间最长 31 天。</p><form id="game-assignment" class="tw-form">${field('任务名称','title','','text','required maxlength="100" placeholder="例如：供给变化与市场调整"')}<div class="tw-form-grid">${field('开放时间','opensAt',dateInput(Date.now()),'datetime-local','required')}${field('截止时间','closesAt',dateInput(Date.now()+7*86400000),'datetime-local','required')}</div><label class="tw-field"><span>搜索路线</span><input type="search" id="route-search" placeholder="路线名称或单元"></label><div class="tw-route-picker" id="route-picker">${data.routes.map(r=>`<label class="tw-check" data-route-search="${h([r.title,r.en,r.unit].join(' ').toLowerCase())}"><input type="checkbox" name="routeIds" value="${r.id}"><span><strong>${h(r.title)}</strong><br><small class="tw-muted">${h(r.unit)} · ${r.steps} 步 · ${h({basic:'基础',advanced:'进阶',challenge:'挑战'}[r.difficulty]||r.difficulty)}</small></span></label>`).join('')}</div><p class="tw-note" id="route-count">已选择 0 条路线</p><p class="tw-form-error" role="alert"></p><button class="tw-button tw-primary" type="submit">发布课堂任务</button></form>`;
 $('#route-search').oninput=()=>{const q=$('#route-search').value.trim().toLowerCase();$$('[data-route-search]').forEach(r=>r.hidden=!r.dataset.routeSearch.includes(q));};$('#route-picker').onchange=()=>$('#route-count').textContent='已选择 '+$$('[name=routeIds]:checked').length+' 条路线';onForm('#game-assignment',async(b,f)=>{const routeIds=$$('[name=routeIds]:checked',f).map(x=>x.value);if(!routeIds.length||routeIds.length>40)throw Error('请选择 1–40 条路线');await mutate('quest/assignments','POST',{classId:state.classId,course:state.course,title:b.title,opensAt:new Date(b.opensAt).toISOString(),closesAt:new Date(b.closesAt).toISOString(),routeIds});state.dirty=false;toast('课堂任务已发布');location.hash='games';});}
async function repair(id){const params={classId:state.classId,course:state.course};const [d,p]=await Promise.all([api('quest/learning/diagnostics?'+qs(params)),api('quest/learning/task-preview?'+qs({...params,concept:id}))]);const g=d.groups.find(g=>g.id===id);if(!g)throw Error('该概念不属于当前课程');const open=d.assignments.filter(a=>Date.parse(a.opens_at)<=Date.now()&&Date.parse(a.closes_at)>Date.now());main.innerHTML=gameTabs('games')+`<div class="tw-section-head"><h2>${h(locale(g.name))} · 补练</h2>${button('games','返回学情')}</div><p class="tw-note">${h(locale(g.hint))}</p><section class="tw-section"><h3>将要分配的练习</h3>${p.tasks.map(t=>`<details><summary>${h(t.title)}</summary><p class="tw-prewrap">${h(locale(t.context))}</p>${t.nodes.map(n=>`<div class="tw-feedback-item"><h3>${h(n.title)}</h3>${n.opts.map(o=>`<p>${h(o[0])}. ${h(o[3]||o[1])} ${o[0]===n.correct?badge('正确答案','good'):''}</p>`).join('')}<p class="tw-note">${h(n.why)}</p></div>`).join('')}</details>`).join('')}</section><section class="tw-section">${!open.length?empty('先发布一个正在开放的课堂任务','补练会关联到该课堂任务，便于追踪反馈与完成情况。',button('games/new','布置课堂任务',true)):`<form id="repair-form" class="tw-form"><label class="tw-field"><span>关联课堂任务</span><select name="assignmentId">${open.map(a=>`<option value="${a.id}">${h(a.title)} · 截止 ${when(a.closes_at)}</option>`).join('')}</select></label>${field('补练截止时间','dueAt',dateInput(Math.min(Date.parse(open[0].closes_at),Date.now()+86400000)),'datetime-local','required')}<fieldset><legend>选择学生 · 默认勾选首次尝试有误者</legend>${d.roster.map(s=>`<label class="tw-check"><input type="checkbox" name="userIds" value="${s.id}" ${g.students.some(u=>u.id===s.id)?'checked':''}>${h(s.name)}</label>`).join('')}</fieldset><p class="tw-form-error" role="alert"></p><button class="tw-button tw-primary" type="submit">发布针对性补练</button></form>`}</section>`;
 const requestId=crypto.randomUUID();onForm('#repair-form',async(b,f)=>{await mutate('quest/learning/assign?course='+state.course,'POST',{requestId,classId:state.classId,concept:id,assignmentId:b.assignmentId,dueAt:new Date(b.dueAt).toISOString(),userIds:$$('[name=userIds]:checked',f).map(x=>x.value)});state.dirty=false;toast('补练已发送给所选学生');location.hash='games';});}
async function cooperation(){const d=await api('quest/learning/cooperation?'+qs({classId:state.classId,course:state.course}));main.innerHTML=gameTabs('games/cooperation')+`<h2>班级合作目标</h2>${d.activity?`<div class="tw-statline"><span><strong>${d.count}/${d.activity.target}</strong> 已贡献</span><span>${d.expired?'已结束':d.complete?'已达成':'进行中'}</span><span>截止 ${when(d.activity.endsAt)}</span></div><p class="tw-note">${d.activity.automatic?'系统每周目标':'教师设置目标'}。只计符合规则的独立完成记录，重复题不重复贡献。</p>`:empty('尚无班级合作目标','设置一个共同目标，让每位学生的独立完成成为班级进展。')}<section class="tw-section"><h3>设置新目标</h3><form id="cooperation-form" class="tw-form">${field('目标贡献次数','target','30','number','min="1" max="200" required')}${field('结束时间','endsAt',dateInput(Date.now()+7*86400000),'datetime-local','required')}<p class="tw-note">活动最长 31 天。已有活动未结束时不会覆盖；保留原参与者与贡献记录。</p><p class="tw-form-error" role="alert"></p><button class="tw-button tw-primary" type="submit">发布合作目标</button></form></section>`;const requestId=crypto.randomUUID();onForm('#cooperation-form',async b=>{await mutate('quest/learning/cooperation?course='+state.course,'POST',{requestId,classId:state.classId,target:Number(b.target),endsAt:new Date(b.endsAt).toISOString()});state.dirty=false;toast('合作目标已发布');await render();});}
async function gameContent(routeId){if(!state.meta.capabilities.reviewContent)throw Error('当前账号未获课程审核权限');const data=await api('quest/content-review?'+qs({course:state.course,routeId}));main.innerHTML=gameTabs('games/content')+`<h2>路线内容审核</h2><div class="tw-filter"><label class="tw-field"><span>选择路线</span><select id="content-route"><option value="">请选择</option>${data.routes.map(r=>`<option value="${r.id}" ${routeId===r.id?'selected':''}>${h(r.title)} · ${r.steps} 步</option>`).join('')}</select></label></div>${data.detail?`<p class="tw-note">版本 ${h(data.detail.version)} · ${h(data.detail.kind)} · ${data.detail.steps} 步。以下为真实课程内容，仅审核教师可见。</p>${data.detail.nodes.map(n=>`<article class="tw-feedback-item"><h3>${h(n.title)}</h3><p class="tw-prewrap">${h(locale(n.context))}</p><ol class="tw-question-options">${n.options.map(o=>`<li data-correct="${o.id===n.correct}"><strong>${h(o.id)}. ${h(o.zh||o.en)}</strong> ${o.id===n.correct?badge('正确答案','good'):''}<p>${h(o.en)}</p><p class="tw-note">${h(o.feedbackZh||o.feedbackEn)}</p></li>`).join('')}</ol><p class="tw-note">可用干扰组合 ${n.legalPairs} 组 · 本次抽样 ${h(n.sample.map(o=>Array.isArray(o)?o[0]:o).join(' / '))}</p></article>`).join('')}`:empty('选择一条路线','核对逐步推理、条件、选项及错误反馈。')}`;$('#content-route').onchange=e=>{state.dirty=false;location.hash='games/content/'+encodeURIComponent(e.target.value);};}
async function settings(view){if(!state.meta.capabilities.admin){location.replace('#library');return;}main.innerHTML=tabs([['settings','批改设置'],['settings/audit','操作记录']],'settings'+(view==='audit'||view==='/audit'?'/audit':''));if(view==='audit'){const data=await api('teacher/workspace/audit');main.innerHTML=tabs([['settings','批改设置'],['settings/audit','操作记录']],'settings/audit')+`<h2>最近操作记录</h2><p class="tw-note">记录成功的教师数据操作，不记录密码、API Key、学生作答或参考答案。作业改分记录保留在原成绩版本中。</p>${data.records.length?table(['时间','操作','状态'],data.records.map(r=>`<tr><td>${when(r.created_at)}</td><td>${h(r.action)}</td><td>${r.status}</td></tr>`)):empty('尚无操作记录','教师在新工作台完成操作后会自动记录。')}`;return;}await work('device',true);}
function loadHomework(){
 if(state.homework)return Promise.resolve(state.homework);
 if(!state.homeworkLoading)state.homeworkLoading=import('../homework/app.js').then(module=>(state.homework=module)).finally(()=>{state.homeworkLoading=null;});
 return state.homeworkLoading;
}
async function work(route='assignments',admin=false){
 if(route==='gradebook'){location.replace('#analytics');return;}
 const tabsMarkup=admin?tabs([['settings','批改设置'],['settings/audit','操作记录']],'settings'):'';main.innerHTML=route.startsWith('library')||route.startsWith('new')||route.startsWith('answer')||route.startsWith('edit')?'':tabsMarkup;surface.hidden=false;
 const version=state.version,classId=state.classId,initialSession=state.initialHomeworkSession;state.initialHomeworkSession=null;
 // Session validation and the module download are independent; keep errors
 // handled even if navigation cancels this mount before the module is ready.
 const session=initialSession?Promise.resolve(initialSession):hw('me').then(value=>({value}),error=>({error}));
 const homework=await loadHomework();if(version!==state.version)return;
 await homework.mountTeacherHomework(route,{classId,session:session.then(result=>{if(result.error)throw result.error;return result.value;})});
}
async function analytics(){
 const version=state.version;
 const data=await hw('learning');if(version!==state.version)return;
 main.innerHTML='';
 let reader=teacherEvidenceReader(hw);
 const view=mountLearningOverview({state,main,h,toast,link:button,load:()=>hw('learning'),readEvidence:(...args)=>reader(...args),resetEvidence:()=>{reader=teacherEvidenceReader(hw);},ai:(path,options={})=>hw(path,{...options,signal:AbortSignal.timeout(130000)})},data);
 state.viewCleanup=()=>view.destroy();
}
const titles={'mock-stats':['自主模考统计','查看学生自主练习的参与和答题情况。'],library:['课程教学包','从备课到订正，沿同一条学习路径。'],home:['教师工作台','备课、批阅与学情，在同一处完成。'],classes:['班级与学生','同一份名单，连接每一步学习。'],student:['完整学生档案','作业与考试表现优先，拓展学习记录单独查看。'],books:['教材与题库','核对内容，追踪当前版本的审核状态。'],question:['题目详情','原始模型、图表、答案与解释。'],work:['作业与批阅','发布题纸、确认答案，回应每一份思考。'],bank:['题库','全部单元自由组合，教学包只是题库的预设。'],games:['拓展学习记录',''],feedback:['反馈中心','把学生遇到的问题，变成可跟进的改进。'],analytics:['成绩与学情','成绩总览、题目诊断与学情报告。'],settings:['批改设置','批改方式与教学操作记录。']};
function errorText(e) {
  if (e?.name === 'TimeoutError') return '连接超时，请重试。已保存的教学记录不会丢失。';
  const message = String(e?.message || '');
  if (/load failed|failed to fetch|network|fetch/i.test(message)) return '网络连接失败，请检查网络后重试。';
  return message || '请稍后重试。';
}
async function render(){
 dirtyForms.clear();state.restoreView=null;state.controller?.abort();state.viewCleanup?.();state.viewCleanup=null;state.controller=new AbortController();const version=++state.version;state.homework?.unmountTeacherHomework();surface.hidden=true;status.textContent='';main.setAttribute('aria-busy','true');main.innerHTML='<p class="tw-loading">正在读取教学记录…</p>';
 const [section='library',part='',third='']=location.hash.slice(1).split('/').map(x=>{try{return decodeURIComponent(x);}catch{return x;}}),key=titles[section]?section:'library';main.classList.toggle('tw-host-toolbar',['work','library'].includes(key)||key==='settings'&&part!=='audit');document.body.dataset.section=key;document.body.dataset.library=String(key==='library'||key==='work'&&part==='library');document.body.dataset.workTask=(key==='work'&&['new','edit','answer','review','mcq-import','mcq'].includes(part))?'true':'false';const [title,description]=key==='bank'&&part==='issues'?['学生题面反馈','']:titles[document.body.dataset.library==='true'?'library':key];$('.tw-page-heading').hidden=key==='settings'&&part!=='audit'||key==='bank'&&part==='crop';$('#page-title').textContent=title;$('#page-description').textContent=description;$('#publish-shortcut').hidden=true;document.title=title+' · Mike 的经济一页通';navigation(document.body.dataset.library==='true'?'library':key==='student'?'classes':key==='question'?'books':key);controls(key);
 const taskList=key==='work'&&['assignments','reviews'].includes(part)&&!third?part:'';
 const sharedTitle=taskList==='assignments'?'作业管理':taskList==='reviews'?'作业批阅':'';
 document.body.dataset.teacherList=taskList||(['analytics','classes'].includes(key)?key:'');
 const actions=$('#teacher-list-actions');
 actions.hidden=!taskList;
 actions.innerHTML=taskList==='assignments'?'<a class="tw-button tw-primary" href="#work/new">新建作业</a><details class="tw-class-more work-tools"><summary class="tw-button" aria-label="更多作业操作">⋯</summary><div class="tw-class-menu"><a href="#bank">从题库出题</a><a href="#work/trash">回收站</a></div></details>':taskList==='reviews'?'<a class="tw-button" href="#work/reviews/published">已出分作业</a>':'';
 if(sharedTitle){$('#page-title').textContent=sharedTitle;document.title=sharedTitle+' · Mike 的经济一页通';}
 state.listActionsCleanup?.();state.listActionsCleanup=taskList==='assignments'?bindDisclosureMenus(actions,'details'):null;
 try{if(key==='library')await work(location.hash.slice(1)||'library');else if(key==='bank'){if(part==='crop')await bankCrop(third);else if(part==='issues'){const host=document.createElement('section');main.replaceChildren(host);await teacherQuestionIssues(host,hw);}else await bank();}else if(key==='classes')await classes();else if(key==='student')await student(part,third);else if(key==='books')await books();else if(key==='question')await question(part);else if(key==='feedback')await feedback();else if(key==='analytics')await analytics();else if(key==='mock-stats')await renderMockStatistics({main,api:hw,state});else if(key==='games')await games(part,third);else if(key==='settings')await settings(part);else if(key==='work')await work(location.hash.slice(6)||'assignments');else await home();}
 catch(e){if(version!==state.version||e.name==='AbortError')return;surface.hidden=true;main.innerHTML=empty('暂时无法打开',h(errorText(e)),'<button class="tw-button tw-primary" id="retry-page">重新连接</button>');$('#retry-page').onclick=()=>void render();}
 finally{if(version===state.version){main.setAttribute('aria-busy','false');state.lastHash=location.hash;state.dirty=false;if(document.activeElement===document.body||document.activeElement===main||document.activeElement?.id==='teacher-content')(surface.hidden?main:$('#homework-main')).focus({preventScroll:true});state.restoreView?.();}}
}
$('#more-menu').addEventListener('close',()=>{const trigger=state.moreTrigger;if(trigger?.isConnected&&trigger.getClientRects().length)trigger.focus({preventScroll:true});});
$('#more-menu [data-close]').onclick=()=>$('#more-menu').close();$('#more-menu').addEventListener('click',e=>{if(e.target===$('#more-menu'))$('#more-menu').close();});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.classList.contains('tw-skip'))return;const next=a.getAttribute('href');if(next!==location.hash&&state.dirty&&!confirm('有尚未保存的修改，确定离开当前页面？')){e.preventDefault();return;}state.dirty=false;$('#more-menu').close();if(next===location.hash){e.preventDefault();void render();}});
document.addEventListener('input',e=>{if(e.target.closest('#question-review,#game-assignment,#repair-form,#cooperation-form,[id^=essay-feedback-],#new-assignment,#edit-assignment,#source-form,#rubric-form,#review-form,#device-form'))state.dirty=true;});
document.addEventListener('homework:saved',()=>state.dirty=false);
document.addEventListener('homework:dirty',()=>state.dirty=true);
window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('hashchange',()=>{if(state.dirty&&!confirm('有尚未保存的修改，确定离开当前页面？')){history.replaceState(null,'',state.lastHash||'#home');return;}state.dirty=false;void render();});
$('#teacher-logout').onclick=async()=>{if(state.dirty&&!confirm('有尚未保存的修改，确定退出登录？'))return;try{await request('/api/portal/logout',{method:'POST'});location.replace('/');}catch(e){toast(e.message);}};
async function start(){try{state.controller=new AbortController();
 const initialRoute=location.hash.slice(1).split('/')[0]||'library',usesHomework=['library','work','settings'].includes(initialRoute);
 if(usesHomework)void loadHomework().catch(()=>{});
 const {session,metadata:initialMetadata,homeworkSession}=await loadTeacherStartup(request,{homework:usesHomework});
 state.initialHomeworkSession=homeworkSession;if(!session.user){location.replace('/?next=/teacher/');return;}if(session.user.role!=='teacher'){location.replace('/');return;}state.user=session.user;state.csrf=session.csrf;$('#teacher-name').textContent=state.user.name;try{const stored=JSON.parse(sessionStorage.getItem('teacher-context:'+state.user.id)||'{}');for(const key of ['classId','book','course'])if(typeof stored[key]==='string')state[key]=stored[key];}catch{}await metadata(initialMetadata);await render();}catch(e){main.setAttribute('aria-busy','false');main.innerHTML=empty('暂时无法连接工作台',h(e.message),'<button class="tw-button tw-primary" id="start-again">重新连接</button>');$('#start-again').onclick=start;}}
void start();
