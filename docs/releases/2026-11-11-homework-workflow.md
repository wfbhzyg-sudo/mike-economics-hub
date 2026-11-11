# Assignment workflow and paper reader

The assignment overview now contains assignments and aggregate counts. Student identities and submission records appear inside the selected assignment, with separate submission and grading states. A submitted attempt is green; an expected recipient without an attempt is red. Drafts and later class joiners are not counted as missing. New assignments capture their Bookself recipients at first publication. Historical assignments expose an explicit recipient-confirmation action instead of inventing past class membership. Resubmissions retain the latest published grade while awaiting an update.

Creation and editing use a shared compact visual structure: horizontal class chips, one policy row, a paper preview and an adjacent requirements panel. The course selector is removed; metadata edits preserve the stored course and new assignments default to Economics. Existing paper, answer versions, original uploads and grading records remain unchanged.

The reader uses PDF.js text layers and character-to-item mappings to highlight and navigate individual matches across all pages of the selected PDF. It supports lazy canvas thumbnails, next/previous matches, interrupted searches, Unicode normalization, rotation and zoom. On phones, page navigation and search use an on-demand bottom sheet. Scanned PDFs explicitly report the absence of searchable text. Multiple question PDFs can be switched without opening separate previews. Students start with the paper and deliberately open the upload step; returning retains reading position.

## Validation

- 42 unit checks, including recipient snapshots, duplicate submissions, original grades during resubmission, legacy uncertainty, Unicode/ligature search offsets and HTML escaping.
- 11 isolated API integration groups covering Bookself identity/classes, immutable answer versions, images/PDFs, drafts, duplicate submits, grade privacy, corrections, export, resubmission and late policies.
- 19 browser groups in Chrome desktop/touch emulation and WebKit. Layouts included 320, 390, 768, 844 and 1440px widths, short landscape, long titles, zoom, rotation, pinch, fullscreen, reduced motion, class filters, previous-step recovery and search positioning.
- Additional checks for scanned PDFs, multiple PDF switching, explicit phone draft/submission, recipient confirmation and the existing image-first review studio. No real student grades were altered by testing.
- Encrypted database backup was restored in an isolated PostgreSQL cluster. Schema/data fingerprints and index/heap integrity matched. Production business-record fingerprints are compared around deployment.

Phone verification is browser/touch simulation, not physical-device testing. Search uses an existing PDF text layer; it does not add OCR to scanned documents. Existing historical recipients are confirmed by the teacher, not silently backfilled.

The text-layer CSS variable integration follows the bundled PDF.js TextLayer API and Mozilla's Apache-2.0 reference: https://github.com/mozilla/pdf.js/blob/master/web/text_layer_builder.css
