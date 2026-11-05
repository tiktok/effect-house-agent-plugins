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

Before installation commands, check the execution environment's network and
write permissions. Marketplace registration writes outside the project folder.
Claude Code needs access to its plugin directories and settings; setup also
writes to `<EHAI_HOME>` (default `~/.ehai`).
If required access is restricted, request it through the host's supported approval
mechanism before the affected command. If a command fails specifically because
of permissions, retain the error and retry that step only after access is granted.
If permission is denied or unavailable, report the blocked phase without undoing
completed installation or changing sandbox settings.

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
the applicable entry's `version` and exact `installPath`. Re-read
`claude plugin marketplace list --json` and obtain the verified `effect-house`
entry's `installLocation` as `<marketplaceRoot>`.

Verify the release using Git, not a web search result or browser-rendered copy
of the mutable raw `main` URL, which may be stale:

```sh
git ls-remote https://github.com/tiktok/effect-house-agent-plugins.git refs/heads/main
git -C "<marketplaceRoot>" rev-parse HEAD
```

Take `<mainSha>` from the exact `refs/heads/main` result and require the
marketplace's HEAD to equal it. Read the manifest from that checked commit:

```sh
git -C "<marketplaceRoot>" show "<mainSha>:.claude-plugin/plugin.json"
```

Parse its JSON version and require both the listed version and
`<installPath>/.claude-plugin/plugin.json` to match. Confirm the plugin is enabled
for this session's scope; if disabled, enable `ehai@effect-house` in the intended
scope using the CLI's supported `plugin enable` command. Do not hardcode a release
number or search old cache folders for another path. If the SHA or versions differ,
refresh and update once more, then re-read the remote SHA, marketplace root,
manifest and install path in case a release arrived during installation. If they
still differ, report the observed SHAs and versions and stop. If a Git or CLI
command fails, report its error; never treat an unreadable manifest as a version
mismatch or use a cached web result instead. Do not clear caches or uninstall a
working copy to fix a mismatch.

Set `extraKnownMarketplaces.effect-house.autoUpdate` to the JSON boolean `true`
in `~/.claude/settings.json`. Merge into the existing marketplace entry, preserving
its source and all unrelated settings; do not replace the whole settings file or
write an entry containing only `autoUpdate`. If no entry exists, include the verified
source, for example `{"source":{"source":"github","repo":"tiktok/effect-house-agent-plugins","ref":"main"},"autoUpdate":true}`.
Re-read the JSON to confirm the change. If policy prevents it, report automatic
updates as unconfigured separately from the completed installation.

## 3. Complete setup

Use only the exact `installPath` from the final successful installation result.
Replace placeholders below with that path and quote them for the native shell.

The plugin brings its own Node.js, so setup is the same whether or not this
machine has Node. Run the shipped setup entrypoint for this computer:

- Apple silicon macOS:

  ```sh
  LC_ALL=C LANG=C /bin/sh "<installPath>/scripts/setup.sh"
  ```

- Windows x64 (PowerShell):

  ```powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File "<installPath>\scripts\setup.ps1"
  ```

- Any other computer (Intel Mac, Linux, Windows on Arm): report that this release
  supports only Apple silicon macOS and Windows x64, and stop.

The entrypoint checks the pinned SHA-256 of everything it downloads before it runs
any of it, downloads the runtime (with its own Node) and the engine, about 600 MB
in all, into `~/.ehai` (or `<EHAI_HOME>`), and changes no shell profile or PATH.
It runs in the foreground and can take several minutes: keep the same process
running, check its progress with waits of at most 60 seconds, and wait for both
its final line and its exit code. Do not launch a second setup while one runs.

Setup succeeded only when it prints a line starting with `READY:` and exits 0.
A `FAILED:` line or a nonzero exit means setup is incomplete: report the error
line as it is. Running the same entrypoint again is safe: it keeps a runtime that
is already installed. Resume only the unfinished step after resolving
its cause; do not repeat registration and installation when release verification
already passed. Keep completed installation separate from incomplete setup in
the status you report.

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
