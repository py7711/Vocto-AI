# Settings Profile Specification

## Overview
- Target file: `src/components/settings-page.tsx`
- Route: `/en/settings`, active tab `Profile`
- Target URL: `https://www.uniscribe.co/settings`
- Interaction model: logged-in settings workbench with static profile form and a Save action. Target QA was read-only; Save was not clicked.

## Page Shell
- Desktop 1280x720 target uses the logged-in dashboard shell.
- Sidebar: x `0`, y `0`, width `300px`, height `720px`.
- Main settings pane: x `300`, y `0`, width `980px`, height `720px`, `padding: 32px`, independently scrollable.
- Header Back button: x `332`, y `40`, `40px` square, transparent, `6px` radius, aria-label `Back`.
- Header title: x `388`, y `32`, `Settings`, `24px/32px`, `font-weight: 700`.
- Header subtitle: x `388`, y `64`, `Manage your account settings and preferences`, `16px/24px`, slate-500.

## Settings Navigation
- Split starts at x `332`, y `120`; nav width `256px`, content starts at x `620`.
- Buttons are `256px` by `40px`, `padding: 8px 16px`, `gap: 8px`, `font-size: 14px`, `font-weight: 500`, `line-height: 20px`, `border-radius: 6px`.
- Active `Profile`: background `rgb(100,103,242)`, white text.
- Inactive buttons: transparent with foreground text; `Danger Zone` uses red text.

## Profile Card
- Target card: x `620`, y `120`, width `628px`, height `437px`.
- Card styling: white background, `1px solid rgb(226,232,240)`, `8px` radius, `overflow: hidden`, subtle `0 1px 2px rgba(0,0,0,.05)` shadow.
- Header: x `621`, y `121`, width `626px`, height `102px`, `padding: 24px`, background `rgba(241,245,249,.5)`.
- Header title: x `645`, y `145`, `Profile`, `20px/28px`, `font-weight: 600`.
- Header title semantic tag: `h3`.
- Header description: x `645`, y `179`, `Manage your personal information`, `14px/20px`, slate-500, margin-top `6px`.
- Body padding: `24px`.

## Profile Body
- Avatar: target account image is x `645`, y `247`, `80px` by `80px`, source `https://lh3.googleusercontent.com/a/ACg8ocIqsiuzBf8BkPA-quJlus__fzdP0B6b4dBjSfEtJv740VFCYw=s96-c`.
- Display name: x `741`, y about `273`, `alx to`, `18px/28px`, `font-weight: 500`.
- Name fields:
  - Labels start y `376`, `14px/20px`, `font-weight: 500`.
  - First input: x `645`, y `404`, width `277px`, height `40px`, value `alx`.
  - Last input: x `946`, y `404`, width `277px`, height `40px`, value `to`.
  - Inputs use `border: 1px solid rgb(226,232,240)`, radius `6px`, padding `8px 12px`, `14px/20px`.
- Save button: target x `1134`, y `492`, width `89px`, height `40px`, purple background, `14px/20px`, `font-weight: 500`, radius `6px`.

## Local Parity Notes
- Local logged-in geometry matches target within 1px for card width, nav geometry, inputs, and Save button.
- Local profile card height is within a few pixels of the target and the profile content geometry matches the target card, inputs, and Save button.
- Local display name and name inputs match the target account values after logging in as `gxx961208@gmail.com`.
- Local parity updated on 2026-07-01: shared settings card descriptions now use target `14px/20px` slate-500 text with `6px` top spacing.
- Local parity updated on 2026-07-01: Profile now uses `user.image` or OAuth `avatarUrl` before falling back to initials, so the QA account renders the same 80px Google avatar image as the target instead of the green `al` initials.
- Local parity updated on 2026-07-01: shared settings card titles now render as semantic `h3` elements, matching the target while keeping the same `20px/28px` semibold styling.
- Target/local mobile Profile rechecked on 2026-07-02 at `390x844`: the target hides both the dashboard sidebar and settings section nav, uses a header wrapper at `x=16`, `y=16`, `358px` by `80px`, centers the Back control vertically at `x=16`, `y=36`, about `34px` by `40px`, and places the `Settings` title at `x≈66.4`, `y=16`. Local parity updated the mobile header to use centered alignment and a 34px Back control while preserving the desktop `40px` Back button at `x=332`, `y=40`; post-update mobile verification measured Back `x=16`, `y=36`, `34x40`, title `x=66`, `y=16`, and Profile card fields/Save within 1px of target.

## Safety
- Do not click `Save` during target parity QA unless explicitly testing account mutation.
- Do not change target profile data while measuring visual parity.
