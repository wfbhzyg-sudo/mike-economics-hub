import {assert,boundedText} from './validation.mjs';
export const UNIT='micro-unit-2';
export function cleanDrawing(b){
 assert(Array.isArray(b.pages)&&b.pages.length>0&&b.pages.length<=8,'手写稿限 1–8 页');let count=0;
 const pages=b.pages.map(page=>{assert(Array.isArray(page)&&page.length<=1500,'笔画过多，请另起一页');return page.map(s=>{assert(['pen','highlight'].includes(s.tool)&&['#132941','#8a4438','#33664f','#e9c74b'].includes(s.color),'画笔无效');assert(Number.isFinite(s.width)&&s.width>=.001&&s.width<=.03,'线宽无效');assert(Array.isArray(s.points)&&s.points.length&&s.points.length<=8000,'笔画数据无效');count+=s.points.length;assert(count<=70000,'笔迹过多，请将已完成部分保存为附件');return {tool:s.tool,color:s.color,width:s.width,points:s.points.map(p=>{assert(Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=1&&p[1]>=0&&p[1]<=1&&p[2]>=0&&p[2]<=1,'笔迹坐标无效');return p;})};});});
 let annotations;
 if(b.annotations!==undefined){
  assert(Array.isArray(b.annotations)&&b.annotations.length<=100,'文字批注最多100条');
  const ids=new Set();annotations=b.annotations.map(a=>{
   assert(a&&typeof a.id==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(a.id)&&!ids.has(a.id),'批注编号无效');ids.add(a.id);
   assert(Number.isInteger(a.page)&&a.page>=0&&a.page<pages.length,'批注页码无效');
   assert([a.x,a.y,a.width].every(Number.isFinite)&&a.x>=0&&a.x<=.98&&a.y>=0&&a.y<=.98&&a.width>=.08&&a.width<=1-a.x+.001,'批注位置无效');
   return {id:a.id,page:a.page,x:a.x,y:a.y,width:a.width,text:boundedText(a.text,3000,'文字批注'),color:['#132941','#8a4438','#33664f'].includes(a.color)?a.color:'#132941'};
  });
 }
 return {pages,text:boundedText(b.text,12000,'笔记'),revision:Number(b.revision),...(annotations?{annotations}:{})};
}
export function publicUnit(u){return {id:u.id,title:u.title,version:u.version,topics:u.topics.map(({teacherNotes,...t})=>t),resources:u.resources.filter(r=>r.audience!=='teacher'),questionCount:u.questionCount};}
export function validateSelection(ids,questions){assert(Array.isArray(ids)&&ids.length>0&&ids.length<=40&&new Set(ids).size===ids.length,'每次选择 1–40 道不同题目');return ids.map(id=>{const q=questions.find(q=>q.id===id);assert(q&&q.status==='ready'&&q.questionImages?.length,'题目尚未核对完成');assert(q.type==='short'||(/^[A-E]$/.test(q.answer)&&(!q.optionLabels||q.optionLabels.includes(q.answer))),'题目答案未确认');if(q.type==='short')assert(q.criteria&&Number.isFinite(q.maxPoints)&&q.scoringPoints?.length&&q.scoringPoints.every(p=>p.id&&p.criterion&&Number.isFinite(p.maxPoints)&&p.maxPoints>0)&&new Set(q.scoringPoints.map(p=>p.id)).size===q.scoringPoints.length&&Math.abs(q.scoringPoints.reduce((n,p)=>n+p.maxPoints,0)-q.maxPoints)<.000001,'简答题评分点尚未核对完成');return q;});}
