import {subjectInfo} from '../homework/subject-catalog.js';
import {publicOpening,recordOpening} from './student-report-opening.mjs';
import {readFile} from 'node:fs/promises';
import {resultParts} from './student-report.mjs';
import {radarFigure,trendFigure,html} from './student-report-figures.mjs';
import {buildReportAnalysis,representativeWorks,selectedItems,teacherTasks} from './student-report-analysis.mjs';

const css=file=>readFile(new URL(file,import.meta.url),'utf8');
const styles=Promise.all(['./student-report.css','./student-report-mobile.css','./student-report-paper.css'].map(css));
const formatter=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Shanghai'});
const date=s=>Number.isFinite(Date.parse(s))?formatter.format(new Date(s)):'日期待录';
const number=n=>Number.isFinite(n)?String(n):'—';
const rate=n=>Number.isFinite(n)?n+'%':'—';
const signed=n=>Number.isFinite(n)?(n>0?'+':'')+n:'—';
const labels={S:'优势',W:'待加强',O:'可用机会',T:'近期风险',now:'重要 · 紧急',plan:'重要 · 不紧急',quick:'非重要 · 紧急',later:'非重要 · 不紧急'};

function summary(c){
  const index=c.evidence?.index;
  const parts=c.cells.map(resultParts).filter(Boolean);
  const recovered=parts.filter(p=>Number.isFinite(p.recovered));
  const sum=Math.round(recovered.reduce((s,p)=>s+p.recovered,0)*10)/10;
  const note=recovered.length?'已核实订正补回 '+sum+' 分':'订正补回 —';
  return `<article class="card summary ${c.course}"><h2 class="subj">${html(c.label)}</h2><div class="stats"><div><div class="band">${index?'<b>'+number(index.level)+'</b> 档':'样本不足'}</div><div class="ruler">${index?'<i style="left:'+number(index.value)+'%"></i>':''}</div><small>课堂表现指数 ${number(index?.value)}</small></div><div class="totals"><strong class="average">${rate(c.average)}</strong><span>作业均分</span><small>${c.graded} / ${c.cells.length} 份已出分 · ${note}</small></div></div>${Number.isFinite(c.trend)?'<small>近期变化¹　'+signed(c.trend)+' 个百分点</small>':''}</article>`;
}

function analysisCard(key,item,report){
  const isTask=key.length>1;
  const label=labels[key];
  const cls=isTask?'task '+key:'sw '+key.toLowerCase();
  const heading=isTask?item?.title||'本期暂无':label;
  const text=item?(item.edited||[item.text,item.advice].filter(Boolean).join('')):isTask?'':'待更多学习记录。';
  const cell=item?.assignmentId&&report.courses.flatMap(c=>c.cells).find(c=>c.assignment.id===item.assignmentId);
  const receipt=cell?.record?.effective?.id;
  const link=receipt?'work/review/'+encodeURIComponent(receipt):cell?'work/overview/'+encodeURIComponent(cell.assignment.id):'';
  const body=`${isTask?'<small class="priority">'+label+'</small>':'<span class="monogram" aria-hidden="true">'+key+'</span>'}<span class="copy"><b>${html(heading)}</b>${text?'<span class="interpretation">'+html(text)+'</span>':''}</span>`;
  if(!item)return '<article class="'+cls+' empty-card">'+body+'</article>';
  return `<article class="${cls}"><button class="proof" type="button" data-proof="${item.ref}" data-slot="${key}" data-manual="${Boolean(item.manual)}" ${item.manual?'data-course="'+html(item.course)+'" data-due="'+html(item.due)+'" data-important="'+item.important+'"':''} aria-haspopup="dialog" aria-label="${html(label+'，'+item.subject+'，查看依据')}">${body}<small class="subject">${html(item.subject)} <i>↗</i></small></button><template class="basis"><p>${html(item.basis)}</p>${link?'<a class="online-only" target="_blank" rel="noopener" href="/teacher/#'+html(link)+'">查看对应作业 ↗</a>':''}</template></article>`;
}

function evidenceTable(report,items){
  const rows=representativeWorks(report,items),total=report.courses.reduce((n,c)=>n+c.graded,0);
  return `<div class="cardhead"><h2>代表性作业</h2><small>选录 ${rows.length} / ${total} 份</small></div>${rows.length?`<table class="works"><thead><tr><th>作业</th><th>首次</th><th>订正补回</th><th>最终 / 满分</th></tr></thead><tbody>${rows.map(({cell,course,label})=>{
    const p=resultParts(cell);
    const extra=[p.resubmission&&'重交变化 '+signed(p.resubmission),p.adjustment&&'教师调整 '+signed(p.adjustment),cell.pendingUpdate&&'重交成绩待更新'].filter(Boolean);
    return `<tr class="${course}"><th scope="row"><small>${html(label)}</small><span class="work-title">${html(cell.assignment.title||'历史作业')}</span>${extra.length?'<em>'+extra.join(' · ')+'</em>':''}</th><td>${number(p.first)}</td><td>${signed(p.recovered)}</td><td>${number(p.total)} / ${number(p.max)}</td></tr>`;
  }).join('')}</tbody></table>`:'<p>本期尚无已公布的作业成绩。</p>'}`;
}

export function reportPanels(report,facts,state={}){
  const items={...selectedItems(facts,state.ai,state.edits),...teacherTasks(state.tasks||[],report.at)};
  return {swot:['S','W','O','T'].map(k=>analysisCard(k,items[k],report)).join(''),tasks:['now','plan','quick','later'].map(k=>analysisCard(k,items[k],report)).join(''),
    opening:publicOpening(state.opening)||recordOpening(facts.opening),openingSource:state.opening?'':'学习记录摘要',works:evidenceTable(report,items),revision:state.revision||0,hasAI:Boolean(state.hasAI)};
}

export async function renderStudentReport(report,facts=buildReportAnalysis(report),state={}){
  const [base,mobile,paper]=await styles,courses=report.courses,note=report.latestNote;
  const reportTitle=courses.every(c=>!subjectInfo(c.course)||subjectInfo(c.course).family==='economics')?'经济学学习报告':'学习报告';
  const scope=[report.period,report.unit,report.assignmentTitle].filter(Boolean).join(' · ');
  const panels=reportPanels(report,facts,state);
  const exhibit=(title,fig)=>`<article class="card figure"><div class="cardhead"><h2>${title}</h2>${fig===trendFigure?'<small class="legend">┄ 首次　━ 最终</small>':'<small>1–5 档</small>'}</div><div class="${fig===trendFigure?'trends':'radars'}">${courses.map(c=>'<section class="exhibits '+c.course+'"><h3>'+html(c.label)+'</h3>'+fig(c,true)+'</section>').join('')}</div></article>`;
  const activity=courses.flatMap(c=>{
    const entries=[];
    if(c.errors)entries.push('共 '+c.errors+' 道错题，'+(c.verified||0)+' 道订正通过，'+(c.pending||0)+' 道待订正，'+(c.waiting||0)+' 道待验收。');
    const mock=c.mockHistory?.[0];
    if(report.includeMock&&mock)entries.push('自主模考 '+c.mockHistory.length+' 次。最近一次正确率 '+rate(mock.rate)+(Number.isFinite(mock.seconds)?'，用时 '+Math.floor(mock.seconds/60)+' 分 '+Math.floor(mock.seconds%60)+' 秒':'')+'。');
    return entries.length?['<article class="card notes '+c.course+'"><h3>'+html(c.label)+'学习记录</h3><p>'+html(entries.join(''))+'</p></article>']:[];
  });
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${html(report.name)} · ${reportTitle} · ${date(report.at)}</title><style>${base}</style><style id="report-mobile" media="screen and (max-width:700px)">${mobile}</style><style id="report-paper" media="print">${paper}</style><script defer src="/teacher/student-report-actions.js?v=opening1"></script></head><body><main data-version="${facts.version}" data-revision="${panels.revision}" data-ai="${panels.hasAI?'ready':(facts.opening.length||Object.values(facts.candidates).some(a=>a.length))?'available':'empty'}">
    <div class="strap"><b>Mike <span>经济一页通</span></b><nav class="actions"><button id="save">下载网页</button><button id="print">打印 / PDF</button></nav></div>
    <header class="header"><div class="identity"><h1>${reportTitle}</h1><div><strong>${html(report.name)}</strong><span class="classes">${report.classNames.map(n=>'<i>'+html(n)+'</i>').join(' · ')||'班级待确认'}</span></div></div><div class="dateline"><time>${date(report.at)}</time><b>${html(scope)}</b></div></header>
    <section class="opening" aria-labelledby="opening-title"><div><h2 id="opening-title">阶段评语</h2><small id="opening-source">${panels.openingSource}</small></div><p id="opening-text">${html(panels.opening)}</p>
      <div class="actions ai-state" role="status"><span id="status"></span><button id="retry" hidden>重新整理分析</button></div></section>
    <section class="overview">${courses.map(summary).join('')||'<p>当前范围暂无学习记录。</p>'}</section>
    ${courses.length?'<section class="figures">'+exhibit('技能分布',radarFigure)+exhibit('作业得分率',trendFigure)+'</section>':''}
    <section class="tasksection"><div class="secthead"><h2>下一步怎么做</h2><i></i><button type="button" id="add-task" class="online-only" ${courses.length?'':'hidden'}>补充任务</button><small class="paper-label">任务优先级</small></div><div class="tasks" id="tasks">${panels.tasks}</div></section>
    <section class="swsection"><div class="secthead"><h2>学习诊断</h2><i></i><small>SWOT</small></div><div class="swot" id="swot">${panels.swot}</div></section>
    <section class="card evidence" id="works">${panels.works}</section>
    ${activity.length?'<div class="activities">'+activity.join('')+'</div>':''}
    ${note?'<aside class="card notes teacher-note"><h3>老师的话</h3><p>'+html(note.headline)+'</p>'+(note.nextSteps||[]).map(s=>'<p>'+html(s.text)+'</p>').join('')+'</aside>':''}
    <footer class="foot"><span>课堂五档为校内学习参考。作业均分仅计已公布成绩，含零分，缺分留空。${courses.some(c=>Number.isFinite(c.trend))?'¹ 最近三份已出分作业与此前三份比较。':''}</span><b id="source">${panels.hasAI?'AI 辅助分析':'按学习记录整理'}</b></footer>
    </main><dialog id="proof-dialog" aria-labelledby="proof-title"><header><h2 id="proof-title"></h2><button id="close">关闭</button></header><p id="reading"></p><h3>学习依据</h3><div id="basis"></div><div class="online-only"><button id="edit">修改措辞</button><form id="edit-form" hidden><label>教师评语<textarea maxlength="160" rows="3" id="comment"></textarea></label><button type="submit">保存评语</button><span role="status" id="edit-status"></span></form><button id="remove-task" hidden>移除这项提醒</button></div></dialog>
    <dialog id="task-dialog" class="online-only" aria-labelledby="task-title"><header><h2 id="task-title">补充学习任务</h2><button id="close-task">关闭</button></header><form id="task-form"><label>学科<select name="course">${courses.map(c=>'<option value="'+html(c.course)+'">'+html(c.label)+'</option>').join('')}</select></label><label>任务<input name="title" maxlength="40" required></label><label>说明<textarea name="text" maxlength="160" rows="2"></textarea></label><label>重要程度<select name="priority"><option value="important">重要</option><option value="normal">非重要</option></select></label><label>办理时间（上海，可留空）<input type="datetime-local" name="due"></label><p>48 小时内的任务将列为紧急。同一象限显示一项教师任务。</p><button type="submit">保存任务</button><small role="status"></small></form></dialog></body></html>`;
}
