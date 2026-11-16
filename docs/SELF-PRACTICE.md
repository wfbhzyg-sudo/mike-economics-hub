# 学生自主模考（self-practice）

## 范围
- 仅 AP 微观 / 微观，单选 MCQ；学生从已发布的 `library-release` 单元中选 topic，10/20/30 题，正计时或 1–240 分钟倒计时。
- 独立 `self-practice-attempt` / `self-practice-receipt` 记录，不写入 `assignment` / `submission`，不影响班级成绩、待批阅与均分。

## 资格策略（明确开放）
题目必须同时满足：
- 属于学生可见的已发布 unit（`library-release.classIds` 含学生班级，前缀兼容）；
- `status==='ready'`、`type==='choice'`、`collection!=='exam'`、无 `duplicateOf` / `reviewFlags`；
- `answer` 在选项标签内，`topic` 属于该 unit 的 topics；
- `questionImages` 非空，且对应文件存在（`purpose==='library'`）。
当前不按全库默认公开；教师私有原件、待核对题、未发布单元不会进入候选。

## 服务端
- `homework-server/self-practice-model.mjs`：catalog、资格、分层抽题、去重、计分、隐私序列化、幂等 ID。
- `homework-server/self-practice.mjs`：catalog / create / start / get / saveAnswers / submit / result / list / correct，含 30s 过期 sweep。
- 计时以服务端 `startedAt` / `deadlineAt` 为准；到期使用最后保存的答案定稿并标 `autoSubmitted`，不接受新答案。
- 提交幂等：同一 attempt 双提交返回同一 receipt；revision 冲突返回 409。
- 交卷前响应不含 `answer` / `correctOption`；正确选项只在 result 返回。
- 订正只写 `corrections`，不改分数；可保留订正历史。

## 客户端
- `homework/self-practice.js` + `.css`；路由 `#self-practice`（创建）、`#self-practice/attempt/<id>`、`#self-practice/result/<id>`。
- 答题时 `body.sp-immersive` 隐藏主导航 / Mike；题干可放大；答题卡桌面右栏、手机底部抽屉。
- 草稿按 attempt 存 `localStorage`；服务端保存 450ms debounce；冲突条提示并重载服务端状态。

## 测试
```bash
node --test tests/self-practice-model.test.mjs tests/self-practice-api.test.mjs
# e2e 需要在隔离环境（DATABASE_URL + S3_* + HOMEWORK_ENCRYPTION_KEY），spawn 独立 server 与临时 schema：
node tests/self-practice-e2e.mjs
npm test
```
- 本机隔离环境（`operations/workflow-speed-20261114/environment.mjs`）下结果：model 10 + api 7 + e2e 7 全过；全量 204 项（203 pass / 1 skip）；integration 通过；`test:model` 依赖本机 Ollama，本功能不调用 AI，当前环境该脚本因模型输出不完整失败（与自主模考无关）。

## 未覆盖
- 200% 浏览器缩放、物理设备、真实弱网/断网中途恢复、双设备同 attempt 的人工验证未做（接口层有 409 与离线草稿逻辑）。
- 题库中如果教师上传的题图本身印有答案，资格策略无法自动识别；需要在题库发布流程人工保证。
