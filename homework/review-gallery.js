import {pdfLibrary,openPDF} from './pdf-reader.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function mountReviewGallery(root,{files=[],text='',storageKey=''}={}) {
  const pages=files.flatMap(f=>Array.from({length:f.mime==='application/pdf'?Math.max(1,f.pages||1):1},(_,i)=>({file:f,page:i+1,key:f.id+':'+(i+1)})));
  if(text.trim())pages.push({text,key:'text'});
  let persistTimer;let current=0,stamp=0,destroyed=false,asset=null,pdfRender=null,renderTimer,resizeFrame,gestureFrame,gesture=null,drag=null,lastTap=null;
  const docs=new Map(),images=new Map(),positions=new Map();let zoom=1,rotation=0,mode='width';
  let cached;try{cached=JSON.parse(sessionStorage.getItem(storageKey));}catch{}
  if(cached?.positions)for(const [k,v] of cached.positions)positions.set(k,v);
  if(Number.isInteger(cached?.current))current=clamp(cached.current,0,Math.max(0,pages.length-1));
  root.innerHTML=`<div class="rv-viewport" tabindex="0" aria-label="学生作答大图，可滚动和缩放"><div class="rv-stage"></div></div><div class="rv-image-status" role="status"></div><div class="rv-gallery-bar"><button type="button" data-gallery="prev" aria-label="上一页">‹</button><nav class="rv-page-strip" aria-label="作答页码">${pages.map((p,i)=>`<button type="button" data-page="${i}" aria-label="${p.text?'文字作答':'第 '+(i+1)+' 页'}">${p.text?'文字':i+1}</button>`).join('')}</nav><button type="button" data-gallery="next" aria-label="下一页">›</button><button type="button" data-gallery="album" aria-expanded="false" title="展开所有页面">全部页 <span class="rv-page-count">${pages.length}</span></button><span class="rv-tool-divider"></span><button type="button" data-gallery="minus" aria-label="缩小作答">−</button><output class="rv-zoom" aria-label="缩放比例">100%</output><button type="button" data-gallery="plus" aria-label="放大作答">＋</button><button type="button" data-gallery="fit" class="rv-fit">整页</button><button type="button" data-gallery="fullscreen" aria-label="全屏浏览作答" aria-pressed="false">⛶</button><details class="rv-gallery-more"><summary aria-label="更多图片工具">⋯</summary><div><button type="button" data-gallery="width">适合宽度</button><button type="button" data-gallery="rotate">顺时针旋转</button><a class="rv-download" download>下载原件</a></div></details></div><div class="rv-album" hidden role="region" aria-label="所有作答页面"><div class="rv-album-head"><strong>作答页面</strong><button type="button" data-gallery="album-close" aria-label="收起页面相册">收起</button></div><div class="rv-thumbnails">${pages.map((p,i)=>`<button type="button" data-thumb="${i}">${p.text?'<span class="rv-thumb-symbol">Aa</span>':p.file.mime==='application/pdf'?`<span class="rv-thumb-symbol">PDF <small>${p.page}</small></span>`:`<img loading="lazy" src="/api/homework/files/${encodeURIComponent(p.file.id)}" alt="">`}<span>${p.text?'文字作答':'第 '+(i+1)+' 页'}</span></button>`).join('')}</div></div>`;
  const $=s=>root.querySelector(s),viewport=$('.rv-viewport'),stage=$('.rv-stage'),status=$('.rv-image-status');
  const sourceUrl=p=>'/api/homework/files/'+encodeURIComponent(p.file.id);
  function remember(){if(!asset||!pages[current])return;positions.set(pages[current].key,{zoom,rotation,mode,left:viewport.scrollLeft,top:viewport.scrollTop});clearTimeout(persistTimer);persistTimer=setTimeout(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify({current,positions:[...positions]}));}catch{}},150);}
  function dimensions(){const turned=rotation%180!==0;return {w:turned?asset.h:asset.w,h:turned?asset.w:asset.h};}
  function fitScale(){const {w,h}=dimensions(),width=Math.max(120,viewport.clientWidth-24);return mode==='page'?Math.min(width/w,Math.max(120,viewport.clientHeight-24)/h):width/w;}
  function layout(){if(!asset||asset.text)return;const {w,h}=dimensions(),scale=fitScale()*zoom;stage.style.width=w*scale+'px';stage.style.height=h*scale+'px';asset.el.style.width=asset.w+'px';asset.el.style.height=asset.h+'px';asset.el.style.transform=`translate(-50%,-50%) rotate(${rotation}deg) scale(${scale})`;controls();}
  function controls(){
    root.querySelectorAll('[data-page]').forEach((b,i)=>b.setAttribute('aria-current',i===current?'page':'false'));
    root.querySelectorAll('[data-thumb]').forEach((b,i)=>b.setAttribute('aria-current',i===current?'page':'false'));
    $('[data-gallery=prev]').disabled=current<=0;$('[data-gallery=next]').disabled=current>=pages.length-1;
    const disabled=!asset||!!asset.text;for(const action of ['minus','plus','fit','width','rotate'])$(`[data-gallery=${action}]`).disabled=disabled;
    $('[data-gallery=minus]').disabled=disabled||zoom<=.5;$('[data-gallery=plus]').disabled=disabled||zoom>=4;
    $('.rv-zoom').textContent=disabled?'—':Math.round(zoom*100)+'%';$('.rv-fit').textContent=mode==='page'?'宽度':'整页';
    const p=pages[current];$('.rv-download').hidden=!p?.file;if(p?.file)$('.rv-download').href=sourceUrl(p)+'?download=1';
    const selected=$('.rv-page-strip [aria-current=page]'),strip=$('.rv-page-strip');if(selected){if(selected.offsetLeft<strip.scrollLeft)strip.scrollLeft=selected.offsetLeft;else if(selected.offsetLeft+selected.offsetWidth>strip.scrollLeft+strip.clientWidth)strip.scrollLeft=selected.offsetLeft+selected.offsetWidth-strip.clientWidth;}
    viewport.setAttribute('aria-label',p?.text?'学生文字作答':`学生作答第 ${current+1} 页，可滚动和缩放`);
  }
  function changeView(fn,point){
    if(!asset||asset.text)return;const box=viewport.getBoundingClientRect(),old=stage.getBoundingClientRect();const x=point?.x??box.left+viewport.clientWidth/2,y=point?.y??box.top+Math.min(viewport.clientHeight/2,240);
    const rx=(x-old.left)/old.width,ry=(y-old.top)/old.height;fn();layout();const next=stage.getBoundingClientRect();viewport.scrollLeft+=next.left+rx*next.width-x;viewport.scrollTop+=next.top+ry*next.height-y;remember();
    clearTimeout(renderTimer);renderTimer=setTimeout(()=>void renderPDF(),180);
  }
  function setZoom(value,point){changeView(()=>{zoom=clamp(value,.5,4);},point);}
  async function imageFor(p){if(!images.has(p.file.id)){const img=new Image();img.decoding='async';img.draggable=false;img.alt='学生原始作答';const ready=new Promise((resolve,reject)=>{img.onload=()=>resolve(img);img.onerror=()=>{images.delete(p.file.id);reject(Error('图片暂未加载，请重试'));};});img.src=sourceUrl(p);images.set(p.file.id,ready);}return images.get(p.file.id);}
  async function pdfFor(p){if(!docs.has(p.file.id)){const lib=await pdfLibrary();if(destroyed)throw Error('closed');const task=openPDF(p.file.id,lib);docs.set(p.file.id,task);}const task=docs.get(p.file.id);try{return await task.promise;}catch(e){if(docs.get(p.file.id)===task)docs.delete(p.file.id);void task.destroy().catch(()=>{});throw e;}}
  async function renderPDF(){
    const target=asset,token=stamp;if(!target?.pdf||destroyed)return;pdfRender?.cancel();const canvas=document.createElement('canvas'),scale=fitScale()*zoom,density=Math.min(devicePixelRatio||1,2,Math.sqrt(9000000/(target.w*target.h*scale*scale))),view=target.pdf.getViewport({scale:scale*density});canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);const task=target.pdf.render({canvasContext:canvas.getContext('2d'),viewport:view});pdfRender=task;
    try{await task.promise;if(destroyed||token!==stamp||target!==asset)return;canvas.className='rv-sheet';canvas.setAttribute('role','img');canvas.setAttribute('aria-label','学生 PDF 原始作答，第 '+pages[current].page+' 页');target.el.replaceWith(canvas);target.el=canvas;layout();status.textContent='';}
    catch(e){if(e.name!=='RenderingCancelledException'&&token===stamp&&!destroyed)showError('PDF 页面暂未加载，请重试');}
    finally{if(pdfRender===task)pdfRender=null;}
  }
  function showError(message){status.innerHTML=`<span>${escape(message)}</span><button type="button">重试</button>`;status.querySelector('button').onclick=()=>show(current,false);}
  async function show(index,save=true){
    if(destroyed||!pages.length)return;if(save)remember();current=clamp(index,0,pages.length-1);const token=++stamp,p=pages[current];pdfRender?.cancel();clearTimeout(renderTimer);gesture=null;drag=null;asset=null;status.textContent='正在加载作答…';stage.replaceChildren();stage.style.cssText='';stage.classList.toggle('rv-text-page',!!p.text);controls();
    try{
      const position=positions.get(p.key);zoom=position?.zoom||1;rotation=position?.rotation||0;mode=position?.mode||'width';
      if(p.text){const article=document.createElement('article');article.textContent=p.text;stage.append(article);asset={text:true};status.textContent='';}
      else if(p.file.mime==='application/pdf'){const doc=await pdfFor(p),pdf=await doc.getPage(p.page);if(destroyed||token!==stamp)return;const size=pdf.getViewport({scale:1}),el=document.createElement('canvas');el.className='rv-sheet';stage.append(el);asset={w:size.width,h:size.height,el,pdf};layout();await renderPDF();}
      else{const img=await imageFor(p);if(destroyed||token!==stamp)return;img.className='rv-sheet';stage.append(img);asset={w:img.naturalWidth,h:img.naturalHeight,el:img};layout();status.textContent='';}
      if(destroyed||token!==stamp)return;viewport.scrollLeft=position?.left||0;viewport.scrollTop=position?.top||0;controls();remember();
      // Decode adjacent photos only, and keep a bounded cache for large uploads.
      for(const neighbor of [pages[current+1],pages[current-1]])if(neighbor?.file?.mime.startsWith('image/'))void imageFor(neighbor).catch(()=>{});
      for(const id of [...images.keys()])if(!pages.slice(Math.max(0,current-1),current+2).some(p=>p.file?.id===id))images.delete(id);
    }catch(e){if(!destroyed&&token===stamp)showError(e.message==='closed'?'页面已关闭':e.message);}
  }
  function album(open){$('.rv-album').hidden=!open;$('[data-gallery=album]').setAttribute('aria-expanded',String(open));if(open)$('.rv-thumbnails button')?.focus();else $('[data-gallery=album]').focus({preventScroll:true});}
  function full(){const shell=root.closest('.review-studio'),value=shell.dataset.imageOnly!=='true';shell.dataset.imageOnly=String(value);$('[data-gallery=fullscreen]').setAttribute('aria-pressed',String(value));$('[data-gallery=fullscreen]').setAttribute('aria-label',value?'退出全屏浏览':'全屏浏览作答');}
  root.addEventListener('click',e=>{
    const page=e.target.closest('[data-page],[data-thumb]');if(page){const index=Number(page.dataset.page??page.dataset.thumb);void show(index);if(page.hasAttribute('data-thumb'))album(false);return;}
    const action=e.target.closest('[data-gallery]')?.dataset.gallery;
    if(action==='prev')void show(current-1);if(action==='next')void show(current+1);
    if(action==='plus')setZoom(zoom*1.25);if(action==='minus')setZoom(zoom/1.25);
    if(action==='fit'||action==='width'){changeView(()=>{mode=action==='width'||mode==='page'?'width':'page';zoom=1;});viewport.scrollLeft=0;viewport.scrollTop=0;remember();}
    if(action==='rotate')changeView(()=>{rotation=(rotation+90)%360;});
    if(action==='album')album($('.rv-album').hidden);if(action==='album-close')album(false);if(action==='fullscreen')full();
    if(action&&action!=='album')$('.rv-gallery-more').open=false;
  });
  viewport.addEventListener('dblclick',e=>{if(e.pointerType==='touch')return;setZoom(zoom>1?1:2,{x:e.clientX,y:e.clientY});});
  viewport.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();setZoom(zoom*Math.exp(-e.deltaY*.008),{x:e.clientX,y:e.clientY});}},{passive:false});
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||!asset||asset.text)return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');e.preventDefault();});
  viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left-e.clientX+drag.x;viewport.scrollTop=drag.top-e.clientY+drag.y;}});
  const endDrag=()=>{drag=null;viewport.classList.remove('is-dragging');remember();};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);viewport.addEventListener('lostpointercapture',endDrag);
  const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  viewport.addEventListener('touchstart',e=>{if(e.touches.length===2&&asset&&!asset.text){gesture={distance:distance(e.touches),zoom};lastTap=null;}else if(e.touches.length===1){const t=e.touches[0];lastTap={...(lastTap||{}),x:t.clientX,y:t.clientY,start:Date.now(),moved:false};}},{passive:true});
  viewport.addEventListener('touchmove',e=>{if(gesture&&e.touches.length===2){e.preventDefault();const value=gesture.zoom*distance(e.touches)/gesture.distance,point={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};cancelAnimationFrame(gestureFrame);gestureFrame=requestAnimationFrame(()=>setZoom(value,point));}else if(lastTap)lastTap.moved=true;},{passive:false});
  viewport.addEventListener('touchend',e=>{if(gesture){gesture=null;lastTap=null;return;}if(lastTap&&!lastTap.moved&&Date.now()-lastTap.start<250){if(lastTap.previous&&Date.now()-lastTap.previous<350){setZoom(zoom>1?1:2,{x:lastTap.x,y:lastTap.y});lastTap=null;}else lastTap.previous=Date.now();}},{passive:true});
  viewport.addEventListener('touchcancel',()=>{gesture=null;lastTap=null;cancelAnimationFrame(gestureFrame);},{passive:true});
  viewport.addEventListener('scroll',remember,{passive:true});
  const keydown=e=>{if(e.target.closest('input,textarea,select,[contenteditable]'))return;if(e.key==='Escape'){if(!$('.rv-album').hidden)album(false);else if(root.closest('.review-studio').dataset.imageOnly==='true')full();return;}if(['ArrowLeft','ArrowRight','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')void show(current-1);if(e.key==='ArrowRight')void show(current+1);if(e.key==='+')setZoom(zoom*1.25);if(e.key==='-')setZoom(zoom/1.25);}};root.addEventListener('keydown',keydown);
  let width=0;const observer=new ResizeObserver(()=>{if(width===viewport.clientWidth&&mode!=='page')return;width=viewport.clientWidth;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{layout();clearTimeout(renderTimer);renderTimer=setTimeout(()=>void renderPDF(),180);});});observer.observe(viewport);
  if(pages.length)void show(current,false);else{status.textContent='这份提交没有作答附件或文字';controls();}
  return {destroy(){remember();clearTimeout(persistTimer);try{sessionStorage.setItem(storageKey,JSON.stringify({current,positions:[...positions]}));}catch{}destroyed=true;stamp++;observer.disconnect();clearTimeout(renderTimer);cancelAnimationFrame(resizeFrame);cancelAnimationFrame(gestureFrame);pdfRender?.cancel();for(const task of docs.values())void task.destroy().catch(()=>{});images.clear();}};
}
