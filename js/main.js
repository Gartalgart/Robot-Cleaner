import { renderAll } from "./ui/render.js";
import { House } from "./core/house.js";
import { Robot } from "./core/robot.js";
import { Piece } from "./core/piece.js";
import { setupControls } from "./ui/controls.js";
import {
  startChrono,
  resetChrono,
  renderChrono,
  stopChrono,
} from "./ui/chrono.js";
import { clearMessage } from "./utils.js";

/**
 * Create a random layout of Pieces.
 * @param {number} x - Number of rows.
 * @param {number} y - Number of columns.
 * @returns {Array<Array<Piece>>}
 */
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

// App state
let robot, house;

let state = {
  running: false,
  paused: false,
  chronoInterval: null,
  chronoStart: null,
  cleaningPromise: null,
};

function getState() {
  return state;
}

// Start or reset the simulation
function startSimulation() {
  robot = new Robot();
  house = new House(createLayout(10, 10), robot);
  renderAll(house, robot);
  clearMessage();
  resetChrono();
}

async function cleanHouse() {
  console.log("cleanHouse called", robot, house);

  state.running = true;
  state.paused = false;
  startChrono();
  let robotRef = robot;
  let houseRef = house;

  function getDirtyTiles() {
    const dirty = [];
    for (let i = 0; i < houseRef.layout.length; i++) {
      for (let j = 0; j < houseRef.layout[i].length; j++) {
        if (houseRef.layout[i][j].isDirty) dirty.push([i, j]);
      }
    }
    return dirty;
  }

  function findNearestDirtyTile(from, dirtyTiles) {
    let minDist = Infinity;
    let nearest = null;
    for (const [i, j] of dirtyTiles) {
      const dist = Math.abs(from[0] - i) + Math.abs(from[1] - j);
      if (dist < minDist) {
        minDist = dist;
        nearest = [i, j];
      }
    }
    return nearest;
  }

  while (true) {
    if (!state.running) {
      stopChrono();
      return;
    }
    while (state.paused) await new Promise((r) => setTimeout(r, 100));

    const dirtyTiles = getDirtyTiles();
    console.log("dirtyTiles:", dirtyTiles);

    if (dirtyTiles.length === 0) break;

    let target = findNearestDirtyTile(robotRef.position, dirtyTiles);

    // Move to the nearest dirty tile
    while (
      robotRef.position[0] !== target[0] ||
      robotRef.position[1] !== target[1]
    ) {
      if (!state.running) {
        stopChrono();
        return;
      }
      while (state.paused) await new Promise((r) => setTimeout(r, 100));
      let [x, y] = robotRef.position;
      let dx = target[0] - x;
      let dy = target[1] - y;

      // Check battery before each move
      const recharged = await robotRef.checkBattery(houseRef);
      if (recharged) {
        // After recharge, break to recalculate nearest dirty tile from the new corner position
        target = findNearestDirtyTile(robotRef.position, getDirtyTiles());
        continue;
      }

      const nextDx = dx !== 0 ? Math.sign(dx) : 0;
      const nextDy = dy !== 0 ? Math.sign(dy) : 0;
      const nextX = robotRef.position[0] + nextDx;
      const nextY = robotRef.position[1] + nextDy;
      const nextPiece = houseRef.layout[nextX][nextY];
      const moveCost = nextPiece.isDirty ? 10 : 5;

      if (robotRef.battery < moveCost) {
        // Not enough battery for the next move, recharge!
        await robotRef.checkBattery(houseRef, moveCost);
        // After recharge, recalculate path from new position
        target = findNearestDirtyTile(robotRef.position, getDirtyTiles());
        continue;
      }

      if (dx !== 0) {
        await robotRef.move(Math.sign(dx), 0, houseRef);
      } else if (dy !== 0) {
        await robotRef.move(0, Math.sign(dy), houseRef);
      }
      renderAll(houseRef, robotRef);
      clearMessage();
      await new Promise((r) => setTimeout(r, 100));
    }

    // Clean the tile
    while (houseRef.layout[target[0]][target[1]].isDirty) {
      if (!state.running) {
        stopChrono();
        return;
      }
      while (state.paused) await new Promise((r) => setTimeout(r, 100));
      await robotRef.clean(houseRef, target);
      console.log(
        "After cleaning, isDirty:",
        houseRef.layout[target[0]][target[1]].isDirty
      );
      renderAll(houseRef, robotRef);
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  renderAll(houseRef, robotRef);
  stopChrono();
  if (houseRef.isAllClean()) {
    await import("./utils.js").then(({ showMessage }) =>
      showMessage("Toute la maison est propre !")
    );
  } else {
    await import("./utils.js").then(({ showMessage }) =>
      showMessage("Il reste des pièces sales.")
    );
  }
  state.running = false;
}

// On page load
window.onload = () => {
  setupControls({
    startSimulation,
    renderChrono,
    stopChrono,
    getState,
    cleanHouse, // Pass it here
  });
  startSimulation();
};
