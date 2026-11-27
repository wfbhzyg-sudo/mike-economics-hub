// Read-only views of the effective published submission. Credit is expressed in
// assignment points; a question's raw score can use a different scale.
const indexes = new WeakMap();
export function correctionsBySubmission(rows) {
  if (!rows) return new Map();
  if (indexes.has(rows)) return indexes.get(rows);
  const index = new Map();
  for (const row of rows) {
    if (!row.submissionId || row.source === 'mock') continue;
    if (!index.has(row.submissionId)) index.set(row.submissionId, new Map());
    index.get(row.submissionId).set(String(row.questionId), row);
  }
  indexes.set(rows, index);
  return index;
}

const labels = {passed:'订正通过', queued:'待验收', running:'待验收', manual:'待教师核对', revise:'需再订正',
  matched:'选项已改对', incorrect:'选项仍有误', saved:'已提交订正', mastered:'自评掌握'};
export function questionCorrection(grade, question, mistake) {
  if (!question || !Number.isFinite(question.score) || !(question.maxPoints > question.score)) return null;
  const id = String(question.id), review = mistake?.verification;
  const credit = grade.scoreSources?.byQuestion?.[id] || 0;
  let status = review?.status;
  if (!status && (grade.verifiedQuestionIds?.some(q=>String(q)===id) || mistake?.progressStatus==='verified')) status='passed';
  if (!status && credit > 0 && !grade.verifiedQuestionIds) status='credited';
  if (!status && mistake?.correctionFeedback?.state==='correct') status='matched';
  if (!status && mistake?.correctionFeedback?.state==='incorrect') status='incorrect';
  if (!status && mistake?.progressStatus==='mastered') status='mastered';
  if (!status && (mistake?.lastCorrectionAt || mistake?.progressStatus==='review')) status='saved';
  if (!status) return null;
  const at=[review?.finishedAt,mistake?.lastCorrectionAt].filter(Boolean).sort().at(-1)||'';
  return {status,label:labels[status] || (status==='credited'?'已补分':'待验收'),credit,at};
}

export function correctionProgress(records, mistakes) {
  const seen = new Set(), entries = [], bySubmission = correctionsBySubmission(mistakes);
  let count=0, score=0, gain=0, recovered=0, passed=0, fixed=0;
  for (const record of records) {
    const grade=record?.grade, id=record?.effective?.id;
    if (!id || seen.has(id) || !Number.isFinite(grade?.total) || !(grade.maxPoints>0) || grade.absent) continue;
    seen.add(id);
    count++;
    const credit=grade.scoreSources?.recovered || 0;
    recovered+=credit;
    score+=100*grade.total/grade.maxPoints;
    // A manually fixed total stays the same when a review passes.
    if (!grade.manualTotal) gain+=100*credit/grade.maxPoints;
    else if (credit) fixed++;
    const notes=bySubmission.get(id);
    let ordinal=0;
    for (const question of grade.questions || []) {
      ordinal++;
      const evidence=questionCorrection(grade,question,notes?.get(String(question.id)));
      if (!evidence) continue;
      if (evidence.status==='passed') passed++;
      entries.push({...evidence,assignmentId:record.assignmentId,title:record.assignment?.title || '作业',
        questionId:question.id,number:/^\d+(?:[a-z])?$/i.test(question.id)?question.id:ordinal,submissionId:id,first:question.score,max:question.maxPoints});
    }
  }
  entries.sort((a,b)=>b.at.localeCompare(a.at) || a.title.localeCompare(b.title,'zh-CN') || String(a.questionId).localeCompare(String(b.questionId),undefined,{numeric:true}));
  return {count,passed,submitted:entries.filter(e=>e.status!=='mastered'||e.at).length,recovered,average:count?score/count:null,before:count?(score-gain)/count:null,
    gain:count?gain/count:null,fixed,entries};
}

const fmt = new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2});
const stamp = new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
export function correctionLog(entries, h, {studentId, limit=5}={}) {
  const item=e=>{
    const date=Date.parse(e.at);
    const content='<span class="cr-work">'+h(e.title)+' <b>· 第 '+h(e.number??e.questionId)+' 题</b></span>'+
      '<span class="cr-meta"><span data-cr-state="'+h(e.status)+'">'+h(e.label)+'</span>'+
      (e.credit?' <b>+'+fmt.format(e.credit)+' 分</b>':e.status==='passed'?' <small>本题未补分</small>':'')+(Number.isFinite(date)?' <time datetime="'+h(e.at)+'">'+stamp.format(date)+'</time>':'')+'</span>';
    return '<li>'+(studentId?'<button type="button" data-open-question data-s="'+h(studentId)+'" data-a="'+h(e.assignmentId)+'" data-q="'+h(e.questionId)+'">'+content+'</button>':content)+'</li>';
  };
  if (!entries.length) return '<p class="cr-empty">当前范围还没有作业订正记录。</p>';
  return '<ul class="cr-list">'+entries.slice(0,limit).map(item).join('')+'</ul>'+
    (entries.length>limit?'<details class="cr-more"><summary>其余 '+(entries.length-limit)+' 条</summary><ul class="cr-list">'+entries.slice(limit).map(item).join('')+'</ul></details>':'');
}

export function studentRecoveryMarkup(value,h) {
  if (!value.count) return '';
  const change=value.gain>0 && value.gain<0.01?'＜0.01':fmt.format(value.gain);
  return '<section class="cr-panel cr-achievement" aria-label="订正成果"><div class="cr-heading"><h2>订正成果</h2><span>按当前已出分作业</span></div>'+
    '<div class="cr-metrics"><div><small>已提交订正</small><strong>'+value.submitted+' <small>题</small></strong><small>通过 '+value.passed+' 题</small></div>'+
    '<div><small>补回分数</small><strong>'+fmt.format(value.recovered)+' <small>分</small></strong></div>'+
    '<div><small>均分提升</small><strong>'+change+' <small>个百分点</small></strong></div></div>'+
    (value.gain>0?'<p class="cr-change">补分前 <b>'+fmt.format(value.before)+'%</b> → 当前 <b>'+fmt.format(value.average)+'%</b></p>':'')+
    (value.entries.length?'<details class="cr-more"><summary>逐题订正记录</summary>'+correctionLog(value.entries,h)+'</details>':'')+
    (value.fixed?'<p class="cr-empty">教师已指定总分的作业，订正仍计入通过题数，均分按指定总分统计。</p>':'')+'</section>';
}
