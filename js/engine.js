/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * renders the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by rendering the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * rendern but that is not the case. What's really happening is the entire "scene"
 * is being rendern over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime,
        mousePressed = false,
        mousePosition = {
            x: 0,
            y: 0
        },
        scalingFactor = 480.0 / 808.0,
        state = 'menu'; // states available: menu, retry, nextLevel, game, pause

    canvas.width = 808;
    canvas.height = 909;
    win.onload = function() {
        doc.getElementById("wrapper").appendChild(canvas);
    };

    /**
    * Request Animation Polyfill
    */
    var requestAnimFrame = (function(){
        return  win.requestAnimationFrame       ||
                win.webkitRequestAnimationFrame ||
                win.mozRequestAnimationFrame    ||
                win.oRequestAnimationFrame      ||
                win.msRequestAnimationFrame     ||
                function(callback, element){
                    win.setTimeout(callback, 1000 / 60);
                };
    })();

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        switch (state) {
            case 'game':
                update(dt);
                render();
                break;
            case 'menu':
                updateMenu();
                renderMenu();
                break;
            case 'retry':
                break;
            case 'nextLevel':
                break;
            case 'pause':
                break;
        }

        lastTime = now;

        if (player.lives != 0) {
            requestAnimFrame(main);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        initCanvasEvents();
        createMenu();
        main();
    }

    function initCanvasEvents() {
        canvas.addEventListener('mousemove', function(event) {
            mousePosition.x = (event.offsetX / scalingFactor ||
                event.layerX / scalingFactor);
            mousePosition.y = (event.offsetY / scalingFactor ||
                event.layerY / scalingFactor);
        });

        canvas.addEventListener('mousedown', function(event) {
            mousePressed = true;
        });
        canvas.addEventListener('mouseup', function(event) {
            mousePressed = false;
        });
    }

    function changeState(changedState) {
        state = changedState;
    }

    /* Starts the game.
     *
     */
    function startGame() {
        for (var i = 0; i < allCharacters.length; i ++) {
            if (allCharacters[i].isSelected) {
                player.setupSprite(allCharacters[i].name);
                break;
            }
        }
        for (var j = 0; j < allDifficulties.length; j ++) {
            if (allDifficulties[j].isSelected) {
                player.initProperties(allDifficulties[j].difficultyValue);
            }
        }
        player.initProperties('normal');
        allObjects.forEach(function(object){
            object.setupSprite();
        });
        reset();
        lastTime = Date.now();
    }

    function createMenu() {
        var startButton = new Button(
            canvas.width / 2 - 100,
            canvas.height / 2 - 120,
            200, // width
            80, // height
            function() {
                changeState('game');
                startGame();
            },
            'START', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });

        // Difficulty buttons
        for (var i = 0, j = difficultyList.length - 1; i < difficultyList.length; i++, j--) {
            var difficultyValue = difficultyList[j];

            var selectableDifficulty = new DifficultyButton(
                canvas.width - ((i+1) * 175),
                canvas.height / 2 + 80,
                150,
                80,
                function() {
                    _selectDifficulty(this.difficultyValue);
                },
                difficultyList[j].toUpperCase(), {
                    'default': '#039BE5',
                    'hover': '#0288D1',
                    'active': '#0277BD'
                },
                difficultyList[j].toLowerCase());

            allDifficulties.push(selectableDifficulty);
        }

        // Sprite selections
        for (var i = 0, j = characterList.length - 1; i < characterList.length; i++, j--) {
            var characterName = characterList[j];

            var selectableCharacter = new Character(
                canvas.width - ((i+1) * 101),
                canvas.height / 2 + 200,
                101,
                117,
                function() {
                    _selectCharacter(this.name);
                },
                characterName);

            allCharacters.push(selectableCharacter);
        }

        allButtons.push(startButton);

        // select default character and difficulty
        _selectCharacter(characterList[0]);
        _selectDifficulty(difficultyList[0].toLowerCase());
    }

    function _selectCharacter(name) {
        allCharacters.forEach(function(sprite){
            if (sprite.name == name) {
                sprite.isSelected = true;
            }
            else {
                sprite.isSelected = false;
            }
        });
    }

    function _selectDifficulty(difficultyValue) {
        allDifficulties.forEach(function(difficulty){
            if (difficulty.difficultyValue == difficultyValue) {
                difficulty.isSelected = true;
            }
            else {
                difficulty.isSelected = false;
            }
        });
    }

    function updateMenu() {
        allButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
        allDifficulties.forEach(function(difficulty) {
            difficulty.update(mousePosition, mousePressed);
        });
        allCharacters.forEach(function(sprite) {
            sprite.update(mousePosition, mousePressed);
        });
    }

    function renderMenu() {
        ctx.fillStyle = '#43a047';
        ctx.fillRect(0, 0, 808, 909);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '48pt Avenir';
        ctx.fillText('Frogger Clone', canvas.width / 2, 200);

        ctx.font = '36pt Avenir';
        ctx.textAlign = 'start';
        ctx.fillText('Difficulty: ', 40, canvas.height / 2 + 120);

        ctx.fillText('Character: ', 40, canvas.height / 2 + 250);

        allButtons.forEach(function(button) {
            button.render();
        });
        allDifficulties.forEach(function(difficulty) {
            difficulty.render();
        });
        allCharacters.forEach(function(sprite) {
            sprite.render();
        });
    }

    function update(dt) {
        updateEntities(dt);
        checkEnemyCollisions();
        checkPickableCollisions();
        updateStats();
    }

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        //allObjects.forEach(function(object) {
        //    object.update();
        //});
       player.update();
    }

    function updateStats() {
        // Text attributes
        ctx.font = '24pt roboto';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'black';
        ctx.clearRect(0,0,canvas.width,50);
        ctx.fillText('Lives: ' + player.lives, 0, 40);
        ctx.fillText('Score: ' + player.score, canvas.width / 2, 40);
    }

    function checkEnemyCollisions() {
        allEnemies.forEach(function(enemy) {
            if (CollisionChecker.boxCollides([player.x, player.y],
                [player.spriteWidth, player.spriteHeight],
                [enemy.x, enemy.y],
                [enemy.spriteWidth, enemy.spriteHeight])){
                if (CollisionChecker.collidesWith(player, enemy)){
                    player.lives --;
                    player.resetPos();
                    return;
                }
            }
        });
    }

    function checkPickableCollisions() {
        // If player reaches water then they win
        if (player.y <= 0 && player.isGoalReachable) {
            isGameOver = true;
        }
        allObjects.forEach(function(object){
            if (object.isPickable && CollisionChecker.boxCollides([player.x, player.y],
                [player.spriteWidth, player.spriteHeight],
                [object.x, object.y],
                [object.spriteWidth, object.spriteHeight])){
                if (CollisionChecker.collidesWith(player, object)){
                    object.handleCollision(player);
                }
            }
        });
    }

    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 5 of stone
                'images/stone-block.png',   // Row 2 of 5 of stone
                'images/stone-block.png',   // Row 3 of 5 of stone
                'images/stone-block.png',   // Row 4 of 5 of stone
                'images/stone-block.png',   // Row 5 of 5 of stone
                'images/grass-block.png',   // Row 1 of 4 of grass
                'images/grass-block.png',   // Row 2 of 4 of grass
                'images/grass-block.png',   // Row 3 of 4 of grass
                'images/grass-block.png'    // Row 4 of 4 of grass
            ],
            numRows = 10,
            numCols = 8,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, render the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to render, the x coordinate
                 * to start rendering and the y coordinate to start rendering.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }


        renderEntities();
    }

    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        allObjects.forEach(function(object) {
            object.render();
        });

        player.render();
    }

    function reset() {
        // noop
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/gem-blue.png',
        'images/gem-orange.png',
        'images/gem-green.png',
        'images/heart.png',
        'images/key.png',
        'images/rock.png',
        'images/selector.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
