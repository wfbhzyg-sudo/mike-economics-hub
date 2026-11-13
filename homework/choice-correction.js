// Preserve the selected letter independently of the editable explanation while
// keeping the existing persisted correction-text format backward compatible.
export function splitChoiceCorrection(value=''){
 const match=String(value).match(/^新答案：([A-E])(?:\n|$)/);
 return {choice:match?.[1]||'',explanation:match?String(value).slice(match[0].length):String(value)};
}
export function joinChoiceCorrection(choice,explanation=''){
 return /^[A-E]$/.test(choice)?'新答案：'+choice+(explanation?'\n'+explanation:''):explanation;
}
