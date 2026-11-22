import {readFile} from 'node:fs/promises';
import {skillNames, resultParts, readingHighlight} from './student-report.mjs';
import {radarFigure, trendFigure, html} from './student-report-figures.mjs';
import {workDate} from '../homework/grade-journey-model.js';

const styles=readFile(new URL('./student-report.css',import.meta.url),'utf8');
const fmt=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
const date=s=>Number.isFinite(Date.parse(s))?fmt.format(new Date(s)):'日期待录';
const number=n=>Number.isFinite(n)?String(n):'—';
const rate=n=>Number.isFinite(n)?n+'%':'—';
const signed=n=>Number.isFinite(n)?(n>0?'+':'')+n:'—';
const band=n=>n?`<b class="band level-${Number(n)}">第 ${Number(n)} 档</b>`:'样本积累中';
const sectionId=c=>'detail-'+c.course;

function observations(c) {
  if(!c.graded)return c.mockHistory.length?`已完成 ${c.mockHistory.length} 次自主模考，作业成绩还在等待公布。`:'这个时段还没有已公布的作业成绩。';
  const trend=c.trend;
  if(Number.isFinite(trend)) return trend===0?'最近三份与此前三份作业的平均得分率持平。':`最近三份作业的平均得分率比此前三份${trend>0?'高':'低'} ${Math.abs(trend)} 个百分点。`;
  if(c.verified)return `已有 ${c.verified} 道错题通过订正验收${c.pending?'，接下来可以从剩余的 '+c.pending+' 道开始练起':''}。`;
  const axes=c.evidence?.axes.filter(a=>a.band!==null)??[];
  const best=axes.slice().sort((a,b)=>b.value-a.value||b.count-a.count)[0];
  return best?`「${skillNames[best.skill-1]}」得分率为 ${best.value}%，依据是 ${best.count} 道独立练习。`:`已有 ${c.graded} 份作业公布成绩。继续积累几次不同题型的练习，就能看清哪些方法用得更熟练。`;
}
function headline(courses) {
  const measured=courses.filter(c=>Number.isFinite(c.average));
  const allComparable=measured.length && measured.every(c=>Number.isFinite(c.trend));
  if(allComparable && measured.every(c=>c.trend>0))return measured.map(c=>c.label).join('、')+'最近三份作业的平均得分率'+(measured.length>1?'均':'')+'有提高。';
  if(measured.length===1)return measured[0].label+'的作业平均得分率为 '+rate(measured[0].average)+'。';
  if(measured.length)return measured.map(c=>c.label+'作业平均 '+rate(c.average)).join('，')+'。';
  return '已布置作业和独立练习会在这里留下记录。';
}

function assignments(c) {
  if(!c.cells.length)return '<p>当前范围还没有作业记录。</p>';
  const headings=['首答','订正补回','教师调整','最终 / 满分'];
  const body=c.cells.map(cell=>{
    const p=resultParts(cell),a=cell.assignment,offline=a.offline||a.format==='score';
    const status=cell.status==='graded'?(offline?'已录分':'已出分'):offline&&['todo','missing'].includes(cell.status)?'待老师录分':cell.label;
    const cells=[number(p?.first),signed(p?.recovered),signed(p?.adjustment),p?number(p.total)+' / '+number(p.max):'—'];
    const subtitle=[date(workDate(a)),offline?'线下':'线上',status,cell.pendingUpdate?'重交成绩待更新':'',p?.resubmission?'重交变化 '+signed(p.resubmission)+' 分':''].filter(Boolean).map(html).join(' · ');
    return `<tr><th scope="row">${html(a.title||'历史作业')}<small>${subtitle}</small></th>${cells.map((v,i)=>`<td data-col="${headings[i]}">${v}</td>`).join('')}</tr>`;
  }).join('');
  return `<table class="works"><thead><tr><th scope="col">作业与考试</th>${headings.map(h=>'<th scope="col">'+h+'</th>').join('')}</tr></thead><tbody>${body}</tbody></table>
    <p class="caption">首答、重交变化、订正补回与教师调整共同构成最终分。线下纯分及无法拆分的历史成绩仅列最终分。缺分留空，已录入的 0 分计入平均。</p>`;
}
function overview(report){
  const courses=report.courses;
  if(!courses.length)return '<p class="empty">当前筛选范围内还没有学习记录。</p>';
  const rows=courses.map(c=>`<tr><th scope="row"><a href="#${sectionId(c)}">${html(c.label)}</a></th><td>${rate(c.average)}</td><td>${band(c.evidence?.index?.level)}<small>${c.evidence?.index?c.evidence.index.value+' / 100':''}</small></td><td>${c.graded} / ${c.cells.length}</td><td>${c.pending} 道</td></tr>`).join('');
  return `<div class="summary"><h2>本期观察</h2><p class="lead">${html(headline(courses))}</p>
    ${courses.map(c=>`<p class="observation"><b>${html(c.label)}</b>${html(observations(c))}</p>`).join('')}</div>
    <table class="metrics"><caption>分科学习指标</caption><thead><tr><th scope="col">科目</th><th scope="col">作业平均</th><th scope="col">课堂表现</th><th scope="col">已出分 / 应交</th><th scope="col">待订正</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="caption">作业平均取每份已公布作业的最终得分率。课堂表现指数参考独立首答与订正后同技能新题的表现，按五档呈现。</p>
    ${courses.map((c,i)=>`<section class="exhibits subject-${c.course}" aria-label="${html(c.label)}图表"><h3>${html(c.label)}<a href="#${sectionId(c)}">查看明细 ↓</a></h3><div class="pair">${radarFigure(c,2*i+1)}${trendFigure(c,2*i+2)}</div></section>`).join('')}`;
}
function detail(c,i,includeMock) {
  const e=c.evidence,mocks=c.mockHistory;
  const skillRows=(e?.axes||[]).map(a=>{
    const ref=a.references.find(q=>q.score<q.max)||a.references[0];
    return `<tr><th scope="row">${html(skillNames[a.skill-1])}</th><td>${band(a.band)}</td><td>${rate(a.value)}</td><td>${a.count}</td><td>${ref?'《'+html(ref.title)+'》第 '+html(ref.questionNumber)+' 题':'—'}</td></tr>`;
  }).join('');
  return `<section class="detail subject-${c.course}" id="${sectionId(c)}"><div class="chapter"><span>${String(i+1).padStart(2,'0')}</span><h2>${html(c.label)}学习分析</h2></div>
    <p class="intro">${html(readingHighlight(c))}</p>
    <h3>技能与练习依据</h3>${skillRows?`<table class="skills"><thead><tr><th>技能</th><th>档位</th><th>得分率</th><th>独立题数</th><th>可回看的题目</th></tr></thead><tbody>${skillRows}</tbody></table>`:'<p>当前分类还没有可归属的独立技能记录。</p>'}
    ${e?.index?`<p class="caption">独立首答得分率 ${rate(e.first)}。${Number.isFinite(e.transfer)?'订正后，同技能新题的正确率为 '+rate(e.transfer)+'。':'订正后同技能新题的样本尚少。'}${Number.isFinite(e.next)?'当前表现指数距下一档还差 '+e.next+' 分。':''}</p>`:''}
    <h3>下一次练习</h3><ol class="advice">${c.advice.map(a=>`<li><strong>${html(a.title)}</strong><p>${html(a.detail)}</p></li>`).join('')}</ol>
    <h3>错题与订正</h3><p>${c.errors?`共记录 ${c.errors} 道错题，${c.verified} 道已通过订正验收，${c.pending} 道待订正。`:'本期没有错题记录。'}${c.waiting?'另有 '+c.waiting+' 道等待验收。':''}${c.selfReviewed?'你已自行标记复习或掌握 '+c.selfReviewed+' 道。':''}</p>
    ${c.practiceItems.length?`<ul class="examples">${c.practiceItems.map(m=>`<li>《${html(m.assignmentTitle)}》第 ${html(m.questionNumber)} 题${m.knowledge?' · '+html(m.knowledge):''}</li>`).join('')}</ul>`:''}
    ${includeMock?`<h3>自主模考</h3><p>${mocks.length?`共交卷 ${mocks.length} 次。最近一次为 ${date(mocks[0].date)}，正确率 ${rate(mocks[0].rate)}${Number.isFinite(mocks[0].seconds)?'，用时 '+Math.floor(mocks[0].seconds/60)+' 分 '+Math.floor(mocks[0].seconds%60)+' 秒':''}。模考单独统计。`:'本期还没有已交卷的模考。'}</p>`:''}
    <h3>作业成绩明细</h3>${assignments(c)}</section>`;
}
export async function renderStudentReport(report){
  const r=report.latestNote;
  const scope=[report.period,report.unit,report.assignmentTitle].filter(Boolean).join(' · ');
  const footer=[report.name,...report.classNames].join(' · ');
  const cssFooter=Array.from(footer).slice(0,48).map(c=>'\\'+c.codePointAt(0).toString(16)+' ').join('');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${html(report.name)} · 经济学学习报告 · ${date(report.at)}</title><style>${await styles}
  @page{@bottom-left{content:"${cssFooter}"}}</style><script defer src="/teacher/student-report-actions.js"></script></head><body>
  <nav class="actions" aria-label="文档操作"><button type="button" id="save">下载网页版</button><button type="button" id="print">打印 / 保存 PDF</button></nav>
  <main><header><div class="mast"><b>Mike <span>的经济一页通</span></b><time>${date(report.at)}</time></div>
  <h1>经济学学习报告</h1><div class="identity"><strong>${html(report.name)}</strong><span>${report.classNames.map(html).join('　/　')||'历史记录 · 班级待确认'}</span></div>
  <p class="scope">观察范围　${html(scope)}</p></header>${overview(report)}
  ${r?`<aside class="teacher-note"><h2>老师的话</h2><p>${html(r.headline)}</p>${(r.nextSteps||[]).map(s=>'<p>'+html(s.text)+'</p>').join('')}<small>${html([date(r.publishedAt),r.className,r.period].filter(Boolean).join(' · '))}</small></aside>`:''}
  ${report.courses.map((c,i)=>detail(c,i,report.includeMock)).join('')}</main></body></html>`;
}
