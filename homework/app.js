import {createMCQUI} from './mcq.js';
import {prepareForm,validateForm} from './form-feedback.js';
import {mountPDFReader} from "./pdf-reader.js";
import {createWorkspaceUI} from "./workspace-ui.js";
import {assignmentRecords,assignmentState,questionTotals} from "./learning-model.js";
import {createLearningUI} from "./learning-ui.js";
const embedded = document.documentElement.dataset.teacherWorkspace === "true";
let embeddedRoute="assignments", embeddedContext={},embeddedGeneration=0;
const $ = (q, root = document) => root.querySelector(q),
  $$ = (q, root = document) => [...root.querySelectorAll(q)],
  main = $(embedded ? "#homework-main" : "#main"),
  dock = $(embedded ? "#homework-dock" : "#dock");
const h = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name) =>
  `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${{ work: "M8 3H4v18h16V3h-4M8 2h8v5H8ZM8 11h8M8 15h5", clock: "M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", check: "m5 12 4 4L19 6", up: "M12 20V4m-6 6 6-6 6 6", rotate: "M20 7V3m0 4h-4M20 7a8 8 0 1 0 0 10", close: "m6 6 12 12M18 6 6 18", left: "M19 12H5m6-6-6 6 6 6", right: "M5 12h14m-6-6 6 6-6 6", external: "M6 18 18 6M6 6h12v12" }[name]}"/></svg>`;
const state = {
  user: null,
  csrf: "",
  classes: [],
  assignments: [],
  submissions: [],
  files: new Map(),
  routeVersion: 0,
  assignmentFilter: "all",
  assignmentSearch: "",
  assignmentCourse: "",
  viewCleanup:null,
};
let nav, pollTimer, noticeTimer, pdfModule;
const pdfTasks = new Map();
function clearPDFs(root) {
  for (const [el, task] of pdfTasks) {
    if (!root || root.contains(el) || !el.isConnected) {
      Promise.resolve(task.destroy()).catch(() => {});
      pdfTasks.delete(el);
    }
  }
}
const labels = {
  draft: "草稿",
  queued: "排队等待批阅",
  parsing: "正在整理答案",
  answer_review: "待确认评分点",
  ready: "已启用",
  grading: "正在批阅",
  needs_review: "待教师确认",
  published: "已出成绩",
  returned: "已退回",
};
const date = (value) =>
  value
    ? new Date(value).toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "不限时间";
const badge = (value) =>
  `<span class="badge" data-state="${h(value)}">${h(labels[value] || value)}</span>`;
const field = (label, name, value = "", type = "text", extra = "") =>
  `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${h(value)}" ${extra}></label>`;
const area = (label, name, value = "", extra = "") =>
  `<label class="field"><span>${label}</span><textarea name="${name}" ${extra}>${h(value)}</textarea></label>`;
function fitTitle(input) {
  if (!input?.isConnected) return;
  const top = main.scrollTop;
  input.style.height = "0px";
  input.style.height = (input.scrollHeight + 2) + "px";
  main.scrollTop = top;
}
function sizeTitleFields() {
  const fields = $$('textarea[name="title"]');
  if (!fields.length) return;
  const widths = new WeakMap();
  const observer = new ResizeObserver(entries => {
    for (const {target, contentRect} of entries) {
      if (widths.get(target) === contentRect.width) continue;
      widths.set(target, contentRect.width);
      fitTitle(target);
    }
  });
  const input = event => fitTitle(event.currentTarget);
  fields.forEach(el => { fitTitle(el); el.addEventListener("input", input); observer.observe(el); });
  const previous = state.viewCleanup;
  state.viewCleanup = () => { previous?.(); observer.disconnect(); fields.forEach(el => el.removeEventListener("input", input)); };
}
const head = (eyebrow, title, description = "", actions = "") =>
  `<div class="paper-head"><div><h1>${h(title)}</h1>${/^(ANSWER KEY|SUBMIT) \/ /.test(eyebrow) ? `<p class="context">${eyebrow.split(" / ").slice(1).join(" / ")}</p>` : ""}${description ? `<p>${h(description)}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
const empty = (title, copy, action = "") =>
  `<div class="empty"><h2>${h(title)}</h2><p>${h(copy)}</p>${action}</div>`;
const link = (route, label, kind = "secondary") =>
  `<a class="${kind}" href="#${embedded?"work/":""}${route}">${label}</a>`;
function toast(message) {
  $("#notice").textContent = message;
  $("#notice").classList.add("visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(
    () => $("#notice").classList.remove("visible"),
    4500,
  );
}
async function api(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch("/api/homework/" + path, {
      credentials: "same-origin",
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrf,
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const value = await response.json();
    if (!response.ok) {
      if (response.status === 401 && state.user) {
        state.user = null;
        showLogin();
      }
      const error=new Error(value.error || "暂时无法完成操作");error.status=response.status;throw error;
    }
    return value;
  } catch (error) {
    if (controller.signal.aborted) {const error=new Error("连接超时，请稍后重试。已保存的内容不会丢失。");error.retryable=true;throw error;}
    if(error instanceof TypeError){const networkError=new Error(navigator.onLine?"连接暂时中断，请重试。已上传文件仍保留。":"网络已断开，请联网后继续。当前草稿会暂存。");networkError.retryable=true;throw networkError;}
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
const post = (path, body = {}) => api(path, { method: "POST", body });
const put = (path, body) => api(path, { method: "PUT", body });
const formData = (form) => Object.fromEntries(new FormData(form));
function formHandler(form, fn, {announceSaved=true}={}) {
  prepareForm(form);
  let submitting=false;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(submitting||!validateForm(form))return;submitting=true;
    const error = $(".form-error", form);
    if (error) error.textContent = "";
    const buttons = [...form.elements].filter(el=>el.type==="submit"),disabledBefore=buttons.map(b=>b.disabled);
    buttons.forEach((b) => (b.disabled = true));
    try {
      await fn(formData(form));
      if(embedded&&announceSaved)document.dispatchEvent(new Event("homework:saved"));
    } catch (e) {
      if (error) {error.textContent=e.message;error.tabIndex=-1;error.scrollIntoView({block:"center"});error.focus({preventScroll:true});}
      else toast(e.message);
    } finally {
      submitting=false;buttons.forEach((b,i) => (b.disabled = disabledBefore[i]));
    }
  });
}
function click(selector, fn) {
  $(selector)?.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      await fn(e);
    } catch (e) {
      toast(e.message);
    } finally {
      button.disabled = false;
    }
  });
}
const go = (route) => {
  if(embedded)document.dispatchEvent(new Event("homework:saved"));
  const target=(embedded?"work/":"")+route;
  if (location.hash === "#" + target) {embeddedRoute=route;render();}
  else location.hash = target;
};
function installNavigation() {
  if(embedded)return;
  nav?.destroy();
  const teacher = state.user.role === "teacher";
  const items = teacher
    ? [
        { label: "作业", route: "assignments" },
        { label: "待复核", route: "reviews" },
        { label: "学情", route: "gradebook" },
      ]
    : [
        { label: "作业", route: "assignments" },
        { label: "成绩", route: "grades" },
        { label: "错题", route: "mistakes" },
      ];
  dock.hidden = false;
  dock.innerHTML = `<span class="work-nav-label">作业中心</span>`+items.map((item,i)=>`<a href="#${item.route}" class="work-nav-item" aria-current="${i===0?'page':'false'}"><span>${icon(['work','clock','check'][i])}</span>${item.label}</a>`).join('');
  nav={select(index){dock.querySelectorAll('a').forEach((a,i)=>a.setAttribute('aria-current',i===index?'page':'false'));},destroy(){dock.replaceChildren();}};
  $("#account").hidden = false;
  $("#account").innerHTML = h(state.user.name) + icon("external");
  $("#account").onclick = () => go("account");
  document.body.classList.remove("no-auth");
}
async function loginResult(value) {
  state.user = value.user;
  state.csrf = value.csrf;
  if(!embedded && value.user.role === "teacher" && value.teacherWorkspace){location.replace("/teacher/#work/"+(location.hash.slice(1)||"assignments"));return;}
  installNavigation();
  if (!location.hash || location.hash === "#login")
    location.hash = "assignments";
  await render();
}
function showLogin(register = false) {
  if(document.documentElement.dataset.unified==='true'){document.documentElement.style.visibility='hidden';location.replace('/?next='+encodeURIComponent(location.pathname+location.search+location.hash));return;}
  state.routeVersion++;
  clearPDFs();
  state.classes = [];
  state.assignments = [];
  state.submissions = [];
  state.files.clear();
  state.csrf = "";
  clearTimeout(pollTimer);
  nav?.destroy();
  nav = null;
  dock.hidden = true;
  $("#account").hidden = true;
  document.body.classList.add("no-auth");
  main.setAttribute("aria-busy", "false");
  main.innerHTML = `<section class="paper login"><div class="login-story"><img class="login-mark" src="/assets/mike-hub-mark.svg" alt=""><h1>每一份思考，<br>都有回应。</h1><p>交作业，看反馈。<br>让经济学的每一步推理，都更清楚。</p></div><form class="login-form stack"><h2>${register ? "加入你的班级" : "打开作业工作台"}</h2>${register ? field("姓名", "name", "", "text", 'required autocomplete="name" maxlength="80"') + field("班级邀请码", "invite", "", "text", 'required autocomplete="off"') : ""}${field("账号", "username", "", "text", 'required autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="40"')}${field("密码", "password", "", "password", `required autocomplete="${register ? "new-password" : "current-password"}" minlength="10" maxlength="200"`)}<p class="form-error" role="alert"></p><button type="submit" class="primary wide">${register ? "加入班级" : "登录"} </button><div class="login-bottom"><button type="button" id="switch-login">${register ? "已有账号，返回登录" : "学生首次使用 · 加入班级"}</button><span class="hint">${register ? "邀请码由教师提供" : "教师与学生使用同一登录入口"}</span></div></form></section>`;
  click("#switch-login", () => showLogin(!register));
  formHandler($(".login-form"), async (b) =>
    loginResult(await post(register ? "register" : "login", b)),
  );
}
async function refresh() {
  const [a, s, c] = await Promise.all([
    api("assignments"),
    api("submissions"),
    api("classes"),
  ]);
  state.assignments = a.assignments;
  state.submissions = s.submissions;
  state.classes = c.classes;
  if(embedded && embeddedContext.classId){const id="bookself-class:"+embeddedContext.classId;state.assignments=state.assignments.filter(a=>a.classIds.includes(id));state.submissions=state.submissions.filter(s=>state.assignments.some(a=>a.id===s.assignmentId));}
}
async function newAssignment() {
 if(!state.classes.length){go('account');toast('请先在 Bookself 教师端确认班级，作业工作台会自动同步');return;}
 const draftKey='hw-new:'+state.user.id+':'+(state.workspaceClassId||'all');let localDraft;try{localDraft=JSON.parse(sessionStorage.getItem(draftKey)||'null');}catch{}if(localDraft?.files?.length)await metadata(localDraft.files);
 main.innerHTML=`<section class="paper edit-paper">${head('','布置作业','',link('assignments','返回作业'))}<nav class="editor-steps" aria-label="发布步骤"><span aria-current="step">1 题纸与信息</span><span>2 参考答案与发布</span></nav><form id="new-assignment" class="compact-editor"><section class="editor-basics"><div class="editor-title-date">${area('作业名称','title','','required maxlength="120" rows="1" placeholder="例如：AD–AS 第三次练习"')}${field('截止时间（可选）','dueAt','','datetime-local')}</div><fieldset class="class-picker"><legend>布置给</legend><div class="class-chips">${state.classes.map(c=>`<label class="class-chip"><input type="checkbox" name="classId" value="${h(c.id)}" ${embeddedContext.classId&&c.id==='bookself-class:'+embeddedContext.classId?'checked':''}><span>${h(c.name)}</span></label>`).join('')}</div></fieldset><div class="editor-policy"><label class="check"><input type="checkbox" name="allowLate">允许补交</label><label class="check"><input type="checkbox" name="allowResubmit" checked>允许重交</label><input type="hidden" name="gradingMode" value="manual"><span>AI 给分 · 教师确认后发布</span></div></section><div class="editor-content"><section class="work-section" data-tone="blue"><header class="work-section-heading"><h2>学生题纸</h2><span>学生可见</span></header><div class="work-section-body"><div id="new-question-upload"></div></div></section><aside class="editor-notes work-section" data-tone="sage"><header class="work-section-heading"><h2>作答要求</h2></header><div class="work-section-body stack">${field('完成范围','readingScope','','text','maxlength="500" placeholder="例如：第 1–10 题"')}${area('提交要求','submissionGuide','','maxlength="1000" rows="3" placeholder="例如：按题号上传，照片保留完整题号。"')}<details><summary>补充说明或直接填写题目</summary>${area('题目补充说明','instructions','','maxlength="20000" rows="4"')}</details><p class="answer-privacy">参考答案 · 仅教师可见<br><span>下一步上传，支持 PDF、图片或文字</span></p></div></aside></div><div class="editor-footer"><label class="check"><input type="checkbox" name="studentPaperChecked" required>学生题纸与说明不含参考答案</label><p class="form-error" role="alert"></p><p class="hint" id="new-draft-status" role="status">继续后保存为账户草稿</p><button class="primary" type="submit">继续 · 设置参考答案</button></div></form></section>`;
 const form=$('#new-assignment');
 const cacheNew=()=>{fitTitle(form.elements.title);try{const data=formData(form);data.classIds=$$('input[name=classId]:checked',form).map(x=>x.value);data.allowResubmit=form.elements.allowResubmit.checked;data.allowLate=form.elements.allowLate.checked;sessionStorage.setItem(draftKey,JSON.stringify({...data,files:[...uploader.ids()]}));$('#new-draft-status').textContent='本机暂存 · 继续后保存到账户';}catch{$('#new-draft-status').textContent='本机无法暂存，请继续保存到账户后再离开。';}};
 const uploader=uploadWidget($('#new-question-upload'),'question',localDraft?.files||[],ids=>{const first=state.files.get(ids[0]);if(first&&!form.elements.title.value)form.elements.title.value=first.name.replace(/\.[^.]+$/,'').slice(0,120);cacheNew();});
 if(localDraft){for(const name of ['title','dueAt','readingScope','submissionGuide','instructions','gradingMode'])if(typeof localDraft[name]==='string')form.elements[name].value=localDraft[name];form.elements.allowResubmit.checked=localDraft.allowResubmit!==false;form.elements.allowLate.checked=!!localDraft.allowLate;$$('[name=classId]',form).forEach(el=>el.checked=localDraft.classIds?.includes(el.value));$('#new-draft-status').textContent='已恢复本机暂存，尚未发布。';}
 form.addEventListener('input',cacheNew);
 formHandler(form,async b=>{if(uploader.busy()||uploader.pending())throw Error('请完成题纸上传，或移除未完成的文件后继续。');b.classIds=$$('input[name=classId]:checked',form).map(x=>x.value);b.allowResubmit=form.elements.allowResubmit.checked;b.allowLate=form.elements.allowLate.checked;b.questionFiles=uploader.ids();if(b.dueAt)b.dueAt=new Date(b.dueAt).toISOString();const {assignment}=await post('assignments',b);sessionStorage.removeItem(draftKey);go('answer/'+assignment.id);});
}
async function metadata(ids) {
  await Promise.all(
    ids
      .filter((x) => !state.files.has(x))
      .map(async (id) => {
        const { file } = await api(`files/${id}?meta=1`);
        state.files.set(id, file);
      }),
  );
}
let previewGallery=null,previewVersion=0,previewTrigger=null;
function resetPreview(){
  previewVersion++;previewGallery?.destroy();previewGallery=null;
  const dialog=$("#preview");clearPDFs(dialog);dialog.classList.remove('attachment-dialog');
  const content=$('.preview-content',dialog);content.classList.remove('review-studio','attachment-preview');content.replaceChildren();
}
async function preview(id,ids=[id],trigger=null) {
  const files=[...new Set(ids)].map(id=>state.files.get(id)).filter(Boolean);
  if(!files.length)return;
  const dialog=$("#preview");resetPreview();const version=previewVersion;
  previewTrigger=trigger;trigger?.focus({preventScroll:true});dialog.classList.add('attachment-dialog');
  const content=$('.preview-content',dialog);content.classList.add('review-studio','attachment-preview');
  content.innerHTML='<p class="attachment-loading" role="status">正在打开文件预览…</p>';
  if(!dialog.open)dialog.showModal();
  try{
    const {mountReviewGallery}=await import('./review-gallery.js');
    if(version!==previewVersion||!dialog.open)return;
    content.innerHTML='<div class="rv-gallery"></div>';
    previewGallery=mountReviewGallery($('.rv-gallery',content),{files,initialFileId:id,label:'文件预览',fullscreen:false,storageKey:'attachment-preview:'+state.user.id+':'+files.map(f=>f.id).join(',')});
  }catch{if(version===previewVersion&&dialog.open)content.innerHTML='<p class="attachment-loading" role="alert">暂时无法打开预览。请关闭后重试，已上传文件仍保留。</p>';}
}
$("#preview").addEventListener("close", () => {
  if($("#preview").open)return;
  resetPreview();if(previewTrigger?.isConnected)previewTrigger.focus({preventScroll:true});previewTrigger=null;
});
$("#preview .close").onclick = () => $("#preview").close();
$("#preview").addEventListener("click", (e) => {
  if (e.target === $("#preview")) $("#preview").close();
});
function fileMarkup(ids, editable = false, compact = false) {
  return ids
    .map((id, i) => {
      const f = state.files.get(id);
      if (!f) return "";
      return `<div class="file"><button type="button" class="icon-btn" data-preview="${id}" aria-label="预览 ${h(f.name)}">${f.mime === "application/pdf" ? '<span class="file-thumb">PDF</span>' : `<img class="file-thumb" src="/api/homework/files/${id}" alt="" loading="lazy">`}</button><div><button type="button" class="text-button file-name" data-preview="${id}">${h(f.name)}</button><div class="hint">${f.pages} 页 · ${((f.originalSize||f.size) / 1024 / 1024).toFixed(1)} MB</div>${!editable?`<a class="download-link" href="/api/homework/files/${id}?download=1" download>下载原件</a>`:""}</div>${editable ? `${compact?'<details class="file-tools-menu"><summary>页面操作</summary>':''}<div class="file-tools">${f.mime.startsWith("image/") ? `<button type="button" class="icon-btn" data-rotate="${i}" aria-label="顺时针旋转 ${h(f.name)}">${icon("rotate")}${compact?"旋转":""}</button>` : ""}<button type="button" class="icon-btn" data-up="${i}" aria-label="上移 ${h(f.name)}" ${i === 0 ? "disabled" : ""}>${icon("up")}${compact?"上移":""}</button><button type="button" class="icon-btn" data-remove="${i}" aria-label="移除 ${h(f.name)}">${icon("close")}${compact?"移除":""}</button></div>${compact?"</details>":""}` : ""}</div>`;
    })
    .join("");
}
function bindPreviews(root = document) {
  $$("[data-preview]", root).forEach(
    (b) => (b.onclick = () => {
      const group=b.closest('.file-list');
      preview(b.dataset.preview,group?$$('[data-preview]',group).map(el=>el.dataset.preview):[b.dataset.preview],b);
    }),
  );
  renderPDFs(root);
}
const uploadQueues = new Map();
window.addEventListener("beforeunload",e=>{if([...uploadQueues.values()].some(q=>q.busy||q.pending.length)){e.preventDefault();e.returnValue="";}});
function uploadWidget(root, purpose, initial = [], onChange = () => {}) {
  const key=[state.user.id,location.hash,root.id,purpose].join(':');
  const queue=uploadQueues.get(key)||{ids:[...initial],pending:[],busy:false};
  const ids=queue.ids;
  root.dataset.purpose=purpose;
  root.innerHTML = `${purpose==='submission'?'<div class="capture-actions"><label class="capture-button"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h4l2-3h4l2 3h4v15H4Z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0"/></svg><span>拍照添加</span><input type="file" class="camera-input" accept="image/*" capture="environment" aria-label="拍照添加作业"></label></div>':''}<div class="file-list"></div>${['answer','question'].includes(purpose)?'<div class="answer-inline-preview"></div>':''}<label class="upload"><span class="upload-icon" aria-hidden="true">${icon('up')}</span><strong>${purpose==='submission'?'从相册或文件添加':'点击上传，或将文件拖到这里'}</strong><small class="muted">JPG / PNG / WebP / PDF · 单文件 20 MB</small><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple aria-label="上传${purpose==='answer'?'参考答案':purpose==='question'?'题目':'作业'}"></label><progress value="0" max="100" hidden aria-label="文件上传进度"></progress><p class="hint upload-status" role="status">最多 20 页，合计 50 MB。HEIC 请先转为 JPG。</p><div class="upload-recovery" hidden></div><div class="upload-undo" hidden></div>`;
  const list=$('.file-list',root),status=$('.upload-status',root),progress=$('progress',root),input=$('.upload input',root),camera=$('.camera-input',root),zone=$('.upload',root),recovery=$('.upload-recovery',root),undo=$('.upload-undo',root);
  const notify=()=>queue.notify?.();
  function draw(){
    root.classList.toggle('has-files',ids.length>0);
    list.innerHTML=fileMarkup(ids,true,true);
    if(['answer','question'].includes(purpose)){const f=state.files.get(ids[0]);$('.answer-inline-preview',root).innerHTML=!f?'':f.mime==='application/pdf'?`<div class="pdf-preview" data-pdf="${f.id}"></div>`:`<img class="original-preview" src="/api/homework/files/${f.id}" alt="${purpose==='question'?'学生题纸':'参考答案'}预览">`;}
    const pages=ids.reduce((n,id)=>n+(state.files.get(id)?.pages||0),0);
    status.textContent=queue.message||(pages?`已添加 ${pages} 页 · 最多 20 页`:'最多 20 页，合计 50 MB。HEIC 请先转为 JPG。');
    root.setAttribute('aria-busy',String(queue.busy));
    undo.hidden=!queue.removed;undo.innerHTML=queue.removed?'<span>已从本次作答移除</span><button type="button" class="text-button">撤销</button>':'';
    if(queue.removed){$('button',undo).disabled=queue.busy;$('button',undo).onclick=()=>{if(queue.busy)return;ids.splice(queue.removed.index,0,queue.removed.id);queue.removed=null;queue.message='';draw();notify();};}
    input.disabled=queue.busy;if(camera)camera.disabled=queue.busy;progress.hidden=!queue.busy;
    $$('.file-tools button',list).forEach(b=>{if(queue.busy)b.disabled=true;});
    recovery.hidden=!queue.pending.length||queue.busy;
    recovery.innerHTML=queue.pending.length?`<p>还有 ${queue.pending.length} 个文件未添加。已成功添加的页面会保留。</p>${queue.pending.map((item,i)=>`<div class="pending-upload"><span>${h(item.file.name)}${item.error?`<small>${h(item.error)}</small>`:''}</span><button type="button" class="text-button" data-dismiss="${i}" aria-label="不添加 ${h(item.file.name)}">不添加</button></div>`).join('')}<button type="button" class="secondary retry-upload">重试未完成文件</button><p class="hint">文件暂存在此页面，刷新前请重试或选择不添加。</p>`:'';
    $$('.pending-upload button',recovery).forEach(b=>b.onclick=()=>{if(queue.busy)return;queue.pending.splice(Number(b.dataset.dismiss),1);queue.message='';if(!queue.pending.length)uploadQueues.delete(key);draw();notify();});
    $('.retry-upload',recovery)?.addEventListener('click',()=>upload([]));
    bindPreviews(list);renderPDFs(root);
    $$('[data-rotate]',list).forEach(b=>b.onclick=async()=>{if(queue.busy)return;queue.busy=true;uploadQueues.set(key,queue);draw();notify();try{const i=Number(b.dataset.rotate),{file}=await post('files/'+ids[i]+'/rotate');state.files.set(file.id,file);ids[i]=file.id;}catch(e){toast(e.message);}finally{queue.busy=false;if(!queue.pending.length)uploadQueues.delete(key);queue.draw?.();notify();}});
    $$('[data-remove]',list).forEach(b=>b.onclick=()=>{if(queue.busy)return;const index=Number(b.dataset.remove);queue.removed={id:ids[index],index};ids.splice(index,1);queue.message='';draw();notify();});
    $$('[data-up]',list).forEach(b=>b.onclick=()=>{if(queue.busy)return;const i=Number(b.dataset.up);[ids[i-1],ids[i]]=[ids[i],ids[i-1]];draw();notify();});
  }
  async function upload(selected){
    if(queue.busy)return;
    if(selected.length)queue.removed=null;queue.pending.push(...selected.map(file=>({file})));if(!queue.pending.length)return;
    uploadQueues.set(key,queue);queue.busy=true;queue.draw?.();notify();
    try{
      while(queue.pending.length){
        const item=queue.pending[0],file=item.file;
        try{
          if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)&&!(!file.type&&/\.(jpe?g|png|webp|pdf)$/i.test(file.name)))throw Error('此格式暂不支持，请选择 JPG、PNG、WebP 或 PDF；HEIC 请先转为 JPG。');
          if(ids.length>=20)throw Error('最多添加 20 个附件，请先移除多余附件。');
          if(file.size>20*1024*1024)throw Error('超过 20 MB，请压缩后重新选择。');
          if(ids.reduce((n,x)=>n+(state.files.get(x)?.originalSize||state.files.get(x)?.size||0),0)+file.size>50*1024*1024)throw Error('附件合计超过 50 MB，请先移除多余附件。');
          queue.message='正在上传 '+file.name;queue.progress=0;queue.draw?.();
          const uploaded=item.uploaded||await new Promise((resolve,reject)=>{
            const xhr=new XMLHttpRequest();xhr.open('POST',`/api/homework/files?purpose=${purpose}&name=${encodeURIComponent(file.name)}`);xhr.setRequestHeader('X-CSRF-Token',state.csrf);
            xhr.upload.onprogress=e=>{if(e.lengthComputable){queue.progress=e.loaded/e.total*100;queue.progressChanged?.();}};
            xhr.onload=()=>{let result;try{result=JSON.parse(xhr.responseText);}catch{return reject(Error('上传响应不完整，请重试。'));}xhr.status>=200&&xhr.status<300?resolve(result.file):reject(Error(result.error||'上传失败，请重试。'));};
            xhr.onerror=()=>reject(Error('网络中断，请联网后重试。'));xhr.timeout=180000;xhr.ontimeout=()=>reject(Error('上传超时，请重试。'));xhr.send(file);
          });
          item.uploaded=uploaded;state.files.set(uploaded.id,uploaded);
          if(ids.reduce((n,x)=>n+(state.files.get(x)?.pages||0),0)+uploaded.pages>20)throw Error('附件合计超过 20 页，请先移除多余页面。');
          ids.push(uploaded.id);queue.pending.shift();queue.draw?.();notify();
        }catch(e){item.error=e.message;throw e;}
      }
      queue.message='';
    }catch(e){queue.message=e.message;}
    finally{queue.busy=false;if(!queue.pending.length)uploadQueues.delete(key);input.value='';if(camera)camera.value='';queue.draw?.();notify();}
  }
  queue.draw=()=>{draw();progress.value=queue.progress||0;};
  queue.progressChanged=()=>{progress.value=queue.progress||0;};queue.notify=()=>onChange(ids);
  input.onchange=()=>upload([...input.files]);if(camera)camera.onchange=()=>upload([...camera.files]);
  zone.ondragover=e=>{e.preventDefault();zone.classList.add('dragging');};zone.ondragleave=()=>zone.classList.remove('dragging');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('dragging');upload([...e.dataTransfer.files]);};
  queue.draw();
  return {ids:()=>ids,busy:()=>queue.busy,pending:()=>queue.pending.length,discardQueue:()=>{if(queue.busy)throw Error('请等待附件处理完成后再切换版本。');queue.pending=[];uploadQueues.delete(key);}};
}
function pointEditor(points=[]){return points.map(p=>`<div class="scoring-point" data-point><label class="field"><span>得分条件</span><input name="criterion" value="${h(p.criterion)}" maxlength="3000" required></label><label class="field"><span>分值</span><input name="pointMax" type="number" min="0.5" max="100" step="0.5" value="${h(p.maxPoints)}" required></label><button type="button" class="icon-btn remove-point" aria-label="移除此评分点">${icon('close')}</button></div>`).join('');}
function paperLocationFields(q={}){const files=(state.paperFileIds||[]).map(id=>state.files.get(id)).filter(f=>f?.mime==='application/pdf');return `<div class="field-row paper-location-fields"><label class="field"><span>学生题纸定位（可选）</span><select name="paperFileId"><option value="">不关联 PDF</option>${files.map(f=>`<option value="${h(f.id)}" ${q.paperFileId===f.id?'selected':''}>${h(f.name)}</option>`).join('')}</select></label>${field('所在页','paperPage',q.paperPage||'','number','min="1" step="1" placeholder="页码"')}</div>`;}
function refreshPaperSelectors(ids){state.paperFileIds=[...ids];const files=ids.map(id=>state.files.get(id)).filter(f=>f?.mime==='application/pdf');$$('[name=paperFileId]').forEach(select=>{const old=select.value;select.innerHTML='<option value="">不关联 PDF</option>'+files.map(f=>`<option value="${h(f.id)}">${h(f.name)}</option>`).join('');select.value=old;});const main=$('[name=mainQuestionFile]');if(main){const old=main.value;main.innerHTML=files.map(f=>`<option value="${h(f.id)}">${h(f.name)}</option>`).join('')||'<option value="">无 PDF 主题纸</option>';if(files.some(f=>f.id===old))main.value=old;}}
function studentPaperSettings(a){return `<details class="student-paper-settings"><summary>学生题纸与提交说明</summary><div class="stack"><span class="badge">学生可见</span><div id="question-upload"></div><label class="field"><span>主作业 PDF</span><select name="mainQuestionFile">${a.questionFiles.map(id=>state.files.get(id)).filter(f=>f?.mime==='application/pdf').map(f=>`<option value="${f.id}" ${a.mainQuestionFile===f.id?'selected':''}>${h(f.name)}</option>`).join('')}</select></label>${field('本次完成范围','readingScope',a.readingScope||'','text','maxlength="500"')}${area('提交要求','submissionGuide',a.submissionGuide||'','maxlength="1000"')}${area('学生可见的题目要求','instructions',a.instructions)}${a.published?area('本次题纸修改说明','paperChangeNote',a.paperChangeNote||'','maxlength="500" placeholder="说明改动的题号或页面；重新发布后学生可见。"'):''}</div></details>`;}
function rubricEditor(questions){return questions.map((q,i)=>`<details class="rubric-question" data-question ${questions.length===1?"open":""}><summary class="rubric-summary"><strong data-question-label>第 ${h(q.id)} 题</strong><span data-question-score>${q.maxPoints} 分</span><span class="rubric-edit-label">展开编辑</span></summary><div class="question-bar"><h3>第 ${i+1} 题</h3><label>题号<input name="qid" value="${h(q.id)}" required maxlength="30" aria-label="第 ${i+1} 题题号"></label><label>满分<input name="points" type="number" min="0.5" max="100" step="0.5" value="${h(q.maxPoints)}" required aria-label="第 ${i+1} 题满分"></label><button type="button" class="icon-btn remove-question" aria-label="删除第 ${i+1} 题">${icon('close')}</button></div><div class="stack"><label class="field"><span>题型</span><select name="questionType"><option value="short" ${q.type!=='choice'?'selected':''}>简答题</option><option value="choice" ${q.type==='choice'?'selected':''}>选择题</option></select></label>${area('题目（学生可见）','prompt',q.prompt)}${area('参考答案','answer',q.answer,'required')}<div class="choice-settings stack" ${q.type==='choice'?'':'hidden'}><div class="field-row"><label class="field"><span>选择方式</span><select name="choiceMode"><option value="single" ${q.choiceMode!=='multiple'?'selected':''}>单选</option><option value="multiple" ${q.choiceMode==='multiple'?'selected':''}>多选</option></select></label>${field('正确选项','correctOptions',(Array.isArray(q.correctOptions)?q.correctOptions.join(', '):q.correctOptions||''),'text','placeholder="例如 B 或 A, C"')}</div><p class="hint">选项完全一致得满分，多选漏选或错选不得分。</p></div>${area('评分说明与可接受的表达','criteria',q.criteria,'required')}<div class="short-settings" ${q.type==='choice'?'hidden':''}><h3 class="scoring-heading">逐点评分</h3><div class="point-list">${pointEditor(q.scoringPoints)}</div><button type="button" class="secondary add-point">添加评分点</button><p class="hint">各评分点分值之和须等于本题满分。未确认逐点评分的题目会进入教师复核。</p></div>${field('知识点（可选）','knowledge',q.knowledge||'')}${paperLocationFields(q)}${field('答案出处','sourcePages',q.sourcePages||'文字答案')}</div></details>`).join('');}
function readRubric(root=document){return $$('[data-question]',root).map(el=>({id:$('[name=qid]',el).value,paperFileId:$('[name=paperFileId]',el).value,paperPage:$('[name=paperPage]',el).value,prompt:$('[name=prompt]',el).value,answer:$('[name=answer]',el).value,criteria:$('[name=criteria]',el).value,maxPoints:Number($('[name=points]',el).value),sourcePages:$('[name=sourcePages]',el).value,type:$('[name=questionType]',el).value,choiceMode:$('[name=choiceMode]',el).value,correctOptions:$('[name=correctOptions]',el).value,knowledge:$('[name=knowledge]',el).value,scoringPoints:$$('[data-point]',el).map(p=>({criterion:$('[name=criterion]',p).value,maxPoints:Number($('[name=pointMax]',p).value)}))}));}

async function answerPage(id) {
  const renderId = state.routeVersion;
  const { assignment: a } = await api("assignments/" + id);
  await metadata([...a.answerFiles, ...a.questionFiles]);
  if (renderId !== state.routeVersion) return;
  state.paperFileIds=[...a.questionFiles];
  const questions = a.draftRubric || a.rubric || [];
  main.innerHTML = `<section class="paper answer-editor">${head("ANSWER KEY / " + h(a.course), "参考答案与评分", a.title, `<button class="secondary" type="button" id="back-to-paper">← 上一步：题纸</button><button class="secondary" type="button" id="save-answer-draft">保存草稿</button>`)}<p id="answer-save-status" class="answer-save-status" role="status">已保存的答案仅教师可见</p><nav class="editor-steps" aria-label="发布步骤"><span>1 题纸与信息</span><span aria-current="step">2 参考答案与发布</span></nav><div class="split"><details class="answer-source" ${questions.length&&innerWidth<900?"":"open"}><summary><strong>参考答案原件</strong>${badge(a.status)}<span>仅教师可见</span></summary><section><form id="source-form" class="stack"><div id="answer-upload"></div><details ${a.answerFiles.length ? "" : "open"}><summary>粘贴或编辑文字答案</summary>${area("答案内容", "answerText", a.answerText, 'placeholder="可直接粘贴答案、题号与评分说明…"')}</details>${studentPaperSettings(a)}<p class="form-error" role="alert"></p><div class="actions"><button type="submit" class="secondary">保存原始答案</button><button type="button" id="parse-answer" class="primary">AI 整理评分点</button></div><p class="hint">上传的答案保留原件。参考答案仅教师可见。整理后核对评分点，再发布作业。</p></form>${a.answerFiles.length ? `<button class="link" data-preview="${a.answerFiles[0]}">打开原始答案</button>` : ""}${["queued", "parsing"].includes(a.status) ? '<div class="status-line" id="parse-status">正在后台整理答案。你可以离开页面，任务会继续保存。</div>' : ""}${a.error ? `<p class="error">${h(a.error)}</p>` : ""}</section></details><section><div class="section-head"><h2>核对评分点</h2><span class="hint">${a.version ? "当前 v" + a.version : "待确认"}</span></div><div class="rubric-tools"><span id="rubric-summary" role="status"></span><button type="button" class="text-button" id="toggle-questions">展开全部</button></div><form id="rubric-form"><div id="questions">${questions.length ? rubricEditor(questions) : empty("先整理，再确认", "使用左侧答案生成评分点，也可以手动添加。")}</div><button type="button" id="add-question" class="secondary">添加题目</button><hr class="rule"><label class="check"><input type="checkbox" name="confirmed" required>我已核对每题答案、满分和评分点</label><p class="hint">确认后，学生即可提交。参考答案保持私密，发布成绩只展示得分和反馈。修改评分标准会生成新版本。</p><p class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="secondary" id="preview-student-paper">预览学生题纸</button><label class="check"><input type="checkbox" name="paperChecked" required>我已检查学生题纸、完成范围和题号定位</label><button type="submit" class="primary wide">确认答案并发布作业</button></div></form></section></div></section>`;
  let sourceDirty=false,sourceEdit=0,sourceSaving=null;
  const draftStatus=$('#answer-save-status'),sourceForm=$('#source-form'),rubricForm=$('#rubric-form');
  const isCurrent=()=>renderId===state.routeVersion&&sourceForm.isConnected;
  const markDirty=()=>{sourceDirty=true;sourceEdit++;draftStatus.textContent=sourceSaving?'正在保存，包含最新修改…':'有未保存的修改';draftStatus.dataset.state='pending';document.dispatchEvent(new Event('homework:dirty'));};
  $("#source-form").addEventListener("input", markDirty);
  $("#rubric-form").addEventListener("input", markDirty);
  const au = uploadWidget(
      $("#answer-upload"),
      "answer",
      a.answerFiles,
      markDirty,
    ),
    qu = uploadWidget(
      $("#question-upload"),
      "question",
      a.questionFiles,
      ids=>{markDirty();refreshPaperSelectors(ids);},
    );
  $('#preview-student-paper').onclick=()=>{resetPreview();const ids=qu.ids(),selected=$('[name=mainQuestionFile]').value,first=state.files.get(selected)||ids.map(x=>state.files.get(x)).find(f=>f?.mime==='application/pdf'),form=$('#source-form'),dialog=$('#preview');$('.preview-content',dialog).innerHTML=`<h2>${h(a.title)}</h2><p class="instructions">${h(form.elements.readingScope.value)}</p><p class="instructions">${h(form.elements.submissionGuide.value)}</p><p class="instructions">${h(form.elements.instructions.value)}</p>${first?`<div class="pdf-preview" data-pdf="${first.id}" data-title="${h(a.title)}"></div>`:fileMarkup(ids)}`;dialog.showModal();bindPreviews(dialog);};
  let revision = a.sourceRevision || 0;
  const saveSource = () => {
    if(sourceSaving)return sourceSaving;
    if(au.busy()||qu.busy()||au.pending()||qu.pending())return Promise.reject(Error("请等待文件上传完成"));
    if(!sourceDirty)return Promise.resolve({assignment:a});
    const controls=$$('#back-to-paper,#parse-answer,#save-answer-draft,#source-form button[type=submit],#rubric-form button[type=submit]');
    const previous=controls.map(b=>b.disabled);controls.forEach(b=>b.disabled=true);
    draftStatus.textContent='正在保存…';draftStatus.dataset.state='pending';
    sourceSaving=(async()=>{
      let result={assignment:a};
      try{
        // A slow response only acknowledges its own snapshot. Drain newer edits in order.
        while(sourceDirty){
          if(au.busy()||qu.busy()||au.pending()||qu.pending())throw Error('请等待文件上传完成，再保存草稿');
          const edit=sourceEdit,b=formData(sourceForm);
          result=await put(`assignments/${id}/source`,{...b,answerFiles:[...au.ids()],questionFiles:[...qu.ids()],sourceRevision:revision,draftRubric:readRubric(rubricForm)});
          revision=result.assignment.sourceRevision;sourceDirty=sourceEdit!==edit;
        }
        draftStatus.textContent='草稿已保存 · 发布后生效';draftStatus.dataset.state='saved';
        if(isCurrent())document.dispatchEvent(new Event('homework:saved'));return result;
      }catch(e){draftStatus.textContent='未保存成功 · 修改仍在页面，请重试';draftStatus.dataset.state='error';throw e;}
      finally{sourceSaving=null;controls.forEach((b,i)=>b.disabled=previous[i]);}
    })();
    return sourceSaving;
  };
  // Parsing/publishing freezes controls only after saving, so its snapshot cannot change mid-request.
  const withLockedEditor=async fn=>{
    const controls=$$('input,textarea,select,button',main),previous=controls.map(b=>b.disabled);
    controls.forEach(b=>b.disabled=true);
    try{return await fn();}finally{controls.forEach((b,i)=>b.disabled=previous[i]);}
  };
  click("#back-to-paper",async()=>{await saveSource();if(isCurrent())go("edit/"+id);});
  click('#save-answer-draft',async()=>{await saveSource();if(isCurrent())toast('答案草稿已保存');});
  formHandler($("#source-form"),async()=>{await saveSource();if(isCurrent())toast('原始答案已保存');},{announceSaved:false});
  click("#parse-answer",async()=>{
    await saveSource();if(!isCurrent())return;
    await withLockedEditor(async()=>{await post(`assignments/${id}/parse`);await render();toast('已加入后台处理队列');});
  });
  function updateRubricSummary(){
    const questions=$$('[data-question]');
    for(const q of questions){$('[data-question-label]',q).textContent='第 '+$('[name=qid]',q).value+' 题';$('[data-question-score]',q).textContent=($('[name=points]',q).value||0)+' 分';}
    $('#rubric-summary').textContent=questions.length+' 题 · 共 '+questions.reduce((n,q)=>n+Number($('[name=points]',q).value||0),0)+' 分';
    $('#toggle-questions').textContent=questions.length&&questions.every(q=>q.open)?'收起全部':'展开全部';
  }
  $('#toggle-questions').onclick=()=>{const questions=$$('[data-question]'),open=!questions.every(q=>q.open);questions.forEach(q=>q.open=open);updateRubricSummary();};
  $('#rubric-form').addEventListener('input',updateRubricSummary);
  const bindRemove = () => {
    updateRubricSummary();
    $$('[data-question]').forEach(q=>q.ontoggle=updateRubricSummary);
    $$(".remove-question").forEach(b=>b.onclick=()=>{markDirty();b.closest('[data-question]').remove();updateRubricSummary();});
    $$('[data-question]').forEach(el=>{
      const type=$('[name=questionType]',el);
      const update=()=>{const choice=type.value==='choice';$('.choice-settings',el).hidden=!choice;$('.short-settings',el).hidden=choice;$$('.short-settings input',el).forEach(x=>x.disabled=choice);};
      type.onchange=update;update();
      $('.add-point',el).onclick=()=>{$('.point-list',el).insertAdjacentHTML('beforeend',pointEditor([{criterion:'',maxPoints:1}]));markDirty();bindRemove();};
    });
    $$('.remove-point').forEach(b=>b.onclick=()=>{markDirty();b.closest('[data-point]').remove();});
  };
  bindRemove();
  click("#add-question", () => {
    const q = readRubric();
    q.push({
      id: String(q.length + 1),
      prompt: "",
      answer: "",
      criteria: "",
      maxPoints: 1,
      sourcePages: "文字答案",
    });
    $("#questions").innerHTML = rubricEditor(q);
    markDirty();bindRemove();
    const last=$$("[data-question]").at(-1);last.open=true;$("[name=qid]",last).focus();
  });
  formHandler($("#rubric-form"), async () => {
    if (au.busy() || qu.busy() || au.pending() || qu.pending()) throw new Error("请等待上传完成");
    if(!readRubric().length)throw new Error("请至少确认一道题");
    await saveSource();if(!isCurrent())return;
    const questions=readRubric(rubricForm);
    await withLockedEditor(async()=>{
      await post(`assignments/${id}/confirm`,{questions,sourceRevision:revision});
      toast("评分标准已确认，学生现在可以提交");go("assignments");
    });
  });
  bindPreviews();
  if (["queued", "parsing"].includes(a.status)) {
    const originalForm = $("#source-form");
    async function pollAnswer() {
      try {
        if (!originalForm.isConnected) return;
        const next = (await api("assignments/" + id)).assignment;
        if (!["queued", "parsing"].includes(next.status)) {
          if (!sourceDirty && !au.busy() && !qu.busy()) render(false);
          else {
            const el = $("#parse-status");
            if (el)
              el.textContent =
                "整理已完成。你又修改了答案，请保存后重新整理，或刷新查看已完成结果。";
          }
        } else {
          const el = $("#parse-status");
          if (el)
            el.textContent =
              next.status === "parsing"
                ? "正在核对题号与评分点…"
                : "已排队，批改服务准备好后会开始处理。";
          pollTimer = setTimeout(pollAnswer, 6000);
        }
      } catch {
        pollTimer = setTimeout(pollAnswer, 10000);
      }
    }
    pollTimer = setTimeout(pollAnswer, 6000);
  }
}
function paperSurface(a,location=null){
 const ids=a.questionFiles||a.paper?.questionFiles||[],files=ids.map(x=>state.files.get(x)).filter(Boolean),pdfs=files.filter(f=>f.mime==='application/pdf'),mainFile=pdfs.find(f=>f.id===location?.fileId)||pdfs.find(f=>f.id===a.mainQuestionFile)||pdfs[0];
 return `<div class="paper-reader-surface">${pdfs.length>1?`<label class="paper-file-switch"><span>当前题纸</span><select aria-label="选择题纸文件" data-paper-select>${pdfs.map(f=>`<option value="${h(f.id)}" ${f.id===mainFile.id?'selected':''}>${h(f.name)}</option>`).join('')}</select></label>`:''}<div class="paper-brief-line">${a.readingScope?`<p class="paper-scope"><strong>本次完成</strong> ${h(a.readingScope)}</p>`:''}${a.submissionGuide||a.paper?.changeNote?`<details class="paper-notes"><summary>${a.paper?.changeNote?'题纸已更新 · 查看说明':'作答要求'}</summary>${a.paper?.changeNote?`<p>题纸更新：${h(a.paper.changeNote)}</p>`:''}${a.submissionGuide?`<p>${h(a.submissionGuide)}</p>`:''}</details>`:''}</div>${mainFile?`<div class="pdf-preview" data-pdf="${mainFile.id}" data-title="${h(a.title)}" ${location?.page?`data-page="${location.page}"`:''}></div>`:''}${(a.questions||[]).some(q=>q.paperLocation)?`<nav class="paper-question-nav" aria-label="按题号定位">${a.questions.filter(q=>q.paperLocation).map(q=>`<button type="button" class="secondary" data-paper-file="${q.paperLocation.fileId}" data-paper-page="${q.paperLocation.page}">第 ${h(q.id)} 题 · P${q.paperLocation.page}</button>`).join('')}</nav>`:''}<details class="assignment-brief" ${mainFile?'':'open'}><summary>${mainFile?'补充说明与题目':'查看题目与要求'}</summary><p class="instructions">${h(a.instructions||'请按题号完成作答。')}</p>${(a.questions||[]).map(q=>`<div class="published-question"><h3>第 ${h(q.id)} 题 <span class="hint">${q.maxPoints} 分</span></h3><p>${h(q.prompt)}</p></div>`).join('')}<div class="file-list">${fileMarkup(files.filter(f=>f.id!==mainFile?.id&&(pdfs.length<2||f.mime!=='application/pdf')).map(f=>f.id))}</div><a class="secondary" href="${a.originalSubmissionId?'/api/homework/submissions/'+a.originalSubmissionId+'/paper-pdf':'/api/homework/assignments/'+a.id+'/pdf'}" download>保存题目 PDF</a></details></div>`;
}
function bindPaperSurface(root=main){$$('[data-paper-select]',root).forEach(select=>select.onchange=()=>{const surface=select.closest('.paper-reader-surface'),reader=surface.querySelector('.pdf-preview');pdfTasks.get(reader)?.destroy();pdfTasks.delete(reader);reader.replaceChildren();delete reader.dataset.loading;delete reader.dataset.page;reader.dataset.pdf=select.value;renderPDFs(surface);});$$('[data-paper-file]',root).forEach(button=>button.onclick=()=>{const surface=button.closest('.paper-reader-surface'),reader=surface.querySelector('.pdf-preview'),fileId=button.dataset.paperFile,page=Number(button.dataset.paperPage);const select=surface.querySelector('[data-paper-select]');if(select)select.value=fileId;if(reader?.dataset.pdf===fileId)pdfTasks.get(reader)?.gotoPage(page);else if(reader){const old=pdfTasks.get(reader);old?.destroy();pdfTasks.delete(reader);reader.replaceChildren();delete reader.dataset.loading;reader.dataset.pdf=fileId;reader.dataset.page=page;renderPDFs(surface);}reader?.scrollIntoView({block:'nearest'});});}
async function originalPaperPage(submissionId,questionId){
 const version=state.routeVersion,{submission:s}=await api('submissions/'+submissionId),paper=s.paper||s.assignment.paper,a={...s.assignment,...paper,paper,originalSubmissionId:s.id,questions:(s.questions||[]).map(q=>({...q,paperLocation:paper?.locations?.find(p=>p.id===q.id)}))};
 const selected=a.questions.find(q=>q.id===questionId),images=selected?.questionImages||[];
 await metadata(images.length?images:a.questionFiles||[]);if(version!==state.routeVersion)return;
 if(images.length){
  const {mountReviewGallery}=await import('./review-gallery.js');if(version!==state.routeVersion)return;
  const score=s.publishedGrade?.questions?.find(q=>q.id===questionId),wrong=score&&score.score<score.maxPoints;
  main.innerHTML=`<section class="paper original-paper">${head('',`第 ${h(questionId)} 题 · 原题`,a.title,link('result/'+s.id,'返回作业反馈'))}<div class="original-question-actions"><span>本次提交的题面 · ${images.length} 个片段</span>${wrong?link('mistakes/'+s.assignmentId+'/'+encodeURIComponent(questionId),'对照原题订正','primary'):''}</div><div class="review-studio original-question-gallery"><div class="rv-gallery"></div></div><details><summary>题干文字</summary><p class="instructions">${h(selected.prompt)}</p></details></section>`;
  const gallery=mountReviewGallery($('.original-question-gallery .rv-gallery'),{files:images.map(id=>state.files.get(id)).filter(Boolean),label:'第 '+questionId+' 题原件',fullscreen:false,fitContent:true,storageKey:'original-question:'+state.user.id+':'+s.id+':'+questionId});state.viewCleanup=()=>gallery.destroy();return;
 }
 const location=paper?.locations?.find(q=>q.id===questionId);main.innerHTML=`<section class="paper original-paper">${head('',a.title,`本次提交对应题纸 · v${paper?.version||s.version}`,link('result/'+s.id,'返回作业反馈'))}${paperSurface(a,location)}</section>`;bindPreviews();bindPaperSurface();
}
async function submitPage(id) {
  if(["mcq","mixed"].includes(state.assignments.find(a=>a.id===id)?.format)){go("mcq/"+id);return;}
 const version=state.routeVersion,{assignment:a}=await api('assignments/'+id);
 const all=state.submissions.filter(s=>s.assignmentId===id),draft=assignmentState(a,all).draft,record=assignmentRecords(all,[a])[0],latest=record?.latest;
 const cacheKey=`hw-work:${state.user.id}:${id}`;let cached;
 try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null');}catch{}
 if(cached&&all.some(s=>s.status!=='draft'&&s.clientId===cached.clientId))cached=null;
 const useCache=cached&&(!draft||cached.updatedAt>Date.parse(draft.updatedAt));
 let clientId=useCache?cached.clientId:draft?.clientId||crypto.randomUUID();
 let initialFiles=useCache?cached.files:draft?.files||latest?.files||[],initialText=useCache?cached.text:draft?.text??latest?.text??'';
 await metadata([...a.questionFiles,...initialFiles]);if(version!==state.routeVersion)return;
 const expired=a.dueAt&&Date.parse(a.dueAt)<Date.now()&&!a.allowLate&&latest?.status!=='returned';
 const locked=expired||(a.allowResubmit===false&&latest&&latest.status!=='returned');
 const hasPDF=a.questionFiles.some(id=>state.files.get(id)?.mime==='application/pdf');
 const max=(a.questions||[]).reduce((n,q)=>n+q.maxPoints,0);
 main.innerHTML=`<section class="paper submit-paper ${hasPDF?'pdf-submission':''}" data-mobile-pane="reading">${head('',a.title,`${a.dueAt?'截止 '+date(a.dueAt):'不限截止时间'}${max?' · 满分 '+max+' 分':''}`,link('assignments','返回作业'))}${hasPDF?'<div class="paper-view-switch" role="group" aria-label="看题与作答"><button type="button" data-paper-pane="reading" aria-pressed="true">题目</button><button type="button" data-paper-pane="answer" aria-pressed="false">上传作答</button></div>':''}<div class="submission-layout"><section class="assignment-reading">${paperSurface(a)}${latest?`<div class="previous-submission"><p>上次提交 ${date(latest.submittedAt)}</p>${badge(latest.status)}${link('result/'+latest.id,'查看上次提交')}${record.grade?`<p class="hint">已有成绩 ${record.grade.total}/${record.grade.maxPoints}，新结果出来前会保留。</p>`:''}</div>`:''}</section>${hasPDF?'<div class="reader-divider" role="separator" tabindex="0" aria-label="调整题纸与作答宽度" aria-orientation="vertical" aria-valuemin="45" aria-valuemax="72" aria-valuenow="62"></div>':''}<section class="submission-compose"><div class="section-head"><h2>我的作答</h2><span class="hint">照片 / PDF / 文字</span></div>${locked?`<p class="status-line" role="status">${expired?'已过截止时间。你可以继续保存草稿，请联系老师开放补交。':'老师已关闭重新提交。原作答和成绩仍可查看。'}</p>`:''}<form id="submit-form" class="stack"><div id="student-upload"></div><details id="typed-answer" ${initialText?'open':''}><summary>补充文字答案</summary>${area('按题号填写答案','answer',initialText,'maxlength="40000" placeholder="例如：第 1 题… 第 2 题…"')}</details><div class="submit-check"><p id="page-summary" aria-live="polite"></p><label class="check"><input type="checkbox" name="submissionChecked" required>我已确认题号完整、文字清楚、没有漏页</label></div><p class="draft-feedback" id="draft-status" role="status">${useCache?'已恢复这台设备上未完成的草稿。':draft?'已恢复账户草稿。':latest?'已带入上次作答。请保留正确页面，只替换或补充需要修改的部分。':'自动保存草稿；点击提交后老师才会收到。'}</p><p class="form-error" role="alert"></p><div class="actions submit-actions"><button type="button" id="save-draft" class="secondary">保存草稿</button><button type="submit" class="primary desktop-submit" ${locked?'disabled':''}>${latest?'提交新版本':'提交作业'}</button></div><p class="hint">提交后可以关闭页面，批阅结果会自动保留。</p></form></section></div><div class="mobile-submit-bar"><div><p id="mobile-page-summary"></p><p id="mobile-save-status" class="hint"></p></div>${hasPDF?'<button type="button" data-open-answer class="primary">上传作答</button>':''}<button type="submit" form="submit-form" class="primary" ${locked?'disabled':''}>${latest?'提交新版本':'提交作业'}</button></div></section>`;
 const form=$('#submit-form'),textArea=$('[name=answer]',form),status=$('#draft-status'),pageSummary=$('#page-summary'),mobileSummary=$('#mobile-page-summary'),mobileStatus=$('#mobile-save-status');
 let submitted=false,autosave,dirty=Boolean(useCache||(!draft&&latest)),writing=Promise.resolve(),localSaved=true,revision=0;
 const widget=uploadWidget($('#student-upload'),'submission',initialFiles,changed);
 const snapshot=()=>({assignmentId:id,paperVersion:a.paper?.version||a.version,text:textArea.value,files:[...widget.ids()],clientId});
 function cache(){try{sessionStorage.setItem(cacheKey,JSON.stringify({...snapshot(),updatedAt:Date.now()}));localSaved=true;}catch{localSaved=false;}}
 function setStatus(message){status.textContent=message;mobileStatus.textContent=message;}
 function summary(){const pages=widget.ids().reduce((n,x)=>n+(state.files.get(x)?.pages||0),0);pageSummary.textContent=pages?`已添加 ${pages} 页${textArea.value.trim()?'，另有文字答案':''}`:textArea.value.trim()?'已填写文字答案':'待添加作答';mobileSummary.textContent=pageSummary.textContent+(widget.pending()?` · ${widget.pending()} 个待重试`:'');}
 function changed(){dirty=true;revision++;form.elements.submissionChecked.checked=false;cache();summary();setStatus(widget.busy()?'正在添加附件…':widget.pending()?'部分文件未添加，请重试或选择不添加。':'有更改，正在保存草稿…');clearTimeout(autosave);if(!widget.busy())autosave=setTimeout(()=>{if(!submitted)save(true).catch(e=>{setStatus(e.message+(localSaved?' 当前内容已在此页面暂存。':' 请暂时不要关闭页面。'));if(e.retryable&&form.isConnected)autosave=setTimeout(online,3000);});},1000);}
 function save(isDraft){
  if(widget.busy())return Promise.reject(Error('附件仍在上传，请稍等。已经添加的页面会保留。'));
  if(!isDraft&&widget.pending())return Promise.reject(Error('还有文件未添加。请重试，或选择不添加后再提交。'));
  const body={...snapshot(),draft:isDraft},captured=revision;
  writing=writing.catch(()=>{}).then(()=>post('submissions',body)).then(value=>{if(captured===revision)dirty=false;if(form.isConnected&&isDraft&&captured===revision)setStatus(widget.pending()?'已添加的作答已保存，仍有文件待重试。':'草稿已保存 · 尚未提交 · '+date(new Date()));return value;});return writing;
 }
 function beforeUnload(e){cache();if(widget.busy()||widget.pending()||dirty){e.preventDefault();e.returnValue='';}}
 const online=()=>{clearTimeout(autosave);let attempts=0;const retry=async()=>{if(!form.isConnected||!dirty||submitted)return;try{await save(true);}catch(e){setStatus(e.message+(localSaved?' 当前内容已在此页面暂存。':' 请暂时不要关闭页面。'));if(e.retryable&&form.isConnected)autosave=setTimeout(retry,Math.min(5000,1500*++attempts));}};autosave=setTimeout(retry,300);};
 window.addEventListener('beforeunload',beforeUnload);window.addEventListener('online',online);
 state.viewCleanup=()=>{clearTimeout(autosave);window.removeEventListener('beforeunload',beforeUnload);window.removeEventListener('online',online);if(!submitted){cache();if(dirty&&!widget.busy())void save(true).catch(()=>{});}};
 textArea.addEventListener('input',changed);summary();setStatus(status.textContent);if(dirty){cache();online();}
 $$('[data-mode]',form).forEach(b=>b.onclick=()=>{$$('[data-mode]',form).forEach(x=>x.setAttribute('aria-pressed',x===b));if(b.dataset.mode==='text'){$('#typed-answer').open=true;textArea.focus();}else if(b.dataset.mode==='pdf'){const input=$('.upload input',form);input.accept='application/pdf';input.click();input.accept='image/jpeg,image/png,image/webp,application/pdf';}else $('.camera-input',form).click();});
 click('#save-draft',async()=>{clearTimeout(autosave);await save(true);toast('草稿已保存，稍后可以继续');});
 formHandler(form,async()=>{if(locked)throw Error('请联系老师开放提交');clearTimeout(autosave);const controls=$$('input,textarea,button',form).map(el=>({el,disabled:el.disabled}));controls.forEach(({el})=>el.disabled=true);try{const {submission}=await save(false);submitted=true;sessionStorage.removeItem(cacheKey);toast('提交成功，原件已保存');if(form.isConnected)go('result/'+submission.id);}finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}});
 if(hasPDF){const paper=$('.submit-paper'),paneScroll={reading:0,answer:0};let readingAnchors=[];const switchPane=value=>{paneScroll[paper.dataset.mobilePane]=main.scrollTop;if(paper.dataset.mobilePane==='reading')readingAnchors=$$('.assignment-reading .pdf-preview').map(el=>{const reader=pdfTasks.get(el);return {reader,position:reader?.position()};});paper.dataset.mobilePane=value;if(value==='reading')for(const x of readingAnchors)if(x.reader&&x.position)x.reader.setZoom(x.position.zoom,x.position);$$('[data-paper-pane]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.paperPane===value));main.scrollTo({top:paneScroll[value]||0,behavior:'instant'});};$$('[data-paper-pane]').forEach(b=>b.onclick=()=>switchPane(b.dataset.paperPane));$('[data-open-answer]').onclick=()=>switchPane('answer');const divider=$('.reader-divider'),layout=$('.submission-layout');let ratio=62;const resize=value=>{ratio=Math.min(72,Math.max(45,value));layout.style.setProperty('--reading-width',ratio+'%');divider.setAttribute('aria-valuenow',Math.round(ratio));};divider.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();resize(ratio+(e.key==='ArrowRight'?2:-2));}};divider.onpointerdown=e=>{divider.setPointerCapture(e.pointerId);divider.dataset.dragging='true';};divider.onpointermove=e=>{if(divider.dataset.dragging==='true'){const rect=layout.getBoundingClientRect();resize((e.clientX-rect.left)/rect.width*100);}};divider.onpointerup=divider.onpointercancel=()=>delete divider.dataset.dragging;}
 bindPreviews();bindPaperSurface();
}

function submissionRows(rows) {
  return rows
    .map((s) => {
      const a = state.assignments.find((a) => a.id === s.assignmentId);
      return `<article class="assignment-row"><div><h2>${h(s.studentName || a?.title || "作业提交")}</h2><div class="meta"><span>${h(a?.course || "作业")}</span><span>${h(s.studentName ? a?.title : "提交于 " + date(s.submittedAt))}</span><span>${s.studentName ? date(s.submittedAt) : "评分标准 v" + s.version}</span></div></div><div class="actions">${badge(s.status)}${link((state.user.role === "teacher" ? "review/" : "result/") + s.id, state.user.role === "teacher" ? "查看与复核" : "查看反馈", "primary")}</div></article>`;
    })
    .join("");
}
function reviews(assignmentId) {
  const teacher = state.user.role === "teacher";
  let rows = state.submissions.filter((s) => s.status !== "draft");
  if (assignmentId) rows = rows.filter((s) => s.assignmentId === assignmentId);
  if(teacher)rows=rows.filter(s=>s.status==="needs_review"||s.reviewRequests?.some(r=>r.status==="open"));
  rows.sort(
    (a, b) =>
      (a.status === "needs_review" ? -1 : 1) -
      (b.status === "needs_review" ? -1 : 1),
  );
  main.innerHTML = `<section class="paper">${head(teacher ? "REVIEW / 教师复核" : "SUBMISSIONS / 我的记录", teacher ? "待复核的作业" : "提交记录", teacher ? "核对 AI 给出的分数，也可以直接改分后发布。" : "每次提交都会保留。成绩发布后，可在这里查看反馈。", link("assignments", "返回作业"))}${rows.length ? submissionRows(rows) : empty(teacher ? "这里等待第一份作业" : "还没有提交记录", teacher ? "学生提交并完成批阅后，分数会出现在这里等待核对。" : "完成一份作业后，你的提交记录会出现在这里。")}</section>`;
}
async function resultPage(id) {
 const version=state.routeVersion,{submission:s}=await api('submissions/'+id);
 const a=state.assignments.find(x=>x.id===s.assignmentId)||s.assignment||{title:'作业提交'};
 await metadata(s.files);if(version!==state.routeVersion)return;
 const g=s.publishedGrade,types=questionTotals(g,s.questions||[]),uncertain=s.status==='needs_review';
 const attachedPages=s.files.reduce((n,id)=>n+(state.files.get(id)?.pages||0),0);
 const statusTitle=s.status==='returned'?'需要补充作答':uncertain?'等待老师确认':s.status==='grading'?'正在后台批阅':'作业已提交';
 const steps=`<ol class="grading-steps"><li class="complete"><span></span><div><strong>已保存原件</strong><p>提交编号 ${h(s.id.slice(0,12).toUpperCase())}</p></div></li><li class="${s.status==='grading'?'current':''}"><span></span><div><strong>${s.status==='returned'?'需要补充作答':uncertain?'待教师确认':s.status==='grading'?'正在后台批阅':'排队等待批阅'}</strong><p>${s.status==='returned'?h(s.returnedReason):uncertain?'老师核对后，成绩会显示在这里。':'可以关闭页面，任务会继续保留。'}</p></div></li><li><span></span><div><strong>成绩与错题自动归档</strong><p>结果返回后，在“成绩”中随时查看。</p></div></li></ol>`;
 main.innerHTML=`<section class="paper result-paper">${head('',g?'本次成绩':statusTitle,a.title,link('grades','成绩档案'))}<div class="submission-confirmation"><span class="receipt-check" aria-hidden="true">${icon("check")}</span><div><strong>${s.choices?'作答记录已保存':'作业已提交，原件已保存'}</strong><p>${date(s.submittedAt)} · ${attachedPages?attachedPages+" 页附件"+(s.text?" · 含文字作答":""):s.choices?(s.questions?.length||Object.keys(s.choices).length)+" 道题 · 在线作答":"文字作答"}</p></div><span class="receipt-id">编号 ${h(s.id.slice(0,8).toUpperCase())}</span></div><div class="result-layout"><section class="result-main">${g?`<div class="result-score"><strong>${g.total}<small>/${g.maxPoints}</small></strong><span>${Math.round(g.total/g.maxPoints*1000)/10}%</span></div>${types.choice.max&&types.short.max?`<div class="score-breakdown">${types.choice.max?`<span>选择题 <strong>${types.choice.score}/${types.choice.max}</strong></span>`:''}${types.short.max?`<span>简答题 <strong>${types.short.score}/${types.short.max}</strong></span>`:''}</div>`:''}${s.status!=='published'?'<p class="status-line">此前成绩保留；新一轮批阅或复核完成后会更新。</p>':''}<div class="section-head"><h2>逐题分数</h2><span class="hint">${g.questions.filter(q=>q.score<q.maxPoints).length} 道失分题</span></div><div class="filter-tabs" role="group" aria-label="题目筛选"><button data-question-filter="wrong" aria-pressed="true">失分题</button><button data-question-filter="all" aria-pressed="false">全部题目</button></div><div id="question-results">${g.questions.map(q=>`<details class="result-question" data-correct="${q.score===q.maxPoints}" ${q.score<q.maxPoints?'open':''}><summary><span>第 ${h(q.id)} 题</span><strong>${q.score}/${q.maxPoints}</strong></summary><div class="question-detail">${q.feedback?`<p class="instructions">${h(q.feedback)}</p>`:""}${q.evidence?`<details class="evidence"><summary>查看历史作答依据</summary><p class="instructions">${h(q.evidence)}</p></details>`:""}${s.paper?.questionFiles?.length?link('paper/'+s.id+'/'+encodeURIComponent(q.id),'查看原题'):''}${q.score<q.maxPoints?link('mistakes/'+s.assignmentId+'/'+encodeURIComponent(q.id),'回看与订正'):''}<details class="review-appeal"><summary>对这道题的评分有疑问</summary>${(s.reviewRequests||[]).some(r=>r.questionId===q.id&&r.status==='open')?'<p class="status-line">已申请复核，当前成绩会保留到老师处理完成。</p>':`<form data-appeal="${h(q.id)}" class="stack">${area('需要老师核对什么','reason','','required maxlength="1500" placeholder="例如：我在第二页写出了这个计算步骤…"')}<p class="form-error" role="alert"></p><button class="secondary" type="submit">申请复核</button></form>`}</details></div></details>`).join('')}</div><p id="all-correct" class="empty-inline" hidden>这次没有失分题。你可以切换到全部题目查看得分。</p>${g.teacherNote?`<p class="instructions">${h(g.teacherNote)}</p>`:''}<p class="hint">${g.source==='automatic'?'自动批阅':'教师已确认'} · ${date(g.publishedAt)} · 答案 v${g.answerVersion}</p><div class="actions"><a class="primary" href="/api/homework/submissions/${s.id}/pdf?kind=grade" download>下载批改 PDF</a>${link('mistakes','查看错题集')}</div>`:steps+`<div class="actions">${link('assignments','返回作业列表','primary')}${s.status==='returned'?link('submit/'+s.assignmentId,'补充作业'):''}</div>`}</section><aside class="submission-receipt"><h2>我的原始作答</h2>${s.paper?.questionFiles?.length?link('paper/'+s.id,'查看本次作业题纸'):''}<p class="meta">${date(s.submittedAt)}${s.late?' · 迟交':''}</p><div class="file-list">${fileMarkup(s.files)}</div><details ${s.text?'open':''}><summary>文字作答</summary><p class="instructions">${h(s.text||'本次作答见附件。')}</p></details><a class="secondary" href="/api/homework/submissions/${s.id}/pdf" download>保存作业 PDF</a>${(s.status==='returned'||a.allowResubmit!==false&&(!a.dueAt||Date.parse(a.dueAt)>Date.now()||a.allowLate))?link('submit/'+s.assignmentId,'补充或重新提交','link'):''}${s.gradeHistory?.length?`<details class="grade-revisions"><summary>历次成绩版本</summary>${s.gradeHistory.map(v=>`<p>${date(v.publishedAt)} · ${v.total}/${v.maxPoints} · 答案 v${v.answerVersion}</p>`).join('')}</details>`:''}</aside></div></section>`;
 if(g){const filter=value=>{$$('.result-question').forEach(q=>q.hidden=value==='wrong'&&q.dataset.correct==='true');$('#all-correct').hidden=value!=='wrong'||g.questions.some(q=>q.score<q.maxPoints);$$('[data-question-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.questionFilter===value));};$$('[data-question-filter]').forEach(b=>b.onclick=()=>filter(b.dataset.questionFilter));filter('wrong');
  $$('[data-appeal]').forEach(form=>formHandler(form,async b=>{await post('submissions/'+s.id+'/review-request',{questionId:form.dataset.appeal,reason:b.reason});form.innerHTML='<p class="status-line">复核申请已保存，当前成绩保留。</p>';toast('已提交复核申请');}));
 }
 bindPreviews();
 if(['queued','grading','needs_review'].includes(s.status)){
  const anchor=$('.result-paper'),fingerprint=JSON.stringify([s.status,s.publishedGrade,s.reviewRequests]);
  const poll=async()=>{if(!anchor.isConnected)return;try{const next=(await api('submissions/'+id)).submission;if(!anchor.isConnected)return;if(JSON.stringify([next.status,next.publishedGrade,next.reviewRequests])!==fingerprint){await render(false);return;}}catch{}if(anchor.isConnected)pollTimer=setTimeout(poll,10000);};pollTimer=setTimeout(poll,6000);
 }
}

async function reviewPage(id) {
  const renderId = state.routeVersion;
  const { submission: s } = await api("submissions/" + id),
    a = state.assignments.find((x) => x.id === s.assignmentId),
    name = state.submissions.find((x) => x.id === id)?.studentName || "学生";
  const reviewFiles=[...s.files,...(s.choices?s.rubricSnapshot.flatMap(q=>q.questionImages||[]):[])];
  await metadata(reviewFiles);
  const {mountReviewStudio}=await import("./review-studio.js");
  if (renderId !== state.routeVersion) return;
  const queue=state.submissions.filter(q=>q.assignmentId===s.assignmentId&&(q.status==='needs_review'||q.id===s.id));
  state.viewCleanup=mountReviewStudio(main,{backRoute:state.gradeReturn?.submissionId===id?state.gradeReturn.route:'reviews',submission:s,title:a?.title||'作业复核',name,files:reviewFiles.map(id=>state.files.get(id)).filter(Boolean),userId:state.user.id,queue,api,put,post,go,toast,reload:()=>render(false)});
}

async function devicePage() {
  const { device: d, settings: s } = await api("device");
  const chatSettings = await api("companion/settings");
  const cloud = s.execution === "cloud";
  const selected = cloud ? "deepseek" : s.provider;
  const status = d?.revoked ? "已暂停" : cloud && !s.hasApiKey ? "待填写 API Key" : d?.online ? d.busy ? "正在批改" : d.modelReady ? "已连接 · 可以批改" : "已连接 · 待配置模型" : "未连接 · 作业会继续排队";
  main.innerHTML = `<section class="paper">${head("", "批改引擎", "云端持续处理，本机随时备用。")}
    <div class="device-grid"><section>
      <h2 class="device-title">${cloud ? "DeepSeek 云端" : "本机批改"}</h2>
      <p class="device-status" role="status"><span class="device-dot ${d?.online ? "online" : ""}"></span>${status}</p>
      <dl class="device-detail"><div><dt>当前模型</dt><dd>${h(s.model)}</dd></div><div><dt>运行位置</dt><dd>${cloud ? "Railway · Mac 关机仍可处理" : "你的 Mac · 开机联网时处理"}</dd></div><div><dt>成绩发布</dt><dd>AI 仅给分，教师复核后发布</dd></div></dl>
      ${d?.lastError ? `<p class="error" role="alert">${h(d.lastError)}</p>` : ""}
      <hr class="rule"><p class="hint">${cloud ? "图片和 PDF 会与教师答案一起发送给 DeepSeek，按实际调用计费。连接中断时，作业保留在队列中。" : "本地模式由这台 Mac 处理。休眠或断网后作业仍保留，重新连接会继续。"}</p>
      <div class="form-actions"><button id="device-test" class="secondary">测试连接与图片识别</button><button id="device-pause" class="quiet">${d?.revoked ? "恢复批改" : "暂停批改"}</button></div>
      <p id="test-status" class="status-line" hidden role="status"></p>
    </section><section><h2>连接设置</h2>
      <form id="settings-form" class="stack" style="margin-top:24px">
      <label class="field"><span>批改方式</span><select name="provider"><option value="deepseek" ${selected === "deepseek" ? "selected" : ""}>DeepSeek 云端</option><option value="ollama" ${selected === "ollama" ? "selected" : ""}>本机备用 · Ollama</option><option value="openai" ${selected === "openai" ? "selected" : ""}>其他兼容 API · 本机调用</option></select></label>
      <p id="provider-note" class="hint"></p>
      <div id="model-fields" class="stack">${field("接口地址", "baseUrl", s.baseUrl, "url", "required")}${field("模型名称", "model", s.model, "text", "required")}</div>
      <div id="cloud-fields" class="stack" ${s.provider === "ollama" ? "hidden" : ""}>
      ${field("API Key", "apiKey", "", "password", `autocomplete="off" spellcheck="false" maxlength="2000" placeholder="${s.hasApiKey ? "已加密保存；留空保持原密钥" : "在此填写密钥"}"`)}
      <label class="check"><input type="checkbox" name="cloudConsent" ${s.cloudConsent ? "checked" : ""}>我同意将作业和参考答案发送到所选服务商</label></div>
      <p class="hint">密钥加密保存，学生无法查看。切回本机时会保留 DeepSeek 配置。</p><p class="hint">批阅只生成分数，不生成判分理由。核对后再发布给学生。</p>
      <p class="form-error" role="alert"></p><button type="submit" class="primary">保存批改设置</button></form>
    </section></div><hr class="rule"><details><summary>Mike 伙伴 · 对话额度</summary><p class="hint">与批改共用已保存的 DeepSeek 连接。只提供经济学与平台帮助；测验中只提供操作帮助。</p><form id="chat-settings-form" class="stack"><div class="field-row">${field("学生每日条数", "studentDaily", chatSettings.studentDaily, "number", 'min="1" max="200" required')}${field("教师每日条数", "teacherDaily", chatSettings.teacherDaily, "number", 'min="1" max="1000" required')}</div><p class="form-error" role="alert"></p><button type="submit" class="secondary">保存对话额度</button></form></details></section>`;
  formHandler($("#chat-settings-form"), async b => { await post("companion/settings",b); toast("对话额度已保存"); });
  const form = $("#settings-form"), provider = $("[name=provider]", form);
  function updateProvider(reset) {
    const kind = provider.value, deepseek = kind === "deepseek", local = kind === "ollama";
    $("#cloud-fields").hidden = local;
    $("#model-fields").hidden = deepseek;
    $("#provider-note").textContent = deepseek ? "使用 deepseek-flash，支持文字、图片和 PDF。由 Railway 处理，无需保持 Mac 开机。" : local ? "本机模型保留作备用。需要保持 Mac 开机并联网。" : "由你的 Mac 调用填写的兼容接口。";
    if (reset) {
      $("[name=baseUrl]", form).value = deepseek ? "https://api.deepseek.com" : local ? "http://127.0.0.1:11434" : "";
      $("[name=model]", form).value = deepseek ? "deepseek-flash" : local ? "qwen3-vl:8b-instruct" : "";
      $("[name=apiKey]", form).value = "";
      $("[name=cloudConsent]", form).checked = false;
    }
    $("[name=apiKey]", form).placeholder = (deepseek ? s.hasDeepSeekKey || (cloud && s.hasApiKey) : kind === selected && s.hasApiKey) ? "已加密保存；留空保持原密钥" : "在此填写密钥";
  }
  provider.onchange = () => updateProvider(true);
  updateProvider(false);
  formHandler(form, async b => {
    b.cloudConsent = $("[name=cloudConsent]", form).checked;
    b.autoPublishValidated=false;
    await put("device/settings", b);
    $("[name=apiKey]", form).value = "";
    toast("批改设置已保存");
    await render();
  });
  click("#device-pause", async () => { await post("device/pause", { paused: !d?.revoked }); render(); });
  click("#device-test", async () => {
    const { jobId } = await post("device/test");
    const el = $("#test-status"); el.hidden = false;
    el.textContent = "测试已排队，等待批改引擎…";
    async function poll() {
      try {
        const { job } = await api("jobs/" + jobId);
        if (!el.isConnected) return;
        el.textContent = job.status === "complete" ? job.result.message : job.status === "failed" ? job.error : job.status === "running" ? "正在测试真实图片识别…" : "等待批改引擎…";
        if (!["complete", "failed"].includes(job.status)) pollTimer = setTimeout(poll, 4000);
      } catch (e) { el.textContent = e.message; }
    }
    pollTimer = setTimeout(poll, 3000);
  });
}
function accountPage() {
  const teacher = state.user.role === "teacher";
  main.innerHTML = `<section class="paper">${head("ACCOUNT / 账户与班级", state.user.name, teacher ? "教师账户" : "学生账户", `<button id="logout" class="secondary">退出登录</button>`)}<div class="split"><section><h2>我的班级</h2><div class="class-list">${state.classes.map((c) => `<div class="class-line"><span>${h(c.name)}</span>${teacher ? `<div><span class="hint">${c.source === "bookself" ? "注册班级码" : "原作业班级码"}</span><code>${h(c.invite)}</code></div>` : ""}</div>`).join("") || `<p class="muted">${state.user.unified ? (teacher ? '尚无可用班级，请在 Bookself 教师端确认。' : '暂未关联到班级，请联系老师核对注册信息。') : '尚未加入班级'}</p>`}</div>${state.user.unified ? `<p class="hint">${teacher ? "与 Bookself 共用班级和注册班级码。班级调整请在教师工作台的“班级与学生”完成。" : "已沿用注册时的班级，无需再次加入。需要转班时，请联系老师。"}</p>` : `<hr class="rule"><form id="class-form" class="stack">${field(teacher ? "新班级名称" : "加入另一个班级", "value", "", "text", `required placeholder="${teacher ? "例如：AP 宏观 2026 A 班" : "输入班级邀请码"}"`)}<p class="form-error" role="alert"></p><button type="submit" class="primary">${teacher ? "创建班级" : "加入班级"}</button></form>${teacher ? '<p class="hint" style="margin-top:20px">学生使用 Bookself 账号登录，再通过此邀请码加入作业班级。</p>' : ""}`}</section><section><h2>修改密码</h2><form id="password-form" class="stack" style="margin-top:24px">${field("当前密码", "current", "", "password", 'required autocomplete="current-password"')}${field("新密码", "password", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}${field("确认新密码", "confirm", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}<p class="hint">使用至少 10 位密码。修改后，其他设备需要重新登录。</p><p class="form-error" role="alert"></p><button type="submit" class="secondary">更新密码</button></form></section></div></section>`;
  if(state.user.unified){
    const passwordForm=$('#password-form');
    passwordForm.parentElement.innerHTML='<h2>统一账号</h2><p class="muted">使用 Bookself 账号，班级与学习进度保持同步。</p><p class="hint">新作业、提交记录与成绩直接保存到当前账号。</p><a class="secondary" href="/?account=password">修改 Bookself 密码</a>';
    const accountColumn=$('.split > section:last-child');if(state.user.canManageGrading)accountColumn.insertAdjacentHTML('beforeend','<div class="section-gap">'+link('device','批改设置')+'</div>');
  }
  click("#logout", async () => {
    await post("logout");
    state.user = null;
    location.hash = "login";
    showLogin();
  });
  if($("#class-form"))formHandler($("#class-form"), async (b) => {
    if (teacher) await post("classes", { name: b.value });
    else {
      const data = await post("join", { invite: b.value });
      state.user = data.user;
    }
    await render();
    toast(teacher ? "班级已创建" : "已加入班级");
  });
  if($("#password-form"))formHandler($("#password-form"), async (b) => {
    if (b.password !== b.confirm) throw new Error("两次新密码不一致");
    const result = await post("password", b);
    state.csrf = result.csrf;
    $("#password-form").reset();
    toast("密码已更新");
  });
}
async function render(scroll = true) {
  $("#preview").close();document.querySelector("#work-dialog")?.close();
  clearTimeout(noticeTimer);$("#notice").classList.remove("visible");
  state.viewCleanup?.();state.viewCleanup=null;state.restoreView=null;
  clearPDFs();
  if (!state.user) return showLogin();
  clearTimeout(pollTimer);
  const version = ++state.routeVersion;
  main.setAttribute("aria-busy", "true");
  const [route = "assignments", id, questionId] = (embedded?embeddedRoute:location.hash.slice(1)).split("/").map(x=>{try{return decodeURIComponent(x)}catch{return x}});
  try {
    await refresh();
    if (version !== state.routeVersion) return;
    const teacher = state.user.role === "teacher";
    if (
      !teacher &&
      ["new", "edit", "trash", "answer", "reviews", "review", "device", "overview", "gradebook"].includes(route)
    ) {
      go("assignments");
      return;
    }
    nav?.select(teacher?(['gradebook','device'].includes(route)?2:['reviews','review'].includes(route)?1:0):route==='mistakes'?2:['grades','history','result'].includes(route)?1:0);
    const workspace=createWorkspaceUI({state,main,h,head,link,date,api,post,put,go,toast,field,area,formHandler,uploadWidget,metadata});
    const task=['submit','paper','review','answer','new','edit'].includes(route);
    if(!embedded){document.body.dataset.workTask=task?'true':'false';document.body.dataset.workRoute=route;}
    document.documentElement.dataset.homeworkRoute=route;
    const learning=createLearningUI({state,main,api,post,put,h,head,link,badge,date,click,formHandler,area,field,bindPreviews,fileMarkup,metadata,uploadWidget,toast,go,paperSurface,bindPaperSurface});
    const mcqUI=createMCQUI({main,state,api,post,put,go,h,toast});
    if(route === "mcq-import")await mcqUI.imports(id);
    else if(route === "mcq")await mcqUI.attempt(id);
    else if(route === "mcq-analysis")await mcqUI.analysis(id);
    else if (route === "new") await newAssignment();
    else if (route === "edit" && id) await workspace.edit(id);
    else if (route === "trash") await workspace.trash();
    else if (route === "answer" && id) await answerPage(id);
    else if (route === "submit" && id) await submitPage(id);
    else if(route==="paper"&&id)await originalPaperPage(id,questionId);
    else if (route === "reviews") reviews(id);
    else if (["grades","history","gradebook"].includes(route))await learning.gradebook(id);
    else if(route==="mistakes")await learning.mistakes(id,questionId);
    else if(route==="overview"&&id)await learning.overview(id,(embedded?embeddedRoute:location.hash.slice(1)).split('/')[2]);
    else if (route === "result" && id) await resultPage(id);
    else if (route === "review" && id) await reviewPage(id);
    else if (route === "device") await devicePage();
    else if (route === "account") accountPage();
    else workspace.dashboard();
    sizeTitleFields();
    if (scroll) {main.scrollTo({ top: 0, behavior: "instant" });main.focus({preventScroll:true});state.restoreView?.();}
  } catch (e) {
    if (!state.user || version !== state.routeVersion) return;
    main.innerHTML = `<section class="paper">${head("WORKSPACE", "暂时无法打开")}<p class="error" role="alert">${h(e.message)}</p><div class="form-actions"><button id="retry" class="primary">重试</button>${link("assignments", "返回作业")}</div></section>`;
    click("#retry", () => render());
  } finally {
    if(version===state.routeVersion)main.setAttribute("aria-busy", "false");
  }
}
export async function mountTeacherHomework(route="assignments",context={}) {
  if(!embedded)throw Error("请从教师工作台打开");
  embeddedRoute=route;embeddedContext=context;state.workspaceClassId=context.classId?"bookself-class:"+context.classId:"";const generation=++embeddedGeneration;
  const session=await api("me");if(generation!==embeddedGeneration)return;state.user=session.user;state.csrf=session.csrf;
  if(state.user?.role!=="teacher")throw Error("此页面仅供教师使用");
  await render();
}
export function unmountTeacherHomework(){$("#preview").close();document.querySelector("#work-dialog")?.close();embeddedGeneration++;state.routeVersion++;clearTimeout(pollTimer);state.viewCleanup?.();state.viewCleanup=null;clearPDFs();main.replaceChildren();}
if(embedded){
  // Delegate anchors because many reused views render their links dynamically.
  main.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(!a)return;const route=a.getAttribute('href').slice(1);if(route==='classes'||route.startsWith('work/'))return;event.preventDefault();go(route);});
}else{
  window.addEventListener("hashchange", () => render());
  try {await loginResult(await api("me"));} catch {showLogin();}
}

function renderPDFs(root = document) {
 for(const [el,task] of pdfTasks)if(!el.isConnected){Promise.resolve(task.destroy()).catch(()=>{});pdfTasks.delete(el);}
 for(const el of $$('.pdf-preview:not([data-loading])',root)){
  el.dataset.loading='true';const fileId=el.dataset.pdf;
  const reader=mountPDFReader(el,{fileId,title:el.dataset.title||state.files.get(fileId)?.name||'PDF',storageKey:`hw-reading:${state.user?.id}:${fileId}`,initialPage:el.dataset.page?Number(el.dataset.page):null,loadPosition:()=>api('files/'+fileId+'/reading').then(x=>x.position),savePosition:position=>put('files/'+fileId+'/reading',position)});
  pdfTasks.set(el,reader);
 }
}
