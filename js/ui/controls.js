import {
  renderChrono,
  stopChrono,
  chronoInterval,
  chronoStart,
  resumeChrono,
} from "./chrono.js";

/**
 * Sets up the control buttons for the simulation.
 * @param {Object} options - Functions and state to control the simulation.
 * @param {Function} options.startSimulation - Function to reset/start the simulation.
 * @param {Function} options.renderChrono - Function to render the chrono.
 * @param {Function} options.stopChrono - Function to stop the chrono.
 * @param {Function} options.getState - Function returning {running, paused, chronoInterval, chronoStart, cleaningPromise}
 */
export function setupControls({
  startSimulation,
  renderChrono,
  stopChrono,
  getState,
  cleanHouse, // Add this
}) {
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");

  startBtn.onclick = async () => {
    const state = getState();
    if (state.running) {
      state.paused = false;
      resumeChrono(window.pausedChronoElapsed || 0);
      window.pausedChronoElapsed = 0;
      return;
    }
    state.running = true;
    state.paused = false;
    await cleanHouse();
  };

  window.pausedChronoElapsed = 0;

  pauseBtn.onclick = () => {
    const state = getState();
    state.paused = true;
    if (chronoInterval) {
      clearInterval(chronoInterval);
      window.pausedChronoElapsed = Date.now() - chronoStart;
    }
  };

  resetBtn.onclick = () => {
    const state = getState();
    state.running = false;
    state.paused = false;
    if (state.cleaningPromise) state.cleaningPromise = null;
    stopChrono();
    startSimulation();
  };
}

// Remove any call to setupControls at the bottom of this file!
