const locations = {
  assignment: ['assignments','pdf'],
  receipt: ['submissions','paper-pdf'],
  mock: ['self-practice/attempts','pdf'],
};

export function paperDownload(kind,id) {
  const [prefix,suffix]=locations[kind];
  const path='/api/homework/'+prefix+'/'+encodeURIComponent(id)+'/'+suffix;
  return `<a class="secondary paper-download" href="${path}" data-paper-download download>导出整卷 PDF</a>`;
}

// Keep the reader, answers and running timer in place when a download fails.
if (typeof document !== 'undefined') document.addEventListener('click', async event => {
  const link=event.target.closest?.('a[data-paper-download]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if(link.getAttribute('aria-busy')==='true') return;
  const label=link.textContent;
  link.setAttribute('aria-busy','true');
  link.textContent='正在生成 PDF…';
  if(link.nextElementSibling?.hasAttribute('data-paper-error')) link.nextElementSibling.remove();
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
    const notice=document.createElement('span');
    notice.dataset.paperError='';notice.setAttribute('role','alert');notice.textContent=error.message;
    link.after(notice);
  } finally {
    link.removeAttribute('aria-busy'); link.textContent=label;
  }
});
