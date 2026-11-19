const list=document.querySelector('#flat-list');
const cover=document.querySelector('#desk-start');
const fallback=document.querySelector('#fallback');
const saveData=navigator.connection?.saveData;
const explicit=new URLSearchParams(location.search).get('view')==='desk';
export function configureDesk(teacher){
const apps=(window.HUB_APPS||[]).filter(app=>!teacher||app.id!=='homework-submit');
if(teacher)apps.unshift({id:'teacher-workspace',name:'教师工作台',url:'/teacher/'});
const entries=apps.flatMap(app=>{
  try{
    const target=new URL(app.url,location.href);
    if(target.protocol!=='https:'&&(target.protocol!=='http:'||target.origin!==location.origin))return [];
    return [{id:app.id,name:app.name,description:app.description||'',href:target.origin===location.origin?target.pathname+target.search+target.hash:target.href}];
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
  import('/assets/notebook/scene-v1.js?v=studio3').then(book=>{
    if(document.body.dataset.ready!=='2d')return book.start(entries,play,()=>document.body.dataset.ready!=='2d');
  }).catch(flat).finally(()=>clearTimeout(timeout));
}

}
if(!document.body.classList.contains("notebook-login"))void boot();
