# Moonlit Firefly Bloom

Moonlit Firefly Bloom is a cozy browser-first arcade game about guiding a tiny glowing firefly through a dark rooftop garden, collecting moonlight, avoiding creeping shadows, and leaving soft blooming flowers behind your path. The game should feel simple, magical, readable, and replayable: fly, gather light, bloom the garden, survive a little longer, and instantly try again.

## Current Status

Planning and documentation foundation. Gameplay code has not been started yet.

## How to Run Locally

The intended stack is Vite, TypeScript, HTML Canvas, and CSS. Once the project is scaffolded:

```bash
npm install
npm run dev
```

Then open the local Vite URL in a browser.

## Core Controls

- Desktop keyboard: move with `WASD` or arrow keys.
- Desktop pointer: optional mouse-follow movement if it feels better during prototyping.
- Mobile: touch and drag to guide the firefly.
- Restart: quick retry button on the game over screen.

Controls should be easy to understand without a tutorial.

## MVP Goal

Answer one question quickly:

> Is it fun to fly around, collect light, avoid shadows, bloom flowers, and instantly retry?

The MVP is complete when the player can start a run, move smoothly, collect moonlight, leave blooms behind, lose glow from shadows, recover glow from light, reach game over, see a score, save a best score locally, and immediately retry.

## Development Philosophy

Keep the first version small, playable, and easy to change. Prioritize movement feel, readable visuals, fast restart, and mobile-friendly input over progression systems or architecture. Do not hide weak core gameplay behind unlocks, shops, achievements, or extra content. Build the cozy arcade loop first.
