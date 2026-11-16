# 题库组卷与线下成绩录入 · 设计（2026-11-16）

状态：设计稿，待确认。本文只定义形态与契约，不包含实现代码。

## 1. 目标

在现有「作业管理 → 布置作业（上传 PDF）」之外增加两个入口：

1. **从题库选题组卷**：教师按课程/单元/章节筛选题库，勾选题目，组成一份正式作业。
2. **录入线下成绩**：教师为一次已完成的线下作业/考试设置满分，逐个学生录入总分，进入成绩与学情。

约束：不改变现有上传题目作业的流程；题库答案只在教师端出现；学生端不能在交卷前拿到答案；线下成绩不产生提交、不进入待批阅。

## 2. 现有基础

- 题库：`homework.records` 的 `library-question`，字段含 `prompt/searchText`、`options`、`answer`、`status`、`unitId`、`topic`、`questionImages`、`version`。
- 正式作业：`assignment` + `submission`；选择题由 `choiceScore` 确定性计分；学生端 `studentItems` 仅下发题面与选项。
- 成绩页：`assignmentRecords` 按提交聚合；无提交不会出现在成绩中。
- 因此题库组卷可复用作业模型；线下成绩需要新的轻量成绩源。

## 3. 功能 A：题库选题组卷

### 3.1 入口与步骤
作业管理右上角「布置作业」拆成两个动作：
- 上传题目 PDF（现有）
- 从题库选题（新）

新页面为三步：
1. **选题**：课程（AP 微观/宏观）→ 单元 → 章节多选；搜索；只显示 `status=ready` 且 `type=choice` 的题；卡片显示题号、章节、题干缩略、题图缩略、答案（仅教师可见）。
2. **编排**：右侧已选托盘，显示题数、总分（默认每题 1 分）、上移/下移/移除；可预览整卷。
3. **设置并发布**：作业名称、班级、截止时间、限时、允许补交；发布后生成正式 assignment。

### 3.2 选题规则
- 仅同课程、同单元；支持一或多个 topic。
- 默认排除 `needs_review`、重复题、无题图题。
- 同一题只能选一次；跨 topic 按 `source|number` 去重。
- 一次 1–50 题；不足时提示实际可选数量，不自动补别的单元。
- 已发布作业保存题目快照，题库后续修改不影响历史作业。

### 3.3 服务端契约
`GET /api/homework/assignments/bank?course=&unit=&topic=&q=`（teacher）
→ `{questions:[{id,number,topic,prompt,options,answer,questionImages,sourcePages}], counts}`

`POST /api/homework/assignments/from-bank`（teacher）
body `{classId,title,dueAt,timeLimitMinutes,allowLate,questionIds[]}`
→ 校验：教师拥有 unit；题目 ready/choice/图片存在；题数 1–50；生成 assignment（`format:'mcq'`, `source:'bank'`, `rubric` 含 answer/options/maxPoints=1）。返回 `{assignment}`。

学生读取沿用现有 assignment 接口，答案字段不下发。

### 3.4 UI 规格
- 桌面 ≥1200：三栏（260 筛选 / 自适应题表 / 300 已选托盘），容器 1440，边距 24；页面不整页滚动，题表与托盘各自滚动。
- 1024–1199：两栏（筛选可折叠抽屉）。
- <900：步骤式单栏，底部固定「下一步 / 发布」；已选托盘变成底部抽屉。
- 行高 ≥44，题卡缩略图 72×52；主按钮 44；键盘可勾选、可排序；空态区分无题库/无匹配/未开放。
- 颜色沿用 #F6F7F5 / #17324D / #34766B / #D8DFE2。

## 4. 功能 B：线下成绩录入

### 4.1 入口
作业管理 → 「录入线下成绩」。不占用「布置作业」。

### 4.2 表单
- 名称（如「Unit 2 单元考」）
- 类型：小测 / 单元考 / 期中 / 期末 / 练习
- 日期
- 班级
- 满分（1–200，支持一位小数）
- 可选备注（≤200 字）
- 学生分数表：姓名/账号、分数输入（0–满分）、缺考/免修开关；支持按姓名或账号搜索。
- 批量粘贴：从表格粘贴「姓名<TAB>分数」两列，自动匹配，无法匹配项标红。

### 4.3 数据模型
新增 `offline-grade` 记录：
```
{ id, classId, title, category, date, totalPoints,
  scores: { [studentId]: { score: number|null, absent: boolean } },
  status:'published', createdBy, createdAt, updatedAt, revision }
```
不改 `assignment/submission`；成绩聚合读取时把 `offline-grade` 映射为只读 cell（`status:'graded'`, `source:'offline'`）。班级均分、个人趋势、导出都包含；待批阅/待订正不包含。

### 4.4 权限与审计
- 仅教师本人班级；学生只能看到自己的已发布分数。
- 发布后可编辑分数，写 `teacher_audit`；删除为软删除并保留审计。
- 不生成错题、不允许订正、不产生附件。
- 校验：分数 0–满分、最多 200 人/次、名称 1–80 字。

### 4.5 UI 规格
- 桌面：表单两列（基本信息 / 分数表），分数表吸顶表头，底部汇总「已录入 N/M · 平均 X」。
- 手机：单列卡片，每个学生一行，数字键盘，输入后自动下一位；底部固定「保存并发布」。
- 已存在记录从作业管理列表进入编辑；显示「线下成绩」标签。

## 5. 兼容与迁移
- 新记录类型，无数据库结构变更。
- 现有题库/作业/成绩读取路径增加 `source` 分支；旧数据默认 `source:'upload'`。
- 回滚：停用两个入口即可，不影响既有数据。

## 6. 验收要点
- 题库组卷：1/10/50 题边界；跨 topic 去重；待核对题不可选；学生接口无 answer；发布后修改题库不影响作业；双提交无重复作业。
- 线下成绩：0/满分/小数/缺考；重复学生；非本班 403；学生仅见本人；均分与趋势正确；待批阅不增加；导出包含来源。
- 6 视口：1440×900、1280×720、768×1024、390×844、360×740、844×390；无横溢、44px 触达、键盘可用。

## 7. 待确认
1. 每题分值是否固定 1 分，还是允许逐题设分？
2. 线下成绩是否计入「班级均分」与「趋势」？（默认计入）
3. 是否允许一个学生缺考并仍计入统计分母？
4. 是否需要把线下成绩导出为 CSV？

## 8. 效果图

- 题库组卷：`previews/assignment-bank/preview.html`
- 线下成绩：`previews/offline-grades/preview.html`
- 截图：`.preview/design-previews/assignment-bank-1440.png`、`assignment-bank-390.png`、`offline-grades-1440.png`、`offline-grades-390.png`

预览为静态形态稿，数据为示例；文案与交互以本文为准。
