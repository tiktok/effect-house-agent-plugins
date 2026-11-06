# Choosing controls — routes, dials, widgets, ranges, traps

Read this after `effect_controls {action:"inspect"}` and before `set`, when you decide
which dimensions of the effect deserve a knob and which widget each gets. On PTC a knob
binds one live property of the open project: a Manager script's Gameplay Tuning field
(`<workspace>/reference/CREATOR_CUSTOMIZATION.md`) or a component property on an object
(a FaceMakeup region's `intensity`, a filter's strength). Position, size and scale are
vectors and never appear as candidates (the drawer has no vector widget); a
ScreenTransform's scalar `rotation` does appear, ranked after script and look properties.
Prefer a Manager field the script writes into the transform when the script already
drives that transform (a bound `rotation` and an animation fight every frame); otherwise
binding `rotation` directly is legitimate. Nothing here invents a seam; a dimension with
no seam is reported as not bindable with its reason.

## Route first — by terminal outcome, first match wins

The route is what the user finally gets — never the title, the input mode (tap, drag,
face and hand are inputs) or an object kind:

1. **gameplay-challenge** — a real score, timer, win/loss, round, obstacle or goal loop.
2. **ai-generative** — the result is freshly produced by a model, not a pre-authored card.
3. **social-randomizer** — the result is a friend pick, ranking, match or random reveal.
4. **spatial-environment** — the experience depends on world tracking or plane placement.
5. **capture-utility** — the user shoots, records, exports or repeatedly produces media.
6. **media-composition** — layout, crop, timeline, transition, lyrics, slideshow, visualiser.
7. **stateful-interaction** — touch, hold, drag, draw, reveal *is* the experience.
8. **appearance-look** — a look: makeup, retouch, filter, warp, accessory, hair, avatar.

Two boundary calls: a visual the face, head or body drives with no user input (a neon
outline, a pendant swinging with the head) is appearance-look, not stateful-interaction —
interaction needs the user's own touch or gesture. A result a fixed formula, shader or
random pick of authored assets produces is appearance-look or social-randomizer, not
ai-generative.

## What is worth adjusting, per route

| route | read first | dials worth a control | real play means | trap |
|---|---|---|---|---|
| gameplay-challenge | the Manager script and its Gameplay Tuning fields; the objects and scripts that own spawning, obstacles and hits; the HUD Text objects the script writes | length and scale (rounds, lives, target count), pace (spawn interval, speed, ramp end), reaction window (lifetime, tolerance, hit size), reward and penalty (points per hit, misses allowed), feedback strength | a whole round through `preview_interact`: start → the core input consumed → feedback → end state → replay, with the author's real input protocol | a ramp has two speeds — one field, the script derives the ramp end; a value that shows in HUD text ("3/5") must be script-set from the same field or the knob lies; score, timer and countdown are state, not dials; the failure ending is a legitimate end state |
| stateful-interaction | the script that receives the touch events, its state machine, the object it moves or reveals | sensitivity, threshold, reach or area, smoothing, progress step, response feedback | replay the real gesture with `preview_interact` (a drag is down, moves, up) and watch trajectory, latency, revealed area or state change | confirm the script consumes the gesture; an animation and a drag writing the same transform fight every frame |
| appearance-look | FaceMakeup regions, Face Retouch, Eye Color and hair objects; filter and post-process objects; face-anchored sticker objects and the script that places them — before generic scene objects | overall strength (ONE Manager knob the script fans out to each region's `intensity` with per-region scales), tint of an untextured layer, texture or smoothness, a warp axis, accessory size or tilt as a script knob, a mirrored pair as one knob | a frozen, aligned face region in `preview_screenshot`: region colour, hue, edge, landmark geometry, accessory bounds — never a full-frame pixel diff | never degrade "overall look" into one toggle per region or re-label one region's `intensity` as "makeup"; a FaceMakeup `color` multiplies the texture and applies only when `opacityEnabled` is on (`<workspace>/skills/face-makeup/references/makeup-regions.md`), so it is not offered unless the tint is verified; a sticker's size and position are vectors (no candidate): tune them through a scalar Manager field the script applies; its `rotation` is a scalar candidate — bind it only if no script writes that transform |
| media-composition | the Image and Video slot objects, the Text objects, the script that sequences them | layout, crop, layer order, count, interval, transition length, text style and timing, audio reaction | freeze the media input, then check slot identity, geometry, order, text and timestamps | a media slot is not playback: a still chosen frame can be the correct experience |
| social-randomizer | the pick script and its reveal state machine; the pool JsonAsset under Theme & Assets | participants or pool size (how many are used), slots, reveal pace, result layout, retry | a reproducible reveal: the result state and a reroll both observed | the pool content (names, prizes, cards) is JsonAsset content, not a control; a small sample proves no fairness claim |
| ai-generative | the script that sends the request, its input, success and failure branches, the result Image | input composition, style preset, result count or choice, blend or mask, transition, dwell time, retry | the model consumed a fresh input and produced a non-placeholder result; success, failure and timeout branches | a trigger acknowledgement, a countdown or a spinner is not a result; report trigger, host callback and final content separately |
| spatial-environment | the world-tracking and placement objects and their script; anchors; the world presets | placement size, height and distance, surface rule, drag, pinch and rotate sensitivity, object count, occlusion, lighting | reach tracking-ready and placed first, then measure placement delay, transform delta, drift | a face-only preview cannot judge world placement — leave the control a candidate and say so |
| capture-utility | the capture script, the snapshot slot objects, the countdown, flash and timer state | output count, interval, countdown, flash, framing, slot, repeat and reset lifecycle | the whole capture lifecycle: count, tap-to-output delay, interval, timing, repeat | a recording control is a lifecycle, not a value; do not fake it with a toggle |

## Grouping — a few orthogonal dials, not a field table

- Two to eight independent, high-level dials: a simple look two, a rich game up to eight.
  One dial is monotonous; one slider per field is a field table. Every dial is a feel the
  owner can name — longer, faster, wider, stronger.
- **One dial = one causal chain = one Manager field; the script applies it everywhere it
  belongs.** Eighteen mole targets read one `moleSpeed`; the pointer and the wheel spin
  from one `spinTurns`; a makeup strength fans out to three regions with their own scales;
  a hat size writes both transform axes. When two properties must move together and no
  script ties them, add the field and the wiring first — never two controls for one feel.
  Two independent feels (length and pace) never share a dial.
- **A dial is read where it acts, every frame — not once at start.** The drawer writes the
  field while the owner drags. A script that applies it once in `onStart`
  (`hat.localScale = base * this.capSize`) changes nothing on screen until the effect
  restarts: the drag shows nothing and the drawer has to reload the preview after each
  release. Keep the authored base in `onStart` and apply `base * this.capSize` in
  `onUpdate`, or re-apply only when the value changed. A knob only a restart can honour (how
  many objects are spawned, a layout built once) is still bindable; say so in its intent.
- Orthogonality is tested, not assumed: push dial A to its end; B and C keep their
  authored values on screen.
- Never pad the panel: no visibility toggles, no one-shot juice (a 0.25 s pop, an intro
  bounce), no copy, no field under a second name. A one-dial effect gets one dial.
- The dimensions the prompt named come first under the cap of 8; what it did not name
  fills the rest only when it is a real feel.
- A dimension with no seam (a literal in a script, a list, a vector) is reported as not
  bindable with its concrete reason — which object, which script, which literal — so the
  owner knows what to declare next.

## Widget by the nature of the value

The drawer has five widgets: `slider`, `select`, `toggle`, `color`, `text`.

| value | widget |
|---|---|
| a continuous quantity (pace, duration, strength, tolerance, a count that varies smoothly) | `slider` with its unit named |
| two to five named levels (easy / normal / hard, shape, mode, preset) | `select`; the options contain the authored value, labels in plain words |
| on/off, an optional feature | `toggle` — never a 0–1 slider |
| colour of an untextured layer (a solid Image, a Text, a light) | `color` (alpha stays authored) |
| uniform size of an accessory | ONE `slider` on the script's scale field |
| planar position | two `slider`s on script `x` and `y` fields; depth stays authored |
| tilt | a `slider` in the owner's unit (turns for a wheel, degrees for a hat) |
| a list (levels, names, prizes) or a vector | not bindable: content is a JsonAsset, a vector needs a scalar script knob |
| copy (titles, captions, hints) | not a control — a one-shot edit on request; `text` only when the user asked for editable text |

A panel naturally mixes widgets; all sliders means the grouping was lazy. A route with no
toggle-worthy state legitimately has no toggle.

## Ranges — for the owner's search

- Anchor at the authored value: the default sits inside the range, never at an edge.
- A pace (interval, speed, duration) reaches at least double and half the authored value —
  usually 1/4× to 4×. Counts move on integers with `step: 1`. Strengths and opacities span
  0–1. A size or distance reaches a visibly different look at both ends.
- Both ends must still play: a top that trivialises the game (a catch pouch wider than the
  lane) or a bottom that breaks the look (an ear height of 0, one placement) scores zero.
  Narrow the range instead, and say why in `intent`.
- Step ≈ span ÷ 100, rounded to a 1-2-5 number (0.01, 0.02, 0.05, 0.1, …, 1, 2, 5, 10).
- Name the unit in the owner's terms: turns rather than degrees × 360 when the owner thinks
  in turns; seconds, not milliseconds, for a round length.

## Honesty

- A host gap (no AR plane, no friends data, no microphone, no model) is three separate
  facts: the source triggered; the host callback arrived or not; the visual result appeared
  or not. It is a diagnosis, not "unplayable" and not "done".
- Before publishing, every control is seen to move something: one cell changes the bound
  property, one look at the preview confirms it — without a reload in between, or the knob
  is read only at start (see Grouping). An unverified control is not published.
- Never re-label a property to sound like a different dial: a region's opacity is not
  "makeup", a spawn interval is not "difficulty" unless the script makes it so.
- A dimension whose seam is missing is reported as not bindable, never replaced by a
  decorative stand-in.
