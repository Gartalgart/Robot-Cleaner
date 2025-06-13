export class Piece {
  /**
   * @param {"clean"|"dirty"|"clean_by_robot"} state - The initial state of the piece.
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * Get the emoji representing the current state.
   * @returns {string}
   */
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

  /**
   * Clean the piece if it is dirty.
   */
  clean() {
    if (this.state === "dirty") {
      this.state = "clean_by_robot";
    }
  }

  /**
   * Whether the piece is dirty.
   * @returns {boolean}
   */
  get isDirty() {
    return this.state === "dirty";
  }

  /**
   * Whether the piece is clean (clean or cleaned by robot).
   * @returns {boolean}
   */
  get isClean() {
    return this.state === "clean" || this.state === "clean_by_robot";
  }
}
