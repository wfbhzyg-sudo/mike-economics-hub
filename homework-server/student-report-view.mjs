import {readFile} from 'node:fs/promises';
import {skillNames, resultParts, readingHighlight} from './student-report.mjs';
import {workDate} from '../homework/grade-journey-model.js';
import {skillRadarSvg} from '../homework/learning-evidence.js';

const css = readFile(new URL('./student-report.css', import.meta.url), 'utf8');
const avatar = readFile(new URL('./report-mike.webp', import.meta.url), 'base64');
const campus = readFile(new URL('./report-campus.webp', import.meta.url), 'base64');
const lettering = readFile(new URL('./fonts/report-title.ttf', import.meta.url), 'base64');
const letteringLicense = readFile(new URL('./fonts/report-title-OFL.txt', import.meta.url), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmtDate = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
const date = value => Number.isFinite(Date.parse(value)) ? fmtDate.format(new Date(value)) : '日期未记录';
const pct = value => Number.isFinite(value) ? value+'%' : '—';
const points = value => Number.isFinite(value) ? String(value) : '—';
const plus = value => Number.isFinite(value) ? (value>0?'+':'')+value : '—';
const band = n => n ? `<b class="band b${Number(n)}">第 ${Number(n)} 档</b>` : '<b class="band">积累中</b>';

// Tiny illustrated emoji use the same outlines on paper, iOS, and desktop.
const marks={
  leaf:'<path fill="#97caa6" d="M10 18Q1 17 3 8q8 0 9 7Q12 5 21 4q1 10-9 12"/><path fill="none" d="M11 21q0-5 6-11"/>',
  pencil:'<path fill="#ffcf76" d="m4 15 11-12 5 5-11 12-6 1z"/><path fill="#ec9e96" d="m15 3 2-2 5 5-2 2z"/><path fill="#fff5d9" d="m4 15 5 5-6 1z"/>',
  star:'<path fill="#ffd978" d="m12 2 3 6.2 6.9 1-5 4.9 1.2 6.9-6.1-3.3L5.9 21 7 14.1 2 9.2l6.9-1z"/><path fill="none" d="M9 12h.1m5.8 0h.1m-4.9 1.9q1.7 1.8 3.6 0"/>'
};
export function reportIcon(key) {
  return `<svg class="sticker" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#294353" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${marks[key]}</svg>`;
}
function scale(index){
  return `<div class="scale" aria-hidden="true">${[1,2,3,4,5].map(i=>`<i class="${index?'b'+i:'empty'}"></i>`).join('')}${index?`<b style="left:${Math.max(0,Math.min(100,index.value))}%"></b>`:''}</div>`;
}
function card(c){
  const v=c.evidence, index=v?.index;
  const explanation=index ? (v.next===null?'这次达到了第五档。':`离第 ${index.level+1} 档还有 ${v.next} 分。`) :
    v ? `目前有 ${v.works} 份独立作业，合计满分 ${v.points} 分。满 2 份、合计满分达 10 分后显示档位。` : '这个分类的作业单独列在明细中。';
  return `<article class="summary-card subject-${c.course}"><h3><span class="tab">${escape(c.label)}</span></h3>
    <p class="bubble-title">课堂学习表现</p><div class="value">${band(index?.level)} ${index?`<strong>${index.value}</strong><span>/ 100</span>`:''}</div>${scale(index)}
    <p>${explanation}</p><dl><div><dt>作业平均</dt><dd>${pct(c.average)}</dd></div><div><dt>已出分 / 应交</dt><dd>${c.graded} / ${c.cells.length}</dd></div><div><dt>待订正</dt><dd>${c.pending} 道</dd></div></dl>
    <p class="highlight">${escape(readingHighlight(c))}</p>${c.trend!==null?`<p>最近三份作业的平均得分率${c.trend===0?'与此前三份持平':(c.trend>0?'比此前三份高 ':'比此前三份低 ')+Math.abs(c.trend)+' 个百分点'}。</p>`:''}</article>`;
}
function skills(c){
  if(!c.evidence)return '<p>这个分类暂时没有可单独统计的技能记录。</p>';
  const axes=c.evidence.axes;
  const chart=axes.some(a=>a.band!==null) ? `<div class="radar-box">${skillRadarSvg(axes)}</div>` : '';
  return `<div class="skill-spread">${chart}<div class="skills">${axes.map(axis=>{
    const ref=axis.references.find(r=>r.score<r.max)||axis.references[0];
    return `<article><div class="skill-head"><b>${axis.skill} · ${skillNames[axis.skill-1]}</b>${band(axis.band)}</div>
      <p>${axis.count} 道独立题${axis.value!==null?' · 得分率 '+pct(axis.value):' · 样本不足，暂不分档'}</p>${ref?`<small>《${escape(ref.title)}》第 ${escape(ref.questionNumber)} 题</small>`:''}</article>`;
  }).join('')}</div></div>`;
}
function history(c){
  if(!c.cells.length)return '<p>这段时间还没有已布置的作业。</p>';
  return `<table class="works"><thead><tr><th>作业与状态</th><th>首答</th><th>订正补回</th><th>调整</th><th>最终 / 满分</th></tr></thead><tbody>${c.cells.map(cell=>{
    const p=resultParts(cell),a=cell.assignment;
    const offline=a.offline||a.format==='score';
    const status=cell.status==='graded'?(offline?'已录分':'已出分'):offline && ['todo','missing'].includes(cell.status)?'待老师录分':cell.label;
    return `<tr><th scope="row">${escape(a.title || '历史作业')}<small>${date(workDate(a))} · ${a.offline||a.format==='score'?'线下':'线上'} · ${escape(status)}${cell.pendingUpdate?' · 新交的版本待更新':''}${p?.resubmission?' · 重交变化 '+plus(p.resubmission)+' 分':''}</small></th><td>${points(p?.first)}</td><td>${plus(p?.recovered)}</td><td>${plus(p?.adjustment)}</td><td><b>${p?points(p.total)+' / '+points(p.max):'—'}</b></td></tr>`;
  }).join('')}</tbody></table><p class="note">“—”表示没有这项记录。空白不计入平均，已录入的 0 分会计入。线下成绩和无法拆分的历史成绩只列最终分。</p>`;
}
function detail(c,includeMock){
  const practice=c.mockHistory, e=c.evidence;
  return `<section class="course subject-${c.course}"><h2><span class="tab">${escape(c.label)}</span> 学习记录</h2>
    <h3>${reportIcon('leaf')}四项技能的表现</h3>${skills(c)}
    ${e?.index?`<p class="note">独立首答得分率 ${pct(e.first)}。${e.transfer===null?'订正后做同技能新题的记录还在积累。':'订正后做同技能新题的正确率为 '+pct(e.transfer)+'。'}</p>`:''}
    <div class="practice-note"><h3>${reportIcon('pencil')}下次可以这样练</h3><ol class="steps">${c.advice.map(a=>`<li><strong>${escape(a.title)}</strong>${a.basis?`<small>${escape(a.basis)}</small>`:''}<p>${escape(a.detail)}</p></li>`).join('')}</ol></div>
    <div class="correction-block"><h3>错题与订正</h3>${c.errors?`<p>这段时间有 ${c.errors} 道题留下了错题记录。${c.verified?`其中 ${c.verified} 道已通过订正验收。`: ''}${c.pending?`还有 ${c.pending} 道可以挑出来再试一次。`: ''}${c.waiting?`另有 ${c.waiting} 道正在验收或等老师核对。`:''}${c.selfReviewed?`有 ${c.selfReviewed} 道已由你标记为复习或掌握。`:''}</p>`:'<p>这段时间还没有记录到需要订正的题目。</p>'}
    ${c.practiceItems.length?`<ul class="evidence-list">${c.practiceItems.map(m=>`<li>《${escape(m.assignmentTitle)}》第 ${m.questionNumber} 题 <small>${points(m.score)} / ${points(m.maxPoints)} 分${m.knowledge?' · '+escape(m.knowledge):''}</small></li>`).join('')}</ul>`:''}
    </div>${includeMock?`<h3>自主模考</h3>${practice.length?`<p>你共完成了 ${practice.length} 次模考。最近一次在 ${date(practice[0].date)}，正确率 ${pct(practice[0].rate)}${Number.isFinite(practice[0].seconds)?'，用时 '+Math.floor(practice[0].seconds/60)+' 分 '+Math.floor(practice[0].seconds%60)+' 秒':''}。模考成绩单独记录。</p>`:'<p>这段时间还没有已交卷的模考记录。</p>'}`:''}
    <h3>作业与考试 <small>${c.cells.length} 份</small></h3>${history(c)}</section>`;
}
export async function renderStudentReport(report){
  const scope=[report.period,report.unit,report.assignmentTitle].filter(Boolean);
  const r=report.latestNote;
  const footerText=[report.name,...report.classNames].filter(Boolean).join(' · ');
  const footer=Array.from(footerText).slice(0,48).map(ch=>'\\'+ch.codePointAt(0).toString(16)+' ').join('');

  const note=report.courses.some(c=>c.graded>0) ? '一起挑一道你还记得的题吧。上次是从哪一步开始想的？如果再做一遍，哪一步你想换个方法？' : '把这份报告当作一个起点吧。下一次做题时，留下一句自己的想法。等有了反馈，我们再一起看。';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(report.name)} · 学情手帐 · ${date(report.at)}</title><style>/* ${await letteringLicense} */
@font-face{font-family:JournalTitle;src:url("data:font/ttf;base64,${await lettering}") format("truetype");font-display:swap}
:root{--campus:url("data:image/webp;base64,${await campus}")}
${await css}
@page{@bottom-left{content:"${footer}"}}</style><script defer src="/teacher/student-report-actions.js"></script></head>
  <body><nav class="actions" aria-label="文档操作"><button type="button" id="save">下载网页版</button><button type="button" id="print">打印 / 保存 PDF</button></nav><main>
  <header class="cover"><div class="identity"><b class="wordmark">Mike 的经济一页通</b><h1>${escape(report.name)}<span>的经济学学习手帐</span></h1>
  <p class="class-list"><b>班级</b> ${report.classNames.length?report.classNames.map(v=>`<span>${escape(v)}</span>`).join(' '):'历史记录 · 班名待确认'}</p>
  <small>${scope.map(escape).join(' · ')}　|　${date(report.at)}</small></div></header>
  <aside class="mike-note"><img alt="抱着笔记本的 Mike" width="76" height="76" src="data:image/webp;base64,${await avatar}"><div><b>Mike 的小纸条</b><p>${note}</p></div></aside>
  <section class="overview"><h2>${reportIcon('star')}这段时间的表现</h2><div class="cards">${report.courses.map(card).join('')||'<p>当前范围还没有学习记录。</p>'}</div>
  <p class="note">五档反映这段时间的课堂表现。各科分别计算，作业平均取已公布成绩。表现指数参考独立首答，以及订正后做同类新题的表现。</p></section>
  ${r?`<section class="teacher-note"><h2>老师想对你说</h2><small>${[date(r.publishedAt),r.className,r.period].filter(Boolean).map(escape).join(' · ')}</small><p>${escape(r.headline)}</p>${(r.nextSteps||[]).map(x=>`<p>${escape(x.text)}</p>`).join('')}</section>`:''}
  ${report.courses.map(c=>detail(c,report.includeMock)).join('')}</main></body></html>`;
}
