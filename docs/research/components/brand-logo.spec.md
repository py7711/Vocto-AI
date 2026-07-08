# Brand Logo Specification

## Overview
- **Target files:** `public/votxt-logo.svg`, `public/votxt-logo-dark.svg`, `public/favicon.svg`, `src/components/brand-logo.tsx`
- **Interaction model:** static, theme-driven via `.dark`

## Brand Design
- **Product meaning:** the mark reads left→right as audio → text, communicating the video/audio transcription product. The left half is a 3-bar sound waveform; the right half is 3 stacked text lines.
- **Wordmark:** lowercase `votxt`, split as `vo` (voice/video) in ink `#101820` and `txt` (text) in brand violet `#6467F2` to reinforce "speech to text". Dark mode uses `#EAF0FF` for `vo` and `#8C8EF8` for `txt`.
- **Palette:** aligned to the app primary color `violet #6467f2 / #5659df` (badge gradient), replacing the previous teal mark. Waveform strokes are white; text-line strokes are a light lavender tint (`#C9CBFB` light / `#D8D9FC` dark).
- **Badge:** rounded square (`rx=34` at 140px, `rx=15` at 64px) filled with a top-left→bottom-right violet gradient.

## Geometry
- Wordmark logos use `viewBox="0 0 470 180"` (≈2.61:1) tightly fit to the mark + wordmark so it fills its box without excess right whitespace.
- `favicon.svg` is the badge-only icon at `64x64`, sized to stay legible at 16px.

## Local Implementation
- `BrandLogo` renders the two-image light/dark structure:
  - `/votxt-logo.svg` with `dark:hidden`
  - `/votxt-logo-dark.svg` with `hidden dark:block`
- Default dimensions are `width=118`, `height=45` to match the `470x180` aspect ratio without distortion.
- Call-site sizing prefers height-driven `h-[Npx] w-auto` so the ≈2.61:1 ratio never distorts or letterboxes.

## Call Sites
- Public header: default `118x45` (renders the badge at ~34px with the wordmark beside it).
- Public footer: default `118x45`.
- Public footer group labels render as paragraph text, not headings. Target `/pricing` exposes only the page content `h2` elements in its `h1/h2` list; footer labels such as `Free Tools` and `Company` are `p` elements with uppercase styling.
- Public footer layout was rechecked on 2026-07-02: target footer contains the logo/social block plus only `Free Tools` and `Company` link groups. Local matches the target 501px desktop footer height and 615.06px mobile footer height; social links are icon-only 24px Twitter/Mail controls with `sr-only` labels.
- Auth pages: `h-[42px] w-auto` centered.
- Workspace sidebar: `h-[32px] w-auto` inside the 44px logo row.

## Assets
- `public/votxt-logo.svg`: custom votxt wordmark logo (light).
- `public/votxt-logo-dark.svg`: custom votxt wordmark logo (dark).
- `public/favicon.svg`: badge-only app icon.

## Responsive Behavior
- Header placement and mobile menu behavior are specified in `openapi-docs.spec.md` and `BEHAVIORS.md`.
- Logo component itself does not change structure by breakpoint; callers control size and placement.
