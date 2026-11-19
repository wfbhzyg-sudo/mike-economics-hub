import {deskPage,onDeskPage} from '../assets/notebook/desk-context.js';
import * as T from 'three';
import {portalCatalog,sideName} from './catalog.js';
import {studio,W,H,NOTE_W,NOTE_H,corners,PAPER_Z,NOTE_Z,gutterRise,lampHome,penHome,bendLeaf,bendPoint,leafTangency,curlHeight} from './studio.js';
import loader from '../assets/notebook/loader.svg';

const $=id=>document.getElementById(id);
const desk=$('desk'),canvas=$('scene'),cover=$('desk-cover'),flat=$('fallback'),hotspots=$('hotspots'),still=$('desk-start');
const pen=$('penSpot'),tab=$('news-tab'),prev=$('prev'),next=$('next'),lamp=$('lampSpot');
const returnKey='mike:notebook:return';
let chapters=[],locked=false,catalogCount=0,journalOrigin=null;
const journal=()=>chapters[spreadIndex]?.kind==='journal';
const firstSide=index=>chapters[index]?.kind==='end'?1:0;

const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const hover=matchMedia('(hover:hover) and (pointer:fine)');
const narrow=()=>innerWidth<=720&&innerHeight>innerWidth;
const smooth=t=>t*t*(3-2*t);
const mix=T.MathUtils.lerp;
const clamp01=t=>T.MathUtils.clamp(t,0,1);

const project=new T.Vector3(),bending=new T.Vector3();
let phase='cover',scene=null,renderer=null,camera=null;
let frame=0,lastTime=0,openness=0,spreadIndex=0,side=0,viewSide=0;
let motion=null,hovered=null,activeEntry=null,activeCorner=1;
let cornerHover=0,cornerAmount=0,sideCurl=0,closeHover=false,coverLift=0,firstDraw=true;
let lampOn=true,lampAmount=1,penGoal=penHome.clone(),penAngle=-1.10,penDrag=null,penHeld=false,penMoved=false;
let mobileGesture=null,blockedUntil=0,previousFocus=null;
let paging=false,pendingSwipe=0,turnDirection=0;
let hiddenAt=document.hidden?performance.now():null;
const buttons=new Map();
let taskLinks=[],paintedTasks;
let bookmarkContent='';

$('sketch').innerHTML=loader;
$('sketch').querySelectorAll('path').forEach(p=>p.setAttribute('pathLength','1'));

function wake(){
  if(!document.hidden&&!frame&&scene&&renderer)frame=requestAnimationFrame(draw);
}
function setPhase(value,message){
  phase=value;document.body.dataset.phase=value;
  if(message)$('status').textContent=message;
  sync();wake();
}
function pageCards(){
  return scene?.spreads[spreadIndex]?.cards||[];
}
function visibleEntries(){
  const entries=chapters[spreadIndex].entries;
  return (narrow()?entries.slice(side*2,side*2+2):entries).filter(Boolean);
}
function finalSide(index){
  if(chapters[index].kind==='end')return 1;
  if(chapters[index].kind==='journal')return chapters[index].pages[1]?1:0;
  return chapters[index].entries.slice(2).some(Boolean)?1:0;
}
function fitSide(index,value){
  return narrow()?Math.max(firstSide(index),Math.min(finalSide(index),value)):0;
}
function forwardAvailable(){
  return (narrow()&&side<finalSide(spreadIndex))||spreadIndex<(journal()?chapters.length:catalogCount)-1;
}
function backwardAvailable(){
  return (narrow()&&side>firstSide(spreadIndex))||spreadIndex>(journal()?catalogCount:0);
}
function sync(){
  const open=phase==='open'&&!locked,showRail=['open','turning','shifting'].includes(phase);
  tab.hidden=locked||!renderer||phase==='loading';
  const returning=journal()&&(!journalOrigin?.cover||phase==='open');
  tab.toggleAttribute('data-return',returning);
  tab.disabled=!open&&phase!=='cover';
  tab.setAttribute('aria-label',returning?'返回原页':'最新变化'+(tab.hasAttribute('data-unread')?'，有未读更新':''));

  prev.hidden=!open||!renderer;
  const previous=backwardAvailable()?'上一页':journal()?'返回原页':'合上笔记本';
  prev.setAttribute('aria-label',previous);prev.title=previous;
  next.hidden=!open||!forwardAvailable()||!renderer;
  $('rail').hidden=!showRail;
  $('sectionName').textContent=narrow()?sideName(chapters[spreadIndex],side,spreadIndex):chapters[spreadIndex].name;
  const section=chapters[spreadIndex];
  const from=section.pages?.[0]?.number??spreadIndex*2+1;
  const transcript=$('journal-transcript');
  transcript.textContent=journal()?(narrow()?[section.pages[side]]:section.pages).filter(Boolean).flatMap(page=>page.lines.map(line=>line.text)).join('\n'):'';
  $('pageNumber').textContent=narrow()||(journal()&&!section.pages[1])?String(from+side).padStart(2,'0'):`${String(from).padStart(2,'0')}–${String(from+1).padStart(2,'0')}`;
  document.body.dataset.spread=String(spreadIndex);
  document.body.dataset.side=String(side);document.body.dataset.bookSection=section.kind||'entries';
  cover.hidden=locked||phase!=='cover'||!renderer;
  const noScene=!scene||!renderer;
  flat.hidden=!noScene;
  canvas.hidden=noScene;
  const allow=new Set(visibleEntries());
  for(const [entry,button] of buttons){
    button.hidden=noScene||!open||!allow.has(entry);
    button.tabIndex=button.hidden?-1:0;
  }
  for(const {action,card} of taskLinks)action.hidden=buttons.get(card.item).hidden;
  if(noScene)$('rail').hidden=true;
  lamp.setAttribute('aria-pressed',String(lampOn));
  lamp.hidden=pen.hidden=noScene||phase==='loading';
}

function begin(kind,seconds,step,end){
  motion={kind,seconds,step,end,started:performance.now(),origin:0,rate:1};
  if(!renderer||!scene||reduce.matches){
    motion=null;step(1);end();wake();
  } else wake();
}
function coverMotion(open,after){
  if(open&&phase!=='cover')return;
  if(!renderer||!open&&phase!=='open')return;
  clearHover();cornerHover=cornerAmount=0;closeHover=false;dropPen();
  const start=openness,target=open?1:0;
  const lift=coverLift;
  setPhase(open?'opening':'closing',open?'正在翻开笔记本':'正在合上笔记本');
  begin('cover',open?.68:.63,t=>{openness=mix(start,target,smooth(t));coverLift=lift*(1-t);},()=>{
    if(open){setPhase('open',chapters[spreadIndex].name);if(keyboardFocus)focusEntry();}
    else{
      activeEntry=null;spreadIndex=side=viewSide=0;journalOrigin=null;trimJournal();rememberPage();
      setPhase('cover','已回到封面');$('open-cover').focus({preventScroll:true});
    }
    after?.();
  });
}
let keyboardFocus=false;
function go(direction,keyboard=false){
  if(!renderer||phase!=='open'||(direction>0&&!forwardAvailable()))return;
  if(direction<0&&!backwardAvailable()){if(journal())leaveJournal();else coverMotion(false);return;}
  clearHover();dropPen();closeHover=false;
  const inherited=Math.max(0,cornerAmount*direction);
  cornerHover=cornerAmount=0;
  paging=true;turnDirection=direction;
  if(narrow()&&((direction>0&&side<finalSide(spreadIndex))||(direction<0&&side>firstSide(spreadIndex)))){
    const start=viewSide,newSide=side+direction;
    setPhase('shifting');
    begin('side',.49,t=>{
      const progress=smooth(t);
      viewSide=mix(start,newSide,progress);
      sideCurl=(inherited*(1-progress)+Math.sin(Math.PI*progress)*.9)*direction;
    },()=>{
      viewSide=side=newSide;sideCurl=0;completePage(direction,keyboard);
    });
    return;
  }
  const target=spreadIndex+direction;
  turnTo(target,narrow()?(direction<0?finalSide(target):firstSide(target)):0,direction,keyboard,inherited);
}
async function turnTo(nextSpread,nextSide,direction,keyboard,inherited=0,after){
  clearHover();dropPen();cornerHover=cornerAmount=0;
  if(!scene.spreads[nextSpread]){
    setPhase('binding');
    try{[scene.spreads[nextSpread]]=await scene.addSpreads([chapters[nextSpread]],nextSpread);}
    catch{paging=false;pendingSwipe=0;setPhase('open','日志未能打开，请重试。');return;}
    if(!renderer)return;
  }
  const startSide=viewSide;
  const from=direction>0?0:1,to=1-from;
  const low=Math.min(spreadIndex,nextSpread),high=Math.max(spreadIndex,nextSpread);
  setPhase('turning',direction>0?'往后翻页':'往前翻页');
  configureTurn(low,high);
  poseTurn(low,high,from,inherited);
  begin('page',.66,t=>{
    const p=smooth(t);
    poseTurn(low,high,mix(from,to,p),inherited*(1-p));
    viewSide=mix(startSide,nextSide,p);
  },()=>{
    spreadIndex=nextSpread;viewSide=side=nextSide;trimJournal();completePage(direction,keyboard);after?.();
  });
}
// Only the current journal spread stays resident between turns.
function trimJournal(){
  for(let i=catalogCount;i<scene.spreads.length;i++){
    const spread=scene.spreads[i];if(i===spreadIndex||!spread)continue;
    for(const face of spread.sides){face.removeFromParent();face.geometry.dispose();face.material.map.dispose();face.material.dispose();}
    delete scene.spreads[i];
  }
}
document.addEventListener('notebook:journal',async({detail:{pages,onRead}})=>{
  if(locked||!renderer||!['open','cover'].includes(phase)||journal())return;
  journalOrigin={index:spreadIndex,side,cover:phase==='cover'};
  chapters.length=catalogCount;
  for(let i=0;i<pages.length;i+=2)chapters.push({kind:'journal',name:'更新日志',entries:[],pages:pages.slice(i,i+2)});
  const shown=()=>{
    if(!renderer||!journal())return;
    onRead();tab.focus({preventScroll:true});
    const map=scene.spreads[catalogCount]?.surfaces[0];
    if(!map)return;
    const g=map.image.getContext('2d'),start=performance.now();
    let last=0;
    const mark=now=>{
      if(!renderer||phase!=='open'||spreadIndex!==catalogCount||scene.spreads[catalogCount]?.surfaces[0]!==map)return;
      const t=reduce.matches?1:Math.min(1,(now-start)/220);
      g.save();g.strokeStyle='#996b47';g.lineWidth=2;g.beginPath();g.moveTo(50+126*last,88);g.lineTo(50+126*t,88);g.stroke();g.restore();last=t;
      map.needsUpdate=true;wake();if(t<1)requestAnimationFrame(mark);
    };
    requestAnimationFrame(mark);
  };
  if(!journalOrigin.cover){turnTo(catalogCount,0,1,false,0,shown);return;}
  setPhase('binding');
  try{[scene.spreads[catalogCount]]=await scene.addSpreads([chapters[catalogCount]],catalogCount);}
  catch{setPhase('cover','日志未能打开，请重试。');return;}
  if(!renderer)return;
  spreadIndex=catalogCount;side=viewSide=0;setPhase('cover');coverMotion(true,shown);
});
function leaveJournal(){
  if(phase!=='open'||!journalOrigin||!journal())return;
  if(journalOrigin.cover){coverMotion(false);return;}
  const origin=journalOrigin;
  turnTo(origin.index,fitSide(origin.index,origin.side),-1,false,0,()=>{journalOrigin=null;tab.focus({preventScroll:true});});
}
document.addEventListener('notebook:return',leaveJournal);
function rememberPage(leaving=false){
  try{
    const url=new URL(location.href);
    if(leaving)url.searchParams.set('deskPage',String(2*spreadIndex+side));
    else url.searchParams.delete('deskPage');
    history.replaceState({...history.state,notebookSpread:journal()?journalOrigin?.index:spreadIndex,notebookSide:journal()?journalOrigin?.side:side},'',url);
  }catch{}
}
function completePage(direction,keyboard){
  const queuedDirection=pendingSwipe;
  pendingSwipe=0;paging=false;
  side=fitSide(spreadIndex,side);viewSide=side;
  setPhase('open');
  $('status').textContent=$('sectionName').textContent+'，第 '+$('pageNumber').textContent+' 页。';
  rememberPage();
  if(queuedDirection){go(queuedDirection);return;}
  if(keyboard){
    const control=direction>0?next:prev;
    if(!control.hidden)control.focus({preventScroll:true});else focusEntry();
  }
}
function focusEntry(){
  const first=visibleEntries()[0];
  (buttons.get(first)||prev).focus({preventScroll:true});
}
function clearHover(){hovered=null;wake();}
function cornerFor(event,button){
  const r=button.getBoundingClientRect();
  return (event.clientX>=r.left+r.width/2?1:0)+(event.clientY<r.top+r.height/2?2:0);
}

function connectNotes(){
 for(const entry of chapters.flatMap(section=>section.entries).filter(Boolean)){
  const note=document.createElement('a');note.className='hot entry';note.href=entry.href;note.hidden=true;
  note.setAttribute('aria-label','进入 '+entry.title);note.dataset.entry=entry.id;
  note.onpointerenter=e=>{
    if(!hover.matches||e.pointerType==='touch'||phase!=='open')return;
    const card=pageCards().find(card=>card.item===entry);
    if(card)card.corner=cornerFor(e,note);
    hovered=entry;wake();
  };
  note.onpointerleave=()=>{if(hovered===entry)clearHover();};
  note.onfocus=()=>{
    if(!note.matches(':focus-visible'))return;
    const card=pageCards().find(c=>c.item===entry);
    if(card)card.corner=3;
    hovered=entry;wake();
  };
  note.onblur=()=>{if(hovered===entry)clearHover();};
  note.onpointerdown=e=>{if(e.pointerType==='touch'&&phase==='open')prepareDestination(entry);};
  note.onclick=e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();
    const card=pageCards().find(c=>c.item===entry);
    peel(entry,e.detail===0?3:hovered===entry&&card?card.corner:cornerFor(e,note),note);
  };
  buttons.set(entry,note);hotspots.append(note);
 }
}

$('open-cover').onclick=e=>{keyboardFocus=e.detail===0;coverMotion(true);};

for(const [button,direction] of [[prev,-1],[next,1]]){
  button.onclick=e=>go(direction,e.detail===0);
  button.onpointerenter=e=>{if(hover.matches&&e.pointerType!=='touch'){cornerHover=direction;closeHover=direction<0&&!journal()&&!backwardAvailable();wake();}};
  button.onpointerleave=()=>{if(cornerHover===direction){cornerHover=0;closeHover=false;wake();}};
  button.onfocus=()=>{if(button.matches(':focus-visible')){cornerHover=direction;closeHover=direction<0&&!journal()&&!backwardAvailable();wake();}};
  button.onblur=()=>{if(cornerHover===direction){cornerHover=0;closeHover=false;wake();}};
}
lamp.onclick=()=>{
  lampOn=!lampOn;sync();$('status').textContent=lampOn?'台灯已打开':'台灯已关闭';wake();
};
function holdPen(){
  penHeld=true;pen.setAttribute('aria-pressed','true');
  wake();
}
function dropPen(){
  if(!penHeld&&!penDrag)return;
  const id=penDrag?.id;
  penDrag=null;penHeld=false;pen.setAttribute('aria-pressed','false');
  if(id!==undefined&&pen.hasPointerCapture(id))pen.releasePointerCapture(id);
  wake();
}
function unitsPerPixel(){return (camera.top-camera.bottom)/canvas.clientHeight;}
function movePen(x,y){
  const inset=.82;
  penGoal.x=T.MathUtils.clamp(x,camera.position.x+camera.left+inset,camera.position.x+camera.right-inset);
  penGoal.y=T.MathUtils.clamp(y,camera.position.y+camera.bottom+.38,camera.position.y+camera.top-.38);
  penMoved=true;wake();
}
pen.onpointerdown=e=>{
  if(!scene||!e.isPrimary||e.button!==0||!['open','cover'].includes(phase))return;
  penDrag={id:e.pointerId,x:e.clientX,y:e.clientY,px:scene.pencil.position.x,py:scene.pencil.position.y,angle:penAngle};
  mobileGesture=null;pen.setPointerCapture(e.pointerId);holdPen();
};
pen.onpointermove=e=>{
  if(!penDrag||penDrag.id!==e.pointerId)return;
  const dx=e.clientX-penDrag.x,dy=e.clientY-penDrag.y,rate=unitsPerPixel();
  if(Math.hypot(dx,dy)<3)return;
  movePen(penDrag.px+dx*rate,penDrag.py-dy*rate);
  penAngle=penDrag.angle+T.MathUtils.clamp(dx*.002,-.20,.20);
};
pen.onpointerup=pen.onpointercancel=pen.onlostpointercapture=e=>{if(penDrag?.id===e.pointerId)dropPen();};
pen.onclick=e=>{if(e.detail===0&&!penDrag){if(penHeld)dropPen();else holdPen();}};
pen.onblur=()=>{if(!penDrag)dropPen();};

desk.addEventListener('touchstart',e=>{
  mobileGesture=null;
  if(!renderer||(!paging&&phase!=='open')||e.touches.length!==1||e.target.closest('#masthead,.prop,.page-corner,#news-tab'))return;
  const {identifier,clientX,clientY}=e.touches[0];
  if(phase==='open')blockedUntil=0;
  mobileGesture={identifier,x:clientX,y:clientY,moved:false};
},{passive:true});
desk.addEventListener('touchmove',e=>{
  if(!mobileGesture)return;
  const t=Array.from(e.touches).find(t=>t.identifier===mobileGesture.identifier);
  if(!t||e.touches.length!==1){mobileGesture=null;cornerHover=0;closeHover=false;wake();return;}
  const dx=t.clientX-mobileGesture.x,dy=t.clientY-mobileGesture.y;
  if(Math.hypot(dx,dy)>12)mobileGesture.moved=true;
  if(phase==='open'&&!reduce.matches){
    const horizontal=Math.abs(dx)>Math.abs(dy)*1.45;
    const dir=dx<0?1:-1;
    cornerHover=horizontal&&mobileGesture.moved&&(dir<0||forwardAvailable())?dir*Math.min(.94,Math.abs(dx)/105):0;
    closeHover=cornerHover<0&&!backwardAvailable()&&!journal();wake();
  }

},{passive:true});
desk.addEventListener('touchend',e=>{
  if(!mobileGesture)return;
  const gesture=mobileGesture;
  mobileGesture=null;cornerHover=0;closeHover=false;wake();
  const touch=Array.from(e.changedTouches).find(touch=>touch.identifier===gesture.identifier);
  if(!touch||e.touches.length)return;
  const dx=touch.clientX-gesture.x,dy=touch.clientY-gesture.y;
  if(gesture.moved||Math.hypot(dx,dy)>12){
    blockedUntil=performance.now()+470;
    if(e.cancelable)e.preventDefault();
  }
  const threshold=T.MathUtils.clamp(canvas.clientWidth*.145,42,64);
  if(Math.abs(dx)>threshold&&Math.abs(dx)>Math.abs(dy)*1.45){
    blockedUntil=performance.now()+470;
    const direction=dx<0?1:-1;
    if(paging&&motion&&['page','side'].includes(motion.kind)){
      const rate=direction===turnDirection?1:-1;
      pendingSwipe=rate===1&&motion.rate===1?direction:0;
      if(rate!==motion.rate){
        const now=performance.now();
        motion.origin=motionProgress(motion,now);motion.started=now;motion.rate=rate;
        wake();
      }
    }
    else if(paging)pendingSwipe=direction;
    else go(direction);
  }
},{passive:false});
desk.addEventListener('touchcancel',()=>{mobileGesture=null;cornerHover=0;closeHover=false;wake();blockedUntil=performance.now()+470;},{passive:true});
document.addEventListener('keydown',e=>{
  if(!renderer||locked||e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select, [contenteditable], .portal-account')||e.target.id==='mike-companion')return;
  if(e.target===pen&&penHeld&&e.key.startsWith('Arrow')){
    e.preventDefault();
    const steps={ArrowLeft:[-.24,0],ArrowRight:[.24,0],ArrowUp:[0,.24],ArrowDown:[0,-.24]};
    const [x,y]=steps[e.key];movePen(penGoal.x+x,penGoal.y+y);return;
  }
  if(e.key==='Escape'){
    if(penHeld){dropPen();return;}
    if(phase==='loading')returnToPage();
    else if(phase==='open'){if(journal())leaveJournal();else coverMotion(false);}
  }
  if(renderer&&phase==='open'&&['ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();go(e.key==='ArrowRight'?1:-1,true);
  }
});

const hints=new Set();
const routeStyles=new Map([['/homework/','/homework/style.css'],['/teacher/','/teacher/style.css']]);
function prepareDestination(entry){
  if(navigator.connection?.saveData)return;
  const target=new URL(entry.href,location.href);
  const href=target.origin===location.origin?routeStyles.get(target.pathname):target.origin;
  if(!href||hints.has(href))return;
  hints.add(href);
  const hint=document.createElement('link');
  hint.rel=target.origin===location.origin?'prefetch':'preconnect';hint.href=href;
  document.head.append(hint);
}

function peel(entry,corner,origin){
  if(phase!=='open'||performance.now()<blockedUntil)return;
  activeEntry=entry;activeCorner=corner;previousFocus=origin;
  const card=pageCards().find(c=>c.item===entry);
  const inherited=card?.lift||0;
  clearHover();prepareDestination(entry);
  const target=new URL(entry.href,location.href);
  if(target.origin===location.origin&&routeStyles.has(target.pathname)&&!navigator.connection?.saveData){
    const src=target.pathname+'app.js';
    if(!hints.has(src)){
      hints.add(src);
      const link=document.createElement('link');link.rel='modulepreload';link.href=src;document.head.append(link);
    }
  }
  setPhase('peeling','正在揭下便签');
  let finished=false;
  const leave=()=>{
    if(finished||phase!=='peeling'||activeEntry!==entry)return;
    finished=true;clearTimeout(deadline);
    if(motion?.kind==='peel')motion=null;
    navigate(entry);
  };
  const deadline=setTimeout(leave,360);
  begin('peel',.32,t=>{
    if(!card)return;
    const u=smooth(t),[sx,sy]=corners[activeCorner];
    resetCard(card,card.slot);
    if(card.stub){
      card.ticketBody.visible=true;card.rect.visible=false;
      card.stub.visible=true;card.stub.position.set(card.w*(.365+.27*u),-.10*u,.009+.48*u);
      card.stub.rotation.z=-.18*u;
      card.ticketBody.rotation.z=.012*Math.sin(u*Math.PI);
      card.rear.visible=false;return;
    }
    weights(card,activeCorner,inherited*(1-u),u);
    card.shadow.visible=u<.99;
    card.shadow.material.opacity=.6*(1-u)*(1-u);
    card.shadow.position.set(.006+sx*.29*u,-.014+sy*.3*u,-.020-.98*u);
    card.root.position.add(new T.Vector3(-sx*.29*u,-sy*.3*u,.98*u));
    card.root.rotation.z+=sx*.17*u;
  },leave);
}
function navigate(entry){
  $('loading').hidden=false;
  $('destination').textContent=entry.title;
  try{
    const target=new URL(entry.href,location.href);
    if(target.origin===location.origin&&routeStyles.has(target.pathname))
      sessionStorage.setItem('mike:arrival',JSON.stringify({path:target.pathname,at:Date.now()}));
  }catch{}
  setPhase('loading','正在打开 '+entry.title);
  rememberPage(routeStyles.has(new URL(entry.href,location.href).pathname));
  try{sessionStorage.setItem(returnKey,JSON.stringify({spreadIndex,side,at:Date.now()}));}catch{}
  // Let the sketch reach the screen before handing the tab to the normal browser navigation.
  requestAnimationFrame(()=>setTimeout(()=>{if(phase==='loading')location.assign(entry.href);},0));
}
function returnToPage(){
  try{sessionStorage.removeItem(returnKey);}catch{}
  activeEntry=null;$('loading').hidden=true;setPhase('open','已回到这一页');
  previousFocus?.focus({preventScroll:true});previousFocus=null;
}

window.addEventListener('pageshow',e=>{if(e.persisted&&phase==='loading')returnToPage();});

function weights(card,corner,up,peel){
  const morph=card.rect.morphTargetInfluences;
  morph.fill(0);morph[corner]=up;morph[4+corner]=peel;
  morph[(corner+2)%4]=.14*(1-up)*(1-peel);
}
function seat(station,parent,x,y,z,angle=0){
  if(station.parent!==parent)parent.add(station);
  station.position.set(x,y,z);station.rotation.set(0,0,angle);
}
function resetCard(card,index,hinged=false){
  if(card.stub){card.stub.visible=card.ticketBody.visible=false;card.rect.visible=true;}
  const left=index<2;
  card.rect.geometry=card.flatGeo;card.rect.frustumCulled=true;
  card.rear.visible=true;card.shadow.visible=true;card.shadow.material.opacity=.6;card.shadow.position.set(.006,-.014,-.02);card.root.scale.setScalar(1);
  seat(card.root,hinged&&left?scene.hinge:scene.book,left?-W/2:W/2,card.y,NOTE_Z,card.angle);
}
function prepareStatic(dt){
  const hinged=phase==='opening'||phase==='closing'||phase==='cover';
  for(const [i,spread] of scene.spreads.entries()){
    if(!spread)continue;
    const current=i===spreadIndex;
    for(const [paperSide,surface] of spread.sides.entries()){
      surface.visible=current;
      if(current){
        seat(surface,hinged&&paperSide===0?scene.hinge:scene.book,paperSide===0?-W/2:W/2,0,PAPER_Z);
        const corner=phase==='shifting'?sideCurl:cornerAmount;
        const direction=narrow()&&corner&&paperSide===side?Math.sign(corner):paperSide===0?-1:1;
        curlSurface(surface,direction,narrow()&&paperSide!==side?0:corner);
      }
    }
    for(const card of spread.cards){
      card.root.visible=current;
      if(!current)continue;
      // While peeling, the animation owns this card's current pose.
      if(phase==='peeling'&&card.item===activeEntry)continue;
      resetCard(card,card.slot,hinged);
      const wanted=phase==='open'&&hovered===card.item&&!reduce.matches?1:0;
      card.lift=mix(card.lift,wanted,1-Math.exp(-18*dt));
      if(Math.abs(card.lift-wanted)<.003)card.lift=wanted;
      const flutter=hinged?.22*Math.sin(Math.PI*openness):0;
      weights(card,card.corner,Math.max(card.lift,flutter),0);
    }
  }
  scene.leaf.faces.forEach(face=>{face.visible=false;});
}

function configureTurn(low,high){
  for(const [i,spread] of scene.spreads.entries()){
    if(!spread)continue;
    spread.sides.forEach((face,side)=>{face.visible=(i===low&&side===0)||(i===high&&side===1);});
    spread.cards.forEach(card=>{
      card.root.visible=(i===low||i===high);
      if(card.root.visible){resetCard(card,card.slot);card.lift=0;weights(card,card.corner,0,0);}
    });
  }
  const map=[scene.spreads[low].surfaces[1],scene.spreads[high].surfaces[0]];
  scene.leaf.faces.forEach((f,i)=>{
    f.visible=true;f.material.map=map[i];
  });
}
function pressToLeaf(card,t,z,rear){
  if(!card.curvedGeo){
    card.curvedGeo=card.flatGeo.clone();
    card.curvedGeo.morphAttributes={};
  }
  card.rect.geometry=card.curvedGeo;
  card.rect.frustumCulled=false;
  card.rear.visible=false;
  card.shadow.visible=false;
  card.root.position.set(0,0,0);card.root.scale.set(1,1,1);
  card.root.rotation.set(0,0,0);
  const base=card.flatGeo.attributes.position,out=card.curvedGeo.attributes.position;
  const cos=Math.cos(card.angle),sin=Math.sin(card.angle),sign=rear?-1:1;
  const flutter=.052*Math.sin(Math.PI*t);
  for(let i=0;i<out.count;i++){
    const u=base.getX(i),v=base.getY(i);
    const x=W/2+sign*(cos*u-sin*v),y=card.y+sin*u+cos*v;
    const a=leafTangency(x,t);
    bendPoint(x,t,bending);
    const freeCorner=(.5-v/card.h)**2*(.6+.4*u/card.w);
    const offset=sign*(NOTE_Z-PAPER_Z+flutter*freeCorner);
    out.setXYZ(i,bending.x-Math.sin(a)*offset,y,bending.z+z+Math.cos(a)*offset);
  }
  out.needsUpdate=true;
  card.curvedGeo.computeVertexNormals();
  card.curvedGeo.computeBoundingSphere();
}
function curlSurface(face,direction,amount){
  const strength=Math.max(0,amount*direction);
  if(face.userData.curl===strength&&face.userData.direction===direction)return;
  face.userData.direction=direction;
  face.userData.curl=strength;
  const pos=face.geometry.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setZ(i,gutterRise(pos.getX(i)+face.position.x)+curlHeight(pos.getX(i),pos.getY(i),direction,strength));
  pos.needsUpdate=true;
  face.geometry.computeVertexNormals();
}
function poseTurn(low,high,t,corner){
  bendLeaf(scene.leaf,t,corner);
  const z=PAPER_Z;
  scene.leaf.faces.forEach(face=>{face.position.z=z;});
  // Bury the stack under the moving paper while it is still covering that stack.
  for(const [spread,side,depth] of [[low,0,-.075*smooth(clamp01((t-.53)/.47))],[high,1,-.075*smooth(clamp01((.47-t)/.47))]]){
    const surface=scene.spreads[spread].sides[side];
    curlSurface(surface,side===0?-1:1,0);
    surface.position.z=PAPER_Z+depth;
    for(const card of scene.spreads[spread].cards){
      if(Math.floor(card.slot/2)===side)card.root.position.z=NOTE_Z+depth;
    }
  }
  scene.spreads[low].cards.filter(card=>card.slot>=2).forEach(card=>pressToLeaf(card,t,z,false));
  scene.spreads[high].cards.filter(card=>card.slot<2).forEach(card=>pressToLeaf(card,t,z,true));
}
function syncPaperTask(){
  const card=scene?.spreads[0]?.cards.find(c=>c.paintTask);
  if(!card)return;
  const data=document.querySelector('#flat-list [data-task]')?.dataset.task;
  if(data===paintedTasks)return;
  paintedTasks=data;
  for(const {action} of taskLinks)action.remove();
  const tasks=data?JSON.parse(data):[];
  const bounds=card.paintTask(tasks);
  const anchor=buttons.get(card.item);
  taskLinks=tasks.map((task,i)=>{
    const action=document.createElement('a');
    action.className='hot desk-task';
    const page=scene.spreads.findIndex(spread=>spread?.cards.includes(card))*2+(card.slot>=2?1:0);
    action.href=onDeskPage(task.href,page);
    action.setAttribute('aria-label',task.label);action.title=task.label;
    if(task.detail)action.setAttribute('aria-description',task.detail);
    action.hidden=anchor.hidden;
    action.onclick=e=>{
      if(phase!=='open'||performance.now()<blockedUntil){e.preventDefault();return;}
      if(e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey)rememberPage(true);
    };
    return {action,card,rect:bounds[i]};
  });
  anchor.after(...taskLinks.map(t=>t.action));
  wake();
}
document.addEventListener('notebook:task',syncPaperTask);
function deviceCamera(){
  const width=viewportWidth=canvas.clientWidth,height=viewportHeight=canvas.clientHeight,aspect=width/height,mobile=narrow();
  const closedH=mobile?Math.max(5.86,3.86/aspect):Math.max(5.78,10.24/aspect);
  const openH=mobile?Math.max(6.1,3.82/aspect):Math.max(6.0,10.68/aspect);
  const heightUnits=mix(closedH,openH,openness);
  const openX=mobile?mix(-W/2,W/2,viewSide):0;
  camera.top=heightUnits/2;camera.bottom=-heightUnits/2;camera.left=-heightUnits*aspect/2;camera.right=-camera.left;
  camera.position.set(mix(mobile?W/2:.13,openX,openness),mobile?-.04:0,15);
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
  scene.hinge.position.z=.14*(1-openness);
  scene.hinge.rotation.y=(1-openness)*Math.PI-coverLift*.025;
  // Place the lamp in the exposed desk margin. Keep the 44px touch target
  // inside the screen and left of the bookmark, even while the camera pans.
  const unit=heightUnits/height;
  const propX=mobile?camera.position.x+camera.left+37*unit:lampHome.x-.23;
  const propY=mobile?H/2+.14+30*unit:lampHome.y;
  const lampScale=mobile?Math.min(.48,42*unit):1;
  scene.lamp.root.position.set(propX,propY,0);
  scene.lamp.root.scale.setScalar(lampScale);
  scene.lamp.bulb.position.set(propX+lampScale*.82,propY-lampScale*.75,2.60);
  scene.pool.position.set(propX+lampScale*1.16,propY-lampScale*.87,-.195);
  scene.pool.rotation.z=-.39;
  scene.pencil.scale.setScalar(mobile?.67:1);
  const helperX=mobile?camera.position.x+W*.18:penHome.x;
  const helperY=mobile?-2.64:penHome.y;
  if(!penHeld&&(!penMoved||(phase!=='open'&&phase!=='cover')&&Math.abs(penGoal.x-camera.position.x)>camera.right-.66)){
    penGoal.x=helperX;penGoal.y=helperY;penAngle=mobile?-.16:-1.10;penMoved=false;
    if(mobile||firstDraw){scene.pencil.position.x=helperX;scene.pencil.position.y=helperY;}
  }
  const {ribbon,paint}=scene.bookmark;
  ribbon.visible=!tab.hidden;
  if(ribbon.visible){
    // The visible paper edge is tracked continuously along with the camera.
    // The rest of the strip is occluded by the leaves and hardcover.
    const closedAnchor=W/2+.46;
    const openAnchor=mobile?openX+.46:.55;
    const desiredX=mix(closedAnchor,openAnchor,openness);
    // Reserve the right-edge paper index and an 8px gap, including on a 320px phone.
    const limitX=camera.position.x+camera.right-111*unit-scene.bookmark.width/2;
    ribbon.position.set(mobile?Math.min(desiredX,limitX):desiredX,H/2+mix(.21,.15,openness),-.052);
    const returning=tab.hasAttribute('data-return'),unread=!returning&&tab.hasAttribute('data-unread');
    const label=returning?'返回原页':'最新变化',content=label+unread;
    if(content!==bookmarkContent){paint(label,unread);bookmarkContent=content;}
  }
  scene.scene.updateMatrixWorld(true);
}
new MutationObserver(wake).observe(tab,{attributes:true,attributeFilter:['data-unread']});

let viewportWidth=1,viewportHeight=1;
function xy(v){
  v.project(camera);
  return [(v.x+1)*viewportWidth/2,(1-v.y)*viewportHeight/2];
}
function positionRect(button,pts,min=0){
  const xs=pts.map(([x])=>x),ys=pts.map(([,y])=>y);
  const l=Math.min(...xs),t=Math.min(...ys),w=Math.max(...xs)-l,h=Math.max(...ys)-t;
  const width=Math.max(w,min),height=Math.max(h,min);
  Object.assign(button.style,{left:l+(w-width)/2+'px',top:t+(h-height)/2+'px',width:width+'px',height:height+'px'});
}
function controlsOnScene(){
  if(phase==='cover'){
    const [x,y]=xy(project.set(W*.86,-H*.413,.318));
    cover.style.left=x+'px';cover.style.top=y+'px';
  }
  if(phase==='open')for(const card of pageCards()){
    const button=buttons.get(card.item);
    if(button.hidden)continue;
    const quad=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,y])=>xy(card.root.localToWorld(new T.Vector3(x*card.w/2,y*card.h/2,0))));
    positionRect(button,quad);
    for(const {action,rect,card:owner} of taskLinks){
      if(owner!==card)continue;
      const [left,top,right,bottom]=rect;
      const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([x,y])=>
        xy(card.root.localToWorld(new T.Vector3((x/960-.5)*card.w,(.5-y/1160)*card.h,0))));
      positionRect(action,points);
    }
  }
  if(phase==='open'){
    for(const [button,direction] of [[prev,-1],[next,1]]){
      const x=narrow()?(side===0?-W/2:W/2)+direction*W*.37:direction*W*.89;
      positionRect(button,[xy(project.set(x,-H*.431,.2))],44);
    }

  }
  const {ribbon,width,height}=scene.bookmark;
  if(ribbon.visible){
    const corners=[[-width/2,0],[width/2,height/2]].map(([x,y])=>xy(ribbon.localToWorld(project.set(x,y,0))));
    positionRect(tab,corners,44);
  }
  positionRect(lamp,[xy(narrow()?scene.lamp.root.localToWorld(project.set(.12,-.08,.5)):scene.lamp.button.getWorldPosition(project))],44);
  const pencilPoints=[[-1,-.10],[-1,.10],[1,.10],[1,-.10]].map(([x,y])=>xy(scene.pencil.localToWorld(new T.Vector3(x,y,0))));
  positionRect(pen,pencilPoints,44);
}
function objectMotion(dt){
  const target=lampOn?1:0,ratio=reduce.matches?1:1-Math.exp(-11*dt);
  lampAmount=mix(lampAmount,target,ratio);
  const movingLamp=Math.abs(lampAmount-target)>.006;
  if(!movingLamp)lampAmount=target;
  // The lamp adds a reflected pool to the walnut and a warm local fill to the paper.
  const pose=lampAmount*.032+.045;
  scene.lamp.button.scale.y=1+pose;
  scene.lamp.bulb.intensity=lampAmount*14;
  scene.key.intensity=.59+.35*lampAmount;
  scene.lamp.shadeUnder.material.emissiveIntensity=lampAmount*.79;
  scene.pool.material.opacity=lampAmount;
  scene.pencil.position.x=mix(scene.pencil.position.x,penGoal.x,ratio);
  scene.pencil.position.y=mix(scene.pencil.position.y,penGoal.y,ratio);
  scene.pencil.rotation.z=mix(scene.pencil.rotation.z,penAngle,ratio);
  if(Math.hypot(scene.pencil.position.x-penGoal.x,scene.pencil.position.y-penGoal.y)<.003){
    scene.pencil.position.x=penGoal.x;scene.pencil.position.y=penGoal.y;
  }
  if(Math.abs(scene.pencil.rotation.z-penAngle)<.003)scene.pencil.rotation.z=penAngle;
  const wanted=reduce.matches?0:cornerHover;
  cornerAmount=mix(cornerAmount,wanted,1-Math.exp(-24*dt));
  if(Math.abs(cornerAmount-wanted)<.004)cornerAmount=wanted;
  const liftedCover=closeHover&&!reduce.matches?1:0;
  if(phase==='open')coverLift=mix(coverLift,liftedCover,1-Math.exp(-24*dt));
  return Math.abs(coverLift-liftedCover)>.004&&phase==='open'||cornerAmount!==wanted||movingLamp||Math.hypot(scene.pencil.position.x-penGoal.x,scene.pencil.position.y-penGoal.y)>.003||Math.abs(scene.pencil.rotation.z-penAngle)>.003;
}
// Probe the whole pencil against the rendered surfaces, including a moving leaf and sticky corners.
const probe=new T.Raycaster();
probe.ray.direction.set(0,0,-1);
const hits=[];
// Picking the dense, fully shaded leaves costs more than drawing them on some phones.
// Sample their actual deformed vertices into small contact meshes; keep rendering geometry intact.
const contactMeshes=new WeakMap(),contactPoint=new T.Vector3();
const contactMaterial=new T.MeshBasicMaterial({side:T.DoubleSide});
function contactMesh(source){
  const geo=source.geometry;
  let shapes=contactMeshes.get(source);
  if(!shapes){shapes=new WeakMap();contactMeshes.set(source,shapes);}
  let entry=shapes.get(geo);
  if(!entry){
    const grid=geo.parameters;
    let shape,indices=[];
    if(geo.type==='PlaneGeometry'){
      const cols=Math.min(grid.widthSegments,16),rows=Math.min(grid.heightSegments,6);
      shape=new T.PlaneGeometry(1,1,cols,rows);
      for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)
        indices.push(Math.round(j*grid.heightSegments/rows)*(grid.widthSegments+1)+Math.round(i*grid.widthSegments/cols));
    }else{
      geo.computeBoundingBox();
      const size=geo.boundingBox.getSize(new T.Vector3());
      shape=new T.BoxGeometry(size.x,size.y,size.z);
    }
    entry={mesh:new T.Mesh(shape,contactMaterial),indices};
    shapes.set(geo,entry);
  }
  const mesh=entry.mesh;
  mesh.matrixWorld.copy(source.matrixWorld);
  const pos=mesh.geometry.attributes.position;
  for(const [i,index] of entry.indices.entries()){
    source.getVertexPosition(index,contactPoint);
    pos.setXYZ(i,contactPoint.x,contactPoint.y,contactPoint.z);
  }
  if(entry.indices.length)mesh.geometry.computeBoundingSphere();
  return mesh;
}
let restingContact=null;
function placePen(dt){
  const pen=scene.pencil,scale=pen.scale.x;
  let support=-.21;
  // The contact surface changes continuously during a turn, curl or lifted note.
  const stationary=phase==='open'&&!cornerAmount&&!coverLift&&!sideCurl&&pageCards().every(c=>!c.lift);
  const {x,y}=pen.position,angle=pen.rotation.z;
  const cached=stationary&&restingContact?.spread===spreadIndex&&restingContact.side===side
    &&restingContact.x===x&&restingContact.y===y&&restingContact.angle===angle&&restingContact.scale===scale;
  if(cached)support=restingContact.height;
  else if(Math.abs(x)<W+scale+.12&&Math.abs(y)<H/2+scale+.12){
    const visible=[...scene.boards,...scene.leaf.faces.filter(face=>face.visible)];
    for(const spread of scene.spreads){
      if(!spread)continue;
      for(const face of spread.sides)if(face.visible)visible.push(face);
      for(const card of spread.cards)if(card.root.visible)visible.push(card.rect);
    }
    const contact=visible.map(contactMesh);
    const cs=Math.cos(pen.rotation.z),sn=Math.sin(pen.rotation.z);
    for(let i=0;i<=12;i++){
      const distance=(-.97+i*1.91/12)*scale;
      probe.ray.origin.set(pen.position.x+distance*cs,pen.position.y+distance*sn,8);
      hits.length=0;probe.intersectObjects(contact,false,hits);
      if(hits.length)support=Math.max(support,hits[0].point.z);
    }
  }
  if(!stationary)restingContact=null;
  else if(!cached)restingContact={spread:spreadIndex,side,x,y,angle,scale,height:support};
  const floor=support+.085*scale;
  const target=floor+(penHeld?.29:0);
  const height=Math.max(floor,mix(pen.position.z,target,reduce.matches?1:1-Math.exp(-18*dt)));
  const moving=Math.abs(height-target)>.001;
  pen.position.z=moving?height:target;
  const shade=pen.userData.shade,spread=Math.min(1,Math.max(0,(pen.position.z-floor)/.29));
  const dx=pen.position.x-scene.lamp.bulb.position.x,dy=pen.position.y-scene.lamp.bulb.position.y;
  const distance=Math.max(.5,Math.hypot(dx,dy)),offset=.025+.11*spread;
  shade.position.set(pen.position.x+offset*dx/distance,pen.position.y+offset*dy/distance,support+.004);
  shade.rotation.z=pen.rotation.z;shade.scale.set(scale*(1+.09*spread),scale*(.72+spread*1.6),1);
  shade.material.opacity=.48-.29*spread;
  return moving;
}
function revealInks(now){
  let active=false;
  for(const card of pageCards()){
    const ink=card.ink;
    if(!ink||ink.amount.value===1)continue;
    const visible=phase==='open'&&(!narrow()||Math.floor(card.slot/2)===side);
    if(reduce.matches||(!visible&&ink.started!==null)){ink.amount.value=1;continue;}
    if(!visible)continue;
    ink.started??=now;
    ink.amount.value=1-(1-clamp01((now-ink.started)/480))**2;
    active||=ink.amount.value<1;
  }
  return active;
}
reduce.addEventListener('change',wake);
function motionProgress(active,now){
  return clamp01(active.origin+active.rate*(now-active.started)/(1000*active.seconds));
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    hiddenAt=performance.now();
    if(frame)cancelAnimationFrame(frame);
    frame=0;mobileGesture=null;cornerHover=0;closeHover=false;
    return;
  }
  if(hiddenAt!==null&&motion)motion.started+=performance.now()-Math.max(hiddenAt,motion.started);
  hiddenAt=null;lastTime=0;wake();
});
function draw(now){
  frame=0;
  const dt=Math.min(.04,(now-(lastTime||now-16))/1000);
  lastTime=now;
  if(motion){
    const active=motion;
    const finish=active.rate>0?1:0;
    const t=reduce.matches?finish:motionProgress(active,now);
    active.step(t);
    if(t===finish){
      motion=null;
      if(finish===1)active.end();
      else{sideCurl=cornerAmount=0;viewSide=side;pendingSwipe=0;trimJournal();completePage(turnDirection,false);}
    }
  }
  const props=objectMotion(dt);
  if(phase!=='turning')prepareStatic(dt);
  deviceCamera();
  const settlingPen=placePen(dt);
  const drawingInk=revealInks(now);
  try{renderer.render(scene.scene,camera);}catch(error){
    console.warn('Notebook rendering was interrupted.',error);fallback();return;
  }
  controlsOnScene();
  if(firstDraw){
    firstDraw=false;still.hidden=true;document.body.dataset.ready='3d';$('masthead').hidden=false;
    if(phase==='cover'&&openingOnLoad)requestAnimationFrame(()=>coverMotion(true));
  }
  const lifts=phase==='open'&&pageCards().some(card=>card.lift>0&&card.lift<1);
  if(props||motion||lifts||settlingPen||drawingInk)wake();else lastTime=0;
}
function resize(){
  if(!renderer||!scene)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,narrow()?1.35:1.65));
  renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  if(!motion){side=fitSide(spreadIndex,side);viewSide=side;}
  sync();wake();
}

function fallback(){
  if(frame)cancelAnimationFrame(frame);
  frame=0;renderer=null;motion=null;paging=false;pendingSwipe=0;
  still.hidden=true;document.body.dataset.ready='2d';
  phase='open';
  $('masthead').hidden=true;$('rail').hidden=true;$('loading').hidden=true;
  sync();
  $('rail').hidden=true;
}
let openingOnLoad=false;
export async function start(apps,animateOpening,canPresent,guest=false){
  locked=guest;
  chapters=portalCatalog(apps);catalogCount=chapters.length;
  const originPage=guest?null:deskPage(new URLSearchParams(location.search));
  let saved=null;
  if(!guest){
    try{
      const recent=JSON.parse(sessionStorage.getItem(returnKey));
      sessionStorage.removeItem(returnKey);
      if(!animateOpening&&recent&&Date.now()-recent.at<45*60_000)saved=recent;
    }catch{}
  }
  const index=originPage===null?history.state?.notebookSpread??saved?.spreadIndex:Math.floor(originPage/2);
  const half=originPage===null?history.state?.notebookSide??saved?.side:originPage%2;
  spreadIndex=Math.min(chapters.length-1,Math.max(0,Number(index)||0));
  side=fitSide(spreadIndex,Number(half)||0);
  viewSide=side;
  connectNotes();
  try{
    const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'low-power'});
    if(!gl){fallback();return;}
    const context=new T.WebGLRenderer({canvas,context:gl});
    context.shadowMap.enabled=true;
    context.shadowMap.type=T.VSMShadowMap;
    context.toneMapping=T.ACESFilmicToneMapping;context.toneMappingExposure=1.12;
    scene=await studio(guest?[]:chapters,narrow());
    if(!canPresent()){context.dispose();return;}
    syncPaperTask();renderer=context;camera=new T.OrthographicCamera(-6,6,4,-4,.01,40);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
    window.addEventListener('resize',resize);
    openingOnLoad=originPage===null&&animateOpening&&!reduce.matches;
    openness=guest||openingOnLoad?0:1;
    setPhase(guest||openingOnLoad?'cover':'open');
    if(originPage!==null){
      rememberPage();
    }
    resize();
  }catch(error){
    console.warn('Notebook view is unavailable.',error);
    fallback();
  }
}

export async function unlock(apps,showDesk){
  if(!locked||!renderer||!scene)throw Error('Cover is unavailable');
  const sections=portalCatalog(apps);
  const spreads=await scene.addSpreads(sections);
  if(!renderer)throw Error('Cover lost its graphics context');
  chapters=sections;catalogCount=chapters.length;scene.spreads=spreads;spreadIndex=side=viewSide=0;
  connectNotes();syncPaperTask();dropPen();locked=false;
  showDesk();sync();coverMotion(true);
}
