import {scoreMaximum} from './score-entry.js';
// Teacher-facing learning overview: class matrix, student profiles and
// assignment-level detail. Data comes from the existing /learning payload so
// this page can never invent a second source of truth for grades.
import {scoreBand,accuracyBadge} from './score-bands.js';
import {viewMemory} from './view-memory.js';
import {highlightText} from './search-text.js';
import {gradeCSV} from './grade-journey-model.js';
import {
  PERIODS, STATUS_FILTERS, scopedAssignments, scopedStudents, assignmentLabel,
  buildRows, overviewStats, questionStats, studentProfile, rowStatus,
  formatPercent, trendLabel, unitsOf, scopeCaption, workDate,
  typeBreakdown, correctionSummary, assignmentHistory, studentObservations,
  classObservations, reportText, assignmentDiagnostics, orderedDiagnosisQuestions, newestAssignmentFirst,
} from './learning-analytics-model.js';

const SORTS = [['name', '学生姓名'], ['average', '平均分'], ['attention', '待处理'], ['trend', '近期变化']];
const TYPES = {mcq: 'MCQ', choice: '选择题', frq: 'FRQ', short: '简答题'};
const TYPE_ORDER = ['graded', 'attention', 'pending', 'todo', 'missing', 'unconfirmed', 'unassigned'];
const round = value => Math.round(value * 10) / 10;
const monthDay = value => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('zh-CN', {month: 'numeric', day: 'numeric'}).format(date) : '';
};
const longDate = value => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('zh-CN', {year: 'numeric', month: 'numeric', day: 'numeric'}).format(date) : '';
};
const trim = (text, length) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  return value.length > length ? value.slice(0, length - 1) + '…' : value;
};
const initial = name => String(name || '?').trim().slice(0, 1).toUpperCase();

export function mountLearningOverview(ctx, initialData) {
  const {state, main, h, toast} = ctx;
  const link = ctx.link;
  const ai = ctx.ai || null;
  let data = initialData;
  let destroyed = false;
  const classes = state.meta?.classes || [];
  const memory = viewMemory(`${state.user.id}:learning-overview:${state.classId || 'all'}`);
  const storedSelection = memory.get('selection', null);
  const storedFilter = memory.get('filter', {}) || {};
  const rememberedClass = storedFilter.classId || state.classId || '';
  const filter = {
    classId: classes.some(item => item.id === rememberedClass) ? rememberedClass : (classes[0]?.id || ''),
    unit: '', period: PERIODS.some(([id]) => id === storedFilter.period) ? storedFilter.period : '4w',
    assignmentId: '', query: '', status: 'all',
    sort: SORTS.some(([id]) => id === storedFilter.sort) ? storedFilter.sort : 'name',
    direction: storedFilter.direction === 'desc' ? 'desc' : 'asc',
  };
  if (filter.sort !== 'name') filter.direction = filter.direction === 'asc' ? 'asc' : 'desc';
  const storedTab = memory.get('tab', 'matrix');
  let tab = ['matrix', 'students', 'diagnosis'].includes(storedTab) ? storedTab : 'matrix';
  let diagId = typeof memory.get('diagId', '') === 'string' ? memory.get('diagId', '') : '';
  let diagQuestion = typeof memory.get('diagQuestion', '') === 'string' ? memory.get('diagQuestion', '') : '';
  let diagOrder=memory.get('diagOrder','number');
  const originalReaders=new Map();
  let lastAiScope=null,aiGeneration=0;
  let diagOpen = memory.get('diagOpen', false) === true;
  let mobileView = memory.get('mobileView', 'list') === 'grid' ? 'grid' : 'list';
  let selected = storedSelection && typeof storedSelection === 'object' ? storedSelection : null;
  let profileId = memory.get('profileId', '');
  let questionCache = new Map();
  let context = {assignments: [], rows: [], visible: [], stats: null};
  // Reports are deterministic rule summaries, kept so the copy button can hand
  // the teacher the same facts that are on screen without re-querying anything.
  let classReport = null;
  let profileReports = new Map();
  let aiReport = null;
  let sheetTrigger = null;
  let diagTrigger = null;
  const wide = matchMedia('(min-width:1280px)');
  const small = matchMedia('(max-width:767px)');

  main.innerHTML = `<section class="lo-page" id="lo-page" data-tab="${tab}" data-mview="${mobileView}">
  <div class="lo-toolbar" role="group" aria-label="学情范围与筛选">
    <label class="lo-field" id="lo-class-field"><span>班级</span><select id="lo-class"></select></label>
    <label class="lo-field" id="lo-unit-field"><span>单元</span><select id="lo-unit"></select></label>
    <label class="lo-field"><span>范围</span><select id="lo-period"></select></label>
    <label class="lo-field" id="lo-assignment-field"><span>作业</span><select id="lo-assignment"></select></label>
    <label class="lo-search"><span class="lo-sr">查找学生</span><input id="lo-query" type="search" placeholder="查找学生姓名或账号" autocomplete="off" spellcheck="false"></label>
    <button type="button" class="lo-btn lo-filter" id="lo-filter" aria-haspopup="dialog" aria-expanded="false">筛选<i class="lo-filter-count" hidden></i></button>
    <button type="button" class="lo-btn lo-icon" id="lo-refresh" title="刷新数据" aria-label="刷新数据"><span aria-hidden="true">↻</span></button>
    <details class="lo-more" id="lo-more">
      <summary class="lo-btn lo-icon" title="更多操作" aria-label="更多操作"><span aria-hidden="true">⋯</span></summary>
      <div class="lo-menu" role="menu">
        <button type="button" role="menuitem" data-action="export">导出当前范围 CSV</button>
        ${ai ? '<button type="button" role="menuitem" data-action="ai-report">生成学情分析</button><button type="button" role="menuitem" data-action="report-history">报告历史</button>' : ''}
        <button type="button" role="menuitem" data-action="class-report">班级学情摘要</button>
        <button type="button" role="menuitem" data-action="legend">五色分档说明</button>
        <button type="button" role="menuitem" data-action="clear">清除筛选与排序</button>
      </div>
    </details>
    ${ai ? '<button type="button" class="lo-btn lo-primary lo-ai" id="lo-ai" data-action="ai-report" aria-label="生成学情分析"><span aria-hidden="true">✦</span><span class="lo-ai-label">生成学情分析</span></button>' : ''}
  </div>
  <div class="lo-stats" id="lo-stats" aria-live="polite"></div>
  <div class="lo-tabs" role="tablist" aria-label="学情视图">
    <button type="button" role="tab" id="lo-tab-matrix" aria-controls="lo-panel-matrix" aria-selected="${tab === 'matrix'}" tabindex="${tab === 'matrix' ? 0 : -1}" data-tab="matrix">成绩总览</button>
    <button type="button" role="tab" id="lo-tab-diagnosis" aria-controls="lo-panel-diagnosis" aria-selected="${tab === 'diagnosis'}" tabindex="${tab === 'diagnosis' ? 0 : -1}" data-tab="diagnosis">题目诊断</button>
    <button type="button" role="tab" id="lo-tab-students" aria-controls="lo-panel-students" aria-selected="${tab === 'students'}" tabindex="${tab === 'students' ? 0 : -1}" data-tab="students">学情报告</button>
    <span class="lo-tab-note" id="lo-count"></span>
  </div>
  <div class="lo-body" id="lo-body">
    <div class="lo-panel" id="lo-panel-matrix" role="tabpanel" aria-labelledby="lo-tab-matrix" ${tab === 'matrix' ? '' : 'hidden'}>
      <div class="lo-switch" role="group" aria-label="手机查看方式">
        <button type="button" data-mview="list" aria-pressed="${mobileView === 'list'}">学生列表</button>
        <button type="button" data-mview="grid" aria-pressed="${mobileView === 'grid'}">成绩矩阵</button>
      </div>
      <div class="lo-matrix-scroll" id="lo-matrix-scroll" tabindex="0" role="region" aria-label="班级成绩矩阵，可横向滚动">
        <table class="lo-matrix" id="lo-matrix"></table>
      </div>
      <div class="lo-list" id="lo-list"></div>
      <div class="lo-empty" id="lo-empty" hidden></div>
    </div>
    <div class="lo-panel" id="lo-panel-diagnosis" role="tabpanel" aria-labelledby="lo-tab-diagnosis" ${tab === 'diagnosis' ? '' : 'hidden'}>
      <div class="lo-diag-layout" id="lo-diag-layout">
        <div class="lo-diag-list" id="lo-diag-list" aria-label="作业列表"></div>
        <div class="lo-diag" id="lo-diag" tabindex="-1"></div>
      </div>
    </div>
    <div class="lo-panel" id="lo-panel-students" role="tabpanel" aria-labelledby="lo-tab-students" ${tab === 'students' ? '' : 'hidden'}>
      <div class="lo-profile-layout" id="lo-profile-layout">
        <div class="lo-profile-list" id="lo-profile-list" aria-label="学生列表"></div>
        <div class="lo-profile" id="lo-profile"></div>
      </div>
    </div>
    <aside class="lo-detail" id="lo-detail" aria-label="成绩详情"></aside>
  </div>
  <dialog class="lo-sheet" id="lo-sheet" aria-label="成绩详情">
    <div class="lo-sheet-bar"><strong id="lo-sheet-title">成绩详情</strong><button type="button" class="lo-btn" data-close-detail>关闭</button></div>
    <div class="lo-sheet-body" id="lo-sheet-body"></div>
  </dialog>
  <dialog class="lo-sheet lo-filter-sheet" id="lo-filter-sheet" aria-label="筛选与排序">
    <div class="lo-sheet-bar"><strong>筛选与排序</strong><button type="button" class="lo-btn" data-close-filter>关闭</button></div>
    <div class="lo-filter-grid">
      <label class="lo-field"><span>单元</span><select id="lo-filter-unit"></select></label>
      <label class="lo-field"><span>作业</span><select id="lo-filter-assignment"></select></label>
      <label class="lo-field"><span>排序</span><select id="lo-filter-sort"></select></label>
      <label class="lo-field"><span>只看</span><select id="lo-filter-status"></select></label>
      <label class="lo-field lo-wide"><span>查找学生</span><input id="lo-filter-query" type="search" placeholder="姓名或账号" autocomplete="off"></label>
    </div>
    <div class="lo-sheet-actions"><button type="button" class="lo-btn" data-filter-reset>重置</button><button type="button" class="lo-btn lo-primary" data-filter-apply>应用</button></div>
  </dialog>
  <dialog class="lo-sheet lo-legend-sheet" id="lo-legend-sheet" aria-label="五色分档说明">
    <div class="lo-sheet-bar"><strong>五色分档 · 课堂参考</strong><button type="button" class="lo-btn" data-close-legend>关闭</button></div>
    <div class="lo-legend-body"></div>
  </dialog>
  <dialog class="lo-sheet lo-report-sheet" id="lo-report-sheet" aria-label="班级学情摘要">
    <div class="lo-sheet-bar"><strong>班级学情摘要</strong><button type="button" class="lo-btn" data-close-report>关闭</button></div>
    <div class="lo-report-body" id="lo-report-body"></div>
  </dialog>
  <dialog class="lo-sheet lo-ai-sheet" id="lo-ai-sheet" aria-label="学情分析草稿">
    <div class="lo-sheet-bar"><strong id="lo-ai-title">学情分析草稿</strong><button type="button" class="lo-btn" data-close-ai>关闭</button></div>
    <div class="lo-ai-body" id="lo-ai-body"></div>
  </dialog>
  <dialog class="lo-sheet lo-hist-sheet" id="lo-hist-sheet" aria-label="报告历史">
    <div class="lo-sheet-bar"><strong>报告历史</strong><button type="button" class="lo-btn" data-close-history>关闭</button></div>
    <div class="lo-ai-body" id="lo-hist-body"></div>
  </dialog>
</section>`;

  const root = document.getElementById('lo-page');
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const statsHost = $('#lo-stats');
  const matrixHost = $('#lo-matrix');
  const scrollHost = $('#lo-matrix-scroll');
  const listHost = $('#lo-list');
  const emptyHost = $('#lo-empty');
  const detailHost = $('#lo-detail');
  const sheet = $('#lo-sheet');
  const sheetBody = $('#lo-sheet-body');
  const filterSheet = $('#lo-filter-sheet');
  const legendSheet = $('#lo-legend-sheet');
  const reportSheet = $('#lo-report-sheet');
  const aiSheet = $('#lo-ai-sheet');
  const aiBody = $('#lo-ai-body');
  const histSheet = $('#lo-hist-sheet');
  const histBody = $('#lo-hist-body');
  const diagLayout = $('#lo-diag-layout');
  const diagList = $('#lo-diag-list');
  const diagHost = $('#lo-diag');

  // ---------- options and filters ----------
  function fill(select, options, value) {
    if (!select) return;
    const html = options.map(([id, label]) => `<option value="${h(id)}"${String(id) === String(value) ? ' selected' : ''}>${h(label)}</option>`).join('');
    if (select.innerHTML !== html) select.innerHTML = html;
    select.value = String(value ?? '');
  }

  function assignmentOptions(scope) {
    return [['', '全部作业'], ...scope.slice().sort(newestAssignmentFirst).map(assignment => [assignment.id, `${assignmentLabel(assignment)} · ${monthDay(workDate(assignment))}`])];
  }

  function draw() {
    if (destroyed) return;
    const classScope = scopedAssignments(data, {classId: filter.classId, period: 'all'});
    const units = unitsOf(classScope);
    if (filter.unit && !units.includes(filter.unit)) filter.unit = '';
    if (filter.assignmentId && !classScope.some(item => item.id === filter.assignmentId)) filter.assignmentId = '';
    const unitScope = filter.unit ? classScope.filter(item => item.libraryUnit === filter.unit) : classScope;

    fill($('#lo-class'), [['', '全部班级'], ...classes.map(item => [item.id, `${item.name}${item.archived ? ' · 已归档' : ''}`])], filter.classId);
    $('#lo-unit-field').hidden = units.length < 2;
    fill($('#lo-unit'), [['', '全部单元'], ...units.map(unit => [unit, unit])], filter.unit);
    fill($('#lo-period'), PERIODS, filter.period);
    fill($('#lo-assignment'), assignmentOptions(unitScope), filter.assignmentId);
    if ($('#lo-query').value !== filter.query) $('#lo-query').value = filter.query;

    const assignments = scopedAssignments(data, {classId: filter.classId, unit: filter.unit, period: filter.period, assignmentId: filter.assignmentId});
    const students = scopedStudents(data, {classId: filter.classId, assignments});
    const rows = buildRows(data, students, assignments);
    const stats = overviewStats(rows, assignments);
    const studentIds=new Set(students.map(student=>student.id));
    const diagnosticData={...data,submissions:data.submissions.filter(s=>studentIds.has(s.studentId))};
    const diagnoses = assignmentDiagnostics(diagnosticData, assignments);
    questionCache = new Map();

    const needle = filter.query.trim().toLowerCase();
    let visible = needle ? rows.filter(row => `${row.student.name || ''} ${row.student.username || ''}`.toLowerCase().includes(needle)) : rows.slice();
    if (filter.status === 'missing') visible = visible.filter(row => row.missing > 0);
    else if (filter.status === 'review') visible = visible.filter(row => row.needsReview > 0);
    else if (filter.status === 'attention') visible = visible.filter(row => row.attention > 0 || row.missing > 0 || row.needsReview > 0 || row.openCorrections > 0);
    visible = sortRows(visible);
    if (profileId && !visible.some(row => row.student.id === profileId)) profileId = '';

    context = {assignments, rows, visible, stats, diagnoses, diagnosticData};
    if (selected && !findSelection()) selected = null;
    const {timer, ...savedFilter} = filter;
    memory.set({filter: savedFilter, tab, mobileView, profileId, selection: selected, diagId, diagQuestion, diagOpen});

    renderStats(stats, assignments);
    renderCount(visible.length, rows.length);
    renderMatrix(assignments, visible);
    renderList(visible);
    renderStudents(visible);
    renderDiagnosis(diagnoses);
    renderDetail();
    renderFilterState(units, unitScope);
    updateEmpty(rows, visible);
  }

  function sortRows(rows) {
    const direction = filter.direction === 'desc' ? -1 : 1;
    const rank = row => (row.attention + row.missing + row.needsReview + row.openCorrections);
    return [...rows].sort((a, b) => {
      let result;
      if (filter.sort === 'average') result = (a.average ?? -1) - (b.average ?? -1);
      else if (filter.sort === 'attention') result = rank(a) - rank(b) || String(a.student.name).localeCompare(String(b.student.name), 'zh-Hans-CN');
      else if (filter.sort === 'trend') result = (a.trend ?? -999) - (b.trend ?? -999);
      else result = String(a.student.name || '').localeCompare(String(b.student.name || ''), 'zh-Hans-CN');
      return result * direction;
    });
  }

  function sortBy(key) {
    if (!SORTS.some(([id]) => id === key)) return;
    if (filter.sort === key) filter.direction = filter.direction === 'asc' ? 'desc' : 'asc';
    else {
      filter.sort = key;
      filter.direction = key === 'name' ? 'asc' : 'desc';
    }
    draw();
    const header = root.querySelector(`[data-sort="${key}"]`);
    header?.focus({preventScroll: true});
  }

  // ---------- stats, tabs, count ----------
  function renderStats(stats, assignments) {
    if (!stats) return;
    const multi = assignments.length > 1;
    const suffix = multi ? ' 人次' : '';
    const review = stats.needsReview;
    statsHost.innerHTML = `<div class="lo-stat"><span>已交</span><strong>${stats.submitted}<small>/${stats.due}${suffix}</small></strong></div>
      <div class="lo-stat"><span>已发布</span><strong>${stats.published}<small>/${stats.due}${suffix}</small></strong></div>
      <div class="lo-stat"><span>平均</span><strong>${formatPercent(stats.average)}</strong></div>
      <div class="lo-stat" title="待教师复核的提交，不计零分"><span>待复核</span><strong>${review}${stats.reviewing ? `<small> · 批阅中 ${stats.reviewing}</small>` : ''}</strong></div>
      <div class="lo-stat" title="已截止但仍未提交，不含尚未开放的作业"><span>待交</span><strong>${stats.missing}</strong></div>
      <div class="lo-stat-scope">${h(scopeCaption(stats))}</div>`;
  }

  function renderCount(visibleCount, total) {
    $('#lo-count').textContent = visibleCount === total ? `${total} 名学生` : `显示 ${visibleCount} / ${total} 人`;
  }

  function renderFilterState(units, unitScope) {
    const source = unitScope.length ? unitScope : [];
    fill($('#lo-filter-unit'), [['', '全部单元'], ...units.map(unit => [unit, unit])], filter.unit);
    fill($('#lo-filter-assignment'), assignmentOptions(source), filter.assignmentId);
    fill($('#lo-filter-sort'), SORTS.map(([id, label]) => [id, `${label}${filter.sort === id ? (filter.direction === 'desc' ? ' ↓' : ' ↑') : ''}`]), filter.sort);
    fill($('#lo-filter-status'), STATUS_FILTERS, filter.status);
    if ($('#lo-filter-query').value !== filter.query) $('#lo-filter-query').value = filter.query;
    const active = [filter.unit, filter.assignmentId, filter.status !== 'all' ? 'status' : '', filter.query.trim() ? 'q' : '', filter.sort !== 'name' ? 's' : ''].filter(Boolean).length;
    const badge = $('#lo-filter .lo-filter-count');
    badge.hidden = active === 0;
    badge.textContent = String(active);
    $('#lo-period').value = filter.period;
    $('#lo-unit').value = filter.unit;
    $('#lo-assignment').value = filter.assignmentId;
    $('#lo-class').value = filter.classId;
  }

  // ---------- matrix ----------
  function renderMatrix(assignments, rows) {
    const columns = assignments.slice(-24).reverse();
    const truncated = assignments.length - columns.length;
    const sortState = key => filter.sort === key ? (filter.direction === 'asc' ? 'ascending' : 'descending') : 'none';
    const sortButton = (key, label) => {
      const active = filter.sort === key;
      return `<button type="button" class="lo-sort" data-sort="${key}">${h(label)}${active ? `<i aria-hidden="true">${filter.direction === 'asc' ? '↑' : '↓'}</i>` : ''}</button>`;
    };
    const head = `<thead><tr>
      <th scope="col" class="lo-student-head" aria-sort="${sortState('name')}">${sortButton('name', '学生')}</th>
      <th scope="col" class="lo-trend-head" aria-sort="${sortState('trend')}">${sortButton('trend', '趋势')}</th>
      <th scope="col" class="lo-avg-head" aria-sort="${sortState('average')}">${sortButton('average', '平均')}</th>
      ${columns.map(assignment => `<th scope="col" class="lo-col" title="${h(`${assignment.title || ''}${assignment.dueAt ? ` · 截止 ${longDate(assignment.dueAt)}` : ''}`)}"><span>${h(assignmentLabel(assignment))}</span><small>${h(monthDay(workDate(assignment)))}</small></th>`).join('')}
    </tr></thead>`;
    const body = rows.map(row => {
      const student = row.student;
      const cells = columns.map(assignment => {
        const cell = row.cells.find(item => item.assignment.id === assignment.id) || {assignment, student, rate: null, status: 'unassigned', label: '—', pendingUpdate: false, late: false};
        return cellMarkup(cell);
      }).join('');
      return `<tr data-student-row="${h(student.id)}">
        <th scope="row" class="lo-student"><button type="button" class="lo-student-link" data-profile="${h(student.id)}" title="打开 ${h(student.name)} 的学生档案">${highlightText(student.name, filter.query)}</button><small>${h(student.username || '')}</small></th>
        ${trendMarkup(row)}
        <td class="lo-avg">${averageMarkup(row)}</td>
        ${cells}
      </tr>`;
    }).join('');
    const empty = rows.length ? '' : `<tr><td class="lo-matrix-empty" colspan="${columns.length + 3}"><p>当前范围没有可显示的学生。</p><p class="lo-note">调整班级、单元或时间范围，或先把学生加入班级。</p></td></tr>`;
    matrixHost.style.setProperty('--lo-cols', String(columns.length));
    matrixHost.innerHTML = head + `<tbody>${body}${empty}</tbody>`;
    if (truncated > 0) $('#lo-count').textContent += ` · 矩阵显示最近 ${columns.length} 次作业`;
    const scrollTop = memory.get('scrollTop', 0), scrollLeft = memory.get('scrollLeft', 0);
    scrollHost.scrollTop = scrollTop;
    scrollHost.scrollLeft = scrollLeft;
    applyRoving();
  }

  function cellMarkup(cell) {
    const band = cell.status === 'graded' && cell.rate !== null ? scoreBand(cell.rate) : null;
    const short = {pending: '待复核', attention: '待处理', todo: '进行中', missing: '未交', absent: '留空', unassigned: '未分配'};
    const label = cell.rate === null ? '—' : formatPercent(cell.rate);
    const isSelected = Boolean(selected && selected.studentId === cell.student.id && selected.assignmentId === cell.assignment.id);
    const detail = cell.rate === null ? cell.label : `${formatPercent(cell.rate)}${cell.pendingUpdate ? '，新版本待更新' : ''}`;
    const offline = Boolean(cell.required || cell.record?.grade);
    const aria = `${cell.student.name}，${cell.assignment.title || assignmentLabel(cell.assignment)}，${detail}${offline ? '，双击可修改成绩，留空不计均分' : ''}`;
    return `<td class="lo-cell-td"><button type="button" class="lo-cell${isSelected ? ' selected' : ''}" data-cell data-s="${h(cell.student.id)}" data-a="${h(cell.assignment.id)}" ${offline ? 'data-offline="true"' : ''} ${band ? `data-band="${band.level}"` : ''} data-status="${cell.status}" aria-pressed="${isSelected}" aria-label="${h(aria)}" title="${h(aria)}" tabindex="-1">${cell.pendingUpdate ? '<i class="lo-pending" aria-hidden="true"></i>' : ''}<span>${h(label)}</span></button></td>`;
  }

  function averageMarkup(row) {
    if (row.average === null) return '<span class="lo-avg-none">—</span>';
    const band = scoreBand(row.average);
    return `<span class="lo-avg-value lo-band-pill" data-band="${band ? band.level : ''}" title="平均 ${formatPercent(row.average)} · 已出分 ${row.published}/${row.total}">${formatPercent(row.average)}</span><small>${row.published}/${row.total}</small>`;
  }

  function trendMarkup(row) {
    const rates = row.cells.filter(cell => cell.rate !== null).slice(-6).map(cell => cell.rate);
    if (rates.length < 2) return '<td class="lo-trend"><span class="lo-muted">—</span></td>';
    const width = 54, height = 16, pad = 2;
    const min = Math.min(...rates), max = Math.max(...rates), span = Math.max(6, max - min);
    const points = rates.map((rate, index) => [pad + index * (width - pad * 2) / (rates.length - 1), height - pad - ((rate - min) / span) * (height - pad * 2)]);
    const last = points[points.length - 1];
    const change = row.trend;
    const tone = change === null ? '' : change > 0 ? 'up' : change < 0 ? 'down' : '';
    return `<td class="lo-trend" title="最近 ${rates.length} 次已发布成绩：${rates.map(rate => formatPercent(rate)).join('、')}"><svg class="lo-spark" viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${points.map(point => point.map(value => round(value)).join(',')).join(' ')}"></polyline><circle cx="${round(last[0])}" cy="${round(last[1])}" r="2.2"></circle></svg><span class="lo-trend-change ${tone}">${change === null ? '' : trendLabel(change)}</span></td>`;
  }

  function applyRoving() {
    const cells = $$('[data-cell]');
    cells.forEach(cell => { cell.tabIndex = -1; });
    const active = root.querySelector('[data-cell].selected') || cells[0];
    if (active) active.tabIndex = 0;
  }

  function paintSelection() {
    $$('[data-cell]').forEach(cell => {
      const on = Boolean(selected && cell.dataset.s === selected.studentId && cell.dataset.a === selected.assignmentId);
      cell.classList.toggle('selected', on);
      cell.setAttribute('aria-pressed', String(on));
      cell.tabIndex = on ? 0 : -1;
    });
  }

  // ---------- mobile student list ----------
  function renderList(rows) {
    listHost.innerHTML = rows.map(row => {
      const chip = rowStatus(row);
      const recent = row.cells.filter(cell => cell.rate !== null).slice(-3).reverse();
      return `<details class="lo-student-card" data-card="${h(row.student.id)}">
        <summary>
          <span class="lo-avatar" aria-hidden="true">${h(initial(row.student.name))}</span>
          <span class="lo-card-main"><strong>${highlightText(row.student.name, filter.query)} <span class="lo-band-pill" data-band="${row.band?.level || ''}">${formatPercent(row.average)}</span></strong><small>完成 ${row.submitted}/${row.total} · 已出分 ${row.published}${row.openCorrections ? ` · 待订正 ${row.openCorrections}` : ''}</small></span>
          <span class="lo-chip" data-tone="${chipTone(chip.key)}">${h(chip.label)}</span>
          <span class="lo-chevron" aria-hidden="true">›</span>
        </summary>
        <div class="lo-card-body">
          ${recent.length ? `<div class="lo-mini-scores">${recent.map(cell => `<div class="lo-mini"><small>${h(assignmentLabel(cell.assignment))} · ${h(monthDay(workDate(cell.assignment)))}</small><strong>${cell.record?.grade ? `${cell.record.grade.total}/${cell.record.grade.maxPoints}` : formatPercent(cell.rate)}</strong><span data-band="${scoreBand(cell.rate)?.level || ''}">${formatPercent(cell.rate)}</span></div>`).join('')}</div>` : '<p class="lo-note">还没有已发布成绩。</p>'}
          <div class="lo-card-actions"><button type="button" class="lo-btn" data-profile="${h(row.student.id)}">查看学生档案</button><button type="button" class="lo-btn" data-card-cell="${h(row.student.id)}">查看最近作业详情</button></div>
        </div>
      </details>`;
    }).join('') || '<p class="lo-list-empty">没有匹配的学生。</p>';
  }

  // ---------- student profiles ----------
  function renderStudents(rows) {
    const host = $('#lo-profile-list');
    host.innerHTML = rows.map(row => {
      const chip = rowStatus(row);
      const on = row.student.id === profileId;
      return `<button type="button" class="lo-profile-row${on ? ' active' : ''}" data-profile="${h(row.student.id)}" aria-pressed="${on}">
        <span class="lo-profile-row-main"><strong>${highlightText(row.student.name, filter.query)}</strong><small><span class="lo-band-pill" data-band="${row.band?.level || ''}">${formatPercent(row.average)}</span> 平均 · 已出分 ${row.published}/${row.total}</small></span>
        <span class="lo-chip" data-tone="${chipTone(chip.key)}">${h(chip.label)}</span>
      </button>`;
    }).join('') || '<p class="lo-list-empty">没有匹配的学生。</p>';
    renderProfile(rows);
  }

  function renderProfile(rows) {
    const host = $('#lo-profile');
    const layout = $('#lo-profile-layout');
    const row = rows.find(item => item.student.id === profileId) || null;
    layout.dataset.mobileDetail = row ? 'true' : 'false';
    if (!row) {
      const attention = [...rows].filter(item => item.missing || item.needsReview || item.openCorrections).sort((a, b) => (b.missing + b.needsReview + b.openCorrections) - (a.missing + a.needsReview + a.openCorrections)).slice(0, 5);
      host.innerHTML = `<div class="lo-detail-empty"><h2>选择一名学生</h2><p>查看逐次成绩、失分题与订正状态。学生档案只汇总已发布成绩，不合成综合能力分。</p>${attention.length ? `<h3>需要关注</h3><ul class="lo-attention-list">${attention.map(item => `<li><button type="button" class="lo-attention" data-profile="${h(item.student.id)}"><span>${h(item.student.name)}</span><small>${item.missing ? `待交 ${item.missing}` : ''}${item.missing && item.needsReview ? ' · ' : ''}${item.needsReview ? `待复核 ${item.needsReview}` : ''}${!item.missing && !item.needsReview ? `待订正 ${item.openCorrections}` : ''}</small></button></li>`).join('')}</ul>` : ''}</div>`;
      return;
    }
    const profile = studentProfile(data, row.student, context.assignments);
    const chip = rowStatus(profile.row);
    const recent = profile.recent;
    const types = typeBreakdown(data, row.student.id);
    const corrections = correctionSummary(data, row.student.id);
    const history = assignmentHistory(data, row.student, context.assignments);
    const observations = studentObservations(data, row.student, context.assignments, profile);
    profileReports.set(row.student.id, {
      title: `${row.student.name} · 学习建议`,
      items: observations,
      caption: `${profile.row.published}/${profile.row.total} 次已发布 · ${scopeCaption(context.stats)}`,
    });
    host.innerHTML = `<div class="lo-profile-head">
      <button type="button" class="lo-back lo-mobile-only" data-profile-back>← 返回学生列表</button>
      <div class="lo-profile-title"><div><h2>${h(row.student.name)}</h2><p>${h(row.student.username || '')}${classLabel() ? ` · ${h(classLabel())}` : ''}</p></div><div class="lo-profile-head-actions">${ai ? `<button type="button" class="lo-btn lo-primary" data-ai-profile="${h(row.student.id)}">生成学习建议</button>` : ''}<a class="lo-btn" href="#work/gradebook/${encodeURIComponent(row.student.id)}">完整成绩轨迹</a></div></div>
      <div class="lo-profile-metrics">
        <div><span>平均</span><strong class="lo-band-pill" data-band="${profile.row.band?.level || ''}">${formatPercent(profile.row.average)}</strong></div>
        <div><span>已出分</span><strong>${profile.row.published}<small>/${profile.row.total}</small></strong></div>
        <div><span>完成率</span><strong>${formatPercent(profile.row.completion)}</strong></div>
        <div><span>近期变化</span><strong>${profile.row.trend === null ? '—' : `${trendLabel(profile.row.trend)}${trendLabel(profile.row.trend) === '持平' ? '' : ' 分'}`}</strong></div>
      </div>
      <p class="lo-profile-chip"><span class="lo-chip" data-tone="${chipTone(chip.key)}">${h(chip.label)}</span>${profile.openCorrections ? `<span class="lo-chip" data-tone="warn">待订正 ${profile.openCorrections}</span>` : ''}</p>
    </div>
    <section class="lo-profile-section"><div class="lo-section-head"><h3>最近成绩</h3><small>${recent.length ? `最近 ${recent.length} 次已发布` : ''}</small></div>${recent.length ? `<ul class="lo-recent">${recent.map(cell => `<li><a href="#work/review/${encodeURIComponent(cell.record?.latest?.id || '')}"><span class="lo-recent-name">${h(assignmentLabel(cell.assignment))}<small>${h(monthDay(workDate(cell.assignment)))}</small></span><span class="lo-recent-score">${cell.record?.grade ? `${cell.record.grade.total}/${cell.record.grade.maxPoints}` : '—'}</span><span class="lo-band-pill" data-band="${scoreBand(cell.rate)?.level || ''}">${formatPercent(cell.rate)}</span></a></li>`).join('')}</ul>` : '<p class="lo-note">还没有已发布成绩。待复核的提交不会显示为 0 分。</p>'}</section>
    <section class="lo-profile-section"><div class="lo-section-head"><h3>优先复习的题</h3><small>${profile.weak.length ? `按得分率排序 · ${profile.mistakes} 道失分题` : ''}</small></div>${profile.weak.length ? `<ul class="lo-weak">${profile.weak.map(item => `<li><button type="button" data-open-question data-s="${h(row.student.id)}" data-a="${h(item.assignmentId)}" data-q="${h(item.questionId)}"><span class="lo-weak-prompt">${h(trim(item.prompt, 58))}</span><span class="lo-weak-meta">${h(item.assignmentTitle || '')} · ${item.score}/${item.maxPoints}</span></button></li>`).join('')}</ul>` : '<p class="lo-note">这个范围内没有失分题记录。</p>'}</section>
    <section class="lo-profile-section"><div class="lo-section-head"><h3>成绩构成</h3><small>只统计已发布成绩</small></div>
      <dl class="lo-breakdown">
        <div><dt>选择题</dt><dd>${formatPercent(types.choice.rate)}<small>${types.choice.score}/${types.choice.total} 分 · ${types.choice.questions} 题</small></dd></div>
        <div><dt>书面题</dt><dd>${formatPercent(types.written.rate)}<small>${types.written.score}/${types.written.total} 分 · ${types.written.questions} 题</small></dd></div>
        <div><dt>订正状态</dt><dd>${corrections.open}<small>道待订正 · ${corrections.review} 道待复核 · ${corrections.mastered} 道已掌握</small></dd></div>
      </dl>
    </section>
    <section class="lo-profile-section"><div class="lo-section-head"><h3>作业记录</h3><small>${history.length} 次</small></div>
      ${history.length ? `<ul class="lo-history">${history.map(cell => {
        const own = cell.record?.grade;
        const statusChip = rowStatus(profile.row);
        return `<li><button type="button" class="lo-history-row" data-history-cell data-s="${h(row.student.id)}" data-a="${h(cell.assignment.id)}">
          <span class="lo-history-name">${h(assignmentLabel(cell.assignment))}<small>${h(monthDay(workDate(cell.assignment)))}</small></span>
          <span class="lo-chip" data-tone="${chipTone(cell.status === 'graded' ? statusChip.key : cell.status === 'missing' ? 'missing' : cell.status === 'pending' || cell.status === 'attention' ? 'review' : 'neutral')}">${h(cell.status === 'graded' ? '已出分' : cell.label)}</span>
          <span class="lo-history-score">${own ? `${own.total}<small>/${own.maxPoints}</small>` : '—'}</span>
          <span class="lo-band-pill" data-band="${cell.rate === null ? '' : (scoreBand(cell.rate)?.level || '')}">${formatPercent(cell.rate)}</span>
        </button></li>`;
      }).join('')}</ul>` : '<p class="lo-note">这个范围内还没有作业记录。</p>'}
    </section>
    <section class="lo-profile-section"><div class="lo-section-head"><h3>学习提醒</h3><button type="button" class="lo-btn lo-small" data-copy-report="profile">复制建议</button></div>
      ${observationsMarkup(observations)}
      <p class="lo-note">规则摘要 · 基于已发布成绩 · 非 AI 结论</p>
    </section>`;
  }

  function classLabel() {
    return classes.find(item => item.id === filter.classId)?.name || '';
  }

  function observationsMarkup(items) {
    return `<ul class="lo-observations">${items.map(item => `<li class="lo-obs"><p>${h(item.text)}</p>${(item.evidence || []).filter(Boolean).length ? `<span class="lo-obs-evidence">${item.evidence.filter(Boolean).map(text => `<span class="lo-evidence">${h(text)}</span>`).join('')}</span>` : ''}</li>`).join('')}</ul>`;
  }

  function buildClassReport() {
    const items = classObservations(data, context.visible, context.assignments, context.stats);
    classReport = {title: `班级学情摘要 · ${classLabel() || '全部班级'}`, items, caption: scopeCaption(context.stats)};
    return classReport;
  }

  function classObservationsMarkup() {
    if (!context.stats) return '';
    const report = buildClassReport();
    return `<section class="lo-class-report"><div class="lo-report-head"><h3>班级学情摘要</h3><button type="button" class="lo-btn lo-small" data-copy-report="class">复制摘要</button></div>${observationsMarkup(report.items)}<p class="lo-note">规则摘要 · 基于本次范围已发布成绩 · 非 AI 结论</p></section>`;
  }

  function openClassReport() {
    if (!context.stats) return;
    const report = buildClassReport();
    $('#lo-report-body').innerHTML = `${observationsMarkup(report.items)}<p class="lo-note">${h(report.caption)} · 规则摘要，非 AI 结论。</p><button type="button" class="lo-btn lo-primary lo-report-copy" data-copy-report="class">复制摘要</button>`;
    if (!reportSheet.open) reportSheet.showModal();
  }

  async function copyReport(kind) {
    const report = kind === 'profile' ? profileReports.get(profileId) : classReport;
    if (!report) { toast('暂无可复制的摘要'); return; }
    const text = reportText(report.title, report.items, report.caption);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      toast('已复制摘要');
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      area.remove();
      toast(ok ? '已复制摘要' : '复制失败，请手动选择文本');
    }
  }

  // ---------- assignment diagnosis ----------
  function ensureDiag(diagnoses) {
    if (diagId && diagnoses.some(item => item.assignment.id === diagId)) return;
    const preferred = diagnoses.find(item => item.assignment.id === filter.assignmentId);
    const current = preferred || diagnoses.find(item => item.published > 0) || diagnoses[0];
    diagId = current ? current.assignment.id : '';
    diagQuestion = '';
    if (preferred) diagOpen = true;
  }

  function renderDiagnosis(diagnoses) {
    if (!diagnoses.length) {
      diagList.innerHTML = '';
      diagHost.innerHTML = `<div class="lo-detail-empty"><h2>这个范围还没有作业</h2><p>调整单元、时间范围或作业筛选后再看诊断。</p></div>`;
      diagLayout.dataset.open = 'false';
      return;
    }
    ensureDiag(diagnoses);
    diagList.innerHTML = diagnoses.map(item => {
      const assignment = item.assignment;
      return `<button type="button" class="lo-diag-item" data-diag="${h(assignment.id)}" aria-pressed="${assignment.id === diagId}">
        <span class="lo-diag-name">${h(assignmentLabel(assignment))}</span>
        <span class="lo-diag-date">${h(monthDay(workDate(assignment)))} · ${h(TYPES[assignment.format] || assignment.format || '作业')}</span>
        <span class="lo-diag-meta">${item.published ? `${item.published} 份已发布 · 平均 ${formatPercent(item.average)}` : '尚无已发布成绩'}</span>
      </button>`;
    }).join('');
    const current = diagnoses.find(item => item.assignment.id === diagId);
    diagHost.innerHTML = current ? diagMarkup(current) : '';
    diagLayout.dataset.open = String(wide.matches || diagOpen);
  }

  function questionRowMarkup(diagnosis, question, index) {
    const choice = question.type === 'choice';
    const rate = choice ? question.rate : question.scoreRate;
    const top = Math.max(1, ...question.distribution.map(item => item.count));
    return `<button type="button" class="lo-qrow" data-diag-question="${h(question.id)}" title="查看第 ${index + 1} 题原题与班级数据">
      <span class="lo-qrow-index">${index + 1}</span>
      <span class="lo-qrow-prompt">${h(trim(question.prompt, 56))}</span>
      <span class="lo-qrow-type">${h(TYPES[question.type] || question.type || '题')}</span>
      <span class="lo-qrow-rate">${accuracyBadge(rate)}</span>
      <span class="lo-qrow-sample">${question.graded}</span>
      <span class="lo-mini-dist" aria-hidden="true">${choice ? question.distribution.map(item => `<i style="height:${Math.max(6, Math.round(item.count / top * 100))}%"></i>`).join('') : '—'}</span>
    </button>`;
  }

  function diagMarkup(diagnosis) {
    const assignment = diagnosis.assignment;
    const unit = assignment.libraryUnit ? `${assignment.libraryUnit} · ` : '';
    return `<div class="lo-diag-body">
      <button type="button" class="lo-back lo-mobile-only" data-diag-back>← 返回作业列表</button>
      <header class="lo-diag-head"><div><h2>${h(assignment.title || assignmentLabel(assignment))}</h2><p>${h(unit)}${h(TYPES[assignment.format] || '作业')}${assignment.dueAt ? ` · 截止 ${h(longDate(assignment.dueAt))}` : ''}</p></div><div class="lo-diag-actions">${ai?`<button type="button" class="lo-btn lo-primary" data-ai-assignment="${h(assignment.id)}" ${diagnosis.published?'':'disabled title="已有成绩后可生成"'}>生成本次作业分析</button>`:''}${link(`work/overview/${assignment.id}`, '作业设置')}</div></header>
      <div class="lo-diag-metrics">
        <div><span>已发布</span><strong>${diagnosis.published}<small> 份</small></strong></div>
        <div><span>平均</span><strong>${accuracyBadge(diagnosis.average)}</strong></div>
        <div><span>题目</span><strong>${diagnosis.questions.length}<small> 题</small></strong></div>
        <div><span>书面薄弱</span><strong>${diagnosis.weakWritten.length || '—'}</strong></div>
      </div>
      <section class="lo-diag-section"><div class="lo-section-head"><h3>每题正确率与选项分布</h3><label>排序 <select id="lo-diag-order">${[['number','原题号'],['asc','正确率从低到高'],['desc','正确率从高到低']].map(([key,text])=>`<option value="${key}" ${key===diagOrder?'selected':''}>${text}</option>`).join('')}</select></label></div>
        ${diagnosis.questions.length ? `<div class="lo-qtable" role="table" aria-label="题目诊断">
          <div class="lo-qtable-head" role="row"><span role="columnheader">题</span><span role="columnheader">题目</span><span role="columnheader">类型</span><span role="columnheader">${diagnosis.questions.every(question => question.type === 'choice') ? '正确率' : diagnosis.questions.every(question => question.type !== 'choice') ? '得分率' : '正确率/得分率'}</span><span role="columnheader">样本</span><span role="columnheader">选项分布</span></div>
          ${orderedDiagnosisQuestions(diagnosis.questions,diagOrder).map(({question,index})=>questionRowMarkup(diagnosis,question,index)).join('')}
        </div>` : '<p class="lo-note">这份作业没有题目级评分数据，附件与作答可在复核页查看。</p>'}
      </section>
      <section class="lo-diag-section"><div class="lo-section-head"><h3>FRQ 薄弱点</h3><small>得分率最低的书面题</small></div>
        ${diagnosis.weakWritten.length ? `<ul class="lo-weak">${diagnosis.weakWritten.map(question => `<li><button type="button" data-diag-question="${h(question.id)}"><span class="lo-weak-prompt">${h(trim(question.prompt, 64))}</span><span class="lo-weak-meta">${h(TYPES[question.type] || '简答')} · 平均 ${question.average}/${question.maxPoints} · 得分率 ${accuracyBadge(question.scoreRate)}</span></button></li>`).join('')}</ul>` : `<p class="lo-note">${diagnosis.questions.some(question => question.type !== 'choice') ? '书面题样本不足，暂不排序。' : '这份作业没有书面题；选择题的薄弱项见上方正确率。'}</p>`}
      </section>
      <section class="lo-diag-section"><div class="lo-section-head"><h3>知识标签薄弱项</h3><small>按题目标签聚合得分率</small></div>
        ${diagnosis.knowledge.length ? `<ul class="lo-tags">${diagnosis.knowledge.map(item => `<li><span class="lo-chip">${h(item.knowledge)}</span><strong>${accuracyBadge(item.rate)}</strong><small>${item.graded} 题次</small></li>`).join('')}</ul>` : '<p class="lo-note">题目标签不足，暂不能聚合。</p>'}
      </section>
    </div>`;
  }

  function originalQuestion(assignment,question) {
    const url=id=>'/api/homework/files/'+encodeURIComponent(id);
    const images=question.questionImages||[], loc=question.paperLocation;
    const options=(question.options||[]).filter(o=>o.text?.trim());
    const originals=loc?.fileId?[loc.fileId]:(assignment.questionFiles||[]);
    const paper=images.length?images.map((id,i)=>`<a class="lo-original-image" href="${url(id)}" target="_blank" rel="noopener" title="打开原图"><img src="${url(id)}" loading="lazy" alt="第 ${h(question.id)} 题 · 原题切片 ${i+1} / ${images.length}"></a>`).join(''):
      originals.map((id,i)=>{const src=url(id)+(loc?.page?'#page='+Number(loc.page):'');return `<details class="lo-source-file" ${loc||originals.length===1?'open':''}><summary>原题附件 ${i+1}${loc?.page?' · 第 '+Number(loc.page)+' 页':''}</summary><div class="homework-surface"><div data-original-file="${h(id)}" data-page="${Number(loc?.page)||1}"></div></div><a href="${src}" target="_blank" rel="noopener">打开完整原件</a></details>`}).join('');
    return `<section class="lo-original" aria-label="完整原题">${question.prompt?`<p class="lo-prompt">${h(question.prompt)}</p>`:''}${paper}
      ${options.length?`<ul class="lo-original-options">${options.map(o=>`<li><b>${h(o.label)}.</b> ${h(o.text)}</li>`).join('')}</ul>`:''}
      ${!paper&&!question.prompt&&!options.length?'<p>这道题尚未关联原题。</p>':''}
      <p class="lo-note">${h(question.maxPoints)} 分${question.correctOptions?.length?' · 参考答案 '+h(question.correctOptions.join('、')):''}${question.sourcePages?' · '+h(question.sourcePages):''}</p></section>`;
  }

  function mountOriginals(host) {
    for(const details of host.querySelectorAll('.lo-source-file')){
      const el=details.querySelector('[data-original-file]');
      async function show(){
        if(!details.open || !el.getClientRects().length || el.dataset.loading)return;
        el.dataset.loading='true';
        try{
          const id=el.dataset.originalFile;
          const {file}=await ai('files/'+encodeURIComponent(id)+'?meta=1');
          if(!el.isConnected||destroyed)return;
          if(file.mime==='application/pdf'){
            const {mountPDFReader}=await import('./pdf-reader.js');
            if(el.isConnected&&!destroyed)originalReaders.set(el,mountPDFReader(el,{fileId:id,title:'原题',initialPage:Number(el.dataset.page)}));
          }else if(file.mime.startsWith('image/')){
            el.innerHTML=`<img class="lo-original-photo" src="/api/homework/files/${encodeURIComponent(id)}" alt="原题附件">`;
          }
        }catch{el.textContent='暂时无法预览，可打开下方原件。';delete el.dataset.loading;}
      }
      details.ontoggle=show;void show();
    }
  }
  function disposeOriginals(){for(const reader of originalReaders.values())reader.destroy();originalReaders.clear();}

  function diagDetailMarkup() {
    const current = (context.diagnoses || []).find(item=>item.assignment.id===diagId);
    const question = current?.questions.find(q=>q.id===diagQuestion);
    if (!question) {
      const weak = current ? current.weakWritten.slice(0, 3) : (context.diagnoses || []).flatMap(item => item.weakWritten.slice(0, 1)).slice(0, 3);
      return `<div class="lo-detail-empty"><h2>${current ? `作业诊断 · ${h(current.assignment.title || assignmentLabel(current.assignment))}` : '作业诊断'}</h2><p>选择题号，查看完整原题和本班的作答情况。</p>${current ? `<h3>本份作业</h3><p class="lo-note">已发布 ${current.published} 份 · 平均 ${formatPercent(current.average)} · ${current.questions.length} 题${current.knowledge.length ? ` · 最弱标签「${h(current.knowledge[0].knowledge)}」${accuracyBadge(current.knowledge[0].rate)}` : ''}</p>` : ''}${weak.length ? `<h3>最薄弱的书面题</h3><ul class="lo-weak">${weak.map(item => `<li><button type="button" data-diag-question="${h(item.id)}"><span class="lo-weak-prompt">${h(trim(item.prompt, 48))}</span><span class="lo-weak-meta">${h(TYPES[item.type] || '简答')} · 得分率 ${accuracyBadge(item.scoreRate)}</span></button></li>`).join('')}</ul>` : ''}</div>`;
    }
    const diagnosis = current;
    const choice = question.type === 'choice';
    const rate = choice ? question.rate : question.scoreRate;
    const total = question.distribution.reduce((sum, item) => sum + item.count, 0) || 1;
    return `<div class="lo-detail-inner">
      <header class="lo-detail-head"><div><h2>第 ${diagnosis.questions.indexOf(question) + 1} 题 · ${h(TYPES[question.type] || '题目')}</h2><p>${h(assignmentLabel(diagnosis.assignment))}${question.knowledge ? ` · ${h(question.knowledge)}` : ''}</p></div><button type="button" class="lo-btn lo-icon" data-close-detail aria-label="关闭详情"><span aria-hidden="true">×</span></button></header>
      <div class="lo-detail-score"><strong>${accuracyBadge(rate)}</strong><span class="lo-chip">${choice ? '班级正确率' : '班级得分率'}</span><span class="lo-chip">${question.graded} 份</span></div>
      ${originalQuestion(diagnosis.assignment,question)}
      <div class="lo-qstats">
        <div><span>${choice ? '班级正确率' : '平均得分'}</span><strong>${choice ? accuracyBadge(question.rate) : `${question.average}/${question.maxPoints}`}</strong><small>${question.correct}/${question.graded} 份${choice ? '完全正确' : '达到满分'}</small></div>
        <div><span>${choice?'已记录选项':'有效样本'}</span><strong>${choice?question.answered:question.graded}</strong><small>${!choice?'份已评分':question.unanswered ? `${question.unanswered} 份未记录选项` : '全部已记录'}</small></div>
      </div>
      ${choice ? `<div class="lo-distribution" role="list" aria-label="选项分布">
        ${question.distribution.map(item => `<div class="lo-dist-row" role="listitem"><span class="lo-dist-label">${h(item.label)}</span><div class="lo-dist-track"><i style="width:${Math.round(item.count / total * 100)}%"></i></div><span class="lo-dist-count">${item.count}</span></div>`).join('')}
      </div>` : ''}
      <p class="lo-note">选项分布只统计与当前发布版本一致的作答；未记录选项或版本不同的作答不计入。</p>
    </div>`;
  }

  function openDiagQuestion(id, trigger) {
    diagQuestion = id;
    diagTrigger = trigger || document.activeElement;
    memory.set({diagQuestion: id});
    renderDetail();
    if (!wide.matches && !sheet.open) openSheet(diagTrigger);
    if (sheet.open) {
      $('#lo-sheet-title').textContent = '题目详情';
      sheetBody.querySelector('[data-close-detail]')?.focus({preventScroll: true});
    }
  }

  // ---------- detail ----------
  function findSelection() {
    if (!selected) return null;
    const row = context.rows.find(item => item.student.id === selected.studentId);
    if (!row) return null;
    const cell = row.cells.find(item => item.assignment.id === selected.assignmentId);
    return cell ? {row, cell} : null;
  }

  // ---------- AI drafts (teacher reviews before anything is published) ----------
  function aiScopePayload() {
    const studentId = tab === 'students' && profileId ? profileId : null;
    return {classId: filter.classId, unit: filter.unit || '', period: filter.period, ...(studentId ? {studentId} : {})};
  }

  function aiLoadingMarkup() {
    return '<div class="lo-ai-loading" role="status"><span class="lo-ai-spinner" aria-hidden="true"></span><p>正在根据本范围已发布成绩生成草稿，可能需要十几秒。</p><p class="lo-note">只发送匿名统计与题目编号，不发送学生姓名、附件或作答原文。</p></div>';
  }

  function aiErrorMarkup(message) {
    return `<div class="lo-ai-error" role="alert"><p>${h(message)}</p><div class="lo-sheet-actions"><button type="button" class="lo-btn" data-ai-again>重试</button><button type="button" class="lo-btn" data-close-ai>关闭</button></div></div>`;
  }

  async function openAiReport(studentId = null, assignmentId = null, retryScope=null) {
    if (!ai) return;
    if (!aiSheet.open) aiSheet.showModal();
    const payload = retryScope || (assignmentId ? {classId:filter.classId,assignmentId} : {...aiScopePayload(), ...(studentId ? {studentId} : {})});
    lastAiScope=payload;aiReport=null;const generation=++aiGeneration;
    $('#lo-ai-title').textContent = payload.assignmentId ? '本次作业学情分析' : payload.studentId ? '个人学习建议草稿' : '班级学情分析草稿';
    aiBody.innerHTML = aiLoadingMarkup();
    try {
      const {report} = await ai('analytics/reports', {method: 'POST', body: payload});
      if(destroyed||generation!==aiGeneration)return;
      aiReport = report;
      renderAiDraft(report);
    } catch (error) {
      if(!destroyed&&generation===aiGeneration)aiBody.innerHTML = aiErrorMarkup(error.message || '暂时无法生成分析');
    }
  }

  function aiStepsMarkup(items) {
    return `<ol class="lo-ai-steps">${items.map(item => `<li><p>${h(item.text)}</p>${(item.evidence || []).length ? `<span class="lo-obs-evidence">${item.evidence.map(text => `<span class="lo-evidence">${h(text)}</span>`).join('')}</span>` : ''}</li>`).join('')}</ol>`;
  }

  function renderAiDraft(report) {
    const stats = report.stats || {};
    const scopeText = report.scope.assignmentId ? '本次作业 · '+report.assignmentTitle : report.scope.studentId ? '个人建议（仅该学生可见，需确认发布）' : '班级汇总（只作为教师存档）';
    aiBody.innerHTML = `<div class="lo-ai-report">
      <p class="lo-ai-meta"><span class="lo-chip" data-tone="${report.source === 'ai' ? 'ok' : 'neutral'}">${report.source === 'ai' ? 'AI 草稿' : '规则草稿'}</span><span>${h(scopeText)}</span><span>${stats.students ?? 0} 名学生 · ${stats.assignments ?? 0} 次作业${stats.average === null || stats.average === undefined ? '' : ` · 平均 ${formatPercent(stats.average)}`}</span></p>
      ${report.aiError ? `<p class="lo-note">${h(report.aiError)}</p>` : ''}
      <h3>学习观察</h3>${observationsMarkup(report.observations)}
      <h3>下一步建议</h3>${aiStepsMarkup(report.nextSteps)}
      <p class="lo-note">${h(report.limitations)} · 数据版本 ${h(report.dataVersion)}</p>
      <div class="lo-sheet-actions"><button type="button" class="lo-btn" data-ai-again>重新生成</button><button type="button" class="lo-btn lo-primary" data-ai-publish>确认发布</button></div>
    </div>`;
  }

  function renderAiConfirm() {
    if (!aiReport) return;
    const personal = Boolean(aiReport.scope.studentId);
    aiBody.innerHTML = `<div class="lo-ai-confirm">
      <h3>确认发布这份草稿？</h3>
      <p>${personal ? '发布后，该学生会在「我的学习 > 老师的学习建议」看到这份内容。' : '班级汇总只作为教师存档，不会显示给学生。'}</p>
      <p class="lo-note">发布后数据变化不会自动改写已发布内容；如需更新请重新生成并再次发布。</p>
      <div class="lo-sheet-actions"><button type="button" class="lo-btn" data-ai-back>返回草稿</button><button type="button" class="lo-btn lo-primary" data-ai-confirm>确认发布</button></div>
    </div>`;
  }

  async function publishAiReport() {
    if (!aiReport || !ai) return;
    const personal = Boolean(aiReport.scope.studentId);
    aiBody.innerHTML = '<div class="lo-ai-loading" role="status"><span class="lo-ai-spinner" aria-hidden="true"></span><p>正在发布…</p></div>';
    try {
      const {report} = await ai(`analytics/reports/${encodeURIComponent(aiReport.id)}/publish`, {method: 'POST', body: {confirm: true, ...(personal ? {audience: 'student'} : {audience: 'class'})}});
      aiReport = report;
      aiBody.innerHTML = `<div class="lo-ai-done" role="status"><h3>已发布</h3><p>${personal ? '学生现在可以在「我的学习」看到这份建议。' : report.scope?.assignmentId ? '本次作业的学情分析已存档。' : '班级汇总已存档。'}</p></div>`;
      const title = $('#lo-ai-title');
      if (title) title.textContent = personal ? '个人学习建议 · 已发布' : report.scope?.assignmentId ? '作业学情分析 · 已发布' : '班级学情分析 · 已发布';
      toast('已发布');
    } catch (error) {
      aiBody.innerHTML = aiErrorMarkup(error.message || '发布失败');
    }
  }

  function historyRowMarkup(report) {
  const status = report.status === 'published' ? '已发布' : report.status === 'revoked' ? '已撤回' : '草稿';
  const kind = report.scope?.assignmentId ? '作业分析 · '+h(report.assignmentTitle) : report.scope?.studentId ? '个人建议' : '班级分析';
  const localClass = (state.meta?.classes || []).find(item => item.id === report.scope?.classId);
  const who = report.scope?.studentId ? (report.studentName || '学生') : (report.className || localClass?.name || report.scope?.classId || '全部布置班级');
  const when = report.publishedAt || report.revokedAt || report.createdAt || '';
  const dateText = when ? new Date(when).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '';
  const actions = report.status === 'published'
    ? `<button type="button" class="lo-btn lo-small" data-hist-view="${h(report.id)}">查看</button><button type="button" class="lo-btn lo-small lo-danger" data-hist-revoke="${h(report.id)}">撤回</button>`
    : `<button type="button" class="lo-btn lo-small" data-hist-view="${h(report.id)}">查看</button>`;
  return `<li class="lo-hist-row"><div class="lo-hist-main"><strong>${kind} · ${h(who)}</strong><span class="lo-hist-meta">${h(dateText)} · ${report.stats?.students ?? '?'} 名学生 · ${report.stats?.assignments ?? '?'} 次作业</span></div><span class="lo-chip" data-tone="${report.status === 'published' ? 'good' : report.status === 'revoked' ? 'muted' : 'warn'}">${status}</span><div class="lo-hist-actions">${actions}</div></li>`;
}

async function openHistory() {
  if (!ai) return;
  histSheet.showModal();
  histBody.innerHTML = '<div class="lo-ai-loading"><span class="lo-ai-spinner" aria-hidden="true"></span><p>正在读取报告…</p></div>';
  try {
    const {reports} = await ai('analytics/reports');
    renderHistory(reports || []);
  } catch (error) {
    histBody.innerHTML = `<div class="lo-ai-error"><h3>读取报告失败</h3><p>${h(error.message || '请稍后重试。')}</p><div class="lo-sheet-actions"><button type="button" class="lo-btn" data-close-history>关闭</button><button type="button" class="lo-btn lo-primary" data-hist-retry>重试</button></div></div>`;
  }
}

function renderHistory(reports) {
  if (!reports.length) {
    histBody.innerHTML = `<div class="lo-ai-done"><h3>还没有报告</h3><p>在「生成学情分析」或「生成学习建议」里生成草稿，确认发布后会出现在这里。</p></div>`;
    return;
  }
  histBody.innerHTML = `<ul class="lo-hist-list">${reports.map(historyRowMarkup).join('')}</ul><p class="lo-note">已撤回的个人建议会立即从学生「我的学习」消失；班级分析只作为教师档案。</p>`;
}

async function openHistoryReport(reportId) {
  histBody.innerHTML = '<div class="lo-ai-loading"><span class="lo-ai-spinner" aria-hidden="true"></span><p>正在读取报告…</p></div>';
  try {
    const {report} = await ai('analytics/reports/' + encodeURIComponent(reportId));
    const published = report.publishedAt ? new Date(report.publishedAt).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '';
    histBody.innerHTML = `<div class="lo-ai-report"><p class="lo-ai-meta"><span class="lo-chip">${report.source === 'ai' ? 'AI 草稿' : '规则草稿'}</span><span>${report.scope?.assignmentId ? '本次作业 · '+h(report.assignmentTitle) : report.scope?.studentId ? '个人学习建议' : '班级学情分析'}</span>${published ? `<span>${h(published)} 发布</span>` : ''}</p><h3>学习观察</h3>${observationsMarkup(report.observations || [])}${(report.nextSteps || []).length ? `<h3>下一步</h3><ol class="lo-ai-steps">${report.nextSteps.map(item => `<li>${h(item.text)}</li>`).join('')}</ol>` : ''}<p class="lo-note">${h(report.limitations || '')}</p><div class="lo-sheet-actions"><button type="button" class="lo-btn" data-hist-back>返回列表</button></div></div>`;
  } catch (error) {
    histBody.innerHTML = `<div class="lo-ai-error"><h3>读取失败</h3><p>${h(error.message || '请稍后重试。')}</p><div class="lo-sheet-actions"><button type="button" class="lo-btn" data-hist-back>返回列表</button></div></div>`;
  }
}

function confirmHistoryRevoke(reportId) {
  histBody.innerHTML = `<div class="lo-ai-confirm"><h3>撤回这份报告？</h3><p>撤回后学生不再看到这份建议；历史记录会保留为「已撤回」，可以查看但不能恢复。</p><div class="lo-sheet-actions"><button type="button" class="lo-btn" data-hist-back>取消</button><button type="button" class="lo-btn lo-danger" data-hist-confirm="${h(reportId)}">确认撤回</button></div></div>`;
}

async function revokeHistoryReport(reportId) {
  try {
    await ai('analytics/reports/' + encodeURIComponent(reportId) + '/revoke', {method: 'POST', body: {confirm: true}});
    toast('报告已撤回');
    await openHistory();
  } catch (error) {
    toast(error.message || '撤回失败');
  }
}

function renderDetail() {
    disposeOriginals();
    if (tab === 'diagnosis') {
      const markup = diagDetailMarkup();
      detailHost.innerHTML = markup;
      if (sheet.open) {
        sheetBody.innerHTML = markup;
        $('#lo-sheet-title').textContent = diagQuestion ? '题目详情' : '作业诊断';
        mountOriginals(sheetBody);
      }else if(wide.matches)mountOriginals(detailHost);
      return;
    }
    const found = findSelection();
    const markup = found ? detailMarkup(found.row, found.cell) : emptyDetailMarkup();
    detailHost.innerHTML = markup;
    if (sheet.open) {
      sheetBody.innerHTML = markup;
      $('#lo-sheet-title').textContent = found ? `${found.row.student.name} · ${assignmentLabel(found.cell.assignment)}` : '成绩详情';
    }
  }

  function emptyDetailMarkup() {
    const attention = [...context.visible].sort((a, b) => (b.missing + b.needsReview + b.openCorrections) - (a.missing + a.needsReview + a.openCorrections)).slice(0, 4);
    return `<div class="lo-detail-empty">
      <h2>从矩阵选择一名学生</h2>
      <p>点击任一成绩可查看原题、本人作答与班级数据。双击可改分，手机点开详情后选择「修改成绩」。矩阵内可用方向键移动，Enter 打开。</p>
      ${attention.length ? `<h3>优先关注</h3><ul class="lo-attention-list">${attention.map(row => `<li><button type="button" class="lo-attention" data-profile="${h(row.student.id)}"><span>${h(row.student.name)}</span><small>${row.missing ? `待交 ${row.missing}` : ''}${row.missing && row.needsReview ? ' · ' : ''}${row.needsReview ? `待复核 ${row.needsReview}` : ''}${row.openCorrections ? `${row.missing || row.needsReview ? ' · ' : ''}待订正 ${row.openCorrections}` : ''}</small></button></li>`).join('')}</ul>` : ''}
      ${classObservationsMarkup()}
      <p class="lo-note">五色为课堂得分率参考分档（见「更多 → 图例」），非 AP 官方换算；留空不计均分，明确录入的 0 分计入均分。</p>
    </div>`;
  }

  function detailMarkup(row, cell) {
    const assignment = cell.assignment;
    const record = cell.record;
    const grade = record?.grade;
    const chip = rowStatus(row);
    const stats = questionCache.get(assignment.id) || (assignment.questions?.length ? questionStats(context.diagnosticData||data, assignment.id) : null);
    if (stats) questionCache.set(assignment.id, stats);
    const summary = stats || {questions: [], graded: 0};
    const current = selected?.questionId && selected.studentId === row.student.id && selected.assignmentId === assignment.id ? summary.questions.find(question => question.id === selected.questionId) : null;
    if (current) return questionMarkup(row, cell, summary, current);
    const own = grade?.questions || [];
    return `<div class="lo-detail-inner">
      <header class="lo-detail-head">
        <div><h2>${h(row.student.name)}</h2><p>${h(assignment.title || assignmentLabel(assignment))}</p></div>
        <button type="button" class="lo-btn lo-icon" data-close-detail aria-label="关闭详情"><span aria-hidden="true">×</span></button>
      </header>
      <div class="lo-detail-score">
        <strong>${grade?.total != null ? `${grade.total}<small>/${grade.maxPoints}</small>` : '—'}</strong>
        <span class="lo-chip" data-tone="${chipTone(chip.key)}">${h(chip.label)}</span>
        ${cell.pendingUpdate ? '<span class="lo-chip" data-tone="warn">新版本待更新</span>' : ''}
        ${cell.late ? '<span class="lo-chip">迟交</span>' : ''}
        ${grade?.manualTotal ? '<span class="lo-chip">教师已改分</span>' : ''}
      </div>
      <dl class="lo-detail-meta">
        <div><dt>截止</dt><dd>${h(assignment.dueAt ? longDate(assignment.dueAt) : '不限')}</dd></div>
        <div><dt>最近提交</dt><dd>${h(record?.latest?.submittedAt ? longDate(record.latest.submittedAt) : '尚未提交')}</dd></div>
        <div><dt>班级平均</dt><dd>${formatPercent(cellAverage(assignment.id))}</dd></div>
      </dl>
      <div class="lo-detail-links">
        ${cell.required || grade ? '<button type="button" class="lo-btn" data-edit-score>修改成绩</button>' : ''}
        ${record?.latest?.id && !record.latest.manualScoreEntry ? link(`work/review/${record.latest.id}`, '查看作答与复核') : ''}
        ${link(`work/overview/${assignment.id}`, '作业设置')}
      </div>
      <section class="lo-detail-section">
        <div class="lo-section-head"><h3>题目与本班数据</h3><small>${assignment.offline||assignment.format==='score'?'线下总分':summary.graded ? `${summary.graded} 份已发布` : grade?'已公布总分':'尚无已发布成绩'}</small></div>
        ${summary.questions.length ? `<ul class="lo-qlist">
          <li class="lo-qlist-head" aria-hidden="true"><span>题</span><span>题目</span><span>本人</span><span>正确率</span></li>
          ${summary.questions.map((question, index) => {
            const hit = own.find(item => item.id === question.id);
            return `<li><button type="button" data-question data-s="${h(row.student.id)}" data-a="${h(assignment.id)}" data-q="${h(question.id)}" title="查看第 ${index + 1} 题原题与选项分布">
              <span class="lo-q-index">${index + 1}</span>
              <span class="lo-q-prompt">${h(trim(question.prompt, 54))}</span>
              <span class="lo-q-own">${hit ? `${hit.score}/${hit.maxPoints}` : '—'}</span>
              <span class="lo-q-rate">${accuracyBadge(question.type==='choice'?question.rate:question.scoreRate)}</span>
            </button></li>`;
          }).join('')}
        </ul>` : `<p class="lo-note">${assignment.offline||assignment.format==='score'?'这份线下作业仅记录总分，可直接修改分数和满分。':'这份作业还没有题目级评分数据；原作答保留，可继续复核。'}</p>`}
      </section>
    </div>`;
  }

  function cellAverage(assignmentId) {
    const list = context.rows.map(row => row.cells.find(cell => cell.assignment.id === assignmentId)?.rate).filter(rate => rate !== null && rate !== undefined);
    return list.length ? round(list.reduce((sum, rate) => sum + rate, 0) / list.length) : null;
  }

  function questionMarkup(row, cell, summary, question) {
    const own = cell.record?.grade?.questions?.find(item => item.id === question.id);
    const submission = cell.record?.latest;
    const choice = submission?.choices?.[question.id] || '';
    const total = question.distribution.reduce((sum, item) => sum + item.count, 0) || 1;
    const options = question.options?.length ? question.options : question.distribution.filter(item => item.count).map(item => ({label: item.label, text: ''}));
    const optionText = new Map(options.map(option => [option.label, option.text || '']));
    return `<div class="lo-detail-inner">
      <button type="button" class="lo-back" data-back-question>← 返回全部题目</button>
      <header class="lo-detail-head"><div><h2>第 ${summary.questions.indexOf(question) + 1} 题 · ${h(TYPES[question.type] || question.type || '题目')}</h2><p>${h(row.student.name)} · ${h(assignmentLabel(cell.assignment))}</p></div><button type="button" class="lo-btn lo-icon" data-close-detail aria-label="关闭详情"><span aria-hidden="true">×</span></button></header>
      <div class="lo-detail-score"><strong>${own ? `${own.score}<small>/${own.maxPoints}</small>` : '—'}</strong>${currentChoiceChip(choice, own)}</div>
      <p class="lo-prompt">${h(question.prompt || '未记录题干')}</p>
      ${question.options?.length ? `<ol class="lo-options" aria-label="选项">${options.map(option => `<li${option.label === choice ? ' class="chosen"' : ''}><span class="lo-option-label">${h(option.label)}</span><span>${h(option.text || '')}</span>${option.label === choice ? '<em>本人选择</em>' : ''}</li>`).join('')}</ol>` : '<p class="lo-note">该题没有选项结构，可能为简答或材料题。</p>'}
      <div class="lo-qstats">
        <div><span>班级正确率</span><strong>${accuracyBadge(question.rate)}</strong><small>${question.correct}/${question.graded} 份</small></div>
        <div><span>有效选项</span><strong>${question.answered}</strong><small>${question.unanswered ? `${question.unanswered} 份未记录选项` : '全部已记录'}</small></div>
      </div>
      <div class="lo-distribution" role="list" aria-label="选项分布">
        ${question.distribution.map(item => `<div class="lo-dist-row" role="listitem"><span class="lo-dist-label">${h(item.label)}</span><div class="lo-dist-track"><i style="width:${Math.round(item.count / total * 100)}%" ${optionText.get(item.label) && item.label === choice ? 'data-own="true"' : ''}></i></div><span class="lo-dist-count">${item.count}</span></div>`).join('')}
      </div>
      <p class="lo-note">选项分布只统计与当前发布版本一致的作答；未记录选项或版本不同的作答不计入，也不用于推断学生是否理解。</p>
    </div>`;
  }

  function currentChoiceChip(choice, own) {
    if (!choice) return own ? '<span class="lo-chip" data-tone="good">已评分</span>' : '';
    return `<span class="lo-chip">选择 ${h(choice)}</span>${own ? `<span class="lo-chip" data-tone="${own.score >= own.maxPoints ? 'good' : 'warn'}">${own.score}/${own.maxPoints}</span>` : ''}`;
  }

  // ---------- empty and interactions ----------
  function updateEmpty(rows, visible) {
    if (!rows.length) {
      emptyHost.hidden = false;
      emptyHost.innerHTML = `<h2>这个范围还没有作业</h2><p>调整单元、时间范围或作业筛选；也可以先去作业管理发布作业。</p>${link('work/assignments', '去作业管理')}`;
      scrollHost.hidden = true;
      listHost.hidden = true;
    } else if (!visible.length) {
      emptyHost.hidden = false;
      emptyHost.innerHTML = `<h2>没有匹配的学生</h2><p>试试清除搜索或筛选条件。</p><button type="button" class="lo-btn" data-action="clear">清除筛选</button>`;
      scrollHost.hidden = true;
      listHost.hidden = true;
    } else {
      emptyHost.hidden = true;
      scrollHost.hidden = false;
      listHost.hidden = false;
    }
  }

  function selectCell(studentId, assignmentId, questionId = '') {
    selected = {studentId, assignmentId, ...(questionId ? {questionId} : {})};
    memory.set({selection: selected});
    paintSelection();
    renderDetail();
    if (!wide.matches && !sheet.open) openSheet(document.activeElement);
    if (sheet.open) {
      const back = sheetBody.querySelector('[data-back-question]') || sheetBody.querySelector('[data-close-detail]');
      if (back) queueMicrotask(() => { if (sheet.open) back.focus({preventScroll: true}); });
    }
  }

  function openSheet(trigger) {
    sheetTrigger = trigger || document.activeElement;
    $('#lo-sheet-title').textContent = '成绩详情';
    sheetBody.innerHTML = tab==='diagnosis' ? diagDetailMarkup() : detailHost.innerHTML;
    if (!sheet.open) sheet.showModal();
    if(tab==='diagnosis')mountOriginals(sheetBody);
    const close = sheetBody.querySelector('[data-close-detail]');
    (close || sheet.querySelector('[data-close-detail]'))?.focus({preventScroll: true});
  }

  function closeSheet() {
    if (sheet.open) sheet.close();
  }

  function openProfile(id) {
    profileId = id;
    memory.set({profileId: id});
    if (tab !== 'students') setTab('students', false);
    draw();
    const heading = $('#lo-profile h2');
    if (small.matches) {
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({preventScroll: true});
    }
  }

  function setTab(next, redraw = true) {
    tab = ['matrix', 'students', 'diagnosis'].includes(next) ? next : 'matrix';
    memory.set({tab});
    root.dataset.tab = tab;
    for (const name of ['matrix', 'students', 'diagnosis']) {
      const button = $(`#lo-tab-${name}`);
      const active = tab === name;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      $(`#lo-panel-${name}`).hidden = !active;
    }
    if (redraw) { renderDetail(); }
  }

  async function refresh() {
    const button = $('#lo-refresh');
    if (button.dataset.busy === 'true') return;
    button.dataset.busy = 'true';
    button.classList.add('busy');
    try {
      const fresh = await ctx.load();
      if (destroyed) return;
      data = fresh;
      draw();
      toast('学情数据已刷新');
    } catch (error) {
      toast(error?.message || '刷新失败，请稍后重试');
    } finally {
      button.dataset.busy = 'false';
      button.classList.remove('busy');
    }
  }

  function exportCSV() {
    if (!context.visible.length) { toast('当前范围没有可导出的学生'); return; }
    const csv = gradeCSV(context.visible.map(row => row.student), context.assignments, data);
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    const anchor = document.createElement('a');
    const period = PERIODS.find(([id]) => id === filter.period)?.[1] || '全部时间';
    anchor.href = url;
    anchor.download = `学情-${classLabel() || '全部班级'}-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearFilters() {
    filter.unit = ''; filter.assignmentId = ''; filter.status = 'all'; filter.query = ''; filter.sort = 'name'; filter.direction = 'asc';
    draw();
  }

  function openFilterSheet() {
    fill($('#lo-filter-unit'), [['', '全部单元'], ...unitsOf(scopedAssignments(data, {classId: filter.classId, period: 'all'})).map(unit => [unit, unit])], filter.unit);
    const classScope = scopedAssignments(data, {classId: filter.classId, period: 'all'});
    fill($('#lo-filter-assignment'), assignmentOptions(filter.unit ? classScope.filter(item => item.libraryUnit === filter.unit) : classScope), filter.assignmentId);
    fill($('#lo-filter-sort'), SORTS, filter.sort);
    fill($('#lo-filter-status'), STATUS_FILTERS, filter.status);
    $('#lo-filter-query').value = filter.query;
    if (!filterSheet.open) filterSheet.showModal();
    $('#lo-filter').setAttribute('aria-expanded', 'true');
  }

  const legendHost = root.querySelector('.lo-legend-body');
  if (legendHost) legendHost.innerHTML = `<ul class="lo-legend-list">${[[1, '0–<20%'], [2, '20–<40%'], [3, '40–<60%'], [4, '60–<80%'], [5, '80–100%']].map(([level, range]) => `<li><span class="lo-band-pill" data-band="${level}">${range}</span><span>课堂 AP 参考 ${level}</span></li>`).join('')}</ul><p>分档由教师按每次作业得分率设定，不等同于 AP 官方 1–5 分换算。未出成绩不计 0 分，待复核不计 0 分。</p>`;

  // ---------- events ----------
  root.addEventListener('change', event => {
    const id = event.target.id;
    if(id==='lo-diag-order'){
      diagOrder=event.target.value;memory.set({diagOrder});renderDiagnosis(context.diagnoses);$('#lo-diag-order').focus();return;
    }
    if (id === 'lo-class') { filter.classId = event.target.value; filter.unit = ''; filter.assignmentId = ''; profileId = ''; selected = null; draw(); }
    else if (id === 'lo-unit') { filter.unit = event.target.value; filter.assignmentId = ''; draw(); }
    else if (id === 'lo-period') { filter.period = event.target.value; draw(); }
    else if (id === 'lo-assignment') { filter.assignmentId = event.target.value; draw(); }
    else if (id === 'lo-filter-sort') {
      const key = event.target.value;
      if (SORTS.some(([value]) => value === key)) {
        if (filter.sort === key) filter.direction = filter.direction === 'asc' ? 'desc' : 'asc';
        else { filter.sort = key; filter.direction = key === 'name' ? 'asc' : 'desc'; }
      }
    }
  });

  root.addEventListener('input', event => {
    if (event.target.id !== 'lo-query') return;
    filter.query = event.target.value;
    clearTimeout(filter.timer);
    filter.timer = setTimeout(draw, 120);
  });

  function offlineEditor(cell) {
    const grade = cell.record?.grade, submission = cell.record?.effective || cell.record?.latest;
    const max = scoreMaximum({...cell.assignment,maxPoints:grade?.maxPoints||cell.assignment.maxPoints},data.submissions.filter(s=>s.assignmentId===cell.assignment.id).map(s=>s.publishedGrade));
    const blank = grade?.total == null;
    const dialog = document.createElement('dialog');
    dialog.className = 'lo-offline-dialog';
    dialog.setAttribute('aria-label','修改成绩');
    dialog.innerHTML = `<form method="dialog"><h2>${h(cell.student.name)} · ${h(cell.assignment.title)}</h2><p class="lo-offline-meta">留空不计均分，0 分计入均分</p><label class="lo-offline-field"><span>分数</span><input name="score" type="number" min="0" step="0.1" value="${blank ? '' : grade.total}" inputmode="decimal"></label><label class="lo-offline-field"><span>满分</span><input name="maxPoints" type="number" min="0.1" max="1000000" step="0.1" required value="${max??''}" inputmode="decimal" placeholder="请填写本次满分"></label><label class="lo-offline-check"><input type="checkbox" name="absent"><span>留空（请假等，不计入均分）</span></label><p class="lo-offline-error" role="alert"></p><div class="lo-offline-actions"><button type="button" class="lo-btn" data-offline-cancel>取消</button><button type="submit" class="lo-btn lo-primary" data-offline-save>保存并更新统计</button></div><p class="lo-offline-note">保留原作答、逐题评分与改分历史；这里修改该学生的总分和满分。保存即公布；留空不会恢复旧分数。</p></form>`;
    document.body.append(dialog);
    const form = dialog.querySelector('form'), input = form.elements.score, maximum=form.elements.maxPoints, absent = form.elements.absent, error = form.querySelector('.lo-offline-error');
    absent.onchange = () => { input.disabled = absent.checked; if (!absent.checked) input.focus(); };
    dialog.querySelector('[data-offline-cancel]').onclick = () => dialog.close();
    dialog.addEventListener('close', () => dialog.remove());
    form.onsubmit = async event => {
      event.preventDefault(); error.textContent = '';
      const max=Number(maximum.value);if(!Number.isFinite(max)||max<=0){error.textContent='请填写大于 0 的满分';maximum.focus();return;}
      if (!absent.checked && (input.value === '' || !Number.isFinite(Number(input.value)) || Number(input.value)<0 || Number(input.value)>max)) { error.textContent = '请输入 0–'+max+' 之间的分数，或勾选留空'; input.focus(); return; }
      const button = dialog.querySelector('[data-offline-save]'); button.disabled = true;
      try {
        const response = await fetch('/api/homework/assignments/' + encodeURIComponent(cell.assignment.id) + '/students/' + encodeURIComponent(cell.student.id) + '/score', {method: 'PATCH', credentials: 'same-origin', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': state.csrf}, body: JSON.stringify({score: absent.checked ? null : Number(input.value), maxPoints:max, submissionId: submission?.id || null, revision: grade ? grade.revision || 1 : 0})});
        const value = await response.json();
        if (!response.ok) throw Error(value.error || '保存失败，请重试');
        dialog.close(); await refresh(); toast(absent.checked ? '已留空，不计入统计' : '成绩已更新，统计已重算');
      } catch (e) { error.textContent = e.message; button.disabled = false; }
    };
    dialog.showModal(); input.focus(); input.select();
  }
  root.addEventListener('dblclick', event => {
    const button = event.target.closest('[data-cell]');
    if (!button) return;
    const cell = context.rows.flatMap(row => row.cells.map(item => ({row, cell: item}))).find(item => item.cell.student.id === button.dataset.s && item.cell.assignment.id === button.dataset.a)?.cell;
    if (!cell) return;
    event.preventDefault();
    if (!cell.required && !cell.record?.grade) return;
    offlineEditor(cell);
  });

  root.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('[data-edit-score]')) { const found=findSelection(); if(found) offlineEditor(found.cell); return; }
    const cell = target.closest('[data-cell]');
    if (cell) { selectCell(cell.dataset.s, cell.dataset.a); return; }
    const sort = target.closest('[data-sort]');
    if (sort) { sortBy(sort.dataset.sort); return; }
    const tabButton = target.closest('.lo-tabs [data-tab]');
    if (tabButton) { setTab(tabButton.dataset.tab); return; }
    const analyze=target.closest('[data-ai-assignment]');
    if(analyze){void openAiReport(null,analyze.dataset.aiAssignment);return;}
    const diagItem = target.closest('[data-diag]');
    if (diagItem) {
      diagId = diagItem.dataset.diag; diagQuestion = ''; diagOpen = true;
      memory.set({diagId, diagQuestion, diagOpen});
      renderDiagnosis(context.diagnoses);
      renderDetail();
      $('#lo-diag')?.focus({preventScroll: true});
      return;
    }
    const diagQuestionButton = target.closest('[data-diag-question]');
    if (diagQuestionButton) { openDiagQuestion(diagQuestionButton.dataset.diagQuestion, diagQuestionButton); return; }
    if (target.closest('[data-diag-back]')) {
      diagOpen = false; memory.set({diagOpen: false});
      renderDiagnosis(context.diagnoses);
      renderDetail();
      diagList.querySelector('[data-diag]')?.focus({preventScroll: true});
      return;
    }
    const profileButton = target.closest('[data-profile]');
    if (profileButton) { openProfile(profileButton.dataset.profile); return; }
    const cardCell = target.closest('[data-card-cell]');
    if (cardCell) {
      const row = context.visible.find(item => item.student.id === cardCell.dataset.cardCell);
      const cellItem = row?.cells.filter(item => item.rate !== null).at(-1) || row?.cells.at(-1);
      if (cellItem) selectCell(row.student.id, cellItem.assignment.id);
      return;
    }
    const question = target.closest('[data-question]');
    if (question) { selectCell(question.dataset.s, question.dataset.a, question.dataset.q); return; }
    const openQuestion = target.closest('[data-open-question]');
    if (openQuestion) { selectCell(openQuestion.dataset.s, openQuestion.dataset.a, openQuestion.dataset.q); setTab('matrix', false); return; }
    const back = target.closest('[data-back-question]');
    if (back) {
      const found = findSelection();
      if (found) { selected = {studentId: found.row.student.id, assignmentId: found.cell.assignment.id}; memory.set({selection: selected}); renderDetail(); }
      return;
    }
    const mobile = target.closest('.lo-switch [data-mview]');
    if (mobile) {
      mobileView = mobile.dataset.mview === 'grid' ? 'grid' : 'list';
      memory.set({mobileView});
      root.dataset.mview = mobileView;
      $$('[data-mview]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mview === mobileView)));
      return;
    }
    if (target.closest('[data-close-detail]')) {
      if (tab === 'diagnosis' && !sheet.open) {
        diagQuestion = ''; memory.set({diagQuestion: ''});
        renderDetail();
        diagTrigger?.focus?.({preventScroll: true});
        return;
      }
      const activeCell = root.querySelector('[data-cell][aria-pressed="true"]');
      if (sheet.open) { closeSheet(); return; }
      selected = null;
      memory.set({selection: null});
      renderDetail();
      paintSelection();
      activeCell?.focus({preventScroll: true});
      return;
    }
    const copy = target.closest('[data-copy-report]');
    if (copy) { void copyReport(copy.dataset.copyReport); return; }
    const historyRow = target.closest('[data-history-cell]');
    if (historyRow) { setTab('matrix', false); selectCell(historyRow.dataset.s, historyRow.dataset.a); return; }
    if (target.closest('[data-profile-back]')) { profileId = ''; memory.set({profileId: ''}); renderStudents(context.visible); $('#lo-profile-list button')?.focus({preventScroll: true}); return; }
    const action = target.closest('[data-action]')?.dataset.action;
    if (action === 'export') { exportCSV(); return; }
    if (action === 'clear') { clearFilters(); return; }
    if (action === 'legend') { if (!legendSheet.open) legendSheet.showModal(); return; }
    if (action === 'class-report') { openClassReport(); return; }
    if (action === 'ai-report') { void openAiReport(); return; }
    const aiProfile = target.closest('[data-ai-profile]');
    if (aiProfile) { void openAiReport(aiProfile.dataset.aiProfile); return; }
    if (target.closest('[data-ai-again]')) { void openAiReport(null,null,lastAiScope); return; }
    if (target.closest('[data-ai-publish]')) { renderAiConfirm(); return; }
    if (target.closest('[data-ai-back]')) { if (aiReport) renderAiDraft(aiReport); return; }
    if (target.closest('[data-ai-confirm]')) { void publishAiReport(); return; }
    if (target.closest('[data-action="report-history"]')) { void openHistory(); return; }
    if (target.closest('[data-close-history]')) { histSheet.close(); return; }
    if (target.closest('[data-hist-retry]')) { void openHistory(); return; }
    if (target.closest('[data-hist-view]')) { void openHistoryReport(target.closest('[data-hist-view]').dataset.histView); return; }
    if (target.closest('[data-hist-revoke]')) { confirmHistoryRevoke(target.closest('[data-hist-revoke]').dataset.histRevoke); return; }
    if (target.closest('[data-hist-confirm]')) { void revokeHistoryReport(target.closest('[data-hist-confirm]').dataset.histConfirm); return; }
    if (target.closest('[data-hist-back]')) { void openHistory(); return; }
    if (target.closest('[data-close-ai]')) { aiSheet.close(); return; }
    if (target.closest('[data-close-report]')) { reportSheet.close(); return; }
    if (target.closest('#lo-filter')) { openFilterSheet(); return; }
    if (target.closest('#lo-refresh')) { void refresh(); return; }
    if (target.closest('[data-close-filter]')) { filterSheet.close(); return; }
    if (target.closest('[data-close-legend]')) { legendSheet.close(); return; }
    if (target.closest('[data-filter-reset]')) {
      filter.unit = ''; filter.assignmentId = ''; filter.status = 'all'; filter.query = ''; filter.sort = 'name'; filter.direction = 'asc';
      fill($('#lo-filter-unit'), [['', '全部单元']], ''); fill($('#lo-filter-assignment'), [['', '全部作业']], ''); fill($('#lo-filter-sort'), SORTS, 'name'); fill($('#lo-filter-status'), STATUS_FILTERS, 'all'); $('#lo-filter-query').value = '';
      return;
    }
    if (target.closest('[data-filter-apply]')) {
      filter.unit = $('#lo-filter-unit').value;
      filter.assignmentId = $('#lo-filter-assignment').value;
      filter.status = $('#lo-filter-status').value;
      filter.query = $('#lo-filter-query').value;
      const sortValue = $('#lo-filter-sort').value;
      if (SORTS.some(([id]) => id === sortValue) && filter.sort !== sortValue) {
        filter.sort = sortValue;
        filter.direction = sortValue === 'name' ? 'asc' : 'desc';
      }
      filterSheet.close();
      draw();
      $('#lo-filter')?.focus({preventScroll: true});
      return;
    }
  });

  // Close the more-menu after choosing an item.
  root.addEventListener('click', event => {
    if (event.target.closest('.lo-menu button')) $('#lo-more').open = false;
  }, true);

  $('#lo-matrix-scroll').addEventListener('keydown', event => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const current = event.target.closest('[data-cell]');
    if (!current) return;
    event.preventDefault();
    const table = matrixHost;
    const rows = [...table.querySelectorAll('tbody tr')];
    const tr = current.closest('tr');
    const rowIndex = rows.indexOf(tr);
    const cells = [...tr.querySelectorAll('[data-cell]')];
    const columnIndex = cells.indexOf(current);
    let nextRow = rowIndex, nextColumn = columnIndex;
    if (event.key === 'ArrowUp') nextRow -= 1;
    else if (event.key === 'ArrowDown') nextRow += 1;
    else if (event.key === 'ArrowLeft') nextColumn -= 1;
    else if (event.key === 'ArrowRight') nextColumn += 1;
    else if (event.key === 'Home') nextColumn = 0;
    else if (event.key === 'End') nextColumn = cells.length - 1;
    nextRow = Math.max(0, Math.min(rows.length - 1, nextRow));
    const targetCells = [...rows[nextRow].querySelectorAll('[data-cell]')];
    nextColumn = Math.max(0, Math.min(targetCells.length - 1, nextColumn));
    const next = targetCells[nextColumn];
    if (next) { next.focus(); next.scrollIntoView({block: 'nearest', inline: 'nearest'}); }
  });

  let scrollFrame = 0;
  scrollHost.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      memory.set({scrollTop: scrollHost.scrollTop, scrollLeft: scrollHost.scrollLeft});
    });
  }, {passive: true});

  $('#lo-tab-matrix').parentElement.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const order = ['matrix', 'diagnosis', 'students'];
    const index = Math.max(0, order.indexOf(tab));
    const next = order[(index + (event.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
    setTab(next);
    root.querySelector(`[data-tab="${next}"]`)?.focus();
  });

  sheet.addEventListener('close', () => {
    if (sheetTrigger && sheetTrigger.isConnected) sheetTrigger.focus({preventScroll: true});
    sheetTrigger = null;
  });
  filterSheet.addEventListener('close', () => {
    $('#lo-filter')?.setAttribute('aria-expanded', 'false');
    $('#lo-filter')?.focus({preventScroll: true});
  });

  const onMedia = () => {
    if (wide.matches) {
      if (sheet.open) sheet.close();
      mountOriginals(detailHost);
    }
  };
  wide.addEventListener('change', onMedia);

  // ---------- go ----------
  draw();
  setTab(tab, false);
  renderDetail();
  if (tab === 'students' && !profileId) renderStudents(context.visible);

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;disposeOriginals();
      wide.removeEventListener('change', onMedia);
      clearTimeout(filter.timer);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (sheet.open) sheet.close();
      if (filterSheet.open) filterSheet.close();
      if (legendSheet.open) legendSheet.close();
      if (reportSheet.open) reportSheet.close();
      root.remove();
    },
  };
}

function chipTone(key) {
  return {done: 'good', review: 'warn', missing: 'bad', incomplete: 'bad', attention: 'bad', correction: 'warn', progress: 'neutral', none: 'muted'}[key] || 'neutral';
}
