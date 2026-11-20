import {mountReviewPanel} from './learning-evidence.js';
import {openDiscussion} from './study-workflow.js';
import {classKey} from './course-scope.js';
import {assignmentOpensLater} from './assignment-navigation.js';
import {viewMemory} from './view-memory.js';
import {mountReviewLinkEditor} from './review-links.js';
import {highlightText} from './search-text.js';
export async function showAssignmentRoster(ctx,id,initialFilter=null,initialClass){
 const {state,main,api,post,h,head,link,date,toast,metadata,paperSurface,bindPaperSurface,bindPreviews}=ctx;
 let a=state.assignments.find(a=>a.id===id);
 if(!a){try{a=(await api('assignments/'+encodeURIComponent(id))).assignment;}catch{}}
 if(!a)throw Error('这份作业不存在或无权查看');
 const version=state.routeVersion;let data;
 try{data=await api('assignments/'+encodeURIComponent(id)+'/roster');}catch(e){if(version!==state.routeVersion)return;main.innerHTML=`<section class="paper">${head('',a.title,'',link('assignments','返回作业'))}<p role="alert">班级名单暂未同步，不能确定未提交人数。</p><button class="secondary" id="roster-retry">重试</button></section>`;main.querySelector('#roster-retry').onclick=()=>showAssignmentRoster(ctx,id,initialFilter,initialClass);return;}
 if(version!==state.routeVersion)return;
 const memory=viewMemory(state.user.id+':roster:'+id);let filter=initialFilter||memory.get('filter','all'),term=memory.get('term',''),classId=initialClass??memory.get('classId',''),tab='submissions';
 const offline=Boolean(a.offline||a.format==='score');
 const opensLater=assignmentOpensLater(a),missingLabel=opensLater?'待开始':'未提交';
 const filters=offline?[['all','全部'],['recorded','已录分'],['unrecorded','待录分']]:[['all','全部'],['submitted','已提交'],['missing',missingLabel],['review','待处理'],['published','已出分']];
 if(!filters.some(([v])=>v===filter))filter='all';
 const classes=data.classes||a.classIds.map(id=>({id,name:state.classes.find(c=>classKey(c.id)===classKey(id))?.name||'历史班级'}));if(classId&&!classes.some(c=>c.id===classId))classId='';
 const detailMeta=[classes.map(c=>c.name).join(' · '),opensLater?'尚未开放，'+date(a.opensAt)+' 开始':'',a.dueAt?'截止 '+date(a.dueAt):''].filter(Boolean).join(' · ');
 main.innerHTML=`<section class="paper roster-paper">${head('',a.title,detailMeta,link('assignments','返回作业','roster-back')+link('edit/'+id,'编辑作业','secondary')+(['mcq','mixed'].includes(a.format)?link('mcq-analysis/'+id,'逐题分析','secondary'):'' )+(a.published&&classes.length&&a.questions?.length?'<button type="button" class="secondary" data-discussion-admin>同伴思路记录</button>':''))}<div class="assignment-detail-tabs" role="tablist" aria-label="作业详情"><button type="button" role="tab" data-detail="submissions" aria-selected="true">${offline?"学生成绩":"学生提交"}</button><button type="button" role="tab" data-detail="paper" aria-selected="false">题纸与要求</button><button type="button" role="tab" data-detail="chapters" aria-selected="false">复习章节</button></div><section id="assignment-students" role="tabpanel">${classes.length>1?`<label class="roster-class-label">查看班级 <select id="roster-class" aria-label="筛选班级"><option value="">全部班级</option>${classes.map(c=>`<option value="${h(c.id)}">${h(c.name)}</option>`).join('')}</select></label>`:''}<div class="roster-summary" aria-live="polite"></div><div class="roster-toolbar"><div class="filter-tabs" role="group" aria-label="${offline?"录分状态":"提交状态"}">${filters.map(([v,label])=>`<button type="button" data-roster-filter="${v}" aria-pressed="${v===filter}">${label}</button>`).join('')}</div><div class="roster-search"><input id="roster-search" type="search" placeholder="搜索姓名或账号" aria-label="搜索姓名或账号"></div></div><p class="sr-only" id="roster-count" role="status"></p><div id="roster-rows"></div></section><section id="assignment-paper" role="tabpanel" hidden></section><section id="assignment-chapters" role="tabpanel" hidden></section></section>`;
 const $=s=>main.querySelector(s),scrollRoot=main.closest('#teacher-content')||main;
 let closeReview;
 if(!offline&&a.published){
   const host=document.createElement('details');
   host.className='evidence-review';host.innerHTML='<summary>订正验收</summary><div></div>';
   $('#assignment-students').prepend(host);
   host.addEventListener('toggle',()=>{if(host.open&&!closeReview)closeReview=mountReviewPanel(host.querySelector('div'),ctx,a,data.rows);});
 }
 const admin=$('[data-discussion-admin]');let notesDialog;
 if(admin)admin.onclick=()=>notesDialog=openDiscussion({api,user:state.user,assignmentId:id,version:a.version,classes:[...classes].sort((x,y)=>Number(y.id===classId)-Number(x.id===classId)),trigger:admin,teacher:true});
 $('#roster-search').value=term;if($('#roster-class'))$('#roster-class').value=classId;
 const save=()=>memory.set({filter,term,classId,top:scrollRoot.scrollTop});
 const onClick=e=>{const anchor=e.target.closest('.roster-action a');if(anchor){save();memory.set({selected:anchor.getAttribute('href')});state.reviewReturn={assignmentId:id,route:'overview/'+id};state.gradeReturn=null;}};
 main.addEventListener('click',onClick);
 state.viewCleanup=()=>{closeReview?.();notesDialog?.close();save();main.removeEventListener('click',onClick);};
 state.restoreView=()=>{scrollRoot.scrollTo({top:memory.get('top',0),behavior:'instant'});const selected=[...main.querySelectorAll('.roster-action a')].find(a=>a.getAttribute('href')===memory.get('selected',''));selected?.focus({preventScroll:true});};
 const label=r=>({queued:'排队中',grading:'批阅中',needs_review:r.scoreReady?'待复核':'分数待确认',published:'已出分',returned:'已退回补充'})[r.status]||'—';
 const matches=r=>filter==='all'||filter==='review'&&r.needsReview||filter==='published'&&r.grade||r.state===filter;
 function draw(){
  const scoped=classId?data.rows.filter(r=>r.classIds.some(id=>classKey(id)===classKey(classId))):data.rows;
  const submitted=scoped.filter(r=>r.state==='submitted').length,missing=scoped.filter(r=>r.state==='missing').length;
  const published=scoped.filter(r=>r.grade).length,review=scoped.filter(r=>r.needsReview).length;
  $('.roster-summary').innerHTML=offline?`<span class="submission-state is-submitted">✓ ${scoped.filter(r=>r.state==='recorded').length} 已录分</span><span class="submission-state is-neutral">○ ${scoped.filter(r=>r.state==='unrecorded').length} 待录分</span>`:`<span class="submission-state is-submitted">✓ ${submitted} 已提交</span><span class="submission-state ${missing&&!opensLater?'is-missing':'is-neutral'}">○ ${missing} ${missingLabel}</span><span>${published} 已出分</span>${review?`<span>${review} 待处理</span>`:''}`;
  const rows=scoped.filter(r=>matches(r)&&(!term||[r.name,r.username].some(v=>String(v||'').toLocaleLowerCase().includes(term.toLocaleLowerCase()))));
  $('#roster-count').textContent=rows.length+' 名学生';
  $('#roster-rows').innerHTML=rows.length?`<div class="roster-table-head"><span>学生 / 班级</span><span>${offline?"录分":"提交"}</span><span>${offline?"成绩状态":"批阅进度"}</span><span>成绩</span><span>操作</span></div><div class="roster-rows">${rows.map(r=>`<article class="student-submission-row"><div class="roster-person"><strong>${highlightText(r.name,term)}</strong><small>${r.username?highlightText(r.username,term)+' · ':''}${r.classIds.map(c=>h(classes.find(x=>classKey(x.id)===classKey(c))?.name||'历史班级')).join(' · ')}${r.historical?' · 历史记录':''}</small></div><span class="submission-state ${(r.state==='submitted'||r.state==='recorded')?'is-submitted':r.state==='missing'&&!opensLater?'is-missing':'is-neutral'}">${offline?(r.state==='recorded'?'✓ 已录分':r.state==='unrecorded'?'○ 待录分':'—'):(r.state==='submitted'?'✓ 已提交':r.state==='missing'?'○ '+missingLabel:'—')}</span><span class="roster-progress">${offline?(r.grade?'已公布':'—'):h(label(r))}${r.submittedAt&&!offline?`<small>${date(r.submittedAt)}</small>`:''}</span><span class="roster-score">${r.grade?r.grade.total+' / '+r.grade.maxPoints+(r.pendingUpdate?'<small>原成绩 · 待更新</small>':''):'—'}</span><div class="roster-action">${r.submissionId?link('review/'+r.submissionId,offline?'查看成绩':r.needsReview&&r.scoreReady?'核对分数':'查看作答',r.needsReview&&r.scoreReady?'primary':'secondary'):'<span class="hint">'+(offline?'等待录分':opensLater?'尚未开放':'等待提交')+'</span>'}</div></article>`).join('')}</div>`:'<div class="empty-inline"><p>没有符合条件的学生。</p><button type="button" class="secondary" id="roster-clear">清除筛选</button></div>';
  $('#roster-clear')?.addEventListener('click',()=>{filter='all';term='';classId='';$('#roster-search').value='';if($('#roster-class'))$('#roster-class').value='';main.querySelectorAll('[data-roster-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rosterFilter==='all')));draw();save();$('#roster-search').focus();});
 }
 main.querySelectorAll('[data-roster-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.rosterFilter;main.querySelectorAll('[data-roster-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();save();});
 $('#roster-search').oninput=e=>{term=e.target.value.trim();draw();save();};$('#roster-class')?.addEventListener('change',e=>{classId=e.target.value;draw();save();});
 let paperReady=false,chaptersReady=false;
 main.querySelectorAll('[data-detail]').forEach(b=>b.onclick=async()=>{tab=b.dataset.detail;main.querySelectorAll('[data-detail]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));$('#assignment-students').hidden=tab!=='submissions';$('#assignment-paper').hidden=tab!=='paper';$('#assignment-chapters').hidden=tab!=='chapters';if(tab==='chapters'&&!chaptersReady){chaptersReady=true;await mountReviewLinkEditor($('#assignment-chapters'),ctx,id);}if(tab==='paper'&&!paperReady){$('#assignment-paper').textContent='正在打开题纸…';try{const paper=a.publishedPaper||a;await metadata(paper.questionFiles||[]);if(version!==state.routeVersion)return;$('#assignment-paper').innerHTML=paperSurface({...a,...paper,questions:(a.rubric||[]).map(q=>({id:q.id,prompt:q.prompt,maxPoints:q.maxPoints}))});bindPreviews($('#assignment-paper'));bindPaperSurface($('#assignment-paper'));paperReady=true;}catch(e){$('#assignment-paper').textContent=e.message;}}});
 draw();
}
