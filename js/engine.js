/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
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
        isGameOver = false;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

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

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if (isGameOver == false) {
            win.requestAnimationFrame(main);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();

        var playerImg = Resources.get(player.sprite);
        player.spriteHeight = playerImg.height;
        player.spriteWidth = playerImg.width;

        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    function checkCollisions() {
        allEnemies.forEach(function(enemy) {
            // Steps done to check whether collision occurs or not:
            // 1. Check whether bounding box of two images collide
            // 2. Return the intersection of the rectangle if so
            // 3. If any pixels are not transparent on both sides,
            // then collision occurs.
            if (boxCollides([player.x, player.y],
                [player.spriteWidth, player.spriteHeight],
                [enemy.x, enemy.y],
                [enemy.spriteWidth, enemy.spriteHeight])){
                if (collidesWith(player, enemy)){
                    isGameOver = true;
                    return;
                }
            }
        });
    }

    /* This function is used by boxCollides() to check whether the
     * two boxes collide or not
     */
    function rectCollides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
                 b <= y2 || y > b2);
    }

    /* This function return whether the bounding boxes of two images
     * collide with each other.
     */
    function boxCollides(pos, size, pos2, size2) {
        return rectCollides(pos[0], pos[1],
                        pos[0] + size[0], pos[1] + size[1],
                        pos2[0], pos2[1],
                        pos2[0] + size2[0], pos2[1] + size2[1]);
    }

    /* This function checks whether two entities collide with each other.
     * This function is used to check whether the player came in contact
     * with other entities such as gems and enemies.
     */
    function collidesWith(entity1, entity2) {
        var alphaThreshold = 128; // ~50% opacity value

        // Coordinates of the intersected rectangle
        var entity1Pos = {
            'x': Math.floor(entity1.x),
            'y': Math.floor(entity1.y)
        };
        var entity2Pos = {
            'x': Math.floor(entity2.x),
            'y': Math.floor(entity2.y)
        };

        var minX = Math.max(entity1Pos.x, entity2Pos.x);
        var minY = Math.min(entity1Pos.y, entity2Pos.y);
        var maxX = Math.min(entity1Pos.x + entity1.spriteWidth,
            entity2Pos.x + entity2.spriteWidth);
        var maxY = Math.max(entity1Pos.y + entity1.spriteHeight,
            entity2Pos.y + entity2.spriteHeight);

        try {
            var collisionMask1 = getCollisionMask(entity1, minX, minY, maxX, maxY);
            var collisionMask2 = getCollisionMask(entity2, minX, minY, maxX, maxY);
            for (var i = 0; i < collisionMask1.length; i ++){
                if (collisionMask1[i] >= alphaThreshold  && collisionMask2[i] >= alphaThreshold) {
                    return true;
                }
            };
        }
        catch (e) {
            console.log(e.name + ': ' + e.message);
        }
        return false;
    }

    /*
     * This function returns an array containing alpha channel values
     * of the image data.
     *                   --------   (maxX, minY)
     *                  |        |
     *                  |        |
     *  (minX, maxY)     --------
     */
    function getCollisionMask(unit, minX, minY, maxX, maxY) {
        var collisionMask = [];
        // Create an off-screen canvas to redraw the image separately
        var cvs = doc.createElement('canvas');
        cvs.width = 505;
        cvs.height = 606;
        var ctx = cvs.getContext('2d');
        ctx.drawImage(Resources.get(unit.sprite), unit.x, unit.y);
        var imageData = ctx.getImageData(minX, minY, maxX-minX, maxY-minY);

        for (var x = 3; x < imageData.data.length; x += 4) {
            collisionMask.push(imageData.data[x]);
        };

        return collisionMask;
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png',   // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }


        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
