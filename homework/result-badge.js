export function questionResult({score, maxPoints, unanswered = false, correct}) {
  let key, symbol, label;
  if (unanswered) [key,symbol,label]=['neutral','—','未作答'];
  else if (score == null || !Number.isFinite(score) || !(maxPoints > 0)) {
    if (typeof correct === 'boolean') [key,symbol,label]=correct?['correct','✓','正确']:['wrong','×','失分'];
    else [key,symbol,label]=['neutral','—','待评分'];
  } else if (score >= maxPoints) [key,symbol,label]=['correct','✓','满分'];
  else if (score === 0) [key,symbol,label]=['wrong','×','零分'];
  else [key,symbol,label]=['partial','◐','部分得分'];
  return {key,symbol,label};
}

export function resultBadge(result) {
  const {score,maxPoints}=result;
  const {key,symbol,label}=questionResult(result);
  return `<span class="question-result-badge" data-result="${key}"><span aria-hidden="true">${symbol}</span> ${label}${Number.isFinite(score)&&maxPoints>0?' · '+score+'/'+maxPoints:''}</span>`;
}
