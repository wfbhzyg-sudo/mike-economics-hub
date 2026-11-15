// Deterministic stand-in for GET /api/homework/learning.
// Used only by the browser fixture; never imported by production code.
const DAY = 86400000;

function rngFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  '陈亦航', '林知遥', '周予安', '许清和', '沈星野', '赵可欣',
  '欧阳娜娜·阿卜杜勒拉赫曼·穆罕默德·阿尔萨义德·本·哈立德',
  '吴桐', '郑一诺', '孙嘉禾', '何思远', '黄若曦', '徐望舒', '朱映雪', '高以宁', '罗嘉懿', '梁书瑶', '宋其琛',
  '唐雨桐', '谢明煦', '韩沐阳', '冯语汐', '邓知夏', '曹嘉树', '彭清越', '曾照野', '萧亦辰', '程子墨', '袁思齐',
  '董雨桐', '潘星然', '蒋南乔', '余景行', '杜若溪', '叶知秋', '苏念安', '魏泽宇', '吕清扬', '丁书禾', '任思言',
  '沈亦晨', '姚可儿', '卢子涵', '崔明轩', '钟灵毓', '谭思远', '陆知微', '范雨桐', '金泠然', '白敬亭',
];

const PROMPTS = [
  'Which of the following is most likely to happen after the government imposes a per-unit tax on a competitive market?',
  'If demand is perfectly inelastic and supply shifts left, what happens to the equilibrium quantity?',
  'The graph shows a binding price ceiling. Which area represents the deadweight loss?',
  'A firm faces rising marginal cost. What does the short-run supply curve look like?',
  'Which statement best explains why the burden of a tax falls mainly on buyers when demand is inelastic?',
  'If the price of a substitute good falls, how does the demand curve for this good shift?',
  'The table shows total utility for a consumer. At which quantity is marginal utility zero?',
  'A quota limits imports below the equilibrium quantity. What happens to consumer surplus?',
];

const OPTIONS = [
  [{ label: 'A', text: 'The supply curve shifts up by the amount of the tax.' }, { label: 'B', text: 'The demand curve shifts down by the amount of the tax.' }, { label: 'C', text: 'Equilibrium price rises and quantity falls.' }, { label: 'D', text: 'Equilibrium quantity is unchanged.' }],
  [{ label: 'A', text: 'Quantity falls to zero.' }, { label: 'B', text: 'Quantity is unchanged.' }, { label: 'C', text: 'Quantity rises.' }, { label: 'D', text: 'Price falls.' }],
  [{ label: 'A', text: 'The triangle between demand and supply at the ceiling quantity.' }, { label: 'B', text: 'The rectangle below the ceiling price.' }, { label: 'C', text: 'The whole area under demand.' }, { label: 'D', text: 'There is no deadweight loss.' }],
  [{ label: 'A', text: 'Horizontal at the market price.' }, { label: 'B', text: 'Upward sloping for prices above minimum average variable cost.' }, { label: 'C', text: 'Vertical at capacity.' }, { label: 'D', text: 'Downward sloping.' }],
  [{ label: 'A', text: 'Buyers cannot easily switch to substitutes.' }, { label: 'B', text: 'Sellers set the price.' }, { label: 'C', text: 'The tax is collected from buyers.' }, { label: 'D', text: 'Supply is perfectly elastic.' }],
  [{ label: 'A', text: 'It shifts right.' }, { label: 'B', text: 'It shifts left.' }, { label: 'C', text: 'It does not shift.' }, { label: 'D', text: 'It becomes vertical.' }],
  [{ label: 'A', text: 'At the first unit.' }, { label: 'B', text: 'At the third unit.' }, { label: 'C', text: 'At the fifth unit.' }, { label: 'D', text: 'At the seventh unit.' }],
  [{ label: 'A', text: 'Consumer surplus rises.' }, { label: 'B', text: 'Consumer surplus falls.' }, { label: 'C', text: 'Consumer surplus is unchanged.' }, { label: 'D', text: 'Consumer surplus becomes negative.' }],
];

const FRQ_QUESTIONS = [
  { id: 'f1', prompt: 'Draw a correctly labeled graph of a competitive market in long-run equilibrium. Then show the effect of a per-unit tax on sellers.', maxPoints: 5, type: 'frq' },
  { id: 'f2', prompt: 'Explain how the elasticity of demand affects the share of the tax borne by consumers. Use your graph from part (a).', maxPoints: 5, type: 'frq' },
];

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Oldest to newest so the class matrix reads left to right like the gradebook.
const PLAN = [
  { label: '3.1 MCQ', unit: '3.1', format: 'mcq', title: 'Unit 3 · 3.1 MCQ', ago: 34 },
  { label: 'Progress Check', unit: '', format: 'mcq', title: 'Unit 2 · Progress Check', ago: 26 },
  { label: 'Quiz 02', unit: '', format: 'mcq', title: 'Unit 2 · Quiz 02', ago: 22 },
  { label: '2.4 MCQ', unit: '2.4', format: 'mcq', title: 'Unit 2 · 2.4 MCQ', ago: 18 },
  { label: '2.3 MCQ', unit: '2.3', format: 'mcq', title: 'Unit 2 · 2.3 MCQ', ago: 14 },
  { label: 'Quiz 01', unit: '', format: 'mcq', title: 'Unit 2 · Quiz 01', ago: 11 },
  { label: '2.2 MCQ', unit: '2.2', format: 'mcq', title: 'Unit 2 · 2.2 MCQ', ago: 8 },
  { label: '2.1 MCQ', unit: '2.1', format: 'mcq', title: 'Unit 2 · 2.1 MCQ', ago: 5 },
  { label: 'FRQ 01', unit: '', format: 'frq', title: 'Unit 2 · FRQ 01', ago: 2 },
];

export function buildData(now = new Date()) {
  const random = rngFrom(20261115);
  const students = NAMES.slice(0, 50).map((name, index) => ({
    id: `s${String(index + 1).padStart(2, '0')}`,
    name,
    username: `student${String(index + 1).padStart(2, '0')}`,
    classIds: ['c1'],
    historical: false,
  }));
  const audience = {
    confirmedAt: new Date(now.getTime() - 20 * DAY).toISOString(),
    required: true,
    students: students.map(student => ({ id: student.id, classIds: student.classIds })),
  };

  const assignments = PLAN.map((plan, index) => {
    const isFrq = plan.format === 'frq';
    const questions = isFrq
      ? FRQ_QUESTIONS.map(question => ({ ...question, knowledge: 'Unit 2 · 税收与弹性' }))
      : LETTERS.slice(0, 5).map((_, qIndex) => ({
          id: `q${qIndex + 1}`,
          prompt: PROMPTS[(index + qIndex) % PROMPTS.length],
          maxPoints: 1,
          type: 'mcq',
          knowledge: `${plan.unit || '2.3'} · ${['供求基础', '税收归宿', '价格管制'][qIndex % 3]}`,
          options: OPTIONS[(index + qIndex) % OPTIONS.length],
        }));
    return {
      id: `a${String(index + 1).padStart(2, '0')}`,
      format: plan.format, title: plan.title, published: true, course: 'micro',
      libraryUnit: plan.unit, libraryCollection: 'Unit 2', libraryCourse: 'AP 微观经济学',
      instructions: '', questionFiles: [], paper: null, readingScope: '',
      submissionGuide: '', mainQuestionFile: null, classIds: ['c1'],
      dueAt: new Date(now.getTime() - plan.ago * DAY).toISOString(),
      opensAt: new Date(now.getTime() - (plan.ago + 7) * DAY).toISOString(),
      timeLimitMinutes: null, assessmentMode: 'homework', gradingMode: 'answer_key',
      allowLate: true, allowResubmit: true, version: 3,
      createdAt: new Date(now.getTime() - (plan.ago + 9) * DAY).toISOString(),
      deletedAt: null, audience, questions,
    };
  });

  const submissions = [];
  const mistakes = [];
  let sequence = 1;
  students.forEach((student, studentIndex) => {
    const ability = 0.42 + 0.5 * random() + (studentIndex % 7) * 0.012;
    assignments.forEach((assignment, assignmentIndex) => {
      const roll = random();
      const base = submissionBase(assignment, student, sequence);
      if (roll > 0.965) return;
      if (roll > 0.945) { submissions.push({ ...base, status: 'draft' }); sequence += 1; return; }
      if (roll > 0.925) { submissions.push({ ...base, status: 'returned', returnedReason: '请补写推导过程' }); sequence += 1; return; }
      if (roll > 0.895) { submissions.push({ ...base, status: 'submitted' }); sequence += 1; return; }
      if (roll > 0.86) { submissions.push({ ...base, status: 'needs_review' }); sequence += 1; return; }

      const older = random() < 0.08;
      const difficulty = assignmentIndex === 4 ? -0.06 : 0;
      const choices = {};
      const graded = assignment.questions.map((question, questionIndex) => {
        if (question.type === 'frq') {
          const chance = Math.max(0.15, Math.min(0.95, ability + difficulty + random() * 0.18 - 0.09));
          return { id: question.id, score: Math.round(chance * question.maxPoints), maxPoints: question.maxPoints, type: 'frq' };
        }
        // 2.3 MCQ · 40 published papers, B is correct for 45% (design sample).
        const hit = questionIndex === 1 && assignmentIndex === 4
          ? weightedLetter(random, ['B', 'D', 'C', 'A', 'E'], [0.45, 0.25, 0.15, 0.10, 0.05])
          : LETTERS[Math.floor(random() * 5)];
        choices[question.id] = hit;
        const chance = Math.max(0.12, Math.min(0.97, ability + difficulty + random() * 0.16 - 0.08));
        return { id: question.id, score: random() < chance ? question.maxPoints : 0, maxPoints: question.maxPoints, type: 'mcq' };
      });
      const total = graded.reduce((sum, item) => sum + item.score, 0);
      const max = graded.reduce((sum, item) => sum + item.maxPoints, 0);
      const submission = {
        ...base,
        status: 'published',
        version: older ? 2 : assignment.version,
        choices,
        publishedGrade: {
          total, maxPoints: max, version: older ? 2 : assignment.version,
          publishedAt: new Date(new Date(assignment.dueAt).getTime() + DAY).toISOString(),
          questions: graded,
        },
      };
      submissions.push(submission);
      graded.forEach((item, questionIndex) => {
        if (item.score >= item.maxPoints) return;
        const question = assignment.questions[questionIndex];
        const status = random() < 0.3 ? 'todo' : random() < 0.55 ? 'review' : 'mastered';
        mistakes.push({
          assignmentId: assignment.id, assignmentTitle: assignment.title, course: 'micro',
          studentId: student.id, libraryUnit: assignment.libraryUnit,
          submissionId: submission.id, questionId: question.id, prompt: question.prompt,
          type: question.type, knowledge: question.knowledge, review: '',
          options: question.options || [], questionImages: [], score: item.score, maxPoints: item.maxPoints,
          evidence: '', feedback: '', publishedAt: submission.publishedGrade.publishedAt,
          paper: null, paperLocation: null, gradeRevision: 1, pendingUpdate: false,
          note: '', status, corrections: [], revision: 1,
        });
      });
      sequence += 1;
    });
  });

  return { students, assignments, submissions, mistakes };
}

function submissionBase(assignment, student, sequence) {
  const submittedAt = new Date(new Date(assignment.dueAt).getTime() + (sequence % 5) * 3600000).toISOString();
  return {
    id: `sub${String(sequence).padStart(4, '0')}`,
    assignmentId: assignment.id,
    studentId: student.id,
    text: '', files: [], choices: {}, status: 'submitted',
    submittedAt, updatedAt: submittedAt, publishedGrade: null,
    version: assignment.version, clientId: `fixture-${sequence}`, returnedReason: '',
  };
}

function weightedLetter(random, letters, weights) {
  const target = random();
  let cursor = 0;
  for (let index = 0; index < letters.length; index += 1) {
    cursor += weights[index];
    if (target <= cursor) return letters[index];
  }
  return letters[letters.length - 1];
}

export const FIXTURE_CLASSES = [
  { id: 'c1', name: '微观 1 班', archived: false },
  { id: 'c2', name: '微观 2 班（晚课）', archived: false },
];
