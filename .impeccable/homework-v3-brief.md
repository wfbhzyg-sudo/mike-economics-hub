# Homework V3 workspace

Mode: Operate. Approved extension of the existing workspace, using design/homework-auto-grading-v3-20261110 as the functional and visual authority. User explicitly requested implementation and student experience improvements on 2026-11-10.

THESIS: Students should see what is due, safely submit photographs, leave while grading runs, and return to understandable results and a durable personal archive.
OWN-WORLD: Existing Mike SVG, HubSerif, navy surround, ivory paper, thin rules, transparent bottom desktop dock and right mobile rail. Preserve shared liquid navigation. No new visual identity or decorative raster assets.
FIRST VIEWPORT: Student work starts with pending assignments and clear state/action; submitting prioritizes camera, page checks and saved-draft feedback. Teacher overview pairs real submission counts with a selected student's archive. No invented production metrics.
REFERENCE: Approved 01-teacher-archive.png and 02-student-workflow.png in design/homework-auto-grading-v3-20261110/visuals. Code-led extension of existing native forms, adapted to real data, not a screenshot reconstruction.
SCOPE: Assignment/answer settings, submission, progress, results, archives, wrong questions and review, with necessary server persistence. Existing Bookself identity and registered classes remain authoritative. Historical accounts and attachments remain untouched.
STUDENT IMPROVEMENTS: Actionable due states; camera and file alternatives; text recovery; preserved uploaded pages; prevented duplicate submission; truthful progress; one current grade per assignment; original files and downloadable feedback; correction and review requests.
VERIFY: Functional API integration and real browser desktop/mobile simulation; distinguish simulated model results and physical camera tests. Finish with independent review and documentation of this approved extension.

## Implemented routes and behavior — 2026-11-10

All routes below are hash routes under `/homework/`. This record describes the implementation at `4ade062`; production deployment is a separate release step.

| Audience | Route | Implemented purpose |
| --- | --- | --- |
| Both | `#assignments` | Search and state filters; students see unfinished work first and due dates in order. |
| Teacher | `#new`, `#answer/{assignmentId}` | Existing class selection, question/answer files, choice or short-answer rubrics, scoring-point confirmation and publication. |
| Teacher | `#overview/{assignmentId}` | Submission counts, status roster, selected student's archive, deadline and resubmission settings. |
| Teacher | `#reviews`, `#review/{submissionId}` | Exceptions and student appeals; source comparison, score confirmation, return or regrade. |
| Teacher | `#gradebook`, `#gradebook/{studentId}` | Search/class filter and student history; an empty filter clears the selected profile. |
| Student | `#submit/{assignmentId}` | Camera/file/text entry, page preview/rotation/order/removal, local and account drafts, duplicate-safe submission. |
| Student | `#result/{submissionId}` | Saved receipt and real queue state, then total/type subtotals, question feedback, appeal, originals and PDF downloads. |
| Student | `#grades` | One effective published grade per assignment, equal-weight percentage average, recent trend and attempt history. `#history` remains an archive alias. |
| Student | `#mistakes`, `#mistakes/{assignmentId}/{questionId}` | Current lost-credit questions, original feedback, correction attachments, notes and review state. Corrections preserve the original grade. |
| Both / administrator | `#account`; administrator-only `#device` | Existing identity/classes; grading configuration is available only to the configured platform administrator. |

Teacher navigation is **作业 / 待复核 / 学情**; student navigation is **作业 / 成绩 / 错题**. The existing transparent dock and liquid-motion adapter are retained. These scoped route labels supersede the older homework labels in the incumbent sidecar without authorizing a global refresh.

Submission recovery selects the newer device/account draft, otherwise carries forward the latest saved text and files into a fresh attempt. Restored unsynced text retries account saving without further typing. An explicitly returned latest attempt may be supplemented after the deadline even when general late/resubmission access is closed; other students remain subject to the assignment policy. Earlier attempts and their original attachments stay intact.

The learning API (`GET /api/homework/learning`) and direct assignment access hide unpublished work from students unless they already own a historical submission. Published grades remain visible during regrading; pending attempts are not counted as zero. Corrections use revision checks, and per-question review requests preserve the score until republished. Private answers and rubrics are omitted from student responses. PDF endpoints are authenticated: `assignments/{id}/pdf`, `submissions/{id}/pdf`, and `submissions/{id}/pdf?kind=grade` under `/api/homework/`.

## Scoped visual extension

The final cascade in `homework/style.css` is authoritative for this extension. Global `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` remain unchanged.

- Reuse the incumbent navy `#0b1f3a`, paper `#f3eddf`, ink `#102238`, muted text `#60656a`, rules `#c5c1b7`, HubSerif headings and system-sans body/fields. V3 adds selected-row fill `--work-selected: #dfe5e7`; `--work-success: #36523b` and `--work-warning: #705322` reuse existing state hues for save/review text.
- Teacher overview uses `1.65fr / minmax(280px, 1fr)` with a 32 px ruled gap; submission uses equal columns with 48 px spacing; result uses `1.5fr / minmax(260px, 1fr)` with 48 px spacing. These task layouts stack at 900 px. The roster/profile layout stacks at 640 px.
- Keep the single native-scrolling paper, fixed brand, desktop bottom dock and phone right rail. Final phone paper padding is `24px 18px 28px`; the 83 px right margin protects the 68 px dock. At 320 px, vertical scrolling is expected; do not compress fields to fit one viewport.
- New filter/input-mode controls use 44 px minimum height, 5 px corners, and ink/paper selected states. Submission actions are at least 48 px high. Camera entry is 108 px high, 112 px on phones, with a 6 px dashed boundary and inline SVG icon.
- Results lead with a serif 72 px score (62 px on phones), then type subtotals and expanded lost-credit feedback. Archives use a restrained ink line chart with a 0–100 scale and textual accessible summary; sample values from the approved visuals are never production defaults.
- Feedback transitions use 180 ms; only the active grading-step marker breathes at 1500 ms. Reduced motion disables both and uses immediate profile scrolling. Route changes focus the main region; inputs retain visible focus treatment and 16 px text.

## Verification and delivery limits

`../../../operations/homework-v3-20261110/results/acceptance-summary.json` records 82 passing checks: 18 app/unit, 12 worker, 11 API groups, 35 browser, 2 editor/tablet, and 4 targeted fixes. Browser reports contain no page errors or horizontal overflow. The independent finish review at `.impeccable/review/homework-v3-review.md` gives **SHIP for the implemented scope**, with all four material findings and the filtered-profile mismatch resolved.

These are isolated synthetic accounts/model responses and Chrome viewport/touch simulations, not physical-phone or real-model accuracy validation. No real DeepSeek key or calibration samples were supplied. Automatic grade release remains gated to the current model fingerprint explicitly confirmed by the owner after sample validation; unvalidated results require teacher review. Existing Bookself accounts, class membership, prior work and originals are preserved.

Scheduled release of the full reference answer and automatic blur/glare/crop detection are not implemented. The photo step provides manual clarity/completeness guidance. PDFs use a server-only, fully embedded Noto Sans SC font to preserve Chinese glyphs, adding approximately 6.4 MB of base export overhead; the webpage font and page load are unchanged. See `homework-server/fonts/SOURCE.txt` and its bundled license.
