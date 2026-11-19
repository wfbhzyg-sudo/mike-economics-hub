import {splitChoiceCorrection} from '../homework/choice-correction.js';
import {optionLabels,publicOptionText} from './self-practice-model.mjs';
import {questionHasTopic} from '../homework/library-packs.js';
import {now} from './store.mjs';
import {assert, HttpError} from './validation.mjs';
import {
  DEFAULT_MINUTES,
  PracticeError,
  attemptIdFor,
  buildCatalog,
  buildAvailability,
  courseOf,
  drawPaper,
  finalizeAttempt,
  fingerprint,
  isOverdue,
  normalizeAnswers,
  publicAttempt,
  questionEligible,
  receiptIdFor,
  validateCreate,
  visibleUnitsForStudent,
} from './self-practice-model.mjs';

const SWEEP_MS = 30_000;
const isQuestionImage = (file) => Boolean(file?.mime?.startsWith('image/') && ['library', 'question'].includes(file.purpose));

function practiceError(error) {
  if (error instanceof PracticeError) return new HttpError(error.status, error.message);
  return error;
}

export function createSelfPractice({db}) {
  const byId = new Map();

  async function eligibleByUnit(units) {
    // Importers store original question crops as `question`; recrops use `library`.
    // Keep this cache request-local so a repaired file is visible without a restart.
    const fileCache = new Map();
    const map = {};
    for (const unit of units) {
      const questions = (await db.list('library-question', undefined, unit.id))
        .filter((question) => questionEligible(question, {unit}));
      const imageIds = [...new Set(questions.flatMap((question) => Array.isArray(question.questionImages) ? question.questionImages : []))];
      const missingIds = imageIds.filter((fileId) => !fileCache.has(fileId));
      const files = missingIds.length ? (db.getMany ? await db.getMany(missingIds) : await Promise.all(missingIds.map((fileId) => db.get(fileId)))) : [];
      for (const fileId of missingIds) fileCache.set(fileId, false);
      for (const file of files) if (file) fileCache.set(file.id, isQuestionImage(file));
      map[unit.id] = questions.filter((question) =>
        questionEligible(question, {unit, imageExists: (fileId) => fileCache.get(fileId) === true}));
    }
    return map;
  }

  async function studentUnits(user, course) {
    const units = (await db.list('library-unit')).filter((unit) => !course || courseOf(unit) === course);
    const releases = await db.list('library-release');
    return visibleUnitsForStudent(units, user, releases).filter((unit) => !course || courseOf(unit) === course);
  }

  async function catalog(user, course) {
    const units = await studentUnits(user, course);
    const questions = await eligibleByUnit(units);
    const entries = buildCatalog({units, questionsByUnit: questions, course});
    const total = entries.reduce((sum, entry) => sum + entry.questionCount, 0);
    return {
      course,
      units: entries,
      availability: buildAvailability({units, questionsByUnit: questions}),
      questionCount: total,
      defaultMinutes: DEFAULT_MINUTES,
      counts: [10, 20, 30],
    };
  }

  async function canReadFile(file, user) {
    if (user.role !== 'student' || !isQuestionImage(file)) return false;
    const attempts = await db.find('self-practice-attempt', {studentId: user.id});
    return attempts.some((attempt) => attempt.studentId === user.id &&
      attempt.questions?.some((question) => question.questionImages?.includes(file.id)));
  }

  async function loadAttempt(user, id, client = db) {
    const attempt = await db.get(id, client);
    assert(attempt?.type === 'self-practice-attempt', '练习记录不存在', 404);
    assert(attempt.studentId === user.id, '未找到这次练习', 404);
    return attempt;
  }

  async function settle(attempt, client = db) {
    if (!isOverdue(attempt)) return attempt;
    const finalized = finalizeAttempt(attempt, {
      autoSubmitted: true,
      receiptId: receiptIdFor(attempt.id),
    });
    await db.put('self-practice-attempt', finalized, client);
    await db.put('self-practice-receipt', {
      id: finalized.receiptId,
      type: 'self-practice-receipt',
      attemptId: finalized.id,
      studentId: finalized.studentId,
      total: finalized.result.total,
      maxPoints: finalized.result.maxPoints,
      submittedAt: finalized.submittedAt,
      autoSubmitted: true,
      createdAt: finalized.submittedAt,
    }, client);
    await db.audit(finalized.studentId, 'self_practice_auto_submit', finalized.id, client);
    return finalized;
  }

  async function saveAnswers(user, id, body) {
    return db.tx(async (client) => {
      let attempt = await loadAttempt(user, id, client);
      if (attempt.status === 'submitted') throw new PracticeError(409, '这次练习已经交卷');
      if (attempt.status === 'created') throw new PracticeError(409, '请先开始答题');
      attempt = await settle(attempt, client);
      if (attempt.status === 'submitted') throw new PracticeError(409, '时间已到，答案已按截止前保存内容提交');
      assert(Number.isInteger(Number(body?.revision)), '缺少答案版本', 400);
      if (Number(body.revision) !== attempt.revision) throw new PracticeError(409, '答案已在另一台设备更新，请刷新后重试');
      const answers = normalizeAnswers(attempt, {...(attempt.answers || {}), ...(body?.answers || {})});
      const flags = Array.isArray(body?.flags)
        ? [...new Set(body.flags.filter((qid) => attempt.questions.some((q) => q.id === qid)))]
        : attempt.flags;
      const index = Number.isInteger(Number(body?.index))
        ? Math.max(0, Math.min(attempt.questions.length - 1, Number(body.index)))
        : attempt.index;
      const next = {
        ...attempt,
        answers,
        flags,
        excluded:body.excluded ? Object.fromEntries(attempt.questions.map(q=>[q.id,optionLabels(q).filter(v=>Array.isArray(body.excluded[q.id]) && body.excluded[q.id].includes(v) && answers[q.id]!==v)])) : attempt.excluded,
        index,
        revision: attempt.revision + 1,
        updatedAt: now(),
      };
      await db.put('self-practice-attempt', next, client);
      return {revision: next.revision, savedAt: next.updatedAt, index: next.index};
    }, `self-practice:${user.id}`);
  }

  async function submit(user, id, body) {
    return db.tx(async (client) => {
      let attempt = await loadAttempt(user, id, client);
      if (attempt.status === 'submitted') return {receiptId: attempt.receiptId, result: attempt.result, autoSubmitted: Boolean(attempt.autoSubmitted), deduplicated: true};
      if (attempt.status === 'created') throw new PracticeError(409, '请先开始答题');
      if (attempt.deadlineAt && Date.parse(attempt.deadlineAt) <= Date.now()) {
        const finalized = finalizeAttempt(attempt, {autoSubmitted: true, receiptId: receiptIdFor(attempt.id)});
        await db.put('self-practice-attempt', finalized, client);
        await db.put('self-practice-receipt', {
          id: finalized.receiptId,
          type: 'self-practice-receipt',
          attemptId: finalized.id,
          studentId: finalized.studentId,
          total: finalized.result.total,
          maxPoints: finalized.result.maxPoints,
          submittedAt: finalized.submittedAt,
          autoSubmitted: true,
          createdAt: finalized.submittedAt,
        }, client);
        return {receiptId: finalized.receiptId, result: finalized.result, autoSubmitted: true};
      }
      if (body?.answers) {
        assert(Number(body.revision) === attempt.revision, '答案已在另一台设备更新，请刷新后重试', 409);
        attempt = {...attempt, answers: normalizeAnswers(attempt, {...(attempt.answers || {}), ...body.answers})};
      }
      const finalized = finalizeAttempt(attempt, {receiptId: receiptIdFor(attempt.id)});
      await db.put('self-practice-attempt', finalized, client);
      await db.put('self-practice-receipt', {
        id: finalized.receiptId,
        type: 'self-practice-receipt',
        attemptId: finalized.id,
        studentId: finalized.studentId,
        total: finalized.result.total,
        maxPoints: finalized.result.maxPoints,
        submittedAt: finalized.submittedAt,
        autoSubmitted: false,
        createdAt: finalized.submittedAt,
      }, client);
      await db.audit(user.id, 'self_practice_submit', finalized.id, client);
      return {receiptId: finalized.receiptId, result: finalized.result};
    }, `self-practice:${user.id}`);
  }

  async function create(user, body) {
    if (user.role !== 'student') throw new PracticeError(403, '自主模考仅对学生开放');
    const units = await studentUnits(user, body?.course);
    const topics = new Set();
    for (const unit of units) for (const topic of unit.topics || []) topics.add(`${courseOf(unit)}:${topic.id}`);
    const input = validateCreate(body, {allowedTopics: topics});
    const attemptId = attemptIdFor(user.id, input.clientId);
    const existing = await db.get(attemptId);
    if (existing) return {attempt: publicAttempt(existing), created: false};
    const scopedUnits = units.filter((unit) => (unit.topics || []).some((topic) => input.topicIds.includes(topic.id)));
    const pools = await eligibleByUnit(scopedUnits);
    const questions = [];
    const seen = new Set();
    for (const unit of scopedUnits) {
      for (const question of pools[unit.id] || []) {
        if (!input.topicIds.some((topic) => questionHasTopic(question, topic))) continue;
        const key = fingerprint(question);
        if (seen.has(key)) continue;
        seen.add(key);
        questions.push({...question, unitId: unit.id});
      }
    }
    const drawn = drawPaper({questions, topicIds: input.topicIds, count: input.questionCount});
    const attempt = {
      id: attemptId,
      type: 'self-practice-attempt',
      studentId: user.id,
      classIds: [...(user.classIds || [])],
      clientId: input.clientId,
      course: input.course,
      topicIds: input.topicIds,
      timerMode: input.timerMode,
      timeLimitMinutes: input.timerMode === 'countdown' ? input.timeLimitMinutes : 0,
      questionCount: drawn.length,
      questions: drawn.map((question) => ({
        id: question.id,
        number: question.number || '',
        topic: input.topicIds.includes(question.topic) ? question.topic : input.topicIds.find((topic) => questionHasTopic(question, topic)),
        prompt: question.prompt || '',
        options: optionLabels(question),
        optionText: publicOptionText(question),
        answer: String(question.answer || '').toUpperCase(),
        questionImages: question.questionImages || [],
        sourcePages: question.sourcePages || '',
        knowledge: question.knowledge || '',
        unitId: question.unitId,
        source: question.source || '',
        version: question.version || 1,
      })),
      answers: {},
      flags: [],
      index: 0,
      revision: 0,
      status: 'created',
      startedAt: null,
      deadlineAt: null,
      submittedAt: null,
      receiptId: null,
      result: null,
      corrections: {},
      createdAt: now(),
      updatedAt: now(),
    };
    await db.put('self-practice-attempt', attempt);
    return {attempt: publicAttempt(attempt), created: true};
  }

  async function start(user, id) {
    return db.tx(async (client) => {
      const attempt = await loadAttempt(user, id, client);
      if (attempt.status === 'submitted') throw new PracticeError(409, '这次练习已经交卷');
      if (attempt.startedAt) return publicAttempt(attempt);
      const startedAt = new Date();
      const deadlineAt = attempt.timerMode === 'countdown'
        ? new Date(startedAt.getTime() + attempt.timeLimitMinutes * 60_000).toISOString()
        : null;
      const next = {...attempt, status: 'active', startedAt: startedAt.toISOString(), deadlineAt, updatedAt: now()};
      await db.put('self-practice-attempt', next, client);
      return publicAttempt(next);
    }, `self-practice:${user.id}`);
  }

  async function get(user, id) {
    const attempt = await loadAttempt(user, id);
    const settled = await settle(attempt);
    return publicAttempt(settled);
  }

  async function result(user, id) {
    const attempt = await loadAttempt(user, id);
    const settled = await settle(attempt);
    if (settled.status !== 'submitted') throw new PracticeError(409, '交卷后才能查看结果');
    const result = publicAttempt(settled, {includeResult: true});
    const notes = await db.find('mistake-note', {studentId:user.id, assignmentId:id});
    result.corrections = {...result.corrections};
    for (const note of notes) {
      const prior = result.corrections[note.questionId];
      const last = note.corrections?.at(-1);
      if (!last || (prior && prior.updatedAt >= last.createdAt)) continue;
      const {choice,explanation} = splitChoiceCorrection(last.text);
      result.corrections[note.questionId] = {choice,note:explanation,updatedAt:last.createdAt};
    }
    return result;
  }

  async function list(user) {
    const attempts = (await db.list('self-practice-attempt'))
      .filter((attempt) => attempt.studentId === user.id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 30);
    return attempts.map((attempt) => ({
      id: attempt.id,
      course: attempt.course,
      topicIds: attempt.topicIds,
      questionCount: attempt.questionCount,
      timerMode: attempt.timerMode,
      timeLimitMinutes: attempt.timeLimitMinutes,
      status: attempt.status,
      createdAt: attempt.createdAt,
      submittedAt: attempt.submittedAt,
      startedAt: attempt.startedAt,
      result: attempt.result ? {
        total: attempt.result.total,
        maxPoints: attempt.result.maxPoints,
        percent: attempt.result.percent,
        durationSeconds: attempt.result.durationSeconds,
        autoSubmitted: attempt.result.autoSubmitted,
      } : null,
    }));
  }

  async function correct(user, id, body) {
    return db.tx(async (client) => {
      const attempt = await loadAttempt(user, id, client);
      assert(attempt.status === 'submitted', '交卷后才能订正', 409);
      const questionId = String(body?.questionId || '');
      assert(attempt.questions.some((question) => question.id === questionId), '题目不在这次练习中', 400);
      const choice = String(body?.choice || '').toUpperCase();
      const question = attempt.questions.find((item) => item.id === questionId);
      assert(optionLabels(question).includes(choice), '请选择有效选项', 400);
      const note = String(body?.note || '').slice(0, 500);
      const corrections = {...(attempt.corrections || {}), [questionId]: {choice, note, updatedAt: now()}};
      const next = {...attempt, corrections, updatedAt: now()};
      await db.put('self-practice-attempt', next, client);
      return {corrections: next.corrections};
    }, `self-practice:${user.id}`);
  }

  async function sweep() {
    const attempts = (await db.list('self-practice-attempt')).filter((attempt) => attempt.status === 'active');
    for (const attempt of attempts) {
      if (!isOverdue(attempt)) continue;
      await db.tx(async (client) => {
        const current = await db.get(attempt.id, client);
        if (!current || current.status !== 'active' || !isOverdue(current)) return;
        await settle(current, client);
      }, `self-practice:${attempt.studentId}`).catch(() => {});
    }
  }

  async function handle(ctx) {
    const {res, route, method, user, body, json} = ctx;
    if (route[0] !== 'self-practice') return false;
    const query = new URL(ctx.req.url, 'http://local').searchParams;
    const student = () => assert(user.role === 'student', '自主模考仅对学生开放', 403);
    try {
      if (route[1] === 'catalog' && method === 'GET') {
        student();
        return (json(res, await catalog(user, query.get('course') || '')), true);
      }
      if (route[1] === 'attempts' && method === 'GET' && !route[2]) {
        student();
        return (json(res, {attempts: await list(user)}), true);
      }
      if (route[1] === 'attempts' && method === 'POST' && !route[2]) {
        student();
        const payload = await body(ctx.req);
        const created = await create(user, payload);
        return (json(res, created, created.created ? 201 : 200), true);
      }
      if (route[1] !== 'attempts' || !route[2]) return false;
      const id = route[2];
      if (method === 'GET' && !route[3]) {
        student();
        return (json(res, {attempt: await get(user, id)}), true);
      }
      if (route[3] === 'start' && method === 'POST') {
        student();
        return (json(res, {attempt: await start(user, id)}), true);
      }
      if (route[3] === 'answers' && (method === 'PATCH' || method === 'PUT')) {
        student();
        const payload = await body(ctx.req);
        return (json(res, await saveAnswers(user, id, payload)), true);
      }
      if (route[3] === 'submit' && method === 'POST') {
        student();
        const payload = await body(ctx.req);
        return (json(res, await submit(user, id, payload)), true);
      }
      if (route[3] === 'result' && method === 'GET') {
        student();
        return (json(res, {attempt: await result(user, id)}), true);
      }
      if (route[3] === 'correct' && method === 'POST') {
        student();
        const payload = await body(ctx.req);
        return (json(res, await correct(user, id, payload)), true);
      }
      return false;
    } catch (error) {
      throw practiceError(error);
    }
  }

  return {handle, sweep, catalog, create, start, get, saveAnswers, submit, result, list, correct, canReadFile};
}

export function startSelfPracticeSweeper(module) {
  const timer = setInterval(() => {
    module.sweep().catch(() => {});
  }, SWEEP_MS);
  timer.unref?.();
  return timer;
}
