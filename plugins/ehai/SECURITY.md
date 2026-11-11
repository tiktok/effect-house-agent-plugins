# Security and privacy

If you discover potential security issues in the project, or believe you may have found a security issue, please notify the ByteDance security team through our [security center](https://security.bytedance.com/src) or [vulnerability reporting email](mailto:src@bytedance.com). Please **do not** create public GitHub Issues. We will assess the vulnerability based on the Common Vulnerability Scoring System (CVSS 3.1). The security team will keep you updated on key progress and may request further information or guidance from you. You are welcome to contact us via the email or website mentioned above to ask questions or discuss disclosure matters.

To protect the security of our customers, ByteDance requests that you do not publish or share information regarding the vulnerability in any public forum, nor publish or share data involving users, until the vulnerability has been remediated and our users have been notified. Please understand that the time required for remediation depends on the severity of the vulnerability and the scope of the impact.

Individuals, companies, and security teams may wish to publish security advisories on their own websites or other forums. Please contact us via the email or website mentioned above prior to publication to discuss the information that can be disclosed and to coordinate the disclosure timeline.

# Bug Bounty Reward

For the policy of bug bounty reward, or if you have any questions about the rules, please contact [https://src.bytedance.com/home](https://src.bytedance.com/home) for consultation.

# What the plugin does on your machine

When you report a problem, include the version (`version` in `.claude-plugin/plugin.json`), your operating system, the host (Claude Code or Codex) and the steps that show it.

## What the plugin runs

- Two MCP servers, started by the host through `scripts/start` (`scripts/start.cmd` on
  Windows), which runs `scripts/start.mjs`, the only JavaScript file in the public
  repository, on the runtime's own Node.js, or on a Node.js from `PATH` before setup has
  run. It runs them from the runtime, which it downloads first if this machine has none,
  using the system's `curl` and `tar` and checking the sha256 named in
  `runtime/runtime.json` before unpacking anything.
- The first-time setup, `scripts/setup.sh` on a Mac and `scripts/setup.ps1` on Windows,
  which you or the assistant run. Each downloads the pinned runtime over HTTPS with the
  system's `curl`, checks the whole archive's SHA-256, and only then runs the official
  Node.js inside it (`package/bin/node`, `package/bin/node.exe`), which keeps the Node.js
  Foundation's signature, to install the runtime under `~/.ehai/runtime/` and fetch
  the engine. It changes neither `PATH` nor your shell profile.
- A local daemon (`ehai serve`) from the runtime the bootstrap installs under
  `~/.ehai/runtime/`. It listens on `127.0.0.1` only.
- One Effect House engine process per host session, from the engine installed
  under `~/.ehai/engines/`.
<!-- hooks:start -->
- Three hooks, also started through `scripts/start` and run from the runtime, in Claude Code only (Codex runs none of them): a
  turn-end signal; a prompt-time note of what the Studio shows, which also sends
  the start of your prompt to the local daemon to label its change journal (it
  does not leave your machine); and a turn record that counts each turn and its
  prompt's length, and hands the prompt and the turn's end to the local engine,
  which keeps only the length. Prompt text does not leave your machine. Every hook runs one packed script on the runtime's Node through `scripts/start`, and
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
