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

## Testing Expectations

- Test keyboard movement on desktop.
- Test pointer or mouse movement if implemented.
- Test touch movement on a mobile-sized viewport.
- Test game over and instant restart.
- Test local best score persistence.
- Check that UI text and controls fit on small screens.
