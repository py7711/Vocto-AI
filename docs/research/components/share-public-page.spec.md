# Public Share Page Specification

## Overview
- **Target file:** `src/components/share-page.tsx`
- **Supporting files:** `src/components/share-export-links.tsx`, `src/components/shared-translation-panel.tsx`
- **Interaction model:** static read-only transcript page with click-driven export option toggles and translation language dropdown.

## DOM Structure
- Sticky top header with back icon, truncated title on desktop, and Export anchor.
- Main content constrained to `max-w-6xl` with title metadata, optional rating summary, media player, transcript body, insights grid, translation panel, and export panel.
- Export panel reuses the same target-style compact checkbox controls as the logged-in transcription detail export panel.
- Translation panel reuses the same target-style compact button dropdown as the logged-in export and transcription settings controls.

## States & Behaviors
- **Export options:** speaker names and timestamps are role `checkbox` buttons, 16px square, violet border, white unchecked state, violet filled checked state with check icon.
- **Translation selector:** button-triggered listbox with compact 36px trigger, slate border, white background, chevron rotation, selected item check icon, and no native `<select>`.
- **Export links:** generated URLs include `showSpeaker`, `showTimestamp`, `subtitleMaxChars`, and `subtitleMaxDurationSeconds` query parameters.
- **Read-only transcript:** timestamp buttons dispatch media seek events through the shared media player.

## Responsive Behavior
- **Desktop:** transcript stacks above a three-column insights/export grid.
- **Mobile:** header keeps compact icon controls; transcript segments collapse from two columns to one column; insights/export panels stack vertically.

## Local Parity Notes
- Updated on 2026-07-01: public share export controls now match the logged-in target-style export controls instead of browser-native violet-accent checkboxes.
- Updated on 2026-07-01: public share translation locale selection now uses the target-style compact dropdown instead of a browser-native select.
- Updated on 2026-07-01: public share summary bullets support both legacy string bullets and current `{text, timestamps}` insight entries, matching the logged-in detail page's tolerant summary rendering.
