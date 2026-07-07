# Peripheral Public Tools Specification

## Overview
- **Target files:** `src/components/youtube-subtitle-tool.tsx`, `src/components/appsumo-activation-page.tsx`
- **Interaction model:** click-driven form controls and submit actions.

## DOM Structure
- YouTube subtitle tool:
  - URL field and `Check subtitles` action.
  - Resolved video preview card.
  - Subtitle language dropdown, format dropdown, and `Download` action.
- AppSumo activation page:
  - Marketing header plus activation form.
  - Code input.
  - License tier radio group.
  - Activation result and submit action.

## States & Behaviors
- **Subtitle language:** target-style compact button dropdown with `role=listbox` options; no native `<select>`.
- **Subtitle format:** target-style compact button dropdown for `SRT` / `VTT`; no native `<select>`.
- **License tier:** native radio remains present for form semantics but is visually hidden; visible state uses a custom 16px circular radio indicator with violet selected dot instead of browser `accent-violet`.
- **AppSumo dashboard welcome:** after activation, the dashboard welcome tour is a logged-in modal flow. Its content is local product onboarding copy, but the outer modal chrome follows the target logged-in modal family: black/40 fixed overlay, no backdrop blur, `8px` rounded slate-200 bordered white shell, and no visible shell shadow.

## Responsive Behavior
- **Desktop:** YouTube controls stay in a three-column row when space allows; AppSumo activation form stays in the right column.
- **Mobile:** control groups stack vertically.

## Local Parity Notes
- Updated on 2026-07-01: remaining public-tool native controls were replaced with target-style select/radio visuals so global scans no longer find `<select>` or `accent-violet` in app components.
- Updated on 2026-07-02: AppSumo dashboard welcome modal no longer uses the older `bg-ink/45` blurred overlay or lifted shell; its outer treatment now matches the target logged-in modal family used by system notices, share, rename, move, export, settings, and Google Drive fallback dialogs.
