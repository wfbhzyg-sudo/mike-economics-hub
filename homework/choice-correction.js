// Preserve the selected letter independently of the editable explanation while
// keeping the existing persisted correction-text format backward compatible.
export function splitChoiceCorrection(value=''){
 const match=String(value).match(/^新答案：([A-J]{1,10})(?:\n|$)/);
 return {choice:match?.[1]||'',explanation:match?String(value).slice(match[0].length):String(value)};
}
export function joinChoiceCorrection(choice,explanation=''){
 return /^[A-J]{1,10}$/.test(choice)?'新答案：'+choice+(explanation?'\n'+explanation:''):explanation;
}

// Use explicit question links; never infer a photo or answer from its list position.
export function correctionAnswerEvidence(submission, question) {
 if(question.type==='choice' && submission.choices && typeof submission.choices==='object' && !Array.isArray(submission.choices)) {
  return {files:[],text:'本次选择：'+(submission.choices[question.questionId] || '未作答')};
 }
 const response=submission.responses?.[question.questionId];
 return response ? {files:response.files||[],text:response.text||''}
   : {files:submission.files||[],text:submission.text||''};
}

export function feedbackTitle(feedback) {
 return ({correct:'订正正确',incorrect:'仍需订正',compare:'对照参考答案',pending:'本题答案待核对'})[feedback?.state] || '';
}
export function feedbackMarkup(feedback, h, justSaved=false) {
 if (!feedback) return '';
 return `<div class="correction-verdict" data-verdict="${h(feedback.state)}" role="status"><small class="correction-receipt"><svg class="${justSaved?'freshly-saved':''}" width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="m2 8 4 4 8-9" fill="none" stroke="currentColor" stroke-width="2"/></svg> 订正已保存</small><strong>${feedbackTitle(feedback)}</strong>${feedback.choice ? `<span>你的订正 <b>${h(feedback.choice)}</b></span>` : ''}${feedback.answer ? `<span>${feedback.state==='compare'?'参考答案':'正确答案'} <b>${h(feedback.answer)}</b></span>` : ''}</div>`;
}
