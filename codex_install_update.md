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

Before installation commands, check the execution environment's network and
write permissions. Marketplace registration writes outside the project folder.
Codex may need access to `<CODEX_HOME>/.tmp/marketplaces`, plugin caches and
its settings; setup also writes to `<EHAI_HOME>` (default `~/.ehai`).
If required access is restricted, request it through the host's supported approval
mechanism before the affected command. If a command fails specifically because
of permissions, retain the error and retry that step only after access is granted.
If permission is denied or unavailable, report the blocked phase without undoing
completed installation or changing sandbox settings.

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
install JSON. Re-read `codex plugin marketplace list --json` and obtain the
verified `effect-house` entry's `root` as `<marketplaceRoot>`.

Verify the release using Git, not a web search result or browser-rendered copy
of the mutable raw `main` URL, which may be stale:

```sh
git ls-remote https://github.com/tiktok/effect-house-agent-plugins.git refs/heads/main
git -C "<marketplaceRoot>" rev-parse HEAD
```

Take `<mainSha>` from the exact `refs/heads/main` result and require the
marketplace's HEAD to equal it. Read the manifest from that checked commit:

```sh
git -C "<marketplaceRoot>" show "<mainSha>:.codex-plugin/plugin.json"
```

Parse its JSON version and require both the install result and
`<installedPath>/.codex-plugin/plugin.json` to match. Confirm `ehai@effect-house`
is installed and enabled with `codex plugin list --marketplace effect-house --json`.
Do not hardcode a release number or search old cache folders for another path.
If the SHA or versions differ, refresh and install once more, then re-read the
remote SHA, marketplace root, manifest and installation result in case a release
arrived during installation. If they still differ, report the observed SHAs and
versions and stop. If a Git or CLI command fails, report its error; never treat
an unreadable manifest as a version mismatch or use a cached web result instead.
Do not delete caches or uninstall a working copy to work around a mismatch.

## 3. Complete setup

Use only the exact `installedPath` from the final successful installation result.
Replace placeholders below with that path and quote them for the native shell.
Detect Node in this shell; do not conclude that Node is absent from the whole
machine just because this shell's PATH does not contain it.

- If Node.js 20 or later is available, use its resolved executable to run:

  ```sh
  node "<installedPath>/scripts/start.mjs" setup
  ```

- If Node is not found on Apple silicon macOS, run the shipped no-Node entrypoint
  directly; it does not require Node or a separate Node installation:

  ```sh
  /bin/sh "<installedPath>/scripts/setup.sh"
  ```

  This downloads the runtime and engine, configures `~/.ehai/bin/node` (or
  `<EHAI_HOME>/bin/node`) and its login-profile PATH entry. Tell the user what it
  configures. This entrypoint may return `RUNNING:` with exit code 0 while its
  background worker continues. Wait about 30 seconds and invoke the same shell
  command again to query/resume that worker; do not treat `RUNNING:` as completion
  or launch another installation. Continue until `READY:` or `FAILED:`. A
  `FAILED:` line is a failure even if the script exits with code 0.
  After the shell reports `READY:`, verify the configured Node executable is usable
  and version 20 or later, then use that absolute Node path to run the installed
  `scripts/start.mjs setup` and obtain the final `READY:` confirmation. If the
  bundled Node cannot be found or run, report that exact step as incomplete.
  The desktop app may need a full restart to discover the new Node; forking alone
  does not establish that its PATH has refreshed. Include this in the handoff.

- If Node is older than 20, or Node is missing on Windows, report the Node.js
  20+ prerequisite and resume setup after it is available. Do not claim success
  or repeat plugin installation for a missing runtime prerequisite.

Setup may download about 600 MB and take several minutes. For the Node setup,
keep the same process running, check its progress with waits of at most 60 seconds,
and wait for both its final output and exit code. For the shell entrypoint, follow
its `RUNNING:` polling rules above. Final setup success requires the Node setup's
`READY:` line and exit code 0.
On `FAILED:` or a nonzero exit, report setup as incomplete and retain the error.
A Node setup process that exits without `READY:` is also incomplete; a shell
status query returning `RUNNING:` must continue polling instead. Resume only the
unfinished step after resolving its cause; do not repeat registration and
installation when release verification already passed.
Do not launch duplicate setup processes. Keep completed installation separate
from incomplete setup in the status you report.

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
