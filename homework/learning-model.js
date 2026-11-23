import {submissionLabel} from './ui-labels.js';

// One effective result per assignment. Pending replacements do not erase a grade.
const normalizeGrade = (grade) => grade ? { ...grade, maxPoints: grade.maxPoints ?? (grade.questions || []).reduce((n, q) => n + Number(q.maxPoints || 0), 0) } : grade;

export function assignmentRecords(submissions, assignments = []) {
  const grouped = new Map();
  for (const s of submissions.filter(s => s.status !== 'draft')) {
    const key = `${s.studentId || ''}:${s.assignmentId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(s);
  }
  return [...grouped.values()].map(attempts => {
    attempts.sort((a,b) => (b.submittedAt || b.createdAt || '').localeCompare(a.submittedAt || a.createdAt || '') || b.id.localeCompare(a.id));
    const latest = attempts[0], effective = attempts.find(s => s.publishedGrade);
    return {assignmentId:latest.assignmentId, studentId:latest.studentId,
      assignment: assignments.find(a => a.id === latest.assignmentId) || latest.assignment || {},
      latest, effective, grade:normalizeGrade(effective?.publishedGrade) || null, attempts,
      pendingUpdate: Boolean(effective && (effective.id !== latest.id || latest.status !== 'published'))};
  }).sort((a,b) => (b.latest.submittedAt || '').localeCompare(a.latest.submittedAt || ''));
}
// Workflow counts follow the effective submission. A student's revision notes and first score stay independent.
export function correctionCounts(rows = []) {
  const counts = {total: rows.length, open: 0, review: 0, mastered: 0, verified: 0};
  for (const row of rows) {
    const status = row.progressStatus || row.status;
    if (['review', 'mastered', 'verified'].includes(status)) counts[status]++;
    else counts.open++;
  }
  return counts;
}

export function gradeSummary(records) {
  const graded=records.filter(r => r.grade?.maxPoints > 0 && Number.isFinite(r.grade.total));
  const rates=graded.map(r=>r.grade.total/r.grade.maxPoints*100);
  return {count:graded.length,average:rates.length?Math.round(rates.reduce((a,b)=>a+b,0)/rates.length*10)/10:null,
    wrong:graded.reduce((sum,r)=>sum+(r.grade.questions || []).filter(q=>q.score!=null&&q.score<q.maxPoints).length,0)};
}
export function questionTotals(grade, questions=[]) {
  const totals={choice:{score:0,max:0},short:{score:0,max:0}};
  for(const q of grade?.questions || []){
    const ref=questions.find(r=>r.id===q.id), bucket=totals[(q.type||ref?.type)==='choice'?'choice':'short'];
    bucket.max+=q.maxPoints; bucket.score+=q.score||0;
  }
  return totals;
}
export function retryWorkMode(a) {
  if (a.makeupMode || a.zeroRetryMode) return a.makeupMode || a.zeroRetryMode;
  const complete=a.offlineEdition && a.rubric?.length && a.rubric.every(q=>
    (q.questionImages?.length || q.prompt?.trim()) && (q.type!=='choice' || q.options?.length>=2));
  return complete ? 'questions' : 'upload';
}

export function assignmentState(a, submissions, time=Date.now()) {
  const offline=Boolean(a.offline||a.format==='score');
  const all=submissions.filter(s=>s.assignmentId===a.id);
  const ordered=assignmentRecords(all)[0]?.attempts||[];
  const last=ordered[0];
  const latest=offline?last:ordered.find(s=>!s.manualScoreEntry);
  const attempts=all;
  const zeroRetry=last?.status==='published' && last.publishedGrade?.total===0 &&
    a.published!==false && !a.deletedAt && !(a.opensAt && Date.parse(a.opensAt)>time);
  const draft=attempts.filter(s=>s.status==='draft'&&(!latest||Date.parse(s.updatedAt||s.createdAt)>Date.parse(latest.submittedAt||latest.createdAt))).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''))[0];
  const closed=Boolean(a.dueAt&&Date.parse(a.dueAt)<time&&!a.allowLate&&latest?.status!=='returned');
  const canSubmit=!closed&&(!latest||latest.status==='returned'||a.allowResubmit!==false);
  const base={latest,draft,canSubmit};
  if(zeroRetry) return {...base,canSubmit:true,zeroRetryOf:last.id,key:'todo',label:draft?'重做中':'零分待重做'};
  if(offline){
    if(latest?.offlineMakeup && !['published','returned'].includes(latest.status))
      return {...base,canSubmit:false,key:'processing',label:submissionLabel(latest.status)};
    if(latest?.offlineMakeup && latest.status==='returned')
      return {...base,canSubmit:true,key:'todo',label:submissionLabel('returned')};
    const recorded=attempts.find(s=>s.status==='published'&&s.publishedGrade?.total!=null);
    if(recorded)return {...base,latest:latest?.status==='published'&&latest.publishedGrade?.total!=null?latest:recorded,canSubmit:false,key:'done',label:'已录分'};
    if(a.allowLate && a.makeupMode && (!a.opensAt || Date.parse(a.opensAt)<=time))
      return {...base,canSubmit:true,key:'todo',label:draft?'草稿待提交':'可补交'};
    return {...base,canSubmit:false,key:'offline',label:'待老师录分'};
  }
  if(latest?.status==='returned')return {...base,key:'todo',label:submissionLabel('returned')};
  if(draft&&canSubmit)return {...base,key:'todo',label:'草稿待提交'};
  if(latest?.status==='published')return {...base,key:'done',label:'已出分'};
  if(latest)return {...base,key:'processing',label:submissionLabel(latest.status)};
  if(closed)return {...base,key:'closed',label:'已截止'};
  return {...base,key:'todo',label:draft?'草稿待提交':a.dueAt&&Date.parse(a.dueAt)<time?'可补交':'待完成'};
}

// Numeric-only feedback is also used for online work with real per-question answers.
export function usesTotalOnlyEditor(assignment,submission){
  if(submission?.offlineMakeup)return false;
  if(assignment?.offline||assignment?.format==='score')return true;
  if(!submission?.manualScoreEntry&&!submission?.publishedGrade?.scoreOnly)return false;
  return !submission?.choices&&!submission?.text?.trim()&&!submission?.files?.length
    &&!submission?.rubricSnapshot?.length&&!submission?.publishedGrade?.questions?.length;
}
