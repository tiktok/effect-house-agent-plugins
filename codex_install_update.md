# Install or update EffectHouse AI in Codex

When the user asks you to follow this guide, perform the steps below rather
than only summarizing them. Reply in the user's language. This is a standalone
installation guide, not a skill to install. Use the current remote `main` copy,
not a copy from an older plugin cache.

## 1. Check the host and source

Run on the user's local Codex machine: Apple silicon macOS or Windows x64.
Use a native shell and one resolved absolute path to the active host's `codex`
CLI throughout; do not use WSL for a Windows desktop app. Respect `CODEX_HOME`
and existing settings. If the host or CLI is unavailable, report the missing
prerequisite and stop. Use the execution environment's required permissions.

Read `codex plugin marketplace list --json`. If `effect-house` exists, verify
that it uses `tiktok/effect-house-agent-plugins` on GitHub and tracks `main`
(an unspecified ref uses the repository default branch). Accept equivalent
HTTPS, SSH and GitHub shorthand forms. If it points elsewhere or pins another
ref, stop and explain the conflict; do not replace another source silently.
If absent, register it:

```sh
codex plugin marketplace add https://github.com/tiktok/effect-house-agent-plugins --ref main
```

## 2. Refresh and install

Always refresh an existing marketplace too; registering or reinstalling alone
does not establish that its snapshot is current:

```sh
codex plugin marketplace upgrade effect-house
codex plugin add ehai@effect-house --json
```

Require successful exit codes. Parse `version` and `installedPath` from the
install JSON. Fetch and parse the current remote manifest:

```text
https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/.codex-plugin/plugin.json
```

Require the returned version and `<installedPath>/.codex-plugin/plugin.json`
to match that manifest's version. Confirm `ehai@effect-house` is installed and
enabled with `codex plugin list --marketplace effect-house --json`. Do not
hardcode a release number or search old cache folders for an alternative path.
If the version differs, refresh and install once more in case a release arrived
during installation. If it still differs, or a command or manifest fetch fails,
report the exact step and error and stop. Do not delete caches or uninstall a
working copy to work around a mismatch.

## 3. Complete setup

Using only the exact `installedPath` returned by the successful installation,
check for Node.js 20 or later and run:

```sh
node "<installedPath>/scripts/start.mjs" setup
```

Replace the placeholder with the actual path and quote it for the native shell.
If Node is missing on macOS, use the installed `scripts/setup.sh` as documented
in the installed README; it also configures Node discovery and requires reopening
the app. On Windows, report the Node prerequisite and do not claim setup succeeded.

Setup may download about 600 MB and take several minutes. Keep the same process
running, check its progress with waits of at most 60 seconds, and wait for both
its final output and exit code. Success requires a `READY:` line and exit code 0.
On `FAILED:`, a nonzero exit, or exit without `READY:`, report setup as incomplete
and retain the error. Do not launch duplicate setup processes. Keep completed
installation separate from incomplete setup in the status you report.

## 4. Finish in a fresh chat

`READY` means the files are prepared; it does not prove that this chat has new
tools, that a running daemon has upgraded, or that TikTok sign-in is complete.
Do not stop an existing daemon or log out an account just to install an update.

When the user's installation prompt requests a fork, that request also authorizes
the continuation message and opening the fork. Do not ask them to request the
handoff again or finish with only "start a new chat" before checking host tools.

After successful setup, discover the host's `fork_thread`, `send_message_to_thread`
and `navigate_to_codex_page` tools and read their current schemas. If available
and the user requested the handoff:

1. Fork the current chat in the same directory, using the tool's current-chat
   defaults rather than guessing a source ID.
2. Send the continuation to the returned child with `send_message_to_thread`.
   Include the user's original goal, verified plugin version, exact installed
   path, `READY` and exit code 0, any known blockers, and pending sign-in.
   Ask it to use the installed EffectHouse AI skill to check the session, complete
   TikTok QR sign-in only if required, and resume the user's goal. If no creative
   goal was supplied, introduce EffectHouse AI and ask what they want to make.
   Do not repeat successful installation or create an empty project for onboarding.
3. Open that child with `navigate_to_codex_page`.
4. Report handoff success only after the child was created, received the message
   and was opened. Do not claim sign-in or tool availability is verified yet.

If a required tool is unavailable, or a tool fails, name the missing capability
or failed step. Never substitute a shell-spawned CLI process for a visible chat.
If a child already exists, preserve its reference and recover that handoff rather
than creating duplicates. Give the user its link when available. If no child was
created, tell the user to start a new Codex chat and provide the continuation
prompt above. If the user did not request a handoff, give that manual continuation
without creating or messaging another chat.

Keep installation, setup, chat handoff and sign-in as separate reported states.
A fresh chat must verify its tools and session; do not reinstall for a stale tool
list or report sign-in as complete without a successful check.
