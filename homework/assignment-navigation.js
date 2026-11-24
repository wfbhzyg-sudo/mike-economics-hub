import {assignmentState,retryWorkMode} from './learning-model.js';

// Course practice and the assignment centre must lead to the same next action.
export function studentAssignmentAction(assignment, submissions, time = Date.now()) {
  const info = assignmentState(assignment, submissions, time);
  const offline = Boolean(assignment.offline||assignment.format==='score');
  const opensLater = !info.latest && assignmentOpensLater(assignment, time);
  const progress=assignment.attemptProgress;
  const questionMode=offline ? retryWorkMode(assignment)==='questions' : ['mcq','mixed'].includes(assignment.format);
  if(questionMode && progress?.started && Number.isInteger(progress.index) && !opensLater && info.canSubmit &&
     (info.key==='todo' || (info.key==='done' && !offline && assignment.allowResubmit))){
    return {info,target:'mcq/'+assignment.id,action:'继续第 '+(progress.index+1)+' 题',opensLater:false,label:'进行中',resume:true};
  }
  if(info.zeroRetryOf){
    const choice=offline?retryWorkMode(assignment)==='questions':['mcq','mixed'].includes(assignment.format);
    return {info,target:(choice?'mcq/':'submit/')+assignment.id,action:info.draft||assignment.attemptProgress?'继续重做':'重新作答',opensLater:false,label:info.label};
  }
  if(offline && info.canSubmit){
    return {info,target:(retryWorkMode(assignment)==='questions'?'mcq/':'submit/')+assignment.id,action:info.draft||assignment.attemptProgress?'继续补交':'补交作业',opensLater,label:info.label};
  }
  if(offline && info.key==='processing')return {info,target:'result/'+info.latest.id,action:'查看提交',opensLater,label:info.label};
  const target = offline ? (info.key==='done' ? 'result/'+info.latest.id : null)
    : opensLater ? null : info.latest && info.latest.status !== 'returned' && !(info.draft && info.canSubmit)
    ? 'result/' + info.latest.id : 'submit/' + assignment.id;
  const action = offline ? (info.key==='done' ? '查看成绩' : '等待老师录分')
    : opensLater ? '尚未开放' : info.key === 'done' ? '查看成绩' : info.key === 'processing' ? '查看进度'
    : info.draft || assignment.attemptProgress ? '继续作答' : info.latest?.status === 'returned' ? '补充作业' : '查看题目';
  return {info, target, action, opensLater, label:offline ? info.label : opensLater ? '尚未开放' : info.label};
}

// A future activity is not an actionable missing submission yet.
export function assignmentOpensLater(assignment, time = Date.now()) {
  return Boolean(assignment.opensAt && Date.parse(assignment.opensAt) > time);
}

export function publicationTime(a) {
  if (!a.published) return null;
  // Imported paper assignments use the original classroom date. An import, edit
  // or deadline is not evidence of when a teacher distributed the assignment.
  const value = a.publishedAt || ((a.offline || a.format === 'score') && a.opensAt);
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? time : null;
}

export function byPublication(assignments, order = 'desc') {
  return assignments.map(a => ({a, time: publicationTime(a)})).sort((left, right) => {
    if (Boolean(left.a.published) !== Boolean(right.a.published)) return left.a.published ? -1 : 1;
    if (!left.a.published) return 0;
    if (left.time === null && right.time !== null) return 1;
    if (right.time === null && left.time !== null) return -1;
    const delta = left.time - right.time;
    return (order === 'asc' ? delta : -delta) || left.a.id.localeCompare(right.a.id);
  }).map(item => item.a);
}

export function byLearningPriority(assignments, submissions, now=Date.now()){
  const byAssignment=new Map();
  for(const s of submissions){
    if(!byAssignment.has(s.assignmentId))byAssignment.set(s.assignmentId,[]);
    byAssignment.get(s.assignmentId).push(s);
  }
  const ranked=byPublication(assignments).map(a=>{
    const task=studentAssignmentAction(a,byAssignment.get(a.id)||[],now);
    const actionable=!task.opensLater && (task.resume || (task.info.key==='todo' && task.info.canSubmit && task.target));
    const active=actionable && Boolean(task.resume || task.info.draft);
    const due=Date.parse(a.dueAt||''),upcoming=actionable && due>=now;
    const recent=Date.parse(a.attemptProgress?.updatedAt||task.info.draft?.updatedAt||'')||0;
    return {a,rank:active?0:upcoming?1:actionable?2:3,due,upcoming,recent};
  }).sort((x,y)=>x.rank-y.rank || (x.rank===0?y.recent-x.recent:x.rank===1?x.due-y.due:0));
  // Keep an imminent deadline visible even if the student has several older drafts.
  if(ranked[0]?.rank===0){
    const soon=ranked.slice(1).filter(x=>x.upcoming && x.due-now<=7*86400000).sort((x,y)=>x.due-y.due)[0];
    if(soon){ranked.splice(ranked.indexOf(soon),1);ranked.splice(1,0,soon);}
  }
  return ranked.map(x=>x.a);
}
