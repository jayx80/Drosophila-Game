/*
================================================================
GAME.JS

This is the "engine" for the whole game. It never mentions any
specific behavior (escape, courtship, etc) by name — it just
reads whatever level is next from the LEVELS array (defined in
levels.js) and runs it through the same three phases:

  1. Intro video   (phase = "video", using level.introVideo)
  2. Neuron selection
  3. Outcome video  (phase = "video", using success/failureVideo)

The game now waits behind a START SCREEN until the player clicks
PLAY. Nothing plays before that click — this also means the very
first video/music playback happens as a direct result of a real
click, which browsers always allow (autoplay-blocking only
affects audio/video that tries to start without any click at
all).

You should not need to edit this file to add new levels — only
levels.js. You WOULD come back to this file if you want to
change how the game behaves (e.g. change the scoring rule, add
a timer, add more phases, etc).
================================================================
*/

// ---------------------------------------------------------------
// GRAB REFERENCES TO EVERYTHING ON THE PAGE
// (Doing this once at the top keeps the rest of the code tidy.)
// ---------------------------------------------------------------
const startScreenEl    = document.getElementById("startScreen");
const playBtn          = document.getElementById("playBtn");

const levelNameEl      = document.getElementById("levelName");
const videoPhaseEl     = document.getElementById("videoPhase");
const phaseVideoEl     = document.getElementById("phaseVideo");
const skipVideoBtn     = document.getElementById("skipVideoBtn");

const selectionPhaseEl = document.getElementById("selectionPhase");
const behaviorPromptEl = document.getElementById("behaviorPrompt");
const neuronColumnLeftEl  = document.getElementById("neuronColumnLeft");
const neuronColumnRightEl = document.getElementById("neuronColumnRight");
const neuronNodesGroupEl  = document.getElementById("neuronNodesGroup");
const selectionCountEl = document.getElementById("selectionCount");
const submitBtn        = document.getElementById("submitBtn");

const neuronModalEl    = document.getElementById("neuronModal");
const modalNameEl      = document.getElementById("modalName");
const modalFunctionEl  = document.getElementById("modalFunction");
const modalConnectionsEl = document.getElementById("modalConnections");
const modalVideoEl     = document.getElementById("modalVideo");
const closeModalBtn    = document.getElementById("closeModalBtn");

const endScreenEl      = document.getElementById("endScreen");
const restartBtn       = document.getElementById("restartBtn");

const bgMusicEl        = document.getElementById("bgMusic");
const clickSfxEl       = document.getElementById("clickSfx");
const submitSfxEl      = document.getElementById("submitSfx");
const birdCallSfxEl    = document.getElementById("birdCallSfx");
const muteBtn          = document.getElementById("muteBtn");
const muteIconEl       = document.getElementById("muteIcon");
const volumeSlider     = document.getElementById("volumeSlider");

const SVG_NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------
// GAME STATE
// currentLevelIndex - which entry of LEVELS we're on
// selectedNeuronIds - a Set of neuron ids the player has picked
//                     in the current level's selection phase
// isMuted           - whether all audio is currently muted
// fadeIntervalId    - tracks an in-progress music fade, so a new
//                     fade can safely cancel an old one
// ---------------------------------------------------------------
let currentLevelIndex = 0;
let selectedNeuronIds = new Set();
let isMuted = false;
let fadeIntervalId = null;

// ================================================================
// LEVEL FLOW
// ================================================================

// Starts a level from the very beginning: Phase 1 (intro video).
function startLevel(index) {
  const level = LEVELS[index];
  if (!level) {
    showEndScreen();
    return;
  }

  currentLevelIndex = index;

  levelNameEl.textContent = level.behaviorName;

  // Start this level's music. Music runs independently of the
  // videos and keeps playing through all three phases without
  // restarting, per the project brief.
  playMusicForLevel(level);

  playPhaseVideo(level.introVideo, () => {
    enterSelectionPhase(level);
  });
}

// Plays a given video file full-screen-in-frame and calls
// `onEnded` once it finishes naturally OR the player clicks Skip.
// Re-used for both the intro video and the outcome videos, since
// they behave identically (play once, then move on).
function playPhaseVideo(src, onEnded) {
  showPhase("video");

  phaseVideoEl.src = src;
  phaseVideoEl.currentTime = 0;
  phaseVideoEl.muted = isMuted;

  // Make sure we don't stack up multiple listeners if this
  // function gets called again later (e.g. for the outcome video).
  phaseVideoEl.onended = null;
  skipVideoBtn.onclick = null;

  const goNext = () => {
    phaseVideoEl.onended = null;
    skipVideoBtn.onclick = null;
    onEnded();
  };

  phaseVideoEl.onended = goNext;
  skipVideoBtn.onclick = goNext;

  phaseVideoEl.play().catch(() => {
    console.warn("Video autoplay was blocked by the browser. The player can press Skip to continue.");
  });
}

// Builds and shows the neuron selection screen for a level.
// This is also the function that runs again if the player answers
// incorrectly and comes back to try again — so it's the single
// place responsible for making sure everything starts CLEAN:
// no leftover selections, no leftover highlighted cards or dots.
function enterSelectionPhase(level) {
  selectedNeuronIds = new Set();

  showPhase("selection");
  behaviorPromptEl.textContent = level.prompt;

  neuronColumnLeftEl.innerHTML = "";
  neuronColumnRightEl.innerHTML = "";

  level.neurons.forEach((neuron, index) => {
    const card = buildNeuronCard(neuron);
    if (index % 2 === 0) {
      neuronColumnLeftEl.appendChild(card);
    } else {
      neuronColumnRightEl.appendChild(card);
    }
  });

  buildDiagramNodes(level);
  updateSelectionUI();
}

// Creates one neuron card (DOM element) for the selection grid.
function buildNeuronCard(neuron) {
  const card = document.createElement("div");
  card.className = "neuron-card";
  card.dataset.neuronId = neuron.id;

  card.innerHTML = `
    <h3><span class="node-dot"></span>${neuron.name}</h3>
    <p>${neuron.function}</p>
    <div class="card-actions">
      <button class="select-btn">Select</button>
      <button class="info-btn">Info + Demo</button>
    </div>
  `;

  card.querySelector(".select-btn").addEventListener("click", () => {
    toggleNeuronSelected(neuron.id, card);
  });

  card.querySelector(".info-btn").addEventListener("click", () => {
    openNeuronModal(neuron);
  });

  // Hovering (or, for keyboard users, focusing) a card lights up
  // its matching dot on the central fly diagram.
  card.addEventListener("mouseenter", () => setDiagramActive(neuron.id));
  card.addEventListener("mouseleave", () => setDiagramActive(null));
  card.addEventListener("focusin", () => setDiagramActive(neuron.id));
  card.addEventListener("focusout", () => setDiagramActive(null));

  return card;
}

// Adds/removes a neuron from the current selection, updates its
// card's appearance, updates its diagram dot, plays the selection
// click sound effect, and refreshes the submit button / counter.
function toggleNeuronSelected(neuronId, cardEl) {
  const nodeEl = neuronNodesGroupEl.querySelector(`[data-neuron-id="${neuronId}"]`);

  if (selectedNeuronIds.has(neuronId)) {
    selectedNeuronIds.delete(neuronId);
    cardEl.classList.remove("selected");
    if (nodeEl) nodeEl.classList.remove("selected");
  } else {
    selectedNeuronIds.add(neuronId);
    cardEl.classList.add("selected");
    if (nodeEl) nodeEl.classList.add("selected");
  }

  playSfx(clickSfxEl);
  updateSelectionUI();
}

// Keeps the "N selected" text and the submit button's
// enabled/disabled state in sync with selectedNeuronIds.
function updateSelectionUI() {
  const count = selectedNeuronIds.size;
  selectionCountEl.textContent = `${count} selected`;
  submitBtn.disabled = count === 0;
}

// Compares the player's selection to the level's correct answer,
// switches the background music to the matching correct/incorrect
// track, and moves to the appropriate outcome video.
function submitAnswer() {
  const level = LEVELS[currentLevelIndex];
  playSfx(submitSfxEl);

  const correct = arraysHaveSameContents(
    Array.from(selectedNeuronIds),
    level.correctNeuronIds
  );

  const outcomeVideo = correct ? level.successVideo : level.failureVideo;
  const outcomeMusic = correct ? level.successMusic : level.failureMusic;

  // Fade the main level music out, then switch straight into the
  // correct/incorrect track. This runs alongside the outcome
  // video starting, so the new music lands right as the outcome
  // plays.
  fadeOutAndSwitchMusic(outcomeMusic);

  playPhaseVideo(outcomeVideo, () => {
    if (correct) {
      startLevel(currentLevelIndex + 1);
    } else {
      // Wrong answer: fade back to the level's main theme and let
      // the player try again from a clean selection screen.
      fadeOutAndSwitchMusic(level.musicTrack);
      enterSelectionPhase(level);
    }
  });
}

// True if both arrays contain exactly the same items, ignoring order.
function arraysHaveSameContents(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
}

// Switches which of the two main phase panels is visible.
// phaseName is either "video" or "selection".
function showPhase(phaseName) {
  videoPhaseEl.classList.toggle("hidden", phaseName !== "video");
  selectionPhaseEl.classList.toggle("hidden", phaseName !== "selection");
}

function showEndScreen() {
  endScreenEl.classList.remove("hidden");
}

// ================================================================
// CENTRAL FLY DIAGRAM
// The brain/nerve-cord artwork itself is static SVG already in
// index.html. This code just places a small glowing "node" dot
// for each neuron that has a diagramPosition, and lights up the
// matching dot when the player hovers/focuses that neuron's card.
// ================================================================

// Removes any previously-built dots and creates fresh ones for
// the current level's neurons. Called every time the selection
// screen is (re)built, so there's never leftover state.
function buildDiagramNodes(level) {
  while (neuronNodesGroupEl.firstChild) {
    neuronNodesGroupEl.removeChild(neuronNodesGroupEl.firstChild);
  }

  level.neurons.forEach((neuron) => {
    const pos = neuron.diagramPosition;
    if (!pos) return; // this neuron has no diagram position — skip it

    const labelDx = pos.labelDx || 0;
    const labelDy = pos.labelDy !== undefined ? pos.labelDy : -16;

    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "neuron-node");
    group.setAttribute("data-neuron-id", neuron.id);

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 8);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", pos.x + labelDx);
    label.setAttribute("y", pos.y + labelDy);
    label.textContent = neuron.shortLabel || neuron.name;

    group.appendChild(circle);
    group.appendChild(label);
    neuronNodesGroupEl.appendChild(group);
  });
}

// Highlights the dot matching neuronId as "active" (hovered), and
// un-highlights every other dot. Pass null to clear all highlights.
function setDiagramActive(neuronId) {
  neuronNodesGroupEl.querySelectorAll(".neuron-node").forEach((node) => {
    node.classList.toggle("active", node.dataset.neuronId === neuronId);
  });
}

// ================================================================
// NEURON INFO / DEMO VIDEO MODAL
// ================================================================

function openNeuronModal(neuron) {
  modalNameEl.textContent = neuron.name;
  modalFunctionEl.textContent = neuron.function;
  modalConnectionsEl.textContent = neuron.connections;

  modalVideoEl.src = neuron.demoVideo;
  modalVideoEl.muted = isMuted;
  modalVideoEl.currentTime = 0;

  neuronModalEl.classList.remove("hidden");
  modalVideoEl.play().catch(() => {
    // Autoplay blocked — the video's built-in controls let the
    // player press play manually, so this is not a problem.
  });
}

function closeNeuronModal() {
  modalVideoEl.pause();
  neuronModalEl.classList.add("hidden");
}

// ================================================================
// AUDIO
// ================================================================

// Starts (or restarts) the background music for a given level.
// Music is completely separate from the <video> elements, so it
// keeps playing uninterrupted as the phases change.
function playMusicForLevel(level) {
  cancelMusicFade();
  bgMusicEl.src = level.musicTrack;
  bgMusicEl.currentTime = 0;
  bgMusicEl.volume = Number(volumeSlider.value);
  bgMusicEl.muted = isMuted;
  bgMusicEl.play().catch(() => {
    console.warn("Music autoplay was blocked by the browser until the player interacts with the page.");
  });
}

// Smoothly fades the currently-playing background music down to
// silence, then switches to a new track and plays it at normal
// volume. Used when the player submits an answer (switching to
// the correct/incorrect track) and when returning to the main
// level theme after a wrong answer.
function fadeOutAndSwitchMusic(newSrc, fadeDurationMs) {
  if (!newSrc) return; // no track specified for this level — do nothing

  cancelMusicFade();

  const steps = 15;
  const stepTime = (fadeDurationMs || 600) / steps;
  const startVolume = bgMusicEl.volume;
  let step = 0;

  fadeIntervalId = setInterval(() => {
    step++;
    bgMusicEl.volume = Math.max(startVolume * (1 - step / steps), 0);

    if (step >= steps) {
      clearInterval(fadeIntervalId);
      fadeIntervalId = null;

      bgMusicEl.pause();
      bgMusicEl.src = newSrc;
      bgMusicEl.currentTime = 0;
      bgMusicEl.volume = Number(volumeSlider.value);
      bgMusicEl.muted = isMuted;
      bgMusicEl.play().catch(() => {
        console.warn("Music playback was blocked unexpectedly mid-game.");
      });
    }
  }, stepTime);
}

// Stops any music fade currently in progress. Called before
// starting a new fade (or a hard track switch) so two fades can
// never run at the same time and fight over the volume.
function cancelMusicFade() {
  if (fadeIntervalId) {
    clearInterval(fadeIntervalId);
    fadeIntervalId = null;
  }
}

// Plays a short one-off sound effect (click, submit, bird call).
// cloneNode lets the same short sound play again instantly even
// if it's still finishing from a previous play.
function playSfx(audioEl) {
  if (isMuted) return;
  const sound = audioEl.cloneNode();
  sound.volume = Number(volumeSlider.value);
  sound.play().catch(() => {});
}

// Toggles mute for everything: music, sfx, and any currently
// playing video (phase video or modal demo video).
function toggleMute() {
  isMuted = !isMuted;
  bgMusicEl.muted = isMuted;
  phaseVideoEl.muted = isMuted;
  modalVideoEl.muted = isMuted;
  muteIconEl.textContent = isMuted ? "🔇" : "🔊";
}

// Updates the music volume live as the player drags the slider.
function handleVolumeChange() {
  bgMusicEl.volume = Number(volumeSlider.value);
}

// ================================================================
// EVENT LISTENERS (things the player can click)
// ================================================================

playBtn.addEventListener("click", () => {
  playSfx(clickSfxEl);
  playSfx(birdCallSfxEl);
  startScreenEl.classList.add("hidden");
  startLevel(0);
});

submitBtn.addEventListener("click", submitAnswer);
closeModalBtn.addEventListener("click", closeNeuronModal);
muteBtn.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", handleVolumeChange);

restartBtn.addEventListener("click", () => {
  playSfx(clickSfxEl);
  playSfx(birdCallSfxEl);
  endScreenEl.classList.add("hidden");
  startLevel(0);
});

// Clicking the dark overlay outside the modal card also closes it.
neuronModalEl.addEventListener("click", (event) => {
  if (event.target === neuronModalEl) closeNeuronModal();
});

// ================================================================
// The game now waits at the start screen — see the playBtn
// listener above for where the first level actually kicks off.
// ================================================================
