import {courseLabel as displayCourse} from './course-scope.js';
import {scoreBand} from './score-bands.js';

export function topicGrid(topics, h, {mine = false, personal = false} = {}) {
  const subjects = new Map();
  for (const topic of topics) {
    const unit = /^\d+/.exec(topic.label)?.[0];
    const subject = subjects.get(topic.course) || new Map();
    const label = unit ? 'Unit '+unit : '其他';
    const values = subject.get(label) || [];
    values.push(topic);
    subject.set(label,values);
    subjects.set(topic.course,subject);
  }
  const order=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
  return `<div class="topic-map"><p class="topic-legend">填充高度 · ${personal?'已作答 ÷ 可计分题次':mine?'已答比例':'参与覆盖率'}　颜色 · 正确率</p>${[...subjects.entries()].map(([course,units])=>
    `<section class="topic-subject">${!mine?`<h3>${displayCourse(course)}</h3>`:''}${[...units.entries()].sort(([a],[b])=>order(a,b)).map(([unit,ts])=>
      `<div class="topic-unit"><strong>${h(unit)}</strong><div class="topic-tiles">${ts.sort((a,b)=>order(a.label,b.label)).map(t=>{
        const coverage=personal?(t.samples?Math.round(t.answered/t.samples*100):null):t.roster?Math.min(100,Math.round(t.participants/t.roster*100)):null;
        const rate=scoreBand(t.total?t.correct/t.total*100:null);
        const topicStatus=rate?rate.value+'% 正确':personal&&!t.seen?'未练习':'无样本';
        const stats=personal
          ? `<div>已作答 ${t.answered}/${t.samples} · ${coverage===null?'—':coverage+'%'}</div><div>题次 ${t.seen} · 可计分 ${t.samples}${t.samples>0&&t.samples<5?' · 样本少':''}</div>${t.last?`<div>最近 ${h(t.lastLabel||t.last.slice(0,10))}</div>`:''}`
          : `<div>${mine?'已答':'参与覆盖'} ${coverage===null?'暂无':t.participants+'/'+t.roster+' · '+coverage+'%'}</div>`;
        const actions=personal?`<div class="mock-topic-actions">${t.seen?`<button type="button" data-mock-topic="${h(t.course+':'+t.label)}">查相关模考</button>`:''}${t.bookself?`<a href="${h(t.bookself)}" target="_blank" rel="noopener">复习教材 ↗</a>`:''}</div>`:'';
        return `<details class="topic-cell"><summary data-band="${rate?.level||'none'}" style="--coverage:${coverage??0}%" aria-label="${h(t.title||t.label)} · ${topicStatus}"><span>${h(t.label)}</span></summary><div class="topic-facts"><strong>${h(t.title||t.label)}</strong>${stats}<div>正确率 ${rate?rate.value+'% · '+t.correct+'/'+t.total:topicStatus}</div>${actions}</div></details>`;
      }).join('')}</div></div>`).join('')}</section>`).join('')}</div>`;
}

export function bindTopicGrid(root) {
  root.addEventListener('toggle',event=>{
    const active=event.target;
    if(active.matches?.('.topic-cell[open]'))for(const cell of active.closest('.topic-map').querySelectorAll('.topic-cell[open]'))if(cell!==active)cell.open=false;
  },true);
}
