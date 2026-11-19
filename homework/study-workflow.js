import {coursesFor,selectedCourse,rememberCourse,courseLabel,singleClassCourse} from './course-scope.js';
import {mistakeNavigation,bindMistakeNavigation} from './mistake-navigation.js';
import {viewMemory} from './view-memory.js';
import {topicGrid,bindTopicGrid} from './topic-grid.js';
import {accuracyBadge} from './score-bands.js';
import {createMockStudentDetail} from './mock-student-detail.js';

const localTime=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'short',hourCycle:'h23'});
const nl = value => value ? String(value).slice(0,10) : '';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const part = encodeURIComponent;

function mockTrendMarkup(trends = []) {
  if (!trends.length) return '<span class="mock-trend-empty">— <small>尚无成绩</small></span>';
  return trends.map(({course,points})=>{
    const latest=points.at(-1).percent;
    const change=points.length>1?Math.round((latest-points.at(-2).percent)*10)/10:null;
    const description=points.map(p=>localTime.format(new Date(p.submittedAt))+' '+p.percent+'%').join('、');
    const coords=points.map((p,i)=>[points.length===1?42:4+76*i/(points.length-1),26-p.percent*.22]);
    const [x,y]=coords.at(-1), direction=change>0?'up':change<0?'down':'steady';
    return `<div class="mock-trend" data-trend-course="${esc(course)}" title="${esc(description)}">
      <svg viewBox="0 0 84 30" role="img" aria-label="${esc(courseLabel(course)+' · '+description)}">
        <path class="mock-trend-guide" d="M4 4H80 M4 15H80 M4 26H80"/>
        ${coords.length>1?`<polyline points="${coords.map(p=>p.join(',')).join(' ')}"/>`:''}
        <circle cx="${x}" cy="${y}" r="2.5"/>
      </svg><span>${trends.length>1?`<small>${esc(courseLabel(course))}</small>`:''}<strong>${latest}%</strong><small data-direction="${direction}">${change===null?'首次':change===0?'持平':(change>0?'+':'')+change+' pp'}</small></span></div>`;
  }).join('');
}

const action = (api,url,body,method='POST') => api(url,{method,body});

export function studyControls({api,toast,user,source='assignment',assignmentId,version=1,classes=[]}) {
  let started=false, dialog;
  const buttons=new Map();
  const keys=new Set(), modified=new Set(), sending=new Set();
  const queueKey='question-bookmark-pending:'+user.id;
  function loadQueue(){try{return JSON.parse(localStorage.getItem(queueKey)||'{}')||{};}catch{return {};}}
  function storePending(ref,next){
    try{const queue=loadQueue();if(next)queue[ref]=next;else delete queue[ref];localStorage.setItem(queueKey,JSON.stringify(queue));return true;}catch{return false;}
  }
  let pendingRead;
  async function flush(){
    for(const [ref,intent] of Object.entries(loadQueue())){
      if(intent.source!==source||intent.assignmentId!==assignmentId||sending.has(ref))continue;
      sending.add(ref);
      try{await action(api,'question-bookmarks',intent,intent.saved?'PUT':'DELETE');
        if(loadQueue()[ref]?.token===intent.token)storePending(ref,null);
        const k=intent.questionId+':'+String(intent.version);
        modified.add(k);if(intent.saved)keys.add(k);else keys.delete(k);
      }catch(e){
        if(!e.retryable&&e.status!==401){if(loadQueue()[ref]?.token===intent.token)storePending(ref,null);toast(e.message);}
      }finally{sending.delete(ref);sync();}
    }
  }
  const refFor=key=>JSON.stringify([source,assignmentId,key]);
  window.addEventListener('online',flush);

  function sync(){
    for(const [button,key] of buttons){
      if(!button.isConnected){buttons.delete(button);continue;}
      const queued=loadQueue()[refFor(key)],saved=queued?.saved??keys.has(key);
      button.textContent=queued?(saved?'已收藏 · 待同步':'已移除 · 待同步'):(saved?'✓ 已收藏':'☆ 收藏');
      button.setAttribute('aria-pressed',String(saved));
    }
  }
  function mount(host,q,discussion){
    if(!host)return;
    const key=String(q.id)+':'+String(q.version||version);
    if(!started){
      started=true;
      pendingRead=api('question-bookmarks?'+new URLSearchParams({source,assignmentId})).then(({items})=>{
        for(const item of items){
          const k=item.questionId+':'+item.version;
          if(!modified.has(k))keys.add(k);
        }
        sync();
      }).catch(()=>{started=false;});
      void flush();
    }
    const strip=document.createElement('span');
    strip.className='study-controls';
    strip.innerHTML='<button type="button" aria-pressed="false">☆ 收藏</button>';
    const button=strip.firstElementChild;host.append(strip);buttons.set(button,key);sync();
    const trigger=button;
    trigger.onclick=async()=>{
      trigger.disabled=true;
      await pendingRead;
      const ref=refFor(key),saved=!(loadQueue()[ref]?.saved??keys.has(key));
      const intent={source,assignmentId,questionId:q.id,version:q.version||version,saved,token:crypto.randomUUID()};
      if(!sending.has(ref))sending.add(ref);else{trigger.disabled=false;return;}
      try{
        await action(api,'question-bookmarks',intent,saved?'PUT':'DELETE');
        storePending(ref,null);modified.add(key);if(saved)keys.add(key);else keys.delete(key);
        toast(saved?'已加入错题本 · 我的书签':'已移除收藏');
      }catch(e){
        if(e.retryable&&storePending(ref,intent))toast('已暂存，联网后同步');
        else toast(e.message);
      }finally{sending.delete(ref);sync();trigger.disabled=false;}
    };
    if(discussion&&classes.length){
      const open=document.createElement('button');
      open.type='button';open.textContent='同伴思路';open.setAttribute('aria-haspopup','dialog');
      strip.append(open);
      open.onclick=()=>{dialog?.close();dialog=openDiscussion({api,user,assignmentId,version,item:q.id,classes,trigger:open});};
    }
  }
  return {mount,destroy:()=>{window.removeEventListener('online',flush);dialog?.close();}};
}

export function openDiscussion({api,user,assignmentId,item='',version,classes,trigger,teacher=false}) {
  const d=document.createElement('dialog');
  d.className='study-sheet';
  if(!teacher)d.dataset.studentDiscussion='';
  d.setAttribute('aria-label',teacher?'同伴思路记录':'同伴思路');
  d.innerHTML=`<header><div><strong>${teacher?'同伴思路记录':'同伴思路'}</strong>${item?`<small>第 ${esc(item)} 题</small>`:''}</div><button type="button" class="study-close" data-close aria-label="关闭同伴思路">×</button></header>
    <div class="study-filters"><label>讨论班级 <select>${classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>
    ${teacher?`<label>开放方式 <select data-policy><option value="attempt">保存首次作答后</option><option value="open">作业开放后</option><option value="review">成绩公布后复盘</option><option value="closed">关闭</option></select></label>
    <label>记录 <select data-status-filter><option value="all">全部帖子</option><option value="reported">举报待处理</option><option value="handled">已处理</option></select></label>`:''}</div>
    <button type="button" data-new hidden>讨论有更新，查看最新记录</button><p role="status"></p><div class="study-feed" aria-label="思路列表"></div>
    ${teacher?'':`<form><label>分享判断依据或第一步<textarea maxlength="400" rows="2" required placeholder="只对所选班级可见"></textarea></label><div class="study-compose-foot"><small role="status" data-review-note>正文经 DeepSeek 审核后对本班可见</small><button class="primary" type="submit">提交审核</button></div></form>`}`;
  document.body.append(d);d.showModal();
  const select=d.querySelector('select'), list=d.querySelector('.study-feed'), status=d.querySelector('[role=status]'), form=d.querySelector('form'), news=d.querySelector('[data-new]');
  const drafts=new Map(), startClass=classes[0]?.id;
  let classId=startClass, clientId=crypto.randomUUID(), stream=null, loaded=false, epoch=0, offset=0;
  const draftKey = cls => 'thought-draft:'+JSON.stringify([user.id,assignmentId,version,item,cls]);
  const remember=cls=>{if(!form)return;drafts.set(cls,form.elements[0].value);try{sessionStorage.setItem(draftKey(cls),form.elements[0].value);}catch{}};
  const restore=cls=>{if(!form)return;try{form.elements[0].value=drafts.get(cls)||sessionStorage.getItem(draftKey(cls))||'';}catch{}};
  const query=()=>new URLSearchParams({classId,version:version||'',offset,filter:d.querySelector('[data-status-filter]')?.value||'all'});
  const base='question-discussion/'+part(assignmentId)+(item?'/'+part(item):'');
  async function refresh(subscribe=false) {
    const rev=++epoch, url=base+'?'+query();
    if(form)form.hidden=!loaded;
    status.textContent='正在载入…';
    try{
      const data=await api(url);
      if(!d.open||rev!==epoch)return;
      loaded=true;status.textContent='';news.hidden=true;d.dataset.revision=data.revision||'start';
      if(form)form.hidden=false;
      if(teacher){
        const policy=d.querySelector('[data-policy]');policy.value=data.policy;
        for(const option of policy.options)option.disabled=!data.allowedPolicies.includes(option.value);
      }
      const filter=d.querySelector('[data-status-filter]')?.value||'all';
      const rows=data.items.filter(p=>filter==='all'||(filter==='reported'?p.reports?.length:p.moderation));
      const scroll=list.scrollTop;
      list.innerHTML=rows.map(postMarkup).join('')||'<p class="hint">这里暂时没有符合条件的思路。</p>';
      list.insertAdjacentHTML('beforeend',`<div class="study-pager">${offset?`<button type="button" data-page="-1">上一页</button>`:''}${data.more?`<button type="button" data-page="1">下一页</button>`:''}</div>`);
      list.scrollTop=scroll;
      for(const p of rows)bindRow(p);
      for(const page of list.querySelectorAll('[data-page]'))page.onclick=()=>{offset+=Number(page.dataset.page)*20;void refresh();};
      if(subscribe&&!teacher){
        stream?.close();
        stream=new EventSource('/api/homework/'+base+'/events?'+query());
        stream.addEventListener('update',event=>{if(JSON.parse(event.data).revision!==d.dataset.revision)news.hidden=false;});
        stream.addEventListener('unavailable',()=>{stream.close();list.replaceChildren();if(form)form.hidden=true;status.textContent='讨论暂不可用，请关闭后重试。';});
      }
    }catch(e){if(d.open&&rev===epoch){loaded=false;status.textContent=e.message;list.replaceChildren();if(form)form.hidden=true;}}
  }
  function postMarkup(p){
    return `<article data-post="${esc(p.id)}"><div class="study-post-meta"><strong>${esc(p.mine?'我':p.alias)}</strong><small>${teacher?`第 ${esc(p.item)} 题 · 版本 ${esc(p.version)} · `:''}${esc(nl(p.createdAt))}${p.editedAt?' · 已编辑':''}${p.state==='hidden'?' · 已隐藏':''}</small></div><p>${esc(p.body)}</p>
      <div class="study-actions">
        ${p.mine||teacher?`<small>有用 ${p.up}　没用 ${p.down}</small>`:`<button type="button" data-vote="1" aria-pressed="${p.myVote===1}">有用 ${p.up}</button><button type="button" data-vote="-1" aria-pressed="${p.myVote===-1}">没用 ${p.down}</button>`}
        ${teacher?`<button type="button" data-moderate>${p.state==='hidden'?'恢复':'隐藏'}</button>${p.reports?.length?`<button type="button" data-keep>保留帖子</button>`:''}`:
        `<details><summary>更多</summary><div>${p.mine?'<button type="button" data-edit>编辑</button><button type="button" data-withdraw>撤回</button>':'<button type="button" data-report>举报</button><button type="button" data-block>屏蔽此人</button>'}</div></details>`}
      </div>${p.reports?.length?`<small>举报理由：${esc(p.reports.join('、'))}</small>`:''}${p.moderation?`<small>处理于 ${esc(nl(p.moderation.at))} · ${esc(p.moderation.reason)}</small>`:''}</article>`;
  }
  const actionRequest=payload=>action(api,base+'?'+query(),payload);
  async function write(payload,control){
    if(control)control.disabled=true;
    try{await action(api,base+'?'+query(),payload);return true;}
    catch(e){status.textContent=e.message;return false;}
    finally{if(control)control.disabled=false;}
  }
  function bindRow(p){
    const row=list.querySelector('[data-post="'+CSS.escape(p.id)+'"]');
    function rowAction(selector,action,title,field,value='',extra={}){
      const trigger=row.querySelector(selector);
      if(!trigger)return;
      trigger.onclick=()=>{
        const prior=row.querySelector('.study-inline');prior?.remove();
        const editor=document.createElement('form');editor.className='study-inline';
        editor.innerHTML=`<strong>${esc(title)}</strong>${field?`<textarea required maxlength="${action==='edit'?400:160}" aria-label="${esc(title)}"></textarea>`:''}<p role="status"></p><footer><button type="button" data-cancel>取消</button><button type="submit" class="primary">${action==='edit'?'提交审核':'确认'}</button></footer>`;
        row.append(editor);
        const text=editor.querySelector('textarea'),msg=editor.querySelector('p'),send=editor.querySelector('[type=submit]');
        if(text){text.value=value;text.focus();}else editor.querySelector('[data-cancel]').focus();
        editor.querySelector('[data-cancel]').onclick=()=>{editor.remove();trigger.focus();};
        editor.onsubmit=async e=>{
          e.preventDefault();if(send.disabled)return;
          send.disabled=true;if(text)text.readOnly=true;
          msg.textContent=action==='edit'?'正在审核，原帖仍按原样显示…':'正在保存…';
          try{await actionRequest({action,postId:p.id,revision:p.revision,...extra,...(field?{[field]:text.value}:{})});await refresh();}
          catch(err){msg.textContent=err.message;}
          finally{send.disabled=false;if(text)text.readOnly=false;}
        };
      };
    }
    for(const vote of row.querySelectorAll('[data-vote]'))vote.onclick=async()=>{const value=Number(vote.dataset.vote);if(await write({action:'vote',postId:p.id,value:value===p.myVote?0:value},vote))await refresh();};
    rowAction('[data-edit]','edit','修改思路','body',p.body);
    rowAction('[data-withdraw]','withdraw','撤回这条思路？');
    rowAction('[data-block]','block','屏蔽这位同学的所有思路？');
    rowAction('[data-report]','report','举报原因','reason');
    for(const selector of ['[data-moderate]','[data-keep]'])
      rowAction(selector,'moderate','处理原因','reason','',{state:selector==='[data-keep]'||p.state==='hidden'?'visible':'hidden'});
  }
  d.querySelector('[data-close]').onclick=()=>d.close();
  select.onchange=()=>{remember(classId);classId=select.value;restore(classId);offset=0;loaded=false;clientId=crypto.randomUUID();stream?.close();list.replaceChildren();void refresh(true);};
  news.onclick=()=>{offset=0;list.scrollTop=0;void refresh();};
  if(teacher){
    const policy=d.querySelector('[data-policy]');
    policy.onchange=async()=>{if(await write({action:'policy',policy:policy.value},policy))await refresh();};
    d.querySelector('[data-status-filter]').onchange=()=>{offset=0;void refresh();};
  }
  if(form){
    restore(classId);form.hidden=true;
    form.elements[0].addEventListener('input',()=>{
      remember(classId);form.querySelector('[data-review-note]').textContent='正文经 DeepSeek 审核后对本班可见';
    });
    form.onsubmit=async e=>{
      e.preventDefault();
      const text=form.querySelector('textarea'),send=form.querySelector('[type=submit]'),note=form.querySelector('[data-review-note]');
      if(send.disabled)return;
      const from=classId,body=text.value,key=draftKey(from),receiptKey=key+':request';
      try{
        const previous=JSON.parse(sessionStorage.getItem(receiptKey)||'null');
        clientId=previous?.body===body?previous.clientId:crypto.randomUUID();
        sessionStorage.setItem(receiptKey,JSON.stringify({body,clientId}));
      }catch{}
      send.disabled=true;select.disabled=true;text.readOnly=true;
      note.textContent='DeepSeek 正在审核…';
      try{
        await actionRequest({action:'create',body,clientId});
        try{
          const pending=JSON.parse(sessionStorage.getItem(receiptKey)||'null');
          if(pending?.clientId===clientId&&sessionStorage.getItem(key)===body){
            sessionStorage.removeItem(key);sessionStorage.removeItem(receiptKey);
          }
        }catch{}
        if(from===classId&&d.open){form.reset();remember(classId);clientId=crypto.randomUUID();offset=0;list.scrollTop=0;note.textContent='审核通过，已发布到本班。';void refresh();}
      }catch(err){note.textContent=err.message;}
      finally{send.disabled=false;select.disabled=false;text.readOnly=false;}
    };
  }
  d.addEventListener('close',()=>{epoch++;remember(classId);stream?.close();d.remove();trigger?.focus({preventScroll:true});},{once:true});
  void refresh(true);
  return d;
}

export async function renderBookmarks({main,api,state,link,head,toast}) {
  const version=state.routeVersion;
  const [{items},{classes}]=await Promise.all([api('question-bookmarks'),
    state.classes?.length ? Promise.resolve({classes:state.classes}) : api('classes')]);
  if(version!==state.routeVersion)return;
  const courses=coursesFor(items.map(x=>({course:x.course})),classes||[]);
  const subjects=courses.length>1?['all',...courses]:courses;
  const active=selectedCourse(state.user.id,subjects,subjects[0]||'all');
  main.innerHTML=`<section class="paper study-bookmarks">${head('','我的错题集','',link('grades','成绩档案','text-button'))}
    ${mistakeNavigation(link,esc,{current:'bookmarks',subjects,subject:active})}
    <div class="study-filters"><label class="field"><span>查找书签</span><input type="search" placeholder="作业或知识点"></label>
    <button type="button" class="text-button" data-blocked>屏蔽管理</button></div><div data-book-list></div></section>`;
  bindMistakeNavigation(main);
  const filter=main.querySelector('input'), subject=main.querySelector('[data-mistake-course]'), list=main.querySelector('[data-book-list]');
  let selected=active;
  function draw(){
    const term=filter.value.trim().toLowerCase();
    const rows=items.filter(x=>(selected==='all'||x.course===selected)&&(!term||`${x.title} ${x.label} ${x.questionId}`.toLowerCase().includes(term)));
    list.innerHTML=rows.map(r=>`<article class="study-book-row"><details><summary><strong>${esc(r.title)} · ${r.source==='mock'?'题目':'第 '+esc(r.questionId)+' 题'}</strong><small>${esc(courseLabel(r.course))} · ${esc(r.label||'原题')} · ${nl(r.at)}</small></summary><div data-book-preview></div></details><button type="button" data-remove aria-label="移除此书签">移除</button></article>`).join('')||'<p>暂无符合条件的书签。</p>';
    [...list.children].filter(e=>e.matches('article')).forEach((row,i)=>{
      const r=rows[i], details=row.querySelector('details'), preview=row.querySelector('[data-book-preview]');
      details.ontoggle=async()=>{
        if(!details.open)return;
        preview.textContent='正在打开原题…';
        try{
          const {readable,item}=await api('question-bookmarks/'+part(r.id));
          if(!details.open||!row.isConnected)return;
          if(!readable){preview.innerHTML='<p>交卷或成绩公布后可在这里回看原题。</p>';return;}
          const imageMarkup=item.images.map(id=>`<a href="/api/homework/files/${part(id)}?bookmark=${part(r.id)}" target="_blank" rel="noopener"><img loading="lazy" alt="原题片段" src="/api/homework/files/${part(id)}?bookmark=${part(r.id)}"></a>`).join('');
          const resume=r.source==='mock'?'self-practice/result/'+part(r.assignmentId):`${item.format==='upload'?'submit':'mcq'}/${part(r.assignmentId)}?question=${part(r.questionId)}`;
          preview.innerHTML=`<p class="study-prompt">${esc(item.prompt)}</p>${imageMarkup}<ul>${item.options.filter(o=>o.text).map(o=>`<li>${esc(o.label)}　${esc(o.text)}</li>`).join('')}</ul>
            ${item.paperLocation?.fileId?`<a target="_blank" rel="noopener" href="/api/homework/files/${part(item.paperLocation.fileId)}?bookmark=${part(r.id)}#page=${Number(item.paperLocation.page)||1}">打开题纸第 ${Number(item.paperLocation.page)||1} 页</a>`:''}
            ${link(resume,'回到原作业或模考','secondary')}`;
        }catch{if(row.isConnected)preview.textContent='原题暂不可查看。可以保留或移除书签。';}
      };
      const remove=row.querySelector('[data-remove]');
      remove.onclick=async()=>{remove.disabled=true;try{await action(api,'question-bookmarks/'+part(r.id),{},'DELETE');items.splice(items.indexOf(r),1);draw();filter.focus();}catch(e){toast(e.message);remove.disabled=false;}};
    });
  }
  main.querySelector('[data-blocked]').onclick=async e=>{
    const trigger=e.currentTarget;
    const d=document.createElement('dialog');d.className='study-sheet';
    d.innerHTML='<header><strong>屏蔽管理</strong><button type="button" data-close>关闭</button></header><div class="study-feed"></div>';
    document.body.append(d);d.showModal();d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>{d.remove();trigger.focus();};
    const feed=d.querySelector('.study-feed');
    try{
      const {items}=await api('question-blocks');
      if(!items.length)feed.textContent='当前没有屏蔽的同学。';
      for(const row of items){
        const div=document.createElement('p');div.innerHTML=esc(row.alias)+'　<button type="button">解除屏蔽</button>';feed.append(div);
        div.querySelector('button').onclick=async()=>{try{await action(api,'question-blocks/'+part(row.id),{},'DELETE');div.remove();if(!feed.childElementCount)feed.textContent='当前没有屏蔽的同学。';}catch(e){toast(e.message);}};
      }
    }catch(e){feed.textContent=e.message;}
  };
  filter.oninput=draw;if(subject)subject.onchange=()=>{selected=subject.value;if(selected!=='all')rememberCourse(state.user.id,selected);draw();};draw();
}

export async function renderMockStatistics({main,api,state}){
  const version=state.version;
  const localDay=ms=>new Date(ms+8*3600000).toISOString().slice(0,10);
  const today=localDay(Date.now()),from=localDay(Date.now()-29*86400000);
  const memory=viewMemory('teacher-mock:'+state.user.id);
  const baseline=await api('mock-stats?'+new URLSearchParams({from,to:today}));
  if(version!==state.version)return;
  const initial=baseline;
  main.innerHTML=`<div class="study-stats"><form class="study-stat-filter"><div class="study-filters study-scope-row">
    <label>班级 <select name="classId"><option value="">全部任教班级</option>${initial.classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>
    <label data-course-field>学科 <select name="course"><option value="">全部学科</option><option value="micro">AP 微观</option><option value="macro">AP 宏观</option></select></label>
    <label>学生 <select name="studentId"><option value="">全部学生</option></select></label>
    <span class="mock-course-label" data-fixed-course hidden></span>
    </div><div class="mock-range-tools"><details class="study-filter-panel"><summary>日期和更多筛选</summary><div class="study-filters study-extra-filters"><label>起始日 <input name="from" type="date" value="${from}"></label><label>结束日 <input name="to" type="date" value="${today}"></label>
    <label>章节 <input name="topic" type="search" placeholder="例如 2.3"></label>
    <label>计时 <select name="timer"><option value="">全部</option><option value="countdown">倒计时</option><option value="countup">正计时</option></select></label>
    </div></details><button type="button" data-reset-mock>重置筛选</button></div></form>
    <p role="status"></p><div data-overview></div><div class="mock-mobile-views" role="group" aria-label="统计视图"><button type="button" data-mock-view="attempts" aria-pressed="true">学生走势</button><button type="button" data-mock-view="topics" aria-pressed="false">章节表现</button></div><div class="study-stat-grid" data-mobile-view="attempts"><section class="study-panel" data-attempts></section><aside class="study-panel" data-topics></aside></div></div>`;
  const root=main.querySelector('.study-stats'), form=root.querySelector('form'),status=root.querySelector('[role=status]');
  let serial=0,drawer,ascending=memory.get('ascending',false),zeroOnly=memory.get('zeroOnly',false);
  state.viewCleanup=()=>drawer?.destroy();
  const saved=memory.get('filters',{});
  for(const key of ['classId','course','from','to','topic','timer']){
    if(typeof saved[key]==='string')form.elements[key].value=saved[key];
  }
  const mobileView=memory.get('mobileView','attempts')==='topics'?'topics':'attempts';
  const grid=root.querySelector('.study-stat-grid');
  function chooseView(value){
    grid.dataset.mobileView=value;
    root.querySelectorAll('[data-mock-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mockView===value)));
    memory.set({mobileView:value});
  }
  chooseView(mobileView);
  root.querySelectorAll('[data-mock-view]').forEach(button=>button.onclick=()=>chooseView(button.dataset.mockView));
  function classScope(){
    const fixed=singleClassCourse(initial.classes.find(c=>c.id===form.elements.classId.value));
    form.elements.course.disabled=Boolean(fixed);
    form.querySelector('[data-course-field]').hidden=Boolean(fixed);
    const tag=root.querySelector('[data-fixed-course]');
    tag.hidden=!fixed;tag.dataset.course=fixed;tag.textContent=fixed?courseLabel(fixed):'';
  }
  classScope();
  function paint(data){
    const {stats:s}=data, selection=form.elements.studentId.value;
    drawer?.destroy();

    form.elements.studentId.innerHTML='<option value="">全部学生</option>'+data.students.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    form.elements.studentId.value=data.students.some(x=>x.id===selection)?selection:'';
    const percent=(a,b)=>b?Math.round(a/b*1000)/10+'%':'—', duration = n=>n===null||n===undefined?'—':Math.floor(n/60)+' 分 '+Math.round(n%60)+' 秒';
    const kpis=[['参与学生',s.participants+' / '+s.roster],['已交卷',s.attempts+' 次'],['题次正确率',percent(s.correct,s.points)],['整卷用时中位数',duration(s.median)]];
    root.querySelector('[data-overview]').innerHTML=`<div class="study-metrics">${kpis.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><p class="hint">已交卷 · ${s.correct} / ${s.points} 正确题次 · ${s.durationSamples} 份有效用时${s.excluded?' · '+s.excluded+' 题次缺少有效计分':''}</p>`;
    const list=root.querySelector('[data-attempts]'),scrollLeft=list.querySelector('.mock-table-scroll')?.scrollLeft||0,scrollTop=list.querySelector('.mock-table-scroll')?.scrollTop||0;
    const rows=data.rows.filter(row=>!zeroOnly||!row.count).sort((a,b)=>(ascending?a.count-b.count:b.count-a.count)||a.name.localeCompare(b.name,'zh-CN'));
    list.innerHTML=`<div class="mock-table-heading"><h2>交卷记录</h2><label><input type="checkbox" data-zero ${zeroOnly?'checked':''}>仅看 0 次</label></div><div class="mock-table-scroll" tabindex="0" role="region" aria-label="按学生汇总交卷记录"><table class="mock-roster"><thead><tr><th scope="col">学生</th><th scope="col" aria-sort="${ascending?'ascending':'descending'}"><button type="button" data-sort>已交次数 ${ascending?'↑':'↓'}</button></th><th scope="col">最近交卷</th><th scope="col">累计正确率</th><th scope="col">成绩趋势</th>${data.weeks.map(w=>`<th scope="col">${esc(w.slice(5))} 周</th>`).join('')}</tr></thead><tbody>${rows.map((row,index)=>`
      <tr data-roster-student="${esc(row.id)}"><th scope="row"><button type="button" class="mock-student-toggle" data-student="${esc(row.id)}" aria-expanded="false" aria-controls="mock-student-detail-${index}" aria-label="${esc(row.name)} · 个人模考表现"><span>${esc(row.name)}</span><span class="mock-row-chevron" aria-hidden="true"></span></button></th><td><strong>${row.count} 次</strong>${row.active?`<small>${row.active} 份进行中</small>`:''}</td><td>${row.last?esc(nl(row.last)):'—'}</td><td>${accuracyBadge(row.max?row.score/row.max*100:null)}</td><td>${mockTrendMarkup(row.trends)}</td>${data.weeks.map(w=>`<td>${row.weeks[w]||'—'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length?'<p class="mock-trend-note">成绩趋势按学科显示最近 8 次交卷，左旧右新。纵轴 0–100%，pp 为较上次变化的百分点。</p>':'<p class="hint">暂无匹配的学生。</p>'}`;
    list.querySelector('.mock-table-scroll').scrollLeft=scrollLeft;
    list.querySelector('.mock-table-scroll').scrollTop=scrollTop;
    const topics=root.querySelector('[data-topics]');
    topics.innerHTML='<h2>章节表现</h2>'+topicGrid(data.chapters,esc);
    list.querySelector('[data-sort]').onclick=()=>{ascending=!ascending;memory.set({ascending});paint(data);list.querySelector('[data-sort]').focus();};
    list.querySelector('[data-zero]').onchange=e=>{zeroOnly=e.currentTarget.checked;memory.set({zeroOnly});paint(data);list.querySelector('[data-zero]').focus();};
    drawer=createMockStudentDetail({table:list.querySelector('.mock-roster'),api,filters:()=>new URLSearchParams(new FormData(form))});
  }
  bindTopicGrid(root);
  async function load(){
    const n=++serial;status.textContent='正在读取记录…';
    const panels=[root.querySelector('[data-overview]'),root.querySelector('.study-stat-grid')];
    panels.forEach(el=>{el.inert=true;el.setAttribute('aria-busy','true');});
    try{
      const params=new URLSearchParams(new FormData(form));
      const data=await api('mock-stats?'+params);
      if(root.isConnected&&n===serial){paint(data);status.textContent='';panels.forEach(el=>{el.hidden=false;el.inert=false;});}
    }catch(e){
      if(root.isConnected&&n===serial){
        panels.forEach(el=>{el.hidden=true;});
        status.textContent=e.message+' ';
        const retry=document.createElement('button');
        retry.type='button';retry.className='tw-button';retry.textContent='重试';retry.onclick=load;status.append(retry);
      }
    }finally{
      if(n===serial)panels.forEach(el=>{el.inert=false;el.removeAttribute('aria-busy');});
    }
  }
  let previousTopic=form.elements.topic.value;
  function apply(){
    drawer?.close();
    const count=['topic','timer'].filter(k=>form.elements[k].value).length+
      Number(form.elements.from.value!==from)+Number(form.elements.to.value!==today);
    form.querySelector('summary').textContent=count?'日期和更多筛选 · '+count:'日期和更多筛选';
    memory.set({filters:Object.fromEntries(new FormData(form))});
    previousTopic=form.elements.topic.value;
    void load();
  }
  form.onchange=e=>{
    if(e.target.name==='classId'){form.elements.course.value='';classScope();}
    if(['classId','course'].includes(e.target.name))form.elements.studentId.value='';
    apply();
  };
  form.onsubmit=e=>{e.preventDefault();if(form.elements.topic.value!==previousTopic)apply();};
  form.querySelector('[data-reset-mock]').onclick=()=>{form.reset();form.elements.studentId.value='';classScope();apply();};
  paint(initial);
  if(Object.keys(saved).length){
    if(typeof saved.studentId==='string')form.elements.studentId.value=saved.studentId;
    apply();
  }
}

export function studyReportMarkup(report, {teacher=false}={}) {
  const {scope={},stats={},metrics={}}=report;
  const kind=scope.studentId?'学生报告':scope.assignmentId?'作业报告':'班级报告';
  const rows=scope.studentId
    ? [['已评分',metrics.published],['个人均值',stats.average==null?'—':stats.average+'%'],['待订正',metrics.corrections],['已提交',metrics.submitted]]
    : [['已评分人次',metrics.published],['已评分均值',stats.average==null?'—':stats.average+'%'],['已交 / 应交',metrics.due===undefined?'—':metrics.submitted+' / '+metrics.due],['覆盖作业',stats.assignments]];
  const facts=new Map((report.evidence||[]).map(f=>[f.id,f]));
  const observations=(report.observations||[]).map(o=>`<article><p>${esc(o.text)}</p>
    ${o.evidenceIds?.length?`<details><summary>查看依据</summary><ul>${o.evidenceIds.filter(id=>facts.has(id)).map(id=>`<li>${esc(facts.get(id).text)}</li>`).join('')}</ul></details>`:
    o.evidence?.length?`<small>${esc(o.evidence.join(' · '))}</small>`:''}</article>`).join('');
  const actions=(report.nextSteps||[]).map(a=>`<article><small>${esc(a.owner||(scope.studentId?'学生':'教师'))}${a.when?' · '+esc(a.when):''}</small><p>${esc(a.text)}</p></article>`).join('');
  const headline=report.headline||report.observations?.[0]?.text||'当前记录不足。';
  return `<p class="lo-ai-meta"><strong>${kind}</strong>${report.assignmentTitle?`<span>${esc(report.assignmentTitle)}</span>`:''}
    <span>${report.status==='draft'?(report.source==='ai'?'AI 草稿':'规则草稿'):report.status==='revoked'?'已撤回':'已发布'}</span>
    ${!report.templateVersion?'<span>历史报告</span>':''}<span>${esc(nl(report.publishedAt||report.createdAt))}</span></p>
    <section class="study-report-lead"><small>本次判断</small><h3>${esc(headline)}</h3></section>
    <div class="study-metrics">${rows.map(([label,value])=>`<div><span>${label}</span><strong>${esc(value ?? '—')}</strong></div>`).join('')}</div>
    <div class="study-report-detail"><section><h3>依据</h3>${observations||'<p>当前范围暂无可引用的观察。</p>'}
      ${teacher&&scope.assignmentId?`<a class="text-button" href="#work/mcq-analysis/${part(scope.assignmentId)}">打开作业诊断</a>`:''}</section>
      <section><h3>下一步</h3>${actions||'<p>先收集更多有效记录，再安排下一步。</p>'}
      ${!teacher&&scope.studentId?`<a class="text-button" href="#mistakes">打开错题本</a>`:''}</section></div>
    <p class="lo-note">${esc(report.limitations||'依据已发布的正式作业成绩。')}</p>
    ${teacher&&report.aiError?`<p class="lo-note">${esc(report.aiError)}</p>`:''}`;
}
