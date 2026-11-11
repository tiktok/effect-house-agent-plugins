# EffectHouse AI (`ehai`)

A Claude Code and Codex plugin for TikTok Effect House. Describe the effect you
want and the agent builds it in the real Effect House engine, shows it in a live
preview, lets you tune it with sliders, and publishes it to your Effect House
account. It runs on macOS, with Apple silicon or an Intel processor (macOS 13 or
later), and on Windows x64. You do not need to install Node.js.

Projects open in Effect House 5.16.0 and later.
A project the plugin saves no longer opens in an older Effect House; before it
upgrades an older project, it keeps a copy of the original in the project's `.ehai` folder.

## Install

In the Codex app or the Claude app, choose or create a workspace folder and trust it
when asked; we recommend switching to Full access before your first message, so you
do not approve every step. Then paste the prompt for your host (in Codex, not
ChatGPT; in Claude Code, not a Claude chat). It installs or updates the plugin
and runs the first-time setup (about 600 MB, once); start a new session when it
finishes, so the plugin loads. Pasted into a chat page, the prompt only tells
you to come back to Codex or Claude Code.

Codex:

```text
Fetch https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/codex_install_update.md directly with curl, not web search. Follow it to install/update and set up EffectHouse AI, then fork this chat and continue there if supported. If you cannot run commands on my computer (you are ChatGPT or another chat page, not Codex), install nothing: tell me to paste this prompt into Codex on my Mac or Windows PC.
```

Claude Code:

```text
Fetch https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/claude_install_update.md directly with curl, not web search. Follow it to install/update and set up EffectHouse AI, then fork this session and continue there if supported. If you cannot run commands on my computer (you are Claude or another assistant on a chat page, not Claude Code), install nothing: tell me to paste this prompt into Claude Code on my Mac or Windows PC.
```

By hand, add the marketplace and install the plugin:

```bash
claude plugin marketplace add tiktok/effect-house-agent-plugins
claude plugin install ehai@effect-house
codex plugin marketplace add tiktok/effect-house-agent-plugins
codex plugin add ehai@effect-house
```

Then run the setup in the installed folder, `sh scripts/setup.sh` (on Windows
`powershell -NoProfile -ExecutionPolicy Bypass -File scripts\setup.ps1`), until it
says `READY`, and start a new conversation (in Codex a new task). In Claude Code,
turn on auto-update for the `effect-house` marketplace under `/plugin`, Marketplaces.

## Sign in

The first time you use the plugin, the agent shows a QR code in the chat. In the
TikTok app, tap Profile, then the menu (☰), then Your QR code; tap the scan button,
scan the code and confirm on your phone. If the code expires, ask for a new one.

## Try it

- "Create an iridescent ribbon effect with glowing sparkles floating around my face."
- "Make a 2D game where I move my head to catch falling stars in a dreamy night sky."
- "Create a cute pink pig hood with little floppy ears that follows my head."

## Updates

Once a day the plugin checks this repository for a newer version; the assistant then
asks whether to update and, if you agree, runs `claude plugin update ehai@effect-house`
(after refreshing the marketplace) or `codex plugin marketplace upgrade effect-house`.

## What runs on your machine

- Two MCP servers started through `scripts/start` (`start.cmd` on Windows): `ehai`
  (Studio, preview, account actions) and `eh` (the Effect House editing kernel).
  The starters and setup entries are this repository's only code; the rest ships
  in the downloaded runtime, with an official Node.js of its own.
- A local daemon on `127.0.0.1` only, and one Effect House engine per session.
- The runtime (about 34 MB) and engine (about 600 MB) download into `~/.ehai`.
  `runtime/runtime.json` and `runtime/engine.json` name each archive's address,
  size and SHA-256; nothing from an archive runs before it matches.
<!-- hooks:start -->
- Small hooks in Claude Code (Codex runs none): a turn-end signal; a note of what the
  Studio shows, which also passes the start of your prompt to the local daemon to label
  its change history; and a turn record that hands the prompt and the turn's end to the local engine, which keeps only the length.
  Prompt text does not leave your machine. None runs before a tool call or approves, denies or changes a permission.
<!-- hooks:end -->

## Network, sign-in and privacy

[PRIVACY.md](PRIVACY.md) says what the plugin sends and to whom, and how to turn off the
usage analytics (`EHAI_TELEMETRY=off`) or the update check (`EHAI_UPDATE_CHECK=off`). Use is governed by the
[Effect House Terms of Service](https://effecthouse.tiktok.com/learn/guides/support/terms-of-service) and the [TikTok Privacy Policy](https://www.tiktok.com/legal/privacy-policy).

## Uninstall

`~/.ehai/runtime/current/bin/ehai uninstall` (`ehai.cmd` on Windows) prints what it
would stop and delete; add `--yes` to do it, and `--remove-login` to sign out
too. Then remove the plugin with `claude plugin uninstall ehai@effect-house` or
`codex plugin remove ehai@effect-house`. Your project folders are never touched.

## Troubleshooting

- The agent says it has no Effect House tools: start a new session; the plugin only
  loads in a session started after you install or update it.
- Tool calls fail with "requires approval": the permission mode changed while the
  agent was working; send your message again.
- Setup says why it stopped. A failed download resumes on the next run; behind a
  proxy set `HTTPS_PROXY`, and `NODE_EXTRA_CA_CERTS` for one that re-signs HTTPS.
- `ehai_update_required`: update with the command it names, then start a new conversation.
- `Cannot add marketplace "effect-house": its source doesn't match`: an earlier
  copy came from somewhere else. Run `claude plugin marketplace remove effect-house`,
  then add the marketplace and install again.
- Claude Code asks once before the agent reads the engine's guides (outside your
  project folder); a headless `claude -p` run needs that folder in `--add-dir`.
- Anything else: run `~/.ehai/runtime/current/bin/ehai doctor` and reconnect.

## Licence

This repository's source code and documentation are licensed under
[Apache-2.0](LICENSE) ([NOTICE](NOTICE)). The downloaded runtime and engine come
under their own licences, which it does not relicense; [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt)
lists their third-party software, with licence texts under `third-party-notices/`.

## Help

- **A bug or a feature request**: open an [issue](https://github.com/tiktok/effect-house-agent-plugins/issues/new/choose),
  or ask the assistant to "report this bug to the team": it collects the version,
  host and what happened, shows you the draft, and posts it (or gives you the
  prefilled link) only after you agree. Issues are public, so keep account
  details out of them.
- **Questions**: the [Effect House guides](https://effecthouse.tiktok.com/learn/guides/) or [Discord](https://discord.gg/effecthouse).
- **A security problem**: the channel in [SECURITY.md](SECURITY.md), never a public issue.


