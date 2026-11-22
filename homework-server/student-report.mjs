import {classKey, courseLabel, assignmentCourse, singleClassCourse} from '../homework/course-scope.js';
import {assignmentHistory, PERIODS, periodRange} from '../homework/learning-analytics-model.js';
import {gradeSummary} from '../homework/learning-model.js';
import {inRange, progressChange} from '../homework/grade-journey-model.js';
import {applyRecovery, attachReview} from './correction-review.mjs';
import {mistakeRows} from './learning.mjs';
import {studentPerformance} from './student-performance.mjs';
import {mockScorePercent, visibleStudentMock} from './study-workflow.mjs';
import {assert} from './validation.mjs';

const shares = (ids, key) => ids?.some(id => classKey(id) === classKey(key));
const num = value => Math.round(value * 10) / 10;
export const skillNames = ['原理与模型', '解读', '分析推演', '绘图'];
const exercises = [
  '先用自己的话说说这道题用到了哪个原理。试着改动题目中的一个条件，看看原来的判断是否还成立。',
  '先圈出题目里发生变化的量，用一句话说清它变大了还是变小了，再回到题目看看它问的是什么。',
  '在草稿上写下“什么变了 → 它会影响什么 → 结果怎样”。看看哪两个环节之间还需要补一句解释。',
  '遮住原图，自己画一次。先标坐标轴，再补曲线和关键点，最后对着原题看看两幅图哪里不同。',
];

export function readingHighlight({verified, graded, evidence, mockHistory}) {
  if (verified) return `你重新梳理了 ${verified} 道题的思路，这些订正已经通过验收。下次做相似的题时，可以试试自己再走一遍这几步。`;
  const supported = (evidence?.axes || []).filter(a => a.band !== null);
  const best = supported.sort((a,b) => b.value-a.value || b.count-a.count || a.skill-b.skill)[0];
  if (best?.band >= 4) {
    const label = skillNames[best.skill-1];
    if (best.value===100 && best.references.every(r=>r.score===r.max)) return `有 ${best.count} 道独立练习考到了「${label}」，这几道的技能得分都是满分。下次复习，可以挑一道讲给别人听，说说你当时是怎么想到的。`;
    return `「${label}」这项技能目前的得分率是 ${best.value}%，来自 ${best.count} 道独立练习。下次复习，可以挑一道印象深的题，说说当时是怎样判断的。`;
  }
  const example = best?.references?.find(r=>r.max>0 && r.score===r.max);
  if (example) return `《${example.title}》第 ${example.questionNumber} 题，你拿到了全部 ${example.max} 分。复习「${skillNames[best.skill-1]}」时，可以从这道已经会做的题出发，再试一道换了条件的题。`;
  if (graded) return `已经有 ${graded} 份作业有了成绩。挑一道还记得自己当时怎么想的题，从那一步重新试，比从头重做整份作业更容易入手。`;
  if (mockHistory.length) return `你已经独立完成了 ${mockHistory.length} 次模考。这些练习可以帮你找到下次想弄明白的问题，模考成绩单独记录。`;
  return '这段时间还没有已公布的作业成绩。等第一份作业有了反馈，我们再一起看，哪些地方已经会了，哪些值得再练一次。';
}

export async function readStudentReport({db, teacherId, query, availableClasses, availableStudents, correctionReview, at = new Date()}) {
  const id = query.get('student'), scope = classKey(query.get('class')), unit = query.get('unit') || '';
  const period = query.get('period') || 'all', assignmentId = query.get('assignment') || '';
  assert(id && id.length <= 200 && unit.length <= 120 && assignmentId.length <= 200 && PERIODS.some(([p]) => p === period),'学生或筛选条件无效');
  const classes = await availableClasses();
  const selectedClass = classes.find(c => classKey(c.id) === scope);
  assert(!scope || selectedClass,'找不到此档案',404);
  const [roster, attempts] = await Promise.all([availableStudents(),db.submissionsForTeacherStudent(teacherId,id)]);
  const current = roster.find(s => s.id === id);
  const memberClasses = classes.filter(c => shares(current?.classIds,c.id));
  const classIds = memberClasses.flatMap(c => [classKey(c.id),'bookself-class:'+classKey(c.id)]);
  const submitted = new Set(attempts.map(s => s.assignmentId));
  const candidates = await db.reportAssignments(teacherId,id,classIds,[...submitted]);
  const historical = new Set(attempts.filter(s => !scope || shares(s.classIds,scope)).map(s => s.assignmentId));
  const permitted = candidates.filter(a => !scope || (shares(a.classIds,scope) &&
    (shares(current?.classIds,scope) || shares(a.recipient?.classIds,scope) || historical.has(a.id))));
  assert((current && (!scope || shares(current.classIds,scope))) || permitted.length,'找不到此档案',404);
  const person = current || permitted.find(a => a.recipient)?.recipient || {id,name:'历史学生'};
  const dates = periodRange(period,at);
  const assignments = permitted.filter(a => inRange(a,dates) && (!unit || a.libraryUnit === unit) && (!assignmentId || a.id === assignmentId));
  const ids = new Set(assignments.map(a => a.id)), raw = attempts.filter(s => ids.has(s.assignmentId));
  const [reviews,notes,bank,published,mocks] = await Promise.all([
    correctionReview.reviews({teacherId,studentId:id}),
    db.find('mistake-note',{studentId:id,assignmentId:[...ids]}),
    db.getMany(raw.flatMap(s => (s.rubricSnapshot || []).map(q => q.libraryQuestionId).filter(Boolean))),
    db.find('insight-report',{teacherId,studentId:id,status:'published'}),
    current && !unit && !assignmentId ? db.find('self-practice-attempt',{studentId:id,status:'submitted'}) : [],
  ]);
  const submissions = applyRecovery(raw,reviews,assignments);
  const grades = new Map(submissions.map(s => [s.id,s.publishedGrade]));
  const reviewIndex = new Map(reviews.map(r => [JSON.stringify([r.submissionId,r.questionId]),r]));
  const mistakes = mistakeRows(raw,assignments,notes).map(m => attachReview(m,reviewIndex.get(JSON.stringify([m.submissionId,m.questionId])),grades.get(m.submissionId)));
  const values = studentPerformance(raw,assignments,mistakes,classes,bank,+at);
  const classScope = scope ? [selectedClass] : memberClasses;
  const historicalClasses = classes.filter(c => permitted.some(a=>shares(a.recipient?.classIds,c.id)) ||
    raw.some(s=>shares(s.classIds,c.id)));
  const displayClasses = classScope.length ? classScope : historicalClasses;
  const mockAttempts = mocks.filter(a => a.result?.questions?.length && visibleStudentMock(a,current,classScope) && inRange({createdAt:a.submittedAt},dates));
  const latestNote = published.filter(r => r.audience?.kind === 'student' && r.audience.studentId === id &&
    (!scope || classKey(r.scope?.classId) === scope) && (r.scope?.unit || '') === unit && !assignmentId &&
    (period === 'all' || r.scope?.period === period) && inRange({createdAt:r.publishedAt},dates)).sort((a,b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))[0];
  // Each permitted assignment applies to this student, including historical recipients who never submitted.
  const history = assignmentHistory({submissions},person,assignments.map(a=>({...a,audience:{required:true}})));
  const groups = new Set([...assignments.map(a=>assignmentCourse(a,classes)),...mockAttempts.map(a=>a.course)]);
  if(!unit && !assignmentId) for(const c of classScope) if(singleClassCourse(c)) groups.add(singleClassCourse(c));
  const courses = ['micro','macro','mixed','unknown'].filter(c=>groups.has(c)).map(course => {
    const cells = history.filter(c => assignmentCourse(c.assignment,classes) === course);
    const scopeIds = new Set(cells.map(c => c.assignment.id));
    const errors = mistakes.filter(m => scopeIds.has(m.assignmentId));
    const evidence = values.find(v => v.course === course);
    const publishedGrades = cells.filter(c => c.status === 'graded');
    const pending = errors.filter(m => ['todo','revise'].includes(m.status) && !['queued','manual'].includes(m.verification?.status));
    const verified = errors.filter(m => m.verification?.status === 'passed');
    const waiting = errors.filter(m=>['queued','manual'].includes(m.verification?.status) );
    const mockHistory = mockAttempts.filter(a=>a.course===course).sort((a,b)=>String(b.submittedAt).localeCompare(String(a.submittedAt)))
      .map(a=>({date:a.submittedAt,rate:mockScorePercent(a.result),seconds:a.result.durationSeconds}));
    const advice = [];
    if(evidence?.focus){
      const skill=evidence.axes.find(axis=>axis.skill===evidence.focus);
      const ref=skill.references.find(q=>q.score<q.max) || skill.references[0];
      advice.push({title:(skill.band===5?'换一道题试试':'这次可以练练')+'「'+skillNames[skill.skill-1]+'」',
        detail:(ref?'可以从《'+ref.title+'》第 '+ref.questionNumber+' 题开始。':'')+exercises[skill.skill-1],
        basis:skill.count+' 道独立题 · '+skill.value+'%'});
    }
    if(pending.length && advice.length===0){
      const target=pending[0];
      advice.push({title:'挑一道题，再试一次',detail:'可以从《'+target.assignmentTitle+'》第 '+target.questionNumber+' 题开始。先留着原来的答案，在旁边写一句“这次我会换哪一步”。',basis:pending.length+' 道待订正'});
    }
    const missing=cells.filter(c=>c.status==='missing' && !c.assignment.offline && c.assignment.format!=='score');
    if(missing.length)advice.push({title:'和老师一起核对提交记录',detail:'《'+missing[0].assignment.title+'》已经到期，平台还没有收到提交。如果已经交过纸质版，或者当时请了假，可以请老师一起确认。',basis:missing.length+' 份逾期未交'});
    if(!advice.length){
      const next=cells.find(c=>c.status==='todo' && !c.assignment.offline && c.assignment.format!=='score' && c.label!=='尚未开放');
      if (next) advice.push({title:'从手边这份作业开始',detail:'可以先做《'+next.assignment.title+'》。遇到拿不准的地方，把自己的想法写在题旁，下次听讲时就知道该问什么。',basis:''});
      else if (publishedGrades.length) advice.push({title:'留下一句自己的解题心得',detail:'翻开最近一次有成绩的《'+publishedGrades[0].assignment.title+'》，挑一道印象深的题，用自己的话说说第一步为什么这样做。',basis:''});
      else advice.push({title:'给下一份练习留一个小目标',detail:'下次做课堂练习时，可以选一道题，记下自己最有把握的一步。收到反馈后，再看看哪一步有了新的想法。',basis:''});
    }
    return {course,label:courseLabel(course),evidence,cells,average:publishedGrades.length?gradeSummary(publishedGrades.map(c=>c.record)).average:null,
      graded:publishedGrades.length,trend:progressChange([...cells].reverse()),pending:pending.length,verified:verified.length,waiting:waiting.length,
      errors:errors.length,practiceItems:pending.slice(0,3),selfReviewed:errors.filter(m=>!m.verification && ['mastered','review'].includes(m.status)).length,advice,mockHistory};
  });
  return {name:person.name || '学生',classNames:displayClasses.map(c=>c.name),period:PERIODS.find(([k])=>k===period)[1],unit,
    assignmentTitle:assignmentId ? assignments.find(a=>a.id===assignmentId)?.title || '指定作业（当前范围无记录）' : '',
    at:at.toISOString(),courses,latestNote: latestNote && {
      headline:latestNote.headline,nextSteps:latestNote.nextSteps,publishedAt:latestNote.publishedAt,
      className:classes.find(c=>classKey(c.id)===classKey(latestNote.scope?.classId))?.name || '',
      period:PERIODS.find(([k])=>k===latestNote.scope?.period)?.[1] || ''
    },includeMock:!unit&&!assignmentId};
}

export function resultParts(cell){
  if (cell.status !== 'graded') return null;
  const {grade:g,effective,attempts=[]}=cell.record;
  const totalOnly={first:null,recovered:null,adjustment:null,resubmission:null,total:g.total,max:g.maxPoints};
  if (cell.assignment.offline || cell.assignment.format==='score' || effective.manualScoreEntry) return totalOnly;
  const independent=(s,grade)=>grade.scoreSources?.original ?? s.gradeHistory?.find(h=>!h.manualTotal && Number.isFinite(h.total))?.total ??
    grade.scoreSources?.first ?? (grade.manualTotal ? null : grade.total);
  const base=independent(effective,g);
  if (!Number.isFinite(base)) return totalOnly;
  // assignmentRecords orders attempts newest first. Compare like-for-like marks only.
  const earliest=attempts.findLast(s=>Number.isFinite(s.publishedGrade?.total));
  let first=base;
  if (earliest && earliest.id!==effective.id) {
    if (earliest.publishedGrade.maxPoints!==g.maxPoints) return totalOnly;
    first=independent(earliest,earliest.publishedGrade);
    if (!Number.isFinite(first)) return totalOnly;
  }
  const recovered=g.scoreSources?.recovered ?? 0;
  return {first,recovered,resubmission:num(base-first),adjustment:num(g.total-base-recovered),total:g.total,max:g.maxPoints};
}
