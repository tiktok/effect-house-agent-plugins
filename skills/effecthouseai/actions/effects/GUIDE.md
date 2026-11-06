---
name: effects
description: The user's PUBLISHED effects on Effect House — "how are my effects
  doing", "views this month", "who uses my effect", "compare my effects", "why
  was it rejected", "share link / QR", "rename it, add a tag", "take it off
  TikTok", "withdraw the update". Reads with effect_analytics and effects_list,
  shares with effect_share, edits details with effect_update; deactivate,
  withdraw and delete stay the user's, on the effect's page.
---
# effects — how the user's effects are doing, and what to do with them

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
> A read that answers `sign_in_required` with `signIn: true` means the same thing.

Everything here is about effects already SUBMITTED to Effect House. Making or
submitting one is the publish guide (`../publish/GUIDE.md`).

**Which effect?** Resolve a name with `effects_list {query: <name>}` (`status`
narrows it; newest first). One match → use its `id`. Several → a numbered list
(name, state, version) and ask. Never guess between two.

## How they are doing

- "How am I doing" → `effect_analytics {}`: the account overview. `stats` has
  views, posts, opens, likes and shares, each with `value`, `delta1d`,
  `delta30d` and, in the top 25 %, `topPercent`; `topEffects` (the five most
  viewed), `counts` (total, live, in review, needs modification), `audience`
  and `pageUrl`.
- One effect → `effect_analytics {id}`: its `stats`, `audience`, the reviewer's
  `reasons`, `details` (hint, category, tags, challenges), the most popular
  TikTok `videos` made with it, `offers`, `viral` and `pageUrl`. The page to
  open or link is always `pageUrl`; give no Effect House address for an effect,
  since its effect pages now answer with Effect House's home page.
- Say a change with its sign and its window: "+1,240 views in 30 days, +35
  today". A missing `topPercent` means outside the top 25 %, not zero.
- "Who uses it" → `audience`: region, gender, age and device, for the creators
  who post with it and the viewers who watch; quote the percentages as given.
- Compare two to four effects: one `effect_analytics {id}` each, then a table
  with one column per effect and a row per stat.
- On a host without cards answer with a short table (stat | value | 1 day |
  30 days), then the top effects, then `pageUrl`.
- On a host with cards the effects card shows the numbers, the effect picker
  and the share QR: keep the reply to one or two sentences and do not repeat
  the table. A compare request shows a "not built yet" card: compare in text
  from each effect's numbers, as above.
- **Open the Analytics page beside the chat** (`pageUrl`): `entranceId` and
  `hostAction` carry the Studio's host-sidebar contract (preview guide) — open
  or reuse it on first delivery or an explicit reopen; if the host cannot, give
  `pageUrl` as a link and say it was not opened; never offer a chart over time.
- Badge: the overview's `account` names the level; the steps to the next
  level, rewards to claim and earnings are on the Analytics page under Badges
  and earnings. Claiming and joining Effect Creator Rewards happen in Effect House.

## Where it stands, and why it was rejected

`effects_list {id}` (or `{query}`) gives each effect's review state and, when
it was sent back, the reviewer's `reasons` — quote them **verbatim**; they say
what to change. The fix goes in as a new version of that effect (`effectToUpdate`
in the publish guide), not as a new effect. In review means not live yet; say so.

## Share

`effect_share {id}` → `shortUrl`, the link that opens the effect in TikTok,
and a QR code. Only an Active or Launched effect has one; any other state
answers `wrong_status` — tell the user the effect's state instead.

## Edit details: name, hint, category, tags

`effect_update {id, …}` WRITES to the user's Effect House account, and only an
Active effect or one that Needs modification can be edited.

1. Read the current details: `effect_analytics {id}` → `details`.
2. Show the change as before → after, and say Effect House may put the effect
   back into review (not live with the new details until approved).
3. Wait for a yes, then call it with only the fields that change.
4. Report `backInReview` and `status` from the answer.

`tags` replaces the whole list: to add or remove one tag, send the full new
list built from `details.tags` (at most 10, each at most 20 characters).
`hint` is a key from Effect House's fixed list, not a sentence. A live
effect's challenge and icon are not editable here: they travel with its next
version (the publish guide's `effectToUpdate`).

## Manage: deactivate, reactivate, withdraw, delete

No tool does these: the user confirms each one in the Manage menu of the
effect's Analytics page. Say what it does and hand them the page.

1. `effect_analytics {id}` — `offers` says which of `activate`, `deactivate`,
   `withdraw` and `delete` apply to the effect now.
2. Name the consequence before giving the link:
   - **deactivate** takes the effect off TikTok; it can be reactivated later.
   - **reactivate** (`activate`) puts a deactivated effect back on TikTok.
   - **withdraw** drops the pending update from review; the live version keeps
     running. Only an update under review has it.
   - **delete** removes the effect and cannot be undone. A first version under
     review has no withdraw: deleting is the only way to pull it.
3. When `viral` is true, warn first: people are using it widely right now, and
   deactivating or deleting stops that.
4. Open the effect's page beside the chat (as above) or give `pageUrl` as a
   link, and say the Manage menu there confirms. You cannot see the click:
   never say it is done; when the user says so, read `effect_analytics {id}`
   again and report the new state.

Reads (`effect_analytics`, `effects_list`, `effect_share`) need no
confirmation; `effect_update` always does.
