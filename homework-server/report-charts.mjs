import {subjectInfo} from '../homework/subject-catalog.js';
import {html,trendFigure} from './student-report-figures.mjs';
import {correctionProgress} from '../homework/correction-progress.js';

const pct=n=>Number.isFinite(n)?n+'%':'—';
const day=s=>typeof s==='string'?s.slice(0,10):'';
const enc=encodeURIComponent;
const empty=msg=>'<p class="rr-empty">'+msg+'</p>';

function topicButton(t,weak=false){
  const text=t.band?pct(t.band.value):'未积累';
  const desc=t.id+' '+t.name+' · '+text;
  return '<button type="button" class="'+(weak?'rr-weak':'rr-cell')+'" data-report-topic="'+html(t.unit+'/'+t.id)+'" data-level="'+(t.band?.level||0)+'" aria-label="'+html(desc)+'">'+
    (weak?'<b>'+html(t.id)+'</b><span>'+html(t.name)+'</span><strong>'+text+'</strong>':'<b>'+html(t.id)+'</b><small>'+(t.band?.level||'—')+'</small>')+'</button>';
}

function chapters(c,student){
  const {topics=[],weak=[],coverage={}}=c.chapters||{};
  const groups=Map.groupBy(topics,t=>t.unit);
  const weakRow='<section class="rr-card"><h3>优先复习</h3>'+(weak.length?'<div class="rr-weak-row">'+weak.map(t=>topicButton(t,true)).join('')+'</div>':empty(topics.some(t=>t.count>=5)?'已有充分记录的章节均达到 80%。':'累计至少五道已评分题后展示优先章节。'))+'</section>';
  const cells='<section class="rr-card"><header><h3>章节表现</h3><small>首次得分 · 1–5 档</small></header>'+(groups.size?'<div class="rr-tape">'+[...groups].map(([unit,ts])=>'<div class="rr-unit"><small>Unit '+html(unit.split('-').at(-1))+'</small><div>'+ts.map(t=>topicButton(t)).join('')+'</div></div>').join('')+'</div>':empty('当前范围暂无章节记录。'))+
    (coverage.totalOnly||coverage.unmapped?'<small class="rr-coverage">'+[coverage.totalOnly?coverage.totalOnly+' 份仅有总分':'',coverage.unmapped?coverage.unmapped+' 道暂无可核实章节':''].filter(Boolean).join(' · ')+'</small>':'')+'</section>';
  const info=topics.map(t=>'<template data-rr-info="'+html(t.unit+'/'+t.id)+'"><h3>'+html(t.id+' '+t.name)+'</h3><p>首次得分　'+(t.possible?Number(t.earned.toFixed(3))+' / '+Number(t.possible.toFixed(3))+'　·　'+pct(t.band.value):'—')+'</p><p>'+t.count+' 道已评分　·　'+t.passed+' 道订正通过　·　'+t.waiting+' 道待验收</p><p>订正补回 '+t.recovered+' 分</p>'+
    (student?'<a href="/homework/#library/'+enc(t.unit)+'/'+enc(t.id)+'">回看章节</a>'+(t.firstMistake?'　<a href="/homework/#mistakes/'+enc(t.firstMistake.assignmentId)+'/'+enc(t.firstMistake.questionId)+'">订正这道错题</a>':''):'')+'</template>').join('');
  return {cells,weakRow,info};
}
export function skillBars(c){
  const defs=subjectInfo(c.course)?.skills||[];
  return '<div class="rr-skills">'+defs.map((s,i)=>{
    const a=c.evidence?.axes?.find(a=>a.skill===i+1),n=a?.band;
    return '<div class="rr-skill"><span>'+html(s.name)+'</span><span class="rr-segments" aria-hidden="true">'+[1,2,3,4,5].map(k=>'<i data-level="'+(k<=n?k:0)+'"></i>').join('')+'</span><b>'+(n?n+' 档':'待积累')+'</b></div>';
  }).join('')+'</div>';
}
function mock(c,student){
  const history=c.mockHistory||[],latest=history[0];
  if(!latest)return empty('本期还没有已交卷的自主模考。');
  const minutes=Number.isFinite(latest.seconds)?'，用时 '+Math.floor(latest.seconds/60)+' 分 '+Math.floor(latest.seconds%60)+' 秒':'';
  return '<p class="rr-caption">已交 '+history.length+' 次　·　最近一次正确率 '+pct(latest.rate)+minutes+(Number.isFinite(latest.count)?'　·　答对 '+latest.correct+'/'+latest.count+' 题':'')+'</p><div class="rr-mocks">'+history.toReversed().map(a=>{
    const tag=a.id?(student?'a':'button'):'span',href=tag==='a'?' href="/homework/#self-practice/result/'+enc(a.id)+'"':tag==='button'?' type="button" data-rr-mock="'+html(a.id)+'"':'';
    return '<'+tag+href+' class="rr-run" title="'+html(day(a.date)+'　'+pct(a.rate))+'"><small>'+pct(a.rate)+'</small><i style="height:'+Math.round(a.rate*.35+1)+'px"></i><small>'+html(day(a.date).slice(5))+'</small></'+tag+'>';
  }).join('')+'</div>';
}
function exams(c){
  if(!c.exams?.length)return empty('本期暂无达到匿名展示人数的班级考试。');
  return '<div class="rr-exams">'+c.exams.map(e=>'<article><h4>'+html(e.title)+'</h4><small>'+html(e.className)+' · '+html(day(e.date))+'</small><p>均分 <b>'+e.mean+'</b> / '+e.max+'　·　'+e.n+' 人</p><div class="rr-bins">'+e.bins.map(b=>'<div><b>'+b.count+'</b><i style="height:'+Math.round(2+b.count/Math.max(...e.bins.map(x=>x.count))*32)+'px"></i><small>'+b.from+'–'+b.to+'%</small></div>').join('')+'</div></article>').join('')+'</div>';
}

export function courseCharts(c,{student=false,includeMock=true}={}){
  const {cells,weakRow,info}=chapters(c,student);
  const trend='<section class="rr-card"><header><h3>作业得分率</h3><small>○ 首次　● 当前　┄ 缺分</small></header>'+trendFigure(c,true)+'</section>';
  const skills='<section class="rr-card"><h3>技能分布</h3>'+skillBars(c)+'</section>';
  const mockPanel=includeMock?'<section class="rr-card"><h3>自主模考</h3>'+mock(c,student)+'</section>':'';
  const bench='<h3>班级历次考试</h3><small>整班首次成绩 · 匿名人数分布</small>';
  const classPanel=student?'<details class="rr-card"><summary>本班历次考试</summary>'+exams(c)+'</details>':'<section class="rr-card"><header>'+bench+'</header>'+exams(c)+'</section>';
  return '<div class="rr-charts">'+(student?weakRow+cells:cells)+'<div class="rr-pair">'+trend+skills+'</div>'+(student?'':weakRow)+mockPanel+classPanel+info+'</div>';
}
export function recoveryLift(c){
  const {gain}=correctionProgress(c.cells.filter(c=>c.status==='graded').map(c=>c.record),[]);
  return gain===null?null:Math.round(gain*10)/10;
}
