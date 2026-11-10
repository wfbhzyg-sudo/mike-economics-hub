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
  const draft=attempts.find(s=>s.status==='draft');
  const latest=assignmentRecords(attempts,[a])[0]?.latest;
  if(latest?.status==='returned')return {key:'todo',label:'需补充',latest,draft};
  if(latest?.status==='published')return {key:'done',label:'已出成绩',latest,draft};
  if(latest)return {key:'processing',label:latest.status==='needs_review'?'待教师确认':latest.status==='grading'?'正在批阅':'已提交',latest,draft};
  return {key:'todo',label:draft?'草稿待提交':a.dueAt&&Date.parse(a.dueAt)<time?'已截止':'待完成',latest,draft};
}
