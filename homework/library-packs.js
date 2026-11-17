export const questionHasTopic=(q,topic)=>q.topic===topic||Boolean(q.relatedTopics?.includes(topic));
export function canonicalQuestions(questions,{includeSourceAliases=false}={}){const replaced=new Set(questions.filter(q=>q.status==='ready').flatMap(q=>q.supersedes||[]));return questions.filter(q=>!replaced.has(q.id)&&(includeSourceAliases||!q.canonicalQuestionId));}
export const skillNames={'1':'Principles and Models','2':'Interpretation','3':'Manipulation'};
export function buildPacks(questions,{topic='',unitLabel='Unit',collection='topic'}={}){
 questions=canonicalQuestions(questions,{includeSourceAliases:collection!=='topic'});
 const packs=[];
 const add=(id,title,rows,note='')=>{if(!rows.length)return;rows=[...rows].sort((a,b)=>String(a.sourceId||a.source).localeCompare(String(b.sourceId||b.source))||a.number-b.number);for(let i=0;i<rows.length;i+=40){const part=rows.slice(i,i+40);packs.push({id:id+':'+i,title:title+(rows.length>40?` · Part ${i/40+1}`:''),note,questionIds:part.map(q=>q.id),count:part.length,ready:part.every(q=>q.status==='ready'),pending:part.filter(q=>q.status!=='ready').length});}};
 if(collection==='topic'){
  const choice=questions.filter(q=>q.type==='choice'&&questionHasTopic(q,topic)&&q.collection!=='exam');
  // Preserve imported papers as named, ordered packs; do not mix separate booklets.
  const named=new Map();
  const hasNamedPack=q=>q.assignmentPack?.id&&q.assignmentPack.title&&(!q.assignmentPack.topic||q.assignmentPack.topic===topic);
  for(const q of choice){if(!hasNamedPack(q))continue;const pack=q.assignmentPack,group=named.get(pack.id)||{title:pack.title,rows:[]};group.rows.push(q);named.set(pack.id,group);}
  for(const [id,pack] of named)add('source:'+id,pack.title,pack.rows,'原卷顺序 · 保留共用材料');
  add('topic','Topic '+topic+' · MCQ',choice.filter(q=>!hasNamedPack(q)),'本课练习');
  for(const [skill,name] of Object.entries(skillNames))add('skill'+skill,`Skill ${skill} · ${name}`,choice.filter(q=>String(q.skill||'').startsWith(skill)));
  const frq=questions.filter(q=>q.type==='short'&&(q.relatedTopics?.includes(topic)||q.topic===topic));
  add('frq','Related FRQ',frq,unitLabel+' · 保留原卷共用材料');
 }else{
  const groups=new Map();
  for(const q of questions.filter(q=>collection==='progress'?q.collection==='progress':q.collection==='exam')){const key=(q.sourceId||q.source)+':'+q.type;const g=groups.get(key)||[];g.push(q);groups.set(key,g);}
  for(const [key,rows] of groups)add(key,rows[0].source+(new RegExp('\\b'+(rows[0].type==='choice'?'MCQ':'FRQ')+'\\b').test(rows[0].source)?'':' · '+(rows[0].type==='choice'?'MCQ':'FRQ')),rows,'原卷顺序');
 }
 return packs.sort((a,b)=>Number(b.ready)-Number(a.ready));
}
