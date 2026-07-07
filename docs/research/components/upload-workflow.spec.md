# Upload Workflow Specification

## Overview

- Target file: `src/components/workspace/Workspace.tsx`
- Target URL: `https://www.uniscribe.co/upload`
- Local URL: `http://localhost:3000/en/upload`
- Interaction model: static upload entry page with click-driven dialogs for media links and Google Drive.

## Default Upload Page

### Structure

- Uses the logged-in dashboard sidebar, not the marketing header.
- Page shell matches dashboard/settings: a fixed viewport-height flex root with a 300px desktop sidebar and independently scrolling right main content.
- Main content is centered in a `max-w-4xl` column.
- Top row contains breadcrumb `Dashboard / Upload Files` and an icon-only `Recent Files` action at the right.
- Main upload area is a large dashed dropzone.
- Inside the dropzone, controls are constrained to a `max-w-sm` 384px column.
- Desktop actions:
  - `Select files from your device`
  - `Paste Link`
  - `Google Drive`
- Desktop `Supported Formats & Limits` card sits below the dropzone.

### Target Metrics

- Shell root at 1280x720: `display: flex`, `height: 720px`, `overflow: hidden`, `backgroundColor: rgb(255, 255, 255)`.
- Desktop sidebar: x `0`, y `0`, width `300px`, height `720px`, `flex-shrink: 0`, target class includes `md:w-[300px]`, `hidden md:flex`, `h-screen`, `sticky top-0`.
- Right main scroll area: x `300px`, y `0`, width `980px`, height `720px`, `flex: 1 1 0%`, `overflow-y: auto`, `padding: 32px`.
- First upload content child: x `332px`, width `916px`, class `w-full px-4 md:px-0 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`.
- Main column width: about `896px`.
- Breadcrumb y: about `50px` in a 1280px browser viewport when inspected on target.
- Target breadcrumb rechecked on 2026-07-02 at 1280x720: wrapper `x=342`, `y=44`, height `32px`, flex gap `12px`; `Dashboard` is a button at `x=342`, `y=50`, `93px` by `20px`, violet text, `14px/20px`, normal button weight with a 16px home icon and medium text span; separator `/` follows; `Upload Files` text starts `x=456`, `y=50`, `14px/20px`, color `rgba(2,8,23,0.8)`, normal weight.
- `Recent Files`: `32px` by `32px`, purple background `rgb(100, 103, 242)`, white icon, pill radius, subtle `0 1px 2px rgba(0,0,0,.05)` shadow, `aria-label="Recent Files"`, and no `title` attribute.
- Target rechecked on 2026-07-01: clicking `Recent Files` on `/upload` leaves the user on `/upload`, does not open a dialog/menu/popover, and the button remains focused with `aria-expanded="false"`. Local parity updated the button to no longer navigate back to dashboard.
- Target rechecked on 2026-07-02: `Recent Files` exposes `aria-label="Recent Files"` but no `title` attribute. Local parity removed the extra local `title` while preserving the target 32px geometry and subtle shadow.
- Target rechecked on 2026-07-02: the upload sidebar `Upgrade Plan` button keeps the user on `/upload` and opens the same compact `Upgrade Your Plan` dialog used by the dashboard sidebar. It does not navigate to `/pricing`. The dialog shows `Upgrade to Basic Plan Now`, yearly/monthly Basic choices, `Upgrade Now`, `See All Plans`, and footer trust copy `CANCEL ANYTIME` / `INSTANT ACCESS`.
- Dropzone: `896px` by about `454px`, `2px dashed rgba(100, 103, 242, 0.4)`, `16px` radius, `24px` padding.
- Inner action column: `384px` wide.
- Action buttons: `384px` by `64px`, transparent background, no border, `12px` padding, `12px` radius, 16px text.
- Supported card: `896px` by about `208px`, white, no border, `8px` radius, subtle shadow, `24px` padding.
- Supported card content: heading `Supported Formats & Limits`, two-column audio/video grid with 24px gap, then bottom limit row.

### Local Parity Check

- Verified on 2026-06-30 after implementation:
  - Upload shell uses the target fixed viewport model: `flex h-screen overflow-hidden`, 300px sidebar wrapper, and right main `overflow-y-auto p-4 md:p-8`.
  - Desktop content wrapper matches target: first child x `332`, width `916`; max column x `342`, width `896`.
  - Breadcrumb/header row matches target rhythm: wrapper y `32`, breadcrumb y about `50`, `Recent Files` y `44`.
  - `Recent Files`: `32px` by `32px`, purple background, white icon.
  - Dropzone: `896px` by `454px`, x `342`, y `112`, `2px dashed rgba(100, 103, 242, 0.4)`, `16px` radius, `24px` padding.
  - Inner upload column: `384px` by `402px`, x `598`, y `138`.
  - Drag card: `384px` by `130px`, slate 100/50 background, 48px circular violet upload icon holder, 14px medium label.
  - Divider row: `384px` by `16px`, lowercase `or` with left/right 1px rules.
  - Action buttons: `384px` by `64px`, transparent background, no border, `12px` radius, 14px medium text, 40px icon holder, 16px trailing chevron.
  - Supported card: `896px` wide, white, no visible border, `8px` radius, target text content.
- Main upload surface uses a dashed violet dropzone with target-style centered action column.
- Local parity updated on 2026-07-02: upload breadcrumb typography/color now matches the target `Dashboard / Upload Files` row, including the violet Dashboard control with home icon and normal-weight current segment.
- Target/local mobile upload rechecked on 2026-07-02 at `390x844`: the earlier target session rendered lowercase `or`, but the current target session renders uppercase `OR` in the divider. Local parity was updated back to the current target text while preserving the 16px row height, line rules, and centered action column.
- Local parity updated and verified at 1280x720 on 2026-07-02: upload breadcrumb now uses target semantics and structure (`nav aria-label="Breadcrumb"` plus a `Dashboard` button instead of a link), removes the extra screen-reader-only duplicate `h1 Upload Files`, and keeps the target vertical geometry (`nav` y `50`, Recent Files y `44`).
- Local parity rechecked on 2026-07-02 at 1280x720 on `http://127.0.0.1:3001/en/upload`: breadcrumb wrapper starts at `x=342`, `y=50`, uses target `12px` flex gap, `Dashboard` is `92px` by `20px`, current `Upload Files` starts at `x=462`, and `Recent Files` remains `32px` by `32px` at `x=1206`, `y=44` with `aria-label="Recent Files"` and no `title`.
- Local parity updated and verified on 2026-07-02: logged-in `/en/upload` sidebar `Upgrade Plan` now opens the compact `Upgrade Your Plan` dialog in place while preserving `/en/upload`, instead of falling back to `/pricing`. The dialog `See All Plans` action closes the compact prompt and opens the full `Plans & Pricing` overlay with `Annual Save 40%` selected, matching the target upload flow.

## Paste Link Dialog

### Target Structure

- Opens after clicking upload page `Paste Link`.
- Dialog has `role="dialog"` and title `Media Link Transcription`.
- Dialog copy: `Paste a media link to transcribe video or audio content.`
- Supported platform chips:
  - `YouTube`
  - `TikTok`
  - `Instagram`
  - `Facebook`
  - `X`
  - `Many other links`
- Input placeholder: `Paste a media link`.
- Adjacent action button: `Search`.
- Footer shows `Available minutes:N` and `Buy More Minutes`.
- `Buy More Minutes` opens the shared full-screen `Plans & Pricing` overlay with `Annual` selected by default, target `/pricing` tablist/card geometry, and a plain target-style FAQ list with all questions collapsed.
- Close is an icon button at the top right.
- Resolved state after `Search` with a YouTube link:
  - The input/search row is replaced by a source URL row and a `Change link` button.
  - Shows a horizontal media preview: `180px` 16:9 thumbnail with duration chip, title, provider `YouTube`, and source URL.
  - Shows target-style settings rows:
    - `Audio Language` selector, `180px` by `36px`, default `English`.
    - `Generate Subtitle` switch, `44px` by `24px`, off by default.
    - `Speaker identification` switch, `44px` by `24px`, off by default.
    - `AI Summary` selector, `180px` by `36px`, default `Off`.
  - Does not show Summary language or Premium transcription model controls in this dialog.
  - Primary CTA is `Transcribe`, followed by `Click here to download video`, then available minutes and `Buy More Minutes`.
  - Collapsed selectors expose only the selected value in dialog text. The target does not use native `<select>` controls here, so hidden option labels are not present in the collapsed dialog text.
  - `Audio Language` is a button-like trigger. Expanded state opens an in-dialog absolute menu at the trigger edge: `180px` wide, `280px` max height, white background, `1px solid rgb(226,232,240)`, `6px` radius, shadow, `Popular languages` 12px uppercase header, and 40px language rows.
  - `AI Summary` is a `role="combobox"` trigger. Expanded state opens a Radix-style `role="listbox"` above the trigger: `300px` wide, about `270px` tall, white background, `1px solid rgb(226,232,240)`, `16px` radius, option rows `36px` tall, selected `Off` with `rgba(100,103,242,.1)` background, and paid templates carrying a small `PRO` badge.

### Target Metrics

- Dialog: `640px` wide, about `376px` tall, `8px` radius, white background, `1px solid rgb(226, 232, 240)`.
- Target default dialog rechecked on 2026-07-02 at 1280x720:
  - Overlay: `rgba(0, 0, 0, 0.4)`.
  - Dialog: `640px` by `376px`, x `320`, y `172`, `8px` radius, white background, `1px solid rgb(226, 232, 240)`.
  - Header wrapper: `638px` by `94px`, x `321`, y `173`, padding `24px 24px 16px`.
  - Title: x `345`, y `197`, `20px/28px`, semibold.
  - Helper: x `345`, y `231`, `14px/20px`.
  - Supported platforms card: `590px` by `122px`, x `345`, y `283`, padding `10px 12px`, `12px` radius, `rgba(241, 245, 249, 0.25)` background, `1px solid rgba(226, 232, 240, 0.6)`.
  - Supported platforms label: `12px/16px`, normal weight, `rgba(100, 116, 139, 0.9)`.
  - Chips: `30px` tall, `12px/16px`, medium weight, `1px solid rgba(100, 103, 242, 0.2)`, white 90% background.
  - Input row: x `345`, y `421`, width `590px`, gap `12px`.
  - Input: `480.99px` by `40px`, white background, `1px solid rgb(99, 102, 241)` while focused.
  - Search button: about `97px` by `40px`, aria-label `Check link`, visible text `Search`.
  - Footer row: x `345`, y `477`, width `590px`; `Available minutes: 78` and `Buy More Minutes` are centered as one inline group, not split left/right.
- Target default dialog rechecked on 2026-07-02 at `390x844` after stable animation:
  - Upload page `Paste Link` button remains `274px` by `64px` at `x=58`, `y=376`.
  - Dialog uses the same fixed center/translate model but mobile width is `390px`, `max-width: 512px`, `border-radius: 0`, slate-200 `1px` border, white background, `display: grid`, and `16px` row gap.
  - Stable measured dialog was about `390px` by `479-484px`, centered at `x=0`, `y≈180-182.5`; minor height variance came from the target footer/minutes group loading state.
  - Title/helper remain `x=25`, title `20px/28px` semibold, helper `14px/20px`.
  - Mobile supported-platforms area is no longer a visible card: the wrapper keeps `10px 12px` inner padding but has transparent background, no border, and no radius. Chips remain `30px` tall with the desktop chip styling and wrap in three rows.
  - Mobile input is `340px` wide, `38px` tall, `16px` text, white background, `6px` radius, and focused violet border `rgb(99,102,241)`.
  - Mobile `Search` is stacked below the input at `340px` by `40px`, white background, violet border/text.
  - Close contributes text `Close` to the accessible/body text in the target mobile dialog, while the visual close affordance remains icon-sized.
- Target invalid URL state rechecked on 2026-07-02 after submitting `https://example.invalid/video`:
  - Resolve request fails and leaves the dialog in input state.
  - Dialog: `640px` by `412px`, x `320`, y `154`.
  - Input/search row moves to y `403`.
  - Input border becomes `1px solid rgba(100, 103, 242, 0.6)`.
  - Error: role `alert`, text `Failed to access media metadata. Please try again later.`, x `345`, y `459`, width `590px`, height `20px`, `14px/20px`, medium weight, `rgb(239, 68, 68)`, no background or border.
- Resolved dialog at 1280x720: `640px` wide, about `827.5px` tall, x `320`, y `-53.75` because the fixed 50%/translate centered dialog is taller than the viewport.
- Resolved title: y `-28.75`, `20px/28px`, semibold. Close button: `16px` square, x `927`, y `-36.75`.
- Resolved source URL row: y `70.25`, `12px/16px` muted text; `Change link` y `96.25`, `95px` by `32px`, purple text.
- Resolved preview image: x `361`, y `173.25`, `180px` by `101.25px`, 8px radius. Title text starts x `557`, y `175.25`, `16px/22px`, semibold.
- Resolved settings: `Audio Language` label y `327.75`, helper y `351.75`, `English` trigger x `755`, y `327.75`, `180px` by `36px`; switches at x `891`, y `422.75` and `478.75`; `AI Summary` trigger x `755`, y `534.75`.
- Resolved CTA: `Transcribe` x `345`, y `602.75`, `590px` by `44px`; download link y `666.75`; `Buy More Minutes` y `727.75`.
- Input: `40px` tall, white background, `1px solid rgb(99, 102, 241)`, `6px` radius.
- Search button: `40px` tall, white background, `1px solid rgba(100, 103, 242, 0.6)`, purple text.
- Chips: 30px tall, `1px solid rgba(100, 103, 242, 0.2)`, white 90% background, 12px text.
- Buy More Minutes: purple text, 14px, medium weight, bottom border.
- Close: top-right `16px` icon button.
- Target `Buy More Minutes` behavior measured against the upload/link workflow: it opens the shared `Plans & Pricing` overlay with the `Annual Save 40%` tab selected by default, unlike the dashboard promotion card `See All Plans` overlay which defaults to `Monthly`.

### Local Parity Check

- Verified on 2026-06-30 after implementation:
  - Dialog width: `640px`; default-state measured height is within 4px of target (`372px` local vs `376px` target) with no shadow and visible overflow.
  - Title and helper copy match target typography: title `20px/28px` semibold; helper copy `14px/20px`, 6px top margin, slate text.
  - Supported platforms card matches target: `590px` wide, `122px` tall, `12px` radius, slate 100/25 background, slate-200/60 border, `10px 12px` padding.
  - Platform chips include target-style icons and wrap after `X`; chips are 30px tall, white 90% background, violet 20% border, 12px medium text.
  - Input accessible name is exactly `Link input`; input is white, purple border, 40px tall, 6px radius, `8px 12px` padding.
  - Search: white, purple border, purple text, 40px tall, about 96px wide, text-only in the default disabled state.
  - Buy More Minutes: purple text with bottom border.
  - Close: top-right icon-only button.
- Updated on 2026-07-01:
  - Upload and dashboard `Media Link Transcription` dialog `Buy More Minutes` actions pass `initialMode="annual"` into the shared pricing overlay, preserving the target Annual default for this workflow while leaving the dashboard promotion card default on Monthly.
  - Upload and dashboard resolved link dialogs now hide the input/search row after resolution, render the target horizontal preview and compact target controls, default link settings to English / subtitle off / speaker off / AI Summary Off, and add the target `Click here to download video` link for YouTube media.
  - Resolved link dialog selectors now use target-like button/combobox controls instead of native selects, so collapsed dialog text shows only `English` and `Off`. Audio language expands to the target `Popular languages` menu; AI Summary expands to the target-style 300px listbox with selected and `PRO` states.
  - Resolved link dialogs now use the target fixed 50%/translate modal positioning instead of grid `place-items-center`, so the 1280x720 resolved state naturally overflows upward like the target. Local verified after update: dialog `640x818` at `x=320`, `y=-49`, `Transcribe` y `602`, download y `666.5`, and `Buy More Minutes` y `723`.
- Updated on 2026-07-02:
  - Upload and dashboard link dialogs use the target black/40 overlay, `p-6 pb-4` header, target platform label typography, centered footer minutes group, and plain red error alert.
  - Local default dialog verified after restart at 1280x720: dialog `640x376` at `x=320`, `y=172`; overlay `rgba(0,0,0,0.4)`; header `638x94`; platform card `590x122` at `x=345`, `y=283`; input row `x=345`, `y=421`; footer is centered.
  - Local default dialog rechecked after the 2026-07-02 spacing pass: the default upload and dashboard link dialogs use the target `grid` shell with 16px row gap, `px-6 pb-6` body wrapper, platform chips at y `326` and `364`, input/search row at y `421`, divider footer at y `477`, and centered minutes / `Buy More Minutes` row at y `502`.
  - Local `/api/media/resolve` now matches target failure behavior for inaccessible media metadata: `https://example.invalid/video` returns HTTP `400` with `Failed to access media metadata. Please try again later.` instead of creating a generic resolved media warning state.
  - Local invalid state verified after the API update: error alert has `role="alert"`, no border/background, `14px/20px`, medium, `rgb(239,68,68)`, and text exactly matches target.
  - Upload dropzone inner drag card now uses an explicit `16px` radius to match the target computed `border-radius`; the previous Tailwind token resolved to `20px` locally.
  - Upload and dashboard link dialogs now match the target mobile container treatment: `max-width:512px` below `sm`, square mobile corners, desktop `640px`/rounded corners preserved, and mobile supported-platforms wrapper removes the visible card background/border while retaining desktop card styling from `sm` upward.
  - Link dialog inputs now use a scoped `.media-link-input` class: mobile `38px` height with `16px` text to match the target mobile input, and desktop `40px`/`14px` to preserve the verified desktop dialog.
  - Local mobile recheck after the final input specificity update measured dialog `390x482` at `x=0`, `y=181`, `max-width:512px`, radius `0`, platform wrapper transparent/no-border, chips at `y=354/392/430`, input `340x38` with `16px` text and `8px 12px` padding, search `340x40`, and centered minutes/buy-more group.

## Google Drive

- Target default upload page shows `Google Drive` as a desktop-only row in the main action list.
- Target observed on 2026-07-01: clicking/attempting upload interactions was blocked by the global `Urgent System Update Notice` modal, which appears as a `448px` by `348px` dialog over a black/40 overlay and must be dismissed before the underlying Google Drive flow can be inspected.
- Target rechecked on 2026-07-02 after login: `/upload` no longer displayed the system update modal in the active browser session. Local parity updated so the shared notice is disabled by default and only appears when `NEXT_PUBLIC_SYSTEM_UPDATE_NOTICE_ENABLED=true`, preserving the target-style UI for future maintenance windows without blocking the current upload workflow.
- Clicking when disconnected starts Google Drive OAuth.
- Target observed on 2026-06-30 after clicking `Google Drive` from `/upload`:
  - Navigates away from `https://www.uniscribe.co/upload` to `https://accounts.google.com/v3/signin/identifier...`.
  - OAuth URL includes `scope=https://www.googleapis.com/auth/drive.file`, `access_type=offline`, `include_granted_scopes=true`, `prompt=consent`, and `redirect_uri=https://api.uniscribe.co/auth/google-drive/callback`.
  - Google login page title is `登录 - Google 账号` in the inspected browser locale and shows `UniScribe` as the destination app.
- Target rechecked on 2026-07-02: `/upload` was already past the system-update modal in the current session; clicking `Google Drive` from the desktop action list navigated to `https://accounts.google.com/v3/signin/identifier...` with `scope=https://www.googleapis.com/auth/drive.file`, `access_type=offline`, `include_granted_scopes=true`, `prompt=consent`, `response_type=code`, and `redirect_uri=https://api.uniscribe.co/auth/google-drive/callback`. QA stopped at the Google sign-in page and did not authorize Drive access.
- Local parity updated on 2026-06-30:
  - Upload page `Google Drive` now checks connection first.
  - If disconnected, it starts authorization directly instead of opening the `Google Drive Import` dialog first.
  - The import dialog is reserved for connected accounts or authorization-start failure.
  - In the current local environment, `GOOGLE_CLIENT_ID` is missing, so authorization cannot leave localhost; the page stays on `/en/upload` and opens the fallback `Google Drive Import` dialog with the missing-configuration error.
- Local parity updated on 2026-07-01:
  - The fallback/local `Google Drive Import` dialog now exposes `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="google-drive-import-title"`.
  - The dialog chrome uses the same target modal language as the current logged-in app: black/40 viewport overlay, `640px` max width, `8px` radius, slate-200 border, white background, `24px` padding, no visible shadow, and a 16px top-right close control.
  - The disconnected state keeps the target business flow: `Connect Drive` starts OAuth; local missing Google credentials show the failure inside the dialog without leaving the page.
  - The localized upload route now responds to a later `mode=drive` state update from the parent workspace, so `/en/upload?mode=drive` opens the Drive flow instead of silently rendering the default upload page.
- Local rechecked on 2026-07-02: after dismissing the system-update modal, clicking upload-page `Google Drive` opens the fallback `Google Drive Import` dialog at `640px` max width with the target black/40 overlay and shows `GOOGLE_CLIENT_ID 未配置。`; no Google OAuth authorization is attempted in this missing-config environment.
- Local fallback dialog remeasured on 2026-07-02 after logged-in upload load completed: overlay is `1280px` by `720px`, black/40, grid `place-items: center`, `z-index: 40`, padding `24px 16px`; dialog is `640px` by `272px` at `x=320`, `y=224`, `24px` padding, white background, slate-200 `1px` border, `8px` radius, no visible shadow; missing-config error is `14px/20px`, coral `rgb(228, 109, 95)`, `margin-top: 12px`, and spans `556px` by `38px` at `x=362`, `y=416`.
- During research and local parity QA, do not authorize Google Drive unless explicitly approved.

## Responsive Notes

- Desktop uses dashboard sidebar and a centered max-width content column.
- Mobile hides the desktop sidebar.
- Mobile uses a collapsed `Supported Formats & Limits` accordion, while desktop uses the visible white card.
- Target mobile upload inspected on 2026-07-01 at 390px: sidebar is hidden, Recent Files is `32px` at `x=326`, `y=24`, the drag card/action column stays `274px` wide at `x=58`, `Drag and drop files here` card starts at `y=110`, `Select files from your device` starts at `y=304`, `Paste Link` starts at `y=376`, and Google Drive is hidden on mobile.
- Local parity updated on 2026-07-01: upload mobile shell uses a tighter 12px top main padding while preserving the target 274px centered action column and hidden mobile Google Drive row.
- Target/local mobile default upload parity updated and verified on 2026-07-02 at `390x844`: breadcrumb `Dashboard` sits at `x=32`, `y=30`, Recent Files at `x=326`, `y=24`, drag card at `x=58`, `y=110`, action buttons at `y=304/376`, and Google Drive remains hidden. Local mobile vertical gap was tightened so the whole upload action column moved up 4px to match target.
- Target/current mobile `Supported Formats & Limits` collapsed row is a no-card accordion row, not a rounded/shadowed details card: outer row `x=32`, `y=490`, `w=326`, `h≈57`, with a `56px` trigger, `16px/24px` medium text, `16px 8px` padding, and `1px solid rgb(226,232,240)` bottom border. Local parity updated the mobile details summary to match this treatment.
