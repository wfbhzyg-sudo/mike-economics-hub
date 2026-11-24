import {subjectIds,subjectInfo} from './subject-catalog.js';
// Classroom reference bands requested by the teacher; not official AP conversion.
export function scoreBand(rate){
 if(rate===null||rate===undefined||rate===''||!Number.isFinite(Number(rate))||Number(rate)<0||Number(rate)>100)return null;
 const value=Math.round(Number(rate)*10)/10,level=Math.min(5,Math.floor(value/20)+1);
 return {value,level,color:['red','orange','yellow','light-green','deep-green'][level-1]};
}
function useApScale(course) {
 return course ? subjectInfo(course)?.apReference===true : subjectIds.every(id=>subjectInfo(id).apReference===true);
}
export function scoreBadge(rate,course){
 const b=scoreBand(rate);
 if(!b)return '<span class="score-band" data-band="none">尚无成绩</span>';
 const level=useApScale(course)?'AP '+b.level:'第 '+b.level+' 档';
 return `<span class="score-band" data-band="${b.level}" aria-label="平均得分率 ${b.value}%，课堂参考 ${level}"><strong>${b.value}%</strong><small>${level}</small></span>`;
}
export function scoreLegend(course){
 const ap=useApScale(course);
 return `<details class="score-legend"><summary>五色分档${ap?' · AP 参考':''}</summary><div>${['0–<20%','20–<40%','40–<60%','60–<80%','80–100%'].map((v,i)=>`<span class="score-band" data-band="${i+1}"><strong>${v}</strong><small>${ap?'AP '+(i+1):'第 '+(i+1)+' 档'}</small></span>`).join('')}</div><p>${ap?'课堂得分率参考分档，非 AP 官方换算。':''}未出成绩不计零分。</p></details>`;
}

// Compact rate for question diagnostics and practice results.
export function accuracyBadge(rate) {
 const band=scoreBand(rate);
 return band ? `<span class="score-band accuracy-band" data-band="${band.level}" title="第 ${band.level} 档">${band.value}%</span>` : '<span class="score-band accuracy-band" data-band="none" title="暂无有效样本">—</span>';
}
