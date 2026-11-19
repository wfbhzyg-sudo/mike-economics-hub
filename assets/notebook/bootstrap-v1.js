import {onDeskPage,taskChangeKey} from './desk-context.js';
import {journalPages,font,styles} from './journal-layout.js?v=journal3';

let setupNews=false;
function installNews(){
  if(setupNews)return;
  setupNews=true;
  const tab=document.getElementById('news-tab'),flatNews=document.getElementById('flat-news');
  let profile,csrf='',pending,reading=false,requesting=false;
  function update(next){
    if(!next)return;
    profile=next;
    for(const b of [tab,flatNews]){
      b.toggleAttribute('data-unread',next.unread);
      if(!b.dataset.loadState&&(b!==tab || !tab.hasAttribute('data-return')))b.setAttribute('aria-label',next.unread?'最新变化，有未读更新':'最新变化');
    }
  }
  document.addEventListener('mike:release-profile',e=>{if(e.detail.csrf)csrf=e.detail.csrf;update(e.detail.profile);});
  async function getProfile(){
    if(profile && csrf)return profile;
    if(!pending)pending=fetch('/api/homework/companion/position',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw Error();return r.json();})
      .then(d=>{csrf=d.csrf;update(d.profile);return profile;}).finally(()=>pending=null);
    return pending;
  }
  async function markRead(ids){
    if(reading||!profile?.unread)return;
    reading=true;
    try{
      const r=await fetch('/api/homework/companion/profile',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({action:'read',ids})});
      if(!r.ok)throw Error();
      const {profile:next}=await r.json();update(next);
      document.dispatchEvent(new CustomEvent('notebook:read-profile',{detail:next}));
    }catch{document.getElementById('status').textContent='已打开日志，已读状态暂未同步。';}
    finally{reading=false;}
  }
  function flatReader(pages,onRead){
    const dialog=document.createElement('dialog');dialog.className='news-reader';
    dialog.setAttribute('aria-label','更新日志');dialog.innerHTML='<header><h2>更新日志</h2><button type="button">关闭</button></header><article></article><footer><button type="button">上一页</button><span role="status"></span><button type="button">下一页</button></footer>';
    const [close,prev,next]=dialog.querySelectorAll('button');let i=0;
    function draw(){
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 102 600 650');
      svg.setAttribute('role','img');svg.setAttribute('aria-label',pages[i].lines.map(l=>l.text).join(' '));
      for(const line of pages[i].lines){
        const text=document.createElementNS(svg.namespaceURI,'text');
        text.setAttribute('x','56');text.setAttribute('y',line.y);
        text.style.font=font(line.kind);text.setAttribute('fill',styles[line.kind].color);
        text.textContent=line.text;svg.append(text);
      }
      dialog.querySelector('article').replaceChildren(svg);
      dialog.querySelector('footer span').textContent=(i+1)+' / '+pages.length;
      prev.disabled=i===0;next.disabled=i===pages.length-1;dialog.scrollTop=0;
    }
    close.onclick=()=>dialog.close();prev.onclick=()=>{i--;draw();};next.onclick=()=>{i++;draw();};
    dialog.onclose=()=>{dialog.remove();flatNews.focus();};document.body.append(dialog);draw();dialog.showModal();onRead();
  }
  function journalState(state){
    const failed=state==='error';
    for(const b of [tab,flatNews]){
      if(state)b.dataset.loadState=state;else delete b.dataset.loadState;
      b.setAttribute('aria-busy',String(state==='loading'));
      const label=failed?'更新日志未载入，重试':b.hasAttribute('data-return')?'返回原页':b.hasAttribute('data-unread')?'最新变化，有未读更新':'最新变化';
      b.setAttribute('aria-label',label);
      (b.querySelector('.sr')||b).textContent=failed?'重试更新日志':'最新变化';
    }
    if(failed)document.getElementById('status').textContent='更新日志未载入，请点书签重试。';
  }
  document.addEventListener('notebook:journal-error',()=>{journalState('error');tab.focus({preventScroll:true});});
  async function open(e){
    const trigger=e.currentTarget;
    if(tab.hasAttribute('data-return') && trigger===tab){
      document.dispatchEvent(new Event('notebook:return'));return;
    }
    if(requesting)return;requesting=true;journalState('loading');
    try{
      const data=await getProfile(),pages=journalPages(data.editions);
      if(!pages.length)throw Error();
      journalState('');
      const onRead=()=>void markRead(data.editions.map(v=>v.id));
      if(trigger===flatNews || document.body.dataset.ready==='2d')flatReader(pages,onRead);
      else document.dispatchEvent(new CustomEvent('notebook:journal',{detail:{pages,onRead}}));
    }catch{
      journalState('error');trigger.focus({preventScroll:true});
    }finally{requesting=false;}
  }
  tab.onclick=open;flatNews.onclick=open;
  // Usually the companion has already started the account request.
  document.dispatchEvent(new Event('notebook:request-profile'));
  setTimeout(()=>{if(!profile)void getProfile().catch(()=>{});},500);
}
const list=document.querySelector('#flat-list');
const cover=document.querySelector('#desk-start');
const fallback=document.querySelector('#fallback');
const saveData=navigator.connection?.saveData;
const explicit=new URLSearchParams(location.search).get('view')==='desk';
function installTask(link,teacher){
  let revision=0,scheduled,active;
  function render(tasks){
    const serialized=JSON.stringify(tasks);
    if(link.dataset.task===serialized)return;
    link.dataset.task=serialized;
    const row=link.parentElement;
    row.querySelector('.flat-tasks')?.remove();
    if(tasks.length){
      const group=document.createElement('div');group.className='flat-tasks';
      for(const task of tasks){
        const action=document.createElement('a');action.href=onDeskPage(task.href,0);action.textContent=task.label;group.append(action);
        if(task.detail){const meta=document.createElement('small');meta.textContent=task.detail;group.append(meta);}
      }
      row.append(group);
    }
    document.dispatchEvent(new Event('notebook:task'));
  }
  const syncError='待办暂未同步，请联网后再试。';
  async function refresh(version,retry=true){
    const controller=new AbortController();
    active=controller;
    const timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch('/api/homework/desk-task',{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error();
      const {task}=await response.json();
      if(version!==revision)return;
      const tasks=[];
      if(task&&teacher){
        if(task.grading)tasks.push({label:task.grading+' 份待批阅',href:'/teacher/#work/reviews/queue/grading'});
        if(task.requests)tasks.push({label:task.requests+' 份待复核',href:'/teacher/#work/reviews/queue/requests'});
      }
      if(task&&!teacher&&task.title&&task.id){
        const due=task.dueAt&&new Date(task.dueAt);
        const when=due?new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(due):'';
        tasks.push({label:task.title,href:'/homework/#submit/'+encodeURIComponent(task.id),detail:when?(due.getTime()<Date.now()?'可补交 · 原截止 ':'截止 ')+when:'不限截止时间'});
      }
      render(tasks);
      const status=document.getElementById('status');
      if(status.textContent===syncError)status.textContent='';
    }catch{
      if(version===revision&&!document.hidden){
        document.getElementById('status').textContent=syncError;
        if(retry&&navigator.onLine)scheduled=setTimeout(()=>{if(version===revision&&!document.hidden)void refresh(version,false);},1200);
      }
    }finally{
      clearTimeout(timeout);
      if(active===controller)active=null;
    }
  }
  function invalidate(){
    const version=++revision;
    clearTimeout(scheduled);active?.abort();
    if(!document.hidden)scheduled=setTimeout(()=>void refresh(version),30);
  }
  invalidate();
  window.addEventListener('pagehide',()=>{++revision;clearTimeout(scheduled);active?.abort();render([]);});
  window.addEventListener('pageshow',event=>{if(event.persisted)invalidate();});
  window.addEventListener('storage',event=>{if(event.key===taskChangeKey){render([]);invalidate();}});
  window.addEventListener('online',invalidate);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();});
}
export function configureDesk(teacher){
installNews();
const apps=(window.HUB_APPS||[]).filter(app=>!teacher||app.id!=='homework-submit');
if(teacher)apps.unshift({id:'teacher-workspace',name:'教师工作台',url:'/teacher/'});
const entries=apps.flatMap(app=>{
  try{
    const target=new URL(app.url,location.href);
    if(target.protocol!=='https:'&&(target.protocol!=='http:'||target.origin!==location.origin))return [];
    let href=target.origin===location.origin?target.pathname+target.search+target.hash:target.href;
    if(app.id===(teacher?'teacher-workspace':'homework-submit')&&target.origin===location.origin)href=onDeskPage(href,0);
    return [{id:app.id,name:app.name,description:app.description||'',href}];
  }catch{return [];}
});
if(entries.length){
  list.replaceChildren(...entries.map(app=>{
    const row=document.createElement('li'),link=document.createElement('a');
    const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    link.href=app.href;link.dataset.entry=app.id;link.append(app.name,' ',arrow);row.append(link);
    return row;
  }));
}
const primary=list.querySelector(teacher?'[data-entry="teacher-workspace"]':'[data-entry="homework-submit"]');
if(primary)installTask(primary,teacher);
return entries;
}
async function boot(){
const entries=configureDesk(document.body.dataset.primary==='teacher');
const flat=()=>{
  document.body.dataset.ready='2d';
  cover.hidden=true;fallback.hidden=false;
};
if(!entries.length||(saveData&&!explicit)){
  if(entries.length)document.querySelector('#enable-desk').hidden=false;
  flat();
}else{
  let play=false;
  try{
    const stamp=Number(sessionStorage.getItem('mike:notebook:opening'));
    sessionStorage.removeItem('mike:notebook:opening');
    play=stamp>0&&Date.now()-stamp<30_000;
  }catch{}
  // Keep a usable destination during a stuck download without committing to it during a normal load.
  const timeout=setTimeout(flat,8500);
  import('/assets/notebook/scene-v1.js?v=deskaccess2').then(book=>{
    if(document.body.dataset.ready!=='2d')return book.start(entries,play,()=>document.body.dataset.ready!=='2d');
  }).catch(flat).finally(()=>clearTimeout(timeout));
}

}
if(!document.body.classList.contains("notebook-login"))void boot();
