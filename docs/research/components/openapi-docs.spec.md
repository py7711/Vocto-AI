# OpenAPI Docs Specification

## Overview
- **Target file:** `src/app/[locale]/docs/page.tsx`
- **Target URL:** `https://www.votxt.co/docs`
- **Local URL:** `http://localhost:3000/en/docs`
- **Captured:** 2026-07-01, desktop viewport 1280x720 and mobile viewport 390x844
- **Interaction model:** static documentation page with sticky public header and sticky right table of contents

## DOM Structure
- Public marketing `SiteHeader` is fixed at the top.
- Main content begins below the header with a two-column grid:
  - Left article column: `x≈32`, width `≈920px`.
  - Right TOC card: `x≈992`, width `≈256px`, sticky at `top≈104px`.
- The page does not use the dashboard sidebar.
- The page does not use a separate large hero section. The H1, beta notice, and all documentation sections live inside the left article column.

## Computed Styles

### Header
- position: `fixed`
- height: target about `74px` on mobile/desktop docs; target mobile measurement at 390px shows the menu button at `x=334`, `y≈17`, `40px` square.
- logo area: target mobile logo link is about `180px` by `42px` at `x=16`, `y=16`.
- background: translucent white
- shadow: subtle `0 1px 2px rgba(0,0,0,.05)`
- mobile header hides desktop nav/language/theme/dashboard controls and shows a single `menu open` hamburger button. Opening it reveals full-width rows for `Features`, `Pricing`, `FAQ`, `Blog`, `English`, `Theme`, and `Dashboard`, with `358px` wide, `40px` high rows at x `16`.

### Layout
- max width: `1280px`
- padding-left/right: `32px` on desktop
- article width: `920px`
- TOC width: `256px`
- horizontal gap: about `40px`

### Article
- Desktop H1: `30px`, `36px` line-height, `700`, bottom border in violet, x `32`, target y about `136`; local y adjusted with article top padding.
- Mobile H1: `24px`, `32px` line-height, `700`, bottom border in violet, x `16`, y about `150`, width about `358px`.
- Beta notice: italic `16px`, `26px` line-height, left violet-tinted border, no filled alert card.
- Desktop section H2: `24px`, `32px`, `600`, bottom slate divider.
- Mobile section H2: `20px`, `28px`, `600`, bottom slate divider.
- Body copy: `16px`, `26px`, dark ink with slight opacity.
- Code inline: light slate background, rounded.
- Base URL code block: transparent `pre` with inline `code` using violet-tinted background, `2px 6px` padding, 4px radius, `14px/20px`.
- Multi-line code blocks: transparent `pre` wrapping a block code container with `rgb(45,45,45)` background, `16px` padding, 6px radius, `16px/24px` monospace text, and horizontal auto overflow.
- Tables: border is on the `table` and each cell, not the wrapper. Header/body cells use `14px/20px`, `8px 16px` padding, and 1px slate borders.

### Right TOC
- Card: white background, `1px solid rgb(226,232,240)`, `8px` radius, no visible shadow.
- Title: `Table of Contents`, `20px/28px`, bold.
- Links: `14px/20px`, normal weight, muted slate.
- Active `Overview` row: light violet background.
- Target rechecked on 2026-07-02 at 1280x720: desktop TOC is a sticky right rail at `x=992`, `y=104`, `256px` wide. The inner card is not viewport-clipped and does not scroll independently; it grows to the full list height (`1902px` in the captured state). Link rows use `8px` horizontal padding, `4px` vertical padding, `14px/20px` text, `8px` vertical gaps, and long labels wrap to `48px` or `68px` rows.

## States & Behaviors
- TOC links navigate to in-page anchors.
- Right TOC remains sticky while scrolling.
- Header remains fixed.
- No destructive, authentication, or payment side effects are present on this page.

## Responsive Behavior
- **Desktop 1280px:** article and TOC are side by side.
- **Mobile 390px:** target hides the desktop right TOC and shows a collapsed `Table of Contents` disclosure above the H1. The collapsed control is about `358px` wide, `44px` high, x `16`, y about `81`, with a slate border, 6px radius, white background, and `14px/20px` semibold label. Article content remains single-column.

## Text Content
- H1: `Votxt OpenAPI Documentation (Beta)`
- Beta notice begins: `⚠️ Beta Version Notice This API is currently in beta.`
- First sections: `Overview`, `Base URL`, `Authentication`, `File Upload Workflow`, `Endpoints`.

## Local Parity
- Updated on 2026-07-01: removed the previous standalone hero and card-based section shell; `/en/docs` now uses a target-like article column plus sticky right TOC, H1/section typography, inline beta notice, and light code blocks.
- Updated on 2026-07-01: mobile `/en/docs` now shows the target-style collapsed `Table of Contents` disclosure above the article and uses mobile target heading sizes (`24px/32px` H1, `20px/28px` H2).
- Updated on 2026-07-01: shared public `SiteHeader` mobile state now uses the target-like 180px logo area, 40px hamburger button, and slide-down menu rows instead of exposing the language switcher directly in the collapsed header.
- Updated on 2026-07-02: OpenAPI examples and backend create-task normalization were aligned with the live v1 API contract. The docs now show canonical snake_case request fields (`original_name`, `language`, `speaker_labels`, `subtitle`) and serializer response fields (`source_type`, `original_name`, `duration_seconds`, `status_message`, `error_code`, nested `transcript`). Legacy aliases (`filename`, `file_name`, `language_code`, `enable_speaker_diarization`, `transcription_type`) remain accepted by the backend and are documented as compatibility aliases only.
- Updated on 2026-07-02: desktop TOC styling now matches the current target no-scroll full-height card treatment, `8px` link gaps, `28px` default link rows, and target capitalization for endpoint labels. Local TOC also includes target entries whose anchors already exist in the current local article (`Webhook Events`, `Webhook Requirements`, `Understanding Different Types of Errors`, `Client-Side Error Handling`, and `Error Response Format`).
- Updated on 2026-07-02: local TOC now matches the target 47-entry desktop list, including duplicate `Python Example` entries and the target cURL/code-comment entries (`Create transcription`, `Check status`, upload-url/file-key/external-url/result steps). Webhook completion/failure examples and Error Handling sub-sections now use target-style `h4` anchors (`18px/28px`, semibold, `16px` vertical margin), while cURL step entries remain visible as code comments like the target page.
- Local business-flow parity updated on 2026-07-02: retained account webhook compatibility routes now enforce the same personal-team ownership feedback as API key mutation routes. Disabling a missing or non-owned webhook endpoint returns `404 Webhook 不存在。` instead of reporting success after a zero-row update.
- Updated on 2026-07-02: local `/en/docs` article body was reworked to match the target legacy OpenAPI copy and structure instead of the newer canonical API contract copy. Removed the local endpoint summary card grid, restored target field names (`filename`, `language_code`, `transcription_type`, `enable_speaker_diarization`), restored target response shapes, moved `Rate Limits` and `Language Support` back to target `h3` positions, moved footer outside `main`, and put section ids on headings.
- Updated on 2026-07-02: the Authentication `Important` block was restored from a local card to the target plain paragraph/list treatment, and targeted desktop section offsets were tightened around `Base URL`, `Authentication`, `File Upload Workflow`, `Best Practices`, and `Support`. Browser verification at 1280x720: body height `19200px` vs target `19203px` (`-3px`), code block heights all match, table heights `815/815` and `895/895`, and the largest remaining adjacent heading interval delta is `16px`.
- Updated on 2026-07-02: the shared public header language switcher is now controlled by React state so it loads closed like the target, closes on outside click or Escape, and no longer preserves a stale browser-native `<details open>` state across docs reloads.
