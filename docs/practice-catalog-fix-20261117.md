# Course release and self-practice repair — 2026-11-17

The U1/U2 MCQ crops use file purpose `question`; self-practice previously accepted only `library`, removing those units from the catalog. Both image purposes now qualify, while unreliable answers, flagged crops, private answer files, unpublished units, duplicate questions and exams remain excluded. Image metadata is fetched in batches and refreshed per request, so a repaired crop does not require a restart. Related-topic filtering now agrees between catalog counts and paper generation.

Own self-practice snapshots grant access to their question images. They do not grant access to another student's attempt, teacher answer files, PDFs or unrelated images. No production records or permissions are rewritten.

Course controls now participate in normal header flow on desktop, with wrapping for long titles. The same controls move into the mobile context row below 901px; no duplicate toolbar is rendered. Both release buttons open the current unit's dialog, and the visible class count updates after saving.

Validation at this change:
- Node 22: 245 tests, 244 pass, 1 pre-existing skip.
- Isolated PostgreSQL/Core/Portal/S3: Micro and Macro U1/U2/U3, six 20-question papers; image bytes 200, private answer and peer access 404, correct 16/20 scores, idempotent submission and correction; classroom grades unchanged, unreleased U4 blocked.
- Read-only replay of current production library: Micro U1/U2/U3 = 91/319/268; Macro = 70/131/242 eligible questions. These are totals across current course releases, not a change to any class's permissions.
- Actual library component under jsdom: both release actions, current-unit request, count refresh, bank navigation, toolbar placement at 1440/900/390/320, lifecycle cleanup. This verifies behavior and DOM structure, not browser geometry.
- Chrome connection timed out. No successful live desktop/mobile visual check is claimed.

Operational evidence is outside the repository at `operations/practice-catalog-fix-20261117` in the shared project workspace; private backup/fixture markers are excluded from Git.
