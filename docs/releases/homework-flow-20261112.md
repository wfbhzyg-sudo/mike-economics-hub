# Correction reference workspace and grade bands

Students can read their submission's original question paper, original answer, and correction history beside the correction editor. Switching reference tabs retains the input and reader state. Save-and-next and previous/next navigation preserve drafts; failed saves keep the student on the same question with enabled retry controls. Unfinished attachment uploads cannot be discarded by question navigation. Correction saves do not change published grades.

Average homework scores now share five fixed 20-percentage-point bands (red, orange, yellow, light green, deep green) and classroom AP reference 1–5 labels. No-grade values remain neutral. This is a classroom reference, not official AP cut-score conversion or population quintiles. Existing equal-assignment weighting is unchanged.

Teacher forms track unsaved work independently, lock submitted controls while saving, retain values on errors, and show explicit save status. Saving one essay's feedback no longer clears the unsaved warning for another essay. Student mistake filters and teacher class/feedback filters persist within the account's session.

## Verification

- 44 unit tests, including score boundaries, rounding, and missing values.
- 19 established browser workflow groups and 9 submission/teacher experience groups.
- 8 new correction/teacher feedback groups: Chrome and WebKit at 320, 390, and 1440; original PDF page mapping, zoom, source photos, manual-activation reference tabs, draft reload, save-and-next, failed navigation/save retry, filter restoration, unchanged published grades, and independent pending teacher forms.
- 16 core views at each of 320/390/1440: no document-width overflow or WCAG A/AA findings in the automated audit. New correction views also passed the automated accessibility audit.
- Design detector: zero primary findings, 21 advisory differences from the older design sidecar. The 15 color advisories implement the requested score semantics and established homework palette; radius/type advisories retain product-sized controls. Visual desktop/mobile review completed.
- Fresh encrypted homework database backup restored in an isolated Unix-socket-only cluster. Schema/data fingerprints and index/heap integrity passed (31 rows across 2 tables). No production grades, papers, accounts, attachments, volumes, or databases were modified by validation.

Browser mobile/touch simulation is not physical-device verification. No new AI grading call was required for this UI release.

## Explicitly outside this release

Student fishbone timeline and teacher heatmap remain design-only. Their complete component specification, illustrative images, and standalone prototype live in the project outputs folder and are not included in the production site. No database schema or URL changes.

## Research

- Carbon data-table guidelines: https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines
- GOV.UK return-state guidance: https://design-system.service.gov.uk/components/back-link/
- WAI-ARIA tabs and keyboard practices: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Canvas DocViewer: https://community.instructure.com/en/kb/articles/661231-unknown
- Official AP score information: https://apstudents.collegeboard.org/about-ap-scores

Provider release IDs and post-release read-only checks are recorded under operations/homework-flow-20261112/results in the local project workspace.
