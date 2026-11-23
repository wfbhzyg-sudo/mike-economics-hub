import {courseLabel} from './course-scope.js';

const number=n=>String(Math.round(n*100)/100);
const skills=[['原理与模型','Principles and Models'],['解读','Interpretation'],['分析推演','Manipulation'],['绘图','Graphing and Visuals']];
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

export function skillRadarSvg(axes){
  const levels=Array.from({length:5},(_,i)=>(i+1)*12);
  const point=(i,r)=>[[74,74-r],[74+r,74],[74,74+r],[74-r,74]][i];
  const polygon=radius=>axes.map((_,i)=>point(i,radius).join(',')).join(' ');
  const points=axes.map((axis,i)=>axis.band===null?null:point(i,axis.band*12));
  const segments=axes.map((_,i)=>{
    const end=points[(i+1)%4],start=points[i];
    return start&&end?`<polyline points="${start.join(',')} ${end.join(',')}" />`:'';
  }).join('');
  return `<svg class="evidence-radar" aria-hidden="true" viewBox="0 0 148 148">
    <g class="evidence-grid">${levels.map(level=>`<polygon points="${polygon(level)}" />`).join('')}<path d="M14 74H134M74 14V134" /></g>
    ${points.every(Boolean)?`<polygon class="evidence-radar-fill" points="${points.map(p=>p.join(',')).join(' ')}" />`:''}
    <g class="evidence-radar-lines">${segments}</g>
    ${axes.map((axis,i)=>{const [x,y]=points[i]||point(i,60);return `<text x="${[74,143,74,5][i]}" y="${[10,78,146,78][i]}" text-anchor="middle" class="evidence-axis-index">${i+1}</text><circle cx="${x}" cy="${y}" r="4" ${axis.band===null?'class="evidence-radar-empty"':`fill="${colors[axis.band-1]}"`} />`;}).join('')}
  </svg>`;
}

export function performanceMarkup(value,h,link,{teacher=false}={}){
  if(!value)return '';
  const {index,axes,corrections}=value;
  const axis=value.focus?axes[value.focus-1]:null;
  const advice=axis?`${index?.level===5?'巩固':'先练'}${skills[axis.skill-1][0]}`:'';
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
    </div><div class="evidence-skill"><h2>技能分布</h2><div class="evidence-skill-body">${skillRadarSvg(axes)}<div>
      ${axes.map((item,i)=>`<details ${item.skill===value.focus&&item.references.length?'data-priority':''}><summary><span>${i+1}. ${skills[i][0]} <small>${skills[i][1]}</small></span><b>${item.band===null?'待积累':`第 ${item.band} 档`}</b></summary>
        <p>${item.count} 道独立题${item.comprehensiveAssessments?' · 综合测验覆盖 '+item.comprehensiveAssessments+' 次':''}${item.value!==null?` · 得分率 ${item.value}%`:''}</p>
        ${item.references.slice(0,4).map(r=>`<div class="evidence-item">${teacher?h(r.title):r.score<r.max?link('mistakes/'+encodeURIComponent(r.assignmentId)+'/'+encodeURIComponent(r.questionId),h(r.title)):h(r.title)}<span>第 ${h(r.questionId)} 题 · ${r.score}/${r.max}</span></div>`).join('')}</details>`).join('')}
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
  const labels={passed:'已订正',manual:'待教师核对',revise:'需补充',queued:'验收中'};
  let closed=false;
  async function draw(reopen){
    const {items,enabled}=await api(route);
    if(closed||!host.isConnected)return;
    host.innerHTML=`<div class="evidence-settings"><label><input type="checkbox" data-enable ${enabled?'checked':''}> 通过验收后补回本题失分</label>
      <label><input type="checkbox" data-transfer ${assignment.performanceTransfer?'checked':''}> 作为订正后独立迁移练习</label></div>
      <div class="evidence-review-list">${items.length?items.map(item=>`<details><summary>${h(students.find(x=>x.id===item.studentId)?.name||'学生')} · 第 ${h(item.questionId)} 题 <b>${labels[item.status]}</b></summary>
      <p class="instructions">${h(item.text||'见附件')}</p><div data-review-files="${h(item.id)}"></div>
      <p>${h(item.feedback||'')}</p><div class="task-action-row evidence-reference">${link('review/'+encodeURIComponent(item.submissionId),'查看原题和首次作答','document-link')}</div>
      ${item.status==='queued'?'':`<form data-review-form="${h(item.id)}"><label>处理理由<textarea required maxlength="300" name="reason"></textarea></label><div class="actions">${item.status==='passed'?'':'<button class="primary" name="decision" value="passed">确认通过</button>'}<button class="secondary" name="decision" value="revise">${item.status==='passed'?'撤销补分':'退回补充'}</button></div></form>`}
      </details>`).join(''):'<p>还没有提交验收的订正。</p>'}</div>`;
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
      const form=[...host.querySelectorAll('form')].find(x=>x.dataset.reviewForm===item.id);
      if(form)form.onsubmit=async event=>{
        event.preventDefault();
        const btn=event.submitter;if(!btn||form.getAttribute('aria-busy')==='true')return;form.setAttribute('aria-busy','true');for(const button of form.querySelectorAll('button'))button.disabled=true;
        try{await put('correction-reviews/'+encodeURIComponent(item.id),{status:btn.value,revision:item.revision,reason:form.elements.reason.value});await draw(item.id);}
        catch(e){toast(e.message);}finally{if(form.isConnected){form.removeAttribute('aria-busy');for(const button of form.querySelectorAll('button'))button.disabled=false;}}
      };
    }
  }
  draw().catch(e=>toast(e.message));
  return ()=>{closed=true;};
}
