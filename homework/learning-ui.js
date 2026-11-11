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
  return records.length?`<div class="grade-list">${records.map(r=>`<article class="grade-row"><div><h3>${routeLink((teacher?'review/':'result/')+(r.effective?.id||r.latest.id),h(r.assignment.title||'作业'))}</h3><div class="meta"><span>${h(r.assignment.course||'')}</span><span>${date(r.latest.submittedAt)}</span>${r.latest.late?'<span>迟交</span>':''}${r.pendingUpdate?'<span class="review-text">新提交待更新</span>':''}</div></div><div class="grade-value">${r.grade?`${r.grade.total}<span>/${r.grade.maxPoints}</span><small>${pct(r.grade)}%</small>`:badge(r.latest.status)}</div><details class="attempts"><summary>${r.attempts.length} 次提交</summary>${r.attempts.map(s=>`<div>${routeLink((teacher?'review/':'result/')+s.id,date(s.submittedAt))} ${badge(s.status)}</div>`).join('')}</details></article>`).join('')}</div>`:'<div class="empty"><h2>成绩会保存在这里</h2><p>提交第一份作业后，进度和反馈会自动进入你的档案。</p>'+link('assignments','查看作业','primary')+'</div>';
 }
 function profile(student,records,teacher){
  const summary=gradeSummary(records);
  return `<div class="profile-heading"><h2>${h(student.name||'我的成绩档案')}</h2><p class="muted">${summary.count} 次已出成绩</p></div><div class="profile-metrics"><div><strong>${summary.average??'—'}${summary.average==null?'':'<small>%</small>'}</strong><span>平均得分率</span></div><div><strong>${summary.wrong}</strong><span>当前失分题</span></div></div>${trend(records)}<p class="hint">按每次作业得分率等权平均，待批阅不计零分。</p>${recordsMarkup(records,teacher)}`;
 }
 async function gradebook(studentId){
  const data=await load();if(!data)return;const teacher=state.user.role==='teacher';
  const records=assignmentRecords(data.submissions,data.assignments);
  if(!teacher){main.innerHTML=`<section class="paper">${head('','我的成绩','每次提交、每次进步，都保存在这里。',link('assignments','查看作业'))}<div class="archive-layout"><section>${profile(state.user,records,false)}</section><aside class="archive-next"><h2>从错误点继续</h2><p class="muted">失分题已按作业整理，你可以查看原作答、记录订正，再回顾一次。</p>${link('mistakes','打开错题集','primary')}</aside></div></section>`;return;}
  const chosen=data.students.find(u=>u.id===studentId)||data.students[0];
  main.innerHTML=`<section class="paper">${head('','学生学情','从每次作业，看到每个学生的变化。',link('assignments','返回作业'))}<div class="learning-filters"><label class="field"><span>查找学生</span><input id="student-search" type="search" placeholder="输入姓名" autocomplete="off"></label><label class="field"><span>班级</span><select id="class-filter"><option value="">全部已有班级</option>${state.classes.map(c=>`<option value="${h(c.id)}">${h(c.name)}</option>`).join('')}</select></label></div><div class="learning-layout"><section class="roster" aria-label="学生名单"></section><section class="student-profile" aria-label="学生档案"></section></div></section>`;
  let selected=chosen;
  if(state.workspaceClassId){$('#class-filter').value=state.workspaceClassId;$('#class-filter').closest('label').hidden=true;}
  const draw=()=>{const term=$('#student-search').value.trim(),cls=$('#class-filter').value;const roster=data.students.filter(u=>(!cls||u.classIds.includes(cls))&&u.name.includes(term));if(!roster.some(u=>u.id===selected?.id))selected=roster[0];
    $('.roster').innerHTML=roster.length?roster.map(u=>{const r=records.filter(x=>x.studentId===u.id),sum=gradeSummary(r);return `<button class="student-line ${selected?.id===u.id?'selected':''}" data-student="${h(u.id)}" aria-pressed="${selected?.id===u.id}"><span>${h(u.name)}${u.historical?'<small>历史作业</small>':''}</span><span>${sum.count} 次<small>${sum.average==null?'尚无成绩':sum.average+'%'}</small></span></button>`;}).join(''):'<p class="empty-inline">没有匹配的学生，请调整姓名或班级。</p>';
    $('.student-profile').innerHTML=selected?profile(selected,records.filter(r=>r.studentId===selected.id),true):(data.students.length?'<p class="empty-inline">调整筛选后，再选择学生查看档案。</p>':'<div class="empty"><h2>班级学生会显示在这里</h2><p>学生使用 Bookself 班级码注册后，无需再次加入。</p></div>');
    $$('[data-student]').forEach(b=>b.onclick=()=>{selected=data.students.find(u=>u.id===b.dataset.student);draw();if(innerWidth<900)$('.student-profile').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});});};
  $('#student-search').oninput=draw;$('#class-filter').onchange=draw;draw();
 }
 async function overview(id){
  const data=await load();if(!data)return;const a=state.assignments.find(a=>a.id===id);if(!a)throw Error('这份作业不存在或无权查看');
  const records=assignmentRecords(data.submissions,data.assignments),current=records.filter(r=>r.assignmentId===id);
  const roster=data.students.filter(u=>u.classIds?.some(c=>a.classIds.includes(c))||current.some(r=>r.studentId===u.id));
  const review=r=>r?.latest.status==='needs_review'||r?.latest.reviewRequests?.some(q=>q.status==='open');
  const counts={submitted:current.length,graded:current.filter(r=>r.grade).length,review:current.filter(review).length,missing:roster.filter(u=>!current.some(r=>r.studentId===u.id)).length};
  let selected=current.find(r=>r.grade)?.studentId||roster[0]?.id;
  main.innerHTML=`<section class="paper">${head('',a.title,`${h(a.course)} · ${a.rubric?.length||0} 道题 · 满分 ${(a.rubric||[]).reduce((n,q)=>n+q.maxPoints,0)} 分`,link('answer/'+a.id,'题目与答案')+link('new','发布作业','primary'))}<div class="assignment-context"><span>${a.classIds.map(c=>h(state.classes.find(x=>x.id===c)?.name||'班级')).join(' · ')}</span><span>答案 v${a.version} 已确认</span><span>${a.gradingMode==='auto'?'自动批阅并返回':'教师复核后发布'}</span></div><div class="work-overview"><section><div class="stat-strip"><div><strong>${counts.submitted}/${roster.length}</strong><span>已提交</span></div><div><strong>${counts.graded}</strong><span>已出成绩</span></div><div><strong>${counts.review}</strong><span>待复核</span></div><div><strong>${counts.missing}</strong><span>未提交</span></div></div><div class="filter-tabs" role="group" aria-label="提交状态">${[['all','全部'],['graded','已出成绩'],['review','待复核'],['missing','未提交']].map(([k,l])=>`<button data-filter="${k}" aria-pressed="${k==='all'}">${l}</button>`).join('')}</div><div id="overview-table"></div><form id="assignment-settings" class="stack assignment-settings"><details><summary>截止时间与提交设置</summary><div class="stack">${field('截止时间','dueAt',a.dueAt?new Date(new Date(a.dueAt).getTime()-new Date(a.dueAt).getTimezoneOffset()*60000).toISOString().slice(0,16):'','datetime-local')}<label class="field"><span>成绩返回</span><select name="gradingMode"><option value="auto" ${a.gradingMode==='auto'?'selected':''}>自动批阅并返回，异常转复核</option><option value="manual" ${a.gradingMode!=='auto'?'selected':''}>全部由教师复核后发布</option></select></label><label class="check"><input name="allowLate" type="checkbox" ${a.allowLate?'checked':''}>允许截止后补交</label><label class="check"><input name="allowResubmit" type="checkbox" ${a.allowResubmit!==false?'checked':''}>允许重新提交</label><p class="form-error" role="alert"></p><button class="secondary" type="submit">保存设置</button></div></details></form></section><aside class="student-profile" id="selected-profile"></aside></div></section>`;
  let filter='all';const draw=()=>{const shown=roster.filter(u=>{const r=current.find(r=>r.studentId===u.id);return filter==='all'||filter==='missing'&&!r||filter==='review'&&review(r)||filter==='graded'&&r?.grade;});
    $('#overview-table').innerHTML=shown.length?`<table class="submission-table"><thead><tr><th>学生</th><th>状态</th><th>成绩</th><th>操作</th></tr></thead><tbody>${shown.map(u=>{const r=current.find(r=>r.studentId===u.id);return `<tr class="${selected===u.id?'selected':''}"><td><button class="text-button" data-student="${h(u.id)}">${h(u.name)}</button></td><td>${r?badge(r.latest.status):'<span class="badge">未提交</span>'}${review(r)?'<span class="hint">需处理</span>':''}</td><td>${r?.grade?`${r.grade.total}/${r.grade.maxPoints}`:'—'}</td><td>${r?routeLink('review/'+r.latest.id,review(r)?'处理':'查看'):'—'}</td></tr>`;}).join('')}</tbody></table>`:'<p class="empty-inline">这个分类目前没有学生。</p>';
    const student=roster.find(u=>u.id===selected),studentRecords=records.filter(r=>r.studentId===selected);
    $('#selected-profile').innerHTML=student?profile(student,studentRecords,true)+link('gradebook/'+student.id,'完整成绩档案'):'<p class="empty-inline">学生加入班级后会显示在这里。</p>';
    $$('[data-student]').forEach(b=>b.onclick=()=>{selected=b.dataset.student;draw();if(innerWidth<1050)$('#selected-profile').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});});};
  $$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();});draw();
  formHandler($('#assignment-settings'),async b=>{b.allowLate=$('[name=allowLate]').checked;b.allowResubmit=$('[name=allowResubmit]').checked;if(b.dueAt)b.dueAt=new Date(b.dueAt).toISOString();await put('assignments/'+id+'/settings',b);toast('作业设置已保存');go('overview/'+id);});
 }
 function correctionDraft(form,up,m,initial,remote,cached,endpoint){
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
  formHandler(form,async()=>{if(up.busy())throw Error('请等待附件上传完成');if(up.pending())throw Error('还有文件未添加，请重试或选择不添加后再保存订正。');if(conflict)throw Error('请先选择要继续编辑的草稿版本。');clearTimeout(timer);const controls=[...form.elements].map(el=>({el,disabled:el.disabled}));controls.forEach(({el})=>el.disabled=true);try{await writing.catch(()=>{});if(dirty)await save();await put(endpoint,{...snapshot(),revision:m.revision,draftRevision:revision,mutationId:finalId});done=true;sessionStorage.removeItem(key);toast('订正已保存，原成绩保留');if(form.isConnected)go('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId));}catch(e){if(e.status===409)await showConflict();throw e;}finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}});
  if(cached&&(cached.noteRevision!==m.revision||(cached.revision!==revision&&cached.mutationId!==remote?.mutationId)))void showConflict();
  else if(dirty)online();
  return {changed};
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
    main.innerHTML=`<section class="paper">${head('',`第 ${m.questionId} 题`,m.assignmentTitle,link('mistakes','返回错题集'))}<div class="split"><section><h2>回看这道题</h2><p class="instructions">${h(m.prompt||'题目见作业原件。')}</p><div class="question-feedback"><strong>${m.score} / ${m.maxPoints}</strong><p>${h(m.feedback)}</p><p class="hint">作答依据：${h(m.evidence)}</p></div>${link('result/'+m.submissionId,'查看原作答')}${m.paper?.questionFiles?.length?link('paper/'+m.submissionId+'/'+encodeURIComponent(m.questionId),'定位到原题'):''}<details class="correction-history" ${innerWidth>760?'open':''}><summary>我的订正记录（${m.corrections.length}）</summary>${m.corrections.map(c=>`<article class="correction"><p class="hint">${date(c.createdAt)}</p><p class="instructions">${h(c.text)}</p>${fileMarkup(c.files||[])}</article>`).join('')||'<p class="muted">还没有订正。先回看错误点，再写下新的思路。</p>'}</details></section><section><h2>再想一次</h2><form id="correction-form" class="stack">${area('这次的思路与答案','correction',initial.correction,'placeholder="说明你修改了哪里，为什么这样改…" maxlength="10000"')}<div id="correction-upload"></div>${area('复习笔记','note',initial.note,'maxlength="5000"')}<label class="field"><span>复习状态</span><select name="status">${[['todo','待订正'],['review','待复习'],['mastered','我已掌握']].map(([v,t])=>`<option value="${v}" ${initial.status===v?'selected':''}>${t}</option>`).join('')}</select></label><p class="hint">订正会保留原成绩。写完后先进入待复习，再检查自己是否真正理解。</p><p class="draft-feedback" id="correction-draft-status" role="status">${cached?'已恢复这台设备上未完成的订正。':remote&&!remote.cleared?'已恢复账户订正草稿。':'填写后自动保存草稿，方便下次继续。'}</p><div id="correction-conflict" class="draft-conflict" hidden></div><p class="form-error" role="alert"></p><button class="primary" type="submit">保存订正与笔记</button></form></section></div></section>`;
    let autosave;const up=uploadWidget($('#correction-upload'),'submission',initial.files||[],()=>autosave?.changed());bindPreviews();
    autosave=correctionDraft($('#correction-form'),up,m,initial,remote,cached,endpoint);return;
  }
  main.innerHTML=`<section class="paper">${head('','我的错题集','先看错误点，再整理自己的解题思路。',link('grades','成绩档案'))}<div class="learning-filters"><label class="field"><span>查找作业或题目</span><input id="mistake-search" type="search" placeholder="作业、知识点或题号"></label><label class="field"><span>复习状态</span><select id="mistake-state"><option value="">全部</option><option value="todo">待订正</option><option value="review">待复习</option><option value="mastered">已掌握</option></select></label></div><div id="mistakes-list"></div></section>`;
  const draw=()=>{const term=$('#mistake-search').value.trim(),status=$('#mistake-state').value,rows=data.mistakes.filter(m=>(!status||m.status===status)&&(!term||[m.assignmentTitle,m.prompt,m.knowledge,m.questionId].join(' ').includes(term)));
    $('#mistakes-list').innerHTML=rows.length?rows.map(m=>`<article class="mistake-row"><div><h2>${routeLink('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),'第 '+h(m.questionId)+' 题')}</h2><p class="meta">${h(m.assignmentTitle)} · ${h(m.course)}</p><p class="mistake-feedback">${h(m.feedback)}</p></div><div class="actions"><span class="badge">${({todo:'待订正',review:'待复习',mastered:'已掌握'})[m.status]}</span><span class="question-score">${m.score}/${m.maxPoints}</span>${link('mistakes/'+m.assignmentId+'/'+encodeURIComponent(m.questionId),m.draftUpdatedAt?'继续订正草稿':'回看与订正','primary')}</div></article>`).join(''):`<div class="empty"><h2>${data.mistakes.length?'没有匹配的错题':'这里收集每次作业的失分题'}</h2><p>${data.mistakes.length?'调整筛选条件，再找一次。':'成绩返回后，失分题会自动保存。满分作业不会增加错题。'}</p>${link('assignments','查看作业','primary')}</div>`;};
  $('#mistake-search').oninput=draw;$('#mistake-state').onchange=draw;draw();
 }
 return {gradebook,overview,mistakes};
}
