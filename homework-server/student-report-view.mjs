import {readFile} from 'node:fs/promises';
import {skillNames, resultParts} from './student-report.mjs';
import {radarFigure, trendFigure, html} from './student-report-figures.mjs';
import {workDate} from '../homework/grade-journey-model.js';

const styles = readFile(new URL('./student-report.css', import.meta.url), 'utf8');
const fullDate = new Intl.DateTimeFormat('zh-CN', {year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
const date = stamp => Number.isFinite(Date.parse(stamp)) ? fullDate.format(new Date(stamp)) : '日期待录';
const number = n => Number.isFinite(n) ? String(n) : '—';
const rate = n => Number.isFinite(n) ? n+'%' : '—';
const signed = n => Number.isFinite(n) ? (n>0?'+':'')+n : '—';
const band = n => n ? `<b class="band level-${Number(n)}">第 ${Number(n)} 档</b>` : '样本不足';
const sectionId = c => 'detail-'+c.course;

function metrics(courses) {
  if (!courses.length) return '<p class="empty">这段时间还没有学习记录。</p>';
  const index = c => c.evidence?.index;
  const metrics = [
    ['作业平均', c=>`<strong class="average">${rate(c.average)}</strong>`],
    ...(courses.some(c=>Number.isFinite(c.trend)) ? [['近期变化¹', c=>Number.isFinite(c.trend) ? signed(c.trend)+' <small>个百分点</small>' : '—']] : []),
    ['课堂表现', c=>index(c) ? band(index(c).level)+' <small>'+index(c).value+'/100</small>' : '样本不足'],
    ['已出分 / 应交', c=>c.graded+' / '+c.cells.length],
    ['待订正', c=>c.pending+' 道']
  ];
  return `<table class="metrics" aria-label="分科学习指标"><thead><tr><td></td>${courses.map(c=>`<th scope="col" class="subject-${c.course}">${html(c.label)}</th>`).join('')}</tr></thead>
    <tbody>${metrics.map(([label,format])=>`<tr><th scope="row">${label}</th>${courses.map(c=>`<td>${format(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function workTable(c) {
  if (!c.cells.length) return '';
  const heads=['首答','订正补回','教师调整','最终 / 满分'];
  const rows=c.cells.map(cell=>{
    const p=resultParts(cell), a=cell.assignment, offline=a.offline||a.format==='score';
    const notes=[date(workDate(a))];
    if (offline) notes.push('线下');
    if (!p) notes.push(offline&&['todo','missing'].includes(cell.status)?'待录分':cell.label);
    if (cell.pendingUpdate) notes.push('重交成绩待更新');
    if (p?.resubmission) notes.push('重交变化 '+signed(p.resubmission)+' 分');
    const values=[number(p?.first),signed(p?.recovered),signed(p?.adjustment),p?number(p.total)+' / '+number(p.max):'—'];
    return `<tr><th scope="row">${html(a.title||'历史作业')}<small>${notes.filter(Boolean).map(html).join(' · ')}</small></th>${values.map((v,i)=>`<td data-col="${heads[i]}">${v}</td>`).join('')}</tr>`;
  });
  return `<table class="works"><caption>作业明细</caption><thead><tr><th scope="col">作业</th>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function skills(c){
  const axes=c.evidence?.axes||[];
  if (!axes.length) return '';
  const rows=axes.map(a=>{
    const ref=a.references.find(q=>q.score<q.max)||a.references[0];
    return `<tr><th scope="row">${html(skillNames[a.skill-1])}</th><td>${band(a.band)}</td><td>${rate(a.value)}</td><td>${a.count}</td><td>${ref?'《'+html(ref.title)+'》第 '+html(ref.questionNumber)+' 题':'—'}</td></tr>`;
  }).join('');
  const e=c.evidence;
  const notes=[];
  if (Number.isFinite(e.first)) notes.push('独立首答得分率 '+rate(e.first));
  if (Number.isFinite(e.transfer)) notes.push('订正后同技能新题正确率 '+rate(e.transfer));
  if (Number.isFinite(e.next)) notes.push('课堂表现距下一档 '+e.next+' 分');
  return `<table class="skills"><caption>技能表现</caption><thead><tr><th>技能</th><th>档位</th><th>得分率</th><th>独立题数</th><th>对应练习</th></tr></thead><tbody>${rows}</tbody></table>
    ${notes.length?`<p class="footnote">${notes.join(' · ')}</p>`:''}`;
}

function corrections(c){
  if (!c.errors) return '';
  const counts=[c.verified&&c.verified+' 道已通过',c.pending&&c.pending+' 道待订正',c.waiting&&c.waiting+' 道待验收',c.selfReviewed&&c.selfReviewed+' 道已标记复习或掌握'].filter(Boolean);
  const examples=c.practiceItems.map(m=>`<li>《${html(m.assignmentTitle)}》第 ${html(m.questionNumber)} 题${m.knowledge?' · '+html(m.knowledge):''}</li>`);
  return `<section class="block"><h3>错题订正</h3><p>${html(['共 '+c.errors+' 道',...counts].join('，'))}。</p>
    ${examples.length?'<ul class="examples">'+examples.join('')+'</ul>':''}</section>`;
}

function practice(c,includeMock){
  const latest=c.mockHistory[0];
  if (!includeMock || !latest) return '';
  const duration=Number.isFinite(latest.seconds)?'，用时 '+Math.floor(latest.seconds/60)+' 分 '+Math.floor(latest.seconds%60)+' 秒':'';
  return `<section class="block"><h3>自主模考</h3><p>已完成 ${c.mockHistory.length} 次。最近一次在 ${date(latest.date)}，正确率 ${rate(latest.rate)}${duration}。</p></section>`;
}

function detail(c,includeMock) {
  const exercises=c.advice.map(a=>`<li><strong>${html(a.title)}</strong><p>${html(a.detail)}</p></li>`).join('');
  return `<section class="detail subject-${c.course}" id="${sectionId(c)}">
    <h2>${html(c.label)}学习记录</h2>
    ${skills(c)}
    ${exercises?`<section class="block practice"><h3>下一次练习</h3><ul>${exercises}</ul></section>`:''}
    ${corrections(c)}${practice(c,includeMock)}${workTable(c)}
    ${!c.cells.length && !c.mockHistory.length?'<p class="empty">当前范围还没有已布置的作业。</p>':''}
    </section>`;
}

const downloadIcon='<path d="M12 3v11m-4-4 4 4 4-4M4 16v4h16v-4"/>';
const printIcon='<path d="M7 8V3h10v5M6 17H3V9h18v8h-3M7 14h10v7H7z"/>';
const icon=path=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

export async function renderStudentReport(report){
  const courses=report.courses, note=report.latestNote;
  const scope=[report.period,report.unit,report.assignmentTitle].filter(Boolean).join(' · ');
  const footer=[report.name,...report.classNames].join(' · ');
  const cssFooter=Array.from(footer).slice(0,48).map(c=>'\\'+c.codePointAt(0).toString(16)+' ').join('');
  const hasTrend=courses.some(c=>Number.isFinite(c.trend));
  const finalOnly=courses.some(c=>c.cells.some(cell=>cell.status==='graded' && resultParts(cell)?.first===null));
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${html(report.name)} · 经济学学习报告 · ${date(report.at)}</title><style>${await styles}
  @page{@bottom-left{content:"${cssFooter}"}}</style><script defer src="/teacher/student-report-actions.js"></script></head><body><main>
    <div class="mast"><b>Mike <span>的经济一页通</span></b><nav class="actions" aria-label="文档操作"><button type="button" id="save">${icon(downloadIcon)}下载网页</button><button type="button" id="print">${icon(printIcon)}打印 / PDF</button></nav></div>
    <header class="front${courses.length>2?' expanded':''}">
      <div class="identity"><h1>经济学学习报告</h1><strong>${html(report.name)}</strong><span class="classes">${report.classNames.map(n=>'<i>'+html(n)+'</i>').join(' ')||'班级待确认'}</span>
      <p class="dateline"><time>${date(report.at)}</time>${scope?' · '+html(scope):''}</p></div>
      ${metrics(courses)}
    </header>
    ${courses.map(c=>`<section class="exhibits subject-${c.course}" aria-label="${html(c.label)}图表"><div class="section-head"><h2>${html(c.label)}</h2><a href="#${sectionId(c)}" aria-label="${html(c.label)}分科明细">分科明细 <span aria-hidden="true">↓</span></a></div>
      <div class="pair">${radarFigure(c)}${trendFigure(c)}</div></section>`).join('')}
    ${courses.length?`<aside class="method" aria-label="统计口径">${hasTrend?'<p>¹ 最近三份已出分作业的平均得分率，与此前三份相比。</p>':''}<p>作业平均按已公布的最终得分率计算，缺分留空、零分计入。课堂表现参考独立首答和订正后同技能新题，采用五档。${finalOnly?'仅有总分的记录只列最终分。':''}</p></aside>`:''}
    ${note?`<aside class="teacher-note"><h2>老师的话</h2><p>${html(note.headline)}</p>${(note.nextSteps||[]).map(s=>'<p>'+html(s.text)+'</p>').join('')}<small>${html([date(note.publishedAt),note.className,note.period].filter(Boolean).join(' · '))}</small></aside>`:''}
    ${courses.map(c=>detail(c,report.includeMock)).join('')}</main></body></html>`;
}
