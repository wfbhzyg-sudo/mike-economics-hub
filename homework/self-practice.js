const DAY = 86_400_000;
const CREATE_KEY = 'sp:create';
const LOCAL_KEY = 'sp:attempt:';
const LAST_KEY = 'sp:last';
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
  if (value < 60) return `${value} 秒`;
  const m = Math.floor(value / 60);
  const s = value % 60;
  return s ? `${m} 分 ${s} 秒` : `${m} 分钟`;
}

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
}

export function createSelfPracticeUI(ctx) {
  const {main, state, api, post, put, go, h, toast} = ctx;
  let destroy = null;

  function readCreate() {
    return readJSON(CREATE_KEY + ':' + state.user.id, {course: 'micro', topics: [], count: 10, timer: 'countup', minutes: 25});
  }
  function saveCreate(value) {
    localStorage.setItem(CREATE_KEY + ':' + state.user.id, JSON.stringify(value));
  }

  async function creation() {
    main.innerHTML = '<section class="paper sp-loading"><p>正在读取可练习章节…</p></section>';
    let settings = readCreate();
    let catalog;
    let attempts = [];
    try {
      [catalog, attempts] = await Promise.all([
        api('self-practice/catalog?course=' + encodeURIComponent(settings.course)),
        api('self-practice/attempts').then((value) => value.attempts || []).catch(() => []),
      ]);
    } catch (error) {
      main.innerHTML = `<section class="paper sp-error"><h1>暂时无法读取练习</h1><p>${h(error.message)}</p><button class="primary" data-sp-retry>重试</button></section>`;
      main.querySelector('[data-sp-retry]').onclick = () => creation();
      return;
    }
    const token = {};
    destroy = () => { destroy = null; };

    const units = catalog.units || [];
    const availableByTopic = new Map();
    for (const unit of units) for (const topic of unit.topics) availableByTopic.set(topic.id, topic.count);
    settings.topics = (settings.topics || []).filter((id) => availableByTopic.has(id));
    const available = settings.topics.reduce((sum, id) => sum + (availableByTopic.get(id) || 0), 0);

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
      <div class="sp-field"><span class="sp-label">计时方式</span><div class="sp-seg" data-timers><button type="button" data-timer="countup" aria-pressed="${settings.timer === 'countup'}">正计时</button><button type="button" data-timer="countdown" aria-pressed="${settings.timer === 'countdown'}">倒计时</button></div></div>
      <div class="sp-field" data-minutes-row ${settings.timer === 'countdown' ? '' : 'hidden'}><label class="sp-label" for="sp-minutes">考试时长</label><div class="sp-inline"><input id="sp-minutes" type="number" min="1" max="240" step="1" value="${settings.minutes}" inputmode="numeric"><span>分钟</span></div><p class="sp-warn" data-minutes-warn role="status"></p></div>
      <div class="sp-summary" data-summary aria-live="polite"></div>
      <button type="button" class="primary sp-start" data-start>一键开始</button>
      <p class="sp-note">开始后才会计时。答案只保存在你的账号与这台设备上。</p>
    </section>
  </div>
  <section class="sp-recent" aria-labelledby="sp-recent-title">
    <div class="sp-card-head"><h2 id="sp-recent-title">最近模考</h2><button type="button" class="link" data-history>全部记录</button></div>
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

    const paint = () => {
      saveCreate(settings);
      const availableCount = settings.topics.reduce((sum, id) => sum + (availableByTopic.get(id) || 0), 0);
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
      start.disabled = !settings.topics.length || settings.count > availableCount;
      if (!units.length) start.disabled = true;
    };

    const toggleCourse = async (course) => {
      if (course === settings.course) return;
      settings = {...settings, course, topics: []};
      await creation();
    };
    page.querySelectorAll('[data-course]').forEach((button) => {
      button.onclick = () => toggleCourse(button.dataset.course);
    });
    unitsHost.addEventListener('click', (event) => {
      if (event.target.closest('input[type=checkbox]')) event.stopPropagation();
    }, true);
    unitsHost.addEventListener('change', (event) => {
      const input = event.target.closest('input[data-topic]');
      if (!input) return;
      const id = input.dataset.topic;
      settings.topics = input.checked ? [...new Set([...settings.topics, id])] : settings.topics.filter((value) => value !== id);
      updateUnitCheckboxes();
      paint();
    });
    function updateUnitCheckboxes() {
      for (const unit of units) {
        const host = unitsHost.querySelector(`[data-unit="${CSS.escape(unit.unitId)}"]`);
        if (!host) continue;
        const inputs = [...host.querySelectorAll('input[data-topic]')];
        const checked = inputs.filter((input) => settings.topics.includes(input.dataset.topic)).length;
        const parent = host.querySelector('input[data-unit-all]');
        parent.checked = checked > 0 && checked === inputs.length;
        parent.indeterminate = checked > 0 && checked < inputs.length;
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
      settings.minutes = Number.isInteger(value) ? value : 25;
      page.querySelector('[data-minutes-warn]').textContent = value >= 1 && value <= 240 ? '' : '倒计时需在 1–240 分钟之间';
      paint();
    });
    page.querySelector('[data-history]').onclick = () => showHistory(attempts);
    page.querySelectorAll('[data-continue]').forEach((link) => {
      link.onclick = (event) => { event.preventDefault(); go(link.getAttribute('data-continue')); };
    });
    start.onclick = async () => {
      if (start.disabled) return;
      if (settings.timer === 'countdown' && !(settings.minutes >= 1 && settings.minutes <= 240)) {
        page.querySelector('[data-minutes-warn]').textContent = '倒计时需在 1–240 分钟之间';
        minutesInput.focus();
        return;
      }
      start.disabled = true;
      start.textContent = '正在组卷…';
      try {
        const clientId = crypto.randomUUID();
        const {attempt} = await post('self-practice/attempts', {
          clientId,
          course: settings.course,
          topicIds: settings.topics,
          questionCount: settings.count,
          timerMode: settings.timer,
          timeLimitMinutes: settings.timer === 'countdown' ? settings.minutes : 0,
        });
        localStorage.setItem(LAST_KEY, JSON.stringify(settings));
        go('self-practice/attempt/' + encodeURIComponent(attempt.id));
      } catch (error) {
        start.disabled = false;
        start.textContent = '一键开始';
        toast(error.message);
      }
    };
    unitsHost.addEventListener('click', (event) => {
      const all = event.target.closest('[data-unit-all]');
      if (!all) return;
      const host = all.closest('[data-unit]');
      const ids = [...host.querySelectorAll('input[data-topic]')].map((input) => input.dataset.topic);
      settings.topics = all.checked ? [...new Set([...settings.topics, ...ids])] : settings.topics.filter((id) => !ids.includes(id));
      host.querySelectorAll('input[data-topic]').forEach((input) => { input.checked = all.checked; });
      paint();
    });
    updateUnitCheckboxes();
    paint();
    paintRecent(attempts, recent, h);
  }

  function unitMarkup(unit, settings) {
    const checked = unit.topics.filter((topic) => settings.topics.includes(topic.id)).length;
    return `<details class="sp-unit" data-unit="${h(unit.unitId)}" ${checked || unit.unitId.includes('-2') ? 'open' : ''}>
      <summary class="sp-unit-summary"><input type="checkbox" data-unit-all ${checked === unit.topics.length && checked ? 'checked' : ''} aria-label="选择 ${h(unit.title)} 全部章节"><span class="sp-unit-name">${h(unit.title)}</span><span class="sp-unit-total">${unit.questionCount} 题</span></summary>
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
    document.body.append(dialog);
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

  async function attempt(id) {
    main.innerHTML = '<section class="paper sp-loading"><p>正在载入本次练习…</p></section>';
    let attempt;
    try {
      ({attempt} = await api('self-practice/attempts/' + encodeURIComponent(id)));
    } catch (error) {
      main.innerHTML = `<section class="paper sp-error"><h1>暂时无法打开这次练习</h1><p>${h(error.message)}</p><a class="primary" href="#self-practice">返回自主模考</a></section>`;
      return;
    }
    if (attempt.status === 'submitted') { go('self-practice/result/' + encodeURIComponent(id)); return; }
    if (attempt.status === 'created') {
      await preload(attempt.questions[0]);
      try {
        ({attempt} = await post(`self-practice/attempts/${encodeURIComponent(id)}/start`, {}));
      } catch (error) {
        if (error.status === 409) { go('self-practice/result/' + encodeURIComponent(id)); return; }
        toast(error.message);
      }
    }
    const local = readJSON(LOCAL_KEY + id, null);
    const answers = {...attempt.answers, ...(local?.answers || {})};
    const flags = new Set([...(attempt.flags || []), ...(local?.flags || [])]);
    let index = Math.min(attempt.questions.length - 1, Math.max(0, local?.index ?? attempt.index ?? 0));
    let revision = attempt.revision;
    let dirty = Boolean(local?.dirty);
    let saving = null;
    let saveTimer = null;
    let frozen = false;
    let submitted = false;
    let timer = null;

    document.body.classList.add('sp-immersive');
    main.innerHTML = `<section class="sp-run" data-page="run">
  <header class="sp-run-head">
    <button type="button" class="sp-back" data-exit aria-label="退出本次练习">←</button>
    <div class="sp-run-title"><strong>自主模考</strong><span data-progress>${index + 1} / ${attempt.questions.length}</span></div>
    <div class="sp-timer" data-timer role="timer" aria-live="off">${attempt.timerMode === 'countdown' ? formatClock((Date.parse(attempt.deadlineAt) - Date.now()) / 1000) : '00:00'}</div>
    <button type="button" class="sp-flag" data-flag aria-pressed="${flags.has(attempt.questions[index].id)}">${flags.has(attempt.questions[index].id) ? '已标记' : '标记'}</button>
    <button type="button" class="sp-palette-button" data-palette>答题卡</button>
  </header>
  <div class="sp-run-body">
    <div class="sp-question" data-question></div>
    <aside class="sp-rail" data-rail></aside>
  </div>
  <footer class="sp-run-foot">
    <button type="button" class="secondary" data-prev>上一题</button>
    <button type="button" class="secondary" data-palette>答题卡</button>
    <button type="button" class="primary" data-next>${attempt.questions.length === 1 ? '检查并提交' : '下一题'}</button>
  </footer>
  <div class="sp-save-state" data-save role="status">已同步</div>
</section>`;

    const page = main.querySelector('[data-page="run"]');
    const questionHost = page.querySelector('[data-question]');
    const railHost = page.querySelector('[data-rail]');
    const timerHost = page.querySelector('[data-timer]');
    const flagButton = page.querySelector('[data-flag]');
    const progress = page.querySelector('[data-progress]');
    const saveState = page.querySelector('[data-save]');
    const nextButton = page.querySelector('[data-next]');

    const questions = attempt.questions;
    const totalSeconds = () => attempt.timerMode === 'countdown' ? Math.max(0, Math.ceil((Date.parse(attempt.deadlineAt) - serverNow()) / 1000)) : Math.max(0, Math.floor((serverNow() - Date.parse(attempt.startedAt)) / 1000));
    function serverNow() {
      return Date.now() + (attempt.serverOffset || 0);
    }
    attempt.serverOffset = Date.parse(attempt.serverNow || new Date().toISOString()) - Date.now();

    const persistLocal = () => {
      localStorage.setItem(LOCAL_KEY + id, JSON.stringify({answers, flags: [...flags], index, dirty, savedAt: Date.now()}));
    };

    let savedRevConflict = false;
    const sync = async () => {
      if (savedRevConflict) return;
      if (saving) return saving;
      clearTimeout(saveTimer);
      dirty = false;
      saveState.textContent = '正在保存…';
      saving = (async () => {
        try {
          const result = await put(`self-practice/attempts/${encodeURIComponent(id)}/answers`, {revision, answers, flags: [...flags], index});
          revision = result.revision;
          saveState.textContent = '已保存到账号';
          persistLocal();
        } catch (error) {
          dirty = true;
          persistLocal();
          if (error.status === 409) {
            savedRevConflict = true;
            saveState.textContent = '答案已在其他设备更新';
            showConflict();
          } else {
            saveState.textContent = navigator.onLine ? '保存失败，稍后重试' : '未同步 · 已暂存在本机';
          }
        } finally {
          saving = null;
        }
      })();
      return saving;
    };

    const scheduleSave = () => {
      dirty = true;
      saveState.textContent = navigator.onLine ? '正在保存…' : '未同步 · 已暂存在本机';
      persistLocal();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { sync(); }, 450);
    };

    const showConflict = () => {
      const bar = document.createElement('div');
      bar.className = 'sp-conflict';
      bar.innerHTML = `<p>这台设备上的答案尚未写入，另一台设备已经更新了同一份练习。</p><button type="button" class="secondary">重新载入最新版本</button>`;
      bar.querySelector('button').onclick = () => { bar.remove(); attempt(id); };
      page.append(bar);
    };

    const paintQuestion = () => {
      const question = questions[index];
      progress.textContent = `${index + 1} / ${questions.length}`;
      flagButton.setAttribute('aria-pressed', String(flags.has(question.id)));
      flagButton.textContent = flags.has(question.id) ? '已标记' : '标记';
      questionHost.innerHTML = `<article class="sp-card sp-question-card">
        <div class="sp-question-meta"><span>第 ${index + 1} 题</span><span>${h(question.topic)}</span>${question.sourcePages ? `<span>${h(question.sourcePages)}</span>` : ''}<button type="button" class="sp-zoom" data-zoom-toggle aria-pressed="false">放大</button></div>
        <div class="sp-question-images">${question.questionImages.map((fileId) => `<img src="/api/homework/files/${encodeURIComponent(fileId)}" alt="第 ${index + 1} 题原题" loading="eager" decoding="async">`).join('')}</div>
        ${question.prompt ? `<p class="sp-prompt">${h(question.prompt)}</p>` : ''}
        <div class="sp-options" role="radiogroup" aria-label="选择答案">${question.optionLabels.map((label) => `<button type="button" class="sp-option" role="radio" aria-checked="${answers[question.id] === label}" data-choice="${h(label)}"><span>${h(label)}</span>${optionText(question, label) ? `<small>${h(optionText(question, label))}</small>` : ''}</button>`).join('')}</div>
      </article>`;
      questionHost.querySelectorAll('[data-choice]').forEach((button) => {
        button.onclick = () => choose(question.id, button.dataset.choice);
      });
      const zoom = questionHost.querySelector('[data-zoom-toggle]');
      const images = questionHost.querySelector('.sp-question-images');
      zoom.onclick = () => {
        const next = images.dataset.zoom !== 'true';
        images.dataset.zoom = String(next);
        zoom.setAttribute('aria-pressed', String(next));
        zoom.textContent = next ? '缩小' : '放大';
      };
      railHost.innerHTML = railMarkup();
      nextButton.textContent = index === questions.length - 1 ? '检查并提交' : '下一题';
    };

    const choose = (questionId, choice) => {
      if (frozen) return;
      answers[questionId] = choice;
      paintQuestion();
      scheduleSave();
    };
    const goTo = (next) => {
      index = Math.max(0, Math.min(questions.length - 1, next));
      paintQuestion();
      scheduleSave();
    };

    const railMarkup = () => `<div class="sp-rail-card"><h3>答题卡</h3><div class="sp-palette-grid">${questions.map((question, i) => `<button type="button" class="sp-palette-cell" data-jump="${i}" data-state="${answers[question.id] ? 'answered' : 'blank'}${flags.has(question.id) ? ' flagged' : ''}${i === index ? ' current' : ''}" aria-label="第 ${i + 1} 题${answers[question.id] ? '已答' : '未答'}${flags.has(question.id) ? '，已标记' : ''}">${i + 1}</button>`).join('')}</div>
      <div class="sp-legend"><span><i data-dot="answered"></i>已答</span><span><i data-dot="blank"></i>未答</span><span><i data-dot="flagged"></i>标记</span></div>
      <button type="button" class="primary wide" data-review>检查并提交</button></div>`;
    railHost.addEventListener('click', (event) => {
      const jump = event.target.closest('[data-jump]');
      if (jump) { goTo(Number(jump.dataset.jump)); return; }
      if (event.target.closest('[data-review]')) review();
    });

    const paletteDialog = () => {
      const dialog = document.createElement('dialog');
      dialog.className = 'sp-dialog sp-palette-dialog';
      dialog.innerHTML = `<header><h2>答题卡</h2><button type="button" class="sp-icon" data-close aria-label="关闭">×</button></header><div class="sp-palette-grid sp-palette-large">${questions.map((question, i) => `<button type="button" class="sp-palette-cell" data-jump="${i}" data-state="${answers[question.id] ? 'answered' : 'blank'}${flags.has(question.id) ? ' flagged' : ''}${i === index ? ' current' : ''}">${i + 1}</button>`).join('')}</div><footer><button type="button" class="primary wide" data-review>检查并提交</button></footer>`;
      document.body.append(dialog);
      dialog.addEventListener('close', () => dialog.remove());
      dialog.querySelector('[data-close]').onclick = () => dialog.close();
      dialog.querySelectorAll('[data-jump]').forEach((button) => {
        button.onclick = () => { dialog.close(); goTo(Number(button.dataset.jump)); };
      });
      dialog.querySelector('[data-review]').onclick = () => { dialog.close(); review(); };
      dialog.showModal();
    };

    const review = async () => {
      if (frozen) return;
      clearTimeout(saveTimer);
      await sync();
      const unanswered = questions.filter((question) => !answers[question.id]).length;
      const dialog = document.createElement('dialog');
      dialog.className = 'sp-dialog sp-submit-dialog';
      dialog.innerHTML = `<header><h2>检查并提交</h2><button type="button" class="sp-icon" data-close aria-label="关闭">×</button></header>
        <div class="sp-submit-body"><p><strong>${questions.length}</strong> 题中已答 <strong>${questions.length - unanswered}</strong> 题，未答 <strong>${unanswered}</strong> 题。</p>${unanswered ? '<p class="sp-warn">未答题目按 0 分计。提交后不能修改答案。</p>' : '<p class="sp-note">提交后立即出分，并保存到自主模考记录。</p>'}${dirty ? '<p class="sp-warn">还有答案未同步，提交时会一并提交本机答案。</p>' : ''}</div>
        <footer><button type="button" class="secondary" data-close>再看看</button><button type="button" class="primary" data-confirm>确认交卷</button></footer>`;
      document.body.append(dialog);
      dialog.addEventListener('close', () => dialog.remove());
      dialog.querySelectorAll('[data-close]').forEach((button) => (button.onclick = () => dialog.close()));
      dialog.querySelector('[data-confirm]').onclick = () => { dialog.close(); submitPaper(false); };
      dialog.showModal();
    };

    const submitPaper = async (auto) => {
      if (submitted) return;
      submitted = true;
      frozen = true;
      saveState.textContent = auto ? '时间到，正在交卷…' : '正在交卷…';
      clearInterval(timer);
      try {
        await sync();
        const outcome = await post(`self-practice/attempts/${encodeURIComponent(id)}/submit`, {revision, answers, flags: [...flags]});
        localStorage.removeItem(LOCAL_KEY + id);
        document.body.classList.remove('sp-immersive');
        go('self-practice/result/' + encodeURIComponent(id));
      } catch (error) {
        submitted = false;
        frozen = false;
        saveState.textContent = '交卷失败，请重试';
        toast(error.message);
      }
    };

    const tick = () => {
      if (frozen) return;
      const seconds = totalSeconds();
      timerHost.textContent = formatClock(seconds);
      timerHost.dataset.low = attempt.timerMode === 'countdown' && seconds <= 60 ? 'true' : 'false';
      if (attempt.timerMode === 'countdown' && seconds <= 0) {
        frozen = true;
        saveState.textContent = '时间到，正在提交…';
        submitPaper(true);
      }
    };

    const tickTimer = setInterval(tick, 1000);
    timer = tickTimer;
    tick();
    paintQuestion();
    syncState();

    page.querySelectorAll('[data-palette]').forEach((button) => (button.onclick = paletteDialog));
    page.querySelector('[data-prev]').onclick = () => goTo(index - 1);
    nextButton.onclick = () => {
      if (index === questions.length - 1) review();
      else goTo(index + 1);
    };
    flagButton.onclick = () => {
      const key = questions[index].id;
      if (flags.has(key)) flags.delete(key); else flags.add(key);
      paintQuestion();
      scheduleSave();
    };
    page.querySelector('[data-exit]').onclick = () => {
      if (confirm('离开后计时继续。答案已自动保存，回来后可以继续。')) {
        document.body.classList.remove('sp-immersive');
        go('self-practice');
      }
    };
    const keyHandler = (event) => {
      if (event.target.matches('input,textarea,select')) return;
      const letter = event.key.toUpperCase();
      const question = questions[index];
      if (question.optionLabels.includes(letter)) { event.preventDefault(); choose(question.id, letter); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1); }
    };
    document.addEventListener('keydown', keyHandler);
    const online = () => { if (dirty) sync(); };
    window.addEventListener('online', online);
    destroy = () => {
      document.removeEventListener('keydown', keyHandler);
      window.removeEventListener('online', online);
      document.body.classList.remove('sp-immersive');
      clearInterval(timer);
      clearTimeout(saveTimer);
    };

    function syncState() {
      saveState.textContent = navigator.onLine ? '已同步' : '未同步 · 已暂存在本机';
      if (local?.dirty) scheduleSave();
      else if (!local && dirty) scheduleSave();
    }
  }

  function optionText(question, label) {
    return question.optionText?.[label] || '';
  }

  function preload(question) {
    const first = question?.questionImages?.[0];
    if (!first) return Promise.resolve();
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = image.onerror = () => resolve();
      image.src = '/api/homework/files/' + encodeURIComponent(first);
    });
  }

  async function result(id) {
    main.innerHTML = '<section class="paper sp-loading"><p>正在读取成绩…</p></section>';
    let attempt;
    try {
      ({attempt} = await api('self-practice/attempts/' + encodeURIComponent(id) + '/result'));
    } catch (error) {
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

    main.querySelectorAll('[data-again]').forEach((button) => {
      button.onclick = async () => {
        const last = readJSON(LAST_KEY, null);
        if (!last) { go('self-practice'); return; }
        const clientId = crypto.randomUUID();
        try {
          const {attempt: next} = await post('self-practice/attempts', {
            clientId,
            course: attempt.course,
            topicIds: attempt.topicIds,
            questionCount: attempt.questions.length,
            timerMode: attempt.timerMode,
            timeLimitMinutes: attempt.timeLimitMinutes,
          });
          go('self-practice/attempt/' + encodeURIComponent(next.id));
        } catch (error) { toast(error.message); }
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
            await post(`self-practice/attempts/${encodeURIComponent(attempt.id)}/correct`, {questionId: question.id, choice: picked, note: box.querySelector('textarea').value});
            box.remove();
            item.querySelector('[data-correct]').hidden = false;
            item.querySelector('[data-correction-note]').textContent = `已订正为 ${picked}（记录订正，不改分）`;
            item.querySelector('[data-correction-note]').hidden = false;
            toast('订正已保存');
          } catch (error) { box.querySelector('.sp-warn').textContent = error.message; }
        };
      };
    });
    const last = {course: attempt.course, topics: attempt.topicIds, count: attempt.questions.length, timer: attempt.timerMode, minutes: attempt.timeLimitMinutes || 25};
    saveCreate(last);
    localStorage.setItem(LAST_KEY, JSON.stringify(last));
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
      <div class="sp-wrong-actions"><button type="button" class="secondary" data-correct>重新选择并订正</button>${question.knowledge ? `<span class="sp-chip">${h(question.knowledge)}</span>` : ''}</div>
    </article>`;
  }

  return {
    async render(route, id) {
      if (destroy) { destroy(); destroy = null; }
      if (route === 'attempt' && id) await attempt(id);
      else if (route === 'result' && id) await result(id);
      else await creation();
    },
    destroy() {
      if (destroy) { destroy(); destroy = null; }
    },
  };
}
