import {splitChoiceCorrection} from '../homework/choice-correction.js';

// Only committed work is eligible. The caller supplies the question snapshot
// from this published submission, never a current bank or whole-paper key.
export function correctionFeedback(question, saved) {
  if (!saved || (!saved.text?.trim() && !saved.choice && !saved.files?.length)) return null;
  if (!question || question.manualGradingRequired) return {state:'pending'};
  if (question.type !== 'choice') {
    const answer = question.answer?.trim();
    return answer ? {state:'compare', answer} : {state:'pending'};
  }
  const options = question.correctOptions?.length ? question.correctOptions : [question.answer];
  const labels = question.options?.map(option => option.label);
  if (!options.every(label => /^[A-J]$/.test(label) && (!labels?.length || labels.includes(label)))) return {state:'pending'};
  const answer = [...new Set(options)].sort().join('');
  const text = saved.text?.trim() || '';
  const choice = saved.choice || splitChoiceCorrection(text).choice || (/^[A-J]{1,10}$/.test(text) ? text : '');
  if (!choice) return {state:'compare', answer};
  const picked = [...new Set(choice)].sort().join('');
  return {state:picked === answer ? 'correct' : 'incorrect', choice:picked, answer};
}
