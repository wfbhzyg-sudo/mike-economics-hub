import {studyReportMarkup} from './study-workflow.js';
import {classKey} from './course-scope.js';
import {studentHomeSummary} from './student-home-model.js';

const DAY = 86400000;

function dueLabel(assignment, now) {
  const due = Date.parse(assignment.dueAt || '');
  if (!Number.isFinite(due)) return '未设置截止时间';
  const when = new Date(due);
  const time = when.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', hour12: false});
  if (due < now) return `已过截止 · ${when.toLocaleDateString('zh-CN', {month: 'numeric', day: 'numeric'})}`;
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const target = new Date(due); target.setHours(0, 0, 0, 0);
  const days = Math.round((target - start) / DAY);
  if (days <= 0) return `今天 ${time} 截止`;
  if (days === 1) return `明天 ${time} 截止`;
  return `还有 ${days} 天 · ${when.toLocaleDateString('zh-CN', {month: 'numeric', day: 'numeric'})} ${time} 截止`;
}

function stateLabel(key) {
  return {done: '已出分', processing: '批阅中', todo: '待完成', closed: '已截止'}[key] || '待完成';
}

function hero(summary, {h, link, date, now}) {
  const next = summary.next;
  if (!next) {
    return `<article class="sh-hero sh-hero-empty">
      <div><p class="sh-eyebrow">最近截止</p><h2>暂时没有待完成的作业</h2>
      <p class="sh-saved">已完成的成绩与订正入口在这里。</p></div>
      <div class="sh-actions">${link('grades', '查看成绩', 'secondary')}${summary.corrections.open ? link('mistakes', `去订正 ${summary.corrections.open} 题`, 'primary') : ''}</div>
    </article>`;
  }
  const {assignment, progress, action, target} = next;
  const percent = progress.total ? Math.round((progress.answered / progress.total) * 100) : null;
  const primary = target && action !== '尚未开放'
    ? link(target, action, 'primary')
    : `<span class="sh-action-disabled">${h(action)}</span>`;
  const saved = [
    progress.total ? `已保存 ${progress.answered}/${progress.total} 题` : progress.answered ? `已保存 ${progress.answered} 题` : '还没有保存作答',
    next.state.draft?.updatedAt ? `上次保存 ${date(next.state.draft.updatedAt)}` : '',
  ].filter(Boolean).join(' · ');
  return `<article class="sh-hero">
    <div class="sh-hero-main">
      <p class="sh-eyebrow">最近截止 · ${h(dueLabel(assignment, now))}</p>
      <h2>${h(assignment.title)}</h2>
      <p class="sh-meta">${h(assignment.libraryUnit || assignment.course || '')}${assignment.format ? ` · ${h(assignment.format === 'mcq' ? '选择题' : '作业')}` : ''}</p>
      ${progress.total ? `<div class="sh-meter" role="img" aria-label="已保存 ${progress.answered}/${progress.total} 题"><span style="width:${percent}%"></span></div>` : ''}
      <p class="sh-saved">${h(saved)}${next.state.key === 'processing' ? ' · 已提交，等待批阅' : ''}</p>
      <div class="sh-actions">${primary}${summary.corrections.open ? link('mistakes', `待订正 ${summary.corrections.open} 题`, 'secondary') : ''}</div>
    </div>
    <div class="sh-hero-side">
      <a class="sh-stat" href="#grades"><span>最近成绩</span><strong>${summary.recent[0]?.rate != null ? summary.recent[0].rate + '%' : '—'}</strong><small>${summary.recent[0] ? h(summary.recent[0].assignment?.title || '最近一次作业') : '还没有已发布成绩'}</small></a>
      <a class="sh-stat" href="#mistakes"><span>待订正</span><strong>${summary.corrections.open}</strong><small>${summary.corrections.review ? `另有 ${summary.corrections.review} 题待复核` : '去错题集 ›'}</small></a>
    </div>
  </article>`;
}

function trail(summary, h) {
  if (summary.trail.items.length < 2) return '';
  return `<section class="sh-trail" aria-labelledby="sh-trail-title">
    <header><h2 id="sh-trail-title">${summary.trail.unit ? h(summary.trail.unit) + ' · ' : ''}本单元作业进度</h2>${summary.trail.items.length > 4 ? '<span class="sh-trail-count">' + summary.trail.items.length + ' 次</span>' : ''}</header>
    <ol>${summary.trail.items.map(item => `<li data-state="${item.key}">
      <span class="sh-dot" aria-hidden="true"></span>
      <span class="sh-trail-name">${h(item.assignment.title)}</span>
      <span class="sh-trail-meta">${item.rate != null ? item.rate + '%' : h(stateLabel(item.key))}</span>
    </li>`).join('')}</ol>
  </section>`;
}

function reminders(summary, h) {
  return `<section class="sh-reminders" aria-labelledby="sh-reminders-title">
    <h2 id="sh-reminders-title">学习提醒</h2>
    <ul>${summary.reminders.map(text => `<li>${h(text)}</li>`).join('')}</ul>
  </section>`;
}

export function insightsMarkup(state, h) {
  const insights = Array.isArray(state.learning?.insights) ? state.learning.insights.slice(0, 1) : [];
  if (!insights.length) return '';
  return insights.map(report => `<section class="sh-insights" aria-label="老师的学习建议">
    <header class="sh-insights-head"><h2>${h(state.classes?.find(c=>classKey(c.id)===classKey(report.scope?.classId))?.name||"老师")} · 学习建议</h2><span class="sh-insights-date">${h(new Date(report.publishedAt).toLocaleDateString('zh-CN'))} 发布</span></header>
    ${studyReportMarkup(report)}
  </section>`).join('');
}

export function studentHomeMarkup({state, h, link, date, now = Date.now()}) {
  const summary = studentHomeSummary({
    assignments: state.assignments || [],
    submissions: state.submissions || [],
    mistakes: state.learning?.mistakes || [],
    now,
  });
  const trailMarkup = trail(summary, h);
  return `<div class="sh-home" id="student-home">
    ${hero(summary, {h, link, date, now})}
    <div class="sh-home-lower${trailMarkup ? '' : ' sh-home-lower-single'}">${trailMarkup}${reminders(summary, h)}</div>
    ${insightsMarkup(state, h)}
  </div>`;
}
