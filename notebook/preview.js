import * as T from 'three';
import {portalCatalog,sideName} from './catalog.js';
import {studio,W,H,NOTE_W,NOTE_H,corners,lampHome,penHome,bendLeaf,bendPoint,leafTangency} from './studio.js';
import loader from '../assets/notebook/loader.svg';

const $=id=>document.getElementById(id);
const desk=$('desk'),canvas=$('scene'),cover=$('desk-cover'),flat=$('fallback'),hotspots=$('hotspots');
let chapters=[];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const hover=matchMedia('(hover:hover) and (pointer:fine)');
const narrow=()=>innerWidth<=720&&innerHeight>innerWidth;
const smooth=t=>t*t*(3-2*t);
const mix=T.MathUtils.lerp;
const clamp01=t=>T.MathUtils.clamp(t,0,1);

const project=new T.Vector3(),bending=new T.Vector3();
let phase='cover',scene=null,renderer=null,camera=null;
let frame=0,lastTime=0,openness=0,spreadIndex=0,side=0,viewSide=0;
let motion=null,closeAfterTurn=false,hovered=null,activeEntry=null,activeCorner=1;
let lampOn=true,lampAmount=1,penGoal=penHome.clone(),penAngle=-1.10,penShifted=false,penDrag=null;
let mobileGesture=null,blockedUntil=0,previousFocus=null;
const buttons=new Map();

$('sketch').innerHTML=loader;
$('sketch').querySelectorAll('path').forEach(p=>p.setAttribute('pathLength','1'));

function wake(){
  if(!frame&&scene&&renderer)frame=requestAnimationFrame(draw);
}
function setPhase(value,message){
  phase=value;document.body.dataset.phase=value;
  if(message)$('status').textContent=message;
  sync();wake();
}
function pageCards(){
  return scene?.spreads[spreadIndex].cards||[];
}
function visibleEntries(){
  const entries=chapters[spreadIndex].entries;
  return (narrow()?entries.slice(side*2,side*2+2):entries).filter(Boolean);
}
function finalSide(index){
  return chapters[index].entries.slice(2).some(Boolean)?1:0;
}
function forwardAvailable(){
  return (narrow()&&side<finalSide(spreadIndex))||spreadIndex<chapters.length-1;
}
function backwardAvailable(){
  return (narrow()&&side>0)||spreadIndex>0;
}
function sync(){
  const open=phase==='open',showRail=['open','turning','shifting'].includes(phase);
  $('close').hidden=!showRail;
  $('rail').hidden=!showRail;
  $('prev').disabled=!open||!backwardAvailable();
  $('next').disabled=!open||!forwardAvailable();
  $('sectionName').textContent=narrow()?sideName(chapters[spreadIndex],side,spreadIndex):chapters[spreadIndex].name;
  const from=spreadIndex*2+1;
  $('pageNumber').textContent=narrow()?String(from+side).padStart(2,'0'):`${String(from).padStart(2,'0')}–${String(from+1).padStart(2,'0')}`;
  document.body.dataset.spread=String(spreadIndex);
  document.body.dataset.side=String(side);
  cover.hidden=phase!=='cover'||!renderer;
  const noScene=!scene||!renderer;
  flat.hidden=!noScene;
  canvas.hidden=noScene;
  const allow=new Set(visibleEntries());
  for(const [entry,button] of buttons){
    button.hidden=noScene||!open||!allow.has(entry);
    button.tabIndex=button.hidden?-1:0;
  }
  if(noScene){$('rail').hidden=true;$('close').hidden=true;}
  $('lamp').setAttribute('aria-pressed',String(lampOn));
  $('lampSpot').hidden=$('penSpot').hidden=noScene||phase==='loading'||phase==='destination';
}

function begin(kind,seconds,step,end){
  motion={kind,seconds,step,end,time:0};
  if(!renderer||!scene||reduce.matches){
    motion=null;step(1);end();wake();
  } else wake();
}
function coverMotion(open){
  if(open&&phase!=='cover')return;
  if(!open&&['turning','shifting'].includes(phase)){closeAfterTurn=true;return;}
  if(!renderer||!open&&phase!=='open')return;
  closeAfterTurn=false;clearHover();const start=openness,target=open?1:0;
  setPhase(open?'opening':'closing',open?'正在翻开笔记本':'正在合上笔记本');
  begin('cover',open?.92:.76,t=>{openness=mix(start,target,smooth(t));},()=>{
    if(open){setPhase('open',chapters[spreadIndex].name);focusEntry();}
    else {
      spreadIndex=side=viewSide=0;activeEntry=null;
      setPhase('cover','已回到封面');$('open-cover').focus({preventScroll:true});
    }
  });
}
function go(direction){
  if(!renderer||phase!=='open'||(direction>0?!forwardAvailable():!backwardAvailable()))return;
  clearHover();
  if(narrow()&&((direction>0&&side<finalSide(spreadIndex))||(direction<0&&side>0))){
    const start=viewSide,newSide=side+direction;
    setPhase('shifting');
    begin('side',.32,t=>{viewSide=mix(start,newSide,smooth(t));},()=>{
      viewSide=side=newSide;completePage();
    });
    return;
  }
  const nextSpread=spreadIndex+direction,nextSide=narrow()&&direction<0?finalSide(nextSpread):0;
  const startSide=viewSide;
  const from=direction>0?0:1,to=1-from;
  const low=Math.min(spreadIndex,nextSpread),high=Math.max(spreadIndex,nextSpread);
  setPhase('turning',direction>0?'往后翻页':'往前翻页');
  if(scene){
    configureTurn(low,high);
    poseTurn(low,high,from);
  }
  begin('page',.81,t=>{
    const p=smooth(t);
    if(scene)poseTurn(low,high,mix(from,to,p));
    viewSide=mix(startSide,nextSide,p);
  },()=>{
    spreadIndex=nextSpread;viewSide=side=nextSide;completePage();
  });
}
function completePage(){
  setPhase('open',`${$('sectionName').textContent}。可选择便签。`);
  if(closeAfterTurn)coverMotion(false);
  else $('pageNumber').setAttribute('aria-label','页码 '+$('pageNumber').textContent);
}
function focusEntry(){
  const first=visibleEntries()[0];
  buttons.get(first)?.focus({preventScroll:true});
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
  note.onclick=e=>{
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    e.preventDefault();
    const card=pageCards().find(c=>c.item===entry);
    peel(entry,e.detail===0?3:hovered===entry&&card?card.corner:cornerFor(e,note),note);
  };
  buttons.set(entry,note);hotspots.append(note);
 }
}

$('open-cover').onclick=()=>coverMotion(true);
$('close').onclick=()=>coverMotion(false);
$('prev').onclick=()=>go(-1);
$('next').onclick=()=>go(1);
$('lamp').onclick=$('lampSpot').onclick=()=>{
  lampOn=!lampOn;sync();$('status').textContent=lampOn?'台灯已打开':'台灯已关闭';wake();
};
function nudge(){
  penShifted=!penShifted;
  penGoal.copy(penHome).add(new T.Vector3(penShifted?.23:0,penShifted?-.29:0,0));
  penAngle=penShifted?-.79:-1.10;
  $('status').textContent='铅笔已移动';wake();
}
$('pencil').onclick=nudge;
$('penSpot').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nudge();}};

function unitsPerPixel(){return (camera.top-camera.bottom)/canvas.clientHeight;}
$('penSpot').onpointerdown=e=>{
  if(!scene)return;
  penDrag={id:e.pointerId,x:e.clientX,y:e.clientY,px:scene.pencil.position.x,py:scene.pencil.position.y,moved:false};
  e.currentTarget.setPointerCapture(e.pointerId);
};
$('penSpot').onpointermove=e=>{
  if(!penDrag||penDrag.id!==e.pointerId)return;
  const dx=e.clientX-penDrag.x,dy=e.clientY-penDrag.y;
  if(Math.hypot(dx,dy)<5&&!penDrag.moved)return;
  penDrag.moved=true;const rate=unitsPerPixel();
  penGoal.set(T.MathUtils.clamp(penDrag.px+dx*rate,3.83,5.03),T.MathUtils.clamp(penDrag.py-dy*rate,-1.62,1.53),penHome.z);
  penAngle=-1.1+T.MathUtils.clamp(dx*.003,-.28,.28);wake();
};
$('penSpot').onpointerup=e=>{
  if(penDrag?.id!==e.pointerId)return;
  if(!penDrag.moved)nudge();
  penDrag=null;
};
$('penSpot').onpointercancel=()=>{penDrag=null;};

desk.addEventListener('touchstart',e=>{
  if(phase!=='open'||e.touches.length!==1||e.target.closest('#masthead,#rail,#penSpot'))return;
  mobileGesture={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:true});
desk.addEventListener('touchend',e=>{
  if(!mobileGesture)return;
  const {clientX,clientY}=e.changedTouches[0],dx=clientX-mobileGesture.x,dy=clientY-mobileGesture.y;
  mobileGesture=null;
  if(Math.abs(dx)>59&&Math.abs(dx)>Math.abs(dy)*1.45){
    blockedUntil=performance.now()+470;go(dx<0?1:-1);
  }
},{passive:true});
desk.addEventListener('touchcancel',()=>{mobileGesture=null;},{passive:true});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey||e.target.matches('input'))return;
  if(e.key==='Escape'){
    if(phase==='loading')returnToPage();
    else if(['open','turning','shifting'].includes(phase))coverMotion(false);
  }
  if(phase==='open'&&['ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();go(e.key==='ArrowRight'?1:-1);
  }
});

const routeStyles=new Map([['/homework/','/homework/style.css'],['/teacher/','/teacher/style.css']]);
function prepareDestination(entry){
  if(navigator.connection?.saveData)return;
  const target=new URL(entry.href,location.href);
  const href=target.origin===location.origin?routeStyles.get(target.pathname):target.origin;
  if(!href)return;
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
  setPhase('peeling','正在揭下便签');
  begin('peel',.47,t=>{
    if(!card)return;
    const u=smooth(t),[sx,sy]=corners[activeCorner];
    resetCard(card,card.slot);
    weights(card,activeCorner,inherited*(1-u),u);
    card.shadow.visible=false;
    card.root.position.add(new T.Vector3(-sx*.29*u,-sy*.3*u,.98*u));
    card.root.rotation.z+=sx*.17*u;
  },()=>navigate(entry));
}
function navigate(entry){
  $('loading').hidden=false;
  $('destination').textContent=entry.title;
  $('continue-link').href=entry.href;
  setPhase('loading','正在打开 '+entry.title);
  try{history.replaceState({...history.state,notebookSpread:spreadIndex,notebookSide:side},'');}catch{}
  // Let the sketch reach the screen before handing the tab to the normal browser navigation.
  requestAnimationFrame(()=>setTimeout(()=>{if(phase==='loading')location.assign(entry.href);},0));
}
function returnToPage(){
  activeEntry=null;$('loading').hidden=true;setPhase('open','已回到这一页');
  previousFocus?.focus({preventScroll:true});previousFocus=null;
}
$('return').onclick=returnToPage;
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
  const left=index<2;
  card.rect.geometry=card.flatGeo;card.rect.frustumCulled=true;
  card.rear.visible=true;card.shadow.visible=true;
  seat(card.root,hinged&&left?scene.hinge:scene.book,left?-W/2:W/2,card.y,left?(hinged?.063:.203):.070,card.angle);
}
function prepareStatic(dt){
  const hinged=phase==='opening'||phase==='closing'||phase==='cover';
  for(const [i,spread] of scene.spreads.entries()){
    const current=i===spreadIndex;
    for(const [side,surface] of spread.sides.entries()){
      surface.visible=current;
      if(current)seat(surface,hinged&&side===0?scene.hinge:scene.book,side===0?-W/2:W/2,0,side===0?(hinged?.028:.168):.035);
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
    spread.sides.forEach((face,side)=>{face.visible=(i===low&&side===0)||(i===high&&side===1);});
    spread.cards.forEach(card=>{card.root.visible=(i===low||i===high);resetCard(card,card.slot);});
  }
  const map=[scene.spreads[low].surfaces[1],scene.spreads[high].surfaces[0]];
  scene.leaf.faces.forEach((f,i)=>{
    f.visible=true;f.material.map=map[i];f.material.needsUpdate=true;
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
  card.root.position.set(0,0,0);
  card.root.rotation.set(0,0,0);
  const base=card.flatGeo.attributes.position,out=card.curvedGeo.attributes.position;
  const cos=Math.cos(card.angle),sin=Math.sin(card.angle),sign=rear?-1:1;
  const flutter=.067*Math.sin(Math.PI*t);
  for(let i=0;i<out.count;i++){
    const u=base.getX(i),v=base.getY(i);
    const x=W/2+sign*(cos*u-sin*v),y=card.y+sin*u+cos*v;
    const a=leafTangency(x,t);
    bendPoint(x,t,bending);
    const freeCorner=(.5-v/NOTE_H)**2*(.6+.4*u/NOTE_W);
    const offset=sign*(.025+flutter*freeCorner);
    out.setXYZ(i,bending.x-Math.sin(a)*offset,y,bending.z+z+Math.cos(a)*offset);
  }
  out.needsUpdate=true;
  card.curvedGeo.computeVertexNormals();
}
function poseTurn(low,high,t){
  bendLeaf(scene.leaf,t);
  const z=mix(.043,.174,t);
  scene.leaf.faces.forEach(face=>{face.position.z=z;});
  scene.spreads[low].cards.filter(card=>card.slot>=2).forEach(card=>pressToLeaf(card,t,z,false));
  scene.spreads[high].cards.filter(card=>card.slot<2).forEach(card=>pressToLeaf(card,t,z,true));
}
function deviceCamera(){
  const width=canvas.clientWidth,height=canvas.clientHeight,aspect=width/height,mobile=narrow();
  const closedH=mobile?Math.max(5.86,3.86/aspect):Math.max(5.78,10.24/aspect);
  const openH=mobile?Math.max(6.1,3.82/aspect):Math.max(6.0,10.68/aspect);
  const heightUnits=mix(closedH,openH,openness);
  const openX=mobile?mix(-W/2,W/2,viewSide):0;
  camera.top=heightUnits/2;camera.bottom=-heightUnits/2;camera.left=-heightUnits*aspect/2;camera.right=-camera.left;
  camera.position.set(mix(mobile?W/2:.13,openX,openness),mobile?-.04:0,15);
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
  scene.hinge.rotation.y=(1-openness)*Math.PI;
  scene.scene.updateMatrixWorld(true);
}
function xy(v){
  v.project(camera);
  return [(v.x+1)*canvas.clientWidth/2,(1-v.y)*canvas.clientHeight/2];
}
function positionRect(button,pts,prop=false){
  const xs=pts.map(([x])=>x),ys=pts.map(([,y])=>y);
  const l=Math.min(...xs),t=Math.min(...ys),w=Math.max(...xs)-l,h=Math.max(...ys)-t;
  Object.assign(button.style,{left:l+'px',top:t+'px',width:w+'px',height:h+'px'});
  if(prop){
    button.hidden=phase==='loading'||phase==='destination'||l<0||l+w>canvas.clientWidth||t<62||t+h>canvas.clientHeight-42;
    button.tabIndex=button.hidden?-1:0;
  }
}
function controlsOnScene(){
  if(phase==='cover'){
    const [x,y]=xy(project.set(W/2,-.12,.318));
    cover.style.left=x+'px';cover.style.top=y+'px';
  }
  if(phase==='open')for(const card of pageCards()){
    const button=buttons.get(card.item);
    if(button.hidden)continue;
    const quad=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,y])=>xy(card.root.localToWorld(new T.Vector3(x*NOTE_W/2,y*NOTE_H/2,0))));
    positionRect(button,quad);
  }
  const lampPoints=[[-.86,-.85],[.93,.94]].map(([x,y])=>xy(project.set(lampHome.x+x,lampHome.y+y,.38)));
  positionRect($('lampSpot'),lampPoints,true);
  const pencilPoints=[[-1,-.10],[-1,.10],[1,.10],[1,-.10]].map(([x,y])=>xy(scene.pencil.localToWorld(new T.Vector3(x,y,0))));
  positionRect($('penSpot'),pencilPoints,true);
}
function objectMotion(dt){
  const target=lampOn?1:0,ratio=reduce.matches?1:1-Math.exp(-11*dt);
  lampAmount=mix(lampAmount,target,ratio);
  const movingLamp=Math.abs(lampAmount-target)>.006;
  if(!movingLamp)lampAmount=target;
  // The lamp adds a reflected pool to the walnut and a warm local fill to the paper.
  scene.lamp.bulb.intensity=lampAmount*9.5;
  scene.lamp.shadeUnder.material.emissiveIntensity=lampAmount*.79;
  scene.pool.material.opacity=lampAmount;
  scene.pencil.position.lerp(penGoal,ratio);
  scene.pencil.rotation.z=mix(scene.pencil.rotation.z,penAngle,ratio);
  return movingLamp||scene.pencil.position.distanceToSquared(penGoal)>.00003||Math.abs(scene.pencil.rotation.z-penAngle)>.003;
}
function draw(now){
  frame=0;
  const dt=Math.min(.055,(now-(lastTime||now))/1000);
  lastTime=now;
  if(motion){
    const active=motion;
    active.time+=dt;
    const t=reduce.matches?1:clamp01(active.time/active.seconds);
    active.step(t);
    if(t===1){motion=null;active.end();}
  }
  if(phase!=='turning')prepareStatic(dt);
  const props=objectMotion(dt);
  deviceCamera();renderer.render(scene.scene,camera);controlsOnScene();
  const lifts=phase==='open'&&pageCards().some(card=>card.lift>0&&card.lift<1);
  if(props||motion||lifts)wake();
}
function resize(){
  if(!renderer||!scene)return;
  renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  if(!narrow()&&!motion)side=viewSide=0;
  sync();wake();
}

function fallback(){
  if(frame)cancelAnimationFrame(frame);
  frame=0;renderer=null;motion=null;
  document.body.dataset.ready='2d';
  phase='open';
  $('masthead').hidden=true;$('rail').hidden=true;$('loading').hidden=true;
  sync();
  $('rail').hidden=true;
}
export async function start(apps,animateOpening){
  chapters=portalCatalog(apps);
  spreadIndex=Math.min(chapters.length-1,Math.max(0,Number(history.state?.notebookSpread)||0));
  side=viewSide=narrow()?Math.min(finalSide(spreadIndex),Number(history.state?.notebookSide)||0):0;
  connectNotes();
  try{
    const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'low-power'});
    if(!gl){fallback();return;}
    const context=new T.WebGLRenderer({canvas,context:gl});
    context.setPixelRatio(Math.min(devicePixelRatio,1.65));
    context.shadowMap.enabled=true;context.shadowMap.type=T.VSMShadowMap;
    context.toneMapping=T.ACESFilmicToneMapping;context.toneMappingExposure=1.12;
    scene=await studio(chapters);
    renderer=context;camera=new T.OrthographicCamera(-6,6,4,-4,.01,40);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
    window.addEventListener('resize',resize);
    document.body.dataset.ready='3d';$('masthead').hidden=false;
    const previous=document.activeElement?.dataset.entry;
    if(animateOpening&&!reduce.matches&&!previous){
      openness=0;setPhase('cover');resize();coverMotion(true);
    }else{
      openness=1;setPhase('open');resize();
      if(previous)for(const [entry,node] of buttons)if(entry.id===previous&&!node.hidden)node.focus({preventScroll:true});
    }
  }catch(error){
    console.warn('Notebook view is unavailable.',error);
    fallback();
  }
}
