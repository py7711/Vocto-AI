# Media Player Specification

## Overview
- **Target file:** `src/components/media-player.tsx`
- **Related pages:** `src/components/transcription-page.tsx`, `src/components/share-page.tsx`
- **Interaction model:** click-driven playback controls with native media element hidden behind custom target-style controls.

## DOM Structure
- Hidden `<audio>` or `<video>` element receives the resolved media URL.
- Visible controls render as a compact row:
  - current time
  - 15-second skip back
  - purple play/pause button
  - 15-second skip forward
  - custom progress track with transparent native range input overlay
  - duration
  - volume/mute icon control
  - playback speed label `1x` in bottom-bar mode
- Card mode, used by public share pages and embedded media cards, renders the same custom progress model and a compact custom volume track.

## States & Behaviors
- **Play/pause:** clicking the central control calls the hidden media element's play/pause methods and reflects media `play`, `pause`, and `ended` events.
- **Seek:** timestamp controls dispatch `media-player:seek`; the player sets `currentTime` and attempts playback.
- **Progress track:** the visible track is a 6px rounded rail with violet fill; the native range input is transparent and only provides pointer/keyboard interaction.
- **Volume:** the volume icon toggles between full volume and muted. The visible volume rail is a custom 6px rounded rail with violet fill and a transparent native range overlay.
- **Loading/error:** loading and error copy appears below the controls without changing the main control row geometry.

## Responsive Behavior
- **Desktop detail bar:** progress and mute controls are visible in `xl` view, matching the target bottom player row.
- **Mobile detail bar:** desktop progress and volume controls are hidden; the compact current time, skip, play, skip, and duration row remains.
- **Card/public share mode:** compact seek and volume tracks remain visible when space allows and wrap with the control row.

## Local Parity Notes
- Updated on 2026-07-01: card-mode volume no longer exposes a browser-styled `accent-violet` range. It now uses the same target-style custom rail plus transparent native range overlay as the seek control, and the volume icon is an actual mute/unmute button.
