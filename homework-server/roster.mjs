const key=id=>String(id||'').replace(/^bookself-class:/,'');
const assignedClasses=(assigned,member=[])=>assigned.filter(id=>member.some(c=>key(c)===key(id)));
// Assignment recipients are an historical obligation, not a second class system.
// Current class members are required automatically; snapshots preserve historical membership.
export function captureRecipients(classIds, students, at = new Date().toISOString()) {
  return { at, classIds: [...classIds], students: students.filter(u => assignedClasses(classIds,u.classIds).length).map(u => ({id:u.id,name:u.name,username:u.username || '',classIds:assignedClasses(classIds,u.classIds)})) };
}
export function assignmentRoster(assignment, students, submissions) {
  const offline=Boolean(assignment.offline||assignment.format==='score');
  const attempts = new Map(), published = new Map(), active = new Map(students.map(u => [u.id,u]));
  for (const s of submissions) if(s.assignmentId===assignment.id && s.status!=='draft') {
    if(s.publishedGrade){const old=published.get(s.studentId);if(!old||(s.submittedAt||'').localeCompare(old.submittedAt||'')>0)published.set(s.studentId,s);}
    if(s.manualScoreEntry && !offline) continue;
    const prior=attempts.get(s.studentId);
    if(!prior || (s.submittedAt||'').localeCompare(prior.submittedAt||'')>0 || (s.submittedAt===prior.submittedAt && s.id.localeCompare(prior.id)>0)) attempts.set(s.studentId,s);
  }
  const snapshots=new Map((assignment.recipients?.students||[]).map(u=>[u.id,u]));
  const expected=new Map((assignment.recipients?.students||[]).filter(u=>assignedClasses(assignment.classIds,u.classIds).length).map(u=>[u.id,u]));
  for(const u of students)if(assignedClasses(assignment.classIds,u.classIds).length)expected.set(u.id,u);
  const people=new Map(expected);
  for(const u of students)if(assignedClasses(assignment.classIds,u.classIds).length)people.set(u.id,u);
  for(const [id,s] of attempts)if(!people.has(id))people.set(id,{id,name:active.get(id)?.name||s.studentName||'学生',classIds:s.classIds||[],historical:true});
  const rows=[...people.values()].map(person=>{
    const effective=published.get(person.id),submission=offline?effective:attempts.get(person.id),u=active.get(person.id)||person;
    const hasGrade=effective?.publishedGrade?.total!=null;
    const required=Boolean(assignment.published && expected.has(person.id));
    const scoreReady=Boolean(submission?.suggestedGrade?.questions?.length && submission.suggestedGrade.questions.every(q=>Number.isFinite(q.score)));
    return {id:u.id,name:u.name,username:u.username||'',classIds:assignedClasses(assignment.classIds,[...(u.classIds||[]),...(snapshots.get(u.id)?.classIds||[]),...(submission?.classIds||[])]),historical:!active.has(u.id),required,
      state:offline?(hasGrade?'recorded':required?'unrecorded':'unassigned'):(submission&&submission.status!=='returned'?'submitted':required?'missing':'unassigned'),submissionId:submission?.id||null,
      hasItemScores:Boolean(effective?.publishedGrade?.questions?.some(q=>Number.isFinite(q.score))),
      submittedAt:submission?.submittedAt||null,status:submission?.status||null,scoreReady,
      needsReview:Boolean(submission&&submission.status!=='returned'&&(submission.status==='needs_review'||submission.reviewRequests?.some(r=>r.status==='open'))),
      pendingUpdate:Boolean(effective&&effective.id!==submission?.id),grade:hasGrade?{total:effective.publishedGrade.total,maxPoints:effective.publishedGrade.maxPoints}:null};
  }).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')||a.id.localeCompare(b.id));
  return {rows,confirmedAt:assignment.recipients?.at||null,counts:rosterCounts(rows,offline,expected.size)};
}

export function rosterCounts(rows,offline,expected=rows.filter(r=>r.required).length) {
  return {...(offline?{recorded:rows.filter(r=>r.state==='recorded').length,unrecorded:rows.filter(r=>r.state==='unrecorded').length}:{}),submitted:rows.filter(r=>r.state==='submitted').length,missing:rows.filter(r=>r.state==='missing').length,review:rows.filter(r=>r.needsReview).length,published:rows.filter(r=>r.grade).length,unconfirmed:0,expected};
}
