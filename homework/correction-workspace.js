import {questionMarker} from './question-marker.js';
import {correctionAnswerEvidence} from './choice-correction.js';
import {mountPDFReader} from './pdf-reader.js';
import {mountReviewGallery} from './review-gallery.js';
// Keep both original viewers mounted while the student checks a page.
function writingReference(root, pair, getReader) {
  const dialog=document.createElement('dialog');
  dialog.className='frq-writing-reference';
  dialog.setAttribute('aria-label','对照原件');
  dialog.innerHTML='<header><div role="group" aria-label="选择原件"><button type="button" data-original="0">原题</button><button type="button" data-original="1">我的原作答</button></div><button type="button" data-resume>返回订正</button></header><div class="frq-reading-stage"></div>';
  root.append(dialog);
  const marker=document.createComment('original viewers');
  pair.before(marker);
  const panels=[...pair.children], switches=[...dialog.querySelectorAll('[data-original]')];
  let active=0, edit=null, frame=0;
  function select(index) {
    active=index;
    switches.forEach((button,i)=>{
      button.setAttribute('aria-pressed',String(i===index));
      panels[i].inert=i!==index;
    });
  }
  switches.forEach((button,i)=>button.onclick=()=>select(i));
  function move(parent, before=null) {
    const reader=getReader(), pos=reader?.position();
    parent.insertBefore(pair,before);
    cancelAnimationFrame(frame);
    if(pos)frame=requestAnimationFrame(()=>reader.gotoPage(pos.page,pos.offset));
  }
  function finish(restoreFocus=true) {
    if(!edit)return;
    const saved=edit; edit=null;
    panels.forEach(panel=>panel.inert=false);
    move(marker.parentNode,marker.nextSibling);
    if(dialog.open)dialog.close();
    if(restoreFocus && saved.field.isConnected){
      saved.field.focus({preventScroll:true});
      saved.field.setSelectionRange(saved.start,saved.end,saved.direction);
      saved.field.scrollTop=saved.offset;
      if(saved.container)saved.container.scrollTop=saved.top;
    }
  }
  dialog.querySelector('[data-resume]').onclick=()=>finish();
  dialog.addEventListener('cancel',event=>{if(event.target===dialog){event.preventDefault();finish();}});
  dialog.addEventListener('click',event=>{if(event.target===dialog)finish();});
  return {
    open(field) {
      if(edit||!field)return;
      const container=field.closest('main')||document.scrollingElement;
      edit={field,container,top:container?.scrollTop,start:field.selectionStart,end:field.selectionEnd,direction:field.selectionDirection,offset:field.scrollTop};
      dialog.showModal();
      move(dialog.querySelector('.frq-reading-stage'));
      select(active);switches[active].focus({preventScroll:true});
    },
    destroy(){finish(false);cancelAnimationFrame(frame);dialog.remove();marker.remove();}
  };
}
export function mountCorrectionReference(root,{mistake:m,state,api,metadata,h,fileMarkup,bindPreviews,date,compact=false,onEdit}){
 let destroyed=false,reader=null,gallery=null,questionGallery=null;const tasks=new Map();
 const compare=m.type!=='choice';
 const tabs=[['question',compare?'原题与原作答':'原题'],...(!compare?[['answer','我的原作答']]:[]),['history','订正记录 · '+m.corrections.length]];
 const pair=compare?`<div class="frq-pair"><section aria-label="原题"><h3>原题</h3><div data-frq-question></div></section><section aria-label="我的原作答"><h3>我的原作答</h3><div data-frq-answer></div></section></div>`:'';
 root.closest('.correction-workspace')?.classList.toggle('frq-workspace',compare);
 root.innerHTML=`<div class="correction-reference-head"><strong>原题与作答</strong>${onEdit?'<button type="button" class="text-button" data-write-correction>写订正</button>':''}<button type="button" class="text-button" data-collapse-reference aria-expanded="true" aria-controls="correction-reference-body">收起参考区</button></div><div class="correction-reference-body" id="correction-reference-body"><div class="correction-reference-tabs" role="tablist" aria-label="订正参考资料">${tabs.map(([id,name],i)=>`<button type="button" role="tab" id="correction-tab-${id}" data-reference="${id}" aria-selected="${i===0}" aria-controls="correction-panel-${id}" tabindex="${i===0?0:-1}">${name}</button>`).join('')}</div>${tabs.map(([id],i)=>`<section class="correction-reference-panel" role="tabpanel" id="correction-panel-${id}" aria-labelledby="correction-tab-${id}" tabindex="0" ${i?'hidden':''}>${id==='question'?pair:''}</section>`).join('')}</div>`;
 const $=s=>root.querySelector(s);let submission;
 const getSubmission=()=>submission||(submission=api('submissions/'+m.submissionId).then(v=>v.submission).catch(e=>{submission=null;throw e;}));
 async function question(panel){
  const paper=m.paper||(m.source==='mock'?null:(await getSubmission()).paper),ids=m.questionImages?.length?m.questionImages:paper?.questionFiles||[];
  await metadata(ids);if(destroyed)return;
  const files=ids.map(id=>state.files.get(id)).filter(Boolean),location=m.paperLocation||paper?.locations?.find(q=>q.id===m.questionId),first=files.find(f=>f.id===location?.fileId)||files.find(f=>f.id===paper?.mainQuestionFile)||files[0];
  const imageParts=Boolean(m.questionImages?.length)&&files.every(f=>f.mime.startsWith('image/'));
  panel.innerHTML=`${m.prompt?((compact||imageParts)&&first?`<details class="correction-question-text"><summary>题干文字</summary><p class="correction-prompt">${h(m.prompt)}</p></details>`:`<p class="correction-prompt">${h(m.prompt)}</p>`):''}${first?`<p class="correction-location">本次提交的原题${paper?.version?' · v'+paper.version:''}${imageParts?' · '+files.length+' 个原题片段':location?.page?' · 第 '+location.page+' 页':' · 未标注题页，可用搜索或页码定位'}</p>${files.length>1&&!imageParts?`<label class="field"><span>题纸文件</span><select data-correction-file aria-label="选择原题文件">${files.map(f=>`<option value="${h(f.id)}" ${f===first?'selected':''}>${h(f.name)}</option>`).join('')}</select></label>`:''}<div data-correction-document></div>`:!m.prompt?'<p class="correction-prompt">这次作业没有可显示的题纸或文字题干。你仍可查看自己的原作答，继续订正。</p>':''}`;
  const prompt=panel.querySelector('.correction-prompt');
  let marker;
  if(m.prompt || files.some(f=>f.mime.startsWith('image/'))){
    const tools=document.createElement('div');tools.className='question-tools';panel.prepend(tools);
    marker=questionMarker(tools,JSON.stringify(['correction',state.user.id,m.submissionId||m.assignmentId,m.questionId]));
    if(prompt && m.prompt)marker.attachText(prompt,'prompt');
  }
  function show(file){reader?.destroy();reader=null;questionGallery?.destroy();questionGallery=null;const host=panel.querySelector('[data-correction-document]');host.replaceChildren();host.className='';if(file.mime==='application/pdf'){
    host.className='pdf-preview';reader=mountPDFReader(host,{fileId:file.id,title:'第 '+m.questionId+' 题原件',storageKey:`hw-correction-paper:${state.user.id}:${m.submissionId}:${m.questionId}:${file.id}`,initialPage:file.id===location?.fileId?Number(location.page):null});
   }else{host.className='review-studio correction-gallery'+(imageParts?' question-fit-gallery':'');host.innerHTML='<div class="rv-gallery"></div>';questionGallery=mountReviewGallery(host.firstElementChild,{files:imageParts?files:[file],label:'题目原件',fullscreen:false,marker,fitContent:imageParts,storageKey:'correction-question:'+state.user.id+':'+file.id});}}
  if(first)show(first);const select=panel.querySelector('[data-correction-file]');if(select)select.onchange=()=>show(files.find(f=>f.id===select.value));
 }
 async function answer(panel){
  if(m.source==='mock'){panel.innerHTML='<p>'+h(m.originalChoice?'原选项 '+m.originalChoice:'未作答')+'</p>';return;}

  const s=await getSubmission(),evidence=correctionAnswerEvidence(s,m);await metadata(evidence.files);if(destroyed)return;
  const whole=compare && !s.responses?.[m.questionId] && (evidence.files.length||evidence.text);
  const caption=whole?'<p class="correction-location">整份作业的原作答 · 按题号对照</p>':'';
  const empty=s.offlineEvidence?'线下成绩表没有记录本题的原作答。':'本题没有保存的文字或附件。';
  if(!evidence.files.length){panel.innerHTML=caption+`<p class="correction-prompt correction-answer-text">${h(evidence.text||empty)}</p>`;return;}
  const originalText=compare && evidence.text ? `<p class="correction-prompt correction-answer-text">${h(evidence.text)}</p>` : '';
  panel.innerHTML=caption+originalText+'<div class="review-studio correction-gallery"><div class="rv-gallery"></div></div>';gallery=mountReviewGallery(panel.querySelector('.rv-gallery'),{files:evidence.files.map(id=>state.files.get(id)).filter(Boolean),text:compare?'':evidence.text,label:'我的原作答',fullscreen:false,storageKey:'correction-answer:'+state.user.id+':'+m.submissionId+':'+m.questionId});
 }
 async function history(panel){await metadata(m.corrections.flatMap(c=>c.files||[]));if(destroyed)return;panel.innerHTML=m.corrections.length?[...m.corrections].reverse().map(c=>`<article class="correction"><p class="hint">${date(c.createdAt)}</p><p class="instructions">${h(c.text||'订正见附件')}</p><div class="file-list">${fileMarkup(c.files||[])}</div></article>`).join(''):'<p class="correction-prompt">还没有已保存的订正记录。右侧或下方的草稿会自动保存，完成后点击“保存订正”。</p>';bindPreviews(panel);}
 function load(id){const panel=compare && id!=='history' ? $('[data-frq-'+id+']') : $('#correction-panel-'+id);if(panel.dataset.ready||tasks.has(id))return;panel.setAttribute('aria-busy','true');panel.innerHTML='<p class="hint" role="status">正在打开参考资料…</p>';const task=({question,answer,history}[id])(panel).then(()=>{if(!destroyed)panel.dataset.ready='true';}).catch(e=>{if(destroyed)return;panel.innerHTML=`<p class="error" role="alert">${h(e.message)}</p><button type="button" class="secondary">重试加载</button>`;panel.querySelector('button').onclick=()=>load(id);}).finally(()=>{tasks.delete(id);if(!destroyed)panel.setAttribute('aria-busy','false');});tasks.set(id,task);}
 const buttons=[...root.querySelectorAll('[role=tab]')];function select(id){buttons.forEach(b=>{const active=b.dataset.reference===id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('#correction-panel-'+b.dataset.reference).hidden=!active;});load(id);if(compare&&id==='question')load('answer');}
 buttons.forEach((b,i)=>{b.onclick=()=>select(b.dataset.reference);b.onkeydown=e=>{let n;if(e.key==='ArrowRight')n=(i+1)%buttons.length;if(e.key==='ArrowLeft')n=(i+buttons.length-1)%buttons.length;if(e.key==='Home')n=0;if(e.key==='End')n=buttons.length-1;if(n!==undefined){e.preventDefault();buttons[n].focus();select(buttons[n].dataset.reference);}};});
 $('[data-collapse-reference]').onclick=e=>{const body=$('.correction-reference-body'),open=body.hidden;body.hidden=!open;e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'收起参考区':'展开原题与原作答';};
 const peek=compare?writingReference(root,$('.frq-pair'),()=>reader):null;
 if(onEdit)$('[data-write-correction]').onclick=()=>onEdit?.();select('question');return {openForWriting:peek?.open,refreshHistory(){
  const tab=$('[data-reference=history]'),panel=$('#correction-panel-history');
  tab.textContent='订正记录 · '+m.corrections.length;
  delete panel.dataset.ready;if(!panel.hidden)load('history');
 },destroy(){destroyed=true;peek?.destroy();reader?.destroy();gallery?.destroy();questionGallery?.destroy();}};
}

// Read-only paper view shared by a grade card's direct original-question entry.
export async function mountAssignmentPaper(root,{assignmentId,submissionId,state,api,metadata,h,onClose}){
 const payload=await api(submissionId?'submissions/'+submissionId:'assignments/'+assignmentId);
 const submission=payload.submission,assignment=submission?.assignment||payload.assignment;
 const paper=submission?.paper||assignment?.paper||assignment||{};
 const ids=paper.questionFiles||[],questions=submission?.questions||assignment?.questions||[];
 // A sliced paper already has a reliable question-to-image mapping.
 if(questions.length && questions.every(q=>q.questionImages?.length || q.prompt) && questions.some(q=>q.questionImages?.length) && ids.every(id=>questions.some(q=>q.questionImages?.includes(id)))){
   root.innerHTML=`<section class="gj-original-paper result-original"><header><h2>作业原题</h2><button type="button" class="secondary" data-close-paper>收起原题</button></header>${questions.map((q,i)=>`<article><h3>第 ${i+1} 题</h3>${q.prompt?`<p>${h(q.prompt)}</p>`:''}${(q.questionImages||[]).map((id,j)=>`<img src="/api/homework/files/${encodeURIComponent(id)}" loading="lazy" decoding="async" alt="第 ${i+1} 题片段 ${j+1}">`).join('')}${!q.questionImages?.length?(q.options||[]).filter(o=>o.text).map(o=>`<p>${h(o.label)}. ${h(o.text)}</p>`).join(''):''}</article>`).join('')}</section>`;
   root.querySelector('[data-close-paper]').onclick=onClose;
   return {flush:async()=>{},destroy(){}};
 }
 await metadata(ids);
 const files=ids.map(id=>state.files.get(id)).filter(Boolean),first=files.find(f=>f.id===paper.mainQuestionFile)||files.find(f=>f.mime==='application/pdf')||files[0];
 let reader=null,gallery=null;
 const text=()=>`<p class="instructions">${h(paper.instructions||'')}</p>${questions.map(q=>`<article class="published-question"><h3>第 ${h(q.id)} 题</h3><p class="instructions">${h(q.prompt||'题目见原件')}</p></article>`).join('')}`;
 root.innerHTML=`<section class="gj-original-paper" aria-label="作业原题"><header><h2>作业原题</h2><button type="button" class="secondary" data-close-paper>收起原题</button></header><p class="hint">${submission?.paper?'本次提交的原题':'当前作业原题'}${paper.version?' · v'+h(paper.version):''}</p>${files.length>1?`<label class="field"><span>题纸文件</span><select aria-label="选择原题文件">${files.map(f=>`<option value="${h(f.id)}" ${f===first?'selected':''}>${h(f.name)}</option>`).join('')}</select></label>`:''}<div data-original-document></div>${first&&questions.length?`<details class="gj-original-text"><summary>题干文字与要求</summary>${text()}</details>`:!first?questions.length||paper.instructions?text():'<p class="hint">这份作业还没有题纸或文字题干。</p>':''}</section>`;
 const close=root.querySelector('[data-close-paper]');close.onclick=()=>onClose();
 const stop=()=>{reader?.destroy();reader=null;gallery?.destroy();gallery=null;};
 const show=file=>{stop();const host=root.querySelector('[data-original-document]');host.replaceChildren();host.className='';if(file.mime==='application/pdf'){host.className='pdf-preview';reader=mountPDFReader(host,{fileId:file.id,title:'作业原题',storageKey:`hw-grade-paper:${state.user.id}:${submissionId||assignmentId}:${file.id}`});}else{host.className='review-studio gj-original-gallery';host.innerHTML='<div class="rv-gallery"></div>';gallery=mountReviewGallery(host.firstElementChild,{files:[file],label:'作业原题',fullscreen:false,storageKey:`hw-grade-paper:${state.user.id}:${submissionId||assignmentId}:${file.id}`});}};
 if(first)show(first);const select=root.querySelector('select');if(select)select.onchange=()=>show(files.find(f=>f.id===select.value));
 return {flush:async()=>{},destroy:stop};
}
