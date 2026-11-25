import {questionSlices,bindSliceRetries} from './question-slices.js';
// Assignment and mock sessions pass the same student-visible question model here.
export function questionView(q, h, {number, zoom = false, textOpen = false, label = ''}) {
  const options = (q.options || q.optionLabels || []).map(o => typeof o === 'string'
    ? {label:o,text:q.optionText?.[o] || ''} : o);
  const images = q.questionImages || [];
  const hasText = Boolean(q.prompt || options.some(o => o.text));
  const text = `<p class="mcq-question-text">${h(q.prompt || '')}</p>${options.filter(o => o.text).map(o => `<p>${h(o.label)}. ${h(o.text)}</p>`).join('')}`;
  // Text is the only source of written choices when there are no facsimile slices.
  const paper = questionSlices(images,'第 '+h(number)+' 题');
  return {
    tools:`<div class="mcq-toolbar question-view-toolbar"><strong id="mcq-question-heading" tabindex="-1">${h(label || '第 '+number+' 题')}</strong><div class="question-tools" role="group" aria-label="题面工具"><button type="button" id="mcq-flag">⚑ 标记</button><button type="button" id="mcq-zoom" ${images.length?'':'hidden'} aria-pressed="${zoom}">${zoom?'适应宽度':'放大题面'}</button><button type="button" id="mcq-text" ${images.length&&hasText?'':'hidden'} aria-expanded="${textOpen}" aria-controls="mcq-accessible">文字版</button></div></div>`,
    paper:`<div class="mcq-paper question-paper ${zoom?'zoom':''}">${paper || text}</div><section id="mcq-accessible" class="mcq-card" ${textOpen?'':'hidden'}>${text}</section>`,
    choices:q.type === 'short' ? '' : `<div class="mcq-choice-row"><span>我的答案 <small>⊖ 排除</small></span><div class="mcq-letters" role="radiogroup" aria-label="选择答案">${options.map(o=>`<div class="answer-pair"><button type="button" role="radio" aria-label="选项 ${h(o.label)}${o.text?' '+h(o.text):''}" data-choice="${h(o.label)}"><span>${h(o.label)}</span>${o.text ? `<small>${h(o.text)}</small>` : ''}</button><button type="button" class="strike-dot" data-strike="${h(o.label)}" aria-label="排除选项 ${h(o.label)}" title="排除或恢复 ${h(o.label)}">⊖</button></div>`).join('')}</div></div>`,
  };
}

export function answerNavigation({choice, first, last}) {
  return `<div class="mcq-toolbar answer-navigation" aria-label="答题导航">${choice?'<button id="mcq-clear" type="button" title="清除本题答案">清除</button>':''}<button id="mcq-prev" type="button" data-prev ${first?'disabled':''}>上一题</button><button id="mcq-palette" type="button" data-palette aria-label="打开答题卡">题号</button><button id="mcq-next" type="button" data-next class="primary">${last?'检查并交卷':'下一题'}</button></div>`;
}

export function bindQuestionPaper(root, marker, {view = {}, changed = () => {}, firstTextKey = 'text-0'} = {}) {
  const paper = root.querySelector('.question-paper');
  const text = root.querySelector('#mcq-accessible');
  const zoom = root.querySelector('#mcq-zoom');
  const textButton = root.querySelector('#mcq-text');
  marker.attachImages(paper);
  [...paper.querySelectorAll('p'),...text.querySelectorAll('p')].forEach((el,i)=>marker.attachText(el,i===0?firstTextKey:'text-'+i));
  zoom.onclick = () => {
    const active=paper.classList.toggle('zoom');
    zoom.setAttribute('aria-pressed',String(active));
    zoom.textContent=active?'适应宽度':'放大题面';
    changed();
  };
  textButton.onclick = () => {
    text.hidden=!text.hidden;
    textButton.setAttribute('aria-expanded',String(!text.hidden));
    changed();
  };
  paper.ondblclick=()=>{if(!zoom.hidden && root.querySelector('.question-pen').getAttribute('aria-pressed')!=='true')zoom.click();};
  let interacted=false;
  for(const event of ['wheel','touchstart','pointerdown','keydown'])paper.addEventListener(event,()=>{interacted=true;},{passive:true});
  const restore=()=>{
    if(paper.isConnected&&!interacted){paper.scrollLeft=view.x||0;paper.scrollTop=view.y||0;}
  };
  bindSliceRetries(paper,restore);
  restore();
  return paper;
}

export const questionIndexMarkup = `<div class="mcq-toolbar mcq-palette-filters" role="group" aria-label="筛选题号"><button type="button" data-filter="all">全部</button><button type="button" data-filter="missing">未答</button><button type="button" data-filter="flagged">已标记</button></div><div class="mcq-palette"></div>`;

export function bindQuestionIndex(dialog, {questions, index, answered, flags, jump}) {
  function paint(filter) {
    for (const button of dialog.querySelectorAll('[data-filter]')) button.setAttribute('aria-pressed',String(button.dataset.filter===filter));
    dialog.querySelector('.mcq-palette').innerHTML=questions.map((q,i)=>{
      const done=answered(q), marked=flags.has(q.id);
      if((filter==='missing'&&done)||(filter==='flagged'&&!marked))return '';
      return `<button type="button" data-index="${i}" aria-current="${i===index?'step':'false'}" class="${done?'answered':''} ${marked?'flagged':''}" aria-label="第 ${i+1} 题 · ${done?'已答':'未答'}${marked?' · 已标记':''}">${i+1}</button>`;
    }).join('')||'<p>没有符合的题目</p>';
    for (const button of dialog.querySelectorAll('[data-index]')) button.onclick=()=>jump(Number(button.dataset.index));
  }
  for (const button of dialog.querySelectorAll('[data-filter]')) button.onclick=()=>paint(button.dataset.filter);
  paint('all');
}
