---
name: projects
description: The user's effect PROJECTS on this machine — "what projects do I
  have", "open my rain project", "switch to the 2048 game", "make a new
  project called Rain Window", "save a version first", "give me the package",
  "record a demo clip", "what's running", "close the plugin".
  projects_list finds them; the eh kernel opens, creates, saves and records;
  studio_open only shows one; engine_stop closes them.
---
# projects — find, open, switch and create

> **Signed out?** Sign in before finding, opening or creating projects. If a
> tool answers `not signed in` (or `session
> EXPIRED`), do not send them to a terminal: call the `auth_login` tool — it
> shows a QR code in the chat that they scan with the TikTok app, then
> wait for the scan with `auth_login_status` until it reports `signedIn` and
> retry what they asked. Only if `auth_login` itself fails do you fall back to the CLI: run the
> command the refusal literally hands you plus `--no-wait --json` (normally
> `~/.ehai/runtime/current/bin/ehai login --no-wait --json`; on Windows
> `~/.ehai/runtime/current/bin/ehai.cmd login --no-wait --json`; not on PATH). It writes `ehai-login-qr.png` into the current
> directory and returns at once — show that image, end your turn, and when they
> say they scanned run the same command with `--wait`.

**The kernel moves, the Studio shows.** Your `eh` cells edit the project the
kernel has open. `studio_open` only shows a project to the user: it never moves
your kernel, so calling it alone after "switch to X" leaves you editing the old
project. Open and create in an `eh` cell, then show.

## Which project is which

`projects_list {query?, limit?}` lists the projects in the user's workspaces:
each with `name`, its absolute `path`, `workspace`, `savedAt`, `studioUrl` and,
when an engine holds it, `open` (with `thisSession`).

- One match → use it. Several → a numbered list (name, saved when, open or
  not) and ask. None → say so and offer the full list or a new project.
- `partial: true` means some folders were slow to read: the list may miss one.
- "What's open right now" → `studio_sessions` (open pages and engines).
- On a host that shows cards, the list is the projects card: let the user pick
  there. Its 'Work on this' sends you 'Switch to project <path>' and its
  'Create' sends 'Create a new project called "<name>"' — handle them with Open
  or switch / New project like any request. Its 'Show' opens that project's
  Studio with `studio_open`: it never moves a chat that already has a project,
  but a chat with no engine yet gets that project's engine (the card says so in
  the model context) — check `eh.project.status()` before editing.

## Open or switch

1. Resolve the absolute `path` with `projects_list {query: <name>}`.
2. In an `eh` cell, `eh.project.status()`. Opening and creating both refuse
   while `isSaved` is false (a project never saved, even an empty one) or
   `isChanged` is true: ask whether to save first. A project that has a folder
   saves in place with `eh.project.save()`; a never-saved one needs a folder,
   `eh.project.save({path: <current session folder>/<its name>})` — a bare
   `save()` refuses it.
3. `eh.project.open(<absolute path>)`, then `eh.project.describe()` before
   changing anything.
4. `studio_open {project: <path>}` to show it (the preview guide,
   `../preview/GUIDE.md`, has the entrance rules).
5. Check: `eh.project.status()` now reports the new `path`.

## New project

1. Ask for a name when the user gave none.
2. When the open project is unsaved (`isSaved` false or `isChanged` true), ask
   to save it first, as in step 2 of Open or switch.
3. `eh.project.create()`, then
   `eh.project.save({path: <current session folder>/<name>})`, unless the user
   chose another location (`projects_list` marks the session folder
   `isSessionFolder`).
4. When the save answers `autoRelocated: true`, a folder of that name already
   existed and the project went to `savedPath` instead: say so, and offer to
   open the existing project rather than keep a second one.
5. `studio_open {project: <saved path>}` to show it now, before building in it.

Never create a project with `studio_open`; creation is the kernel's.

## Saved versions

- `eh.project.snapshot(label)` saves and keeps a restore point outside the
  project. Take one when the user asks, or before a risky change they asked
  for. `eh.project.listSnapshots()` lists them, newest first.
- Restoring DISCARDS the unsaved changes and the undo history, and every handle
  you hold expires. Warn first, offer a snapshot of the current state, and only
  after a yes call `eh.project.restoreSnapshot(id)`; then read the project again.
- `eh.project.deleteSnapshot(id)` only on an explicit request: it cannot be
  undone.

## Package and demo video

- The .zip package: `eh.project.exportPackage()` (or `{file: <absolute path>}`)
  answers its `path` and size; give the path.
- A demo clip: pick the footage with `preview_set_clip`, then
  `eh.preview.record({durationSeconds, file: <absolute .mp4 path in the project folder>})`
  (at most 60 seconds) and give the path. The plugin cannot attach a demo
  video to an effect; do not send the person to an Effect House portal for it.

## Close the plugin

"Close the plugin", "quit EHAI", "free up my computer": save, close the Studio, stop the engines. Never delete, uninstall or sign out.

1. `studio_sessions {}` lists Studio pages and engines. An engine another chat uses
   (`sessions` above 0, not `mine`): ask before closing it.
2. `eh.project.status()`: a never-saved project needs a folder first (Open or switch, step 2).
3. Close the Studio tab or side panel you opened (a shown tab reopens its project). Others:
   when the user asked to close the projects ("close them both"), add `closeTabs: true`
   to step 4, which sends their tabs to the Home first; otherwise ask about the tabs too.
4. `engine_stop {all: true}` (or `{project}` to spare one) saves, then stops each engine.
   Report `kept` as it says (chat never discards work); `page_open`: retry with `closeTabs`
   once the user agrees; `page_stayed`: the user closes or reloads that tab, then retry.
5. Say what closed. The background service, nearly idle now, quits about two minutes
   after the last Claude or Codex window closes (Quit EHAI in the menu bar or tray: now).
   Then call no `eh`, preview or studio tool unless asked: each starts an engine again.

## Engines, copies, rename, delete

- Engines stop themselves when idle; `studio_sessions` lists them, `engine_stop` stops one now.
- A copy: `eh.project.save({path: <new folder>})` — the open project then IS
  the copy; say so.
- Renaming or deleting a project folder is not available from chat.
