const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function mergeDraft(base,local,remote){
  const merged={...remote,index:local.index,views:{...remote.views,...local.views},answers:{},excluded:{},responses:{},flags:[]},conflicts=[];
  function field(path,old,mine,theirs,write){
    if(equal(mine,theirs)||base&&equal(theirs,old))write(mine);
    else if(base&&equal(mine,old))write(theirs);
    else{write(mine);conflicts.push({path,mine,theirs,choose:write});}
  }
  for(const key of ['answers','excluded','responses','flags']){
    const values=[base,local,remote].map(s=>key==='flags'?Object.fromEntries((s?.flags||[]).map(x=>[x,true])):s?.[key]||{});
    for(const q of new Set(values.flatMap(Object.keys))){
      if(key==='responses'){const target=merged.responses[q]={};
        for(const sub of ['text','files'])field([q,sub],...values.map(v=>v[q]?.[sub]??(sub==='text'?'':[])),v=>target[sub]=v);
      }else if(key==='flags')field([q,key],...values.map(v=>!!v[q]),v=>{merged.flags=merged.flags.filter(x=>x!==q);if(v)merged.flags.push(q);});
      else field([q,key],...values.map(v=>v[q]??(key==='excluded'?[]:'')),v=>{if(v)merged[key][q]=v;else delete merged[key][q];});
    }
  }
  for(const k of ['freeText','files'])field(['整卷',k],...[base,local,remote].map(s=>s?.[k]??(k==='files'?[]:'')),v=>merged[k]=v);
  return {merged,conflicts};
}

export function compareDraft(host,conflicts){
  return new Promise(resolve=>{
    const d=document.createElement('dialog');d.className='mcq-modal sync-compare';d.setAttribute('aria-label','选择要保存的版本');
    d.innerHTML='<form><h2>两台设备改了同一处</h2><div></div><button>保存所选版本</button> <button type="button">稍后处理</button></form>';const form=d.querySelector('form');host.append(d);
    let accepted=false;
    conflicts.forEach(({path,mine,theirs,choose},i)=>{
      const row=document.createElement('fieldset'),legend=document.createElement('legend');
      legend.textContent=(path[0]==='整卷'?'整卷':'第 '+path[0]+' 题')+' · '+({text:'简答文字',answers:'选项',files:'附件',flags:'标记',excluded:'排除选项',freeText:'文字'}[path[1]]||path[1]);row.append(legend);
      for(const [label,value] of [['本机',mine],['账户',theirs]]){
        const el=document.createElement('label'),option=document.createElement('input');option.type='radio';option.name='choice'+i;option.required=true;option.onchange=()=>choose(value);
        el.append(option,label+'　'+(path[1]==='files'?value.length+' 个附件':path[1]==='flags'?(value?'已标记':'未标记'):Array.isArray(value)?(value.join('、')||'未排除'):String(value||'空白')));
        if(path[1]==='files')for(const [i,id] of value.entries()){const a=document.createElement('a');a.href='/api/homework/files/'+encodeURIComponent(id);a.target='_blank';a.rel='noopener';a.textContent=' 附件 '+(i+1);el.append(a);}
        row.append(el);
      }
      form.querySelector('div').append(row);
    });
    form.onsubmit=e=>{e.preventDefault();accepted=true;d.close();};form.querySelector('[type=button]').onclick=()=>d.close();
    d.onclose=()=>{d.remove();resolve(accepted);};d.showModal();
  });
}

let open;
function queue(){
  if(!open)open=new Promise((resolve,reject)=>{
    const req=indexedDB.open('mike-answer-attachments',1);req.onupgradeneeded=()=>req.result.createObjectStore('files',{keyPath:'id'}).createIndex('scope','scope');
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>{open=null;reject(req.error);};
  });return open;
}
async function operation(mode,run){
  const db=await queue();
  return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),req=run(tx.objectStore('files'));tx.oncomplete=()=>resolve(req.result);tx.onabort=()=>reject(tx.error||Error('本机未能保存附件'));});
}
export const attachments={
  list:scope=>operation('readonly',s=>s.index('scope').getAll(scope)),
  put:row=>operation('readwrite',s=>s.put(row)),
  remove:id=>operation('readwrite',s=>s.delete(id))
};
