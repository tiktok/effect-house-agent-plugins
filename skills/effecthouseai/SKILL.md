---
name: effecthouseai
description: Make, preview, tune and publish TikTok effects and mini-games with EffectHouse AI; see how published effects are doing (views, reviews, badge, earnings), share or edit them; find trends, challenges, sounds, library assets and 3D models; list, open or create effect projects; close the plugin to free CPU and GPU. Use for effect projects in any language the user writes in, not for developing the plugin itself.
---
# EffectHouse AI

Turn the user's request into an Effect House result. Choose the relevant guidance
yourself; the user does not need to select a technical topic or another skill.

Before the first EHAI task in a conversation, call `studio_sessions {}` to check
the session. If sign-in is required, call `auth_login` once for the code and wait
for the scan with `auth_login_status` before project, preview or account work.
An existing valid session needs no login announcement.

## When the EHAI tools are not available

Both EHAI servers run on Node.js 20 or later, so check it before anything else:
run `node --version` once. Do not search this machine for another cause, look for
or switch to another Node, or start the EHAI daemon or engine yourself: one started
from this conversation's shell inherits its sandbox, and the engine then fails.

- Node 20 or later, on a Mac: the app has not loaded the plugin, or does not see this
  Node. Run `sh ../../scripts/setup.sh` as below once, then pass on what it says.
- Node 20 or later, on Windows: tell the user to quit and reopen the app, then start
  a new conversation.
- Missing or older, on Windows: tell the user to install the current LTS from
  nodejs.org, then quit and reopen the app and start a new conversation.
- Missing or older, on a Mac: run `sh ../../scripts/setup.sh`, resolving the path
  relative to this file. It needs network access and writes to `~/.ehai` and the
  login profile, so request that outside any sandbox. Do what its last line says:
  `RUNNING` means report the progress and run it again about 30 seconds later,
  `READY` and `FAILED` tell you what to say to the user.

## When the user is new or asks what EHAI can do

Answer in the user's language with a short tour, not a tool list: EHAI builds an
Effect House effect from a description in the real engine, shows it in a live
preview (and on their phone), adds sliders to tune it, and publishes it to their
account; it also reports how their published effects are doing and finds trends,
challenges, sounds and assets. Offer two or three concrete starters fitted to the
request, for example "a sticker that follows my face", "makeup that changes when I
open my mouth", "a mini-game where I catch falling stars with my hand". Never ask
the user to pick a server, tool or internal skill; the two MCP servers (`eh` for
authoring, `ehai` for the engine, preview, sign-in and publishing) are yours to use.
Codex lists them as EHAI (`eh`) and EHAIPlugin (`ehai`); these documents use the short names.

## Create or change an effect

When starting effect work, read the workspace guide: `AGENTS.md` at the root of
the PTC workspace the `eh` kernel serves. It owns project selection, the
authoring workflow and verification. The workspace comes with the Effect House
engine, not inside this plugin: one `eh` cell,
`return (await eh.knowledge.listSkills()).skillsRoot`, names its `skills`
folder, and the workspace is the folder that holds it. Read the guide and every
path it names there, by absolute path. While the `eh` server offers only
`ehai_installing`, the engine is still downloading; the guides appear once it
is ready. Where the guide names a kernel tool by its full host name (ending in
`__run`, `__status` or `__reset`), use the `eh` server's `run`, `status` or
`reset`. The workspace contains reference material, not user projects. Save new projects under the
current session folder unless the user chooses another location. Load this
guidance only for effect work; ordinary chats need no EHAI startup context.

Use the `eh` server's `run` tool for authoring. Its cells expose `eh` and `session`.
For capability guidance, call `eh.knowledge.listSkills()` and read only the relevant
entries under the returned `skillsRoot`. Physics, tracking, materials and other
topics are internal guidance, not extra commands the user must invoke.

When the user wants to make an effect but has no clear idea, or asks for ideas
or what is trending, offer trends first (`trends_list`, the ideas guide); a
picked trend is the brief, and its id goes in at publish. Do not show trends
when submitting: the publish guide only fills in one that fits.

For a new effect, show the preview as soon as the project exists: right after
`eh.project.create()` and its first save, call `studio_open {project: <saved path>}`
and open it as the preview guide says, before building anything, so the user
watches the effect take shape instead of waiting for a finished result.

For an existing project, inspect the requested part and preserve unrelated content.
Do not create a replacement merely to edit or preview it. After a visible change,
verify it in the real engine preview and follow the preview guide below to show it.

Leave no leftovers. When a change replaces something (a new sticker for an old one, a
rebuilt object, a regenerated texture), delete what it replaced in the same change: the
old scene objects, and any asset nothing references any more. Before you call the
change done, list the scene and assets for what your own work left unused, such as
earlier attempts, hidden copies, or imports you did not use, and remove them. Never
remove what the user made or anything still referenced; when unsure, ask.

### Adjustments after a change

Once the change is verified, decide whether the effect has dials a creator would
want to tune: a look's strength, a colour, a pace, a size. If it does, publish or
update its AI Controls through the controls guide without being asked, so every
edit leaves the Adjustments drawer in step with the effect: add a dial for a new
dimension (hair dye adds a hair colour), and rebind or clear one the edit made
stale. If it does not (a fixed sticker, a one-shot trigger, nothing that reads as
a dial), publish none and do not mention controls. Never pad the drawer to have
one; a dial must change the preview visibly.

## Other requests

Read only the guide that matches the requested outcome:

| Request | Guide |
|---|---|
| Open, play, reopen, or show the preview; preview on a phone | `../../ptc/actions/preview/SKILL.md` |
| Add or change creator-facing sliders, colors, choices or toggles, asked or after a change (see above) | `../../ptc/actions/controls/SKILL.md` |
| Create or replace the effect icon | `../../ptc/actions/icon/SKILL.md` |
| Check performance | `../../ptc/actions/perf/SKILL.md` |
| Prepare or submit an effect for review | `../../ptc/actions/publish/SKILL.md` |
| How my effects are doing, why one was rejected, share link, rename or tags, deactivate / withdraw / delete, badge, earnings | `../../ptc/actions/effects/SKILL.md` |
| Trends, challenges, effect ideas, sounds, library assets, 3D models | `../../ptc/actions/ideas/SKILL.md` |
| List, open, switch or create projects; saved versions; package; demo video; engines | `../../ptc/actions/projects/SKILL.md` |
| Close the plugin, quit, free CPU and GPU: save, close the Studio, stop the engines | `../../ptc/actions/projects/SKILL.md`, "Close the plugin" |

Two requests need no guide:

- **What changed** — call `change_card` (the newest settled change, or one
  `changeId`). Undo is the user's: the card's Undo, or the Studio's; never say
  you undid something.
- **The user's own image, video, sound or 3D file** — resolve its absolute path,
  read the import guidance through `eh.knowledge`, then `eh.resources.importFile`
  in an `eh` cell and place it.

The `ehai` server hosts Studio, preview and account actions. If the engine is
unavailable (an `eh` cell says Effect House is not reachable, or `eh` is not
defined), call `studio_sessions` once to start the runtime, then retry the
connection. When every project slot is in use, its answer names the open
projects and how to free one: tell the user that and offer to close one. Use `auth_login` when a tool reports that sign-in is required,
including a refusal from the `eh` kernel that names `auth_login` as its remedy.
When a code expires, tell the user and call `auth_login` again when they ask: do
not open a browser or send them to a new chat. Only if that tool fails, use the exact login command returned by the refusal with
`--no-wait --json`; do not assume the runtime is on the user's PATH.

Sign out only when the user asks to sign out, log out or switch accounts, never
on your own initiative: call `auth_logout`; to switch accounts, then call
`auth_login` for the other account. When it refuses because a build is running
or a project has unsaved changes, tell the user what it lists and call it again
with `confirm: true` only after they say to go ahead. Do not run `ehai logout`
in a shell; only if `auth_logout` itself fails, tell the user they can run
`ehai logout` in their own terminal.

When a tool result carries `updateNotice`, or the only tool offered is
`ehai_update_required`, tell the user in their language that a newer version is
out (or that this one can no longer be used) and offer to update; on their yes
call `ehai_update`, which runs the host's own update, and relay its answer. The
user types nothing: paste no shell command.

Publishing requires its guide's preflight and confirmation of the concrete result;
invoking EHAI or creating an effect does not authorize submission.
