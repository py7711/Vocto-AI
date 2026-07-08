# Votxt Dashboard Page Topology

Target: https://www.votxt.co/dashboard
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
   - Create Folder and Rename Folder are centered dialogs with 40-character helper text.
   - Folder item menu contains Rename and Delete.
   - Account footer is a rounded user card with green avatar initials/image, display name, email, and chevron.
   - Account menu expands inline within the sidebar with Billing, Email Support, Discord, Settings, a compact Theme segmented control, and Sign out.

2. Promotion card
   - Discounted Yearly Basic Plan.
   - Upgrade Now and See All Plans controls.
   - Limited Time counter.
   - See All Plans opens a full-screen Plans & Pricing overlay with tabs, pricing cards, FAQ, and top-right Close.

3. Transcription toolbar
   - Title: All Transcriptions.
   - Search input placeholder: Search file name.
   - Default mode buttons: Upload Files, Paste Link, Bulk Actions.
   - Bulk mode replaces default actions with selected count, Move, Export, Delete, disabled Bulk Actions icon, and Cancel.

4. Transcription table
   - Columns: Name, Duration, Created, Type, Folder.
   - Default mode has row-level action buttons at the far right.
   - Row action menu contains Share, Export, Rename, Move, and Delete Transcription.
   - Share, Rename, Move, and Export are centered dialogs.
   - The captured logged-in rows use `S` in the Type column, including pasted media/link transcriptions.
   - Bulk mode exposes checkboxes in the header and each row.
   - Bulk mode shows Move, Export, Delete, a disabled icon action, and Cancel.
   - Rows link to `/transcriptions/<id>`.

5. Upload workflow
   - Upload Files is a button that navigates to `/upload`, where the full upload workflow replaces the main area while the dashboard sidebar remains.
   - Breadcrumb: Dashboard / Upload Files.
   - Header includes a `Recent Files` icon action.
   - Dropzone copy: `Drag and drop files here`, `OR`.
   - Actions: Select files from your device, Paste Link, Google Drive.
   - Upload-page Paste Link opens a centered Media Link Transcription dialog with supported-platform chips, `Paste a media link` input, and `Search`.
   - Google Drive starts OAuth when the account is not connected.
   - Supported formats and limits are shown below: audio/video format lists, max 50 files, max 5GB per file.

6. Settings workflow
   - Uses dashboard sidebar plus a settings navigation column; no public marketing header is present.
   - Navigation tabs: Profile, Account Security, Usage, Preferences, API Keys, Notifications, Integrations, Danger Zone.
   - Settings navigation is an unframed vertical button list; selected items are purple and Danger Zone is red when inactive.
   - Main settings sections are stacked large cards with light gray title headers and white content bodies.
   - Profile contains a large green avatar, display name, first/last name fields, and a right-aligned Save button.
   - Account Security contains sign-in method cards, Change Email Login Address, and Set or Change Password.
   - Account Security sign-in methods are nested in a bordered sub-card with compact method rows and status pills.
   - API Keys uses the `#api` hash/section id and is gated: free users see an upgrade prompt, while non-FREE active/trialing/past_due/incomplete subscriptions and LTD activations can manage keys.
   - Integrations Google Drive disconnected state shows a single Connect action.

7. Transcription detail workflow
   - Header action order: back, title, source/open icon when present, share icon, More actions, Export.
   - Share is a dedicated icon action and opens `Share Transcription`.
   - More actions menu is limited to Rename, Move, and Delete Transcription.
   - Main content is transcript on the left and a tabbed Summary/Mind Map insight column on the right.
   - Completed transcript content is a plain timestamped reading list with an icon-only transcript toolbar and an inline star rating row.
   - Speaker-recognition details appear as a small floating note anchored to the speaker icon.
   - The detail page does not use the dashboard sidebar.
   - Media playback and the upgrade affordance are fixed at the bottom of the viewport, not embedded above the transcript.

8. Pricing page
   - Uses the public marketing header and footer rather than the dashboard sidebar.
   - Hero title is `Affordable Pricing`.
   - Billing mode tabs: One-Time, Monthly, Annual Save 40%.
   - Plan feature lists use `Transcription available in 63 languages`.
   - AI translation and AI Insights features carry `More information` icon buttons plus `New` badges.
   - Paid plans expose `API access` as a `/docs` feature link.
   - FAQ section is a centered accordion list; questions are collapsed until clicked.

9. OpenAPI docs page
   - Uses the public marketing header and footer.
   - Main layout is a long documentation article with a left sticky table of contents and right content column.
   - Hero heading: `Votxt OpenAPI Documentation (Beta)`.
   - Sections include overview, base URL, API key authentication, file upload workflow, detailed endpoints with request/response examples, status values, webhook notifications, error handling, supported formats, language support, integration examples, best practices, and support.
