// Singleton state controller for shared state
var StateController = function() {
    if (StateController.prototype._singletonInstance) {
        return StateController.prototype._singletonInstance;
    }

    StateController.prototype._singletonInstance = this;
    var _state = 'menu';

    this.setState = function(state) {
        _state = state;
    };

    this.getState = function() {
        return _state;
    };
};

// Enemies our player must avoid
var Enemy = function(row, speed) {
    this.startingRow = row;
    this.speed = speed;
    this.x = -101;
    this.y = (row - 1) * 83 + 18;
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.x > ctx.canvas.width) {
        // reset its position
        this.x = -101;
        this.y = (this.startingRow - 1) * 83 + 18;
    }
    this.x += dt * this.speed;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.setupSpriteParam = function() {
    var enemyImg = Resources.get(this.sprite);
    this.spriteHeight = enemyImg.height;
    this.spriteWidth = enemyImg.width;
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    if (Player.prototype._singletonInstance) {
        return Player.prototype._singletonInstance;
    }

    Player.prototype._singletonInstance = this;
    var _isGoalReachable = false;
    var _score = 0;

    this.x = 3 * 101;
    this.y = 8 * 83;
    this.keyStates = {
        'left': false,
        'up': false,
        'right': false,
        'down': false
    };

    this.resetScore = function() {
        _score = 0;
    };

    this.getScore = function() {
        return _score;
    };

    this.addScore = function(score) {
        _score += score;
    };

    this.getGoalReachable = function() {
        return _isGoalReachable;
    };

    this.setGoalReachable = function(isGoalReachable) {
        _isGoalReachable = isGoalReachable;
    };
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


Player.prototype.setupSprite = function(spriteName) {
    this.sprite = 'images/' + spriteName + '.png';
    var playerImg = Resources.get(this.sprite);
    this.spriteHeight = playerImg.height;
    this.spriteWidth = playerImg.width;
};

/* This function determines whether the player will collide if
 * it moves to the direction passed in the parameter.
 */
Player.prototype.collidesWithBlockers = function(direction) {
    var _this = this;
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
            [_this.spriteWidth, _this.spriteHeight],
            [object.x, object.y],
            [object.spriteWidth, object.spriteHeight])) {
            _this.x = futureX;
            _this.y = futureY;
            if (CollisionChecker.collidesWith(_this, object)) {
                ret = true;
            }
            _this.x = previousX;
            _this.y = previousY;
        }
    });
    return ret;
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.resetPos = function() {
    this.x = 4 * 101;
    this.y = 8 * 83;
};

Player.prototype.initProperties = function(difficulty) {
    switch (difficulty) {
        case 'easy':
            this.lives = 6;
            this.movementSpeed = 5;
            break;
        case 'normal':
            this.lives = 4;
            this.movementSpeed = 4;
            break;
        case 'hard':
            this.lives = 3;
            this.movementSpeed = 4;
            break;
    }
};

Player.prototype.handleInput = function(eventType, keyCode) {
    if (eventType === 'keydown') {
        this.keyStates[keyCode] = true;

    }
    else if (eventType === 'keyup') {
        this.keyStates[keyCode] = false;
    }
};

/* A superclass for all in-game objects such as gems, keys.
 */
var InGameObject = function(column, row) {
    this.visible = true;
    this.isPickable = true;
    this.column = column ;
    this.row = row;
    this.x = (column - 1) * 101;
    this.y = (row - 1) * 83 + 18;
};

InGameObject.prototype.render = function() {
    if (this.visible) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

InGameObject.prototype.setupSpriteParam = function() {
    var spriteImg = Resources.get(this.sprite);
    this.spriteHeight = spriteImg.height;
    this.spriteWidth = spriteImg.width;
};

/* Gems give player extra score when picked up.
 * colorNum: 1=blue, 2=orange, 3=green
 * Blue: 5000, Orange: 2000, Green: 500
 */
var Gem = function(column, row, colorNum) {
    InGameObject.call(this, column, row);
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
    player.addScore(this.score);
    var index = allObjects.indexOf(this);
    if (index > -1) {
        allObjects.splice(index, 1);
    }
}

/* Keys must be picked up before players can proceed to goal.
 */
var Key = function(column, row) {
    InGameObject.call(this, column, row);
    this.sprite = 'images/key.png';
};
Key.prototype = Object.create(InGameObject.prototype);
Key.prototype.constructor = Key;

Key.prototype.handleCollision = function(player) {
    this.visible = false;
    player.setGoalReachable(true);
    var index = allObjects.indexOf(this);
    if (index > -1) {
        allObjects.splice(index, 1);
    }
};

/* Rocks are purely obstacles that player cannot pass through.
 */
var Rock = function(column, row) {
    InGameObject.call(this, column, row);
    this.sprite = 'images/rock.png';
    this.isPickable = false;
}
Rock.prototype = Object.create(InGameObject.prototype);
Rock.prototype.constructor = Rock;

/* Hearts give players extra lives when picked up.
 */
var Heart = function(column, row) {
    InGameObject.call(this, column, row);
    this.sprite = 'images/heart.png';
}
Heart.prototype = Object.create(InGameObject.prototype);
Heart.prototype.constructor = Heart;

Heart.prototype.handleCollision = function(player) {
    this.visible = false;
    player.lives ++;
    var index = allObjects.indexOf(this);
    if (index > -1) {
        allObjects.splice(index, 1);
    }
}

var GameRandomizer = function() {
    this.difficulty = 'easy';
    this.level = 1;
};

GameRandomizer.prototype.setDifficulty = function(difficulty) {
    this.difficulty = difficulty;
};

GameRandomizer.prototype.randomize = function() {
    allEnemies.length = 0;
    allObjects.length = 0;
    var enemyCount, heartCount, rockCount, gemCount;
    var colLength = 8;
    var rowLength = 10;
    var occupied = [];
    for (var i = 0; i < colLength; i++) {
        occupied[i] = [];
        for(var j = 0; j < rowLength; j++) {
            occupied[i][j] = false;
        }
    }

    switch (this.difficulty) {
        case 'easy':
            enemyCount = 4;
            heartCount = 3;
            rockCount = 0;
            gemCount = 2;
            break;
        case 'normal':
            enemyCount = 6;
            heartCount = 2;
            rockCount = 1;
            gemCount = 3;
            break;
        case 'hard':
            enemyCount = 8;
            heartCount = 1;
            rockCount = 2;
            gemCount = 4;
            break;
    }

    // Scale the counts as level goes up
    enemyCount += this.level % 4;
    rockCount += this.level % 10;
    gemCount += this.level % 3;

    // Randomize enemies
    for (var i = 0; i < enemyCount; i++) {
        var row = Math.floor(Math.random() * 5) + 2;
        var speed = Math.random() * 350 + 50;
        var enemy = new Enemy(row, speed);
        allEnemies.push(enemy);
    }

    // Randomize hearts
    for (var i = 0; i < heartCount; i++) {
        var col, row;
        do {
            col = Math.floor(Math.random() * 5) + 1;
            row = Math.floor(Math.random() * 5) + 2;
        } while (occupied[col - 1][row - 1]);
        occupied[col - 1][row - 1] = true;

        var heart = new Heart(col, row);
        allObjects.push(heart);
    }

    // Randomize rocks
    for (var i = 0; i < rockCount; i++) {
        var col, row;
        do {
            col = Math.floor(Math.random() * 5) + 1;
            row = Math.floor(Math.random() * 5) + 2;
        } while (occupied[col - 1][row - 1]);
        occupied[col - 1][row - 1] = true;

        var rock = new Rock(col, row);
        allObjects.push(rock);
    }

    // Randomize gems
    for (var i = 0; i < gemCount; i++) {
        var col, row;
        do {
            col = Math.floor(Math.random() * 5) + 1;
            row = Math.floor(Math.random() * 6) + 2;
        } while (occupied[col - 1][row - 1]);
        occupied[col - 1][row - 1] = true;
        var colorNum = Math.floor(Math.random() * 2 + 1);

        var gem = new Gem(col, row, colorNum);
        allObjects.push(gem);
    }

    // Randomize key
    var col, row;
    do {
        col = Math.floor(Math.random() * 5) + 1;
        row = Math.floor(Math.random() * 5) + 2;
    } while (occupied[col - 1][row - 1]);
    occupied[col - 1][row - 1] = true;

    var key = new Key(col, row);
    allObjects.push(key);
}


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

// These lists define the options to be displayed in the menu.
// For character list, the corresponding image must also be laoded beforehand.
var characterList = ['char-boy',
    'char-cat-girl',
    'char-horn-girl',
    'char-pink-girl',
    'char-princess-girl'
];

var difficultyList = ['Easy',
    'Normal',
    'Hard'
];

var allEnemies = [],
    allMenuScreenButtons = [],
    allRetryScreenButtons = [],
    allNextLevelScreenButtons = [],
    allPauseScreenButtons = [],
    allGameScreenButtons = [],
    allCharacters = [],
    allDifficulties = [],
    allObjects = [];

var randomizer = new GameRandomizer();
var stateController = new StateController();
var player = new Player();

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