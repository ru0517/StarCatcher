const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './canva.jpg';

const starImage = new Image();
starImage.src = './star.png';

backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};



let basket = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 50,
  width: 300,
  height: 20,
  color: 'blue',
  speed: 20,
};

let stars = [];
let score = 0;
let missedStars = 0;
const maxMissedStars = 5;
let level = 1;
const maxLevel = 5;

let isGameRunning = false;
let gamePaused = false;

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

startButton.addEventListener('click', () => {
  if (!isGameRunning) {
    startButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
    isGameRunning = true;
    if (musicOn) backgroundMusic.play();
    gameLoop();
  }
});


pauseButton.addEventListener('click', () => {
  if (isGameRunning) {
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
    isGameRunning = false;
    gameLoop();
  }
});

function handleBasketMovement(e) {
  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - canvasRect.left;
  const key = e.code;

  if (key === 'ArrowLeft') basket.x = Math.max(0, basket.x - basket.speed);
  if (key === 'ArrowRight') basket.x = Math.min(canvas.width - basket.width, basket.x + basket.speed);
  if (mouseX) {
    basket.x = Math.min(
      Math.max(0, mouseX - basket.width / 2),
      canvas.width - basket.width
    );
  }
}

document.addEventListener('keydown', handleBasketMovement);
document.addEventListener('mousemove', handleBasketMovement);

function createStar() {
  return {
    x: Math.random() * (canvas.width - 10),
    y: 0,
    width: 50,
    height: 50,
    color: 'yellow',
    speed: 1 * level,
  };
}

function update() {
  if (Math.random() < 0.004 * level) 
    stars.push(createStar());

  stars.forEach((star, index) => {
    star.y += star.speed;

    if (star.y > canvas.height) {
      stars.splice(index, 1);
      missedStars++;
      if (effectsOn) missStarSound.play();
    }

    if (
      star.x < basket.x + basket.width &&
      star.x + star.width > basket.x &&
      star.y < basket.y + basket.height &&
      star.y + star.height > basket.y
    ) {
      stars.splice(index, 1);
      score++;
      if (effectsOn) catchStarSound.play();
    }
  });

  if (missedStars >= maxMissedStars) endGame();
  if (score >= level * 10) levelUp();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = basket.color;
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

  stars.forEach((star) => {
    ctx.drawImage(starImage, star.x, star.y, star.width, star.height);
  });

  ctx.fillStyle = 'red';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Missed: ${missedStars}`, 10, 40);
  ctx.fillText(`Level: ${level}`, 10, 60);
}

function levelUp() {
  if (level < maxLevel) {
    level++;
    basket.width -= 20;
  }
}

function endGame() {
  isGameRunning = false;
  let name = prompt('Enter your name:');
  while (!name) {
    alert('Name is required');
    name = prompt('Enter your name:');
  }
  fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  })
    .then(() => (window.location.href = `game-over.html?score=${score}`))
    .catch((err) => console.error('Error saving score:', err));
}


function gameLoop() {
  if (!gamePaused && isGameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();


const backgroundMusic = new Audio('background.mp3');
const catchStarSound = new Audio('catch.mp3');
const missStarSound = new Audio('miss.mp3');

let musicOn = true;
let effectsOn = true;

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

const toggleMusicButton = document.getElementById('toggle-music');
const toggleEffectsButton = document.getElementById('toggle-effects');

toggleMusicButton.addEventListener('click', () => {
  musicOn = !musicOn;
  toggleMusicButton.textContent = musicOn ? 'Turn Off Music' : 'Turn On Music';
  if (musicOn) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
});

toggleEffectsButton.addEventListener('click', () => {
  effectsOn = !effectsOn;
  toggleEffectsButton.textContent = effectsOn ? 'Turn Off Effects' : 'Turn On Effects';
});


