import {mergeDraft,compareDraft,attachments} from './attempt-sync.js';
import {paperDownload} from './paper-download.js';
import {readingPositions} from './reading-positions.js';
import {mountLessonLinks} from './lesson-panel.js';
import {questionView,answerNavigation,bindQuestionPaper,questionIndexMarkup,bindQuestionIndex} from './question-view.js';
import {questionMarker} from './question-marker.js';
import {studyControls} from './study-workflow.js';
import {classKey} from './course-scope.js';
import {attemptClock} from './mcq-session.js';
import {mountInk} from './ink.js';
import {createImportUI} from './mcq-import.js';
export function createMCQUI(ctx){
 const {main,state,api,post,put,go,h,toast}=ctx,$=s=>main.querySelector(s);let disposed=false,timer,uploading=0,ink=null,study=null;const lessons=mountLessonLinks(main,api);state.viewCleanup=()=>{lessons.destroy();study?.destroy();ink?.destroy();disposed=true;clearTimeout(timer);delete document.body.dataset.mcqActive;delete document.body.dataset.mcqQuestionType};
 const fail=e=>{if(!disposed&&$('.mcq-error'))$('.mcq-error').textContent=e.message};
 function base(title,body){main.innerHTML=`<section class="mcq-work"><header class="mcq-toolbar mcq-top"><button id="mcq-back">← 作业</button><h1>${h(title)}</h1><div class="mcq-session-status"><button type="button" class="mcq-save" aria-label="查看同步详情"></button><button id="mcq-retry-save" hidden>重试保存</button><span id="mcq-timer"></span></div></header>${body}<p class="mcq-error" role="alert"></p></section>`;$('#mcq-back').onclick=()=>go('assignments')}
 async function analysis(id){const d=await api('mcq/analysis/'+id);if(disposed)return;base(d.assignment.title,`<section class="mcq-card"><div class="mcq-toolbar"><h2>逐题分析 · v${d.assignment.version}</h2><span>本版本 ${d.currentCount} 份提交</span><button id="mcq-roster">查看提交名单</button></div><div class="mcq-analysis">${d.questions.filter(q=>q.type==='choice').map(q=>`<details><summary>第 ${h(q.id)} 题 · 答对 ${q.distribution[q.correctOptions[0]]||0} / ${d.currentCount} · 未答 ${q.unanswered}</summary><div class="mcq-toolbar"><button data-analysis-zoom aria-pressed="false">放大题面</button></div><div class="mcq-import-grid"><div class="mcq-paper">${q.questionImages.map(f=>`<img src="/api/homework/files/${encodeURIComponent(f)}" alt="第 ${h(q.id)} 题">`).join('')}</div><div><strong>已确认答案 ${h(q.correctOptions[0])}</strong><p>${h(q.sourcePages||'')}</p><button data-change-key="${h(q.id)}">修改答案与预览重算</button>${q.options.map(o=>`<div class="mcq-distribution"><b>${o.label}</b><meter min="0" max="${Math.max(1,d.currentCount)}" value="${q.distribution[o.label]}"></meter><span>${q.distribution[o.label]} 人</span></div>`).join('')}</div></div></details>`).join('')}</div><p>修改已发布题目会产生新版本；已发布的历史成绩保留，重新评分需先复核。</p></section>`);$('#mcq-roster').onclick=()=>go('overview/'+id);main.querySelectorAll('[data-analysis-zoom]').forEach(b=>b.onclick=()=>{const zoom=b.closest('details').querySelector('.mcq-paper').classList.toggle('zoom');b.setAttribute('aria-pressed',String(zoom));b.textContent=zoom?'适应宽度':'放大题面'});
 main.querySelectorAll('[data-change-key]').forEach(button=>button.onclick=()=>{const q=d.questions.find(q=>q.id===button.dataset.changeKey),dialog=document.createElement('dialog');dialog.className='mcq-modal';dialog.innerHTML=`<div class="mcq-toolbar"><h2>第 ${h(q.id)} 题 · 修改答案</h2><button data-close>关闭</button></div><p>当前答案 ${h(q.correctOptions[0])}。预览后确认会创建新版本，旧成绩保留，新分数仍需复核发布。</p><label>新答案<select id="key-answer"><option value="">请选择</option>${q.options.filter(o=>o.label!==q.correctOptions[0]).map(o=>`<option>${o.label}</option>`).join('')}</select></label><button data-preview>预览成绩变化</button><div data-impact></div><p role="alert"></p><button data-confirm class="primary" hidden>确认更正答案并重算</button>`;main.append(dialog);dialog.showModal();dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();let preview=null;
 const payload=()=>({version:d.assignment.version,questionId:q.id,answer:dialog.querySelector('select').value});dialog.querySelector('select').onchange=()=>{preview=null;dialog.querySelector('[data-confirm]').hidden=true;dialog.querySelector('[data-impact]').replaceChildren()};
 dialog.querySelector('[data-preview]').onclick=async e=>{e.target.disabled=true;try{const requested=payload(),result=await post('mcq/analysis/'+id+'/preview',requested);if(disposed||!dialog.isConnected||requested.answer!==payload().answer)return;preview=result;dialog.querySelector('[data-impact]').innerHTML=`<p>${preview.rows.length} 份当前版本提交 · 有效分数将自动更新</p><div class="mcq-impact">${preview.rows.map(r=>`<div><span>${h(r.name)}</span><b>${r.before??'待定'} → ${r.after??'待批阅'}</b></div>`).join('')}</div>`;dialog.querySelector('[data-confirm]').hidden=false;dialog.querySelector('[role=alert]').textContent=''}catch(err){dialog.querySelector('[role=alert]').textContent=err.message}finally{e.target.disabled=false}};
 dialog.querySelector('[data-confirm]').onclick=async e=>{if(!preview)return;e.target.disabled=true;try{const result=await post('mcq/analysis/'+id+'/regrade',{...payload(),token:preview.token});dialog.close();toast('答案已更新，'+result.count+' 份成绩等待复核');await analysis(id)}catch(err){dialog.querySelector('[role=alert]').textContent=err.message;e.target.disabled=false}};
 });}

 async function attempt(id){const {assignment:a,attempt:initial}=await api('mcq/attempt/'+id);if(disposed)return;let t=initial;
 const assigned=state.assignments?.find(x=>x.id===id)?.classIds||a.classIds||[];
 const known=state.classes?.length?state.classes:assigned.length?(await api('classes').catch(()=>({classes:[]}))).classes:[];
 if(disposed)return;
 const classes=known.filter(c=>assigned.some(id=>classKey(c.id)===classKey(id)));
 if(state.user?.role==='student')study=studyControls({api,toast,user:state.user,assignmentId:id,version:a.version,classes});
 if(t?.submittedId){base(a.title,`<section class="mcq-card"><h2>${a.zeroRetry?'零分可重做':'已提交'}</h2><p>${a.zeroRetry?'重新交卷并出分后，按新成绩统计。':'回执已保存 · 批改完成后可查看成绩'}</p><div class="task-action-row"><button id="mcq-result" class="${a.zeroRetry?'secondary':'primary'}">查看提交与成绩</button>${paperDownload('receipt',t.submittedId)}${a.allowResubmit?`<button id="mcq-restart" class="${a.zeroRetry?'primary':'secondary'}">重新作答</button>`:''}</div></section>`);$('#mcq-result').onclick=()=>go('result/'+t.submittedId);if($('#mcq-restart'))$('#mcq-restart').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{t=(await post('mcq/attempt/'+id+'/restart',{receiptId:t.submittedId,revision:0,answers:{}})).attempt;if(!disposed)start()}catch(e){fail(e);button.disabled=false}};return;}
 if(!t||t.returnedFrom&&!t.startedAt){base(a.title,`<section class="mcq-card mcq-preflight"><h2>${a.questions.length} 道题 · ${a.timeLimitMinutes?a.timeLimitMinutes+' 分钟':'不限时'}</h2><p>选择答案后自动保存，刷新页面可继续。${a.timeLimitMinutes?'开始后持续计时，离开页面不暂停。':''}</p><p>${a.assessmentMode==='exam'?'测验期间 Mike 仅提供操作帮助。':'Mike 可解释一般概念，不代答当前作业。'}</p><div class="task-action-row"><button id="mcq-start" class="primary">开始作答</button>${!a.timeLimitMinutes && a.assessmentMode!=='exam'?paperDownload('assignment',id):''}</div></section>`);$('#mcq-start').onclick=async event=>{const button=event.currentTarget;button.disabled=true;try{t=(await post('mcq/attempt/'+id,t ? {...t,revision:t.revision} : {revision:0,answers:{},flags:[],index:0})).attempt;if(!disposed)start()}catch(e){fail(e);button.disabled=false}};return;}start();
 function start(){document.body.dataset.mcqActive='true';let index=Math.max(0,Math.min(t.index||0,a.questions.length-1)),answers={...t.answers},flags=new Set(t.flags),excluded={...t.excluded},freeText=t.freeText||'',files=t.files||[],responses=structuredClone(t.responses||{}),revision=t.revision,saving=Promise.resolve(),dirty=false,saveError=false,conflict=false,generation=0,submitting=false,lastSave='已保存',saveTimer;const initialViews={...t.views},storage='mcq:'+state.user.id+':'+id+':'+a.version+(t.sequence?':'+t.sequence:'');
 let comparisonDraft=null,queueChecked=false,baseDraft=structuredClone(t),pendingCount=0,flushing=null,comparing=false,lastConfirmed=t.updatedAt||t.startedAt;
 function useDraft(d){answers={...d.answers};flags=new Set(d.flags);excluded={...d.excluded};index=d.index||0;freeText=d.freeText||'';files=d.files||[];responses=structuredClone(d.responses||{});}
 try{const cached=JSON.parse(localStorage.getItem(storage)||'null');if(cached){comparisonDraft=cached.comparisonDraft||null;Object.assign(initialViews,cached.views);useDraft(cached);dirty=true;if(cached.needsCompare||cached.revision!==revision){baseDraft=cached.baseDraft||null;conflict=saveError=true;lastSave='两台设备有更新 · 查看同步';}}}catch{}
 const views=readingPositions(storage+':reading',initialViews);
 function clearLocalAttempt(){views.clear();localStorage.removeItem(storage);}
 const requested=new URLSearchParams(location.hash.split('?')[1]||'').get('question');
 if(requested){const qIndex=a.questions.findIndex(q=>String(q.id)===requested);if(qIndex>=0)index=qIndex;}
 index=Math.max(0,Math.min(Number.isInteger(index)?index:0,a.questions.length-1));
 const snapshot=()=>({views:views.snapshot(),sequence:t.sequence||0,revision,answers:{...answers},flags:[...flags],excluded:structuredClone(excluded),index,freeText,files:[...files],responses:structuredClone(responses)});
 function persist(){try{localStorage.setItem(storage,JSON.stringify({...snapshot(),baseDraft,needsCompare:conflict,comparisonDraft}));return true}catch{return false}}
 function inkPending(){try{return a.questions.filter(q=>q.type==='short'&&localStorage.getItem('mike-ink:'+state.user.id+':'+JSON.stringify({assignmentId:id,questionId:q.id}))).length;}catch{return null;}}
 let refreshSyncDetails;
 function showStatus(text){lastSave=text;if(disposed)return;const status=$('.mcq-save');if(!status)return;
   status.textContent=pendingCount?'附件待同步 '+pendingCount+' 份':text;status.onclick=syncDetails;status.setAttribute('aria-label',status.textContent+'，查看同步详情');refreshSyncDetails?.();
   const retry=$('#mcq-retry-save');if(retry){retry.hidden=!saveError&&!pendingCount;retry.textContent=conflict?'比较版本':'重试同步';retry.onclick=()=>{void reconcile().catch(fail);};}
 }
 async function reconcile(){
   if(disposed||comparing)return;
   if(conflict){
     comparing=true;try{const latest=await api('mcq/attempt/'+id);if(disposed)return;const remote=latest.attempt;
       if(!remote||remote.submittedId||remote.version!==t.version||(remote.sequence||0)!==(t.sequence||0))throw Error('作答已结束或版本已变更。本机草稿保留在原版本。');
       const mine=snapshot(),{merged,conflicts}=mergeDraft(baseDraft,mine,remote);
       comparisonDraft={local:mine,account:remote};persist();
       if(conflicts.length&&!(await compareDraft(main,conflicts)))return;
       if(disposed)return;useDraft(merged);revision=remote.revision;baseDraft=structuredClone(remote);conflict=saveError=false;dirty=true;generation++;persist();render();
     }finally{comparing=false;}
   }
   await save();await flushFiles();
 }
 function syncDetails(){
   const d=document.createElement('dialog');d.className='mcq-modal sync-compare';d.setAttribute('aria-label','同步详情');
   d.innerHTML='<header><h2>同步详情</h2><button type="button" data-close>关闭</button></header><dl></dl><div data-queue></div><p role="status"></p>';
   main.append(d);const rows=d.querySelector('dl'),queue=d.querySelector('[data-queue]'),message=d.querySelector('[role=status]');
   let shownCount=-1,request=0;
   function refresh(){
     const ink=inkPending(),ready=!dirty&&!saveError&&!conflict&&queueChecked&&!pendingCount&&ink===0;
     const items=[['答案与文字',conflict?'等待比较':dirty||saveError?'待同步':'已保存'],['手写草稿',ink===null?'请查看题内状态':ink?ink+' 题待同步':'无待传'],['照片与 PDF',pendingCount?pendingCount+' 份待传':queueChecked?'无待传':'正在检查']];
     if(lastConfirmed)items.push(['最近同步',new Date(lastConfirmed).toLocaleTimeString()]);
     rows.replaceChildren();
     for(const [label,value] of items){const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;rows.append(term,detail);}
     message.textContent=ready?'可换设备继续':'';
     if(shownCount===pendingCount)return;shownCount=pendingCount;const version=++request;queue.replaceChildren();
     if(pendingCount)attachments.list(storage).then(files=>{
       if(!d.open||request!==version)return;
       for(const file of files){
         const line=document.createElement('div'),name=document.createElement('span'),remove=document.createElement('button');
         name.textContent='第 '+file.q+' 题 · '+(file.name||file.file?.name||'附件');
         remove.type='button';remove.textContent='取消待传';remove.onclick=async()=>{
           if(flushing){message.textContent='正在同步，请稍后再试';return;}
           remove.disabled=true;
           try{await attachments.remove(file.id);pendingCount=(await attachments.list(storage)).length;shownCount=-1;showStatus(lastSave);}
           catch(err){message.textContent=err.message;remove.disabled=false;}
         };
         line.append(name,remove);queue.append(line);
       }
     }).catch(err=>{if(request===version){shownCount=-1;message.textContent=err.message;}});
   }
   d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>{refreshSyncDetails=null;request++;d.remove();};
   refreshSyncDetails=refresh;d.showModal();refresh();
 }
 async function transmit(row){
   const resp=await fetch('/api/homework/files?'+new URLSearchParams({purpose:'submission',name:row.name||row.file?.name,uploadId:row.id}),{method:'POST',headers:{'X-CSRF-Token':state.csrf},body:row.bytes||row.file});
   const out=await resp.json();if(!resp.ok)throw Error(out.error||'附件上传失败');return out;
 }
 async function flushFiles(){
   if(flushing)return flushing;
   flushing=(async()=>{const queued=await attachments.list(storage);queueChecked=true;pendingCount=queued.length;showStatus(lastSave);
     if(!queued.length||conflict||disposed||attemptClock(a,t).expired)return;
     uploading++;
     try{for(const row of queued){
       if(disposed||conflict||attemptClock(a,t).expired)return;
       const out=await transmit(row);
       if(disposed)return;
       const answer=responses[row.q]||={text:'',files:[]};
       if(!answer.files.includes(out.file.id)){answer.files.push(out.file.id);changed();}
       await save();
       if(conflict||!baseDraft?.responses?.[row.q]?.files?.includes(out.file.id))return;
       await attachments.remove(row.id);pendingCount--;showFiles();
     }}finally{uploading--;showStatus(lastSave);}
   })().finally(()=>{flushing=null;});return flushing;
 }
 function changed(){dirty=true;generation++;persist();showStatus('保存中…');clearTimeout(saveTimer);saveTimer=setTimeout(()=>void save().catch(()=>{}),250)}
 function save(){clearTimeout(saveTimer);saving=saving.catch(()=>{}).then(async()=>{if(!dirty)return;if(conflict)throw Error('请先比较两台设备的作答');const gen=generation,sent=snapshot();try{const r=await post('mcq/attempt/'+id,sent);if(r.submittedId){clearLocalAttempt();if(!disposed)go('result/'+r.submittedId);return;}baseDraft=structuredClone(r.attempt);comparisonDraft=null;lastConfirmed=r.attempt.updatedAt||new Date().toISOString();revision=r.attempt.revision;saveError=false;conflict=false;if(!disposed&&$('.mcq-error'))$('.mcq-error').textContent='';dirty=gen!==generation;persist();if(!dirty)localStorage.removeItem(storage);showStatus(dirty?'保存中…':'已保存')}catch(e){saveError=true;conflict=e.status===409;const local=persist();showStatus(conflict?'版本已更新 · 本机作答已保留':local?'本机已存 · 待同步':'尚未保存 · 请勿关闭页面');fail(e);throw e}});return saving;}
 function storeView(){const paper=$('.mcq-paper');if(paper)views.set(a.questions[index].id,{zoom:paper.classList.contains('zoom'),x:paper.scrollLeft,y:paper.scrollTop,text:!$('#mcq-accessible')?.hidden});}
 function jump(n){if(submitting)return;storeView();index=Math.max(0,Math.min(a.questions.length-1,n));render();changed();main.scrollTo({top:0,behavior:'instant'});$('#mcq-question-heading')?.focus({preventScroll:true});}
 function update(){const q=a.questions[index];main.querySelectorAll('[data-choice]').forEach(b=>{const val=b.dataset.choice;b.setAttribute('aria-checked',String(answers[q.id]===val));b.classList.toggle('excluded',(excluded[q.id]||[]).includes(val));b.tabIndex=answers[q.id]===val||(!answers[q.id]&&val===q.options[0]?.label)?0:-1});const clear=$('#mcq-clear');if(clear)clear.disabled=!answers[q.id];const f=$('#mcq-flag');f.setAttribute('aria-pressed',String(flags.has(q.id)));f.textContent=flags.has(q.id)?'⚑ 已标记':'⚑ 标记';for(const dot of main.querySelectorAll('[data-strike]'))dot.setAttribute('aria-pressed',String((excluded[q.id]||[]).includes(dot.dataset.strike)));}
 function render(){lessons.destroy();ink?.destroy();ink=null;const q=a.questions[index];document.body.dataset.mcqQuestionType=q.type;const view=views.get(q.id)||{},response=responses[q.id]||{text:'',files:[]};const screen=questionView(q,h,{number:index+1,zoom:view.zoom,textOpen:view.text,label:`第 ${index+1} / ${a.questions.length} 题${q.type==='short'?' · 简答':''}`});
 base(a.title,`<section class="mcq-question">${screen.tools}${screen.paper}${q.type==='short'?`<section class="mcq-card mcq-short"><details class="lib-handwriting"><summary>直接手写作答</summary><div data-ink></div></details><label>第 ${h(q.id)} 题作答<textarea id="mcq-free" maxlength="30000" placeholder="在这里填写答案，或添加照片 / PDF">${h(response.text)}</textarea></label><label>拍照或添加 PDF / 图片<input id="mcq-files" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple></label><div id="mcq-attachments"></div>${freeText||files.length?`<details class="mcq-legacy"><summary>之前保存的共同作答（已保留）</summary><p class="mcq-question-text">${h(freeText)}</p><p>旧版本内容会一并提交；本题答案请填写在上方，旧内容不会自动算作每题已答。</p>${files.map((f,i)=>`<a href="/api/homework/files/${encodeURIComponent(f)}" target="_blank" rel="noopener">原附件 ${i+1}</a>`).join(" · ")}</details>`:""}</section>`:''}</section><div class="mcq-answerbar">${screen.choices}${answerNavigation({choice:q.type!=='short',first:index===0,last:index===a.questions.length-1})}</div>`);
 showStatus(lastSave);paintClock();update();
 const tools=$('.question-tools'),marker=questionMarker(tools,JSON.stringify(['assignment',state.user.id,id,a.version,String(q.id)]),toast);
 const paper=bindQuestionPaper(main,marker,{view,changed:storeView});
 paper.addEventListener('scroll',()=>{
   if(disposed||submitting)return;
   const old=views.get(q.id)||{};
   if(paper.scrollTop===(old.y||0)&&paper.scrollLeft===(old.x||0))return;
   storeView();
 },{passive:true});
 lessons.mount(tools,q,{number:index+1,compact:true});
 study?.mount(tools,q,a.assessmentMode!=='exam'&&!a.timeLimitMinutes);
 $('#mcq-flag').onclick=()=>{flags.has(q.id)?flags.delete(q.id):flags.add(q.id);update();changed()};if($('#mcq-clear'))$('#mcq-clear').onclick=()=>{delete answers[q.id];update();changed()};for(const dot of main.querySelectorAll('[data-strike]'))dot.onclick=()=>{
   const label=dot.dataset.strike,set=new Set(excluded[q.id]||[]);
   if(set.has(label))set.delete(label);else{set.add(label);if(answers[q.id]===label)delete answers[q.id];}
   excluded[q.id]=[...set];update();changed();
 };
 main.querySelectorAll('[data-choice]').forEach((b,i,all)=>{b.onkeydown=e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();const n=(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+all.length)%all.length;all[n].focus();all[n].click()}};b.onclick=()=>{const val=b.dataset.choice;answers[q.id]=val;excluded[q.id]=(excluded[q.id]||[]).filter(x=>x!==val);update();changed()}});
 $('#mcq-prev').onclick=()=>jump(index-1);$('#mcq-next').onclick=()=>index<a.questions.length-1?jump(index+1):palette(true);$('#mcq-palette').onclick=()=>palette(false);
 if($('#mcq-free')){const details=$('.lib-handwriting');details.ontoggle=async()=>{if(!details.open||details.dataset.loaded)return;details.dataset.loaded='true';try{const host=$('[data-ink]');const mounted=await mountInk(host,{api,put,post,userId:state.user.id,scope:{assignmentId:id,questionId:q.id},onExport:async file=>{(responses[q.id]||={text:'',files:[]}).files.push(file.id);changed();if(!disposed&&a.questions[index].id===q.id)showFiles();toast('手写 PDF 已加入本题答案')}});if(disposed||!host.isConnected)mounted.destroy();else ink=mounted}catch(e){details.dataset.loaded='';fail(e)}};$('#mcq-free').oninput=e=>{(responses[q.id]||={text:'',files:[]}).text=e.target.value;changed()};showFiles();$('#mcq-files').onchange=async e=>{const picker=e.target;uploading++;try{for(const file of [...picker.files]){if(file.size>20*1024*1024||!file.size)throw Error('请选择 20 MB 以内的非空附件');const row={id:crypto.randomUUID(),scope:storage,q:q.id,name:file.name,bytes:await file.arrayBuffer()};
       try{await attachments.put(row);}catch(err){
         if(!navigator.onLine)throw Error('本机暂存空间不可用，请保持本页并在联网后重新添加附件。');
         const out=await transmit(row);const answer=responses[q.id]||={text:'',files:[]};if(!answer.files.includes(out.file.id))answer.files.push(out.file.id);changed();showFiles();
       }}picker.value='';if(flushing)await flushing;await flushFiles();}catch(err){fail(err);showStatus('附件尚未同步');}finally{uploading--;}};}
 }
 function showFiles(){if(disposed||!$('#mcq-attachments'))return;const files=responses[a.questions[index].id]?.files||[];$('#mcq-attachments').innerHTML=files.map((f,i)=>`<span class="mcq-attachment"><a href="/api/homework/files/${encodeURIComponent(f)}" target="_blank" rel="noopener">附件 ${i+1} ↗</a><button data-remove-file="${i}" aria-label="移除附件 ${i+1}">×</button></span>`).join('');main.querySelectorAll('[data-remove-file]').forEach(b=>b.onclick=()=>{files.splice(Number(b.dataset.removeFile),1);changed();showFiles()})}
 const answered=q=>q.type==='short'?Boolean(responses[q.id]?.text.trim()||responses[q.id]?.files.length):Boolean(answers[q.id]);
 let submitPromise=null;
 function submit(expired=false){if(submitPromise)return submitPromise;if(!expired&&(uploading||pendingCount))return Promise.reject(Error('还有本机附件未同步，请先重试同步'));submitting=true;clearTimeout(saveTimer);const work=$('.mcq-work'),controls=[...main.querySelectorAll('.mcq-work button,.mcq-work input,.mcq-work textarea,.mcq-palette-dialog button')].map(el=>[el,el.disabled]);for(const [el] of controls)el.disabled=true;work?.setAttribute('aria-busy','true');showStatus('正在交卷…');
 submitPromise=(async()=>{try{if(!expired){await save();await saving;}else await saving.catch(()=>{});const r=await post('mcq/attempt/'+id+'/submit',snapshot());state.justSubmitted=r.submittedId;clearLocalAttempt();if(!disposed)go('result/'+r.submittedId);return r;}catch(e){persist();if(!disposed)showStatus(saveError?lastSave:'交卷未完成 · 请重试');throw e;}finally{submitting=false;submitPromise=null;work?.removeAttribute('aria-busy');for(const [el,disabled] of controls)if(el.isConnected)el.disabled=disabled;}})();return submitPromise;
 }
 function palette(final){const trigger=document.activeElement,d=document.createElement('dialog');d.className='mcq-modal mcq-palette-dialog';d.setAttribute('aria-label',final?'交卷前检查':'题号菜单');d.innerHTML=`<div class="mcq-toolbar"><h2>${final?'交卷前检查':'题号菜单'}</h2><button data-close>关闭</button></div><p>未答 ${a.questions.filter(q=>!answered(q)).length} 题 · 标记 ${flags.size} 题</p>${questionIndexMarkup}<p role="alert"></p><div class="task-action-row paper-palette-actions">${paperDownload('assignment',id)}${final?'<button id="mcq-final" class="primary">确认交卷</button>':''}</div>`;main.append(d);d.showModal();d.addEventListener('cancel',e=>{if(submitting)e.preventDefault()});d.querySelector('[data-close]').onclick=()=>d.close();let jumped=false;d.onclose=()=>{d.remove();if(jumped){$('#mcq-question-heading')?.focus({preventScroll:true});return;}if(trigger?.isConnected)trigger.focus({preventScroll:true});else $('#mcq-palette')?.focus({preventScroll:true})};bindQuestionIndex(d,{questions:a.questions,index,answered,flags,jump:n=>{jumped=true;d.close();jump(n);}});if(final)d.querySelector('#mcq-final').onclick=async e=>{const buttons=[...d.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);e.target.textContent='正在交卷…';try{await submit();d.close()}catch(e){d.querySelector('[role=alert]').textContent=e.message;buttons.forEach(b=>b.disabled=false);d.querySelector('#mcq-final').textContent='重试交卷'}};
 }
 function paintClock(){const clock=attemptClock(a,t);const el=$('#mcq-timer');if(el){el.hidden=!clock.label;el.textContent=clock.label;el.dataset.urgent=String(clock.urgent);}return clock;}
 const tick=()=>{if(disposed)return;const clock=paintClock();if(clock.expired){submit(true).catch(e=>{fail(e);timer=setTimeout(tick,5000)});return;}timer=setTimeout(tick,1000)};
 const online=()=>{if(!conflict)void reconcile().catch(fail);},unload=e=>{if(dirty||uploading||submitting){persist();e.preventDefault();e.returnValue=''}};window.addEventListener('online',online);window.addEventListener('beforeunload',unload);window.addEventListener('pagehide',views.flush);const old=state.viewCleanup;state.viewCleanup=()=>{views.flush();window.removeEventListener('pagehide',views.flush);clearTimeout(saveTimer);if(dirty){persist();void save().catch(()=>{});}window.removeEventListener('online',online);window.removeEventListener('beforeunload',unload);old()};render();tick();if(conflict)void reconcile().catch(fail);else{if(dirty)void save().catch(()=>{});void flushFiles().catch(fail);}
 }
 }
 return {imports:id=>createImportUI(ctx).imports(id),attempt,analysis};
}
