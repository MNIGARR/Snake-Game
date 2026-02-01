const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const highScoreText = document.querySelector("#highScoreText");
const resetBtn = document.querySelector("#resetBtn");
const themeToggle = document.querySelector("#themeToggle");

// level buttons
const easyBtn = document.querySelector("#easyBtn");
const mediumBtn = document.querySelector("#mediumBtn");
const hardBtn = document.querySelector("#hardBtn");

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const unitSize = 25;

// game state variables
let running = false;
let paused = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0; 
let gameSpeed = 75;

// Theme Colors
let boardBackground = "white";
let snakeColor = "lightgreen";
let snakeBorder = "black";
let foodColor = "red";

let snake = [
    {x:unitSize * 4, y:0},
    {x:unitSize * 3, y:0},
    {x:unitSize * 2, y:0},
    {x:unitSize, y:0},
    {x:0, y:0}
];

// event listeners
window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
themeToggle.addEventListener("change", toggleTheme);

// when buttons are clicked, set the game speed and reset the game
easyBtn.addEventListener("click", () => { setDifficulty(150, easyBtn); easyBtn.blur(); });
mediumBtn.addEventListener("click", () => { setDifficulty(75, mediumBtn); mediumBtn.blur(); });
hardBtn.addEventListener("click", () => { setDifficulty(40, hardBtn); hardBtn.blur(); });

// Start the game
highScoreText.textContent = highScore;
gameStart();

function gameStart(){
    running = true;
    paused = false;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
};

function nextTick(){
    // if the game is not running, display game over and return
    if(!running){
        displayGameOver();
        return;
    }

    setTimeout(()=>{
        // Control pause state
        if(paused){
            ctx.fillStyle = snakeBorder;
            ctx.font = "50px Roboto Mono";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", gameWidth / 2, gameHeight / 2);
            
            // the loop continues but doesn't update the game state
            nextTick(); 
            return;
        }

        clearBoard();
        drawFood();
        moveSnake();
        drawSnake();
        checkGameOver();
        
        // next step
        nextTick();
    }, gameSpeed);
};

function clearBoard(){
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};

function createFood(){
    function randomFood(min, max){
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameWidth - unitSize);
};

function drawFood(){
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
};

function moveSnake(){
    const head = {x: snake[0].x + xVelocity,
                  y: snake[0].y + yVelocity};
    
    snake.unshift(head);
    // if food is eaten
    if(snake[0].x == foodX && snake[0].y == foodY){
        score+=1;
        scoreText.textContent = score;
        
        // if the new score is greater than the highest score, update the score
        if(score > highScore) {
            highScore = score;
            highScoreText.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }
        
        createFood();
    }
    else{
        snake.pop();
    }     
};

function drawSnake(){
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    })
};

function changeDirection(event){
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const SPACE = 32; 

    // Pause button
    if (keyPressed === SPACE) {
        paused = !paused; // change pause state
        return;
    }

    // if game is paused, don't change the direction
    if(paused) return;

    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);

    switch(true){
        case(keyPressed == LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case(keyPressed == UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case(keyPressed == RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case(keyPressed == DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
};

function checkGameOver(){
    // if snake hits wall
    switch(true){
        case (snake[0].x < 0):
        case (snake[0].x >= gameWidth):
        case (snake[0].y < 0):
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }
    // if snake bites itself
    for(let i = 1; i < snake.length; i+=1){
        if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
            running = false;
        }
    }
};

function displayGameOver(){
    ctx.font = "50px Roboto Mono";
    ctx.fillStyle = snakeBorder;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
};

function resetGame(){
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        {x:unitSize * 4, y:0},
        {x:unitSize * 3, y:0},
        {x:unitSize * 2, y:0},
        {x:unitSize, y:0},
        {x:0, y:0}
    ];
    gameStart();
};

function setDifficulty(speed, btn) {
    gameSpeed = speed;
    
    // Remove 'active' class from all buttons
    easyBtn.classList.remove("active");
    mediumBtn.classList.remove("active");
    hardBtn.classList.remove("active");
    
    // Add clicked button 'active' class
    btn.classList.add("active");
    
    running = false; 
    resetGame();
}

function toggleTheme(e) {
    if (e.target.checked) {
        // Dark Mode
        document.documentElement.setAttribute('data-theme', 'dark');
        boardBackground = "#222"; 
        snakeColor = "#00ffcc";   
        snakeBorder = "white";
        foodColor = "#ff0055";    
    } else {
        // Light Mode
        document.documentElement.setAttribute('data-theme', 'light');
        boardBackground = "white";
        snakeColor = "lightgreen";
        snakeBorder = "black";
        foodColor = "red";
    }
    
    // when game is not running, redraw the board with new theme
    if (!running || paused) {
        clearBoard();
        drawFood();
        drawSnake();
        if(paused) {
            ctx.fillStyle = snakeBorder;
            ctx.fillText("PAUSED", gameWidth / 2, gameHeight / 2);
        }
    }
}