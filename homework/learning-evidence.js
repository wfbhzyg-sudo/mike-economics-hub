import {subjectInfo} from './subject-catalog.js';
import {courseLabel} from './course-scope.js';

const number=n=>String(Math.round(n*100)/100);
const colors=['#ce746f','#dc9a58','#c4a338','#a2bb72','#4b9177'];

export function scoreSources(grade){
  const s=grade?.scoreSources;
  if(!s)return '';
  return `<span class="evidence-sources"><span>首次 <b>${number(s.first)}</b></span><span>订正 <b>+${number(s.recovered)}</b></span>${s.adjustment?`<span>教师调整 <b>${s.adjustment>0?'+':''}${number(s.adjustment)}</b></span>`:''}</span>`;
}

export function verificationMarkup(review,h){
  if(!review)return '';
  const labels={queued:'验收中',passed:'已订正',manual:'待教师核对',revise:'需补充'};
  return `<div class="evidence-verdict" data-review-state="${review.status}"><strong>${labels[review.status]||'待订正'}${review.credit?` · 已补回 ${number(review.credit)} 分`:''}</strong>${review.feedback?`<p>${h(review.feedback)}</p>`:review.status==='queued'?'<p>现在可以继续下一题。</p>':''}</div>`;
}

export function skillRadarSvg(axes,interactive=false){
  if(axes.length<3)return '';
  const levels=Array.from({length:5},(_,i)=>(i+1)*12);
  const point=(i,r)=>[Math.round(74+r*Math.sin(2*Math.PI*i/axes.length)),Math.round(74-r*Math.cos(2*Math.PI*i/axes.length))];
  const polygon=radius=>axes.map((_,i)=>point(i,radius).join(',')).join(' ');
  const points=axes.map((axis,i)=>axis.band===null?null:point(i,axis.band*12));
  const segments=axes.map((_,i)=>{
    const end=points[(i+1)%axes.length],start=points[i];
    return start&&end?`<polyline points="${start.join(',')} ${end.join(',')}" />`:'';
  }).join('');
  return `<svg class="evidence-radar" ${interactive?'role="group" aria-label="选择技能"':'aria-hidden="true"'} viewBox="0 0 148 148">
    <g class="evidence-grid">${levels.map(level=>`<polygon points="${polygon(level)}" />`).join('')}${axes.map((_,i)=>`<path d="M74 74L${point(i,60).join(' ')}" />`).join('')}</g>
    ${points.every(Boolean)?`<polygon class="evidence-radar-fill" points="${points.map(p=>p.join(',')).join(' ')}" />`:''}
    <g class="evidence-radar-lines">${segments}</g>
    ${axes.map((axis,i)=>{const [x,y]=points[i]||point(i,60);return `<g ${interactive?`data-skill-axis="${i+1}" tabindex="0" role="button" aria-label="查看第 ${i+1} 项技能证据"`:''}><text x="${point(i,69)[0]}" y="${point(i,68)[1]+4}" text-anchor="middle" class="evidence-axis-index">${i+1}</text><circle cx="${x}" cy="${y}" r="4" ${axis.band===null?'class="evidence-radar-empty"':`fill="${colors[axis.band-1]}"`} />${interactive?`<circle cx="${point(i,58)[0]}" cy="${point(i,58)[1]}" r="12" fill="transparent"/>`:''} </g>`;}).join('')}
  </svg>`;
}

export function performanceMarkup(value,h,link,{teacher=false}={}){
  if(!value)return '';
  const {index,axes,corrections}=value;
  const skills=subjectInfo(value.course)?.skills||[];
  const axis=value.focus?axes[value.focus-1]:null;
  const advice=axis?`${index?.level===5?'巩固':'先练'}${skills[axis.skill-1]?.name||''}`:'';
  return `<section class="evidence-performance" aria-label="${courseLabel(value.course)}学习表现">
    <div class="evidence-progress"><h2>学习表现${teacher?' <small>'+courseLabel(value.course)+'</small>':''}</h2>
      <div class="evidence-index">${index?`<strong>${index.value}</strong><span>第 ${index.level} 档 · 课堂参考</span>`:'<strong>积累样本中</strong>'}</div>
      <div class="evidence-track" data-ready="${Boolean(index)}" role="img" aria-label="${index?`五档表现。${index.value} 分，第 ${index.level} 档`:'样本不足，尚未分档'}">
        ${colors.map((color,i)=>`<span style="--band:${color};--fill:${index?Math.max(0,Math.min(100,(index.value-i*20)*5)):0}%"></span>`).join('')}
        ${index?`<i style="--position:${index.value}%"></i>`:''}
      </div>
      <p>${index?value.next!==null?`距第 ${index.level+1} 档 ${value.next} 分`:'已达第 5 档':`已出分 ${value.works} 份 · 需至少 2 份且合计满分 10 分`}</p>
      ${advice?`<p class="evidence-next"><strong>${advice}</strong>${teacher?'':`<button type="button" class="text-button" data-performance-advice="${value.course}">生成练习建议</button>`}</p><p data-advice-output role="status"></p>`:''}
      ${teacher?'<small class="evidence-scope">本教师可见作业 · 全时段</small>':''}
      <details><summary>查看计算依据</summary><p>独立首答 ${value.first??'待积累'} · 订正后迁移 ${value.transfer??'待积累'}<br>通过订正 ${corrections.done} / ${corrections.total} 道</p></details>
    </div><div class="evidence-skill"><h2>技能分布</h2><div class="evidence-skill-body">${skillRadarSvg(axes,!teacher)}<div>
      ${axes.map((item,i)=>`<details data-skill="${i+1}" ${item.skill===value.focus&&item.references.length?'data-priority':''}><summary><span>${i+1}. ${skills[i]?.name||''} <small>${skills[i]?.english||''}</small></span><b>${item.band===null?'待积累':`第 ${item.band} 档`}</b></summary>
        <p>${item.count} 道独立题${item.comprehensiveAssessments?' · 综合测验覆盖 '+item.comprehensiveAssessments+' 次':''}${item.value!==null?` · 得分率 ${item.value}%`:''}</p>
        ${item.references.slice(0,3).map((r,j)=>`<div class="evidence-item">${teacher?h(r.title):r.score<r.max?link('mistakes/'+encodeURIComponent(r.assignmentId)+'/'+encodeURIComponent(r.questionId),h(r.title)):r.submissionId?link('result/'+encodeURIComponent(r.submissionId)+'/'+encodeURIComponent(r.questionId),h(r.title)):h(r.title)}<span>第 ${h(r.questionNumber||r.questionId)} 题 · 首答 ${r.score}/${r.max}${r.pointId?` · 评分点 ${h(r.pointId)}　${r.pointScore}/${r.pointMax}`:''}${r.recovered?` · 本题订正 +${r.recovered}`:''}</span>${!teacher&&r.lessonReference?.topic?`<span data-skill-lesson="${j}"></span>`:''}</div>`).join('')}</details>`).join('')}
    </div></div></div>
  </section>`;
}

// Page-lifetime loader; failed requests can be retried, no student data in browser storage.
export function teacherEvidenceReader(api){
  const pending=new Map();
  return (student,scope='')=>{
    const q=new URLSearchParams({student});if(scope)q.set('class',scope);
    const key=String(q);
    if(!pending.has(key)){
      if(pending.size>=16)pending.delete(pending.keys().next().value);
      const req=api('learning/student-performance?'+key).then(body=>body.performance)
        .catch(error=>{if(pending.get(key)===req)pending.delete(key);throw error;});
      pending.set(key,req);
    }
    return pending.get(key);
  };
}

export function showTeacherEvidence(host,{read,student,scope='',subject='',h}){
  const stamp=Symbol();host.evidenceStamp=stamp;
  const active=()=>host.isConnected&&host.evidenceStamp===stamp;
  host.innerHTML='<div class="profile-evidence-wait" role="status">正在读取学习表现…</div>';
  const load=async()=>{
    try{
      const values=await read(student,scope);if(!active())return;
      const valid=subject?values.filter(v=>v.course===subject):values;
      if(!valid.length){host.replaceChildren();return;}
      const nav=valid.length>1?'<div class="evidence-course-pick" role="group" aria-label="学习表现学科">'+valid.map(v=>'<button type="button" data-evidence-course="'+v.course+'">'+courseLabel(v.course)+'</button>').join('')+'</div>':'';
      host.innerHTML=nav+'<div data-evidence-body></div>';
      const render=value=>{
        for(const b of host.querySelectorAll('[data-evidence-course]'))b.setAttribute('aria-pressed',String(b.dataset.evidenceCourse===value.course));
        host.querySelector('[data-evidence-body]').innerHTML=performanceMarkup(value,h,null,{teacher:true});
      };
      render(valid.find(v=>v.index)||valid.find(v=>v.works)||valid[0]);
      for(const b of host.querySelectorAll('[data-evidence-course]'))b.onclick=()=>render(valid.find(v=>v.course===b.dataset.evidenceCourse));
    }catch{
      if(!active())return;
      host.innerHTML='<div class="profile-evidence-wait" role="status">学习表现暂未载入 <button type="button">重试</button></div>';
      const retry=host.querySelector('button');retry.onclick=()=>{retry.disabled=true;void load();};
    }
  };
  void load();
}

export function mountReviewPanel(host,{api,put,h,link,fileMarkup,metadata,bindPreviews,toast},assignment,students){
  const route='correction-reviews/'+encodeURIComponent(assignment.id);
  const labels={recorded:'已提交订正',passed:'已订正',manual:'待教师核对',revise:'需补充',queued:'验收中'};
  let closed=false, sequence=0, lastContent;
  const editing=()=>Boolean(host.querySelector('form[aria-busy="true"],form textarea:focus,[data-enable]:disabled')) ||
    [...host.querySelectorAll('form textarea')].some(t=>t.value.trim());
  async function draw(reopen,background=false){
    if(background&&(document.hidden||host.closest('[hidden]')||editing()))return;
    const request=++sequence;
    const {items,enabled}=await api(route);
    if(closed||!host.isConnected||request!==sequence)return;
    const signature=JSON.stringify([enabled,items]);
    if(background&&(signature===lastContent||editing()))return;
    const expanded=new Set([...host.querySelectorAll('details[open] [data-review-files]')].map(el=>el.dataset.reviewFiles));
    lastContent=signature;
    host.innerHTML=`<div class="evidence-settings"><label><input type="checkbox" data-enable ${enabled?'checked':''}> 通过验收后补回本题失分</label>
      <label><input type="checkbox" data-transfer ${assignment.performanceTransfer?'checked':''}> 作为订正后独立迁移练习</label></div>
      <div class="evidence-review-list">${items.length?items.map(item=>`<details><summary>${h(students.find(x=>x.id===item.studentId)?.name||'学生')} · 第 ${h(item.questionId)} 题 <b>${labels[item.status]}</b></summary>
      <p class="instructions">${h(item.text||'见附件')}</p><div data-review-files="${h(item.id)}"></div>
      <p>${h(item.feedback||'')}</p><div class="task-action-row evidence-reference">${item.submissionId?link('review/'+encodeURIComponent(item.submissionId),'查看原题和首次作答','document-link'):''}</div>
      ${['recorded','queued'].includes(item.status)?'':`<form data-review-form="${h(item.id)}"><label>处理理由<textarea required maxlength="300" name="reason"></textarea></label><div class="actions">${item.status==='passed'?'':'<button class="primary" name="decision" value="passed">确认通过</button>'}<button class="secondary" name="decision" value="revise">${item.status==='passed'?'撤销补分':'退回补充'}</button></div></form>`}
      </details>`).join(''):'<p>还没有学生提交订正。</p>'}</div>`;
    if(reopen){const summary=[...host.querySelectorAll('[data-review-files]')].find(x=>x.dataset.reviewFiles===reopen)?.closest('details');if(summary){summary.open=true;summary.querySelector('summary').focus({preventScroll:true});}}
    const credit=host.querySelector('[data-enable]'),transfer=host.querySelector('[data-transfer]');
    for(const input of [credit,transfer])input.onchange=async()=>{
      credit.disabled=transfer.disabled=true;
      try{await put(route+'/settings',{enabled:credit.checked,transfer:transfer.checked});assignment.performanceTransfer=transfer.checked;toast('设置已保存');}
      catch(e){credit.checked=enabled;transfer.checked=Boolean(assignment.performanceTransfer);toast(e.message);}
      finally{credit.disabled=transfer.disabled=false;}
    };
    for(const item of items){
      const box=[...host.querySelectorAll('[data-review-files]')].find(x=>x.dataset.reviewFiles===item.id);
      if(item.files?.length)box.closest('details').addEventListener('toggle',async ev=>{
        if(!ev.target.open||box.dataset.loaded)return;
        try{await metadata(item.files);if(!box.isConnected)return;box.innerHTML=fileMarkup(item.files);bindPreviews(box);box.dataset.loaded='true';}
        catch(e){toast(e.message);}
      });
      if(expanded.has(item.id))box.closest('details').open=true;
      const form=[...host.querySelectorAll('form')].find(x=>x.dataset.reviewForm===item.id);
      if(form)form.onsubmit=async event=>{
        event.preventDefault();
        const btn=event.submitter;if(!btn||form.getAttribute('aria-busy')==='true')return;form.setAttribute('aria-busy','true');for(const button of form.querySelectorAll('button'))button.disabled=true;
        try{await put('correction-reviews/'+encodeURIComponent(item.id),{status:btn.value,revision:item.revision,reason:form.elements.reason.value});await draw(item.id);}
        catch(e){toast(e.message);}finally{if(form.isConnected){form.removeAttribute('aria-busy');for(const button of form.querySelectorAll('button'))button.disabled=false;}}
      };
    }
  }
  const refresh=()=>{if(!closed)void draw(null,true).catch(()=>{});};
  draw().catch(e=>{if(!closed)toast(e.message);});
  const timer=setInterval(refresh,20000);
  document.addEventListener('visibilitychange',refresh);
  window.addEventListener('focus',refresh);
  return ()=>{closed=true;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('focus',refresh);};

}

export function receiptEvidence(submission) {
  const grade = submission?.publishedGrade;
  if (!Number.isFinite(grade?.total) || grade.absent) return '';
  const parts = grade.scoreSources, history = submission.gradeHistory || [];
  const first = history[0] || grade;
  const firstTotal = parts?.original ?? first.total;
  const recovered = parts?.recovered ?? 0;
  const hasFirst = Number.isFinite(firstTotal) && (history.length || !grade.manualTotal || parts);
  const firstMax = first.maxPoints ?? grade.maxPoints;
  const recorded = submission.offlineEvidence || submission.assignment?.offline || grade.source === 'offline';
  const adjustment = hasFirst && firstMax === grade.maxPoints ? Math.round((grade.total-firstTotal-recovered)*100)/100 : null;
  return `<div class="receipt-evidence evidence-sources">${hasFirst?`<span>${recorded?'首次录分':'首次得分'} <b>${number(firstTotal)}${firstMax!==grade.maxPoints&&Number.isFinite(firstMax)?' / '+number(firstMax):''}</b></span>`:''}<span>订正补回 <b>+${number(recovered)}</b></span>${adjustment?`<span>成绩调整 <b>${adjustment>0?'+':''}${number(adjustment)}</b></span>`:''}</div>`;
}

export function receiptActions(summary, assignmentId, link) {
  if (!summary) return '';
  if (!(summary.open || summary.review || summary.manual || summary.saved)) return '<div class="receipt-next"><span>本次无需订正</span></div>';
  return `<div class="receipt-next">${summary.open?link('mistakes/'+encodeURIComponent(assignmentId)+'/'+encodeURIComponent(summary.next),'订正剩余 '+summary.open+' 题','primary'):''}${summary.review?`<span>待验收 ${summary.review} 题</span>`:''}${summary.manual?`<span>待教师核对 ${summary.manual} 题</span>`:''}${summary.saved?`<span>已保存订正 ${summary.saved} 题</span>`:''}</div>`;
}
