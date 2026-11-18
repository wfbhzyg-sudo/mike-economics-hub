import {topicGrid} from './topic-grid.js';
import {courseLabel} from './course-scope.js';
import {accuracyBadge} from './score-bands.js';
import {resultBadge} from './result-badge.js';

const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const part = encodeURIComponent;
const date = new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'short',hourCycle:'h23'});
const time = value => Number.isFinite(Date.parse(value)) ? date.format(new Date(value)) : '—';
const duration = value => Number.isFinite(value) && value >= 0 ? Math.floor(value/60)+' 分 '+Math.floor(value%60)+' 秒' : '—';
const pct = value => Number.isFinite(value) ? value + '%' : '—';
const points = (total,max) => (total ?? '—') + ' / ' + (max ?? '—');
const topicKey = (course,topic) => course + ':' + (topic || '未分章节');
const NAV_FILTERS = [['','全部交卷'],['loss','有失分题'],['uncorrected','有待订正']];
const SUMMARY = [['current','当前筛选'],['all','全部授权历史']];

function attemptCard(a) {
  const compare = a.comparison;
  const delta = compare && (compare.change>0?'+'+compare.change:compare.change) + ' pp';
  return `<button type="button" class="mock-history-card" data-mock-attempt="${html(a.id)}" aria-haspopup="dialog" aria-expanded="false">
    <span class="mock-card-head"><time datetime="${html(a.submittedAt)}">${html(time(a.submittedAt))}</time><span aria-hidden="true">↗</span></span>
    <small>${html(courseLabel(a.course))} · ${a.questionCount} 题</small>
    <span class="mock-card-score">${accuracyBadge(a.percent)}<span>${html(points(a.total,a.max))}</span></span>
    <span>用时 ${html(duration(a.duration))} · ${a.auto?'到时交卷':a.timerMode==='countdown'?'倒计时':'正计时'}</span>
    <span>失分 ${a.losses} · 未答 ${a.unanswered}${a.pending?' · 缺计分 '+a.pending:''}</span>
    ${compare?`<small title="同科上一次 ${compare.previousCount} 题">较上次 ${html(delta)} · 上次 ${compare.previousCount} 题</small>`:''}
    ${a.matched!==null?`<small>命中 ${a.matched} 题</small>`:''}
    ${a.losses?`<small>${a.corrected} / ${a.losses} 题已有订正</small>`:''}
  </button>`;
}

function renderQuestion(q, original, attempt, open) {
  const summary = q.foundScore ? resultBadge({...q,unanswered:!q.chosen}) : '<span class="question-result-badge" data-result="neutral">缺少有效计分</span>';
  const files = q.questionImages?.length ? q.questionImages : original?.questionImages || [];
  const optionText = {...original?.optionText,...q.optionText};
  const labels = q.optionLabels?.length ? q.optionLabels : original?.optionLabels || [];
  const choice = value => value ? value+(optionText[value]?' · '+optionText[value]:'') : '—';
  const saved = q.corrections || [];
  return `<details class="mock-paper-question" ${open?'open':''}><summary><strong>第 ${q.index} 题${q.topic?' · '+html(q.topic):''}</strong>${summary}</summary>
    <div class="mock-question-body">
      <div class="mock-review-answers"><div><small>学生选择</small><strong>${html(q.chosen?choice(q.chosen):'未作答')}</strong></div><div><small>正确选项</small><strong>${html(q.correctOption?choice(q.correctOption):'暂无可靠答案')}</strong></div></div>
      ${q.prompt||original?.prompt?`<p>${html(q.prompt||original.prompt)}</p>`:''}
      ${files.length?`<div class="mock-question-tools"><button type="button" data-mock-zoom aria-pressed="false">放大原题</button></div><div class="mock-question-images">${files.map((file,i)=>`<figure><img loading="lazy" decoding="async" src="/api/homework/files/${part(file)}?mock=${part(attempt.id)}" alt="第 ${q.index} 题原题片段 ${i+1} / ${files.length}"><button type="button" data-mock-img-retry hidden>图片加载失败 · 重试</button></figure>`).join('')}</div>`:!q.prompt&&!original?.prompt?'<p class="hint">原题资料暂不可查看</p>':''}
      ${labels.some(label=>optionText[label])?`<ul class="mock-option-text">${labels.map(label=>`<li><b>${html(label)}.</b> ${html(optionText[label]||'')}</li>`).join('')}</ul>`:''}
      ${saved.length?`<details class="mock-saved-corrections"><summary>有订正 · ${saved.length} 条</summary>${saved.map(item=>`<p><small>${html(time(item.createdAt))}</small> ${html(item.text||'已提交订正')}</p>`).join('')}</details>`:q.loss?'<p class="hint">待订正</p>':''}
    </div></details>`;
}

export function createMockStudentDetail({table, api, filters}) {
  const viewport=table.closest('.mock-table-scroll');
  const events=new AbortController();
  const signal=events.signal;
  const narrow=matchMedia('(max-width: 700px)');
  let row,slot,region,origin,historyController,attemptController,bubble,anchor,bubbleEvents,historyData;
  let scope='current',focusTopic='',focusQuestion='',historyFilter='',view='chapters';
  const measure=()=>viewport.style.setProperty('--mock-drawer-width',viewport.clientWidth+'px');
  const observer=new ResizeObserver(measure);observer.observe(viewport);measure();

  function keepScroll(change,nextRow=row) {
    const top=nextRow?.getBoundingClientRect().top;
    const scroll=viewport.scrollTop,left=viewport.scrollLeft;
    change();
    viewport.scrollLeft=left;
    viewport.scrollTop=scroll;
    if(top==null||!nextRow?.isConnected)return;
    const delta=nextRow.getBoundingClientRect().top-top;
    if(Math.abs(delta)>1){
      if(getComputedStyle(viewport).overflowY==='auto')viewport.scrollTop+=delta;
      else window.scrollBy(0,delta);
    }
  }
  function closeBubble(restore=false) {
    const last=anchor;
    attemptController?.abort();
    bubbleEvents?.abort();
    if (last?.isConnected) last.setAttribute('aria-expanded','false');
    const previous=bubble;
    bubble=null;anchor=null;
    if(previous instanceof HTMLDialogElement && previous.open)previous.close();
    previous?.remove();
    if(restore&&last?.isConnected)last.focus({preventScroll:true});
  }
  function unsetRow() {
    closeBubble();
    historyController?.abort();
    row?.removeAttribute('data-expanded');
    origin?.setAttribute('aria-expanded','false');
    slot?.remove();
    row=slot=region=origin=null;
    historyData=null;
  }
  function selectView(value) {
    view=value;
    region.dataset.view=value;
    region.querySelectorAll('[data-personal-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.personalView===value)));
    if(value!=='history')closeBubble();
  }

  function openStudent(next) {
    if(row===next){keepScroll(unsetRow);return;}
    keepScroll(()=>{
      unsetRow();
      row=next;origin=row.querySelector('[data-student]');
      const id=origin.getAttribute('aria-controls');
      origin.setAttribute('aria-expanded','true');row.setAttribute('data-expanded','');
      scope='current';focusTopic='';focusQuestion='';historyFilter='';view='chapters';
      slot=document.createElement('tr');slot.className='mock-record-row';
      const cell=slot.insertCell();cell.colSpan=row.cells.length;
      cell.innerHTML=`<section class="mock-personal" id="${html(id)}" aria-label="${html(origin.textContent.trim())}的自主模考详情" data-view="chapters">
        <div class="mock-personal-top"><strong>个人模考表现</strong><div class="mock-scope-actions" role="group" aria-label="个人统计范围">${SUMMARY.map(([key,label])=>`<button type="button" data-history-scope="${key}" aria-pressed="${key==='current'}">${label}</button>`).join('')}</div><small data-history-count role="status"></small></div>
        <div class="mock-detail-views" role="group" aria-label="个人详情视图"><button type="button" data-personal-view="chapters" aria-pressed="true">章节表现</button><button type="button" data-personal-view="history" aria-pressed="false">历史模考</button></div>
        <div class="mock-personal-grid">
          <section class="mock-personal-chapters"><h3>章节表现</h3><div data-personal-chapters></div></section>
          <section class="mock-personal-history"><div class="mock-history-head"><h3>历史模考</h3><div class="mock-history-controls"><button type="button" data-track-step="-1" aria-label="查看较新试卷">‹</button><button type="button" data-track-step="1" aria-label="查看较早试卷">›</button></div></div>
            <div class="mock-history-filters"><select aria-label="筛选交卷" data-attempt-filter>${NAV_FILTERS.map(([v,label])=>`<option value="${v}">${label}</option>`).join('')}</select><button type="button" data-clear-topic hidden></button></div>
            <p data-history-status role="status"></p><div class="mock-history-track" tabindex="0" role="region" aria-label="历史模考，左新右旧"></div>
            <button type="button" data-more-history hidden>更多历史</button>
          </section>
        </div></section>`;
      region=cell.firstElementChild;
      row.after(slot);
      region.onclick=onDetailClick;
      region.onchange=e=>{
        if(e.target.matches('[data-attempt-filter]')){historyFilter=e.target.value;void loadHistory();}
      };
      void loadHistory();
    },next);
  }

  function scopeParams(cursor) {
    const params=filters();
    params.set('history',scope);
    if(focusTopic)params.set('focusTopic',focusTopic);
    if(focusQuestion)params.set('focusQuestion',focusQuestion);
    if(historyFilter)params.set('historyFilter',historyFilter);
    if(cursor)params.set('cursor',cursor);
    return params;
  }

  function paintHistory(data,append) {
    const count=region.querySelector('[data-history-count]');
    count.textContent=`当前筛选 ${data.currentCount} 次 · 全部授权 ${data.authorizedCount} 次`;
    const track=region.querySelector('.mock-history-track'), status=region.querySelector('[data-history-status]');
    const clear=region.querySelector('[data-clear-topic]');
    clear.hidden=!focusTopic&&!focusQuestion;
    clear.textContent=focusQuestion?'已筛重复失分题 ×':focusTopic?focusTopic.replace(/^micro:/,'微观 ').replace(/^macro:/,'宏观 ')+' ×':'';
    status.textContent=data.matchedCount?`${data.matchedCount} 次交卷 · 左新右旧`:'此范围暂无交卷';
    if(append)track.insertAdjacentHTML('beforeend',data.attempts.map(attemptCard).join(''));
    else{track.innerHTML=data.attempts.map(attemptCard).join('');track.scrollLeft=0;}
    region.querySelector('[data-more-history]').hidden=!data.next;
    region.querySelectorAll('[data-track-step]').forEach(b=>b.disabled=!data.matchedCount);
  }

  function paintChapters(data) {
    const target=region.querySelector('[data-personal-chapters]');
    const chapters=data.chapters.map(t=>({...t,lastLabel:t.last?time(t.last):''}));
    const weak=chapters.filter(t=>t.samples>=5&&t.total>0&&t.correct/t.total<.6)
      .sort((a,b)=>a.correct/a.total-b.correct/b.total||b.losses-a.losses).slice(0,3);
    target.innerHTML=`${weak.length?`<div class="mock-weak"><span>优先复习</span><div>${weak.map(t=>`<button type="button" data-mock-topic="${html(topicKey(t.course,t.label))}">${html(courseLabel(t.course)+' '+t.label)} ${accuracyBadge(100*t.correct/t.total)}<small>${t.correct}/${t.total} 正确</small></button>`).join('')}</div></div>`:''}
      ${chapters.length?topicGrid(chapters,html,{personal:true}):'<p class="hint">暂无章节表现</p>'}
      ${data.repeated.length?`<details class="mock-repeat"><summary>重复失分 · ${data.repeated.length} 项</summary>${data.repeated.map(item=>`<button type="button" data-mock-topic="${html(item.topicKey)}" data-repeat-question="${html(item.questionId)}">${html(courseLabel(item.course)+' '+item.label)} · 同题失分 ${item.count} 次 ›</button>`).join('')}</details>`:''}`;
  }

  async function loadHistory(cursor='',repaint=true) {
    closeBubble();
    historyController?.abort();
    const controller=historyController=new AbortController();
    const status=region.querySelector('[data-history-status]');
    const more=region.querySelector('[data-more-history]');
    const track=region.querySelector('.mock-history-track');
    status.textContent='正在读取个人记录…';more.disabled=true;
    if(cursor)more.textContent='正在加载…';
    else {track.replaceChildren();more.hidden=true;}
    if(repaint&&!cursor)region.querySelector('[data-personal-chapters]').textContent='正在读取章节表现…';
    try {
      const data=await api('mock-stats/students/'+part(row.dataset.rosterStudent)+'?'+scopeParams(cursor),{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(25000)])});
      if(controller.signal.aborted||!region?.isConnected)return;
      historyData=data;
      if(repaint&&!cursor)paintChapters(data);
      paintHistory(data,Boolean(cursor));
    }catch(error){
      if(controller.signal.aborted||!region?.isConnected)return;
      status.textContent=error.message+' ';
      const retry=document.createElement('button');retry.type='button';retry.textContent='重试';
      retry.onclick=()=>void loadHistory(cursor,repaint);status.append(retry);
      if(repaint&&!cursor){
        const chapters=region.querySelector('[data-personal-chapters]');
        chapters.textContent='章节表现读取失败。';
        const retryChapters=retry.cloneNode(true);retryChapters.onclick=retry.onclick;chapters.append(retryChapters);
      }
    }finally{
      if(!controller.signal.aborted&&region?.isConnected){more.disabled=false;more.textContent='更多历史';}
    }
  }

  function onDetailClick(event) {
    const button=event.target.closest('button');
    if(!button)return;
    const d=button.dataset;
    if(d.historyScope&&d.historyScope!==scope){
      scope=d.historyScope;focusTopic='';focusQuestion='';
      region.querySelectorAll('[data-history-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      void loadHistory();return;
    }
    if(d.personalView){selectView(d.personalView);return;}
    if(d.mockTopic){
      focusTopic=d.mockTopic;focusQuestion=d.repeatQuestion||'';
      selectView('history');
      region.querySelector('.mock-history-track').focus({preventScroll:true});
      void loadHistory('',false);return;
    }
    if('clearTopic' in d){focusTopic=focusQuestion='';void loadHistory('',false);return;}
    if(d.trackStep){
      const track=region.querySelector('.mock-history-track');
      track.scrollBy({left:Number(d.trackStep)*Math.max(180,track.clientWidth*.8),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      return;
    }
    if('moreHistory' in d&&historyData?.next){void loadHistory(historyData.next,false);return;}
    if(d.mockAttempt)void openAttempt(button);
  }

  function showBubble(button) {
    const mobile=narrow.matches;
    bubble=document.createElement(mobile?'dialog':'div');
    bubble.className='mock-attempt-popover';
    bubble.setAttribute('aria-label','单次模考详情');
    if(!mobile)bubble.setAttribute('role','dialog');
    bubble.innerHTML='<header><strong>模考详情</strong><button type="button" data-bubble-close>关闭</button></header><div class="mock-bubble-body" aria-live="polite"><p>正在读取试卷…</p></div>';
    anchor=button;button.setAttribute('aria-expanded','true');
    document.body.append(bubble);
    bubbleEvents=new AbortController();
    const options={signal:bubbleEvents.signal};
    const opened=bubble;
    opened.querySelector('[data-bubble-close]').onclick=()=>closeBubble(true);
    if(mobile){
      opened.showModal();
      opened.addEventListener('cancel',event=>{event.preventDefault();closeBubble(true);},options);
      opened.addEventListener('click',e=>{if(e.target===opened)closeBubble(true);},options);
    }else if(typeof opened.showPopover==='function'){
      opened.popover='manual';opened.showPopover();
    }
    function position(){
      if(!anchor?.isConnected){closeBubble();return;}
      const bounds=anchor.getBoundingClientRect();
      const track=anchor.closest('.mock-history-track').getBoundingClientRect();
      const tableBounds=viewport.getBoundingClientRect();
      if(bounds.bottom<=Math.max(0,tableBounds.top)||bounds.top>=Math.min(innerHeight,tableBounds.bottom)||bounds.right<=track.left||bounds.left>=track.right){
        closeBubble();return;
      }
      if(mobile)return;
      const width=Math.min(500,innerWidth-20),left=Math.max(10,Math.min(bounds.left,innerWidth-width-10));
      const above=bounds.top-18,below=innerHeight-bounds.bottom-18;
      const down=below>=Math.min(280,above);
      const height=Math.max(165,Math.min(560,down?below:above));
      const panelHeight=Math.min(height,opened.scrollHeight);
      const y=down?bounds.bottom+8:bounds.top-panelHeight-8;
      Object.assign(opened.style,{left:left+'px',top:Math.max(10,Math.min(y,innerHeight-panelHeight-10))+'px',width:width+'px',maxHeight:height+'px'});
    }
    const resize=new ResizeObserver(position);
    resize.observe(opened);options.signal.addEventListener('abort',()=>resize.disconnect(),{once:true});
    document.addEventListener('scroll',e=>{if(!opened.contains(e.target))position();},{...options,capture:true,passive:true});
    window.addEventListener('resize',position,options);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeBubble(true);}},options);
    if(!mobile)document.addEventListener('pointerdown',e=>{
      if(!opened.contains(e.target)&&!anchor?.contains(e.target))closeBubble();
    },options);
    narrow.addEventListener('change',()=>closeBubble(true),options);
    position();
    if(bubble===opened)opened.querySelector('[data-bubble-close]').focus({preventScroll:true});
    return opened;
  }

  async function openAttempt(button) {
    if(anchor===button){closeBubble(true);return;}
    closeBubble();
    const opened=showBubble(button);
    if(bubble!==opened)return;
    const controller=attemptController=new AbortController();
    const params=filters();
    params.set('studentId',row.dataset.rosterStudent);
    params.set('review','1');
    const body=opened.querySelector('.mock-bubble-body');
    try{
      const {attempt,review,name}=await api('mock-stats/'+part(button.dataset.mockAttempt)+'?'+params,{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(25000)])});
      if(controller.signal.aborted||bubble!==opened)return;
      const original=new Map((attempt.questions||[]).map(q=>[q.id,q]));
      const card=button.querySelector('.accuracy-band')?.textContent||'—';
      const start=focusTopic||focusQuestion?'topic':'loss';
      const lost=review.filter(q=>q.loss).length;
      opened.querySelector('header strong').textContent=name+' · 模考回顾';
      function showQuestions(filter) {
        const scope=review.filter(q=>{
          if(filter==='all')return true;
          if(filter==='pending')return !q.foundScore;
          return q.loss&&(filter!=='topic'||(!focusTopic||topicKey(attempt.course,q.topic)===focusTopic)&&(!focusQuestion||q.id===focusQuestion));
        });
        const list=body.querySelector('[data-review-questions]');
        list.innerHTML=scope.length?scope.map((q,index)=>renderQuestion(q,original.get(q.id),attempt,index===0)).join(''):`<p class="mock-bubble-empty">${review.some(q=>!q.foundScore)?'部分题目缺少有效计分。':'当前范围没有失分题。'}</p>`;
        body.querySelectorAll('[data-review-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reviewFilter===filter)));
        for(const img of list.querySelectorAll('img')){
          const retry=img.nextElementSibling;
          const failed=()=>{retry.hidden=false;};
          img.addEventListener('error',failed);
          img.addEventListener('load',()=>{retry.hidden=true;});
          if(img.complete&&!img.naturalWidth)failed();
          retry.onclick=()=>{retry.hidden=true;const url=new URL(img.src);url.searchParams.set('retry',String(Date.now()));img.src=url.href;};
        }
      }
      body.innerHTML=`<div class="mock-attempt-summary"><span>${html(courseLabel(attempt.course))} · ${html(time(attempt.submittedAt))}</span><span>${html(card)} · ${html(points(attempt.result.total,attempt.result.maxPoints))}</span><span>用时 ${html(duration(attempt.result.durationSeconds))}</span></div>
        <div class="mock-review-filters" role="group" aria-label="题目范围">${start==='topic'?'<button type="button" data-review-filter="topic">所选范围失分</button>':''}<button type="button" data-review-filter="loss">失分题 ${lost}</button><button type="button" data-review-filter="all">全部题目 ${review.length}</button>${review.some(q=>!q.foundScore)?'<button type="button" data-review-filter="pending">缺计分</button>':''}</div>
        <div data-review-questions></div>`;
      showQuestions(start);
      body.onclick=e=>{
        const filter=e.target.closest('[data-review-filter]');
        if(filter){showQuestions(filter.dataset.reviewFilter);return;}
        const zoom=e.target.closest('[data-mock-zoom]');
        if(zoom){
          const images=zoom.closest('.mock-question-body').querySelector('.mock-question-images');
          const active=images.classList.toggle('zoomed');
          zoom.setAttribute('aria-pressed',String(active));zoom.textContent=active?'适应宽度':'放大原题';
        }
      };
    }catch(error){
      if(controller.signal.aborted||bubble!==opened)return;
      body.innerHTML=`<p>${html(error.message)}</p><button type="button" data-review-retry>重试</button>`;
      body.querySelector('[data-review-retry]').onclick=()=>{closeBubble();void openAttempt(button);};
    }
  }

  table.addEventListener('keydown',e=>{
    if(!e.target.matches('.mock-history-track')||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();
    e.target.scrollBy({left:(e.key==='ArrowLeft'?-1:1)*Math.max(180,e.target.clientWidth*.8)});
  },{signal});
  table.addEventListener('click',e=>{
    const next=e.target.closest('[data-roster-student]');
    if(!next)return;
    const selection=window.getSelection();
    if(e.detail>0&&selection?.toString()&&next.contains(selection.anchorNode))return;
    if(e.target.closest('button,a,input,select')&&!e.target.closest('[data-student]'))return;
    openStudent(next);
  },{signal});

  return {close:unsetRow,destroy(){unsetRow();events.abort();observer.disconnect();}};
}
