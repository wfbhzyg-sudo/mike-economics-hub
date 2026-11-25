const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function flaggedBookmarks(anchor,{api,source,assignmentId,version,items}){
  if(!anchor||!items?.length)return;
  const panel=document.createElement('details');panel.className='student-action-card';
  panel.innerHTML='<summary>标记过且答对的题 · '+items.length+'</summary><section><div data-list></div><button type="button" data-save disabled>存入书签</button> <button type="button" data-undo hidden>撤销本次添加</button><p role="status"></p></section>';
  anchor.after(panel);
  const list=panel.querySelector('[data-list]'),save=panel.querySelector('[data-save]'),undo=panel.querySelector('[data-undo]'),status=panel.querySelector('[role=status]');
  const ref=q=>({source,assignmentId,questionId:q.id,version:q.version||version||1});
  let loaded=false,busy=false,added=[];
  function count(){const n=list.querySelectorAll('input:checked:not(:disabled)').length;save.disabled=busy||!n;save.hidden=loaded&&list.childElementCount>0&&!list.querySelector('input:not(:disabled)');save.textContent=n>1?'存入书签（'+n+'）':'存入书签';}
  async function read(){
    const {items:saved}=await api('question-bookmarks?'+new URLSearchParams({source,assignmentId}));
    list.replaceChildren();
    for(const q of items){const label=document.createElement('label'),box=document.createElement('input');box.type='checkbox';
      box.disabled=saved.some(x=>String(x.questionId)===String(q.id)&&String(x.version)===String(ref(q).version));box.checked=box.disabled;box.value=String(q.id);
      const name=document.createElement('span');name.textContent='第 '+q.number+' 题';label.append(box,name);if(box.disabled)label.append(' · 已收藏');list.append(label);}
    count();
  }
  panel.ontoggle=async()=>{if(!panel.open||loaded)return;loaded=true;try{await read();}catch(e){loaded=false;status.textContent=e.message;}};
  list.onchange=count;
  save.onclick=async()=>{if(busy)return;busy=true;count();list.inert=true;const selection=[...list.querySelectorAll('input:checked:not(:disabled)')],previous=added;added=[];
    try{for(const box of selection){const q=items.find(x=>String(x.id)===box.value),body=ref(q);const r=await api('question-bookmarks',{method:'PUT',body});if(r.created)added.push({...body,creationId:r.creationId});box.disabled=true;box.parentElement.append(' · 已收藏');}status.textContent='已保存到书签';}catch(e){status.textContent=e.message;if(!added.length)added=previous;}finally{undo.hidden=!added.length;busy=false;list.inert=false;count();}};
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
        const done=r=>{
          attempt=r;form.hidden=true;dialog.dataset.finished='';
          const options=document.createElement('ul');options.className='recall-result-options';
          for(const letter of q.optionLabels){
            const li=document.createElement('li'),mark=document.createElement('b'),text=document.createElement('span');
            mark.textContent=letter;text.textContent=q.optionText[letter]||'';li.append(mark,text);
            const state=letter===r.answer?(letter===r.choice?'选对了':'正确选项'):letter===r.choice?'我的选择':'';
            if(state){const badge=document.createElement('small');badge.textContent=state;li.dataset.result=letter===r.answer?'correct':'missed';li.append(badge);}
            options.append(li);
          }
          form.before(options);
          status.textContent=r.correct?'答对了':'本次未答对';
          if(r.helped)status.textContent+=' · 已参考资料';
          label.textContent='查看再练结果';
        };
        if(current.status==='submitted')done(current);
        form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');if(b.disabled)return;b.disabled=true;try{const r=await api(url+'/submit',{method:'POST',body:{...ref,choice:form.elements.choice.value,helped:form.helped.checked}});done(r.attempt);}catch(err){status.textContent=err.message;b.disabled=false;}};
        dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.onclose=()=>{dialog.remove();label.focus({preventScroll:true});};dialog.showModal();
      }catch(e){label.textContent='重试再练 · '+e.message;}finally{label.disabled=false;}
    };
  }
  return async()=>{if(started||!host.isConnected)return;started=true;try{const r=await api(url+'?'+query);if(r.available||r.attempt)await draw(r.attempt);}catch{started=false;}};
}

export function questionIssue(host,api,ref){
  const trigger=document.createElement('button');
  trigger.type='button';trigger.dataset.questionIssue='';trigger.textContent='题面反馈';
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-label','报告题面问题');
  host.append(trigger);
  let draft={reason:'缺少图表',note:''};
  trigger.onclick=async()=>{
    const d=document.createElement('dialog');d.className='mcq-modal student-issue-dialog';d.setAttribute('aria-label','报告题面问题');
    d.innerHTML='<form><header><h2>报告题面问题</h2><button type="button" data-close>关闭</button></header><label>问题类型<select name="reason">'+['缺少图表','选项不完整','题干看不清','其他问题'].map(s=>'<option>'+s+'</option>').join('')+'</select></label><label>补充说明<textarea name="note" maxlength="400" rows="2"></textarea></label><p role="status"></p><button type="submit">提交反馈</button></form>';
    (host.closest('main')||host).append(d);const form=d.querySelector('form'),status=form.querySelector('[role=status]'),send=form.querySelector('[type=submit]');
    form.onsubmit=e=>e.preventDefault();form.reason.value=draft.reason;form.note.value=draft.note;form.oninput=()=>draft={reason:form.reason.value,note:form.note.value};
    d.onclose=()=>{d.remove();if(trigger.isConnected)trigger.focus({preventScroll:true});};d.querySelector('[data-close]').onclick=()=>d.close();d.showModal();
    function receipt(item){status.textContent=(item.status==='open'?'已报告 · 等待教师查看':item.status==='checking'?'教师核对中':'教师已处理')+(item.reply?' · '+item.reply:'')+(item.updatedVersion?' · 题库 v'+item.updatedVersion+'（本卷 v'+item.reportedVersion+'）':'');trigger.setAttribute('aria-label','查看题面反馈');form.querySelector('h2').textContent=item.reason;
      const note=document.createElement('p');note.className='issue-receipt-note';
      note.textContent=item.note||'';if(note.textContent)status.before(note);
      for(const label of form.querySelectorAll('label'))label.hidden=true;
      send.hidden=true;form.dataset.receipt='';
      if(item.revision){const changed=document.createElement('details');changed.innerHTML='<summary>查看教师确认的新版题面</summary><p></p>';changed.querySelector('p').textContent=item.revision.prompt;
        for(const [i,id] of item.revision.images.entries()){const img=document.createElement('img');img.alt='修订后的题面片段 '+(i+1);img.loading='lazy';img.style.maxWidth='100%';img.src='/api/homework/files/'+encodeURIComponent(id)+'?issue='+encodeURIComponent(item.revision.id);changed.append(img);}
        status.after(changed);
      }
    }
    send.disabled=true;form.dataset.loading='';status.textContent='正在读取反馈…';
    try{const {item}=await api('question-issues?'+new URLSearchParams(ref));if(item)receipt(item);else status.textContent='';}
    catch(e){status.textContent=e.message;}
    finally{delete form.dataset.loading;send.disabled=false;}
    form.onsubmit=async e=>{e.preventDefault();if(send.disabled||send.hidden)return;send.disabled=true;try{const {item}=await api('question-issues',{method:'POST',body:{...ref,...draft}});receipt(item);}catch(error){status.textContent=error.message;}finally{send.disabled=false;}};
  };
}

export async function teacherQuestionIssues(host,api,expanded,draft=''){
  const {groups}=await api('question-issues');if(!host.isConnected)return;
  host.className='teacher-issue-list';
  host.innerHTML='<a href="#bank">← 题库</a>'+(!groups.length?'<p>暂无题面反馈。</p>':'');
  for(const g of groups){
    const card=document.createElement('details');card.className='student-action-card';
    const state=g.unchecked?'待处理':g.open?'核对中':'已处理';
    const primary=g.title+' · '+g.label,others=g.sources.filter(source=>source!==primary);
    const notes=(g.notes||[]).map(note=>'<li>'+escapeHtml(note)+'</li>').join('');
    card.innerHTML='<summary><strong>'+escapeHtml(primary)+'</strong><span>'+g.count+' 人 · '+state+'</span></summary><section><p>'+g.reasons.map(escapeHtml).join('、')+'</p>'+
      (notes?'<ul class="issue-notes">'+notes+'</ul>':'')+
      (g.lastReply?'<p class="issue-last-reply"><strong>最近回复</strong> '+escapeHtml(g.lastReply)+'</p>':'')+
      (others.length?'<details><summary>其他来源（'+others.length+'）</summary>'+others.map(escapeHtml).join('、')+'</details>':'')+
      (g.bankId?'<a href="#bank/crop/'+encodeURIComponent(g.bankId)+'">核对原页与切片</a>':'')+
      (g.open?'<form><label>回复学生<input name="reply" required maxlength="280"></label><div class="issue-actions"><button value="resolve">回复并结案</button>'+
        (g.unchecked?'<button value="inspect" formnovalidate>开始核对</button>':'')+'</div><small role="status"></small></form>':'')+'</section>';
    host.append(card);
    if(g.key===expanded){card.open=true;card.querySelector('summary').focus({preventScroll:true});}
    const form=card.querySelector('form');if(!form)continue;
    if(g.key===expanded)form.elements.reply.value=draft;
    form.onsubmit=async e=>{
      e.preventDefault();if(form.getAttribute('aria-busy')==='true')return;
      const action=e.submitter?.value==='inspect'?'inspect':'resolve';
      form.setAttribute('aria-busy','true');
      const buttons=form.querySelectorAll('button');for(const button of buttons)button.disabled=true;
      try{
        await api('question-issues/'+action,{method:'POST',body:{group:g.key,reply:action==='resolve'?form.elements.reply.value:''}});
        await teacherQuestionIssues(host,api,g.key,action==='inspect'?form.elements.reply.value:'');
      }catch(err){form.querySelector('small').textContent=err.message;}
      finally{form.removeAttribute('aria-busy');for(const button of buttons)button.disabled=false;}
    };
  }
}
