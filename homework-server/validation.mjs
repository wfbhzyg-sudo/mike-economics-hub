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
    const type=q.type==='choice'?'choice':'short';
    const correctOptions=type==='choice'?options(q.correctOptions||answer):[];
    const choiceMode=q.choiceMode==='multiple'?'multiple':'single';
    if(type==='choice') assert(correctOptions.length>0 && (choiceMode==='multiple'||correctOptions.length===1),'请确认选择题的正确选项与单选或多选类型');
    const scoringPoints=type==='short' && Array.isArray(q.scoringPoints)?q.scoringPoints.map((p,j)=>({id:String(j+1),criterion:text(p.criterion,3000),maxPoints:Number(p.maxPoints)})):[];
    if(scoringPoints.length) assert(scoringPoints.length<=30 && scoringPoints.every(p=>p.criterion&&Number.isFinite(p.maxPoints)&&p.maxPoints>0)&&Math.abs(scoringPoints.reduce((n,p)=>n+p.maxPoints,0)-maxPoints)<.000001,'逐点评分分值之和必须等于本题满分');
    const paperFileId=text(q.paperFileId,100),paperPage=q.paperPage?Number(q.paperPage):null;
    assert((!paperFileId&&!paperPage)||(paperFileId&&Number.isInteger(paperPage)&&paperPage>=1&&paperPage<=2000),'请完整填写 PDF 和页码');
    return {
      paperFileId,paperPage,
      type,correctOptions,choiceMode,choiceRule:'exact',scoringPoints,knowledge:text(q.knowledge,200),
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


export function options(value){
  const source=Array.isArray(value)?value.join(' '):String(value||'');
  if(!/^[A-Ja-jＡ-Ｊａ-ｊ,，、;；\s]+$/.test(source.trim()))return [];
  return [...new Set(source.normalize('NFKC').toUpperCase().match(/[A-J]/g)||[])].sort();
}
// Automatic release is stricter than a teacher-reviewed result. The model does
// not get to determine choice marks or alter confirmed per-point allocations.
export function automaticGrade(input, questions){
  const checked=grade(input,questions);
  const byId=new Map(input.questions.map(q=>[String(q.id),q]));
  for(const row of checked.questions){
    const ref=questions.find(q=>q.id===row.id),raw=byId.get(row.id);
    let valid=input.protocolVersion===2 && raw.mappingVerified===true && raw.answerReadable===true && !row.needsReview;
    if(ref.type==='choice'){
      const selected=options(raw.selectedOptions);
      valid=valid && Array.isArray(raw.selectedOptions) && raw.selectedOptions.every(x=>typeof x==='string'&&/^[A-Ja-jＡ-Ｊａ-ｊ]$/.test(x)) && (selected.length>0||raw.confirmedBlank===true) && (ref.choiceMode==='multiple'||selected.length<=1);
      if(valid){row.score=JSON.stringify(selected)===JSON.stringify(ref.correctOptions)?ref.maxPoints:0;row.selectedOptions=selected;row.feedback=row.score===ref.maxPoints?'所选答案符合本题评分标准。':'所选答案未满足本题评分标准，请结合原作答核对。';}
    }else{
      const points=ref.scoringPoints||[],got=raw.pointResults||[];
      valid=valid&&points.length>0&&got.length===points.length&&new Set(got.map(p=>p.id)).size===points.length;
      if(valid){valid=points.every(p=>{const r=got.find(x=>x.id===p.id);return r&&typeof r.earned==='number'&&Number.isFinite(r.earned)&&r.earned>=0&&r.earned<=p.maxPoints&&r.needsReview===false&&text(r.evidence,6000)&&text(r.feedback,6000);});}
      if(valid){const total=got.reduce((n,p)=>n+p.earned,0);valid=Math.abs(total-row.score)<.000001;if(valid)row.pointResults=got.map(p=>({id:p.id,earned:p.earned,evidence:text(p.evidence,6000),feedback:text(p.feedback,6000)}));}
    }
    if(!valid){row.needsReview=true;row.score=null;}
  }
  return {...checked,total:checked.questions.some(q=>q.score===null)?null:checked.questions.reduce((n,q)=>n+q.score,0),needsReview:checked.questions.some(q=>q.needsReview)};
}
