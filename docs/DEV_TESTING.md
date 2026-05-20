# Developer Testing Shortcuts

These URL shortcuts are for local and private development testing only. They do not add player-facing menus or settings.

## Event Scenarios

Use these query parameters after the normal game URL:

| Query parameter | Purpose |
| --- | --- |
| `?devFullMoon=1` | Starts the next run at a later Full Moon so Full Moon Blessing visuals can be tested quickly. |
| `?devMoonRain=1` | Starts the next run with Moon Rain active so rain visuals, audio, and cleanup can be tested quickly. |
| `?devFullMoonSequence=1` | Starts at a later Full Moon, then advances through the delayed Full Moon-to-Moon Rain sequence quickly. |

Examples:

- `http://127.0.0.1:5173/?devFullMoon=1`
- `http://127.0.0.1:5173/?devMoonRain=1`
- `http://127.0.0.1:5173/?devFullMoonSequence=1`

The player still needs to click or tap Start so mobile audio can unlock from a real user gesture.

## Record Safety

Runs started with a developer scenario do not update the local best score. Normal gameplay without these query parameters is unchanged.
