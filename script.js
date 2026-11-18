// ===== Shared state (the one source of truth for the whole app) =====
const state = {
  currentScreen: 'intro',
  completedActivities: { flowerMatch: false, helpBee: false, butterflyGarden: false },
  progress: 0,
  selectedItem: null
};

const SCREENS = ['intro', 'garden', 'flowerMatch', 'helpBee', 'butterflyGarden', 'complete'];

function showScreen(name) {
  SCREENS.forEach(function (id) {
    document.getElementById('screen-' + id).hidden = (id !== name);
  });
  state.currentScreen = name;
}

document.getElementById('start-btn').addEventListener('click', function () {
  showScreen('garden');
});

const activityStarters = {};
function registerActivity(id, startFn) { activityStarters[id] = startFn; }

['flowerMatch', 'helpBee', 'butterflyGarden'].forEach(function (id) {
  document.getElementById('station-' + id).addEventListener('click', function () {
    showScreen(id);
    if (activityStarters[id]) activityStarters[id]();
  });
});

document.querySelectorAll('.back-btn').forEach(function (btn) {
  btn.addEventListener('click', function () { showScreen('garden'); });
});

function updateProgressText() {
  document.getElementById('progress-text').textContent = state.progress + ' of 3 garden tasks complete';
}

function completeActivity(id) {
  if (state.completedActivities[id]) return;
  state.completedActivities[id] = true;
  state.progress += 1;
  updateProgressText();
  showScreen(state.progress === 3 ? 'complete' : 'garden');
}

const resetHandlers = [];
function registerReset(fn) { resetHandlers.push(fn); }

function resetGame() {
  state.completedActivities = { flowerMatch: false, helpBee: false, butterflyGarden: false };
  state.progress = 0;
  state.selectedItem = null;
  document.querySelectorAll('.feedback').forEach(function (el) { el.textContent = ''; });
  resetHandlers.forEach(function (fn) { fn(); });
  updateProgressText();
  showScreen('intro');
}

document.getElementById('play-again-btn').addEventListener('click', resetGame);

// =====================================================================
// ===== MEMBER 1: FLOWER MATCH ========================================
// =====================================================================
const FLOWERS = [
  { id: 'tulip',     name: 'Tulip',     symbol: '🌷' },
  { id: 'sunflower', name: 'Sunflower', symbol: '🌻' },
  { id: 'rose',      name: 'Rose',      symbol: '🌹' }
];

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
  screen.querySelector('.instruction').textContent = 'Pick a flower card, then tap the same flower in the garden.';
  screen.querySelector('.feedback').textContent = '';
  area.innerHTML = '';
  flowerMatchedCount = 0;
  clearTimeout(flowerTimer);
  state.selectedItem = null;

  const cardsTitle = document.createElement('h3'); cardsTitle.textContent = 'Your flower cards';
  const cardsRow = document.createElement('div'); cardsRow.id = 'flower-cards';
  FLOWERS.forEach(function (f) { cardsRow.appendChild(makeFlowerButton(f, 'card')); });

  const targetsTitle = document.createElement('h3'); targetsTitle.textContent = 'In the garden';
  const targetsRow = document.createElement('div'); targetsRow.id = 'flower-targets';
  [FLOWERS[2], FLOWERS[0], FLOWERS[1]].forEach(function (f) { targetsRow.appendChild(makeFlowerButton(f, 'target')); });

  area.append(cardsTitle, cardsRow, targetsTitle, targetsRow);
}

registerActivity('flowerMatch', startFlowerMatch);

let flowerMatchedCount = 0;
let flowerTimer = null;

function getFlowerName(id) { return FLOWERS.find(function (f) { return f.id === id; }).name; }

function clearFlowerSelection() {
  document.querySelectorAll('#flower-cards .flower-btn').forEach(function (b) {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  state.selectedItem = null;
}

function markFlowerMatched(id) {
  document.querySelectorAll('#screen-flowerMatch .flower-btn[data-id="' + id + '"]').forEach(function (b) {
    b.disabled = true; b.classList.remove('selected'); b.classList.add('matched');
    b.lastElementChild.textContent += ' ✓';
  });
}

function onFlowerClick(btn) {
  const feedback = document.querySelector('#screen-flowerMatch .feedback');
  const id = btn.dataset.id;

  if (btn.dataset.kind === 'card') {
    clearFlowerSelection();
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');
    state.selectedItem = id;
    feedback.textContent = 'You picked the ' + getFlowerName(id) + '. Now tap the same flower in the garden.';
    return;
  }

  if (state.selectedItem === null) {
    feedback.textContent = 'Pick a flower card first.'; return;
  }

  if (state.selectedItem === id) {
    markFlowerMatched(id);
    flowerMatchedCount += 1;
    state.selectedItem = null;
    feedback.textContent = 'Yes! The ' + getFlowerName(id) + ' matches. Well done!';
    if (flowerMatchedCount === FLOWERS.length) {
      feedback.textContent = 'You matched all the flowers. Great job!';
      flowerTimer = setTimeout(function () { completeActivity('flowerMatch'); }, 1500);
    }
    return;
  }

  feedback.textContent = 'Not quite. Try a different flower. You can do it!';
}

document.getElementById('flowerMatch-area').addEventListener('click', function (e) {
  const btn = e.target.closest('.flower-btn');
  if (btn && !btn.disabled) onFlowerClick(btn);
});

registerReset(function () {
  clearTimeout(flowerTimer);
  flowerMatchedCount = 0;
  state.selectedItem = null;
  document.getElementById('flowerMatch-area').innerHTML = '';
});

// =====================================================================
// ===== MEMBER 2: HELP THE BEE ========================================
// =====================================================================
const BEE_PLANTS = [
  { id: 'tulip',     symbol: '🌷', name: 'Tulip' },
  { id: 'rose',      symbol: '🌹', name: 'Rose' },
  { id: 'sunflower', symbol: '🌻', name: 'Sunflower' }
];
const BEE_WANTED = 'sunflower';
let beeFinished = false;
let beeTimer = null;

function getBeePlant(id) { return BEE_PLANTS.find(function (p) { return p.id === id; }); }

function startHelpBee() {
  const screen = document.getElementById('screen-helpBee');
  const area = document.getElementById('helpBee-area');
  const wanted = getBeePlant(BEE_WANTED);
  screen.querySelector('.instruction').textContent = 'The bee wants the ' + wanted.name + '. Tap the ' + wanted.name + ' to help it!';
  screen.querySelector('.feedback').textContent = '';
  area.innerHTML = '';
  beeFinished = false;
  clearTimeout(beeTimer);

  const bee = document.createElement('div'); bee.id = 'bee-character';
  const beeIcon = document.createElement('span'); beeIcon.className = 'bee-icon'; beeIcon.textContent = '🐝'; beeIcon.setAttribute('aria-hidden', 'true');
  const bubble = document.createElement('span'); bubble.className = 'bee-bubble'; bubble.textContent = 'I want the ' + wanted.symbol + ' ' + wanted.name + '!';
  bee.append(bubble, beeIcon);

  const row = document.createElement('div'); row.id = 'bee-plants';
  BEE_PLANTS.forEach(function (p) {
    const btn = document.createElement('button'); btn.className = 'btn bee-plant'; btn.dataset.id = p.id;
    const symbol = document.createElement('span'); symbol.className = 'bee-plant-symbol'; symbol.textContent = p.symbol; symbol.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.className = 'bee-plant-label'; label.textContent = p.name;
    btn.append(symbol, label); row.appendChild(btn);
  });
  area.append(bee, row);
}

function onBeePlantClick(btn) {
  if (beeFinished) return;
  const feedback = document.querySelector('#screen-helpBee .feedback');
  const wanted = getBeePlant(BEE_WANTED);
  const id = btn.dataset.id;

  if (id !== BEE_WANTED) {
    document.querySelectorAll('#bee-plants .bee-plant').forEach(function (b) { b.classList.remove('tried'); });
    btn.classList.add('tried');
    feedback.textContent = 'Not quite. The bee wants the ' + wanted.name + '. Try another plant!';
    return;
  }

  beeFinished = true;
  document.querySelectorAll('#bee-plants .bee-plant').forEach(function (b) { b.disabled = true; b.classList.remove('tried'); });
  btn.classList.add('correct');
  btn.querySelector('.bee-plant-label').textContent += ' ✓';

  const bee = document.querySelector('#bee-character .bee-icon');
  const row = document.getElementById('bee-plants');
  const offset = btn.offsetLeft + btn.offsetWidth / 2 - row.offsetLeft - row.offsetWidth / 2;
  bee.style.transform = 'translateX(' + offset + 'px)';
  feedback.textContent = 'Yes! The bee found the ' + wanted.name + '. Well done!';

  beeTimer = setTimeout(function () { completeActivity('helpBee'); }, 1800);
}

document.getElementById('helpBee-area').addEventListener('click', function (e) {
  const btn = e.target.closest('.bee-plant');
  if (btn && !btn.disabled) onBeePlantClick(btn);
});

function resetHelpBee() {
  clearTimeout(beeTimer);
  beeFinished = false;
  document.getElementById('helpBee-area').innerHTML = '';
}
registerActivity('helpBee', startHelpBee);
registerReset(resetHelpBee);

// =====================================================================
// ===== MEMBER 4: GARDEN VISUALS ======================================
// =====================================================================
(function () {
  'use strict';

  const GARDEN_MAP = {
    flowerMatch: ['garden-scene-flowerMatch'],
    helpBee: ['garden-scene-helpBee'],
    butterflyGarden: ['garden-scene-butterflyGarden']
  };

  const seen = {};
  const BACK = {
    flowerMatch:     'Yay! The flowers are back! Keep going!',
    helpBee:         'Yay! The bees are back! Keep going!',
    butterflyGarden: 'Yay! The butterflies are back! Keep going!'
  };
  let phase = 'empty';
  let introPlayed = false;
  let lastStory = '';
  let phaseTimers = [];

  function setPhase(p) {
    phase = p;
    const box = document.getElementById('garden-scene');
    if (box) box.dataset.phase = p;
  }

  function updateStory() {
    const el = document.getElementById('garden-story');
    if (!el) return;
    let text;
    if (phase === 'intro')        text = 'The garden friends are playing. Look at them!';
    else if (phase === 'leaving') text = 'Oh no! A big gust of wind! Your friends are running away!';
    else if (state.progress === 0) text = 'The garden is empty! Finish the tasks to bring your friends back.';
    else text = lastStory || (state.progress + ' of 3 groups of friends are back. Keep going!');
    el.textContent = text;
  }

  function playIntro() {
    introPlayed = true;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (state.progress > 0 || reduce) { setPhase('empty'); return; }
    setPhase('intro');
    phaseTimers.push(setTimeout(function () { setPhase('leaving'); updateStory(); }, 1800));
    phaseTimers.push(setTimeout(function () { setPhase('empty'); updateStory(); }, 5000));
  }

  function renderGardenState() {
    const completed = state.completedActivities;
    const sceneBox = document.getElementById('garden-scene');
    if (sceneBox) sceneBox.dataset.progress = state.progress;

    Object.keys(GARDEN_MAP).forEach(function (activityId) {
      const isDone = !!completed[activityId];
      GARDEN_MAP[activityId].forEach(function (elId) {
        const el = document.getElementById(elId);
        if (el) el.classList.toggle('is-colourful', isDone);
      });

      const region = document.getElementById('garden-scene-' + activityId);
      if (isDone && !seen[activityId]) lastStory = BACK[activityId];
      if (region) region.classList.toggle('is-new', isDone && !seen[activityId]);
      seen[activityId] = isDone;

      const badge = document.querySelector('.station-status[data-status-for="' + activityId + '"]');
      if (badge) {
        badge.textContent = isDone ? '✓ Complete' : 'Not started';
        badge.classList.toggle('is-complete', isDone);
      }
    });
  }

  function renderGarden() {
    renderGardenState();
    const hub = document.getElementById('screen-garden');
    if (hub && !hub.hidden && !introPlayed) playIntro();
    updateStory();
  }

  function resetGardenVisuals() {
    phaseTimers.forEach(clearTimeout);
    phaseTimers = [];
    introPlayed = false;
    lastStory = '';
    setPhase('empty');
    updateStory();
    const sceneBox = document.getElementById('garden-scene');
    if (sceneBox) sceneBox.dataset.progress = 0;
    
    Object.keys(GARDEN_MAP).forEach(function (activityId) {
      seen[activityId] = false;
      const region = document.getElementById('garden-scene-' + activityId);
      if (region) region.classList.remove('is-new');
      GARDEN_MAP[activityId].forEach(function (elId) {
        const el = document.getElementById(elId);
        if (el) el.classList.remove('is-colourful');
      });

      const badge = document.querySelector('.station-status[data-status-for="' + activityId + '"]');
      if (badge) {
        badge.textContent = 'Not started';
        badge.classList.remove('is-complete');
      }
    });
  }

  const gardenScreen = document.getElementById('screen-garden');
  if (gardenScreen && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function () {
      if (!gardenScreen.hidden) renderGarden();
    });
    observer.observe(gardenScreen, { attributes: true, attributeFilter: ['hidden'] });
  }

  renderGarden();
  registerReset(resetGardenVisuals);
  window.renderGarden = renderGarden;
})();
