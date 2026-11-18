import {scoreBand} from './score-bands.js';

export function topicGrid(topics, h, {mine = false} = {}) {
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
  return `<div class="topic-map"><p class="topic-legend">填充高度 · ${mine?'已答比例':'参与覆盖率'}　颜色 · 正确率</p>${[...subjects.entries()].map(([course,units])=>
    `<section class="topic-subject">${!mine?`<h3>${course==='macro'?'AP 宏观':course==='micro'?'AP 微观':'其他学科'}</h3>`:''}${[...units.entries()].sort(([a],[b])=>order(a,b)).map(([unit,ts])=>
      `<div class="topic-unit"><strong>${h(unit)}</strong><div class="topic-tiles">${ts.sort((a,b)=>order(a.label,b.label)).map(t=>{
        const coverage=t.roster?Math.min(100,Math.round(t.participants/t.roster*100)):null;
        const rate=scoreBand(t.total?t.correct/t.total*100:null);
        return `<details class="topic-cell"><summary data-band="${rate?.level||'none'}" style="--coverage:${coverage??0}%" aria-label="${h(t.title||t.label)} · ${rate?rate.value+'% 正确':'无样本'}"><span>${h(t.label)}</span></summary><div class="topic-facts"><strong>${h(t.title||t.label)}</strong><div>${mine?'已答':'参与覆盖'} ${coverage===null?'暂无':t.participants+'/'+t.roster+' · '+coverage+'%'}</div><div>正确率 ${rate?rate.value+'% · '+t.correct+'/'+t.total:'暂无样本'}</div></div></details>`;
      }).join('')}</div></div>`).join('')}</section>`).join('')}</div>`;
}

export function bindTopicGrid(root) {
  root.addEventListener('toggle',event=>{
    const active=event.target;
    if(active.matches?.('.topic-cell[open]'))for(const cell of root.querySelectorAll('.topic-cell[open]'))if(cell!==active)cell.open=false;
  },true);
}
