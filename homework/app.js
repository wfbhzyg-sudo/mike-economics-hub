import { setupDock } from "./nav.js";
import {assignmentRecords,assignmentState,questionTotals} from "./learning-model.js";
import {createLearningUI} from "./learning-ui.js";
const $ = (q, root = document) => root.querySelector(q),
  $$ = (q, root = document) => [...root.querySelectorAll(q)],
  main = $("#main"),
  dock = $("#dock");
const h = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name) =>
  `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${{ up: "M12 20V4m-6 6 6-6 6 6", rotate: "M20 7V3m0 4h-4M20 7a8 8 0 1 0 0 10", close: "m6 6 12 12M18 6 6 18", left: "M19 12H5m6-6-6 6 6 6", right: "M5 12h14m-6-6 6 6-6 6", external: "M6 18 18 6M6 6h12v12" }[name]}"/></svg>`;
const state = {
  user: null,
  csrf: "",
  classes: [],
  assignments: [],
  submissions: [],
  files: new Map(),
  routeVersion: 0,
  assignmentFilter: "all",
  viewCleanup:null,
};
let nav, pollTimer, noticeTimer, pdfModule;
const pdfTasks = new Map();
function clearPDFs(root) {
  for (const [el, task] of pdfTasks) {
    if (!root || root.contains(el) || !el.isConnected) {
      task.destroy().catch(() => {});
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
const head = (eyebrow, title, description = "", actions = "") =>
  `<div class="paper-head"><div><h1>${h(title)}</h1>${/^(ANSWER KEY|SUBMIT) \/ /.test(eyebrow) ? `<p class="context">${eyebrow.split(" / ").slice(1).join(" / ")}</p>` : ""}${description ? `<p>${h(description)}</p>` : ""}</div>${actions ? `<div class="actions">${actions}</div>` : ""}</div>`;
const empty = (title, copy, action = "") =>
  `<div class="empty"><h2>${h(title)}</h2><p>${h(copy)}</p>${action}</div>`;
const link = (route, label, kind = "secondary") =>
  `<a class="${kind}" href="#${route}">${label}</a>`;
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
      throw new Error(value.error || "暂时无法完成操作");
    }
    return value;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("连接超时，请稍后重试。已保存的内容不会丢失。");
    if(error instanceof TypeError){const networkError=new Error(navigator.onLine?"连接暂时中断，请重试。已上传文件仍保留。":"网络已断开，请联网后继续。当前草稿会暂存。");networkError.retryable=true;throw networkError;}
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
const post = (path, body = {}) => api(path, { method: "POST", body });
const put = (path, body) => api(path, { method: "PUT", body });
const formData = (form) => Object.fromEntries(new FormData(form));
function formHandler(form, fn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const error = $(".form-error", form);
    if (error) error.textContent = "";
    const buttons = $$("button[type=submit]", form),disabledBefore=buttons.map(b=>b.disabled);
    buttons.forEach((b) => (b.disabled = true));
    try {
      await fn(formData(form));
    } catch (e) {
      if (error) error.textContent = e.message;
      else toast(e.message);
    } finally {
      buttons.forEach((b,i) => (b.disabled = disabledBefore[i]));
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
  if (location.hash === "#" + route) render();
  else location.hash = route;
};
function installNavigation() {
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
  nav = setupDock(dock, items, 0, (route) => go(route));
  $("#account").hidden = false;
  $("#account").innerHTML = h(state.user.name) + icon("external");
  $("#account").onclick = () => go("account");
  document.body.classList.remove("no-auth");
}
async function loginResult(value) {
  state.user = value.user;
  state.csrf = value.csrf;
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
}
function row(a) {
  const teacher=state.user.role==='teacher', info=assignmentState(a,state.submissions);
  const questions=teacher?a.rubric:a.questions, max=(questions||[]).reduce((n,q)=>n+q.maxPoints,0);
  const choice=(questions||[]).filter(q=>q.type==='choice').length;
  const target=teacher?(a.published?'overview/':'answer/')+a.id:info.latest&&info.latest.status!=='returned'?'result/'+info.latest.id:'submit/'+a.id;
  const action=teacher?(a.published?'查看提交':'继续发布'):info.latest&&info.latest.status!=='returned'?(info.key==='done'?'查看成绩':'查看进度'):info.draft?'继续草稿':info.latest?.status==='returned'?'补充作业':'开始作业';
  const urgent=!teacher&&info.key==='todo'&&a.dueAt&&Date.parse(a.dueAt)>Date.now()&&Date.parse(a.dueAt)-Date.now()<86400000;
  return `<article class="assignment-row ${urgent?'due-soon':''}"><div><a href="#${target}" class="text-button"><h2>${h(a.title)}</h2></a><div class="meta"><span>${h(a.course)}</span><span>${a.classIds.map(x=>h(state.classes.find(c=>c.id===x)?.name||'班级')).join(' · ')}</span><span>${a.dueAt?'截止 '+date(a.dueAt):'不限截止时间'}</span>${urgent?'<strong>即将截止</strong>':''}</div>${max?`<p class="assignment-types">${choice?`选择题 ${choice} 道 · `:''}${questions.length-choice?`简答题 ${questions.length-choice} 道 · `:''}满分 ${max} 分</p>`:''}</div><div class="actions">${teacher?badge(a.status):`<span class="badge" data-state="${info.latest?.status||'todo'}">${h(info.label)}</span>`}${link(target,action,'primary')}</div></article>`;
}
function assignments() {
 const teacher=state.user.role==='teacher';
 main.innerHTML=`<section class="paper">${head('',teacher?'我的作业':'今天从哪份作业开始',teacher?'发布到已有班级，查看提交与批阅情况。':'先完成待交作业，提交后可以离开页面。',teacher?link('account','我的班级')+link('new','发布作业','primary'):'')}
 <div class="assignment-toolbar"><div class="filter-tabs" role="group" aria-label="作业状态">${(teacher?[['all','全部'],['published','已发布'],['draft','待发布']]:[['all','全部'],['todo','待完成'],['processing','批阅中'],['done','已出成绩']]).map(([v,t])=>`<button type="button" data-assignment-filter="${v}" aria-pressed="${state.assignmentFilter===v}">${t}</button>`).join('')}</div><label class="search-field"><span class="sr-only">查找作业</span><input type="search" id="assignment-search" placeholder="查找作业" autocomplete="off"></label></div><div id="assignment-list"></div></section>`;
 const draw=()=>{const term=$('#assignment-search').value.trim();let rows=state.assignments.filter(a=>a.title.includes(term)&&(state.assignmentFilter==='all'||(teacher?(state.assignmentFilter==='published'?a.published:!a.published):assignmentState(a,state.submissions).key===state.assignmentFilter)));
  rows.sort((a,b)=>{if(teacher)return (b.createdAt||'').localeCompare(a.createdAt||'');const ai=assignmentState(a,state.submissions),bi=assignmentState(b,state.submissions);return (ai.key==='todo'?0:1)-(bi.key==='todo'?0:1)||(Date.parse(a.dueAt)||Infinity)-(Date.parse(b.dueAt)||Infinity);});
  $('#assignment-list').innerHTML=rows.length?rows.map(row).join(''):empty(state.assignments.length?'这个分类已经清空':teacher?'从一份作业开始':'老师发布后，作业会出现在这里',state.assignments.length?'可以切换分类或调整搜索词。':teacher?'选择已有班级，上传答案并核对评分点。':'已沿用你的注册班级，无需再次加入。',state.assignments.length?'':link(teacher?'new':'account',teacher?'发布第一份作业':'查看我的班级','primary'));
 };
 $$('[data-assignment-filter]').forEach(b=>b.onclick=()=>{state.assignmentFilter=b.dataset.assignmentFilter;$$('[data-assignment-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));draw();});$('#assignment-search').oninput=draw;draw();
}
function newAssignment() {
  if (!state.classes.length) {
    go("account");
    toast(state.user.unified ? "请先在 Bookself 教师端确认班级，作业工作台会自动同步" : "先创建一个班级，即可布置作业");
    return;
  }
  main.innerHTML = `<section class="paper">${head("NEW ASSIGNMENT", "布置一份作业", "下一步上传参考答案，核对评分点。", link("assignments", "返回作业"))}<form id="new-assignment" class="stack small-form">${field("作业标题", "title", "", "text", 'required maxlength="120" placeholder="例如：AD–AS 图像与政策分析"')}<div class="field-row"><label class="field"><span>课程</span><select name="course"><option>AP 宏观经济学</option><option>AP 微观经济学</option><option>经济学</option></select></label>${field("截止时间（可选）", "dueAt", "", "datetime-local")}</div><fieldset><legend>布置给</legend>${state.classes.map((c) => `<label class="check"><input type="checkbox" name="classId" value="${c.id}" checked>${h(c.name)}</label>`).join("")}</fieldset>${area("题目与作业要求", "instructions", "", 'placeholder="填写题目、需要画图的要求、提交说明…"')}<label class="field"><span>成绩返回方式</span><select name="gradingMode"><option value="auto">自动批阅并返回，异常转教师复核</option><option value="manual">全部由教师复核后发布</option></select></label><label class="check"><input type="checkbox" name="allowResubmit" checked>允许学生在截止前重新提交</label><p class="form-error" role="alert"></p><button class="primary" type="submit">继续 · 上传参考答案</button></form></section>`;
  formHandler($("#new-assignment"), async (b) => {
    b.classIds = $$("input[name=classId]:checked").map((x) => x.value);
    b.allowResubmit=$("[name=allowResubmit]").checked;
    if (b.dueAt) b.dueAt = new Date(b.dueAt).toISOString();
    const { assignment } = await post("assignments", b);
    go("answer/" + assignment.id);
  });
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
function preview(id) {
  const f = state.files.get(id);
  if (!f) return;
  const dialog = $("#preview");
  $(".preview-content", dialog).innerHTML =
    f.mime === "application/pdf"
      ? `<div class="pdf-preview" data-pdf="${id}" data-large="true"></div>`
      : `<img src="/api/homework/files/${id}" alt="${h(f.name)}">`;
  dialog.showModal();
  renderPDFs(dialog);
}
$("#preview").addEventListener("close", () => {
  clearPDFs($("#preview"));
  $(".preview-content", $("#preview")).replaceChildren();
});
$("#preview .close").onclick = () => $("#preview").close();
$("#preview").addEventListener("click", (e) => {
  if (e.target === $("#preview")) $("#preview").close();
});
function fileMarkup(ids, editable = false) {
  return ids
    .map((id, i) => {
      const f = state.files.get(id);
      if (!f) return "";
      return `<div class="file"><button type="button" class="icon-btn" data-preview="${id}" aria-label="预览 ${h(f.name)}">${f.mime === "application/pdf" ? '<span class="file-thumb">PDF</span>' : `<img class="file-thumb" src="/api/homework/files/${id}" alt="" loading="lazy">`}</button><div><button type="button" class="text-button file-name" data-preview="${id}">${h(f.name)}</button><div class="hint">${f.pages} 页 · ${((f.originalSize||f.size) / 1024 / 1024).toFixed(1)} MB</div>${!editable?`<a class="download-link" href="/api/homework/files/${id}?download=1" download>下载原件</a>`:""}</div>${editable ? `<div class="file-tools">${f.mime.startsWith("image/") ? `<button type="button" class="icon-btn" data-rotate="${i}" aria-label="顺时针旋转 ${h(f.name)}">${icon("rotate")}</button>` : ""}<button type="button" class="icon-btn" data-up="${i}" aria-label="上移 ${h(f.name)}" ${i === 0 ? "disabled" : ""}>${icon("up")}</button><button type="button" class="icon-btn" data-remove="${i}" aria-label="移除 ${h(f.name)}">${icon("close")}</button></div>` : ""}</div>`;
    })
    .join("");
}
function bindPreviews(root = document) {
  $$("[data-preview]", root).forEach(
    (b) => (b.onclick = () => preview(b.dataset.preview)),
  );
  renderPDFs(root);
}
function uploadWidget(root, purpose, initial = [], onChange = () => {}) {
  let ids = [...initial],
    uploading = false;
  root.innerHTML = `${purpose==="submission"?'<div class="capture-actions"><label class="capture-button"><svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h4l2-3h4l2 3h4v15H4Z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0"/></svg><span>拍照添加</span><input type="file" class="camera-input" accept="image/*" capture="environment" aria-label="拍照添加作业"></label></div>':""}<div class="file-list"></div>${purpose === "answer" ? '<div class="answer-inline-preview"></div>' : ""}<label class="upload"><span class="upload-icon" aria-hidden="true">${icon("up")}</span><strong>${purpose==="submission"?"从相册或文件添加":"点击上传，或将文件拖到这里"}</strong><small class="muted">JPG / PNG / WebP / PDF · 单文件 20 MB</small><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple aria-label="上传${purpose === "answer" ? "参考答案" : purpose === "question" ? "题目" : "作业"}"></label><progress value="0" max="100" hidden aria-label="文件上传进度"></progress><p class="hint upload-status" role="status">最多 20 页，合计 50 MB。HEIC 请先转为 JPG。</p>`;
  const list = $(".file-list", root),
    status = $(".upload-status", root),
    progress = $("progress", root),
    input = $(".upload input", root),
    zone = $(".upload", root);
  function draw() {
    list.innerHTML = fileMarkup(ids, true);
    if (purpose === "answer") {
      const f = state.files.get(ids[0]);
      $(".answer-inline-preview", root).innerHTML = !f
        ? ""
        : f.mime === "application/pdf"
          ? `<div class="pdf-preview" data-pdf="${f.id}"></div>`
          : `<img class="original-preview" src="/api/homework/files/${f.id}" alt="参考答案预览">`;
    }
    $$(".file-tools button",list).forEach(b=>{if(uploading)b.disabled=true;});
    bindPreviews(list);
    renderPDFs(root);
    $$("[data-rotate]", list).forEach(
      (b) =>
        (b.onclick = async () => {
          if(uploading)return;uploading=true;input.disabled=true;draw();onChange(ids);
          try {
            const i = Number(b.dataset.rotate),
              { file } = await post("files/" + ids[i] + "/rotate");
            state.files.set(file.id, file);
            ids[i] = file.id;
            draw();
            onChange(ids);
          } catch (e) {
            toast(e.message);
          } finally {uploading=false;input.disabled=false;draw();onChange(ids);}
        }),
    );
    $$("[data-remove]", list).forEach(
      (b) =>
        (b.onclick = () => {
          if(uploading)return;ids.splice(Number(b.dataset.remove), 1);
          draw();
          onChange(ids);
        }),
    );
    $$("[data-up]", list).forEach(
      (b) =>
        (b.onclick = () => {
          if(uploading)return;const i = Number(b.dataset.up);
          [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
          draw();
          onChange(ids);
        }),
    );
  }
  async function upload(selected) {
    if (uploading) return;
    uploading = true;
    input.disabled = true;
    if($(".camera-input",root))$(".camera-input",root).disabled=true;
    progress.hidden = false;
    draw();onChange(ids);
    try {
      for (const file of selected) {
        if (ids.length >= 20) throw new Error("最多上传 20 个附件");
        if (file.size > 20 * 1024 * 1024)
          throw new Error(file.name + " 超过 20 MB");
        if (
          ids.reduce((n, x) => n + (state.files.get(x)?.originalSize || state.files.get(x)?.size || 0), 0) +
            file.size >
          50 * 1024 * 1024
        )
          throw new Error("附件合计超过 50 MB");
        status.textContent = "正在上传 " + file.name;
        const uploaded = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(
            "POST",
            `/api/homework/files?purpose=${purpose}&name=${encodeURIComponent(file.name)}`,
          );
          xhr.setRequestHeader("X-CSRF-Token", state.csrf);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) progress.value = (e.loaded / e.total) * 100;
          };
          xhr.onload = () => {
            let result;
            try {
              result = JSON.parse(xhr.responseText);
            } catch {
              return reject(new Error("上传响应不完整"));
            }
            xhr.status < 300
              ? resolve(result.file)
              : reject(new Error(result.error || "上传失败"));
          };
          xhr.onerror = () => reject(new Error("网络中断，请重新上传"));
          xhr.timeout = 180000;
          xhr.ontimeout = () => reject(new Error("上传超时，请重试"));
          xhr.send(file);
        });
        state.files.set(uploaded.id, uploaded);
        if(ids.reduce((n,x)=>n+(state.files.get(x)?.pages||0),0)+uploaded.pages>20)throw new Error("附件合计超过 20 页。前面已添加的文件仍保留。");
        ids.push(uploaded.id);
        draw();
        onChange(ids);
      }
      status.textContent = "上传完成，可以预览、排序或移除附件。";
    } catch (e) {
      status.textContent = e.message;
      toast(e.message);
    } finally {
      uploading = false;
      input.disabled = false;
      if($(".camera-input",root)){$(".camera-input",root).disabled=false;$(".camera-input",root).value="";}
      input.value = "";
      onChange(ids);
      progress.hidden = true;draw();
    }
  }
  input.onchange = () => upload([...input.files]);
  if($(".camera-input",root))$(".camera-input",root).onchange=e=>upload([...e.target.files]);
  zone.ondragover = (e) => {
    e.preventDefault();
    zone.classList.add("dragging");
  };
  zone.ondragleave = () => zone.classList.remove("dragging");
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("dragging");
    upload([...e.dataTransfer.files]);
  };
  draw();
  return { ids: () => ids, busy: () => uploading };
}
function pointEditor(points=[]){return points.map(p=>`<div class="scoring-point" data-point><label class="field"><span>得分条件</span><input name="criterion" value="${h(p.criterion)}" maxlength="3000" required></label><label class="field"><span>分值</span><input name="pointMax" type="number" min="0.5" max="100" step="0.5" value="${h(p.maxPoints)}" required></label><button type="button" class="icon-btn remove-point" aria-label="移除此评分点">${icon('close')}</button></div>`).join('');}
function rubricEditor(questions){return questions.map((q,i)=>`<article class="rubric-question" data-question><div class="question-bar"><h3>第 ${i+1} 题</h3><label>题号<input name="qid" value="${h(q.id)}" required maxlength="30" aria-label="第 ${i+1} 题题号"></label><label>满分<input name="points" type="number" min="0.5" max="100" step="0.5" value="${h(q.maxPoints)}" required aria-label="第 ${i+1} 题满分"></label><button type="button" class="icon-btn remove-question" aria-label="删除第 ${i+1} 题">${icon('close')}</button></div><div class="stack"><label class="field"><span>题型</span><select name="questionType"><option value="short" ${q.type!=='choice'?'selected':''}>简答题</option><option value="choice" ${q.type==='choice'?'selected':''}>选择题</option></select></label>${area('题目（学生可见）','prompt',q.prompt)}${area('参考答案','answer',q.answer,'required')}<div class="choice-settings stack" ${q.type==='choice'?'':'hidden'}><div class="field-row"><label class="field"><span>选择方式</span><select name="choiceMode"><option value="single" ${q.choiceMode!=='multiple'?'selected':''}>单选</option><option value="multiple" ${q.choiceMode==='multiple'?'selected':''}>多选</option></select></label>${field('正确选项','correctOptions',(Array.isArray(q.correctOptions)?q.correctOptions.join(', '):q.correctOptions||''),'text','placeholder="例如 B 或 A, C"')}</div><p class="hint">选项完全一致得满分，多选漏选或错选不得分。</p></div>${area('评分说明与可接受的表达','criteria',q.criteria,'required')}<div class="short-settings" ${q.type==='choice'?'hidden':''}><h4>逐点评分</h4><div class="point-list">${pointEditor(q.scoringPoints)}</div><button type="button" class="secondary add-point">添加评分点</button><p class="hint">各评分点分值之和须等于本题满分。未确认逐点评分的题目会进入教师复核。</p></div>${field('知识点（可选）','knowledge',q.knowledge||'')}${field('答案出处','sourcePages',q.sourcePages||'文字答案')}</div></article>`).join('');}
function readRubric(){return $$('[data-question]').map(el=>({id:$('[name=qid]',el).value,prompt:$('[name=prompt]',el).value,answer:$('[name=answer]',el).value,criteria:$('[name=criteria]',el).value,maxPoints:Number($('[name=points]',el).value),sourcePages:$('[name=sourcePages]',el).value,type:$('[name=questionType]',el).value,choiceMode:$('[name=choiceMode]',el).value,correctOptions:$('[name=correctOptions]',el).value,knowledge:$('[name=knowledge]',el).value,scoringPoints:$$('[data-point]',el).map(p=>({criterion:$('[name=criterion]',p).value,maxPoints:Number($('[name=pointMax]',p).value)}))}));}

async function answerPage(id) {
  const renderId = state.routeVersion;
  const { assignment: a } = await api("assignments/" + id);
  await metadata([...a.answerFiles, ...a.questionFiles]);
  if (renderId !== state.routeVersion) return;
  const questions = a.draftRubric || a.rubric || [];
  main.innerHTML = `<section class="paper">${head("ANSWER KEY / " + h(a.course), "上传参考答案", a.title, `<span class="answer-private">仅教师可见</span>` + link("assignments", "返回"))}<div class="split"><section><div class="section-head"><h2>你的参考答案</h2>${badge(a.status)}</div><form id="source-form" class="stack"><div id="answer-upload"></div><details ${a.answerFiles.length ? "" : "open"}><summary>文字答案</summary>${area("文字答案", "answerText", a.answerText, 'placeholder="可直接粘贴答案、题号与评分说明…"')}</details><details><summary>题目附件与学生说明</summary><div class="stack">${area("学生可见的题目要求", "instructions", a.instructions)}<div id="question-upload"></div></div></details><p class="form-error" role="alert"></p><div class="actions"><button type="submit" class="secondary">保存原始答案</button><button type="button" id="parse-answer" class="primary">AI 整理评分点</button></div><p class="hint">上传的答案保留原件。AI 整理后，请核对右侧评分点，再启用批改。</p></form>${a.answerFiles.length ? `<button class="link" data-preview="${a.answerFiles[0]}">打开原始答案</button>` : ""}${["queued", "parsing"].includes(a.status) ? '<div class="status-line" id="parse-status">正在后台整理答案。你可以离开页面，任务会继续保存。</div>' : ""}${a.error ? `<p class="error">${h(a.error)}</p>` : ""}</section><section><div class="section-head"><h2>核对评分点</h2><span class="hint">${a.version ? "当前 v" + a.version : "待确认"}</span></div><form id="rubric-form"><div id="questions">${questions.length ? rubricEditor(questions) : empty("先整理，再确认", "使用左侧答案生成评分点，也可以手动添加。")}</div><button type="button" id="add-question" class="secondary">添加题目</button><hr class="rule"><label class="check"><input type="checkbox" name="confirmed" required>我已核对每题答案、满分和评分点</label><p class="hint">确认后，学生即可提交。参考答案保持私密，发布成绩只展示得分和反馈。修改评分标准会生成新版本。</p><p class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="primary wide">确认答案并发布作业</button></div></form></section></div></section>`;
  let sourceDirty = false;
  const markDirty = () => (sourceDirty = true);
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
      markDirty,
    );
  let revision = a.sourceRevision || 0;
  const saveSource = async () => {
    if (au.busy() || qu.busy()) throw new Error("请等待文件上传完成");
    const b = formData($("#source-form"));
    const result = await put(`assignments/${id}/source`, {
      ...b,
      answerFiles: au.ids(),
      questionFiles: qu.ids(),
      sourceRevision: revision,
    });
    revision = result.assignment.sourceRevision;
    return result;
  };
  formHandler($("#source-form"), async () => {
    await saveSource();
    toast("原始答案已保存");
  });
  click("#parse-answer", async () => {
    await saveSource();
    await post(`assignments/${id}/parse`);
    await render();
    toast("已加入后台处理队列");
  });
  const bindRemove = () => {
    $$(".remove-question").forEach(b=>b.onclick=()=>{sourceDirty=true;b.closest('[data-question]').remove();});
    $$('[data-question]').forEach(el=>{
      const type=$('[name=questionType]',el);
      const update=()=>{const choice=type.value==='choice';$('.choice-settings',el).hidden=!choice;$('.short-settings',el).hidden=choice;$$('.short-settings input',el).forEach(x=>x.disabled=choice);};
      type.onchange=update;update();
      $('.add-point',el).onclick=()=>{$('.point-list',el).insertAdjacentHTML('beforeend',pointEditor([{criterion:'',maxPoints:1}]));sourceDirty=true;bindRemove();};
    });
    $$('.remove-point').forEach(b=>b.onclick=()=>{sourceDirty=true;b.closest('[data-point]').remove();});
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
    bindRemove();
  });
  formHandler($("#rubric-form"), async () => {
    if (au.busy() || qu.busy()) throw new Error("请等待上传完成");
    const questions = readRubric();
    if(!questions.length)throw new Error("请至少确认一道题");
    await saveSource();
    await post(`assignments/${id}/confirm`, {
      questions,
      sourceRevision: revision,
    });
    toast("评分标准已确认，学生现在可以提交");
    go("assignments");
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
async function submitPage(id) {
 const version=state.routeVersion,{assignment:a}=await api('assignments/'+id);
 const all=state.submissions.filter(s=>s.assignmentId===id),draft=all.find(s=>s.status==='draft'),record=assignmentRecords(all,[a])[0],latest=record?.latest;
 const cacheKey=`hw-work:${state.user.id}:${id}`;let cached;
 try{cached=JSON.parse(sessionStorage.getItem(cacheKey)||'null');}catch{}
 if(cached&&all.some(s=>s.status!=='draft'&&s.clientId===cached.clientId))cached=null;
 const useCache=cached&&(!draft||cached.updatedAt>Date.parse(draft.updatedAt));
 let clientId=useCache?cached.clientId:draft?.clientId||crypto.randomUUID();
 let initialFiles=useCache?cached.files:draft?.files||latest?.files||[],initialText=useCache?cached.text:draft?.text??latest?.text??'';
 await metadata([...a.questionFiles,...initialFiles]);if(version!==state.routeVersion)return;
 const expired=a.dueAt&&Date.parse(a.dueAt)<Date.now()&&!a.allowLate&&latest?.status!=='returned';
 const locked=expired||(a.allowResubmit===false&&latest&&latest.status!=='returned');
 const max=(a.questions||[]).reduce((n,q)=>n+q.maxPoints,0);
 main.innerHTML=`<section class="paper submit-paper">${head('',a.title,`${a.dueAt?'截止 '+date(a.dueAt):'不限截止时间'}${max?' · 满分 '+max+' 分':''}`,link('assignments','返回作业'))}<div class="submission-layout"><section class="assignment-reading"><details class="assignment-brief" ${innerWidth>760?'open':''}><summary>查看题目与要求</summary><p class="instructions">${h(a.instructions||'根据题目完成作答，照片请包含完整题号。')}</p>${(a.questions||[]).map(q=>`<div class="published-question"><h3>第 ${h(q.id)} 题 <span class="hint">${q.maxPoints} 分</span></h3><p>${h(q.prompt)}</p></div>`).join('')}<div class="file-list">${fileMarkup(a.questionFiles)}</div></details><a class="secondary" href="/api/homework/assignments/${id}/pdf" download>保存题目 PDF</a>${latest?`<div class="previous-submission"><p>上次提交 ${date(latest.submittedAt)}</p>${badge(latest.status)}${link('result/'+latest.id,'查看上次提交')}${record.grade?`<p class="hint">已有成绩 ${record.grade.total}/${record.grade.maxPoints}，新结果出来前会保留。</p>`:''}</div>`:''}</section><section class="submission-compose"><div class="section-head"><h2>${latest?'补充或重新提交':'提交你的作业'}</h2><span class="hint">账号与班级已带入</span></div>${locked?`<p class="status-line" role="status">${expired?'已过截止时间。你可以继续保存草稿，请联系老师开放补交。':'老师已关闭重新提交。原作答和成绩仍可查看。'}</p>`:''}<form id="submit-form" class="stack"><div class="input-modes" role="group" aria-label="添加作答"><button type="button" data-mode="photo" aria-pressed="true">拍照</button><button type="button" data-mode="pdf" aria-pressed="false">PDF</button><button type="button" data-mode="text" aria-pressed="false">文字</button></div><div id="student-upload"></div><details id="typed-answer" ${initialText?'open':''}><summary>补充文字答案</summary>${area('按题号填写答案','answer',initialText,'maxlength="40000" placeholder="例如：第 1 题… 第 2 题…"')}</details><div class="submit-check"><p id="page-summary"></p><p class="hint">提交前确认：题号完整、文字清楚、没有漏页。</p></div><p class="draft-feedback" id="draft-status" role="status">${useCache?'已恢复这台设备上未完成的草稿。':draft?'已恢复账户草稿。':latest?'已带入上次作答。请保留正确页面，只替换或补充需要修改的部分。':'填写后会自动保存草稿。'}</p><p class="form-error" role="alert"></p><div class="actions submit-actions"><button type="button" id="save-draft" class="secondary">保存草稿</button><button type="submit" class="primary" ${locked?'disabled':''}>${latest?'提交新版本':'提交作业'}</button></div><p class="hint">提交后可以关闭页面，批阅结果会自动保留。</p></form></section></div></section>`;
 const form=$('#submit-form'),textArea=$('[name=answer]',form),status=$('#draft-status'),pageSummary=$('#page-summary');
 let submitted=false,autosave,dirty=Boolean(useCache||(!draft&&latest)),writing=Promise.resolve(),localSaved=true,revision=0;
 const widget=uploadWidget($('#student-upload'),'submission',initialFiles,changed);
 const snapshot=()=>({assignmentId:id,text:textArea.value,files:[...widget.ids()],clientId});
 function cache(){try{sessionStorage.setItem(cacheKey,JSON.stringify({...snapshot(),updatedAt:Date.now()}));localSaved=true;}catch{localSaved=false;}}
 function summary(){const pages=widget.ids().reduce((n,x)=>n+(state.files.get(x)?.pages||0),0);pageSummary.textContent=pages?`已添加 ${pages} 页${textArea.value.trim()?'，另有文字答案':''}`:textArea.value.trim()?'已填写文字答案':'还没有添加作答';}
 function changed(){dirty=true;revision++;cache();summary();clearTimeout(autosave);if(!widget.busy())autosave=setTimeout(()=>{if(!submitted)save(true).catch(e=>{status.textContent=e.message+(localSaved?' 当前内容已在此页面暂存。':' 请暂时不要关闭页面。');if(e.retryable&&form.isConnected)autosave=setTimeout(online,3000);});},1000);}
 function save(isDraft){
  if(widget.busy())return Promise.reject(Error('附件仍在上传，请稍等。已经添加的页面会保留。'));
  const body={...snapshot(),draft:isDraft},captured=revision;
  writing=writing.catch(()=>{}).then(()=>post('submissions',body)).then(value=>{if(captured===revision)dirty=false;if(form.isConnected&&isDraft)status.textContent='草稿已保存到账户 · '+date(new Date());return value;});return writing;
 }
 function beforeUnload(e){cache();if(widget.busy()||dirty){e.preventDefault();e.returnValue='';}}
 const online=()=>{clearTimeout(autosave);let attempts=0;const retry=async()=>{if(!form.isConnected||!dirty||submitted)return;try{await save(true);}catch(e){status.textContent=e.message+(localSaved?' 当前内容已在此页面暂存。':' 请暂时不要关闭页面。');if(e.retryable&&form.isConnected)autosave=setTimeout(retry,Math.min(5000,1500*++attempts));}};autosave=setTimeout(retry,300);};
 window.addEventListener('beforeunload',beforeUnload);window.addEventListener('online',online);
 state.viewCleanup=()=>{clearTimeout(autosave);window.removeEventListener('beforeunload',beforeUnload);window.removeEventListener('online',online);if(!submitted){cache();if(dirty&&!widget.busy())void save(true).catch(()=>{});}};
 textArea.addEventListener('input',changed);summary();if(dirty){cache();online();}
 $$('[data-mode]',form).forEach(b=>b.onclick=()=>{$$('[data-mode]',form).forEach(x=>x.setAttribute('aria-pressed',x===b));if(b.dataset.mode==='text'){$('#typed-answer').open=true;textArea.focus();}else if(b.dataset.mode==='pdf'){const input=$('.upload input',form);input.accept='application/pdf';input.click();input.accept='image/jpeg,image/png,image/webp,application/pdf';}else $('.camera-input',form).click();});
 click('#save-draft',async()=>{clearTimeout(autosave);await save(true);toast('草稿已保存，稍后可以继续');});
 formHandler(form,async()=>{if(locked)throw Error('请联系老师开放提交');clearTimeout(autosave);const controls=$$('input,textarea,button',form).map(el=>({el,disabled:el.disabled}));controls.forEach(({el})=>el.disabled=true);try{const {submission}=await save(false);submitted=true;sessionStorage.removeItem(cacheKey);toast('提交成功，原件已保存');if(form.isConnected)go('result/'+submission.id);}finally{controls.forEach(({el,disabled})=>el.disabled=disabled);}});
 bindPreviews();
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
  main.innerHTML = `<section class="paper">${head(teacher ? "REVIEW / 教师复核" : "SUBMISSIONS / 我的记录", teacher ? "待复核的作业" : "提交记录", teacher ? "只处理需要确认的作答，以及学生提出的复核申请。" : "每次提交都会保留。成绩发布后，可在这里查看反馈。", link("assignments", "返回作业"))}${rows.length ? submissionRows(rows) : empty(teacher ? "这里等待第一份作业" : "还没有提交记录", teacher ? "正常结果会按作业设置返回；需要确认的作答会集中出现在这里。" : "完成一份作业后，你的提交记录会出现在这里。")}</section>`;
}
async function resultPage(id) {
 const version=state.routeVersion,{submission:s}=await api('submissions/'+id);
 const a=state.assignments.find(x=>x.id===s.assignmentId)||s.assignment||{title:'作业提交'};
 await metadata(s.files);if(version!==state.routeVersion)return;
 const g=s.publishedGrade,types=questionTotals(g,s.questions||[]),uncertain=s.status==='needs_review';
 const statusTitle=s.status==='returned'?'需要补充作答':uncertain?'等待老师确认':s.status==='grading'?'正在后台批阅':'作业已提交';
 const steps=`<ol class="grading-steps"><li class="complete"><span></span><div><strong>已保存原件</strong><p>提交编号 ${h(s.id.slice(0,12).toUpperCase())}</p></div></li><li class="${s.status==='grading'?'current':''}"><span></span><div><strong>${s.status==='returned'?'需要补充作答':uncertain?'待教师确认':s.status==='grading'?'正在后台批阅':'排队等待批阅'}</strong><p>${s.status==='returned'?h(s.returnedReason):uncertain?'这份作答需要进一步核对，暂不确定总分。':'可以关闭页面，任务会继续保留。'}</p></div></li><li><span></span><div><strong>成绩与错题自动归档</strong><p>结果返回后，在“成绩”中随时查看。</p></div></li></ol>`;
 main.innerHTML=`<section class="paper result-paper">${head('',g?'本次成绩':statusTitle,a.title,link('grades','成绩档案'))}<div class="result-layout"><section class="result-main">${g?`<div class="result-score"><strong>${g.total}<small>/${g.maxPoints}</small></strong><span>${Math.round(g.total/g.maxPoints*1000)/10}%</span></div><div class="score-breakdown">${types.choice.max?`<span>选择题 <strong>${types.choice.score}/${types.choice.max}</strong></span>`:''}${types.short.max?`<span>简答题 <strong>${types.short.score}/${types.short.max}</strong></span>`:''}</div>${s.status!=='published'?'<p class="status-line">此前成绩保留；新一轮批阅或复核完成后会更新。</p>':''}<div class="section-head"><h2>逐题反馈</h2><span class="hint">${g.questions.filter(q=>q.score<q.maxPoints).length} 道失分题</span></div><div class="filter-tabs" role="group" aria-label="题目筛选"><button data-question-filter="wrong" aria-pressed="true">失分题</button><button data-question-filter="all" aria-pressed="false">全部题目</button></div><div id="question-results">${g.questions.map(q=>`<details class="result-question" data-correct="${q.score===q.maxPoints}" ${q.score<q.maxPoints?'open':''}><summary><span>第 ${h(q.id)} 题</span><strong>${q.score}/${q.maxPoints}</strong></summary><div class="question-detail"><p class="instructions">${h(q.feedback)}</p><details class="evidence"><summary>查看作答依据</summary><p class="instructions">${h(q.evidence)}</p></details>${q.score<q.maxPoints?link('mistakes/'+s.assignmentId+'/'+encodeURIComponent(q.id),'回看与订正'):''}<details class="review-appeal"><summary>对这道题的评分有疑问</summary>${(s.reviewRequests||[]).some(r=>r.questionId===q.id&&r.status==='open')?'<p class="status-line">已申请复核，当前成绩会保留到老师处理完成。</p>':`<form data-appeal="${h(q.id)}" class="stack">${area('需要老师核对什么','reason','','required maxlength="1500" placeholder="例如：我在第二页写出了这个计算步骤…"')}<p class="form-error" role="alert"></p><button class="secondary" type="submit">申请复核</button></form>`}</details></div></details>`).join('')}</div><p id="all-correct" class="empty-inline" hidden>这次没有失分题。你可以切换到全部题目回顾反馈。</p>${g.teacherNote?`<p class="instructions">${h(g.teacherNote)}</p>`:''}<p class="hint">${g.source==='automatic'?'自动批阅':'教师已确认'} · ${date(g.publishedAt)} · 答案 v${g.answerVersion}</p><div class="actions"><a class="primary" href="/api/homework/submissions/${s.id}/pdf?kind=grade" download>下载批改 PDF</a>${link('mistakes','查看错题集')}</div>`:steps+`<div class="actions">${link('assignments','返回作业列表','primary')}${s.status==='returned'?link('submit/'+s.assignmentId,'补充作业'):''}</div>`}</section><aside class="submission-receipt"><h2>我的原始作答</h2><p class="meta">${date(s.submittedAt)}${s.late?' · 迟交':''}</p><div class="file-list">${fileMarkup(s.files)}</div><details ${s.text?'open':''}><summary>文字作答</summary><p class="instructions">${h(s.text||'本次作答见附件。')}</p></details><a class="secondary" href="/api/homework/submissions/${s.id}/pdf" download>保存作业 PDF</a>${a.allowResubmit!==false&&(!a.dueAt||Date.parse(a.dueAt)>Date.now()||a.allowLate)?link('submit/'+s.assignmentId,'补充或重新提交','link'):''}${s.gradeHistory?.length?`<details class="grade-revisions"><summary>历次成绩版本</summary>${s.gradeHistory.map(v=>`<p>${date(v.publishedAt)} · ${v.total}/${v.maxPoints} · 答案 v${v.answerVersion}</p>`).join('')}</details>`:''}</aside></div></section>`;
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
  await metadata(s.files);
  if (renderId !== state.routeVersion) return;
  const suggestions =
    (s.status==="needs_review"?s.suggestedGrade?.questions:s.publishedGrade?.questions) || s.suggestedGrade?.questions ||
    s.rubricSnapshot?.map((q) => ({
      id: q.id,
      score: null,
      maxPoints: q.maxPoints,
      evidence: "",
      feedback: "",
      needsReview: true,
    })) ||
    [];
  main.innerHTML = `<section class="paper">${head("REVIEW / " + h(a?.title || "作业复核"), name + "的作业", "提交于 " + date(s.submittedAt) + " · 使用评分标准 v" + s.version, badge(s.status) + link("reviews", "返回待复核"))}<div class="review-layout"><section class="review-source"><div class="section-head"><h2>原始作答</h2></div><div class="file-list">${fileMarkup(s.files)}</div>${s.files[0] ? (state.files.get(s.files[0]).mime === "application/pdf" ? `<div class="pdf-preview" data-pdf="${s.files[0]}"></div>` : `<img class="original-preview" src="/api/homework/files/${s.files[0]}" alt="学生原始答案">`) : ""}<div class="instructions">${h(s.text)}</div>${s.error ? `<p class="error">${h(s.error)}</p>` : ""}${(s.reviewRequests||[]).filter(r=>r.status==="open").map(r=>`<div class="review-request"><h3>学生申请复核第 ${h(r.questionId)} 题</h3><p>${h(r.reason)}</p></div>`).join("")}<div class="actions"><button class="secondary" id="regrade">按最新标准重新批改</button><button class="quiet" id="return-work">退回重交</button></div><form id="return-form" hidden class="stack">${area("退回原因", "reason", "", "required")}<p class="form-error" role="alert"></p><button type="submit" class="danger">确认退回</button></form></section><section><div class="section-head"><h2>逐题复核</h2><span class="answer-private">发布前仅教师可见</span></div>${["queued", "grading"].includes(s.status) ? '<div class="status-line">批改正在排队或进行中。完成后会自动更新。</div>' : ""}<form id="review-form">${suggestions
    .map((q) => {
      const ref = s.rubricSnapshot.find((r) => r.id === q.id);
      return `<article class="rubric-question" data-grade data-qid="${h(q.id)}"><div class="question-bar"><h3>第 ${h(q.id)} 题</h3><label>得分<input name="score" type="number" min="0" max="${q.maxPoints}" step="0.5" value="${q.score ?? ""}" required aria-label="第 ${h(q.id)} 题得分"></label><span class="hint">/ ${q.maxPoints}</span></div><details><summary>查看本次评分标准</summary><div class="instructions">${h(ref.answer)}<br><br>${h(ref.criteria)}</div></details><div class="stack">${area("学生作答依据", "evidence", q.evidence, "required")}${area("给学生的反馈", "feedback", q.feedback, "required")}<label class="check"><input type="checkbox" name="checked" required>我已核对原始作答与本题得分</label></div></article>`;
    })
    .join(
      "",
    )}${area("整体建议（可选）", "teacherNote", s.publishedGrade?.teacherNote || "")}<p class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="primary wide" ${["queued", "grading"].includes(s.status) ? "disabled" : ""}>确认并发布成绩</button></div><p class="hint">学生只会看到分数、作答依据与反馈；参考答案不会公开。</p></form></section></div></section>`;
  bindPreviews();
  click("#regrade", async () => {
    await post("submissions/" + id + "/regrade");
    toast("已按最新评分标准重新排队");
    render();
  });
  click("#return-work", () => {
    $("#return-form").hidden = !$("#return-form").hidden;
  });
  formHandler($("#return-form"), async (b) => {
    await post("submissions/" + id + "/return", b);
    toast("已退回，学生可重新提交");
    go("reviews");
  });
  if (["queued", "grading"].includes(s.status))
    $$("input,textarea", $("#review-form")).forEach(
      (el) => (el.disabled = true),
    );
  formHandler($("#review-form"), async (b) => {
    const questions = $$("[data-grade]").map((el) => ({
      id: el.dataset.qid,
      score: Number($("[name=score]", el).value),
      evidence: $("[name=evidence]", el).value,
      feedback: $("[name=feedback]", el).value,
      needsReview: false,
    }));
    await post("submissions/" + id + "/publish", {
      questions,
      teacherNote: b.teacherNote,
      jobId: s.jobId,
    });
    toast("成绩已发布");
    go("reviews");
  });
  if (["queued", "grading"].includes(s.status))
    pollTimer = setTimeout(() => render(false), 15000);
}
async function devicePage() {
  const { device: d, settings: s } = await api("device");
  const cloud = s.execution === "cloud";
  const selected = cloud ? "deepseek" : s.provider;
  const status = d?.revoked ? "已暂停" : cloud && !s.hasApiKey ? "待填写 API Key" : d?.online ? d.busy ? "正在批改" : d.modelReady ? "已连接 · 可以批改" : "已连接 · 待配置模型" : "未连接 · 作业会继续排队";
  main.innerHTML = `<section class="paper">${head("", "批改引擎", "云端持续处理，本机随时备用。")}
    <div class="device-grid"><section>
      <h2 class="device-title">${cloud ? "DeepSeek 云端" : "本机批改"}</h2>
      <p class="device-status" role="status"><span class="device-dot ${d?.online ? "online" : ""}"></span>${status}</p>
      <dl class="device-detail"><div><dt>当前模型</dt><dd>${h(s.model)}</dd></div><div><dt>运行位置</dt><dd>${cloud ? "Railway · Mac 关机仍可处理" : "你的 Mac · 开机联网时处理"}</dd></div><div><dt>成绩发布</dt><dd>${s.autoPublishValidatedFor?"按作业设置返回，异常结果转复核":"先复核样本，验证后可开启自动返回"}</dd></div></dl>
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
      <p class="hint">密钥加密保存，学生无法查看。切回本机时会保留 DeepSeek 配置。</p><label class="check"><input type="checkbox" name="autoPublishValidated" ${s.autoPublishValidatedFor?"checked":""}>我已用人工批改样本验证当前模型，同意对校验通过的作业自动返回成绩</label><p class="hint">未勾选时，学生可以正常提交，批阅结果先进入教师复核。切换模型后需要重新验证。</p>
      <p class="form-error" role="alert"></p><button type="submit" class="primary">保存批改设置</button></form>
    </section></div></section>`;
  const form = $("#settings-form"), provider = $("[name=provider]", form);
  function updateProvider(reset) {
    const kind = provider.value, deepseek = kind === "deepseek", local = kind === "ollama";
    $("#cloud-fields").hidden = local;
    $("#model-fields").hidden = deepseek;
    $("#provider-note").textContent = deepseek ? "使用 deepseek-flash，支持文字、图片和 PDF。由 Railway 处理，无需保持 Mac 开机。" : local ? "本机模型保留作备用。需要保持 Mac 开机并联网。" : "由你的 Mac 调用填写的兼容接口。";
    if (reset) {
      $("[name=autoPublishValidated]",form).checked=false;
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
    b.autoPublishValidated=$("[name=autoPublishValidated]",form).checked;
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
  main.innerHTML = `<section class="paper">${head("ACCOUNT / 账户与班级", state.user.name, teacher ? "教师账户" : "学生账户", `<button id="logout" class="secondary">退出登录</button>`)}<div class="split"><section><h2>我的班级</h2><div class="class-list">${state.classes.map((c) => `<div class="class-line"><span>${h(c.name)}</span>${teacher ? `<div><span class="hint">${c.source === "bookself" ? "注册班级码" : "原作业班级码"}</span><code>${h(c.invite)}</code></div>` : ""}</div>`).join("") || `<p class="muted">${state.user.unified ? (teacher ? '尚无可用班级，请在 Bookself 教师端确认。' : '暂未关联到班级，请联系老师核对注册信息。') : '尚未加入班级'}</p>`}</div>${state.user.unified ? `<p class="hint">${teacher ? "与 Bookself 共用班级和注册班级码。班级调整请在 Bookself 教师端完成。" : "已沿用注册时的班级，无需再次加入。需要转班时，请联系老师。"}</p>` : `<hr class="rule"><form id="class-form" class="stack">${field(teacher ? "新班级名称" : "加入另一个班级", "value", "", "text", `required placeholder="${teacher ? "例如：AP 宏观 2026 A 班" : "输入班级邀请码"}"`)}<p class="form-error" role="alert"></p><button type="submit" class="primary">${teacher ? "创建班级" : "加入班级"}</button></form>${teacher ? '<p class="hint" style="margin-top:20px">学生使用 Bookself 账号登录，再通过此邀请码加入作业班级。</p>' : ""}`}</section><section><h2>修改密码</h2><form id="password-form" class="stack" style="margin-top:24px">${field("当前密码", "current", "", "password", 'required autocomplete="current-password"')}${field("新密码", "password", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}${field("确认新密码", "confirm", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}<p class="hint">使用至少 10 位密码。修改后，其他设备需要重新登录。</p><p class="form-error" role="alert"></p><button type="submit" class="secondary">更新密码</button></form></section></div></section>`;
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
  state.viewCleanup?.();state.viewCleanup=null;
  clearPDFs();
  if (!state.user) return showLogin();
  clearTimeout(pollTimer);
  const version = ++state.routeVersion;
  main.setAttribute("aria-busy", "true");
  const [route = "assignments", id, questionId] = location.hash.slice(1).split("/").map(x=>{try{return decodeURIComponent(x)}catch{return x}});
  try {
    await refresh();
    if (version !== state.routeVersion) return;
    const teacher = state.user.role === "teacher";
    if (
      !teacher &&
      ["new", "answer", "reviews", "review", "device", "overview", "gradebook"].includes(route)
    ) {
      go("assignments");
      return;
    }
    nav?.select(teacher?(['gradebook','device'].includes(route)?2:['reviews','review'].includes(route)?1:0):route==='mistakes'?2:['grades','history','result'].includes(route)?1:0);
    const learning=createLearningUI({state,main,api,post,put,h,head,link,badge,date,click,formHandler,area,field,bindPreviews,fileMarkup,metadata,uploadWidget,toast,go});
    if (route === "new") newAssignment();
    else if (route === "answer" && id) await answerPage(id);
    else if (route === "submit" && id) await submitPage(id);
    else if (route === "reviews") reviews(id);
    else if (["grades","history","gradebook"].includes(route))await learning.gradebook(id);
    else if(route==="mistakes")await learning.mistakes(id,questionId);
    else if(route==="overview"&&id)await learning.overview(id);
    else if (route === "result" && id) await resultPage(id);
    else if (route === "review" && id) await reviewPage(id);
    else if (route === "device") await devicePage();
    else if (route === "account") accountPage();
    else assignments();
    if (scroll) {main.scrollTo({ top: 0, behavior: "instant" });main.focus({preventScroll:true});}
  } catch (e) {
    if (!state.user || version !== state.routeVersion) return;
    main.innerHTML = `<section class="paper">${head("WORKSPACE", "暂时无法打开")}<p class="error" role="alert">${h(e.message)}</p><div class="form-actions"><button id="retry" class="primary">重试</button>${link("assignments", "返回作业")}</div></section>`;
    click("#retry", () => render());
  } finally {
    if(version===state.routeVersion)main.setAttribute("aria-busy", "false");
  }
}
window.addEventListener("hashchange", () => render());
try {
  await loginResult(await api("me"));
} catch {
  showLogin();
}

async function renderPDFs(root = document) {
  for (const [el, task] of pdfTasks)
    if (!el.isConnected) {
      task.destroy().catch(() => {});
      pdfTasks.delete(el);
    }
  for (const el of $$(".pdf-preview:not([data-loading])", root)) {
    el.dataset.loading = "true";
    el.innerHTML = '<p class="hint">正在打开 PDF…</p>';
    try {
      pdfModule ||= import("/assets/pdfjs/pdf.mjs");
      const lib = await pdfModule;
      lib.GlobalWorkerOptions.workerSrc = "/assets/pdfjs/pdf.worker.mjs";
      const task = lib.getDocument({
        url: "/api/homework/files/" + el.dataset.pdf,
        cMapUrl: "/assets/pdfjs/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "/assets/pdfjs/standard_fonts/",
        wasmUrl: "/assets/pdfjs/wasm/",
        isEvalSupported: false,
      });
      pdfTasks.set(el, task);
      const doc = await task.promise;
      if (!el.isConnected) {
        await task.destroy();
        continue;
      }
      el.innerHTML = `<div class="pdf-tools"><button type="button" class="icon-btn pdf-prev" aria-label="上一页">${icon("left")}</button><span class="hint pdf-page"></span><button type="button" class="icon-btn pdf-next" aria-label="下一页">${icon("right")}</button></div><canvas role="img" aria-label="PDF 页面预览"></canvas>`;
      let current = 1,
        busy = false;
      async function page() {
        if (busy || !el.isConnected) return;
        busy = true;
        try {
          const p = await doc.getPage(current),
            base = p.getViewport({ scale: 1 }),
            view = p.getViewport({
              scale: Math.min(
                2,
                (Math.max(200, el.clientWidth - 8) *
                  Math.min(2, devicePixelRatio)) /
                  base.width,
              ),
            }),
            canvas = $("canvas", el);
          canvas.width = view.width;
          canvas.height = view.height;
          await p.render({
            canvasContext: canvas.getContext("2d"),
            viewport: view,
          }).promise;
          $(".pdf-page", el).textContent =
            current + " / " + doc.numPages + " 页";
          $(".pdf-prev", el).disabled = current === 1;
          $(".pdf-next", el).disabled = current === doc.numPages;
        } finally {
          busy = false;
        }
      }
      $(".pdf-prev", el).onclick = () => {
        if (!busy && current > 1) {
          current--;
          page();
        }
      };
      $(".pdf-next", el).onclick = () => {
        if (!busy && current < doc.numPages) {
          current++;
          page();
        }
      };
      await page();
    } catch {
      el.innerHTML = '<p class="hint">预览暂不可用，请点击文件名打开原件。</p>';
    }
  }
}

// Revalidate an already-open workspace when returning after another page signs out.
if (document.documentElement.dataset.unified === 'true') {
  let checkingSession = false;
  async function checkUnifiedSession() {
    if (checkingSession || document.hidden || !state.user) return;
    checkingSession = true;
    try {
      const result = await api('me');
      if (result.user?.id !== state.user?.id) {
        document.documentElement.style.visibility = 'hidden';
        location.reload();
      }
    } catch {} finally { checkingSession = false; }
  }
  window.addEventListener('focus', checkUnifiedSession);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      document.documentElement.style.visibility = 'hidden';
      location.reload();
    } else void checkUnifiedSession();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void checkUnifiedSession();
  });
  setInterval(checkUnifiedSession, 30000);
}
