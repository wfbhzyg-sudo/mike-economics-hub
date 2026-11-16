# 课程教学包 · 章节便签墙设计（v1）

状态：设计稿，待确认后实施  
日期：2026-11-16  
范围：学生端「课程教学包 → 某一章 → 学习重点」下方新增的班级便签墙

## 1. 背景与目标

现状：学生在「学习重点」只看到教师预置的 Learning goals / Key concepts / Common pitfalls，没有记录自己发现、疑问或补充材料的位置。学生遇到值得记下的点（错题规律、图形陷阱、老师口头提示、自己找到的例子），只能离开课程页去别处记，容易丢，也无法形成班级共同的知识痕迹。

目标：
- 每个 chapter 的「学习重点」下方提供一个**班级共享**的实时便签墙，学生可发文字、图片、PDF，记录发现/重点/疑问/资源。
- 发完即在本班同学与任课教师处实时出现，不刷新页面。
- 不增加教师配置步骤；教师可在同一页面查看、置顶、隐藏。
- 内容只在本班可见，不公开、不被搜索引擎索引、不进入成绩。

非目标（v1 不做）：
- 不做匿名发帖、不做私信、不做楼中楼长讨论、不做 AI 自动审核或总结。
- 不把便签计入作业、成绩、班级均分或待批阅。
- 不做跨班/跨校公开广场。
- 不替代现有 PDF 原卷批注（`library-note`）；便签是章节级讨论，不是页级墨迹。

## 2. 参考产品与取舍

| 参考 | 可借鉴 | 不照搬 |
| --- | --- | --- |
| [Padlet](https://padlet.help/l/hu/article/v6iz7bhhl1-untitled-article-7z5) | 便签墙的心智模型、图片/文件/链接混合内容、按学生账号手动审核（Manual – students only） | 自由拖拽/无限画布（课程页空间有限，且移动端难用）；不做匿名 |
| [Hypothesis](https://web.hypothes.is/hypothesis-for-students/) | 划词/页边注、公开注释与私有高亮分离、标签与按用户/关键词筛选 | 页级锚定（本需求是章节级）；不做侧边栏挤压正文 |
| [Perusall](https://villanova.teamdynamix.com/TDClient/2759/UNIT/KB/PrintArticle?ID=162775) | 点赞/标签、教师「Confusion Report」式的聚合视角 | 自动评分、AI 总结（v1 不做） |
| [Padlet 教学实践](https://carl-acrl.org/ig/scil/scilworks/2021/SCILWorksL2021_Claremont.pdf) | 低门槛发帖、视觉化、学生可带图 | 大量卡片滚动干扰；用「新便签」提示而不是强行重排 |
| Google Keep / 卡片墙通用模式 | 内联快速创建、masonry 卡片、置顶、颜色/类型筛选 | 个人笔记产品的自由配色（班级墙需统一、克制） |

结论：
1. **章节级共享墙**比页级批注更适合「感悟/重点/资源」这类跨页内容，也不会和现有 PDF 批注冲突。
2. 用**统一卡片 + 类型色条 + 置顶区**，不做可拖拽画布；移动端一列。
3. 实时采用 **SSE + 轮询兜底**，新内容用「N 条新便签」提示，不打断正在阅读的学生。
4. 教师审核用**隐藏而非删除**，保留审计；学生只能编辑/删除自己的便签。

## 3. 用户与故事

- 学生 A 在学 2.3 需求价格弹性时，发现「点弹性 vs 弧弹性」容易混，发一条「疑问」便签并拍下老师板书。30 秒后同桌在墙上看到并回复不了（v1 无回复），但可以点「有用」，教师上课时看到置顶。
- 学生 B 找到一张更直观的图，发「资源」+ 图片；其他同学点开大图。
- 教师 C 下课后打开同一章，看到 8 条便签，把两条高频疑问置顶，隐藏一条跑题内容。
- 学生 D 手机上没有信号，写完便签先本地保存，恢复网络后自动发送一次，不重复。

## 4. 入口与信息架构

位置：课程教学包 → 选中 chapter → 顶部 tab「学习重点」→ 在 `Common pitfalls` 之后、本章内容结束之前。

结构：
```
[章节标题]
[学习重点 | 课件 | 教材 | 练习]
  Learning goals
  Key concepts
  Common pitfalls
  ─────────────────────────
  本章便签墙            12 条 · 5 人在看
  [写便签 composer]
  [全部] [发现] [重点] [疑问] [资源]   搜索
  [置顶便签]
  [masonry 卡片]
  [加载更多]
```
默认展开，不做折叠；如果本章还没有便签，显示空态与示例提示。教师端同一位置可见，多一个「隐藏/置顶」操作。

## 5. 布局与视觉

### 5.1 桌面（≥1024）
- 宽度跟随课程内容列（当前阅读区约 900–1000px），不额外做右侧栏。
- 标题行：左「本章便签墙」22px serif；右侧 `12 条 · 5 人在看` 12px muted。
- Composer：白底卡片，圆角 10，边框 `#D8DFE2`，内边距 14；头像 32px + textarea 自适应 2–6 行；底部工具行：类型 chips、图片/PDF 按钮、字数、主按钮「发布便签」44px。
- 卡片墙：CSS columns / grid masonry 两列，gap 12；卡片白底 `#FFFDF7`，圆角 10，1px 边框，顶部 3px 类型色条；内边距 12–14；最大宽度不设死，随列宽。
- 置顶区与普通区之间用 1px 分隔 +「置顶」小标题；最多 3 条置顶。
- 卡片内容：作者（姓名 + 首字头像 28px）、相对时间、类型 chip、正文（≤600 字，15px/1.6，换行保留）、附件缩略图（最多 4 张，96px 高；PDF 显示文件名+页数）、底部「有用 N」与作者/教师的更多菜单。
- 类型色：发现 `#E7F0ED`/深青、重点 `#F6EEDB`/棕、疑问 `#F6E4DE`/砖红、资源 `#E6EBF1`/蓝灰；只用于 3px 顶条与 chip，不整卡上色。

### 5.2 平板（768–1023）
- 单列卡片，composer 同桌面；标题行允许换行。

### 5.3 手机（<768）
- 标题行：标题 20px，右侧「12 条」；「N 人在看」可省略或放第二行。
- Composer 折叠为 44px 的「写便签」按钮（带铅笔图标），点击从底部弹出 sheet：textarea 自动聚焦、类型 chips 横滑、图片/文件、发布 44px；关闭保留草稿。
- 卡片单列，间距 10；附件缩略图 2 列；更多菜单用底部动作单。
- 新便签提示固定在便签墙顶部下方 8px，44px 高，点击跳到最新；不遮住 tab。

### 5.4 视觉 token
- 背景 `#F6F7F5`；正文 `#17324D`；次文 `#5C686C`；边线 `#D8DFE2`。
- 主操作 `#34766B`（白字）；hover `#2C665C`；focus ring `#2F6F8F` 2px + 2px offset。
- 圆角 10；阴影仅 composer 与新便签高亮，`0 2px 8px rgba(20,44,66,.06)`。
- 动效：新便签高亮 1200ms 淡出；卡片插入 160ms transform/opacity；`prefers-reduced-motion` 只保留透明度。

## 6. 交互细节

### 6.1 发布
- 正文 1–600 字；空白不可发。类型默认「发现」。
- 附件：最多 4 个文件；图片 jpg/png/webp/heic（客户端转 webp，最长边 1600px）或 PDF ≤10MB；单条总 ≤20MB。
- 发布按钮在正文非空且无上传中才可用；快捷键 Cmd/Ctrl+Enter。
- 乐观插入：本机立即出现半透明「发送中」卡片；服务端确认后替换；失败显示「未发送 · 重试 / 删除」。
- 草稿按 `userId + unitId + topicId` 存 localStorage，24h 过期。
- 频率限制：同一学生每 10 秒 1 条，每天 30 条；超限提示「发得有点快，稍后再试」。

### 6.2 实时
- 服务端 SSE：`GET /api/homework/library-board/events?unitId&topicId`，事件 `note.created|note.updated|note.hidden|note.pinned|presence`；25s heartbeat；断线指数退避重连，最长 30s 后改 8s 轮询。
- 若用户停在顶部（scrollTop < 120）→ 新卡片直接插入并高亮；否则不插入，显示「3 条新便签」pill，点击后插入并滚到顶部。
- 自己发的便签立即插入，不等待 SSE。
- 在线人数由 SSE 连接数聚合，5 分钟无心跳剔除；只显示约数（如「5 人在看」），不暴露名单。

### 6.3 互动
- 「有用」：每人每条一次，可取消；数字实时更新；不展示点赞者名单。
- 置顶：仅教师；最多 3 条；置顶不改变作者/时间。
- 编辑/删除：作者本人可随时编辑（保留 `editedAt`）或删除（二次确认，软删除）；教师可隐藏/恢复，隐藏后学生端立即消失并提示「该便签已被老师隐藏」给作者。
- 举报：卡片更多菜单「举报」→ 选择原因，进入教师待处理列表；v1 不做自动处理。
- 不做匿名；头像用姓名首字，姓名来自班级账号。

### 6.4 筛选与搜索
- 类型 chips 多选（默认全部）；搜索正文+作者名（300ms debounce，服务端 `q`）。
- 排序固定：置顶 → 最新；不做「热门」排序，避免刷赞。
- 首屏 30 条，游标分页「加载更多」；最多展示 200 条，之后提示用搜索。

## 7. 审核、隐私与数据保留

- 可见范围：`unitId + topicId + classId`；学生必须当前在该 class 的 release 名单内；教师必须是 unit owner。不同班同单元**不互通**。
- 不做公开链接；页面 `noindex`；附件 URL 走鉴权，禁止直接公开 S3 链接。
- 教师隐藏优先于删除；保留 `library-board-audit`（谁、何时、动作、原因）供追溯。
- 学生删除为软删除（`status='deleted'`），30 天内教师可恢复；之后清理正文，保留计数审计。
- 学生转班/离班：历史便签保留在原因班级，作者标记「已离开班级」；本人不再能访问该墙；教师仍可见。此条需教师确认（开放问题）。
- 未成年人保护：无匿名、无公开、无站外分享按钮；上传文件做类型/大小校验；图片去除 EXIF（客户端 canvas 重编码）；教师可一键隐藏。
- 不调用 AI 审核、不做人脸/内容识别；举报由教师人工处理。

## 8. 数据模型（新增，不改现有表结构）

```json
// kind: library-board-note
{
  "id": "board-note:<uuid>",
  "unitId": "micro-unit-2",
  "topicId": "2.3",
  "classId": "bookself-class:...",
  "authorId": "bookself:...",
  "authorName": "学生 0",
  "authorRole": "student|teacher",
  "type": "discovery|key|question|resource",
  "body": "…",
  "attachments": [{"fileId":"…","name":"…","mime":"image/webp","width":1600,"height":900}],
  "status": "visible|hidden|deleted",
  "pinned": false,
  "reactions": 0,
  "createdAt": "...",
  "editedAt": null,
  "revision": 1
}
// kind: library-board-reaction (id: noteId:userId)
// kind: library-board-audit
```

索引：`(unitId, topicId, classId, createdAt desc)`、`(authorId, createdAt)`。不改 SQL 表结构，沿用 `homework.records`。

## 9. API 草案

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/homework/library-board?unitId&topicId&type&q&cursor` | 本班学生/教师 | 首屏 30，返回 `notes,total,nextCursor,online` |
| POST | `/api/homework/library-board` | 本班学生/教师 | body `{unitId,topicId,type,body,attachments,clientId}`；幂等 `clientId` |
| PATCH | `/api/homework/library-board/:id` | 作者（正文/类型/附件） | 校验 revision；409 冲突 |
| DELETE | `/api/homework/library-board/:id` | 作者 | 软删除；二次确认由 UI 做 |
| POST | `/api/homework/library-board/:id/reactions` | 本班学生 | toggle；返回新计数 |
| POST | `/api/homework/library-board/:id/pin` | 教师 owner | `{pinned:true|false}` |
| POST | `/api/homework/library-board/:id/hide` | 教师 owner | `{hidden:true|false,reason}`；写审计 |
| POST | `/api/homework/library-board/:id/report` | 本班学生 | `{reason,detail}` |
| GET | `/api/homework/library-board/events` | 本班 | SSE；按 unit/topic/class 过滤 |

附件复用现有 `POST /api/homework/files`，新增 purpose `board`（仅本班可见、仅图片/PDF、10MB）；下载走现有鉴权文件路由。

## 10. 性能与可访问性

- 首屏只传 30 条 + 缩略附件；图片 `loading=lazy`、`decoding=async`、`srcset` 480/960w。
- SSE 单连接；轮询仅在断线时启用；页面隐藏时暂停。
- 卡片墙 `content-visibility:auto`（支持时）避免长列表布局开销。
- 键盘：Tab 顺序 composer → 类型 → 附件 → 发布 → 筛选 → 卡片；卡片内操作菜单可 Esc 关闭并回焦。
- 屏幕阅读器：便签墙 `role="feed"`，新便签数量 `aria-live="polite"`；类型 chip 带文字；颜色不是唯一信息。
- 触控：所有按钮 ≥44px；手机 composer sheet 底部安全区；360px 宽度无横向滚动。
- 弱网：发布 15s 超时后标记失败可重试；不重复提交（clientId 幂等）。

## 11. 验收标准

功能：
1. 两个同班学生 A/B 同开一章：A 发布，B 在 ≤2s 内看到（SSE）；B 滚到中部时只看到「1 条新便签」提示，不跳位。
2. 不同班/未 release 学生无法读取或发布（404/403），跨班搜索无结果。
3. 图片与 PDF 上传后仅本班可见；未登录直接访问附件 401；EXIF 被去除。
4. A 发 16 条、B 发 4 条；列表 20 条，置顶最多 3；刷新后顺序稳定。
5. A 编辑后 B 实时看到「已编辑」；A 删除后 B 收到移除；教师隐藏后 A 看到「已被老师隐藏」提示。
6. 双设备同时编辑同一条：后提交者收到 409，保留本地草稿可复制。
7. 双击/断网重试只产生 1 条（clientId 幂等）。
8. 手机 390/360 无横溢；composer sheet 可发送；新便签 pill 不遮 tab；44px 触控。
9. 教师端可置顶/隐藏/恢复；审计记录完整；学生看不到隐藏内容。
10. 便签数据不影响 assignment/submission/成绩/待批阅；`npm test` 全绿。

非功能：
- 50 人班级、200 条便签：首屏 P95 <800ms（本地/生产各测一次）；SSE 连接 50 稳定 10 分钟。
- 减少动态/键盘/200% 缩放可用。

## 12. 分阶段实施

- **P0（1–2 天）**：数据模型 + API 读取/发布/删除 + 权限；桌面 composer + 单列列表 + 手机 sheet；单元测试与隔离环境。
- **P1（1 天）**：SSE 实时、新便签 pill、乐观更新、断线重连；图片/PDF 附件与缩略图。
- **P2（0.5 天）**：类型筛选、搜索、有用、置顶、教师隐藏/举报；审计。
- **P3（可选）**：个人便签视图、教师 Confusion 汇总、导出班级便签 PDF。

## 13. 开放问题（需教师确认）

1. 便签是否允许「仅自己可见」？v1 建议只做班级可见，降低审核与隐私复杂度。
2. 学生离班后历史便签是否保留姓名？建议保留并标「已离开班级」，教师可隐藏。
3. 是否允许教师发「老师提示」并置顶？建议允许，带 teacher chip。
4. 附件是否允许 PDF？建议允许 1 个 PDF + 最多 4 张图，避免文档分享滥用。
5. 是否需要「举报」入口？建议有，教师端进入待处理列表，不做自动处理。

## 14. 参考链接

- Padlet 内容审核：https://padlet.help/l/hu/article/v6iz7bhhl1-untitled-article-7z5
- Padlet 课堂实践（PDF）：https://carl-acrl.org/ig/scil/scilworks/2021/SCILWorksL2021_Claremont.pdf
- Hypothesis 学生指南：https://web.hypothes.is/hypothesis-for-students/
- Hypothesis 教学实践：https://oaiplus.pdx.edu/active-learning-with-hypothesis/
- Perusall（Villanova）：https://villanova.teamdynamix.com/TDClient/2759/UNIT/KB/PrintArticle?ID=162775
- Perusall（Melbourne）：https://lms.unimelb.edu.au/learning-technologies/perusall
- NYU 数字批注概览：https://technology.steinhardt.nyu.edu/hc/en-us/articles/16632192910107-Learner-Engagement-Digital-Annotation
