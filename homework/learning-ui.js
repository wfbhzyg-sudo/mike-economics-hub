import {mountInk} from './ink.js';
import {reviewLinksMarkup} from './review-links.js';
import {splitChoiceCorrection,joinChoiceCorrection} from './choice-correction.js';
import {mountGradeJourney} from './grade-journey.js';
import {mountGradeHeatmap} from './grade-heatmap.js';
import {scoreBadge,scoreLegend} from './score-bands.js';
import {viewMemory} from './view-memory.js';
import {mountCorrectionReference,mountAssignmentPaper} from './correction-workspace.js';
import {showAssignmentRoster} from './assignment-roster.js';
import {highlightText} from './search-text.js';
import {assignmentRecords,gradeSummary,questionTotals} from './learning-model.js';
export function createLearningUI(ctx){
 const {state,main,api,post,put,h,head,link,badge,date,formHandler,area,field,toast,go,uploadWidget,metadata,fileMarkup,bindPreviews}=ctx;
 const $=(s,r=main)=>r.querySelector(s), $$=(s,r=main)=>[...r.querySelectorAll(s)];
 const pct=g=>g?.maxPoints?Math.round(g.total/g.maxPoints*1000)/10:null;
 const routeLink=(route,text,cls='text-button')=>link(route,text,cls);
 function focusCorrection(host){host.scrollIntoView({block:'start',behavior:'instant'});const heading=host.querySelector('.correction-workspace h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 async function load(){const v=state.routeVersion;const data=await api('learning');if(v!==state.routeVersion)return null;return data;}
 async function gradebook(studentId){
  const data=await load();if(!data)return;const teacher=state.user.role==='teacher';
  if(teacher&&!studentId){const view=mountGradeHeatmap(ctx,data);state.viewCleanup=()=>view.destroy();return;}
  const student=teacher?data.students.find(u=>u.id===studentId):state.user;
  if(!student){main.innerHTML=`<section class="paper">${head('','未找到该学生','',link('gradebook','返回班级成绩'))}</section>`;return;}
  const view=mountGradeJourney(ctx,data,student,{teacher,back:teacher?'gradebook':'',mountPaper:(host,assignmentId,submissionId,onClose)=>mountAssignmentPaper(host,{assignmentId,submissionId,state,api,metadata,h,onClose}),mountCorrection:async(host,assignmentId,questionId,onClose)=>{
   const local={...state,routeVersion:0,viewCleanup:null,restoreView:null,correctionNavigation:null};let closed=false;
   const open=async(route)=>{if(closed)return;local.viewCleanup?.();local.viewCleanup=null;local.correctionNavigation=null;const version=++local.routeVersion;const [,a,q]=route.split('/').map(decodeURIComponent);const child=createLearningUI({...ctx,main:host,state:local,go:r=>void open(r).catch(e=>toast(e.message)),link:(r,t,c)=>r==='mistakes'?'<button type="button" class="secondary" data-inline-close>收起订正</button>':link(r,t,c),onCorrectionSaved:async(next,mode)=>{if(mode==='next'&&next)await open(next);else await onClose();}});await child.mistakes(a,q);if(closed||version!==local.routeVersion)return;focusCorrection(host);const b=host.querySelector('[data-inline-close]');if(b)b.onclick=async()=>{try{await onClose();}catch(e){toast(e.message);}};};
   try{await open('mistakes/'+encodeURIComponent(assignmentId)+'/'+encodeURIComponent(questionId));}catch(error){closed=true;local.routeVersion++;local.viewCleanup?.();throw error;}return {flush:()=>local.correctionNavigation?.(),destroy(){closed=true;local.routeVersion++;local.viewCleanup?.();local.viewCleanup=null;}};
  }});state.viewCleanup=()=>view.destroy();
 }
 async function overview(id,filter){return showAssignmentRoster(ctx,id,filter);}
 function correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute){
  const status=$('#correction-draft-status'),conflictBox=$('#correction-conflict');
  const key=`hw-correction:${state.user.id}:${m.assignmentId}:${m.questionId}`;
  let revision=remote?.revision||0,dirty=Boolean(cached),change=0,timer,writing=Promise.resolve(),done=false,conflict=false,mutationId=cached?.mutationId||crypto.randomUUID();
  let finalId=crypto.randomUUID();
  const snapshot=()=>({correction:form.elements.correctionChoice?joinChoiceCorrection(form.elements.correctionChoice.value,form.elements.correction.value):form.elements.correction.value,note:form.elements.note.value,status:form.elements.status.value,files:[...up.ids()],mutationId});
  function cache(){try{if(!dirty){sessionStorage.removeItem(key);return true;}sessionStorage.setItem(key,JSON.stringify({...snapshot(),revision,noteRevision:m.revision,updatedAt:Date.now()}));return true;}catch{return false;}}
  function setStatus(message){status.textContent=message;}
  function changed(){dirty=true;change++;finalId=crypto.randomUUID();mutationId=crypto.randomUUID();cache();clearTimeout(timer);setStatus(up.busy()?'正在添加订正附件…':'有更改，正在保存订正草稿…');if(!up.busy()&&!conflict)timer=setTimeout(()=>save().catch(handleError),900);}
  async function showConflict(){
    conflict=true;clearTimeout(timer);setStatus('草稿在另一处有更新，本页内容已保留。');
    let current,currentNote;try{current=(await api(endpoint+'/draft')).draft;currentNote=(await api('learning')).mistakes.find(row=>row.assignmentId===m.assignmentId&&row.questionId===m.questionId);}catch(e){setStatus(e.message+' 本页内容已保留，请暂时不要关闭页面。');return;}
    conflictBox.hidden=false;conflictBox.innerHTML=`<p>选择要继续编辑的版本。保存订正前不会更改原成绩。</p>${up.pending()?'<p>载入账户版本时，本页未上传的文件需要重新选择。</p>':''}<details><summary>查看账户中的版本</summary><p class="instructions">${h(current?.cleared?'该版本已保存为订正记录。':current?.correction||'没有文字答案')}</p><p class="instructions">${h(current?.note||'')}</p><p class="hint">${current?.files?.length||0} 个附件</p></details><div class="actions"><button type="button" class="secondary" data-keep-local>继续编辑本页版本</button><button type="button" class="secondary" data-load-account>载入账户版本</button></div>`;
    $('[data-keep-local]',conflictBox).onclick=async()=>{finalId=crypto.randomUUID();revision=current?.revision||0;if(currentNote)m.revision=currentNote.revision;conflict=false;conflictBox.hidden=true;mutationId=crypto.randomUUID();dirty=true;cache();await save().catch(handleError);};
    $('[data-load-account]',conflictBox).onclick=()=>{if(up.busy()){setStatus('请等待附件处理完成后再切换版本。');return;}up.discardQueue();try{sessionStorage.setItem(key+':previous',JSON.stringify({...snapshot(),updatedAt:Date.now()}));sessionStorage.removeItem(key);}catch{}done=true;go('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId));};
  }
  function handleError(e){if(e.status===409){void showConflict();return;}setStatus(e.message+(cache()?' 当前内容已在此页面暂存。':' 请暂时不要关闭页面。'));if(e.retryable&&form.isConnected&&!conflict)timer=setTimeout(()=>save().catch(handleError),3000);}
  function save(){
    if(up.busy())return Promise.reject(Error('附件仍在上传，请稍等。'));if(conflict)return Promise.reject(Error('请先选择要继续编辑的草稿版本。'));
    const body=snapshot(),captured=change;
    writing=writing.catch(()=>{}).then(async()=>{if(conflict)throw Error('请先处理草稿版本冲突。');const {draft}=await put(endpoint+'/draft',{...body,revision});revision=draft.revision;if(captured===change)dirty=false;cache();if(form.isConnected&&captured===change)setStatus(up.pending()?'订正草稿已保存，仍有附件待重试。':'订正草稿已保存到账户 · 尚未保存为订正记录');return draft;});return writing;
  }
  const online=()=>{if(dirty&&!conflict&&!done&&!up.busy()){clearTimeout(timer);timer=setTimeout(()=>save().catch(handleError),300);}};
  const beforeUnload=e=>{if(!done)cache();if(dirty||up.busy()||up.pending()){e.preventDefault();e.returnValue='';}};
  window.addEventListener('online',online);window.addEventListener('beforeunload',beforeUnload);
  state.viewCleanup=()=>{clearTimeout(timer);window.removeEventListener('online',online);window.removeEventListener('beforeunload',beforeUnload);if(!done){cache();if(dirty&&!conflict&&!up.busy())void save().catch(()=>{});}};
  form.addEventListener('input',changed);form.elements.status.addEventListener('change',changed);
  formHandler(form,async()=>{if(up.busy())throw Error('请等待附件上传完成');if(up.pending())throw Error('还有文件未添加，请重试或选择不添加后再保存订正。');if(conflict)throw Error('请先选择要继续编辑的草稿版本。');clearTimeout(timer);const controls=[...form.elements].map(el=>({el,disabled:el.disabled}));controls.forEach(({el})=>el.disabled=true);try{await writing.catch(()=>{});if(dirty)await save();await put(endpoint,{...snapshot(),revision:m.revision,draftRevision:revision,mutationId:finalId});done=true;sessionStorage.removeItem(key);toast('订正已保存，原成绩保留');if(form.isConnected){if(ctx.onCorrectionSaved)await ctx.onCorrectionSaved(nextRoute,form.dataset.afterSave);else go(form.dataset.afterSave==='next'&&nextRoute?nextRoute:'mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId));}}catch(e){if(e.status===409)await showConflict();throw e;}finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}});
  if(cached&&(cached.noteRevision!==m.revision||(cached.revision!==revision&&cached.mutationId!==remote?.mutationId)))void showConflict();
  else if(dirty)online();
  return {changed,async flush(){if(up.busy())throw Error('附件仍在上传，请稍等。');if(up.pending())throw Error('还有附件未添加，请重试或选择不添加后再切换题目。');clearTimeout(timer);await writing.catch(()=>{});if(dirty)await save();}};
 }
 async function mistakes(assignmentId,questionId){
  const data=await load();if(!data)return;
  if(assignmentId&&questionId){
    const m=data.mistakes.find(m=>m.assignmentId===assignmentId&&m.questionId===questionId);
    if(!m){main.innerHTML=`<section class="paper">${head('','这道题已不在待订正列表','成绩改判或重交后，错题集会同步更新。',link('mistakes','返回错题集'))}</section>`;return;}
    const v=state.routeVersion,endpoint=`mistakes/${encodeURIComponent(assignmentId)}/${encodeURIComponent(questionId)}`,{draft:remote}=await api(endpoint+'/draft');
    const cacheKey=`hw-correction:${state.user.id}:${assignmentId}:${questionId}`;let cached;try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null');}catch{}
    const initial=cached||(!remote?.cleared&&remote)||{correction:'',note:m.note,status:m.status,files:[]};
    const latestCorrection=m.corrections.at(-1);const ids=[...m.corrections.flatMap(c=>c.files||[]),...(initial.files||[])];await metadata(ids);if(v!==state.routeVersion)return;
    const inAssignment=data.mistakes.filter(x=>x.assignmentId===m.assignmentId),index=inAssignment.findIndex(x=>x.questionId===m.questionId),next=inAssignment[index+1];
    const route=x=>'mistakes/'+x.assignmentId+'/'+encodeURIComponent(x.questionId),nextRoute=next?route(next):null;
    main.innerHTML=`<section class="paper correction-workspace">${head('',`第 ${m.questionId} 题 · 订正`,m.assignmentTitle,link('mistakes','返回错题集'))}<div class="correction-heading-info"><strong>原得分 ${m.score} / ${m.maxPoints}</strong><span>订正不改变原成绩</span>${latestCorrection?`<button type="button" class="text-button" data-show-saved>已保存 ${m.corrections.length} 次订正 · 查看</button>`:''}${m.knowledge?`<span>${h(m.knowledge)}</span>`:''}</div>${reviewLinksMarkup(m.review,h,{compact:true})}${m.libraryUnit&&!m.review?.links?.length?routeLink('library/'+m.libraryUnit,'回到对应单元'): ''}<div class="correction-layout"><section class="correction-reference" aria-label="原题与作答参考"></section><section class="correction-editor"><h2>${latestCorrection?'继续补充订正':'写下新的解题思路'}</h2>${m.feedback?`<details><summary>老师反馈</summary><p class="instructions">${h(m.feedback)}</p></details>`:''}${latestCorrection?`<details class="correction-saved" ${!initial.correction?'open':''}><summary>已保存订正 · ${date(latestCorrection.createdAt)}</summary><p class="instructions">${h(latestCorrection.text||'订正见附件')}</p><div class="file-list">${fileMarkup(latestCorrection.files||[])}</div><p class="hint">下方可继续补充，已保存的记录会保留。</p></details>`:''}<form id="correction-form" class="stack">${area('我的订正答案','correction',initial.correction,'placeholder="对照原题，按题号写下修改后的答案…" maxlength="10000"')}<details class="lib-handwriting" data-correction-ink><summary>手写订正</summary><div data-ink-host></div></details><details class="correction-attachments" ${(initial.files||[]).length?'open':''}><summary>拍照或添加订正附件</summary><div id="correction-upload"></div></details><details ${initial.note?'open':''}><summary>复习笔记（可选）</summary>${area('下次要记住什么','note',initial.note,'maxlength="5000"')}</details><label class="field"><span>复习状态</span><select name="status">${[['todo','待订正'],['review','待复习'],['mastered','我已掌握（自评）']].map(([v,t])=>`<option value="${v}" ${initial.status===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="draft-feedback" id="correction-draft-status" role="status">${cached?'已恢复此设备的订正草稿。':remote&&!remote.cleared?'已恢复账户订正草稿。':'输入后自动保存草稿。'}</p><div id="correction-conflict" class="draft-conflict" hidden></div><p class="form-error" role="alert"></p><div class="correction-save-actions"><button class="${next?'secondary':'primary'}" type="submit" data-correction-save="stay">${ctx.onCorrectionSaved&&!next?(ctx.correctionReturnLabel||'保存并返回作业'):'保存订正'}</button>${next?'<button class="primary" type="submit" data-correction-save="next">保存并下一题</button>':''}</div></form><nav class="correction-question-nav" aria-label="同一作业的错题"><button type="button" class="text-button" data-correction-nav="prev" ${index===0?'disabled':''}>上一题</button><span>本次作业 ${index+1} / ${inAssignment.length} 道失分题</span><button type="button" class="text-button" data-correction-nav="next" ${next?'':'disabled'}>下一题</button></nav></section></div></section>`;
    if(m.options?.length){
      const editor=$('.correction-editor h2');editor.textContent=latestCorrection?'继续补充订正':'重新选择答案';
      const field=$('#correction-form [name=correction]'),initialChoice=splitChoiceCorrection(initial.correction);field.value=initialChoice.explanation;field.placeholder='可选：写下订正说明';const selected=document.createElement('input');selected.type='hidden';selected.name='correctionChoice';selected.value=initialChoice.choice;field.after(selected);
      const choices=document.createElement('div');choices.className='mcq-letters';choices.setAttribute('role','radiogroup');choices.setAttribute('aria-label','订正选项');
      choices.innerHTML=m.options.map(o=>`<button type="button" role="radio" aria-checked="${initialChoice.choice===o.label}" tabindex="${initialChoice.choice===o.label||(!initialChoice.choice&&o===m.options[0])?0:-1}" aria-label="订正选项 ${o.label}" data-correct-choice="${o.label}">${o.label}</button>`).join('');field.closest('label')?.before(choices);
      choices.querySelectorAll('button').forEach((b,i,all)=>{b.onclick=()=>{selected.value=b.dataset.correctChoice;choices.querySelectorAll('button').forEach(x=>{x.setAttribute('aria-checked',String(x===b));x.tabIndex=x===b?0:-1});field.dispatchEvent(new Event('input',{bubbles:true}));};b.onkeydown=e=>{const step=['ArrowRight','ArrowDown'].includes(e.key)?1:['ArrowLeft','ArrowUp'].includes(e.key)?-1:0;if(step){e.preventDefault();const next=all[(i+step+all.length)%all.length];next.focus();next.click()}};});
    }
    if(latestCorrection)$('[data-show-saved]').onclick=()=>{const saved=$('.correction-saved');saved.open=true;saved.scrollIntoView({block:'center',behavior:'instant'});saved.querySelector('summary').focus({preventScroll:true})};
    const form=$('#correction-form');form.addEventListener('submit',e=>{form.dataset.afterSave=e.submitter?.dataset.correctionSave||'stay';},true);
    let autosave,correctionInk;const up=uploadWidget($('#correction-upload'),'submission',initial.files||[],()=>autosave?.changed());bindPreviews();
    autosave=correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute);const inkDetails=$('[data-correction-ink]');inkDetails.ontoggle=async()=>{if(!inkDetails.open||inkDetails.dataset.loaded)return;inkDetails.dataset.loaded='true';try{const host=$('[data-ink-host]');const mounted=await mountInk(host,{api,post,put,userId:state.user.id,scope:{assignmentId:m.assignmentId,questionId:m.questionId,correctionId:m.submissionId},exportLabel:'保存为 PDF 并加入订正',exportHint:'添加后请点击保存订正。原成绩保持不变。',onExport:async file=>{up.append(file);$('.correction-attachments').open=true;autosave.changed();toast('手写 PDF 已加入订正附件')}});if(!host.isConnected)mounted.destroy();else correctionInk=mounted}catch(e){inkDetails.dataset.loaded='';toast(e.message)}};state.correctionNavigation=()=>autosave.flush();
    const reference=mountCorrectionReference($('.correction-reference'),{mistake:m,state,api,metadata,h,fileMarkup,bindPreviews,date,compact:Boolean(ctx.onCorrectionSaved),onEdit:()=>{const editor=$('.correction-editor');editor.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});editor.querySelector('[data-correct-choice][tabindex="0"], [name=correction]').focus({preventScroll:true});}});
    {const heading=$('.correction-editor h2'),back=document.createElement('button');back.type='button';back.className='text-button correction-back-reference';back.textContent='查看原题';heading.append(back);back.onclick=()=>{if($('.correction-reference-body').hidden)$('[data-collapse-reference]').click();$('.correction-reference').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});$('[data-reference=question]').click();$('[data-reference=question]').focus({preventScroll:true});};}
    const cleanup=state.viewCleanup;state.viewCleanup=()=>{correctionInk?.destroy();reference.destroy();cleanup?.();};
    for(const [direction,target]of [['prev',inAssignment[index-1]],['next',next]])$('[data-correction-nav='+direction+']').onclick=async e=>{if(!target)return;const button=e.currentTarget;button.disabled=true;try{await autosave.flush();go(route(target));}catch(error){toast(error.message);button.disabled=false;}};
    return;
  }
  const memory=viewMemory(state.user.id+':mistakes');
  main.innerHTML=`<section class="paper">${head('','我的错题集','先看错误点，再整理自己的解题思路。',link('grades','成绩档案'))}<div class="learning-filters"><label class="field"><span>查找作业或题目</span><input id="mistake-search" type="search" placeholder="作业、知识点或题号"></label><label class="field"><span>复习状态</span><select id="mistake-state"><option value="">全部</option><option value="todo">待订正</option><option value="review">待复习</option><option value="mastered">已掌握（自评）</option></select></label></div><div class="filter-result-line"><p id="mistake-count" role="status"></p><button type="button" class="text-button" id="clear-mistake-filters">清除筛选</button></div><div id="mistakes-list"></div></section>`;
  $('#mistake-search').value=memory.get('query','');$('#mistake-state').value=memory.get('status','');
  const draw=()=>{const term=$('#mistake-search').value.trim(),status=$('#mistake-state').value,rows=data.mistakes.filter(m=>(!status||m.status===status)&&(!term||[m.assignmentTitle,m.prompt,m.knowledge,m.questionId].join(' ').toLocaleLowerCase().includes(term.toLocaleLowerCase())));
    memory.set({query:term,status});$('#mistake-count').textContent=rows.length+' / '+data.mistakes.length+' 道失分题';$('#clear-mistake-filters').hidden=!term&&!status;
    $('#mistakes-list').innerHTML=rows.length?rows.map(m=>`<article class="mistake-row" data-inline-assignment="${h(m.assignmentId)}" data-inline-question="${h(m.questionId)}"><div><h2>${routeLink('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),'第 '+highlightText(m.questionId,term)+' 题')}</h2><p class="meta">${highlightText(m.assignmentTitle,term)} · ${h(m.course)}</p>${term?`<p class="search-context">${highlightText([m.knowledge,m.prompt].filter(Boolean).join(" · "),term)}</p>`:""}${reviewLinksMarkup(m.review,h,{compact:true})}${m.feedback?`<p class="mistake-feedback">${h(m.feedback)}</p>`:""}</div><div class="actions"><span class="badge">${({todo:'待订正',review:'待复习',mastered:'已掌握（自评）'})[m.status]}</span><span class="question-score">${m.score}/${m.maxPoints}</span>${link('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),m.draftUpdatedAt?'继续订正草稿':'回看与订正','primary')}</div></article>`).join(''):`<div class="empty"><h2>${data.mistakes.length?'没有匹配的错题':'这里收集每次作业的失分题'}</h2><p>${data.mistakes.length?'调整筛选条件，再找一次。':'成绩返回后，失分题会自动保存。满分作业不会增加错题。'}</p>${link('assignments','查看作业','primary')}</div>`;};
  $('#mistake-search').oninput=draw;$('#mistake-state').onchange=draw;$('#clear-mistake-filters').onclick=()=>{$('#mistake-search').value='';$('#mistake-state').value='';draw();$('#mistake-search').focus();};draw();
  const list=$('#mistakes-list');let active=null,busy=false,closed=false;
  const filters=[$('#mistake-search'),$('#mistake-state'),$('#clear-mistake-filters')];
  async function closeInline({refresh=false,focus=true}={}){
    const previous=active;if(!previous)return;await previous.local.correctionNavigation?.();if(active!==previous)return;active=null;
    previous.local.routeVersion++;previous.local.viewCleanup?.();previous.host.remove();previous.row.classList.remove('is-expanded');previous.trigger.setAttribute('aria-expanded','false');
    if(refresh){try{const fresh=await api('learning');if(!closed){data.mistakes=fresh.mistakes;if(!active)draw();}}catch(e){toast(e.message);}}
    if(focus){const target=previous.trigger.isConnected?previous.trigger:[...list.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===previous.trigger.getAttribute('href'));target?.scrollIntoView({block:'nearest',behavior:'instant'});target?.focus({preventScroll:true});}
  }
  const filterDraw=async()=>{if(busy)return;busy=true;try{await closeInline({focus:false});draw();}catch(e){toast(e.message);}finally{busy=false;}};
  $('#mistake-search').oninput=filterDraw;$('#mistake-state').onchange=filterDraw;
  $('#clear-mistake-filters').onclick=async()=>{if(busy)return;busy=true;try{await closeInline({focus:false});$('#mistake-search').value='';$('#mistake-state').value='';draw();$('#mistake-search').focus();}catch(e){toast(e.message);}finally{busy=false;}};
  list.addEventListener('click',async e=>{
    const trigger=e.target.closest('a[href]'),row=trigger?.closest('[data-inline-assignment]');
    if(!trigger)return;memory.set({selected:trigger.getAttribute('href'),top:main.scrollTop});
    if(!row||trigger.target==='_blank'||!trigger.getAttribute('href').includes('mistakes/')||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();if(busy)return;busy=true;filters.forEach(f=>f.disabled=true);
    try{
      if(active?.row===row){await closeInline();return;}
      await closeInline({focus:false});if(closed||!row.isConnected)return;
      const host=document.createElement('div');host.className='mistake-inline';host.setAttribute('aria-label','原题与订正');host.innerHTML='<p role="status">正在打开原题与订正…</p>';row.append(host);row.classList.add('is-expanded');trigger.setAttribute('aria-expanded','true');
      const local={...state,routeVersion:0,viewCleanup:null,restoreView:null,correctionNavigation:null};active={host,row,trigger,local};
      const open=async(route)=>{if(closed||active?.host!==host)return;local.viewCleanup?.();const version=++local.routeVersion;local.viewCleanup=null;local.correctionNavigation=null;const [,a,q]=route.split('/').map(decodeURIComponent);
        const child=createLearningUI({...ctx,main:host,state:local,go:r=>void open(r).catch(e=>toast(e.message)),correctionReturnLabel:'保存并收起',link:(r,t,c)=>r==='mistakes'?'<button type="button" class="secondary" data-inline-close>收起订正</button>':link(r,t,c),onCorrectionSaved:async(next,mode)=>{if(mode==='next'&&next)await open(next);else await closeInline({refresh:true});}});
        await child.mistakes(a,q);if(closed||active?.host!==host||version!==local.routeVersion)return;focusCorrection(host);const close=host.querySelector('[data-inline-close]');if(close)close.onclick=async()=>{try{await closeInline();}catch(e){toast(e.message);}};
      };
      await open('mistakes/'+encodeURIComponent(row.dataset.inlineAssignment)+'/'+encodeURIComponent(row.dataset.inlineQuestion));
      host.scrollIntoView({block:'start',behavior:'instant'});host.querySelector('[data-inline-close]')?.focus({preventScroll:true});
    }catch(e){toast(e.message);if(active&&!active.local.correctionNavigation){active.local.viewCleanup?.();active.host.remove();active.row.classList.remove('is-expanded');active.trigger.setAttribute('aria-expanded','false');active=null;}}
    finally{busy=false;filters.forEach(f=>f.disabled=false);}
  });
  state.viewCleanup=()=>{closed=true;if(active){active.local.routeVersion++;active.local.viewCleanup?.();active=null;}};
  state.restoreView=()=>{main.scrollTo({top:memory.get('top',0),behavior:'instant'});const a=[...list.querySelectorAll('a')].find(a=>a.getAttribute('href')===memory.get('selected',''));a?.focus({preventScroll:true});};
 }
 return {gradebook,overview,mistakes};
}
