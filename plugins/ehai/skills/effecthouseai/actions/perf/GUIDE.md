---
name: perf
description: Test how well an effect will run — "check
  performance", "will this run smoothly", "what's the FPS". Effect House predicts
  on-device FPS and memory and grades them. One effect_perf call.
---
# perf — will this effect run well

> **Signed out?** Every tool answers `not signed in` (or `session EXPIRED`) until
> the user has signed in. Do not send them to a terminal: call the `auth_login`
> tool — it shows a QR code in the chat that they scan with the TikTok app, then
> wait for the scan with `auth_login_status` until it reports `signedIn` and
> retry what they asked. Tell them, briefly and in their language, along these lines:
> "Using the EHAI plugin requires signing in — scan this QR code with the TikTok app."
> Only if `auth_login` itself fails do you fall back to the CLI:
> run the command the refusal literally hands you plus `--no-wait --json`
> (normally `~/.ehai/runtime/current/bin/ehai login --no-wait --json`; on Windows
> `~/.ehai/runtime/current/bin/ehai.cmd login --no-wait --json`; it is not on PATH).
> It writes `ehai-login-qr.png` into the current directory and returns at once —
> show that image to the user, end your turn, and when they say they scanned run
> the same command with `--wait`. Nothing else works until they are signed in.

Call `effect_perf {}` for the current effect project — the one the engine has
open. It exports the package, sends it to Effect House's performance-prediction
backend, and returns:

- an overall **grade** (pass / at_risk / fail),
- **fps** — predicted frames per second vs the passing threshold,
- **memory** — predicted MB vs the ceiling,
- the package size.

When `unpredictable` lists features, the predictor has not been tested on them:
say the numbers may be inaccurate and name those features.

Report the grade and the numbers in the user's words. A **fail** or **at_risk**
means the effect is too heavy for the target devices — the fix is to simplify:
fewer entities, smaller/fewer textures, less post-processing. Re-run after
trimming to confirm it moved to pass.

Read-only: it uploads a build to the predictor, it does not change or submit the
effect.
