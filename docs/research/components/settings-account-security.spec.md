# Settings Account Security Specification

## Overview

- Target file: `src/components/settings-page.tsx`
- Screenshot: `docs/design-references/votxt.co/settings-desktop.png`
- Interaction model: static form sections with click-driven save actions.

## DOM Structure

- Settings page uses the dashboard sidebar and a two-column settings layout.
- Page shell matches dashboard/upload: a fixed viewport-height flex root with a 300px desktop sidebar and independently scrolling settings main area.
- Left settings nav contains `Profile`, `Account Security`, `Usage`, `Preferences`, `API Keys`, `Notifications`, `Integrations`, and `Danger Zone`.
- `Account Security` is a bordered white card with a muted header and padded body.
- Body contains:
  - `Sign-in methods` block.
  - Inner bordered muted card for methods.
  - Method rows for `Email + Password` and `Google Sign-In`.
  - `Change Email Login Address` form.
  - `Set or Change Password` form.

## Computed Styles

### Page Shell

- Shell root at 1280x720: `display: flex`, `height: 720px`, `overflow: hidden`, `backgroundColor: rgb(255, 255, 255)`.
- Desktop sidebar: x `0`, y `0`, width `300px`, height `720px`, `flex-shrink: 0`, target class includes `md:w-[300px]`, `hidden md:flex`, `h-screen`, `sticky top-0`.
- Right main scroll area: x `300px`, y `0`, width `980px`, height `720px`, `flex: 1 1 0%`, `overflow-y: auto`, `padding: 32px`.
- Settings content wrapper: x `332px`, width `916px`, `display: flex`, `flex-direction: column`.
- Settings body layout: `display: flex`, `gap: 32px`; left settings nav and right card column sit side-by-side on desktop.

### Page Header and Settings Nav

- Header block: current target includes an icon-only `Back` button at x `332px`, y `40px`, `40px` by `40px`, transparent background, `6px` radius, and `aria-label="Back"`.
- Header text block: x `388px`, y `32px`, width about `357px` on target; local uses the same x/y and target typography while the wrapper remains fluid width.
- `Settings` title: `fontSize: 24px`, `fontWeight: 700`, `lineHeight: 32px`, color `rgb(2, 8, 23)`, margin `0`.
- Subtitle: `fontSize: 16px`, `fontWeight: 400`, `lineHeight: 24px`, color `rgb(100, 116, 139)`, y `64px`.
- Body layout starts at x `332px`, y `120px`, width `916px`, `display: flex`, `flex-direction: row`, `gap: 32px`.
- Left settings nav: width `256px`, x `332px`, y `120px`; no card frame or title block above it.
- Right settings content column: width `628px`, x `620px`, y `120px`; sections are separated by `32px`.
- Nav buttons: `256px` by `40px`, `padding: 8px 16px`, `fontSize: 14px`, `fontWeight: 500`, `lineHeight: 20px`, `gap: 8px`, `borderRadius: 6px`.
- Active `Profile` button: background `rgb(100, 103, 242)`, text `rgb(255, 255, 255)`.
- Inactive buttons: transparent background, text `rgb(2, 8, 23)`, `marginTop: 4px`; `Danger Zone` inactive text uses `rgb(239, 68, 68)`.

### Profile Card

- Card: x `620px`, y `120px`, width `628px`, target height about `437px`, white background, `1px solid rgb(226, 232, 240)`, `8px` radius, `overflow: hidden`, subtle shadow `rgba(0, 0, 0, 0.05) 0px 1px 2px`.
- Header: x `621px`, y `121px`, width `626px`, height about `102px`, `padding: 24px`, background `rgba(241, 245, 249, 0.5)`.
- Body: x `621px`, y `223px`, width `626px`, height about `333px`, `padding: 24px`, no top divider.
- Avatar row: starts at x `645px`, y `247px`; avatar is `80px` by `80px`, circular, with the QA account rendering the Google avatar image when `user.image` or OAuth `avatarUrl` is available and initials used only as a fallback.
- Form grid: two columns, each input `277px` wide by `40px` high; column x positions `645px` and `946px`.
- Labels: `14px`, weight `500`, line height `20px`, color `rgb(2, 8, 23)`.
- Inputs: `height: 40px`, `padding: 8px 12px`, `border: 1px solid rgb(226, 232, 240)`, `borderRadius: 6px`, `fontSize: 14px`, `fontWeight: 400`, `lineHeight: 20px`.
- Save button: `40px` tall, about `89px` wide on target, `padding: 8px 16px`, background `rgb(100, 103, 242)`, white text, `6px` radius, `14px/20`, weight `500`, aligned to the right.

### Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- boxShadow: `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

### Header

- backgroundColor: `rgba(241, 245, 249, 0.5)`
- padding: `24px`

### Method Container

- backgroundColor: `rgba(241, 245, 249, 0.2)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- padding: `16px`
- width: `578px`; starts at x `645px`, y `716px`; target height `266px`.
- Contains the `Sign-in methods` heading, helper copy, and a nested `flex flex-col gap-3` method-row stack.
- Heading row uses `14px/20px`, weight `500`, foreground `rgb(2, 8, 23)`, `8px` icon gap.

### Method Row

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `6px`
- padding: `12px`
- width: `544px`, height: `80px`, gap between rows: `12px`.
- Row title uses `16px/24px`, weight `400`, with a left icon.
- Status is a right-aligned badge: `22px` tall, `12px/16px`, weight `600`, `9999px` radius, `2px 10px` padding. `Password not set` is outline slate; `Linked` is filled `rgb(241, 245, 249)`.

### Dividers

- Horizontal separators between the methods block, email block, and password block are `1px` high, full content width `578px`, background `rgb(226, 232, 240)`, with `24px` vertical spacing from surrounding blocks.

### Password Notice

- `Email identity is linked, but password is not set yet.` renders inside an amber notice block.
- backgroundColor: `rgb(255, 251, 235)`
- border: `1px solid rgb(253, 230, 138)`
- borderRadius: `6px`
- padding: `12px`
- fontSize: `14px`, lineHeight: `20px`, color `rgb(120, 53, 15)`

### Inputs

- height: `40px`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `6px`
- fontSize: `14px`
- padding: `8px 12px`

### Buttons

- height: `40px`
- backgroundColor: `rgb(100, 103, 242)`
- borderRadius: `6px`
- color: `rgb(255, 255, 255)`
- fontSize: `14px`
- fontWeight: `500`
- Target Account Security buttons are text-only: `Update Email` measures about `120px` wide and `Set Password` about `123px`; no leading icons.
- Target rechecked on 2026-07-02: `Change Email Login Address` and `Set or Change Password` render as inner `h3.font-medium` headings inside their icon rows, not plain spans.
- Target rechecked on 2026-07-02: password field labels are standalone inline labels with `14px` font size, `500` weight, `14px` line-height, followed by inputs with `8px` top margin; the label elements do not wrap the password inputs.

## States & Behaviors

- `Update Email` remains enabled-looking with an empty email field. Empty submission is ignored by local validation.
- `Set Password` remains enabled-looking with empty password fields. Empty submission is ignored by local validation; mismatched password fields show a notice.
- Account mutation actions are out of visual parity QA scope unless explicitly approved, because they change account state.

## Text Content

- `Account Security`
- `Manage your sign-in methods, email, and password security.`
- `Sign-in methods`
- `Google email is managed by Google. Email login address is managed here.`
- `Email + Password`
- `Password not set`
- `Google Sign-In`
- `Linked`
- `Change Email Login Address`
- `Current email login address: gxx961208@gmail.com`
- `Update Email`
- `Set or Change Password`
- `Set a password to complete email login setup.`
- `Email identity is linked, but password is not set yet.`
- `New Password`
- `Confirm Password`
- `Set Password`

## Responsive Behavior

- Desktop: settings nav and content are side by side; account security card is in the right column.
- Mobile: settings nav stacks above content and the same card content remains in one column.
- Target mobile hash entry rechecked on 2026-07-02 at `390x844`: direct `/settings#security` keeps the continuous settings card stack but scrolls the internal settings pane so the `Account Security` card title lands near the viewport top at `x=41`, `y=25`; the preceding `Settings` header is above the viewport (`y≈-717`) and `Profile` is above it (`y≈-580`).
- Local parity updated on 2026-06-30: top settings header was moved out of the left nav column, the Back link was removed, and desktop nav/header geometry now matches the target metrics above.
- Local parity updated on 2026-06-30: Profile card inputs/buttons now use target shadcn-style metrics instead of local `field`/`btn-primary` weight and border treatment; Profile body top divider was removed to match target.
- Local parity updated on 2026-06-30: Profile display name now uses target `18px/28px` medium weight instead of the previous extra-bold local weight.
- Local parity updated on 2026-06-30: Account Security now uses the target muted method container, right-aligned status badges, target-style 40px buttons, slate dividers, and amber password setup notice.
- Local parity updated on 2026-07-01: `/api/auth/me` must return a JSON-safe user payload. A raw subscription `BigInt` makes the settings page treat the user as logged out, collapsing the target `Email + Password` and `Google Sign-In` rows into the wrong `No sign-in methods detected` empty state.
- Local parity updated on 2026-07-01: Account Security method rows now use the target fixed `80px` height instead of content-derived `78px`, matching the measured sign-in method row geometry.
- Local parity updated on 2026-07-01: Account Security method heading now uses target `14px/20px` medium text, and `Update Email` / `Set Password` are text-only buttons. Local remeasure: `Update Email` `119.4px`, email input `446.6px`, `Set Password` `121.5px`.
- Local parity updated on 2026-07-02: Account Security email/password block headings now use target `h3.font-medium` semantics, and the password labels were split from their inputs to match the target standalone-label DOM and 8px input offset.
- Local parity updated on 2026-07-02: Settings now receives the current user from the server page entry and keeps that initial user if the client `/api/auth/me` refresh is unavailable, preventing the logged-in Account Security card from falling back to the target's transient no-method/guest branch after a hard reload.
- Local parity updated and verified on 2026-07-02: normal settings hash entry now scrolls the matching card into the internal settings scroller, not just the special `#usage-addon` anchor. Local `/en/settings#security` at `390x844` now places `Account Security` at `x=41`, `y=25`, matching target, while `Settings` and `Profile` sit above the viewport.
- Target rechecked on 2026-07-01 while logged in as `gxx961208@gmail.com`: the live target still shows `Email + Password` with `Password not set`, shows `Google Sign-In` with `Linked`, renders `Set a password to complete email login setup.`, and includes the amber `Email identity is linked, but password is not set yet.` notice. Local parity follows that visible target state for Google-linked accounts even though the QA account can authenticate locally with email/password.
- Local business-flow parity updated on 2026-07-02: the settings header Back control now preserves in-app history only when the referrer is same-origin; direct entry, refresh entry, or external-origin entry falls back to `/<locale>/dashboard` so the logged-in workflow returns to the workspace instead of leaving the app or doing nothing.
- Local business-flow parity updated on 2026-07-02: changing the email login address through `/api/account/profile` now clears `emailVerifiedAt`, creates a fresh email verification token for the new address, sends through the existing verification email adapter, and returns a development `verificationUrl` when email delivery is not configured. The Settings notice can render that `Open verification link` for local completion of the email-change flow.
- Local API rechecked on 2026-07-02 with a temporary local user: `PATCH /api/account/profile` from `settings-flow-20260702-a@local.test` to `settings-flow-20260702-b@local.test` returned `emailVerifiedAt: null` and `emailVerification.verificationUrl: http://127.0.0.1:3005/en/auth/verify-email?token=...`.
