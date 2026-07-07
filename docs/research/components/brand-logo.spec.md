# Brand Logo Specification

## Overview
- **Target files:** `public/uniscribe-logo.svg`, `public/uniscribe-logo-dark.svg`, `src/components/brand-logo.tsx`
- **Interaction model:** static, theme-driven via `.dark`

## Target Evidence
- Target home header logo link contains two images:
  - light: `https://cdn.uniscribe.co/logo.svg`
  - dark: `https://cdn.uniscribe.co/logo_darkmode.svg`
- Target markup uses `width="180"` and `height="45"` on both images.
- Target light image natural size is `1181x276`; at 1280px desktop it renders at `180px` by `42.0625px`.
- Target dark image natural size is `1101x172` and is hidden in light mode with `class="hidden dark:block"`.
- Target header link at desktop is `180px` by `42.0625px`, `x=16`, `y=16`.

## Local Implementation
- `BrandLogo` renders the same two-image light/dark structure:
  - `/uniscribe-logo.svg` with `dark:hidden`
  - `/uniscribe-logo-dark.svg` with `hidden dark:block`
- Default dimensions are `width=180`, `height=45` to match target markup and preserve the target light-mode rendered height under Tailwind image preflight.
- Existing calibrated call-site sizing is preserved with optional `width`, `height`, and `className`.

## Call Sites
- Public header: default `180x45` target markup.
- Public footer: default `180x45` target markup; the light logo renders `180px` by `42.06px` on desktop and mobile.
- Public footer group labels render as paragraph text, not headings. Target `/pricing` exposes only the page content `h2` elements in its `h1/h2` list; footer labels such as `Free Tools` and `Company` are `p` elements with uppercase styling.
- Public footer layout was rechecked on 2026-07-02: target footer contains the logo/social block plus only `Free Tools` and `Company` link groups. Local now matches the target 501px desktop footer height and 615.06px mobile footer height; social links are icon-only 24px Twitter/Mail controls with `sr-only` labels.
- Auth pages: centered `180x42` or verification-card `190x52` sizing preserved.
- Workspace sidebar: target sidebar-calibrated `154px` rendered width preserved.

## Assets
- `public/uniscribe-logo.svg`: downloaded from target CDN `logo.svg`.
- `public/uniscribe-logo-dark.svg`: downloaded from target CDN `logo_darkmode.svg`.

## Responsive Behavior
- Header placement and mobile menu behavior are specified in `openapi-docs.spec.md` and `BEHAVIORS.md`.
- Logo component itself does not change structure by breakpoint; callers control size and placement.
