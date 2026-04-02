const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const size = 500;

//Nest
const nest = { x: 250, y: 250 };

//Multiple Food Sources
let foods = [
  { x: 100, y: 100 },
  { x: 400, y: 80 },
  { x: 80, y: 400 }
];

//Obstacles
let obstacles = [
  { x: 200, y: 200, w: 50, h: 10 },
  { x: 300, y: 300, w: 10, h: 50 }
];

//Ants
let ants = [];
const NUM_ANTS = 10;

//Stats
let foodCollected = 0;

//Trail system
const gridSize = 100;
const cellSize = size / gridSize;
let trailMap = [];

//Simulation control
let running = true;

// ================= INIT =================
function init() {
  ants = [];
  trailMap = [];
  foodCollected = 0;

  // Create ants
  for (let i = 0; i < NUM_ANTS; i++) {
    ants.push({
      x: nest.x,
      y: nest.y,
      carryingFood: false
    });
  }

  // Init trails
  for (let i = 0; i < gridSize; i++) {
    trailMap[i] = [];
    for (let j = 0; j < gridSize; j++) {
      trailMap[i][j] = 0;
    }
  }
}

init();

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, size, size);

  //Trails
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let value = trailMap[i][j];
      if (value > 1) {
        ctx.fillStyle = `rgba(0, 0, 255, ${value / 50})`;
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  }

  //Obstacles
  ctx.fillStyle = "gray";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  });

  //Foods
  ctx.fillStyle = "lime";
  foods.forEach(f => {
    ctx.fillRect(f.x - 5, f.y - 5, 10, 10);
  });

  //Nest
  ctx.fillStyle = "red";
  ctx.fillRect(nest.x - 5, nest.y - 5, 10, 10);

  //Ants
  ctx.fillStyle = "white";
  ants.forEach(ant => {
    ctx.fillRect(ant.x, ant.y, 3, 3);
  });

  //Stats text
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText("Food Collected: " + foodCollected, 10, 20);
}

// ================= COLLISION =================
function hitObstacle(x, y) {
  return obstacles.some(o =>
    x > o.x && x < o.x + o.w &&
    y > o.y && y < o.y + o.h
  );
}

// ================= MOVEMENT =================
function moveAnts() {
  ants.forEach(ant => {

    if (!ant.carryingFood) {

      let gridX = Math.floor(ant.x / cellSize);
      let gridY = Math.floor(ant.y / cellSize);

      let bestX = ant.x;
      let bestY = ant.y;
      let bestValue = 0;

      // Check nearby trail
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let nx = gridX + dx;
          let ny = gridY + dy;

          if (trailMap[nx] && trailMap[nx][ny] !== undefined) {
            if (trailMap[nx][ny] > bestValue) {
              bestValue = trailMap[nx][ny];
              bestX = nx * cellSize;
              bestY = ny * cellSize;
            }
          }
        }
      }

      let newX, newY;

      if (bestValue > 0) {
        newX = ant.x + (bestX - ant.x) * 0.1;
        newY = ant.y + (bestY - ant.y) * 0.1;
      } else {
        newX = ant.x + Math.random() * 4 - 2;
        newY = ant.y + Math.random() * 4 - 2;
      }

      // Avoid obstacles
      if (!hitObstacle(newX, newY)) {
        ant.x = newX;
        ant.y = newY;
      }

      //Check food
      foods.forEach((food, index) => {
        let dx = ant.x - food.x;
        let dy = ant.y - food.y;

        if (Math.sqrt(dx * dx + dy * dy) < 10) {
          ant.carryingFood = true;
          foods.splice(index, 1); // remove food
        }
      });

    } else {
      // Return home
      let dx = nest.x - ant.x;
      let dy = nest.y - ant.y;

      let newX = ant.x + dx * 0.02;
      let newY = ant.y + dy * 0.02;

      if (!hitObstacle(newX, newY)) {
        ant.x = newX;
        ant.y = newY;
      }

      // Drop trail
      let gridX = Math.floor(ant.x / cellSize);
      let gridY = Math.floor(ant.y / cellSize);

      if (trailMap[gridX] && trailMap[gridX][gridY] !== undefined) {
        trailMap[gridX][gridY] += 5;
      }

      // Reached nest
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        ant.carryingFood = false;
        foodCollected++;
      }
    }

  });
}

// ================= TRAIL FADE =================
function fadeTrails() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      trailMap[i][j] *= 0.95;
    }
  }
}

// ================= LOOP =================
function update() {
  if (!running) return;
  moveAnts();
  fadeTrails();
  draw();
}

setInterval(update, 50);

// ================= UI BUTTONS =================
document.body.insertAdjacentHTML("beforeend", `
  <div style="position:absolute; top:10px; right:10px;">
    <button onclick="running=true">Start</button>
    <button onclick="running=false">Stop</button>
    <button onclick="init()">Reset</button>
  </div>
`);