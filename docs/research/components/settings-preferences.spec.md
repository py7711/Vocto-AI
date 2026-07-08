# Settings Preferences Specification

## Overview

- Target file: `src/components/settings-page.tsx`
- Screenshot: `docs/design-references/votxt.co/settings-desktop.png`
- Interaction model: static preference cards with click-driven dropdown menus.

## DOM Structure

- `Preferences` is a bordered white settings card with a muted header.
- Body contains a two-column grid.
- Each preference option is a bordered row/card with:
  - Left text stack containing icon, title, and helper copy.
  - Right aligned menu trigger button.

## Computed Styles

### Card

- backgroundColor: `rgb(255, 255, 255)`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- desktop measured width: `628px`
- desktop measured height: about `328px`

### Header

- backgroundColor: `rgba(241, 245, 249, 0.5)`
- padding: `24px`
- measured height: about `102px`

### Preference Row/Card

- display: `flex`
- alignItems: `center`
- justifyContent: `space-between`
- border: `1px solid rgb(226, 232, 240)`
- borderRadius: `8px`
- padding: `16px`
- desktop measured size: about `277px` by `176px`

### Menu Trigger

- height: `40px`
- borderRadius: `6px`
- fontSize: `14px`
- fontWeight: `500`
- lineHeight: `20px`
- language width: about `133px`
- time zone width: about `142px`
- Target rechecked on 2026-07-02 at `/settings#preferences`: the language trigger uses `backgroundColor: rgba(0, 0, 0, 0)` and `border: 0px`; the time-zone trigger uses `backgroundColor: rgb(255, 255, 255)` and `border: 1px solid rgb(226, 232, 240)`.
- Local parity updated on 2026-07-02: `PreferenceMenu` supports a transparent trigger variant used only by Interface Language, preserving the bordered time-zone trigger.

### Language Menu

- Target measured on 2026-07-01 at 1280x720 after opening `Preferences`:
  - English trigger: `132.56px` by `40px`, at `x=772.44`, `y=277`.
  - Popper wrapper: `288px` by `360px`, at `x=617`, `y=390`, right edge aligned to the trigger's right edge (`905px`).
  - Content: white menu with slate-200 border, `6px` radius, `4px` padding, no visible shadow, `z-index: 50`, `max-height: 50vh`.
  - Items: first `English` row is `278px` by `36px`; localized rows with secondary English labels are `278px` by `52px`; item text is `14px/20px`, normal weight, `8px` padding.
- Local parity updated on 2026-07-01: the language menu now opens right-aligned to its trigger. It previously used `left-0`, placing the `288px` menu at the trigger's left edge and shifting it about `155px` too far right compared with target.
- Local rechecked on 2026-07-02: the language trigger renders at `133px` by `40px`, and the expanded menu renders `288px` by `360px` with right edge aligned to the trigger, `4px` padding, no visible shadow, and first rows at `278px` widths matching target measurements.
- Local parity verified on 2026-07-02 after transparent-trigger update: at `#preferences`, the trigger remains at y `195` with transparent/no-border styling; coordinate opening keeps the scroll anchor stable and renders the menu at y `245`, `288px` by `360px`.
- Target/local rechecked on 2026-07-02 at 1280x720: closed `Preferences` section is `628px` by `328px` at `x=620`, `y=0`; target language trigger is `132.56px` by `40px` at `x=772.44`, `y=195`, local is `133px` by `40px` at `x=776`, `y=195`; both use transparent background and `0px` border. Opening the language menu scrolls the section to `y=145`, keeps the trigger at y `340`, and renders a `288px` by `360px` right-aligned menu at y `390` with `278px` item rows and no visible shadow.

### Time Zone Menu

- Target measured on 2026-07-01 at 1280x720 after opening `Preferences`:
  - `Asia/Hong Kong` trigger: `142.4px` by `40px`, at `x=1063.6`, right edge `1206px`.
  - Popper wrapper: `280px` by `300px`, at `x=926`, right edge aligned to the trigger's right edge, `44px` below the trigger top.
  - Content: white menu with slate-200 border, `6px` radius, `4px` padding, no visible shadow, `overflow-y: auto`, `max-height: 300px`.
  - Search area: a `270px` by `56px` wrapper with `8px` padding; search input is `254px` by `40px`, `8px 12px` padding, 6px radius, 14px/20 normal text.
  - Items area: `270px` wide, `4px 0` padding. Each timezone row is `270px` by `32px`, `6px 8px` padding, 4px radius, 14px/20 normal text.
- Local parity updated on 2026-07-01: the time zone menu now includes the target search input and filters visible zones as the user types, while preserving the measured `280x300` right-aligned shell and `32px` row rhythm.
- Local rechecked on 2026-07-02: the time zone trigger renders at `142px` by `40px`, and the expanded menu renders `280px` by `300px` with right edge aligned to the trigger, `254px` by `40px` search input, and `270px` by `32px` rows.
- Target/local rechecked on 2026-07-02 at 1280x720: closed time-zone trigger is white with a `1px solid rgb(226,232,240)` border; target measures `142.4px` by `40px` at `x=1063.6`, `y=195`, local measures `142px` by `40px` at `x=1064`, `y=195`. Opening the menu scrolls the section to `y=145`, puts the trigger at y `340`, and renders the `280px` by `300px` menu at `x=926`, `y=384` with a `254px` by `40px` search input and `270px` by `32px` rows.

## Text Content

- `Preferences`
- `Manage your application preferences`
- `Interface Language`
- `Choose your preferred language for the application interface`
- `English`
- `Time Zone`
- `Select your time zone`
- `Asia/Hong Kong`

## Responsive Behavior

- Desktop: two equal columns with `24px` gap.
- Mobile: rows stack into one column with `24px` gap; menu trigger remains within the card and text wraps inside the left stack.
- Target/local mobile parity updated and verified on 2026-07-02 at `390x844` from `/settings#usage`: `Preferences` renders at `x=16`, `y=344`, `w=358`, `h=428`; body wrapper is `356px` by `324px`, inner grid is `308px` by `276px` with `24px` gap, language row is `308px` by `156px`, and time-zone row is `308px` by `96px`. `English` sits at `x≈199`, `y=529`, `133px` by `40px`; `Asia/Hong Kong` sits at `x≈190`, `y=679`, `142px` by `40px`.

## Settings Nav Interaction

- Target state at `/settings#preferences`: settings secondary nav is sticky with Profile/Usage/Preferences/API Keys/Notifications y positions `48/136/180/224/268`; `Preferences` is active purple.
- Local parity updated on 2026-07-02: direct hash entry initializes `active` from `window.location.hash`, nav button clicks replace the URL hash, and row `mt-1` spacing is applied by item index rather than active/inactive state so the y positions remain stable when different items are active.
- Local parity updated on 2026-07-02: all normal settings hashes now also scroll their corresponding section into the settings content scroller on direct entry or hashchange. This matches the mobile target behavior measured at `/settings#security`, where the Account Security card title lands near the viewport top (`y≈25`) instead of leaving the page at the Profile top.
