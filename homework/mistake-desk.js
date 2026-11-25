import {mistakeTopic,topicWorkCounts} from './mistake-navigation.js';
import {openBooks} from './correction-books.js';
const key=m=>m.libraryQuestionId||JSON.stringify([m.assignmentId,m.questionId]);
export function mountMistakeDesk(ctx,{onRefresh}){
 const {main,h,toast,state}=ctx,$=s=>main.querySelector(s),shell=$('.mistake-desk'),select=$('#mistake-topic'),list=$('#mistakes-list'),rail=$('.md-topics');
 let outline={};
 ctx.api('correction-books/topics').then(r=>{outline=r.topics;if(shell.isConnected)heat();}).catch(()=>{});
 const basket=new Map();let visible=[],scoped=[],course,metric='pending',preview,delay,closeBook,saved;
 const storage='correction-basket:'+state.user.id;
 try{saved=JSON.parse(sessionStorage.getItem(storage)||'[]');if(Array.isArray(saved))for(const m of saved.slice(0,30))basket.set(key(m),m);}catch{}
 function picked(){const btn=$('[data-make-book]');btn.textContent='导出 · '+basket.size;btn.disabled=!basket.size;btn.hidden=!basket.size;
 btn.setAttribute('aria-label','导出 PDF · 已选 '+basket.size+' 道，最多 30 道');
 try{sessionStorage.setItem(storage,JSON.stringify([...basket.values()].map(({assignmentId,questionId,libraryQuestionId,assignmentTitle,questionNumber})=>({assignmentId,questionId,libraryQuestionId,assignmentTitle,questionNumber}))));}catch{}}
 function closePreview(){clearTimeout(delay);preview?.remove();preview=null;}
 function peek(row,m){closePreview();if(!row.isConnected)return;preview=document.createElement('div');preview.className='md-peek';preview.setAttribute('role','tooltip');
 preview.innerHTML='<strong>'+h(m.assignmentTitle)+' · 原题 '+h(m.questionNumber)+'</strong><p>'+h(m.prompt||'')+'</p>'+(m.questionImages||[]).map((id,i)=>'<img loading="lazy" alt="原题图 '+(i+1)+'" src="/api/homework/files/'+encodeURIComponent(id)+(m.source==='mock'?'?mock='+encodeURIComponent(m.assignmentId):'')+'">').join('')+(m.options||[]).filter(o=>o.text).map(o=>'<p>'+h(o.label)+'　'+h(o.text)+'</p>').join('');
 document.body.append(preview);const r=row.getBoundingClientRect(),pw=preview.offsetWidth;
 preview.style.left=Math.max(8,Math.min(innerWidth-pw-8,r.right+8))+'px';preview.style.top=Math.max(8,Math.min(innerHeight-preview.offsetHeight-8,r.top))+'px';
 preview.onpointerenter=()=>clearTimeout(delay);preview.onpointerleave=closePreview;}
 let positionedFor=null,paintedTopic;
 function heat(){
 paintedTopic=select.value;
 const focusTopic=rail.contains(document.activeElement)?document.activeElement.dataset.topic:null;
 const offsets=rail.scrollLeft,counts=topicWorkCounts(scoped),total=new Map();
 for(const g of scoped)for(const t of new Set([g,...(g.occurrences||[])].map(m=>mistakeTopic(m)||'unknown')))total.set(t,(total.get(t)||0)+1);
 const topics=new Set([...(outline[course]||[]),...Array.from(select.querySelectorAll('option:not([data-provisional])'),o=>o.value).filter(t=>t!=='all'),...total.keys()]);
 if(outline[course] && select.value!=='all' && !topics.has(select.value)){
   select.value='all';select.dispatchEvent(new Event('change'));return;
 }
 const group=new Map();for(const t of [...topics].sort((a,b)=>a.localeCompare(b,'en',{numeric:true}))){const u=t==='unknown'?'待关联':'Unit '+t.split('.')[0];if(!group.has(u))group.set(u,[]);group.get(u).push(t);}
 rail.innerHTML='<button type="button" data-topic="all" aria-pressed="'+(select.value==='all')+'">全部</button>'+[...group].map(([u,topics])=>'<div class="md-unit"><small>'+h(u)+'</small><div>'+topics.map(t=>{const n=metric==='pending'?(counts.get(t)?.pending||0):(total.get(t)||0),tone=n===0?0:n===1?1:n<=3?2:n<=7?3:4;return '<button type="button" data-topic="'+h(t)+'" data-tone="'+tone+'" aria-pressed="'+(select.value===t)+'" aria-label="'+h(t)+' · '+n+' 题"><small>'+h(t==='unknown'?'待关联':t)+'</small><b>'+n+'</b></button>';}).join('')+'</div></div>').join('');
 const current=rail.querySelector('[aria-pressed=true]:not([data-topic=all])');
 const first=rail.querySelector('[data-tone]:not([data-tone="0"])');
 const target=current||first;
 if(positionedFor!==course && target && (outline[course]||[]).length){
   const delta=target.getBoundingClientRect().left-rail.getBoundingClientRect().left;
   rail.scrollLeft+=delta-4;positionedFor=course;
 }else rail.scrollLeft=offsets;
 if(focusTopic)rail.querySelector('[data-topic="'+CSS.escape(focusTopic)+'"]')?.focus({preventScroll:true});
 }
 rail.onclick=e=>{const t=e.target.closest('[data-topic]')?.dataset.topic;if(!t||select.disabled)return;if(![...select.options].some(o=>o.value===t))select.add(new Option(t,t));select.value=t;select.dispatchEvent(new Event('change'));};
 $('[data-count-mode]').onchange=e=>{metric=e.target.value;positionedFor=null;rail.scrollLeft=0;heat();};
 $('[data-make-book]').onclick=()=>{closePreview();closeBook=openBooks({ctx,selection:basket,onRefresh});};
 $('[data-books]').onclick=()=>{closePreview();closeBook=openBooks({ctx,onRefresh});};
 for(const b of shell.querySelectorAll('[data-scroll-topics]'))b.onclick=()=>rail.scrollBy({left:Number(b.dataset.scrollTopics)*rail.clientWidth*.75,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 const rowFor=el=>el?.closest('[data-inline-assignment]');
 const find=r=>visible.find(m=>m.assignmentId===r.dataset.inlineAssignment&&m.questionId===r.dataset.inlineQuestion);
 list.addEventListener('focusin',e=>{const r=rowFor(e.target);if(r&&e.target.matches('[data-peek]:focus-visible')){closePreview();delay=setTimeout(()=>peek(r,find(r)),350);}});
 list.addEventListener('focusout',closePreview);
 list.onchange=e=>{const box=e.target.closest('[data-pick]');if(!box)return;const m=find(rowFor(box)),k=key(m);if(box.checked&&basket.size>=30&&!basket.has(k)){box.checked=false;toast('每册最多 30 道题');return;}if(box.checked)basket.set(k,m);else basket.delete(k);picked();};
 list.addEventListener('pointerover',e=>{const row=rowFor(e.target);if(e.pointerType==='mouse'&&row&&!row.contains(e.relatedTarget)){closePreview();delay=setTimeout(()=>peek(row,find(row)),400);}});
 list.addEventListener('pointerout',e=>{const row=rowFor(e.target);if(row&&!row.contains(e.relatedTarget)){clearTimeout(delay);delay=setTimeout(closePreview,180);}});
 list.addEventListener('click',e=>{const b=e.target.closest('[data-peek]');if(b&&!preview)peek(rowFor(b),find(rowFor(b)));else closePreview();});
 const esc=e=>{if(e.key==='Escape')closePreview();};
 const outside=e=>{if(preview&&!preview.contains(e.target)&&!e.target.closest('[data-peek]'))closePreview();};
 document.addEventListener('keydown',esc);document.addEventListener('pointerdown',outside);list.addEventListener('scroll',closePreview);
 return {update(rows,all,subject){
 const repaint=subject!==course||all!==scoped||paintedTopic!==select.value;
 if(subject!==course){positionedFor=null;rail.scrollLeft=0;}
 visible=rows;scoped=all;course=subject;closePreview();if(repaint)heat();
 for(const row of list.querySelectorAll('[data-inline-assignment]')){const m=find(row),box=document.createElement('input');box.type='checkbox';box.dataset.pick='';box.checked=basket.has(key(m));box.setAttribute('aria-label','选择 '+m.assignmentTitle+' 原题 '+m.questionNumber);row.prepend(box);
 const peekBtn=document.createElement('button');peekBtn.type='button';peekBtn.dataset.peek='';peekBtn.setAttribute('aria-label','预览原题');peekBtn.title='预览原题';peekBtn.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';row.querySelector('.actions')?.append(peekBtn);}
 picked();},destroy(){closePreview();closeBook?.();document.removeEventListener('keydown',esc);document.removeEventListener('pointerdown',outside);}};
}
