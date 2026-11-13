# Teaching and learning experience fixes — 2026-11-14

Course practice was empty for students because public assignments omitted the library identifiers. Add only course/unit/collection metadata to the existing safe response, retaining answer privacy. Course practice now uses the same next-action rules as the assignment centre (scheduled, draft, submitted and published).

Teacher pack previews retain the exact publication order and have their own resumable routes. The bank exposes selected questions and out-of-filter selections, next/previous preview and direct selection. Single-item previews remove the empty directory/navigation footprint. Remove duplicate teacher navigation and reserve the primary treatment for reviewing student work.

Reader, annotation and bank menus stay within the viewport, including short landscape windows. Reserve header space for the companion. Repaint PDF canvases after resize/focus without rebuilding notes or changing page position. Resume the previous topic and reader mode. Standalone corrections now provide the same reading/writing shortcuts as inline corrections, including reopening a collapsed original.

Validation: 122 tests pass; isolated teacher publish → student MCQ submit → rule score 1/1 → teacher release, plus saved correction with original 2/3 grade retained. Browser layouts checked at 1280×800, 820×1180, 390×844, 360×740 and 844×390, with actual viewport dimensions checked. Keyboard Escape/focus return, search highlights/selection scope, private notes and resumed reading checked. These are browser viewport tests, not physical iPhone/iPad/Pencil certification.

No schema migration, production assignment rewrite or attachment import. Production preservation is checked with read-only database fingerprints before and after deployment. Source PDFs and existing grades remain untouched.
