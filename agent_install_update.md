# Install or update EffectHouse AI in another agent

When the user asks you to follow this guide, perform the steps below rather
than only summarizing them. Reply in the user's language. This is a standalone
installation guide, not a skill to install. Use the current remote `main` copy.

## 0. Check where you are running

This guide is for a coding agent running on the user's own Mac or Windows PC
that can run commands there and has its own plugin installer.

- You are Claude Code: fetch
  `https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/claude_install_update.md`
  and follow that guide instead.
- You are Codex: fetch
  `https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/codex_install_update.md`
  and follow that guide instead.

Stop here if you cannot run commands at all, or only in a sandbox or cloud
machine that is not the user's computer (an assistant in a browser or on a
phone, a website's chat, a cloud session). Install nothing and do not turn the
steps into commands for the user to type. Tell the user only this, in their
language: EffectHouse AI is a plugin for coding agents on a Mac (macOS 13 or
later) or a Windows x64 PC; open the agent on that computer, choose or create
a folder, and paste the install prompt from
https://github.com/tiktok/effect-house-agent-plugins#install there.

## 1. Install or update the plugin

The plugin is the folder `plugins/ehai` of
`https://github.com/tiktok/effect-house-agent-plugins`, in Claude Code's
plugin format. Install that folder, never the repository root: the root holds
the marketplace files and installs as a plugin with no tools.

- Antigravity (`agy`): run

  ```sh
  agy plugin install https://github.com/tiktok/effect-house-agent-plugins/tree/main/plugins/ehai
  ```

  It installs or, when a copy exists, replaces it with the current release.
  Then read `agy plugin list --json` and take the `ehai` entry: it must list the
  MCP servers `eh` and `ehai` and the skill `effecthouseai`. Its `path` is
  `<installPath>`.
- Another agent: use its own command that installs a Claude Code plugin from a
  GitHub folder, with the folder URL above, and find the installed folder
  (`<installPath>`) and its MCP servers the same way. If your agent cannot
  install Claude Code plugins, install nothing: tell the user that EffectHouse AI
  installs into Claude Code, Codex and agents that read Claude Code plugins, and
  stop.

Require successful exit codes, and report a failing command's error as it is.

## 2. Complete setup

Use the exact `<installPath>` from step 1 and quote it for the native shell. The
plugin brings its own Node.js. Run the shipped setup entrypoint:

- macOS (Apple silicon or Intel):

  ```sh
  LC_ALL=C LANG=C /bin/sh "<installPath>/scripts/setup.sh"
  ```

- Windows x64 (PowerShell):

  ```powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File "<installPath>\scripts\setup.ps1"
  ```

- Any other computer: report that this release supports only macOS and
  Windows x64, and stop.

It checks the pinned SHA-256 of everything it downloads, downloads the runtime
and the engine (about 600 MB, once) into `~/.ehai` (or `<EHAI_HOME>`) and changes
no shell profile or PATH. It runs in the foreground for several minutes: keep the
same process running, check it with waits of at most 60 seconds, and wait for
its final line and exit code. Setup succeeded only when it prints a line starting
with `READY:` and exits 0; report a `FAILED:` line or a nonzero exit as it is.
Running it again is safe.

## 3. Finish

Tell the user to start a new conversation in this agent, so the plugin's tools
load, and to say what effect they want to make. The installed EffectHouse AI
skill checks the session and asks for TikTok QR sign-in only if it is needed.
To update later, follow this guide again. Report installation and setup
separately.
