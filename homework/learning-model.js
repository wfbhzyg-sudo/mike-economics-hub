import {submissionLabel} from './ui-labels.js';

// One effective result per assignment. Pending replacements do not erase a grade.
export function assignmentRecords(submissions, assignments = []) {
  const grouped = new Map();
  for (const s of submissions.filter(s => s.status !== 'draft')) {
    const key = `${s.studentId || ''}:${s.assignmentId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(s);
  }
  return [...grouped.values()].map(attempts => {
    attempts.sort((a,b) => (b.submittedAt || b.createdAt || '').localeCompare(a.submittedAt || a.createdAt || '') || b.id.localeCompare(a.id));
    const latest = attempts[0], effective = attempts.find(s => s.publishedGrade?.total != null);
    return {assignmentId:latest.assignmentId, studentId:latest.studentId,
      assignment: assignments.find(a => a.id === latest.assignmentId) || latest.assignment || {},
      latest, effective, grade:effective?.publishedGrade || null, attempts,
      pendingUpdate: Boolean(effective && (effective.id !== latest.id || latest.status !== 'published'))};
  }).sort((a,b) => (b.latest.submittedAt || '').localeCompare(a.latest.submittedAt || ''));
}
export function gradeSummary(records) {
  const graded=records.filter(r => r.grade?.maxPoints > 0 && Number.isFinite(r.grade.total));
  const rates=graded.map(r=>r.grade.total/r.grade.maxPoints*100);
  return {count:graded.length,average:rates.length?Math.round(rates.reduce((a,b)=>a+b,0)/rates.length*10)/10:null,
    wrong:graded.reduce((sum,r)=>sum+r.grade.questions.filter(q=>q.score!=null&&q.score<q.maxPoints).length,0)};
}
export function questionTotals(grade, questions=[]) {
  const totals={choice:{score:0,max:0},short:{score:0,max:0}};
  for(const q of grade?.questions || []){
    const ref=questions.find(r=>r.id===q.id), bucket=totals[(q.type||ref?.type)==='choice'?'choice':'short'];
    bucket.max+=q.maxPoints; bucket.score+=q.score||0;
  }
  return totals;
}
export function assignmentState(a, submissions, time=Date.now()) {
  const attempts=submissions.filter(s=>s.assignmentId===a.id);
  const latest=assignmentRecords(attempts,[a])[0]?.latest;
  const draft=attempts.filter(s=>s.status==='draft'&&(!latest||Date.parse(s.updatedAt||s.createdAt)>Date.parse(latest.submittedAt||latest.createdAt))).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''))[0];
  const closed=Boolean(a.dueAt&&Date.parse(a.dueAt)<time&&!a.allowLate&&latest?.status!=='returned');
  const canSubmit=!closed&&(!latest||latest.status==='returned'||a.allowResubmit!==false);
  const base={latest,draft,canSubmit};
  if(latest?.status==='returned')return {...base,key:'todo',label:submissionLabel('returned')};
  if(draft&&canSubmit)return {...base,key:'todo',label:'草稿待提交'};
  if(latest?.status==='published')return {...base,key:'done',label:'已出分'};
  if(latest)return {...base,key:'processing',label:submissionLabel(latest.status)};
  if(closed)return {...base,key:'closed',label:'已截止'};
  return {...base,key:'todo',label:draft?'草稿待提交':a.dueAt&&Date.parse(a.dueAt)<time?'可补交':'待完成'};
}
