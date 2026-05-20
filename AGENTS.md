# AGENTS.md

Instructions for future AI coding agents working on Moonlit Firefly Bloom.

## Project Priorities

- Keep the scope small.
- Prioritize a playable MVP over clever architecture.
- Make the game fun to move through before adding extra systems.
- Preserve the cozy, moonlit, magical visual tone.
- Keep the game browser-first and mobile-friendly.
- Make fast retry feel natural.

## Scope Rules

- Do not add new features without updating the relevant docs.
- Keep `MVP_SCOPE.md` as the authority for what belongs in the first playable version.
- Keep `TASKS.md` updated as tasks are completed.
- Update `DECISIONS.md` when making important technical, design, or scope choices.
- Avoid multiplayer, accounts, online leaderboards, shops, achievements, daily quests, complex upgrades, story mode, multiple levels, and complex asset pipelines in the MVP.
- Keep the current priority browser-first. Future iOS/Android packaging may happen later through a web-to-native wrapper such as Capacitor, but do not implement native mobile packaging until explicitly requested.

## Legal/IP Documentation Workflow

- If a new Suno sound is added, update `legal/AUDIO_ASSET_LOG.md`.
- If a new ChatGPT/OpenAI-generated visual asset is added, update `legal/VISUAL_ASSET_LOG.md`.
- If Canva is used only for background removal/export, document Canva as the editing/export tool, not the original art source.
- If Canva stock content, templates, fonts, icons, photos, or elements are ever used, log them separately.
- If a new AI tool is used later, document it in `legal/AI_TOOL_USAGE_LOG.md`.
- If a new npm dependency is added, update `legal/THIRD_PARTY_LICENSES.md` or mark it TODO for license review.
- If a new marketing/video asset is created later, add it to the appropriate legal log or create a new marketing/video asset log.
- Do not invent missing legal details. Use TODO for unknown dates, prompts, generation links, receipts, or subscription proof.
- Legal documentation updates should be included in the same task whenever new assets or dependencies are added.

## Audio Asset Workflow

- Use only Omar-approved runtime audio files for gameplay playback.
- Runtime audio lives in `public/sounds/runtime/m4a/` and `public/sounds/runtime/mp3/`.
- Treat M4A/AAC as the primary runtime format and MP3 as the fallback runtime format.
- Keep WAV files as source/master assets only; do not use WAV as normal gameplay fallback.
- Do not auto-convert, trim, normalize, regenerate, or overwrite audio files unless explicitly requested.
- Preserve mobile audio reliability rules: unlock/prime from real user gestures, keep gameplay non-blocking, use fresh Web Audio one-shot sources, and let sounds finish naturally.
- Keep `?audioDebug=1` diagnostics available for mobile browser audio investigation.

## Developer Testing Workflow

- Keep event test helpers hidden behind URL query parameters only, not player-facing menus or cheat UI.
- Current event test shortcuts are documented in `docs/DEV_TESTING.md`.
- Developer scenario runs must not update local best score or future public/leaderboard records.
- Normal gameplay must remain unchanged when no developer query parameter is present.

## Coding Guidance

- Use clear TypeScript.
- Prefer simple modules and plain data structures.
- Keep the game loop readable.
- Avoid overengineering, dependency sprawl, and premature abstractions.
- Write code that a solo creator can understand and modify.
- Favor small, focused files over large framework-like systems.
- Keep comments useful and brief.
- Keep core game logic separate from browser-specific UI where reasonable.
- Avoid technical choices and unnecessary dependencies that would make future mobile packaging difficult.

## Gameplay Guidance

- Movement feel matters most.
- Collection feedback should be clear and satisfying.
- Shadow damage should be readable and fair.
- Bloom trails should support the cozy fantasy without becoming a performance problem.
- The first playable version should be understandable immediately.
- Keep canvas responsive and touch controls supported so the browser MVP remains mobile-aware.
- Keep the mobile virtual joystick calm, readable, and out of the main play focus.

## Testing Expectations

- Test keyboard movement on desktop.
- Test pointer or mouse movement if implemented.
- Test touch movement on a mobile-sized viewport.
- Test game over and instant restart.
- Test local best score persistence.
- Check that UI text and controls fit on small screens.
