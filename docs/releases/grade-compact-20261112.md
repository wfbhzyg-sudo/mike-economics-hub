# Compact homework grade journey

Sparse assignment histories no longer reserve a full-width, two-row fishbone. Zero assignments omit the chart; one to three use a short rail; wider desktop layouts place the score detail alongside that rail. A single phone assignment uses a compact horizontal node. More assignments retain alternating fishbone branches with a smaller row gap. Browse controls appear only when useful, and the chart's line follows its content width.

On phones, low-frequency search/date/view controls live in a disclosure with an active-filter indicator. The grade summary remains visible. Selecting a node scrolls the score details into view without changing selection while swiping. Existing horizontal touch scrolling, mouse dragging, keyboard navigation, reduced-motion behavior, filter persistence, and grade calculations remain in place.

Inline correction now spans the available content width beneath the score area. Original question and correction input have reciprocal jump controls. When an original paper exists, its additional text transcription is expandable; text-only questions stay visible. Opening a correction brings it into view; closing returns to its question control. Reference tabs, PDF position, drafts, retry handling, and the original published score are retained.

## Verification

- 51 existing unit tests passed; no scoring, API, schema, or persistence logic changed.
- 52 focused Chrome/WebKit cases: 0/1/2/3/6 assignments at 320×740, 390×844, 768×1024, 844×390, and 1440×1000; no card clipping or page overflow; small-history dimensions, visible phone score actions, sparse desktop side-by-side details, original/edit jump controls, saved draft preservation, short input viewport, and return focus.
- 18 existing timeline/heatmap/inline-correction browser groups passed across four widths and both engines, including save failure, pending replacement, teacher review return, scoped export, and keyboard behavior.
- Three touch/drag/large-heatmap edge groups passed. WCAG A/AA checks on representative new states and existing grade workflow states reported no violations. Scoped layout scans reported no findings before/after. Desktop and mobile screenshots were visually reviewed.
- Fresh encrypted homework backup restored successfully in an isolated cluster with matching schema/data and heap/index integrity. Read-only business record digest compared before/after Railway release.

Phone testing is browser viewport/touch simulation and WebKit, not a physical phone or its actual software keyboard. No production records, files, account/progress data, databases, volumes, or URLs are changed. Provider SUCCESS and post-release read-only checks are required for the exact release commit.

Local verification evidence: operations/grade-compact-20261112/results in the project workspace.
