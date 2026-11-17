import {createHash} from 'node:crypto';
import {questionHasTopic} from '../homework/library-packs.js';

export const PRACTICE_COUNTS = [10, 20, 30];
export const TIMER_MODES = ['countup', 'countdown'];
export const DEFAULT_MINUTES = 25;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 240;

export class PracticeError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

const hash = (value) => createHash('sha256').update(String(value)).digest('hex');

export function classKey(value) {
  return String(value || '').replace(/^bookself-class:/, '');
}

export function belongsToClass(ids, classId) {
  const target = classKey(classId);
  return (Array.isArray(ids) ? ids : []).some((id) => classKey(id) === target);
}

export function courseOf(unitOrId) {
  const id = typeof unitOrId === 'string' ? unitOrId : unitOrId?.id;
  const match = /^(micro|macro)-unit-[1-6]$/.exec(String(id || ''));
  return match ? match[1] : '';
}

export function visibleUnitsForStudent(units, user, releases) {
  if (user?.role !== 'student') return [];
  const ids = Array.isArray(user.classIds) ? user.classIds : [];
  return units.filter((unit) =>
    releases.some((release) =>
      release.unitId === unit.id &&
      (!release.owner || release.owner === unit.owner) &&
      (release.classIds || []).some((classId) => ids.some((own) => classKey(own) === classKey(classId)))));
}

export function questionImageIds(question) {
  return Array.isArray(question?.questionImages) ? question.questionImages.filter(Boolean) : [];
}

export const optionLabels = q => (Array.isArray(q?.options) && q.options.length ? q.options : q?.optionLabels || []).map(v => typeof v === 'object' ? String(v.label || '') : String(v)).filter(v => /^[A-E]$/.test(v));

export function questionEligible(question, {unit, imageExists} = {}) {
  if (!question || question.status !== 'ready') return false;
  if (question.type !== 'choice') return false;
  if (question.duplicateOf || question.canonicalQuestionId) return false;
  if (Array.isArray(question.reviewFlags) && question.reviewFlags.length) return false;
  if (question.collection === 'exam') return false;
  if (!unit || question.unitId !== unit.id) return false;
  if (!(unit.topics || []).some((topic) => topic.id === question.topic)) return false;
  const labels = optionLabels(question);
  if (!labels.length) return false;
  if (!labels.includes(String(question.answer || ''))) return false;
  const images = questionImageIds(question);
  if (!images.length) return false;
  if (typeof imageExists === 'function' && !images.every((fileId) => imageExists(fileId))) return false;
  if (question.type === 'choice' && question.choiceMode === 'multiple') return false;
  return true;
}

export function fingerprint(question) {
  const base = [question.source || '', question.number || ''].join('|');
  return base.trim() === '|' ? String(question.id || '') : base;
}

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildCatalog({units, questionsByUnit, course}) {
  const wanted = course || '';
  const result = [];
  for (const unit of units) {
    if (wanted && courseOf(unit) !== wanted) continue;
    const topics = (unit.topics || []).map((topic) => {
      const count = (questionsByUnit[unit.id] || []).filter((q) => questionHasTopic(q,topic.id) && q.status === 'ready' && q.type === 'choice' && !q.duplicateOf && !q.canonicalQuestionId && q.collection !== 'exam').length;
      return {id: topic.id, name: topic.name || topic.id, title: topic.title || '', count, bookself: topic.bookself || ''};
    });
    const total = new Set((questionsByUnit[unit.id] || []).filter(q=>q.status==='ready'&&q.type==='choice'&&!q.duplicateOf&&!q.canonicalQuestionId&&q.collection!=='exam'&&topics.some(t=>questionHasTopic(q,t.id))).map(q=>q.id)).size;
    if (!total) continue;
    result.push({unitId: unit.id, title: unit.title || unit.id, course: courseOf(unit), topics, questionCount: total});
  }
  return result.sort((a, b) => a.unitId.localeCompare(b.unitId));
}

export function validateCreate(body, {allowedTopics} = {}) {
  const clientId = String(body?.clientId || '').trim();
  if (!/^[A-Za-z0-9_.:-]{8,80}$/.test(clientId)) throw new PracticeError(400, '练习编号无效，请刷新后重试');
  const course = String(body?.course || '');
  if (!['micro', 'macro'].includes(course)) throw new PracticeError(400, '请选择 AP 微观或 AP 宏观');
  if (!Array.isArray(body?.topicIds) || !body.topicIds.length) throw new PracticeError(400, '请至少选择一个章节');
  const topicIds = [...new Set(body.topicIds.map((id) => String(id)))];
  if (topicIds.length > 24) throw new PracticeError(400, '一次最多选择 24 个章节');
  if (allowedTopics) {
    const unknown = topicIds.filter((id) => !allowedTopics.has(`${course}:${id}`));
    if (unknown.length) throw new PracticeError(403, '所选章节不在可练习范围内');
  }
  if (!PRACTICE_COUNTS.includes(Number(body?.questionCount))) throw new PracticeError(400, '题量只能选择 10、20 或 30 题');
  const timerMode = String(body?.timerMode || 'countup');
  if (!TIMER_MODES.includes(timerMode)) throw new PracticeError(400, '计时方式无效');
  const minutes = timerMode === 'countdown' ? Number(body?.timeLimitMinutes) : 0;
  if (timerMode === 'countdown' && (!Number.isInteger(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES)) {
    throw new PracticeError(400, `倒计时需为 ${MIN_MINUTES}–${MAX_MINUTES} 分钟`);
  }
  return {clientId, course, topicIds, questionCount: Number(body.questionCount), timerMode, timeLimitMinutes: minutes};
}

export function drawPaper({questions, topicIds, count, random = Math.random}) {
  const wanted = [...new Set(topicIds)].filter((id) => questions.some((q) => questionHasTopic(q,id)));
  if (!wanted.length) throw new PracticeError(400, '这些章节暂时没有可练习题');
  const seen = new Set();
  const pools = new Map(wanted.map((topic) => [
    topic,
    shuffle(questions.filter((q) => {
      if (!questionHasTopic(q,topic)) return false;
      const key = fingerprint(q);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }), random),
  ]));
  const available = [...pools.values()].reduce((sum, pool) => sum + pool.length, 0);
  if (available < count) {
    throw new PracticeError(400, `可练习题不足：所选章节当前共 ${available} 道，请减少题数或增加章节`, {available});
  }
  const order = shuffle(wanted, random);
  const base = Math.floor(count / order.length);
  let remainder = count % order.length;
  const picked = [];
  const pickedIds = new Set();
  const take = (topic, limit) => {
    const pool = pools.get(topic) || [];
    for (const question of pool) {
      if (limit <= 0 || picked.length >= count) break;
      if (pickedIds.has(question.id)) continue;
      picked.push(question);
      pickedIds.add(question.id);
      limit -= 1;
    }
    return limit;
  };
  for (const topic of order) {
    const quota = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    take(topic, quota);
  }
  let cursor = 0;
  while (picked.length < count) {
    const topic = order[cursor % order.length];
    const before = picked.length;
    take(topic, 1);
    if (picked.length === before && order.every((t) => (pools.get(t) || []).every((q) => pickedIds.has(q.id)))) break;
    cursor += 1;
    if (cursor > order.length * count * 2) break;
  }
  if (picked.length !== count) throw new PracticeError(400, `可练习题不足：当前只能抽取 ${picked.length} 道`);
  return shuffle(picked, random);
}

export function attemptIdFor(studentId, clientId) {
  return `self-practice-attempt:${hash(`${studentId}\u0000${clientId}`).slice(0, 40)}`;
}

export function receiptIdFor(attemptId) {
  return `self-practice-receipt:${hash(attemptId).slice(0, 40)}`;
}

export function publicQuestion(question) {
  return {
    id: question.id,
    number: question.number || '',
    topic: question.topic || '',
    prompt: question.prompt || '',
    optionLabels: optionLabels(question),
    questionImages: questionImageIds(question),
    sourcePages: question.sourcePages || '',
    knowledge: question.knowledge || '',
  };
}

export function publicResult(attempt) {
  return attempt?.result || null;
}

export function publicAttempt(attempt, {includeResult = false} = {}) {
  if (!attempt) return null;
  return {
    id: attempt.id,
    course: attempt.course,
    topicIds: attempt.topicIds,
    questionCount: attempt.questions.length,
    timerMode: attempt.timerMode,
    timeLimitMinutes: attempt.timeLimitMinutes,
    status: attempt.status,
    revision: attempt.revision,
    startedAt: attempt.startedAt,
    deadlineAt: attempt.deadlineAt,
    createdAt: attempt.createdAt,
    submittedAt: attempt.submittedAt,
    autoSubmitted: Boolean(attempt.autoSubmitted),
    index: attempt.index || 0,
    answers: {...(attempt.answers || {})},
    flags: [...(attempt.flags || [])],
    questions: attempt.questions.map(publicQuestion),
    ...(includeResult || attempt.status === 'submitted' ? {result: attempt.result, corrections: attempt.corrections || {}} : {}),
    serverNow: new Date().toISOString(),
  };
}

export function normalizeAnswers(attempt, answers) {
  const result = {};
  for (const [questionId, choice] of Object.entries(answers || {})) {
    const question = attempt.questions.find((q) => q.id === questionId);
    if (!question) continue;
    const label = String(choice || '').toUpperCase();
    if (optionLabels(question).includes(label)) result[questionId] = label;
  }
  return result;
}

export function scoreAttempt(attempt, submittedAt = new Date()) {
  const perQuestion = attempt.questions.map((question) => {
    const answer = String(question.answer || '').toUpperCase();
    const chosen = attempt.answers?.[question.id] ? String(attempt.answers[question.id]).toUpperCase() : '';
    const correct = Boolean(chosen && chosen === answer);
    return {
      id: question.id,
      number: question.number || '',
      topic: question.topic || '',
      chosen,
      correctOption: answer,
      correct,
      score: correct ? 1 : 0,
      maxPoints: 1,
      questionImages: questionImageIds(question),
      optionLabels: optionLabels(question),
      prompt: question.prompt || '',
      sourcePages: question.sourcePages || '',
      knowledge: question.knowledge || '',
    };
  });
  const total = perQuestion.reduce((sum, item) => sum + item.score, 0);
  const topics = {};
  for (const item of perQuestion) {
    const key = item.topic || '未分章节';
    topics[key] = topics[key] || {topic: key, correct: 0, count: 0};
    topics[key].count += 1;
    if (item.correct) topics[key].correct += 1;
  }
  const startedAt = attempt.startedAt ? Date.parse(attempt.startedAt) : null;
  const durationSeconds = startedAt ? Math.max(0, Math.round((new Date(submittedAt).getTime() - startedAt) / 1000)) : 0;
  return {
    total,
    maxPoints: perQuestion.length,
    percent: perQuestion.length ? Math.round((total / perQuestion.length) * 100) : 0,
    durationSeconds,
    submittedAt: new Date(submittedAt).toISOString(),
    autoSubmitted: Boolean(attempt.autoSubmitted),
    topics: Object.values(topics).sort((a, b) => String(a.topic).localeCompare(String(b.topic))),
    questions: perQuestion,
  };
}

export function isOverdue(attempt, now = new Date()) {
  return attempt.status === 'active' && attempt.deadlineAt && Date.parse(attempt.deadlineAt) <= new Date(now).getTime();
}

export function finalizeAttempt(attempt, {now = new Date(), autoSubmitted = false, receiptId = ''} = {}) {
  const submittedAt = autoSubmitted && attempt.deadlineAt ? new Date(attempt.deadlineAt) : now;
  const next = {
    ...attempt,
    status: 'submitted',
    submittedAt: new Date(submittedAt).toISOString(),
    autoSubmitted: Boolean(autoSubmitted),
    receiptId,
    revision: (attempt.revision || 0) + 1,
  };
  next.result = scoreAttempt(next, submittedAt);
  return next;
}
