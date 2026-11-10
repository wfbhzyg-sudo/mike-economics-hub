# Student flow documentation pass — 2026-11-10

Disposition: scoped documentation complete. This pass records the final local extension; it does not deploy it or broaden the independent review's ship verdict.

## Authority and preservation

The final source in `homework/app.js`, `homework/learning-ui.js`, `homework/learning-model.js`, `homework/style.css` and `homework-server/api.mjs` was checked against the scoped V3 brief, student-flow review, detector output and acceptance records. Existing `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` were read and preserved. No application source, identity asset, synced reference, global token or sidecar was edited by this pass.

Paths in this record are relative to the checkout root. Only `.impeccable/student-flow-brief.md` and this record were written.

## Recorded behavior

| Surface | Observed extension and its boundary |
| --- | --- |
| Assignment list | Actionable/processing/done/closed ordering, deadline order within each group, course/search-scoped counts, retained route-navigation filters, explicit empty-result reset. Full-reload filter persistence is not claimed. |
| Upload entry | Queue keyed to the student and route, preserved during navigation in the open page, successful IDs retained, only unfinished items retried, explicit pending-file removal and final-save blocking. Pending local files require reselection after refresh or closure; drafts save text and uploaded IDs only. |
| Submission form | Native external form action in a fixed phone footer at ≤640 px, wrapping at ≤360 px, page/pending/save feedback, safe-area clearance, protected right rail and focused actionable errors. |
| Correction editor | Student-owned account draft with revision checks, local unsynced text/ID recovery, reconnect saving, explicit local/account conflict choices and separate final correction history. Loading the account version clears the old pending queue after the visible reselection warning; active processing blocks that switch. |
| Final correction save | Stable ID for unchanged retry, new ID after edits/local-version continuation, server payload-hash check, draft clearing after commit and preserved original grade. |
| History | Native disclosure starts collapsed at ≤760 px and open above it at route render. Records remain accessible. |

## Five-line system summary

1. Palette: incumbent navy surround, ivory paper and ink remain; recovery uses the existing selected-row fill.
2. Type: HubSerif task headings and system-sans native fields remain; no global type ramp is added.
3. Layout: one native-scrolling paper, transparent title, bottom desktop dock and right phone liquid rail remain; the phone action footer respects that rail.
4. Component rule: native controls and disclosures carry search, retry, conflict choice and correction history with explicit state text and keyboard focus.
5. Named rules: none added to the global system; the observed task boundaries are documented in the scoped brief only.

## Evidence and limits

`../../../operations/homework-student-flow-20261110/results/acceptance-summary.json` reports 70 passing grouped checks: 20 app/unit, 11 baseline API, 9 draft API, 15 browser, 9 final QA, 3 conflict QA and 3 reviewer fixes. The browser report contains empty error/overflow lists. The final QA records desktop, tablet, 390 px, 320 px and 390×440 short-height layouts. The documenter inspected the supplied `results/browser/390-upload-recovery.png` and `390-draft-conflict.png` captures to confirm the visible retry/reselection wording, form treatment and retained right rail. No tests, server or browser automation were rerun during this documentation pass.

The final independent review at `.impeccable/review/student-flow-review.md` is **ship for the scored fixes**. Its recovery evidence covers account-version attachments and lost final acknowledgement followed by editing. `.impeccable/review/student-flow-detector.json` has zero primary and 57 advisory findings; this is not a claim that every advisory item was repaired.

Tests use isolated synthetic accounts and grading fixtures with Chrome viewport/touch and reduced-height simulation. They do not establish physical-device behavior or new real-model accuracy. Bookself identity/classes, historical grades and original files remain authoritative. AI-provider behavior, automatic photo-quality classification and scheduled full-answer release are outside this extension. Backup verification was supplied by the release owner; deployment remains pending at handoff.

## Drift not canonized

The older homework navigation labels and specimen details in `DESIGN.md` / `.impeccable/design.json`, plus advisory color/type/radius differences, were not repaired or promoted into new global rules: this is an ordinary extension and the authorized write boundary preserves the incumbent system. Current task behavior is recorded in the scoped briefs instead. No craft-floor defect is adopted as a house style.
