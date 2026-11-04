# Security

## Reporting a vulnerability

Please report a security problem privately through this repository's private
vulnerability reporting on GitHub: open the Security tab and choose "Report a
vulnerability". Only the maintainers can read the report. Describe the version
(`version` in `.claude-plugin/plugin.json`), your operating system, the host
(Claude Code or Codex) and the steps that show the problem. Do not open a public
issue for it. We acknowledge a report within five working days and tell you when
a fix ships.

## What the plugin runs

- Two MCP servers, started by the host with its own `node` through
  `scripts/start.mjs`, the only JavaScript file in the public repository. It runs
  them from the runtime, which it downloads first if this machine has none, using the
  system's `curl` and `tar` and checking the sha256 named in `runtime/runtime.json`
  before unpacking anything.
- A local daemon (`ehai serve`) from the runtime the bootstrap installs under
  `~/.ehai/runtime/`. It listens on `127.0.0.1` only.
- One Effect House engine process per host session, from the engine installed
  under `~/.ehai/engines/`.
- On a Mac with no Node, and only when the assistant runs it: `scripts/setup.sh`,
  which downloads the pinned engine over HTTPS, checks its SHA-256 and code signature,
  writes `~/.ehai/bin/node` and appends one marked line to your login profile.
<!-- hooks:start -->
- Three hooks, also started through `scripts/start.mjs` and run from the runtime, in Claude Code only (Codex runs none of them): a
  turn-end signal; a prompt-time note of what the Studio shows, which also sends
  the start of your prompt to the local daemon to label its change journal (it
  does not leave your machine); and a turn record that counts each turn and its
  prompt's length, and hands the prompt and the turn's end to the local engine,
  which keeps only the length. Prompt text does not leave your machine. Every hook is `node` on one packed script, with no shell, and
  none approves, denies or changes a permission.
<!-- hooks:end -->

## What it downloads and how it is checked

On its first start the plugin downloads the engine and the runtime named in
`runtime/engine.json` and `runtime/runtime.json`. Downloads use HTTPS only and
are never downgraded to HTTP. Each file's sha256 comes from this package, never
from the download server, and nothing downloaded runs before it matches. Archive
entries are checked and no link may lead outside the archive. On
macOS the engine's code signature is verified (`codesign --verify --deep
--strict`) before it is used.

## Localhost is not a trust boundary

The daemon binds to `127.0.0.1`, which keeps other machines out but not other
programs on yours. Treat any local process as able to reach it. The daemon
answers account routes only for a loopback `Host`, and the plugin never stores
passwords: sign-in is a TikTok QR code, and the resulting session is kept in
`~/.ehai` in a file only your user can read (mode 600). Remove it by asking the
assistant to sign you out, with `ehai logout`, or with `ehai uninstall --yes --remove-login`.

## Supported versions

Only the latest published version receives security fixes. Update the plugin
with your host's plugin update command.
