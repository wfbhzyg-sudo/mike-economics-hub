import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { processJob } from "../local-worker/worker.mjs";
import { grade, rubric } from "../homework-server/validation.mjs";
const settings = {
  provider: "ollama",
  baseUrl: "http://127.0.0.1:11434",
  model: "qwen3-vl:8b-instruct",
};
const questions = [
  {
    id: "1",
    prompt: "Explain the short-run effects of increased consumer confidence.",
    answer:
      "Increased consumption shifts AD right, raising the price level and real GDP in the short run.",
    criteria:
      "1 point: AD shifts right because consumption rises. 1 point: both price level and real GDP rise. Award equivalent correct wording. Total 2 points.",
    maxPoints: 2,
    sourcePages: "教师确认的测试答案",
  },
];
const output = {
  model: settings.model,
  at: new Date().toISOString(),
  results: [],
};
const download = async (file) => ({
  bytes: await readFile("test-results/fixtures/answer." + file),
  mime: file === "pdf" ? "application/pdf" : "image/png",
});
const deviceProbe = await processJob({ kind: "test" }, settings, download);
assert.equal(deviceProbe.ok, true, deviceProbe.message);
output.results.push({ format: "device-image-probe", result: deviceProbe });
console.log("device image probe passed");
for (const format of ["text", "png", "pdf"]) {
  const start = Date.now();
  const result = await processJob(
    {
      kind: "grade",
      payload: {
        rubric: questions,
        text:
          format === "text"
            ? "1. Higher consumer confidence increases consumption. AD shifts right. The price level and real GDP rise in the short run."
            : "",
        files: format === "text" ? [] : [format],
      },
    },
    settings,
    download,
  );
  const validated = grade(result, questions);
  assert.equal(validated.total, 2, JSON.stringify(result));
  assert.equal(validated.questions[0].needsReview, false);
  output.results.push({
    format,
    seconds: (Date.now() - start) / 1000,
    result: validated,
  });
  console.log(format + " grading passed");
}
for (const format of ["png", "pdf"]) {
  const start = Date.now(),
    result = await processJob(
      {
        kind: "parse",
        payload: {
          title: "教师答案解析验收",
          instructions:
            "Question 1 is worth 2 points: 1 for AD shifting right, 1 for PL and real GDP rising.",
          text: "",
          files: [format],
        },
      },
      settings,
      download,
    );
  const validated = rubric(result.questions);
  assert.ok(validated.length);
  assert.ok(validated[0].answer.length > 10);
  output.results.push({
    format: "teacher-answer-" + format,
    seconds: (Date.now() - start) / 1000,
    result: validated,
  });
  console.log(format + " teacher answer parsing passed");
}
const ambiguous = await processJob(
  {
    kind: "grade",
    payload: { rubric: questions, text: "1. [无法辨认，图片缺失]", files: [] },
  },
  settings,
  download,
);
assert.ok(
  ambiguous.questions[0].needsReview || ambiguous.questions[0].score === null,
);
output.results.push({ format: "unreadable", result: ambiguous });
console.log("unreadable submission flagged for review");
await writeFile(
  "test-results/local-model.json",
  JSON.stringify(output, null, 2),
);
console.log(
  JSON.stringify({
    passed: output.results.length,
    seconds: output.results.map((r) => ({
      format: r.format,
      seconds: r.seconds,
    })),
  }),
);
