# Self-practice interaction repair — 2026-11-17

## Reproduced defects
- Choice controls set `aria-checked`; CSS only selected `aria-pressed`. Clicking saved an answer but displayed no selected state. Answer-card CSS also selected attributes the markup never emitted.
- Unit checkbox click interception ran in capture phase, preventing the delegated select-all handler. It also included disabled, empty chapters.
- A second edit made while a save was pending could remain unsent after its debounce fired. Clean local drafts always overrode newer server answers. Conflict reload attempted to call a shadowed object as a function.
- The app did not register the self-practice view cleanup, leaving timers/key handlers behind on navigation.
- Failed start still exposed an answering screen. A failed submission stopped the timer and unlocked expired papers.
- Shared-topic question counts could exceed the unique drawable pool. The old 24-topic cap prevented selection of several whole units.
- Wrong-question images clipped cross-page crops. Reopened corrections used stale in-memory values.

## Changes
- Explicit green choice/letter selection, current/answered/flagged answer-card states, compact A–E controls, keyboard radio navigation. Selecting or flagging preserves the image DOM, zoom and focus.
- Unit select-all/clear/partial state uses native change events and excludes empty chapters. Timer inputs require whole minutes. Available counts use anonymous topic-group unions, with source-question deduplication.
- Immutable save snapshots drain edits in revision order. Local draft writes cannot crash the interface; clean drafts never replace server state. Save failures have an inline retry. Version conflicts preserve a local backup and reload account answers explicitly.
- Start failures show retry; expired papers stay locked if submit fails, with a retry action. Keyboard handlers do not act behind dialogs. View cleanup removes timers, listeners and dialogs and ignores late responses.
- Cross-page originals remain visible and can expand. Correction choice/note update immediately after saving. Duplicate create clicks are blocked; retrying the same configuration reuses its client id.

## Validation
- Node 22: 248 tests; 247 pass; one existing PostgreSQL-environment skip.
- Eleven UI regression scenarios executed against actual `self-practice.js` in jsdom, including computed selection styles, select-all, slow saves, storage failure, stale local drafts, conflict recovery, failed start/submit, lifecycle cleanup and correction reopening.
- Actual UI with isolated Portal/Core/PostgreSQL/S3 APIs: both Micro and Macro, unit-all → 20 answers → 16/20 → four wrong questions → persisted correction. Classroom grade values unchanged.
- Six further 20-question API flows across Micro/Macro U1–U3 verify image access, answer privacy, grading, idempotency and corrections.
- Chrome and browser-inventory connection timed out. DOM/computed-style tests do not establish rendered geometry, physical-device behavior or production signed-in UI verification.

Operations: `operations/practice-interaction-fix-20261117` under the shared project root. Production backup/decryption and row-fingerprint evidence remain private; no migration, production seed, permission edit, account/grade rewrite or source-file edit is part of this change.
