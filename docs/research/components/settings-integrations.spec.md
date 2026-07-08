# Settings Integrations Specification

## Overview

- Target file: `src/components/settings-page.tsx`
- Screenshot: `docs/design-references/votxt.co/settings-desktop.png`
- Interaction model: static connection card with click-driven Google Drive OAuth start.

## DOM Structure

- `Integrations` is a bordered white settings card with a muted header.
- Body contains a single Google Drive connection row.
- Row structure:
  - Left icon tile.
  - Text stack with `Google Drive` row title, status badge, and helper copy.
  - Right aligned action button.

## Computed Styles

### Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`

### Header

- backgroundColor: `rgba(241, 245, 249, 0.5)`
- padding: `24px`
- title tag: `h3`
- title font: `20px/28px`, `font-weight: 600`

### Google Drive Row

- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `12px`
- padding: `16px`
- display: `flex`
- gap: `16px`
- desktop measured height: about `102px`
- body wrapper measured height: about `150px`
- Target rechecked on 2026-07-02 at 1280x720: row is `578px` by `102px` at x `645`, y `3240`, with `gap: 16px`; the row title is an `h4`, `16px/24px`, semibold; the status badge is a `div`, `109.3px` by `22px`; helper copy is `383.36px` by `40px`.

### Connect Button

- backgroundColor: `rgb(100, 103, 242)`
- color: `rgb(255, 255, 255)`
- borderRadius: `6px`
- height: `36px`
- width: about `81px`
- fontSize: `14px`
- fontWeight: `500`
- padding: `0px 12px`
- Target rechecked on 2026-07-02: `Connect` is a `button`, not an anchor, at `80.64px` by `36px`; it starts Google Drive OAuth when clicked. Do not click during parity research unless account authorization is explicitly approved.

### Not Connected Badge

- backgroundColor: `rgb(241, 245, 249)`
- border: `1px solid transparent`
- color: `rgb(100, 116, 139)`
- height: `22px`
- padding: `2px 10px`
- fontSize: `12px`
- fontWeight: `600`
- lineHeight: `16px`

## States & Behaviors

### Disconnected

- Text content: `Google Drive`, `Not Connected`, `Import audio and video files directly from your Google Drive.`, `Connect`.
- `Connect` starts Google Drive OAuth. Do not click during parity research unless account authorization is explicitly approved.

### Connected

- Text content changes status to `Connected`.
- Connected account email is displayed under the helper copy.
- Action changes to `Disconnect`; disconnecting changes account state and should not be used during target research without approval.
- Local parity updated on 2026-07-01: card title now uses target `h3` semantics with unchanged `20px/28px` semibold styling.
- Target rechecked on 2026-07-01: `Connect` redirects to Google OAuth with `redirect_uri=https://api.votxt.co/auth/google-drive/callback`, `scope=https://www.googleapis.com/auth/drive.file`, `access_type=offline`, `include_granted_scopes=true`, `prompt=consent`, and `response_type=code`. Local parity updated the generated Google Drive redirect URI to `/auth/google-drive/callback` and rewrites that public path to the existing API callback handler.
- Local parity updated and verified at 1280x720 on 2026-07-02: Google Drive row title now uses target `h4` semantics, and disconnected `Connect` now renders as a button that imperatively starts the same local OAuth route instead of an anchor. Local remeasure: row `578px` by `102px`, `Connect` `79.77px` by `36px`, `h4` `16px/24px` semibold, preserving the OAuth URL contract.
- Target/local mobile parity updated and verified on 2026-07-02 at `390x844` from `/settings#usage`: `Integrations` renders at `x=16`, `y=1922`, `w=358`, `h=370`; header is `356px` by `122px` with a two-line description; body wrapper is `356px` by `246px`; disconnected Google Drive row is `308px` by `198px`; `Connect` is `80px` by `36px` at `x=58`, `y=2214`.

## Responsive Behavior

- Desktop: row is horizontal with text on the left and action on the right.
- Mobile: row stacks vertically before the `sm` breakpoint and keeps the target `198px` disconnected row height.
