---
name: publish
description: Send a finished effect to Effect House for review — "publish this
  effect", "submit it to TikTok", "put it in my portal", "send it
  as a new version of …". Builds the package, checks what Effect House checks,
  then — only after the user says yes — submits it for review with the same
  call Effect House's own Publish window makes: a new effect or a new version of
  one already on their account, with its category, tags, trend, challenge and
  default sound. One effect_publish call, twice.
---
# publish — the effect into Effect House's review queue

> **Signed out?** Every tool answers `not signed in` (or `session EXPIRED`) until
> the user has signed in. Do not send them to a terminal: call the `auth_login`
> tool — it shows a QR code in the chat that they scan with the TikTok app, then
> wait for the scan with `auth_login_status` until it reports `signedIn` and
> retry what they asked. Tell them, briefly and in their language, along these lines:
> "Using the EHAI plugin requires signing in — scan this QR code with the TikTok app."
> Only if `auth_login` itself fails do you fall back to the CLI:
> run the command the refusal literally hands you plus `--no-wait --json`
> (normally `~/.ehai/runtime/current/bin/ehai login --no-wait --json`; on Windows
> `~/.ehai/runtime/current/bin/ehai.cmd login --no-wait --json`; it is not on PATH).
> It writes `ehai-login-qr.png` into the current directory and returns at once —
> show that image to the user, end your turn, and when they say they scanned run
> the same command with `--wait`. Nothing else works until they are signed in.

**Recommend the review card's fields before the dry run.** Do not leave them
empty for the user to fill in by hand, and do not show lists to choose from.
Call `publish_options` once: it reads the trends and open challenges and shows
no card. Never call `trends_list` or `challenges_list` while publishing, because
each one pops the ideas card into the chat. Then, for each field the user has not
given, draft a value from what this effect actually does — the project, what you
built, the preview — and pass it in the dry run, with one short reason in the
user's language in `reasons` (`reasons.hint`, `reasons.category`, and so on):

- `category` and `hint`: the ones that fit best (the lists are below).
- `description`: one or two plain sentences on what the effect does. Claim
  nothing that is not true of it — no feature, trend or popularity it lacks.
- `trendId`: the trend this effect was built from, else one in `publish_options`
  that fits what this effect does. When none does, leave it out and say so in
  `reasons.trendId`. Never force one.
- A challenge: most are broad, one kind of effect, so compare the kind of effect
  this is with each brief and recommend the one it fits. Joining happens in Effect
  House and no tool can see it, so `entered: true` (this account already has an
  entry there) is the only proof of joining: then pass it as `challengeId`.
  Otherwise pass it as `suggestedChallengeId`: it stays unselected, so recommending
  costs the user nothing, and the card offers its join link and "I've joined".
  `reasons.challengeId` says why it fits; the card already says about joining.
  When none fits, leave both out and say so in `reasons.challengeId`.

Then say in one line that these are your suggestions and can be changed on
the card (or in the chat). Without a card, nobody sees `reasons` and the dry
run's `summary` does not name your drafts: list each drafted value — hint,
category and description, and the trend or challenge if any — with its reason
in your reply before you ask for the yes. For a `suggestedChallengeId`, give
its `url` and ask whether they joined; pass it as `challengeId` only after they
say yes. A value the user gives always wins; their Submit click, or their yes,
is the decision — never submit on your own drafts.

**Two calls, never one.**

1. `effect_publish {}` (plus the fields below) — a DRY RUN for the current
   effect project (the one the engine has open). It exports the package and checks it here (script lint, size, icon, name); the package is not uploaded.
   It does not submit the effect for review or consume a submission quota.
   It reports `name`, `sizeBytes`, `icon`, `warnings`, `blockers` — and, when
   you passed `effectToUpdate`, `category`, `tags`, `trendId` or `challengeId`,
   a `summary` line naming them, e.g. "Update of Wet Glass (v1 → v2) — the live
   version keeps running until this one passes review · category: Funny · tags:
   rain, glass".
   It also answers a `checkId`: the receipt of what it checked.
   - `check_unavailable` (on the dry run): no `checkId` was issued, so nothing
     can be confirmed — run the dry run once more; if it repeats, tell the user
     their EHAI engine needs an update, and stop.
   - `already_submitted` (on the dry run): this build with these fields and this
     icon already went to Effect House in the last 15 minutes, as the answer's
     `effectId` (`pageUrl` links its status), so no `checkId` was issued. Do not ask for
     a yes and never resubmit: tell the user it is in review as that `effectId`
     and report its status with `effects_list {id}`. Only a changed project,
     changed fields or a new icon can be submitted again, after a new dry run and
     a new yes.
2. Show the user that report in their own words — what it will be called, how
   big it is, anything in `warnings`, and the `summary` as it reads — and
   **wait for a yes**.
3. `effect_publish {confirm: true, checkId}` with the dry run's `checkId` and
   exactly the fields the user said yes to — SUBMITS the effect for review on
   THEIR Effect House account. This is the real thing: the same request the
   Publish window's Submit button makes. No field carries over from the dry
   run: pass the same ones again (a field left out is left out of the
   submission). It answers with `effectId` and
   `pageUrl`, the effect's Analytics page here, where its review status shows.
   - Without a `checkId` it is refused (`dry_run_required`): run the dry run.
   - `stale_check` means the project or the fields changed since the dry run,
     or the `checkId` is unknown or past its 15 minutes (`changed` says which).
     Run the dry run again, show the new summary, and ask again — never resend
     the old `checkId`. When `changed` names `submitted`, that check (or another
     of the same build and fields) already went to Effect House as the answer's
     `effectId`: do not run the dry run or ask again — say it is in review as
     that `effectId` and report its status with `effects_list {id}`.
   - `check_in_use` means a submission with that `checkId` is already running:
     wait for its answer, and never send a second confirm.

Never call with `confirm: true` on your own initiative, and never on the first
turn of "publish this": the dry run is how the user finds out what is about to
carry their name, and the submission counts against Effect House's hourly and
daily limits for their account.

**On a host that shows cards** the dry run appears as the publish card: tell
the user to check the card and press Submit, or to tell you to submit. Never
call `effect_publish` with `confirm: true` after the card was shown unless the
user says so in the chat. When the card reports (in the model context) that
the user submitted, with the `effectId`, report its status with
`effects_list {id}`. When it reports that a Submit's outcome is unknown, or
`effect_publish` answers `outcome_unknown`, check `effects_list` before
anything is submitted again.

**A new effect, or a new version of one?** Without `effectToUpdate` every
submission is a NEW effect on their account. When the user says "update",
"new version" or "resubmit", or the project is a re-edit of something they
already published, ask which effect it is a new version of — never guess — and
take its id from `effects_list {query: <name>}` (the effects guide,
`../effects/GUIDE.md`, resolves names). Then pass `effectToUpdate`:

- *active / launched* → an update: the new version goes to review and the live
  one keeps running until it passes ("Update of X (vN → vN+1)").
- *needs modification / draft / uploaded* → it replaces that pending
  submission ("Replacement of X's vN submission") — the usual path after a
  rejection has been fixed.
- *under review / processing* → refused: wait for the review to end. When it
  is an update under review, the user can instead withdraw it in the Manage
  menu of the effect's Analytics page: give that link (the refusal's `pageUrl`;
  `effect_analytics {id}` has it too) and say what withdrawing does — the
  pending update leaves review and the live version keeps running.
- *deactivated / taken down* → refused: Effect House takes no new version of
  it.
- Either way the refusal arrives as the dry run's blocker, before anything is
  built; publishing as a new effect instead is the user's call, not yours.
- Before an update, Effect House's pre-submission check runs; when it fails,
  quote its errors verbatim.

**Fields you can pass** — the user's values first, then your drafts (above);
ask for the rest:

- `name` (≤ 25 chars) — required in effect for a new effect; an update without
  it keeps the effect's current name.
- `hint` — a key from Effect House's fixed list, see below.
- `description` (≤ 300 chars, optional; Effect House calls it "comments") —
  your draft says only what is true of the effect.
- `category` — one of `green_screen`, `funny`, `atmosphere`, `beauty`,
  `accessories`, `interactive`, `editing`, `animals`, `world_ar`, `events`,
  `music` (a label such as "World AR" also works). Any other word is refused,
  not sent as "no category"; leave it out for none. An update does not copy
  the old effect's category, so pass it again if it should keep one.
- `tags` — at most 10, each at most 20 characters; blanks and repeats are
  dropped. Propose a few only if the user wants tags, and let them agree.
- `trendId` — from `publish_options`: the trend this effect was built from or
  truly fits (it travels as Effect House's "inspiration"); name the trend, not
  the id. The card's Trend field lets the user pick one themselves.
- `challengeId` — from `publish_options`, only for an open challenge with
  `entered: true` or one the user says they have JOINED; when Effect House
  refuses it, quote its answer and ask whether to submit without the challenge.
- `suggestedChallengeId` — an open challenge that fits but is not known to be
  joined. Never submitted; it only puts the challenge's offer on the card. A
  confirm does not take it.
- `reasons` — one short line per field you drafted (`hint`, `category`,
  `description`, `trendId`, `challengeId`). Shown under the field on the card and
  gone once the user changes that field; never sent to Effect House.
- Trends before making an effect, and what challenges are open when the user
  asks, are the ideas guide (`../ideas/GUIDE.md`).

**The default sound** is part of the project, not a field of this call: choose
it BEFORE the dry run with `sounds_search`, then
`eh.sounds.select(id, {startTime, requireLyrics: false})` in the `eh` server's
`run` tool, or in the Studio's Publish window → Default sound. The ideas guide
has the details; re-run the dry run after choosing it.

**A blocker you cannot fix** — `account_not_ready`: this Effect House account
cannot publish yet (kids mode, terms not accepted, the latest terms, a ban).
Read its message to the user verbatim, give its link, and stop; nothing in
the project changes that. For the terms (`account.code` `terms` or
`latest_terms`) the user reads them at that link and presses **I agree** in
the Studio's Publish window themselves, then the dry run is run again. Never
accept the terms for the user — no tool does, and do not reach for the
service's routes to do it.

**Blockers you can fix, then re-run the dry run** — Effect House requires both an
icon and a name (the two starred fields), so a missing one stops the dry run:

- *needs a name* → the project is still called "Untitled…"; ask the user what
  to call it and pass `name`. Required.
- *no Effect House icon* → `effect_icon_set {}` (the icon skill) and try
  again. Required — an effect cannot be submitted without one.
- *icon over 2 MB* → set it again; the tool writes a compliant one.
- *name over 25 characters* → Effect House's own ceiling. Shorten it WITH the
  user, do not silently truncate their title.
- *description over 300 characters* → same: shorten it with them.
- *too many tags, or a tag over 20 characters, or a category off the list*
  → answered as `invalid` before anything is built; fix it with them.
- *scripts do not lint clean* → fix what the blocker names, then re-run the dry run.
- *hint is not on the list* → `hint` is a key out of a fixed list, not a
  sentence: `tap_your_screen`, `show_your_face`, `open_your_mouth`, `smile`,
  `blink`, `tap_to_change`, `show_full_body`, `none`, and ~50 more in the same
  family (the blocker message names some). Pick the one that matches what the
  effect asks people to do; when nothing fits, leave it out.
- *the effect to update cannot take a new version* → see above; tell the user
  why in the blocker's words.

**Warnings — disclose, do not silently push past**

- *over the size ceiling* → the real bound is per-account, so the upload may
  still go through; say so and let them decide.

**After a successful submit, how to say it.** The effect is **in review** —
Effect House will look at it; it is **not published and not live** until
approved (an update's live version keeps running meanwhile). Say that plainly,
give the `effectId`, and give `pageUrl` as the link to follow its review (it
reads the status through the plugin's own sign-in; it is the only link, and no
Effect House address shows an effect). What these tools do
not do: a demo video (the plugin cannot attach one), and Icon 2, the optional second icon,
which the person sets in the Studio's Publish dialog; a submission carries it
when it is there. Do not offer to fill those in, and never describe the effect
as live. A trend, challenge or
default sound travels with a submission: one that was missed goes in with the
next version (`effectToUpdate`), since `effect_update` changes only the name,
hint, category and tags.

**Limits are a wait, not a fix.** "too many this hour" / "too many today" are
Effect House's own submission quotas for the account; tell the user when to try
again rather than retrying.

**On a phone** (the preview guide, `../preview/GUIDE.md`). Phone preview may
be refused by Effect House's risk check (`blocked: true`, code `risk_blocked`):
it refuses the package, not the account; when it works, `effect_preview`
returns `previewUrl` with its QR code — show the QR code to scan with TikTok on
the phone, not the link (on a computer it opens a TikTok web page). On a
refusal, changing the package and retrying is unlikely to help: preview the
effect in Effect House itself. Submitting is unaffected: the submission upload
accepts the same package.

**After submitting — where it stands.** "how is it doing / did it pass review / why was it rejected" →
`effects_list {id: <effectId>}` instead of guessing; the effects guide covers
the review state, the reasons (quote them verbatim) and the numbers.
