export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const assert = (condition, message, status = 400) => {
  if (!condition) throw new HttpError(status, message);
};
export function text(value, max = 10000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
// Submitted work must never be silently truncated before grading.
export function boundedText(value, max, label = "文字") {
  assert(value == null || typeof value === "string", `${label}格式不正确`);
  assert((value || "").length <= max, `${label}超过 ${max} 字，请改用 PDF 附件或拆分提交`);
  return (value || "").trim();
}
const numeric = (value) =>
  typeof value === "number" || (typeof value === "string" && value.trim() !== "");
export function rubric(input) {
  assert(
    Array.isArray(input) && input.length > 0 && input.length <= 40,
    "请提供 1–40 道题的评分标准",
  );
  const seen = new Set();
  return input.map((q, i) => {
    const key = text(q.id, 30) || String(i + 1);
    assert(!seen.has(key), "题号不能重复");
    seen.add(key);
    assert(numeric(q.maxPoints), "满分必须是数字");
    const maxPoints = Number(q.maxPoints);
    assert(
      Number.isFinite(maxPoints) && maxPoints > 0 && maxPoints <= 100,
      "每题满分须在 0–100 分之间",
    );
    const answer = text(q.answer, 12000);
    assert(answer, "每题需要参考答案");
    const criteria = text(q.criteria, 12000);
    assert(criteria, "每题需要可核对的评分点");
    return {
      id: key,
      prompt: text(q.prompt, 12000),
      answer,
      criteria,
      maxPoints,
      sourcePages: text(q.sourcePages, 200),
    };
  });
}
export function grade(input, questions) {
  assert(input && Array.isArray(input.questions), "模型没有返回逐题批改结果");
  assert(
    input.questions.length === questions.length,
    "批改题数与评分标准不一致",
  );
  const seen = new Set();
  const rows = input.questions.map((q) => {
    const ref = questions.find((r) => r.id === String(q.id));
    assert(ref && !seen.has(ref.id), "批改题号不完整或重复");
    seen.add(ref.id);
    assert(q.score === null || numeric(q.score), "批改分数必须是数字或待复核");
    const score = q.score === null ? null : Number(q.score);
    assert(
      score === null ||
        (Number.isFinite(score) && score >= 0 && score <= ref.maxPoints),
      "批改分数超出评分范围",
    );
    const evidence = text(q.evidence, 6000),
      feedback = text(q.feedback, 6000);
    assert(feedback, "批改缺少反馈");
    const needsReview = Boolean(q.needsReview) || score === null || !evidence;
    return {
      id: ref.id,
      score: needsReview && (!evidence || score === null) ? null : score,
      maxPoints: ref.maxPoints,
      evidence,
      feedback,
      needsReview,
    };
  });
  return {
    questions: rows,
    total: rows.some((q) => q.score === null)
      ? null
      : rows.reduce((s, q) => s + q.score, 0),
    maxPoints: questions.reduce((s, q) => s + q.maxPoints, 0),
    needsReview: rows.some((q) => q.needsReview),
  };
}
