// Use actual PDF geometry for selectable-text papers. Model coordinates remain a
// reviewable fallback for scans or layouts without unambiguous numbered anchors.
export function pageLayout(rows,width,height){
 const content=rows.filter(r=>r.text.trim()&&r.y>height*.085&&r.y<height*.945);
 const anchors=content.filter(r=>/^\d{1,3}[.)]$/.test(r.text.trim())&&r.x<width*.13).map(r=>({...r,number:r.text.trim().replace(/[.)]$/,'')})).sort((a,b)=>a.y-b.y);
 return {rows:content,anchors,width,height};
}
export function groundQuestion(q,layout,page,{continuation=false}={}){
 const {rows,anchors,width,height}=layout;
 const matches=anchors.filter(a=>a.number===String(q.number));
 if(!continuation&&matches.length!==1)return q;
 const anchor=matches[0],next=continuation?anchors[0]:anchors.find(a=>a.y>anchor.y+2);
 const top=continuation?height*.085:anchor.y-anchor.h-5;
 let bottom=next?next.y-next.h-10:height*.945;
 // Never incorporate an explicit answer or its explanation into a student crop.
 const key=rows.find(r=>r.y>top&&r.y<bottom&&/^Answer\s*[:：]?\s*[A-E]\s*$/.test(r.text.trim()));
 if(key)bottom=key.y-key.h-7;
 const inside=rows.filter(r=>r.y>=top&&r.y<=bottom);
 if(!inside.length||bottom<=top)return q;
 if(!next&&!key)bottom=Math.min(bottom,Math.max(...inside.map(r=>r.y))+8);
 const region={page,x:.045,y:top/height,w:.91,h:(bottom-top)/height};
 if(continuation)return {...q,regions:[...(q.regions||[]).filter(r=>r.page!==page),region]};
 const regions=[];
 const first=anchors[0];
 if(first&&first.y>height*.2&&(anchor===first||q.sharedMaterial===true)){
 const pre=rows.filter(r=>r.y<first.y-first.h-15);
 if(pre.length&&!pre.some(r=>/^\([A-E]\)/.test(r.text.trim()))){const y=Math.min(...pre.map(r=>r.y-r.h))-5;regions.push({page,x:.045,y:y/height,w:.91,h:(first.y-first.h-12-y)/height});}
 }
 regions.push(region);
 return {...q,regions,layoutGrounded:true,inlineAnswer:q.inlineAnswer||Boolean(key)};
}
export function assembleImport(t){
 const keys=t.results.flatMap(r=>r.keys||[]),map=new Map();
 const section=q=>String(q.section||'').trim().toLowerCase();
 for(const r of t.results)for(const q of r.questions||[]){const k=section(q)+':'+String(q.number);if(!map.has(k))map.set(k,{...q,id:String(map.size+1),sourceNumber:k});}
 const questions=[...map.values()];
 return questions.map(q=>{
 const numbered=keys.filter(k=>String(k.number)===String(q.number));
 const exact=numbered.filter(k=>section(k)===section(q));
 const uniqueQuestion=questions.filter(x=>String(x.number)===String(q.number)).length===1;
 const matches=uniqueQuestion?numbered:exact;
 const values=[...new Set(matches.map(k=>String(k.answer).trim().toUpperCase()))];
 return {...q,answer:values.length===1&&/^[A-E]$/.test(values[0])?values[0]:'',sourcePages:matches.map(k=>(k.sourceFile||'题目原件')+'第 '+k.page+' 页 · '+q.sourceNumber).join('; '),checked:false};
 });
}

export function mergeContinuationOptions(previous=[],continued=[]){
 const byLabel=new Map();
 for(const o of [...previous,...continued]){
  if(!/^[A-E]$/.test(o.label)||!o.text)continue;
  const old=byLabel.get(o.label);
  if(!old){byLabel.set(o.label,o);continue;}
  const before=old.text.trim(),after=o.text.trim();
  byLabel.set(o.label,{...old,text:after.includes(before)?after:before.includes(after)?before:before+' '+after});
 }
 return [...byLabel.values()].sort((a,b)=>a.label.localeCompare(b.label));
}
