# LanguageSwitcher Specification

## Overview
- Target file: `src/components/site-shell.tsx`
- Reference screenshots:
  - `/Users/gxx/.codex/attachments/c2bf3186-fe65-4a14-94f9-d267be2cb8ef/image-1.png`
  - `/Users/gxx/.codex/attachments/c2bf3186-fe65-4a14-94f9-d267be2cb8ef/image-2.png`
  - `/Users/gxx/.codex/attachments/c2bf3186-fe65-4a14-94f9-d267be2cb8ef/image-3.png`
- Interaction model: click-driven dropdown; closes on outside click, Escape, or link navigation.

## DOM Structure
- Relative root wrapper.
- Trigger button/summary:
  - Globe icon.
  - Current locale native name.
  - Down chevron.
- Dropdown panel:
  - Absolute positioned below header trigger, aligned to the trigger's right edge.
  - Scrollable list of 20 locale links in the canonical order:
    `en, id, ru, es, vi, ar, pt, fr, zh, zh-TW, de, it, th, uk, tr, ja, nl, pl, ko, hu`.
  - Each locale item has native name on first line and English name on second line.
  - Current locale uses violet text and a check icon aligned to the right.

## Computed Styles From Reference Images

### Trigger
- display: inline-flex
- align-items: center
- gap: approximately 18px between icon/text/chevron group
- background: transparent
- border: none
- color: rgb(2, 8, 23)
- font-size: approximately 29px
- font-weight: 700
- line-height: approximately 36px
- padding: 0
- globe icon: approximately 30px
- chevron icon: approximately 28px

### Dropdown Panel
- width: approximately 574px
- background: rgb(255, 255, 255)
- border: 1px solid rgb(214, 221, 235)
- border-radius: 8px
- box-shadow: none or very subtle
- padding-left/right: 25px
- padding-top/bottom: 16px
- max-height: viewport-bound and scrollable
- position: absolute, right aligned with trigger, top offset about 20px below trigger

### Locale Item
- min-height: approximately 104px
- display: flex
- align-items: center
- justify-content: space-between
- padding: 10px 0
- native name font-size: 28px
- native name font-weight: 700
- native name line-height: 34px
- English name font-size: 25px
- English name font-weight: 500
- English name line-height: 31px
- English name color: rgb(100, 116, 139)
- active color: rgb(100, 103, 242)
- active check icon: approximately 28px, rgb(100, 103, 242)

## States & Behaviors

### Closed
- Only trigger visible.
- Chevron points down.

### Open
- Dropdown visible.
- Chevron rotates 180 degrees.
- Outside mousedown and Escape close the dropdown.

### Hover
- Locale item background becomes a very subtle off-white, without changing item size.

## Responsive Behavior
- Desktop: full trigger with current native name.
- Mobile: compact current locale code in trigger; dropdown width constrained to viewport with same item typography scaled down enough to avoid clipping.
