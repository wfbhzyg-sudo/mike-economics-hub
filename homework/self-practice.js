import {selectedCourse,rememberCourse} from './course-scope.js';
const DAY = 86_400_000;
const CREATE_KEY = 'sp:create';
const LOCAL_KEY = 'sp:attempt:';
const courseName = (course) => (course === 'macro' ? 'AP 宏观' : 'AP 微观');

function formatClock(seconds) {
  const value = Math.max(0, Math.floor(seconds));
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function duration(seconds) {
  const value = Math.max(0, Math.round(seconds));
  if (value < 60) return '少于 1 分钟';
  const m = Math.floor(value / 60);
  const s = value % 60;
  return s ? `${m} 分 ${s} 秒` : `${m} 分钟`;
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function removeLocal(key) { try { localStorage.removeItem(key); } catch {} }

export function availableQuestionCount(catalog, selected) {
  const topics = new Set(selected);
  if (Array.isArray(catalog.availability)) return catalog.availability.reduce((n, group) => n + (group.topics.some(id => topics.has(id)) ? group.count : 0), 0);
  return (catalog.units || []).flatMap(unit => unit.topics).reduce((n, topic) => n + (topics.has(topic.id) ? topic.count : 0), 0);
}

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}

export function createSelfPracticeUI(ctx) {
  const {main, state, api, post, put, go, h, toast} = ctx;
  let destroy = null;
  let creationVersion=0;
  const dialogs=new Set();
  const closeDialogs=()=>{for(const dialog of dialogs){dialog.close();dialog.remove();}dialogs.clear();};
  const attachDialog=dialog=>{dialogs.add(dialog);dialog.addEventListener('close',()=>dialogs.delete(dialog));document.body.append(dialog);};

  function readCreate(course) {
    const legacy=readJSON(CREATE_KEY+':'+state.user.id,{});
    course=course||selectedCourse(state.user.id,['micro','macro'],legacy.course==='macro'?'macro':'micro');
    return {...{course,topics:[],count:10,timer:'countup',minutes:25},...(legacy.course===course?legacy:{}),...readJSON(CREATE_KEY+':'+state.user.id+':'+course,{}),course};
  }
  function saveCreate(value) {
    try{localStorage.setItem(CREATE_KEY+':'+state.user.id+':'+value.course,JSON.stringify(value));}catch{}
    rememberCourse(state.user.id,value.course);
  }

  async function creation(course) {
    const version=++creationVersion;
    destroy=()=>{++creationVersion;};
    main.innerHTML = '<section class="paper sp-loading"><p>正在读取可练习章节…</p></section>';
    let settings = readCreate(course);
    let catalog;
    let attempts = [];
    try {
      [catalog, attempts] = await Promise.all([
        api('self-practice/catalog?course=' + encodeURIComponent(settings.course)),
        api('self-practice/attempts').then((value) => value.attempts || []).catch(() => []),
      ]);
    } catch (error) {
      if(version!==creationVersion)return;
      main.innerHTML = `<section class="paper sp-error"><h1>暂时无法读取练习</h1><p>${h(error.message)}</p><button class="primary" data-sp-retry>重试</button></section>`;
      main.querySelector('[data-sp-retry]').onclick = () => creation(settings.course);
      return;
    }
    if(version!==creationVersion)return;
    attempts=attempts.filter(a=>a.course===settings.course);

    const units = catalog.units || [];
    const availableByTopic = new Map();
    for (const unit of units) for (const topic of unit.topics) availableByTopic.set(topic.id, topic.count);
    settings.topics = [...new Set(settings.topics || [])].filter((id) => availableByTopic.get(id) > 0);
    const available = availableQuestionCount(catalog, settings.topics);

    main.innerHTML = `<section class="paper sp-create" data-page="create">
  <header class="sp-create-head">
    <div><p class="sp-kicker">SELF PRACTICE</p><h1>自主模考</h1><p class="sp-sub">选择章节，抽一套只属于你的练习。不进入班级成绩。</p></div>
    <div class="sp-course" role="tablist" aria-label="选择学科">
      <button type="button" role="tab" data-course="micro" aria-selected="${settings.course === 'micro'}">AP 微观</button>
      <button type="button" role="tab" data-course="macro" aria-selected="${settings.course === 'macro'}">AP 宏观</button>
    </div>
  </header>
  <div class="sp-create-grid">
    <section class="sp-card sp-picker" aria-labelledby="sp-pick-title">
      <div class="sp-card-head"><h2 id="sp-pick-title">选择章节</h2><span class="sp-muted" data-available>已选 ${settings.topics.length} 章 · 可练 ${available} 题</span></div>
      <div class="sp-units" data-units>${units.length ? units.map((unit) => unitMarkup(unit, settings)).join('') : '<p class="sp-empty">老师尚未向你所在班级开放可自主练习的章节。</p>'}</div>
    </section>
    <section class="sp-card sp-setup" aria-labelledby="sp-setup-title">
      <h2 id="sp-setup-title">考试设置</h2>
      <div class="sp-field"><span class="sp-label">题目数量</span><div class="sp-seg" data-counts>${[10, 20, 30].map((count) => `<button type="button" data-count="${count}" aria-pressed="${settings.count === count}">${count} 道</button>`).join('')}</div><p class="sp-warn" data-count-warn role="status"></p></div>
      <div class="sp-field"><span class="sp-label">计时方式</span><div class="sp-seg" data-timers data-mode="timer"><button type="button" data-timer="countup" aria-pressed="${settings.timer === 'countup'}">正计时</button><button type="button" data-timer="countdown" aria-pressed="${settings.timer === 'countdown'}">倒计时</button></div></div>
      <div class="sp-field" data-minutes-row ${settings.timer === 'countdown' ? '' : 'hidden'}><label class="sp-label" for="sp-minutes">考试时长</label><div class="sp-inline"><input id="sp-minutes" type="number" min="1" max="240" step="1" value="${settings.minutes}" inputmode="numeric"><span>分钟</span></div><p class="sp-warn" data-minutes-warn role="status"></p></div>
      <div class="sp-summary" data-summary aria-live="polite"></div>
      <button type="button" class="primary sp-start" data-start>一键开始</button>
      <p class="sp-note">开始后才会计时。答案只保存在你的账号与这台设备上。</p>
    </section>
  </div>
  <section class="sp-recent" aria-labelledby="sp-recent-title">
    <div class="sp-card-head"><h2 id="sp-recent-title">${courseName(settings.course)} · 最近模考</h2><button type="button" class="link" data-history>本学科记录</button></div>
    <div data-recent>${recentMarkup(attempts.slice(0, 3), h)}</div>
  </section>
</section>`;

    const page = main.querySelector('[data-page="create"]');
    const unitsHost = page.querySelector('[data-units]');
    const countHost = page.querySelector('[data-counts]');
    const timerHost = page.querySelector('[data-timers]');
    const minutesRow = page.querySelector('[data-minutes-row]');
    const minutesInput = page.querySelector('#sp-minutes');
    const summary = page.querySelector('[data-summary]');
    const start = page.querySelector('[data-start]');
    const recent = page.querySelector('[data-recent]');
    let creating=false;

    const paint = () => {
      saveCreate(settings);
      const availableCount = availableQuestionCount(catalog, settings.topics);
      page.querySelector('[data-available]').textContent = `已选 ${settings.topics.length} 章 · 可练 ${availableCount} 题`;
      for (const button of countHost.querySelectorAll('[data-count]')) {
        const value = Number(button.dataset.count);
        button.setAttribute('aria-pressed', String(settings.count === value));
        button.disabled = availableCount > 0 && value > availableCount;
        button.title = button.disabled ? `当前仅 ${availableCount} 题` : '';
      }
      const warn = page.querySelector('[data-count-warn]');
      warn.textContent = availableCount === 0 ? '请至少选择一个章节' : settings.count > availableCount ? `当前仅 ${availableCount} 题，无法组成 ${settings.count} 道` : '';
      for (const button of timerHost.querySelectorAll('[data-timer]')) button.setAttribute('aria-pressed', String(settings.timer === button.dataset.timer));
      minutesRow.hidden = settings.timer !== 'countdown';
      summary.innerHTML = summaryMarkup(settings, availableCount, h);
      const validMinutes=Number.isInteger(settings.minutes)&&settings.minutes>=1&&settings.minutes<=240;
      minutesInput.setAttribute('aria-invalid', String(settings.timer==='countdown'&&!validMinutes));
      page.querySelector('[data-minutes-warn]').textContent=settings.timer==='countdown'&&!validMinutes?'倒计时需为 1–240 之间的整数分钟':'';
      start.disabled = creating || !settings.topics.length || settings.count > availableCount || (settings.timer==='countdown'&&!validMinutes);
      if (!units.length) start.disabled = true;
    };

    const toggleCourse = async (course) => {
      if (course === settings.course) return;
      saveCreate(settings);
      await creation(course);
    };
    page.querySelectorAll('[data-course]').forEach((button) => {
      button.onclick = () => toggleCourse(button.dataset.course);
    });
    unitsHost.addEventListener('change', (event) => {
      const input = event.target.closest('input[data-topic],input[data-unit-all]');
      if (!input || input.disabled) return;
      const inputs = input.hasAttribute('data-unit-all')
        ? [...input.closest('[data-unit]').querySelectorAll('input[data-topic]:not(:disabled)')]
        : [input];
      const ids = inputs.map(item => item.dataset.topic);
      settings.topics = input.checked ? [...new Set([...settings.topics, ...ids])] : settings.topics.filter(id => !ids.includes(id));
      inputs.forEach(item => item.checked = settings.topics.includes(item.dataset.topic));
      updateUnitCheckboxes();
      paint();
    });
    function updateUnitCheckboxes() {
      for (const unit of units) {
        const host = unitsHost.querySelector(`[data-unit="${CSS.escape(unit.unitId)}"]`);
        if (!host) continue;
        const inputs = [...host.querySelectorAll('input[data-topic]:not(:disabled)')];
        const checked = inputs.filter((input) => settings.topics.includes(input.dataset.topic)).length;
        const parent = host.querySelector('input[data-unit-all]');
        parent.checked = checked > 0 && checked === inputs.length;
        parent.indeterminate = checked > 0 && checked < inputs.length;
        parent.disabled = inputs.length === 0;
        host.querySelector('[data-unit-selection]').textContent = checked === inputs.length && checked ? '全选' : checked ? `${checked}/${inputs.length}` : '全选';
      }
    }
    countHost.addEventListener('click', (event) => {
      const button = event.target.closest('[data-count]');
      if (!button || button.disabled) return;
      settings.count = Number(button.dataset.count);
      paint();
    });
    timerHost.addEventListener('click', (event) => {
      const button = event.target.closest('[data-timer]');
      if (!button) return;
      settings.timer = button.dataset.timer;
      paint();
    });
    minutesInput.addEventListener('input', () => {
      const value = Number(minutesInput.value);
      settings.minutes = value;
      page.querySelector('[data-minutes-warn]').textContent = value >= 1 && value <= 240 ? '' : '倒计时需在 1–240 分钟之间';
      paint();
    });
    page.querySelector('[data-history]').onclick = () => showHistory(attempts);
    page.querySelectorAll('[data-continue]').forEach((link) => {
      link.onclick = (event) => { event.preventDefault(); go(link.getAttribute('data-continue')); };
    });
    summary.onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;settings.topics=settings.topics.filter(id=>id!==b.dataset.remove);unitsHost.querySelectorAll('[data-topic]').forEach(input=>input.checked=settings.topics.includes(input.dataset.topic));updateUnitCheckboxes();paint();};
    start.onclick = async () => {
      if (start.disabled || creating) return;
      if (settings.timer === 'countdown' && !(settings.minutes >= 1 && settings.minutes <= 240)) {
        page.querySelector('[data-minutes-warn]').textContent = '倒计时需在 1–240 分钟之间';
        minutesInput.focus();
        return;
      }
      creating=true;start.disabled = true;
      start.textContent = '正在组卷…';
      try {
        const signature=JSON.stringify([settings.course,[...settings.topics].sort(),settings.count,settings.timer,settings.minutes]);
        if(settings.pendingSignature!==signature){settings.pendingSignature=signature;settings.pendingClientId=crypto.randomUUID();saveCreate(settings);}
        const clientId=settings.pendingClientId;
        const {attempt} = await post('self-practice/attempts', {
          clientId,
          course: settings.course,
          topicIds: settings.topics,
          questionCount: settings.count,
          timerMode: settings.timer,
          timeLimitMinutes: settings.timer === 'countdown' ? settings.minutes : 0,
        });

        if(version!==creationVersion)return;
        delete settings.pendingClientId;delete settings.pendingSignature;saveCreate(settings);
        go('self-practice/attempt/' + encodeURIComponent(attempt.id));
      } catch (error) {
        if(version!==creationVersion)return;
        creating=false;paint();
        start.textContent = '一键开始';
        toast(error.message);
      }
    };
    updateUnitCheckboxes();
    paint();
    paintRecent(attempts, recent, h);
  }

  function unitMarkup(unit, settings) {
    const checked = unit.topics.filter((topic) => settings.topics.includes(topic.id)).length;
    return `<details class="sp-unit" data-unit="${h(unit.unitId)}" ${checked || unit.unitId.includes('-2') ? 'open' : ''}>
      <summary class="sp-unit-summary"><label class="sp-unit-select"><input type="checkbox" data-unit-all ${checked === unit.topics.length && checked ? 'checked' : ''} aria-label="选择 ${h(unit.title)} 全部可练习章节"><span class="sp-unit-select-text" data-unit-selection>全选</span></label><span class="sp-unit-name">${h(unit.title)}</span><span class="sp-unit-total">${unit.questionCount} 题</span></summary>
      <div class="sp-topics">${unit.topics.map((topic) => `<label class="sp-topic ${topic.count ? '' : 'is-empty'}">
        <input type="checkbox" data-topic="${h(topic.id)}" ${settings.topics.includes(topic.id) ? 'checked' : ''} ${topic.count ? '' : 'disabled'}>
        <span class="sp-topic-name"><strong>${h(topic.id)} ${h(topic.name)}</strong><small>${h(topic.title || '')}</small></span>
        <span class="sp-topic-count" data-empty="${topic.count ? 'false' : 'true'}">${topic.count ? topic.count + ' 题' : '暂无可练习题目'}</span>
      </label>`).join('')}</div>
    </details>`;
  }

  function summaryMarkup(settings, available, h) {
    const chips = settings.topics.map((id) => `<span class="sp-chip">${h(id)}<button type="button" data-remove="${h(id)}" aria-label="移除 ${h(id)}">×</button></span>`).join('');
    return `<div class="sp-chips">${chips || '<span class="sp-muted">尚未选择章节</span>'}</div>
      <p><strong>${settings.topics.length}</strong> 个章节 · <strong>${settings.count}</strong> 题 · ${settings.timer === 'countdown' ? '倒计时 ' + settings.minutes + ' 分钟' : '正计时'}${available ? '' : ' · 暂无可练题'}</p>`;
  }

  function recentMarkup(attempts, h) {
    if (!attempts.length) return '<p class="sp-empty">还没有模考记录。选好章节，从第一套开始。</p>';
    return `<div class="sp-recent-list">${attempts.map((attempt) => `<button type="button" class="sp-recent-row" data-open-attempt="${h(attempt.id)}" data-status="${h(attempt.status)}">
      <span class="sp-recent-main"><strong>${h(courseName(attempt.course))} · ${attempt.topicIds.length} 章 · ${attempt.questionCount} 题</strong><small>${new Date(attempt.createdAt).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</small></span>
      <span class="sp-recent-side">${attempt.result ? `<b>${attempt.result.total}/${attempt.result.maxPoints}</b><small>${attempt.result.percent}%</small>` : attempt.status === 'active' ? '<b>继续</b>' : attempt.status === 'created' ? '<b>未开始</b>' : '<b>已交卷</b>'}</span>
    </button>`).join('')}</div>`;
  }

  function paintRecent(attempts, host, h) {
    host.innerHTML = recentMarkup(attempts.slice(0, 3), h);
    host.querySelectorAll('[data-open-attempt]').forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.openAttempt;
        go((button.dataset.status === 'submitted' ? 'self-practice/result/' : 'self-practice/attempt/') + encodeURIComponent(id));
      };
    });
  }

  function showHistory(attempts) {
    const dialog = document.createElement('dialog');
    dialog.className = 'sp-dialog sp-history';
    dialog.innerHTML = `<header><h2>全部模考记录</h2><button type="button" class="sp-icon" data-close aria-label="关闭">×</button></header>
      <div class="sp-history-body">${recentMarkup(attempts, h)}</div>`;
    attachDialog(dialog);
    dialog.addEventListener('close', () => dialog.remove());
    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-open-attempt]').forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.openAttempt;
        dialog.close();
        go((button.dataset.status === 'submitted' ? 'self-practice/result/' : 'self-practice/attempt/') + encodeURIComponent(id));
      };
    });
    dialog.showModal();
  }

  async function runAttempt(id) {
    const version=++creationVersion;
    let disposed=false, timer=null, saveTimer=null;
    const current=()=>!disposed&&version===creationVersion;
    destroy=()=>{disposed=true;++creationVersion;};
    const reload=()=>{destroy?.();closeDialogs();return runAttempt(id);};
    main.innerHTML='<section class="paper sp-loading"><p>正在载入本次练习…</p></section>';
    let paper;
    try {
      ({attempt:paper}=await api('self-practice/attempts/'+encodeURIComponent(id)));
      if(!current())return;
      if(paper.status==='submitted'){go('self-practice/result/'+encodeURIComponent(id));return;}
      if(paper.status==='created'){
        await preload(paper.questions[0]);if(!current())return;
        ({attempt:paper}=await post(`self-practice/attempts/${encodeURIComponent(id)}/start`,{}));
        if(!current())return;
      }
      if(paper.status!=='active'||!paper.questions.length)throw Error('本次练习尚未开始，请重试');
    }catch(error){
      if(!current())return;
      if(error.status===409){go('self-practice/result/'+encodeURIComponent(id));return;}
      main.innerHTML=`<section class="paper sp-error"><h1>暂时无法开始练习</h1><p>${h(error.message)}</p><button class="primary" data-start-retry>重试</button><a class="secondary" href="#self-practice">返回自主模考</a></section>`;
      main.querySelector('[data-start-retry]').onclick=reload;return;
    }
    const local=readJSON(LOCAL_KEY+id,null),useLocal=Boolean(local?.dirty);
    const answers={...paper.answers,...(useLocal?local.answers:{})};
    const flags=new Set(useLocal?(local.flags||[]):(paper.flags||[]));
    const questions=paper.questions;
    let index=Math.min(questions.length-1,Math.max(0,(useLocal?local.index:paper.index)||0));
    let revision=paper.revision,dirty=useLocal,saving=null,editVersion=0;
    let savedRevConflict=useLocal&&local.revision!==undefined&&local.revision!==revision;
    let frozen=savedRevConflict,submitting=false,reviewing=false;
    const serverOffset=Date.parse(paper.serverNow||new Date().toISOString())-Date.now();
    const seconds=()=>paper.timerMode==='countdown'?Math.max(0,Math.ceil((Date.parse(paper.deadlineAt)-Date.now()-serverOffset)/1000)):Math.max(0,Math.floor((Date.now()+serverOffset-Date.parse(paper.startedAt))/1000));
    const expired=()=>paper.timerMode==='countdown'&&seconds()<=0;
    document.body.classList.add('sp-immersive');
    main.innerHTML=`<section class="sp-run" data-page="run">
      <header class="sp-run-head"><button type="button" class="sp-back" data-exit aria-label="退出本次练习">←</button><div class="sp-run-title"><strong>${courseName(paper.course)} · 模考</strong><span data-progress></span></div><div class="sp-timer" data-timer role="timer" aria-live="off"></div><button type="button" class="sp-flag" data-flag>标记</button><button type="button" class="sp-palette-button" data-palette>答题卡</button></header>
      <div class="sp-run-body"><div class="sp-question" data-question></div><aside class="sp-rail" data-rail></aside></div>
      <footer class="sp-run-foot"><button type="button" class="secondary" data-prev>上一题</button><button type="button" class="secondary" data-palette>答题卡</button><button type="button" class="primary" data-next>下一题</button></footer>
      <div class="sp-save-state" role="status"><span data-save></span><button type="button" data-retry-save hidden>重试保存</button><button type="button" data-retry-submit hidden>重试交卷</button></div>
    </section>`;
    const page=main.firstElementChild,questionHost=page.querySelector('[data-question]'),railHost=page.querySelector('[data-rail]'),saveState=page.querySelector('[data-save]'),timerHost=page.querySelector('[data-timer]'),nextButton=page.querySelector('[data-next]'),flagButton=page.querySelector('[data-flag]'),retrySave=page.querySelector('[data-retry-save]'),retrySubmit=page.querySelector('[data-retry-submit]');
    const persistLocal=()=>writeJSON(LOCAL_KEY+id,{answers,flags:[...flags],index,revision,dirty,savedAt:Date.now()});
    const setSave=text=>{if(current())saveState.textContent=text;};
    const paletteCells=()=>questions.map((q,i)=>`<button type="button" class="sp-palette-cell" data-jump="${i}" data-state="${answers[q.id]?'answered':'blank'}${flags.has(q.id)?' flagged':''}${i===index?' current':''}" aria-current="${i===index?'step':'false'}" aria-label="第 ${i+1} 题，${answers[q.id]?'已答 '+answers[q.id]:'未答'}${flags.has(q.id)?'，已标记':''}">${i+1}</button>`).join('');
    const paintState=()=>{
      const q=questions[index],selected=answers[q.id];
      questionHost.querySelectorAll('[data-choice]').forEach((button,i)=>{button.setAttribute('aria-checked',String(button.dataset.choice===selected));button.tabIndex=selected?(button.dataset.choice===selected?0:-1):(i===0?0:-1);button.disabled=frozen;});
      flagButton.disabled=frozen;flagButton.setAttribute('aria-pressed',String(flags.has(q.id)));flagButton.textContent=flags.has(q.id)?'已标记':'标记';
      page.querySelector('[data-prev]').disabled=index===0||submitting;
      nextButton.disabled=submitting||savedRevConflict;
      railHost.innerHTML=`<div class="sp-rail-card"><h3>答题卡</h3><div class="sp-palette-grid">${paletteCells()}</div><div class="sp-legend"><span><i data-dot="answered"></i>已答</span><span><i data-dot="blank"></i>未答</span><span><i data-dot="flagged"></i>标记</span></div><button type="button" class="primary wide" data-review ${submitting||savedRevConflict?'disabled':''}>检查并提交</button></div>`;
    };
    const showConflict=()=>{
      if(!current()||page.querySelector('.sp-conflict'))return;
      frozen=true;paintState();
      const bar=document.createElement('div');bar.className='sp-conflict';bar.setAttribute('role','alert');
      bar.innerHTML='<p>另一台设备更新了答案。本机未同步内容已暂存，请载入账号里的最新答案后继续。</p><button type="button" class="secondary">载入账号里的答案</button>';
      bar.querySelector('button').onclick=()=>{writeJSON(LOCAL_KEY+id+':conflict-backup',readJSON(LOCAL_KEY+id,null));removeLocal(LOCAL_KEY+id);reload();};
      page.prepend(bar);
    };
    const sync=async()=>{
      if(savedRevConflict)return false;
      if(saving)return saving;
      if(!dirty)return true;
      clearTimeout(saveTimer);
      saving=(async()=>{
        while(dirty&&!savedRevConflict){
          const sentVersion=editVersion,payload={revision,answers:{...answers},flags:[...flags],index};
          setSave('正在保存…');
          try{
            const out=await put(`self-practice/attempts/${encodeURIComponent(id)}/answers`,payload);
            revision=out.revision;dirty=editVersion!==sentVersion;
            // Do not replace a newer screen's local draft after navigation.
            if(current()){persistLocal();retrySave.hidden=true;setSave(dirty?'正在保存最新答案…':'已保存到账号');}
          }catch(error){
            dirty=true;if(current())persistLocal();
            if(error.status===409){
              // The server may have auto-submitted while the last save was in flight.
              try{const latest=await api(`self-practice/attempts/${encodeURIComponent(id)}`);if(latest.attempt.status==='submitted'){if(current()){removeLocal(LOCAL_KEY+id);go('self-practice/result/'+encodeURIComponent(id));}return false;}}catch{}
              savedRevConflict=true;setSave('答案版本已更新');showConflict();
            }else{setSave('尚未保存到账号，请保持本页并重试');if(current())retrySave.hidden=false;}
            return false;
          }
          if(!current())return !dirty;
        }
        return true;
      })();
      try{return await saving;}finally{saving=null;}
    };
    const scheduleSave=()=>{dirty=true;editVersion++;const stored=persistLocal();setSave(stored?'正在保存…':'正在保存；本机无法暂存，请勿关闭本页');clearTimeout(saveTimer);saveTimer=setTimeout(()=>sync(),450);};
    const choose=(choice)=>{
      if(frozen||!current())return;
      if(expired()){submitPaper(true);return;}
      const q=questions[index];if(!q.optionLabels.includes(choice))return;
      answers[q.id]=choice;paintState();scheduleSave();
    };
    const paintQuestion=()=>{
      const q=questions[index];page.querySelector('[data-progress]').textContent=`${index+1} / ${questions.length}`;
      questionHost.innerHTML=`<article class="sp-card sp-question-card"><div class="sp-question-meta"><span>第 ${index+1} 题</span><span>${h(q.topic)}</span>${q.sourcePages?`<span>${h(q.sourcePages)}</span>`:''}<button type="button" class="sp-zoom" data-zoom-toggle aria-pressed="false">放大</button></div><div class="sp-question-images">${q.questionImages.map(file=>`<img src="/api/homework/files/${encodeURIComponent(file)}" alt="第 ${index+1} 题原题" decoding="async">`).join('')}</div>${q.prompt?`<p class="sp-prompt">${h(q.prompt)}</p>`:''}<div class="sp-options" data-label-only="${!q.optionLabels.some(label=>optionText(q,label))}" role="radiogroup" aria-label="第 ${index+1} 题，选择答案">${q.optionLabels.map(label=>`<button type="button" class="sp-option" role="radio" aria-checked="false" data-choice="${h(label)}"><span>${h(label)}</span>${optionText(q,label)?`<small>${h(optionText(q,label))}</small>`:''}</button>`).join('')}</div></article>`;
      questionHost.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>choose(button.dataset.choice));
      const zoom=questionHost.querySelector('[data-zoom-toggle]'),images=questionHost.querySelector('.sp-question-images');
      zoom.onclick=()=>{const on=images.dataset.zoom!=='true';images.dataset.zoom=String(on);zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?'缩小':'放大';};
      nextButton.textContent=index===questions.length-1?'检查并提交':'下一题';paintState();
    };
    const goTo=next=>{if(submitting||!current())return;const target=Math.max(0,Math.min(questions.length-1,next));if(target===index)return;index=target;paintQuestion();scheduleSave();};
    const paletteDialog=()=>{
      if(!current())return;closeDialogs();const dialog=document.createElement('dialog');dialog.className='sp-dialog sp-palette-dialog';
      dialog.innerHTML=`<header><h2>答题卡</h2><button type="button" class="sp-icon" data-close aria-label="关闭">×</button></header><div class="sp-palette-grid sp-palette-large">${paletteCells()}</div><footer><button type="button" class="primary wide" data-review>检查并提交</button></footer>`;
      attachDialog(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.querySelector('[data-close]').onclick=()=>dialog.close();
      dialog.querySelectorAll('[data-jump]').forEach(button=>button.onclick=()=>{dialog.close();goTo(Number(button.dataset.jump));});
      dialog.querySelector('[data-review]').onclick=()=>{dialog.close();review();};dialog.showModal();
    };
    const review=async()=>{
      if(frozen||reviewing||!current())return;reviewing=true;
      try{
        await sync();if(!current()||frozen)return;
        closeDialogs();const unanswered=questions.filter(q=>!answers[q.id]).length,dialog=document.createElement('dialog');dialog.className='sp-dialog sp-submit-dialog';
        dialog.innerHTML=`<header><h2>检查并提交</h2><button type="button" class="sp-icon" data-close aria-label="关闭">×</button></header><div class="sp-submit-body"><p>${questions.length} 题中已答 <strong>${questions.length-unanswered}</strong> 题，未答 <strong>${unanswered}</strong> 题。</p>${unanswered?'<p class="sp-warn">未答题按 0 分计。交卷后不能修改原答案。</p>':''}${dirty?'<p class="sp-warn">还有答案未同步，交卷时会再次保存。</p>':''}</div><footer><button type="button" class="secondary" data-close>再看看</button><button type="button" class="primary" data-confirm>确认交卷</button></footer>`;
        attachDialog(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());dialog.querySelector('[data-confirm]').onclick=()=>{dialog.close();submitPaper(false);};dialog.showModal();
      }finally{reviewing=false;}
    };
    const submitPaper=async(auto)=>{
      if(submitting||savedRevConflict||!current())return;
      submitting=true;frozen=true;clearTimeout(saveTimer);closeDialogs();paintState();retrySubmit.hidden=true;setSave(auto?'时间到，正在交卷…':'正在交卷…');
      try{
        await sync();if(!current()||savedRevConflict)return;
        await post(`self-practice/attempts/${encodeURIComponent(id)}/submit`,{revision,answers:{...answers},flags:[...flags]});
        if(!current())return;removeLocal(LOCAL_KEY+id);clearInterval(timer);go('self-practice/result/'+encodeURIComponent(id));
      }catch(error){
        if(!current())return;frozen=expired();retrySubmit.hidden=false;setSave(frozen?'时间已到，交卷未确认，请重试':'交卷失败，答案已保留，请重试');toast(error.message);
      }finally{if(current()){submitting=false;paintState();}}
    };
    const tick=()=>{if(!current())return;timerHost.textContent=formatClock(seconds());timerHost.dataset.low=paper.timerMode==='countdown'&&seconds()<=60?'true':'false';if(expired()&&!frozen)submitPaper(true);};
    retrySave.onclick=()=>sync();retrySubmit.onclick=()=>submitPaper(expired());
    railHost.addEventListener('click',event=>{const jump=event.target.closest('[data-jump]');if(jump)goTo(Number(jump.dataset.jump));else if(event.target.closest('[data-review]'))review();});
    page.querySelectorAll('[data-palette]').forEach(button=>button.onclick=paletteDialog);page.querySelector('[data-prev]').onclick=()=>goTo(index-1);nextButton.onclick=()=>index===questions.length-1?review():goTo(index+1);
    flagButton.onclick=()=>{if(frozen)return;const key=questions[index].id;if(flags.has(key))flags.delete(key);else flags.add(key);paintState();scheduleSave();};
    page.querySelector('[data-exit]').onclick=async()=>{
      if(submitting)return;const saved=await sync();if(!current()||savedRevConflict)return;
      if(!saved&&!confirm('还有答案未同步。离开前建议重试保存，仍要离开吗？'))return;
      go('self-practice');
    };
    const keyHandler=event=>{
      if(!current()||dialogs.size||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,[contenteditable=true]'))return;
      const q=questions[index],letter=event.key.toUpperCase();
      if(q.optionLabels.includes(letter)){event.preventDefault();choose(letter);}
      else if(event.target.closest('[role=radio]')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();const n=q.optionLabels.indexOf(event.target.closest('[data-choice]').dataset.choice),step=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1,label=q.optionLabels[(n+step+q.optionLabels.length)%q.optionLabels.length];choose(label);questionHost.querySelector(`[data-choice="${label}"]`).focus();
      }else if(event.key==='ArrowRight'){event.preventDefault();goTo(index+1);}else if(event.key==='ArrowLeft'){event.preventDefault();goTo(index-1);}
    };
    const online=()=>{if(expired())submitPaper(true);else if(dirty)sync();};
    const unload=event=>{if(dirty){event.preventDefault();event.returnValue='';}};
    document.addEventListener('keydown',keyHandler);window.addEventListener('online',online);window.addEventListener('beforeunload',unload);
    destroy=()=>{disposed=true;++creationVersion;document.removeEventListener('keydown',keyHandler);window.removeEventListener('online',online);window.removeEventListener('beforeunload',unload);document.body.classList.remove('sp-immersive');clearInterval(timer);clearTimeout(saveTimer);closeDialogs();};
    paintQuestion();setSave(dirty?'有未同步答案':'已保存到账号');if(savedRevConflict)showConflict();else if(dirty)sync();timer=setInterval(tick,1000);tick();
  }

  function optionText(question, label) {
    return question.optionText?.[label] || '';
  }

  function preload(question) {
    const first = question?.questionImages?.[0];
    if (!first) return Promise.resolve();
    return new Promise((resolve) => {
      const image = new Image();
      const timeout=setTimeout(resolve,5000);
      image.onload = image.onerror = () => {clearTimeout(timeout);resolve();};
      image.src = '/api/homework/files/' + encodeURIComponent(first);
    });
  }

  async function result(id) {
    const version=++creationVersion;destroy=()=>{++creationVersion;};
    main.innerHTML = '<section class="paper sp-loading"><p>正在读取成绩…</p></section>';
    let attempt;
    try {
      ({attempt} = await api('self-practice/attempts/' + encodeURIComponent(id) + '/result'));
      if(version!==creationVersion)return;
    } catch (error) {
      if(version!==creationVersion)return;
      main.innerHTML = `<section class="paper sp-error"><h1>暂时无法读取成绩</h1><p>${h(error.message)}</p><a class="primary" href="#self-practice">返回自主模考</a></section>`;
      return;
    }
    const result = attempt.result;
    const wrong = result.questions.filter((question) => !question.correct);
    const corrections = attempt.corrections || {};
    main.innerHTML = `<section class="paper sp-result" data-page="result">
      <header class="sp-result-head">
        <div><p class="sp-kicker">SELF PRACTICE RESULT</p><h1>成绩与订正</h1><p class="sp-sub">${new Date(result.submittedAt).toLocaleString('zh-CN')} 交卷${result.autoSubmitted ? ' · 到时自动交卷' : ''}</p></div>
        <a class="secondary" href="#self-practice">再来一套</a>
      </header>
      <div class="sp-result-grid">
        <section class="sp-card sp-score-card">
          <div class="sp-score"><strong>${result.percent}%</strong><span>${result.total} / ${result.maxPoints}</span></div>
          <div class="sp-score-meta"><span>用时 ${duration(result.durationSeconds)}</span><span>共 ${result.questions.length} 题</span></div>
          <p class="sp-band" data-band="${result.percent < 20 ? 1 : result.percent < 40 ? 2 : result.percent < 60 ? 3 : result.percent < 80 ? 4 : 5}">练习分档，非官方 AP 预测分</p>
          <div class="sp-actions"><button type="button" class="primary" data-again>同范围再来一套</button><a class="secondary" href="#self-practice">调整范围</a></div>
        </section>
        <section class="sp-card sp-topic-card"><h2>章节表现</h2>${result.topics.map((topic) => `<div class="sp-topic-row"><span>${h(topic.topic)}</span><div class="sp-topic-bar"><i style="width:${Math.round((topic.correct / topic.count) * 100)}%"></i></div><b>${topic.correct}/${topic.count}</b></div>`).join('')}</section>
      </div>
      <section class="sp-card sp-wrong" aria-labelledby="sp-wrong-title">
        <div class="sp-card-head"><h2 id="sp-wrong-title">错题与订正</h2><span class="sp-muted">${wrong.length} 道失分题${result.autoSubmitted ? ' · 到时未答按 0 分' : ''}</span></div>
        ${wrong.length ? wrong.map((question) => wrongMarkup(attempt, question, corrections)).join('') : '<p class="sp-empty">全部答对，没有需要订正的题。</p>'}
      </section>
      <footer class="sp-result-foot"><button type="button" class="secondary" data-again>同范围再来一套</button><a class="secondary" href="#self-practice">返回自主模考</a></footer>
    </section>`;

    let generating=false,retryClientId=null;
    main.querySelectorAll('[data-again]').forEach((button) => {
      button.onclick = async () => {
        if(generating)return;generating=true;main.querySelectorAll('[data-again]').forEach(b=>b.disabled=true);
        const clientId = retryClientId || (retryClientId=crypto.randomUUID());
        try {
          const {attempt: next} = await post('self-practice/attempts', {
            clientId,
            course: attempt.course,
            topicIds: attempt.topicIds,
            questionCount: attempt.questions.length,
            timerMode: attempt.timerMode,
            timeLimitMinutes: attempt.timeLimitMinutes,
          });
          if(version===creationVersion)go('self-practice/attempt/' + encodeURIComponent(next.id));
        } catch (error) { if(version===creationVersion)toast(error.message); }
        finally{generating=false;if(version===creationVersion)main.querySelectorAll('[data-again]').forEach(b=>b.disabled=false);}
      };
    });
    main.querySelectorAll('[data-correct]').forEach((button) => {
      button.onclick = () => {
        const item = button.closest('[data-wrong]');
        const box = document.createElement('div');
        box.className = 'sp-correct-box';
        const question = attempt.questions.find((entry) => entry.id === item.dataset.wrong);
        box.innerHTML = `<div class="sp-correct-options">${question.optionLabels.map((label) => `<button type="button" class="sp-option" data-pick="${h(label)}" aria-pressed="${corrections[question.id]?.choice === label}"><span>${h(label)}</span>${optionText(question, label) ? `<small>${h(optionText(question, label))}</small>` : ''}</button>`).join('')}</div><label class="sp-field"><span>订正说明（可选）</span><textarea maxlength="500" rows="2">${h(corrections[question.id]?.note || '')}</textarea></label><p class="sp-warn" role="status"></p><div class="sp-actions"><button type="button" class="primary" data-save-correct>保存订正</button><button type="button" class="secondary" data-cancel-correct>收起</button></div>`;
        item.querySelector('[data-correct]').hidden = true;
        item.append(box);
        let picked = corrections[question.id]?.choice || '';
        box.querySelectorAll('[data-pick]').forEach((choice) => {
          choice.onclick = () => {
            picked = choice.dataset.pick;
            box.querySelectorAll('[data-pick]').forEach((other) => other.setAttribute('aria-pressed', String(other === choice)));
          };
        });
        box.querySelector('[data-cancel-correct]').onclick = () => { box.remove(); item.querySelector('[data-correct]').hidden = false; };
        box.querySelector('[data-save-correct]').onclick = async () => {
          if (!picked) { box.querySelector('.sp-warn').textContent = '请先选择一个答案'; return; }
          try {
            box.querySelector('[data-save-correct]').disabled=true;
            const note=box.querySelector('textarea').value;
            const saved=await post(`self-practice/attempts/${encodeURIComponent(attempt.id)}/correct`, {questionId: question.id, choice: picked, note});
            corrections[question.id]=saved.corrections?.[question.id]||{choice:picked,note};
            if(version!==creationVersion)return;
            box.remove();
            item.querySelector('[data-correct]').hidden = false;
            item.querySelector('[data-correction-note]').textContent = `已订正为 ${picked}（记录订正，不改分）`;
            item.querySelector('[data-correction-note]').hidden = false;
            toast('订正已保存');
          } catch (error) { box.querySelector('.sp-warn').textContent = error.message;box.querySelector('[data-save-correct]').disabled=false; }
        };
      };
    });
    main.querySelectorAll('[data-wrong-zoom]').forEach(button=>button.onclick=()=>{const images=button.closest('[data-wrong]').querySelector('.sp-wrong-images');const on=images.dataset.zoom!=='true';images.dataset.zoom=String(on);button.setAttribute('aria-pressed',String(on));button.textContent=on?'缩小原题':'放大原题';});
    const last = {course: attempt.course, topics: attempt.topicIds, count: attempt.questions.length, timer: attempt.timerMode, minutes: attempt.timeLimitMinutes || 25};
    saveCreate(last);

  }

  function wrongMarkup(attempt, question, corrections) {
    const correction = corrections[question.id];
    return `<article class="sp-wrong-item" data-wrong="${h(question.id)}">
      <header><strong>第 ${h(question.number || question.id)} 题</strong><span>${h(question.topic)}</span><span class="sp-wrong-mark">${question.chosen ? '我的答案 ' + h(question.chosen) : '未作答'}</span></header>
      <div class="sp-wrong-body">
        <div class="sp-wrong-images">${question.questionImages.map((fileId) => `<img src="/api/homework/files/${encodeURIComponent(fileId)}" alt="第 ${h(question.number || question.id)} 题原题" loading="lazy">`).join('')}</div>
        <div class="sp-wrong-options">${question.optionLabels.map((label) => `<div class="sp-wrong-option" data-state="${label === question.correctOption ? 'correct' : label === question.chosen ? 'chosen' : ''}"><span>${h(label)}</span>${label === question.correctOption ? '<small>正确</small>' : label === question.chosen ? '<small>我的选择</small>' : ''}</div>`).join('')}</div>
      </div>
      <p class="sp-correction-note" data-correction-note ${correction ? '' : 'hidden'}>${correction ? `已订正为 ${h(correction.choice)}（记录订正，不改分）` : ''}</p>
      <div class="sp-wrong-actions"><button type="button" class="secondary" data-wrong-zoom aria-pressed="false">放大原题</button><button type="button" class="secondary" data-correct>重新选择并订正</button>${question.knowledge ? `<span class="sp-chip">${h(question.knowledge)}</span>` : ''}</div>
    </article>`;
  }

  return {
    async render(route, id) {
      if (destroy) { destroy(); destroy = null; }
      closeDialogs();
      if (route === 'attempt' && id) await runAttempt(id);
      else if (route === 'result' && id) await result(id);
      else await creation();
    },
    destroy() {
      if (destroy) { destroy(); destroy = null; }
      closeDialogs();
    },
  };
}
