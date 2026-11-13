// A due date is not an exam timer. Both still enforce the earliest hard deadline.
export function attemptClock(assignment, attempt, now=Date.now()) {
  const rawEnd=assignment.timeLimitMinutes ? Date.parse(attempt.startedAt)+assignment.timeLimitMinutes*60000 : Infinity;
  const rawDue=assignment.dueAt&&!assignment.allowLate ? Date.parse(assignment.dueAt) : Infinity;
  const end=Number.isFinite(rawEnd)?rawEnd:Infinity,due=Number.isFinite(rawDue)?rawDue:Infinity;
  const deadline=Math.min(end,due);
  const left=Math.max(0,deadline-now),expired=left===0;
  const urgent=Number.isFinite(left)&&left<=300000;
  let label='';
  if(Number.isFinite(end)&&end<=due || Number.isFinite(due)&&left<3600000){
    const seconds=Math.ceil(left/1000);
    label=(due<end?'距截止 ':'剩余 ')+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  } else if(Number.isFinite(due)) {
    label='截止 '+new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(due));
  }
  return {deadline,left,expired,urgent,label};
}
