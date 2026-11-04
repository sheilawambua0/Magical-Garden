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

// The three station buttons: garden hub -> activity screen
['flowerMatch', 'helpBee', 'butterflyGarden'].forEach(function (id) {
  document.getElementById('station-' + id).addEventListener('click', function () {
    showScreen(id);
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