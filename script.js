class Robot {
  constructor() {
    this.battery = 100;
    this.position = [0, 0];
  }

  async checkBattery(house, min = 1) {
    if (this.battery < min) {
      const n = house.layout.length;
      const m = house.layout[0].length;
      const corners = [
        [0, 0],
        [0, m - 1],
        [n - 1, 0],
        [n - 1, m - 1],
      ];
      const [x, y] = this.position;
      let minDist = Infinity;
      let nearest = [0, 0];
      for (const [cx, cy] of corners) {
        const dist = Math.abs(cx - x) + Math.abs(cy - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = [cx, cy];
        }
      }
      while (
        this.position[0] !== nearest[0] ||
        this.position[1] !== nearest[1]
      ) {
        let [curX, curY] = this.position;
        let dx = nearest[0] - curX;
        let dy = nearest[1] - curY;
        if (dx !== 0) {
          await this.move(Math.sign(dx), 0, house, true);
        } else if (dy !== 0) {
          await this.move(0, Math.sign(dy), house, true);
        }
        await renderAll(house, this);
        await sleep(100);
      }
      await showMessage(
        "Batterie insuffisante, le robot se recharge au coin le plus proche..."
      );
      await sleep(1200);
      this.battery = 100;
      await showMessage("Recharge terminée au coin.");
      await sleep(800);
      return false;
    }
    return true;
  }

  async move(dx, dy, house, ignoreBattery = false) {
    if (!ignoreBattery && !(await this.checkBattery(house))) return;
    if (
      Math.abs(dx) > 1 ||
      Math.abs(dy) > 1 ||
      (Math.abs(dx) === 1 && Math.abs(dy) === 1)
    ) {
      await showMessage("Déplacement non autorisé.");
      return;
    }
    const [x, y] = this.position;
    const newX = x + dx;
    const newY = y + dy;
    if (
      newX < 0 ||
      newY < 0 ||
      newX >= house.layout.length ||
      newY >= house.layout[0].length
    ) {
      await showMessage("Déplacement impossible, limite atteinte.");
      return;
    }
    const targetPiece = house.layout[newX][newY];
    const cost = targetPiece.isDirty ? 10 : 5;
    if (!ignoreBattery && !(await this.checkBattery(house, cost))) {
      return;
    }
    if (!ignoreBattery) {
      this.battery -= cost;
      if (this.battery < 0) this.battery = 0;
    }
    this.position = [newX, newY];
  }

  async clean(house, targetPosition = null) {
    if (!(await this.checkBattery(house, 10))) {
      if (targetPosition) {
        while (
          this.position[0] !== targetPosition[0] ||
          this.position[1] !== targetPosition[1]
        ) {
          let [x, y] = this.position;
          let dx = targetPosition[0] - x;
          let dy = targetPosition[1] - y;
          if (dx !== 0) {
            await this.move(Math.sign(dx), 0, house);
          } else if (dy !== 0) {
            await this.move(0, Math.sign(dy), house);
          }
          await renderAll(house, this);
          await sleep(100);
        }
      }
    }
    if (!(await this.checkBattery(house, 10))) {
      await showMessage("Batterie épuisée, le robot ne peut pas nettoyer.");
      return;
    }
    const [x, y] = this.position;
    const piece = house.layout[x][y];
    if (piece.isDirty) {
      house.clean(this.position);
      this.battery -= 10;
      if (this.battery < 0) this.battery = 0;
      await showMessage("La pièce a été nettoyée par le robot.");
    } else {
      await showMessage("La pièce est déjà propre.");
    }
  }
}

class Piece {
  constructor(state) {
    this.state = state;
  }
  getEmoji() {
    switch (this.state) {
      case "clean":
        return "🧼";
      case "clean_by_robot":
        return "🧽";
      case "dirty":
        return "💩";
      default:
        return "";
    }
  }
  clean() {
    if (this.state === "dirty") {
      this.state = "clean_by_robot";
    }
  }
  get isDirty() {
    return this.state === "dirty";
  }
  get isClean() {
    return this.state === "clean" || this.state === "clean_by_robot";
  }
}

class House {
  constructor(layout, robot) {
    this.layout = layout;
    this.robot = robot;
  }
  clean([x, y]) {
    this.layout[x][y].clean();
  }
  isAllClean() {
    return this.layout.every((row) => row.every((piece) => piece.isClean));
  }
}

function createLayout(x, y) {
  let layout = [];
  for (let i = 0; i < x; i++) {
    let row = [];
    for (let j = 0; j < y; j++) {
      let state = Math.random() < 0.5 ? "clean" : "dirty";
      row.push(new Piece(state));
    }
    layout.push(row);
  }
  return layout;
}

// --- DOM rendering helpers ---

function renderGrid(house, robot) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 0; i < house.layout.length; i++) {
    for (let j = 0; j < house.layout[i].length; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const piece = house.layout[i][j];
      if (robot.position[0] === i && robot.position[1] === j) {
        cell.classList.add("robot");
        cell.textContent = "🤖";
      } else if (piece.state === "dirty") {
        cell.classList.add("dirty");
        cell.textContent = "💩";
      } else if (piece.state === "clean_by_robot") {
        cell.classList.add("clean_by_robot");
        cell.textContent = "🧽";
      } else {
        cell.classList.add("clean");
        cell.textContent = "🧼";
      }
      grid.appendChild(cell);
    }
  }
}

function renderBattery(robot) {
  const batteryStatus = document.getElementById("battery-status");
  let batteryCopy = robot.battery;
  let battery = [];
  for (let i = 0; i < 10; i++) {
    battery.push(batteryCopy > 0 ? "🟩" : "🟥");
    batteryCopy -= 10;
  }
  batteryStatus.innerHTML = `
  <span class="battery-percent">${robot.battery}%</span>
  <div class="battery-bar">
    ${battery.map((b) => `<div>${b}</div>`).join("")}
  </div>
`;
}

// Remove renderPosition and its usage in renderAll
function renderAll(house, robot) {
  renderBattery(robot);
  renderGrid(house, robot);
}

function showMessage(msg) {
  let msgDiv = document.getElementById("message");
  if (!msgDiv) {
    msgDiv = document.createElement("div");
    msgDiv.id = "message";
    msgDiv.style.textAlign = "center";
    msgDiv.style.margin = "1em 0";
    msgDiv.style.fontWeight = "bold";
    document
      .querySelector("main")
      .insertBefore(msgDiv, document.getElementById("house-layout"));
  }
  msgDiv.textContent = msg;
  return new Promise((resolve) => setTimeout(resolve, 600));
}

function clearMessage() {
  let msgDiv = document.getElementById("message");
  if (msgDiv) msgDiv.textContent = "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Chrono rendering ---
let robot, house;
let running = false;
let paused = false;
let cleaningPromise = null;
let chronoInterval = null;
let chronoStart = null;

function renderChrono(ms) {
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

function startChrono() {
  window.pausedChronoElapsed = 0;
  chronoStart = Date.now();
  renderChrono(0);
  chronoInterval = setInterval(() => {
    renderChrono(Date.now() - chronoStart);
  }, 100);
}

function stopChrono() {
  if (chronoInterval) clearInterval(chronoInterval);
  chronoInterval = null;
}

function resetChrono() {
  stopChrono();
  renderChrono(0);
}

// --- Main simulation logic ---

async function cleanHouse() {
  running = true;
  paused = false;
  startChrono();
  for (let i = 0; i < house.layout.length; i++) {
    for (let j = 0; j < house.layout[i].length; j++) {
      while (robot.position[0] !== i || robot.position[1] !== j) {
        if (!running) {
          stopChrono();
          return;
        }
        while (paused) await sleep(100);
        let [x, y] = robot.position;
        let dx = i - x;
        let dy = j - y;
        if (dx !== 0) {
          await robot.move(Math.sign(dx), 0, house);
        } else if (dy !== 0) {
          await robot.move(0, Math.sign(dy), house);
        }
        renderAll(house, robot);
        clearMessage();
        await sleep(100);
      }
      while (house.layout[i][j].isDirty) {
        if (!running) {
          stopChrono();
          return;
        }
        while (paused) await sleep(100);
        await robot.clean(house, [i, j]);
        renderAll(house, robot);
        await sleep(100);
      }
    }
  }
  renderAll(house, robot);
  stopChrono();
  if (house.isAllClean()) {
    await showMessage("Toute la maison est propre !");
  } else {
    await showMessage("Il reste des pièces sales.");
  }
  running = false;
}

// --- Button controls ---

function setupControls() {
  document.getElementById("start-btn").onclick = async () => {
    if (running) {
      paused = false;
      // Restart chrono if unpausing
      if (chronoInterval === null && chronoStart !== null) {
        // Resume chrono from where it was paused
        chronoStart = Date.now() - pausedChronoElapsed;
        chronoInterval = setInterval(() => {
          renderChrono(Date.now() - chronoStart);
        }, 100);
      }
      return;
    }
    running = true;
    paused = false;
    cleaningPromise = cleanHouse();
  };

  // Store elapsed time when paused
  window.pausedChronoElapsed = 0;

  document.getElementById("pause-btn").onclick = () => {
    paused = true;
    // Stop the chrono when paused
    if (chronoInterval) {
      clearInterval(chronoInterval);
      chronoInterval = null;
      // Store elapsed time so we can resume
      window.pausedChronoElapsed = Date.now() - chronoStart;
    }
  };

  document.getElementById("reset-btn").onclick = () => {
    running = false;
    paused = false;
    if (cleaningPromise) cleaningPromise = null;
    startSimulation();
  };
}

function startSimulation() {
  robot = new Robot();
  house = new House(createLayout(10, 10), robot);
  renderAll(house, robot);
  clearMessage();
  resetChrono();
}

window.onload = () => {
  setupControls();
  startSimulation();
};
