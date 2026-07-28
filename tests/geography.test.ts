import assert from "node:assert/strict";
import test from "node:test";
import { GeographyGame } from "../app/geography.ts";

test("geography game scores correct countries and resets after a miss", () => {
  const game = new GeographyGame(["Canada", "Japan", "Kenya"], () => 0);
  assert.equal(game.target, "Canada");
  assert.equal(game.guess("Canada"), true);
  assert.equal(game.score, 1);
  assert.notEqual(game.target, "Canada");
  assert.equal(game.guess("Kenya"), false);
  game.restart();
  assert.equal(game.score, 0);
});
