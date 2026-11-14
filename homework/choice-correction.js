// Preserve the selected letter independently of the editable explanation while
// keeping the existing persisted correction-text format backward compatible.
export function splitChoiceCorrection(value=''){
 const match=String(value).match(/^新答案：([A-E])(?:\n|$)/);
 return {choice:match?.[1]||'',explanation:match?String(value).slice(match[0].length):String(value)};
}
export function joinChoiceCorrection(choice,explanation=''){
 return /^[A-E]$/.test(choice)?'新答案：'+choice+(explanation?'\n'+explanation:''):explanation;
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
