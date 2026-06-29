# UniScribe Dashboard Page Topology

Target: https://www.uniscribe.co/dashboard
Captured after email/password login on 2026-06-29.

## Desktop Layout

- Left sidebar, fixed visual column around 299px wide.
- Main workspace starts around x=315px with a full-width content area.
- Header row in the workspace contains the page title, search input, primary upload actions, and the bulk action toggle.
- Optional promotion card sits above the transcription table for free users.
- Transcription table is the primary working surface.

## Sections

1. Logo and account sidebar
   - Logo links to dashboard.
   - Current Plan card shows Free, daily quota, monthly minutes, and Upgrade Plan.
   - Dashboard nav item.
   - Folders area with create/edit controls and Uncategorized item.
   - Account footer with avatar/name/email and settings menu.

2. Promotion card
   - Discounted Yearly Basic Plan.
   - Upgrade Now and See All Plans controls.
   - Limited Time counter.

3. Transcription toolbar
   - Title: All Transcriptions.
   - Search input placeholder: Search file name.
   - Default mode buttons: Upload Files, Paste Link, Bulk Actions.
   - Bulk mode replaces default actions with selected count, Move, Export, Delete, disabled Bulk Actions icon, and Cancel.

4. Transcription table
   - Columns: Name, Duration, Created, Type, Folder.
   - Default mode has row-level action buttons at the far right.
   - Bulk mode exposes checkboxes in the header and each row.
   - Rows link to `/transcriptions/<id>`.

5. Upload workflow
   - Upload Files opens a full upload workflow in the main area on the live site.
   - Breadcrumb: Dashboard / Upload Files.
   - Actions: Recent Files, Select files from your device, Paste Link, Google Drive.
   - Supported formats and limits are shown below.

