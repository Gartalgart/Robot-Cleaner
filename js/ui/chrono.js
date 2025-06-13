export let chronoInterval = null;
export let chronoStart = null;

export function renderChrono(ms) {
  let chronoDiv = document.getElementById("chrono");
  if (!chronoDiv) {
    chronoDiv = document.createElement("div");
    chronoDiv.id = "chrono";
    chronoDiv.style.textAlign = "center";
    chronoDiv.style.margin = "1em 0";
    chronoDiv.style.fontWeight = "bold";
    document
      .querySelector("main")
      .insertBefore(chronoDiv, document.getElementById("house-layout"));
  }
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  const ms100 = Math.floor((ms % 1000) / 100);
  chronoDiv.textContent = `⏱️ Temps écoulé : ${min}:${s
    .toString()
    .padStart(2, "0")}.${ms100}`;
}

export function resumeChrono(pausedElapsed) {
  chronoStart = Date.now() - pausedElapsed;
  if (chronoInterval) clearInterval(chronoInterval);
  chronoInterval = setInterval(() => {
    renderChrono(Date.now() - chronoStart);
  }, 100);
}

export function startChrono() {
  window.pausedChronoElapsed = 0;
  chronoStart = Date.now();
  renderChrono(0);
  chronoInterval = setInterval(() => {
    renderChrono(Date.now() - chronoStart);
  }, 100);
}

export function stopChrono() {
  if (chronoInterval) clearInterval(chronoInterval);
  chronoInterval = null;
}

export function resetChrono() {
  stopChrono();
  renderChrono(0);
}
