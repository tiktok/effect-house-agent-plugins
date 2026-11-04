# EffectHouse AI (`ehai`)

A Claude Code and Codex plugin for TikTok Effect House. Describe the effect you
want and the agent builds it in the real Effect House engine, shows it in a live
preview, lets you tune it with sliders, and publishes it to your Effect House
account. It runs on macOS with Apple silicon and on Windows x64 (an Intel Mac is
not supported: the plugin says so and stops) and needs Node.js 20 or later on
the `PATH` the host starts from. On a Mac without Node you do not need to install
it: the first time you use the plugin, the assistant runs the plugin's
`scripts/setup.sh`, which downloads the Effect House engine into `~/.ehai`, adds
`~/.ehai/bin/node` (the Node inside the engine) and adds one line to your login
profile so apps can find it, after which you reopen the app. A Node you install
yourself takes priority. On Windows, install Node.js from nodejs.org.

Projects open in Effect House 5.16.0 and later.
The plugin's engine is that Effect House release: a project it saves records
it, so an older Effect House can no longer open the project. A project saved
by a newer Effect House is not opened until the plugin is updated; an older one
opens after a copy of its original project file is kept in the project's
`.ehai` folder, and the plugin says so once.

## Install

This repository is a plugin marketplace for both hosts, named `effect-house`.

Claude Code:

```bash
claude plugin marketplace add tiktok/effect-house-agent-plugins
claude plugin install ehai@effect-house
```

On Claude Code 2.1.292 or later one command does both:
`claude plugin install ehai --marketplace tiktok/effect-house-agent-plugins`.
Inside a session (2.1.275 or later), type
`/plugin install ehai --marketplace tiktok/effect-house-agent-plugins`. Without a
GitHub SSH key, set `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` before adding the
marketplace so Claude Code clones it over HTTPS. Turn on auto-update for this
marketplace: updates are off by default for a marketplace you add, so open
`/plugin`, Marketplaces, choose `effect-house` and enable auto-update. When a new
version is out, ask in the chat to update and the plugin runs the update for you
(it runs `claude plugin update ehai@effect-house`, which you can also run yourself).

Codex:

```bash
codex plugin marketplace add tiktok/effect-house-agent-plugins
codex plugin add ehai@effect-house
```

A Codex task does not see a plugin installed or updated while it runs: start a
new task after installing, and again after every update.
Codex installs a new version of the plugin when it refreshes the marketplace
(`codex plugin marketplace upgrade effect-house`, which the plugin's own update
runs for you; recent Codex versions also refresh when a session starts).

When a newer version is out, the assistant asks you at the start of its next
reply whether to update (in Claude Code a line under your prompt says so too),
at most once a day and not again once you said no; a card and the Studio show
it as well. Say yes (or press Update now on the card or in the Studio) and the
plugin runs your host's own update command. When a newer version is already
installed under a running conversation, the assistant asks how to move to it:
in the Claude Code desktop app a new or forked session, in a terminal session
`/reload-plugins`, in Codex a new task. You type no other command. If a
version can no longer be used safely (a security fix, say), the plugin offers
only that update and the `ehai_update_required` tool, which says why; your
projects on disk are never touched.

## Example prompts

- "Make an effect that puts sparkles around my face."
- "Build a tap game where I catch falling stars."
- "How are my published effects doing?"

## One entry

Invoke EHAI or describe the effect you want in ordinary language. Creating,
editing, previewing, tuning and publishing use the same entry. The agent reads
the specialized guides as the work needs them; there is no topic menu to choose.

## What runs on your machine

- Two MCP servers the host starts with its own `node`: `ehai` and `eh`, described
  below. The public repository holds only two small starters as code,
  `scripts/start.mjs` and, for a Mac with no Node, `scripts/setup.sh`; everything they
  run ships in the runtime.
- A local daemon (`ehai serve`) that listens on `127.0.0.1` only. It serves the
  Studio page and the preview and runs the Effect House account actions.
- One Effect House engine process per host session, started by the daemon and
  stopped when the session ends or sits idle.
<!-- hooks:start -->
- Small hooks in Claude Code (Codex runs none): a turn-end signal; a note of what the Studio
  shows (it also passes the start of your prompt to the local daemon, which
  labels its change history with it); a turn record that counts each turn and
  its prompt's length and hands the prompt and the turn's end to the local
  engine, which keeps only the length. Prompt text does not leave your machine.
  Each runs `node` on one script, with no shell. None runs before a tool call,
  and none approves, denies or changes a permission: your host's own permission
  rules apply.
<!-- hooks:end -->

## What the first start downloads

This package carries neither the engine nor the runtime. `runtime/engine.json`
and `runtime/runtime.json` name them, with the HTTPS address, the size and the
sha256 of each archive. On a machine's first conversation `scripts/start.mjs` downloads
both in the background, says so through `ehai_installing`, and asks you to start a new
conversation when they are ready. It downloads the engine
(about 600 MB) and the `ehai` runtime (about 34 MB) from that address into
`~/.ehai/engines/<first 12 digits of its sha256>/` and `~/.ehai/runtime/<version>/`. A download is used
only when its sha256 equals the one in this package, no link in its archive leads outside it,
and, on macOS, the engine's code signature verifies. One install serves every
session and both hosts, and an update downloads again only when the engine
changed. Downloads honour `HTTPS_PROXY` and `NO_PROXY`. The first runtime download uses
the system's `curl` and its certificates; the others also honour
`NODE_EXTRA_CA_CERTS`. Until it finishes, both servers offer one placeholder
tool, `ehai_installing`, which says how far setup is or why it stopped.

## Network, sign-in and privacy

- The plugin contacts `effecthouse.tiktok.com` and TikTok's sign-in hosts for
  sign-in and every account action (publishing, your effects and their
  performance, trends, sounds, the asset library, image generation and phone
  preview), and the artifact host named in the pin files for the first-start
  download. What these actions send is what they need: for example the words
  of a search or an image description, or the effect package for a phone
  preview or a performance test. Covers, avatars and sound previews load from
  TikTok's CDN. Model search sends its search words to `api.sketchfab.com`;
  importing a model also needs your own Sketchfab token.
- Submitting an effect uploads, as Effect House desktop does, the effect and
  its project, with an AI record: the plans the agent validated, how many
  prompts there were and their lengths (not their text), the editing steps the
  agent ran, and how many turns there were. Apart from a phone preview or a
  performance test you ask for, nothing about a project leaves your machine
  before you confirm a submission. Neither
  the plugin nor its engine reads your host's conversation history or
  transcript files.
- Update check: once a day the local daemon reads this repository's
  `.claude-plugin/plugin.json` and `support.json` from
  `raw.githubusercontent.com` (no identifier is sent) to learn whether a newer
  version is out or this one is below the supported minimum. A copy installed
  by the Effect House install skill asks that skill's installer instead, which
  reads its release file from the marketplace repository with git. Any failure
  means no notice. Set `EHAI_UPDATE_CHECK=off` in the environment of the host
  to turn it off.
- Every tool needs a TikTok account signed in to Effect House: the first call
  shows a QR code to scan with the TikTok app. The session is stored in
  `~/.ehai`, readable only by your user.
- Usage analytics: the daemon reports usage events (which features ran, counts,
  durations, outcomes, prompt lengths, plugin and host versions) to the
  analytics collector that Effect House's configuration names for your
  account's region, under the plugin's own application id. Events carry a
  per-machine identifier (a hash of the platform UUID on macOS, the same one
  Effect House desktop uses; a random id kept in `~/.ehai/telemetry-id`
  elsewhere) and, while you are signed in, your Effect House account id and
  badge level. They never carry the text of your prompts, your files or their
  paths. Set `EHAI_TELEMETRY=off` in the environment of the host to send
  nothing; this also stops recording turns and prompt lengths for the AI
  record. The setting applies to each conversation that host runs, even when
  another host started the shared background service; a Studio page opened
  without a conversation follows the setting of the process that started the
  service. Events that could not be delivered are kept in `~/.ehai/telemetry`
  for at most 7 days and sent later.
- Microphone: an effect that reacts to your voice hears your microphone in the
  preview only after you switch on the microphone button in the Studio and your
  system allows it (macOS asks once, for "Effect House Engine"). It is off on
  every page load, goes off when the page is hidden or closed, and the sound
  stays on your machine: nothing is recorded or uploaded.
- What a tool returns to your agent (your effects' statistics, search results,
  preview screenshots) becomes part of the conversation your host sends to its
  model provider.
- Your use of Effect House through the plugin is governed by the
  [Effect House Terms of Service](https://effecthouse.tiktok.com/learn/guides/support/terms-of-service)
  and the [TikTok Privacy Policy](https://www.tiktok.com/legal/privacy-policy).
- Licence: the original source code and documentation in this repository are
  licensed under [Apache-2.0](LICENSE); see [NOTICE](NOTICE) for attribution.
  The downloaded runtime and Effect House engine are distributed separately
  under their accompanying licences; this repository's licence does not
  relicense those artifacts or their third-party components.
  [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) lists third-party software
  used by the plugin and engine, with licence texts under `third-party-notices/`.

## Uninstall

`ehai uninstall` prints what it would stop, unregister and delete, and
`ehai uninstall --yes` does it (add `--remove-login` to sign out too). A plugin
install has no `ehai` on `PATH`: run `~/.ehai/runtime/current/bin/ehai` on macOS
or `~/.ehai/runtime/current/bin/ehai.cmd` on Windows. Then remove the plugin with
`claude plugin uninstall ehai@effect-house` or `codex plugin remove
ehai@effect-house`. Your project folders are never touched. On a Mac where the
plugin set up Node, also delete `~/.ehai/bin` and `~/.ehai/setup`, and the line
marked `# added by the Effect House plugin` in your login profile.

## Troubleshooting

When setup stops, `ehai_installing` says why in one sentence, and the fix is the
one it names:

- Could not download: check the network or proxy (`HTTPS_PROXY`, `NO_PROXY`);
  behind a proxy that re-signs HTTPS, set `NODE_EXTRA_CA_CERTS` to its CA file.
  Then reconnect the server (Claude Code: `/mcp`; Codex: a new session); the
  download resumes where it stopped.
- The download link no longer answers, a download was refused, or the signature
  did not verify: update the plugin.
- Not enough disk space: free some space; the download resumes from what is
  already on disk.
- Another session is downloading: wait; one download serves both.
- `ehai_update_required`: this version is below the supported minimum; update
  the plugin with the command it names, then start a new session.
- Anything else: run `ehai doctor` (the managed path above) and reconnect.

For help with Effect House itself, see the
[Effect House guides](https://effecthouse.tiktok.com/learn/guides/) or ask the
community on [Discord](https://discord.gg/effecthouse).

## Runtime ownership

- The plugin bootstrap installs only the version-matched `ehai` runtime.
- Preview, real project persistence and package export need the Effect House
  engine artifact the pin files (or a complete package) name.

## Two MCP servers

- `ehai`: the runtime, the Studio and preview, and the
  Effect House account actions.
- `eh`: the Effect House editing kernel from the same
  engine (`run`, `reset`, `status`). It talks to the engine through the ehai
  daemon, so it follows engine restarts and wakes a sleeping engine. Only the
  EHAI skill is exposed as a user entry; the action guides stay under
  `ptc/actions/` for the agent to read when needed. The engine's own guides (the
  workspace guide `AGENTS.md` and its topics) are the kernel's workspace: a
  complete package carries a copy of them under `ptc/`; the marketplace package
  carries none, and the kernel serves the guides that come with the downloaded
  engine, under `~/.ehai/engines/`, which appear once the engine is ready. The
  EHAI skill reads the workspace guide when effect work starts, not at every
  session start, and new projects are saved under the session folder.
  <!-- hooks:start -->
  The plugin's hooks never approve or deny a tool call.
  <!-- hooks:end -->
  Claude Code asks once before the agent first reads these guides (outside your
  project folder), and a headless `claude -p` run needs the folder granted with
  `--add-dir`.

Both servers name the host conversation with one session key
(`EHAI_SESSION_ID`, else `CLAUDE_CODE_SESSION_ID`,
else `CODEX_THREAD_ID`, else the host's process id), so the runtime gives each
session its own engine. Each reports its exit to the runtime, best-effort.

