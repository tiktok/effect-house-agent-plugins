---
name: preview
description: Preview an effect in the persistent Studio sidebar (also right after a new project is created) or on a real phone through Effect House when explicitly requested. Use for preview, play, reopen, show the effect, phone preview, or scan to preview; do not create a replacement project.
---
# Preview an existing effect

Resolve the existing project from the workspace. Use tools
from this plugin consistently. A generic preview/play/reopen request uses the
persistent sidebar below; an explicit phone/TikTok/scan request uses the phone route.
Do not replace or regenerate the user's project merely to preview it.

## Persistent preview (default)

Right after creating and saving a new project (before building it), when the
project is open in the engine, or on an explicit user open/reopen request, call
`studio_open {}` for the current effect project (pass `project`,
its directory, only to name another one). Its `url` opens the live Preview. Use `entranceId` to reuse the same host sidebar/tab, including when
its URL has changed to the full editor. Check existing host tabs first; if
`hostAction` is `reuse`, do not navigate or focus that page. The Open Studio
button expands editing in that same document/session and keeps preview visible.

Use the host's actual sidebar/browser opening capability when available. If it
is unavailable or refuses, provide the returned URL as a clickable link and say
it was not opened. `opened:false` means only a URL was resolved, not host success.
Remember the entrance after first delivery. Further edits update it through the
existing session; do not call opening tools, create tabs, focus it, or issue a
replacement live card after each reply. If the user closes it, leave the link and
wait for an explicit reopen. Reopen the exact workspace/project, never an old
conversation card ID. A new project gets its own entrance.

Use `studio_open {surface:"studio"}` for an explicit editor request when no
live page exists; prefer the existing page's Open Studio button when it does.
If the user asks for an old plugin preview card, use `studio_open {}` and the
available host sidebar/browser entrance. Report accurately if the host cannot
open the URL. Do not manufacture an MCP App preview card.

## Verify and playtest through eh.preview, never the page

To check, playtest, reset or capture the effect, call `eh.preview.*` in an eh
cell (`interact`/`tap`, `reset`, `shot`, `record`, `reloadAndCapture`) or
`preview_interact` / `preview_screenshot`. Never drive the Studio page with a
browser or computer use: no dragging Inspector sliders, clicking reset or
playing it by hand. A stuck engine (`engine_stop` keeps it with
`unconfirmed_work`) restarts through the `discardUnconfirmed` receipt that
answer names, once the user agrees, never through the page's buttons.

## On a real phone, through TikTok

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

Call `effect_preview {}` for the current effect project. It exports the package
and asks Effect House for a preview link the phone opens.

Phone preview may be refused by Effect House's risk check (`blocked: true`,
code `risk_blocked`): it refuses the package, not the account; when it works,
`effect_preview` returns `previewUrl` with its QR code — show the QR code to
scan with TikTok on the phone, not the link (on a computer it opens a TikTok
web page). Where the host shows cards, the phone preview card under the call
draws the code full size and you show nothing yourself; elsewhere the code
comes as an image attached to the tool result where the host shows it,
otherwise `qrMarkdown` to render as an image in your reply, or `qrText` in a
fenced text block. Follow the result's
`next`, then tell the user: "Scan this QR code with the TikTok app on your
phone to preview the effect." On a refusal ("Package rejected due to risk")
say the risk check refused the package — never that phone preview is not
enabled for the account. Changing the package and retrying is unlikely to help:
the working path is previewing the effect in Effect House itself.

Report any other refusal with its actual error. A `logid` in the result is
private diagnostics: do not repeat it to the user. Do not promise that retrying
or changing the package will get past a refusal.

This is the real TikTok on-device path. For the studio's own live render, that is
`preview_screenshot` instead.
