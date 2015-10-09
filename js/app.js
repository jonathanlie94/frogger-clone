// Enemies our player must avoid
var Enemy = function(row, speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.startingRow = row;
    this.speed = speed;
    this.x = 0;
    this.y = row * 83 - 18;
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.outOfBounds()) {
        // reset its position
        this.x = 0;
        this.y = this.startingRow * 83 - 18;
    }
    this.x += dt * this.speed;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Check if the enemy is out of canvas' bounds
Enemy.prototype.outOfBounds = function() {
    if (this.x > ctx.canvas.width) {
        return true;
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.x = 2 * 101.0;
    this.y = 5 * 83.0;
    this.keyStates = {
        'left': false,
        'up': false,
        'right': false,
        'down': false
    };
    this.sprite = 'images/char-boy.png';
    // The sprite height and width are currently hard-coded,
    // they are not fetched from the image properties.
    this.spriteHeight = 171;
    this.spriteWidth = 101;
};

Player.prototype.update = function() {
    var movementSpeed = 2;
    console.log(this.spriteHeight);
    if (this.keyStates.left && this.x > 0) {
        this.x -= movementSpeed;
    }
    if (this.keyStates.up && this.y > 0) {
        this.y -= movementSpeed;
    }
    if (this.keyStates.right &&
        this.x < ctx.canvas.width - this.spriteWidth) {
        this.x += movementSpeed;
    }
    if (this.keyStates.down &&
        this.y < ctx.canvas.height - this.spriteHeight) {
        this.y += movementSpeed;
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(eventType, keyCode) {
    if (eventType === 'keydown') {
        this.keyStates[keyCode] = true;
    }
    else if (eventType === 'keyup') {
        this.keyStates[keyCode] = false;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var enemy1 = new Enemy(1, 100);
var enemy2 = new Enemy(2, 50);
var enemy3 = new Enemy(3, 200);
var allEnemies = [enemy1, enemy2, enemy3];

var player = new Player();
//ctx.addEventListener('click', player.handleInput, false);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput('keyup', allowedKeys[e.keyCode]);
});

// This 'move' event is triggered when 'keydown' event is fired.
//
document.addEventListener('move', function(e) {
     var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput('keydown', allowedKeys[e.keyCode]);
});

document.addEventListener('keydown', function(e) {
    var evt = new Event('move');
    evt.keyCode = e.keyCode;
    document.dispatchEvent(evt);
});