// Keep direct links interactive during the optional GPU load.
const list=document.querySelector('#flat-list');
const enable=document.querySelector('#enable-desk');
const choice=new URLSearchParams(location.search);
const saveData=navigator.connection?.saveData;
let started=false,entries=[];
function readApps(teacher){
  const configured=[...(window.HUB_APPS||[])];
  if(teacher)configured.unshift({id:'teacher-workspace',name:'教师工作台',url:'/teacher/'});
  return configured.flatMap(app=>{
    try{
      const target=new URL(app.url,location.href);
      if(target.protocol!=='https:'&&(target.protocol!=='http:'||target.origin!==location.origin))return [];
      return [{id:app.id,name:app.name,description:app.description||'',href:target.origin===location.origin?target.pathname+target.search+target.hash:target.href}];
    }catch{return [];}
  });
}
function refreshList(apps){
  const fragment=document.createDocumentFragment();
  for(const app of apps){
    const row=document.createElement('li'),link=document.createElement('a');
    const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    link.href=app.href;link.dataset.entry=app.id;link.append(app.name,' ',arrow);row.append(link);fragment.append(row);
  }
  if(apps.length)list.replaceChildren(fragment);
}
async function start(){
  if(started||!entries.length)return;
  started=true;enable.hidden=true;
  let play=false;
  try{
    const stamp=Number(sessionStorage.getItem('mike:notebook:opening'));
    sessionStorage.removeItem('mike:notebook:opening');
    play=stamp>0&&Date.now()-stamp<30_000;
  }catch{}
  try{
    const book=await import('/assets/notebook/scene-v1.js');
    await book.start(entries,play);
  }catch{
    document.body.dataset.ready='2d';
  }
}
enable.onclick=event=>{event.preventDefault();void start();};
window.addEventListener('portal-session-ready',event=>{
  entries=readApps(event.detail.teacherWorkspace);
  refreshList(entries);
  if(saveData&&choice.get('view')!=='desk'){enable.hidden=false;return;}
  // When possible paint the working list once before starting the video driver.
  requestAnimationFrame(()=>setTimeout(start,0));
},{once:true});
