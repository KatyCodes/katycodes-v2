import assert from "node:assert/strict";
import test from "node:test";
import { SnakeGame } from "../app/snake.ts";

test("snake moves one cell in its current direction", () => {
  const game = new SnakeGame(12, 8, () => 0);
  const start = game.snake[0];
  game.start();
  game.tick();
  assert.deepEqual(game.snake[0], { x: start.x + 1, y: start.y });
});

test("snake grows and scores after eating food", () => {
  const game = new SnakeGame(12, 8, () => 0);
  const head = game.snake[0];
  game.food = { x: head.x + 1, y: head.y };
  game.start();
  game.tick();
  assert.equal(game.score, 1);
  assert.equal(game.snake.length, 2);
});

test("snake cannot immediately reverse direction", () => {
  const game = new SnakeGame(12, 8, () => 0);
  assert.equal(game.turn("left"), false);
  assert.equal(game.turn("up"), true);
  game.start();
  game.tick();
  assert.equal(game.direction, "up");
});

test("snake ends the game when it reaches a wall", () => {
  const game = new SnakeGame(4, 4, () => 0);
  game.start();
  while (game.status === "playing") game.tick();
  assert.equal(game.status, "over");
});

test("restart resets score, body, and status", () => {
  const game = new SnakeGame(12, 8, () => 0);
  game.score = 4;
  game.restart();
  assert.equal(game.score, 0);
  assert.equal(game.snake.length, 1);
  assert.equal(game.status, "ready");
});
