# Settings Usage, API Keys, and Danger Specification

## Overview

- Target file: `src/components/settings-page.tsx`
- Screenshot: `docs/design-references/votxt.co/settings-desktop.png`
- Interaction model: static settings cards with click-driven billing, API docs/pricing navigation, and account delete confirmation.

## DOM Structure

- These sections appear in the right settings content column, below `Account Security` and `Preferences`.
- Each section is a white bordered card with:
  - Header: title row, optional badge, helper description.
  - Body: padded white content area.
- `Usage` body contains an inner bordered usage summary card.
- `API Key Management` header includes an orange `Beta` badge. Free accounts show a centered upgrade empty state.
- `Danger Zone` uses danger coloring for the header title and divider, with a single delete row in the body.

## Computed Styles

### Settings Content Column

- x: `620px` at the captured desktop viewport
- width: `628px`
- section gap: `32px`

### Section Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- boxShadow: `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

### Default Header

- backgroundColor: `rgba(241, 245, 249, 0.5)`
- padding: `24px`
- title fontSize: `20px`
- title fontWeight: `600`
- title lineHeight: `28px`

### Usage Inner Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- padding: `16px`
- target height: about `136px`
- target width: about `578px`
- plan title: `Free`
- target rechecked on 2026-07-02: the usage inner-card plan title is an `h4`, not an `h3`; it is `14px/20px`, medium weight.
- plan badge: `Free`
- target rechecked on 2026-07-02: the usage plan badge is `50px` by `16px`, `10px` font, `10px` line-height, `2px 6px` padding, `6px` radius.
- usage row fontSize: `12px`
- usage row lineHeight: `16px`
- usage row color: `rgb(100, 116, 139)`
- progress height: `8px`
- progress backgroundColor: `rgb(241, 245, 249)`

### Upgrade Now Button

- height: `28px`
- backgroundColor: transparent
- color: `rgb(100, 103, 242)`
- borderRadius: `6px`
- fontSize: `12px`
- fontWeight: `500`
- padding: `0px 8px`
- target rechecked on 2026-07-02: free-account button includes a right-arrow icon after the text (`lucide-arrow-right`, `ml-1 h-3 w-3`) and measures about `122.88px` by `28px` at 1280x720.

### API Beta Badge

- backgroundColor: `rgb(255, 237, 213)`
- border: `1px solid rgb(254, 215, 170)`
- color: `rgb(194, 65, 12)`
- fontSize: `12px`
- fontWeight: `600`
- borderRadius: full pill

### API Documentation Link

- text: `View API Documentation`
- location: inside the muted API card header, below the description, not in the white body
- header height with docs link: about `132px`
- wrapper marginTop: `6px` on the target (`mt-2` class resolved with header spacing)
- Target rechecked on 2026-07-02: the control is a `button`, not an anchor. It navigates to `/docs` when activated.
- fontSize: `14px`
- lineHeight: `20px`
- color: `rgb(16, 24, 32)`
- textDecoration: underline

### API Free Empty State

- display: `flex`
- minHeight: about `244px`
- alignItems: `center`
- justifyContent: `center`
- textAlign: `center`
- title fontSize: `18px`
- title fontWeight: `500`
- helper fontSize: `16px`
- helper color: `rgb(100, 116, 139)`
- `Upgrade Plan` button height: `40px`
- button backgroundColor: `rgb(100, 103, 242)`
- button borderRadius: `6px`

### Danger Header

- backgroundColor: transparent
- borderBottom: `1px solid rgba(239, 68, 68, 0.1)`
- padding: `24px`
- measured height: about `103px`
- title color: `rgb(239, 68, 68)`
- title fontSize: `20px`
- title fontWeight: `600`
- title lineHeight: `28px`

### Danger Card

- target border: `1px solid rgba(239, 68, 68, 0.2)`
- backgroundColor: transparent
- borderRadius: `8px`
- target height: about `201px`

### Danger Body

- backgroundColor: transparent
- height: about `96px`
- padding: `24px`
- row display: `flex`
- row alignItems: `center`
- row justifyContent: `space-between`

### Delete Account Button

- height: `40px`
- backgroundColor: `rgb(239, 68, 68)`
- color: `rgb(248, 250, 252)`
- borderRadius: `6px`
- fontSize: `14px`
- fontWeight: `500`
- padding: `8px 16px`

### Delete Account Confirmation Dialog

- dialog: `448px` by `506px`, positioned at `x=416`, `y=107` in a 1280x720 viewport
- shell: white background, foreground `rgb(2, 8, 23)`, `1px solid rgb(226, 232, 240)` border, `8px` radius, no visible shadow, `24px` padding, `16px` grid gap
- close control: `16px` by `16px`, positioned at `x=831`, `y=124`, `display: block`, 4px radius, opacity `0.7`, visible/screen-reader text `Close`
- title row: red warning icon `20px` by `20px`, 8px gap, title `Delete Account`, `20px`/`28px`, `fontWeight: 700`, `rgb(239, 68, 68)`, `letter-spacing: -0.5px`
- intro copy: `Are you sure you want to delete your account? This action cannot be undone.`, `16px`/`24px`, `fontWeight: 500`
- consequence label: `When you delete your account:`, `14px`/`20px`, `fontWeight: 500`, muted slate
- consequence list: five `398px` by `20px` rows at y `280`, `310`, `340`, `370`, and `400`; text is `14px`/`20px`, normal weight, muted slate
- confirmation label: `To confirm, type DELETE below:`, `14px`/`20px`, `fontWeight: 500`, muted slate
- confirmation input: `398px` by `40px`, positioned at `x=441`, `y=484`, placeholder `Type DELETE here`, `padding: 8px 12px`, focused by default with violet border and 3px low-opacity violet ring
- footer: `398px` by `40px`, positioned at `x=441`, `y=548`, right-aligned with 8px visual gap plus target `sm:space-x-2`
- footer buttons: `Cancel` about `80px` by `40px`, `Delete` about `75px` by `40px`; both `14px`/`20px`, `fontWeight: 500`; `Delete` is red and disabled at `opacity: 0.5` until confirmation text is exactly `DELETE`

## States & Behaviors

### Usage

- Free account text content: `Free`, `Free`, `Used: 42`, `Total: 120`, `Resets on ...`, `Upgrade Now`.
- Target rechecked on 2026-07-02: free-account `Upgrade Now` is a `button`, not an anchor. Activating it keeps the URL at `/settings#usage` and opens the in-place `Plans & Pricing` overlay (`1152px` by `720px` at 1280x720) with Annual pricing selected. Do not start paid checkout during target QA.
- Local parity updated and verified on 2026-07-02: free-account `Upgrade Now` now uses the same right-arrow button treatment and opens the shared dashboard `Plans & Pricing` overlay in Annual mode. Paid accounts still use the billing portal path for `Manage Billing`.
- Target/local parity rechecked on 2026-07-02: reset dates must be future dates. The local usage API now rolls expired local/free subscription periods forward by month before returning `currentPeriodEnd`, so settings no longer displays an already-past `Resets on Jul 1, 2026...` value on 2026-07-02.
- Local parity updated and verified on 2026-07-02: Settings client fallback rendering now applies the same forward-month rollover to the server-provided initial subscription reset date before `/api/account/usage` completes. A fresh `/en/settings#usage` reload immediately rendered `Resets on Jul 30, 2026, 01:47 PM` and did not flash the stale `Jul 1, 2026` date.
- Target bundle rechecked on 2026-07-02: paid/LTD sidebar upgrade routing can send users to `/settings#usage-addon`, while free users keep the upgrade dialog path. Add-on plan IDs are `addon_basic`, `addon_standard`, and `addon_pro` with 500/$10, 1000/$15, and 3000/$20 minute packs.
- Local parity updated on 2026-07-02: paid accounts now expose a `Buy more transcription minutes` add-on area under Usage at `#usage-addon`, with Basic/Standard/Pro add-on cards. Add-on checkout uses Stripe `payment` mode through `STRIPE_PRICE_ADDON_BASIC`, `STRIPE_PRICE_ADDON_STANDARD`, and `STRIPE_PRICE_ADDON_PRO`, then credits the active non-free subscription through an idempotent `UsageLedger` adjustment.
- Local billing return-flow parity updated on 2026-07-02: add-on checkout and paid-account `Manage Billing` portal return URLs now use the active request origin, so settings flows launched from `http://127.0.0.1:3005` return to that local origin instead of the configured `NEXT_PUBLIC_APP_URL`. No real Stripe portal or payment completion was exercised during QA.
- Local parity updated and verified on 2026-07-02: the Usage inner-card plan title now renders as an `h4` with target `14px/20px` medium typography, and the plan badge uses the target compact `50px` by `16px` treatment. Local remeasure at 1280x720: section `628px` by `288px`, inner card `578px` by `136px`, title `29px` by `20px`, badge `50px` by `16px`.
- Target/local mobile parity updated and verified on 2026-07-02 at `390x844`: direct `/settings#usage` / `/en/settings#usage` renders the Usage card at `x=16`, `y=0`, `w=358`, `h=312`. The header description wraps to two lines (`263-265px` first line, `44-45px` second line), the usage summary card remains `308px` by `140px`, and `Upgrade Now` sits at `x≈209`, `y=240`, `122.8px` by `28px`.

### API Keys

- Free account text content: `API access requires an active subscription or LTD plan`, `Upgrade your plan to access API management features`, `Upgrade Plan`.
- `View API Documentation` navigates to `/docs`.
- Target rechecked on 2026-07-02: the API section DOM id and clicked nav hash are `api`, not `api-keys`; clicking the `API Keys` settings nav updates the URL to `/settings#api` and scrolls the API card to the viewport top.
- Paid/LTD accounts can create, copy, rename, rotate, and revoke API keys; those mutation paths are not exercised during target parity QA without explicit approval.
- Local parity updated on 2026-07-01: paid/LTD API key rename no longer uses a browser-native prompt. It opens an in-app `448px` rename dialog with black/40 overlay, `Rename API Key` title, `Key Name` input, `Cancel`, and violet `Save`; the save action is disabled for an empty or unchanged name.
- Local parity updated on 2026-07-01: paid/LTD API key reset and revoke no longer use browser-native confirms. Both open in-app `448px` by `216px` confirmation dialogs with black/40 overlay, `Cancel`, and red `Reset` / `Revoke`; the mutation request is gated behind the red dialog action.
- Local business-flow parity updated on 2026-07-02: API key revoke now matches rename/reset ownership semantics. If the requested key does not belong to the user's personal team, or no key is found, the route returns `404 API Key 不存在。` instead of reporting success after a zero-row update.
- Target rechecked on 2026-07-02: free-account `API Key Management` keeps `View API Documentation` inside the header under the description with a resolved `6px` top offset; local header spacing was adjusted to `mt-1.5` to match the measured target rhythm.
- Target rechecked on 2026-07-02: free-account `API Key Management` empty state starts with a yellow `TriangleAlert` icon (`48px` square, `16px` bottom margin), then `API access requires an active subscription or LTD plan`, helper copy, and a `button` `Upgrade Plan` at about `122px` by `40px`. The button is wrapped by a `space-y-2` block and opens the in-place `Plans & Pricing` overlay (`1152px` by `720px` at 1280x720) with Annual pricing selected; it does not navigate to `/pricing`.
- Local parity updated on 2026-07-02: Settings API Keys free empty state now includes the target yellow warning icon, renders `Upgrade Plan` as a button instead of an anchor, and reuses the dashboard `Plans & Pricing` overlay in Annual mode from the settings page.
- Local parity updated and verified at 1280x720 on 2026-07-02: `View API Documentation` now renders as a target-style `button type="button"` that imperatively navigates to `/docs`, instead of a direct anchor. Local remeasure keeps the header parent `6px` top margin, 20px control height, `14px/20px` text, and underline treatment.
- Local parity updated and verified on 2026-07-02: the Settings API nav now targets `#api`, the rendered section uses `id="api"` with no `id="api-keys"` fallback, direct `/en/settings#api` entry marks `API Keys` active, and the API/free-empty-state and Danger row foreground text uses the target `rgb(2,8,23)` color.

### Danger Zone

- `Delete Account` opens an in-app account deletion confirmation dialog.
- The final `Delete` action remains disabled until the user types `DELETE` exactly into the confirmation input.
- Do not click the enabled final `Delete` button during target QA.
- Local parity updated on 2026-07-01: delete dialog foreground color, close-control rendering, and default confirmation-input focus ring now match the target `rgb(2,8,23)` shell and `16px` block close button while keeping the destructive action gated.
- Local parity updated and verified on 2026-07-02: delete dialog title now matches the target `h2` treatment with red `20px/28px` bold text and `-0.5px` letter spacing; the final red `Delete` action remains disabled until the confirmation input is exactly `DELETE`.
- Local business-flow parity updated on 2026-07-02: `/api/account/deactivate` now implements the target dialog promise that account deletion permanently deletes account data. The endpoint deletes the user's media tasks (including tasks in their personal/owned team workspace), user-created share links, audit rows tied to the user or owned teams, team memberships, API keys created by the user, webhook endpoints created by the user, owned teams and their cascaded API/webhook data, then deletes the user and clears the session. Related stored media object keys from tasks and media assets are collected before the transaction and deleted from object storage on a best-effort basis after the database deletion. Read-only QA against `gxx961208@gmail.com` on 2026-07-02 confirmed the flow covers the account's `3` tasks, `4` media assets, `1` owned team, and `1` team membership. QA must not trigger the final destructive action without explicit approval.

## Text Content

- `Usage`
- `View your account usage and remaining credits`
- `Free`
- `Used: 42`
- `Total: 120`
- `Resets on Jul 25, 2026, 02:29 AM`
- `Upgrade Now`
- `Buy more transcription minutes`
- `Add-on minutes are credited to your active plan after checkout.`
- `Basic`
- `500 extra minutes`
- `Standard`
- `1000 extra minutes`
- `Pro`
- `3000 extra minutes`
- `Buy now`
- `API Key Management`
- `Beta`
- `Manage your API keys for accessing the Votxt API`
- `View API Documentation`
- `API access requires an active subscription or LTD plan`
- `Upgrade your plan to access API management features`
- `Upgrade Plan`
- `Danger Zone`
- `Actions that cannot be undone`
- `Delete Account`
- `Permanently delete your account and all data`

## Responsive Behavior

- Desktop: settings sidebar and content column are side by side; each section spans the right content column.
- Mobile: settings navigation stacks above content; Usage/API/Danger bodies keep the same internal card layout, with the Danger row stacking before the `sm` breakpoint.
- Target/local mobile rechecked on 2026-07-02 at `390x844` from the `#usage` anchor: `#usage`, `#api`, and `#danger` sections align at `y=0/804/2324` with heights `312/498/257`; the API docs link y-position aligns (`target y=910.5`, local y=912`) and the free-plan `Upgrade Plan` button aligns at `y=1205`.
