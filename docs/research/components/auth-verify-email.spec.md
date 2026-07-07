# Auth Verify Email Specification

## Overview
- Target file: `src/components/auth-pages.tsx`
- Route: `/en/auth/verify-email`
- Target URL: `https://www.uniscribe.co/auth/verify-email`
- Interaction model: form/status driven. Target inspection was read-only; no resend email action or token verification was submitted on the target site.

## Target No-Token State
- Viewport measured at `1280x720`.
- Page background: white.
- Center card: x `448`, y `119.97`, width `384`, height `480.06`, padding `24px`, border `1px solid rgb(226,232,240)`, radius `8px`, white background, `shadow-sm`.
- Inner content width: `286px`.
- Logo link: x `550`, y `144.97`, width `180`, height `42.06`, links to `/`.
- Mail icon: x `616`, y `227.03`, width `48`, height `48`, color `rgb(100,103,242)`.
- Heading: `Verify your email`, x `497`, y `291.03`, width `286`, height `32`, `24px/32px`, weight `600`, color `rgb(2,8,23)`.
- Body copy: `We've sent a verification email to your inbox. Please click the link in the email to verify your account.`, x `497`, y `339.03`, width `286`, height `60`, `14px/20px`, color `rgb(100,116,139)`.
- Primary button: `Resend verification email`, x `497`, y `415.03`, width `286`, height `40`, violet background `rgb(100,103,242)`, radius `6px`, `14px/20px`, weight `500`.
- Back button/link: `← Back to Sign In`, x `497`, y `455.03`, width `286`, height `40`, white background, slate-200 border, violet text, radius `6px`, directly below the resend button.
- Footer helper: `Didn't receive the email? Please check your spam folder.`, x `497`, y `511.03`, width `286`, height `40`, `14px/20px`, color `rgb(100,116,139)`.

## Local Behavior
- No-token local route now matches the target no-token visual state and does not call the verification API.
- Token-bearing local route preserves the existing business flow: it posts `{token, locale}` to `/api/auth/verify-email`, sets the session cookie on success, and shows success or failure status in the target card shell.
- `Resend verification email` now calls local `/api/auth/resend-verification` for the current authenticated user. The endpoint creates a fresh 24-hour email verification token, sends via the existing `sendVerificationEmail` adapter, and returns a development verification link when email delivery is not configured.
- Local email/reset link generation now derives the app origin from the current request host/proto before falling back to `NEXT_PUBLIC_APP_URL`, so development links on the `3005` dev server point to `http://127.0.0.1:3005/...` instead of the default `localhost:3000`.
- Local no-token parity rechecked on 2026-07-02 at `1280x720`: card/logo/icon/title/body/resend/back/helper y positions are `120/145/227/291/339/415/455/511`, matching target within rounding.
- Local invalid-token branch rechecked on 2026-07-02: the page starts in `Verifying email...`, then settles to `Email verification failed` with API copy `The email verification link is invalid or expired.` while staying inside the same target card shell.
- Local resend flow rechecked on 2026-07-02: after local UI login as `gxx961208@gmail.com`, clicking `Resend verification email` on `/en/auth/verify-email` shows `Verification email sent. Please check your inbox.` and an `Open verification link` anchor with a `http://127.0.0.1:3005/en/auth/verify-email?token=...` href. Unauthenticated API calls return `401` with `Please sign in first.`

## Responsive Behavior
- The target card is centered in the viewport at desktop.
- Attempted target mobile capture on 2026-07-02 did not produce a reliable mobile viewport; the page still reported `1280x720`, so target mobile geometry remains uncaptured.
- Local 390x844 check on 2026-07-02: the fixed `384px` card remains centered with x `3`, y `182`, and the `286px` inner content starts at x `52`, so the target desktop card shell does not visually break on narrow screens.
