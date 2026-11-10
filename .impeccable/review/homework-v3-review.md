# Homework V3 finish review

## 1. Disposition

**SHIP for the implemented scope** — all four material findings are resolved, and the filtered-profile issue is also resolved. The scoped code reread, targeted test evidence and five follow-up captures support closure. No further rebuild or recapture is required. This does not remove the real-model and feature limitations in section 5.

## 2. Evidence and scope

Read-only review of `.impeccable/homework-v3-brief.md`, `PRODUCT.md`, `DESIGN.md`, the approved V3 document source and both visual references, the craft floor, and the current homework UI/model/API/learning/export/worker code. Inspected all nine requested renders: 1440 teacher overview and student grades; 390 student submit/result/mistake detail and teacher overview; 320 student submit/result and teacher overview.

The reports in project-root `operations/homework-v3-20261110/results/` record 11 passing API groups, 35 passing desktop/mobile browser checks with no page errors or horizontal overflow, and two passing editor/tablet checks. These are synthetic fixtures and Chrome viewport/touch simulations. The detector has zero primary findings and 54 advisories; unrelated existing palette/type sidecar drift is outside this review.

Scoped follow-up: reread the five modified branches, `fix-qa.mjs` and passing `results/fix-qa.json`; inspected `returned-1440.png`, `returned-390.png`, `returned-320.png`, `restored-draft-390.png` and `empty-filter-768.png`. The new test explicitly exercises the API denial, a 320-pixel UI supplement with unchanged original files, automatic account recovery after an interrupted save/reload, and a cleared empty-filter profile. The implementation task additionally reports 18 passing app/unit tests and 12 passing worker tests after the fixes; this reviewer did not rerun them.

## 3. Fidelity and UX assessment

The original Mike mark, serif headings, navy surround, ivory sheet, transparent title, desktop bottom dock and phone right rail remain intact. Desktop teacher overview preserves the intended submission-count/roster/selected-archive composition using real data. The implementation appropriately adapts the reference rather than hard-coding its sample counts.

At 390 and 320 pixels, the content remains readable without horizontal overflow. On the narrowest screen the fixed rail leaves a narrow sheet and the submission form needs vertical scrolling, but this is consistent with the pinned navigation and is not a visual blocker. The camera entry, alternate input methods and individual page controls are clear. Results lead with total and question-type subtotals, then the actual loss-of-credit explanation; original work, correction and per-question review have direct routes. The archive excludes pending work from its average and keeps one effective grade per assignment.

The code retains prior published grades during regrading, keeps review history, computes current mistakes from the effective result, and revision-checks correction updates. Student responses strip private rubric/answer source fields; file downloads are authenticated. Automatic publication is additionally gated to a model fingerprint explicitly marked as sample-validated. The learning endpoint now also withholds same-class unpublished drafts unless the student has their own historical submission.

## 4. Material findings

1. **RESOLVED — P1, unpublished assignment visibility.** `homework-server/api.mjs:618–630` now requires published + class access or the student's own historical submission. The targeted test checks that a newly created same-class draft is absent from `/learning` and its direct route returns 403.

2. **RESOLVED — P1, retained work during supplementation.** `homework/app.js:542–548` now falls back from cache/draft to the latest saved files and text while generating a fresh attempt ID. The 320-pixel UI test verifies the existing photo/text, appends a PDF, submits a new receipt with both files, and verifies that the original attempt's file list remains unchanged. The desktop follow-up capture visibly shows the retained attachment and text.

3. **RESOLVED — P1, scoped supplementation after deadline.** `homework/app.js:550–551` and the submission API now exempt only a student's latest explicitly returned attempt from the late/resubmission lock. The targeted test combines a past deadline, allowLate=false and allowResubmit=false: the returned student successfully supplements while an unrelated late student is rejected. The broader class policy is retained.

4. **RESOLVED — P2, unsynced restored draft recovery.** `homework/app.js:555–570` marks the restored cache dirty, caches it and schedules the normal save/retry on initialization. The test aborts account saves, reloads with retained text, restores connectivity without typing, and verifies the account draft through the API. `restored-draft-390.png` shows the recovered text and account-save confirmation.

**RESOLVED — nonblocking filtered-profile mismatch.** `homework/learning-ui.js:28–30` now selects only within the filtered roster and clears the detail when none match. The 768-pixel reduced-motion test and capture show an empty roster with a matching empty detail, rather than a stale student's profile. No material finding remains open in this scoped follow-up.

## 5. Limitations

This reviewer did not operate a browser or alter source code. Screenshots show the first viewport; deeper interactions are supported by the supplied reports and code inspection, not an independent physical-device run. Camera behavior, keyboard behavior on a physical phone, DeepSeek quality and real classroom examples were not validated. Production remains untouched.

This is approval of the implemented interface direction, not proof that every V3 specification feature is complete: the inspected assignment settings do not expose a scheduled full-reference-answer release control, and the photo step gives manual clarity/completeness guidance rather than demonstrated automatic blur/glare/crop detection. Those should remain explicit delivery limitations rather than being described as implemented capabilities. Automatic publication should remain gated until the agreed model sample evaluation is completed.
