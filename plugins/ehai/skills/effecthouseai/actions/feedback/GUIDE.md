---
name: feedback
description: Report a bug in, or send feedback about, EffectHouse AI ITSELF —
  "report this bug to the team", "tell the developers the preview is broken",
  "send feedback", "I wish the plugin could …", "request a feature". Collects
  the facts, drafts a public GitHub issue on tiktok/effect-house-agent-plugins,
  shows it, and posts it only after the user says yes (with the gh CLI when it
  is signed in, otherwise as a link the user opens and submits). Not for
  problems with the user's own effect, and never for a security issue.
---
# feedback — a bug report or feature request for the EffectHouse AI team

> **Signed out?** This guide needs no sign-in: the doctor, the draft and the
> posting all work signed out, so do not ask the user to sign in for a report.
> Only when the bug IS the sign-in does the entry skill's remedy apply: call the
> `auth_login` tool (a QR code in the chat), wait with `auth_login_status`, and
> quote what they answered in the report; the terminal fallback,
> `~/.ehai/runtime/current/bin/ehai login --no-wait --json` (on Windows
> `~/.ehai/runtime/current/bin/ehai.cmd login --no-wait --json`), only if
> `auth_login` itself fails, and never as a command shown to the user.

The team reads **GitHub issues** on `tiktok/effect-house-agent-plugins`. The
issues are **public**: anyone can read them. That decides most of what follows.

**Not this guide:**

- A **security issue** (a token exposed, data sent where it should not go, a way
  past the sign-in) goes to the channel in the plugin's `../../../../SECURITY.md`
  (its root), never into a public issue. Say so and give them that file's
  address on GitHub, https://github.com/tiktok/effect-house-agent-plugins/blob/main/SECURITY.md
  (it names the security team's site and email).
- A problem with the **user's own effect** (it does not look right, Effect House
  rejected it) is effect work: the preview, publish and effects guides. Only when
  the plugin itself misbehaves (a tool errors, the Studio does not open, setup
  fails, the agent cannot do what the README promises) is it a bug report.

**Two kinds of issue, one each:**

- **Bug** — something does not work as documented. Title `Bug: <one line>`.
  Before reporting a tool error, make the one recovery the entry skill names
  (`studio_sessions {}` once, then retry) if you have not, and say in the report
  whether it helped.
- **Feature request or feedback** — something the user wishes the plugin did, or
  did differently. Title `Feature request: <one line>`. Praise alone needs no
  issue: pass it on with the next request, or offer Discord.

## 1. Collect the facts (run things yourself; show the user no command)

The user types nothing, and no command is pasted into the chat (a host may
still ask them to allow one; that is fine). Gather:

- **Plugin version**: `version` in `.claude-plugin/plugin.json` at the plugin's
  root, the folder that holds `skills/` (four folders up from this guide; the
  same value is in `.codex-plugin/plugin.json`).
- **Runtime version, engine revision, Effect House version**: run the managed
  CLI's doctor yourself — `~/.ehai/runtime/current/bin/ehai doctor` (on Windows
  `~/.ehai/runtime/current/bin/ehai.cmd doctor`; it is not on PATH). Read, never
  paste as a whole (it is full of local paths): the daemon row for this
  workspace (`v<runtime>`, `engine <revision>`, the Effect House version), the
  `CloudEH:` line (the engine the installed version ships; name both when they
  differ), and any `[fail]` line, which goes in verbatim. Compare the daemon's
  version with the plugin version yourself and say when they differ, even
  though the doctor passes. A `version mismatch` or `updateNotice` seen in this
  conversation goes in too. If the doctor itself fails, say so instead.
- **OS**: the doctor's `host:` line gives the platform and architecture; add the
  version from `sw_vers -productVersion` on a Mac or `cmd /c ver` on Windows.
- **Host and host version**: the host you are running in (Claude Code or Codex)
  and its version from `claude --version` or `codex --version`; leave the
  version out if the command is not found.
- **Posting account**: `gh auth status`. Signed in: the issue would be posted
  from that GitHub account, which the user must be told; otherwise it is posted
  from the user's own account, through the link.
- **What the user did**: their request in their words, and the tool calls that
  followed, named by tool (`studio_open`, an `eh` cell, `effect_publish`).
- **What happened**: the exact tool result or error text from this conversation,
  trimmed to the lines that matter, and what the user expected instead.
- For a feature request: what they want to be able to do, and why.

Ask the user only for what the conversation does not already hold. One question
at a time, in their language.

## 2. Make it safe to publish

Before drafting, strip from every field — and tell the user you did:

- TikTok account names, nicknames, user ids, effect ids they did not ask to share.
- Local paths that carry a user name: `/Users/<name>/…` and `C:\Users\<name>\…`
  become `~/…`; keep only the part of a path that shows the bug.
- Tokens, cookies, session ids, QR codes, anything from `~/.ehai/session.json`.
- Request or log ids: replace each with `[log id removed]`, so the quoted text
  stays otherwise exact; if the team asks for it on the issue, the user can pass
  it on privately (Discord), not in the issue.
- Screenshots and recordings: the plugin attaches none; the user may add one on
  the issue page afterwards, once they have checked what it shows.
- Internal ticket numbers or the names of people on the team.

If the user insists on keeping one of these, keep it, and say once more that
the issue is public.

## 3. Draft, show, and get an explicit yes

Write the issue in English (the team's language), in the same sections the
repository's issue form uses, so both ways of posting produce the same shape:

```
### Plugin version
0.0.136 · runtime 0.0.136 · engine 6b79295 · Effect House 5.16.0

### Host
Claude Code 2.1.309

### Operating system
macOS 26.1 (Apple silicon)

### What you did and what happened
1. Asked for "a sticker that follows my face"; the agent called studio_open.
2. The Studio page opened but the preview stayed black for two minutes.
Expected: the live preview.
Tool result: `{"ok": false, "message": "Effect House is not reachable"}`
```

A feature request uses `### What you want`, `### Why / what it would let you
do`, and `### Plugin version`.

Show the title and the whole body to the user in the chat, say in one line that
it will be posted publicly on GitHub and from which account (step 1), and ask
whether to post it. **Post only after an explicit yes.** A change they ask for
is a new draft and a new yes. Never post on your own judgement, and never post
twice: a retry after an error first checks whether the issue already exists.

## 4. Post it — the `gh` way, else the link way

**With the GitHub CLI.** When `gh` is installed and signed in (step 1), write
the body to a temporary file and run
`gh issue create --repo tiktok/effect-house-agent-plugins --title "<title>" --body-file <file>`
with the title in single quotes and no `'` inside it. Add `--label bug` (or
`--label enhancement`), and run it again without the label if gh refuses it.
It prints the issue's URL: give it to the user as the result, and delete the
file. If `gh` is missing, signed out, or the create fails, say nothing about
installing or signing in to `gh` — go the link way.

**With a link.** Build the issue form's address with every value URL-encoded
(newlines as `%0A`, spaces as `%20`), and give the user the finished link to
open, check and submit:

- Bug: `https://github.com/tiktok/effect-house-agent-plugins/issues/new?template=bug_report.yml&title=<title>&version=<version line>&host=<Claude Code or Codex>&os=<os>&steps=<the steps section>`
- Feature request: `https://github.com/tiktok/effect-house-agent-plugins/issues/new?template=feature_request.yml&title=<title>&summary=<what they want>&why=<why>&version=<version line>`

The page needs a GitHub account; the fields arrive filled in, except a dropdown
(Host), which GitHub may leave for the user to pick. Keep the link under about
2,000 characters: shorten the steps to the essentials and let the user add the
rest on the page. If the page shows a template chooser instead of the filled
form (the template is not there yet), give the user the title and body to
paste into the matching form. Tell them to press **Create** there; nothing is
posted until they do. Do not show the query string as a thing to read — the
link is the deliverable.

**After posting.** The team answers on the issue; the user follows it there.
Nothing else to do here, and nothing in the project changes.
