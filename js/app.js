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
    this.spriteHeight = 101;
    this.spriteWidth = 171;
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
    this.x = 4 * 101;
    this.y = 8 * 83;
    this.keyStates = {
        'left': false,
        'up': false,
        'right': false,
        'down': false
    };
    this.score = 0;
    this.isGoalReachable = false;
};

Player.prototype.initProperties = function(difficulty) {
    switch (difficulty) {
        case 'easy':
            this.lives = 6;
            this.movementSpeed = 4;
            break;
        case 'normal':
            this.lives = 4;
            this.movementSpeed = 3;
            break;
        case 'hard':
            this.lives = 2;
            this.movementSpeed = 2;
            break;
    }
};

Player.prototype.update = function() {
    if (this.keyStates.left && this.x >= 0
        && !this.collidesWithBlockers('left')) {
        this.move('left');
    }
    if (this.keyStates.up && this.y >= 0
        && !this.collidesWithBlockers('up')) {
        this.move('up');
    }
    if (this.keyStates.right &&
        this.x < ctx.canvas.width - this.spriteWidth
        && !this.collidesWithBlockers('right')) {
        this.move('right');
    }
    if (this.keyStates.down &&
        this.y < ctx.canvas.height - this.spriteHeight
        && !this.collidesWithBlockers('down')) {
        this.move('down');
    }
};

Player.prototype.move = function(direction) {
    switch(direction) {
        case 'left':
            this.x -= this.movementSpeed;
            break;
        case 'up':
            this.y -= this.movementSpeed;
            break;
        case 'right':
            this.x += this.movementSpeed;
            break;
        case 'down':
            this.y += this.movementSpeed;
            break;
    }
};

Player.prototype.collidesWithBlockers = function(direction) {
    var self = this;
    var ret = false;
    var previousX = this.x;
    var previousY = this.y;
    var futureX = this.x;
    var futureY = this.y;
    switch(direction) {
        case 'left':
            futureX -= this.movementSpeed;
            break;
        case 'up':
            futureY -= this.movementSpeed;
            break;
        case 'right':
            futureX += this.movementSpeed;
            break;
        case 'down':
            futureY += this.movementSpeed;
            break;
    }
    allObjects.forEach(function(object){
        if (!object.isPickable && CollisionChecker.boxCollides([futureX, futureY],
                [self.spriteWidth, self.spriteHeight],
                [object.x, object.y],
                [object.spriteWidth, object.spriteHeight])) {
                self.x = futureX;
                self.y = futureY;
                if (CollisionChecker.collidesWith(self, object)) {
                    ret = true;
                }
                self.x = previousX;
                self.y = previousY;
            }
    });
    return ret;
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

Player.prototype.setupSprite = function(spriteName) {
    this.sprite = 'images/char-' + spriteName + '.png';
    var playerImg = Resources.get(this.sprite);
    this.spriteHeight = playerImg.height;
    this.spriteWidth = playerImg.width;
};

/* A superclass for all in-game objects such as gems, keys.
 */
var InGameObject = function(row, column) {
    this.visible = true;
    this.isPickable = true;
    this.row = row;
    this.column = column;
    this.x = row * 101;
    this.y = row * 83;
};

InGameObject.prototype.setupSprite = function() {
    var spriteImg = Resources.get(this.sprite);
    this.spriteHeight = spriteImg.height;
    this.spriteWidth = spriteImg.width;
};

InGameObject.prototype.render = function() {
    if (this.visible) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

/* Gems give player extra score when picked up.
 * colorNum: 1=blue, 2=orange, 3=green
 * Blue: 5000, Orange: 2000, Green: 500
 */
var Gem = function(row, column, colorNum) {
    InGameObject.call(this, row, column);
    var colorMap = {
        1: {'name': 'blue', 'score': 5000},
        2: {'name': 'orange', 'score': 2000},
        3: {'name': 'green', 'score': 500}
    };
    this.sprite = 'images/gem-' + colorMap[colorNum].name + '.png';
    this.score = colorMap[colorNum].score;
};
Gem.prototype = Object.create(InGameObject.prototype);
Gem.prototype.constructor = Gem;

Gem.prototype.handleCollision = function(player) {
    this.visible = false;
    player.score += this.score;
    this.spriteHeight = 1;
    this.spriteWidth = 1;
}

/* Keys must be picked up before players can proceed to goal.
 */
var Key = function(row, column) {
    InGameObject.call(this, row, column);
    this.sprite = 'images/key.png';
};
Key.prototype = Object.create(InGameObject.prototype);
Key.prototype.constructor = Key;

Key.prototype.handleCollision = function(player) {
    this.visible = false;
    player.isGoalReachable = true;
    this.spriteHeight = 1;
    this.spriteWidth = 1;
}

/* Rocks are purely obstacles that player cannot pass through.
 */
var Rock = function(row, column) {
    InGameObject.call(this, row, column);
    this.sprite = 'images/rock.png';
    this.isPickable = false;
}
Rock.prototype = Object.create(InGameObject.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.handleCollision = function(player) {
}

/* Hearts give players extra lives when picked up.
 */
var Heart = function(row, column) {
    InGameObject.call(this, row, column);
    this.sprite = 'images/heart.png';
}
Heart.prototype = Object.create(InGameObject.prototype);
Heart.prototype.constructor = Heart;

Heart.prototype.handleCollision = function(player) {
    this.visible = false;
    this.spriteHeight = 1;
    this.spriteWidth = 1;
    player.lives ++;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

/*
var enemy1 = new Enemy(1, 100);
var enemy2 = new Enemy(2, 50);
var enemy3 = new Enemy(3, 200);
var allEnemies = [enemy1, enemy2, enemy3];
*/
var allEnemies = [];
var player = new Player();

var heart1  = new Heart(1,2);
var rock1   = new Rock(2,3);
var gem1    = new Gem(3,4,1);
var key     = new Key(4,4);
var allObjects = [heart1, rock1, gem1, key];

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