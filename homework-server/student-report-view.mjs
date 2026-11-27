import {subjectInfo} from '../homework/subject-catalog.js';
import {publicOpening,recordOpening} from './student-report-opening.mjs';
import {readFile} from 'node:fs/promises';
import {resultParts} from './student-report.mjs';
import {courseCharts,recoveryLift} from './report-charts.mjs';
import {html} from './student-report-figures.mjs';
import {buildReportAnalysis,selectedItems,teacherTasks} from './student-report-analysis.mjs';

const css=file=>readFile(new URL(file,import.meta.url),'utf8');
const styles=Promise.all(['./student-report.css','./student-report-mobile.css','../homework/report-progress.css'].map(css));
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
  const lift=recoveryLift(c);
  const note=recovered.length?'已核实补回 '+sum+' 分':'暂无可核实的补分';
  return `<article class="card summary ${html(c.course)}"><h2 class="subj">${html(c.label)}</h2><div class="rr-stats">
    <div><small>课堂表现</small><strong>${index?number(index.level)+' 档':'待积累'}</strong></div>
    <div><small>作业均分</small><strong class="average">${rate(c.average)}</strong></div>
    <div><small>订正提升</small><strong>${lift===null?'—':signed(lift)+' <em>个百分点</em>'}</strong><small>${note}</small></div>
    <div><small>已出分</small><strong>${c.graded} <em>/ ${c.cells.length} 份</em></strong></div></div>
    ${Number.isFinite(c.trend)?'<small>近期变化¹　'+signed(c.trend)+' 个百分点</small>':''}</article>`;
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

export function reportPanels(report,facts,state={}){
  const items={...selectedItems(facts,state.ai,state.edits),...teacherTasks(state.tasks||[],report.at)};
  return {swot:['S','W','O','T'].map(k=>analysisCard(k,items[k],report)).join(''),tasks:['now','plan','quick','later'].map(k=>analysisCard(k,items[k],report)).join(''),
    opening:publicOpening(state.opening)||recordOpening(facts.opening),openingSource:state.opening?'':'学习记录摘要',revision:state.revision||0,hasAI:Boolean(state.hasAI)};
}

export async function renderStudentReport(report,facts=buildReportAnalysis(report),state={}){
  const [base,mobile,charts]=await styles,courses=report.courses,note=report.latestNote;
  const reportTitle=courses.every(c=>!subjectInfo(c.course)||subjectInfo(c.course).family==='economics')?'经济学学习报告':'学习报告';
  const scope=[report.period,report.unit,report.assignmentTitle].filter(Boolean).join(' · ');
  const panels=reportPanels(report,facts,state);
  const reportDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date(report.at));
  const filename=[report.name,report.classNames.join('＋')||'历史班级',reportDate].join('-').replace(/[\x00-\x1f\/\\:*?"<>|]/g,'-')+'.png';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${html(report.name)} · ${reportTitle} · ${date(report.at)}</title><style>${base}</style><style id="report-mobile" media="screen and (max-width:700px)">${mobile}</style><style>${charts}
.rr-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:7px 0}.rr-stats>div+div{border-left:1px solid #cbd6d2;padding-left:10px}.rr-stats strong,.rr-stats small{display:block}.rr-stats strong{font:600 24px Georgia,serif;color:#153d51}.rr-stats em{font:500 12px sans-serif}.rr-stats small{font-size:11px}@media(max-width:560px){.rr-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.rr-stats>div:nth-child(3){border:0;padding:0}}
.report-course{margin:14px 0}.report-course>.summary{margin-bottom:8px}.report-course .summary .stats{display:flex;flex-wrap:wrap;gap:16px}.report-course .totals{display:block}.report-course .totals>span,.report-course .totals>small{display:block}main{display:block;width:min(1040px,100%)}.actions #save{background:#193d50;color:white}.report-export{margin:0;width:1040px;max-width:none}.report-export .rr-tape,.report-export .rr-weak-row{flex-wrap:wrap;overflow:visible}.report-export .rr-unit{flex:0 1 auto}.report-export .rr-weak-row .rr-weak{flex:1}.report-export .rr-cell{min-width:20px;min-height:34px}.report-export .rr-pair{grid-template-columns:1.35fr 1fr}.report-export .actions,.report-export .online-only,.report-export .paper-label{display:none!important}.report-export .proof{color:inherit}</style><script defer src="/teacher/student-report-actions.js?v=long1"></script></head><body><main data-filename="${html(filename)}" data-version="${facts.version}" data-revision="${panels.revision}" data-ai="${panels.hasAI?'ready':(facts.opening.length||Object.values(facts.candidates).some(a=>a.length))?'available':'empty'}">
    <div class="strap"><b>Mike <span>经济一页通</span></b><nav class="actions"><button type="button" id="save">保存长图</button></nav></div>
    <header class="header"><div class="identity"><h1>${reportTitle}</h1><div><strong>${html(report.name)}</strong><span class="classes">${report.classNames.map(n=>'<i>'+html(n)+'</i>').join(' · ')||'班级待确认'}</span></div></div><div class="dateline"><time>${date(report.at)}</time><b>${html(scope)}</b></div></header>
    <section class="opening" aria-labelledby="opening-title"><div><h2 id="opening-title">阶段评语</h2><small id="opening-source">${panels.openingSource}</small></div><p id="opening-text">${html(panels.opening)}</p>
      <div class="actions ai-state" role="status"><span id="status"></span><button id="retry" hidden>重新整理分析</button></div></section>
    ${courses.map(c=>'<section class="report-course" data-course="'+html(c.course)+'">'+summary(c)+(c.cells.length||c.mockHistory?.length||c.exams?.length?courseCharts(c,{includeMock:report.includeMock!==false}):'<p class="rr-empty">本期尚无作业或模考记录。</p>')+'</section>').join('')||'<p>当前范围暂无学习记录。</p>'}
    <section class="tasksection"><div class="secthead"><h2>下一步怎么做</h2><i></i><button type="button" id="add-task" class="online-only" ${courses.length?'':'hidden'}>补充任务</button><small class="paper-label">任务优先级</small></div><div class="tasks" id="tasks">${panels.tasks}</div></section>
    <section class="swsection"><div class="secthead"><h2>学习诊断</h2><i></i><small>SWOT</small></div><div class="swot" id="swot">${panels.swot}</div></section>
    ${note?'<aside class="card notes teacher-note"><h3>老师的话</h3><p>'+html(note.headline)+'</p>'+(note.nextSteps||[]).map(s=>'<p>'+html(s.text)+'</p>').join('')+'</aside>':''}
    <footer class="foot"><span>课堂五档为校内学习参考。作业均分仅计已公布成绩，含零分，缺分留空。${courses.some(c=>Number.isFinite(c.trend))?'¹ 最近三份已出分作业与此前三份比较。':''}</span><b id="source">${panels.hasAI?'AI 辅助分析':'按学习记录整理'}</b></footer>
    </main><dialog id="proof-dialog" aria-labelledby="proof-title"><header><h2 id="proof-title"></h2><button id="close">关闭</button></header><p id="reading"></p><h3>学习依据</h3><div id="basis"></div><div class="online-only"><button id="edit">修改措辞</button><form id="edit-form" hidden><label>教师评语<textarea maxlength="160" rows="3" id="comment"></textarea></label><button type="submit">保存评语</button><span role="status" id="edit-status"></span></form><button id="remove-task" hidden>移除这项提醒</button></div></dialog>
    <dialog id="task-dialog" class="online-only" aria-labelledby="task-title"><header><h2 id="task-title">补充学习任务</h2><button id="close-task">关闭</button></header><form id="task-form"><label>学科<select name="course">${courses.map(c=>'<option value="'+html(c.course)+'">'+html(c.label)+'</option>').join('')}</select></label><label>任务<input name="title" maxlength="40" required></label><label>说明<textarea name="text" maxlength="160" rows="2"></textarea></label><label>重要程度<select name="priority"><option value="important">重要</option><option value="normal">非重要</option></select></label><label>办理时间（上海，可留空）<input type="datetime-local" name="due"></label><p>48 小时内的任务将列为紧急。同一象限显示一项教师任务。</p><button type="submit">保存任务</button><small role="status"></small></form></dialog></body></html>`;
}
