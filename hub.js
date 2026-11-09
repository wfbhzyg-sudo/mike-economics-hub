(() => {
  'use strict';
  const gallery = document.querySelector('.gallery');
  const status = document.querySelector('#selection-status');
  const bounds = new Map();
  const panelMotions = new WeakMap();
  const nav = document.querySelector('.group-nav');
  const appNav = document.querySelector('.app-nav');
  const next = document.querySelector('#next-group');
  const previous = document.querySelector('#previous-group');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileOpen = 520, mobileClosed = 172, mobileSlant = 16;
  // Paint past shared edges: fractional rasterization must never expose the canvas.
  const mobileGutter = 2, mobileSeam = 1;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.8"/></svg>';
  let apps = [], visible = [], panels = [], pinned = null, preview = null, group = 0, capacity = 2;
  let hoverTimer, leaveTimer, lastPoint, lastIntent, resizeFrame, layoutWidth = innerWidth;
  const safeURL = value => { if (typeof value !== 'string' || !value.trim()) return null; try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  function mount(items) {
    clearTimeout(hoverTimer); clearTimeout(leaveTimer); pinned = preview = null; group = 0;
    const seen = new Set();
    apps = items.filter(a => a && typeof a.id === 'string' && !seen.has(a.id) && seen.add(a.id)).map(a => ({...a, name: String(a.name || a.id), url: safeURL(a.url)}));
    if(appNav){appNav.replaceChildren();apps.forEach(app=>{const button=document.createElement('button');button.type='button';button.textContent=app.shortName||app.name;button.dataset.app=app.id;button.setAttribute('aria-label',`选择 ${app.name}`);button.setAttribute('aria-pressed','false');appNav.append(button);});}
    rebuild();
  }
  function rebuild() {
    gallery.classList.add('is-initializing');
    panels.forEach(({panel})=>panelMotions.get(panel)?.cancel());
    const mobile = innerWidth < 768;
    capacity = mobile ? Math.max(1, apps.length) : Math.max(2, Math.min(4, Math.floor(innerWidth * .4 / 160) + 1));
    const pinnedIndex = apps.findIndex(app => app.id === pinned);
    if (pinnedIndex >= 0) group = Math.floor(pinnedIndex / capacity);
    group = Math.min(group, Math.max(0, Math.ceil(apps.length / capacity) - 1));
    visible = apps.slice(group * capacity, (group + 1) * capacity);
    if (preview && !visible.some(app => app.id === preview)) preview = null;
    gallery.replaceChildren(); panels = [];
    visible.forEach(app => {
      const panel = document.createElement('section'); panel.className = 'panel ' + (['bookself','econquest','resources','nebs','course'].includes(app.theme) ? app.theme : 'generic'); panel.dataset.app = app.id;
      const art = document.createElement('div'); art.className = 'panel-art'; art.setAttribute('aria-hidden','true');
      const template = document.getElementById(app.template);
      if (template?.tagName === 'TEMPLATE') art.append(template.content.cloneNode(true));
      else { if (safeURL(app.image)) { const image = document.createElement('img'); image.className='generic-image'; image.src=app.image; image.alt=''; art.append(image); } const name = document.createElement('h2'); name.className='generic-name'; name.textContent=app.name; art.append(name); }
      if(app.theme==='course'){
        const macro=app.subject==='macro', homework=app.kind==='homework';
        panel.classList.add(macro?'course-macro':'course-micro',homework?'course-homework':'course-materials');
        const labels={subject:macro?'AP 宏观':'AP 微观',kind:homework?'作业':'学习材料',english:macro?'AP MACROECONOMICS':'AP MICROECONOMICS',wordmark:macro?'Macro.':'Micro.','book-kind':homework?'Practice':'Study notes',companion:homework?'PDF':'CED',note:homework?'作业 · 答案':'课程与考试说明'};
        art.querySelectorAll('[data-course]').forEach(el=>{if(labels[el.dataset.course])el.textContent=labels[el.dataset.course];});
        const contents=art.querySelector('[data-course="contents"]');
        (homework?['开学—月考','月考—期中','期中—期末','第二学期']:['白皮书','课程与考试说明','Unit PPT 及大纲','复习笔记']).forEach(text=>{const row=document.createElement('span');row.textContent=text;contents.append(row);});
      }
      if(app.caption){const caption=document.createElement('p');caption.className='panel-caption';caption.textContent=app.caption;art.append(caption);}
      const select = document.createElement('button'); select.className='select-panel'; select.type='button'; select.setAttribute('aria-label',`选择 ${app.name}${app.description ? '，'+app.description : ''}`); select.setAttribute('aria-pressed','false'); select.setAttribute('aria-controls',`entry-${app.id}`);
      const link = document.createElement('a'); link.className='entry-link'; link.id=`entry-${app.id}`; link.tabIndex=-1; link.setAttribute('aria-hidden','true');
      if (app.url) link.href=app.url; else link.setAttribute('aria-disabled','true');
      const text = document.createElement('span'); text.textContent = app.url ? (app.entryLabel || `进入 ${app.name}`) : '入口待配置'; link.append(text); link.insertAdjacentHTML('beforeend',arrow);
      panel.append(art,select,link); gallery.append(panel); panels.push({app,panel,art,select,link});
      art.querySelectorAll('img').forEach(img => img.addEventListener('error',() => {img.style.visibility='hidden';if(img.classList.contains('quest-logo')){const label=document.createElement('span');label.className='quest-logo image-fallback';label.textContent=app.name;img.replaceWith(label);layout();}}, {once:true}));
    });
    nav.hidden=apps.length<=capacity; previous.disabled=group===0; next.disabled=(group+1)*capacity>=apps.length;
    document.querySelector('#group-status').textContent=`${group+1} / ${Math.max(1,Math.ceil(apps.length/capacity))}`;
    if (!visible.length) {const empty=document.createElement('p');empty.className='empty';empty.textContent='网页即将加入';gallery.append(empty);}
    layout(); requestAnimationFrame(() => requestAnimationFrame(() => gallery.classList.remove('is-initializing')));
  }
  function move(el,x,y,scale=1) { if(el) el.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`; }
  function layout() {
    const active=pinned || preview, mobile=innerWidth<768, W=gallery.clientWidth+(mobile?2:0);
    const N=visible.length, stacked=mobile&&N>2;
    if(!stacked&&gallery.style.height)gallery.style.height='';
    // Read intrinsic sizes before any layout writes; never reflow once per panel.
    const animatePanels=mobile&&!reduced.matches&&!gallery.matches('.is-initializing,.no-motion');
    const motionStyle=animatePanels?getComputedStyle(gallery):null;
    const duration=animatePanels?parseFloat(motionStyle.getPropertyValue(active?'--move':'--return')):0;
    const easing=motionStyle?.getPropertyValue('--ease').trim();
    const sizes=panels.map(({panel,art,link})=>{const pose=animatePanels?getComputedStyle(panel):null;return {link:link.offsetWidth,heading:art.querySelector('.nebs-heading')?.offsetHeight||0,pose:pose?{transform:pose.transform,clipPath:pose.clipPath}:null};});
    const H=stacked?Math.max(mobileOpen+(N-1)*mobileClosed,N*259):gallery.clientHeight;
    gallery.style.height=stacked?`${H}px`:'';
    let offset=0;
    gallery.classList.toggle('is-resting',!active); gallery.dataset.active=active||''; gallery.dataset.selected=pinned||'';
    appNav?.querySelectorAll('button').forEach(button=>{button.dataset.current=String(button.dataset.app===active);button.setAttribute('aria-pressed',String(button.dataset.app===pinned));});
    const motionStart=document.timeline.currentTime;
    panels.forEach(({app,panel,art,select,link},i)=>{
      panelMotions.get(panel)?.cancel();
      const on=active===app.id;let share=!active?1/N:(N===1?1:(on?.6:.4/(N-1)));
      if(mobile && N===2 && active){const book=panels.find(p=>p.app.id===active)?.app.theme==='bookself';share=on?(book?.66:.63):(book?.34:.37);}
      if(stacked && active) share=(on ? mobileOpen : (H-mobileOpen)/(N-1))/H;
      const length=(mobile?H:W)*share,start=offset,end=offset+length;offset=end;
      bounds.set(app.id,{start,end});
      const slant=mobile?mobileSlant:Math.min(N>2?28:72,(W/N)*.12);
      const seam=mobile&&i?mobileSeam:0;
      const startTop=i?start+slant-seam:0,endTop=i===N-1?(mobile?H:W):end+slant;
      const startBottom=i?start-slant-seam:0,endBottom=i===N-1?(mobile?H:W):end-slant;
      const localTop=stacked?slant+mobileGutter:0;
      panel.style.height=stacked?`${mobileOpen+slant*2+mobileGutter*2}px`:'';
      panel.style.transform=stacked?`translate3d(0,${start-slant-mobileGutter}px,0)`:'';
      panel.style.clipPath=stacked?`polygon(0 ${mobileGutter+(i?slant*2-seam:slant)}px,100% ${mobileGutter+(i?-seam:slant)}px,100% ${mobileGutter+length+(i===N-1?slant:0)}px,0 ${mobileGutter+length+(i===N-1?slant:slant*2)}px)`:mobile?`polygon(0 ${startTop}px,100% ${startBottom}px,100% ${endBottom}px,0 ${endTop}px)`:`polygon(${startTop}px 0,${endTop}px 0,${endBottom}px 100%,${startBottom}px 100%)`;
      // CSS reverses transform and clip-path independently. Restart every panel
      // from its painted pose on one clock so shared edges stay joined on reversal.
      if(animatePanels){
        const animation=panel.animate([sizes[i].pose,{transform:panel.style.transform||'none',clipPath:panel.style.clipPath}],{duration,easing});
        animation.startTime=motionStart;panelMotions.set(panel,animation);
        animation.onfinish=()=>{if(panelMotions.get(panel)===animation)panelMotions.delete(panel);};
      }
      panel.classList.toggle('is-active',on);select.setAttribute('aria-pressed',String(pinned===app.id));link.tabIndex=on&&app.url?0:-1;link.setAttribute('aria-hidden',String(!on));
      const center=mobile?W/2:(start+end)/2,top=stacked?localTop:mobile?start:0,bottom=stacked?localTop+length:mobile?end:H,regionH=mobile?length:H,regionW=mobile?W:length,v=Math.min(1,H/824);
      const linkY=bottom-(mobile?(app.theme==='bookself'?58:22):52*v)-(mobile?48:54);
      const bg=art.querySelector('.backdrop');if(bg){const bw=mobile?W:W*.6+slant*2;bg.style.width=bw+'px';bg.style.height=(stacked?mobileOpen+slant*2+mobileGutter*2:mobile?Math.max(regionH,480)+slant*2:H)+'px';move(bg,center-bw/2,stacked?0:mobile?top-slant:0);}
      const collapsed=active&&!on;
      panel.classList.toggle('is-compressed',!!collapsed);
      const caption=art.querySelector('.panel-caption');if(caption){const cs=Math.min(1,(regionW-32)/300);move(caption,center-150*cs,bottom-(mobile?34:58),cs);}
      if(app.theme==='bookself'){
        const logoW=mobile?(on?240:190):Math.min(on?360:310,regionW-48);
        move(art.querySelector('.book-logo'),center-logoW/2,top+(mobile?(on?49:32):78*v),logoW/310);
        const sy=top+(mobile?(on?154:102):(on?230:255)*v);
        const available=(on?linkY-24:bottom-88)-sy;
        const scale=mobile?Math.min(on?.55:.47,(W-20)/650):Math.min(1.03,(regionW+(collapsed?50:100))/650,available/430);
        move(art.querySelector('.book-scene'),center-325*scale,sy,scale);
      } else if(app.theme==='econquest'){
        const compact=mobile&&N>2&&collapsed;
        const resting=stacked&&!active;
        const logoW=mobile?(compact?160:(resting?180:collapsed?190:240)):Math.min(on?400:350,regionW*.8);
        move(art.querySelector('.quest-logo'),center-logoW/2,top+(mobile?(resting?28:compact?38:45):58*v),logoW/350);
        const qs=mobile?.71:Math.min(1,(regionW-16)/480,v);move(art.querySelector('.question'),center-195*qs,top+(mobile?165:260*v),qs);
        const rs=mobile?Math.min(.62,(W-24)/530):Math.min(1.05,(regionW+20)/530,v);move(art.querySelector('.ropes'),center-265*rs,top+(mobile?188:290*v),rs);
        const ps=mobile?(resting?.36:collapsed?.43:.69):Math.min(1.08,(regionW+45)/460,v);move(art.querySelector('.party'),center-170*ps,(mobile ? bottom-(resting?52:collapsed?0:88)-250*ps : Math.min(linkY-28-250*ps,top+300*v+155*rs)),ps);
        art.querySelector('.party').style.opacity=compact?'0':'1';
        for(const c of ['.question','.ropes'])art.querySelector(c).style.opacity=mobile&&(collapsed||resting)?'0':'1';
      } else if(app.theme==='resources') {
        const compact=mobile&&N>2&&collapsed;
        const bs=mobile?(compact?.61:.79):Math.min(1.18,(regionW-22)/430);
        move(art.querySelector('.resource-brand'),center-215*bs,top+(mobile?(compact?38:42):64*v),bs);
        const sheet=art.querySelector('.resource-sheet'),sheetY=top+(mobile?(on?180:136):245*v);
        const availableHeight=(on?linkY-24:bottom-62)-sheetY;
        const ss=Math.max(.1,Math.min(mobile?.62:1.12,(regionW+(mobile?15:90))/640,availableHeight/460));
        move(sheet,center-320*ss,sheetY,ss);
        sheet.style.opacity=compact?'0':'1';
      } else if(app.theme==='course') {
        const compact=stacked&&collapsed;
        const ts=Math.min(mobile?.8:1.1,(regionW-24)/430);
        move(art.querySelector('.course-title'),center-215*ts,top+(mobile?32:65*v),ts);
        const sceneY=top+(mobile?(on?172:130):235*v);
        const available=(on?linkY-26:bottom-55)-sceneY;
        const ss=Math.max(.1,Math.min(mobile?.64:1.12,(regionW+35)/640,available/460));
        move(art.querySelector('.course-scene'),center-320*ss,sceneY,ss);
        art.querySelector('.course-scene').style.opacity=compact?'0':'1';
      } else if(app.theme==='nebs') {
        const compact=mobile&&N>2&&collapsed;
        const bs=mobile?(compact?.65:.72):Math.min(on?1.05:.88,(regionW-28)/350,v);
        const brandY=top+(mobile?18:43*v);
        move(art.querySelector('.nebs-brand'),center-175*bs,brandY,bs);
        const hs=mobile?(on?.67:.47):Math.min(on?.94:.7,(regionW-24)/400,v);
        const heading=art.querySelector('.nebs-heading');
        const headingY=mobile?top+(on?116:103):Math.max(top+(on?169:157)*v,brandY+130*bs+18);
        move(heading,center-200*hs,headingY,hs);
        heading.style.opacity=compact?'0':'1';
        const fy=mobile?top+(on?237:155):Math.max(top+(on?348:310)*v,headingY+sizes[i].heading*hs+18);
        const maxHeight=(on?linkY-24:bottom-60)-fy;
        const ps=Math.max(.1,Math.min((regionW+40)/625,maxHeight/650)),pw=625*ps;
        move(art.querySelector('.nebs-poster'),center-pw/2,fy,ps);
        art.querySelector('.nebs-poster').style.opacity=compact?'0':'1';
      } else {move(art.querySelector('.generic-name'),center-180*Math.min(1,(regionW-36)/360),top+Math.min(100,regionH/4),Math.min(1,(regionW-36)/360));const image=art.querySelector('.generic-image');if(image){image.style.width=Math.max(regionW,360)+'px';move(image,center-Math.max(regionW,360)/2,top);}}
      const linkW=sizes[i].link;
      move(link,center-linkW/2,linkY+(on?0:8));
    });
  }
  function revealShortcut(id,keyboard=false){
    const button=[...(appNav?.querySelectorAll('button')||[])].find(button=>button.dataset.app===id);if(!button)return;
    const left=button.offsetLeft,right=left+button.offsetWidth,current=appNav.scrollLeft;
    const target=left<current?left:right>current+appNav.clientWidth?right-appNav.clientWidth:current;
    if(target!==current)appNav.scrollTo({left:target,behavior:keyboard||reduced.matches?'instant':'smooth'});
  }
  function update(keyboard=false) {if(keyboard)gallery.classList.add('no-motion');layout();if(keyboard)requestAnimationFrame(()=>requestAnimationFrame(()=>gallery.classList.remove('no-motion')));}
  function choose(id,keyboard=false){clearTimeout(hoverTimer);clearTimeout(leaveTimer);pinned=pinned===id?null:id;preview=null;lastIntent=null;update(keyboard);if(innerWidth<768&&pinned){window.scrollTo({top:Math.max(0,bounds.get(id)?.start||0),behavior:reduced.matches||keyboard?'instant':'smooth'});}if(pinned)revealShortcut(pinned,keyboard);status.textContent=pinned?`已选择 ${apps.find(a=>a.id===pinned)?.name}`:'已收起，选择一个网页';}
  appNav?.addEventListener('click',event=>{const id=event.target.closest('button')?.dataset.app;if(!id)return;if(!visible.some(app=>app.id===id)){pinned=id;preview=null;clearTimeout(hoverTimer);rebuild();status.textContent=`已选择 ${apps.find(app=>app.id===id)?.name}`;}else choose(id,event.detail===0);});
  gallery.addEventListener('click',event=>{
    const panel=event.target.closest('.panel');if(!panel)return;
    if(event.target.closest('.entry-link')){const app=apps.find(a=>a.id===panel.dataset.app);if(!app?.url){event.preventDefault();return;}try{history.replaceState({...history.state,mikeHubSelection:app.id},'');}catch{}return;}
    if(event.target.closest('.select-panel'))choose(panel.dataset.app,event.detail===0);
  });
  gallery.addEventListener('pointermove',event=>{
    if(innerWidth<768||!fine.matches||event.pointerType==='touch'||pinned)return;
    clearTimeout(leaveTimer);
    if(lastPoint&&Math.hypot(event.clientX-lastPoint.x,event.clientY-lastPoint.y)<2)return;
    lastPoint={x:event.clientX,y:event.clientY};const id=event.target.closest('.panel')?.dataset.app;
    if(!id||id===lastIntent)return;lastIntent=id;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(!pinned){preview=id;update();}},100);
  });
  gallery.addEventListener('pointerleave',()=>{lastIntent=lastPoint=null;clearTimeout(hoverTimer);if(!pinned)leaveTimer=setTimeout(()=>{if(!gallery.contains(document.activeElement)){preview=null;update();}},160);});
  gallery.addEventListener('focusin',event=>{if(event.target.matches('.select-panel:focus-visible')&&!pinned){preview=event.target.closest('.panel').dataset.app;update(true);}});
  gallery.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!gallery.contains(document.activeElement)&&!pinned){preview=null;update(true);}});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(pinned||preview)){const current=panels.find(p=>p.app.id===(pinned||preview));current?.select.focus({preventScroll:true});pinned=preview=null;lastIntent=null;clearTimeout(hoverTimer);update(true);status.textContent='已收起，选择一个网页';}});
  fine.addEventListener('change',()=>{clearTimeout(hoverTimer);preview=null;update();});
  reduced.addEventListener('change',()=>update(true));
  function page(delta){group+=delta;pinned=preview=null;clearTimeout(hoverTimer);rebuild();status.textContent=`第 ${group+1} 组应用`;}
  previous.addEventListener('click',()=>page(-1));next.addEventListener('click',()=>page(1));
  window.addEventListener('resize',()=>{if(innerWidth<768&&innerWidth===layoutWidth)return;layoutWidth=innerWidth;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{const cap=innerWidth<768?Math.max(1,apps.length):Math.max(2,Math.min(4,Math.floor(innerWidth*.4/160)+1));if(cap!==capacity)rebuild();else{gallery.classList.add('no-motion');layout();requestAnimationFrame(()=>gallery.classList.remove('no-motion'));}});});
  window.addEventListener('pageshow',event=>{if(event.persisted){preview=null;layout();}});
  mount(window.HUB_APPS||[]);
  const navigation=performance.getEntriesByType('navigation')[0];if(navigation?.type==='back_forward'&&apps.some(a=>a.id===history.state?.mikeHubSelection)){pinned=history.state.mikeHubSelection;rebuild();}
  window.MikeHub={mount,getState:()=>({selected:pinned,preview,visible:visible.map(a=>a.id),group})};
})();
