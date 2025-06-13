// Import helpers from your UI and utils modules
import { renderAll } from "../ui/render.js";
import { showMessage, sleep } from "../utils.js";

export class Robot {
  constructor() {
    this.battery = 100;
    this.position = [0, 0];
  }

  /**
   * Checks if the battery is sufficient, and if not, moves to the nearest corner to recharge.
   * @param {House} house
   * @param {number} min
   * @returns {Promise<boolean>} true if recharged, false otherwise
   */
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
      return true; // <--- recharge happened!
    }
    return false; // <--- no recharge
  }

  /**
   * Moves the robot by dx, dy if possible.
   * @param {number} dx
   * @param {number} dy
   * @param {House} house
   * @param {boolean} ignoreBattery
   */
  async move(dx, dy, house, ignoreBattery = false) {
    console.log("move called", this.position, dx, dy, "battery:", this.battery);

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
    if (!ignoreBattery && this.battery < cost) {
      await showMessage("Batterie insuffisante pour ce déplacement.");
      return;
    }
    if (!ignoreBattery) {
      this.battery -= cost;
      if (this.battery < 0) this.battery = 0;
    }
    this.position = [newX, newY];
    console.log("robot moved to", this.position);
  }

  /**
   * Cleans the current piece, or moves to a target position and cleans.
   * @param {House} house
   * @param {[number, number]=} targetPosition
   */
  async clean(house, targetPosition = null) {
    console.log("clean called", this.position, "battery:", this.battery);

    // Move to target position if needed
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

    // Check battery before cleaning
    if (await this.checkBattery(house, 10)) {
      // If recharged, battery is now full, continue
    }
    if (this.battery < 10) {
      await showMessage("Batterie épuisée, le robot ne peut pas nettoyer.");
      return;
    }

    const [x, y] = this.position;
    const piece = house.layout[x][y];
    console.log("clean cleaning", [x, y], "isDirty:", piece.isDirty);
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
