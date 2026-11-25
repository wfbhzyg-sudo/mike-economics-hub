export function labelledParts(text=''){
  const matches=[...String(text).matchAll(/(?:^|\n)[ \t]*\(([a-h])\)[ \t]*/gi)];
  if(!matches.length)return null;
  const keys=matches.map(m=>m[1].toLowerCase());
  if(new Set(keys).size!==keys.length || keys.some((k,i)=>i&&k<=keys[i-1]))return null;
  return {intro:text.slice(0,matches[0].index).trim(),parts:Object.fromEntries(matches.map((m,i)=>[keys[i],text.slice(m.index+m[0].length,matches[i+1]?.index??text.length).trimEnd()]))};
}

export function mountFrqParts(field,m,key){
  if(!field||m.type!=='short')return;
  const question=labelledParts(m.prompt),keys=Object.keys(question?.parts||{});
  if(keys.length<2)return;
  const parsed=labelledParts(field.value);
  if(field.value.trim()&&(!parsed||parsed.intro||Object.keys(parsed.parts).some(k=>!keys.includes(k))))return;
  let original=labelledParts(m.originalResponse?.text||m.response?.text||'');
  const drafts={...parsed?.parts},positions={},group=document.createElement('fieldset');
  group.className='frq-parts';
  group.innerHTML='<legend>按小问订正</legend><div role="group" aria-label="选择小问"></div><p data-prompt></p><p data-original hidden></p><label>我的订正<textarea data-part-editor rows="4"></textarea></label>';
  const input=group.querySelector('textarea'),buttons=group.querySelector('[role=group]');
  const label=field.closest('label');label.before(group);label.hidden=true;
  let active='';
  function showOriginal(){
    const answer=group.querySelector('[data-original]'),text=original?.parts[active];
    answer.hidden=!text;
    answer.textContent=text?'我的原作答　'+text:'';
  }
  function select(k){
    if(active)positions[active]=[input.selectionStart,input.selectionEnd,input.scrollTop];
    active=k;input.value=drafts[k]||'';
    input.maxLength=Math.max(input.value.length,10000-(keys.length*5+Object.entries(drafts).filter(([j])=>j!==k).reduce((n,[,s])=>n+s.length,0)));
    group.querySelector('[data-prompt]').textContent='('+k+') '+question.parts[k];
    showOriginal();
    for(const b of buttons.querySelectorAll('[data-part]'))b.setAttribute('aria-pressed',String(b.dataset.part===k));
    const [start,end,offset]=positions[k]||[0,0,0];input.setSelectionRange(start,end);input.scrollTop=offset;
    try{sessionStorage.setItem(key,k);}catch{}
  }
  for(const k of keys){const b=document.createElement('button');b.type='button';b.dataset.part=k;b.textContent='('+k+')';buttons.append(b);b.onclick=()=>select(k);}
  input.addEventListener('input',()=>{drafts[active]=input.value;field.value=keys.filter(k=>drafts[k]?.trim()).map(k=>'('+k+') '+drafts[k]).join('\n');});
  let saved;try{saved=sessionStorage.getItem(key);}catch{}
  const lost=m.partScores?.find(p=>p.earned<p.max&&keys.includes(String(p.id).replace(/[()]/g,'').toLowerCase()));
  select(keys.includes(saved)?saved:lost?String(lost.id).replace(/[()]/g,'').toLowerCase():keys[0]);
  input.updateOriginal=text=>{original=labelledParts(text);showOriginal();};
  return input;
}
