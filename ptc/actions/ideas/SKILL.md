---
name: ideas
description: Ideas and targets for an effect — "what's trending that I could
  build", "give me an effect idea", "any challenges right now / what can I
  win", "did my effect get into the challenge", "find a song for this effect",
  "find a 3D crown". trends_list, challenges_list, sounds_search,
  library_browse, models_search and models_import; all read-only.
---
# ideas — trends, challenges, sounds and assets

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

**On a host with cards** `trends_list` and `challenges_list` show the ideas
card — covers, banners, days left and the user's entries, a tab each. Say one
line and let the user pick there; do not repeat the list. The card's Build
this and Enter with the current project arrive as the user's message with the
`trendId` or `challengeId`: act on it as below. Enter asks only for the publish
dry run — joining still happens in Effect House first.

## Trends — a trend is the brief

`trends_list {limit?}` (default 15, at most 24) reads Effect House's
inspiration feed: each trend's `title`, `summary`, the effect `categories` it
suits, the example video's `views` and its `tiktokUrl`.

- Offer three to five, numbered, each with one line saying what effect would
  answer it. Name the trend, never the id; link `tiktokUrl` for the example.
- When the user picks one, it is the brief for a NEW effect: build it in a new
  project (the projects guide, `../projects/SKILL.md`), and keep the trend's
  `id` — it goes in as `trendId` when the effect is published (the publish
  guide, `../publish/SKILL.md`).
- Do not add popularity claims beyond the `views` given.
- Trends come before making an effect: offer them when the user wants to make
  one with no clear idea, or asks for ideas or what is trending. Never call
  `trends_list` or `challenges_list` during a publish, because they pop this
  card: there, `publish_options` reads the same choices with no card, and only
  one that fits is filled into the publish card (the publish guide).
- The reply's `pageUrl` is the Explore page for trends_list and the
  Challenges page for challenges_list;
  `entranceId` and `hostAction` carry the host-sidebar contract (the preview
  guide): on first delivery or an explicit reopen, open or reuse it beside the
  chat when the host can, else give the link and say it was not opened.

## Challenges

`challenges_list {}` reads Effect House's challenges: open and upcoming ones in
full — `when` (days left), `incentive` (the prize), `description` (the brief),
`subtasks` (sub-challenges) and `url` — ended ones in brief. Each carries this
account's entries: `myEntries` (name and review status) and `myEntryCount`.

- "Any challenges?" → for each open one: days left, the prize, the brief in a
  sentence or two, the sub-challenges, and its `url`. Open the Challenges
  page (`pageUrl`, `entranceId`) in the host sidebar as for trends.
- **Entering.** Joining happens in Effect House, and no tool can see it. Give
  the challenge's `url` to join; only after the user says they joined, enter
  by publishing with its `challengeId` (the publish guide). An entry this
  account already has there counts as joined. Pick an open one.
  A live effect enters with its next version (`effectToUpdate` and
  `challengeId` together). Effect House decides at the submission; quote its
  refusal word for word.
- "Did my effect get in?" → that challenge's `myEntries` and their status.
  `entriesError` means the entries could not be read: say so, never "none".
- Prizes and payouts are paid by Effect House; nothing here claims them.

## Sounds — the effect's default sound

The default sound is part of the project, so choose it BEFORE the publish dry
run, and run the dry run again after changing it.

1. `sounds_search {query?, source?, withLyrics?, limit?}` — the tabs of Effect
   House's sound library: `recommended` (the default without a query),
   `favorites` (the user's hearted sounds), `lyrics`, `search` (the default
   with a query). Rows: `id`, `title`, `author`, `durationSec`, `hasLyrics`,
   `favorite`. `withLyrics: true` keeps songs with usable lyrics — what a
   lyrics effect needs.
2. Offer three to five, with author and length, and ask which.
3. Select it in the `eh` server's `run` tool:
   `eh.sounds.select(id, {startTime, requireLyrics: false})` — `startTime` in
   seconds within the clip (up to `durationSec`), e.g. where the chorus
   starts. Without `requireLyrics: false` a song with no lyrics is refused;
   a lyric effect keeps the default, so its lyrics reach the preview.
4. Chat cannot play audio. To listen first, the user opens the Studio's
   Publish window → Default sound, which plays each one; hearting a favourite
   happens there too.

## Library assets and 3D models

- **Effect House's asset library first.** `library_browse {query, category}` —
  `category` is a shelf named in the tool's own help (take it from there, not
  from memory); covers come back as a card, or as a numbered cover sheet with
  each item's `assetId`. On the card, say one line and let the user pick there:
  do not repeat the list or embed covers. The card's Apply adds one; without a card, import the
  chosen `assetId` with `eh.library.import` in an `eh` cell, then place it.
  Game Modules (`game_module`: joystick, counter, timer, progress or HP bar)
  are script prefabs, a prefab plus one TypeScript controller; find them with
  `library_browse`, since this engine's own `eh.library.search` lists none.
- **Sketchfab when the library lacks it.** `models_search {query}` lists
  downloadable models: show name, author, licence and face count, and prefer
  light ones. `models_import {uid}` downloads one as a .glb; then import it in
  an `eh` cell as its answer says, so it is your own undoable edit. Without
  the user's Sketchfab token it answers `token_required`: relay what it says.
- Licences travel with the model. A non-commercial (NC) or no-derivatives (ND)
  licence can conflict with publishing: say so before the effect that uses it
  is submitted, and credit the author as the answer gives it.
