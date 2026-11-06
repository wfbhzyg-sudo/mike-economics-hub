(() => {
  'use strict';
  const gallery = document.querySelector('.gallery');
  const status = document.querySelector('#selection-status');
  const bounds = new Map();
  const nav = document.querySelector('.group-nav');
  const next = document.querySelector('#next-group');
  const previous = document.querySelector('#previous-group');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.8"/></svg>';
  let apps = [], visible = [], panels = [], pinned = null, preview = null, group = 0, capacity = 2;
  let hoverTimer, leaveTimer, lastPoint, lastIntent, resizeFrame;
  const safeURL = value => { if (typeof value !== 'string' || !value.trim()) return null; try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  function mount(items) {
    clearTimeout(hoverTimer); clearTimeout(leaveTimer); pinned = preview = null; group = 0;
    const seen = new Set();
    apps = items.filter(a => a && typeof a.id === 'string' && !seen.has(a.id) && seen.add(a.id)).map(a => ({...a, name: String(a.name || a.id), url: safeURL(a.url)}));
    rebuild();
  }
  function rebuild() {
    gallery.classList.add('is-initializing');
    const mobile = innerWidth < 768;
    capacity = mobile ? Math.max(1, apps.length) : Math.max(2, Math.min(4, Math.floor(innerWidth * .4 / 160) + 1));
    const pinnedIndex = apps.findIndex(app => app.id === pinned);
    if (pinnedIndex >= 0) group = Math.floor(pinnedIndex / capacity);
    group = Math.min(group, Math.max(0, Math.ceil(apps.length / capacity) - 1));
    visible = apps.slice(group * capacity, (group + 1) * capacity);
    if (preview && !visible.some(app => app.id === preview)) preview = null;
    gallery.replaceChildren(); panels = [];
    visible.forEach(app => {
      const panel = document.createElement('section'); panel.className = 'panel ' + (['bookself','econquest','resources','nebs'].includes(app.theme) ? app.theme : 'generic'); panel.dataset.app = app.id;
      const art = document.createElement('div'); art.className = 'panel-art'; art.setAttribute('aria-hidden','true');
      const template = document.getElementById(app.template);
      if (template?.tagName === 'TEMPLATE') art.append(template.content.cloneNode(true));
      else { if (safeURL(app.image)) { const image = document.createElement('img'); image.className='generic-image'; image.src=app.image; image.alt=''; art.append(image); } const name = document.createElement('h2'); name.className='generic-name'; name.textContent=app.name; art.append(name); }
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
    const active=pinned || preview, mobile=innerWidth<768, W=gallery.clientWidth;
    gallery.style.height=mobile && visible.length>2 ? `${active ? 520+(visible.length-1)*180 : visible.length*260}px` : '';
    const H=gallery.clientHeight,N=visible.length;
    let offset=0;
    gallery.classList.toggle('is-resting',!active); gallery.dataset.active=active||''; gallery.dataset.selected=pinned||'';
    panels.forEach(({app,panel,art,select,link},i)=>{
      const on=active===app.id;let share=!active?1/N:(N===1?1:(on?.6:.4/(N-1)));
      if(mobile && N===2 && active){const book=panels.find(p=>p.app.id===active)?.app.theme==='bookself';share=on?(book?.66:.63):(book?.34:.37);}
      if(mobile && N>2 && active) share=(on ? 520 : 180)/H;
      const length=(mobile?H:W)*share,start=offset,end=offset+length;offset=end;
      bounds.set(app.id,{start,end});
      const slant=mobile?18:Math.min(N>2?28:72,(W/N)*.12);
      const startTop=i?start+slant:0,endTop=i===N-1?(mobile?H:W):end+slant;
      const startBottom=i?start-slant:0,endBottom=i===N-1?(mobile?H:W):end-slant;
      panel.style.clipPath=mobile?`polygon(0 ${startTop}px,100% ${startBottom}px,100% ${endBottom}px,0 ${endTop}px)`:`polygon(${startTop}px 0,${endTop}px 0,${endBottom}px 100%,${startBottom}px 100%)`;
      panel.classList.toggle('is-active',on);select.setAttribute('aria-pressed',String(pinned===app.id));link.tabIndex=on&&app.url?0:-1;link.setAttribute('aria-hidden',String(!on));
      const center=mobile?W/2:(start+end)/2,top=mobile?start:0,bottom=mobile?end:H,regionH=mobile?length:H,regionW=mobile?W:length,v=Math.min(1,H/824);
      const linkY=bottom-(mobile?(app.theme==='bookself'?58:22):52*v)-(mobile?48:54);
      const bg=art.querySelector('.backdrop');if(bg){const bw=mobile?W:W*.6+slant*2;bg.style.width=bw+'px';bg.style.height=(mobile?Math.max(regionH,480)+slant*2:H)+'px';move(bg,center-bw/2,mobile?start-slant:0);}
      const collapsed=active&&!on;
      if(app.theme==='bookself'){
        const logoW=mobile?(on?235:190):Math.min(collapsed?270:310,regionW-60);
        move(art.querySelector('.book-logo'),center-logoW/2,top+(mobile?(on?47:30):85*v),logoW/310);
        const scale=mobile?Math.min(on?.56:.47,(W-20)/650):Math.min(1,(regionW-80)/650,v);
        move(art.querySelector('.book-scene'),center-325*scale,top+(mobile?(on?145:100):245*v),scale);
      } else if(app.theme==='econquest'){
        const compact=mobile&&N>2&&collapsed;
        const logoW=mobile?(compact?160:(collapsed?190:240)):Math.min(collapsed?280:350,regionW*.78);
        move(art.querySelector('.quest-logo'),center-logoW/2,top+(mobile?(compact?38:48):(collapsed?86:60)*v),logoW/350);
        const qs=mobile?.71:Math.min(1,regionW/600,v);move(art.querySelector('.question'),center-195*qs,top+(mobile?167:248*v),qs);
        const rs=mobile?Math.min(.62,(W-24)/530):Math.min(1,(regionW-40)/530,v);move(art.querySelector('.ropes'),center-265*rs,top+(mobile?187:280*v),rs);
        const ps=mobile?(collapsed?.43:.69):Math.min(1,regionW/600,v);move(art.querySelector('.party'),center-170*ps,(mobile ? bottom-(collapsed?0:88)-250*ps : Math.min(bottom-155*v-250*ps,top+280*v+170*rs)),ps);
        art.querySelector('.party').style.opacity=compact?'0':'1';
        for(const c of ['.question','.ropes'])art.querySelector(c).style.opacity=mobile&&collapsed?'0':'1';
      } else if(app.theme==='resources') {
        const compact=mobile&&N>2&&collapsed;
        const bs=mobile?(compact?.7:.88):Math.min(1,(regionW-44)/330);
        move(art.querySelector('.resource-brand'),center-165*bs,top+(mobile?(compact?24:38):68*v),bs);
        const sheet=art.querySelector('.resource-sheet'),sheetY=top+(mobile?196:265*v);
        const availableHeight=(on?linkY-24:bottom-36)-sheetY;
        const ss=Math.max(.1,Math.min(mobile?.66:1,(regionW-(mobile?30:60))/480,v,availableHeight/sheet.offsetHeight));
        move(sheet,center-240*ss,sheetY,ss);
        sheet.style.opacity=compact?'0':'1';
      } else if(app.theme==='nebs') {
        const compact=collapsed || (mobile&&!active);
        const bs=mobile?.72:Math.min(1,(regionW-36)/350);
        move(art.querySelector('.nebs-brand'),center-175*bs,top+(mobile?36:100*v),bs);
        art.querySelector('.nebs-brand').style.opacity=compact?'1':'0';
        const ph=mobile?Math.min(390,regionH-112):Math.min(H-178,(regionW-58)*1672/941);
        const ps=ph/1672,pw=941*ps;
        move(art.querySelector('.nebs-poster'),center-pw/2,top+(mobile?28:44*v),ps);
        art.querySelector('.nebs-poster').style.opacity=compact?'0':'1';
      } else {move(art.querySelector('.generic-name'),center-180*Math.min(1,(regionW-36)/360),top+Math.min(100,regionH/4),Math.min(1,(regionW-36)/360));const image=art.querySelector('.generic-image');if(image){image.style.width=Math.max(regionW,360)+'px';move(image,center-Math.max(regionW,360)/2,top);}}
      const linkW=link.getBoundingClientRect().width;
      move(link,center-linkW/2,linkY+(on?0:8));
    });
  }
  function update(keyboard=false) {if(keyboard)gallery.classList.add('no-motion');layout();if(keyboard)requestAnimationFrame(()=>requestAnimationFrame(()=>gallery.classList.remove('no-motion')));}
  function choose(id,keyboard=false){const oldStart=innerWidth<768&&visible.length>2?bounds.get(id)?.start:null;clearTimeout(hoverTimer);clearTimeout(leaveTimer);pinned=pinned===id?null:id;preview=null;lastIntent=null;update(keyboard);if(oldStart!=null){const delta=(bounds.get(id)?.start??oldStart)-oldStart;window.scrollBy({top:delta,behavior:'instant'});}status.textContent=pinned?`已选择 ${apps.find(a=>a.id===pinned)?.name}`:'已收起，选择一个网页';}
  gallery.addEventListener('click',event=>{
    const panel=event.target.closest('.panel');if(!panel)return;
    if(event.target.closest('.entry-link')){const app=apps.find(a=>a.id===panel.dataset.app);if(!app?.url){event.preventDefault();return;}try{history.replaceState({...history.state,mikeHubSelection:app.id},'');}catch{}return;}
    if(event.target.closest('.select-panel'))choose(panel.dataset.app,event.detail===0);
  });
  gallery.addEventListener('pointermove',event=>{
    if(!fine.matches||event.pointerType==='touch'||pinned)return;
    clearTimeout(leaveTimer);
    if(lastPoint&&Math.hypot(event.clientX-lastPoint.x,event.clientY-lastPoint.y)<2)return;
    lastPoint={x:event.clientX,y:event.clientY};const id=event.target.closest('.panel')?.dataset.app;
    if(!id||id===lastIntent)return;lastIntent=id;clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(!pinned){preview=id;update();}},100);
  });
  gallery.addEventListener('pointerleave',()=>{lastIntent=lastPoint=null;clearTimeout(hoverTimer);if(!pinned)leaveTimer=setTimeout(()=>{if(!gallery.contains(document.activeElement)){preview=null;update();}},160);});
  gallery.addEventListener('focusin',event=>{if(event.target.matches('.select-panel')&&!pinned){preview=event.target.closest('.panel').dataset.app;update(true);}});
  gallery.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!gallery.contains(document.activeElement)&&!pinned){preview=null;update(true);}});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(pinned||preview)){const current=panels.find(p=>p.app.id===(pinned||preview));current?.select.focus({preventScroll:true});pinned=preview=null;lastIntent=null;clearTimeout(hoverTimer);update(true);status.textContent='已收起，选择一个网页';}});
  fine.addEventListener('change',()=>{clearTimeout(hoverTimer);preview=null;update();});
  function page(delta){group+=delta;pinned=preview=null;clearTimeout(hoverTimer);rebuild();status.textContent=`第 ${group+1} 组应用`;}
  previous.addEventListener('click',()=>page(-1));next.addEventListener('click',()=>page(1));
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{const cap=innerWidth<768?Math.max(1,apps.length):Math.max(2,Math.min(4,Math.floor(innerWidth*.4/160)+1));if(cap!==capacity)rebuild();else{gallery.classList.add('no-motion');layout();requestAnimationFrame(()=>gallery.classList.remove('no-motion'));}});});
  window.addEventListener('pageshow',event=>{if(event.persisted){preview=null;layout();}});
  mount(window.HUB_APPS||[]);
  const navigation=performance.getEntriesByType('navigation')[0];if(navigation?.type==='back_forward'&&apps.some(a=>a.id===history.state?.mikeHubSelection)){pinned=history.state.mikeHubSelection;rebuild();}
  window.MikeHub={mount,getState:()=>({selected:pinned,preview,visible:visible.map(a=>a.id),group})};
})();
