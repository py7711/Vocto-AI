# UniScribe Dashboard Behaviors

Target: https://www.uniscribe.co/dashboard
Captured after email/password login on 2026-06-29.

## Default Dashboard

- Search input filters by file name.
- Upload Files starts the upload workflow and disables the dashboard toolbar while switching.
- Paste Link opens the link-upload path.
- Row names navigate to transcription detail pages.
- Row action buttons expose per-transcription management actions.

## Bulk Actions

- Clicking Bulk Actions enters bulk mode.
- Bulk mode text shows the current selected count, for example `0 items selected`.
- Move, Export, and Delete are disabled until at least one row is selected.
- Header and row checkboxes appear only in bulk mode.
- Cancel exits bulk mode and returns to default toolbar controls.

## Sidebar

- Folder create and account controls are icon buttons.
- Uncategorized is shown as the default folder.
- Current Plan shows daily and minute quotas with progress bars.

## Responsive Notes

- Desktop at about 1454px uses a two-column dashboard.
- The existing local implementation already contains a mobile upload layout and stacked dashboard affordances; this pass focused on matching the desktop dashboard interaction model.

