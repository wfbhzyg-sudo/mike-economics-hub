import {studentAssignmentAction} from './assignment-navigation.js';
import {highlightText} from './search-text.js';
import { assignmentState, assignmentRecords } from "./learning-model.js";
export function createWorkspaceUI(ctx) {
  const {
    state,
    main,
    h,
    head,
    link,
    date,
    api,
    post,
    put,
    go,
    toast,
    field,
    area,
    formHandler,
    uploadWidget,
    metadata,
  } = ctx;
  const $ = (s, r = main) => r.querySelector(s),
    $$ = (s, r = main) => [...r.querySelectorAll(s)];
  const teacher = () => state.user.role === "teacher";
  const section = (title, tone, content, action = "") =>
    `<section class="work-section" data-tone="${tone}"><header class="work-section-heading"><h2>${title}</h2>${action}</header><div class="work-section-body">${content}</div></section>`;
  const busy = (s) =>
    ["needs_review"].includes(s.status) ||
    s.reviewRequests?.some((r) => r.status === "open");
  const submitted = (a) =>
    assignmentRecords(
      state.submissions.filter((s) => s.assignmentId === a.id),
      [a],
    );
  function menu(a) {
    return `<button type="button" class="secondary row-more" data-more="${h(a.id)}" aria-label="更多操作：${h(a.title)}">更多</button>`;
  }
  function row(a) {
    const t = teacher(),
      info = assignmentState(a, state.submissions),
      records = t ? submitted(a) : [],
      review = records.filter((r) => busy(r.latest)),
      done = records.filter((r) => r.grade),
      questions = (t ? a.rubric : a.questions) || [],
      score = questions.reduce((n, q) => n + q.maxPoints, 0);
    const studentAction=studentAssignmentAction(a,state.submissions);
    const target=t?(a.published?'overview/':'edit/')+a.id:studentAction.target;
    const action=t?(a.published?'查看提交':'继续草稿'):studentAction.action;
    const tone = t
      ? review.length
        ? "sand"
        : a.published
          ? "blue"
          : "lilac"
      : { todo: "blue", processing: "lilac", done: "sage", closed: "sand" }[
          info.key
        ];
    if(t){
      const counts=state.rosterSummaries?.[a.id], summary=counts||{submitted:records.length,review:review.length};
      const stat=(filter,text,cls)=>link('overview/'+a.id+'/'+filter,text,'roster-count '+cls);
      return `<article class="assignment-row assignment-management-row"><div class="task-copy"><div class="task-title">${link(target,highlightText(a.title,state.assignmentSearch),'task-name')}${!a.published?'<span class="badge" data-tone="lilac">草稿</span>':''}</div><div class="meta"><span>${a.classIds.map(id=>h(state.classes.find(c=>c.id===id)?.name||'班级')).join(' · ')}</span><span>${a.opensAt&&Date.parse(a.opensAt)>Date.now()?'开放 '+date(a.opensAt)+(a.dueAt?' · 截止 '+date(a.dueAt):''):a.dueAt?'截止 '+date(a.dueAt):'不限截止时间'}</span></div></div><div class="task-stats">${a.published?`${stat('submitted',summary.submitted+' 已提交','is-submitted')}${stat('missing',summary.missing==null?(state.rosterError?'名单待重试':counts?'名单待确认':'同步名单…'):summary.missing+' 未提交',summary.missing>0?'is-missing':'is-neutral')}${stat('review',summary.review+' 待复核',summary.review?'is-review':'is-neutral')}`:'<span class="hint">发布后统计提交</span>'}</div><div class="actions task-actions">${link(target,action,'primary')}${link('edit/'+a.id,'编辑')}${menu(a)}</div></article>`;
    }
    return `<article class="assignment-row compact-task" data-tone="${tone}"><div class="task-copy"><div class="task-title">${target?link(target, highlightText(a.title,state.assignmentSearch), "task-name"):`<strong class="task-name">${highlightText(a.title,state.assignmentSearch)}</strong>`}<span class="badge" data-tone="${tone}">${t ? (a.published ? "已发布" : "草稿") : h(studentAction.label)}</span></div><div class="meta"><span>${h(a.course)}</span>${t ? `<span>${a.classIds.map((id) => h(state.classes.find((c) => c.id === id)?.name || "班级")).join(" · ")}</span>` : ""}<span>${!t&&studentAction.opensLater?"开放 "+date(a.opensAt):a.dueAt ? "截止 " + date(a.dueAt) : "不限截止时间"}</span></div>${score ? `<p class="assignment-types">${questions.length} 题 · ${score} 分${a.paper?.files?.length ? " · 题纸 " + a.paper.files.reduce((n, f) => n + f.pages, 0) + " 页" : ""}</p>` : ""}${t && a.published ? `<div class="task-stats">${link("overview/" + a.id, records.length + " 人已提交", "text-button")}${review.length ? link("reviews/" + a.id, review.length + " 份待核对", "text-button attention") : ""}<span>${done.length} 人已出分</span></div>` : ""}</div><div class="actions task-actions">${target?link(target, action, "primary"):`<button class="secondary" disabled>${h(action)}</button>`}${t ? link("edit/" + a.id, "编辑") : ""}${t ? menu(a) : ""}</div></article>`;
  }
  function bindActions() {
    $$("[data-more]").forEach(
      (b) =>
        (b.onclick = () =>
          actions(state.assignments.find((a) => a.id === b.dataset.more))),
    );
  }
  function dialog(title, body, bind) {
    let d = document.querySelector("#work-dialog");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "work-dialog";
      d.className = "work-dialog";
      (document.querySelector(".homework-surface") || document.body).append(d);
      d.addEventListener("click", (e) => {
        if (e.target === d) d.close();
      });
    }
    const focus = document.activeElement;
    d.onclose = () => {
      focus?.isConnected && focus.focus({ preventScroll: true });
    };
    d.setAttribute("aria-labelledby", "work-dialog-title");
    d.innerHTML = `<div class="work-dialog-head"><h2 id="work-dialog-title">${h(title)}</h2><button type="button" class="secondary" data-close>关闭</button></div>${body}`;
    $("[data-close]", d).onclick = () => d.close();
    bind?.(d);
    d.showModal();
    return d;
  }
  function actions(a) {
    if (!a) return;
    dialog(
      a.title,
      `<div class="dialog-options">${link("answer/" + a.id, "参考答案与评分标准")}<button class="secondary" data-copy>复用为新作业</button><button class="danger" data-delete>移入回收站</button></div><p class="hint">复用不带入学生提交和成绩。移入回收站后可恢复。</p><p class="form-error" role="alert"></p>`,
      (d) => {
        d.querySelectorAll("a").forEach((a) => (a.onclick = () => d.close()));
        $("[data-copy]", d).onclick = async (e) => {
          const button = e.currentTarget;
          button.disabled = true;
          try {
            const { assignment } = await post(
              "assignments/" + a.id + "/duplicate",
            );
            d.close();
            toast("已建立独立草稿，请确认班级、截止时间与答案");
            go("edit/" + assignment.id);
          } catch (err) {
            $(".form-error", d).textContent = err.message;
            button.disabled = false;
          }
        };
        $("[data-delete]", d).onclick = () => {
          d.close();
          confirmArchive(a);
        };
      },
    );
  }
  function confirmArchive(a) {
    dialog(
      "移入回收站",
      `<p class="dialog-task-name">${h(a.title)}</p><p>学生将不能再提交这份作业。已有提交、附件、成绩和错题记录继续保留。</p><p class="hint">进行中的自动批阅会暂停；恢复后可以继续复核。你可以随时从回收站恢复作业。</p><form class="stack"><label class="check"><input type="checkbox" required>我确认将这份作业移入回收站</label><p class="form-error" role="alert"></p><div class="actions"><button type="button" class="secondary" data-cancel>取消</button><button class="danger" type="submit">确认移入回收站</button></div></form>`,
      (d) => {
        $("[data-cancel]", d).onclick = () => d.close();
        formHandler($("form", d), async () => {
          await post("assignments/" + a.id + "/archive");
          d.close();
          toast("已移入回收站，原始数据保留");
          go("assignments");
        });
      },
    );
  }
  function dashboard() {
    const t = teacher(),
      key =
        "hw-filters:" + state.user.id + ":" + (state.workspaceClassId || "all");
    try {
      Object.assign(state, JSON.parse(sessionStorage.getItem(key) || "{}"));
    } catch {}
    const filters = t
      ? [
          ["all", "全部"],
          ["published", "已发布"],
          ["draft", "草稿"],
        ]
      : [
          ["all", "全部"],
          ["todo", "待完成"],
          ["processing", "批阅中"],
          ["done", "已出分"],
          ["closed", "已截止"],
        ];
    if (!filters.some(([key]) => key === state.assignmentFilter))
      state.assignmentFilter = "all";
    const courses = [
      ...new Set(state.assignments.map((a) => a.course).filter(Boolean)),
    ];
    if (!courses.includes(state.assignmentCourse)) state.assignmentCourse = "";
    main.innerHTML = `<section class="paper workspace-home">${head("", t ? "作业管理" : "我的作业", state.classes.map((c) => c.name).join(" · "), t ? link("trash", "回收站") + link("new", "新建作业", "primary") : "")}<div class="assignment-toolbar"><div class="filter-tabs" role="group" aria-label="作业状态">${filters.filter(([v])=>t||['all','todo','done'].includes(v)).map(([v, t]) => `<button type="button" data-filter="${v}" aria-pressed="${state.assignmentFilter === v}">${t}<span data-count="${v}"></span></button>`).join("")}${!t?`<details class="task-more-filters" ${['processing','closed'].includes(state.assignmentFilter)?'open':''}><summary>更多状态</summary><div>${filters.filter(([v])=>['processing','closed'].includes(v)).map(([v,label])=>`<button type="button" data-filter="${v}" aria-pressed="${state.assignmentFilter===v}">${label}<span data-count="${v}"></span></button>`).join('')}</div></details>`:''}</div><div class="assignment-search-controls">${courses.length > 1 ? `<label><span class="sr-only">筛选课程</span><select id="assignment-course"><option value="">全部课程</option>${courses.map((c) => `<option ${state.assignmentCourse === c ? "selected" : ""}>${h(c)}</option>`).join("")}</select></label>` : ""}<label class="search-field"><span class="sr-only">查找作业</span><input id="assignment-search" type="search" placeholder="查找作业" value="${h(state.assignmentSearch)}"></label></div></div><p class="sr-only" id="assignment-count" role="status"></p><div id="task-workspace"></div></section>`;
    function draw() {
      state.assignmentSearch = $("#assignment-search").value;
      const term = state.assignmentSearch.trim().toLocaleLowerCase(),
        base = state.assignments.filter(
          (a) =>
            (!state.assignmentCourse || a.course === state.assignmentCourse) &&
            a.title.toLocaleLowerCase().includes(term),
        );
      const matches = (a, k) =>
        k === "all" ||
        (t
          ? k === "published"
            ? a.published
            : !a.published
          : assignmentState(a, state.submissions).key === k);
      $$("[data-count]").forEach(
        (el) =>
          (el.textContent =
            " " + base.filter((a) => matches(a, el.dataset.count)).length),
      );
      const rows = base.filter((a) => matches(a, state.assignmentFilter));
      $("#assignment-count").textContent = `${rows.length} 份作业`;
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            assignmentFilter: state.assignmentFilter,
            assignmentSearch: state.assignmentSearch,
            assignmentCourse: state.assignmentCourse,
          }),
        );
      } catch {}
      const pane = $("#task-workspace");
      pane.className = "";
      if (!rows.length) {
        pane.innerHTML = `<div class="empty"><h2>${state.assignments.length ? "没有符合条件的作业" : t ? "准备第一份作业" : "老师发布后，作业会出现在这里"}</h2><p>${state.assignments.length ? "可以清空搜索或切换分类。" : t ? "从学生题纸开始，再确认参考答案。" : "已沿用你的 Bookself 班级，无需再次加入。"}</p>${state.assignments.length ? '<button class="secondary" data-reset>清空筛选</button>' : t ? link("new", "新建作业", "primary") : link("account", "查看我的班级")}</div>`;
        $("[data-reset]")?.addEventListener("click", () => {
          state.assignmentFilter = "all";
          state.assignmentSearch = "";
          state.assignmentCourse = "";
          sessionStorage.removeItem(key);
          dashboard();
        });
        return;
      }
      if (state.assignmentFilter !== "all" || term) {
        pane.innerHTML = section(
          "作业 · " + rows.length,
          "blue",
          rows.map(row).join(""),
        );
        bindActions();
        return;
      }
      let primary = "",
        secondary = "";
      if (t) {
        const published=rows.filter(a=>a.published),draft=rows.filter(a=>!a.published);
        if(published.length)primary+=section('已发布 · '+published.length,'blue',published.map(row).join(''));
        if(draft.length)primary+=section('草稿 · '+draft.length,'lilac',draft.map(row).join(''));
      } else {
        const todo = rows
          .filter((a) => assignmentState(a, state.submissions).key === "todo")
          .sort(
            (a, b) =>
              Number(Boolean(assignmentState(b,state.submissions).draft||b.attemptProgress)) - Number(Boolean(assignmentState(a,state.submissions).draft||a.attemptProgress)) || (Date.parse(a.dueAt) || Infinity) - (Date.parse(b.dueAt) || Infinity),
          );
        const processing = rows.filter(
            (a) => assignmentState(a, state.submissions).key === "processing",
          ),
          done = rows.filter(
            (a) => assignmentState(a, state.submissions).key === "done",
          ),
          closed = rows.filter(
            (a) => assignmentState(a, state.submissions).key === "closed",
          );
        if (todo.length)
          primary += section(
            "待完成 · " + todo.length,
            "blue",
            todo.map(row).join(""),
          );
        if (processing.length)
          primary += section(
            "批阅中 · " + processing.length,
            "lilac",
            processing.map(row).join(""),
          );
        if (done.length)
          secondary += section(
            "最近反馈",
            "sage",
            done.slice(0, 5).map(row).join(""),
            link("grades", "全部成绩", "text-button"),
          );
        const records = assignmentRecords(state.submissions, rows).filter(
            (r) => r.grade,
          ),
          wrong = records.reduce(
            (n, r) =>
              n +
              r.grade.questions.filter(
                (q) => q.score !== null && q.score < q.maxPoints,
              ).length,
            0,
          );
        if (wrong)
          secondary += section(
            "回看失分题",
            "sand",
            `<div class="compact-feedback"><div><strong>${wrong} 道失分题</strong><p>查看反馈，保留自己的订正思路。</p></div>${link("mistakes", "去订正")}</div>`,
          );
        if (closed.length)
          primary += section(
            "已截止 · " + closed.length,
            "sand",
            closed.map(row).join(""),
          );
      }
      if (!primary) {
        primary = secondary;
        secondary = "";
      }
      pane.className = secondary ? "workspace-columns" : "workspace-single";
      pane.innerHTML = `<div class="workspace-primary">${primary}</div>${secondary ? `<aside class="workspace-secondary">${secondary}</aside>` : ""}`;
      bindActions();
    }
    $$("[data-filter]").forEach(
      (b) =>
        (b.onclick = () => {
          state.assignmentFilter = b.dataset.filter;
          $$("[data-filter]").forEach((x) =>
            x.setAttribute("aria-pressed", x === b),
          );
          draw();
        }),
    );
    $("#assignment-search").oninput = draw;
    $("#assignment-course")?.addEventListener("change", (e) => {
      state.assignmentCourse = e.target.value;
      draw();
    });
    draw();
    const version=state.routeVersion;
    const loadSummary=()=>api('assignments/roster-summary').then(data=>{if(version!==state.routeVersion)return;state.rosterSummaries=data.summaries;state.rosterError=false;draw();}).catch(()=>{if(version!==state.routeVersion)return;state.rosterError=true;draw();const b=document.createElement('button');b.className='text-button roster-retry';b.textContent='班级名单同步失败 · 重试';b.onclick=()=>{b.disabled=true;loadSummary();};$('#task-workspace').prepend(b);});
    if(t)void loadSummary();
    const saved=state.assignmentListPosition;
    if(saved){requestAnimationFrame(()=>{(main.id==='homework-main'?document.scrollingElement:main).scrollTop=saved.top;const target=main.querySelector('[href="'+CSS.escape(saved.href||'')+'"]');target?.focus({preventScroll:true});});}
    state.viewCleanup=()=>{state.assignmentListPosition={top:(main.id==='homework-main'?document.scrollingElement:main).scrollTop,href:document.activeElement?.getAttribute('href')};};
  }
  async function trash() {
    const { assignments } = await api("assignments?trash=1");
    const rows = state.workspaceClassId
      ? assignments.filter((a) => a.classIds.includes(state.workspaceClassId))
      : assignments;
    main.innerHTML = `<section class="paper">${head("", "回收站", "原始提交、成绩和附件仍然保留。", link("assignments", "返回作业"))}${section("已移除 · " + rows.length, "rose", rows.length ? rows.map((a) => `<article class="assignment-row"><div><h2>${h(a.title)}</h2><p class="hint">移入时间 ${date(a.deletedAt)}</p></div><button class="secondary" data-restore="${h(a.id)}">恢复作业</button></article>`).join("") : '<p class="empty-inline">回收站是空的。</p>')}</section>`;
    $$("[data-restore]").forEach(
      (b) =>
        (b.onclick = async () => {
          b.disabled = true;
          try {
            await post("assignments/" + b.dataset.restore + "/restore");
            toast("作业已恢复；暂停的批阅可在待复核中继续");
            await trash();
          } catch (e) {
            toast(e.message);
            b.disabled = false;
          }
        }),
    );
  }
  async function edit(id) {
    const stamp = state.routeVersion,
      { assignment: a } = await api("assignments/" + id);
    await metadata(a.questionFiles);
    if (stamp !== state.routeVersion) return;
    const due = a.dueAt
      ? new Date(
          Date.parse(a.dueAt) - new Date(a.dueAt).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : "";
    if (['mcq','mixed'].includes(a.format) && a.published) {
      main.innerHTML=`<section class="paper edit-paper">${head('','编辑作业','',link('assignments','返回作业'))}<form id="edit-assignment" class="compact-editor"><section class="editor-basics"><div class="editor-title-date">${area('作业名称','title',a.title,'required maxlength="120" rows="1"')}${field('截止时间（可选）','dueAt',due,'datetime-local')}</div><fieldset class="class-picker"><legend>布置给</legend><div class="class-chips">${state.classes.map(c=>`<label class="class-chip"><input name="classId" type="checkbox" value="${h(c.id)}" ${a.classIds.includes(c.id)?'checked':''}><span>${h(c.name)}</span></label>`).join('')}</div></fieldset><div class="editor-policy"><label class="check"><input name="allowLate" type="checkbox" ${a.allowLate?'checked':''}>允许补交</label><label class="check"><input name="allowResubmit" type="checkbox" ${a.allowResubmit!==false?'checked':''}>允许重交</label><span>${a.format==='mcq'?'选择题自动计分 · 教师确认后发布':'选择题自动计分 · 简答题教师复核'}</span></div></section><div class="work-section" data-tone="sage"><div class="work-section-body"><p>本次已发布 ${a.rubric.length} 道题。这里修改布置安排，学生已交作答与历史成绩保留。</p>${link('mcq-analysis/'+id,'查看题目与更正选择题答案')}</div></div><div class="editor-footer"><p class="form-error" role="alert"></p><p id="edit-save-status" role="status"></p><button type="submit" class="primary">保存修改</button></div></form></section>`;
      const form=$('#edit-assignment');let revision=a.editRevision||0;
      formHandler(form,async b=>{b.classIds=$$('input[name=classId]:checked',form).map(x=>x.value);b.allowLate=form.elements.allowLate.checked;b.allowResubmit=form.elements.allowResubmit.checked;b.editRevision=revision;b.gradingMode='manual';if(b.dueAt)b.dueAt=new Date(b.dueAt).toISOString();const result=await put('assignments/'+id+'/metadata',b);revision=result.assignment.editRevision;$('#edit-save-status').textContent='布置安排已保存；题目和历史成绩保留。';toast('修改已保存');});return;
    }
    main.innerHTML = `<section class="paper edit-paper">${head('',a.published?'编辑作业':'题纸与信息','',link('assignments','返回作业'))}<nav class="editor-steps" aria-label="发布步骤"><span aria-current="step">1 题纸与信息</span><button type="button" class="text-button" id="step-answer">2 核对答案 →</button><span>3 确认发布</span></nav><form id="edit-assignment" class="compact-editor"><section class="editor-basics"><div class="editor-title-date">${area('作业名称','title',a.title,'required maxlength="120" rows="1"')}${field('截止时间（可选）','dueAt',due,'datetime-local')}</div><fieldset class="class-picker"><legend>布置给</legend><div class="class-chips">${state.classes.map(c=>`<label class="class-chip"><input name="classId" type="checkbox" value="${h(c.id)}" ${a.classIds.includes(c.id)?'checked':''}><span>${h(c.name)}</span></label>`).join('')}</div></fieldset><div class="editor-policy"><label class="check"><input name="allowLate" type="checkbox" ${a.allowLate?'checked':''}>允许补交</label><label class="check"><input name="allowResubmit" type="checkbox" ${a.allowResubmit!==false?'checked':''}>允许重交</label><input type="hidden" name="gradingMode" value="manual"><span>AI 给分 · 教师确认后发布</span></div></section><div class="editor-content"><section class="work-section" data-tone="blue"><header class="work-section-heading"><h2>学生题纸</h2><span>学生可见</span></header><div class="work-section-body"><div id="edit-question-upload"></div></div></section><aside class="editor-notes work-section" data-tone="sage"><header class="work-section-heading"><h2>作答要求</h2></header><div class="work-section-body stack">${field('完成范围','readingScope',a.readingScope||'','text','maxlength="500" placeholder="例如：第 1–10 题"')}${area('提交要求','submissionGuide',a.submissionGuide||'','maxlength="1000" rows="3"')}<details ${a.instructions?'open':''}><summary>补充说明</summary>${area('题目补充说明','instructions',a.instructions||'','maxlength="20000" rows="4"')}</details>${a.published?field('题纸修改说明','paperChangeNote','','text','maxlength="500" placeholder="替换题纸时填写"'):''}<p class="answer-privacy">参考答案 · 仅教师可见<br><span>${a.answerFiles?.length||a.answerText?'已保存原始答案':'下一步上传参考答案'}</span></p></div></aside></div><div class="editor-footer"><p class="form-error" role="alert"></p><p class="hint" id="edit-save-status" role="status"></p><div class="actions"><button type="submit" class="secondary">保存修改</button><button type="submit" name="next" value="answer" class="primary">保存并设置答案</button></div></div></form></section>`;
    const form = $("#edit-assignment");
    let sourceChanged = false,
      revision = a.editRevision || 0,
      sourceRevision = a.sourceRevision || 0,
      next = false;
    const up = uploadWidget(
      $("#edit-question-upload"),
      "question",
      a.questionFiles,
      () => (sourceChanged = true),
    );
    [
      "readingScope",
      "submissionGuide",
      "instructions",
      "paperChangeNote",
    ].forEach((n) =>
      form.elements[n]?.addEventListener("input", () => (sourceChanged = true)),
    );
    form.addEventListener(
      "submit",
      (e) => {
        next = e.submitter?.name === "next";
      },
      { capture: true },
    );
    $("#step-answer").onclick = () => form.requestSubmit(form.elements.next);
    formHandler(form, async (b) => {
      if (up.busy() || up.pending())
        throw Error("请完成上传或移除未完成的文件");
      b.classIds = $$("input[name=classId]:checked", form).map((x) => x.value);
      b.allowLate = form.elements.allowLate.checked;
      b.allowResubmit = form.elements.allowResubmit.checked;
      b.editRevision = revision;
      if (b.dueAt) b.dueAt = new Date(b.dueAt).toISOString();
      const result = await put("assignments/" + id + "/metadata", b);
      revision = result.assignment.editRevision;
      if (sourceChanged) {
        const result = await put("assignments/" + id + "/source", {
          ...b,
          answerText: a.answerText,
          answerFiles: a.answerFiles,
          questionFiles: up.ids(),
          mainQuestionFile: up.ids().includes(a.mainQuestionFile)
            ? a.mainQuestionFile
            : up.ids()[0],
          sourceRevision,
          draftRubric: a.draftRubric || a.rubric || [],
        });
        sourceRevision = result.assignment.sourceRevision;
        sourceChanged = false;
      }
      $("#edit-save-status").textContent =
        "修改已保存到账户" +
        (a.published ? "；题纸更改请继续确认后发布。" : "。");
      toast("修改已保存");
      if (next) go("answer/" + id);
    });
  }
  return { dashboard, trash, edit, actions };
}
