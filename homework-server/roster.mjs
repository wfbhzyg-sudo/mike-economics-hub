// Assignment recipients are an historical obligation, not a second class system.
// Bookself remains authoritative for current membership; later joiners need confirmation.
export function captureRecipients(classIds, students, at = new Date().toISOString()) {
  return { at, classIds: [...classIds], students: students.filter(u => u.classIds?.some(id => classIds.includes(id))).map(u => ({id:u.id,name:u.name,username:u.username || '',classIds:u.classIds.filter(id=>classIds.includes(id))})) };
}
export function assignmentRoster(assignment, students, submissions) {
  const attempts = new Map(), published = new Map(), active = new Map(students.map(u => [u.id,u]));
  for (const s of submissions) if(s.assignmentId===assignment.id && s.status!=='draft') {
    if(s.publishedGrade?.total!=null){const old=published.get(s.studentId);if(!old||(s.submittedAt||'').localeCompare(old.submittedAt||'')>0)published.set(s.studentId,s);}
    const prior=attempts.get(s.studentId);
    if(!prior || (s.submittedAt||'').localeCompare(prior.submittedAt||'')>0 || (s.submittedAt===prior.submittedAt && s.id.localeCompare(prior.id)>0)) attempts.set(s.studentId,s);
  }
  const expected=new Map((assignment.recipients?.students||[]).filter(u=>u.classIds.some(c=>assignment.classIds.includes(c))).map(u=>[u.id,u]));
  const people=new Map(expected);
  for(const u of students)if(u.classIds?.some(c=>assignment.classIds.includes(c)))people.set(u.id,u);
  for(const [id,s] of attempts)if(!people.has(id))people.set(id,{id,name:active.get(id)?.name||s.studentName||'学生',classIds:s.classIds||[],historical:true});
  const rows=[...people.values()].map(person=>{
    const submission=attempts.get(person.id),effective=published.get(person.id),u=active.get(person.id)||person;
    const required=Boolean(assignment.published && expected.has(person.id));
    const scoreReady=Boolean(submission?.suggestedGrade?.questions?.length && submission.suggestedGrade.questions.every(q=>Number.isFinite(q.score)));
    return {id:u.id,name:u.name,username:u.username||'',classIds:u.classIds||[],historical:!active.has(u.id),required,
      state:submission?'submitted':required?'missing':'unconfirmed',submissionId:submission?.id||null,
      submittedAt:submission?.submittedAt||null,status:submission?.status||null,scoreReady,
      needsReview:Boolean(submission&&(submission.status==='needs_review'||submission.reviewRequests?.some(r=>r.status==='open'))),
      pendingUpdate:Boolean(effective&&effective.id!==submission?.id),grade:effective?{total:effective.publishedGrade.total,maxPoints:effective.publishedGrade.maxPoints}:null};
  }).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')||a.id.localeCompare(b.id));
  return {rows,confirmedAt:assignment.recipients?.at||null,counts:{submitted:attempts.size,missing:assignment.published&&assignment.recipients?rows.filter(r=>r.state==='missing').length:null,review:rows.filter(r=>r.needsReview).length,unconfirmed:rows.filter(r=>r.state==='unconfirmed').length,expected:expected.size}};
}
