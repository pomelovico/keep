const canvas = document.getElementById("canvas");
const cookie = document.getElementById("cookie");
const countEl = document.getElementById("count");
const ctx = canvas.getContext("2d");

const cw = 600;
const ch = 600;
// 像素比
const PIXEL_RATIO = window.devicePixelRatio;
// 方块大小
const RECT_SIZE = 20;
canvas.width = cw * PIXEL_RATIO;
canvas.height = ch * PIXEL_RATIO;

const DIRECTION_KEYBOARD_MAP = {
  37: "left",
  65: "left",
  39: "right",
  68: "right",
  38: "up",
  87: "up",
  40: "down",
  83: "down",
};

const DIRECTION_DELTA = {
  left: [-1 * RECT_SIZE, 0],
  right: [1 * RECT_SIZE, 0],
  up: [0, -1 * RECT_SIZE],
  down: [0, 1 * RECT_SIZE],
};

const OPPOSITE = {
  left: "right",
  right: "left",
  up: "down",
  down: "up",
};

class Snake {
  _array = [];

  _snake = [
    [RECT_SIZE * 5, RECT_SIZE * 19],
    [RECT_SIZE * 4, RECT_SIZE * 19],
    [RECT_SIZE * 3, RECT_SIZE * 19],
  ];

  _direction = "right";

  _food = [RECT_SIZE * 20, RECT_SIZE * 20];

  _count = 0;

  constructor() {
    this._array = Array.from({
      length: Math.floor(cw / RECT_SIZE),
    }).map(() => {
      return Array.from({
        length: Math.floor(ch / RECT_SIZE),
      }).map(() => 0);
    });
    this.run();

    this.registerKeyBoardEvent();
  }

  edgeCollisionCheck(next) {
    const [x, y] = next;
    if (x >= cw || y >= ch || x < 0 || y < 0) {
      return true;
    }
    return false;
  }
  selfCollisionCheck(next) {
    return this._snake.some(([x, y]) => next[0] === x && next[1] === y);
  }
  foodCollisionCheck(next) {
    return next[0] === this._food[0] && next[1] === this._food[1];
  }

  registerKeyBoardEvent() {
    window.addEventListener("keydown", (e) => {
      const direction = DIRECTION_KEYBOARD_MAP[e.keyCode];
      if (direction && direction !== OPPOSITE[this._direction]) {
        this._direction = direction;
        this.move(direction);
      }
    });
  }

  nextFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._snake.forEach(([x, y], index) => {
      ctx.beginPath();
      ctx.rect(
        x * PIXEL_RATIO,
        y * PIXEL_RATIO,
        RECT_SIZE * PIXEL_RATIO,
        RECT_SIZE * PIXEL_RATIO
      );

      const r = Math.floor((255 * index) / this._snake.length);
      const g = Math.floor((50 * Math.random() * index) % 255);
      const b = Math.floor(
        (255 * (this._snake.length - index)) / this._snake.length
      );
      ctx.fillStyle = `rgba(${r},${g},${b}, 0.5)`;
      ctx.fill();
    });

    ctx.fillStyle = "#3370ff";
    const [fx, fy] = this._food;
    const radius = RECT_SIZE / 2;
    ctx.beginPath();
    // ctx.arc(
    //   fx * PIXEL_RATIO + radius,
    //   fy * PIXEL_RATIO + radius,
    //   radius * PIXEL_RATIO,
    //   0,
    //   Math.PI * 2
    // );
    // ctx.fill();
    ctx.drawImage(
      cookie,
      fx * PIXEL_RATIO,
      fy * PIXEL_RATIO,
      RECT_SIZE * PIXEL_RATIO,
      RECT_SIZE * PIXEL_RATIO
    );
  }

  move(direction) {
    const delta = DIRECTION_DELTA[direction];
    const head = this._snake[0];
    const next = [head[0] + delta[0], head[1] + delta[1]];

    if (this.selfCollisionCheck(next)) {
      return;
    }

    if (this.edgeCollisionCheck(next)) {
      switch (direction) {
        case "left":
          next[0] = cw - RECT_SIZE;
          break;
        case "right":
          next[0] = 0;
          break;
        case "up":
          next[1] = ch - RECT_SIZE;
          break;
        case "down":
          next[1] = 0;
          break;
      }
    }

    this._snake.unshift(next);
    if (this.foodCollisionCheck(next)) {
      this._count += 1;
      countEl.innerText = this._count;
      const nextFood = this.randomFood();
      if (nextFood) {
        this._food = nextFood;
      } else {
        this._food = [-1 * RECT_SIZE, -1 * RECT_SIZE];
      }
    } else {
      const pop = this._snake.pop();
      this._array[pop[0] / RECT_SIZE][pop[1] / RECT_SIZE] = 0;
    }
    this._array[next[0] / RECT_SIZE][next[1] / RECT_SIZE] = 1;

    this.nextFrame();
  }

  randomFood() {
    const max = Math.floor((cw / RECT_SIZE) * (ch / RECT_SIZE));
    let startIndex = Math.floor(max * Math.random());
    let count = 0;
    while (count < max) {
      if (this._snake.length >= max) {
        return null;
      }
      const x = Math.floor(startIndex / (cw / RECT_SIZE));
      const y = startIndex % (cw / RECT_SIZE);
      if (this._array[x][y] !== 1) {
        return [x * RECT_SIZE, y * RECT_SIZE];
      }
      startIndex += 1;
      count += 1;
    }
    return null;
  }

  run() {
    const _run = () => {
      this.move(this._direction);
      setTimeout(_run, 100);
    };
    _run();
  }
}

function snapshot() {
  // ctx.
}

const snake = new Snake();
