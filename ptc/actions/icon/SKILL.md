---
name: icon
description: Make, try or replace the effect's Effect House ICON — the square picture
  TikTok shows for it, uploaded with the package at submission. "make an icon for
  this effect", "try the icon on a cat and on a person and let me pick", "use Effect
  House's stock person model", "move the crop a bit to the left", "use this photo as
  the icon", "draw me an icon of a neon tile".
  effect_icon_set only; no authoring skill needed.
---
# icon — the picture TikTok shows for the effect

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

Call `effect_icon_set` for the current effect project — the one the engine has
open; pass `project` (its directory) only to name another one. Every result
attaches the icon as an image; a call that captures a new frame (the preview, a
clip, an icon model) also attaches that frame. The text never carries a picture.

| what they said | call |
|---|---|
| "make an icon for this" / nothing else | `{}` — the frame the preview shows now |
| "put it on a face / a hand / a cat" | `{clip: "turnhead"}` — staged footage |
| "use Effect House's stock person / pet model" | `{source: "template"}`, then see **Icon models** |
| "try a few and let me pick" | 2–4 tries with `apply: false`, then see **Let me pick** |
| "move the crop" / "zoom in" | `{source: "recrop", captureId, crop}` — see **Move the square** |
| "use this picture / that photo" | `{file: "<path>"}` |
| "draw me an icon of X" | `{prompt: "X"}` |
| "remove the icon" | `{source: "clear"}` |

Clip ids (the ids `preview_set_clip` takes): `idle`, `nodding`, `openmouth`, `raiseeyebrows`, `turnhead`, `hand`, `twoperson`, `ground`, `road`, `ceiling`, `dancing`, `cat`, `dog`.
Those are family aliases; `preview_set_clip` without a clip also lists the engine's whole catalog by id (face_idle_3, hand_fingerheart, env_sofa, …), and any of those ids works here too.

Environment clips are ground, road and ceiling, resolved from the engine's built-in catalog.
Call `preview_set_clip` without a clip to check local availability before choosing one.
The Studio offers only installed or engine-downloadable footage; selection prepares remote footage through the engine.

- Face clips are `idle`, `nodding`, `openmouth`, `raiseeyebrows`, `turnhead`;
  `dancing` is the full body; `cat` and `dog` are the pets. There is no `pet`
  or `fullbody` clip. Pick footage the effect actually reads: a face effect on
  a face clip, a pet effect on `cat` or `dog`.
- An icon is **the effect running on someone** — that is what Effect House's own
  Create Icon does, which is why a clip or an icon model is usually the best
  answer. Both switch what the preview shows for a moment and put it back; say
  so if the user is watching.
- The default (`{}`) takes the frame the preview shows **right now** — the
  centre square, the crop Effect House's own icon tool takes. On "no engine is
  running this project", open the project first. If the effect's opening moment
  is not its best, drive it to a good one (`preview_interact`) first.
- `frameSource: "last-frame"` with a `note`: the engine was busy, so the icon
  was cut from the last frame the preview delivered. Say so.

## Let me pick — try, show, commit

1. Make 2–4 **tries** with `apply: false`: different clips, an icon model, a
   prompt. A try writes nothing; each answers its own image, a `captureId` and
   `use`.
2. Show them numbered (#1, #2, …) with one line each on how it reads at
   thumbnail size, and let the user choose.
3. Commit the chosen one with its `use` plus `apply: true` — for a plain try
   `{source: "capture", captureId: "<id>", apply: true}`. Never re-capture to
   commit: a new capture is a different picture.

**On a host that shows the icon card** the tries appear in it side by side:
let the user press 'Use this' there (the card commits exactly the cut it shows
and tells you the `captureId` and any recrop); do not commit a try after the
card has shown it unless the user asks in the chat. A try showing a recrop is
committed with its `use` (source "recrop" + crop), never with `captureId` alone.

Tries are kept **15 minutes** (the newest 12 per daemon). `capture_expired`
means: make that try again with `apply: false`, then commit the new
`captureId`. A try can be made on a project other than the one the Studio shows;
committing there needs `targetConfirmed: true`.

## Move the square (recrop)

A try cut from a frame (the preview, a clip, an icon model) reports `frame`
(`width`, `height` and `imageScale`, the scale of the attached frame image) and
`crop` (`x`, `y`, `size`): the square the icon shows, in **frame pixels**.
"Move it left", "closer on the face": `{source: "recrop", captureId, crop: {x, y,
size}, apply: false}` — a smaller `size` is closer. The square is kept inside
the frame, and the result's `crop` is the square actually cut: work from it, not
from what you asked. A recrop answers the new icon only (you have the frame
already). Its `use` is that recrop: commit with `apply: true` (committing the
bare capture would take the original centre square).

## Icon models

`{source: "template"}` with no `templateId` lists Effect House's icon-model
shelves (people, a group, scenery, pets, food) with their ids. `{source:
"template", templateCategory: "<shelf id>"}` lists that shelf's first 12 models,
numbered (`shownOf` says how many the shelf holds). Where the chat shows tool
images, a numbered cover sheet comes with it (`coverSheet` says so): the user
sees it, so name models by number. On the icon card the shelf shows as tiles
with covers: say one line and let the user pick there; do not list the models
again. Elsewhere there is no sheet and the titles
are file names: try two or three and judge their icons. Try one with
`{source: "template", templateId, templateType, apply: false}`, both from the
listing. The first use of a model downloads it (a few seconds).
`installable: false` means models cannot be installed here; its `note` says why
(no engine located).

## Judging

**Look at every icon at thumbnail size** — about 40 px in a carousel: one
subject, big, centred, strong contrast. Say whether it reads as this effect, and
offer another take when it does not, rather than reporting success and moving on.

## Painting (`prompt`)

One opaque 1:1 image. Write the prompt as a thumbnail: one subject, big,
centred, strong contrast; say what the effect DOES, not what its code is. The
result's `provider` says who painted it — `effect-house` is Effect House AIGC —
and `providerSetting` says where that is chosen; name both. The choice is not on
a page and not in a tool: on macOS it is the EHAI **menu bar** (Image generation
in Codex → Effect House AIGC or Codex built-in), on Windows the EHAI **tray
icon** (the same item), elsewhere the file `providerSetting` names. It only applies to Codex sessions; with no saved
preference Codex is the default. Give the location `providerSetting` states when the user asks to switch. With Codex chosen the
result says `actionRequired`: paint with your own image tool, then call
`imageGeneration.resume.tool` with `imageGeneration.resume.arguments` plus
`file: "<path>"`. Preserve its project and `apply` choice so a try stays a try.

**Where it lands** (report the path): `Icon/icon.png` inside the project,
576×576 — the file Effect House picks an icon up from, and the one the
submission wants (its gate: square, 162–1024 px, under 2 MB — all satisfied).
