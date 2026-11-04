// ===== Shared state (the one source of truth for the whole app) =====
const state = {
  currentScreen: 'intro',
  completedActivities: {
    flowerMatch: false,
    helpBee: false,
    butterflyGarden: false
  },
  progress: 0,
  selectedItem: null
};

// All the screen names. Each one matches an id in index.html ("screen-" + name)
const SCREENS = ['intro', 'garden', 'flowerMatch', 'helpBee', 'butterflyGarden', 'complete'];

// ===== Navigation: show one screen and hide the rest =====
function showScreen(name) {
  SCREENS.forEach(function (id) {
    document.getElementById('screen-' + id).hidden = (id !== name);
  });
  state.currentScreen = name;
}

// ===== Connect the buttons =====

// Start button: intro -> garden hub
document.getElementById('start-btn').addEventListener('click', function () {
  showScreen('garden');
});

// Each activity registers a "start" function here (see integration notes)
const activityStarters = {};

function registerActivity(id, startFn) {
  activityStarters[id] = startFn;
}

// The three station buttons: garden hub -> activity screen
['flowerMatch', 'helpBee', 'butterflyGarden'].forEach(function (id) {
  document.getElementById('station-' + id).addEventListener('click', function () {
    showScreen(id);
    if (activityStarters[id]) {
      activityStarters[id]();   // build the activity when its screen opens
    }
  });
});

// Every "Back to garden" button: activity screen -> garden hub
document.querySelectorAll('.back-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showScreen('garden');
  });
});

// ===== Progress and completion (shared by ALL activities) =====

function updateProgressText() {
  document.getElementById('progress-text').textContent =
    state.progress + ' of 3 garden tasks complete';
}

// Every activity calls this ONCE when the child finishes it.
// id is one of: 'flowerMatch', 'helpBee', 'butterflyGarden'
function completeActivity(id) {
  if (state.completedActivities[id]) {
    return; // already completed, so no double counting
  }
  state.completedActivities[id] = true;
  state.progress = state.progress + 1;
  updateProgressText();

  if (state.progress === 3) {
    showScreen('complete');
  } else {
    showScreen('garden');
  }
}

// ===== Restart (Play Again) =====

// Each activity can register its own reset function here,
// so restart also clears that activity's own screen.
const resetHandlers = [];

function registerReset(fn) {
  resetHandlers.push(fn);
}

function resetGame() {
  // 1. Clear shared state
  state.completedActivities = {
    flowerMatch: false,
    helpBee: false,
    butterflyGarden: false
  };
  state.progress = 0;
  state.selectedItem = null;

  // 2. Clear all feedback messages
  document.querySelectorAll('.feedback').forEach(function (el) {
    el.textContent = '';
  });

  // 3. Let every activity clear itself
  resetHandlers.forEach(function (fn) {
    fn();
  });

  // 4. Update the screen
  updateProgressText();
  showScreen('intro');
}

// Play Again button
document.getElementById('play-again-btn').addEventListener('click', resetGame);

// ===== Activity A: Flower Match =====

const FLOWERS = [
  { id: 'tulip',     name: 'Tulip',     symbol: '🌷' },
  { id: 'sunflower', name: 'Sunflower', symbol: '🌻' },
  { id: 'rose',      name: 'Rose',      symbol: '🌹' }
];

// Make one button for a flower. kind is 'card' or 'target'.
function makeFlowerButton(flower, kind) {
  const btn = document.createElement('button');
  btn.className = 'btn flower-btn';
  btn.dataset.id = flower.id;
  btn.dataset.kind = kind;

  const symbol = document.createElement('span');
  symbol.className = 'flower-symbol';
  symbol.textContent = flower.symbol;
  symbol.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = flower.name;

  btn.append(symbol, label);
  return btn;
}

function startFlowerMatch() {
  const screen = document.getElementById('screen-flowerMatch');
  const area = document.getElementById('flowerMatch-area');

  screen.querySelector('.instruction').textContent =
    'Pick a flower card, then tap the same flower in the garden.';
  screen.querySelector('.feedback').textContent = '';
  area.innerHTML = '';
    flowerMatchedCount = 0;
  clearTimeout(flowerTimer);
  state.selectedItem = null;

  // Row 1: the cards
  const cardsTitle = document.createElement('h3');
  cardsTitle.textContent = 'Your flower cards';
  const cardsRow = document.createElement('div');
  cardsRow.id = 'flower-cards';
  FLOWERS.forEach(function (f) {
    cardsRow.appendChild(makeFlowerButton(f, 'card'));
  });

  // Row 2: the garden targets, in a different order from the cards
  const targetsTitle = document.createElement('h3');
  targetsTitle.textContent = 'In the garden';
  const targetsRow = document.createElement('div');
  targetsRow.id = 'flower-targets';
  [FLOWERS[2], FLOWERS[0], FLOWERS[1]].forEach(function (f) {
    targetsRow.appendChild(makeFlowerButton(f, 'target'));
  });

  area.append(cardsTitle, cardsRow, targetsTitle, targetsRow);
}

registerActivity('flowerMatch', startFlowerMatch);

// --- Flower Match: matching logic ---

let flowerMatchedCount = 0;
let flowerTimer = null;

function getFlowerName(id) {
  return FLOWERS.find(function (f) { return f.id === id; }).name;
}

// Remove the "selected" look from every card
function clearFlowerSelection() {
  document.querySelectorAll('#flower-cards .flower-btn').forEach(function (b) {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  state.selectedItem = null;
}

// Lock a matched pair (both the card and the garden flower)
function markFlowerMatched(id) {
  document.querySelectorAll('#screen-flowerMatch .flower-btn[data-id="' + id + '"]')
    .forEach(function (b) {
      b.disabled = true;
      b.classList.remove('selected');
      b.classList.add('matched');
      b.lastElementChild.textContent += ' ✓';
    });
}

function onFlowerClick(btn) {
  const feedback = document.querySelector('#screen-flowerMatch .feedback');
  const id = btn.dataset.id;

  // The child clicked a card: select it
  if (btn.dataset.kind === 'card') {
    clearFlowerSelection();
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    state.selectedItem = id;
    feedback.textContent =
      'You picked the ' + getFlowerName(id) + '. Now tap the same flower in the garden.';
    return;
  }

  // The child clicked a garden flower, but has not picked a card yet
  if (state.selectedItem === null) {
    feedback.textContent = 'Pick a flower card first.';
    return;
  }

  // Correct match
  if (state.selectedItem === id) {
    markFlowerMatched(id);
    flowerMatchedCount = flowerMatchedCount + 1;
    state.selectedItem = null;
    feedback.textContent = 'Yes! The ' + getFlowerName(id) + ' matches. Well done!';

    if (flowerMatchedCount === FLOWERS.length) {
      feedback.textContent = 'You matched all the flowers. Great job!';
      // Short pause so the child can read the message
      flowerTimer = setTimeout(function () {
        completeActivity('flowerMatch');
      }, 1500);
    }
    return;
  }

  // Wrong match: gentle message, nothing is reset
  feedback.textContent = 'Not quite. Try a different flower. You can do it!';
}

// One click listener for the whole activity area (added once)
document.getElementById('flowerMatch-area').addEventListener('click', function (e) {
  const btn = e.target.closest('.flower-btn');
  if (btn && !btn.disabled) {
    onFlowerClick(btn);
  }
});

// Clean up when the game restarts
registerReset(function () {
  clearTimeout(flowerTimer);
  flowerMatchedCount = 0;
  state.selectedItem = null;
  document.getElementById('flowerMatch-area').innerHTML = '';
});