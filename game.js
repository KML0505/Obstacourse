const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const respawnButton = document.getElementById('respawnButton');
const difficultyButton = document.getElementById('difficultyButton');

const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 60,
    jumping: false,
    crouching: false,
    image: new Image()
};
player.image.src = 'player.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg';

// Load images for different difficulties
const obstacleImages = [
    'obstacle-easy.png',
    'obstacle-medium.png',
    'obstacle-hard.png',
    'obstacle-impossible.png'
];

// Obstacle properties for each difficulty
const obstacleProperties = [
    { width: 40, height: 60, speed: 5 }, // Easy
    { width: 50, height: 70, speed: 8 }, // Medium
    { width: 60, height: 80, speed: 12 }, // Hard
    { width: 70, height: 90, speed: 18 }  // Impossible
];

const obstacle = {
    x: canvas.width,
    y: 300,
    width: obstacleProperties[0].width,
    height: obstacleProperties[0].height,
    speed: obstacleProperties[0].speed,
    image: new Image()
};
obstacle.image.src = obstacleImages[0]; // Start with the easy difficulty image

let score = 0;
let gameLoop;
let gameOver = false;
let currentDifficultyIndex = 0;

function drawPlayer() {
    if (player.image.complete) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawObstacle() {
    if (obstacle.image.complete) {
        ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawBackground() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, containerWidth, containerHeight);
    } else {
        ctx.fillStyle = '#f0f0f0'; // Fallback color while loading
        ctx.fillRect(0, 0, containerWidth, containerHeight);
    }
}

function updatePlayer() {
    if (player.jumping) {
        player.y -= 10; // Jump upwards
        if (player.y < 150) { // Maximum height
            player.jumping = false; // Stop jumping when maximum height is reached
        }
    } else if (player.y < 300) {
        player.y += 5; // Gravity pulls player back down
    } else {
        player.y = 300; // Reset to ground level
    }

    if (player.crouching) {
        player.height = 30; // Reduce height for crouching
        player.y = 330;
    } else {
        player.height = 60; // Normal height
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    updatePlayer(); // Update player position and state

    // Move obstacle
    obstacle.x -= obstacle.speed;

    // Reset obstacle position
    if (obstacle.x + obstacle.width < 0) {
        resetObstacle();
        score++;
        if (score >= 40) {
            congratulations();
            return;
        }
        // Increase difficulty every 10 points
        if (score % 10 === 0) {
            if (currentDifficultyIndex < obstacleProperties.length - 1) {
                currentDifficultyIndex++;
            }
            updateObstacleProperties();
            updateDifficultyButton();
        }
    }

    // Collision detection
    if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    ) {
        endGame();
        return;
    }

    drawPlayer();
    drawObstacle();
    drawScore();
}

function resetObstacle() {
    obstacle.x = canvas.width;
    obstacle.y = Math.random() * (canvas.height - obstacle.height - 100) + 100;
}

function updateObstacleProperties() {
    obstacle.width = obstacleProperties[currentDifficultyIndex].width;
    obstacle.height = obstacleProperties[currentDifficultyIndex].height;
    obstacle.speed = obstacleProperties[currentDifficultyIndex].speed;
    obstacle.image.src = obstacleImages[currentDifficultyIndex];
}

function startGame() {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    if (gameLoop) clearInterval(gameLoop);
    score = 0;
    gameOver = false;
    resetGameToDifficulty(currentDifficultyIndex);
    gameLoop = setInterval(updateGame, 1000 / 60);
    respawnButton.style.display = 'none';
    difficultyButton.style.display = 'none';
}

function resetGameToDifficulty(difficultyIndex) {
    currentDifficultyIndex = difficultyIndex;
    updateObstacleProperties();
    resetObstacle();
}

function endGame() {
    clearInterval(gameLoop);
    gameOver = true;
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    respawnButton.style.display = 'block';
    difficultyButton.style.display = 'block';
}

function congratulations() {
    clearInterval(gameLoop);
    gameOver = true;
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Congratulations!', canvas.width / 2 - 150, canvas.height / 2);
    ctx.fillText('You Win!', canvas.width / 2 - 80, canvas.height / 2 + 60);
    respawnButton.style.display = 'block';
    difficultyButton.style.display = 'block';
}

function cycleDifficulty() {
    currentDifficultyIndex = (currentDifficultyIndex + 1) % obstacleProperties.length;
    resetGameToDifficulty(currentDifficultyIndex);
    updateObstacleProperties();
    updateDifficultyButton();
}

function updateDifficultyButton() {
    const difficulties = ['Easy', 'Medium', 'Hard', 'Impossible'];
    difficultyButton.textContent = `Set Difficulty: ${difficulties[currentDifficultyIndex]}`;
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        player.jumping = true; // Start jumping
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        player.crouching = true; // Start crouching
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        player.jumping = false; // Stop jumping
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        player.crouching = false; // Stop crouching
    }
});

startButton.addEventListener('click', startGame);
respawnButton.addEventListener('click', startGame);
difficultyButton.addEventListener('click', cycleDifficulty);
