import {assert} from './validation.mjs';
export function answerSuggestionInput(question){
 assert(question.type==='choice','简答题需要核对评分点，不能生成 A–E 答案',422);
 const body=String(question.searchText||'').trim();
 assert(body.length>=80,'题面文字不足，请对照原件核对答案',422);
 assert(!/\b(graph|figure|table|diagram|chart|shown|above|below|following data)\b/i.test(body),'本题可能依赖图表或共用材料，请对照完整原件核对；文字模型不能据此猜答案',422);
 return body;
}
export function withAnswerSuggestion(question,{answer,reason,model},at){
 const labels=question.optionLabels?.length?question.optionLabels:question.options?.length?question.options.map(o=>typeof o==='string'?o:o.label):['A','B','C','D','E'];
 assert(/^[A-E]$/.test(answer)&&labels.includes(answer),'AI 未能确定有效答案，请对照原件核对',422);
 // A suggestion is never an answer key or a human review. Preserve all flags.
 return {...question,answerSuggestion:{answer,reason,model,at},version:Number(question.version||1)+1,updatedAt:at};
}
