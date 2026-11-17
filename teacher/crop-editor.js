import {cropDrag,regionBox} from './crop-geometry.js';

// Drafts belong to the question, not the displayed PDF page.
export function mountCropEditor({main,queue,hw,h,toast,dirty}){
 let qi=0,q,parts=[],active=0,page=1,data,seq=0,disposed=false,saving=false,drag,observer,zoom=1;
 const $=s=>main.querySelector(s),valid=b=>Array.isArray(b)&&b.every(Number.isFinite)&&b[2]-b[0]>=12&&b[3]-b[1]>=12;
 const changed=()=>parts.some(p=>p.edited&&valid(p.bbox));
 const target=()=>parts[active];
 const blank=p=>({page:p,bbox:null,mode:'append',edited:false});
 main.innerHTML=`<section class="slice-editor"><header class="slice-heading"><a href="#bank" class="tw-button">返回题库</a><h2>编辑题目切片</h2><span class="slice-status" role="status" aria-live="polite"></span><button class="tw-button tw-primary" data-save disabled>保存全部切片</button></header><div class="slice-question-nav"><button class="tw-button tw-small" data-question="-1">上一题</button><strong data-title></strong><button class="tw-button tw-small" data-question="1">下一题</button></div><div class="slice-parts" aria-label="本题切片，按此顺序展示"></div><div class="slice-tools"><button class="tw-button tw-small" data-add>＋追加切片</button><button class="tw-button tw-small" data-undo>撤销本片修改</button><span class="slice-divider"></span><button class="tw-button tw-small" data-page="-1" aria-label="上一页">‹</button><label class="slice-page-label">原卷 <input data-page-input type="number" min="1" value="1" aria-label="原卷页码"> / <span data-total>—</span></label><button class="tw-button tw-small" data-page="1" aria-label="下一页">›</button><button class="tw-button tw-small" data-browse aria-pressed="false">浏览 / 滚动</button><button class="tw-button tw-small" data-zoom>放大</button><details class="slice-precise"><summary>精确调整</summary><div>${['左','上','右','下'].map((label,i)=>`<label>${label}<input type="number" data-coordinate="${i}" step="1"></label>`).join('')}</div></details></div><p class="slice-tip">拖动框选；框内移动，边角缩放。跨页内容用「追加切片」，统一保存到本题。</p><div class="slice-stage" aria-busy="true"></div></section>`;
 const status=text=>$('.slice-status').textContent=text;
 function update(){
   dirty(changed());$('[data-save]').disabled=saving||!changed();
   status(saving?'正在保存…':changed()?`${parts.filter(p=>p.edited&&valid(p.bbox)).length} 片待保存`:'已保存的切片按下列顺序展示');
   $('.slice-parts').innerHTML=parts.map((p,i)=>`<button class="slice-part ${i===active?'is-active':''}" data-part="${i}" aria-pressed="${i===active}" aria-label="片段 ${i+1}，原卷第 ${p.page} 页${p.edited?'，待保存':''}">${p.preview||p.image&&!p.edited?`<img src="${p.preview||'/api/homework/files/'+encodeURIComponent(p.image)}" alt="" loading="lazy">`:`<span class="slice-part-symbol">${valid(p.bbox)?'▧':'＋'}</span>`}<span>片段 ${i+1}<small>p.${p.page}${p.edited?' · 待保存':''}</small></span></button>`).join('');
   $('.slice-editor').classList.toggle('is-saving',saving);
   main.querySelectorAll('[data-add],[data-undo],[data-zoom],[data-question],[data-page],[data-page-input],[data-part],[data-browse],[data-coordinate]').forEach(b=>b.disabled=saving);
   main.querySelectorAll('[data-question]').forEach(b=>{b.disabled=saving||queue.length<2;b.hidden=queue.length<2;});
   $('[data-undo]').disabled=saving||!target()?.edited;
   if(data){$('[data-page="-1"]').disabled=saving||page<=1;$('[data-page="1"]').disabled=saving||page>=data.totalPages;}
 }
 function preview(){
   const p=target(),img=$('.slice-original');if(!p||!valid(p.bbox)||!img?.complete||!img.naturalWidth||!data)return;
   const b=p.bbox,canvas=document.createElement('canvas'),sx=img.naturalWidth/data.baseWidth,sy=img.naturalHeight/data.baseHeight;canvas.width=100;canvas.height=Math.min(800,Math.max(1,Math.round(100*(b[3]-b[1])/(b[2]-b[0]))));
   canvas.getContext('2d').drawImage(img,b[0]*sx,b[1]*sy,(b[2]-b[0])*sx,(b[3]-b[1])*sy,0,0,canvas.width,canvas.height);p.preview=canvas.toDataURL('image/jpeg',.75);
 }
 function draw(){
   const box=$('.slice-box'),b=target()?.page===page?target().bbox:null;if(!box||!data)return;
   box.hidden=!b;if(!b)return;
   Object.assign(box.style,{left:100*b[0]/data.baseWidth+'%',top:100*b[1]/data.baseHeight+'%',width:100*(b[2]-b[0])/data.baseWidth+'%',height:100*(b[3]-b[1])/data.baseHeight+'%'});
   main.querySelectorAll('[data-coordinate]').forEach(i=>i.value=Math.round(b[Number(i.dataset.coordinate)]));
 }
 function finish(cancel=false){
   if(!drag)return;const previous=drag;drag=null;
   if(cancel||!valid(target().bbox)){target().bbox=previous.before;target().edited=previous.edited;}
   else target().edited=true;
   const canvas=$('.slice-canvas');if(canvas?.hasPointerCapture(previous.pointer))canvas.releasePointerCapture(previous.pointer);
   draw();if(!cancel)preview();update();
 }
 function wire(){
   const canvas=$('.slice-canvas'),img=$('.slice-original');
   const point=e=>{const r=img.getBoundingClientRect();return[(e.clientX-r.left)/r.width*data.baseWidth,(e.clientY-r.top)/r.height*data.baseHeight];};
   canvas.onpointerdown=e=>{
     if(saving||drag||e.button!==0||canvas.classList.contains('is-browsing'))return;
     e.preventDefault();const p=target(),start=point(e),mode=e.target.closest('[data-handle]')?.dataset.handle||(e.target.closest('.slice-box')?'move':'draw');
     drag={pointer:e.pointerId,start,mode,before:p.bbox?.slice()||null,edited:p.edited};
     if(mode==='draw')p.bbox=cropDrag({start,point:start,width:data.baseWidth,height:data.baseHeight});
     canvas.setPointerCapture(e.pointerId);$('.slice-box').focus({preventScroll:true});draw();
   };
   canvas.onpointermove=e=>{if(!drag||drag.pointer!==e.pointerId)return;target().bbox=cropDrag({...drag,box:drag.before,point:point(e),width:data.baseWidth,height:data.baseHeight});draw();};
   canvas.onpointerup=e=>{if(drag?.pointer===e.pointerId)finish();};
   canvas.onpointercancel=()=>finish(true);canvas.onlostpointercapture=()=>finish(true);
   observer?.disconnect();observer=new ResizeObserver(draw);observer.observe(img);
 }
 async function showPage(next){
   finish();const request=++seq;page=next;data=null;observer?.disconnect();
   $('[data-page-input]').value=page;$('.slice-stage').setAttribute('aria-busy','true');$('.slice-stage').innerHTML='<p class="tw-loading">正在载入原卷…</p>';
   try{
     const result=await hw(`library/questions/${encodeURIComponent(q.id)}/source-page?page=${page}`);
     if(disposed||request!==seq)return;data=result;if(target().mode==='replace'&&!target().bbox)target().bbox=regionBox(q.regions?.[target().index],data.baseWidth,data.baseHeight);$('[data-total]').textContent=data.totalPages;$('[data-page-input]').max=data.totalPages;
     $('.slice-stage').innerHTML=`<div class="slice-canvas ${$('[data-browse]').getAttribute('aria-pressed')==='true'?'is-browsing':''}"><img class="slice-original" src="${h(data.image)}" alt="原卷第 ${page} 页" draggable="false"><div class="slice-box" tabindex="0" role="group" aria-label="当前切片框，可拖动或用方向键移动" hidden><span class="slice-box-label">片段 ${active+1}</span>${['nw','n','ne','e','se','s','sw','w'].map(dir=>`<span class="slice-handle" data-handle="${dir}" aria-hidden="true"></span>`).join('')}</div></div>`;
     $('.slice-canvas').style.width=100*zoom+'%';$('.slice-canvas').style.maxWidth=860*zoom+'px';wire();draw();update();
   }catch(e){if(!disposed&&request===seq){$('.slice-stage').innerHTML=`<p class="tw-empty">${h(e.message)} <button class="tw-button" data-retry>重试此页</button></p>`;$('[data-retry]').onclick=()=>showPage(page);}}
   finally{if(!disposed&&request===seq)$('.slice-stage').setAttribute('aria-busy','false');}
 }
 async function openQuestion(index){
   if(saving)return;if(changed()&&!confirm('本题有未保存的切片，放弃修改并切换题目？'))return;
   qi=index;q=queue[qi];if(!q){main.innerHTML='<p class="tw-empty">没有待补切的题目。可从题库任意题目进入「补图」。</p>';return;}
   parts=(q.questionImages||[]).map((image,index)=>({image,index,mode:'replace',page:Number(q.regions?.[index]?.page||q.sourcePages?.[0]||1),bbox:q.regions?.[index]?.bbox?.slice()||null,edited:false}));
   if(!parts.length)parts=[blank(Number(q.sourcePages?.[0]||1))];active=0;
   $('[data-title]').textContent=`第 ${q.number||''} 题 · ${q.unitTitle||q.unitId||''}`;update();await showPage(target().page);
 }
 function add(pageNumber=page){
   finish();if(parts[active]?.mode==='append'&&!valid(parts[active].bbox))parts.splice(active,1);
   parts.push(blank(pageNumber));active=parts.length-1;update();return showPage(pageNumber);
 }
 main.onclick=e=>{
   const b=e.target.closest('button');if(!b||b.disabled||saving)return;
   if(b.hasAttribute('data-part')){finish();active=Number(b.dataset.part);update();void showPage(target().page);}
   if(b.hasAttribute('data-add'))void add();
   if(b.hasAttribute('data-zoom')){zoom=zoom===1?1.5:zoom===1.5?2:1;b.textContent=zoom===1?'放大':Math.round(zoom*100)+'%';const c=$('.slice-canvas');if(c){c.style.width=100*zoom+'%';c.style.maxWidth=860*zoom+'px';draw();}}
   if(b.hasAttribute('data-undo')){const p=target();if(p.mode==='append'){parts.splice(active,1);if(!parts.length)parts=[blank(page)];active=Math.min(active,parts.length-1);}else{p.bbox=q.regions?.[p.index]?.bbox?.slice()||null;p.page=Number(q.regions?.[p.index]?.page||q.sourcePages?.[0]||1);p.edited=false;delete p.preview;}update();void showPage(target().page);}
   if(b.hasAttribute('data-question'))void openQuestion((qi+Number(b.dataset.question)+queue.length)%queue.length);
   if(b.hasAttribute('data-page')&&data){const n=page+Number(b.dataset.page);if(n>=1&&n<=data.totalPages)void add(n);}
   if(b.hasAttribute('data-browse')){const browsing=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(browsing));$('.slice-canvas')?.classList.toggle('is-browsing',browsing);b.textContent=browsing?'返回框选':'浏览 / 滚动';}
   if(b.hasAttribute('data-save'))void save();
 };
 $('[data-page-input]').onchange=e=>{const n=Number(e.target.value);if(data&&Number.isInteger(n)&&n>=1&&n<=data.totalPages)void add(n);else{e.target.value=page;toast('请输入原卷范围内的页码');}};
 main.querySelectorAll('[data-coordinate]').forEach(input=>input.onchange=()=>{
   const b=[...main.querySelectorAll('[data-coordinate]')].map(i=>Number(i.value));
   if(data&&valid(b)&&b[0]>=0&&b[1]>=0&&b[2]<=data.baseWidth&&b[3]<=data.baseHeight){target().bbox=b;target().edited=true;draw();preview();update();}else{toast('范围应位于原页内，且宽高至少 12');draw();}
 });
 const key=e=>{
   if(e.key==='Escape'&&drag){e.preventDefault();finish(true);return;}
   if(e.target.closest('.slice-box')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)&&valid(target()?.bbox)&&data&&!saving){
     e.preventDefault();const step=e.shiftKey?10:1;target().bbox=cropDrag({mode:'move',box:target().bbox,start:[target().bbox[0],target().bbox[1]],point:[target().bbox[0]+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),target().bbox[1]+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)],width:data.baseWidth,height:data.baseHeight});target().edited=true;draw();preview();update();
   }
 };
 main.addEventListener('keydown',key);
 async function save(){
   finish();const slices=parts.filter(p=>p.edited&&valid(p.bbox)).map(({mode,index,page,bbox})=>({mode,index,page,bbox}));if(!slices.length)return;
   saving=true;update();try{
     const result=await hw(`library/questions/${encodeURIComponent(q.id)}/reslice`,{method:'POST',body:{revision:Number(q.version||1),slices}});
     if(disposed)return;queue[qi]={...result.question,unitTitle:q.unitTitle};parts.forEach(p=>p.edited=false);dirty(false);saving=false;await openQuestion(qi);toast('已保存，所有切片将一起展示在本题中');
   }catch(e){if(!disposed)toast(e.message);}
   finally{saving=false;if(!disposed)update();}
 }
 void openQuestion(0);
 return {destroy(){disposed=true;++seq;observer?.disconnect();main.removeEventListener('keydown',key);main.onclick=null;}};
}
