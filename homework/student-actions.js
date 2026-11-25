const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function flaggedBookmarks(anchor,{api,source,assignmentId,version,items}){
  if(!anchor||!items?.length)return;
  const panel=document.createElement('details');panel.className='student-action-card';
  panel.innerHTML='<summary>标记过且答对的题 · '+items.length+'</summary><section><div data-list></div><button type="button" data-save disabled>存入书签</button> <button type="button" data-undo hidden>撤销本次添加</button><p role="status"></p></section>';
  anchor.after(panel);
  const list=panel.querySelector('[data-list]'),save=panel.querySelector('[data-save]'),undo=panel.querySelector('[data-undo]'),status=panel.querySelector('[role=status]');
  const ref=q=>({source,assignmentId,questionId:q.id,version:q.version||version||1});
  let loaded=false,busy=false,added=[];
  function count(){const n=list.querySelectorAll('input:checked:not(:disabled)').length;save.disabled=busy||!n;save.textContent='存入书签 · '+n+' 题';}
  async function read(){
    const {items:saved}=await api('question-bookmarks?'+new URLSearchParams({source,assignmentId}));
    list.replaceChildren();
    for(const q of items){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';
      box.disabled=saved.some(x=>String(x.questionId)===String(q.id)&&String(x.version)===String(ref(q).version));box.value=String(q.id);
      label.append(box,' 第 '+q.number+' 题'+(box.disabled?' · 已收藏':''));list.append(label);}
    count();
  }
  panel.ontoggle=async()=>{if(!panel.open||loaded)return;loaded=true;try{await read();}catch(e){loaded=false;status.textContent=e.message;}};
  list.onchange=count;
  save.onclick=async()=>{if(busy)return;busy=true;count();added=[];
    try{for(const box of list.querySelectorAll('input:checked:not(:disabled)')){const q=items.find(x=>String(x.id)===box.value),body=ref(q);const r=await api('question-bookmarks',{method:'PUT',body});if(r.created)added.push({...body,creationId:r.creationId});box.disabled=true;}status.textContent='已存入错题集的书签。';}catch(e){status.textContent=e.message;}finally{undo.hidden=!added.length;busy=false;count();}};
  undo.onclick=async()=>{if(busy)return;busy=true;undo.disabled=true;try{while(added.length){await api('question-bookmarks',{method:'DELETE',body:added.at(-1)});added.pop();}await read();status.textContent='已撤销本次添加。';}catch(e){status.textContent=e.message;}finally{undo.hidden=!added.length;undo.disabled=false;busy=false;count();}};
}

export function mountRecall(host,api,ref){
  const url='self-practice/recall',query=new URLSearchParams(ref);
  let started=false;
  async function draw(attempt){
    if(!host.isConnected)return;
    host.hidden=false;host.replaceChildren();
    const label=document.createElement('button');label.type='button';host.append(label);
    label.textContent=attempt?.status==='submitted'?'查看再练结果':attempt?'继续上次再练':'再练一道同类题';
    label.onclick=async()=>{
      label.disabled=true;let dialog;
      try{
        const current=(await api(url+'/start',{method:'POST',body:ref})).attempt;
        if(!current){host.hidden=true;return;}
        dialog=document.createElement('dialog');dialog.className='mcq-modal student-recall-dialog';dialog.setAttribute('aria-label','同类再练');
        const q=current.question;
        dialog.innerHTML='<header><h2>同类再练 · Topic '+escapeHtml(q.topic)+'</h2><button type="button" data-close>关闭</button></header><p class="instructions">'+escapeHtml(q.prompt)+'</p>'+
          q.questionImages.map((id,i)=>'<img alt="题面片段 '+(i+1)+'" src="/api/homework/files/'+encodeURIComponent(id)+'?recall='+encodeURIComponent(current.id)+'">').join('')+
          '<form><fieldset><legend>我的选择</legend>'+q.optionLabels.map(o=>'<label><input required type="radio" name="choice" value="'+escapeHtml(o)+'"> '+escapeHtml(o)+' '+escapeHtml(q.optionText[o])+'</label>').join('')+'</fieldset><label><input type="checkbox" name="helped"> 本次参考了提示或资料</label><button>确认作答</button></form><p role="status"></p>';
        host.append(dialog);const form=dialog.querySelector('form'),status=dialog.querySelector('[role=status]');
        const done=r=>{attempt=r;form.hidden=true;status.textContent=(r.correct?'答对了':'本次未答对')+' · 我的选择 '+r.choice+' · 正确选项 '+r.answer+(r.helped?' · 参考了提示或资料':' · 独立完成');label.textContent='查看再练结果';};
        if(current.status==='submitted')done(current);
        form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{const r=await api(url+'/submit',{method:'POST',body:{...ref,choice:form.elements.choice.value,helped:form.helped.checked}});done(r.attempt);}catch(err){status.textContent=err.message;b.disabled=false;}};
        dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>{dialog.remove();label.focus();};dialog.showModal();
      }catch(e){label.textContent='重试再练 · '+e.message;}finally{label.disabled=false;}
    };
  }
  return async()=>{if(started||!host.isConnected)return;started=true;try{const r=await api(url+'?'+query);if(r.available||r.attempt)await draw(r.attempt);}catch{started=false;}};
}

export function questionIssue(host,api,ref){
  const menu=document.createElement('details');menu.className='student-question-more';menu.innerHTML='<summary aria-label="更多题目操作">⋯</summary><button type="button">报告题面问题</button>';host.append(menu);
  const trigger=menu.querySelector('button');let draft={reason:'缺少图表',note:''};
  trigger.onclick=async()=>{
    menu.open=false;const d=document.createElement('dialog');d.className='mcq-modal student-issue-dialog';d.setAttribute('aria-label','报告题面问题');
    d.innerHTML='<form><header><h2>报告题面问题</h2><button type="button" data-close>关闭</button></header><label>问题类型<select name="reason">'+['缺少图表','选项不完整','题干看不清','其他问题'].map(s=>'<option>'+s+'</option>').join('')+'</select></label><label>补充说明<textarea name="note" maxlength="400" rows="2"></textarea></label><p role="status"></p><button type="submit">提交反馈</button></form>';
    (host.closest('main')||host).append(d);const form=d.querySelector('form'),status=form.querySelector('[role=status]'),send=form.querySelector('[type=submit]');
    form.onsubmit=e=>e.preventDefault();form.reason.value=draft.reason;form.note.value=draft.note;form.oninput=()=>draft={reason:form.reason.value,note:form.note.value};
    d.onclose=()=>{d.remove();menu.querySelector('summary').focus({preventScroll:true});};d.querySelector('[data-close]').onclick=()=>d.close();d.showModal();
    function receipt(item){status.textContent=(item.status==='open'?'已报告 · 等待教师查看':item.status==='checking'?'教师核对中':'教师已处理')+(item.reply?' · '+item.reply:'')+(item.updatedVersion?' · 题库 v'+item.updatedVersion+'（本卷 v'+item.reportedVersion+'）':'');trigger.textContent='查看题面反馈';form.reason.value=item.reason;form.note.value=item.note||'';form.reason.disabled=form.note.disabled=true;send.hidden=true;
      if(item.revision){const changed=document.createElement('details');changed.innerHTML='<summary>查看教师确认的新版题面</summary><p></p>';changed.querySelector('p').textContent=item.revision.prompt;
        for(const [i,id] of item.revision.images.entries()){const img=document.createElement('img');img.alt='修订后的题面片段 '+(i+1);img.loading='lazy';img.style.maxWidth='100%';img.src='/api/homework/files/'+encodeURIComponent(id)+'?issue='+encodeURIComponent(item.revision.id);changed.append(img);}
        status.after(changed);
      }
    }
    send.disabled=true;
    try{const {item}=await api('question-issues?'+new URLSearchParams(ref));if(item)receipt(item);}catch(e){status.textContent=e.message;}finally{send.disabled=false;}
    form.onsubmit=async e=>{e.preventDefault();if(send.disabled)return;send.disabled=true;try{const {item}=await api('question-issues',{method:'POST',body:{...ref,...draft}});receipt(item);}catch(error){status.textContent=error.message;}finally{send.disabled=false;}};
  };
}

export async function teacherQuestionIssues(host,api){
  const {groups}=await api('question-issues');if(!host.isConnected)return;
  host.innerHTML='<a href="#bank">← 题库</a><h2>学生题面反馈</h2>'+(!groups.length?'<p>暂无反馈。</p>':'');
  for(const g of groups){
    const card=document.createElement('details');card.className='student-action-card';
    card.innerHTML='<summary>'+escapeHtml(g.title)+' · '+escapeHtml(g.label)+' · '+g.count+' 人 · '+(g.open?'待处理':'已处理')+'</summary><p>'+g.reasons.map(escapeHtml).join('、')+'</p><p>'+g.sources.map(escapeHtml).join('、')+'</p>'+(g.bankId?'<a href="#bank/crop/'+encodeURIComponent(g.bankId)+'">核对原页与切片</a>':'')+'<form><label>回复学生<input required maxlength="280"></label><button value="resolve">已处理，发送回复</button> <button value="inspect">标为核对中</button><small role="status"></small></form>';
    host.append(card);const form=card.querySelector('form');form.hidden=!g.open;
    form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{await api('question-issues/'+(e.submitter?.value==='inspect'?'inspect':'resolve'),{method:'POST',body:{group:g.key,reply:form.querySelector('input').value}});await teacherQuestionIssues(host,api);}catch(err){form.querySelector('small').textContent=err.message;b.disabled=false;}};
  }
}
