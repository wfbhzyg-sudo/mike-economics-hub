export function bindReportTopics(root,{onLeave}={}){
  const dialog=document.createElement('dialog');
  dialog.className='rr-dialog';
  dialog.setAttribute('aria-label','章节表现详情');
  dialog.innerHTML='<button type="button">关闭</button><div></div>';
  document.body.append(dialog);
  dialog.querySelector('button').onclick=()=>dialog.close();
  let active=null;
  dialog.addEventListener('close',()=>active?.abort());
  const open=async e=>{
    const mock=e.target.closest('[data-rr-mock]');
    if(mock&&root.contains(mock)){
      const content=dialog.querySelector('div');
      content.textContent='正在读取这次模考…';dialog.showModal();
      active?.abort();active=new AbortController();const signal=active.signal;
      try{
        const response=await fetch('/api/homework/mock-stats/'+encodeURIComponent(mock.dataset.rrMock)+'?review=1',{signal});
        if(!response.ok)throw Error('暂时无法读取这次模考。');
        const {attempt,review=[]}=await response.json();
        const g=attempt.result;
        const head=document.createElement('h3');head.textContent='自主模考 · '+(attempt.submittedAt||'').slice(0,10);
        const summary=document.createElement('p');summary.textContent='答对 '+g.total+' / '+g.maxPoints+' 题　·　用时 '+Math.floor(g.durationSeconds/60)+' 分 '+g.durationSeconds%60+' 秒';
        const rows=review.filter(q=>q.loss).map(q=>{const p=document.createElement('p');p.textContent='第 '+q.index+' 题　'+(q.chosen||'未作答')+' → '+(q.correctOption||'待核实');return p;});
        content.replaceChildren(head,summary,...rows);
      }catch(error){if(!signal.aborted)content.textContent=error.message;}
      return;
    }
    const b=e.target.closest('[data-report-topic]');
    if(!b||!root.contains(b))return;
    const template=b.closest('.rr-charts')?.querySelector('template[data-rr-info="'+CSS.escape(b.dataset.reportTopic)+'"]');
    if(!template)return;
    dialog.querySelector('div').replaceChildren(template.content.cloneNode(true));
    dialog.showModal();
  };
  root.addEventListener('click',open);
  dialog.addEventListener('click',e=>{if(e.target.closest('a')){onLeave?.();dialog.close()}});
  return ()=>{root.removeEventListener('click',open);dialog.remove()};
}
