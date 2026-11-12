import {scoreBadge,scoreLegend} from './score-bands.js';
import {viewMemory} from './view-memory.js';
import {mountCorrectionReference} from './correction-workspace.js';
import {showAssignmentRoster} from './assignment-roster.js';
import {highlightText} from './search-text.js';
import {assignmentRecords,gradeSummary,questionTotals} from './learning-model.js';
export function createLearningUI(ctx){
 const {state,main,api,put,h,head,link,badge,date,formHandler,area,field,toast,go,uploadWidget,metadata,fileMarkup,bindPreviews}=ctx;
 const $=(s,r=main)=>r.querySelector(s), $$=(s,r=main)=>[...r.querySelectorAll(s)];
 const pct=g=>g?.maxPoints?Math.round(g.total/g.maxPoints*1000)/10:null;
 const routeLink=(route,text,cls='text-button')=>link(route,text,cls);
 async function load(){const v=state.routeVersion;const data=await api('learning');if(v!==state.routeVersion)return null;return data;}
 function trend(records){
  const values=records.filter(r=>r.grade?.maxPoints>0).slice(0,8).reverse();
  if(values.length<2)return '<p class="hint">完成两次作业后，这里会显示成绩变化。</p>';
  const points=values.map((r,i)=>({x:35+i*280/(values.length-1),y:130-pct(r.grade),rate:pct(r.grade),title:r.assignment.title}));
  return `<figure class="grade-trend"><figcaption>最近 ${values.length} 次作业得分率</figcaption><svg viewBox="0 0 350 160" role="img" aria-label="${h(points.map(p=>p.title+' '+p.rate+'%').join('；'))}">${[0,50,100].map(n=>`<path class="chart-grid" d="M35 ${130-n}H325"/><text x="2" y="${134-n}">${n}</text>`).join('')}<path class="chart-line" d="${points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')}"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="3"/><text x="${p.x}" y="${p.y-10}" text-anchor="middle">${p.rate}%</text>`).join('')}</svg></figure>`;
 }
 function recordsMarkup(records,teacher=false){
  return records.length?`<div class="grade-list">${records.map(r=>`<article class="grade-row"><div><h3>${routeLink((teacher?'review/':'result/')+(r.effective?.id||r.latest.id),h(r.assignment.title||'作业'))}</h3><div class="meta"><span>${h(r.assignment.course||'')}</span><span>${date(r.latest.submittedAt)}</span>${r.latest.late?'<span>迟交</span>':''}${r.pendingUpdate?'<span class="review-text">新提交待更新</span>':''}</div></div><div class="grade-value">${r.grade?`${r.grade.total}<span>/${r.grade.maxPoints}</span><small>${pct(r.grade)}%</small>`:badge(r.latest.status)}</div><details class="attempts"><summary>${r.attempts.length} 次提交</summary>${r.attempts.map(s=>`<div>${routeLink((teacher?'review/':'result/')+s.id,date(s.submittedAt))} ${badge(s.status)}</div>`).join('')}</details></article>`).join('')}</div>`:`<div class="empty"><h3>${teacher?'该学生还没有提交记录':'成绩会保存在这里'}</h3><p>${teacher?'提交后可在这里查看每次作业的成绩与原件。未提交不计零分。':'提交第一份作业后，进度和成绩会进入你的档案。'}</p>${link('assignments','查看作业','primary')}</div>`;
 }
 function profile(student,records,teacher){
  const summary=gradeSummary(records);
  return `<div class="profile-heading"><h2>${h(student.name||'我的成绩档案')}</h2><p class="muted">${summary.count} 次已出成绩</p></div><div class="profile-metrics"><div>${scoreBadge(summary.average)}<span>平均得分率</span></div><div><strong>${summary.wrong}</strong><span>当前失分题</span></div></div>${trend(records)}<p class="hint">按每次作业得分率等权平均，待批阅不计零分。</p>${scoreLegend()}${recordsMarkup(records,teacher)}`;
 }
 async function gradebook(studentId){
  const data=await load();if(!data)return;const teacher=state.user.role==='teacher';
  const records=assignmentRecords(data.submissions,data.assignments);
  if(!teacher){main.innerHTML=`<section class="paper">${head('','我的成绩','每次提交、每次进步，都保存在这里。',link('assignments','查看作业'))}<div class="archive-layout"><section>${profile(state.user,records,false)}</section><aside class="archive-next"><h2>从错误点继续</h2><p class="muted">失分题已按作业整理，你可以查看原作答、记录订正，再回顾一次。</p>${link('mistakes','打开错题集','primary')}</aside></div></section>`;return;}
  const chosen=data.students.find(u=>u.id===studentId)||data.students[0];
  main.innerHTML=`<section class="paper">${head('','学生学情','从每次作业，看到每个学生的变化。',link('assignments','返回作业'))}<div class="learning-filters"><label class="field"><span>查找学生</span><input id="student-search" type="search" placeholder="姓名或账号" autocomplete="off"></label><label class="field"><span>班级</span><select id="class-filter"><option value="">全部已有班级</option>${state.classes.map(c=>`<option value="${h(c.id)}">${h(c.name)}</option>`).join('')}</select></label></div><div class="mobile-student-picker"><label class="field"><span id="student-picker-label">选择学生</span><select id="student-picker" aria-labelledby="student-picker-label"></select></label><button type="button" class="secondary" id="student-prev" aria-label="上一位学生">上一位</button><button type="button" class="secondary" id="student-next" aria-label="下一位学生">下一位</button></div><div class="learning-layout"><section class="roster" aria-label="学生名单"></section><section class="student-profile" aria-label="学生档案"></section></div></section>`;
  let selected=chosen;
  if(state.workspaceClassId){$('#class-filter').value=state.workspaceClassId;$('#class-filter').closest('label').hidden=true;}
  const draw=()=>{const term=$('#student-search').value.trim(),cls=$('#class-filter').value;const roster=data.students.filter(u=>(!cls||u.classIds.includes(cls))&&[u.name,u.username||''].some(v=>v.toLocaleLowerCase().includes(term.toLocaleLowerCase())));if(!roster.some(u=>u.id===selected?.id))selected=roster[0];
    $('.roster').innerHTML=roster.length?roster.map(u=>{const r=records.filter(x=>x.studentId===u.id),sum=gradeSummary(r);return `<button class="student-line ${selected?.id===u.id?'selected':''}" data-student="${h(u.id)}" aria-pressed="${selected?.id===u.id}"><span>${highlightText(u.name,term)}${u.username?`<small>${highlightText(u.username,term)}</small>`:''}${u.historical?'<small>历史作业</small>':''}</span><span>${sum.count} 次<small>${scoreBadge(sum.average)}</small></span></button>`;}).join(''):'<p class="empty-inline">没有匹配的学生，请调整姓名或班级。</p>';
    const picker=$('#student-picker');picker.innerHTML=roster.length?roster.map(u=>`<option value="${h(u.id)}" ${u.id===selected?.id?'selected':''}>${h(u.name)}${u.username?' · '+h(u.username):''}</option>`).join(''):'<option>没有匹配的学生</option>';picker.disabled=!roster.length;
    $('#student-picker-label').textContent='选择学生 · '+roster.length+' 人';
    const index=roster.findIndex(u=>u.id===selected?.id);
    for(const [id,step]of [['student-prev',-1],['student-next',1]]){const button=$('#'+id);button.disabled=index<0||index+step<0||index+step>=roster.length;button.onclick=()=>{selected=roster[index+step];draw();$('#'+id).focus({preventScroll:true});};}
    picker.onchange=()=>{selected=roster.find(u=>u.id===picker.value);draw();picker.focus({preventScroll:true});};
    $('.student-profile').innerHTML=selected?profile(selected,records.filter(r=>r.studentId===selected.id),true):(data.students.length?'<p class="empty-inline">调整筛选后，再选择学生查看档案。</p>':'<div class="empty"><h2>班级学生会显示在这里</h2><p>学生使用 Bookself 班级码注册后，无需再次加入。</p></div>');
    $$('[data-student]').forEach(b=>b.onclick=()=>{selected=data.students.find(u=>u.id===b.dataset.student);draw();if(innerWidth<900)$('.student-profile').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});});};
  $('#student-search').oninput=draw;$('#class-filter').onchange=draw;draw();
 }
 async function overview(id,filter){return showAssignmentRoster(ctx,id,filter);}
 function correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute){
  const status=$('#correction-draft-status'),conflictBox=$('#correction-conflict');
  const key=`hw-correction:${state.user.id}:${m.assignmentId}:${m.questionId}`;
  let revision=remote?.revision||0,dirty=Boolean(cached),change=0,timer,writing=Promise.resolve(),done=false,conflict=false,mutationId=cached?.mutationId||crypto.randomUUID();
  let finalId=crypto.randomUUID();
  const snapshot=()=>({correction:form.elements.correction.value,note:form.elements.note.value,status:form.elements.status.value,files:[...up.ids()],mutationId});
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
  formHandler(form,async()=>{if(up.busy())throw Error('请等待附件上传完成');if(up.pending())throw Error('还有文件未添加，请重试或选择不添加后再保存订正。');if(conflict)throw Error('请先选择要继续编辑的草稿版本。');clearTimeout(timer);const controls=[...form.elements].map(el=>({el,disabled:el.disabled}));controls.forEach(({el})=>el.disabled=true);try{await writing.catch(()=>{});if(dirty)await save();await put(endpoint,{...snapshot(),revision:m.revision,draftRevision:revision,mutationId:finalId});done=true;sessionStorage.removeItem(key);toast('订正已保存，原成绩保留');if(form.isConnected)go(form.dataset.afterSave==='next'&&nextRoute?nextRoute:'mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId));}catch(e){if(e.status===409)await showConflict();throw e;}finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}});
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
    const ids=[...m.corrections.flatMap(c=>c.files||[]),...(initial.files||[])];await metadata(ids);if(v!==state.routeVersion)return;
    const inAssignment=data.mistakes.filter(x=>x.assignmentId===m.assignmentId),index=inAssignment.findIndex(x=>x.questionId===m.questionId),next=inAssignment[index+1];
    const route=x=>'mistakes/'+x.assignmentId+'/'+encodeURIComponent(x.questionId),nextRoute=next?route(next):null;
    main.innerHTML=`<section class="paper correction-workspace">${head('',`第 ${m.questionId} 题 · 订正`,m.assignmentTitle,link('mistakes','返回错题集'))}<div class="correction-heading-info"><strong>原得分 ${m.score} / ${m.maxPoints}</strong><span>订正不改变原成绩</span>${m.knowledge?`<span>${h(m.knowledge)}</span>`:''}</div><div class="correction-layout"><section class="correction-reference" aria-label="原题与作答参考"></section><section class="correction-editor"><h2>写下新的解题思路</h2>${m.feedback?`<details><summary>老师反馈</summary><p class="instructions">${h(m.feedback)}</p></details>`:''}<form id="correction-form" class="stack">${area('我的订正答案','correction',initial.correction,'placeholder="对照原题，按题号写下修改后的答案…" maxlength="10000"')}<details class="correction-attachments" ${(initial.files||[]).length?'open':''}><summary>拍照或添加订正附件</summary><div id="correction-upload"></div></details><details ${initial.note?'open':''}><summary>复习笔记（可选）</summary>${area('下次要记住什么','note',initial.note,'maxlength="5000"')}</details><label class="field"><span>复习状态</span><select name="status">${[['todo','待订正'],['review','待复习'],['mastered','我已掌握']].map(([v,t])=>`<option value="${v}" ${initial.status===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="draft-feedback" id="correction-draft-status" role="status">${cached?'已恢复此设备的订正草稿。':remote&&!remote.cleared?'已恢复账户订正草稿。':'输入后自动保存草稿。'}</p><div id="correction-conflict" class="draft-conflict" hidden></div><p class="form-error" role="alert"></p><div class="correction-save-actions"><button class="${next?'secondary':'primary'}" type="submit" data-correction-save="stay">保存订正</button>${next?'<button class="primary" type="submit" data-correction-save="next">保存并下一题</button>':''}</div></form><nav class="correction-question-nav" aria-label="同一作业的错题"><button type="button" class="text-button" data-correction-nav="prev" ${index===0?'disabled':''}>上一题</button><span>本次作业 ${index+1} / ${inAssignment.length} 道失分题</span><button type="button" class="text-button" data-correction-nav="next" ${next?'':'disabled'}>下一题</button></nav></section></div></section>`;
    const form=$('#correction-form');form.addEventListener('submit',e=>{form.dataset.afterSave=e.submitter?.dataset.correctionSave||'stay';},true);
    let autosave;const up=uploadWidget($('#correction-upload'),'submission',initial.files||[],()=>autosave?.changed());bindPreviews();
    autosave=correctionDraft(form,up,m,initial,remote,cached,endpoint,nextRoute);
    const reference=mountCorrectionReference($('.correction-reference'),{mistake:m,state,api,metadata,h,fileMarkup,bindPreviews,date});
    const cleanup=state.viewCleanup;state.viewCleanup=()=>{reference.destroy();cleanup?.();};
    for(const [direction,target]of [['prev',inAssignment[index-1]],['next',next]])$('[data-correction-nav='+direction+']').onclick=async e=>{if(!target)return;const button=e.currentTarget;button.disabled=true;try{await autosave.flush();go(route(target));}catch(error){toast(error.message);button.disabled=false;}};
    return;
  }
  const memory=viewMemory(state.user.id+':mistakes');
  main.innerHTML=`<section class="paper">${head('','我的错题集','先看错误点，再整理自己的解题思路。',link('grades','成绩档案'))}<div class="learning-filters"><label class="field"><span>查找作业或题目</span><input id="mistake-search" type="search" placeholder="作业、知识点或题号"></label><label class="field"><span>复习状态</span><select id="mistake-state"><option value="">全部</option><option value="todo">待订正</option><option value="review">待复习</option><option value="mastered">已掌握</option></select></label></div><div class="filter-result-line"><p id="mistake-count" role="status"></p><button type="button" class="text-button" id="clear-mistake-filters">清除筛选</button></div><div id="mistakes-list"></div></section>`;
  $('#mistake-search').value=memory.get('query','');$('#mistake-state').value=memory.get('status','');
  const draw=()=>{const term=$('#mistake-search').value.trim(),status=$('#mistake-state').value,rows=data.mistakes.filter(m=>(!status||m.status===status)&&(!term||[m.assignmentTitle,m.prompt,m.knowledge,m.questionId].join(' ').toLocaleLowerCase().includes(term.toLocaleLowerCase())));
    memory.set({query:term,status});$('#mistake-count').textContent=rows.length+' / '+data.mistakes.length+' 道失分题';$('#clear-mistake-filters').hidden=!term&&!status;
    $('#mistakes-list').innerHTML=rows.length?rows.map(m=>`<article class="mistake-row"><div><h2>${routeLink('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),'第 '+highlightText(m.questionId,term)+' 题')}</h2><p class="meta">${highlightText(m.assignmentTitle,term)} · ${h(m.course)}</p>${term?`<p class="search-context">${highlightText([m.knowledge,m.prompt].filter(Boolean).join(" · "),term)}</p>`:""}${m.feedback?`<p class="mistake-feedback">${h(m.feedback)}</p>`:""}</div><div class="actions"><span class="badge">${({todo:'待订正',review:'待复习',mastered:'已掌握'})[m.status]}</span><span class="question-score">${m.score}/${m.maxPoints}</span>${link('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),m.draftUpdatedAt?'继续订正草稿':'回看与订正','primary')}</div></article>`).join(''):`<div class="empty"><h2>${data.mistakes.length?'没有匹配的错题':'这里收集每次作业的失分题'}</h2><p>${data.mistakes.length?'调整筛选条件，再找一次。':'成绩返回后，失分题会自动保存。满分作业不会增加错题。'}</p>${link('assignments','查看作业','primary')}</div>`;};
  $('#mistake-search').oninput=draw;$('#mistake-state').onchange=draw;$('#clear-mistake-filters').onclick=()=>{$('#mistake-search').value='';$('#mistake-state').value='';draw();$('#mistake-search').focus();};draw();
  const list=$('#mistakes-list');list.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a)memory.set({selected:a.getAttribute('href'),top:main.scrollTop});});
  state.restoreView=()=>{main.scrollTo({top:memory.get('top',0),behavior:'instant'});const a=[...list.querySelectorAll('a')].find(a=>a.getAttribute('href')===memory.get('selected',''));a?.focus({preventScroll:true});};
 }
 return {gradebook,overview,mistakes};
}
