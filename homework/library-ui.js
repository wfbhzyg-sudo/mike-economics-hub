import {selectedCourse,rememberCourse} from './course-scope.js';
import {gradingFields,readGradingPoints} from './library-grading.js';
import {bindDisclosureMenus} from './disclosure-menu.js';
import {studentAssignmentAction} from './assignment-navigation.js';
import {libraryLocation,packReference,packQuestions} from './library-navigation.js';
import {highlightText} from './search-text.js';
import {lessonFocus} from './lesson-focus.js';
import {buildPacks,canonicalQuestions,questionHasTopic} from './library-packs.js';
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
 let boardCleanup=null;
 const {units}=await api('library/catalog');if(disposed)return;
 if(!units.length){main.innerHTML='<section class="library-work"><h1>课程教学包</h1><p>老师开放课程后，课件与教材会显示在这里。</p></section>';return;}
 const last=recall('lib-last:'+state.user.id,{});if(!teacher&&!unitOrTopic){const preferred=selectedCourse(state.user.id,['micro','macro'],'');if(preferred&&!last.unit?.startsWith(preferred)){const target=units.find(u=>u.id.startsWith(preferred));if(target){last.unit=target.id;last.topic='';last.detail='';}}}
 const resolved=libraryLocation(units,last,unitOrTopic,topicOrMode,readerMode);
 const {unitId,topicId,mode}=resolved;viewDetail=viewDetail||(!unitOrTopic?last.detail||'':'');
 const {unit,releases:initialReleases}=await api('library/unit?unit='+unitId);if(disposed)return;let releases=initialReleases;
 const releaseCount=()=>new Set(releases.flatMap(r=>r.classIds)).size;
 const releaseText=()=>releaseCount()?'资料开放 · '+releaseCount()+' 班':'资料未开放';
 const previewRef=mode==='preview'?packReference(viewDetail):null;
 const topic=unit.topics.find(t=>t.id===topicId)||unit.topics[0],group=unitId.split('-')[0],unitLabel='Unit '+unitId.at(-1),unitScope=topicId==='all';
 if(!teacher)rememberCourse(state.user.id,group);
 remember('lib-last:'+state.user.id,{unit:unitId,topic:topicId==='all'?'all':topic.id,mode,detail:viewDetail});
 const route=(t,m='')=>['library',unitId,t,m].filter(Boolean).join('/');
 const href=r=>'#'+(location.pathname.startsWith('/teacher')?'work/':'')+r;
 const navGo=(u,t,m)=>go(['library',u,t,m].filter(Boolean).join('/'));
 const activeMode=['progress','exams','preview'].includes(mode)?'packs':mode;
 const tabs=teacher?[['','学习重点'],['slides','课件'],['textbook','教材'],['packs','作业包'],['bank','题库']]:[['','学习重点'],['slides','课件'],['textbook','教材'],['practice','练习']];
 const tree=()=>`<div class="lib-course-tabs">${['micro','macro'].filter(c=>units.some(u=>u.id.startsWith(c))).map(c=>`<button data-course="${c}" aria-pressed="${group===c}">AP ${c==='micro'?'Micro':'Macro'}</button>`).join('')}</div><nav class="lib-unit-tree" aria-label="课程目录">${units.filter(u=>u.id.startsWith(group)).map(u=>`<details ${u.id===unitId?'open':''}><summary>${h(u.title.replace(/^AP (Micro|Macro)economics /,''))}</summary><div>${(u.topics||[]).map(t=>`<button data-unit-topic="${u.id}/${t.id}" ${u.id===unitId&&t.id===topic.id&&!unitScope?'aria-current="page"':''}><b>${h(t.id)}</b><span>${h(t.name||t.title)}</span></button>`).join('')}${teacher?`<button data-unit-topic="${u.id}/all" data-target-mode="progress" ${u.id===unitId&&unitScope&&(mode==='progress'||previewRef?.collection==='progress')?'aria-current="page"':''}>Progress Check</button>`:''}</div></details>`).join('')}${teacher?`<button class="lib-exam-nav" data-exams ${unitScope&&(mode==='exams'||previewRef?.collection==='exam')?'aria-current="page"':''}>历年真题</button>`:''}</nav>`;
 main.innerHTML=`<section class="library-work" data-reading="${['slides','textbook','project'].includes(mode)}"><div class="lib-mobile-context"><button data-directory aria-expanded="false" aria-label="选择课程、单元和主题">AP ${group==='micro'?'Micro':'Macro'} / ${unitLabel} / ${unitScope?'Papers':topic.id} <span>⌄</span></button><div class="lib-teacher-actions">${teacher?`<button type="button" class="lib-release-button" data-open="${releaseCount()>0}" data-release>${releaseCount()?`资料开放 · ${releaseCount()} 班`:'开放资料与题库'}</button>`:''}<details class="lib-context-more"><summary aria-label="更多课程操作">···</summary><div>${teacher?'<button data-release>管理资料开放与题库</button>':''}<a href="${href('assignments')}">${teacher?'作业管理':'我的作业'}</a>${teacher?unit.resources.filter(r=>r.kind==='pptx'&&(!r.topicId||r.topicId===topic.id)).map(r=>`<a href="/api/homework/files/${encodeURIComponent(r.fileId)}?download=1">下载原始 PPTX</a>`).join(''):''}</div></details></div></div><div class="lib-layout"><aside class="lib-directory">${tree()}</aside><div class="lib-content"><header class="lib-topic-heading"><h1>${unitScope?(mode==='exams'||previewRef?.collection==='exam'?'AP '+(group==='micro'?'Micro':'Macro')+' · Past Papers':unitLabel+(mode==='bank'?' · Question Bank':' · Progress Check')):h(topic.id+' '+(topic.name||topic.title))}</h1>${unitScope?'':`<span>${h(topic.bigIdea||'')}</span>`}</header><nav class="lib-tabs" aria-label="本课内容">${tabs.map(([m,title])=>`<button data-view="${m}" aria-current="${activeMode===m?'page':'false'}">${title}</button>`).join('')}</nav><div data-content></div></div></div><p class="lib-error" role="alert"></p></section>`;
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
 async function getQuestions(){if(!questions){questions=(await api('library/questions?unit='+unitId)).questions;}return questions;}
 async function getSources(){if(!sources)sources=(await api('library/sources?unit='+unitId)).sources;return sources;}
 function overview(){
  const f=lessonFocus[group+':'+topic.id],termMarkup=f?.terms.map(([term,zh])=>`<div class="lib-term"><strong><u>${h(term)}</u></strong><span>${h(zh)}</span></div>`).join('')||'';
  boardCleanup?.();boardCleanup=null;
  content.innerHTML=`<article class="lib-focus-grid"><section class="lib-goals"><h2>Learning goals</h2><ol>${(f?.goals||['Review '+(topic.name||'this lesson')+' using the source material.']).map(g=>`<li>${h(g)}</li>`).join('')}</ol></section><section class="lib-concepts"><h2>Key concepts</h2>${termMarkup}<p>${h(f?.concept||'Read the original lesson materials for this topic.')}</p></section><section class="lib-pitfalls"><h2>Common pitfalls</h2><ul>${(f?.pitfalls||['Check definitions, assumptions, and the labels on every diagram.']).map(p=>`<li>${h(p)}</li>`).join('')}</ul></section></article>${boardMarkup()}`;
  mountBoard();
 }

 const BOARD_LABEL={discovery:'发现',key:'重点',question:'疑问',resource:'资源',teacher:'老师提示'};
 const boardTopic=()=>unitScope?'all':topic.id;
 const timeAgo=iso=>{const ms=Date.now()-Date.parse(iso||'');if(!Number.isFinite(ms)||ms<60000)return '刚刚';const m=Math.floor(ms/60000);if(m<60)return m+' 分钟前';const h=Math.floor(m/60);if(h<24)return h+' 小时前';const d=Math.floor(h/24);return d<7?d+' 天前':new Date(iso).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'});};
 function boardMarkup(){
  const kinds=Object.entries(BOARD_LABEL).filter(([k])=>teacher||k!=='teacher').map(([k,label])=>`<button type="button" class="lib-board-kind" data-board-kind-pick="${k}" aria-pressed="${k==='discovery'}">${label}</button>`).join('');
  return `<section class="lib-board" data-board data-topic="${h(boardTopic())}" aria-label="本章便签">
   <header class="lib-board-head"><div><h2>本章便签</h2><p class="lib-board-meta" data-board-meta>正在加载便签…</p></div><button type="button" class="lib-board-all" data-board-all>全部便签</button></header>
   <form class="lib-board-composer" data-board-form>
    <label class="lib-board-body"><span class="sr-only">便签内容</span><textarea data-board-body maxlength="1000" rows="2" placeholder="写下这一章的发现、疑问或补充资料…"></textarea></label>
    <div class="lib-board-tools"><div class="lib-board-kinds" role="group" aria-label="便签类型">${kinds}</div><label class="lib-board-attach">＋ 图片/PDF<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple hidden data-board-files></label><span class="lib-board-filelist" data-board-filelist></span><span class="lib-board-count" data-board-count>0/1000</span><button type="submit" class="lib-board-publish" data-board-publish>发布便签</button></div>
    <p class="lib-board-error" data-board-error role="alert"></p>
   </form>
   <div class="lib-board-filters" data-board-filters role="group" aria-label="筛选便签"></div>
   <div class="lib-board-new" data-board-new hidden><button type="button" data-board-newclick>有 <b>0</b> 条新便签</button></div>
   <div class="lib-board-shelf" data-board-shelf></div>
   <p class="lib-board-empty" data-board-empty hidden>还没有便签，先写下这一章的第一条发现吧。</p>
  </section>`;
 }
 function boardCard(n,{full=false}={}){
  const imgs=(n.attachments||[]).filter(a=>a.mime?.startsWith('image/')).length,pdfs=(n.attachments||[]).filter(a=>a.mime==='application/pdf').length;
  return `<article class="lib-board-card${n.pinned?' is-pinned':''}" data-board-note="${h(n.id)}" data-kind="${h(n.kind)}" tabindex="0" role="button" aria-label="打开 ${h(n.authorName)} 的便签">
   <header><span class="lib-board-ava">${h((n.authorName||'?').slice(0,1))}</span><div class="lib-board-who"><b>${h(n.authorName)}</b><small>${n.authorLeft?'<em>已离开班级</em>':h(n.authorClassLabel||'')}${n.authorLeft||n.authorClassLabel?' · ':''}${timeAgo(n.createdAt)}</small></div><span class="lib-board-tag">${n.authorRole==='teacher'?'老师提示':BOARD_LABEL[n.kind]||'便签'}</span></header>
   <p class="lib-board-text">${highlightText(n.body,'')}</p>
   ${(imgs||pdfs)?`<div class="lib-board-files">${imgs?`<span>🖼 ${imgs} 张图片</span>`:''}${pdfs?`<span>📄 PDF</span>`:''}</div>`:''}
   <footer><button type="button" class="lib-board-useful${n.usefulByMe?' is-on':''}" data-board-useful aria-pressed="${n.usefulByMe?'true':'false'}">有用 ${n.useful||0}</button><span>${n.pinned?'已置顶':''}</span></footer>
   ${full?'':''}
  </article>`;
 }
 function boardSkeleton(){return '<div class="lib-board-loading" aria-hidden="true"><span></span><span></span><span></span></div>';}
 async function mountBoard(){
  const root=$('[data-board]');if(!root)return;
  const st={unitId,topicId:boardTopic(),kind:'all',sort:'latest',notes:[],counts:{},total:0,newCount:0,es:null};
  const el={meta:root.querySelector('[data-board-meta]'),shelf:root.querySelector('[data-board-shelf]'),empty:root.querySelector('[data-board-empty]'),filters:root.querySelector('[data-board-filters]'),newbox:root.querySelector('[data-board-new]'),form:root.querySelector('[data-board-form]'),body:root.querySelector('[data-board-body]'),count:root.querySelector('[data-board-count]'),filelist:root.querySelector('[data-board-filelist]'),files:root.querySelector('[data-board-files]'),error:root.querySelector('[data-board-error]'),publish:root.querySelector('[data-board-publish]')};
  let pickedKind=teacher?'teacher':'discovery';let chosenFiles=[];
  const qsObj=()=>new URLSearchParams({unit:st.unitId,topic:st.topicId,kind:st.kind,sort:st.sort,limit:'20'});
  const paintKinds=()=>{root.querySelectorAll('[data-board-kind-pick]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.boardKindPick===pickedKind)));};
  const paintCounts=()=>{const total=st.counts.all||0;el.meta.textContent=total?`${total} 条便签${teacher?` · ${st.counts.teacher||0} 条老师提示`:''}`:'本章还没有便签';el.filters.innerHTML=`<button type="button" class="lib-board-filter${st.kind==='all'?' is-on':''}" data-board-filter="all" aria-pressed="${st.kind==='all'}">全部 ${st.counts.all||0}</button>`+['teacher','discovery','key','question','resource'].filter(k=>k!=='teacher'||(st.counts.teacher||0)>0).map(k=>`<button type="button" class="lib-board-filter${st.kind===k?' is-on':''}" data-board-filter="${k}" aria-pressed="${st.kind===k}">${BOARD_LABEL[k]} ${st.counts[k]||0}</button>`).join('');};
  const paintShelf=()=>{el.shelf.innerHTML=st.notes.length?st.notes.map(n=>boardCard(n)).join(''):'';el.empty.hidden=st.notes.length>0;el.empty.textContent=st.kind==='all'?'还没有便签，先写下这一章的第一条发现吧。':'这个筛选下还没有便签。';};
  const paintNew=()=>{el.newbox.hidden=st.newCount===0;el.newbox.querySelector('b').textContent=String(st.newCount);};
  async function load(){
   el.shelf.innerHTML=boardSkeleton();el.empty.hidden=true;
   try{const data=await api('library/board?'+qsObj());if(disposed)return;st.notes=data.notes||[];st.counts=data.counts||{};st.total=data.total||0;st.newCount=0;paintCounts();paintShelf();paintNew();}
   catch(e){el.shelf.innerHTML='';el.empty.hidden=false;el.empty.textContent=e.message||'便签加载失败';}
  }
  function refreshCountsOnly(){api('library/board?'+qsObj()).then(d=>{st.counts=d.counts||{};st.total=d.total||0;paintCounts();}).catch(()=>{});}
  function openDetail(n){
   const att=(n.attachments||[]).map(a=>a.mime?.startsWith('image/')?`<a class="lib-board-img" href="/api/homework/files/${encodeURIComponent(a.fileId)}" target="_blank" rel="noopener"><img src="/api/homework/files/${encodeURIComponent(a.fileId)}" alt="${h(a.name)}" loading="lazy"></a>`:`<a class="lib-board-pdf" href="/api/homework/files/${encodeURIComponent(a.fileId)}" target="_blank" rel="noopener">📄 ${h(a.name)}</a>`).join('');
   const reportForm=`<form class="lib-board-report" data-board-reportform hidden><label>举报原因<select name="reason"><option>与本章无关</option><option>不友善内容</option><option>疑似广告</option><option>其他</option></select></label><textarea name="detail" maxlength="200" placeholder="补充说明（可选）"></textarea><div><button type="submit">提交举报</button><button type="button" data-board-reportcancel>取消</button></div></form>`;
   const moderate=teacher?`<div class="lib-board-moderate"><button type="button" data-board-pin>${n.pinned?'取消置顶':'置顶'}</button><button type="button" data-board-hide>${n.status==='hidden'?'恢复显示':'隐藏'}</button></div>`:'';
   openSheet('便签详情',`<article class="lib-board-detail"><header><span class="lib-board-ava">${h((n.authorName||'?').slice(0,1))}</span><div><b>${h(n.authorName)}</b><small>${n.authorLeft?'已离开班级':h(n.authorClassLabel||'')} · ${timeAgo(n.createdAt)} · ${n.authorRole==='teacher'?'老师提示':BOARD_LABEL[n.kind]||''}</small></div></header><p class="lib-board-full">${highlightText(n.body,'')}</p>${att?`<div class="lib-board-attachments">${att}</div>`:''}<footer><button type="button" data-board-useful2 class="${n.usefulByMe?'is-on':''}">有用 ${n.useful||0}</button>${(n.mine||teacher)?'':`<button type="button" data-board-reportopen>举报</button>`}${moderate}</footer>${reportForm}</article>`,d=>{
    d.querySelector('[data-board-useful2]')?.addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;try{const out=await post(`library/board/${n.id}/useful`,{});b.textContent='有用 '+out.useful;b.classList.toggle('is-on',!!out.active);}catch(err){toast(err.message);}finally{b.disabled=false;}});
    d.querySelector('[data-board-reportopen]')?.addEventListener('click',()=>{d.querySelector('[data-board-reportform]').hidden=false;});
    d.querySelector('[data-board-reportcancel]')?.addEventListener('click',()=>{d.querySelector('[data-board-reportform]').hidden=true;});
    d.querySelector('[data-board-reportform]')?.addEventListener('submit',async ev=>{ev.preventDefault();const f=ev.currentTarget;const reason=new FormData(f).get('reason');const detail=String(new FormData(f).get('detail')||'').trim();try{await post(`library/board/${n.id}/report`,{reason:detail?reason+'：'+detail:reason});toast('已提交举报，老师会尽快处理');d.close();}catch(err){toast(err.message);}});
    d.querySelector('[data-board-pin]')?.addEventListener('click',async ev=>{const button=ev.currentTarget;button.disabled=true;try{await api(`library/board/${n.id}`,{method:'PATCH',body:{pinned:!n.pinned}});toast(n.pinned?'已取消置顶':'已置顶');d.close();d.remove();load();}catch(err){toast(err.message);button.disabled=false;}});
    d.querySelector('[data-board-hide]')?.addEventListener('click',async ev=>{const button=ev.currentTarget;button.disabled=true;try{await api(`library/board/${n.id}`,{method:'PATCH',body:{status:n.status==='hidden'?'visible':'hidden'}});toast(n.status==='hidden'?'已恢复显示':'已隐藏便签');d.close();d.remove();load();}catch(err){toast(err.message);button.disabled=false;}});
   },'lib-board-detail');
  }
  function openAll(){
   const kinds=['all','teacher','discovery','key','question','resource'];
   openSheet('全部便签',`<div class="lib-board-allwrap"><div class="lib-board-allbar"><input type="search" data-board-search placeholder="搜索便签或同学" aria-label="搜索便签"><div class="lib-board-allfilters">${kinds.map(k=>`<button type="button" data-board-allkind="${k}" class="${k==='all'?'is-on':''}">${k==='all'?'全部':BOARD_LABEL[k]}</button>`).join('')}</div><select data-board-sort aria-label="排序"><option value="latest">最新</option><option value="useful">最多有用</option></select></div><div class="lib-board-alllist" data-board-alllist>${boardSkeleton()}</div></div>`,d=>{
    let kind='all',sort='latest',q='',timer;
    const list=d.querySelector('[data-board-alllist]');
    const render=async()=>{list.innerHTML=boardSkeleton();try{const params=new URLSearchParams({unit:st.unitId,topic:st.topicId,kind,sort,limit:'50'});if(q)params.set('q',q);const data=await api('library/board?'+params);list.innerHTML=(data.notes||[]).map(n=>boardCard(n,{full:true})).join('')||'<p class="lib-board-empty">没有匹配的便签。</p>';list.querySelectorAll('[data-board-note]').forEach(card=>{const n=(data.notes||[]).find(x=>x.id===card.dataset.boardNote);card.addEventListener('click',()=>{if(n)openDetail(n);});card.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(n)openDetail(n);}});});}catch(e){list.innerHTML=`<p class="lib-board-empty">${h(e.message)}</p>`;}};
    d.querySelector('[data-board-search]').addEventListener('input',e=>{clearTimeout(timer);q=e.target.value.trim();timer=setTimeout(render,250);});
    d.querySelectorAll('[data-board-allkind]').forEach(b=>b.onclick=()=>{kind=b.dataset.boardAllkind;d.querySelectorAll('[data-board-allkind]').forEach(x=>x.classList.toggle('is-on',x===b));render();});
    d.querySelector('[data-board-sort]').onchange=e=>{sort=e.target.value;render();};
    render();
   },'lib-board-dialog');
  }
  // composer
  el.body.addEventListener('input',()=>{el.count.textContent=el.body.value.length+'/1000';});
  root.querySelectorAll('[data-board-kind-pick]').forEach(b=>b.onclick=()=>{pickedKind=b.dataset.boardKindPick;paintKinds();});
  el.files.addEventListener('change',()=>{chosenFiles=[...el.files.files].slice(0,5);el.filelist.textContent=chosenFiles.map(f=>f.name).join('、');});
  el.form.addEventListener('submit',async e=>{e.preventDefault();const body=el.body.value.trim();if(!body){el.error.textContent='先写点什么再发布。';return;}const images=chosenFiles.filter(f=>f.type!=='application/pdf').length,pdfs=chosenFiles.filter(f=>f.type==='application/pdf').length;if(images>4||pdfs>1){el.error.textContent='最多 4 张图片和 1 个 PDF。';return;}if(chosenFiles.some(f=>f.size>(f.type==='application/pdf'?25:8)*1024*1024)){el.error.textContent='文件过大：图片最多 8MB，PDF 最多 25MB。';return;}el.error.textContent='';el.publish.disabled=true;el.publish.textContent='发布中…';try{const attachments=[];for(const file of chosenFiles){const res=await fetch('/api/homework/files?purpose=board&name='+encodeURIComponent(file.name),{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':state.csrf},body:file});const data=await res.json();if(!res.ok)throw new Error(data.error||'附件上传失败');attachments.push({fileId:data.file.id,name:data.file.name,mime:data.file.mime,size:data.file.size});}await post('library/board',{unitId:st.unitId,topicId:st.topicId,body,kind:pickedKind,attachments});el.body.value='';el.count.textContent='0/1000';chosenFiles=[];el.files.value='';el.filelist.textContent='';toast('已发布便签');await load();}catch(err){el.error.textContent=err.message;}finally{el.publish.disabled=false;el.publish.textContent='发布便签';}});
  el.shelf.addEventListener('click',e=>{const useful=e.target.closest('[data-board-useful]');const card=e.target.closest('[data-board-note]');if(useful&&card){e.stopPropagation();const n=st.notes.find(x=>x.id===card.dataset.boardNote);if(!n)return;useful.disabled=true;post(`library/board/${n.id}/useful`,{}).then(out=>{useful.textContent='有用 '+out.useful;useful.classList.toggle('is-on',!!out.active);n.useful=out.useful;n.usefulByMe=out.active;}).catch(err=>toast(err.message)).finally(()=>{useful.disabled=false;});return;}if(card){const n=st.notes.find(x=>x.id===card.dataset.boardNote);if(n)openDetail(n);}});
  el.filters.addEventListener('click',e=>{const b=e.target.closest('[data-board-filter]');if(!b)return;st.kind=b.dataset.boardFilter;load();});
  el.newbox.addEventListener('click',()=>load());
  root.querySelector('[data-board-all]').addEventListener('click',openAll);
  paintKinds();paintNew();await load();
  try{const es=new EventSource(`/api/homework/library/board/stream?unit=${encodeURIComponent(st.unitId)}&topic=${encodeURIComponent(st.topicId)}`);es.addEventListener('update',()=>{st.newCount+=1;paintNew();refreshCountsOnly();});es.addEventListener('report',()=>{refreshCountsOnly();});st.es=es;}catch{}
  boardCleanup=()=>{try{st.es?.close();}catch{}};
 }
 async function openSheet(title,markup,bind,extraClass=''){
  const active=document.activeElement,trigger=active?.closest('details')?.querySelector(':scope > summary')||active;
  main.querySelectorAll('.lib-context-more[open],.lib-selection-more[open]').forEach(d=>d.open=false);dialog?.close();dialog?.remove();dialog=document.createElement('dialog');dialog.className='lib-dialog';dialog.setAttribute('aria-labelledby','library-dialog-title');dialog.innerHTML=`<header><h2 id="library-dialog-title">${h(title)}</h2><button type="button" data-close aria-label="关闭面板">×</button></header>${markup}`;if(extraClass)dialog.classList.add(extraClass);document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(!disposed&&trigger?.isConnected)trigger.focus({preventScroll:true});},{once:true});dialog.showModal();bind?.(dialog);
 }
  async function release(){try{
   const classes=(await api('classes')).classes;if(disposed)return;
   const opened=new Set(releases.flatMap(r=>r.classIds));
   openSheet('资料开放班级',`<form class="lib-publish"><p>开放本章节的课件、教材与自主模考题库。参考答案与私人批注保持私密；正式作业仍需另行布置。</p><div class="lib-classes">${classes.map(c=>`<label><input name="class" type="checkbox" value="${h(c.id)}" ${opened.has(c.id)?'checked disabled':''}>${h(c.name)}${opened.has(c.id)?' · 已开放':''}</label>`).join('')||'<p>暂无可用班级，请先在“更多功能 → 班级与学生”中确认。</p>'}</div><p class="hint">已开放班级保持不变，可勾选其他班级新增开放。</p><p role="alert"></p><button class="primary" type="submit" disabled>新增开放班级</button></form>`,d=>{
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
  try{const classes=(await api('classes')).classes,selectedQuestions=(await getQuestions()).filter(q=>ids.includes(q.id));if(disposed)return;
   openSheet('布置给班级',`<form class="lib-publish"><label>作业名称<input name="title" required maxlength="120" value="${h(draft.title||title||topic.id+' '+(topic.name||topic.title))}"></label><p>${ids.length} 题 · ${h(unitLabel)}</p>${gradingFields(selectedQuestions,h)}<fieldset><legend>班级</legend><div class="lib-classes">${classes.map(c=>`<label><input name="class" type="checkbox" value="${h(c.id)}" ${draft.classIds?.includes(c.id)?'checked':''}>${h(c.name)}</label>`).join('')}</div></fieldset><label>截止时间<input name="dueAt" type="datetime-local" value="${h(draft.dueAt||'')}"></label><details><summary>更多设置</summary><div class="lib-form-grid"><label>开始时间<input name="opensAt" type="datetime-local" value="${h(draft.opensAt||'')}"></label><label>限时（分钟）<input name="durationMinutes" type="number" min="1" max="240" value="${h(draft.durationMinutes||'')}"></label><label><input name="allowLate" type="checkbox" ${draft.allowLate?'checked':''}>允许补交</label><label><input name="allowResubmit" type="checkbox" ${draft.allowResubmit?'checked':''}>允许重交</label></div></details><p class="lib-publish-policy">提交后先由教师确认，再公布分数。</p><p role="alert"></p><button class="primary" type="submit">确认布置</button></form>`,d=>{
    const form=d.querySelector('form'),button=form.querySelector('[type=submit]');
    const values=()=>({...Object.fromEntries(new FormData(form)),classIds:[...form.querySelectorAll('[name=class]:checked')].map(x=>x.value),allowLate:form.elements.allowLate.checked,allowResubmit:form.elements.allowResubmit.checked,clientId,maxPointsByQuestion:readGradingPoints(form)});
    form.oninput=()=>{const v=values();remember(key,v);button.disabled=!v.classIds.length;};form.oninput();
    form.onsubmit=async e=>{e.preventDefault();const v=values();remember(key,v);button.disabled=true;try{const {assignment}=await post('library/publish',{...v,unitId,questionIds:ids,dueAt:v.dueAt?new Date(v.dueAt).toISOString():null,opensAt:v.opensAt?new Date(v.opensAt).toISOString():null,durationMinutes:v.durationMinutes?Number(v.durationMinutes):null,gradingMode:'manual'});sessionStorage.removeItem(key);d.close();toast('已布置：'+assignment.title);}catch(err){form.querySelector('[role=alert]').textContent=err.message;}finally{button.disabled=false;}};
   });
  }catch(e){error(e);}
 }
 async function packs(collection='topic'){
  const qs=await getQuestions(),ss=collection==='topic'?[]:await getSources();if(disposed)return;
  const items=buildPacks(qs,{topic:topic.id,unitLabel,collection});
  const frqs=qs.filter(q=>q.type==='short');
  const packRows=(ready)=>items.map((p,i)=>({p,i})).filter(({p})=>p.ready===ready).map(({p,i})=>`<article><button data-preview-pack="${i}"><strong>${h(p.title)}</strong><small>${p.count} 题${p.note?' · '+h(p.note):''}</small></button><span class="lib-status" data-ready="${p.ready}">${p.ready?'已核对':p.pending+' 待核对'}</span><button data-pack="${i}" >布置</button></article>`).join('');
  content.innerHTML=`<div class="lib-pack-heading" ${collection!=='topic'?'hidden':''}><p>${collection==='topic'?'Topic '+topic.id+' · 可布置练习':collection==='progress'?unitLabel+' · Progress Check':'Past papers · '+(group==='micro'?'AP Microeconomics':'AP Macroeconomics')}</p>${collection==='topic'?'<button data-unit-papers>Unit Progress Check</button>':''}</div><div class="lib-pack-list">${packRows(true)||'<p class="lib-empty">本范围暂无已核对作业包。待核对作业包也可布置，由教师评分。</p>'}</div>${items.some(p=>!p.ready)?`<details class="lib-pending-packs"><summary>待核对作业包 · 可布置 · ${items.filter(p=>!p.ready).length}</summary><div class="lib-pack-list">${packRows(false)}</div></details>`:''}${collection==='topic'&&!items.some(p=>p.id.startsWith('frq'))?`<div class="lib-pack-note">本主题暂无 FRQ 对应题。${frqs.length?` <button data-unit-frq>查看 ${unitLabel} FRQ（${frqs.length}）</button>`:''}</div>`:''}${ss.length?`<details class="lib-source-list"><summary>原卷与待核对资料 · ${ss.filter(s=>s.collection===collection).length} 份</summary>${ss.filter(s=>s.collection===collection).map((s,i)=>`<div><span>${h(s.title)}<small>${h(s.reviewNote||'')} · ${s.questionCount||0} 题</small></span><button data-source-id="${h(s.id)}">核对原卷</button></div>`).join('')}</details>`:''}`;
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
  const raw=await getQuestions(),qs=initial.ids?raw:canonicalQuestions(raw);if(disposed)return;
  const storageKey=`lib-selection:${state.user.id}:${unitId}:${initial.context||'custom'}`;
  const selected=new Set(recall(storageKey,initial.ids||[]).filter(id=>qs.some(q=>q.id===id&&q.questionImages?.length)&&(!initial.ids||initial.ids.includes(id))).slice(0,40));
  let preview=null,filterTopic=initial.topic??(unitScope?'':topic.id),type=initial.type??'choice',search='',statusFilter='',skill='',collection='',onlySelected=false;
  const context=initial.title?`<div class="lib-bank-context"><button data-back-packs>返回作业包</button><strong>${h(initial.title)}</strong></div>`:'';
  const filters=!initial.ids?`<details class="lib-filters"><summary>筛选<span data-filter-count></span></summary><div><label>范围<select data-filter-topic><option value="">整个 ${unitLabel}</option>${unit.topics.map(t=>`<option value="${t.id}" ${filterTopic===t.id?'selected':''}>${t.id} ${h(t.name||t.title)}</option>`).join('')}</select></label><label>题型<select data-type><option value="">全部</option><option value="choice" ${type==='choice'?'selected':''}>MCQ</option><option value="short" ${type==='short'?'selected':''}>FRQ · ${unitLabel}</option></select></label><label>Skill<select data-skill><option value="">全部</option>${[1,2,3].map(n=>`<option value="${n}">Skill ${n}</option>`).join('')}</select></label><label>来源<select data-collection><option value="">全部</option><option value="bank">Topic bank</option><option value="progress">Progress Check</option><option value="exam">Past papers</option></select></label><label>核对状态<select data-filter-status><option value="">全部</option><option value="ready">已核对</option><option value="pending">待核对</option></select></label></div></details>`:'';
  content.innerHTML=`${context}<div class="lib-bank-top">${!initial.ids||initial.ids.length>8?'<label class="lib-search"><span class="sr-only">搜索题号或原文</span><input type="search" placeholder="题号或原文"></label>':''}${filters}<details class="lib-selection-more"><summary>选择</summary><div><button data-pick>选择当前可用题（最多40）</button><button data-clear>清空选择</button></div></details><button data-selected-view aria-pressed="false" title="查看已选题目"></button><button class="primary" data-publish>布置所选</button></div><p class="lib-bank-scope" data-scope></p><div class="lib-bank"><details class="lib-bank-directory" open><summary>题目目录 <span data-visible-count></span></summary><div class="lib-question-list"></div></details><div class="lib-question-preview"></div></div>`;
  if(teacher){const pending=qs.filter(x=>x.status!=='ready').length;const top=$('.lib-bank-top');if(top&&pending)top.insertAdjacentHTML('beforeend',`<button data-review-queue>待核对 ${pending}</button>`);$('[data-review-queue]')?.addEventListener('click',()=>{statusFilter='pending';const sel=$('[data-filter-status]');if(sel)sel.value='pending';onlySelected=false;draw();});}
  if(matchMedia('(max-width:900px)').matches)$('.lib-bank-directory').open=false;
  closeBankMenus?.();closeBankMenus=bindDisclosureMenus(content,'.lib-filters,.lib-selection-more');
  $('[data-back-packs]')?.addEventListener('click',()=>go(route(initial.collection==='topic'?topic.id:'all',initial.collection==='topic'?'packs':initial.collection==='exam'?'exams':'progress')));
  const eligible=()=>packQuestions(qs,initial.ids);
  const visible=()=>eligible().filter(q=>onlySelected?selected.has(q.id):(!type||q.type===type)&&(!filterTopic||type==='short'||questionHasTopic(q,filterTopic))&&(!skill||String(q.skill||'').startsWith(skill))&&(!collection||q.collection===collection)&&(!statusFilter||(statusFilter==='ready'?q.status==='ready':q.status!=='ready'))&&(!search||(`${q.number} ${q.searchText||''} ${q.source}`).toLowerCase().includes(search.toLowerCase())));
  function update(){
   remember(storageKey,[...selected]);const button=$('[data-selected-view]');button.textContent=`已选 ${selected.size} / 40`;button.setAttribute('aria-pressed',String(onlySelected));$('[data-publish]').disabled=!selected.size;
   const rows=visible(),hidden=[...selected].filter(id=>!rows.some(q=>q.id===id)).length;
   $('[data-scope]').textContent=onlySelected?'当前仅显示已选题目':(initial.ids?`${initial.ids.length} 题 · 原卷顺序`:[type==='short'?unitLabel:filterTopic?'Topic '+filterTopic:unitLabel,type==='choice'?'MCQ':type==='short'?'FRQ':'MCQ + FRQ',skill?'Skill '+skill:'',collection,statusFilter==='ready'?'已核对':statusFilter?'待核对':''].filter(Boolean).join(' · '))+(hidden?` · ${hidden} 道已选题在当前筛选之外`:'');
   const scope=$('[data-scope]');scope.hidden=Boolean(initial.ids&&!onlySelected&&!hidden);
   const count=$('[data-filter-count]');if(count)count.textContent=[skill,collection,statusFilter].filter(Boolean).length?` · ${[skill,collection,statusFilter].filter(Boolean).length}`:'';
   const current=$('[data-preview-select]');if(current&&preview){current.textContent=selected.has(preview.id)?'已加入作业':'加入作业';current.setAttribute('aria-pressed',String(selected.has(preview.id)));current.disabled=!preview.questionImages?.length;}
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
    const options=q.type==='choice'?questionOptions(q):[];
    return `<section class="lib-review" data-review-id="${h(q.id)}"><div class="lib-review-head"><h3>核对答案</h3><span class="lib-status" data-ready="${q.status==='ready'}">${q.status==='ready'?'已核对':'待核对'}</span></div>${options.length?`<div class="lib-answer-options">${options.map(o=>`<button type="button" data-answer="${h(o.label)}" aria-pressed="${q.answer===o.label}"><b>${h(o.label)}</b><span>${h(o.text)}</span></button>`).join('')}</div>`:`<p class="lib-review-note">${q.type==='choice'?'未识别到选项文字，请对照上方原图直接选择。':'简答题需核对评分点，不能用 A–E 答案标为已核对。'}</p>`}<div class="lib-answer-actions"><button type="button" data-suggest ${q.type!=='choice'?'hidden disabled':''}>AI 建议答案</button><button type="button" data-answer-upload>上传答案</button><button type="button" data-reslice-toggle>框选 / 多页切片</button><button type="button" class="primary" data-answer-save ${q.type!=='choice'?'hidden disabled':''}>保存并核对</button></div><p class="lib-review-note" data-review-note role="status">${q.answerSuggestion?`AI 建议：${h(q.answerSuggestion.answer)} · ${h(q.answerSuggestion.reason||'')}`:''}</p><input type="file" hidden data-answer-file accept="image/*,application/pdf"></section>`;
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
    panel.querySelector('[data-reslice-toggle]').onclick=()=>location.assign('/teacher/#bank/crop/'+encodeURIComponent(q.id));
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
   $('.lib-question-list').innerHTML=rows.map(q=>`<div class="lib-question-row"><label><input type="checkbox" aria-label="选择第 ${q.number} 题" data-select="${h(q.id)}" ${q.questionImages?.length?'':'disabled'} ${selected.has(q.id)?'checked':''}></label><button data-preview="${h(q.id)}"><strong>Question ${q.number}</strong><small>${h(q.source)}</small><span>${highlightText((q.searchText||'').slice(0,100),search)}</span></button></div>`).join('')||'<p>没有匹配的题目。</p>';
   main.querySelectorAll('[data-select]').forEach(b=>b.onchange=()=>{if(!select(b.dataset.select,b.checked))b.checked=false;if(onlySelected)draw();else update();});
   main.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>{show(qs.find(q=>q.id===b.dataset.preview));if(matchMedia('(max-width:900px)').matches)$('.lib-bank-directory').open=false;});
   if(rows.length)show(rows.find(q=>q.id===preview?.id)||rows[0]);else{preview=null;$('.lib-question-preview').innerHTML='<p class="lib-empty">'+(onlySelected?'尚未选择题目。点击“已选”可返回全部题目。':'没有匹配的题目。调整筛选或清空搜索即可继续。')+'</p>';}update();
  }
  const bind=(selector,fn)=>{const el=$(selector);if(el)el.onchange=e=>{fn(e.target.value);onlySelected=false;draw();};};
  bind('[data-filter-topic]',v=>filterTopic=v);bind('[data-type]',v=>type=v);bind('[data-skill]',v=>skill=v);bind('[data-collection]',v=>collection=v);bind('[data-filter-status]',v=>statusFilter=v);
  const input=$('.lib-search input');if(input)input.oninput=e=>{search=e.target.value.trim();draw();};
  $('[data-selected-view]').onclick=()=>{onlySelected=!onlySelected;draw();};
  $('[data-pick]').onclick=()=>{for(const q of visible().filter(q=>q.questionImages?.length)){if(selected.size>=40)break;selected.add(q.id);}$('.lib-selection-more').open=false;draw();};
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
