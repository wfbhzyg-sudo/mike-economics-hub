// Only notebook-initiated workbench navigation displays this document's loading indicator.
function showArrival(){
  let intent;
  try{
    intent=JSON.parse(sessionStorage.getItem('mike:arrival'));
    sessionStorage.removeItem('mike:arrival');
  }catch{return;}
  if(intent?.path!==location.pathname||Date.now()-intent.at>120000)return;
  const root=document.querySelector('#workspace,#main');
  if(!root||root.getAttribute('aria-busy')!=='true')return;
  const bar=document.createElement('progress');
  bar.setAttribute('aria-label','正在加载工作台');bar.max=3;
  Object.assign(bar.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'5px',border:'0',accentColor:'#577567',zIndex:'9999',pointerEvents:'none'});
  document.body.append(bar);
  function update(){
    // Three milestones: the destination document, browser load, and the app's first usable view.
    if(root.getAttribute('aria-busy')!=='true'){bar.value=3;finish();return;}
    bar.value=document.readyState==='complete'?2:1;
  }
  function finish(){observer.disconnect();bar.remove();window.removeEventListener('load',update);window.removeEventListener('pagehide',finish);}
  const observer=new MutationObserver(update);
  observer.observe(root,{attributes:true,attributeFilter:['aria-busy']});
  window.addEventListener('load',update);window.addEventListener('pagehide',finish);update();
}
showArrival();
