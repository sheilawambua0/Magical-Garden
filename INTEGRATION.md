# Magical Garden: Integration Notes

These are the shared rules for everyone. Please do **not** rename or change these names. If you need a change, tell the coordinator (Member 1).

## Files
- `index.html`: page structure (all screens live here)
- `style.css`: shared styles (one stylesheet only)
- `script.js`: shared state, navigation, progress, restart

## Screen names
`intro`, `garden`, `flowerMatch`, `helpBee`, `butterflyGarden`, `complete`

Each screen in `index.html` is `<section id="screen-NAME">`.

## Where each activity builds its content
Put your activity inside **your own area** only:
- Flower Match: `<div id="flowerMatch-area">`
- Help the Bee: `<div id="helpBee-area">`
- Butterfly Garden: `<div id="butterflyGarden-area">`

Each screen also has `<p class="instruction">` (put your one short instruction here) and `<p class="feedback">` (put your feedback messages here).

## Shared state (do not create your own copies)
```
state.currentScreen
state.completedActivities = { flowerMatch, helpBee, butterflyGarden }
state.progress          // 0 to 3
state.selectedItem      // null or the id of the selected item
```
Never create a second progress counter or a second navigation system.

## Shared functions
| Function | What it does |
|---|---|
| `showScreen(name)` | Shows one screen and hides the others |
| `completeActivity(id)` | Call **once** when your activity is finished. Updates progress and returns to the hub (or shows the completion screen after the third) |
| `updateProgressText()` | Refreshes the "X of 3" text on the hub |
| `registerActivity(id, startFn)` | Registers your function, which runs each time your screen opens |
| `registerReset(fn)` | Registers your cleanup function, which runs on Play Again |
| `resetGame()` | Resets everything (called by Play Again) |

`id` is always one of: `flowerMatch`, `helpBee`, `butterflyGarden`.

## How to plug in your activity
```javascript
function startHelpBee() {
  // build or reset your activity inside #helpBee-area
}

function resetHelpBee() {
  // put your activity back to the starting state
}

registerActivity('helpBee', startHelpBee);
registerReset(resetHelpBee);

// When the child finishes:
completeActivity('helpBee');
```

## Rules
- Call `completeActivity` exactly once per activity. Repeated calls are safely ignored.
- Wrong answers must be recoverable and must not reset the whole activity.
- Use the shared classes: `btn` for buttons, `feedback` for messages.
- Use real `<button>` elements for anything clickable.
- Do not collect personal data.

## Git
- Never commit directly to `main`.
- Branch names: `feature/bee-activity`, `feature/butterfly-activity`, `feature/garden-visuals`, `feature/style-guide`
- Keep pull requests small and describe how to test them.
- Get one teammate to review each pull request before merging.