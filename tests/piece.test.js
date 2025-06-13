import test from "node:test";
import assert from "node:assert/strict";
import { Piece } from "../js/core/piece.js";

test("Piece.clean() changes state from dirty to clean_by_robot", () => {
  const piece = new Piece("dirty");
  piece.clean();
  assert.equal(piece.state, "clean_by_robot");
});
