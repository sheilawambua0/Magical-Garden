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

// =====================================================================
// ===== Activity: Help the Bee ========================================
// =====================================================================

// Fixed order on purpose (no randomness). 'wanted' is the plant the bee needs.
const BEE_PLANTS = [
  { id: 'tulip',     symbol: '🌷', name: 'Tulip' },
  { id: 'rose',      symbol: '🌹', name: 'Rose' },
  { id: 'sunflower', symbol: '🌻', name: 'Sunflower' }
];
const BEE_WANTED = 'sunflower';

let beeFinished = false;   // true once the right plant was chosen (guards double completion)
let beeTimer = null;

function getBeePlant(id) {
  return BEE_PLANTS.find(function (p) { return p.id === id; });
}

function startHelpBee() {
  const screen = document.getElementById('screen-helpBee');
  const area = document.getElementById('helpBee-area');
  const wanted = getBeePlant(BEE_WANTED);

  screen.querySelector('.instruction').textContent =
    'The bee wants the ' + wanted.name + '. Tap the ' + wanted.name + ' to help it!';
  screen.querySelector('.feedback').textContent = '';
  area.innerHTML = '';
  beeFinished = false;
  clearTimeout(beeTimer);

  // The bee, with a speech bubble so the goal stays visible while choosing
  const bee = document.createElement('div');
  bee.id = 'bee-character';
  const beeIcon = document.createElement('span');
  beeIcon.className = 'bee-icon';
  beeIcon.textContent = '🐝';
  beeIcon.setAttribute('aria-hidden', 'true');
  const bubble = document.createElement('span');
  bubble.className = 'bee-bubble';
  bubble.textContent = 'I want the ' + wanted.symbol + ' ' + wanted.name + '!';
  bee.append(bubble, beeIcon);

  // Three large plant choices (symbol + text label)
  const row = document.createElement('div');
  row.id = 'bee-plants';
  BEE_PLANTS.forEach(function (p) {
    const btn = document.createElement('button');
    btn.className = 'btn bee-plant';
    btn.dataset.id = p.id;

    const symbol = document.createElement('span');
    symbol.className = 'bee-plant-symbol';
    symbol.textContent = p.symbol;
    symbol.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'bee-plant-label';
    label.textContent = p.name;

    btn.append(symbol, label);
    row.appendChild(btn);
  });

  area.append(bee, row);
}

function onBeePlantClick(btn) {
  if (beeFinished) { return; }   // ignore repeated clicks after success

  const feedback = document.querySelector('#screen-helpBee .feedback');
  const wanted = getBeePlant(BEE_WANTED);
  const id = btn.dataset.id;

  // Wrong plant: gentle message, nothing resets, child can try again
  if (id !== BEE_WANTED) {
    document.querySelectorAll('#bee-plants .bee-plant').forEach(function (b) {
      b.classList.remove('tried');
    });
    btn.classList.add('tried');
    feedback.textContent =
      'Not quite. The bee wants the ' + wanted.name + '. Try another plant!';
    return;
  }

  // Right plant: lock the choices, move the bee, then complete once
  beeFinished = true;
  document.querySelectorAll('#bee-plants .bee-plant').forEach(function (b) {
    b.disabled = true;
    b.classList.remove('tried');
  });
  btn.classList.add('correct');
  btn.querySelector('.bee-plant-label').textContent += ' ✓';

  // Slide the bee over the chosen plant
  const bee = document.querySelector('#bee-character .bee-icon');
  const row = document.getElementById('bee-plants');
  const offset = btn.offsetLeft + btn.offsetWidth / 2 - row.offsetLeft - row.offsetWidth / 2;
  bee.style.transform = 'translateX(' + offset + 'px)';

  feedback.textContent = 'Yes! The bee found the ' + wanted.name + '. Well done!';

  // Short pause so the child can see the bee and read the message
  beeTimer = setTimeout(function () {
    completeActivity('helpBee');
  }, 1800);
}

// One click listener for the whole activity area (added once)
document.getElementById('helpBee-area').addEventListener('click', function (e) {
  const btn = e.target.closest('.bee-plant');
  if (btn && !btn.disabled) {
    onBeePlantClick(btn);
  }
});

// Clean up when the game restarts (Play Again)
function resetHelpBee() {
  clearTimeout(beeTimer);
  beeFinished = false;
  document.getElementById('helpBee-area').innerHTML = '';
}

registerActivity('helpBee', startHelpBee);
registerReset(resetHelpBee);
