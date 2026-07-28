export type Direction = "up" | "down" | "left" | "right";
export type SnakeStatus = "ready" | "playing" | "paused" | "over";
export type Cell = { x: number; y: number };

const vectors: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const opposites: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export class SnakeGame {
  snake: Cell[] = [];
  food: Cell = { x: 0, y: 0 };
  score = 0;
  status: SnakeStatus = "ready";
  direction: Direction = "right";
  readonly width: number;
  readonly height: number;
  private nextDirection: Direction = "right";
  private readonly random: () => number;

  constructor(width = 24, height = 16, random = Math.random) {
    this.width = width;
    this.height = height;
    this.random = random;
    this.restart();
  }

  start() {
    if (this.status === "ready" || this.status === "paused") this.status = "playing";
  }

  pause() {
    if (this.status === "playing") this.status = "paused";
  }

  turn(direction: Direction) {
    if (direction === opposites[this.direction]) return false;
    this.nextDirection = direction;
    return true;
  }

  tick() {
    if (this.status !== "playing") return this.status;
    this.direction = this.nextDirection;
    const vector = vectors[this.direction];
    const head = this.snake[0];
    const next = { x: head.x + vector.x, y: head.y + vector.y };
    const ate = next.x === this.food.x && next.y === this.food.y;
    const body = ate ? this.snake : this.snake.slice(0, -1);
    const hitWall = next.x < 0 || next.y < 0 || next.x >= this.width || next.y >= this.height;
    const hitSelf = body.some((cell) => cell.x === next.x && cell.y === next.y);
    if (hitWall || hitSelf) {
      this.status = "over";
      return this.status;
    }
    this.snake.unshift(next);
    if (ate) {
      this.score += 1;
      this.placeFood();
    } else {
      this.snake.pop();
    }
    return this.status;
  }

  restart() {
    this.snake = [{ x: Math.floor(this.width / 3), y: Math.floor(this.height / 2) }];
    this.score = 0;
    this.status = "ready";
    this.direction = "right";
    this.nextDirection = "right";
    this.placeFood();
  }

  private placeFood() {
    const open: Cell[] = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (!this.snake.some((cell) => cell.x === x && cell.y === y)) open.push({ x, y });
      }
    }
    if (open.length === 0) {
      this.status = "over";
      return;
    }
    this.food = open[Math.floor(this.random() * open.length)];
  }
}
