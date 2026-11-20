const API='/api/homework/';
let syncOpenLayer;
const host=document.createElement('div');
host.id='mike-companion';
host.setAttribute('popover','manual');
host.setAttribute('data-html2canvas-ignore','');
if(document.querySelector('#desk,.notebook-login'))host.dataset.notebook='';
const ui=host.attachShadow({mode:'open'});
const style=document.createElement('style');
ui.innerHTML=`<button class="mike-launcher" aria-label="打开 Mike 经济学伙伴" aria-expanded="false"><img src="/assets/mike-pixel.png" alt="" width="56" height="56"><span class="mike-launcher-label">问问 Mike</span></button><section class="mike-chat" role="dialog" aria-label="Mike 经济学伙伴" hidden><div class="mike-sheet-handle" aria-hidden="true"><span></span></div><header><img src="/assets/mike-pixel.png" alt="" width="40" height="40"><div><strong>Mike 经济学伙伴</strong><small>经济学与平台使用</small></div><details class="mike-menu"><summary aria-label="对话菜单" title="对话菜单">•••</summary><div class="mike-menu-list"><button data-action="history" title="查看历史对话">历史</button><button data-action="new">新对话</button><footer class="mike-chat-options"><button data-action="hide">本页隐藏伙伴</button><label><input type="checkbox" id="mike-motion">减少动效</label></footer></div></details><button data-action="close" aria-label="关闭对话">×</button></header><div class="mike-mode" hidden></div><div class="mike-chat-messages" role="log" aria-live="polite"></div><form class="mike-composer"><label for="mike-message">向 Mike 提问</label><textarea id="mike-message" rows="2" maxlength="3000" placeholder="输入经济学或平台使用问题…"></textarea><figure class="mike-preview" hidden><button type="button" data-action="zoom-shot" aria-label="放大或缩小截图" aria-expanded="false"><img alt="待发送的截图"></button><figcaption>随本次提问发送给 DeepSeek</figcaption><button type="button" data-action="remove-shot">移除</button></figure><details id="mike-context-preview" hidden><summary>将发送的引用内容</summary><pre></pre></details><p class="mike-chat-status" role="status"></p><div class="mike-send-row"><details class="mike-clip"><summary>＋ 附件与引用</summary><div><label class="mike-context"><input type="checkbox" id="mike-context"><span class="mike-context-label">引用当前页面文字</span></label><div class="mike-attachments"><button type="button" data-action="capture">截取当前屏幕</button><button type="button" data-action="upload-shot">选择截图</button><button type="button" data-action="browser-shot" hidden>用浏览器截取标签页</button><input id="mike-shot-file" type="file" accept="image/png,image/jpeg,image/webp" hidden></div></div></details><button type="button" data-action="stop" hidden>停止</button><button type="submit" aria-label="发送消息" title="发送消息">发送 <span aria-hidden="true">↑</span></button></div></form></section>`;ui.prepend(style);
host.style.cssText='position:fixed!important;inset:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;overflow:visible!important;pointer-events:none!important;z-index:2147483647!important;color-scheme:light;visibility:hidden!important';
function syncLayer(){
  if(host.hidden)return;
  const modals=[...document.querySelectorAll('dialog:modal')];
  const decision=modals.some(d=>d.matches('.publish-check,.bank-publish-dialog,.mcq-palette-dialog'));
  host.toggleAttribute('data-decision',decision);
  const focused=document.activeElement?.closest('dialog:modal');
  const parent=focused || (modals.includes(host.parentElement)?host.parentElement:modals.at(-1)) || document.fullscreenElement || document.body;
  if(host.parentElement!==parent)parent.append(host);
  if(host.showPopover&&!host.matches(':popover-open'))host.showPopover();
  syncOpenLayer?.();
}
syncLayer();
new MutationObserver(syncLayer).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true,childList:true});
document.addEventListener('fullscreenchange',syncLayer);
const syncPaperSurface=()=>host.toggleAttribute('data-paper-active',document.body.dataset.mcqActive==='true');
new MutationObserver(syncPaperSurface).observe(document.body,{attributes:true,attributeFilter:['data-mcq-active']});
syncPaperSurface();

const $=s=>ui.querySelector(s),launcher=$('.mike-launcher'),panel=$('.mike-chat'),log=$('.mike-chat-messages'),form=$('form'),input=$('textarea'),status=$('.mike-chat-status');let csrf='',user=null,controller=null,requestId=null,captured='',mode='learning',lastFocus=null,motion=null;
let profile=null,section='',returnFocus=null,pendingUnlock=null;
const drawer=document.createElement('section');
drawer.className='mike-drawer';drawer.hidden=true;drawer.setAttribute('aria-label','伙伴面板');
panel.append(drawer);
const tier=document.createElement('button');
tier.className='mike-tier';tier.type='button';tier.textContent='伙伴手册';
panel.querySelector('header small').after(tier);
const updates=document.createElement('button');updates.textContent='更新';updates.hidden=true;
$('.mike-chat-options').prepend(updates);
ui.addEventListener('click',e=>{
 for(const menu of ui.querySelectorAll('.mike-menu[open],.mike-clip[open]')){
  if(!menu.contains(e.target)||e.target.closest('button'))menu.open=false;
 }
});

const launcherText=launcher.querySelector('.mike-launcher-label');
const props=[
 '<path fill="#e8bd79" d="M2 5h8v1h3V5h8v14h-8v1h-3v-1H2z"/><path d="M11 6v12"/>',
 '<rect x="5" y="2" width="14" height="19" fill="#e8aa89"/><path d="M9 2v19m3-13h4m-4 4h4"/>',
 '<rect x="1" y="4" width="22" height="16" fill="#daf1e5"/><path d="M4 7v10h15m-13-2 11-7m-11 0 11 7"/>',
 '<circle cx="10" cy="9" r="7" fill="#cbe5f3"/><path stroke-width="4" d="m15 14 7 7"/>',
 '<rect x="1" y="3" width="22" height="15" fill="#386153"/><path stroke="#fff" d="m5 13 4-4 4 2 5-5"/><path d="m7 19-2 4m13-4 2 4"/>'
];
function symbol(index){
 return '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="#273e43" stroke-width="1.6" fill="none" shape-rendering="crispEdges">'+props[index]+'</svg>';
}
function outfit(index){return '/assets/companion/quest-mike-'+index+'.webp';}
function avatar(index){return '<span class="mike-avatar"><img src="'+outfit(index)+'" alt="">'+symbol(index)+'</span>';}
let savedOutfit, outfitRequest=0;
const rigStyle=document.createElement('style');
ui.append(rigStyle);
function wearingQuest(){return profile?.appearanceSource==='partner'?null:savedOutfit;}
function paintOutfit(target,identity){
 if(!target)return;
 const wear=wearingQuest(), current=target.querySelector(':scope > .mike-wear');
 if(!wear){current?.remove();return;}
 if(current?.dataset.revision===wear.revision)return;
 const view=document.createElement('span');
 view.className='mike-wear';view.dataset.revision=wear.revision;view.setAttribute('aria-hidden','true');
 view.innerHTML=wear.html.replace(/(\sid="|url\(#)([a-z0-9-]+)/gi,'$1'+identity+'-$2');
 if(current)current.replaceWith(view);else target.prepend(view);
}
function renderOutfit(){
 paintOutfit(launcher,'launcher');
 paintOutfit(panel.querySelector('header'),'header');
 paintOutfit(drawer.querySelector('.mike-current-look'),'handbook');
}
async function refreshOutfit(){
 const epoch=++outfitRequest;
 try{
  const r=await fetch('/api/quest/companion-outfit',{cache:'no-store',signal:AbortSignal.timeout(8000)});
  const next=r.ok?(await r.json()).outfit:null;
  if(epoch!==outfitRequest)return;
  const changed=savedOutfit?.revision!==next?.revision||savedOutfit===undefined;
  savedOutfit=next;
  if(next&&rigStyle.textContent!==next.css)rigStyle.textContent=next.css;
  renderOutfit();
  if(changed&&section==='handbook'){
   const active=ui.activeElement;
   paintDrawer();
   if(active&&!active.isConnected)drawer.querySelector('[data-back]').focus();
  }
 }catch{}
}
function applyProfile(next,announce=false){
 if(!next)return;
 const unlocked=announce&&profile&&next.level>profile.level;
 profile=next;document.dispatchEvent(new CustomEvent('mike:release-profile',{detail:{profile,csrf}}));tier.hidden=false;updates.hidden=false;
 panel.querySelector('header small').hidden=true;
 let emblem=panel.querySelector('header .mike-avatar');
 if(next.student){if(!emblem){panel.querySelector('header>img').insertAdjacentHTML('beforebegin',avatar(next.equipped));emblem=panel.querySelector('header .mike-avatar');}else {emblem.querySelector('img').src=outfit(next.equipped);emblem.querySelector('svg').outerHTML=symbol(next.equipped);}}
 else emblem?.remove();
 panel.querySelector('header>img').hidden=next.student;
 launcher.querySelector('img').src=next.student?outfit(next.equipped):'/assets/mike-pixel.png';
 launcher.querySelector('.mike-equipped')?.remove();
 if(next.student){const prop=document.createElement('i');prop.className='mike-equipped';prop.innerHTML=symbol(next.equipped);launcher.append(prop);}
 launcherText.textContent=next.unread?'功能更新':'问问 Mike';launcher.setAttribute('aria-label',next.unread?'打开 Mike 经济学伙伴，有新的功能更新':'打开 Mike 经济学伙伴');
 launcher.classList.toggle('has-news',next.unread);updates.textContent=next.unread?'更新 ●':'更新';
 renderOutfit();
 if(section&&(!drawer.contains(ui.activeElement)||drawer.querySelector('[data-retry-profile]')))paintDrawer();
 if(unlocked){
   pendingUnlock=next.level;
   try{if(next.appearanceKey)localStorage.setItem('mike:unlock:'+next.appearanceKey,String(next.level));}catch{}
 }
 if(unlocked)status.textContent=next.stages[next.level].name+'已解锁，可在伙伴手册中换装。';
}
document.addEventListener('notebook:request-profile',()=>{if(profile)document.dispatchEvent(new CustomEvent('mike:release-profile',{detail:{profile,csrf}}));});
document.addEventListener('notebook:read-profile',e=>{if(profile)applyProfile({...profile,unread:e.detail.unread});});
function paintDrawer(){
 const p=profile;
 if(!p){
   drawer.innerHTML='<div class="mike-drawer-head"><h2>伙伴手册</h2><button data-back>返回对话</button></div><p role="status">暂未读取到账号的好感度。</p><button data-retry-profile>重新读取</button>';
   drawer.querySelector('[data-back]').onclick=leaveDrawer;
   drawer.querySelector('[data-retry-profile]').onclick=async e=>{
     const button=e.currentTarget;button.disabled=true;
     await syncPreferences();
     if(button.isConnected){button.disabled=false;drawer.querySelector('[role=status]').textContent='暂时无法读取。请确认登录及网络后重试。';}
   };
   return;
 }
 const heading=section==='news'?'功能更新':'伙伴手册';
 let content='';
 if(section==='news'){
   const art={book:avatar(0),subjects:'<b class="mini-macro">宏观</b><b class="mini-micro">微观</b>',roster:'<b>班级 ▾</b><b class="mini-macro">✓ 已交</b>',news:'<b>Mike</b><b>更新 ●</b>'};
   content=p.editions.map(v=>'<article><small>'+v.date+'</small><h3>'+v.title+'</h3>'+v.items.map(i=>'<div class="mike-feature"><div class="mike-art" aria-hidden="true">'+art[i.art]+'</div><div><strong>'+i.title+'</strong><p>'+i.text+'</p></div></div>').join('')+'</article>').join('');
 }else{
   const next=p.stages[p.level+1];
   const useQuest=p.appearanceSource!=='partner';
   const current=savedOutfit? (useQuest?'EconQuest 穿搭 · 使用中':'伙伴装扮 · 使用中'):(savedOutfit===undefined?'正在同步 EconQuest 穿搭':'在 EconQuest 保存穿搭后会显示在这里');
   const outfitControl=p.student&&savedOutfit&&!useQuest?'<button type="button" data-use-quest>使用已保存的穿搭</button>':'';
   content='<section class="mike-look"><div class="mike-current-look">'+avatar(p.equipped)+'</div><div><strong>当前外观</strong><small data-outfit-status>'+current+'</small>'+outfitControl+'</div></section>';
   const affinity = p.student
     ? '<section class="mike-affinity"><h3>好感度 <strong>'+p.points+' / 100</strong></h3><progress aria-label="好感度" max="100" value="'+p.points+'"></progress><p><strong>'+p.stages[p.level].name+'</strong> · '+(next?'距「'+next.name+'」还差 '+(next.at-p.points)+' 点':'已解锁全部装扮')+'</p><small>每次有效经济学提问或追问加 1，每天最多 5 点。</small></section>'
     : '<section class="mike-affinity"><h3>好感度</h3><p>学生通过经济学提问累积好感度，解锁伙伴装扮。</p></section>';
   content=affinity+content;
   if(p.student)content+=p.stages.map((s,i)=>'<button type="button" class="mike-skin" data-skin="'+i+'" '+(i>p.level||i===p.equipped&&!wearingQuest()?'disabled':'')+'>'+avatar(i)+'<span><strong>'+s.name+'</strong><small>'+s.prop+'</small></span><em>'+(i===p.equipped&&!wearingQuest()?'使用中':i>p.level?s.at+' 点解锁':'装备')+'</em></button>').join('');
 }
 drawer.innerHTML='<div class="mike-drawer-head"><h2>'+heading+'</h2><button data-back>返回对话</button></div>'+content;
 renderOutfit();
 drawer.querySelector('[data-back]').onclick=leaveDrawer;
 const quest=drawer.querySelector('[data-use-quest]');
 if(quest)quest.onclick=()=>updateLook(quest,{action:'use-quest'});
 drawer.querySelectorAll('[data-skin]').forEach(button=>button.onclick=async()=>{
   await updateLook(button,{action:'equip',index:Number(button.dataset.skin)});
 });
}
async function updateLook(button,action){
 button.disabled=true;
 try{
  const d=await api('companion/profile',{method:'POST',body:JSON.stringify(action)});
  applyProfile(d.profile);
  if(section==='handbook'){paintDrawer();drawer.querySelector('[data-back]').focus();}
 }catch{
  if(!button.isConnected)return;
  button.disabled=false;
  button.setAttribute('aria-label','外观更新失败，点此重试');
  drawer.querySelector('[data-outfit-status]').textContent='外观更新失败，请重试。';
 }
}
function leaveDrawer(){
 if(!section)return;section='';drawer.hidden=true;
 for(const node of panel.children)if(node!==drawer)node.inert=false;
 (returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:returnFocus?.closest('.mike-menu')?.querySelector('summary')||input).focus();
}
async function showDrawer(which,from){
 if(which==='news'&&!profile)return;section=which;returnFocus=from;drawer.hidden=false;
 for(const node of panel.children)if(node!==drawer)node.inert=true;
 paintDrawer();drawer.querySelector('[data-back]').focus();
 const unlockKey=profile?.appearanceKey&&'mike:unlock:'+profile.appearanceKey;
 if(which==='handbook'&&unlockKey){try{const stored=localStorage.getItem(unlockKey);if(stored)pendingUnlock=Number(stored);}catch{}}
 if(which==='handbook'&&pendingUnlock!==null&&pendingUnlock<=profile?.level&&profile.student){
   const card=drawer.querySelector('.mike-current-look');
   if(card){card.classList.add('mike-unlocked');pendingUnlock=null;try{if(unlockKey)localStorage.removeItem(unlockKey);}catch{}}
 }
 if(which==='news'&&profile.unread){
   try{const d=await api('companion/profile',{method:'POST',body:JSON.stringify({action:'read',ids:profile.editions.map(v=>v.id)})});applyProfile(d.profile);if(section==='news')drawer.querySelector('[data-back]').focus();}catch{/* Unread stays visible for retry on next visit. */}
 }
}
tier.onclick=()=>showDrawer('handbook',tier);
updates.onclick=()=>showDrawer('news',updates);
function assessment(){
 const match=location.hash.match(/^#(?:\/?)(self-practice\/attempt|mcq)\/([^/?#]+)/);
 return match?(match[1]==='mcq'?'work:':'mock:')+decodeURIComponent(match[2]):'';
}
function modePath(path='companion'){return path+'?assessment='+encodeURIComponent(assessment());}
let modeEpoch=0;
async function refreshMode(){
 const epoch=++modeEpoch;
 if(!user||panel.hidden){setMode('learning');return;}
 try{const d=await api(modePath());if(epoch!==modeEpoch)return;
   if(mode!==d.mode){setMode(d.mode);log.replaceChildren();for(const m of d.messages)showPastMessage(m);}
 }catch{}
}
window.addEventListener('hashchange',refreshMode);
window.addEventListener('focus',refreshMode);
let screenshot='', captureLib=null, captureVersion=0, citedPaper=null;
function questionPaper(){return assessment()?document.querySelector('.mcq-question .question-paper'):null;}
function clearCitation(){
  captured='';citedPaper=null;$('#mike-context').checked=false;$('#mike-context-preview').hidden=true;$('#mike-context-preview pre').textContent='';
}
function updateCitationLabel(){
  const paper=questionPaper();
  if(citedPaper&&citedPaper!==paper){++captureVersion;setScreenshot('');clearCitation();if(!controller&&connection==='ready')$('[type=submit]').disabled=false;}
  $('.mike-context-label').textContent=paper?'引用当前题面':'引用当前页面文字';
}
async function readQuestionImage(images){
  await Promise.all(images.map(img=>img.decode()));
  const fullWidth=Math.max(...images.map(img=>img.naturalWidth));
  const heights=images.map(img=>img.naturalHeight*fullWidth/img.naturalWidth);
  const fullHeight=heights.reduce((sum,height)=>sum+height,0);
  const scale=Math.min(1,1680/fullWidth,1680/fullHeight);
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(fullWidth*scale));canvas.height=Math.max(1,Math.round(fullHeight*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
  let top=0;images.forEach((img,i)=>{const h=heights[i]*scale;ctx.drawImage(img,0,top,canvas.width,h);top+=h;});
  return encodeShot(canvas,canvas.width,canvas.height);
}
const preview=$('.mike-preview'),fileInput=$('#mike-shot-file');
function setScreenshot(url){
  screenshot=url;requestId=null;preview.hidden=!url;preview.classList.remove('expanded');$('[data-action=zoom-shot]').setAttribute('aria-expanded','false');
  if(url){preview.querySelector('img').src=url;$('[data-action=browser-shot]').hidden=true;}else preview.querySelector('img').removeAttribute('src');
}
async function getRenderer(){
  if(!captureLib)captureLib=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='/assets/companion/html2canvas-1.4.1.min.js';
    script.onload=()=>resolve(window.html2canvas);
    script.onerror=()=>{captureLib=null;script.remove();reject(Error('截屏组件加载失败，可选择已有截图'));};
    document.head.append(script);
  });
  return captureLib;
}
function encodeShot(source,w,h){
  const canvas=document.createElement('canvas');
  for(const edge of [1680,1440,1120,840]){
    const scale=Math.min(1,edge/Math.max(w,h));canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
    const url=canvas.toDataURL('image/jpeg',0.82);if(url.length<=700000)return url;
  }
  throw Error('图片过大，请裁剪后重试');
}
async function attachShot(make,fromCitation=false){
  if(mode==='exam'||!user||controller)return;
  const version=++captureVersion;$('[type=submit]').disabled=true;status.textContent='正在准备截图…';
  try{const url=await make();if(version!==captureVersion||panel.hidden||mode==='exam')return;if(!fromCitation&&citedPaper)clearCitation();setScreenshot(url);status.textContent='截图已就绪，点击发送后才会交给 DeepSeek。';}
  catch(error){if(version===captureVersion){if(fromCitation)clearCitation();status.textContent=error.name==='NotAllowedError'?'已取消截屏。':'截屏未完成，可选择已有截图或重试。';$('[data-action=browser-shot]').hidden=!navigator.mediaDevices?.getDisplayMedia;}}
  finally{if(version===captureVersion&&!controller)$('[type=submit]').disabled=false;}
}
$('[data-action=capture]').onclick=()=>attachShot(async()=>{
  const render=await getRenderer();
  const canvas=await render(document.documentElement,{x:window.scrollX,y:window.scrollY,width:innerWidth,height:innerHeight,
    scale:Math.min(devicePixelRatio||1,1.5,1680/Math.max(innerWidth,innerHeight)),logging:false,backgroundColor:'#fff',
    ignoreElements:el=>el.id==='mike-companion'||el.matches('input[type=password],input[name=recoveryCode],#new-recovery-code,[data-sensitive]'),
    onclone:doc=>doc.querySelectorAll('[inert]').forEach(el=>el.removeAttribute('inert'))});
  return encodeShot(canvas,canvas.width,canvas.height);
});
$('[data-action=browser-shot]').onclick=()=>attachShot(async()=>{
  const stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude',monitorTypeSurfaces:'exclude'});
  const video=document.createElement('video');
  try{
    if(stream.getVideoTracks()[0]?.getSettings().displaySurface!=='browser')throw Error('请选择当前标签页');
    panel.style.visibility='hidden';video.muted=true;video.playsInline=true;video.srcObject=stream;
    await video.play();
    await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(Error('截屏超时')),3500);
      const done=()=>{clearTimeout(timeout);resolve();};
      if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(()=>video.requestVideoFrameCallback(done));
      else setTimeout(done,150);
    });
    return encodeShot(video,video.videoWidth,video.videoHeight);
  }finally{for(const track of stream.getTracks())track.stop();video.srcObject=null;panel.style.visibility='';}
});
$('[data-action=upload-shot]').onclick=()=>fileInput.click();
fileInput.onchange=()=>{const file=fileInput.files[0];fileInput.value='';if(!file)return;attachShot(async()=>{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('请选择 12 MB 以内的 PNG、JPG 或 WebP 截图');
  const image=await createImageBitmap(file);try{return encodeShot(image,image.width,image.height);}finally{image.close();}
});};
$('[data-action=zoom-shot]').onclick=e=>{const expanded=preview.classList.toggle('expanded');e.currentTarget.setAttribute('aria-expanded',String(expanded));};
$('[data-action=remove-shot]').onclick=()=>{captureVersion++;setScreenshot('');if(citedPaper)clearCitation();$('[type=submit]').disabled=false;status.textContent='已移除截图';};

const sentPictures=new Map();
function showPastMessage(m){
  const el=message(m.role,m.content);
  if(!m.screenshotAttached)return;
  const url=sentPictures.get(m.requestId);
  if(url){const image=document.createElement('img');image.className='mike-sent-shot';image.alt='本次提问的截图';image.src=url;el.append(image);}
  else{const note=document.createElement('small');note.textContent='已随本次提问发送截图';el.append(document.createElement('br'),note);}
}
function message(role,content){const el=document.createElement('div');el.className='mike-message '+role;el.textContent=content;log.append(el);log.scrollTop=log.scrollHeight;return el;}
async function api(path,options={}){
  const response=await fetch(API+path,{...options,headers:{'Content-Type':'application/json','X-CSRF-Token':csrf,...options.headers}});
  if(!response.ok){
    const detail=await response.json().catch(()=>null);
    throw Object.assign(new Error(detail?.error||'暂时无法连接'),{status:response.status});
  }
  return response.json();
}
function setMode(value){mode=value;host.dataset.mode=value;$('.mike-mode').hidden=value!=='exam';$('.mike-mode').textContent='测验中 · 只提供操作帮助';$('#mike-context').disabled=value==='exam';$('.mike-attachments').hidden=value==='exam';$('.mike-clip').hidden=value==='exam';if(value==='exam'){captureVersion++;if(!controller)$('[type=submit]').disabled=false;setScreenshot('');clearCitation();}}
function animate(open){motion?.cancel();if(matchMedia('(prefers-reduced-motion:reduce)').matches||$('#mike-motion').checked)return Promise.resolve();motion=panel.animate(open?[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(5px)'}],{duration:open?180:130,easing:'cubic-bezier(.2,.8,.2,1)'});return motion.finished.catch(()=>{})}
const backgroundState=new Map();
function restoreBackground(){
  for(const [node,wasInert] of backgroundState)node.inert=wasInert;
  backgroundState.clear();
}
function syncModal(){
  const mobile=!panel.hidden&&matchMedia('(max-width:600px)').matches;
  if(!mobile){restoreBackground();panel.removeAttribute('aria-modal');return;}
  const entering=!panel.hasAttribute('aria-modal');
  panel.setAttribute('aria-modal','true');
  const parent=host.parentElement;
  for(const [node,wasInert] of backgroundState){
    if(node.parentElement!==parent||node===host){node.inert=wasInert;backgroundState.delete(node);}
  }
  for(const node of parent.children){
    if(node===host||node.tagName==='SCRIPT'||backgroundState.has(node))continue;
    backgroundState.set(node,node.inert);node.inert=true;
  }
  if(entering&&!panel.contains(ui.activeElement))input.focus({preventScroll:true});
}
syncOpenLayer=syncModal;
let connectionId=0,connection='idle';
const connectionAction=document.createElement('button');
connectionAction.type='button';connectionAction.className='mike-connect-action';
function clearIdentity(){
  profile=null;savedOutfit=undefined;renderOutfit();sentPictures.clear();captureVersion++;
  setScreenshot('');clearCitation();log.replaceChildren();input.value='';
  $('#mike-context').checked=false;$('#mike-context-preview').hidden=true;
}
async function connect(showNews=false){
  const id=++connectionId,attachButtons=$('.mike-attachments').querySelectorAll('button');
  connection='loading';$('[type=submit]').disabled=true;for(const b of attachButtons)b.disabled=true;
  status.textContent='正在连接伙伴…';
  try{
    const me=await api('me');if(id!==connectionId)return;
    if(!me.user)throw Object.assign(new Error(),{status:401});
    if(user&&user.id!==me.user.id)clearIdentity();
    csrf=me.csrf;user=me.user;void refreshOutfit();
    const d=await api(modePath());if(id!==connectionId)return;
    applyProfile(d.profile);setMode(d.mode);
    for(const b of attachButtons)b.disabled=false;
    if(!controller){
      log.replaceChildren();for(const m of d.messages)showPastMessage(m);
      if(!d.messages.length)message('assistant',d.mode==='exam'?'测验中，我可以帮你找到题号、缩放和提交入口。':'你好，我是 Mike 的 AI 伙伴。可以问我经济学概念，或平台怎么使用。');
    }
    connection='ready';$('[type=submit]').disabled=Boolean(controller);status.textContent='';
    if(showNews&&profile)await showDrawer('news',updates);
  }catch(error){
    if(id!==connectionId)return;
    if(error.status===401){
      if(user)clearIdentity();user=null;csrf='';connection='guest';
      status.textContent='请登录 Bookself 账号后提问。';connectionAction.textContent='登录';
      connectionAction.onclick=async()=>{
        if(document.querySelector('#login-form')){await close();document.querySelector('#username')?.focus();return;}
        location.assign('/?next='+encodeURIComponent(location.pathname+location.search+location.hash));
      };
    }else{
      connection='retry';
      status.textContent=input.value||screenshot?'伙伴暂时连不上，草稿已保留。':'伙伴暂时连不上。';
      connectionAction.textContent='重试';
      connectionAction.onclick=()=>{input.focus({preventScroll:true});void connect(showNews);};
    }
    status.append(connectionAction);
  }
}
function open(showNews=false){
  if(!panel.hidden)return;
  lastFocus=ui.activeElement||document.activeElement;host.dataset.chatOpen='';
  panel.hidden=false;launcher.setAttribute('aria-expanded','true');launcher.hidden=true;
  updateCitationLabel();syncModal();animate(true);input.focus({preventScroll:true});void connect(showNews);
}
async function close(){if(citedPaper&&!screenshot&&citedPaper.querySelector('.question-slice img'))clearCitation();++connectionId;for(const d of panel.querySelectorAll('details[open]'))d.open=false;leaveDrawer();captureVersion++;if(!controller)$('[type=submit]').disabled=false;await animate(false);panel.hidden=true;delete host.dataset.chatOpen;restoreBackground();launcher.hidden=false;resize();launcher.setAttribute('aria-expanded','false');(lastFocus?.isConnected?lastFocus:launcher).focus();}
let drag=null,moved=false,newsPress=false;
launcher.title='点击提问 · 拖动可调整位置';
launcher.addEventListener('pointerdown',e=>{if(e.button!==0)return;newsPress=e.target===launcherText;const b=launcher.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top};moved=false;launcher.setPointerCapture(e.pointerId)});
launcher.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<8)return;moved=true;launcher.style.right='auto';launcher.style.bottom='auto';launcher.style.left=Math.max(4,Math.min(innerWidth-launcher.offsetWidth-4,drag.left+dx))+'px';launcher.style.top=Math.max(4,Math.min(innerHeight-launcher.offsetHeight-4,drag.top+dy))+'px';});
launcher.addEventListener('pointerup',()=>{if(drag&&moved)rememberPosition();drag=null});launcher.addEventListener('pointercancel',()=>{drag=null;moved=true});
launcher.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;return;}open((newsPress||e.target===launcherText)&&profile?.unread);newsPress=false});$('[data-action=close]').onclick=close;$('[data-action=hide]').onclick=async()=>{await close();host.hidePopover?.();host.hidden=true};
$('[data-action=new]').onclick=async()=>{if(!user||controller)return;captureVersion++;setScreenshot('');clearCitation();try{await api('companion',{method:'POST',body:JSON.stringify({action:'new'})});log.replaceChildren();message('assistant','已开始新对话。之前的对话可以在“历史”中查看。')}catch(e){status.textContent=e.message}};
$('[data-action=history]').onclick=async()=>{if(!user||controller)return;try{const d=await api(modePath());const box=document.createElement('div');box.className='mike-history';box.innerHTML='<strong>最近 30 天的对话</strong><button data-current>返回当前对话</button>';for(const s of d.sessions){const b=document.createElement('button');b.textContent=s.title;b.onclick=async()=>{try{const old=await api(modePath('companion/'+encodeURIComponent(s.id)));setMode(old.mode);log.replaceChildren();for(const m of old.messages)showPastMessage(m);message('assistant','这是历史对话。发送新问题时会继续当前会话。')}catch(e){status.textContent=e.message}};box.append(b)}if(!d.sessions.length){const p=document.createElement('p');p.textContent='还没有历史对话';box.append(p)}box.querySelector('[data-current]').onclick=async()=>{log.replaceChildren();for(const m of d.messages)showPastMessage(m)};log.replaceChildren(box);}catch(e){status.textContent=e.message}};
$('[data-action=stop]').onclick=()=>controller?.abort();
$('.mike-clip').addEventListener('toggle',updateCitationLabel);
$('#mike-context').onchange=async e=>{
  requestId=null;
  if(!e.target.checked){if(citedPaper){++captureVersion;setScreenshot('');$('[type=submit]').disabled=!!controller;}clearCitation();return;}
  citedPaper=questionPaper();
  const images=citedPaper?[...citedPaper.querySelectorAll('.question-slice img')]:[];
  captured=citedPaper?[document.querySelector('#mcq-question-heading')?.textContent,document.querySelector('#mcq-accessible')?.textContent,images.length?('原题图 · '+images.length+' 个片段'):''].filter(Boolean).join('\n').slice(0,8000):(document.querySelector('main')?.innerText||'').slice(0,8000);
  $('#mike-context-preview').hidden=false;$('#mike-context-preview pre').textContent=captured;
  if(images.length){setScreenshot('');await attachShot(()=>readQuestionImage(images),true);}
};
// Exercise answers are withheld until reviewed; there are no partial tokens to display.
// One read-only receipt lookup can recover the committed answer if delivery stalls.
async function exerciseReply(payload,signal){
  const delivery=new AbortController();
  const cancel=()=>delivery.abort();
  signal.addEventListener('abort',cancel,{once:true});
  const receiptPath='companion/receipt/'+encodeURIComponent(payload.requestId)+'?assessment='+encodeURIComponent(payload.assessment);
  const lookup=()=>api(receiptPath,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(6000)])});
  let timer,deadline;
  try{
    const post=api('companion',{method:'POST',body:JSON.stringify(payload),signal:delivery.signal,headers:{Accept:'application/json'}});
    const recovered=new Promise(resolve=>{timer=setTimeout(async()=>{
      try{const r=await lookup();if(r.ready)resolve(r);}catch{/* Let the original delivery continue. */}
    },12000);});
    deadline=setTimeout(cancel,95000);
    return await Promise.race([post,recovered]);
  }catch(error){
    if(signal.aborted||error.status)throw error;
    try{const r=await lookup();if(r.ready)return r;}catch{/* Keep the same request ID for retry. */}
    throw Error('未收到完整回复，问题已保留。可以再次点击发送。');
  }finally{clearTimeout(timer);clearTimeout(deadline);signal.removeEventListener('abort',cancel);delivery.abort();}
}
form.onsubmit=async e=>{e.preventDefault();if(controller||connection!=='ready'||$('[type=submit]').disabled)return;if(citedPaper&&citedPaper!==questionPaper()){updateCitationLabel();status.textContent='题目已切换，请重新选择引用。';return;}const content=input.value.trim()||(screenshot?'请解释截图中的经济概念或页面操作。':'');if(!content)return;if(!user){status.textContent='请先登录后提问';return;}requestId||=crypto.randomUUID();controller=new AbortController();const send=$('[type=submit]'),stop=$('[data-action=stop]');send.disabled=true;input.readOnly=true;stop.hidden=false;captureVersion++;$('.mike-attachments').inert=true;preview.inert=true;host.dataset.state='responding';status.textContent='Mike 正在回答…';const question=message('user',content),answer=message('assistant','');answer.setAttribute('aria-live','off');let finished=false;
 const complete=d=>{if(d.screenshotUsed && screenshot){sentPictures.set(requestId,screenshot);if(sentPictures.size>5)sentPictures.delete(sentPictures.keys().next().value);const img=document.createElement('img');img.className='mike-sent-shot';img.alt='本次提问的截图';img.src=screenshot;question.append(img);}setScreenshot('');if(citedPaper)clearCitation();answer.textContent=d.reply;setMode(d.mode);finished=true;input.value='';requestId=null;status.textContent='回答完成';applyProfile(d.profile,true);if(d.contextUsed){const source=document.createElement('small');source.className='mike-source';source.textContent='参考：本次引用的内容';answer.after(source)}};
 const payload={message:content,requestId,assessment:assessment(),context:captured,...(screenshot?{screenshot}:{})};
 try{
 if(user.role==='student'&&(payload.assessment||payload.screenshot))complete(await exerciseReply(payload,controller.signal));
 else{
 const r=await fetch(API+'companion',{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/event-stream','X-CSRF-Token':csrf},body:JSON.stringify(payload),signal:controller.signal});if(!r.ok){const d=await r.json();throw Error(d.error)}
 if(!r.headers.get('content-type')?.includes('event-stream'))complete(await r.json());else{const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';for(;;){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,end);buffer=buffer.slice(end+2);const event=block.split('\n').find(x=>x.startsWith('event:'))?.slice(6).trim(),line=block.split('\n').find(x=>x.startsWith('data:'));if(!line)continue;const d=JSON.parse(line.slice(5));if(event==='delta'){answer.textContent+=d.text;log.scrollTop=log.scrollHeight}else if(event==='status')status.textContent=d.message;else if(event==='done')complete(d);else if(event==='error'){if(d.reset)answer.textContent=d.message;throw Error(d.message)}}}if(!finished)throw Error('连接中断，问题已保留，可重新发送');}
 }
 host.dataset.state='done';
 }catch(e){if(!answer.textContent){question.remove();answer.remove()}status.textContent=e.name==='AbortError'?'已停止回答，输入内容保留。':e.message;host.dataset.state=navigator.onLine?'idle':'offline';}finally{controller=null;$('.mike-attachments').inert=false;preview.inert=false;send.disabled=false;input.readOnly=false;stop.hidden=true;answer.setAttribute('aria-live','polite');if(!panel.hidden)input.focus()}};
// Keep composed keyboard events in the companion while preserving native input,
// IME, button activation and the companion's own focus handling.
for(const type of ['keydown','keypress'])host.addEventListener(type,event=>event.stopPropagation());
input.addEventListener('input',()=>{requestId=null});
host.addEventListener('keydown',e=>{if(e.key==='Escape'){const menu=ui.querySelector('.mike-menu[open],.mike-clip[open]');if(menu){e.stopPropagation();menu.open=false;menu.querySelector('summary').focus();return;}}if(e.key==='Escape'&&section){e.stopPropagation();leaveDrawer();return;}if(e.key==='Escape'&&!panel.hidden){e.stopPropagation();close()}if(e.key==='Tab'&&panel.getAttribute('aria-modal')==='true'){const nodes=[...panel.querySelectorAll('button,input,textarea,summary')].filter(x=>!x.hidden&&!x.disabled&&!x.closest('[inert]')&&x.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&ui.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&ui.activeElement===last){e.preventDefault();first.focus()}}});
let startY=null;$('.mike-sheet-handle').onpointerdown=e=>{startY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)};$('.mike-sheet-handle').onpointerup=e=>{if(startY!==null&&e.clientY-startY>60)close();startY=null};$('.mike-sheet-handle').onpointercancel=()=>startY=null;
let position,positionEdited=false;
try {position=JSON.parse(localStorage.getItem('mike.launcher.position.v2'));} catch {}
function rememberPosition(){
  positionEdited=true;
  const rect=launcher.getBoundingClientRect();
  position={x:rect.left/Math.max(1,innerWidth-rect.width),y:rect.top/Math.max(1,innerHeight-rect.height)};
  try{localStorage.setItem('mike.launcher.position.v2',JSON.stringify(position));}catch{}
  if(csrf)api('companion/position',{method:'POST',keepalive:true,body:JSON.stringify(position)}).catch(()=>{});

}
function resize(){
  if(position&&Number.isFinite(position.x)&&Number.isFinite(position.y)&&!launcher.hidden){
    launcher.style.right=launcher.style.bottom='auto';
    launcher.style.left=Math.max(4,Math.min(innerWidth-launcher.offsetWidth-4,position.x*(innerWidth-launcher.offsetWidth)))+'px';
    launcher.style.top=Math.max(4,Math.min(innerHeight-launcher.offsetHeight-4,position.y*(innerHeight-launcher.offsetHeight)))+'px';
  }
  host.style.setProperty('--mike-height',(window.visualViewport?.height||innerHeight)+'px');
  host.style.setProperty('--mike-top',(window.visualViewport?.offsetTop||0)+'px');
  syncModal();
}
function syncPreferences(){
 if(document.querySelector('#login-form'))return;
 return api('companion/position').then(saved=>{
  csrf=saved.csrf;applyProfile(saved.profile);void refreshOutfit();
  if(positionEdited||drag)return;
  position=saved.position;
  if(!position){for(const edge of ['left','right','top','bottom'])launcher.style.removeProperty(edge);}
  resize();
}).catch(()=>{});
}
syncPreferences();
window.addEventListener('focus',()=>{if(profile)void refreshOutfit();});
window.addEventListener('econquest:outfit-saved',()=>void refreshOutfit());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPreferences();});
setInterval(()=>{if(!document.hidden)syncPreferences();},300000);
// A shadow <link> unloads when the host moves into or out of a reading dialog.
// Keep the loaded rules on this shadow root for the lifetime of the companion.
let appearanceReady=false, loadingAppearance=false, retryTimer, retries=0;
async function loadAppearance(){
  if(appearanceReady||loadingAppearance)return;
  clearTimeout(retryTimer);
  loadingAppearance=true;
  try{
    const response=await fetch('/companion.css?v=deskindex1',{signal:AbortSignal.timeout(15000)});
    if(!response.ok||!response.headers.get('Content-Type')?.startsWith('text/css'))throw Error('Missing companion stylesheet');
    const css=await response.text();
    if(!css.trim())throw Error('Empty companion stylesheet');
    style.textContent=css;
    resize();
    appearanceReady=true;
    host.style.removeProperty('visibility');
    window.removeEventListener('online',loadAppearance);
    window.removeEventListener('focus',loadAppearance);
  }catch{
    const delay=[1000,4000,15000][retries++];
    if(delay!==undefined)retryTimer=setTimeout(loadAppearance,delay);
  }finally{loadingAppearance=false;}
}
window.addEventListener('online',loadAppearance);
window.addEventListener('focus',loadAppearance);
window.addEventListener('resize',resize);
window.visualViewport?.addEventListener('resize',resize);
resize();
void loadAppearance();
