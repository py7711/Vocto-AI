# Settings Notifications Specification

## Overview

- Target file: `src/components/settings-page.tsx`
- Screenshot: `docs/design-references/votxt.co/settings-desktop.png`
- Interaction model: local click-driven switches inside a static settings card.

## DOM Structure

- `Email Notifications` is a bordered white settings card with a muted header.
- Body contains a vertical list of three bordered rows with `space-y-4` spacing.
- Each row contains:
  - Left text stack with title and helper copy.
  - Right aligned compact switch.

## Computed Styles

### Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- boxShadow: `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

### Header

- backgroundColor: `rgba(241, 245, 249, 0.5)`
- padding: `24px`
- title tag: `h3`
- title font: `20px/28px`, `font-weight: 600`

### Notification Row

- backgroundColor: transparent
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- padding: `16px`
- display: `flex`
- alignItems: `center`
- justifyContent: `space-between`
- desktop measured height: about `76px`

### Switch

- role: `switch`
- width: `44px`
- height: `24px`
- border: `2px solid transparent`
- checked backgroundColor: `rgb(100, 103, 242)`
- unchecked backgroundColor: `rgb(226, 232, 240)`
- thumb size: `20px` by `20px`
- thumb shadow: `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`
- checked thumb transform: translateX `20px`

## States & Behaviors

- All three switches load checked.
- Clicking a switch toggles `aria-checked` between `true` and `false` without navigation.
- Local parity verified on 2026-06-30: first switch toggled `true -> false -> true`.
- Local parity updated on 2026-06-30: notification rows now use `min-height: 80px`, matching the target desktop row height instead of the previous 76px local height.
- Local parity updated on 2026-07-01: card title now uses target `h3` semantics with unchanged `20px/28px` semibold styling.
- Target rechecked on 2026-07-01: the three notification switches render as standalone checked `role="switch"` controls with no separate `Save` button in the notification section. Local parity updated notification switches to persist immediately in per-account `localStorage` keys while preserving the target default checked state.
- Target rechecked on 2026-07-02 at 1280x720: each notification row is `578px` by `80px` with 16px vertical spacing, switches are `44px` by `24px`, and checked thumbs use the target heavier `shadow-lg` value. Local parity updated the notification switch thumb from the older light `shadow-soft` to this target shadow while preserving the existing checked/unchecked geometry.
- Target/local rechecked on 2026-07-02 at 1280x720 after clicking Settings `Notifications`: both render the `Email Notifications` section at `x=620`, `y=0`, `628px` by `424px`; rows are `578px` by `80px` at y `127`, `223`, and `319`; switches are checked `44px` by `24px` at x `1162`; thumbs are `20px` square at x `1184` with the target `shadow-lg` stack and `translateX(20px)`.
- Target/local mobile parity updated and verified on 2026-07-02 at `390x844` from `/settings#usage`: `Email Notifications` renders at `x=16`, `y=1334`, `w=358`, `h=556`; body wrapper is `356px` by `452px`; the three rows are each `308px` by `124px` with 16px vertical spacing; checked switches remain `44px` by `24px`.

## Text Content

- `Email Notifications`
- `Manage your email notification preferences`
- `Transcription Success Notifications`
- `Receive notifications when your audio transcription is complete`
- `Transcription Quota Reset Notifications`
- `Receive notifications when your transcription quota is reset`
- `Product Updates and New Features`
- `Receive notifications about product updates and new features`

## Responsive Behavior

- Desktop: row text remains on the left and switch on the right.
- Mobile: rows keep the same flex layout with a `124px` row height; long helper text wraps inside the left text stack.
