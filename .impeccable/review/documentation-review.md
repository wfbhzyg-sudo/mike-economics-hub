# Documentation review — unified login extension

Status: documentation extraction and validation passed. The focused finish reviewer returned **ship — P2 resolved** after the sole account-retry issue was fixed. This is a design/evidence verdict, not deployment verification.

## Scope and authority

- Created root `DESIGN.md` and matching schema-version-2 `.impeccable/design.json`; no root design files existed before this pass.
- Used the parent `../DESIGN.md` and `../.impeccable/design.json` as read-only incumbent authority. The inherited north star and gallery/homework language are retained, with counts and source paths reconciled to this artifact.
- Used confirmed `PRODUCT.md`, `.impeccable/unified-login-brief.md`, the approved desktop comp at `../../../design/unified-login-20261110/01-主登录页桌面.png`, and the current implementation. No new identity, palette direction or qualitative user decision was invented.
- Covered `login.html`, `login.css`, `login.js`, `portal-nav.js`, the appended account rules in `floating.css`, and unified-account controls in `homework/app.js`. Gallery artwork and motion remain inherited. The two superseded Macro/Micro homework links are removed; the current gallery has seven entries.
- The approved account disclosure is a scoped paper-backed exception to the transparent gallery destination dock. Login colors also remain scoped, rather than silently replacing the inherited gallery or homework tokens.

## Evidence inspected

- Visual comparison: approved desktop comp; `.impeccable/review/desktop.png` and `mobile.png`; restored account states in `retry-restored-desktop.png` and `retry-restored-user-320.png`.
- Current CSS/HTML/JS provide normative token values, responsive thresholds, form/disclosure states and inherited component behavior. The sidecar adds only metadata, motion, shadows, breakpoints and standalone component previews; primitive token authority remains the frontmatter.
- `ui-checks.json` reports passing desktop, mobile, 320 px and short-landscape login/registration/recovery/gallery/homework checks, plus cross-tab session revalidation, with no errors.
- `retry-checks.json` reports same-tab reconnect passing through keyboard on desktop and pointer in mobile, 320 px and short-landscape conditions.
- The first finish-review verdict reported the account reconnection gap. The implementation now includes that action and the supplied retry evidence passes. The focused reviewer subsequently returned **ship — P2 resolved**, resolving that sole reported issue.
- `detector-disposition.json` records placeholder contrast, neutral paper shadow and small-label fixes. It explicitly says the detector was not rerun; it is not presented as a fresh detector pass.

All screenshot and browser checks above are Chrome desktop plus viewport/touch emulation, not physical-device tests. This documentation pass inspected recorded browser evidence rather than rerunning the application.

## Product boundaries

Infrastructure consolidation keeps the original databases and original service URLs in place. It does not imply a data migration or account merge. Original account identifiers, passwords, learning progress, homework records and attachments are retained; legacy homework linking requires identity verification rather than name matching. This documents the approved boundary from `PRODUCT.md`, not a live infrastructure audit.

## Validation

The documentation validator checks YAML parsing, the allowed frontmatter groups and component properties, all token references, schema version, sidecar metadata keys, eight-step tonal ramps, canonical heading order, exact narrative parity, scoped snippet classes, absence of old nine-entry metadata, and the three-file write boundary. Validation passed for all listed checks. The documentation pass wrote only the three authorized documentation files; application source, parent authority, deployment and credentials were untouched.
