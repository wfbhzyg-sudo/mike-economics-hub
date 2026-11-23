import {questionResult} from './result-badge.js';

export function hasItemScores(submission) {
  return Boolean(submission?.publishedGrade?.questions?.some(q => Number.isFinite(q.score)));
}

export function offlineAnswers(s,h) {
  const refs=new Map((s.rubricSnapshot||[]).map(q=>[String(q.id),q]));
  const rows=s.publishedGrade.questions.map((g,i)=>{
    const q=refs.get(String(g.id))||{},choice=q.type==='choice'||g.type==='choice';
    const selected=s.choices?.[g.id]||g.selectedOptions?.join('、');
    const answer=q.manualGradingRequired?'待核对':q.correctOptions?.join('、')||q.answer;
    const state=questionResult({...g,unanswered:choice&&!selected});
    const label=choice&&state.key==='correct'?'正确':choice&&state.key==='wrong'?'错误':state.label;
    const points=(g.pointResults||[]).map(p=>'('+h(p.id)+') '+h(p.earned)+' / '+h(p.maxPoints)).join('　');
    const detail=q.prompt||q.questionImages?.length||q.options?.some(o=>o.text)||points||s.responses?.[g.id]?.text||q.criteria;
    const columns=`<span>第 ${i+1} 题</span><strong>${choice?h(selected||'未作答'):'简答题'}</strong><span>${choice?h(answer||'待核对'):'分项评分'}</span><span class="oa-result" data-result="${state.key}">${state.symbol} ${label}</span><span>${h(g.score??'—')}/${h(g.maxPoints??'—')}</span>`;
    if(!detail)return '<div class="oa-line oa-static">'+columns+'</div>';
    return `<details class="oa-row"><summary class="oa-line">${columns}</summary><div class="oa-detail">${q.prompt?'<p>'+h(q.prompt)+'</p>':''}${(q.questionImages||[]).map((file,j)=>'<img loading="lazy" decoding="async" data-original-src="/api/homework/files/'+encodeURIComponent(file)+'" alt="第 '+(i+1)+' 题原题片段 '+(j+1)+'">').join('')}${(q.options||[]).filter(o=>o.text).map(o=>'<p>'+h(o.label)+'. '+h(o.text)+'</p>').join('')}${s.responses?.[g.id]?.text?'<p>'+h(s.responses[g.id].text)+'</p>':''}${points?'<p><strong>分项得分</strong>　'+points+'</p>':''}${!choice&&!s.responses?.[g.id]?.text?'<p>原表未提供学生作答原文。</p>':''}${!choice&&q.criteria?'<p>'+h(q.criteria)+'</p>':''}</div></details>`;
  });
  return `<section class="offline-answers" aria-label="逐题作答"><h2>逐题作答</h2><div class="oa-line oa-head"><span>题号</span><span>学生答案</span><span>参考答案</span><span>结果</span><span>得分</span></div>${rows.join('')}</section>`;
}

export function bindOfflineOriginals(root){
  root.addEventListener('toggle',e=>{
    if(!e.target.matches('details.oa-row[open]'))return;
    for(const img of e.target.querySelectorAll('[data-original-src]')){
      img.src=img.dataset.originalSrc;img.removeAttribute('data-original-src');
    }
  },true);
}
