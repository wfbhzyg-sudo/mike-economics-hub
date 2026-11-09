(() => {
  'use strict';
  const {clamp,releaseVelocity,coastStep,progressAt,ease,liquidLine,liquidTransfer}=window.HubMotion;
  const gallery=document.querySelector('.gallery'), nav=document.querySelector('.app-nav');
  const status=document.querySelector('#selection-status');
  const fine=matchMedia('(hover:hover) and (pointer:fine)'), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.8"/></svg>';
  const transfer=document.createElement('div');transfer.className='liquid-transfer';transfer.setAttribute('aria-hidden','true');transfer.innerHTML='<svg viewBox="-56 -12 112 24"><path fill="currentColor"/></svg>';const transferPath=transfer.querySelector('path');
  const isMobile=()=>innerWidth<768||(innerWidth<1024&&innerHeight<520);
  let apps=[],panels=[],buttons=[],bounds=[],navPoints=[],tickPaths=[],labelZoom=[],track;
  let selected=null,preview=null,mobile=isMobile(),W=innerWidth,H=innerHeight,total=0,tail=0,openSize=0;
  let frame=0,controller=null,drag=null,scrub=null,phase='idle',settleTimer,hoverTimer,leaveTimer,resizeFrame;
  let ignoreScrollUntil=0,suppressClickUntil=0,navSuppressUntil=0,touchHeld=false,showIndicator=false;
  let lastFrame=0,lastDot=null,strain=0,direction=1,lastNavIndex=-1,lastIndicatorVisible=false,navProgress=null,lastWidth=innerWidth;
  const motions=new WeakMap();
  const setPhase=value=>{phase=value;gallery.dataset.motion=value;};
  const safeURL=value=>{try{const u=new URL(value,location.href);return /^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}};
  const position=()=>mobile?window.scrollY:gallery.scrollLeft;
  const maximum=()=>Math.max(0,total+tail-(mobile?innerHeight:W));
  function setPosition(value){value=clamp(value,0,maximum());if(mobile)window.scrollTo({top:value,behavior:'instant'});else gallery.scrollLeft=value;}
  function anchor(index){const b=bounds[index];return b?clamp(mobile?b.start-78:b.start+b.length/2-W/2,0,maximum()):0;}
  function anchors(){return bounds.map((_,i)=>anchor(i));}
  function currentProgress(){return progressAt(position(),anchors());}
  function wake(){if(!frame)frame=requestAnimationFrame(tick);}
  function clearTransfer(){transfer.style.opacity='0';transferPath.setAttribute('d','');}
  function stop(){clearTransfer();controller=null;clearTimeout(settleTimer);clearTimeout(hoverTimer);clearTimeout(leaveTimer);navProgress=null;ignoreScrollUntil=performance.now()+80;setPhase('idle');}
  function pose(el,x,y,scale=1){if(el)el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;}
  function mount(items){
    stop();panels.forEach(p=>motions.get(p.panel)?.cancel());selected=preview=null;showIndicator=false;lastNavIndex=-1;
    const seen=new Set();apps=items.filter(a=>a&&typeof a.id==='string'&&!seen.has(a.id)&&seen.add(a.id)).map(a=>({...a,name:String(a.name||a.id),url:safeURL(a.url)}));
    nav.replaceChildren();buttons=apps.map(app=>{const b=document.createElement('button');b.type='button';b.dataset.app=app.id;b.setAttribute('aria-label',`选择 ${app.name}`);b.setAttribute('aria-pressed','false');const line=document.createElement('span');line.className='nav-tick';line.setAttribute('aria-hidden','true');line.innerHTML='<svg viewBox="-22 -18 44 36"><path fill="currentColor"/></svg>';const name=document.createElement('span');name.className='nav-label';name.textContent=app.shortName||app.name;b.append(name,line);nav.append(b);return b;});tickPaths=buttons.map(b=>b.querySelector('.nav-tick path'));nav.append(transfer);labelZoom=buttons.map(()=>1);
    track=document.createElement('div');track.className='gallery-track';gallery.replaceChildren(track);
    panels=apps.map(app=>{
      const panel=document.createElement('section');panel.className='panel '+(['bookself','econquest','resources','nebs','course'].includes(app.theme)?app.theme:'generic');panel.dataset.app=app.id;
      const art=document.createElement('div');art.className='panel-art';art.setAttribute('aria-hidden','true');const template=document.getElementById(app.template);
      if(template?.tagName==='TEMPLATE')art.append(template.content.cloneNode(true));
      else{const title=document.createElement('h2');title.className='generic-name';title.textContent=app.name;art.append(title);if(safeURL(app.image)){const image=document.createElement('img');image.className='generic-image';image.src=app.image;image.alt='';art.append(image);}}
      if(app.theme==='course'){
        const macro=app.subject==='macro',homework=app.kind==='homework';panel.classList.add(macro?'course-macro':'course-micro',homework?'course-homework':'course-materials');
        const labels={subject:macro?'AP 宏观':'AP 微观',kind:homework?'作业':'学习材料',english:macro?'AP MACROECONOMICS':'AP MICROECONOMICS',wordmark:macro?'Macro.':'Micro.','book-kind':homework?'Practice':'Study notes',companion:homework?'PDF':'CED',note:homework?'作业 · 答案':'课程与考试说明'};
        art.querySelectorAll('[data-course]').forEach(e=>{if(labels[e.dataset.course])e.textContent=labels[e.dataset.course];});
        for(const text of homework?['开学—月考','月考—期中','期中—期末','第二学期']:['白皮书','课程与考试说明','Unit PPT 及大纲','复习笔记']){const row=document.createElement('span');row.textContent=text;art.querySelector('[data-course="contents"]').append(row);}
      }
      const caption=document.createElement('p');caption.className='panel-caption';caption.textContent=app.caption||'';art.append(caption);
      const select=document.createElement('button');select.type='button';select.className='select-panel';select.setAttribute('aria-label',`选择 ${app.name}，${app.description||''}`);select.setAttribute('aria-pressed','false');select.setAttribute('aria-controls',`entry-${app.id}`);
      const link=document.createElement('a');link.className='entry-link';link.id=`entry-${app.id}`;link.tabIndex=-1;link.setAttribute('aria-hidden','true');if(app.url)link.href=app.url;else link.setAttribute('aria-disabled','true');
      const label=document.createElement('span');label.textContent=app.url?(app.entryLabel||`进入 ${app.name}`):'入口待配置';link.append(label);link.insertAdjacentHTML('beforeend',arrow);panel.append(art,select,link);track.append(panel);
      const refs={};for(const cls of ['backdrop','book-logo','book-scene','quest-logo','question','ropes','party','resource-brand','resource-sheet','course-title','course-scene','nebs-brand','nebs-heading','nebs-poster','generic-name','generic-image','panel-caption'])refs[cls]=art.querySelector('.'+cls);
      art.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.style.visibility='hidden';},{once:true}));
      return {app,panel,art,select,link,refs};
    });
    if(!apps.length){const p=document.createElement('p');p.className='empty';p.textContent='网页即将加入';track.append(p);}
    layout(true);measureNav();setPosition(0);wake();
  }
  function layout(instant=false){
    const active=selected||preview,N=apps.length;mobile=isMobile();
    // Discard the tall phone canvas before measuring the desktop viewport.
    if(!mobile&&gallery.style.height)gallery.style.height='';
    W=gallery.clientWidth;H=mobile?innerHeight:gallery.clientHeight;
    openSize=mobile?Math.min(540,Math.max(440,H-130)):W*.6;
    const rest=mobile?300:clamp(W*.42,320,680);total=Math.max(mobile?H:W,N*rest);tail=mobile?Math.max(0,H-openSize-78):0;
    const slant=mobile?16:28,gutter=2,seam=1,layer= Math.max(openSize,total/Math.max(1,N))+slant*2+gutter*2+tail;
    const animate=!instant&&!reduced.matches,Nsafe=Math.max(1,N);
    const sizes=panels.map(p=>{const style=animate?getComputedStyle(p.panel):null;return {pose:style?{transform:style.transform,clipPath:style.clipPath}:null,heading:p.refs['nebs-heading']?.offsetHeight||0};});
    track.style.width=mobile?'100%':`${total}px`;track.style.height=mobile?`${total+tail}px`:'100%';gallery.style.height=mobile?`${total+tail}px`:'';
    const contentW=mobile?W-(W<360?136:148):0;const epoch=document.timeline.currentTime;
    const duration=active?420:320;let offset=0;bounds=[];
    gallery.classList.toggle('is-resting',!active);gallery.dataset.active=active||'';gallery.dataset.selected=selected||'';
    panels.forEach((p,i)=>{
      const {app,panel,art,select,link,refs:r}=p,on=active===app.id;
      const length=active&&N>1?(on?openSize:(total-openSize)/(N-1)):total/Nsafe;
      const start=offset,end=start+length;offset=end;bounds.push({start,end,length});
      motions.get(panel)?.cancel();panel.style.width=mobile?`${W+2}px`:`${layer}px`;panel.style.height=mobile?`${layer}px`:`${H}px`;
      panel.style.transform=mobile?`translate3d(0,${start-slant-gutter}px,0)`:`translate3d(${start-slant-gutter}px,0,0)`;
      const first=i===0,last=i===N-1,extra=last?tail:0;
      if(mobile)panel.style.clipPath=`polygon(0 ${gutter+(first?slant:slant*2-seam)}px,100% ${gutter+(first?slant:-seam)}px,100% ${gutter+length+extra+(last?slant:0)}px,0 ${gutter+length+extra+(last?slant:slant*2)}px)`;
      else panel.style.clipPath=`polygon(${gutter+(first?slant:slant*2-seam)}px 0,${gutter+length+(last?slant:slant*2)}px 0,${gutter+length+(last?slant:0)}px 100%,${gutter+(first?slant:-seam)}px 100%)`;
      if(animate){const a=panel.animate([sizes[i].pose,{transform:panel.style.transform,clipPath:panel.style.clipPath}],{duration,easing:'cubic-bezier(.22,1,.36,1)'});a.startTime=epoch;motions.set(panel,a);a.onfinish=()=>{if(motions.get(panel)===a)motions.delete(panel);};}
      panel.classList.toggle('is-active',on);panel.classList.toggle('is-compressed',!!active&&!on);select.setAttribute('aria-pressed',String(selected===app.id));link.tabIndex=on&&app.url?0:-1;link.setAttribute('aria-hidden',String(!on));
      const x=mobile?1+16+contentW/2:slant+gutter+length/2;
      const top=mobile?slant+gutter:0,bottom=mobile?top+length:H,regionW=mobile?contentW:length;
      const headY=top+(mobile?(i===0?90:42):96),linkY=bottom-(mobile?64:160);
      link.style.width=`${Math.min(mobile?216:242,regionW-16)}px`;
      if(r.backdrop){r.backdrop.style.width=`${mobile?W+2:layer}px`;r.backdrop.style.height=`${mobile?layer:H}px`;pose(r.backdrop,0,0);}
      pose(r['panel-caption'],x-150*Math.min(1,(regionW-12)/300),bottom-(mobile?30:105),Math.min(1,(regionW-12)/300));
      if(app.theme==='bookself'){
        const lw=Math.min(mobile?220:on?390:310,regionW-24);pose(r['book-logo'],x-lw/2,headY,lw/310);
        const sy=top+(mobile?(i===0?174:132):240),available=(on?linkY-24:bottom-(mobile?50:112))-sy;
        const scale=Math.max(.1,Math.min(mobile?.65:1.14,(regionW+(mobile?20:90))/650,available/430));pose(r['book-scene'],x-325*scale,sy,scale);
      }else if(app.theme==='econquest'){
        const lw=Math.min(mobile?200:on?390:300,regionW-22);pose(r['quest-logo'],x-lw/2,headY,lw/350);
        const s=Math.min(mobile?.5:1,(regionW-16)/530),compact=mobile&&!on;
        pose(r.question,x-195*s,top+(mobile?144:275),s);pose(r.ropes,x-265*s,top+(mobile?170:310),s);
        r.question.style.opacity=compact?'0':'1';r.ropes.style.opacity=compact?'0':'1';
        const ps=Math.min(mobile?(on?.5:.3):.9,(regionW-20)/340);pose(r.party,x-170*ps,Math.max(headY+80,bottom-(mobile?(on?95:48):162)-250*ps),ps);r.party.style.opacity='1';
      }else if(app.theme==='resources'){
        const bs=Math.min(mobile?.8:1.2,(regionW-12)/430);pose(r['resource-brand'],x-215*bs,headY,bs);
        const sy=top+(mobile?(on?148:128):242),ss=Math.max(.1,Math.min(mobile?.65:1.16,(mobile?(regionW-20)/780:(regionW+20)/640),((on?linkY-24:bottom-(mobile?48:116))-sy)/460));pose(r['resource-sheet'],x-320*ss,sy,ss);r['resource-sheet'].style.opacity='1';
      }else if(app.theme==='course'){
        const ts=Math.min(mobile?.8:1.16,(regionW-12)/430);pose(r['course-title'],x-215*ts,headY,ts);
        const sy=top+(mobile?(on?146:132):260),ss=Math.max(.1,Math.min(mobile?.65:1.16,mobile?(regionW-20)/720:(regionW+20)/640,((on?linkY-24:bottom-(mobile?50:112))-sy)/460));pose(r['course-scene'],x-320*ss,sy,ss);r['course-scene'].style.opacity='1';
      }else if(app.theme==='nebs'){
        const bs=Math.min(mobile?.65:1,(regionW-18)/350);pose(r['nebs-brand'],x-175*bs,headY-26,bs);
        const hs=Math.min(mobile?.58:.9,(regionW-12)/400),hy=Math.max(headY+130*bs-12,top+(mobile?110:226));pose(r['nebs-heading'],x-200*hs,hy,hs);r['nebs-heading'].style.opacity='1';
        const fy=hy+sizes[i].heading*hs+14,ps=Math.max(.08,Math.min((regionW+16)/625,((on?linkY-18:bottom-(mobile?48:116))-fy)/650));pose(r['nebs-poster'],x-312.5*ps,fy,ps);r['nebs-poster'].style.opacity='1';
      }else{const s=Math.min(1,(regionW-32)/360);pose(r['generic-name'],x-180*s,headY,s);if(r['generic-image']){r['generic-image'].style.width=regionW+'px';pose(r['generic-image'],x-regionW/2,top);}}
      pose(link,x-Math.min(mobile?216:242,regionW-16)/2,linkY+(on?0:6));
    });
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(apps[i].id===selected)));
    wake();
  }
  function measureNav(){
    const rect=nav.getBoundingClientRect();navPoints=buttons.map(b=>{const r=b.querySelector('.nav-tick').getBoundingClientRect(),label=b.querySelector('.nav-label').getBoundingClientRect();return {x:r.left-rect.left+r.width/2,y:r.top-rect.top+r.height/2,screenX:r.left+r.width/2,screenY:r.top+r.height/2,labelX:label.left+label.width/2,labelY:label.top+label.height/2};});

  }
  function renderIndicator(dt){
    if(!buttons.length)return false;
    const progress=scrub?.active?scrub.progress:navProgress??(controller?currentProgress():phase==='idle'&&selected?apps.findIndex(a=>a.id===selected):currentProgress());
    const p=clamp(progress,0,apps.length-1),lo=Math.floor(p),hi=Math.min(apps.length-1,lo+1),mix=p-lo;
    const a=navPoints[lo],b=navPoints[hi];if(!a||!b)return false;
    const x=a.x+(b.x-a.x)*mix,y=a.y+(b.y-a.y)*mix,pos=mobile?y:x;
    const speed=lastDot===null?0:(pos-lastDot)/Math.max(8,dt);lastDot=pos;if(Math.abs(speed)>.015)direction=Math.sign(speed);
    const target=reduced.matches?0:Math.min(24,Math.abs(speed)*30);strain+=(target-strain)*(1-Math.exp(-dt/65));
    const stretch=Math.abs(strain)<.04?0:strain;
    let zoomMoving=false;tickPaths.forEach((path,i)=>{path.setAttribute('d',liquidLine(showIndicator?p-i:2,stretch,mobile,direction));const target=showIndicator?.92+.26*Math.exp(-Math.pow(p-i,2)/.9):1;labelZoom[i]=reduced.matches?target:labelZoom[i]+(target-labelZoom[i])*(1-Math.exp(-dt/65));zoomMoving=zoomMoving||Math.abs(target-labelZoom[i])>.001;buttons[i].querySelector('.nav-label').style.transform=`scale(${labelZoom[i].toFixed(4)})`;});
    let index=Math.round(p);if(scrub?.active){const previous=scrub.candidate??index,step=Math.abs((mobile?navPoints[1]?.y:navPoints[1]?.x)-(mobile?navPoints[0]?.y:navPoints[0]?.x))||44;if(Math.abs(p-previous)<.5+8/step)index=previous;scrub.candidate=index;}if(index!==lastNavIndex||showIndicator!==lastIndicatorVisible){lastIndicatorVisible=showIndicator;buttons.forEach((button,i)=>button.dataset.current=String(showIndicator&&i===index));lastNavIndex=index;}
    if(!showIndicator)buttons.forEach(button=>button.dataset.current='false');
    // Hit testing respects the current animated diagonal clip, unlike rectangular bounds.
    buttons.forEach((button,i)=>{const point=navPoints[i],panel=document.elementsFromPoint(clamp(point.labelX,0,innerWidth-1),clamp(point.labelY,0,innerHeight-1)).map(el=>el.closest('.panel')).find(Boolean);const tone=panel?.classList.contains('bookself')?'light':'dark';if(button.dataset.surface!==tone)button.dataset.surface=tone;});
    const fraction=p-Math.floor(p),visible=showIndicator&&!reduced.matches&&fraction>.002&&fraction<.998;
    const previous=direction>0?navPoints[lo]:navPoints[hi],flowY=y;
    const dx=x-previous.x,dy=flowY-previous.y,travelled=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)*180/Math.PI;
    transferPath.setAttribute('d',visible?liquidTransfer(travelled,stretch):'');
    transfer.style.transform=`translate3d(${x-56+nav.scrollLeft}px,${flowY-12+nav.scrollTop}px,0) rotate(${angle}deg)`;
    transfer.style.opacity=visible?String(Math.min(1,fraction*12,(1-fraction)*12)):0;
    transfer.dataset.surface=buttons[index]?.dataset.surface||'dark';

    return stretch>.04||zoomMoving;
  }
  function tick(now){
    frame=0;const dt=clamp(now-(lastFrame||now-16),1,48);lastFrame=now;
    if(controller){const c=controller;
      if(c.kind==='coast'){
        const result=coastStep(position(),c.velocity,dt,0,maximum());c.velocity=result.velocity;setPosition(result.position);
        if(Math.abs(c.velocity)<.02){controller=null;settle();}
      }else if(c.kind==='wheel'){
        const next=position()+(c.to-position())*(1-Math.exp(-dt/70));setPosition(next);
        if(Math.abs(c.to-position())<.5&&now-c.input>95){setPosition(c.to);controller=null;settle();}
      }else{
        const t=clamp((now-c.start)/c.duration,0,1),k=ease(t);setPosition(c.from+(c.to-c.from)*k);navProgress=c.navFrom+(c.navTo-c.navFrom)*k;
        if(t===1){clearTransfer();controller=null;navProgress=null;ignoreScrollUntil=now+120;setPhase('idle');}
      }
    }
    if(scrub?.active&&mobile&&nav.scrollHeight>nav.clientHeight){const r=nav.getBoundingClientRect(),y=scrub.clientY,edge=y<r.top+26?-1:y>r.bottom-26?1:0;if(edge){nav.scrollTop+=edge*dt*.22;measureNav();scrub.progress=scrubPosition({clientY:y});}}
    const moving=renderIndicator(dt);if(controller||drag?.active||scrub?.active||moving)wake();else lastFrame=0;
  }
  function travel(target,index,duration,fromProgress){
    const from=position();if(reduced.matches||duration===0){setPosition(target);navProgress=null;ignoreScrollUntil=performance.now()+150;setPhase('idle');wake();return;}
    controller={kind:'travel',from,to:clamp(target,0,maximum()),start:performance.now(),duration,navFrom:fromProgress,navTo:index};navProgress=fromProgress;setPhase('traveling');wake();
  }
  function choose(index,{keyboard=false,keepAnchor=false,toggle=false,source='menu',fromProgress=null}={}){
    if(!apps[index])return;if(keyboard){gallery.classList.add('no-motion');requestAnimationFrame(()=>requestAnimationFrame(()=>gallery.classList.remove('no-motion')));}const oldPosition=position(),oldAnchor=anchor(index),oldProgress=fromProgress??navProgress??currentProgress();stop();
    if(toggle&&selected===apps[index].id){selected=preview=null;showIndicator=false;lastNavIndex=-1;layout(keyboard);status.textContent='已收起，选择一个网页';wake();return;}
    const changed=selected!==apps[index].id;selected=apps[index].id;preview=null;showIndicator=true;lastNavIndex=-1;
    if(changed)layout(keyboard);
    const target=keepAnchor?oldPosition+anchor(index)-oldAnchor:anchor(index);
    const duration=keyboard?0:keepAnchor?420:clamp(280+Math.abs(target-oldPosition)*.12,420,640);
    travel(target,index,duration,oldProgress);status.textContent=`已选择 ${apps[index].name}`;
  }
  function settle(){
    if(drag||scrub||touchHeld)return;const index=Math.round(currentProgress());
    if(apps[index]?.id===selected){setPhase('idle');navProgress=null;wake();return;}
    choose(index,{keepAnchor:true,keyboard:reduced.matches,source:'scroll'});
  }
  function onScroll(){
    showIndicator=showIndicator||phase!=='idle';wake();
    if(controller||drag||scrub||performance.now()<ignoreScrollUntil)return;
    setPhase('scrolling');showIndicator=true;clearTimeout(settleTimer);settleTimer=setTimeout(()=>{if(!touchHeld)settle();},170);
  }
  gallery.addEventListener('scroll',()=>{if(!mobile)onScroll();},{passive:true});
  window.addEventListener('scroll',()=>{if(mobile)onScroll();},{passive:true});
  gallery.addEventListener('wheel',event=>{
    if(mobile||event.ctrlKey||event.metaKey)return;
    const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*(event.deltaMode===1?18:event.deltaMode===2?W:1);
    if(!delta)return;event.preventDefault();const to=clamp((controller?.kind==='wheel'?controller.to:position())+delta,0,maximum());
    clearTimeout(hoverTimer);clearTimeout(settleTimer);preview=null;showIndicator=true;
    if(reduced.matches){controller=null;setPosition(to);setPhase('scrolling');clearTimeout(settleTimer);settleTimer=setTimeout(settle,170);wake();return;}
    controller={kind:'wheel',to,input:performance.now()};navProgress=null;setPhase('scrolling');wake();
  },{passive:false});
  gallery.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;stop();if(event.target.closest('.entry-link'))return;
    if(mobile&&event.pointerType==='touch'){touchHeld=true;setPhase('pressing');return;}
    drag={id:event.pointerId,start:mobile?event.clientY:event.clientX,position:position(),active:false,samples:[]};setPhase('pressing');
  });
  gallery.addEventListener('pointermove',event=>{
    if(drag&&drag.id===event.pointerId){
      const point=mobile?event.clientY:event.clientX,delta=drag.start-point;
      if(!drag.active&&Math.abs(delta)>6){drag.active=true;gallery.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging');clearTimeout(hoverTimer);preview=null;showIndicator=true;setPhase('dragging');}
      if(drag.active){event.preventDefault();setPosition(drag.position+delta);const t=performance.now();drag.samples.push({t,p:position()});drag.samples=drag.samples.filter(s=>t-s.t<130);wake();}return;
    }
    if(mobile||!fine.matches||selected||controller||phase!=='idle'||event.pointerType==='touch')return;
    const id=event.target.closest('.panel')?.dataset.app;if(!id||preview===id)return;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(!drag&&!controller&&!selected){preview=id;layout();showIndicator=true;navProgress=apps.findIndex(a=>a.id===id);wake();}},160);
  });
  function endDrag(event,cancel=false){
    if(touchHeld){touchHeld=false;clearTimeout(settleTimer);settleTimer=setTimeout(settle,190);return;}
    if(!drag||drag.id!==event.pointerId)return;const d=drag;drag=null;gallery.classList.remove('is-dragging');
    if(gallery.hasPointerCapture(event.pointerId))gallery.releasePointerCapture(event.pointerId);
    if(!d.active){setPhase('idle');return;}suppressClickUntil=performance.now()+450;
    const velocity=cancel||reduced.matches?0:releaseVelocity(d.samples,performance.now());
    if(Math.abs(velocity)>.04){controller={kind:'coast',velocity};setPhase('coasting');wake();}else settle();
  }
  gallery.addEventListener('pointerup',event=>endDrag(event));gallery.addEventListener('pointercancel',event=>endDrag(event,true));gallery.addEventListener('lostpointercapture',event=>{if(drag)endDrag(event,true);});
  gallery.addEventListener('pointerleave',()=>{clearTimeout(hoverTimer);if(!selected&&!drag&&!controller)leaveTimer=setTimeout(()=>{preview=null;navProgress=null;layout();showIndicator=false;lastNavIndex=-1;wake();},140);});
  gallery.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();return;}
    const panel=event.target.closest('.panel');if(!panel)return;const index=apps.findIndex(a=>a.id===panel.dataset.app);
    if(event.target.closest('.entry-link')){if(!apps[index]?.url){event.preventDefault();return;}try{history.replaceState({...history.state,mikeHubSelection:apps[index].id},'');}catch{}return;}
    if(event.target.closest('.select-panel'))choose(index,{keyboard:event.detail===0,toggle:true,source:'panel'});
  });
  function scrubPosition(event){
    const rect=nav.getBoundingClientRect(),point=mobile?event.clientY-rect.top:event.clientX-rect.left;
    const points=navPoints.map(p=>mobile?p.y:p.x);return progressAt(point,points);
  }
  nav.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.target.closest('button'))return;const interrupted=navProgress??currentProgress();stop();navProgress=interrupted;measureNav();
    scrub={id:event.pointerId,start:mobile?event.clientY:event.clientX,progress:scrubPosition(event),clientY:event.clientY,active:false,restore:showIndicator};
    scrub.timer=setTimeout(()=>{if(scrub){scrub.active=true;showIndicator=true;nav.setPointerCapture(scrub.id);nav.classList.add('is-scrubbing');setPhase('scrubbing');wake();}},180);
  });
  nav.addEventListener('pointermove',event=>{
    if(!scrub||scrub.id!==event.pointerId)return;
    if(!scrub.active&&Math.abs((mobile?event.clientY:event.clientX)-scrub.start)>6){scrub.active=true;showIndicator=true;nav.setPointerCapture(scrub.id);nav.classList.add('is-scrubbing');setPhase('scrubbing');}
    if(scrub.active){event.preventDefault();scrub.clientY=event.clientY;scrub.progress=scrubPosition(event);wake();}
  });
  function endScrub(event,cancel=false){
    if(!scrub||scrub.id!==event.pointerId)return;const s=scrub;scrub=null;clearTimeout(s.timer);nav.classList.remove('is-scrubbing');if(nav.hasPointerCapture(event.pointerId))nav.releasePointerCapture(event.pointerId);
    if(s.active){navSuppressUntil=performance.now()+450;if(cancel){showIndicator=s.restore;navProgress=null;setPhase('idle');wake();}else choose(s.candidate??Math.round(s.progress),{fromProgress:s.progress});}else setPhase('idle');
  }
  nav.addEventListener('pointerup',event=>endScrub(event));nav.addEventListener('pointercancel',event=>endScrub(event,true));nav.addEventListener('lostpointercapture',event=>{if(scrub)endScrub(event,true);});
  nav.addEventListener('click',event=>{if(performance.now()<navSuppressUntil){event.preventDefault();return;}const index=buttons.indexOf(event.target.closest('button'));if(index>=0)choose(index,{keyboard:event.detail===0});});
  nav.addEventListener('keydown',event=>{
    const index=buttons.indexOf(event.target.closest('button'));if(index<0)return;
    let next=index;if(['ArrowRight','ArrowDown'].includes(event.key))next++;else if(['ArrowLeft','ArrowUp'].includes(event.key))next--;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;
    event.preventDefault();next=clamp(next,0,buttons.length-1);buttons[next].focus({preventScroll:true});const button=buttons[next];if(nav.scrollHeight>nav.clientHeight){nav.scrollTop=button.offsetTop-nav.clientHeight/2+button.offsetHeight/2;measureNav();}choose(next,{keyboard:true});
  });
  nav.addEventListener('scroll',()=>{measureNav();wake();},{passive:true});
  gallery.addEventListener('focusin',event=>{if(event.target.matches('.select-panel:focus-visible')){const i=apps.findIndex(a=>a.id===event.target.closest('.panel').dataset.app);choose(i,{keyboard:true});}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){stop();if(selected){const i=apps.findIndex(a=>a.id===selected);choose(i,{keyboard:true,toggle:true});buttons[i]?.focus({preventScroll:true});}}});
  window.addEventListener('resize',()=>{if(isMobile()&&mobile&&innerWidth===lastWidth){measureNav();wake();return;}lastWidth=innerWidth;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{const index=selected?apps.findIndex(a=>a.id===selected):Math.round(currentProgress());stop();gallery.classList.add('no-motion');layout(true);measureNav();setPosition(anchor(index));requestAnimationFrame(()=>gallery.classList.remove('no-motion'));});});
  reduced.addEventListener('change',()=>{stop();layout(true);strain=0;wake();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();touchHeld=false;if(drag){drag=null;gallery.classList.remove('is-dragging');}if(scrub){clearTimeout(scrub.timer);scrub=null;nav.classList.remove('is-scrubbing');}}else{navProgress=null;strain=0;lastDot=null;wake();}});
  window.addEventListener('pageshow',event=>{if(event.persisted){stop();measureNav();wake();}});
  mount(window.HUB_APPS||[]);
  if(performance.getEntriesByType('navigation')[0]?.type==='back_forward'){
    const i=apps.findIndex(a=>a.id===history.state?.mikeHubSelection);if(i>=0)choose(i,{keyboard:true});
  }
  window.MikeHub={mount,getState:()=>({selected,preview,visible:apps.map(a=>a.id),phase,position:position(),progress:navProgress??currentProgress()})};
})();
