import {highlightText,escapeHTML as h} from '../homework/search-text.js';

export function draftKey(userId) {
  return 'teacher:question-bank:v1:'+userId;
}

export function readBankDraft(storage, userId, questions) {
  let record;
  try { record=JSON.parse(storage.getItem(draftKey(userId))); } catch {}
  const byId=new Map(questions.map(q=>[q.id,q]));
  const selected=new Map();
  for(const id of Array.isArray(record?.ids)?record.ids:[]) {
    if(byId.has(id)) selected.set(id,byId.get(id));
  }
  const filters=record?.filters||{};
  return {selected,course:['micro','macro'].includes(filters.course)?filters.course:'all',
    unit:typeof filters.unit==='string'?filters.unit:'',topic:typeof filters.topic==='string'?filters.topic:'',
    type:['choice','short'].includes(filters.type)?filters.type:'',status:['ready','needs_review'].includes(filters.status)?filters.status:'all'};
}

export function writeBankDraft(storage,userId,state) {
  const {course,unit,topic,type,status}=state;
  storage.setItem(draftKey(userId),JSON.stringify({ids:[...state.selected.keys()],filters:{course,unit,topic,type,status}}));
}

const norm=value=>String(value??'').replace(/\s+/g,' ').trim();
export function bankStem(q) { return norm(q.searchText||q.prompt||q.stem||q.title); }
function choices(q) {
  return (q.options||[]).map(o=>typeof o==='string'?o:[o.label,o.text].filter(Boolean).join(' · '));
}
function fields(q) {
  return [['题面',bankStem(q)],['题号',q.number],['Topic',[q.topic,q.topicTitle,...(q.relatedTopics||[])].filter(Boolean).join(' · ')],['来源',q.source],['选项',choices(q).join(' · ')]];
}
export function bankMatch(q,query) {
  const term=norm(query).toLocaleLowerCase();
  if(!term)return null;
  for(const [field,raw] of fields(q)) {
    const value=norm(raw),index=value.toLocaleLowerCase().indexOf(term);
    if(index<0)continue;
    const start=Math.max(0,index-35),end=Math.min(value.length,Math.max(start+112,index+term.length+20));
    return {field,snippet:(start?'…':'')+value.slice(start,end)+(end<value.length?'…':'')};
  }
  return null;
}

export function openBankPreview({question:q,query,from,isSelected,toggle,restore,sourcePage}) {
  const dialog=document.createElement('dialog');
  dialog.className='tw-dialog bank-preview';
  dialog.setAttribute('aria-label','原题预览');
  const slices=q.questionImages||[],match=bankMatch(q,query);
  const pages=[...new Set([...(Array.isArray(q.sourcePages)?q.sourcePages:[]),...(q.regions||[]).map(r=>r.page)].map(Number).filter(p=>Number.isInteger(p)&&p>0))];
  const render=(v)=>highlightText(v,query);
  const options=choices(q);
  const context=fields(q).filter(([field,value])=>['Topic','来源'].includes(field)&&value).map(([field,value])=>'<p>'+h(field)+' · '+render(value)+'</p>').join('');
  dialog.innerHTML='<header><strong>原题 · '+render(q.number||'')+'</strong><button type="button" class="tw-button" data-close autofocus>关闭</button></header><div class="bank-preview-scroll">'+
    (match?'<p class="bank-preview-match">'+h(match.field)+' · '+render(match.snippet)+'</p>':'')+
    slices.map((id,i)=>'<figure><img '+(i?'loading="lazy"':'')+' src="/api/homework/files/'+encodeURIComponent(id)+'" alt="'+(q.regions?.[i]?.shared?'共用材料 · ':'')+'第 '+(i+1)+' 张原题切片"><figcaption>'+(q.regions?.[i]?.shared?'共用材料 · ':'')+'切片 '+(i+1)+' / '+slices.length+(q.regions?.[i]?.page?' · 原卷第 '+h(q.regions[i].page)+' 页':'')+'</figcaption></figure>').join('')+
    (bankStem(q)?'<details '+(slices.length?'':'open')+'><summary>题面文字</summary><p>'+render(bankStem(q))+'</p></details>':'')+
    (options.some(o=>o.length>1)?'<ol>'+options.map(v=>'<li>'+render(v)+'</li>').join('')+'</ol>':'')+context+
    (pages.length?'<div class="bank-source-pages">'+pages.map(p=>'<button class="tw-button" data-source-page="'+p+'">原卷第 '+p+' 页</button>').join('')+'</div><div data-page-view aria-live="polite"></div>':'')+
    '</div><footer><span>'+h(q.type==='choice'?'参考答案 '+(q.answer||'待核对'):'简答题')+'</span><button type="button" class="tw-button tw-primary" data-pick></button></footer>';
  const pick=dialog.querySelector('[data-pick]');
  function update(){pick.textContent=isSelected()?'移出选题':'加入选题';pick.disabled=!slices.length;pick.setAttribute('aria-pressed',String(isSelected()));}
  update();pick.onclick=()=>{toggle();update();};
  let request=0;
  const pageCache=new Map();
  dialog.addEventListener('click',async event=>{
    if(event.target.closest('[data-close]')) return dialog.close();
    const button=event.target.closest('[data-source-page]');
    if(!button)return;
    const ticket=++request,view=dialog.querySelector('[data-page-view]'),page=Number(button.dataset.sourcePage);
    view.textContent='正在加载原卷…';view.scrollIntoView({block:'nearest'});
    try {
      const result=pageCache.get(page)||await sourcePage(page);
      if(!dialog.open||ticket!==request)return;
      pageCache.set(page,result);
      const image=new Image();image.alt='原卷第 '+page+' 页';image.src=result.image;view.replaceChildren(image);view.scrollIntoView({block:'nearest'});
    } catch { if(dialog.open&&ticket===request)view.textContent='原卷暂时无法加载，请再点一次页码。'; }
  });
  dialog.addEventListener('close',()=>{request++;pageCache.clear();dialog.remove();(from.isConnected?from:restore())?.focus({preventScroll:true});},{once:true});
  document.body.append(dialog);dialog.showModal();
  return dialog;
}
