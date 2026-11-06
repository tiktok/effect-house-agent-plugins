# Privacy

What EffectHouse AI sends, to whom, and how to turn the optional parts off.

- The plugin contacts `effecthouse.tiktok.com` and TikTok's sign-in hosts for
  sign-in and every account action (publishing, your effects and their
  performance, trends, sounds, the asset library, image generation and phone
  preview), and the artifact host named in the pin files for the first-start
  download. What these actions send is what they need: for example the words
  of a search or an image description (with any picture the agent passes to an
  image, GIF or 3D generation), or the effect package for a phone preview or a
  performance test. Covers, avatars, sound previews and a selected sound's
  audio and lyrics load from TikTok's CDN. Model search sends its search words
  to `api.sketchfab.com`; importing a model also needs your own Sketchfab token.
- Submitting an effect uploads, as Effect House desktop does, the effect and
  its project, with an AI record: the plans the agent validated, how many
  prompts there were and their lengths (not their text), the editing steps the
  agent ran, and how many turns there were. Apart from a phone preview or a
  performance test you ask for, and a picture the agent passes to a generation,
  nothing about a project leaves your machine before you confirm a submission. Neither
  the plugin nor its engine reads your host's conversation history or
  transcript files.
- Update check: once a day the local daemon reads this repository's
  `.claude-plugin/plugin.json` and `support.json` from
  `raw.githubusercontent.com` (no identifier is sent) to learn whether a newer
  version is out or this one is below the supported minimum. A copy installed
  by the Effect House install skill asks that skill's installer instead, which
  reads its release file from the marketplace repository with git. Any failure
  means no notice. Set `EHAI_UPDATE_CHECK=off` in the environment of the host
  to turn it off, with the update offer in the chat.
- Every tool needs a TikTok account signed in to Effect House: the first call
  shows a QR code to scan with the TikTok app. The session is stored in
  `~/.ehai`, readable only by your user.
- Usage analytics: the daemon reports usage events (which features ran, counts,
  durations, outcomes, prompt lengths, plugin and host versions) to the
  analytics collector that Effect House's configuration names for your
  account's region, under the plugin's own application id. Events carry a
  per-machine identifier (a hash of the platform UUID on macOS, the same one
  Effect House desktop uses; a random id elsewhere; kept in
  `~/.ehai/telemetry-id`) and, while you are signed in, your Effect House
  account id, badge level and country. They never carry the text of your
  prompts, your files or their paths. Set `EHAI_TELEMETRY=off` in the environment of the host to send
  nothing; this also stops recording turns and prompt lengths for the AI
  record. The setting applies to each conversation that host runs, even when
  another host started the shared background service; a Studio page opened
  without a conversation follows the setting of the process that started the
  service. Events that could not be delivered are kept in `~/.ehai/telemetry`
  for at most 7 days and sent later.
- Microphone: an effect that reacts to your voice hears your microphone in the
  preview only after you switch on the microphone button in the Studio and your
  system allows it (macOS asks once, for "Effect House Engine"). It is off on
  every page load, goes off when the page is hidden or closed, and the sound
  stays on your machine: nothing is recorded or uploaded.
- What a tool returns to your agent (your effects' statistics, search results,
  preview screenshots) becomes part of the conversation your host sends to its
  model provider.
- Your use of Effect House through the plugin is governed by the
  [Effect House Terms of Service](https://effecthouse.tiktok.com/learn/guides/support/terms-of-service)
  and the [TikTok Privacy Policy](https://www.tiktok.com/legal/privacy-policy).
