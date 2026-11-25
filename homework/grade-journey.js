import {mountLessonLinks} from './lesson-panel.js';
import {receiptCorrections} from "./learning-model.js";
import {receiptActions,receiptEvidence,scoreSources,performanceMarkup,teacherEvidenceReader,showTeacherEvidence} from './learning-evidence.js';
import {assignmentCourse,classKey,courseLabel,coursesFor,courseTabs,selectedCourse,rememberCourse} from './course-scope.js';
import {scoreBand,scoreBadge,scoreLegend} from './score-bands.js';
import {viewMemory} from './view-memory.js';
import {highlightText} from './search-text.js';
import {rateOf,latestPublishedCell,cellsFor,cellSummary,progressChange,timeRange,inRange,visibleAssignments} from './grade-journey-model.js';
export const gradeBadge=(n,course)=>scoreBadge(n,course).replace('平均得分率','得分率');
export const statusMarkup=(c,h)=>c.rate!==null?gradeBadge(c.rate,assignmentCourse(c.assignment)):`<span class="gj-status" data-status="${c.status}">${h(c.label)}</span>`;
export function mountGradeJourney(ctx,data,student,{teacher=false,back='',mountCorrection,mountPaper}={}){
 const {main,state,h,head,link,date,toast}=ctx,memory=viewMemory(state.user.id+':journey:'+student.id),$=s=>main.querySelector(s),small=matchMedia('(max-width:767px)');
 let destroyed=false,child=null,opening=null,searchTimer,visible=[],selected=null,mode=memory.get('view','timeline'),focused=null,sequence=0;
 const all=cellsFor(data,student).filter(c=>c.status!=='unassigned');
 const classes=teacher?(data.classes||[]).filter(c=>student.classIds?.some(id=>classKey(id)===classKey(c.id))):data.classes||[];
 const subjects=coursesFor(teacher?all.map(c=>c.assignment):data.assignments,classes);let subject=selectedCourse(state.user.id,subjects);
 const filter={query:memory.get('query',''),period:memory.get('period','all'),from:memory.get('from',''),to:memory.get('to','')};
 main.innerHTML=`<section class="paper gj-page gj-journey">${head('',teacher?student.name+'的成绩档案':'我的成绩','',back?link(back,'返回班级成绩'):link('assignments','查看作业'))}${courseTabs(subjects,subject)}<div data-performance></div><div class="gj-summary"></div><details class="gj-filters"><summary>筛选与视图<span class="gj-filter-state"></span></summary><div class="gj-tools"><label>查找作业<input type="search" id="journey-search" placeholder="作业名称或题目关键词" autocomplete="off"></label><label>时间范围<select id="journey-period"><option value="all">全部时间</option><option value="term">本学期</option><option value="month">最近30天</option><option value="custom">自定义日期</option></select></label><div class="gj-view-switch" aria-label="成绩视图"><button type="button" data-view="timeline">时间轴</button><button type="button" data-view="list">列表</button></div><button type="button" id="journey-refresh">刷新成绩</button><button type="button" class="text-button" id="journey-reset">清除筛选</button></div><div class="gj-dates" hidden><label>开始日期<input type="date" id="journey-from"></label><label>结束日期<input type="date" id="journey-to"></label></div><p class="error" id="journey-error" role="alert"></p></details><div class="gj-range-hint"></div><div class="gj-focus-layout"><div class="gj-chart-wrap"><div class="gj-chart-actions"><span id="journey-count" role="status"></span><div><button type="button" id="journey-first">查看最早</button><button type="button" id="journey-last">回到最新</button></div></div><div class="gj-timeline" tabindex="0" role="region" aria-label="横向作业时间轴"><div class="gj-fish"></div></div><div class="gj-chart-footer"><span>左右滑动查看 · 点击作业展开详情</span><div><button type="button" id="journey-left" aria-label="向左浏览作业">←</button><button type="button" id="journey-right" aria-label="向右浏览作业">→</button></div></div></div><div class="gj-list" hidden></div><section class="gj-detail" aria-label="选中作业详情" tabindex="-1"></section></div><div class="gj-inline-correction" hidden></div><div data-grade-legend></div></section>`;
 const savedView=history.state?.gradeJourney;
 const returnSelection=!teacher && savedView?.user===state.user.id ? savedView.selected : null;
 if (!teacher) {
   $('.gj-journey').dataset.studentResults='';
   $('[data-performance]').before($('.gj-detail'),$('.gj-inline-correction'));
 }
 $('#journey-search').value=filter.query;$('#journey-period').value=filter.period;$('#journey-from').value=filter.from;$('#journey-to').value=filter.to;
 const scroll=$('.gj-timeline'),filters=$('.gj-filters');const setFilters=()=>{filters.open=!small.matches||memory.get('filtersOpen',false);};setFilters();filters.addEventListener('toggle',()=>{if(small.matches)memory.set({filtersOpen:filters.open});});small.addEventListener('change',setFilters);const smooth=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
 function remember(){rememberCourse(state.user.id,subject);memory.set({...filter,view:mode,selected:selected?.assignment.id||'',left:scroll.scrollLeft,top:main.scrollTop,focused:focused||''});}
 async function leaveCorrection(){if(opening)await opening;if(child){await child.flush();child.destroy();child=null;}}
 function setMode(){$('.gj-focus-layout').dataset.journeyView=mode;for(const b of main.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===mode));$('.gj-chart-wrap').hidden=mode!=='timeline'||visible.length<2;$('.gj-list').hidden=mode!=='list'||visible.length<2;$('.gj-summary').hidden=visible.length<2;$('.gj-tools .gj-view-switch').hidden=visible.length<2;memory.set({view:mode});}
 function selection(){for(const b of main.querySelectorAll('[data-assignment]')){const active=b.dataset.assignment===selected?.assignment.id;b.setAttribute('aria-pressed',String(active));b.classList.toggle('selected',active);if(b.closest('.gj-fish'))b.tabIndex=active?0:-1;}$('#journey-count').textContent=visible.length?(visible.findIndex(c=>c===selected)+1)+' / '+visible.length+' 次作业':'0 次作业';}
 function center(instant=false){const b=[...main.querySelectorAll('.gj-fish [data-assignment]')].find(b=>b.dataset.assignment===selected?.assignment.id);if(b)scroll.scrollTo({left:b.getBoundingClientRect().left-scroll.getBoundingClientRect().left+scroll.scrollLeft+b.offsetWidth/2-scroll.clientWidth/2,behavior:instant?'instant':smooth()});}
 function boundaries(){const overflow=visible.length>1&&scroll.scrollWidth>scroll.clientWidth+2;$('.gj-chart-footer').hidden=!overflow;$('.gj-chart-actions>div').hidden=!overflow||visible.length<=3;$('#journey-left').disabled=scroll.scrollLeft<2;$('#journey-right').disabled=scroll.scrollLeft>=scroll.scrollWidth-scroll.clientWidth-2;}const resizeObserver=new ResizeObserver(boundaries);resizeObserver.observe(scroll);
 let drawnSubject=null;
 const evidenceLessons=mountLessonLinks(main,ctx.api);
 const readEvidence=teacher?teacherEvidenceReader(ctx.api):null;
 function draw(preserveEditor=false){
  if(drawnSubject!==subject){
  drawnSubject=subject;
  $('[data-grade-legend]').innerHTML=scoreLegend(subject);
  if(teacher)showTeacherEvidence($('[data-performance]'),{read:readEvidence,student:student.id,subject,h});
  else $('[data-performance]').innerHTML=performanceMarkup(data.performance?.find(p=>p.course===subject),h,link);
  if(!teacher){
    const panel=$('[data-performance]'),key='skill:'+state.user.id+':'+subject;
    const rows=[...panel.querySelectorAll('details[data-skill]')];
    evidenceLessons.destroy();
    const axes=data.performance?.find(p=>p.course===subject)?.axes||[];
    for(const row of rows){for(const target of row.querySelectorAll('[data-skill-lesson]')){
      const item=axes[Number(row.dataset.skill)-1]?.references?.[Number(target.dataset.skillLesson)];
      if(item)evidenceLessons.mount(target,{lessonReference:item.lessonReference},{course:subject,number:item.questionNumber});
    }}
    let prior;try{prior=sessionStorage.getItem(key);}catch{}
    const markers=[...panel.querySelectorAll('[data-skill-axis]')];
    function syncSkill(){
      const id=rows.find(row=>row.open)?.dataset.skill||'';
      for(const marker of markers)marker.setAttribute('aria-expanded',String(marker.dataset.skillAxis===id));
      try{if(id)sessionStorage.setItem(key,id);else sessionStorage.removeItem(key);}catch{}
    }
    for(const row of rows){
      row.open=row.dataset.skill===prior;
      row.addEventListener('toggle',()=>{
        if(row.open)for(const other of rows)if(other!==row)other.open=false;
        syncSkill();
      });
    }
    syncSkill();
    for(const axis of markers){
      const open=()=>{const row=rows.find(x=>x.dataset.skill===axis.dataset.skillAxis);if(row){row.open=true;row.querySelector('summary').focus({preventScroll:true});}};
      axis.onclick=open;axis.onkeydown=e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();open();}};
    }
  }
  const advice=$('[data-performance-advice]');
  if(advice)advice.onclick=async()=>{
    const output=$('[data-advice-output]');
    advice.disabled=true;output.textContent='正在整理练习建议…';
    try{
      const result=await ctx.post('learning/performance-advice',{course:advice.dataset.performanceAdvice});
      if(output.isConnected)output.textContent=result.text;
    }catch{if(output.isConnected)output.textContent='可展开技能分布，先做一题对应知识点的新题。';}
    finally{if(advice.isConnected)advice.disabled=false;}
  };
  }
  const range=timeRange(filter.period,filter.from,filter.to);$('.gj-dates').hidden=filter.period!=='custom';const term=filter.query.trim().toLocaleLowerCase();visible=all.filter(c=>assignmentCourse(c.assignment,data.classes||[])===subject&&inRange(c.assignment,range)&&[c.assignment.title,...(c.assignment.questions||[]).map(q=>q.prompt)].some(v=>(v||'').toLocaleLowerCase().includes(term)));
  selected=visible.find(c=>c.assignment.id===(selected?.assignment.id||(teacher?memory.get('selected',''):returnSelection)))||(!teacher&&latestPublishedCell(visible))||[...visible].reverse().find(c=>c.rate!==null)||visible.at(-1);const summary=cellSummary(visible),change=progressChange(visible);
  $('.gj-summary').innerHTML=`<span>${courseLabel(subject)}平均 ${scoreBadge(summary.average,subject)}</span><span>已出分 <strong>${summary.count} / ${visible.length}</strong> 次</span>${change===null?'':`<span>近3次较前3次 <strong>${change>0?'+':''}${change}</strong> 个百分点</span>`}`;
  $('.gj-range-hint').textContent=range.from||range.to?`${range.from||'最早'} 至 ${range.to||'最新'}`:'';$('.gj-filter-state').textContent=term||filter.period!=='all'?'已筛选':'';const layout=$('.gj-focus-layout');layout.dataset.density=!visible.length?'empty':visible.length===1?'single':visible.length<=3?'sparse':'full';layout.style.setProperty('--gj-sparse-width',(visible.length*180+48)+'px');layout.dataset.journeyView=mode;layout.dataset.count=visible.length;
  const node=c=>`<button type="button" class="gj-node" data-assignment="${h(c.assignment.id)}" aria-pressed="false" title="${h(c.assignment.title)}"><strong>${highlightText(c.assignment.title||'历史作业',filter.query)}</strong>${statusMarkup(c,h)}${c.pendingUpdate?'<small>新版本待更新</small>':c.late?'<small>迟交</small>':''}</button>`;
  let previousMonth = '';
  $('.gj-fish').innerHTML=(visible.length>1?visible:[]).map(c=>{
    const when = new Date(c.assignment.dueAt || c.assignment.createdAt || Date.now());
    const month = `${when.getMonth() + 1} 月`;
    const fresh = month !== previousMonth;
    previousMonth = month;
    const level = c.rate === null ? '' : scoreBand(c.rate).level;
    return `<div class="gj-branch"${level ? ` data-band="${level}"` : ''}>${fresh ? `<span class="gj-month">${month}</span>` : ''}${node(c)}<time>${date(c.assignment.dueAt||c.assignment.createdAt).split(' ')[0]}</time><span class="gj-dot" aria-hidden="true"></span></div>`;
  }).join('');
  $('.gj-list').innerHTML=(visible.length>1?visible:[]).map(c=>`<button type="button" class="gj-list-row" data-assignment="${h(c.assignment.id)}"><span><strong>${highlightText(c.assignment.title||'历史作业',filter.query)}</strong><small>${date(c.assignment.dueAt||c.assignment.createdAt)}</small></span>${statusMarkup(c,h)}</button>`).join('');
  $('#journey-first').disabled=$('#journey-last').disabled=!visible.length;selection();setMode();detail(preserveEditor);boundaries();
 }
 function trackLink(el){el?.querySelectorAll('a[href]').forEach(a=>a.addEventListener('click',e=>{if(e.target.closest('a[href]')){remember();if(!teacher)history.replaceState({...history.state,gradeJourney:{user:state.user.id,selected:selected?.assignment.id,top:main.scrollTop,left:scroll.scrollLeft}},'');if(teacher)state.gradeReturn={submissionId:e.target.closest('a').dataset.submission,route:'gradebook/'+encodeURIComponent(student.id)};else state.gradeReturn={route:'grades'};}}));}
 function detail(preserveEditor=false){const host=$('.gj-detail');if(!preserveEditor){$('.gj-inline-correction').hidden=true;$('.gj-inline-correction').replaceChildren();}if(!selected){host.innerHTML=`<div class="empty"><h2>${all.length?'没有匹配的作业':'还没有作业记录'}</h2><p>${all.length?'调整日期或清除搜索后再试。':'老师布置作业后会出现在这里；已有成绩和提交不会丢失。'}</p>${link('assignments','查看作业','primary')}</div>`;return;}
  const single=visible.length===1,c=selected,r=c.record,g=r?.grade,a=c.assignment,wrong=g?.questions?.filter(q=>q.score!=null&&q.score<q.maxPoints)||[],effective=r?.effective||r?.latest,offline=a.offline===true||a.format==='score',canSubmit=!offline&&!a.deletedAt&&(!a.dueAt||Date.parse(a.dueAt)>Date.now()||a.allowLate||r?.latest?.status==='returned')&&(!r||a.allowResubmit!==false||r.latest.status==='returned');
  const download=effective?`<a class="gj-download" aria-label="保存作业 PDF" title="保存作业 PDF" href="/api/homework/submissions/${h(effective.id)}/pdf" download><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></svg></a>`:'';
  const match=(a.questions||[]).find(q=>filter.query.trim()&&q.prompt?.toLocaleLowerCase().includes(filter.query.trim().toLocaleLowerCase()));host.innerHTML=`<div class="gj-detail-head"><h2>${highlightText(a.title||'历史作业',filter.query)}</h2><span>${!teacher&&g?.publishedAt?'出分':a.dueAt?'截止':'发布'} ${date(!teacher&&g?.publishedAt?g.publishedAt:a.dueAt||a.createdAt)}</span></div>${match&&!a.title.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase())?`<p class="gj-search-context">第 ${h(match.id)} 题 · ${highlightText(match.prompt,filter.query)}</p>`:''}<div class="gj-result">${g?`<strong>${g.total??'—'}<small> / ${g.maxPoints}</small></strong>${statusMarkup(c,h)}${g.questions?.some(q=>Number.isFinite(q.score))?`<span>首答失分 ${wrong.length} 题</span>`:''}`:statusMarkup(c,h)}${r?.effective&&(teacher||r.attempts.length>1)?`<span>成绩版本 ${g.revision||1}</span>`:''}${a.deletedAt?'<span>历史作业</span>':''}</div>${c.pendingUpdate?'<p class="hint">新版本待更新，当前平均仍采用此前已发布成绩。</p>':''}${!g&&r?.latest?`<p class="hint">已收到 ${date(r.latest.submittedAt)} 的提交。${c.status==='attention'?'老师处理后会更新结果，无需重复提交。':'成绩发布后会在这里更新。'}</p>`:''}<div class="actions">${offline?`${link(effective?'result/'+effective.id:'assignments',effective?'查看成绩':'返回作业')}`:single?`<button type="button" class="${teacher?'secondary':'primary'}" id="journey-paper" aria-expanded="false">查看原题</button>${teacher&&effective?link('review/'+effective.id,'查看作答与复核','primary'):!teacher?`<button type="button" class="secondary" id="journey-wrong" ${wrong.length?'aria-expanded="false"':'disabled'} title="${wrong.length?'对照原题订正失分题':g?'本次没有失分题':'成绩发布后可订正'}">${wrong.length?'订正':g?'无需订正':'出分后订正'}</button>`:''}${!effective&&!teacher&&canSubmit?link('submit/'+a.id,'提交作业','secondary'):''}${effective?`${!teacher?link('result/'+effective.id,'作业回顾','secondary'):''}${download}`:''}`:`${!teacher&&wrong.length?'<button type="button" class="primary" id="journey-wrong" aria-expanded="false">展开失分题</button>':''}${effective?link((teacher?'review/':'result/')+effective.id,teacher?'查看作答与复核':'作业回顾',!wrong.length?'primary':'secondary'):!teacher&&canSubmit?link('submit/'+a.id,'继续提交作业','primary'):teacher?link('overview/'+a.id,'查看提交情况'):link('assignments','查看作业')}${effective?`${download}`:''}`}</div><div class="gj-wrong" hidden></div>${r?`<details class="gj-attempts"><summary>提交记录 · ${r.attempts.length} 次</summary>${r.attempts.map((s,i)=>`<div>${link((teacher?'review/':'result/')+s.id,`第 ${r.attempts.length-i} 次提交 · ${date(s.submittedAt)}`)}<span>${s.id===r.effective?.id?'当前采用的成绩':s.publishedGrade?'历史成绩':'待更新'}${s.publishedGrade?' · '+s.publishedGrade.total+'/'+s.publishedGrade.maxPoints:''}</span></div>`).join('')}</details>`:''}`;
  if (!teacher && g) {
    const summary=effective.correctionSummary||receiptCorrections(data.mistakes||[],effective.id);
    const grade=host.querySelector('.gj-result');
    grade.insertAdjacentHTML('afterbegin','<span class="grade-current">当前得分</span>');
    grade.insertAdjacentHTML('afterend',receiptEvidence({...effective,assignment:a})+receiptActions(wrong.length||g.questions?.length?summary:null,a.id,link));
    const old=host.querySelector('#journey-wrong');
    if(summary.open)host.querySelectorAll('.actions .primary').forEach(el=>el.classList.replace('primary','secondary'));
    if (old) {
      if(wrong.length)old.textContent='回看首答错题 · '+wrong.length;
      else old.remove();
    }
  }
  if(teacher&&g?.scoreSources)host.querySelector('.gj-detail-head')?.insertAdjacentHTML('beforeend',scoreSources(g));
  for(const a of host.querySelectorAll('a[href*="review/"]'))a.dataset.submission=a.getAttribute('href').split('review/')[1];trackLink(host);
  const toggle=$('#journey-wrong');if(toggle&&wrong.length)toggle.onclick=async()=>{try{await leaveCorrection();$('.gj-inline-correction').hidden=true;const list=$('.gj-wrong');list.hidden=!list.hidden;toggle.textContent=list.hidden?'回看首答错题 · '+wrong.length:'收起首答错题';toggle.setAttribute('aria-expanded',String(!list.hidden));if(!list.hidden)list.innerHTML=wrong.map(q=>`<button type="button" data-question="${h(q.id)}"><span>第 ${h(q.id)} 题</span><span>${q.score} / ${q.maxPoints}</span><span>原题与订正</span></button>`).join('');if(single&&!list.hidden)list.querySelector('[data-question]')?.click();}catch(e){toast(e.message);}};
  host.onclick=async e=>{const b=e.target.closest('[data-question],#journey-paper');if(!b)return;const paper=b.id==='journey-paper';if(paper?!mountPaper:!mountCorrection)return;const seq=++sequence;let replacing=false;try{await leaveCorrection();if(destroyed||seq!==sequence)return;replacing=true;const box=$('.gj-inline-correction');box.hidden=false;box.innerHTML='<p role="status">正在打开原题与订正…</p>';const close=async()=>{try{await leaveCorrection();box.hidden=true;$('#journey-paper')?.setAttribute('aria-expanded','false');b.focus({preventScroll:true});b.scrollIntoView({block:'nearest',behavior:smooth()});}catch(error){toast(error.message);}};if(paper){$('.gj-wrong').hidden=true;if(toggle){toggle.setAttribute('aria-expanded','false');toggle.textContent='回看首答错题 · '+wrong.length;}}$('#journey-paper')?.setAttribute('aria-expanded',String(paper));const pending=paper?mountPaper(box,a.id,effective?.id,close):mountCorrection(box,a.id,b.dataset.question,close);opening=pending;let instance;try{instance=await pending;}finally{if(opening===pending)opening=null;}if(destroyed||seq!==sequence){instance.destroy();return;}child=instance;if(small.matches||box.getBoundingClientRect().top>innerHeight*.35)box.scrollIntoView({block:'start',behavior:smooth()});}catch(error){if(replacing&&!destroyed&&seq===sequence){const box=$('.gj-inline-correction');box.innerHTML='<p role="alert">原题暂时无法打开，请重试。</p><button type="button" data-retry-inline>重试打开</button>';box.querySelector('[data-retry-inline]').onclick=()=>b.click();}toast(error.message);}};
 }
 async function choose(id,scrollTo=false,showDetail=false){const seq=++sequence;try{await leaveCorrection();if(destroyed||seq!==sequence)return;selected=visible.find(c=>c.assignment.id===id)||selected;selection();detail();if(scrollTo)center();remember();if(showDetail&&(!teacher||small.matches))$('.gj-detail').scrollIntoView({block:'start',behavior:smooth()});}catch(e){toast(e.message);}}
 for(const el of [$('.gj-fish'),$('.gj-list')]){el.addEventListener('click',e=>{const b=e.target.closest('[data-assignment]');if(b&&!dragged)void choose(b.dataset.assignment,false,true);});el.addEventListener('keydown',e=>{const b=e.target.closest('[data-assignment]');if(!b)return;const i=visible.findIndex(c=>c.assignment.id===b.dataset.assignment);let n;if(e.key==='ArrowRight')n=Math.min(i+1,visible.length-1);if(e.key==='ArrowLeft')n=Math.max(0,i-1);if(e.key==='Home')n=0;if(e.key==='End')n=visible.length-1;if(n!==undefined){e.preventDefault();const target=[...el.querySelectorAll('[data-assignment]')][n];focused=target.dataset.assignment;el.querySelectorAll('[data-assignment]').forEach(b=>b.tabIndex=b===target?0:-1);target.focus({preventScroll:true});if(el.classList.contains('gj-fish'))scroll.scrollTo({left:target.getBoundingClientRect().left-scroll.getBoundingClientRect().left+scroll.scrollLeft+target.offsetWidth/2-scroll.clientWidth/2,behavior:smooth()});}});}
 let pointer=null,dragged=false;scroll.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,left:scroll.scrollLeft};dragged=false;});scroll.addEventListener('pointermove',e=>{if(!pointer)return;const delta=e.clientX-pointer.x;if(Math.abs(delta)>6&&!dragged){dragged=true;scroll.setPointerCapture(e.pointerId);scroll.classList.add('dragging');}if(dragged){e.preventDefault();scroll.scrollLeft=pointer.left-delta;}});const end=e=>{if(pointer&&scroll.hasPointerCapture(pointer.id))scroll.releasePointerCapture(pointer.id);pointer=null;scroll.classList.remove('dragging');if(dragged)setTimeout(()=>dragged=false,0);};scroll.addEventListener('pointerup',end);scroll.addEventListener('pointercancel',end);scroll.addEventListener('scroll',()=>{boundaries();memory.set({left:scroll.scrollLeft});},{passive:true});
 $('#journey-left').onclick=()=>scroll.scrollBy({left:-scroll.clientWidth*.8,behavior:smooth()});$('#journey-right').onclick=()=>scroll.scrollBy({left:scroll.clientWidth*.8,behavior:smooth()});$('#journey-first').onclick=()=>visible[0]&&choose(visible[0].assignment.id,true);$('#journey-last').onclick=()=>visible.length&&choose(((!teacher&&latestPublishedCell(visible))||visible.at(-1)).assignment.id,true);
 for(const b of main.querySelectorAll('[data-view]'))b.onclick=()=>{mode=b.dataset.view;setMode();if(mode==='timeline')center(true);};
 async function apply(){const seq=++sequence;const from=$('#journey-from').value,to=$('#journey-to').value;if($('#journey-period').value==='custom'&&from&&to&&from>to){$('#journey-error').textContent='结束日期不能早于开始日期。';return;}try{await leaveCorrection();if(destroyed||seq!==sequence)return;$('#journey-error').textContent='';Object.assign(filter,{query:$('#journey-search').value,period:$('#journey-period').value,from,to});draw();center(true);remember();}catch(e){toast(e.message);}}
 for(const b of main.querySelectorAll('[data-subject]'))b.onclick=async()=>{try{await leaveCorrection();subject=b.dataset.subject;selected=null;rememberCourse(state.user.id,subject);main.querySelectorAll('[data-subject]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();center(true);remember();}catch(e){toast(e.message);}};
 $('#journey-search').oninput=e=>{if(e.isComposing)return;clearTimeout(searchTimer);searchTimer=setTimeout(apply,250);};$('#journey-search').oncompositionend=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(apply,250);};$('#journey-search').onkeydown=e=>{if(e.key==='Escape'){$('#journey-search').value='';void apply();}};for(const id of ['period','from','to'])$('#journey-'+id).onchange=apply;$('#journey-reset').onclick=()=>{$('#journey-search').value='';$('#journey-period').value='all';$('#journey-from').value=$('#journey-to').value='';void apply();};
 $('#journey-refresh').onclick=async()=>{try{await leaveCorrection();remember();$('#journey-refresh').textContent='刷新中…';$('.gj-page').inert=true;ctx.go(teacher?'gradebook/'+encodeURIComponent(student.id):'grades');}catch(e){toast(e.message);}};
 draw();state.restoreView=()=>{if((teacher||returnSelection)&&memory.get('selected',''))scroll.scrollTo({left:teacher?memory.get('left',0):savedView.left,behavior:'instant'});else center(true);main.scrollTo({top:teacher?memory.get('top',0):returnSelection?savedView.top:0,behavior:'instant'});boundaries();};
 let receiptRequest=0;
 async function refreshReceipt(){
   const cell=selected, effective=cell?.record?.effective;
   if(teacher||!effective||destroyed)return;
   const request=++receiptRequest;
   const {submission}=await ctx.api('submissions/'+encodeURIComponent(effective.id)+'?receipt=1');
   if(destroyed||request!==receiptRequest||!submission.publishedGrade)return;
   effective.publishedGrade=cell.record.grade=submission.publishedGrade;
   effective.correctionSummary=submission.correctionSummary;
   cell.rate=rateOf(cell.record.grade);
   if(selected===cell)draw(true);
 }
 return {refreshReceipt,destroy(){evidenceLessons.destroy();destroyed=true;++sequence;clearTimeout(searchTimer);remember();resizeObserver.disconnect();small.removeEventListener('change',setFilters);child?.destroy();}};
}
