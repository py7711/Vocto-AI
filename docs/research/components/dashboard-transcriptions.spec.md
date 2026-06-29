# Dashboard Transcriptions Specification

## Overview

- Target file: `src/components/workspace/Workspace.tsx`
- Screenshot: `docs/design-references/uniscribe.co/dashboard-desktop.png`
- Interaction model: default browsing mode plus click-driven bulk mode.

## Live Content

- Heading: `All Transcriptions`
- Search placeholder: `Search file name`
- Default buttons: `Upload Files`, `Paste Link`, `Bulk Actions`
- Bulk buttons: `Move`, `Export`, `Delete`, `Cancel`
- Table columns: `Name`, `Duration`, `Created`, `Type`, `Folder`
- Rows per page: `10`

## Behavior

- Default mode shows normal row links and row action buttons.
- Bulk mode is entered by clicking `Bulk Actions`.
- Bulk mode shows selected count and row/header checkboxes.
- Bulk mode exits through `Cancel`, and after successful batch move/delete/export.
- Row folders display as text in default mode. Moving a row is available from the row action menu.

## Styles

- Live dashboard uses Inter, light mode, white panels, muted slate borders, and compact 32-40px controls.
- Local implementation maps these to existing Tailwind tokens: `bg-white`, `bg-paper`, `border-ink/10`, `text-ink`, `text-ink/55`, `violet`.

## Known Gaps

- The live Upload Files button switches the entire main area to the upload workflow; local dashboard currently opens an upload dialog while the dedicated `/upload` page provides the fuller workflow.

