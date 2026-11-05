# Install or update EffectHouse AI in Claude Code

When the user asks you to follow this guide, perform the steps below rather
than only summarizing them. Reply in the user's language. This is a standalone
installation guide, not a skill to install. Use the current remote `main` copy,
not a copy from an older plugin cache.

## 1. Check the host and source

Run on the user's local Claude Code machine: Apple silicon macOS or Windows x64.
Use a native shell and one resolved absolute path to its `claude` CLI throughout;
do not use WSL for a Windows desktop app. If the host or CLI is unavailable,
report the missing prerequisite and stop. Use the execution environment's
required permissions and preserve existing settings and projects.

Read `claude plugin marketplace list --json`. If `effect-house` exists, verify
that it uses `tiktok/effect-house-agent-plugins` on GitHub and tracks `main`
(an unspecified ref uses the repository default branch). Accept equivalent
HTTPS, SSH and GitHub shorthand forms. If it points elsewhere or pins another
ref, stop and explain the conflict; do not replace another source silently.
If absent, register it:

```sh
claude plugin marketplace add https://github.com/tiktok/effect-house-agent-plugins
```

## 2. Refresh and install or update

Always refresh the marketplace before installing or updating:

```sh
claude plugin marketplace update effect-house
```

Read `claude plugin list --json` and select the exact `ehai@effect-house` entry
that applies to this session. If multiple installation scopes make that choice
ambiguous, resolve the intended scope with the user before changing it.
If absent, run:

```sh
claude plugin install ehai@effect-house
```

If already installed, run:

```sh
claude plugin update ehai@effect-house
```

Require successful exit codes. Read `claude plugin list --json` again and obtain
the applicable entry's `version` and exact `installPath`. Fetch and parse:

```text
https://raw.githubusercontent.com/tiktok/effect-house-agent-plugins/main/.claude-plugin/plugin.json
```

Require the listed version and `<installPath>/.claude-plugin/plugin.json` to
match that remote version, and confirm the plugin is enabled for this session's
scope. If disabled, enable `ehai@effect-house` in the intended scope using the
CLI's supported `plugin enable` command. Do not hardcode a release number or
search old cache folders for an alternative path. If versions differ, refresh,
update and re-read the path once more in case a release arrived during installation.
If they still differ, or a command or manifest fetch fails, report the exact step
and error and stop. Do not clear caches or uninstall a working copy to fix a mismatch.

Set `extraKnownMarketplaces.effect-house.autoUpdate` to the JSON boolean `true`
in `~/.claude/settings.json`. Merge into the existing marketplace entry, preserving
its source and all unrelated settings; do not replace the whole settings file or
write an entry containing only `autoUpdate`. If no entry exists, include the verified
source, for example `{"source":{"source":"github","repo":"tiktok/effect-house-agent-plugins","ref":"main"},"autoUpdate":true}`.
Re-read the JSON to confirm the change. If policy prevents it, report automatic
updates as unconfigured separately from the completed installation.

## 3. Complete setup

Using only the exact `installPath` from the final successful inventory, check
for Node.js 20 or later and run:

```sh
node "<installPath>/scripts/start.mjs" setup
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

## 4. Reload and finish

`READY` means the files are prepared; it does not prove that this session has
new tools, that a running daemon has upgraded, or that TikTok sign-in is complete.
Do not stop an existing daemon or log out an account just to install an update.

When the user's installation prompt requests a fork, that request also authorizes
the continuation message and opening the fork. Do not ask them to request the
handoff again. After successful setup, inspect or discover the current host's
native session tools before choosing a manual fallback; do not assume that a
desktop UI's Fork button is exposed as an assistant tool.

If the host exposes tools to fork, send a follow-up and open the result, and the
user requested that handoff, use those tools in that order. Carry over the user's
original goal, verified plugin version, exact install path, `READY` and exit code 0,
automatic-update setting, known blockers and pending sign-in. Ask the fork to use
the installed EffectHouse AI skill to check the session, complete TikTok QR sign-in
only if required, and resume the user's goal. If no creative goal was supplied,
introduce EffectHouse AI and ask what they want to make. Do not repeat successful
installation or create an empty project for onboarding.

Report handoff success only after the new session was created, received the
continuation and was opened. If a step fails after creating a session, preserve
its reference and recover it rather than making duplicates. Give the user its
link when available and explain which step remains incomplete.

If no native session tools are exposed, explicitly say that this host does not
provide an assistant-callable fork/send/open capability. Do not pretend a shell
command opening another CLI is a fork in the user's desktop app, and do not use
background agents as a replacement. In a terminal session, tell the user to type
`/reload-plugins`; in a desktop session, tell them to use its Fork or New session
control. Provide a short continuation prompt containing the context above.
Use the same manual fallback if the user did not request an automatic handoff.

Report installation, setup, automatic updates, handoff and sign-in separately.
After reloading, the installed EffectHouse AI skill must check the session and
complete TikTok QR sign-in only if required. Do not reinstall for a stale tool
list or report sign-in as complete without a successful check.
