import {subjectIds,subjectInfo} from '../homework/subject-catalog.js';
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
  const courses = [...subjectIds,'mixed','unknown'].filter(c=>groups.has(c)).map(course => {
    const cells = history.filter(c => assignmentCourse(c.assignment,classes) === course);
    const scopeIds = new Set(cells.map(c => c.assignment.id));
    const errors = mistakes.filter(m => scopeIds.has(m.assignmentId));
    const evidence = values.find(v => v.course === course);
    const publishedGrades = cells.filter(c => c.status === 'graded');
    const pending = errors.filter(m => ['todo','revise'].includes(m.progressStatus||m.status) && !['queued','manual'].includes(m.verification?.status));
    const verified = errors.filter(m => m.verification?.status === 'passed');
    const waiting = errors.filter(m=>['queued','manual'].includes(m.verification?.status) );
    const mockHistory = mockAttempts.filter(a=>a.course===course).sort((a,b)=>String(b.submittedAt).localeCompare(String(a.submittedAt)))
      .map(a=>({date:a.submittedAt,rate:mockScorePercent(a.result),seconds:a.result.durationSeconds}));
    const advice = [];
    if(evidence?.focus){
      const skill=evidence.axes.find(axis=>axis.skill===evidence.focus);
      const ref=skill.references.find(q=>q.score<q.max) || skill.references[0];
      advice.push({
        title:ref?'《'+ref.title+'》第 '+ref.questionNumber+' 题':subjectInfo(course)?.skills[skill.skill-1]?.name,
        detail:subjectInfo(course)?.skills[skill.skill-1]?.practice
      });
    }
    if(pending.length && !advice.length){
      const target=pending[0];
      advice.push({title:'《'+target.assignmentTitle+'》第 '+target.questionNumber+' 题',detail:'保留第一次的作答，在改动的那一步旁写下理由。'});
    }
    const missing=cells.find(c=>c.status==='missing' && !c.assignment.offline && c.assignment.format!=='score');
    if(missing)advice.push({title:'《'+missing.assignment.title+'》',detail:'这份作业已到期，系统里还没有提交记录。如果交过纸质版或当时请了假，请和老师核对。'});
    if(!advice.length){
      const next=cells.find(c=>c.status==='todo' && !c.assignment.offline && c.assignment.format!=='score' && c.label!=='尚未开放');
      if(next)advice.push({title:'《'+next.assignment.title+'》',detail:'先完成这份作业，把拿不准的题号留给下次讲评。'});
    }
    return {course,label:courseLabel(course),evidence,cells,average:publishedGrades.length?gradeSummary(publishedGrades.map(c=>c.record)).average:null,
      graded:publishedGrades.length,trend:progressChange([...cells].reverse()),pending:pending.length,verified:verified.length,waiting:waiting.length,
      errors:errors.length,practiceItems:pending.slice(0,3),selfReviewed:errors.filter(m=>!m.verification && ['mastered','review'].includes(m.progressStatus||m.status)).length,advice,mockHistory};
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
  if(effective.offlineEvidence){
    const evidence=effective.offlineEvidence;
    if(evidence.maxPoints!==g.maxPoints || !Number.isFinite(evidence.total)){
      const source=g.scoreSources;
      if(!source || !Number.isFinite(source.first) || !Number.isFinite(source.recovered))return totalOnly;
      return {first:source.first,recovered:source.recovered,adjustment:num(g.total-source.first-source.recovered),resubmission:0,total:g.total,max:g.maxPoints};
    }
    const recovered=g.scoreSources?.recovered??0;
    return {first:evidence.total,recovered,adjustment:num(g.total-evidence.total-recovered),resubmission:0,total:g.total,max:g.maxPoints};
  }
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
