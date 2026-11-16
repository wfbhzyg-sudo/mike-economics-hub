import {bindDisclosureMenus} from './disclosure-menu.js';
import {studentAssignmentAction} from './assignment-navigation.js';
import {libraryLocation,packReference,packQuestions} from './library-navigation.js';
import {highlightText} from './search-text.js';
import {lessonFocus} from './lesson-focus.js';
import {buildPacks,canonicalQuestions} from './library-packs.js';
import {mountLibraryReader} from './library-reader.js';
import {mountPDFReader} from './pdf-reader.js';
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const remember=(key,value)=>{try{sessionStorage.setItem(key,JSON.stringify(value));}catch{}};
const recall=(key,fallback)=>{try{return JSON.parse(sessionStorage.getItem(key))??fallback;}catch{return fallback;}};
export async function showLibrary({main,state,api,post,put,go,toast},unitOrTopic='',topicOrMode='',readerMode='',viewDetail=''){
 let disposed=false,content,readerCleanup,questions,sources,dialog,sourceReader,closeContextMenus,closeBankMenus;
 const events=new AbortController();
 state.viewCleanup=()=>{disposed=true;events.abort();closeContextMenus?.();closeBankMenus?.();readerCleanup?.();content?.libraryDispose?.();sourceReader?.destroy?.();dialog?.close();dialog?.remove();document.body.classList.remove('library-focused','library-project');};
 const teacher=state.user.role==='teacher',$=s=>main.querySelector(s);
 const {units}=await api('library/catalog');if(disposed)return;
 if(!units.length){main.innerHTML='<section class="library-work"><h1>课程教学包</h1><p>老师开放课程后，课件与教材会显示在这里。</p></section>';return;}
 const last=recall('lib-last:'+state.user.id,{}),resolved=libraryLocation(units,last,unitOrTopic,topicOrMode,readerMode);
 const {unitId,topicId,mode}=resolved;viewDetail=viewDetail||(!unitOrTopic?last.detail||'':'');
 const {unit,releases:initialReleases}=await api('library/unit?unit='+unitId);if(disposed)return;let releases=initialReleases;
 const releaseCount=()=>new Set(releases.flatMap(r=>r.classIds)).size;
 const releaseText=()=>releaseCount()?'资料开放 · '+releaseCount()+' 班':'资料未开放';
 const previewRef=mode==='preview'?packReference(viewDetail):null;
 const topic=unit.topics.find(t=>t.id===topicId)||unit.topics[0],group=unitId.split('-')[0],unitLabel='Unit '+unitId.at(-1),unitScope=topicId==='all';
 remember('lib-last:'+state.user.id,{unit:unitId,topic:topicId==='all'?'all':topic.id,mode,detail:viewDetail});
 const route=(t,m='')=>['library',unitId,t,m].filter(Boolean).join('/');
 const href=r=>'#'+(location.pathname.startsWith('/teacher')?'work/':'')+r;
 const navGo=(u,t,m)=>go(['library',u,t,m].filter(Boolean).join('/'));
 const activeMode=['progress','exams','preview'].includes(mode)?'packs':mode;
 const tabs=teacher?[['','学习重点'],['slides','课件'],['textbook','教材'],['packs','作业包'],['bank','题库']]:[['','学习重点'],['slides','课件'],['textbook','教材'],['practice','练习']];
 const tree=()=>`<div class="lib-course-tabs">${['micro','macro'].filter(c=>units.some(u=>u.id.startsWith(c))).map(c=>`<button data-course="${c}" aria-pressed="${group===c}">AP ${c==='micro'?'Micro':'Macro'}</button>`).join('')}</div><nav class="lib-unit-tree" aria-label="课程目录">${units.filter(u=>u.id.startsWith(group)).map(u=>`<details ${u.id===unitId?'open':''}><summary>${h(u.title.replace(/^AP (Micro|Macro)economics /,''))}</summary><div>${(u.topics||[]).map(t=>`<button data-unit-topic="${u.id}/${t.id}" ${u.id===unitId&&t.id===topic.id&&!unitScope?'aria-current="page"':''}><b>${h(t.id)}</b><span>${h(t.name||t.title)}</span></button>`).join('')}${teacher?`<button data-unit-topic="${u.id}/all" data-target-mode="progress" ${u.id===unitId&&unitScope&&(mode==='progress'||previewRef?.collection==='progress')?'aria-current="page"':''}>Progress Check</button>`:''}</div></details>`).join('')}${teacher?`<button class="lib-exam-nav" data-exams ${unitScope&&(mode==='exams'||previewRef?.collection==='exam')?'aria-current="page"':''}>历年真题</button>`:''}</nav>`;
 main.innerHTML=`<section class="library-work" data-reading="${['slides','textbook','project'].includes(mode)}"><div class="lib-mobile-context"><button data-directory aria-expanded="false" aria-label="选择课程、单元和主题">AP ${group==='micro'?'Micro':'Macro'} / ${unitLabel} / ${unitScope?'Papers':topic.id} <span>⌄</span></button><details class="lib-context-more"><summary aria-label="更多课程操作">${teacher?`<span class="lib-release-state" data-open="${releaseCount()>0}">${releaseText()}</span>`:''} ···</summary><div>${teacher?'<button data-release>管理资料开放</button>':''}<a href="${href('assignments')}">${teacher?'作业管理':'我的作业'}</a>${teacher?unit.resources.filter(r=>r.kind==='pptx'&&(!r.topicId||r.topicId===topic.id)).map(r=>`<a href="/api/homework/files/${encodeURIComponent(r.fileId)}?download=1">下载原始 PPTX</a>`).join(''):''}</div></details></div><div class="lib-layout"><aside class="lib-directory">${tree()}</aside><div class="lib-content"><header class="lib-topic-heading"><h1>${unitScope?(mode==='exams'||previewRef?.collection==='exam'?'AP '+(group==='micro'?'Micro':'Macro')+' · Past Papers':unitLabel+(mode==='bank'?' · Question Bank':' · Progress Check')):h(topic.id+' '+(topic.name||topic.title))}</h1>${unitScope?'':`<span>${h(topic.bigIdea||'')}</span>`}</header><nav class="lib-tabs" aria-label="本课内容">${tabs.map(([m,title])=>`<button data-view="${m}" aria-current="${activeMode===m?'page':'false'}">${title}</button>`).join('')}</nav><div data-content></div></div></div><p class="lib-error" role="alert"></p></section>`;
 content=$('[data-content]');
 if(state.libraryTabFocus){const next=state.libraryTabFocus;delete state.libraryTabFocus;if(next.unit===unitId&&next.mode===activeMode)state.restoreView=()=>{const button=[...main.querySelectorAll('[data-view]')].find(b=>b.dataset.view===activeMode);button?.focus({preventScroll:true});button?.scrollIntoView({block:'nearest',inline:'nearest'});};}
 closeContextMenus=bindDisclosureMenus(main,'.lib-context-more');
 const bindTree=root=>{root.querySelectorAll('[data-unit-topic]').forEach(b=>b.onclick=()=>{const [u,t]=b.dataset.unitTopic.split('/');navGo(u,t,b.dataset.targetMode||(['progress','exams','preview'].includes(mode)?'packs':mode==='project'?'slides':mode));});root.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{const u=units.find(u=>u.id.startsWith(b.dataset.course));if(u)navGo(u.id,['progress','exams'].includes(mode)?'all':'',mode==='preview'?'packs':mode==='project'?'slides':mode);});root.querySelector('[data-exams]')?.addEventListener('click',()=>navGo(group+'-unit-1','all','exams'));};
 bindTree(main);
 $('[data-directory]').onclick=()=>{const open=$('.library-work').classList.toggle('directory-open');$('[data-directory]').setAttribute('aria-expanded',String(open));};
 main.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const m=b.dataset.view;if(m==='packs'&&unitScope){go(route('all',mode==='exams'||previewRef?.collection==='exam'?'exams':'progress'));return;}go(route(unitScope&&m==='bank'?'all':topic.id,m));});
 main.addEventListener('keydown',e=>{if(e.key==='Escape'){$('.library-work').classList.remove('directory-open');$('[data-directory]').setAttribute('aria-expanded','false');}if(e.target.matches('[data-view]')&&['ArrowLeft','ArrowRight'].includes(e.key)){const buttons=[...main.querySelectorAll('[data-view]')],i=buttons.indexOf(e.target),n=(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;e.preventDefault();state.libraryTabFocus={unit:unitId,mode:buttons[n].dataset.view};buttons[n].click();}},{signal:events.signal});
 $('[data-release]')?.addEventListener('click',()=>release());
 const error=e=>{if(!disposed)$('.lib-error').textContent=e.message;};
 async function getQuestions(){if(!questions){questions=canonicalQuestions((await api('library/questions?unit='+unitId)).questions);}return questions;}
 async function getSources(){if(!sources)sources=(await api('library/sources?unit='+unitId)).sources;return sources;}
 function overview(){
  const f=lessonFocus[group+':'+topic.id],termMarkup=f?.terms.map(([term,zh])=>`<div class="lib-term"><strong><u>${h(term)}</u></strong><span>${h(zh)}</span></div>`).join('')||'';
  content.innerHTML=`<article class="lib-focus-grid"><section class="lib-goals"><h2>Learning goals</h2><ol>${(f?.goals||['Review '+(topic.name||'this lesson')+' using the source material.']).map(g=>`<li>${h(g)}</li>`).join('')}</ol></section><section class="lib-concepts"><h2>Key concepts</h2>${termMarkup}<p>${h(f?.concept||'Read the original lesson materials for this topic.')}</p></section><section class="lib-pitfalls"><h2>Common pitfalls</h2><ul>${(f?.pitfalls||['Check definitions, assumptions, and the labels on every diagram.']).map(p=>`<li>${h(p)}</li>`).join('')}</ul></section></article>`;
 }
 async function openSheet(title,markup,bind){
  const active=document.activeElement,trigger=active?.closest('details')?.querySelector(':scope > summary')||active;
  main.querySelectorAll('.lib-context-more[open],.lib-selection-more[open]').forEach(d=>d.open=false);dialog?.close();dialog?.remove();dialog=document.createElement('dialog');dialog.className='lib-dialog';dialog.setAttribute('aria-labelledby','library-dialog-title');dialog.innerHTML=`<header><h2 id="library-dialog-title">${h(title)}</h2><button type="button" data-close aria-label="关闭面板">×</button></header>${markup}`;document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(!disposed&&trigger?.isConnected)trigger.focus({preventScroll:true});},{once:true});dialog.showModal();bind?.(dialog);
 }
  async function release(){try{
   const classes=(await api('classes')).classes;if(disposed)return;
   const opened=new Set(releases.flatMap(r=>r.classIds));
   openSheet('资料开放班级',`<form class="lib-publish"><p>开放课件和教材，参考答案与私人批注保持私密。作业需另行布置。</p><div class="lib-classes">${classes.map(c=>`<label><input name="class" type="checkbox" value="${h(c.id)}" ${opened.has(c.id)?'checked disabled':''}>${h(c.name)}${opened.has(c.id)?' · 已开放':''}</label>`).join('')||'<p>暂无可用班级，请先在“更多功能 → 班级与学生”中确认。</p>'}</div><p class="hint">已开放班级保持不变，可勾选其他班级新增开放。</p><p role="alert"></p><button class="primary" type="submit" disabled>新增开放班级</button></form>`,d=>{
    const form=d.querySelector('form'),button=form.querySelector('[type=submit]');
    form.onchange=()=>button.disabled=!form.querySelector('input:checked:not(:disabled)');
    form.onsubmit=async e=>{e.preventDefault();button.disabled=true;try{
     const {release:updated}=await post('library/release',{unitId,classIds:[...d.querySelectorAll('input:checked')].map(x=>x.value)});
     releases=[...releases.filter(r=>r.id!==updated.id),updated];
     const label=$('.lib-release-state');if(label){label.textContent=releaseText();label.dataset.open=String(releaseCount()>0);}
     toast('资料开放班级已更新');d.close();
    }catch(err){d.querySelector('[role=alert]').textContent=err.message;button.disabled=false;}}
   });
  }catch(e){error(e);}}
 async function publish(ids,title){
  const key=`lib-publish-draft:${state.user.id}:${unitId}:${ids.join(',')}`,draft=recall(key,{}),clientId=draft.clientId||crypto.randomUUID();
  try{const classes=(await api('classes')).classes;if(disposed)return;
   openSheet('布置给班级',`<form class="lib-publish"><label>作业名称<input name="title" required maxlength="120" value="${h(draft.title||title||topic.id+' '+(topic.name||topic.title))}"></label><p>${ids.length} 题 · ${h(unitLabel)}</p><fieldset><legend>班级</legend><div class="lib-classes">${classes.map(c=>`<label><input name="class" type="checkbox" value="${h(c.id)}" ${draft.classIds?.includes(c.id)?'checked':''}>${h(c.name)}</label>`).join('')}</div></fieldset><label>截止时间<input name="dueAt" type="datetime-local" value="${h(draft.dueAt||'')}"></label><details><summary>更多设置</summary><div class="lib-form-grid"><label>开始时间<input name="opensAt" type="datetime-local" value="${h(draft.opensAt||'')}"></label><label>限时（分钟）<input name="durationMinutes" type="number" min="1" max="240" value="${h(draft.durationMinutes||'')}"></label><label><input name="allowLate" type="checkbox" ${draft.allowLate?'checked':''}>允许补交</label><label><input name="allowResubmit" type="checkbox" ${draft.allowResubmit?'checked':''}>允许重交</label></div></details><p class="lib-publish-policy">提交后先由教师确认，再公布分数。</p><p role="alert"></p><button class="primary" type="submit">确认布置</button></form>`,d=>{
    const form=d.querySelector('form'),button=form.querySelector('[type=submit]');
    const values=()=>({...Object.fromEntries(new FormData(form)),classIds:[...form.querySelectorAll('[name=class]:checked')].map(x=>x.value),allowLate:form.elements.allowLate.checked,allowResubmit:form.elements.allowResubmit.checked,clientId});
    form.oninput=()=>{const v=values();remember(key,v);button.disabled=!v.classIds.length;};form.oninput();
    form.onsubmit=async e=>{e.preventDefault();const v=values();remember(key,v);button.disabled=true;try{const {assignment}=await post('library/publish',{...v,unitId,questionIds:ids,dueAt:v.dueAt?new Date(v.dueAt).toISOString():null,opensAt:v.opensAt?new Date(v.opensAt).toISOString():null,durationMinutes:v.durationMinutes?Number(v.durationMinutes):null,gradingMode:'manual'});sessionStorage.removeItem(key);d.close();toast('已布置：'+assignment.title);}catch(err){form.querySelector('[role=alert]').textContent=err.message;}finally{button.disabled=false;}};
   });
  }catch(e){error(e);}
 }
 async function packs(collection='topic'){
  const qs=await getQuestions(),ss=collection==='topic'?[]:await getSources();if(disposed)return;
  const items=buildPacks(qs,{topic:topic.id,unitLabel,collection});
  const frqs=qs.filter(q=>q.type==='short'&&q.status==='ready');
  const packRows=(ready)=>items.map((p,i)=>({p,i})).filter(({p})=>p.ready===ready).map(({p,i})=>`<article><button data-preview-pack="${i}"><strong>${h(p.title)}</strong><small>${p.count} 题${p.note?' · '+h(p.note):''}</small></button><span class="lib-status" data-ready="${p.ready}">${p.ready?'已核对':p.pending+' 待核对'}</span><button data-pack="${i}" ${p.ready?'':'disabled'}>布置</button></article>`).join('');
  content.innerHTML=`<div class="lib-pack-heading" ${collection!=='topic'?'hidden':''}><p>${collection==='topic'?'Topic '+topic.id+' · 可布置练习':collection==='progress'?unitLabel+' · Progress Check':'Past papers · '+(group==='micro'?'AP Microeconomics':'AP Macroeconomics')}</p>${collection==='topic'?'<button data-unit-papers>Unit Progress Check</button>':''}</div><div class="lib-pack-list">${packRows(true)||'<p class="lib-empty">本范围暂无已核对的作业包。请展开待核对资料查看原卷。</p>'}</div>${items.some(p=>!p.ready)?`<details class="lib-pending-packs"><summary>待核对作业包 · ${items.filter(p=>!p.ready).length}</summary><div class="lib-pack-list">${packRows(false)}</div></details>`:''}${collection==='topic'&&!items.some(p=>p.id.startsWith('frq'))?`<div class="lib-pack-note">本主题暂无已核对的 FRQ 对应题。${frqs.length?` <button data-unit-frq>查看 ${unitLabel} FRQ（${frqs.length}）</button>`:''}</div>`:''}${ss.length?`<details class="lib-source-list"><summary>原卷与待核对资料 · ${ss.filter(s=>s.collection===collection).length} 份</summary>${ss.filter(s=>s.collection===collection).map((s,i)=>`<div><span>${h(s.title)}<small>${h(s.reviewNote||'')} · ${s.questionCount||0} 题</small></span><button data-source-id="${h(s.id)}">核对原卷</button></div>`).join('')}</details>`:''}`;
  $('[data-unit-papers]')?.addEventListener('click',()=>go(route('all','progress')));
  $('[data-unit-frq]')?.addEventListener('click',()=>go(route('all','bank')+'/frq'));
  main.querySelectorAll('[data-pack]').forEach(b=>b.onclick=()=>publish(items[+b.dataset.pack].questionIds,items[+b.dataset.pack].title));
  main.querySelectorAll('[data-preview-pack]').forEach(b=>b.onclick=()=>go(route(unitScope?'all':topic.id,'preview')+'/'+encodeURIComponent(collection+':'+items[+b.dataset.previewPack].id)));
  main.querySelectorAll('[data-source-id]').forEach(b=>b.onclick=()=>sourceView(ss.find(s=>s.id===b.dataset.sourceId)));
 }
 async function sourceView(source){
  openSheet('核对原卷',`<div class="lib-source-meta"><strong>${h(source.title)}</strong><span>${h(source.reviewNote||'待核对')}</span></div><div class="lib-source-reader homework-surface"></div><div class="lib-source-links">${source.originalFileId?`<a href="/api/homework/files/${encodeURIComponent(source.originalFileId)}?download=1">下载原始 DOCX</a>`:''}${source.answerFileId?`<a target="_blank" rel="noopener" href="/api/homework/files/${encodeURIComponent(source.answerFileId)}">查看答案原件</a>`:''}</div>`,d=>{d.classList.add('lib-source-dialog');const mounted=mountPDFReader(d.querySelector('.lib-source-reader'),{fileId:source.fileId,title:source.title});sourceReader=mounted;d.addEventListener('close',()=>mounted.destroy(),{once:true});});
 }
 async function bank(initial={}){
  const qs=await getQuestions();if(disposed)return;
  const storageKey=`lib-selection:${state.user.id}:${unitId}:${initial.context||'custom'}`;
  const selected=new Set(recall(storageKey,initial.ids||[]).filter(id=>qs.some(q=>q.id===id&&q.status==='ready')&&(!initial.ids||initial.ids.includes(id))).slice(0,40));
  let preview=null,filterTopic=initial.topic??(unitScope?'':topic.id),type=initial.type??'choice',search='',statusFilter='',skill='',collection='',onlySelected=false;
  const context=initial.title?`<div class="lib-bank-context"><button data-back-packs>返回作业包</button><strong>${h(initial.title)}</strong></div>`:'';
  const filters=!initial.ids?`<details class="lib-filters"><summary>筛选<span data-filter-count></span></summary><div><label>范围<select data-filter-topic><option value="">整个 ${unitLabel}</option>${unit.topics.map(t=>`<option value="${t.id}" ${filterTopic===t.id?'selected':''}>${t.id} ${h(t.name||t.title)}</option>`).join('')}</select></label><label>题型<select data-type><option value="">全部</option><option value="choice" ${type==='choice'?'selected':''}>MCQ</option><option value="short" ${type==='short'?'selected':''}>FRQ · ${unitLabel}</option></select></label><label>Skill<select data-skill><option value="">全部</option>${[1,2,3].map(n=>`<option value="${n}">Skill ${n}</option>`).join('')}</select></label><label>来源<select data-collection><option value="">全部</option><option value="bank">Topic bank</option><option value="progress">Progress Check</option><option value="exam">Past papers</option></select></label><label>核对状态<select data-filter-status><option value="">全部</option><option value="ready">已核对</option><option value="pending">待核对</option></select></label></div></details>`:'';
  content.innerHTML=`${context}<div class="lib-bank-top">${!initial.ids||initial.ids.length>8?'<label class="lib-search"><span class="sr-only">搜索题号或原文</span><input type="search" placeholder="题号或原文"></label>':''}${filters}<details class="lib-selection-more"><summary>选择</summary><div><button data-pick>选择当前可用题（最多40）</button><button data-clear>清空选择</button></div></details><button data-selected-view aria-pressed="false" title="查看已选题目"></button><button class="primary" data-publish>布置所选</button></div><p class="lib-bank-scope" data-scope></p><div class="lib-bank"><details class="lib-bank-directory" open><summary>题目目录 <span data-visible-count></span></summary><div class="lib-question-list"></div></details><div class="lib-question-preview"></div></div>`;
  if(teacher){const pending=qs.filter(x=>x.status!=='ready').length;const top=$('.lib-bank-top');if(top&&pending)top.insertAdjacentHTML('beforeend',`<button data-review-queue>待核对 ${pending}</button>`);$('[data-review-queue]')?.addEventListener('click',()=>{statusFilter='pending';const sel=$('[data-filter-status]');if(sel)sel.value='pending';onlySelected=false;draw();});}
  if(matchMedia('(max-width:900px)').matches)$('.lib-bank-directory').open=false;
  closeBankMenus?.();closeBankMenus=bindDisclosureMenus(content,'.lib-filters,.lib-selection-more');
  $('[data-back-packs]')?.addEventListener('click',()=>go(route(initial.collection==='topic'?topic.id:'all',initial.collection==='topic'?'packs':initial.collection==='exam'?'exams':'progress')));
  const eligible=()=>packQuestions(qs,initial.ids);
  const visible=()=>eligible().filter(q=>onlySelected?selected.has(q.id):(!type||q.type===type)&&(!filterTopic||type==='short'||q.topic===filterTopic)&&(!skill||String(q.skill||'').startsWith(skill))&&(!collection||q.collection===collection)&&(!statusFilter||(statusFilter==='ready'?q.status==='ready':q.status!=='ready'))&&(!search||(`${q.number} ${q.searchText||''} ${q.source}`).toLowerCase().includes(search.toLowerCase())));
  function update(){
   remember(storageKey,[...selected]);const button=$('[data-selected-view]');button.textContent=`已选 ${selected.size} / 40`;button.setAttribute('aria-pressed',String(onlySelected));$('[data-publish]').disabled=!selected.size;
   const rows=visible(),hidden=[...selected].filter(id=>!rows.some(q=>q.id===id)).length;
   $('[data-scope]').textContent=onlySelected?'当前仅显示已选题目':(initial.ids?`${initial.ids.length} 题 · 原卷顺序`:[type==='short'?unitLabel:filterTopic?'Topic '+filterTopic:unitLabel,type==='choice'?'MCQ':type==='short'?'FRQ':'MCQ + FRQ',skill?'Skill '+skill:'',collection,statusFilter==='ready'?'已核对':statusFilter?'待核对':''].filter(Boolean).join(' · '))+(hidden?` · ${hidden} 道已选题在当前筛选之外`:'');
   const scope=$('[data-scope]');scope.hidden=Boolean(initial.ids&&!onlySelected&&!hidden);
   const count=$('[data-filter-count]');if(count)count.textContent=[skill,collection,statusFilter].filter(Boolean).length?` · ${[skill,collection,statusFilter].filter(Boolean).length}`:'';
   const current=$('[data-preview-select]');if(current&&preview){current.textContent=selected.has(preview.id)?'已加入作业':'加入作业';current.setAttribute('aria-pressed',String(selected.has(preview.id)));current.disabled=preview.status!=='ready';}
  }
  function select(id,checked){if(checked&&selected.size>=40&&!selected.has(id)){toast('每份作业最多40题；先取消一题即可替换');return false;}checked?selected.add(id):selected.delete(id);return true;}
  function pageList(value){if(Array.isArray(value))return value.map(Number).filter(Number.isFinite);if(Number.isFinite(Number(value)))return [Number(value)];const nums=String(value||'').match(/\d+/g);return nums?nums.map(Number):[];}
  function questionOptions(q){
    const parsed=[],source=String(q.searchText||''),re=/\(([A-E])\)\s*([\s\S]*?)(?=\s*\([A-E]\)|$)/g;let m;
    while((m=re.exec(source))&&parsed.length<5)parsed.push({label:m[1],text:m[2].replace(/\s+/g,' ').trim().slice(0,240)});
    if(Array.isArray(q.options)&&q.options.length){
      const mapped=q.options.map(o=>typeof o==='string'?{label:o,text:''}:{label:o.label||o.id||'',text:(o.text&&o.text!==o.label)?o.text:''}).filter(o=>o.label);
      if(mapped.some(o=>o.text))return mapped;
      if(parsed.length)return parsed.map(p=>({label:p.label,text:p.text||mapped.find(o=>o.label===p.label)?.text||''}));
      return mapped;
    }
    return parsed;
  }
  function reviewMarkup(q){
    const options=questionOptions(q),bbox=(q.regions&&q.regions[0]&&q.regions[0].bbox)||[0,0,600,800];
    return `<section class="lib-review" data-review-id="${h(q.id)}"><div class="lib-review-head"><h3>核对答案</h3><span class="lib-status" data-ready="${q.status==='ready'}">${q.status==='ready'?'已核对':'待核对'}</span></div>${options.length?`<div class="lib-answer-options">${options.map(o=>`<button type="button" data-answer="${h(o.label)}" aria-pressed="${q.answer===o.label}"><b>${h(o.label)}</b><span>${h(o.text)}</span></button>`).join('')}</div>`:'<p class="lib-review-note">未识别到选项文字，请对照上方原图直接选择。</p>'}<div class="lib-answer-actions"><button type="button" data-suggest>AI 建议答案</button><button type="button" data-answer-upload>上传答案</button><button type="button" data-reslice-toggle>重新切片</button><button type="button" class="primary" data-answer-save>保存并核对</button></div><p class="lib-review-note" data-review-note role="status">${q.answerSuggestion?`AI 建议：${h(q.answerSuggestion.answer)} · ${h(q.answerSuggestion.reason||'')}`:''}</p><input type="file" hidden data-answer-file accept="image/*,application/pdf"><div class="lib-reslice" hidden><p>原卷第 <span data-reslice-page>${(q.regions&&q.regions[0]&&q.regions[0].page)||pageList(q.sourcePages)[0]||1}</span> 页 · PDF 坐标（左/上/右/下）</p><div class="lib-reslice-grid">${['左','上','右','下'].map((n,i)=>`<label>${n}<input type="number" step="1" data-bbox="${i}" value="${Math.round(bbox[i])}"></label>`).join('')}</div><button type="button" data-reslice-run>生成新切片</button></div></section>`;
  }
  function bindReview(q){
    const panel=$('.lib-review');if(!panel)return;
    let selected=q.answer||(q.answerSuggestion&&q.answerSuggestion.answer)||'';
    const paint=()=>panel.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.answer===selected)));
    const note=panel.querySelector('[data-review-note]');
    panel.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{selected=b.dataset.answer;paint();note.textContent='已选择 '+selected+'，点击“保存并核对”生效。';});
    panel.querySelector('[data-suggest]').onclick=async e=>{const button=e.currentTarget;button.disabled=true;note.textContent='正在请求 AI 建议…';try{const out=await post('library/questions/'+q.id+'/suggest',{});selected=out.answer;paint();note.textContent=`AI 建议：${out.answer} · ${out.reason||''}（仍需你确认）`;}catch(err){note.textContent=err.message;}finally{button.disabled=false;}};
    panel.querySelector('[data-answer-save]').onclick=async e=>{if(!selected){note.textContent='请先选择 A–E 中的一个答案。';return;}const button=e.currentTarget;button.disabled=true;note.textContent='正在保存…';try{const out=await put('library/questions/'+q.id,{answer:selected,confirm:true});const i=qs.findIndex(x=>x.id===q.id);if(i>=0)qs[i]=out.question;toast('已核对：第 '+q.number+' 题答案 '+selected);const pending=qs.filter(x=>x.status!=='ready').length;const queue=$('[data-review-queue]');if(queue){queue.textContent='待核对 '+pending;queue.hidden=!pending;}show(out.question,'next');}catch(err){note.textContent=err.message;button.disabled=false;}};
    const input=panel.querySelector('[data-answer-file]');panel.querySelector('[data-answer-upload]').onclick=()=>input.click();
    input.onchange=async()=>{const file=input.files&&input.files[0];if(!file)return;note.textContent='正在上传答案…';try{const res=await fetch('/api/homework/files?purpose=answer&name='+encodeURIComponent(file.name),{method:'POST',headers:{'X-CSRF-Token':state.csrf},body:file});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||'上传失败');const out=await put('library/questions/'+q.id,{answerFileId:data.file.id});const i=qs.findIndex(x=>x.id===q.id);if(i>=0)qs[i]=out.question;note.textContent='答案文件已上传，可继续选择答案并保存。';toast('答案文件已上传');}catch(err){note.textContent=err.message;}finally{input.value='';}};
    const box=panel.querySelector('.lib-reslice');panel.querySelector('[data-reslice-toggle]').onclick=()=>{box.hidden=!box.hidden;};
    panel.querySelector('[data-reslice-run]').onclick=async e=>{const button=e.currentTarget;const bbox=[...panel.querySelectorAll('[data-bbox]')].map(i=>Number(i.value));button.disabled=true;note.textContent='正在从原卷重新切片…';try{const out=await post('library/questions/'+q.id+'/reslice',{bbox});const i=qs.findIndex(x=>x.id===q.id);if(i>=0)qs[i]=out.question;toast('已生成新切片');show(out.question);}catch(err){note.textContent=err.message;button.disabled=false;}};
  }
  function show(q,focusControl=''){
   preview=q;const rows=visible(),index=rows.findIndex(x=>x.id===q.id);
   $('.lib-question-preview').innerHTML=`<div class="lib-preview-nav" ${rows.length===1?'hidden':''}><button data-preview-prev aria-label="上一道题" ${index<=0?'disabled':''}>上一题</button><span>${index+1} / ${rows.length}</span><button data-preview-next aria-label="下一道题" ${index>=rows.length-1?'disabled':''}>下一题</button>${rows.length>1?'<button data-preview-select aria-pressed="false"></button>':''}</div><div class="lib-preview-heading"><h2 tabindex="-1">Question ${q.number}</h2><span class="lib-status" data-ready="${q.status==='ready'}">${q.status==='ready'?(q.type==='choice'?'答案：'+q.answer:'待教师复核'):'待核对'}</span>${rows.length===1?'<button data-preview-select aria-pressed="false"></button>':''}<button data-image-zoom>放大</button></div>${q.reviewFlags?.length?`<details class="lib-pending"><summary>待核对原因 · ${q.reviewFlags.length}</summary><p>${h(q.reviewFlags.join(' · '))}</p></details>`:''}<div class="lib-images">${(q.questionImages||[]).map((id,i)=>`<img loading="lazy" src="/api/homework/files/${encodeURIComponent(id)}" alt="Question ${q.number} · part ${i+1}">`).join('')}</div>${search&&(q.searchText||'').toLowerCase().includes(search.toLowerCase())?`<details class="lib-search-match" open><summary>关键词位置 · 原件第 ${pageList(q.sourcePages).join(', ')} 页</summary><p>${highlightText(q.searchText||'',search)}</p></details>`:''}<p class="lib-source">${h(q.source)} · pp. ${pageList(q.sourcePages).join(', ')}${q.sharedMaterial?' · Shared material included':''}</p>`;
   $('[data-image-zoom]').onclick=e=>{const z=$('.lib-images').classList.toggle('zoom');e.currentTarget.textContent=z?'适应宽度':'放大';};
   if(teacher){$('.lib-preview-heading').insertAdjacentHTML('afterend',reviewMarkup(q));bindReview(q);}
   $('[data-preview-prev]').onclick=()=>{if(index>0)show(rows[index-1],'prev');};$('[data-preview-next]').onclick=()=>{if(index<rows.length-1)show(rows[index+1],'next');};
   $('[data-preview-select]').onclick=()=>{if(select(q.id,!selected.has(q.id))){if(onlySelected)draw();else{main.querySelectorAll('[data-select]').forEach(b=>{if(b.dataset.select===q.id)b.checked=selected.has(q.id);});update();}}};
   main.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preview===q.id)));update();if(focusControl){const button=$('[data-preview-'+focusControl+']');(button&&!button.disabled?button:$('.lib-preview-heading h2')).focus({preventScroll:true});}
  }
  function draw(){
   const rows=visible();$('[data-visible-count]').textContent=rows.length;$('.lib-bank-directory').hidden=rows.length<=1;
   $('.lib-question-list').innerHTML=rows.map(q=>`<div class="lib-question-row"><label><input type="checkbox" aria-label="选择第 ${q.number} 题" data-select="${h(q.id)}" ${q.status==='ready'?'':'disabled'} ${selected.has(q.id)?'checked':''}></label><button data-preview="${h(q.id)}"><strong>Question ${q.number}</strong><small>${h(q.source)}</small><span>${highlightText((q.searchText||'').slice(0,100),search)}</span></button></div>`).join('')||'<p>没有匹配的题目。</p>';
   main.querySelectorAll('[data-select]').forEach(b=>b.onchange=()=>{if(!select(b.dataset.select,b.checked))b.checked=false;if(onlySelected)draw();else update();});
   main.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{show(qs.find(q=>q.id===b.dataset.preview));if(matchMedia('(max-width:900px)').matches)$('.lib-bank-directory').open=false;});
   if(rows.length)show(rows.find(q=>q.id===preview?.id)||rows[0]);else{preview=null;$('.lib-question-preview').innerHTML='<p class="lib-empty">'+(onlySelected?'尚未选择题目。点击“已选”可返回全部题目。':'没有匹配的题目。调整筛选或清空搜索即可继续。')+'</p>';}update();
  }
  const bind=(selector,fn)=>{const el=$(selector);if(el)el.onchange=e=>{fn(e.target.value);onlySelected=false;draw();};};
  bind('[data-filter-topic]',v=>filterTopic=v);bind('[data-type]',v=>type=v);bind('[data-skill]',v=>skill=v);bind('[data-collection]',v=>collection=v);bind('[data-filter-status]',v=>statusFilter=v);
  const input=$('.lib-search input');if(input)input.oninput=e=>{search=e.target.value.trim();draw();};
  $('[data-selected-view]').onclick=()=>{onlySelected=!onlySelected;draw();};
  $('[data-pick]').onclick=()=>{for(const q of visible().filter(q=>q.status==='ready')){if(selected.size>=40)break;selected.add(q.id);}$('.lib-selection-more').open=false;draw();};
  $('[data-clear]').onclick=()=>{selected.clear();onlySelected=false;$('.lib-selection-more').open=false;draw();};
  $('[data-publish]').onclick=()=>publish([...selected],initial.title);draw();
 }
 async function practice(){
  const [{assignments},{submissions}]=await Promise.all([api('assignments'),api('submissions')]);if(disposed)return;
  const rows=assignments.filter(a=>a.libraryUnit===unitId||(a.libraryCollection==='exam'&&a.libraryCourse===group));
  const date=value=>new Date(value).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  content.innerHTML=`<div class="lib-practice-list">${rows.map(a=>{const item=studentAssignmentAction(a,submissions),link=item.target?href(item.target):null;return `<article data-state="${item.info.key}"><div><strong>${link?`<a href="${link}">${h(a.title)}</a>`:h(a.title)}</strong><p><span class="lib-status" data-ready="${item.info.key==='done'}">${h(item.label)}</span><span>${item.opensLater?'开放 '+date(a.opensAt):a.dueAt?'截止 '+date(a.dueAt):'不限截止时间'}</span>${a.libraryCollection==='exam'?'<span>Course-wide paper</span>':''}</p></div>${link?`<a class="lib-button" href="${link}">${h(item.action)}</a>`:`<button disabled>${h(item.action)}</button>`}</article>`;}).join('')||'<p class="lib-empty">本单元暂无已布置的作业。老师发布后会显示在这里。</p>'}</div>`;
 }
 try{if(['slides','textbook','project'].includes(mode)){const kind=mode==='textbook'?'textbook':'slides',resource=unit.resources.find(r=>r.kind===kind&&r.topicId===topic.id)||unit.resources.find(r=>r.kind===kind);if(!resource)throw Error('本课资料尚未准备好');readerCleanup=await mountLibraryReader(content,{resource,unitId,topic,kind,project:mode==='project',state,api,post,put,toast});if(disposed)readerCleanup?.();}else if(teacher&&mode==='bank')await bank(viewDetail==='frq'?{type:'short',topic:''}:{});else if(teacher&&mode==='preview'){if(!previewRef)throw Error('作业包入口已更新，请从作业包列表重新打开');const items=buildPacks(await getQuestions(),{topic:topic.id,unitLabel,collection:previewRef.collection}),item=items.find(p=>p.id===previewRef.id);if(!item)throw Error('作业包内容已更新，请返回列表重新选择');await bank({ids:item.questionIds,topic:'',type:'',title:item.title,context:viewDetail,collection:previewRef.collection});}else if(teacher&&['packs','progress','exams'].includes(mode))await packs(mode==='packs'?'topic':mode==='exams'?'exam':'progress');else if(!teacher&&mode==='practice')await practice();else overview();}catch(e){error(e);}
}
