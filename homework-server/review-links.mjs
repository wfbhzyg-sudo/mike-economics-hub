import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {assert} from './validation.mjs';
export const BOOKSELF_CHAPTERS=JSON.parse(readFileSync(new URL('./bookself-catalog.json',import.meta.url))).chapters;
const byKey=new Map(BOOKSELF_CHAPTERS.map(c=>[c.key,c]));
export function chapterLink(key){const c=byKey.get(key);return c?{key:c.key,book:c.book,chapter:c.id,title:c.title,bookTitle:c.bookTitle,unit:c.unit,href:'/enter/bookself?'+new URLSearchParams({book:c.book,chapter:c.id})}:null;}
export function bookselfTarget(book,chapter){const c=byKey.get(book+':'+chapter);return c?c.path+'?'+new URLSearchParams({chapter:c.id,stage:'definition'}):null;}
export function validateChapterKeys(keys){assert(Array.isArray(keys)&&keys.length<=3&&keys.every(k=>typeof k==='string'&&byKey.has(k)),'请选择最多 3 个已有 Bookself 章节');return [...new Set(keys)];}
export const questionFingerprint=q=>createHash('sha256').update(JSON.stringify([q.id,q.prompt||'',q.questionImages||[],q.paperFileId||q.paperLocation?.fileId||'',q.paperPage||q.paperLocation?.page||null])).digest('hex');
const normal=s=>String(s||'').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
// Exact topic tags only. No keyword guessing from student answers or model calls.
const aliases={
 'u2-demand-supply':['供给与需求','供需','demand and supply'],
 'u2-equilibrium':['市场均衡','消费者剩余','生产者剩余','consumer surplus','producer surplus','market equilibrium'],
 'u2-elasticity':['弹性','需求价格弹性','price elasticity of demand','elasticity'],
 'u2-controls':['价格上限','价格下限','price ceiling','price floor'],
 'u2-taxes':['税负归宿','tax incidence'],
 'u3-costs':['短期成本','边际成本','short-run costs','marginal cost'],
 'u3-competition':['完全竞争','perfect competition'],
 'u4-monopoly':['垄断','monopoly'],
 'u4-oligopoly':['寡头','博弈论','oligopoly','game theory'],
 'u6-negative':['负外部性','negative externalities'],
 'u6-positive':['正外部性','positive externalities'],
 'm2-gdp':['gdp','国内生产总值'],
 'm2-prices':['通货膨胀','通胀','inflation','cpi'],
 'm2-jobs':['失业','失业率','unemployment'],
 'm3-demand':['总需求','aggregate demand','乘数','multiplier','ad-as'],
 'm3-supply':['总供给','aggregate supply','sras','ad-as'],
 'm3-fiscal':['财政政策','fiscal policy'],
 'm4-monetary':['货币政策','monetary policy'],
 'm4-saving':['可贷资金','loanable funds'],
 'm5-phillips':['菲利普斯曲线','phillips curve'],
 'm6-exchange':['汇率','exchange rates'],
};
export function matchedChapterKeys(question,course=''){
 const tags=String(question.knowledge||'').split(/[;,；、·|\n]/).map(normal).filter(Boolean);if(!tags.length)return [];
 const hint=/宏观|macro/i.test(course)?'ap-macroeconomics':/微观|micro/i.test(course)?'ap-microeconomics':null;
 const exact=BOOKSELF_CHAPTERS.filter(c=>(!hint||c.book===hint)&&tags.some(t=>t===normal(c.title)||t===normal(c.id)||t===c.key));
 const matched=BOOKSELF_CHAPTERS.filter(c=>(!hint||c.book===hint)&&aliases[c.id]?.some(a=>tags.includes(normal(a))));
 return [...new Set([...exact,...matched].map(c=>c.key))].slice(0,3);
}
export function reviewLinksFor(question,assignment,binding){
 const own=binding?.questions?.find(x=>x.id===question.id&&x.fingerprint===questionFingerprint(question));
 const inferred=matchedChapterKeys(question,assignment.course);
 const defaults=binding?.defaults||[];const keys=own?own.chapters:defaults.length?defaults:inferred;
 return {links:keys.map(chapterLink).filter(Boolean),source:own?'teacher':defaults.length?'assignment':inferred.length?'knowledge':'none'};
}
export function validateReviewBinding(body,assignment,current){
 assert(Number.isInteger(body.revision)&&body.revision===(current?.revision||0),'章节关联已在其他页面更新，请重新打开后再保存',409);
 assert(Array.isArray(body.questions)&&body.questions.length<=40,'题目关联格式无效');
 const seen=new Set();const questions=body.questions.map(row=>{const q=assignment.rubric.find(q=>q.id===row.id);assert(q&&!seen.has(row.id),'题号无效或重复');seen.add(row.id);assert(row.fingerprint===questionFingerprint(q),'题目内容已更新，请重新打开章节关联',409);return {id:q.id,fingerprint:row.fingerprint,chapters:validateChapterKeys(row.chapters)};});
 return {defaults:validateChapterKeys(body.defaults),questions,revision:(current?.revision||0)+1};
}
