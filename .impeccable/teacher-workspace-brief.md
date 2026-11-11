# Teacher workspace — approved surface brief

Status: implemented local extension, documented 2026-11-11. The independent review is **ship for the four scored fixes**; this brief does not certify deployment.

## Authority and mode

The approved route is `/teacher/`, a standalone unified teacher workspace for Bookself, EconQuest and electronic homework under the existing Bookself session. This is a code-led **Operate** extension of the incumbent navy-and-ivory identity. Existing `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` remain authoritative; only teacher-scoped additions are made. No identity replacement, broad drift repair or new generated imagery is part of this extension.

## Routes and work

Routes below are hashes beneath `/teacher/`; the server also accepts `/teacher`. The route gate is enabled by `TEACHER_WORKSPACE_ENABLED=1` and verifies the signed-in teacher before serving the teacher surface. The legacy Bookself teacher URL retains its login/teacher checks and redirects eligible teachers to this workspace when enabled.

| Route | Teacher work and scope |
| --- | --- |
| `#home` | Pending reviews and feedback, concept follow-up, separate class learning summaries, recent homework and game tasks. Unavailable services are labeled; missing evidence is not zero attainment. |
| `#classes` | Owned classes, shared Bookself class code, create/rename, reversible archive/restore and class roster. |
| `#student/{id}` | Selected-class student profile: textbook progress and recent answers, original homework/grades, game mastery and concept evidence, transfer or detach class relationship. |
| `#books`, `#question/{id}` | Textbook selection and class progress; authorized reviewers additionally search/filter question records, inspect real graphs/answers/explanations and record fingerprint-bound review. |
| `#work/assignments`, `#work/new` | Existing native homework publication flow, student-facing question paper, private reference/rubric preparation and assignment management. |
| `#work/reviews`, `#work/review/{id}`, `#work/gradebook` | Existing review, original submitted artifacts, feedback, score history and student gradebook. Shared class context scopes the mounted gradebook through `state.workspaceClassId`. |
| `#games`, `#games/new`, `#games/repair/{id}` | Course diagnostics, classroom route assignments, preview and targeted follow-up. Attempt, first-error and revisit evidence remain separate. |
| `#games/cooperation`, `#games/content/{id}` | Existing cooperation goals and authorized course-content review. The gateway makes cooperation GET reads read-only. |
| `#feedback` | Authorized current/history inbox, state changes, refresh and export. Ordinary teachers see their class scope; configured administrators retain their permitted broader view. |
| `#settings`, `#settings/audit` | Capability-gated settings and recent successful operation metadata. Grading configuration continues to require the existing homework-owner ID. |

The persistent teaching context selects class and the relevant textbook or game course. Selection is saved under the signed-in user's ID in session storage and checked against current metadata on load. A stale or unauthorized class is not accepted as authority.

## Layout and type

One continuous ivory workspace sits inside navy. The original white M/book-page mark and `assets/hub-serif-84bab7c8.woff2` remain the identity. HubSerif gives the task page and section headings their hierarchy; system sans supports controls, body copy and data. Exact extracted teacher values are in `DESIGN.md` frontmatter. Diagram and imported homework colors remain owned by those modules.

Desktop uses a sidebar with six work areas plus authorized settings and a return link. A page heading and publication shortcut precede the context row. The overview places action items beside a ruled evidence rail; other work uses the same continuous surface. At 1150 px, the rail stacks and the sidebar narrows. At 760 px, the sidebar gives way to four fixed bottom slots: 总览, 班级, 批阅, 更多. More opens a native dialog. Content clears the bottom navigation and device safe area; narrow-phone gutters adjust at 380 px.

Phone tables with actions stack into labeled rows and full-width actions. Comparison tables preserve their columns inside a focusable horizontal scroll region with a visible “左右滑动查看完整表格” hint. All phone buttons have an approved 44 px minimum; bottom navigation targets are at least 48 px. These are teacher-specific rules, not a change to the gallery or standalone homework shell.

## Interaction contract

- Real activity leads: attempted game concepts and their separate evidence appear before classroom tasks and submitted writing. The remaining unattempted concepts stay in an initially closed, counted native disclosure with previews and follow-up actions available.
- Preserve explicit loading, empty, unavailable, saving, error and success states. An upstream failure must not look like successful empty data. Inline form failure is focusable; duplicate submit controls disable while pending.
- Use native anchors, form controls, details and dialogs. Route changes focus the active workspace; the skip link, visible keyboard focus and semantic table headers remain. Context switches and route/exit actions prompt when edits are dirty.
- Navigation changes use brief color transitions; transient notices use opacity and translation. Reduced motion removes animations and transitions without removing state, focus or available actions.
- Class archival is a reversible preference. Transfer/detach changes membership and retains identity and learning history. Preserve confirmation wording that explains the consequence.
- Bookself results, EconQuest evidence and electronic homework scores remain separate; no combined total or inference from absent attempts is introduced. Only submitted writing revisions and their corresponding feedback are shown.

## Native reuse and provenance

`teacher/index.html`, `teacher/app.js` and `teacher/style.css` own the host. `homework/app.js` is imported and mounted with `mountTeacherHomework`, then cleaned up with `unmountTeacherHomework`; the shared learning-model and PDF-reader modules remain native. There is no iframe. The shell clears inherited homework outer padding/height/scroll containment so the work starts directly below the tabs. The homework module retains its internal task flow and original artifact handling.

`teacher/homework.css` is generated from `homework/style.css` by `scripts/scope-homework.mjs`; keep it generated and use the generator's `--check` mode to detect drift. Do not hand-edit the generated stylesheet. The standalone student stylesheet and its layout remain authoritative for `/homework/`.

The graph files are unchanged copies from `econquest-navigation-v22-20261110/econquest/dist/js` in the project workspace. SHA-256 equality was checked during documentation:

| Copy | SHA-256 |
| --- | --- |
| `teacher/graphs.js` | `7683588345427108dcbfc4f868780188b258eb8638e464d1e320241caec243a5` |
| `teacher/graph-projections.js` | `a16f82d5fbc403d98456cb44821ff02dce74bde2e5867b1b601aca0ec0f79ad7` |

Preserve original graph geometry, source content and the mark/font/identity assets. There are no newly generated image assets for this extension.

## Preservation and permissions

Preserve user IDs/passwords, class IDs, question/content IDs, accounts, textbook progress, game history/evidence, assignments, grades, original attachments, existing databases/data volumes and compatibility URLs. Do not merge or erase legacy homework accounts/mappings/history. No data migration, production operation or destructive cleanup is authorized by this documentation.

The portal gateway verifies the existing session, teacher role, mutation origin/CSRF and an explicit operation allowlist. Core services remain the authority for class ownership and capability enforcement; frontend hiding is not authorization. New archive/profile routes verify ownership server-side. Platform administrators are stable configured Bookself IDs in `TEACHER_WORKSPACE_ADMIN_IDS`; content reviewers are configured IDs in `TEACHER_CONTENT_REVIEWER_IDS` or administrators. Homework grading configuration independently retains `HOMEWORK_OWNER_BOOKSELF_ID`, so workspace administrator status does not grant grading ownership.

## Evidence boundary

The supplied final review `.impeccable/review/teacher-workspace-review.md` clears mobile action discoverability, host/homework spacing, first-use games ordering and phone action size. `.impeccable/review/teacher-workspace-fixes.json` reports 28 passing checks across 360, 390, 844 and 1440 px and seven routes. Captures are listed in the documentation record. This is local browser/viewport evidence, not physical-device testing or production-deployment certification. Subsequent functional/release checks remain the release owner's responsibility.
