# Single-assignment grade card

When the current result contains one assignment, the grade view now renders only its detail card: one full title, one score row, and direct original-question/correction actions. The redundant fishbone node, summary average, duplicate list row, and inapplicable view switch are omitted. Two or more results retain the fishbone/list views; filtering between one and multiple assignments restores the appropriate layout without changing scores.

“查看原题” opens an inline read-only paper viewer using the effective submission's saved paper and question snapshot. Work without a submission reads the current published paper. The viewer supports PDFs, image originals, multiple files and text-only questions, and retains its PDF position. “订正” opens the first wrong question directly, retaining the existing question navigation and autosave flow. Pending/unsubmitted and perfect-score cases retain original access and explain why correction is unavailable. Original student work and PDF downloads remain under More/history.

Switching from a correction to its original waits for draft saving. Failed saves preserve the editor instead of replacing its contents with a loading error. Original loading errors can be retried. Reader/scrolling surfaces now have explicit region roles matching their accessible labels.

## Validation and preservation

- 51 unit tests; 11 backend integration groups.
- 52 targeted Chrome/WebKit cases across 320, 390, 768, 844 landscape, and 1440 widths: zero/one/two/six assignments, duplicate removal, first-screen actions, PDF page/zoom continuity, direct correction, draft preservation and failed-save guards, load retry, pending/perfect/unsubmitted states, text-only original.
- Two additional cross-browser cases cover PDF/image file switching and 2→1→2 filtered layout recovery.
- 19 existing PDF/upload/editor/roster workflow groups and 18 existing grade/heatmap/correction groups passed. Representative new states passed automated WCAG A/AA checks; scoped layout scans reported no findings. Desktop and mobile screenshots reviewed.
- Fresh encrypted database backup restored to an isolated cluster with matching schema/data and passing heap/index integrity. Compare the read-only business digest after the exact Railway release is SUCCESS, then verify original URLs and protected routes.

No grading rules, database schema, accounts, learning progress, assignments, grades, files, volumes, or URLs are modified. Browser viewport/touch and WebKit checks are not physical-phone testing. Synthetic QA remains isolated from production.

Local evidence: operations/single-assignment-20261112/results in the project workspace.
