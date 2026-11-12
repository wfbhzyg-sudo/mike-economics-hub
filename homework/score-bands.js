// Classroom reference bands requested by the teacher; not official AP conversion.
export function scoreBand(rate){
 if(rate===null||rate===undefined||rate===''||!Number.isFinite(Number(rate))||Number(rate)<0||Number(rate)>100)return null;
 const value=Math.round(Number(rate)*10)/10,level=Math.min(5,Math.floor(value/20)+1);
 return {value,level,color:['red','orange','yellow','light-green','deep-green'][level-1]};
}
export function scoreBadge(rate){const b=scoreBand(rate);return b?`<span class="score-band" data-band="${b.level}" aria-label="平均得分率 ${b.value}%，课堂 AP 参考 ${b.level}"><strong>${b.value}%</strong><small>AP ${b.level}</small></span>`:'<span class="score-band" data-band="none">尚无成绩</span>';}
export function scoreLegend(){return `<details class="score-legend"><summary>五色分档 · AP 参考</summary><div>${['0–<20%','20–<40%','40–<60%','60–<80%','80–100%'].map((v,i)=>`<span class="score-band" data-band="${i+1}"><strong>${v}</strong><small>AP ${i+1}</small></span>`).join('')}</div><p>课堂得分率参考分档，非 AP 官方换算。未出成绩不计零分。</p></details>`;}
