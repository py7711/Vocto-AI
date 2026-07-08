# Auth Sign In Specification

## Overview
- Target file: `src/components/auth-pages.tsx`
- Route: `/en/auth/signin`
- Target URL: `https://www.votxt.co/auth/signin`
- Interaction model: form-driven email/password login, Google OAuth link, password visibility toggle, navigation links.
- Safety: target measurements were read-only; no target login submission was performed during this pass.

## Desktop Layout, 1280x720
- Page background: pure white, computed `rgb(255, 255, 255)`.
- Content is centered in a narrow `286px` column. No white card shell, no border, no shadow.
- Logo: x `550`, y `61`, width `180px`, height `42px`, links to home.
- Title: `Sign In`, x `497`, y `143`, width `286px`, height `32px`, `font-size: 24px`, `line-height: 32px`, `font-weight: 600`, centered.
- Google button: x `497`, y `191`, width `286px`, height `52px`, background white, border `2px solid rgb(226,232,240)`, radius `6px`, `font-size: 16px`, `line-height: 24px`, `font-weight: 500`, gap `8px`, text `Continue with Google`.
- Divider text: `or sign in with email`; target uses a compact divider between Google and email form.
- Email label: `Email`; input x `497`, y `327`, width `286px`, height `40px`, margin-top `8px`, padding `8px 12px`, border `1px solid rgb(226,232,240)`, radius `6px`, `font-size: 14px`, placeholder `Enter your email`.
- Password label: `Password`; input group target x `497`, y `415`, width `286px`, height `40px`, with right password visibility affordance. Input padding is effectively `8px 40px 8px 12px`, `font-size: 14px`.
- Submit button: x `497`, y `471`, width `286px`, height `40px`, background `rgb(100,103,242)`, white text, radius `6px`, `font-size: 14px`, `font-weight: 500`, text `Sign In with Email`.
- Forgot link: x around `564`, y `531`, `font-size: 14px`, normal weight, violet, text `Forgot your password?`.
- Signup row: y `567`, slate muted prefix plus violet `Sign Up` link.
- Terms copy: y `604`, max width `286px`, `font-size: 12px`, `line-height: 16px`, violet underlined links to Terms of Service and Privacy Policy.

## Mobile Layout, 390x844
- Same 286px column, centered at x `52`.
- Logo: x `105`, y `123`, width `180px`, height `42px`.
- Title: x `52`, y `205`, width `286px`, height `32px`.
- Google button: x `52`, y `253`, width `286px`, height `52px`.
- Email input: x `52`, y `389`, width `286px`, height `40px`.
- Password input: x `52`, y `477`, width `286px`, height `40px`.
- Submit button: x `52`, y `533`, width `286px`, height `40px`.
- Forgot link: y `593`; signup row: y `631`; terms copy starts at y `666`.
- Page does not scroll at target mobile height; `scrollHeight` equals viewport height.

## Local Implementation Notes
- `AuthPage` shell now uses the target white background, a `286px` centered column, and removes the previous white card, border, and lifted shadow.
- `GoogleButton`, `Divider`, and `SigninCard` were tightened to target heights, font weights, and borders.
- Email/password login behavior, password hashing, Google OAuth URL generation, `next` redirect handling, forgot-password navigation, and legal links remain intact.
- Signup, forgot-password, reset-password, and verify-email still reuse the auth shell, but only sign-in form internals were fully measured in this pass.
- Target/local rechecked on 2026-07-02: target sign-in logo/title/Google/email/password/submit/forgot/signup/terms y positions are `60.97/143.03/191.03/327.03/415.03/471.03/527.03/567.03/603.03`. Local now verifies at `61/143/191/327/415/471/527/567/603` at 1280x720.
- Target rechecked on 2026-07-02: the `Continue with Google` control is a `button`, not an anchor, while preserving the same OAuth start behavior. Local `GoogleButton` now renders a button and imperatively navigates to the existing Google OAuth URL.
- Local implementation note from 2026-07-02: sign-in uses relative `top: -12px` rather than Tailwind translate classes because `animate-fade-up` owns the computed transform. Email/password label groups include `4px` top padding and the forgot-password row is `24px` tall to match the target lower-form rhythm.
