export function questionIssues(q,items=[],pages=Infinity){
 const issues=[];const add=(code,label,blocking=true)=>issues.push({code,label,blocking});
 if(!String(q.id||'').trim()||items.filter(x=>String(x.id)===String(q.id)).length>1)add('number','题号缺失或重复');
 if(!q.sliceOnly&&!q.prompt?.trim())add('prompt','题干文字缺失');
 const regions=q.regions||[];
 if(!regions.length||regions.length>5||regions.some(r=>!Number.isInteger(r.page)||r.page<1||r.page>pages||!['x','y','w','h'].every(k=>Number.isFinite(Number(r[k])))||r.x<0||r.y<0||r.w<.03||r.h<.02||Number(r.x)+Number(r.w)>1.00001||Number(r.y)+Number(r.h)>1.00001))add('regions','题面范围需调整');
 if(q.type==='short'){if(!q.criteria?.trim())add('criteria','缺少参考答案');if(!(Number(q.maxPoints)>0&&Number(q.maxPoints)<=100))add('points','分值需确认');}
 else {const options=q.options||[];if(options.length<2||options.length>5||options.some((o,i)=>o.label!=='ABCDE'[i]||!q.sliceOnly&&!o.text?.trim()))add('options','选项不完整');if(!options.some(o=>o.label===q.answer))add('answer','答案缺失或冲突');if(!q.sourcePages?.trim())add('source','缺少答案出处');}
 if(!q.checked){if(q.inlineAnswer)add('inline','检查题面答案标记',false);if(q.continuationWarning)add('continuation','跨页拼接待确认',false);else if(new Set(regions.map(r=>r.page)).size>1)add('pages','跨页题目',false);if(q.sharedMaterial)add('shared','共享图表',false);if(!issues.length)add('unchecked','待人工核对',false);}
 return issues;
}
export function reviewQueue(items,pages){return items.map((q,index)=>({index,issues:questionIssues(q,items,pages)})).filter(row=>row.issues.length).sort((a,b)=>Number(b.issues.some(x=>x.blocking))-Number(a.issues.some(x=>x.blocking))||a.index-b.index);}
