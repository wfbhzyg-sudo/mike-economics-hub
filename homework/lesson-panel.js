import {exampleMarkup,bindExamples} from './lesson-examples.js';
import {namedCourse} from './course-scope.js';
import {reviewLinksMarkup} from './review-links.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const anchors = [
  ['goals', 'Learning goals'],
  ['rule', 'Core relationship'],
  ['apply', 'How to apply it'],
  ['pitfall', 'Common pitfalls'],
];

export function focusMarkup(focus, {canPin = false} = {}) {
  if (!focus) return '<p class="lesson-panel-status">This topic’s study notes are being prepared.</p>';
  const primaryTerm = focus.terms?.[0]?.[0];
  const source = focus.source;
  const citation = source.filePage
    ? `${source.book} · PDF p. ${source.filePage} · printed p. ${source.printedPage}`
    : `${source.book} · ${source.path.join(' › ')}`;
  const sections = {
    goals: [...new Set([focus.goal, ...focus.goals])],
    rule: [focus.rule],
    apply: [focus.apply],
    pitfall: [...new Set([focus.pitfall, ...focus.pitfalls])],
  };
  const text = value => {
    const pos = primaryTerm ? value.toLowerCase().indexOf(primaryTerm.toLowerCase()) : -1;
    return pos === -1 ? escape(value) : escape(value.slice(0, pos)) +
      '<strong><u>' + escape(value.slice(pos, pos + primaryTerm.length)) + '</u></strong>' +
      escape(value.slice(pos + primaryTerm.length));
  };
  if (focus.examples?.some(item=>item.clue)) {
    return `<article class="lesson-focus-content" lang="en">
      <p class="lf-intro">${text(focus.concept || focus.goal)}</p>
      ${exampleMarkup(focus.examples,escape,{focus,canPin})}
      <p class="lesson-focus-source">${escape(citation)}</p>
    </article>`;
  }
  return `<article class="lesson-focus-content" lang="en">
    <div class="lesson-focus-terms">${focus.terms.map(([term, zh]) =>
      `<span><strong><u>${escape(term)}</u></strong> <span lang="zh-CN">${escape(zh)}</span></span>`).join('')}</div>
    ${exampleMarkup(focus.examples,escape)}
    ${anchors.map(([id, title]) => `<section id="focus-${id}" data-focus=${id} tabindex="-1"><h2>${title}</h2>
      ${sections[id].length > 1 ? '<ul>' + sections[id].map(item => '<li>' + text(item) + '</li>').join('') + '</ul>' : '<p>' + text(sections[id][0]) + '</p>'}
      ${canPin && (id === 'rule' || id === 'apply') ? `<button type="button" class="lesson-pin" data-pin="${id}" lang="zh-CN">固定这条重点</button>` : ''}
    </section>`).join('')}
    <p class="lesson-focus-source">${escape(citation)}</p>
  </article>`;
}

export function revealFocus(root, id) {
  if (!['focus-goals','focus-rule','focus-apply','focus-pitfall'].includes(id)) return null;
  const target = root.querySelector('#'+id);
  for (let el=target?.parentElement; el && el!==root; el=el.parentElement) {
    if (el.tagName==='DETAILS') el.open=true;
    if (el.classList.contains('lf-transfer')) el.hidden=false;
  }
  return target;
}

function referenceFor(question, context) {
  const supplied = question.lessonReference || {};
  const explicit = question.libraryUnit || question.unitId || supplied.unit || context.libraryUnit;
  const course = namedCourse(context.course || question.course);
  const topic = question.topic || supplied.topic || String(question.knowledge || '').match(/^Topic\s+([1-6]\.\d+)(?=\s|$)/i)?.[1] || '';
  const unit = /^(micro|macro)-unit-[1-6]$/.test(explicit || '') ? explicit :
    /^[1-6]\.\d+$/.test(topic) && ['macro','micro'].includes(course) ? `${course}-unit-${topic[0]}` : '';
  return {unit, topic, bank: supplied.bank || ''};
}

export function mountLessonLinks(root, api) {
  let dialog, request, opener, media, current;
  function close(restore = false) {
    request?.abort();
    request = null;
    dialog?.removeEventListener('cancel', cancel);
    if (dialog?.open) dialog.close();
    dialog?.remove();
    dialog = null;
    media?.removeEventListener('change', changeMode);
    if (restore && opener?.isConnected) opener.focus({preventScroll:true});
  }
  function cancel(event) { event.preventDefault(); close(true); }
  function changeMode() {
    if (!dialog?.open) return;
    dialog.close();
    if (media.matches) dialog.showModal();
    else dialog.show();
  }
  async function show(reference) {
    request?.abort();
    const controller = new AbortController();
    request = controller;
    const body = dialog.querySelector('[data-lesson-body]');
    const heading = dialog.querySelector('h2');
    body.innerHTML = '<p role="status">正在打开学习重点…</p>';
    try {
      const params = new URLSearchParams(Object.entries(reference).filter(([,value]) => value));
      const data = await api('library/focus?' + params, {signal: controller.signal});
      if (controller.signal.aborted) return;
      heading.textContent = data.topic ? `${data.topic.id} ${data.topic.title || ''}` : `${data.unit.title} · 学习重点`;
      body.innerHTML = data.topic ? focusMarkup(data.focus, {canPin: Boolean(current.pinHost)}) :
        `<p>选择本单元的主题</p><div class="lesson-directory">${data.topics.map(t =>
          `<button type="button" data-lesson-topic="${escape(t.id)}">${escape(t.id + ' ' + (t.title || ''))}</button>`).join('')}</div>`;
      if (data.topic) {
        bindExamples(body,data.focus?.examples);
        const path = '#library/' + encodeURIComponent(data.unit.id) + '/' + encodeURIComponent(data.topic.id);
        body.insertAdjacentHTML('beforeend', `<div class="lesson-panel-links">
          <a target="_blank" rel="noopener" href="/homework/${path}">打开教学包 ↗</a>
          ${data.hasTextbook ? `<a target="_blank" rel="noopener" href="/homework/${path}/textbook">查看教材原页 ↗</a>` : ''}
        </div>`);
      }
      if (current.review) body.insertAdjacentHTML('beforeend', reviewLinksMarkup(current.review,escape,{compact:true}));
      body.querySelectorAll('[data-lesson-topic]').forEach(button => {
        button.onclick = () => show({unit:data.unit.id,topic:button.dataset.lessonTopic});
      });
      body.querySelectorAll('[data-pin],[data-pin-example]').forEach(button => {
        button.onclick = () => {
          const host = current.pinHost;
          const item=button.hasAttribute('data-pin-example') ? data.focus.examples[Number(button.dataset.pinExample)] : null;
          const label=item?.term || data.topic.title || '';
          const note=item ? item.rule+' '+item.coach : data.focus[button.dataset.pin];
          host.innerHTML = `<strong>已固定 · ${escape(data.topic.id+' '+label)}</strong>
            <button type="button" aria-label="移除固定重点">×</button><p lang="en">${escape(note)}</p>`;
          host.hidden = false;
          host.querySelector('button').onclick = () => {
            host.hidden = true;
            host.replaceChildren();
            opener?.focus({preventScroll:true});
          };
          close(true);
        };
      });
      const target = revealFocus(body,current.anchor);
      if (target) body.scrollTop = target.offsetTop;
      else body.scrollTop = 0;
    } catch (error) {
      if (controller.signal.aborted) return;
      body.innerHTML = error.status === 403 ? '<p role="status">老师尚未向你的班级开放这份教学包。</p>' :
        error.status === 404 ? '<p role="status">这道题的对应章节尚未关联，或教学资料仍在准备。</p>' :
        '<p role="alert">学习重点暂时无法加载。</p><button type="button" data-retry-lesson>重试</button>';
      const retry = body.querySelector('[data-retry-lesson]');
      if (retry) retry.onclick = () => show(reference);
      if (current.review) body.insertAdjacentHTML('beforeend', reviewLinksMarkup(current.review,escape,{compact:true}));
    }
  }
  function mount(host, question, context = {}) {
    if (!host || !root.contains(host)) return;
    const reference = referenceFor(question || {}, context);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lesson-link';
    button.setAttribute('aria-haspopup','dialog');
    const topicTitle = String(question?.knowledge || '').match(/^Topic\s+[1-6]\.\d+\s*·\s*(.+)/i)?.[1];
    const label = context.compact ? '' : reference.topic ? [reference.topic,topicTitle].filter(Boolean).join(' ') : reference.unit ? 'Unit ' + reference.unit.at(-1) : '';
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 5h5a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H3zM21 5h-5a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h5z"/></svg><span>查看重点' + (label ? ' · ' + escape(label) : '') + '</span>';
    if (context.compact && reference.topic) button.title = '查看重点 · ' + reference.topic;
    button.onclick = () => {
      close();
      current = context;
      opener = button;
      dialog = document.createElement('dialog');
      dialog.className = 'lesson-panel';
      dialog.setAttribute('aria-label','学习重点');
      dialog.innerHTML = `<header><div><small>课程教学包</small><h2>学习重点</h2></div>
        <button type="button" data-lesson-close>${context.number ? '回到第 ' + escape(context.number) + ' 题' : '返回题目'}</button></header>
        <div data-lesson-body></div>`;
      dialog.querySelector('[data-lesson-close]').onclick = () => close(true);
      dialog.addEventListener('cancel', cancel);
      dialog.addEventListener('keydown', event => {
        if(event.key==='Escape'){cancel(event);return;}
        if(event.key!=='Tab')return;
        const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length);
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      });
      dialog.addEventListener('click', event => { if (event.target === dialog && event.clientX > dialog.getBoundingClientRect().right) close(true); });
      document.body.append(dialog);
      media = matchMedia('(max-width: 900px)');
      media.addEventListener('change', changeMode);
      if (media.matches) dialog.showModal();
      else dialog.show();
      dialog.querySelector('[data-lesson-close]').focus({preventScroll:true});
      if (reference.unit || reference.bank) void show(reference);
      else dialog.querySelector('[data-lesson-body]').innerHTML = '<p role="status">这道题尚未关联课程章节。</p>' + reviewLinksMarkup(context.review,escape,{compact:true});
    };
    host.append(button);
  }
  return {mount, destroy:close};
}
