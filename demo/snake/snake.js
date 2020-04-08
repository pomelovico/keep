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

  _timer = 0;

  _cookieTimer = 0;

  _gameOver = false;

  constructor() {
    this.reset();
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
      if (
        !this._gameOver &&
        direction &&
        direction !== OPPOSITE[this._direction]
      ) {
        this._direction = direction;
        this.move(direction);
      }
    });
  }

  nextFrame() {
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fill();

    this._snake.forEach(([x, y, fillStyle]) => {
      ctx.beginPath();
      ctx.rect(
        x * PIXEL_RATIO,
        y * PIXEL_RATIO,
        RECT_SIZE * PIXEL_RATIO,
        RECT_SIZE * PIXEL_RATIO
      );
      ctx.fillStyle = fillStyle;
      ctx.fill();
    });

    // cookie
    ctx.fillStyle = "#3370ff";
    const [fx, fy] = this._food;
    ctx.beginPath();
    ctx.drawImage(
      cookie,
      fx * PIXEL_RATIO,
      fy * PIXEL_RATIO,
      RECT_SIZE * PIXEL_RATIO,
      RECT_SIZE * PIXEL_RATIO
    );

    window.requestAnimationFrame(this.nextFrame.bind(this));
  }

  move(direction) {
    const delta = DIRECTION_DELTA[direction];
    const head = this._snake[0];
    const next = [head[0] + delta[0], head[1] + delta[1]];

    if (this.selfCollisionCheck(next)) {
      clearTimeout(this._timer);
      this._gameOver = true;
      this.snapshot();
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
      clearTimeout(this._cookieTimer);
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

    // blink each rect
    this._snake.forEach((item, index) => {
      const r = Math.floor((255 * index) / this._snake.length);
      const g = Math.floor((50 * Math.random() * index) % 255);
      const b = Math.floor(
        (255 * (this._snake.length - index)) / this._snake.length
      );
      item[2] = `rgba(${r},${g},${b}, 0.5)`;
    });
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
      if (this._gameOver) {
        return;
      }
      this.move(this._direction);
      this._timer = setTimeout(
        _run,
        // 每吃5个加速5毫秒
        Math.max(100 - Math.floor(this._count / 5) * 5, 16)
      );
    };
    _run();

    window.requestAnimationFrame(this.nextFrame.bind(this));
  }

  reset() {
    clearTimeout(this._timer);
    clearTimeout(this._cookieTimer);
    this._snake = [
      [RECT_SIZE * 5, RECT_SIZE * 19],
      [RECT_SIZE * 4, RECT_SIZE * 19],
      [RECT_SIZE * 3, RECT_SIZE * 19],
    ];

    this._direction = "right";

    this._food = [RECT_SIZE * 20, RECT_SIZE * 20];

    this._count = 0;

    this._timer = 0;

    this._gameOver = false;

    this._array = Array.from({
      length: Math.floor(cw / RECT_SIZE),
    }).map(() => {
      return Array.from({
        length: Math.floor(ch / RECT_SIZE),
      }).map(() => 0);
    });

    countEl.innerText = this._count;
  }

  snapshot() {
    const src = canvas.toDataURL();
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "300px";
    img.style.height = "300px";
    Swal.fire({
      imageUrl: src,
      customClass: {
        image: "snapshot-image",
      },
      onClose: () => {
        this.reset();
        this.run();
      },
    });
  }
}

const snake = new Snake();
