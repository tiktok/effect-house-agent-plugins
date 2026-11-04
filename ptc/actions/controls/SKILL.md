---
name: controls
description: Give an effect AI CONTROLS — the few knobs a creator tunes in the preview card's Adjustments drawer (a speed slider, a colour, an on/off toggle, a choice) — or check, change and remove them. "add a speed slider", "let me tweak the colour", "what controls does it have", "the drawer shows a stale control". effect_controls inspect, then set; get and clear.
---
# controls — the knobs in the card's Adjustments drawer

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

AI Controls are at most **8** knobs the user tunes in the preview card's
Adjustments drawer (its Adjustments button opens it). Each one is bound to a **live property of the open project** —
a script's `@serializeProperty` field or a component property — so the drawer
edits the project itself: a slider previews while it is held and commits once on
release (one undo step), a toggle or a choice commits on change, and the value is
saved with the project. Only the binding and the widget are published (in the
project's `.ehai/controls.json`); you never store a value.

## 1. Make the knobs real first

A control exposes something the effect already reads. Before publishing:

- Follow the creator-customization standard of the PTC workspace,
  `<workspace>/reference/CREATOR_CUSTOMIZATION.md`: 3–8 knobs in the manager
  script's Gameplay Tuning group, short Inspector labels, a tooltip,
  `@slider`/`@spinBox` ranges and a runtime clamp, safe defaults.
- Declare and wire each field as `<workspace>/skills/serialize-property/SKILL.md`
  says. (`<workspace>` is the PTC workspace root, the folder holding the
  workspace guide `AGENTS.md` the EHAI skill sends you to.)
- In a cell, change the field once and look at the preview: a knob that moves
  nothing on screen is not a control.

## Choosing the knobs

Read `references/choosing-controls.md` after `inspect` and before `set`: it
routes the effect by what the user finally gets, names per route what to read
first (the Manager script's Gameplay Tuning fields, the objects and components
that own the behaviour) and which dials are worth a control, and lists the traps.
The rules it enforces, in one breath:

- Two to eight orthogonal dials, each a feel the owner can name. One dial = one
  causal chain = one Manager field the script applies everywhere it belongs (one
  `moleSpeed` for eighteen moles; the HUD's "3/5" reads the same `targetCount`).
  Never pad with visibility, one-shot juice or a field under a second name.
- Widget by value kind: a quantity is a slider, named levels a select, on/off a
  toggle (never a 0–1 slider), an untextured layer's colour a color. Copy is not
  a control: a `text` widget only when the user asked for editable text.
- Ranges: anchor at the authored value, inside the range and never at an edge. A
  pace reaches at least double and half the authored value (usually 1/4× to 4×);
  counts move on integers; strengths span 0–1; a size reaches a visibly different
  look. Both ends must still play — a top that trivialises the game or a bottom
  that breaks the look scores zero. Step ≈ span ÷ 100 in 1-2-5 numbers. Name the
  unit in the owner's terms (turns, not degrees × 360, when that is how the owner
  thinks).
- A dimension with no seam is reported as not bindable with its reason, never
  replaced by a decorative stand-in.

## 2. Publish

1. `effect_controls {action: "inspect"}` lists up to 60 bindable properties —
   script fields first — each with its `value`, `kind` and a ready `binding`.
   Each candidate may carry `decl` (what the script declares: tooltip, header, range,
   options, default) and `suggestedWidget` — copy it unless you have a reason not to. The
   answer also lists `unpublished`: constrained Manager fields no control binds yet — publish
   each one or say why not. A slider may omit `min`, `max` and `step`: the daemon fills them
   from the declaration, the component schema or the field's meaning, and `set` answers
   `warnings` (advice about narrow or coarse ranges, a default at an edge, a missing unit —
   never a rejection).
2. `effect_controls {action: "set", controls: [...]}` publishes (upserting by id):

```json
{"id": "speed", "label": "Speed", "intent": "How fast the targets fall",
 "widget": {"type": "slider", "min": 50, "max": 400, "step": 10},
 "binding": {"object": "s12", "component": "c31", "property": "fallSpeed"}}
```

   `binding` is copied from a candidate (`component` may be its `componentId`).
   The widget must fit the live value:

| widget | value | notes |
|---|---|---|
| `slider {min?,max?,step?,unit?}` | number | the current value must lie in the range; bounds you omit are filled from the declaration, schema or meaning; `unit` (≤ 8 chars, e.g. `s`, `px`) shows after the readout |
| `toggle` | boolean | |
| `color` | `{r,g,b,a}` | |
| `select {options:[{label,value}]}` | string or number | the current value must be one of the options |
| `text {maxLength?}` | string | |

3. Anything in `rejected` was not stored — fix what its `message` names and send
   those again. The drawer shows the accepted ones at once.

Optional: `group` (a heading in the drawer) and `default` (what Reset restores;
without it, the value at publish time).

## 3. Check, fix, remove

- `effect_controls {action: "get"}` — every control `bound` (with its current
  value) or `stale` with a reason: `object_missing`, `ambiguous_path` (two objects
  now share its path), `identity_conflict`, `component_missing`,
  `property_missing`, `project_mismatch`. A stale control is never guessed:
  publish it again with a fresh binding, or clear it.
- A row with `derived: true` is not published: the project has no
  `controls.json` yet, so the drawer shows the Manager script's own constrained
  knobs (`@slider`/`@spinBox` numbers, numeric `@dropDown`, booleans, colours —
  never a string) by itself. Adopt one with `set`, using its `target` as the
  `binding`; the first `set` replaces every derived row with what you publish.
- `effect_controls {action: "clear", ids: ["speed"]}` — remove some; without
  `ids`, remove all. A clear-all leaves an empty `controls.json` behind, so the
  drawer shows no controls until you publish again — only a project that never
  had a manifest shows the script's knobs by itself.

## Rules

- At most 8. Ids are lowercase slugs; labels are one or two words; `intent` is
  one sentence the drawer shows under the label.
- Expose tuning that cannot break the effect — never a value whose wrong setting
  stops the core loop.
- Copy (titles, captions, hints) is not a control: change it once when asked;
  publish a `text` widget only when the user asked for editable text.
- Every published control was seen to move something: one cell, one look at the
  preview. Never re-label a property to sound like a different dial.
- What the user sets in the drawer reaches you twice: your next prompt's Studio
  digest names the control (`- Set Speed: set Manager speed (120 → 200)
  [changeId …]`), and your next cell's `eh.project.status()` reports
  `externalChanges: ['editor_edit']`. `effect_controls {action: "get"}` reads
  every bound control's current `value`. Re-read before you edit the same
  property, and never undo it unasked.
- The drawer lives in the preview card (`studio_open {}`); there is nothing else
  to open.
