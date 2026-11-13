export function canonicalQuestions(questions){const replaced=new Set(questions.filter(q=>q.status==='ready').flatMap(q=>q.supersedes||[]));return questions.filter(q=>!replaced.has(q.id));}
export const skillNames={'1':'Principles and Models','2':'Interpretation','3':'Manipulation'};
export function buildPacks(questions,{topic='',unitLabel='Unit',collection='topic'}={}){
 questions=canonicalQuestions(questions);
 const packs=[];
 const add=(id,title,rows,note='')=>{if(!rows.length)return;rows=[...rows].sort((a,b)=>String(a.sourceId||a.source).localeCompare(String(b.sourceId||b.source))||a.number-b.number);for(let i=0;i<rows.length;i+=40){const part=rows.slice(i,i+40);packs.push({id:id+':'+i,title:title+(rows.length>40?` · Part ${i/40+1}`:''),note,questionIds:part.map(q=>q.id),count:part.length,ready:part.every(q=>q.status==='ready'),pending:part.filter(q=>q.status!=='ready').length});}};
 if(collection==='topic'){
  const choice=questions.filter(q=>q.type==='choice'&&q.status==='ready'&&q.topic===topic&&q.collection!=='exam');
  add('topic','Topic '+topic+' · MCQ',choice,'Complete topic practice');
  for(const [skill,name] of Object.entries(skillNames))add('skill'+skill,`Skill ${skill} · ${name}`,choice.filter(q=>String(q.skill||'').startsWith(skill)));
  const frq=questions.filter(q=>q.type==='short'&&q.status==='ready'&&(q.relatedTopics?.includes(topic)||q.topic===topic));
  add('frq','Related FRQ',frq,unitLabel+' · Original shared materials preserved');
 }else{
  const groups=new Map();
  for(const q of questions.filter(q=>collection==='progress'?q.collection==='progress':q.collection==='exam')){const key=(q.sourceId||q.source)+':'+q.type;const g=groups.get(key)||[];g.push(q);groups.set(key,g);}
  for(const [key,rows] of groups)add(key,rows[0].source+(new RegExp('\\b'+(rows[0].type==='choice'?'MCQ':'FRQ')+'\\b').test(rows[0].source)?'':' · '+(rows[0].type==='choice'?'MCQ':'FRQ')),rows,'Original question order');
 }
 return packs.sort((a,b)=>Number(b.ready)-Number(a.ready));
}
