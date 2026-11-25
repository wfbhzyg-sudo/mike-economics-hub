// Slices belong to one question. Keep the source order, including shared diagrams.
export function questionSlices(ids, label, {lazy=false}={}) {
  return ids.map((id,index)=>`<figure class="question-slice"><div class="slice-image"><img src="/api/homework/files/${encodeURIComponent(id)}" alt="${label}，片段 ${index+1} / ${ids.length}" ${lazy?'loading="lazy"':''} decoding="async" draggable="false"></div><div class="question-retry" hidden>片段 ${index+1} 未能载入 <button type="button">重试</button></div></figure>`).join('');
}

export function bindSliceRetries(paper,onLoad=()=>{}) {
  for(const figure of paper.querySelectorAll('.question-slice')){
    const image=figure.querySelector('img'),retry=figure.querySelector('.question-retry');
    image.addEventListener('error',()=>{retry.hidden=false;});
    image.addEventListener('load',()=>{retry.hidden=true;onLoad();});
    if(image.complete&&!image.naturalWidth)retry.hidden=false;
    retry.querySelector('button').onclick=()=>{
      const url=new URL(image.src);
      url.searchParams.set('retry',Date.now());
      retry.hidden=true;
      image.src=url.href;
    };
  }
}

export function mountQuestionSlices(host,ids,{marker,tools}={}) {
  host.classList.add('slice-reader');
  host.innerHTML='<div class="slice-controls"><button type="button" aria-pressed="false">放大题面</button></div><div class="slice-scroll" tabindex="0" role="region" aria-label="完整原题"><div class="slice-stack">'+questionSlices(ids,'原题')+'</div></div>';
  const flow=host.querySelector('.slice-scroll'),zoom=host.querySelector('.slice-controls button');
  if(tools){tools.append(zoom);host.querySelector('.slice-controls').remove();}
  zoom.onclick=()=>{
    const large=flow.classList.toggle('slice-zoom');
    zoom.setAttribute('aria-pressed',String(large));
    zoom.textContent=large?'适应宽度':'放大题面';
  };
  if(marker)flow.querySelectorAll('.slice-image').forEach((el,i)=>marker.attachPage(el,ids[i]+':1'));
  bindSliceRetries(flow);
  return {destroy(){host.classList.remove('slice-reader');host.replaceChildren();}};
}
