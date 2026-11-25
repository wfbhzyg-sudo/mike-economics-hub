import {mountRecall} from './student-actions.js';
import {mountFrqParts} from './frq-parts.js';
import {bindDisclosureMenus} from './disclosure-menu.js';
import {mountMistakeDesk} from './mistake-desk.js';
import {unitCourse} from './subject-catalog.js';
import {verificationMarkup} from './learning-evidence.js';
import {renderBookmarks} from './study-workflow.js';
import {assignmentCourse,courseLabel,coursesFor,selectedCourse,rememberCourse} from './course-scope.js';
import {mountInk} from './ink.js';
import {mountLessonLinks} from './lesson-panel.js';
import {mistakeNavigation,bindMistakeNavigation,matchingMistakes,mistakeTopic,mistakeTopicOptions,needsCorrection,topicWorkCounts} from './mistake-navigation.js';
import {feedbackMarkup,feedbackTitle,splitChoiceCorrection,joinChoiceCorrection} from './choice-correction.js';
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
 function focusCorrection(host){if(host.closest('.md-reader'))host.parentElement.scrollTop=0;else host.scrollIntoView({block:'start',behavior:'instant'});const heading=host.querySelector('.correction-workspace h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 async function load(path='learning'){const v=state.routeVersion;const data=await api(path);if(v!==state.routeVersion)return null;return data;}
 async function gradebook(studentId){
  const teacher=state.user.role==='teacher';const data=await load(teacher?'learning':'learning?performance=1');if(!data)return;
  if(teacher&&!studentId){const view=mountGradeHeatmap(ctx,data);state.viewCleanup=()=>view.destroy();return;}
  const student=teacher?data.students.find(u=>u.id===studentId):state.user;
  if(!student){main.innerHTML=`<section class="paper">${head('','未找到该学生','',link('gradebook','返回班级成绩'))}</section>`;return;}
  const view=mountGradeJourney(ctx,data,student,{teacher,back:teacher?'gradebook':'',mountPaper:(host,assignmentId,submissionId,onClose)=>mountAssignmentPaper(host,{assignmentId,submissionId,state,api,metadata,h,onClose}),mountCorrection:async(host,assignmentId,questionId,onClose)=>{
   const local={...state,routeVersion:0,viewCleanup:null,restoreView:null,correctionNavigation:null};let closed=false;
   const refreshReceipt=()=>{void view.refreshReceipt().catch(()=>{if(!closed)toast('成绩暂未刷新，可在成绩页重新查看。');});};
   const open=async(route)=>{if(closed)return;local.viewCleanup?.();local.viewCleanup=null;local.correctionNavigation=null;const version=++local.routeVersion;const [,a,q]=route.split('/').map(decodeURIComponent);const child=createLearningUI({...ctx,main:host,state:local,go:r=>void open(r).catch(e=>toast(e.message)),link:(r,t,c)=>r==='mistakes'?'<button type="button" class="secondary" data-inline-close>收起订正</button>':link(r,t,c),onVerificationChange:refreshReceipt,onCorrectionSaved:async(next,mode)=>{refreshReceipt();if(mode==='next'&&next)await open(next);}});await child.mistakes(a,q);if(closed||version!==local.routeVersion)return;focusCorrection(host);const b=host.querySelector('[data-inline-close]');if(b)b.onclick=async()=>{try{await onClose();}catch(e){toast(e.message);}};};
   try{await open('mistakes/'+encodeURIComponent(assignmentId)+'/'+encodeURIComponent(questionId));}catch(error){closed=true;local.routeVersion++;local.viewCleanup?.();throw error;}return {flush:()=>local.correctionNavigation?.(),destroy(){closed=true;local.routeVersion++;local.viewCleanup?.();local.viewCleanup=null;}};
  }});state.viewCleanup=()=>view.destroy();
 }
 async function overview(id,filter,classId,origin){return showAssignmentRoster(ctx,id,filter,classId,origin);}
 function correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute,onStay){
  const status=$('#correction-draft-status'),conflictBox=$('#correction-conflict');
  const key=`hw-correction:${state.user.id}:${m.assignmentId}:${m.questionId}`;
  let revision=remote?.revision||0,dirty=Boolean(cached),change=0,timer,writing=Promise.resolve(),done=false,conflict=false,mutationId=cached?.mutationId||crypto.randomUUID();
  let finalId=crypto.randomUUID(),lastCommitted=null;
  const snapshot=()=>({correction:form.elements.correctionChoice?joinChoiceCorrection(form.elements.correctionChoice.value,form.elements.correction.value):form.elements.correction.value,note:form.elements.note.value,status:form.elements.status.value,files:[...up.ids()],mutationId});
  function cache(){try{if(!dirty){sessionStorage.removeItem(key);return true;}sessionStorage.setItem(key,JSON.stringify({...snapshot(),revision,noteRevision:m.revision,updatedAt:Date.now()}));return true;}catch{return false;}}
  function setStatus(message){status.textContent=message;}
  function changed(){done=false;dirty=true;change++;finalId=crypto.randomUUID();mutationId=crypto.randomUUID();cache();clearTimeout(timer);setStatus(up.busy()?'正在添加订正附件…':'有更改，正在保存订正草稿…');if(!up.busy()&&!conflict)timer=setTimeout(()=>save().catch(handleError),900);}
  async function showConflict(){
    conflict=true;clearTimeout(timer);setStatus('草稿在另一处有更新，本页内容已保留。');
    let current,currentNote;try{current=(await api(endpoint+'/draft')).draft;currentNote=(await api('learning?mistakeBook=1')).mistakes.flatMap(m=>[m,...(m.occurrences||[])]).find(row=>row.assignmentId===m.assignmentId&&row.questionId===m.questionId);}catch(e){setStatus(e.message+' 本页内容已保留，请暂时不要关闭页面。');return;}
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
  formHandler(form,async()=>{
    if(up.busy())throw Error('请等待附件上传完成');
    if(up.pending())throw Error('还有文件未添加，请重试或选择不添加后再保存订正。');
    if(conflict)throw Error('请先选择要继续编辑的草稿版本。');
    const next=form.dataset.afterSave==='next'&&nextRoute;
    const navigate=async()=>{if(ctx.onCorrectionSaved)await ctx.onCorrectionSaved(nextRoute,next?'next':'stay');else if(next)go(nextRoute);};
    if(done){await navigate();return;}
    clearTimeout(timer);
    const controls=[...form.elements].map(el=>({el,disabled:el.disabled}));
    controls.forEach(({el})=>el.disabled=true);
    try{
      await writing.catch(()=>{});if(dirty)await save();
      const entry=snapshot();
      // A subsequent note or self-assessment does not add the displayed answer again.
      const signature=JSON.stringify([entry.correction,entry.files]);
      if(signature===lastCommitted){entry.correction='';entry.files=[];}
      const saved=await put(endpoint,{...entry,revision:m.revision,draftRevision:revision,mutationId:finalId});
      revision++;done=true;lastCommitted=signature;sessionStorage.removeItem(key);
      if(!form.isConnected)return;
      if(next)toast(saved.feedback?feedbackTitle(saved.feedback):'已保存');
      else {
        const note=saved.note;
        m.revision=note.revision;m.note=note.note;m.status=note.status;m.corrections=note.corrections;
        if(saved.feedback&&(entry.correction||entry.files.length))m.correctionFeedback=saved.feedback;
        form.elements.status.value=note.status;
        if(saved.verification)m.verification=saved.verification;
        onStay(m.correctionFeedback);
      }
      await navigate();
    }catch(e){if(e.status===409)await showConflict();throw e;}
    finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}
  });
  if(cached&&(cached.noteRevision!==m.revision||(cached.revision!==revision&&cached.mutationId!==remote?.mutationId)))void showConflict();
  else if(dirty)online();
  return {changed,async flush(){if(up.busy())throw Error('附件仍在上传，请稍等。');if(up.pending())throw Error('还有附件未添加，请重试或选择不添加后再切换题目。');clearTimeout(timer);await writing.catch(()=>{});if(dirty)await save();}};
 }
 async function mistakes(assignmentId,questionId){
  if(assignmentId==='bookmarks'&&!questionId)return renderBookmarks(ctx);
  const data=await load('learning?mistakeBook=1');if(!data)return;
  if(assignmentId&&questionId){
    const m=data.mistakes.flatMap(m=>[m,...(m.occurrences||[])]).find(m=>m.assignmentId===assignmentId&&m.questionId===questionId);
    if(!m){main.innerHTML=`<section class="paper">${head('','这道题已不在待订正列表','成绩改判或重交后，错题集会同步更新。',link('mistakes','返回错题集'))}</section>`;return;}
    const v=state.routeVersion,endpoint=`mistakes/${encodeURIComponent(assignmentId)}/${encodeURIComponent(questionId)}`,{draft:remote}=await api(endpoint+'/draft');
    const enabled=m.source==='mock'||data.assignments.some(a=>a.id===assignmentId&&a.correctionCredit);
    const cacheKey=`hw-correction:${state.user.id}:${assignmentId}:${questionId}`;let cached;try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null');}catch{}
    const initial=cached||(!remote?.cleared&&remote)||{correction:'',note:m.note,status:m.status==='verified'?'review':m.status,files:[]};
    const latestCorrection=m.corrections.at(-1);const ids=[...m.corrections.flatMap(c=>c.files||[]),...(initial.files||[])];await metadata(ids);if(v!==state.routeVersion)return;
    const allRows=data.mistakes.flatMap(x=>[x,...(x.occurrences||[])]);
    const queue=ctx.topicQueue || allRows.filter(x=>x.assignmentId===m.assignmentId);
    const index=queue.findIndex(x=>x.assignmentId===m.assignmentId && x.questionId===m.questionId),next=queue[index+1];
    const queueTitle=ctx.topicQueue ? ctx.topicLabel : '本次作业';
    const route=x=>'mistakes/'+x.assignmentId+'/'+encodeURIComponent(x.questionId),nextRoute=next?route(next):null;
    main.innerHTML=`<section class="paper correction-workspace"><h1 class="sr-only" tabindex="-1">第 ${h(m.questionNumber||m.questionId)} 题订正</h1><div class="correction-heading-info"><div class="correction-score-context"><strong>原得分 ${m.score} / ${m.maxPoints}</strong>${m.type==='choice'?`<span>原作答 ${h(m.originalChoice||'未作答')}</span>`:''}</div><div data-correction-lesson></div>${link('mistakes','返回错题集','text-button')}</div><div class="correction-layout"><section class="correction-reference" aria-label="原题与作答参考"></section><section class="correction-editor"><h2>${latestCorrection?'继续补充订正':'写下新的解题思路'}</h2>${m.feedback?`<details><summary>老师反馈</summary><p class="instructions">${h(m.feedback)}</p></details>`:''}${latestCorrection?`<details class="correction-saved" ${!initial.correction?'open':''}><summary>已保存订正 · ${date(latestCorrection.createdAt)}</summary><p class="instructions">${h(latestCorrection.text||'订正见附件')}</p><div class="file-list">${fileMarkup(latestCorrection.files||[])}</div></details>`:''}<form id="correction-form" class="stack"><aside class="lesson-pinned" data-lesson-pinned hidden></aside>${area('我的订正答案','correction',initial.correction,'placeholder="对照原题，按题号写下修改后的答案…" maxlength="10000"')}<details class="lib-handwriting" data-correction-ink><summary>手写订正</summary><div data-ink-host></div></details><details class="correction-attachments" ${(initial.files||[]).length?'open':''}><summary>拍照或添加订正附件</summary><div id="correction-upload"></div></details><details ${initial.note?'open':''}><summary>复习笔记（可选）</summary>${area('下次要记住什么','note',initial.note,'maxlength="5000"')}</details><label class="field"><span>复习状态</span><select name="status">${[['todo','待订正'],['review','待复习'],['mastered','我已掌握（自评）']].map(([v,t])=>`<option value="${v}" ${initial.status===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="draft-feedback" id="correction-draft-status" role="status">${cached?'已恢复此设备的订正草稿。':remote&&!remote.cleared?'已恢复账户订正草稿。':'输入后自动保存草稿。'}</p><div id="correction-conflict" class="draft-conflict" hidden></div><p class="form-error" role="alert"></p><div class="correction-save-actions"><button class="primary" type="submit" data-correction-save="stay">保存订正</button>${next?'<button class="secondary" type="submit" data-correction-save="next">保存并下一题</button>':''}</div><div data-saved-verdict>${feedbackMarkup(m.correctionFeedback,h)}</div></form><nav class="correction-question-nav" aria-label="${h(queueTitle)}的错题"><button type="button" class="text-button" data-correction-nav="prev" ${index<=0?'disabled':''}>上一题</button><span>${h(queueTitle)} ${index+1} / ${queue.length} 道失分题</span><button type="button" class="text-button" data-correction-nav="next" ${next?'':'disabled'}>下一题</button></nav></section></div></section>`;
    const lessons=mountLessonLinks(main,api);
    lessons.mount($('[data-correction-lesson]'),m,{number:m.questionNumber||m.questionId,
      pinHost:$('[data-lesson-pinned]'),libraryUnit:m.libraryUnit,course:m.course,review:m.review});
    if(m.type==='choice' && m.options?.length){
      const editor=$('.correction-editor h2');editor.textContent=latestCorrection?'继续补充订正':'重新选择答案';
      const field=$('#correction-form [name=correction]'),initialChoice=splitChoiceCorrection(initial.correction);field.value=initialChoice.explanation;field.closest('label').querySelector('span').textContent='订正理由';field.placeholder=enabled?'写出选择这个选项的理由':'可选：写下订正说明';const selected=document.createElement('input');selected.type='hidden';selected.name='correctionChoice';selected.value=initialChoice.choice;field.after(selected);
      const choices=document.createElement('div');choices.className='mcq-letters';const multi=m.choiceMode==='multiple',options=m.options;choices.setAttribute('role',multi?'group':'radiogroup');choices.setAttribute('aria-label','订正选项');
      choices.innerHTML=options.map(o=>`<button type="button" role="${multi?'checkbox':'radio'}" aria-checked="${initialChoice.choice.includes(o.label)}" tabindex="${multi||initialChoice.choice===o.label||(!initialChoice.choice&&o===options[0])?0:-1}" aria-label="订正选项 ${o.label}" data-correct-choice="${o.label}">${o.label}</button>`).join('');field.closest('label')?.before(choices);
      choices.querySelectorAll('button').forEach((b,i,all)=>{b.onclick=()=>{const pick=b.dataset.correctChoice;selected.value=multi?(selected.value.includes(pick)?selected.value.replace(pick,''):[...selected.value,pick].sort().join('')):pick;choices.querySelectorAll('button').forEach(x=>{x.setAttribute('aria-checked',String(selected.value.includes(x.dataset.correctChoice)));x.tabIndex=multi||x===b?0:-1});field.dispatchEvent(new Event('input',{bubbles:true}));};b.onkeydown=e=>{const step=['ArrowRight','ArrowDown'].includes(e.key)?1:['ArrowLeft','ArrowUp'].includes(e.key)?-1:0;if(step&&!multi){e.preventDefault();const next=all[(i+step+all.length)%all.length];next.focus();next.click()}};});
    }
    if(m.type==='choice' && !m.options?.length)$('#correction-form [name=correction]').placeholder='填写选项字母，例如 B；多选可填写 AC。';
    const form=$('#correction-form');form.addEventListener('submit',e=>{form.dataset.afterSave=e.submitter?.dataset.correctionSave||'stay';},true);
    const receipt=$('[data-saved-verdict]');
    let reviewTimer;
    const recallHost=document.createElement('div');recallHost.hidden=true;form.after(recallHost);
    const checkRecall=mountRecall(recallHost,api,{assignmentId:m.assignmentId,questionId:m.questionId,course:unitCourse(m.libraryUnit)||assignmentCourse(data.assignments.find(a=>a.id===m.assignmentId)||{course:m.course},data.classes||[])});
    function paintVerification(){
      if(!receipt || !m.verification)return;
      if(m.verification.status==='passed'&&Date.parse(m.verification.finishedAt)<=Date.now()-3*86400000)void checkRecall();
      receipt.innerHTML=verificationMarkup(m.verification,h)+(m.verification.status==='passed'?feedbackMarkup(m.correctionFeedback,h,true):'');
      form.querySelectorAll('[data-correction-save]').forEach(b=>b.disabled=['queued','passed'].includes(m.verification.status));
      if(m.verification.status==='queued'){
        clearTimeout(reviewTimer);
        reviewTimer=setTimeout(async()=>{
          if(!form.isConnected)return;
          try{const {review,feedback}=await api(endpoint+'/verification');if(review){const previous=m.verification?.status;m.verification=review;if(form.isConnected&&previous!==review.status)ctx.onVerificationChange?.();}if(feedback)m.correctionFeedback=feedback;}
          catch{}
          if(form.isConnected)paintVerification();
        },3500);
      }
    }
    if(enabled){
      form.querySelectorAll('[data-correction-save]').forEach(b=>b.textContent=b.dataset.correctionSave==='next'?'提交并继续':'提交验收');
      form.elements.status.closest('label').hidden=true;
    }
    if(ctx.finishTopic)form.querySelector('[data-correction-save=stay]').textContent=enabled?'提交并查看进度':'保存并查看进度';
    let autosave,correctionInk;const up=uploadWidget($('#correction-upload'),'submission',initial.files||[],()=>autosave?.changed());bindPreviews();
    autosave=correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute,feedback=>{
      const status=$('#correction-draft-status'),receipt=$('[data-saved-verdict]');
      status.textContent='订正已保存';receipt.innerHTML=enabled&&m.verification?'':feedbackMarkup(feedback,h,true);
      setTimeout(paintVerification,0);
      const latest=m.corrections.at(-1),details=$('.correction-saved');
      if(details&&latest){
        details.querySelector('summary').textContent='已保存订正 · '+date(latest.createdAt);
        details.querySelector('.instructions').textContent=latest.text||'订正见附件';
        details.querySelector('.file-list').innerHTML=fileMarkup(latest.files||[]);bindPreviews(details);
      }
      reference.refreshHistory();
      // Return keyboard focus to the original action after formHandler unlocks it.
      requestAnimationFrame(()=>{
        const button=form.querySelector('[data-correction-save=stay]');
        if(!button.isConnected)return;
        if(document.activeElement?.matches('html,body,main')||document.activeElement===button)button.focus({preventScroll:true});
        if(receipt.firstElementChild)receipt.scrollIntoView({block:'nearest',behavior:'instant'});
      });
    });const inkDetails=$('[data-correction-ink]');inkDetails.ontoggle=async()=>{if(!inkDetails.open||inkDetails.dataset.loaded)return;inkDetails.dataset.loaded='true';try{const host=$('[data-ink-host]');const mounted=await mountInk(host,{api,post,put,userId:state.user.id,scope:{assignmentId:m.assignmentId,questionId:m.questionId,correctionId:m.submissionId},exportLabel:'保存为 PDF 并加入订正',exportHint:'添加后请点击保存订正。原成绩保持不变。',onExport:async file=>{up.append(file);$('.correction-attachments').open=true;autosave.changed();toast('手写 PDF 已加入订正附件')}});if(!host.isConnected)mounted.destroy();else correctionInk=mounted}catch(e){inkDetails.dataset.loaded='';toast(e.message)}};state.correctionNavigation=()=>autosave.flush();
    const partEditor=mountFrqParts(form.elements.correction,m,cacheKey+':part');
    if(partEditor){
      form.closest('.correction-workspace').classList.add('has-frq-parts');
      if(!latestCorrection)$('.correction-editor h2').classList.add('sr-only');
    }
    const reference=mountCorrectionReference($('.correction-reference'),{mistake:m,state,api,metadata,h,fileMarkup,bindPreviews,date,onOriginal:text=>partEditor?.updateOriginal(text),compact:Boolean(ctx.onCorrectionSaved),onEdit:()=>{const editor=$('.correction-editor');editor.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});(partEditor||editor.querySelector('[data-correct-choice][tabindex="0"], [name=correction]')).focus({preventScroll:true});}});
    {const heading=$('.correction-editor h2'),back=document.createElement('button');back.type='button';back.className='text-button correction-back-reference';const field=$('#correction-form [name=correction]');
     if(reference.openForWriting && field){
       const row=document.createElement('div'),label=field.closest('label');
       row.className='frq-writing-field';label.before(row);row.append(label,back);
       if(partEditor){const group=partEditor.closest('.frq-parts');group.querySelector('[role=group]').append(back);row.hidden=true;}
       back.textContent='对照原件';back.setAttribute('aria-haspopup','dialog');
       back.onclick=()=>reference.openForWriting(partEditor||field);
     }else{back.textContent='查看原题';heading.append(back);back.onclick=()=>{if($('.correction-reference-body').hidden)$('[data-collapse-reference]').click();$('.correction-reference').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});$('[data-reference=question]').click();$('[data-reference=question]').focus({preventScroll:true});};}}
    paintVerification();
    const cleanup=state.viewCleanup;state.viewCleanup=()=>{clearTimeout(reviewTimer);correctionInk?.destroy();reference.destroy();cleanup?.();};
    for(const [direction,target]of [['prev',queue[index-1]],['next',next]])$('[data-correction-nav='+direction+']').onclick=async e=>{if(!target)return;const button=e.currentTarget;button.disabled=true;try{await autosave.flush();go(route(target));}catch(error){toast(error.message);button.disabled=false;}};
    const correctionCleanup=state.viewCleanup;state.viewCleanup=()=>{lessons.destroy();correctionCleanup?.();};
    return;
  }
  const memory=viewMemory(state.user.id+':mistakes');const assignmentsById=new Map(data.assignments.map(a=>[a.id,a]));
  const subjectOf=m=>unitCourse(m.lessonReference?.unit) ||
    (m.source==='mock' ? m.course : assignmentCourse(assignmentsById.get(m.assignmentId)||m,data.classes||[]));
  const occurrences=data.mistakes.flatMap(m=>[m,...(m.occurrences||[])]);
  const subjects=[...new Set([...coursesFor(data.assignments,data.classes||[]),...occurrences.map(subjectOf)])];
  let subject=selectedCourse(state.user.id,subjects),visibleRows=[];
  main.innerHTML=`<section class="paper mistake-desk"><div class="md-toolbar"><h1 class="sr-only">我的错题集</h1>${mistakeNavigation(link,h,{current:'mistakes',subjects,subject})}<div class="md-command"><label class="md-metric"><select aria-label="Topic 数量口径" data-count-mode><option value="pending">待订正题数</option><option value="total">累计错题数</option></select></label><button type="button" class="secondary" data-books>我的错题册</button><button type="button" class="primary" data-make-book disabled>导出 PDF</button></div></div><div class="md-strip"><button aria-label="向左查看 Topic" data-scroll-topics="-1">‹</button><nav class="md-topics" aria-label="按 Topic 选择"></nav><button aria-label="向右查看 Topic" data-scroll-topics="1">›</button></div><div class="md-context"><div class="topic-picker"><label class="field"><span class="sr-only">Topic</span><select id="mistake-topic"></select></label><button type="button" class="primary" id="topic-start" hidden>开始订正</button></div><p id="topic-progress" role="status" tabindex="-1" hidden></p><div data-round-feedback></div><details class="mistake-extra"><summary>筛选</summary><div class="learning-filters mistake-nav-filters"><button type="button" data-filter-close aria-label="关闭筛选">关闭</button><label class="field"><span>查找作业或题目</span><input id="mistake-search" type="search" placeholder="作业、知识点或题号"></label><label class="field"><span>复习状态</span><select id="mistake-state"><option value="">全部</option><option value="todo">待订正</option><option value="verified">已订正</option><option value="review">已提交订正</option><option value="mastered">已掌握（自评）</option></select></label></div></details><div class="filter-result-line"><p id="mistake-count" role="status"></p><button type="button" class="text-button" id="clear-mistake-filters">清除筛选</button></div></div><div class="md-panes"><div id="mistakes-list" aria-label="错题列表"></div><section class="md-reader" aria-label="订正工作区"><button type="button" class="md-list-toggle" aria-expanded="true">收起题栏</button><p class="md-idle">选择一道错题，查看原题与上次作答。</p></section></div></section>`;
  bindMistakeNavigation(main);
  $('#mistake-search').value=memory.get('query','');$('#mistake-state').value=memory.get('status','');
  const topicControl=$('#mistake-topic'),startTopic=$('#topic-start'),progress=$('#topic-progress');
  let pendingRows=[],finished=false,needsRefresh=false,lastSaved=null,reviewTimer;
  const filterMenu=$('.mistake-extra'),compactFilter=matchMedia('(max-width:700px)');
  let releaseFilter=null;
  function bindFilters(){
    releaseFilter?.();filterMenu.open=false;
    releaseFilter=compactFilter.matches?bindDisclosureMenus(main,'.mistake-extra'):null;
  }
  bindFilters();compactFilter.addEventListener('change',bindFilters);
  $('[data-filter-close]').onclick=()=>{filterMenu.open=false;filterMenu.querySelector('summary').focus();};
  function setTopicChoices(){
    const scoped=matchingMistakes(data.mistakes,m=>subjectOf(m)===subject);
    const options=mistakeTopicOptions(scoped),counts=topicWorkCounts(scoped);
    topicControl.innerHTML='<option value="all">全部 Topic</option>'+options.map(([topic,title])=>
      `<option value="${topic||'unknown'}">${topic?h('Topic '+topic+(title?' · '+title:'')):'未标注 Topic'} · 待订正 ${counts.get(topic||'unknown').pending}</option>`).join('');
    const saved=memory.get('topic:'+subject,'all');
    // The catalog also contains chapters with zero mistakes. Keep a previously
    // selected one while the separately loaded outline is being resolved.
    if(/^\d+\.\d+$/.test(saved)&&![...topicControl.options].some(o=>o.value===saved))topicControl.add(new Option('Topic '+saved,saved));
    topicControl.value=[...topicControl.options].some(o=>o.value===saved)?saved:'all';
  }
  const desk=mountMistakeDesk(ctx,{onRefresh:()=>{if(!closed&&!busy)void refreshRows();}});
  setTopicChoices();
  function excerpt(m,term){
    if(!term||m.assignmentTitle.toLocaleLowerCase().includes(term.toLocaleLowerCase()))return '';
    const text=[m.knowledge,m.prompt].filter(Boolean).join(' · '),i=text.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
    return i<0?'':'<p class="search-context">'+highlightText((i>16?'…':'')+text.slice(Math.max(0,i-16),i+term.length+25),term)+'</p>';
  }
  const list=$('#mistakes-list');let active=null,busy=false,closed=false;
  const railButton=$('.md-list-toggle'),panes=$('.md-panes');
  function setRail(open){panes.toggleAttribute('data-hide-rail',!open);railButton.setAttribute('aria-expanded',String(open));railButton.textContent=open?'收起题栏':'显示题栏';}
  railButton.onclick=()=>setRail(railButton.getAttribute('aria-expanded')!=='true');
  function selectRow(route){
    if(!active)return;
    active.row.removeAttribute('aria-current');active.trigger.setAttribute('aria-expanded','false');
    active.route=route;
    const link=[...list.querySelectorAll('a[href]')].find(a=>a.hash.slice(1)===route);
    if(!link)return;
    active.row=link.closest('.mistake-row');active.trigger=link;
    active.row.setAttribute('aria-current','true');link.setAttribute('aria-expanded','true');
  }
  let shownRecall='';
  const suggested=document.createElement('div');suggested.className='student-recall-offer';suggested.hidden=true;
  $('.filter-result-line').after(suggested);
  const draw=()=>{
    const term=$('#mistake-search').value.trim(),status=$('#mistake-state').value,topic=topicControl.value;
    const scoped=matchingMistakes(data.mistakes,m=>subjectOf(m)===subject);
    const rows=matchingMistakes(scoped,m=>(topic==='all'||(mistakeTopic(m)||'unknown')===topic) &&
      (!status||(m.progressStatus||m.status)===status) &&
      (!term||[m.assignmentTitle,m.prompt,m.knowledge,m.questionId].join(' ').toLocaleLowerCase().includes(term.toLocaleLowerCase())));
    const due=status==='verified'&&rows.flatMap(r=>[r,...(r.occurrences||[])]).find(r=>r.verification?.status==='passed'&&Date.parse(r.verification.finishedAt)<=Date.now()-3*86400000);
    const suggestionKey=due?JSON.stringify([subject,due.assignmentId,due.questionId]):'';
    if(shownRecall!==suggestionKey){
      shownRecall=suggestionKey;suggested.hidden=!due;suggested.replaceChildren();
      if(due){const holder=document.createElement('div');holder.hidden=true;suggested.append(holder);void mountRecall(holder,api,{assignmentId:due.assignmentId,questionId:due.questionId,course:subject})();}
    }
    const totals=topicWorkCounts(scoped).get(topic)||{pending:0,waiting:0};
    pendingRows=matchingMistakes(rows,needsCorrection);
    progress.hidden=topic==='all';
    progress.textContent=(finished?'本轮进度 · ':'')+'待订正 '+totals.pending+' 题 · 待验收 '+totals.waiting+' 题';
    const last=finished && lastSaved && scoped.flatMap(m=>[m,...(m.occurrences||[])]).find(m=>m.assignmentId===lastSaved.a&&m.questionId===lastSaved.q);
    $('[data-round-feedback]').innerHTML=last && !needsRefresh ? (last.verification?verificationMarkup(last.verification,h):'')+
      (!last.verification||last.verification.status==='passed'?feedbackMarkup(last.correctionFeedback,h):'') : '';
    if(needsRefresh)progress.textContent='进度暂未同步，请重试。';
    startTopic.hidden=topic==='all'||(!pendingRows.length&&!needsRefresh);
    startTopic.textContent=needsRefresh?'重试同步':term||status?'开始筛选出的 '+pendingRows.length+' 题':'开始订正';
    clearTimeout(reviewTimer);
    if(finished && !needsRefresh && totals.waiting){
      const waiting=scoped.flatMap(m=>[m,...(m.occurrences||[])]).filter(m=>(mistakeTopic(m)||'unknown')===topic && ['queued','running','manual'].includes(m.verification?.status)).map(m=>m.verification);
      const sameView=()=>!closed&&!active&&!busy&&finished&&topic===topicControl.value;
      const check=async()=>{
        if(!sameView())return;
        try{
          if(!document.hidden){
            const {updates}=await api('learning/correction-updates?includeMock=1');
            if(!sameView())return;
            const byId=new Map(updates.map(r=>[r.id,r]));
            if(waiting.some(v=>byId.get(v.id)?.revision!==v.revision||byId.get(v.id)?.status!==v.status)){
              const fresh=await api('learning?mistakeBook=1');
              if(sameView()){data.mistakes=fresh.mistakes;setTopicChoices();draw();}
              return;
            }
          }
        }catch{/* Retry while the summary is visible; the displayed counts are the last confirmed ones. */}
        if(sameView())reviewTimer=setTimeout(check,12000);
      };
      reviewTimer=setTimeout(check,6000);
    }
    visibleRows=rows;
    memory.set({query:term,status,['topic:'+subject]:topic});
    const choice=$('#mistake-state').selectedOptions[0];
    filterMenu.querySelector('summary').textContent=['筛选',term,status && choice.textContent].filter(Boolean).join(' · ');
    $('#mistake-count').textContent=rows.length+' / '+scoped.length+' 道'+courseLabel(subject)+'失分题';
    $('#clear-mistake-filters').hidden=!term&&!status&&topic==='all';
    $('#mistakes-list').innerHTML=rows.length?rows.map(m=>`<article class="mistake-row" data-inline-assignment="${h(m.assignmentId)}" data-inline-question="${h(m.questionId)}"><div><h2>${routeLink('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),'第 '+(m.questionNumber ? highlightText(m.questionNumber,term) : highlightText(m.questionId,term))+' 题')}</h2><p class="meta">${highlightText(m.assignmentTitle,term)}${mistakeTopic(m)?' · Topic '+h(mistakeTopic(m)):''}</p>${m.mistakeCount>1?`<details class="mistake-occurrences"><summary>${m.mistakeCount} 次失分 · 查看其他作答</summary>${m.occurrences.map(r=>link('mistakes/'+encodeURIComponent(r.assignmentId)+'/'+encodeURIComponent(r.questionId),h(r.assignmentTitle+' · '+date(r.publishedAt)+' · '+r.score+'/'+r.maxPoints),'text-button')).join('')}</details>`:''}${excerpt(m,term)}${m.feedback?`<p class="mistake-feedback">${h(m.feedback)}</p>`:""}</div><div class="actions"><span class="badge">${({todo:'待订正',verified:'已订正',review:m.verification?'待验收':'已提交订正',mastered:'已掌握（自评）'})[m.progressStatus||m.status]||'待订正'}</span><span class="question-score">${m.score}/${m.maxPoints}</span></div></article>`).join(''):`<div class="empty"><h2>${data.mistakes.length?'没有匹配的错题':'这里收集每次作业的失分题'}</h2><p>${data.mistakes.length?'调整筛选条件，再找一次。':'成绩返回后，失分题会自动保存。满分作业不会增加错题。'}</p>${link('assignments','查看作业','primary')}</div>`;desk.update(rows,scoped,subject);if(active)selectRow(active.route);};
  draw();

  const courseControls=$$('[data-mistake-course]');
  const filters=[...courseControls,topicControl,startTopic,$('#mistake-search'),$('#mistake-state'),$('#clear-mistake-filters')].filter(Boolean);
  async function refreshRows(){
    try{
      const fresh=await api('learning?mistakeBook=1');if(closed)return;
      data.mistakes=fresh.mistakes;needsRefresh=false;setTopicChoices();draw();
    }catch(e){if(!closed){needsRefresh=true;draw();toast(e.message);}}
  }
  async function closeInline({refresh=false,focus=true}={}){
    const previous=active;if(!previous)return;await previous.local.correctionNavigation?.();if(active!==previous)return;active=null;setRail(true);
    previous.local.routeVersion++;previous.local.viewCleanup?.();previous.host.remove();previous.row.removeAttribute('aria-current');previous.trigger.setAttribute('aria-expanded','false');
    if(refresh||previous.saved)await refreshRows();
    if(focus){list.scrollTop=previous.listTop;const target=previous.trigger.isConnected?previous.trigger:[...list.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===previous.trigger.getAttribute('href'));target?.scrollIntoView({block:'nearest',behavior:'instant'});target?.focus({preventScroll:true});}
  }
  $('.mistake-views').onclick=async e=>{
    const target=e.target.closest('a[href]');
    if(!target||target.hasAttribute('aria-current')||e.ctrlKey||e.shiftKey||e.metaKey||e.altKey)return;
    memory.set({top:main.scrollTop});
    if(!active)return;
    e.preventDefault();
    if(busy)return;
    busy=true;
    try{await closeInline({focus:false});location.hash=target.hash;}
    catch(error){toast(error.message);}
    finally{busy=false;}
  };
  const filterDraw=async()=>{
    if(busy)return;
    busy=true;
    try{
      finished=false;draw();
      if(active&&!active.row.isConnected)await closeInline({focus:false});
    }catch(e){toast(e.message);}
    finally{busy=false;}
  };
  for(const button of courseControls)button.onclick=async()=>{
    if(busy||subject===button.dataset.mistakeCourse)return;
    busy=true;
    try{
      await closeInline({focus:false});
      finished=false;subject=button.dataset.mistakeCourse;rememberCourse(state.user.id,subject);
      courseControls.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      setTopicChoices();draw();
    }catch(e){toast(e.message);}finally{busy=false;}
  };
  $('#mistake-search').oninput=filterDraw;$('#mistake-state').onchange=filterDraw;topicControl.onchange=filterDraw;
  $('#clear-mistake-filters').onclick=async()=>{if(busy)return;busy=true;try{await closeInline({focus:false});$('#mistake-search').value='';$('#mistake-state').value='';topicControl.value='all';finished=false;draw();$('#mistake-search').focus();}catch(e){toast(e.message);}finally{busy=false;}};
  async function openRow(trigger,round=false){
    let row=trigger?.closest('[data-inline-assignment]');
    if(!row||busy)return;finished=false;clearTimeout(reviewTimer);busy=true;filters.forEach(f=>f.disabled=true);
    try{
      if(!round&&active?.route===trigger.hash.slice(1)){await closeInline();return;}
      const href=trigger.getAttribute('href');
      await closeInline({focus:false});if(closed)return;
      if(!row.isConnected){trigger=[...list.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===href);row=trigger?.closest('[data-inline-assignment]');if(!row)return;}
      const host=document.createElement('div');host.className='mistake-inline';host.setAttribute('aria-label','原题与订正');host.innerHTML='<p role="status">正在打开原题与订正…</p>';$('.md-reader').append(host);
      const local={...state,routeVersion:0,viewCleanup:null,restoreView:null,correctionNavigation:null};active={host,row,trigger,local,listTop:list.scrollTop};
      // Keep the filtered order for this session, including the particular occurrence opened.
      const start=trigger.hash.slice(1).split('/').map(decodeURIComponent);
      const topicQueue=round?pendingRows:topicControl.value==='all'?null:visibleRows.map(item=>
        [item,...(item.occurrences||[])].find(r=>r.assignmentId===start[1] && r.questionId===start[2]) || item);
      const topicLabel=topicControl.value==='unknown'?'未标注 Topic':'Topic '+topicControl.value;
      const open=async(route)=>{if(closed||active?.host!==host)return;local.viewCleanup?.();const version=++local.routeVersion;local.viewCleanup=null;local.correctionNavigation=null;const [,a,q]=route.split('/').map(decodeURIComponent);
        host.innerHTML='<p role="status">正在打开原题与订正…</p>';
        selectRow(route);
        const last=round&&topicQueue.at(-1)?.assignmentId===a&&topicQueue.at(-1)?.questionId===q;
        const child=createLearningUI({...ctx,main:host,state:local,topicQueue,topicLabel,finishTopic:last,go:r=>void open(r).catch(e=>toast(e.message)),link:(r,t,c)=>r==='mistakes'?'<button type="button" class="secondary" data-inline-close>收起订正</button>':link(r,t,c),onCorrectionSaved:async(next,mode)=>{if(closed||active?.host!==host||version!==local.routeVersion)return;
          active.saved=true;
          if(last){finished=true;lastSaved={a,q};await closeInline({focus:false,refresh:true});if(!closed){progress.focus();progress.scrollIntoView({block:'nearest'});}}
          else if(mode==='next'&&next)await open(next);}});
        try{await child.mistakes(a,q);}catch(error){
          if(closed||active?.host!==host||version!==local.routeVersion)return;
          host.innerHTML=`<p role="alert">${h(error.message)}</p><button type="button" class="secondary" data-retry>重试</button><button type="button" class="text-button" data-inline-close>收起订正</button>`;
          host.querySelector('[data-retry]').onclick=()=>open(route);
        }
        if(closed||active?.host!==host||version!==local.routeVersion)return;focusCorrection(host);const close=host.querySelector('[data-inline-close]');if(close)close.onclick=async()=>{try{await closeInline();}catch(e){toast(e.message);}};
      };
      await open(trigger.getAttribute('href').slice(1));
    }catch(e){toast(e.message);if(active&&!active.local.correctionNavigation){active.local.viewCleanup?.();active.host.remove();active.row.removeAttribute('aria-current');active.trigger.setAttribute('aria-expanded','false');active=null;}}
    finally{busy=false;filters.forEach(f=>f.disabled=false);}
  }
  startTopic.onclick=async()=>{
    if(busy)return;
    if(needsRefresh){busy=true;try{await refreshRows();}finally{busy=false;}return;}
    if(active){busy=true;try{await closeInline({focus:false});}catch(e){toast(e.message);return;}finally{busy=false;}}
    const first=pendingRows[0];if(!first||closed)return;
    const route='#mistakes/'+first.assignmentId+'/'+encodeURIComponent(first.questionId);
    const trigger=[...list.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===route);
    finished=false;await openRow(trigger,true);
  };
  list.addEventListener('click',e=>{
    const row=e.target.closest('[data-inline-assignment]');
    if(!row||e.target.closest('input,button,details,summary'))return;
    const trigger=e.target.closest('a[href]')||row.querySelector('h2 a[href]');
    if(!trigger)return;
    memory.set({selected:trigger.getAttribute('href'),top:main.scrollTop});
    if(trigger.target==='_blank'||!trigger.hash.startsWith('#mistakes/')||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();void openRow(trigger);
  });
  state.viewCleanup=()=>{closed=true;releaseFilter?.();compactFilter.removeEventListener('change',bindFilters);desk.destroy();clearTimeout(reviewTimer);if(active){active.local.routeVersion++;active.local.viewCleanup?.();active=null;}};
  state.restoreView=()=>{main.scrollTo({top:memory.get('top',0),behavior:'instant'});const a=[...list.querySelectorAll('a')].find(a=>a.getAttribute('href')===memory.get('selected',''));a?.focus({preventScroll:true});};
 }
 return {gradebook,overview,mistakes};
}
