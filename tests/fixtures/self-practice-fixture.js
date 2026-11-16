import {createSelfPracticeUI} from '/homework/self-practice.js';
const main = document.querySelector('#main');
const state = {user: {id: 'fixture-student', name: '试点学生', role: 'student'}, csrf: 'fixture'};
const imageUrl = '/img/fixture-page.svg';
const topicDefs = {
  'micro-unit-2': {unitId: 'micro-unit-2', title: 'AP 微观 · Unit 2 供给与需求', questionCount: 100,
    topics: [{id: '2.1', name: 'Demand', title: '需求', count: 46}, {id: '2.2', name: 'Supply', title: '供给', count: 25}, {id: '2.3', name: 'Price Elasticity of Demand', title: '需求价格弹性', count: 43}]},
  'macro-unit-2': {unitId: 'macro-unit-2', title: 'AP 宏观 · Unit 2 经济指标', questionCount: 80,
    topics: [{id: '2.1', name: 'The Circular Flow and GDP', title: '循环流量与 GDP', count: 60}, {id: '2.2', name: 'Unemployment', title: '失业', count: 20}]},
};
const catalog = {micro: {course: 'micro', units: [topicDefs['micro-unit-2']], questionCount: 114},
  macro: {course: 'macro', units: [topicDefs['macro-unit-2']], questionCount: 80}};
let revision = 0, attempt = null, submitted = false;
const questions = Array.from({length: 20}, (_, i) => ({
  id: 'q' + (i + 1), number: String(i + 1), topic: i < 8 ? '2.1' : i < 14 ? '2.2' : '2.3',
  prompt: '', questionImages: ['img-a'], sourcePages: `原书 p.${20 + i}`,
  optionLabels: ['A', 'B', 'C', 'D', 'E'],
}));
const answers = {};
const api = async (path, options = {}) => {
  if (path.startsWith('self-practice/catalog')) return catalog[new URLSearchParams(path.split('?')[1]).get('course') || 'micro'];
  if (path === 'self-practice/attempts') return {attempts: []};
  if (path.match(/^self-practice\/attempts\/[^/]+\/result$/)) {
    const result = {total: 16, maxPoints: 20, percent: 80, durationSeconds: 1338, autoSubmitted: false, submittedAt: new Date().toISOString(),
      topics: [{topic: '2.1', correct: 7, count: 8}, {topic: '2.2', correct: 5, count: 6}, {topic: '2.3', correct: 4, count: 6}],
      questions: questions.map((q, i) => ({...q, correct: i < 16, chosen: i < 18 ? 'A' : '', correctOption: 'B'}))};
    return {attempt: {...attempt, result, corrections: {}}};
  }
  if (path.match(/^self-practice\/attempts\/[^/]+$/)) return {attempt};
  throw Object.assign(new Error('夹具未实现：' + path), {status: 404});
};
const post = async (path, body = {}) => {
  if (path === 'self-practice/attempts') {
    attempt = {id: 'fixture-attempt', status: 'created', course: body.course, topicIds: body.topicIds, timerMode: body.timerMode,
      timeLimitMinutes: body.timeLimitMinutes, startedAt: null, deadlineAt: null, serverNow: new Date().toISOString(), serverOffset: 0,
      answers: {}, flags: [], index: 0, revision: 0, questions};
    return {attempt};
  }
  if (path.endsWith('/start')) {
    const now = Date.now();
    attempt = {...attempt, status: 'active', startedAt: new Date(now).toISOString(), serverNow: new Date(now).toISOString(),
      deadlineAt: attempt.timerMode === 'countdown' ? new Date(now + attempt.timeLimitMinutes * 60000).toISOString() : null};
    return {attempt};
  }
  if (path.endsWith('/submit')) { submitted = true; return {receiptId: 'receipt', result: {}}; }
  if (path.endsWith('/correct')) return {corrected: true};
  throw new Error('夹具未实现：' + path);
};
const put = async (path, body = {}) => {
  if (path.endsWith('/answers')) { revision = body.revision + 1; Object.assign(answers, body.answers); attempt = {...attempt, answers: {...answers}, revision}; return {revision}; }
  throw new Error('夹具未实现：' + path);
};
const go = (route) => { location.hash = route; };
let toastText = '';
const toast = (message) => { toastText = message; const host = document.querySelector('#notice'); host.textContent = message; host.classList.add('visible'); };
const h = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const ui = createSelfPracticeUI({main, state, api, post, put, go, h, toast});
async function renderRoute() {
  const route = location.hash.slice(1).split('/');
  if (route[0] === 'self-practice') await ui.render(route[1] || 'create', route[2]);
  else await ui.render(route[0] || 'create', route[1]);
}
window.addEventListener('hashchange', renderRoute);
await renderRoute();
window.__fixture = {ui, get attempt() { return attempt; }, get submitted() { return submitted; }, answers};
window.__ready = true;
