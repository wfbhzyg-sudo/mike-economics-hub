# Unit 2 library documentation pass — 2026-11-13

Disposition: scoped documentation complete for an ordinary extension. The implementation and review evidence support the documented local behavior; production deployment remains pending. This pass does not replace the project's visual identity or broaden the independent review's scored SHIP disposition.

## Authority and write boundary

Compared `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/unit2-library-brief.md` and the document reference against the final implementation and supplied captures. The incumbent north star remains **Original Worlds, One Editorial Frame**. The Unit 2 extension follows its own approved brief: prepare from original sources, then read, write, publish, review and correct along the same learning path.

Only these files were written:

- `docs/unit2-library.md` — Chinese usage guide, collection scope, privacy and validation limits.
- `.impeccable/review/unit2-library-documentation.md` — this scoped implementation comparison.

`PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` were preserved. Application code, identity assets, synced references, original PDFs, account records and student data were not changed or copied into these documents. No detector, browser session or automated test was rerun in this documentation pass.

## Recorded scoped system

This is an inventory of the built Unit 2 surface, not a new global token specification.

| Role | Observed value and application |
| --- | --- |
| Primary ink | `#132941`: headings, primary actions, current Topic and active writing tool |
| Paper | `#f7f4ec`: library workspace and companion header slot |
| Supporting text and rules | `#52606a`, `#d3d6cc`: source labels, secondary copy and row dividers |
| Lesson emphasis | `#e5ece1`: learning focus, selected content tab, active question preview and class choices |
| Teacher notes | `#eee2d7`: collapsible teaching notes distinct from student material |
| Keyboard focus | `#39799b`: 3 px visible outline with 2 px offset |
| Drawing tools | Ink plus `#8a4438`, `#33664f`, `#e9c74b`: supported pen/highlighter colors |

The library uses HubSerif with Songti SC/serif fallback for its Unit heading (26 px) and Topic heading (23 px); both become 20 px at 700 px and below. Body text is system sans (15 px / 1.55), subsection labels 17 px, supporting labels 13 px, and form inputs 16 px. Compact mobile reading further reduces the Unit and Topic headings to 18 px and 17 px. Source-page typography stays in the original PDF or image.

The desktop library uses a 205 px Topic rail, a flexible content area and a 24 px gap. At 1000 px the rail becomes 165 px with a 16 px gap; at 700 px it becomes a horizontal scroll strip. Library padding changes from 22 px to 14 px 12 px. Mobile reading hides redundant introduction/actions/Topic navigation while retaining reading controls.

Surfaces are flat, with paper tones and thin dividers. The scope uses 4–9 px corners: 9 px work/focus surfaces, 7 px teacher notes, 6 px buttons, 5 px inputs and 4 px key-point labels. Library buttons and inputs have 44 px minimum height. These local values do not replace the global teacher or homework token families.

## Components and behavior compared

| Surface | Evidence-backed behavior |
| --- | --- |
| Topic path | Learning objective, original-source resources, Bookself chapter and teacher-only note disclosure share one continuous workspace. |
| Question bank | Topic/Skill/Big Idea/source filters and original-text search; original image preview with source pages; distinct current-preview highlighting; empty filtering clears the stale preview; selection capped at 40. FRQ switches to Unit-only classification. |
| Publication | Class choices, deadline, time limit and submission options; selected source questions become a captured assignment version. MCQ uses confirmed answers; FRQ includes scoring points and awaits teacher confirmation. |
| Reader | Original PDF pages, lazy thumbnails, previous/next and explicit page entry, zoom, full-screen fallback, arrow/PageUp/PageDown navigation and locally retained position. The separate projection window omits teaching notes. |
| Annotation | Resource/page-scoped private notes; browser-mode versus writing-mode separation; pen/highlighter, undo/redo and text notes. Cloud revisions and local unsynced backup expose conflict choices. |
| Handwriting | Per-question drafts and durable PDF export; on desktop above 900 px, original question and answer sit alongside; mobile keeps a bounded original reference above writing. Export adds an attachment and does not submit the assignment. |
| Correction | Existing inline correction and Bookself review links remain; a separate handwriting draft exports to the correction's attachments, with explicit final save and unchanged original grade. |
| Companion | Library and expanded handwriting reserve a 44 px header slot with space for the account/title controls; sticky headers retain that separation during scroll. This is scoped to these surfaces. |
| Motion | No new decorative motion. Reduced-motion rules remove transitions/animations within the library and handwriting scope; direct mobile preview scrolling is instant. |

## Evidence and limits

Source checked: `homework/library-ui.js`, `homework/library.css`, `homework/ink.js`, `homework-server/library.mjs`, `homework-server/library-model.mjs`, and integration portions of `homework/mcq.js`, `homework/learning-ui.js` and `teacher/app.js`. The server strips teacher notes and teacher-only resources from the student unit response, limits question-bank access to teachers, checks class ownership and namespaces notes to the authenticated owner.

The 11 supplied screenshots were inspected directly:

| Capture group | Files in this review directory | Observation |
| --- | --- | --- |
| Learning path | `desktop.png`, `mobile.png` | Continuous paper, source rows, desktop Topic rail and phone Topic strip |
| Bank | `desktop-bank.png`, `mobile-bank.png` | Original-question preview, 16 px fields, wrapping filters, visible selection actions and current preview state |
| Writing | `desktop-handwriting.png`, `mobile-handwriting.png`, `user-360.png` | Paired desktop reference/answer, stacked phone layout, reserved companion slot and accessible tool wrapping |
| Reading/presentation | `mobile-textbook.png`, `desktop-projection.png` | Full-screen original pages; textbook ink overlay and page notes; projection without teacher notes |
| Return journey | `mobile-review.png`, `mobile-correction.png` | Submitted handwriting PDF, indicative review score, original-question correction and Bookself chapter link |

Capture sizes cover 1440×1000, 390×844 and 360×780. Screenshots establish visual layout, not device latency or physical stylus quality. There is no claim of physical iPhone/Apple Pencil testing or preservation of native PPT animations in the static PDF viewer.

Release-owner verification recorded 134 passing automated tests: 111 application tests plus 23 worker tests. The following inspected aggregate reports are outside the repository in the project operations directory; no credentials, database dump contents, source PDFs or student records are reproduced here:

- `../../../operations/micro-unit2-20261113/results/flow.json`: all 7 isolated API flows pass, including class release, private annotation revisions, publication, deterministic MCQ grading, teacher release, correction/Bookself linkage and per-question handwriting export.
- `../../../operations/micro-unit2-20261113/results/frq-ai-final.json`: the real AI fixture returned 7/10, was teacher-published at 7, and retained the original MCQ score of 26/27. No live student accounts were used. These values describe fixture scores, not accuracy estimates.
- `../../../operations/micro-unit2-20261113/results/restore-result.json` and `core-restore-result.json`: both database restores matched schema and data, restored roles and passed index/heap integrity checks.
- `../../../operations/micro-unit2-20261113/results/object-backup.json`: 22 original attachment objects restored and compared successfully.

The independent reviewer reported three findings, all resolved before its scored **SHIP** disposition: reserve the companion in sticky headers, show the current bank preview state, and clear an old preview after filtering to no results. The release owner maintains the aggregate review in `unit2-library-review.md`. This documentation pass inspected the final code for those three changes and the supplied final captures; it did not repeat the review interaction script. SHIP here does not mean deployed.

Collection counts are 319 MCQ source instances (292 bank + 27 Progress Check, with overlap and no content deduplication), 2 FRQ, 9 Topics, a 125-page slide PDF, a 115-page textbook and a teacher-downloadable 153-slide source PPTX. MCQ mappings use official 2026 CED vocabulary as local teaching mappings, not official per-item tags. FRQ classification remains Unit-only.

## Five-line system summary

1. Palette: scoped ink/paper with sage learning emphasis, clay teacher notes and a visible blue focus outline; original source diagrams keep their own colors.
2. Type: HubSerif Unit/Topic headings, compact system-sans controls and unchanged PDF typography; no global type ramp added.
3. Layout: Topic rail becomes a phone strip; reading reduces chrome; desktop handwriting pairs the original question with the answer, while phone content stacks.
4. Component rule: show current preview, clear empty results, distinguish draft/export/submit, and reserve companion space in sticky headers.
5. Named rules: preserve the existing Original Color and Visible Task rules; these Unit 2 behaviors remain scoped and add no global prohibitions.

## Drift not canonized

The global documents and sidecar predate later compact homework/teacher surfaces and do not enumerate this extension's paper, sage, clay, focus, spacing or radius values. Their older navy-surround and navigation specimens were not rewritten to match these local captures. This is reported documentation drift outside the ordinary-extension write boundary, not a reason to replace the incumbent system. No defect, source-artifact limitation or unverified physical-device behavior was adopted as a house rule.
