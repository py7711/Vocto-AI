# Auth Secondary Flows Specification

## Overview
- Target file: `src/components/auth-pages.tsx`
- Routes: `/en/auth/signup`, `/en/auth/forgot-password`, `/en/auth/reset-password`
- Target URLs: `https://www.votxt.co/auth/signup`, `https://www.votxt.co/auth/forgot-password`, `https://www.votxt.co/auth/reset-password`
- Interaction model: form-driven auth flows. Target inspection was read-only; no target signup, reset request, or password reset was submitted.

## Shared Target Shell
- Page background: white.
- Content column: fixed `286px` width, horizontally centered. No card, border, shadow, or lavender panel.
- Logo: `180px` x `42px`, centered, links to home.
- Typography: title `24px / 32px`; Forgot/Reset titles use `font-weight: 700`, while Signup uses `font-weight: 600`; body helper copy `16px / 24px`.
- Inputs: `286px` x `40px`, border `1px solid rgb(226,232,240)`, radius `6px`, padding `8px 12px`, `font-size: 14px`.
- Primary buttons: `286px` x `40px`, background `rgb(100,103,242)`, radius `6px`, `font-size: 14px`, `font-weight: 500`.
- Violet links: `rgb(100,103,242)`, `14px / 20px`, normal weight.

## Signup
- Desktop 1280x720 target:
  - Logo: x `550`, y `125`, width `180`, height `42`.
  - Title text: `Sign Up`; appears as heading text at x `497`, y `207`, width `286`, height `32`.
  - Google button: x `497`, y `255`, width `286`, height `52`.
  - Divider text: `Or sign up with email`; x `497`, y `323`, height `20`.
  - Email input: x `497`, y `391`, width `286`, height `40`, placeholder `Enter your email`.
  - Continue button: x `497`, y `447`, width `286`, height `40`.
  - Account switch: text `Already have an account? Sign In`.
  - Legal copy uses `12px / 16px` and links to Terms of Service and Privacy Policy.
- Mobile 390x844 target:
  - Column x `52`.
  - Logo y `187`, title y `269`, Google y `317`, input y `453`, Continue y `509`.
- Local note: the first email step matches target. The later profile/password step is retained to complete the local registration business flow after the target-style email step.
- Local parity rechecked on 2026-07-02 at 1280x720: Signup first step now aligns to the target fixed `286px` auth column. Local measured logo/title/Google/email/Continue y positions are `127/209/257/389/445` versus target `124.97/207.03/255.03/391.03/447.03`; colors now resolve to `rgb(2,8,23)`, title weight is `600`, and the divider text matches target capitalization `Or sign up with email`.

## Forgot Password
- Desktop 1280x720 target:
  - Logo: x `550`, y `189`, width `180`, height `42`.
  - Title: `Forgot Password`, x `497`, y `271`, width `286`, height `32`.
  - Subtitle: `Enter your email to reset your password`, top y `311`.
  - Email input: x `497`, y `375`, width `286`, height `40`, placeholder `Email`.
  - Submit: `Send Reset Link`, x `497`, y `431`, width `286`, height `40`.
  - Back link: `Back to Sign In`, x `497`, y `487`, width `286`, height `20`.
- Mobile 390x844 target:
  - Column x `52`.
  - Logo y `251`, title y `333`, input y `437`, submit y `493`, back link y `549`.
- Local behavior preserved: form posts to `/api/auth/forgot-password`; success and development reset link states remain available below the target-matched base controls.
- Local parity rechecked on 2026-07-02 at 1280x720: Forgot Password matches target geometry within rounding, with logo/title/email/submit/back-link y positions `189/271/375/431/487`, target foreground `rgb(2,8,23)`, and unchanged `/api/auth/forgot-password` submission behavior.
- Local reset-link business flow rechecked on 2026-07-02: `/api/auth/forgot-password` now builds development reset links from the current request origin, returning `http://127.0.0.1:3005/en/auth/reset-password?token=...` on the active local dev server instead of the `NEXT_PUBLIC_APP_URL` default port.

## Reset Password
- Desktop 1280x720 target:
  - Logo: x `550`, y `191`, width `180`, height `42`.
  - Title: `Reset Password`, x `497`, y `273`, width `286`, height `32`.
  - Subtitle: `Enter your new password below`.
  - Password inputs: `New Password` at y `353`; `Confirm New Password` at y `409`; both `286px` x `40px`.
  - Submit: `Reset Password`, y `465`, `286px` x `40px`.
- Mobile 390x844 target:
  - Column x `52`.
  - Logo y `253`, title y `335`, inputs y `415` and `471`, submit y `527`.
- Local behavior preserved: the local route still validates token presence, requires matching passwords, posts to `/api/auth/reset-password`, and shows a dashboard link on success.
- Local parity rechecked on 2026-07-02 at 1280x720: Reset Password matches target geometry within rounding, with logo/title/password/confirm/submit y positions `191/273/353/409/465`, target foreground `rgb(2,8,23)`, and unchanged token/password validation behavior.

## Implementation Notes
- Forgot and reset pages now use the same target white `286px` shell as target, removing the previous card, lavender background, border, and shadow.
- Signup first step uses target sizing, title case, divider text style, normal-weight links, and target legal copy sizing.
- Submit buttons explicitly use `type="submit"` to preserve form submission semantics.
- Local parity rechecked on 2026-07-02: the English reset-password subtitle remains aligned with the captured target copy `Enter your new password below` with no trailing period inside the visible text.
- Local parity updated on 2026-07-02: Signup, Forgot Password, and Reset Password use a relative `top:-12px` offset instead of Tailwind translate utilities because `animate-fade-up` owns the computed transform; this restores the target vertical positions without changing form submission logic.
