# Pricing Page Specification

## Overview
- Target files: `src/components/content-pages.tsx`, `src/components/pricing-actions.tsx`
- Routes: `/en/pricing`, `/en/faq`
- Interaction model: click-driven billing tabs and click-driven FAQ accordion.
- Verified target URL: `https://www.votxt.co/pricing` on 2026-07-01.

## Desktop Layout, 1280x720
- Public marketing header remains fixed at the top; pricing content starts below it with `main` padding-top `80px`.
- Public page landmarks are siblings: `body > header`, `body > main`, and `body > footer`. The target public pages do not nest the marketing header or footer inside `main`.
- Pricing content wrapper is `max-width: 1400px`, horizontal padding `32px`.
- Title is `Affordable Pricing`, rendered as an `h2` on target and local while matching the same visual styles.
- Title computed style: `font-size: 36px`, `line-height: 40px`, `font-weight: 700`, centered, y `144`, margin-top `64px`, margin-bottom `24px`.
- Subtitle computed style: `font-size: 20px`, `line-height: 28px`, centered, color `rgb(100, 116, 139)`, y `208`, margin-bottom `24px`.

## Billing Tabs
- Container: `display: grid`, `grid-template-columns: 168px 168px 168px`, width `512px`, height `40px`, x `384`, y `260`.
- Background: `rgb(241, 245, 249)`, border `0`, border-radius `6px`, padding `4px`.
- Tab buttons: width `168px`, height `32px`, padding `6px 12px`, font `14px/20px`, weight `500`, border-radius `4px`.
- `One-Time` includes a `16px` square `https://cdn.votxt.co/stripe-crypto.svg` image with alt/title `Crypto payments powered by Stripe`, using a 4px gap after the text. This makes the accessible tab name read like `One-Time Crypto payments powered by Stripe`.
- Annual is selected by default. Selected button background is `rgb(255, 255, 255)`, color `rgb(2, 8, 23)`, shadow `0 1px 2px rgba(0,0,0,.05)`.
- Annual label contains a red `Save 40%` badge.

## Pricing Cards
- Annual default has four cards laid out as a horizontal flex strip, not a four-column CSS grid.
- Strip wrapper: outer max-width `1216px`, x `32`, y `332`, overflow-x auto, padding `0 16px 32px`.
- Inner strip: `display: flex`, `gap: 32px`, `min-width: max-content`.
- Card dimensions on desktop: width `320px`, height about `918px`, border-radius `8px`, background `rgb(255,255,255)`, border `1px solid rgb(226,232,240)`, shadow `0 1px 2px rgba(0,0,0,.05)`.
- Basic card has violet border `rgb(117, 119, 255)`.
- Standard card has `Most popular` badge and primary violet CTA; it does not have the violet border in target default state.
- CTA appears above price inside card body, width `270px`, height `40px`, y `473` on desktop default annual. Non-featured buttons are white with slate border; Standard is violet `rgb(100, 103, 242)`.
- Price typography: large monospace-like `48px` line-height `48px`; suffix `/ month` is `13px`, slate.
- Annual Basic copy: `$6 / month`, `$10` struck through, `($72 / year, billed yearly)`.
- Paid feature rows include `Transcription available in 63 languages`, `AI translation` with `More information` icon and `New` badge, `Enhanced AI Insights` with icon and badge, and `API access` link to `/docs`.
- Pro tagline target text: `Ideal for high-volume users and teams.`

## FAQ Section
- FAQ title is centered, `font-size: 36px`, `line-height: 40px`, `font-weight: 700`, margin-bottom `48px` on desktop.
- FAQ list width is `718px`, centered at x `281`.
- Target FAQ list is not inside a bordered rounded card. It is a plain `divide-y` list.
- Desktop question button: width `718px`, height `76px`, padding `24px 0`, font `18px/28px`, weight `500`, border `0`, background transparent.
- FAQ questions are collapsed by default; `aria-expanded=false` until clicked. Clicking toggles the answer and rotates chevron.

## Mobile Layout, 390x844
- Header still fixed; `main` padding-top `80px`.
- Wrapper horizontal padding is `32px`, giving content width `326px`.
- Title: x `32`, y `144`, width `326px`, height `40px`, `36px/40px`, weight `700`.
- Subtitle: x `32`, y `208`, width `326px`, height `112px`, `20px/28px`.
- Tabs: x `32`, y `344`, width `326px`, height `40px`; each tab width about `106px`.
- Cards stack vertically. Card width about `294px`, x `48`, gap `32px`.
- Mobile Free card height about `812px`; paid cards about `970px`.
- FAQ title: x `16`, y around `4334`, width `358px`, `30px/36px`, margin-bottom `32px`.
- Mobile FAQ buttons use `16px/24px`, padding `16px 0`, transparent background, no outer border.

## Local Implementation Notes
- `/en/pricing` owns the full pricing page and `/en/faq` reuses the same FAQ accordion style.
- `PricingAction` accepts visual-only props for button variant and placement; checkout behavior remains unchanged.
- Checkout success/cancel URLs are generated from the current request origin as of 2026-07-02, keeping local and preview pricing flows on their active host instead of `NEXT_PUBLIC_APP_URL`.
- Local parity updated and verified on 2026-07-02: public pricing `One-Time` tab now includes the target Stripe crypto SVG image, uses target `4px` tab gap and `4px` tab button radius, and the mobile hero subtitle uses a localized spacing adjustment so it wraps to target `326x112` / four-line geometry. Local mobile remeasure at `390x844`: subtitle `x=32 y=208 h=112`, tablist `x=32 y=344 h=40`, One-Time tab `x=36 y=348 w=106 h=32`, crypto image `16x16` at `x=115.51 y=356`, and Free heading `y=441`; desktop remains one-line subtitle with `word-spacing: 0px` and tablist `512x40` at `x=384 y=260`.
- Local parity updated and verified on 2026-07-02: `/en/pricing`, `/en/faq`, and `/en/blog` now render the public `SiteHeader` and `SiteFooter` outside the route `main`, matching the target public-page landmark structure. Browser verification on `/en/pricing` at `390x844` returned exactly one header, main, and footer; `main header` and `main footer` were absent, while the pricing mobile geometry above remained unchanged.
- Local parity updated and verified on 2026-07-02: the public pricing title now uses the target `h2` element instead of a local-only `h1`. Local mobile remeasure at `390x844` kept the title at `x=32 y=144 w=326 h=40`, subtitle `y=208 h=112`, tablist `y=344`, and Free heading `y=441`.
