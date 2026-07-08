# Transcription Detail Specification

## Overview
- **Target file:** `src/components/transcription-page.tsx`
- **Related component:** `src/components/media-player.tsx`
- **Target URL:** `https://www.votxt.co/transcriptions/7477261729076727808`
- **Local URL:** `http://localhost:3000/en/transcriptions/cmqyzscrp00021lvpt08gi2oo`
- **Captured:** 2026-06-30, desktop viewport 1280x720
- **Interaction model:** click-driven toolbar/dialogs plus independently scrollable transcript and insight panes

## DOM Structure
- Root workbench fills the viewport: `height: 100dvh`, white background, no dashboard sidebar.
- Top header is a 64px-high fixed-height row at the top of the workbench.
- Body below the header is a horizontal flex layout on desktop:
  - Left transcript pane: width about 794px at 1280px viewport, white, own vertical scroll area.
  - Right insight pane: width about 486px at 1280px viewport, left divider, own vertical scroll area.
- Transcript pane contains:
  - Sticky transcript toolbar row.
  - Rating row.
  - Timestamped transcript list.
  - Bottom upgrade banner and media player pinned to the bottom of the left pane.
- Insight pane contains:
  - `Summary` / `Mind Map` tabs.
  - `General` selector plus regenerate and copy icon buttons.
  - Summary content sections such as `概述`, `要点`, and `启示`.

## Computed Styles

### Root Workbench
- display: flex
- width: 1280px
- height: 720px
- backgroundColor: rgb(255, 255, 255)
- overflow: hidden
- fontFamily: Inter, ui-sans-serif, system-ui
- color: rgb(2, 8, 23)

### Header
- height: 64px
- padding: 0px 24px
- borderBottom: 1px solid rgba(2, 8, 23, 0.1) locally maps to target `rgb(226, 232, 240)`
- back button: 44px by 44px, borderRadius: 12px, transparent background
- title: 20px, fontWeight 400, single-line truncated, `600px` wide at the 1280px target viewport, positioned at `x=84`
- source/share/more buttons: 40px by 40px, borderRadius: 12px
- export button: 40px high, about 108px wide, background `rgb(100, 103, 242)`, text white, borderRadius 12px
- more menu: `260px` by `135px`, `x=867.5`, `y=56`, `padding: 6px`, border `1px solid rgb(226,232,240)`, borderRadius `12px`, no visible shadow
- more menu items: `246px` by `36px`, `padding: 8px`, `14px/20`, `fontWeight: 400`; Delete uses `rgb(220,38,38)` and is separated from Move by a `1px` `rgb(241,245,249)` divider

### Export Dialog
- dialog: `500px` by `512px`, positioned at `x=390`, `y=104` in the 1280px target viewport
- shell: white background, `1px solid rgb(226,232,240)` border, `8px` radius, no visible shadow
- header title: `Export Options`, `18px`/`28px`, semibold; close control is a `16px` icon at `x=857`, `y=121`
- file format label: `File Format`, `16px`/`24px`, semibold
- format choices: two-column grid, each label `220px` by `52px`, row/column gap `10px`, text `16px`/`24px`, normal weight
- options label: `Export Options`, `16px`/`24px`, semibold
- checkbox row: inline labels `Show speaker names` and `Show timestamps`, `16px`/`24px`, normal weight, `16px` square purple checkbox controls
- footer action: centered purple `Export` button, `220px` by `48px`, `borderRadius: 12px`, `16px`/`24px`, bold

### Rename Dialog
- dialog: `425px` by `206px`, positioned at `x=427.5`, `y=257` in the 1280px target viewport
- shell: white background, `1px solid rgb(226,232,240)` border, `8px` radius, no visible shadow
- header: 24px top/horizontal padding and 16px bottom padding; title `Rename File`, `20px`/`28px`, `fontWeight: 600`
- close control: `16px` by `16px`, positioned at `x=819.5`, `y=274`
- input: `375px` by `40px`, positioned at `x=452.5`, `y=342`, `padding: 8px 12px`, `14px`/`20px`, normal weight, focused violet border and 3px low-opacity violet ring
- footer: `375px` wide, `40px` high, positioned at `x=452.5`, `y=398`, right-aligned with 12px gap
- buttons: `40px` high, `14px`/`20px`, `fontWeight: 500`, `padding: 8px 16px`; initial `Rename` submit is disabled until the filename changes

### Move Dialog
- target empty-destination state: `448px` by `270px`, positioned at `x=416`, `y=225` in the 1280px target viewport
- local data-rich state with two destination folders naturally grows to `448px` by `330px`, still centered at `x=416`
- shell: white background, `1px solid rgb(226,232,240)` border, `8px` radius, no visible shadow
- close control: `16px` by `16px`
- helper copy: `Moving "..." from Uncategorized`, `14px`, normal weight, muted slate
- destination rows: `398px` by `38px`, `14px`/`20px`, normal weight, slate border
- footer buttons: equal-width 40px-high columns, `14px`/`20px`, `fontWeight: 500`; initial `Move` submit is disabled until a destination is selected

### Delete Confirmation Dialog
- dialog: `448px` by `216px`, positioned at `x=416`, `y=252` in the 1280px target viewport
- overlay: `rgba(0, 0, 0, 0.4)`
- shell: white background, `1px solid rgb(226,232,240)` border, `8px` radius, no visible shadow, `display: grid`, `gap: 16px`, `padding: 0`
- header: `padding: 24px 24px 16px`
- title: `Delete Transcription`, `20px`/`28px`, `fontWeight: 600`, foreground `rgb(2,8,23)`
- description: `Are you sure you want to delete <title>?`, `14px`/`20px`, muted slate `rgb(100,116,139)`, `6px` top margin
- footer: right-aligned `Cancel` and red `Delete` buttons, `gap: 12px`, `padding: 0 24px 24px`
- buttons: `40px` high, `14px`/`20px`, `fontWeight: 500`, `padding: 8px 16px`; `Delete` is `rgb(239,68,68)` with `rgb(248,250,252)` text and is enabled immediately
- close control: `16px` by `16px`, positioned at `x=831`, `y=269`

### Share Dialog
- target disabled state measured on 2026-07-02 at 1280px: overlay is `rgba(0,0,0,0.4)` fixed full viewport, z-index 50.
- dialog: `448px` by `228px`, positioned at `x=416`, `y=246`, white background, `1px solid rgb(226,232,240)` border, `8px` radius, `display:grid`, `gap:16px`, no visible shadow.
- header wrapper: `446px` by `94px`, `padding:24px 24px 16px`; title `Share Transcription` is `20px/28px`, semibold, `rgb(2,8,23)`, `letter-spacing:-0.5px`; description `Anyone with the link can view this transcription` is `14px/20px`, muted slate, `6px` top margin.
- body wrapper: `446px` by `116px`, `padding:0 24px 24px`, `gap:16px`; inner stack is `398px` wide with `gap:12px`.
- disabled copy: `Sharing is currently disabled. Enable it to generate a public link.`, `398px` by `40px`, `14px/20px`, muted slate.
- primary action: `Enable sharing`, `398px` by `40px`, `rgb(100,103,242)` background, white `14px/20px` medium text, `6px` radius, `8px 16px` padding.
- close control: `16px` by `16px`, positioned at `x=831`, `y=263`, transparent background, `4px` radius.
- Local QA data note: read-only Prisma QA on 2026-07-02 confirmed the canonical local task had one enabled historical share link from prior flow tests, while the target account's corresponding task opens with sharing disabled. The SQL QA reset now disables enabled share links for `cmqyzscrp00021lvpt08gi2oo`, and the current local QA database was aligned on 2026-07-02 by disabling the one enabled link, so first-open detail parity uses the target disabled branch. The shared component still supports both disabled and enabled states for share-flow tests.

### Main Panes
- body row starts at y=64
- transcript pane: x=0, y=64, width about 794px, height 656px
- insight pane: x=794, y=64, width about 486px, height 656px
- insight pane left border: 1px solid light slate border

### Transcript Toolbar
- sticky within transcript scroll area
- toolbar container padding: 16px 24px 8px
- toolbar row height: 32px
- title `Transcript`: 16px, fontWeight 600
- icon buttons: 32px by 32px, borderRadius 6px, slate text
- speaker-recognition active button: 32px by 32px, round, background rgba(100,103,242,0.1), text `rgb(100,103,242)`
- speaker note rechecked on 2026-07-02: `260px` by `84.5px` at `x≈509.6`, `y=120`, white, rounded 8px, slate-200 border, target `shadow-lg`, `12px/19.5px` muted slate text, and a purple `Details` button at `12px/16px`, medium weight, `0 4px` padding

### Rating Row
- top margin: about 20px below toolbar
- target rechecked on 2026-07-02: outer row is `745.59px` by `38px` at `x=24`, `y=140`, with white background, `1px solid rgb(226,232,240)`, `4px` radius, `8px 12px` padding, and no shadow
- inner row is `20px` high at `x=37`, `y=149`, with `14px/20px` muted slate text
- stars: 19px outline icons

### Transcript Rows
- row wrapper: rounded 8px, padding 16px, bottom margin 8px
- timestamp row: outer `div` uses `display:flex`, `align-items:center`, `height:19.5px`, `margin-bottom:12px`, and `space-x-2`; inner timestamp text/control is `13px`/`19.5px`, normal weight, tabular nums, color `rgba(100,116,139,.7)`
- paragraph inner card: `p-2 sm:p-3`, `border: 2px solid transparent`, white/card background, 8px radius, hover border changes to primary purple
- paragraph: `14px` text, lineHeight `22.75px`, black foreground; first target paragraph measured at `685.6px` by `113.8px` inside a `713.6px` inner row card
- hover state: light slate background

### Insight Pane
- padding: 0 24px
- tab row target metrics at 1280px: container x `817.59`, y `64`, width `182.21`, height `56`, inline-flex, centered, gap `32px`, `4px 0` padding
- active tab: 16px, fontWeight 600, 36px height, purple 3px underline
- inactive tab: 16px, fontWeight 500, text rgba(2,8,23,0.7)
- target insight toolbar measured on 2026-07-01 at 1280px: row is 40px high at x `817.59`, y `128`, width `438.41`; `General` is a button-like selector, `240px` by `36px`, y `130`, background `rgba(241,245,249,0.55)`, no border, 12px radius, `8px 12px` padding, `13px/19.5px`, fontWeight `500`, color `rgba(2,8,23,0.85)`.
- action buttons: two icon-only controls at x `1168` and `1216`, each `40px` by `40px`, 12px radius, transparent background, slate text `rgb(100,116,139)`, no border or shadow.
- summary content target metrics at 1280px: content begins at x `817.59`, y `188`, width `438.41`; headings are `16px/24px` semibold. The overview paragraph is `14px/20px`; bullet lists are `14px/22.75px`, `20px` left indent, `4px` spacing between items, and rgba(2,8,23,.8) text.
- section headings: 16px, fontWeight 600
- timestamp chips inside summaries: 11px, purple border/background; summary entries can be strings for legacy data or `{text, timestamps}` objects for target-like timestamp references.
- Mind Map target state measured on 2026-07-01 at 1280px:
  - `Summary` / `Mind Map` are `role=tab` controls with `aria-selected` and `data-state`.
  - When `Mind Map` is active, the `General` selector/regenerate/copy toolbar is hidden.
  - Content starts with a small `Mind Map` title at x `817.59`, y `136`, `14px/20`, semibold.
  - Canvas is a transparent SVG/markmap surface at x `817.59`, y `164`, width `438.41`, height `500`, inside a `h-[calc(100vh-220px)]` area.
  - The target has no rounded card/tree list around the mind map nodes.

### Bottom Left Player
- upgrade banner: left-pane only, minimum height about 53px, purple background, white text
- banner includes a small circular collapse icon at left and a white `Upgrade Now` pill at right
- target rechecked on 2026-07-02: the visible banner `Upgrade Now` control is a `button`, not an anchor. It is `111.72px` by `32px`, `padding: 0px 16px`, `fontSize: 12px`, `fontWeight: 700`, white background, violet text, full pill radius, and `shadow-lg shadow-black/10`.
- media controls sit under the banner on white background with 24px horizontal padding
- controls: 15s back, 40px purple play button, 15s forward, current time, progress bar, duration, volume icon, `1x`

## States & Behaviors
- **Back:** returns to dashboard.
- **Source:** opens source URL when present; icon is red/coral.
- **Share:** opens `Share Transcription`.
- **More actions:** opens compact menu with only `Rename`, `Move`, and `Delete Transcription`.
- **Export:** opens `Export Options` dialog.
- **Rename:** opens `Rename File`; submit is disabled until the trimmed draft differs from the current title.
- **Move:** opens `Move to Folder`; no folder is preselected, and submit stays disabled until a destination row is selected.
- **Delete Transcription:** opens the target in-app confirmation dialog; the destructive API call is not made until the red `Delete` button is clicked.
- **Transcript search:** toggles a search field under rating.
- **Speaker details:** toggles the floating speaker-recognition note.
- **Summary / Mind Map:** switches right-pane content in place.
- **Regenerate:** regenerates active insight type.
- **Copy:** copies active insight JSON/text to clipboard.
- **Timestamp rows:** clicking timestamp seeks the media player.
- **Media player:** play/pause, 15-second skip, seek bar, mute toggle.
- **Upgrade banner:** target rechecked on 2026-07-02: clicking the bottom banner `Upgrade Now` keeps the current `/transcriptions/...` URL and opens the full `Plans & Pricing` overlay (`1152px` by `720px` at 1280x720) with Annual selected. Do not click final checkout actions during target QA.

## Responsive Behavior
- **Desktop (1280px+):** two-pane viewport workbench with independent scrolling.
- **Mobile (390px, rechecked 2026-07-02):**
  - The browser reports `innerWidth=390`, `innerHeight=844`; the workbench remains `100dvh` with internal scroll regions rather than normal body scrolling.
  - The header stays 64px tall. The back button remains at `x=24 y=10 w=44 h=44`.
  - The long file title is not visibly allocated in the mobile header. The action cluster starts immediately after the back button: source/delete icon at `x≈98`, share at `x≈150`, more at `x≈202`, and the purple `Export` button at `x≈258 w≈108 h=40`.
  - Transcript toolbar begins at `y≈80`; `Transcript` appears at `x≈16 y≈84`.
  - The transcript toolbar uses a narrow target-like row of about `210px` at `x=16`; the icon row overflows to the right and starts at `x≈95`, with buttons spaced every `40px`.
  - The speaker-recognition bubble overlays below the toolbar at about `x≈27 y=120 w=260 h=84.5`, with `12px/19.5px` muted copy and the `Details` control at `x≈40 y≈174`.
  - The mobile first viewport includes the transcript rating card. Target measured `x=16 y=136 w≈210 h=62`, `12px/16px` rating label at `x=29 y=145`, `20px` outline stars at `x=29/51/73/95/117 y=169`, and a `28px` close control at `x≈189 y=153`.
  - The first transcript timestamp starts below the mobile rating card at `x≈32 y=230`.
  - Transcript text is constrained to a narrow reading column, about `210-242px` wide on a 390px viewport.
  - The left transcript/player column appears first and occupies about `744px` below the 64px header. The purple upgrade banner/card appears near the bottom of the first viewport at `y≈596`, is about `242px` wide, and the media controls continue below it with the play button around `x≈114 y≈751`.
  - The insights pane stacks after the player. `Summary` starts at `x≈24 y≈816`, `Mind Map` at `x≈130 y≈816`; the `General` selector row starts at `y≈870`; summary content begins around `y≈930`.
- Local parity updated on 2026-07-01:
  - mobile header hides the long title at `<768px` so the action cluster keeps the target one-line geometry instead of being squeezed by a hidden/truncated title column.
  - mobile left pane is fixed to `calc(100dvh - 100px)` and the footer/player is `212px`, placing the upgrade card at `y≈596`, play at `x≈108 y≈751`, and `Summary` at `y≈830`.
  - mobile media player hides desktop progress/volume controls and uses the target-like current time, 15s back, play, 15s forward, duration row.
  - desktop transcript rows now match target timestamp rhythm: `13px` timestamp text with `12px` gap to `16px/24px` transcript paragraphs.
- Local parity updated and verified on 2026-07-02:
  - mobile standalone detail now matches the target narrow transcript toolbar/rating geometry: toolbar row `210px` wide, first toolbar button `x≈93.5` versus target `x≈95.2`, speaker note `260x84.5` at `y=120`, mobile rating card `210x62` at `x=16 y=136`, first rating star `x=29 y=169`, and first transcript timestamp restored to `x=32 y=230`.
  - desktop standalone detail remains on the verified desktop geometry after the mobile change: rating row `746x38` at `x=24 y=140`, hidden mobile close control, and `19px` desktop stars.
- Local parity updated on 2026-07-01:
  - desktop insight toolbar now uses the target button-style `General` selector instead of a native `<select>`, with 240x36 geometry, 12px radius, pale slate background, no border/shadow, and target 13px text treatment.
  - desktop regenerate/copy controls now use target `40x40` icon buttons with 12px radius and slate icon color.
- Local parity updated on 2026-07-01:
  - detail Mind Map tab now uses target `role=tab` state attributes, hides the Summary toolbar while active, and renders a transparent SVG mind-map canvas at the target `437x500` local geometry instead of the previous rounded card list.
- Local parity updated on 2026-07-01:
  - desktop insight pane now matches target vertical rhythm: tabs start at y≈74, the `General` toolbar starts at y≈130, and Summary content starts at y≈188 with target 14px summary body/list density.
- Local parity updated on 2026-07-01:
  - Summary bullets and insight/takeaway rows now support target-style timestamp references rendered as small purple chips; the QA intro seed data and AI summary generation schema now use structured `{text, timestamps}` entries while preserving legacy string arrays.
- Local parity updated on 2026-07-01:
  - Dashboard-embedded task detail now uses the same structured Summary entry renderer as standalone detail, so timestamped summary bullets render readable text plus purple timestamp chips instead of object text.
- Local parity updated on 2026-07-01:
  - Standalone and dashboard-embedded task detail merge realtime/polling task snapshots into the currently loaded detail record, preserving loaded `insights` when an update only carries status/progress fields so Summary does not flash to the empty state.
- Local parity updated on 2026-07-01:
  - desktop transcript paragraph text now uses the target `14px/22.75px` treatment instead of the previous local `16px/24px`, aligning transcript row density with the target read-first transcript list.
- Local parity updated on 2026-07-01:
  - desktop transcript paragraphs now render inside the target-like transparent-bordered inner text card, matching the target paragraph width and row rhythm.
- Local parity updated on 2026-07-01:
  - desktop transcript timestamp markup now matches the target nested structure: a fixed-height flex timestamp row wrapping the timestamp text/control, rather than making the timestamp button itself provide the row spacing.
- Local parity updated on 2026-07-01:
  - shared media player card mode now renders the volume control as a target-style custom rail with a transparent native range overlay, matching the seek control approach and removing the browser-native violet-accent slider from share/detail media cards.
- Local parity updated on 2026-07-01:
  - outline exports now preserve target-style structured summary entries (`{text, timestamps}`) by exporting readable bullet text plus timestamp labels instead of dropping non-string bullets.
- Local parity updated on 2026-07-02:
  - desktop detail no longer renders the local-only inline share status/link strip under the transcript toolbar. Target current state has no persistent `Sharing is enabled` / public URL strip in the transcript pane; share state remains inside the Share Transcription dialog. Removing the strip restores local first transcript geometry from `firstArticle y=246` to `y=196`, matching target `y≈194`; first timestamp row is now `y=212` versus target `y≈210`, first text card `y=243.5` versus target `y≈242`, and first paragraph `y=257.5` versus target `y≈256`.
- Local parity updated on 2026-07-02:
  - shared Share Transcription dialog overlay now uses target `rgba(0,0,0,0.4)` / `bg-black/40` instead of the previous local `rgba(16,24,32,0.35)` / `bg-ink/35`. This aligns Share with target and with the local Rename/Move/Delete modal overlay treatment.
  - local parity updated and verified at 1280x720 on 2026-07-02: standalone detail rating row now matches the target 38px shell and 20px inner line, and the speaker-recognition note matches the target `260x84.5` shell, `12px/19.5px` body copy, `shadow-lg`, and `12px/16px` `Details` control.
- Local parity updated on 2026-07-02:
  - standalone detail `Export Options` file-format choices now use the target visible 16px radio indicator plus text treatment instead of the previous local bordered-card selection style, matching the dashboard row export dialog's target control shape.
- Local parity updated on 2026-07-02:
  - dashboard-embedded detail `重新转写设置` modal overlay now uses target modal-family `rgba(0,0,0,0.4)` / `bg-black/40` instead of the older local `bg-ink/35` overlay.
- Local parity updated and verified on 2026-07-02:
  - standalone detail bottom upgrade banner now renders `Upgrade Now` as the target-style white pill button instead of an anchor to `/pricing`, and opens the shared full `Plans & Pricing` overlay in Annual mode while preserving the current detail URL.
- Local parity updated and verified on 2026-07-02:
  - standalone detail Share Transcription disabled dialog now matches the target final state at 1280x720: `448x228` dialog at `x=416 y=246`, `rgba(0,0,0,.4)` overlay, target disabled copy, `398x40` primary action, and title color/letter-spacing `rgb(2,8,23)` / `-0.5px`.
- Local business-flow parity updated on 2026-07-02:
  - Owner-facing share-link serialization in request-backed task APIs now uses the current request origin instead of `NEXT_PUBLIC_APP_URL`, matching the local email-link origin fix. This covers `/api/tasks`, `/api/tasks/[taskId]`, `/api/tasks/[taskId]/folder`, and `/api/tasks/[taskId]/share`, so local owner share URLs resolve to the active dev server origin such as `http://127.0.0.1:3005/...`.
  - The same request-origin rule now covers compatibility transcription APIs that serialize owner share links: `/api/transcriptions`, `/api/transcriptions/page`, `/api/transcriptions/search`, `/api/transcriptions/[taskId]`, `/api/transcriptions/anonymous/latest`, and the legacy create endpoints under `/api/tasks/*-transcription`.
  - Verification note: `pnpm exec tsc --noEmit` passed, a read-only `/api/tasks?locale=en&limit=5` call returned HTTP 200, `/api/transcriptions?locale=en&limit=1` returned HTTP 200, and `/api/transcriptions/anonymous/latest` returned HTTP 200. The current QA task set had no enabled share links, so no share link was created or enabled solely for verification.

## Text Content
- Header title example: `Learn How to Talk About Yourself in English | Easy Introductions for Beginners | English Podcast`
- Toolbar title: `Transcript`
- Speaker note: `Speaker recognition wasn’t enabled when this transcript was created. Details`
- Rating: `Rate transcript quality:`
- Insight tabs: `Summary`, `Mind Map`
- Selector: `General`
- Summary headings: `概述`, `要点`, `启示`
- Upgrade banner: `Upgrade for more transcription time and premium features`
- Upgrade action: `Upgrade Now`
