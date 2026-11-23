// The downloaded report also runs this local-only print setup so a different
// device can measure its own font metrics before printing the same A4 sheet.
function installReportPrint() {
  const report = document.querySelector('main');
  const paper = document.getElementById('report-paper');
  const mobile = document.getElementById('report-mobile');

  function fitSheet() {
    const readingMedia = mobile.media;
    const paperMedia = paper.media;
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    const ruler = document.createElement('div');
    ruler.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;width:var(--paper-width);height:var(--paper-height)';

    try {
      mobile.media = 'not all';
      paper.media = 'all';
      document.body.append(ruler);
      const bounds = ruler.getBoundingClientRect();
      // Leave a fraction of a millimetre for rounding PDF points to CSS pixels.
      const width = Math.floor(bounds.width) - 1;
      const height = Math.floor(bounds.height) - 2;
      function fits(scale) {
        report.style.setProperty('--report-layout-width', Math.floor(width / scale) + 'px');
        report.style.setProperty('--report-zoom', String(scale));
        const size = report.getBoundingClientRect();
        return size.height <= height && size.width <= width + 0.5;
      }
      const largest = 1.25;
      if (fits(largest)) return;
      let high = largest;
      let low = high / 2;
      while (!fits(low) && low > 0.002) {
        high = low;
        low /= 2;
      }
      for (let step = 0; step < 9; step++) {
        const middle = (low + high) / 2;
        if (fits(middle)) low = middle;
        else high = middle;
      }
      fits(low);
    } finally {
      ruler.remove();
      mobile.media = readingMedia;
      paper.media = paperMedia;
      if (!window.matchMedia('print').matches && (window.scrollX !== scrollLeft || window.scrollY !== scrollTop)) {
        window.scrollTo(scrollLeft, scrollTop);
      }
    }
  }
  window.addEventListener('beforeprint', fitSheet);
  return fitSheet;
}

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

const fitSheet=installReportPrint();
installEvidenceDialog();
const main=document.querySelector('main'),dialog=document.querySelector('#proof-dialog');
const statusLine=document.querySelector('#status'),retry=document.querySelector('#retry');
let deferred=null;
function applyPanels(data){
  if(data.revision<Number(main.dataset.revision)||deferred&&data.revision<deferred.revision)return;
  if(dialog.open){deferred=data;return;}
  for(const id of ['works','tasks','swot'])document.getElementById(id).innerHTML=data[id];
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
  const me=await fetch('/api/homework/me');
  if(!me.ok)throw Error('登录已更新，请重新打开报告');
  const res=await fetch(location.href,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':(await me.json()).csrf},body:JSON.stringify({action,version:main.dataset.version,...values})});
  const data=await res.json();
  if(!res.ok)throw Error(data.error||'暂时无法整理分析');
  return data;
}
async function analyze(){
  retry.hidden=true;statusLine.textContent='正在整理个性化分析，可先查阅或打印。';
  try{applyPanels(await requestReport('analyze'));statusLine.textContent='';}
  catch(e){statusLine.textContent=e.message+'。当前可打印记录摘要。';retry.hidden=false;}
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
document.getElementById('print').onclick=()=>{fitSheet();window.print();};
document.getElementById('save').onclick=()=>{
  fitSheet();
  const snapshot=document.documentElement.cloneNode(true);
  snapshot.querySelectorAll('.actions,.online-only,script').forEach(el=>el.remove());
  for(const t of snapshot.querySelectorAll('template.basis'))t.content.querySelectorAll('.online-only').forEach(el=>el.remove());
  snapshot.querySelector('dialog').removeAttribute('open');
  const offline=document.createElement('script');
  offline.textContent='('+installReportPrint.toString()+')();('+installEvidenceDialog.toString()+')();';
  snapshot.querySelector('body').append(offline);
  const url=URL.createObjectURL(new Blob(['<!doctype html>\n',snapshot.outerHTML],{type:'text/html;charset=utf-8'}));
  const link=document.createElement('a');
  link.download=document.title.replace(/[\\/:*?"<>|]/g,'-')+'.html';
  link.href=url;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
};
