## verdict

1. **Resolved — account-version attachments and pending queue.** The same authoritative `390-draft-conflict.png` now visibly explains that unuploaded local files must be selected again when loading the account version. `390-account-version.png` shows only `account-page.png`, with no pending local queue. `homework/learning-ui.js:64` blocks the action during active processing and calls `discardQueue()` before reloading; `homework/app.js:355` guards that operation and removes the route queue. The supplied reproduction checks the exact remote file ID, one attachment, and zero pending files. The local text/attachment-ID recovery snapshot remains retained separately.
2. **Resolved — finalization after lost acknowledgement and editing.** `homework/learning-ui.js:54,58,63` now rotates the final operation ID for content changes or explicit local-version continuation, retaining it for an unchanged retry. `homework-server/api.mjs:658–659` rejects a different payload presented under an already accepted ID. `390-finalized-new-correction.png` visibly shows both the original acknowledged-on-server correction and the subsequent newly edited correction as separate history records, followed by an empty correction field. The supplied reproduction confirms exactly one new entry for the edited operation, idempotent unchanged retries, rejection of mismatched payloads, and a cleared private draft.

The three updated/new scrolled captures are valid for their named recovery states, with no visible clipping or horizontal overflow. Read-only scoring used the revised source, `reviewer-fixes.mjs`, passing `results/reviewer-fixes.json` (three groups), and `results/conflict-qa.json` (three groups). No browser, server, detector, or tests were run by this reviewer. No material regression introduced by this fix batch is visible in the scoped evidence.

## remaining

Clear. This ship verdict covers the scored fixes, not the whole surface. Evidence remains synthetic Chrome viewport/touch simulation, not physical-phone verification or a deployment claim.

disposition: ship
