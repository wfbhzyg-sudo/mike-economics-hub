import test from "node:test";
import assert from "node:assert/strict";
import { rubric, grade, boundedText } from "../homework-server/validation.mjs";
import { passwordHash, passwordMatches } from "../homework-server/store.mjs";
const reference = [
  {
    id: "1",
    answer: "AD shifts right",
    criteria: "1 point for a rightward AD shift",
    maxPoints: 1,
  },
];
test("grading cannot start with an empty or incomplete answer key", () => {
  assert.throws(() => rubric([]));
  assert.throws(() =>
    rubric([{ id: "1", answer: "", criteria: "x", maxPoints: 1 }]),
  );
  assert.throws(() => rubric([...reference, ...reference]));
});
test("uncertain recognition is not silently scored zero", () => {
  const r = grade(
    {
      questions: [
        {
          id: "1",
          score: 0,
          evidence: "",
          feedback: "看不清",
          needsReview: true,
        },
      ],
    },
    reference,
  );
  assert.equal(r.total, null);
  assert.equal(r.questions[0].score, null);
});
test("genuine zero remains a valid score with evidence", () => {
  const r = grade(
    {
      questions: [
        {
          id: "1",
          score: 0,
          evidence: "AD shifts left",
          feedback: "移动方向相反",
          needsReview: false,
        },
      ],
    },
    reference,
  );
  assert.equal(r.total, 0);
});
test("model cannot invent extra question scores or exceed the rubric", () => {
  assert.throws(() =>
    grade(
      { questions: [{ id: "2", score: 1, evidence: "x", feedback: "x" }] },
      reference,
    ),
  );
  assert.throws(() =>
    grade(
      { questions: [{ id: "1", score: 2, evidence: "x", feedback: "x" }] },
      reference,
    ),
  );
  assert.throws(() => grade({ questions: [] }, reference));
});
test("passwords use a unique salt and reject incorrect values", () => {
  const a = passwordHash("a-strong-test-password"),
    b = passwordHash("a-strong-test-password");
  assert.notEqual(a, b);
  assert.ok(passwordMatches("a-strong-test-password", a));
  assert.equal(passwordMatches("incorrect", a), false);
  assert.equal(passwordMatches("a-strong-test-password", "invalid"), false);
});

test("work text is rejected at the limit instead of silently truncated", () => {
  assert.equal(boundedText("x".repeat(40000), 40000).length, 40000);
  assert.throws(() => boundedText("x".repeat(40001), 40000));
  assert.throws(() => boundedText({text:"answer"}, 40000));
  assert.equal(boundedText(undefined, 40000), "");
});
test("malformed scores cannot become an invented zero or one", () => {
  for (const score of ["", " ", true, false, [], {}, undefined, NaN, Infinity, -1]) {
    assert.throws(() => grade({questions:[{id:"1", score, evidence:"x", feedback:"x"}]}, reference));
  }
});
