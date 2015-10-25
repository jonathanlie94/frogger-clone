/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * renders the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
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
        scalingFactor = 480.0 / 808.0;

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
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        var state = stateController.getState();
        switch (state) {
            case 'game':
                updateGame(dt);
                renderGame();
                break;
            case 'menu':
                updateMainMenu();
                renderMainMenu();
                break;
            case 'retry':
                updateRetryMenu();
                renderRetryMenu();
                break;
            case 'nextLevel':
                updateNextLevelMenu();
                renderNextLevelMenu();
                break;
            case 'pause':
                updatePauseMenu();
                renderPauseMenu();
                break;
        }

        lastTime = now;
        requestAnimFrame(main);

        if (player.lives == 0) {
            stateController.setState('retry');
        }
        if (player.y <= 40 && player.getGoalReachable()) {
            stateController.setState('nextLevel');
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        initCanvasEvents();
        createMainMenu();
        createRetryMenu();
        createNextLevelMenu();
        createPauseMenu();
        createGameMenu();
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

    function createMainMenu() {
        var startButton = new Button(
            canvas.width / 2 - 100,
            canvas.height / 2 - 120,
            200, // width
            80, // height
            function() {
                stateController.setState('game');
                player.resetScore();
                player.resetPos();
                player.setGoalReachable(false);
                for (var i = 0; i < allCharacters.length; i ++) {
                    if (allCharacters[i].isSelected) {
                        player.setupSprite(allCharacters[i].name);
                        break;
                    }
                }
                for (var j = 0; j < allDifficulties.length; j ++) {
                    if (allDifficulties[j].isSelected) {
                        player.initProperties(allDifficulties[j].difficultyValue);
                        randomizer.setDifficulty(allDifficulties[j].difficultyValue);
                        break;
                    }
                }
                randomizer.level = 1;
                randomizer.randomize();
                allObjects.forEach(function(object){
                    object.setupSpriteParam();
                });
                allEnemies.forEach(function(object){
                    object.setupSpriteParam();
                });

                lastTime = Date.now();
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

        allMenuScreenButtons.push(startButton);

        // select default character and difficulty
        _selectCharacter(characterList[0]);
        _selectDifficulty(difficultyList[0].toLowerCase());
    }

    function createRetryMenu() {
        var retryButton = new Button(
            canvas.width / 2 - 200,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                player.setGoalReachable(false);
                player.resetScore();
                randomizer.level = 1;
                randomizer.randomize();
                for (var j = 0; j < allDifficulties.length; j ++) {
                    if (allDifficulties[j].isSelected) {
                        player.initProperties(allDifficulties[j].difficultyValue);
                        break;
                    }
                }
                allObjects.forEach(function(object){
                    object.setupSpriteParam();
                });
                allEnemies.forEach(function(object){
                    object.setupSpriteParam();
                });
                stateController.setState('game');
            },
            'RETRY', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });

        var backToMainButton = new Button(
            canvas.width / 2 + 50,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                stateController.setState('menu');
                player.setGoalReachable(false);
                player.resetScore();
            },
            'MAIN MENU', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });
        allRetryScreenButtons.push(retryButton);
        allRetryScreenButtons.push(backToMainButton);
    }

    function createNextLevelMenu() {
        var nextLevelButton = new Button(
            canvas.width / 2 - 200,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                randomizer.randomize();
                player.resetPos();
                player.setGoalReachable(false);
                allObjects.forEach(function(object){
                    object.setupSpriteParam();
                });
                allEnemies.forEach(function(object){
                    object.setupSpriteParam();
                });
                randomizer.level += 1;
                stateController.setState('game');
            },
            'NEXT LEVEL', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });

        var backToMainButton = new Button(
            canvas.width / 2 + 50,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                stateController.setState('menu');
                for (var j = 0; j < allDifficulties.length; j ++) {
                    if (allDifficulties[j].isSelected) {
                        player.initProperties(allDifficulties[j].difficultyValue);
                        break;
                    }
                }
                player.setGoalReachable(false);
                player.resetScore();
            },
            'MAIN MENU', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });
        allNextLevelScreenButtons.push(nextLevelButton);
        allNextLevelScreenButtons.push(backToMainButton);
    }

    function createPauseMenu() {
        var resumeButton = new Button(
            canvas.width / 2 - 200,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                stateController.setState('game');
            },
            'RESUME', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });

        var backToMainButton = new Button(
            canvas.width / 2 + 50,
            canvas.height / 2 - 40,
            150, // width
            80, // height
            function() {
                stateController.setState('menu');
                for (var j = 0; j < allDifficulties.length; j ++) {
                    if (allDifficulties[j].isSelected) {
                        player.initProperties(allDifficulties[j].difficultyValue);
                        break;
                    }
                }
            },
            'MAIN MENU', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });

        allPauseScreenButtons.push(resumeButton);
        allPauseScreenButtons.push(backToMainButton);
    }

    function createGameMenu() {
        var pauseButton = new Button(
            canvas.width - 155,
            5,
            150, // width
            40, // height
            function() {
                stateController.setState('pause');
            },
            'PAUSE', {
                'default': '#039BE5',
                'hover': '#0288D1',
                'active': '#0277BD'
            });
        allGameScreenButtons.push(pauseButton);
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

    function updateMainMenu() {
        allMenuScreenButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
        allDifficulties.forEach(function(difficulty) {
            difficulty.update(mousePosition, mousePressed);
        });
        allCharacters.forEach(function(sprite) {
            sprite.update(mousePosition, mousePressed);
        });
    }

    function renderMainMenu() {
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

        allMenuScreenButtons.forEach(function(button) {
            button.render();
        });
        allDifficulties.forEach(function(difficulty) {
            difficulty.render();
        });
        allCharacters.forEach(function(sprite) {
            sprite.render();
        });
    }

    function updateRetryMenu() {
        allRetryScreenButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
    }

    function renderRetryMenu() {
        ctx.fillStyle = '#43a047';
        ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 400, 600, 600);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '48pt Avenir';
        ctx.fillText('Your score: ' + player.getScore(), canvas.width / 2, 200);


        allRetryScreenButtons.forEach(function(button) {
            button.render();
        });
    }

    function updateNextLevelMenu() {
        allNextLevelScreenButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
    }

    function renderNextLevelMenu() {
        ctx.fillStyle = '#43a047';
        ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 200, 600, 400);

        allNextLevelScreenButtons.forEach(function(button) {
            button.render();
        });
    }

    function updatePauseMenu() {
        allPauseScreenButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
    }

    function renderPauseMenu() {
        ctx.fillStyle = '#43a047';
        ctx.fillRect(canvas.width / 2 - 300, canvas.height / 2 - 400, 600, 600);

        allPauseScreenButtons.forEach(function(button) {
            button.render();
        });
    }

    function updateGame(dt) {
        allGameScreenButtons.forEach(function(button) {
            button.update(mousePosition, mousePressed);
        });
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
        ctx.fillText('Score: ' + player.getScore(), canvas.width / 2, 40);
        ctx.fillText('Level: ' + randomizer.level, canvas.width / 2 - 200, 40);
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
        if (player.y <= 0 && player.getGoalReachable()) {
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

    function renderGame() {
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

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        allGameScreenButtons.forEach(function(button) {
            button.render();
        })

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
