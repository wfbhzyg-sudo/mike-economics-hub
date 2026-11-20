const locations = {
  assignment: ['assignments','pdf'],
  receipt: ['submissions','paper-pdf'],
  mock: ['self-practice/attempts','pdf'],
};

const downloadMark='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5v11m-4-4 4 4 4-4M5 15.5v3a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-3"/></svg>';
export const downloadLabel=label=>`<span class="paper-download-mark" aria-hidden="true">${downloadMark}</span><span>${label}</span>`;
let dismiss;
function feedback(link,message){
  dismiss?.();
  const el=document.createElement('div'),host=link.closest('dialog[open]')||document.body;
  el.className='paper-download-feedback';el.setAttribute('role','status');
  if(el.showPopover)el.setAttribute('popover','manual');host.append(el);el.showPopover?.();el.textContent=message;
  let timer;const close=()=>{clearTimeout(timer);el.remove();host.removeEventListener('close',close);window.removeEventListener('hashchange',close);if(dismiss===close)dismiss=null;};
  dismiss=close;host.addEventListener('close',close,{once:true});window.addEventListener('hashchange',close,{once:true});timer=setTimeout(close,7000);
}
export function paperDownload(kind,id) {
  const [prefix,suffix]=locations[kind];
  const path='/api/homework/'+prefix+'/'+encodeURIComponent(id)+'/'+suffix;
  return `<a class="paper-download" href="${path}" data-paper-download download>${downloadLabel('导出整卷 PDF')}</a>`;
}

// Keep the reader, answers and running timer in place when a download fails.
if (typeof document !== 'undefined') document.addEventListener('click', async event => {
  const link=event.target.closest?.('a[data-paper-download]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if(link.getAttribute('aria-busy')==='true') return;
  dismiss?.();
  link.setAttribute('aria-busy','true');
  link.setAttribute('aria-label','正在生成整卷 PDF');
  try {
    const response=await fetch(link.href,{credentials:'same-origin'});
    if(!response.ok || !response.headers.get('content-type')?.includes('application/pdf')){
      const error=await response.json().catch(()=>({}));
      throw Error(typeof error.error==='string'?error.error:'暂时无法下载，请重试');
    }
    const blob=await response.blob();
    const header=response.headers.get('content-disposition') || '';
    const name=/filename\*=UTF-8''([^;]+)/i.exec(header)?.[1];
    const url=URL.createObjectURL(blob);
    const download=document.createElement('a');
    download.href=url;download.download=name?decodeURIComponent(name):'试卷.pdf';
    document.body.append(download);download.click();download.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  } catch(error) {
    if(link.isConnected)feedback(link,error.message || '下载未完成，请重试');
  } finally {
    link.removeAttribute('aria-busy');link.removeAttribute('aria-label');
  }
});
