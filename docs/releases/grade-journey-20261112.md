# Homework grade journey and class heatmap

The student grade page now presents one horizontal fishbone node per assignment. A student can browse by touch, trackpad, mouse drag, or keyboard, select a score, and expand the original question beside the correction editor without leaving the grade page. The teacher grade page now provides a class heatmap with frozen student/average columns and assignment headings, plus a mobile student list and compact score-detail sheet.

## Behavior and data

- Five fixed 20-percentage-point bands reuse the approved muted red/orange/yellow/light-green/deep-green palette. Classroom AP reference 1–5 is explicitly not an official AP score conversion or population quintile calculation.
- Existing equal-assignment-rate averaging and published grade selection are unchanged. Zero is a score; missing, pending, unconfirmed, and unassigned are separate states. A pending resubmission retains its earlier published grade until a replacement is released.
- Missing work requires membership in the assignment's saved recipient list. Historical recipients remain visible; later joiners are not assigned invented missing marks.
- The timeline uses chronological, equal-height branches. Native horizontal scrolling never changes selection by itself. First/latest controls, search, date filters, list view, and a three-versus-three published-score comparison provide alternatives.
- Details retain raw score/max points, submission history, PDF download, and published version. Correction uses the submitted paper snapshot and existing private autosave/conflict handling. Reference tabs, question navigation, and save-and-next remain within the grade view. Saving a correction does not change the published grade.
- The heatmap supports class/date/student/status filters, sorting, a scoped CSV export, student trajectories, and direct teacher review. Returning restores selection and table position. Initial rendering is bounded to 50 students and 50 latest assignments, with explicit loading of more.
- CSV contains the current filtered scope, distinct states and blanks for ungraded scores; formula-looking names are escaped. Score versions use published grade revision, not reference-answer version.
- Student learning responses contain only the student's recipient flag, never classmates' recipient IDs. Teacher learning responses exclude students' unsubmitted draft bodies.
- Refresh provides busy feedback. Original-question load failures can be retried without leaving the page. Failed draft saves retain the editor and prevent destructive switching.

## Preservation and release scope

No schema migration, database replacement, account/progress changes, attachment movement, deletion, volume change, or URL change. The four new grade-view assets are explicitly allowed by both server entry points. Existing original gateway and canonical Railway URLs remain in place.

A fresh encrypted homework database backup was restored to an isolated Unix-socket-only cluster before release: 31 rows across 2 tables, matching schema/data fingerprints and passing heap/index checks. A separate digest of the existing assignment, submission, answer version, and four file records is compared before/after deployment. Synthetic QA data is held in a separate local database, not production.

## Verification

- 51 unit tests covering grade selection, real zero versus missing, historical assignments, recipient snapshots, semester/date boundaries, progress differences, CSV protection, existing grading and review helpers.
- 11 backend integration groups covering the established upload/grading/privacy flows.
- 18 grade-journey browser groups across Chrome and WebKit at 320, 390, 768, and 1440 pixels: timeline scrolling, long titles, pending replacement, inline original PDF page mapping and answer images, autosaved corrections, failed-save protection, scoped CSV, keyboard navigation, review-return state, empty/date validation.
- Three additional edge groups: synthetic touch swipe, reverse mouse drag/reduced motion, and a synthetic 100-student × 60-assignment heatmap with progressive loading and frozen headings/columns. The latter is a local rendering test, not a production capacity benchmark.
- 19 established PDF/upload/editor/roster browser groups; five image-first review checks including no published score mutation.
- Six final control checks: selection-preserving refresh and original-question retry at desktop/phone sizes, mobile sheet drag-dismiss/focus, teacher trajectory return.
- Automated WCAG A/AA and overflow checks on 16 established views at 320 and 1440 pixels and all new cross-browser view states; zero reported violations. Desktop and phone screenshots visually reviewed.
- Design detector: zero primary findings; 27 advisory token differences from the older sidecar reflect the approved five-color palette and established control sizing.

Phone checks use browser viewport/touch simulation and WebKit, not physical phones. No new AI model call is required by this display/navigation release. Provider status must be SUCCESS for the exact commit before read-only production route/access-control checks and the final preservation comparison.

Local evidence: operations/grade-journey-20261112/results in the project workspace. The approved component specification remains in outputs/grade-journey-design-20261112; its example data and prototype are not shipped to production.
