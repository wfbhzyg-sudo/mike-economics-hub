function installEvidenceDialog() {
  const dialog=document.getElementById('proof-dialog');
  if(!dialog)return;
  document.addEventListener('click',event=>{
    const card=event.target.closest('button[data-proof]');
    if(!card)return;
    const article=card.closest('article');
    dialog.dataset.ref=card.dataset.proof;
    dialog.querySelector('h2').textContent=card.querySelector('.copy b').textContent;
    dialog.querySelector('#reading').textContent=card.querySelector('.interpretation')?.textContent||'';
    dialog.querySelector('#basis').replaceChildren(article.querySelector('template').content.cloneNode(true));
    if(dialog.querySelector('#edit-form')){
      dialog.querySelector('#edit-form').hidden=true;
      dialog.querySelector('#edit').hidden=false;
      dialog.querySelector('#edit').textContent=card.dataset.manual==='true'?'修改任务':'修改措辞';
      dialog.querySelector('#remove-task').hidden=card.dataset.manual!=='true';
      dialog.querySelector('#edit-status').textContent='';
    }
    dialog.showModal();
  });
  dialog.querySelector('#close').onclick=()=>dialog.close();
}

import('/homework/report-topic-dialog.js').then(({bindReportTopics})=>bindReportTopics(document.querySelector('main')));
installEvidenceDialog();
const main=document.querySelector('main'),dialog=document.querySelector('#proof-dialog');
const statusLine=document.querySelector('#status'),retry=document.querySelector('#retry');
let deferred=null;
function applyPanels(data){
  if(data.revision<Number(main.dataset.revision)||deferred&&data.revision<deferred.revision)return;
  const opening=document.getElementById('opening-text');
  if(opening&&typeof data.opening==='string'){
    opening.textContent=data.opening;
    document.getElementById('opening-source').textContent=data.openingSource;
  }
  if(dialog.open){deferred=data;return;}
  for(const id of ['tasks','swot'])document.getElementById(id).innerHTML=data[id];
  main.dataset.revision=String(data.revision);
  main.dataset.ai=data.hasAI?'ready':'available';
  document.getElementById('source').textContent=data.hasAI?'AI 辅助分析':'按学习记录整理';
}
dialog.addEventListener('close',()=>{
  if(!deferred)return;
  const ref=dialog.dataset.ref;
  applyPanels(deferred);deferred=null;
  document.querySelector('button[data-proof="'+CSS.escape(ref)+'"]')?.focus({preventScroll:true});
});
async function requestReport(action,values={}){
  const signal=action==='analyze'?AbortSignal.timeout(30000):undefined;
  const me=await fetch('/api/homework/me',{signal});
  if(!me.ok)throw Error('登录已更新，请重新打开报告');
  const res=await fetch(location.href,{method:'POST',signal,headers:{'Content-Type':'application/json','X-CSRF-Token':(await me.json()).csrf},body:JSON.stringify({action,version:main.dataset.version,...values})});
  const data=await res.json();
  if(!res.ok)throw Error(data.error||'暂时无法整理分析');
  return data;
}
async function analyze(){
  const exports=document.querySelectorAll('#save');
  for(const button of exports)button.disabled=true;
  retry.hidden=true;statusLine.textContent='正在撰写评语，完成后即可导出。';
  try{applyPanels(await requestReport('analyze'));statusLine.textContent='';}
  catch(e){statusLine.textContent=(e.name==='TimeoutError'?'撰写评语用时较长':'本次使用学习记录摘要')+'。可保存当前报告长图。';retry.hidden=false;}
  finally{for(const button of exports)button.disabled=false;}
}
retry.onclick=analyze;
if(main.dataset.ai==='available')analyze();
document.getElementById('edit').onclick=()=>{
  const card=document.querySelector('button[data-proof="'+CSS.escape(dialog.dataset.ref)+'"]');
  if(card?.dataset.manual==='true'){
    taskForm.reset();taskForm.dataset.ref=dialog.dataset.ref;
    taskForm.elements.course.value=card.dataset.course;taskForm.elements.title.value=card.querySelector('.copy b').textContent;
    taskForm.elements.text.value=card.querySelector('.interpretation')?.textContent||'';
    taskForm.elements.priority.value=card.dataset.important==='true'?'important':'normal';
    if(card.dataset.due)taskForm.elements.due.value=new Date(Date.parse(card.dataset.due)+8*3600000).toISOString().slice(0,16);
    taskForm.querySelector('small').textContent='';dialog.close();taskDialog.showModal();return;
  }
  const form=document.getElementById('edit-form');form.hidden=false;
  document.getElementById('edit').hidden=true;
  const field=document.getElementById('comment');
  field.value=document.getElementById('reading').textContent;field.focus();
};
document.getElementById('edit-form').onsubmit=async event=>{
  event.preventDefault();
  const save=event.target.querySelector('button');save.disabled=true;
  try{
    const data=await requestReport('edit',{ref:dialog.dataset.ref,revision:Number(main.dataset.revision),text:document.getElementById('comment').value});
    deferred=data;dialog.close();statusLine.textContent='已保存教师评语。';
  }catch(e){document.getElementById('edit-status').textContent=e.message;}
  finally{save.disabled=false;}
};
const taskDialog=document.getElementById('task-dialog'),taskForm=document.getElementById('task-form');
document.getElementById('add-task').onclick=()=>{taskForm.reset();delete taskForm.dataset.ref;taskForm.querySelector('small').textContent='';taskDialog.showModal();};
document.getElementById('close-task').onclick=()=>taskDialog.close();
taskForm.onsubmit=async e=>{
  e.preventDefault();
  const data=new FormData(taskForm),due=data.get('due');
  const save=taskForm.querySelector('button');save.disabled=true;
  try{
    const panels=await requestReport('task',{ref:taskForm.dataset.ref||'',revision:Number(main.dataset.revision),title:data.get('title'),text:data.get('text'),course:data.get('course'),important:data.get('priority')==='important',due:due?new Date(due+':00+08:00').toISOString():''});
    taskDialog.close();applyPanels(panels);statusLine.textContent='教师任务已保存。';
  }catch(error){taskForm.querySelector('small').textContent=error.message;}
  finally{save.disabled=false;}
};
document.getElementById('remove-task').onclick=async()=>{
  try{const panels=await requestReport('remove-task',{ref:dialog.dataset.ref,revision:Number(main.dataset.revision)});deferred=panels;dialog.close();}
  catch(error){statusLine.textContent=error.message;}
};
const saveImage=document.getElementById('save');
saveImage.onclick=async()=>{
  if(saveImage.disabled)return;
  saveImage.disabled=true;const label=saveImage.textContent;saveImage.textContent='正在保存…';
  try{
    const {saveReportPng}=await import('/teacher/report-png.js');
    await saveReportPng(main);statusLine.textContent='';
  }catch(error){statusLine.textContent='长图未保存，请重试。'+(error.message||'');}
  finally{saveImage.disabled=false;saveImage.textContent=label;}
};
