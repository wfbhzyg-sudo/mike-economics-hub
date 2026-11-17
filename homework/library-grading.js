export function libraryOptions(q){const raw=q.optionLabels?.length?q.optionLabels:q.options?.length?q.options:['A','B','C','D','E'];return raw.map(o=>typeof o==='string'?o:o.label).filter(x=>/^[A-E]$/.test(x));}
export function automaticGradeReady(q){
 if(q.status!=='ready')return false;
 if(q.type==='choice')return /^[A-E]$/.test(q.answer)&&libraryOptions(q).includes(q.answer);
 const points=q.scoringPoints;
 return q.type==='short'&&Boolean(q.criteria)&&Number.isFinite(q.maxPoints)&&q.maxPoints>0&&Array.isArray(points)&&points.length>0&&points.every(p=>p.id&&p.criterion&&Number.isFinite(p.maxPoints)&&p.maxPoints>0)&&new Set(points.map(p=>p.id)).size===points.length&&Math.abs(points.reduce((n,p)=>n+p.maxPoints,0)-q.maxPoints)<.000001;
}
export function gradingFields(questions,h){
 const manual=questions.filter(q=>!automaticGradeReady(q));if(!manual.length)return '';
 return `<fieldset class="library-manual-points"><legend>${manual.length} 道题需教师评分 · 仍可布置</legend><p>本卷简答题由教师评分；答案已确认的选择题直接计分。请确认待核对题的满分。</p>${manual.map(q=>`<label><span>原题 ${h(q.number||q.id)} · ${q.type==='choice'?'MCQ':'FRQ'} 满分</span><input data-library-points="${h(q.id)}" type="number" min="0.5" max="100" step="0.5" required value="${Number.isFinite(q.maxPoints)&&q.maxPoints>0?q.maxPoints:q.type==='choice'?1:''}" placeholder="填写满分"></label>`).join('')}</fieldset>`;
}
export const readGradingPoints=form=>Object.fromEntries([...form.querySelectorAll('[data-library-points]')].map(input=>[input.dataset.libraryPoints,Number(input.value)]));
