import {splitChoiceCorrection} from '../homework/choice-correction.js';

export function referenceChoices(question) {
  if (question?.type !== 'choice' || question.manualGradingRequired) return [];
  const keys = question.correctOptions?.length ? question.correctOptions : [question.answer];
  const labels = question.options?.map(option => option.label);
  return keys.every(key => /^[A-J]$/.test(key) && (!labels?.length || labels.includes(key)))
    ? [...new Set(keys)].sort() : [];
}

// Only committed work is eligible. The caller supplies the question snapshot
// from this published submission, never a current bank or whole-paper key.
export function correctionFeedback(question, saved) {
  if (!saved || (!saved.text?.trim() && !saved.choice && !saved.files?.length)) return null;
  if (!question || question.manualGradingRequired) return {state:'pending'};
  if (question.type !== 'choice') {
    const answer = question.answer?.trim();
    return answer ? {state:'compare', answer} : {state:'pending'};
  }
  const options = referenceChoices(question);
  if (!options.length) return {state:'pending'};
  const answer = options.join('');
  const text = saved.text?.trim() || '';
  const choice = saved.choice || splitChoiceCorrection(text).choice || (/^[A-J]{1,10}$/.test(text) ? text : '');
  if (!choice) return {state:'compare', answer};
  const picked = [...new Set(choice)].sort().join('');
  return {state:picked === answer ? 'correct' : 'incorrect', choice:picked, answer};
}
