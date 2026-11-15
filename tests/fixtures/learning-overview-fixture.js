import {buildData, FIXTURE_CLASSES} from './learning-overview-data.js';
import {mountLearningOverview} from '../../homework/learning-overview.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
const icons = {
  book: 'M12 5v16M12 5C8 2 5 2 2 3v16c4-1 6 0 10 2 4-2 6-3 10-2V3c-3-1-6-1-10 2',
  work: 'M9 4H5v17h14V4h-4M9 2h6v5H9zM8 13l3 3 5-6',
  chart: 'M4 21V11h4v10m4 0V6h4v15m4 0V2h2v19',
  bars: 'M4 20h16M7 20v-7m5 7V8m5 12v-4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};
const icon = name => `<svg class="tw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.bars}"/></svg>`;
const sections = [['library', '课程教学包', 'book', '课程'], ['work/assignments', '作业管理', 'work', '作业'], ['work/reviews', '作业批阅', 'chart', '批阅'], ['analytics', '学情', 'bars', '学情']];
const links = sections.map(([route, title, name]) => `<a href="#${route}" ${route === 'analytics' ? 'aria-current="page"' : ''}>${icon(name)}${title}</a>`).join('');
const mobileLinks = sections.map(([route, title, name, short]) => `<a href="#${route}" ${route === 'analytics' ? 'aria-current="page"' : ''}>${icon(name)}${short}</a>`).join('');
document.querySelector('#teacher-navigation').innerHTML = links;
document.querySelector('#mobile-navigation').innerHTML = mobileLinks + `<button type="button" data-open-more>${icon('more')}更多</button>`;
document.querySelector('#more-menu').innerHTML = '<a href="#classes">班级与学生</a><a href="#work/gradebook">成绩档案</a><a href="/">返回一页通</a>';

const data = buildData(new Date());
const state = {
  user: {id: 'teacher-fixture', name: '林老师', role: 'teacher'},
  csrf: 'fixture',
  meta: {classes: FIXTURE_CLASSES, books: [], capabilities: {admin: false}},
  classId: 'c1', book: 'ap-microeconomics', course: 'micro',
  controller: null, version: 1, homework: null, lastHash: '', dirty: false,
  routeVersion: 1,
};
const toast = message => {
  const element = document.querySelector('#tw-toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove('visible'), 3000);
};
const link = (route, text, primary = false) => `<a class="tw-button ${primary ? 'tw-primary' : ''}" href="#${route}">${escape(text)}</a>`;

const view = mountLearningOverview({
  state,
  main: document.querySelector('#workspace'),
  h: escape,
  toast,
  link,
  load: () => Promise.resolve(data),
}, data);

window.__fixture = {state, data, view};
window.__ready = true;
