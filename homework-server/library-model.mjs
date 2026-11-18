import {automaticGradeReady} from '../homework/library-grading.js';
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
export function validateSelection(ids,questions,{requireReady=false}={}){
 assert(Array.isArray(ids)&&ids.length>0&&ids.length<=40&&new Set(ids).size===ids.length,'每次选择 1–40 道不同题目');
 const chosen=ids.map(id=>{const q=questions.find(q=>q.id===id);assert(q&&!q.deletedAt&&['choice','short'].includes(q.type)&&q.questionImages?.length,'题目原件缺失，请先补全切片');if(requireReady)assert(automaticGradeReady(q),'答案或评分点尚未核对完成');return q;});
 assert(new Set(chosen.map(q=>q.canonicalQuestionId||q.id)).size===chosen.length,'所选题目包含同一道题的不同来源，请保留一份');return chosen;
}

export function releaseAppliesToUnit(release, unit) {
  return release.unitId === unit.id && (!release.owner || (release.libraryOwner || release.owner) === unit.owner);
}
