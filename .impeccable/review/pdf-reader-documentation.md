# PDF reader documentation pass — 2026-11-11

Disposition: scoped documentation complete for an ordinary extension of the incumbent homework workspace. This record does not declare a deployment or replace the final implementation review.

## Authority and preservation

Checked `PRODUCT.md`, the PDF-reader direction contract, existing `DESIGN.md` and `.impeccable/design.json` against `homework/pdf-reader.js`, `homework/app.js`, the final `homework/style.css` cascade, and `homework-server/paper.mjs`, `api.mjs` and `validation.mjs`. The final CSS includes the desktop closed-disclosure rule, so compact tools remain reachable after a short window becomes tall. The final page-input change handler also avoids navigating again when focus leaves an unchanged page number, preserving the within-page offset. The source is the authority for implemented behavior.

`DESIGN.md` and `.impeccable/design.json` remain untouched. No approved system replacement or reusable global-token addition was needed. No application source, identity asset, synced reference or operational configuration was changed by this pass.

Paths written: `HOMEWORK.md`, `.impeccable/pdf-reader-brief.md`, and this record. Paths are relative to the checkout root.

## Recorded behavior

| Surface | Implemented behavior and boundary |
| --- | --- |
| Accounts and classes | The current workbench uses Bookself accounts and registration classes. Teachers manage classes in Bookself; students do not create a second homework account or rejoin a class. Legacy data stays preserved. |
| Teacher creation | Student-visible PDF/attachments and completion scope precede private answers. Manual PDF/page mapping and a student-paper preview support publication checks. No OCR is needed to view or map a paper. |
| Reader | Continuous inline pages, bounded 65%–400% zoom, fit-width, double-click/pinch, full-screen with Escape, page input, page-directory buttons and original download. Directory buttons are not thumbnails; search uses existing text layers and jumps to a matching page without claiming OCR or highlights. |
| Position and layout | Account/file-scoped local and remote reading restoration; direct question location takes priority. Above 1000 px the divider adjusts 45%–72% from a 62% default; narrower screens stack, with a read/answer switch at ≤640 px. Secondary controls collapse in phone/≤500 px-height layouts and stay reopenable after resizing. |
| Privacy and history | Private answer attachments remain separate from student question files. Published paper metadata and question locations are snapshotted; feedback and mistake links retain the paper from the actual submission. |
| Submission | Stale final submissions receive a reopen message while saved work remains. The existing completed-submission lookup precedes this guard, preserving acknowledgement retry without duplicate submissions. Draft saving remains possible. |
| Operations guidance | Existing deployment, storage and worker sections were retained. Directly contradicted all-local/all-manual statements were replaced with conditional local/cloud and release behavior grounded in current code. No live provider, key, device readiness or model-validation state is asserted. |

## Five-line system summary

1. Palette: incumbent navy surround (`#0b1f3a`), ivory paper (`#f3eddf`), ink (`#102238`) and fine gray rules (`#c5c1b7`) remain; actual PDF pages stay white.
2. Type: HubSerif task headings retain the existing 28–46 px responsive heading ramp, 25 px sections and 16 px system-sans body/fields; the scoped phone submission heading is 22 px and reader controls are chiefly 12–14 px.
3. Layout: the single scrolling paper, transparent title and desktop/phone liquid dock remain; the document/answer split and compact reader controls adapt inside that frame.
4. Components: native buttons, fields and disclosures carry explicit reading, loading, retry and search states; SVG controls and visible keyboard focus retain the incumbent control language.
5. Named rules: the existing Transparent Frame rule remains authoritative; no new global named rule, visual identity or primitive token is introduced by this extension.

## Evidence and limits

The durable repository-local acceptance reference is `.impeccable/review/pdf-reader-functional.json`; `HOMEWORK.md` links to this delivered report. Its checked aggregate records 24 unit tests, 11 baseline integration groups, 7 PDF API checks, 13 final desktop/phone checks, 7 reader-edge checks, 15 reading-continuity checks and 1 mobile-teacher workflow. All five detailed report groups have `passed: true`, with empty reported error/overflow lists. The final reading-continuity run covers page-number normalization, nonzero offsets through full-screen/divider/orientation changes, account restoration and short-to-tall disclosure access. The supplied finish reviewer returned **ship for the scored fixes**; this documentation records that scope without widening it to production verification.

The underlying workspace reports were also read under `operations/homework-pdf-reader-20261111/results/`, outside this checkout. They cover synthetic PDF-first publication, privacy, page mapping, saved reading positions, historical-paper access, stale-paper handling, responsive reading/answering, text-layer search, pinch/zoom, reduced motion, loading/retry and cleanup. The repository-local aggregate remains the portable evidence reference; production deployment and its live checks are separate.

No tests, server or browser automation were run during this documentation pass. Source inspection establishes the described controls and boundaries; supplied test records establish only their recorded checks. The documentation diff passed whitespace/error checking, and the incumbent design files had no documentation-pass diff. Physical phones, real handwriting/model accuracy, current production AI settings and production deployment are not verified here. PDF pen annotation and OCR are outside the first release.

## Drift not canonized

The incumbent global documents still describe older homework navigation labels (teacher 设备; student 提交记录/账户), legacy account-linking controls and older specimens; current source uses teacher 作业/待复核/学情 and student 作业/成绩/错题 with unified account/class handling. Existing advisory color/type/radius differences are likewise not repaired or promoted into rules. These pre-existing differences are reported only because this is an ordinary extension, not a global system refresh; no craft-floor violation is adopted as a future house style.
