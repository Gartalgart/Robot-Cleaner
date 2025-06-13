export class House {
  /**
   * @param {Array<Array<Piece>>} layout - 2D array of Piece objects.
   * @param {Robot} robot - The robot instance (optional, for reference).
   */
  constructor(layout, robot) {
    this.layout = layout;
    this.robot = robot;
  }

  /**
   * Clean the piece at the given coordinates.
   * @param {[number, number]} position - [x, y] coordinates.
   */
  clean([x, y]) {
    this.layout[x][y].clean();
  }

  /**
   * Check if all pieces in the house are clean.
   * @returns {boolean}
   */
  isAllClean() {
    return this.layout.every((row) => row.every((piece) => piece.isClean));
  }
}
