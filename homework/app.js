import { setupDock } from "./nav.js";
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
  queued: "等待本地设备",
  parsing: "正在整理答案",
  answer_review: "待确认评分点",
  ready: "已启用",
  grading: "正在批改",
  needs_review: "等待教师复核",
  published: "已发布",
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
  const response = await fetch("/api/homework/" + path, {
    credentials: "same-origin",
    ...options,
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
}
const post = (path, body = {}) => api(path, { method: "POST", body });
const put = (path, body) => api(path, { method: "PUT", body });
const formData = (form) => Object.fromEntries(new FormData(form));
function formHandler(form, fn) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const error = $(".form-error", form);
    if (error) error.textContent = "";
    const buttons = $$("button[type=submit]", form);
    buttons.forEach((b) => (b.disabled = true));
    try {
      await fn(formData(form));
    } catch (e) {
      if (error) error.textContent = e.message;
      else toast(e.message);
    } finally {
      buttons.forEach((b) => (b.disabled = false));
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
        { label: "设备", route: "device" },
      ]
    : [
        { label: "作业", route: "assignments" },
        { label: "提交记录", route: "history" },
        { label: "账户", route: "account" },
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
  const teacher = state.user.role === "teacher",
    latest = state.submissions
      .filter((s) => s.assignmentId === a.id && s.status !== "draft")
      .sort((a, b) =>
        (b.submittedAt || "").localeCompare(a.submittedAt || ""),
      )[0],
    count = state.submissions.filter(
      (s) => s.assignmentId === a.id && s.status === "needs_review",
    ).length;
  return `<article class="assignment-row"><div><a href="#${teacher ? "answer" : "submit"}/${a.id}" class="text-button"><h2>${h(a.title)}</h2></a><div class="meta"><span>${h(a.course)}</span><span>${a.classIds.map((x) => h(state.classes.find((c) => c.id === x)?.name || "班级")).join(" · ")}</span><span>截止 ${date(a.dueAt)}</span>${a.version ? `<span>评分标准 v${a.version}</span>` : ""}</div></div><div class="actions">${badge(teacher ? a.status : latest?.status || "待提交")}${teacher ? link("reviews/" + a.id, `复核${count ? " · " + count : ""}`) + link("answer/" + a.id, "管理答案", "primary") : link("submit/" + a.id, latest ? "查看作业" : "开始提交", "primary")}</div></article>`;
}
function assignments() {
  const teacher = state.user.role === "teacher";
  main.innerHTML = `<section class="paper">${head("HOMEWORK / 作业工作台", teacher ? "布置与批改" : "我的作业", teacher ? "你的答案，决定每一次批改的标准。" : "图片、PDF 或文字，选择适合你的提交方式。", teacher ? link("account", "班级管理") + link("new", "布置作业", "primary") : "")}${state.assignments.length ? state.assignments.map(row).join("") : empty(teacher ? "从一份作业开始" : "还没有待完成的作业", teacher ? "创建班级，上传你的参考答案，确认评分点后即可接收作业。" : "教师发布作业后，会显示在这里。", link(teacher ? (state.classes.length ? "new" : "account") : "account", teacher ? (state.classes.length ? "布置第一份作业" : "创建班级") : "查看我的班级", "primary"))}</section>`;
}
function newAssignment() {
  if (!state.classes.length) {
    go("account");
    toast("先创建一个班级，即可布置作业");
    return;
  }
  main.innerHTML = `<section class="paper">${head("NEW ASSIGNMENT", "布置一份作业", "下一步上传参考答案，核对评分点。", link("assignments", "返回作业"))}<form id="new-assignment" class="stack small-form">${field("作业标题", "title", "", "text", 'required maxlength="120" placeholder="例如：AD–AS 图像与政策分析"')}<div class="field-row"><label class="field"><span>课程</span><select name="course"><option>AP 宏观经济学</option><option>AP 微观经济学</option><option>经济学</option></select></label>${field("截止时间（可选）", "dueAt", "", "datetime-local")}</div><fieldset><legend>布置给</legend>${state.classes.map((c) => `<label class="check"><input type="checkbox" name="classId" value="${c.id}" checked>${h(c.name)}</label>`).join("")}</fieldset>${area("题目与作业要求", "instructions", "", 'placeholder="填写题目、需要画图的要求、提交说明…"')}<p class="form-error" role="alert"></p><button class="primary" type="submit">继续 · 上传参考答案</button></form></section>`;
  formHandler($("#new-assignment"), async (b) => {
    b.classIds = $$("input[name=classId]:checked").map((x) => x.value);
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
      return `<div class="file"><button type="button" class="icon-btn" data-preview="${id}" aria-label="预览 ${h(f.name)}">${f.mime === "application/pdf" ? '<span class="file-thumb">PDF</span>' : `<img class="file-thumb" src="/api/homework/files/${id}" alt="" loading="lazy">`}</button><div><button type="button" class="text-button file-name" data-preview="${id}">${h(f.name)}</button><div class="hint">${f.pages} 页 · ${(f.size / 1024 / 1024).toFixed(1)} MB</div></div>${editable ? `<div class="file-tools">${f.mime.startsWith("image/") ? `<button type="button" class="icon-btn" data-rotate="${i}" aria-label="顺时针旋转 ${h(f.name)}">${icon("rotate")}</button>` : ""}<button type="button" class="icon-btn" data-up="${i}" aria-label="上移 ${h(f.name)}" ${i === 0 ? "disabled" : ""}>${icon("up")}</button><button type="button" class="icon-btn" data-remove="${i}" aria-label="移除 ${h(f.name)}">${icon("close")}</button></div>` : ""}</div>`;
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
  root.innerHTML = `<div class="file-list"></div>${purpose === "answer" ? '<div class="answer-inline-preview"></div>' : ""}<label class="upload"><span class="upload-icon" aria-hidden="true">${icon("up")}</span><strong>点击上传，或将文件拖到这里</strong><small class="muted">JPG / PNG / WebP / PDF · 单文件 20 MB</small><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple aria-label="上传${purpose === "answer" ? "参考答案" : purpose === "question" ? "题目" : "作业"}"></label><progress value="0" max="100" hidden aria-label="文件上传进度"></progress><p class="hint upload-status" role="status">最多 20 页，合计 50 MB。HEIC 请先转为 JPG。</p>`;
  const list = $(".file-list", root),
    status = $(".upload-status", root),
    progress = $("progress", root),
    input = $("input", root),
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
    bindPreviews(list);
    renderPDFs(root);
    $$("[data-rotate]", list).forEach(
      (b) =>
        (b.onclick = async () => {
          b.disabled = true;
          try {
            const i = Number(b.dataset.rotate),
              { file } = await post("files/" + ids[i] + "/rotate");
            state.files.set(file.id, file);
            ids[i] = file.id;
            draw();
            onChange(ids);
          } catch (e) {
            toast(e.message);
            b.disabled = false;
          }
        }),
    );
    $$("[data-remove]", list).forEach(
      (b) =>
        (b.onclick = () => {
          ids.splice(Number(b.dataset.remove), 1);
          draw();
          onChange(ids);
        }),
    );
    $$("[data-up]", list).forEach(
      (b) =>
        (b.onclick = () => {
          const i = Number(b.dataset.up);
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
    progress.hidden = false;
    try {
      for (const file of selected) {
        if (ids.length >= 20) throw new Error("最多上传 20 个附件");
        if (file.size > 20 * 1024 * 1024)
          throw new Error(file.name + " 超过 20 MB");
        if (
          ids.reduce((n, x) => n + (state.files.get(x)?.size || 0), 0) +
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
      input.value = "";
      progress.hidden = true;
    }
  }
  input.onchange = () => upload([...input.files]);
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
function rubricEditor(questions) {
  return questions
    .map(
      (q, i) =>
        `<article class="rubric-question" data-question><div class="question-bar"><h3>第 ${i + 1} 题</h3><label>题号<input name="qid" value="${h(q.id)}" aria-label="第 ${i + 1} 题题号" required maxlength="30"></label><label>满分<input name="points" type="number" min="0.5" max="100" step="0.5" value="${h(q.maxPoints)}" aria-label="第 ${i + 1} 题满分" required></label><button type="button" class="icon-btn remove-question" aria-label="删除第 ${i + 1} 题">${icon("close")}</button></div><div class="stack">${area("题目（学生可见）", "prompt", q.prompt)}${area("参考答案", "answer", q.answer, "required")}${area("评分点与可接受的表达", "criteria", q.criteria, 'required placeholder="逐条写明得分条件与对应分值"')}${field("答案出处", "sourcePages", q.sourcePages || "文字答案")}</div></article>`,
    )
    .join("");
}
function readRubric() {
  return $$("[data-question]").map((el) => ({
    id: $("[name=qid]", el).value,
    prompt: $("[name=prompt]", el).value,
    answer: $("[name=answer]", el).value,
    criteria: $("[name=criteria]", el).value,
    maxPoints: Number($("[name=points]", el).value),
    sourcePages: $("[name=sourcePages]", el).value,
  }));
}
async function answerPage(id) {
  const renderId = state.routeVersion;
  const { assignment: a } = await api("assignments/" + id);
  await metadata([...a.answerFiles, ...a.questionFiles]);
  if (renderId !== state.routeVersion) return;
  const questions = a.draftRubric || a.rubric || [];
  main.innerHTML = `<section class="paper">${head("ANSWER KEY / " + h(a.course), "上传参考答案", a.title, `<span class="answer-private">仅教师可见</span>` + link("assignments", "返回"))}<div class="split"><section><div class="section-head"><h2>你的参考答案</h2>${badge(a.status)}</div><form id="source-form" class="stack"><div id="answer-upload"></div><details ${a.answerFiles.length ? "" : "open"}><summary>文字答案</summary>${area("文字答案", "answerText", a.answerText, 'placeholder="可直接粘贴答案、题号与评分说明…"')}</details><details><summary>题目附件与学生说明</summary><div class="stack">${area("学生可见的题目要求", "instructions", a.instructions)}<div id="question-upload"></div></div></details><p class="form-error" role="alert"></p><div class="actions"><button type="submit" class="secondary">保存原始答案</button><button type="button" id="parse-answer" class="primary">AI 整理评分点</button></div><p class="hint">上传的答案保留原件。AI 整理后，请核对右侧评分点，再启用批改。</p></form>${a.answerFiles.length ? `<button class="link" data-preview="${a.answerFiles[0]}">打开原始答案</button>` : ""}${["queued", "parsing"].includes(a.status) ? '<div class="status-line" id="parse-status">等待这台 Mac 整理答案。你可以离开页面，任务会继续保存。</div>' : ""}${a.error ? `<p class="error">${h(a.error)}</p>` : ""}</section><section><div class="section-head"><h2>核对评分点</h2><span class="hint">${a.version ? "当前 v" + a.version : "待确认"}</span></div><form id="rubric-form"><div id="questions">${questions.length ? rubricEditor(questions) : empty("先整理，再确认", "使用左侧答案生成评分点，也可以手动添加。")}</div><button type="button" id="add-question" class="secondary">添加题目</button><hr class="rule"><label class="check"><input type="checkbox" name="confirmed" required>我已核对每题答案、满分和评分点</label><p class="hint">确认后，学生即可提交。参考答案保持私密，发布成绩只展示得分和反馈。修改评分标准会生成新版本。</p><p class="form-error" role="alert"></p><div class="form-actions"><button type="submit" class="primary wide">确认答案并启用批改</button></div></form></section></div></section>`;
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
    toast("已加入本地处理队列");
  });
  const bindRemove = () =>
    $$(".remove-question").forEach(
      (b) => (b.onclick = () => b.closest("[data-question]").remove()),
    );
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
                ? "本地 AI 正在核对题号与评分点…"
                : "已排队。Mac 在线并准备好模型后开始处理。";
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
  const renderId = state.routeVersion;
  const { assignment: a } = await api("assignments/" + id);
  const all = state.submissions.filter((s) => s.assignmentId === id),
    draft = all.find((s) => s.status === "draft"),
    latest = all
      .filter((s) => s.status !== "draft")
      .sort((a, b) =>
        (b.submittedAt || "").localeCompare(a.submittedAt || ""),
      )[0];
  await metadata([...a.questionFiles, ...(draft?.files || [])]);
  if (renderId !== state.routeVersion) return;
  const key = `hw-draft:${state.user.id}:${id}`;
  let clientId =
    draft?.clientId || sessionStorage.getItem(key) || crypto.randomUUID();
  sessionStorage.setItem(key, clientId);
  main.innerHTML = `<section class="paper">${head("SUBMIT / " + h(a.course), a.title, "截止 " + date(a.dueAt), link("assignments", "返回作业"))}<div class="split"><section><details class="assignment-brief" ${matchMedia("(max-width:640px)").matches ? "" : "open"}><summary>这次要完成什么</summary><div class="instructions">${h(a.instructions || "请根据题目要求完成作业。")}</div>${(a.questions || []).map((q) => `<div class="published-question"><h3>第 ${h(q.id)} 题 <span class="hint">${q.maxPoints} 分</span></h3><p>${h(q.prompt)}</p></div>`).join("")}<div class="file-list">${fileMarkup(a.questionFiles)}</div>${latest ? `<div class="status-line">最近提交：${date(latest.submittedAt)} · ${h(labels[latest.status])}</div>${link("result/" + latest.id, "查看提交与反馈")}` : ""}</details></section><section><div class="section-head"><h2>提交你的答案</h2><span class="hint">评分标准 v${a.version}</span></div><form id="submit-form" class="stack"><div id="student-upload"></div>${area("文字答案（可与附件一起提交）", "answer", draft?.text || "", 'placeholder="按题号填写。例如：1(a)… 1(b)…"')}<p class="hint" id="draft-status">草稿会保存到你的账户。提交前请检查页数与清晰度。</p><p class="form-error" role="alert"></p><div class="actions"><button type="button" id="save-draft" class="secondary">保存草稿</button><button type="submit" class="primary">确认提交</button></div></form></section></div></section>`;
  let saving,
    autosave,
    submitted = false;
  const ownForm = $("#submit-form"),
    ownText = $("[name=answer]");
  const widget = uploadWidget(
    $("#student-upload"),
    "submission",
    draft?.files || [],
    schedule,
  );
  async function save(isDraft) {
    if (widget.busy()) throw new Error("附件正在上传，请稍等");
    if (saving) await saving;
    const content = {
      assignmentId: id,
      text: ownText.value,
      files: widget.ids(),
      draft: isDraft,
      clientId,
    };
    saving = post("submissions", content);
    try {
      return await saving;
    } finally {
      saving = null;
    }
  }
  function schedule() {
    clearTimeout(autosave);
    autosave = setTimeout(async () => {
      if (submitted || !ownForm.isConnected) return;
      try {
        await save(true);
        $("#draft-status").textContent = "草稿已保存 · " + date(new Date());
      } catch (e) {
        const el = $("#draft-status");
        if (el) el.textContent = e.message;
      }
    }, 1800);
  }
  $("[name=answer]").addEventListener("input", schedule);
  click("#save-draft", async () => {
    clearTimeout(autosave);
    await save(true);
    $("#draft-status").textContent = "草稿已保存";
    toast("草稿已保存");
  });
  formHandler($("#submit-form"), async () => {
    clearTimeout(autosave);
    const { submission } = await save(false);
    submitted = true;
    sessionStorage.removeItem(key);
    toast("提交成功，文件和答案已保存");
    go("result/" + submission.id);
  });
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
  rows.sort(
    (a, b) =>
      (a.status === "needs_review" ? -1 : 1) -
      (b.status === "needs_review" ? -1 : 1),
  );
  main.innerHTML = `<section class="paper">${head(teacher ? "REVIEW / 教师复核" : "SUBMISSIONS / 我的记录", teacher ? "逐份看见思考" : "提交记录", teacher ? "AI 提供初批建议，由你确认后发布。" : "每次提交都会保留。成绩发布后，可在这里查看反馈。", link("assignments", "返回作业"))}${rows.length ? submissionRows(rows) : empty(teacher ? "这里等待第一份作业" : "还没有提交记录", teacher ? "学生提交后会进入本地批改队列；需要复核的作业会显示在前面。" : "完成一份作业后，你的提交记录会出现在这里。")}</section>`;
}
async function resultPage(id) {
  const renderId = state.routeVersion;
  const { submission: s } = await api("submissions/" + id),
    a = state.assignments.find((x) => x.id === s.assignmentId);
  await metadata(s.files);
  if (renderId !== state.routeVersion) return;
  const g = s.publishedGrade;
  main.innerHTML = `<section class="paper">${head("SUBMISSION / 提交记录", a?.title || "作业提交", "提交于 " + date(s.submittedAt), badge(s.status) + link("history", "返回记录"))}<div class="split"><section><h2>你的提交</h2><div class="file-list">${fileMarkup(s.files)}</div><div class="instructions">${h(s.text || "本次答案见附件。")}</div><p class="hint">提交凭证 ${h(s.id.slice(0, 12).toUpperCase())}</p></section><section>${g ? `<div class="section-head"><h2>教师反馈</h2><div class="score-box">${g.total}<span> / ${g.maxPoints}</span></div></div>${g.questions.map((q) => `<article class="published-question"><h3>第 ${h(q.id)} 题 <span>${q.score} / ${q.maxPoints}</span></h3><p>${h(q.feedback)}</p><p class="hint">依据：${h(q.evidence)}</p></article>`).join("")}<div class="instructions">${h(g.teacherNote || "")}</div><p class="hint">发布于 ${date(g.publishedAt)} · 评分标准 v${g.answerVersion}</p>` : empty(s.status === "returned" ? "请调整后重新提交" : s.status === "needs_review" ? "等待教师复核" : s.status === "grading" ? "正在阅读你的作业" : "提交已收到", s.status === "returned" ? s.returnedReason : s.status === "needs_review" ? "初批建议会由教师检查，发布后即可在这里查看。" : "作业已经安全保存。Mac 在线时会依次处理，关闭此页也不会影响提交。", s.status === "returned" ? link("submit/" + s.assignmentId, "返回作业", "primary") : "")}${g && s.status !== "published" ? '<p class="status-line">上方保留此前发布的成绩；新的批改尚未发布。</p>' : ""}</section></div></section>`;
  bindPreviews();
  if (["queued", "grading", "needs_review"].includes(s.status))
    pollTimer = setTimeout(() => render(false), 15000);
}
async function reviewPage(id) {
  const renderId = state.routeVersion;
  const { submission: s } = await api("submissions/" + id),
    a = state.assignments.find((x) => x.id === s.assignmentId),
    name = state.submissions.find((x) => x.id === id)?.studentName || "学生";
  await metadata(s.files);
  if (renderId !== state.routeVersion) return;
  const suggestions =
    s.suggestedGrade?.questions ||
    s.rubricSnapshot?.map((q) => ({
      id: q.id,
      score: null,
      maxPoints: q.maxPoints,
      evidence: "",
      feedback: "",
      needsReview: true,
    })) ||
    [];
  main.innerHTML = `<section class="paper">${head("REVIEW / " + h(a?.title || "作业复核"), name + "的作业", "提交于 " + date(s.submittedAt) + " · 使用评分标准 v" + s.version, badge(s.status) + link("reviews", "返回待复核"))}<div class="review-layout"><section class="review-source"><div class="section-head"><h2>原始作答</h2></div><div class="file-list">${fileMarkup(s.files)}</div>${s.files[0] ? (state.files.get(s.files[0]).mime === "application/pdf" ? `<div class="pdf-preview" data-pdf="${s.files[0]}"></div>` : `<img class="original-preview" src="/api/homework/files/${s.files[0]}" alt="学生原始答案">`) : ""}<div class="instructions">${h(s.text)}</div>${s.error ? `<p class="error">${h(s.error)}</p>` : ""}<div class="actions"><button class="secondary" id="regrade">按最新标准重新批改</button><button class="quiet" id="return-work">退回重交</button></div><form id="return-form" hidden class="stack">${area("退回原因", "reason", "", "required")}<p class="form-error" role="alert"></p><button type="submit" class="danger">确认退回</button></form></section><section><div class="section-head"><h2>逐题复核</h2><span class="answer-private">发布前仅教师可见</span></div>${["queued", "grading"].includes(s.status) ? '<div class="status-line">本地批改正在排队或进行中。完成后会自动更新。</div>' : ""}<form id="review-form">${suggestions
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
  const renderId = state.routeVersion;
  const { device: d, settings: s } = await api("device");
  if (renderId !== state.routeVersion) return;
  main.innerHTML = `<section class="paper">${head("LOCAL INTELLIGENCE / 本地批改设备", "你的 Mac，就是批改工作站", "作业进入队列，设备在线时依次处理。")}<div class="device-grid"><section><h2 class="device-title">${h(d?.name || "本地设备")}</h2><p class="device-status"><span class="device-dot ${d?.online ? "online" : ""}"></span>${d?.revoked ? "已暂停" : d?.online ? (d.busy ? "正在批改" : d.modelReady ? "在线 · 可以批改" : "在线 · 正在准备模型") : "离线 · 作业会继续排队"}</p><dl class="device-detail"><div><dt>当前模型</dt><dd>${h(d?.model || s.model)}</dd></div><div><dt>最近连接</dt><dd>${d?.lastSeen ? date(d.lastSeen) : "等待首次连接"}</dd></div><div><dt>处理方式</dt><dd>逐份批改 · 教师复核后发布</dd></div></dl>${d?.lastError ? `<p class="error">${h(d.lastError)}</p>` : ""}<hr class="rule"><p class="hint">本地模式下，资料由这台 Mac 处理。设备休眠或断网后任务仍保留，重新连接会继续。外部 API 也由此设备调用。</p><div class="form-actions"><button id="device-test" class="secondary">测试连接与图片识别</button><button id="device-pause" class="quiet">${d?.revoked ? "恢复批改" : "暂停批改"}</button></div><p id="test-status" class="status-line" hidden role="status"></p></section><section><h2>模型连接</h2><form id="settings-form" class="stack" style="margin-top:24px"><label class="field"><span>处理方式</span><select name="provider"><option value="ollama" ${s.provider === "ollama" ? "selected" : ""}>本地 Ollama</option><option value="openai" ${s.provider === "openai" ? "selected" : ""}>外部兼容 API（由本机调用）</option></select></label>${field("接口地址", "baseUrl", s.baseUrl, "url", "required")}${field("模型名称", "model", s.model, "text", "required")}<div id="cloud-fields" ${s.provider === "ollama" ? "hidden" : ""}>${field("API Key", "apiKey", "", "password", `autocomplete="off" placeholder="${s.hasApiKey ? "已保存；留空保持原密钥" : "输入服务商提供的密钥"}"`)}<label class="check"><input type="checkbox" name="cloudConsent" ${s.cloudConsent ? "checked" : ""}>我同意将作业和参考答案发送到填写的外部服务商</label></div><p class="hint">本地地址仅在 Mac 上访问，不对公网开放。API 密钥加密保存，不会出现在学生页面中。</p><p class="form-error" role="alert"></p><button type="submit" class="primary">保存连接设置</button></form></section></div></section>`;
  const form = $("#settings-form");
  $("[name=provider]").onchange = (e) => {
    const cloud = e.target.value === "openai";
    $("#cloud-fields").hidden = !cloud;
    $("[name=baseUrl]").value = cloud ? "" : "http://127.0.0.1:11434";
  };
  formHandler(form, async (b) => {
    b.cloudConsent = $("[name=cloudConsent]").checked;
    await put("device/settings", b);
    toast("连接设置已保存，下个任务开始生效");
  });
  click("#device-pause", async () => {
    await post("device/pause", { paused: !d?.revoked });
    render();
  });
  click("#device-test", async () => {
    const { jobId } = await post("device/test");
    const el = $("#test-status");
    el.hidden = false;
    el.textContent = "测试已排队，等待本地设备运行…";
    async function poll() {
      try {
        const { job } = await api("jobs/" + jobId);
        if (!$("#test-status")) return;
        el.textContent =
          job.status === "complete"
            ? job.result.message
            : job.status === "failed"
              ? job.error
              : job.status === "running"
                ? "正在测试真实图片识别…"
                : "等待本地设备…";
        if (!["complete", "failed"].includes(job.status))
          pollTimer = setTimeout(poll, 4000);
      } catch (e) {
        el.textContent = e.message;
      }
    }
    pollTimer = setTimeout(poll, 3000);
  });
}
function accountPage() {
  const teacher = state.user.role === "teacher";
  main.innerHTML = `<section class="paper">${head("ACCOUNT / 账户与班级", state.user.name, teacher ? "教师账户" : "学生账户", `<button id="logout" class="secondary">退出登录</button>`)}<div class="split"><section><h2>我的班级</h2><div class="class-list">${state.classes.map((c) => `<div class="class-line"><span>${h(c.name)}</span>${teacher ? `<div><span class="hint">学生邀请码</span><code>${h(c.invite)}</code></div>` : ""}</div>`).join("") || '<p class="muted">尚未加入班级</p>'}</div><hr class="rule"><form id="class-form" class="stack">${field(teacher ? "新班级名称" : "加入另一个班级", "value", "", "text", `required placeholder="${teacher ? "例如：AP 宏观 2026 A 班" : "输入班级邀请码"}"`)}<p class="form-error" role="alert"></p><button type="submit" class="primary">${teacher ? "创建班级" : "加入班级"}</button></form>${teacher ? '<p class="hint" style="margin-top:20px">学生使用邀请码注册自己的作业账户。此账户独立于现有 EconQuest 账户。</p>' : ""}</section><section><h2>修改密码</h2><form id="password-form" class="stack" style="margin-top:24px">${field("当前密码", "current", "", "password", 'required autocomplete="current-password"')}${field("新密码", "password", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}${field("确认新密码", "confirm", "", "password", 'required minlength="10" maxlength="200" autocomplete="new-password"')}<p class="hint">使用至少 10 位密码。修改后，其他设备需要重新登录。</p><p class="form-error" role="alert"></p><button type="submit" class="secondary">更新密码</button></form></section></div></section>`;
  click("#logout", async () => {
    await post("logout");
    state.user = null;
    location.hash = "login";
    showLogin();
  });
  formHandler($("#class-form"), async (b) => {
    if (teacher) await post("classes", { name: b.value });
    else {
      const data = await post("join", { invite: b.value });
      state.user = data.user;
    }
    await render();
    toast(teacher ? "班级已创建" : "已加入班级");
  });
  formHandler($("#password-form"), async (b) => {
    if (b.password !== b.confirm) throw new Error("两次新密码不一致");
    const result = await post("password", b);
    state.csrf = result.csrf;
    $("#password-form").reset();
    toast("密码已更新");
  });
}
async function render(scroll = true) {
  clearPDFs();
  if (!state.user) return showLogin();
  clearTimeout(pollTimer);
  const version = ++state.routeVersion;
  main.setAttribute("aria-busy", "true");
  const [route = "assignments", id] = location.hash.slice(1).split("/");
  try {
    await refresh();
    if (version !== state.routeVersion) return;
    const teacher = state.user.role === "teacher";
    if (
      !teacher &&
      ["new", "answer", "reviews", "review", "device"].includes(route)
    ) {
      go("assignments");
      return;
    }
    nav?.select(
      teacher
        ? route === "device"
          ? 2
          : ["reviews", "review"].includes(route)
            ? 1
            : 0
        : ["history", "result"].includes(route)
          ? 1
          : route === "account"
            ? 2
            : 0,
    );
    if (route === "new") newAssignment();
    else if (route === "answer" && id) await answerPage(id);
    else if (route === "submit" && id) await submitPage(id);
    else if (["reviews", "history"].includes(route)) reviews(id);
    else if (route === "result" && id) await resultPage(id);
    else if (route === "review" && id) await reviewPage(id);
    else if (route === "device") await devicePage();
    else if (route === "account") accountPage();
    else assignments();
    if (scroll) main.scrollTo({ top: 0, behavior: "instant" });
  } catch (e) {
    if (!state.user || version !== state.routeVersion) return;
    main.innerHTML = `<section class="paper">${head("WORKSPACE", "暂时无法打开")}<p class="error" role="alert">${h(e.message)}</p><div class="form-actions"><button id="retry" class="primary">重试</button>${link("assignments", "返回作业")}</div></section>`;
    click("#retry", () => render());
  } finally {
    main.setAttribute("aria-busy", "false");
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
