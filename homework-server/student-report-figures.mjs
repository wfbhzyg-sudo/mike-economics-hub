import {resultParts, skillNames} from './student-report.mjs';
import {workDate} from '../homework/grade-journey-model.js';

export const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => Math.round(n * 10) / 10;
const shortDate = new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric',timeZone:'Asia/Shanghai'});

function lineSegments(points) {
  let drawing=false;
  return points.map(p => {
    if (!p) {drawing=false;return '';}
    const op=drawing?'L':'M';
    drawing=true;
    return op+p.join(' ');
  }).join(' ');
}

export function trendFigure(course,compact=false) {
  const items=course.cells.slice(0,12).reverse().map(cell => {
    const grade=resultParts(cell);
    const rate=score => grade?.max>0 && Number.isFinite(score)?num(100*score/grade.max):null;
    return {title:cell.assignment.title,date:workDate(cell.assignment),first:rate(grade?.first),final:rate(grade?.total)};
  });
  const left=39,right=382,top=12,bottom=compact===true?70:132;
  const max=Math.max(100,...items.flatMap(r=>[r.final??0,r.first??0]));
  const x=i=>items.length===1?(left+right)/2:left+(right-left)*i/Math.max(items.length-1,1);
  const y=v=>bottom-(bottom-top)*v/max;
  const series=key=>items.map((s,i)=>s[key]===null?null:[num(x(i)),num(y(s[key]))]);
  const first=series('first'),final=series('final');
  const dots=(points,klass)=>points.map((p,i)=>p?`<circle class="${klass}" cx="${p[0]}" cy="${p[1]}" r="${klass==='first-dot'?4:2.4}"><title>${html(items[i].title)} · ${klass==='first-dot'?'首答':'最终'} ${items[i][klass==='first-dot'?'first':'final']}%</title></circle>`:'').join('');
  const labels=new Set([0,Math.floor((items.length-1)/2),items.length-1]);
  const ticks=items.map((r,i)=>labels.has(i)?`<text class="tick" x="${num(x(i))}" y="${bottom+20}" text-anchor="${items.length===1?'middle':i===0?'start':i===items.length-1?'end':'middle'}">${Number.isFinite(Date.parse(r.date))?shortDate.format(new Date(r.date)):'日期待录'}</text>`:'').join('');
  const grid=(compact===true?[0,2,4]:[0,1,2,3,4]).map(t=>{const v=num(max*t/4);return `<path class="grid" d="M${left} ${num(y(v))}H${right}"/><text class="tick" text-anchor="end" x="33" y="${num(y(v)+3.8)}">${v}%</text>`;}).join('');
  const graded=items.filter(r=>r.final!==null).length;
  const notes=[];
  if(course.cells.length>12) notes.push('最近 12 份作业');
  if(graded && graded<items.length) notes.push('缺分处断线');
  return `<figure class="trend"><figcaption>作业得分率</figcaption><div class="legend"><span class="key original">首答</span><span class="key final">最终</span></div>
    <svg viewBox="0 0 396 ${bottom+30}" role="img" aria-label="作业依日期排列。虚线为首次，实线为最终，缺分处断开。">${grid}
    <path class="final-line" d="${lineSegments(final)}"/><path class="first-line" d="${lineSegments(first)}"/>
    ${dots(first,'first-dot')}${dots(final,'final-dot')}${ticks}
    ${graded?'':'<text x="213" y="${(top+bottom)/2}" class="empty-plot" text-anchor="middle">还没有已公布成绩</text>'}</svg>
    ${notes.length?'<p class="caption">'+notes.join(' · ')+'</p>':''}</figure>`;
}

export function radarFigure(course) {
  const axes=skillNames.map((_,i)=>course.evidence?.axes.find(a=>a.skill===i+1));
  const cx=130,cy=80,r=57;
  const pos=(i,level)=>[cx+[0,1,0,-1][i]*r*level/5,cy+[-1,0,1,0][i]*r*level/5].map(num);
  const points=axes.map((a,i)=>a?.band>=1?pos(i,a.band):null);
  const rings=[1,2,3,4,5].map(k=>`<polygon class="ring" points="${axes.map((_,i)=>pos(i,k).join(',')).join(' ')}"/>`).join('');
  const edges=points.map((p,i)=>{const q=points[(i+1)%4];return p&&q?`M${p.join(' ')}L${q.join(' ')}`:'';}).filter(Boolean).join(' ');
  const anchors=[[130,15,'middle'],[195,84,'start'],[130,158,'middle'],[65,84,'end']];
  const labels=axes.map((a,i)=>`<text x="${anchors[i][0]}" y="${anchors[i][1]}" text-anchor="${anchors[i][2]}" class="axis-name">${skillNames[i]}<tspan class="axis-value"> ${a?.band??'—'}</tspan></text>`).join('');
  return `<figure class="radar"><figcaption>技能分布 <small>1–5 档</small></figcaption>
  <svg viewBox="0 0 260 166" role="img" aria-label="${html(axes.map((a,i)=>skillNames[i]+(a?.band?'第'+a.band+'档':'样本不足')).join('，'))}">${rings}<path class="grid" d="M130 23V137M73 80H187"/>
  ${points.every(Boolean)?`<polygon class="radar-area" points="${points.map(p=>p.join(',')).join(' ')}"/>`:''}<path class="final-line" d="${edges}"/>
  ${points.map(p=>p?`<circle class="final-dot" cx="${p[0]}" cy="${p[1]}" r="3.1"/>`:'').join('')}${labels}</svg>
  ${points.some(p=>!p)?'<p class="caption">— 样本不足</p>':''}</figure>`;
}
