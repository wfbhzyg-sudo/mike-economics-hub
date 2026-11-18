const API='/api/homework/';
const host=document.createElement('div');
host.id='mike-companion';
host.setAttribute('popover','manual');
host.setAttribute('data-html2canvas-ignore','');
const ui=host.attachShadow({mode:'open'});
const style=document.createElement('link');
style.rel='stylesheet';style.href='/companion.css?v=overlay2';
ui.innerHTML=`<button class="mike-launcher" aria-label="打开 Mike 经济学伙伴" aria-expanded="false"><img src="/assets/mike-pixel.png" alt="" width="56" height="56"><span>问问 Mike</span></button><section class="mike-chat" role="dialog" aria-label="Mike 经济学伙伴" hidden><div class="mike-sheet-handle" aria-hidden="true"><span></span></div><header><img src="/assets/mike-pixel.png" alt="" width="40" height="40"><div><strong>Mike 经济学伙伴</strong><small>经济学与平台使用</small></div><button data-action="history" title="查看历史对话">历史</button><button data-action="new">新对话</button><button data-action="close" aria-label="关闭对话">×</button></header><div class="mike-mode" hidden></div><div class="mike-chat-messages" role="log" aria-live="polite"></div><form class="mike-composer"><label for="mike-message">向 Mike 提问</label><textarea id="mike-message" rows="3" maxlength="3000" placeholder="输入经济学或平台使用问题…"></textarea><label class="mike-context"><input type="checkbox" id="mike-context">引用当前页面文字（发送前可检查）</label><div class="mike-attachments"><button type="button" data-action="capture">截取当前屏幕</button><button type="button" data-action="upload-shot">选择截图</button><button type="button" data-action="browser-shot" hidden>用浏览器截取标签页</button><input id="mike-shot-file" type="file" accept="image/png,image/jpeg,image/webp" hidden></div><figure class="mike-preview" hidden><button type="button" data-action="zoom-shot" aria-label="放大或缩小截图" aria-expanded="false"><img alt="待发送的截图"></button><figcaption>随本次提问发送给 DeepSeek</figcaption><button type="button" data-action="remove-shot">移除</button></figure><details id="mike-context-preview" hidden><summary>将发送的引用内容</summary><pre></pre></details><p class="mike-chat-status" role="status"></p><div class="mike-send-row"><small>AI 伙伴 · 请核对重要结论</small><button type="button" data-action="stop" hidden>停止</button><button type="submit">发送 ↑</button></div></form><footer class="mike-chat-options"><button data-action="hide">本页隐藏伙伴</button><label><input type="checkbox" id="mike-motion">减少动效</label></footer></section>`;ui.prepend(style);
host.style.cssText='position:fixed!important;inset:0!important;width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;overflow:visible!important;pointer-events:none!important;z-index:2147483647!important;color-scheme:light';
function syncLayer(){
  if(host.hidden)return;
  const modals=[...document.querySelectorAll('dialog:modal')];
  const focused=document.activeElement?.closest('dialog:modal');
  const parent=focused || (modals.includes(host.parentElement)?host.parentElement:modals.at(-1)) || document.fullscreenElement || document.body;
  if(host.parentElement!==parent)parent.append(host);
  if(host.showPopover&&!host.matches(':popover-open'))host.showPopover();
}
syncLayer();
new MutationObserver(syncLayer).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true,childList:true});
document.addEventListener('fullscreenchange',syncLayer);
const $=s=>ui.querySelector(s),launcher=$('.mike-launcher'),panel=$('.mike-chat'),log=$('.mike-chat-messages'),form=$('form'),input=$('textarea'),status=$('.mike-chat-status');let csrf='',user=null,controller=null,requestId=null,captured='',inertNodes=[],mode='learning',lastFocus=null,motion=null;
let screenshot='', captureLib=null, captureVersion=0;
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
async function attachShot(make){
  if(mode==='exam'||!user||controller)return;
  const version=++captureVersion;$('[type=submit]').disabled=true;status.textContent='正在准备截图…';
  try{const url=await make();if(version!==captureVersion||panel.hidden||mode==='exam')return;setScreenshot(url);status.textContent='截图已就绪，点击发送后才会交给 DeepSeek。';}
  catch(error){if(version===captureVersion){status.textContent=error.name==='NotAllowedError'?'已取消截屏。':'截屏未完成，可选择已有截图或重试。';$('[data-action=browser-shot]').hidden=!navigator.mediaDevices?.getDisplayMedia;}}
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
$('[data-action=remove-shot]').onclick=()=>{captureVersion++;setScreenshot('');$('[type=submit]').disabled=false;status.textContent='已移除截图';};

const sentPictures=new Map();
function showPastMessage(m){
  const el=message(m.role,m.content);
  if(!m.screenshotAttached)return;
  const url=sentPictures.get(m.requestId);
  if(url){const image=document.createElement('img');image.className='mike-sent-shot';image.alt='本次提问的截图';image.src=url;el.append(image);}
  else{const note=document.createElement('small');note.textContent='已随本次提问发送截图';el.append(document.createElement('br'),note);}
}
function message(role,content){const el=document.createElement('div');el.className='mike-message '+role;el.textContent=content;log.append(el);log.scrollTop=log.scrollHeight;return el;}
async function api(path,options={}){const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json','X-CSRF-Token':csrf,...options.headers}});const d=await r.json();if(!r.ok)throw Error(d.error||'暂时无法连接');return d;}
function setMode(value){mode=value;host.dataset.mode=value;$('.mike-mode').hidden=value!=='exam';$('.mike-mode').textContent='测验中 · 只提供操作帮助';$('#mike-context').disabled=value==='exam';$('.mike-attachments').hidden=value==='exam';if(value==='exam'){captureVersion++;if(!controller)$('[type=submit]').disabled=false;setScreenshot('');captured='';$('#mike-context').checked=false;$('#mike-context-preview').hidden=true;}}
function animate(open){motion?.cancel();if(matchMedia('(prefers-reduced-motion:reduce)').matches||$('#mike-motion').checked)return Promise.resolve();motion=panel.animate(open?[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(5px)'}],{duration:open?180:130,easing:'cubic-bezier(.2,.8,.2,1)'});return motion.finished.catch(()=>{})}
function restoreBackground(){for(const [node,was]of inertNodes)node.inert=was;inertNodes=[];}
async function open(){const attachButtons=$('.mike-attachments').querySelectorAll('button');for(const b of attachButtons)b.disabled=true;status.textContent='正在连接伙伴…';lastFocus=ui.activeElement||document.activeElement;panel.hidden=false;launcher.setAttribute('aria-expanded','true');launcher.hidden=true;const mobile=matchMedia('(max-width:600px)').matches;if(mobile){panel.setAttribute('aria-modal','true');inertNodes=[...host.parentElement.children].filter(n=>n!==host&&n.tagName!=='SCRIPT').map(n=>[n,n.inert]);for(const[n]of inertNodes)n.inert=true;}else panel.removeAttribute('aria-modal');animate(true);input.focus();try{const me=await api('me');if(user?.id!==me.user.id){sentPictures.clear();setScreenshot('');log.replaceChildren();input.value='';captured='';}csrf=me.csrf;user=me.user;const d=await api('companion');setMode(d.mode);for(const b of attachButtons)b.disabled=false;if(!controller){log.replaceChildren();for(const m of d.messages)showPastMessage(m);if(!d.messages.length)message('assistant',d.mode==='exam'?'测验中，我可以帮你找到题号、缩放和提交入口。':'你好，我是 Mike 的 AI 伙伴。可以问我经济学概念，或平台怎么使用。');}status.textContent='';}catch{user=null;setScreenshot('');log.replaceChildren();message('assistant','请先使用 Bookself 账号登录，再开始对话。');status.textContent='登录后可开始对话';}}
async function close(){captureVersion++;if(!controller)$('[type=submit]').disabled=false;await animate(false);panel.hidden=true;restoreBackground();launcher.hidden=false;resize();launcher.setAttribute('aria-expanded','false');(lastFocus?.isConnected?lastFocus:launcher).focus();}
let drag=null,moved=false;
launcher.title='点击提问 · 拖动可调整位置';
launcher.addEventListener('pointerdown',e=>{if(e.button!==0)return;const b=launcher.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:b.left,top:b.top};moved=false;launcher.setPointerCapture(e.pointerId)});
launcher.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<8)return;moved=true;launcher.style.right='auto';launcher.style.bottom='auto';launcher.style.left=Math.max(4,Math.min(innerWidth-launcher.offsetWidth-4,drag.left+dx))+'px';launcher.style.top=Math.max(4,Math.min(innerHeight-launcher.offsetHeight-4,drag.top+dy))+'px';});
launcher.addEventListener('pointerup',()=>{if(drag&&moved)rememberPosition();drag=null});launcher.addEventListener('pointercancel',()=>{drag=null;moved=true});
launcher.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;return;}open()});$('[data-action=close]').onclick=close;$('[data-action=hide]').onclick=async()=>{await close();host.hidePopover?.();host.hidden=true};
$('[data-action=new]').onclick=async()=>{if(!user||controller)return;captureVersion++;setScreenshot('');try{await api('companion',{method:'POST',body:JSON.stringify({action:'new'})});log.replaceChildren();message('assistant','已开始新对话。之前的对话可以在“历史”中查看。')}catch(e){status.textContent=e.message}};
$('[data-action=history]').onclick=async()=>{if(!user||controller)return;try{const d=await api('companion');const box=document.createElement('div');box.className='mike-history';box.innerHTML='<strong>最近 30 天的对话</strong><button data-current>返回当前对话</button>';for(const s of d.sessions){const b=document.createElement('button');b.textContent=s.title;b.onclick=async()=>{try{const old=await api('companion/'+encodeURIComponent(s.id));setMode(old.mode);log.replaceChildren();for(const m of old.messages)showPastMessage(m);message('assistant','这是历史对话。发送新问题时会继续当前会话。')}catch(e){status.textContent=e.message}};box.append(b)}if(!d.sessions.length){const p=document.createElement('p');p.textContent='还没有历史对话';box.append(p)}box.querySelector('[data-current]').onclick=async()=>{log.replaceChildren();for(const m of d.messages)showPastMessage(m)};log.replaceChildren(box);}catch(e){status.textContent=e.message}};
$('[data-action=stop]').onclick=()=>controller?.abort();$('#mike-context').onchange=e=>{requestId=null;captured=e.target.checked?(document.querySelector('main')?.innerText||'').slice(0,8000):'';$('#mike-context-preview').hidden=!e.target.checked;$('#mike-context-preview pre').textContent=captured;};
form.onsubmit=async e=>{e.preventDefault();if(controller)return;const content=input.value.trim()||(screenshot?'请结合这张截图，引导我理解当前内容。':'');if(!content)return;if(!user){status.textContent='请先登录后提问';return;}requestId||=crypto.randomUUID();controller=new AbortController();const send=$('[type=submit]'),stop=$('[data-action=stop]');send.disabled=true;stop.hidden=false;captureVersion++;$('.mike-attachments').inert=true;preview.inert=true;host.dataset.state='responding';status.textContent='Mike 正在回答…';const question=message('user',content),answer=message('assistant','');answer.setAttribute('aria-live','off');let finished=false;
 try{const r=await fetch(API+'companion',{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/event-stream','X-CSRF-Token':csrf},body:JSON.stringify({message:content,requestId,context:captured,...(screenshot?{screenshot}:{})}),signal:controller.signal});if(!r.ok){const d=await r.json();throw Error(d.error)}
 const complete=d=>{if(d.screenshotUsed && screenshot){sentPictures.set(requestId,screenshot);if(sentPictures.size>5)sentPictures.delete(sentPictures.keys().next().value);const img=document.createElement('img');img.className='mike-sent-shot';img.alt='本次提问的截图';img.src=screenshot;question.append(img);}setScreenshot('');answer.textContent=d.reply;setMode(d.mode);finished=true;input.value='';requestId=null;status.textContent='回答完成';if(d.contextUsed){const source=document.createElement('small');source.className='mike-source';source.textContent='参考：你本次引用的页面文字';answer.after(source)}};
 if(!r.headers.get('content-type')?.includes('event-stream'))complete(await r.json());else{const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='';for(;;){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,end);buffer=buffer.slice(end+2);const event=block.split('\n').find(x=>x.startsWith('event:'))?.slice(6).trim(),line=block.split('\n').find(x=>x.startsWith('data:'));if(!line)continue;const d=JSON.parse(line.slice(5));if(event==='delta'){answer.textContent+=d.text;log.scrollTop=log.scrollHeight}else if(event==='status')status.textContent=d.message;else if(event==='done')complete(d);else if(event==='error'){if(d.reset)answer.textContent=d.message;throw Error(d.message)}}}if(!finished)throw Error('连接中断，问题已保留，可重新发送');}
 host.dataset.state='done';
 }catch(e){if(!answer.textContent){question.remove();answer.remove()}status.textContent=e.name==='AbortError'?'已停止回答，输入内容保留。':e.message;host.dataset.state=navigator.onLine?'idle':'offline';}finally{controller=null;$('.mike-attachments').inert=false;preview.inert=false;send.disabled=false;stop.hidden=true;answer.setAttribute('aria-live','polite');if(!panel.hidden)input.focus()}};
input.addEventListener('input',()=>{requestId=null});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!matchMedia('(pointer:coarse)').matches){e.preventDefault();form.requestSubmit()}});
host.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.stopPropagation();close()}if(e.key==='Tab'&&panel.getAttribute('aria-modal')==='true'){const nodes=[...panel.querySelectorAll('button,input,textarea,summary')].filter(x=>!x.hidden&&!x.disabled&&x.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&ui.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&ui.activeElement===last){e.preventDefault();first.focus()}}});
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
  if(!matchMedia('(max-width:600px)').matches){restoreBackground();panel.removeAttribute('aria-modal')}
}
if(!document.querySelector('#login-form'))api('companion/position').then(saved=>{
  csrf=saved.csrf;
  if(positionEdited||drag)return;
  position=saved.position;
  if(!position){for(const edge of ['left','right','top','bottom'])launcher.style.removeProperty(edge);}
  resize();
}).catch(()=>{});
style.addEventListener('load',resize);window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);resize();
