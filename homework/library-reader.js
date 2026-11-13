import {pdfLibrary,openPDF} from './pdf-reader.js';
import {mountInk} from './ink.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const documents=new Map();
async function acquire(fileId,userId){
 const key=userId+':'+fileId;let item=documents.get(key);
 if(!item){const lib=await pdfLibrary();item={task:openPDF(fileId,lib),used:0,at:Date.now()};documents.set(key,item);}
 item.used++;item.at=Date.now();clearTimeout(item.timer);
 try{const pdf=await item.task.promise;return {pdf,release(){item.used--;item.at=Date.now();item.timer=setTimeout(()=>{if(!item.used){documents.delete(key);void item.task.destroy().catch(()=>{});}},90000);for(const [k,v] of documents)if(documents.size>2&&!v.used){clearTimeout(v.timer);documents.delete(k);void v.task.destroy().catch(()=>{});}}};}
 catch(e){documents.delete(key);item.used--;throw e;}
}
export async function mountLibraryReader(root,{resource:r,unitId,topic,kind,project=false,state,api,post,put,toast}){
 const events=new AbortController(),renders=new Set();let stopped=false,lease,ink,activeFrame,renderVersion=0,page,requested,zoom=1,channel,timer,full=false,repaint=Promise.resolve();
 const posKey=`lib-position:${state.user.id}:${r.fileId}:${topic.id}`,range=topic[kind]||[1,r.pages];
 let saved;try{saved=JSON.parse(localStorage.getItem(posKey)||'null')}catch{}
 const restored=typeof saved==='number'?saved:saved?.page;
 page=Number.isInteger(restored)&&restored>=1&&restored<=r.pages?restored:range[0];requested=page;zoom=Math.max(1,Math.min(3,Number(saved?.zoom)||1));
 root.innerHTML=`<section class="lib-reader ${project?'lib-project':''}" data-kind="${kind}" tabindex="0" aria-label="${kind==='slides'?'课件':'教材'}阅读器"><div class="lib-reader-tools"><button data-prev aria-label="上一页">‹</button><details class="lib-page-menu"><summary aria-label="页码与页面目录"><span data-page-label>${page}</span> / ${r.pages} ▾</summary><div class="lib-page-popover"><label>前往页码<input data-page type="number" min="1" max="${r.pages}" value="${page}"></label><div class="lib-page-thumbs"></div></div></details><button data-next aria-label="下一页">›</button><span class="lib-tool-separator"></span><button data-zoom aria-pressed="false">放大</button><button data-focus>${project?'退出投影':'专注'}</button>${kind==='slides'&&!project?'<button class="primary" data-play>开始授课</button>':''}<details class="lib-reader-more"><summary aria-label="更多阅读操作">···</summary><div>${!project?'<button data-full>全屏</button>':''}<a href="/api/homework/files/${encodeURIComponent(r.fileId)}?download=1">下载原件</a>${state.user.role==='teacher'&&kind==='slides'&&!project?'<button data-project>打开投影窗口</button>':''}</div></details><span data-status role="status"></span><a data-project-fallback hidden target="_blank" rel="noopener">打开投影页 ↗</a></div><div class="lib-pdf-area" tabindex="0" aria-label="原页阅读区域"><div class="lib-page-stage"></div></div><p class="lib-reader-error" role="alert"></p><button data-retry hidden>重新读取当前页</button></section>`;
 const $=s=>root.querySelector(s),reader=$('.lib-reader'),area=$('.lib-pdf-area'),stage=$('.lib-page-stage'),status=$('[data-status]');
 const locked=[];
 function lockBackground(on){if(!on){for(const [el,was] of locked.splice(0))el.inert=was;return;}if(locked.length)return;let current=reader;while(current.parentElement&&current!==document.body){for(const sibling of current.parentElement.children)if(sibling!==current){locked.push([sibling,sibling.inert]);sibling.inert=true;}current=current.parentElement;}}
 const dispose=()=>{if(stopped)return;stopped=true;lockBackground(false);events.abort();clearTimeout(timer);channel?.close();for(const task of renders)task.cancel();ink?.destroy();lease?.release();document.body.classList.remove('library-focused','library-project');};
 // Install cleanup before awaiting a PDF so navigation can cancel a slow open.
 root.libraryDispose=dispose;
 function fail(e){if(stopped||e.name==='RenderingCancelledException')return;$('.lib-reader-error').textContent=e.message||'读取失败，请重试';$('[data-retry]').hidden=false;status.textContent='读取失败';}
 function persist(){try{localStorage.setItem(posKey,JSON.stringify({page,zoom,offset:area.scrollTop}))}catch{}}
 function focus(on){full=on;lockBackground(on||project);reader.classList.toggle('lib-expanded',on);document.body.classList.toggle('library-focused',on);$('[data-focus]').textContent=on?'退出专注':project?'退出投影':'专注';wake();}
 function wake(){clearTimeout(timer);reader.classList.remove('controls-hidden');if(full||project)timer=setTimeout(()=>{if(reader.querySelector('details[open],.ink-text-editor:not([hidden])')||reader.querySelector('.lib-reader-tools:focus-within,.ink-tools:focus-within')||reader.dataset.drawing==='true')return;reader.classList.add('controls-hidden');},2500);}
 reader.addEventListener('pointermove',wake,{signal:events.signal,passive:true});reader.addEventListener('pointerdown',wake,{signal:events.signal,passive:true});reader.addEventListener('focusin',wake,{signal:events.signal});reader.addEventListener('focusout',wake,{signal:events.signal});
 async function paint(p,canvas){const original=p.getViewport({scale:1}),width=Math.max(320,area.clientWidth-24),scale=Math.min(2.3,width/original.width*Math.min(devicePixelRatio||1,2)*zoom);const viewport=p.getViewport({scale});canvas.width=viewport.width;canvas.height=viewport.height;const task=p.render({canvasContext:canvas.getContext('2d'),viewport});renders.add(task);try{await task.promise;}finally{renders.delete(task);}}
 async function render(n,restore=false){
  const generation=++renderVersion;let nextInk,frame;
  status.textContent='载入中…';$('.lib-reader-error').textContent='';$('[data-retry]').hidden=true;
  try{
   const p=await lease.pdf.getPage(n);if(stopped||generation!==renderVersion)return;
   frame=document.createElement('div');frame.className='lib-page-frame lib-preparing';stage.append(frame);
   if(kind==='textbook'&&!project){const v=p.getViewport({scale:1});nextInk=await mountInk(frame,{api,put,post,userId:state.user.id,scope:{unitId,resourceId:r.fileId,page:n},background:c=>paint(p,c),aspect:v.width/v.height});}
   else{const c=document.createElement('canvas');c.className='lib-slide-canvas';c.setAttribute('aria-label',`第 ${n} 页`);frame.append(c);await paint(p,c);}
   if(stopped||generation!==renderVersion){nextInk?.destroy();frame.remove();return;}
   const oldInk=ink;oldInk?.checkpoint();void oldInk?.save().catch(()=>toast('上一页批注尚未同步，本机草稿已保留'));
   oldInk?.destroy();activeFrame?.remove();ink=nextInk;activeFrame=frame;frame.classList.remove('lib-preparing');page=n;requested=n;
   area.scrollTop=restore?(saved?.offset||0):0;area.scrollLeft=0;stage.style.setProperty('--reader-zoom',zoom);stage.classList.toggle('zoom',zoom>1);
   const zoomButton=$('[data-zoom]');zoomButton.textContent=zoom>1?'适应宽度':'放大';zoomButton.setAttribute('aria-pressed',String(zoom>1));$('[data-page]').value=page;$('[data-page-label]').textContent=page;$('[data-prev]').disabled=page<=1;$('[data-next]').disabled=page>=r.pages;status.textContent='';persist();
   channel?.postMessage({type:'page',page,resource:r.fileId});
   // Warm adjacent PDF page/operator caches only. No offscreen full-document canvas allocation.
   for(const adjacent of [page+1,page-1])if(adjacent>0&&adjacent<=r.pages)void lease.pdf.getPage(adjacent).then(p=>p.getOperatorList()).catch(()=>{});
  }catch(e){nextInk?.destroy();frame?.remove();if(generation===renderVersion)fail(e);}
 }
 const change=n=>{if(!lease)return;if(!Number.isInteger(n)||n<1||n>r.pages){$('[data-page]').value=page;return;}requested=n;return render(n);};
 $('[data-prev]').onclick=()=>change(requested-1);$('[data-next]').onclick=()=>change(requested+1);$('[data-page]').onchange=e=>{void change(+e.target.value);$('.lib-page-menu').open=false;};
 $('[data-zoom]').onclick=e=>{zoom=zoom===1?(matchMedia('(max-width:700px)').matches?2.25:1.5):1;stage.style.setProperty('--reader-zoom',zoom);stage.classList.toggle('zoom',zoom>1);e.currentTarget.textContent=zoom>1?'适应宽度':'放大';e.currentTarget.setAttribute('aria-pressed',String(zoom>1));persist();const frame=activeFrame,n=page;repaint=repaint.catch(()=>{}).then(async()=>{if(stopped||frame!==activeFrame||!lease)return;const p=await lease.pdf.getPage(n);if(stopped||frame!==activeFrame)return;const canvas=frame.querySelector('.ink-background,.lib-slide-canvas');if(canvas)await paint(p,canvas);}).catch(fail);};
 $('[data-focus]').onclick=()=>{if(project){window.close();location.replace(`/teacher/#library/${unitId}/${topic.id}/slides`);}else focus(!full);};
 if($('[data-play]'))$('[data-play]').onclick=()=>{focus(true);$('[data-play]').textContent='授课中';reader.focus({preventScroll:true});};
 if($('[data-full]'))$('[data-full]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await reader.requestFullscreen();}catch{focus(!full);}};
 async function load(){try{lease ||= await acquire(r.fileId,state.user.id);if(stopped){lease.release();return;}await render(requested,true);if(project)channel?.postMessage({type:'ready',resource:r.fileId});}catch(e){fail(e);}}
 $('[data-retry]').onclick=()=>void load();
 reader.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!project)focus(false);reader.querySelectorAll('details').forEach(d=>d.open=false);return;}if(e.target.closest('input,textarea,select,button,summary')||!['ArrowLeft','ArrowRight','PageDown','PageUp'].includes(e.key))return;e.preventDefault();void change(requested+(['ArrowRight','PageDown'].includes(e.key)?1:-1));},{signal:events.signal});
 const connect=sid=>{channel?.close();channel=new BroadcastChannel('mike-project:'+sid);channel.onmessage=e=>{const m=e.data;if(m.resource!==r.fileId)return;if(m.type==='ready'&&!project){status.textContent='投影已连接';$('[data-project-fallback]').hidden=true;channel.postMessage({type:'page',resource:r.fileId,page});}if(project&&m.type==='page'&&m.page!==page&&Number.isInteger(m.page))void change(m.page);};};
 if($('[data-project]'))$('[data-project]').onclick=()=>{const sid=crypto.randomUUID();connect(sid);const url=`/teacher/?projection=${sid}#library/${unitId}/${topic.id}/project`;const fallback=$('[data-project-fallback]');fallback.href=url;fallback.hidden=false;window.open(url,'_blank','noopener');$('.lib-reader-more').open=false;status.textContent='等待投影连接，可继续在本页授课';};
 if(project){lockBackground(true);reader.focus({preventScroll:true});document.body.classList.add('library-project');const sid=new URL(location.href).searchParams.get('projection');if(sid&&/^[\w-]{36}$/.test(sid))connect(sid);}
 await load();if(stopped)return dispose;
 let thumbsLoaded=false;
 $('.lib-page-menu').addEventListener('toggle',async()=>{if(!lease||!$('.lib-page-menu').open||thumbsLoaded)return;thumbsLoaded=true;const wrap=$('.lib-page-thumbs');for(let n=range[0];n<=range[1];n++){if(stopped)return;const b=document.createElement('button');b.type='button';b.innerHTML=`<canvas aria-hidden="true"></canvas><span>${n}</span>`;b.setAttribute('aria-label','第 '+n+' 页');b.onclick=()=>{void change(n);$('.lib-page-menu').open=false;};wrap.append(b);try{const p=await lease.pdf.getPage(n);if(stopped)return;const v=p.getViewport({scale:100/p.getViewport({scale:1}).width}),c=b.querySelector('canvas');c.width=v.width;c.height=v.height;const t=p.render({canvasContext:c.getContext('2d'),viewport:v});renders.add(t);try{await t.promise;}finally{renders.delete(t);}}catch{}}},{signal:events.signal});
 area.addEventListener('scroll',persist,{signal:events.signal,passive:true});wake();return dispose;
}
