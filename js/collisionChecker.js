
/** @namespace CollisionChecker */
(function() {
    /**
     * @description This is a private function which s used by boxCollides() to check whether the
     * bounding boxes of two entities collide or not.
     * @memberof CollisionChecker
     * @param {integer} x - Starting x coordinate of the first entity's bounding box.
     * @param {integer} y - Starting y coordinate of the first entity's bounding box.
     * @param {integer} r - Ending x coordinate of the first entity's bounding box.
     * @param {integer} b - Ending y coordinate of the first entity's bounding box.
     * @param {integer} x2 - Starting x coordinate of the second entity's bounding box.
     * @param {integer} y2 - Starting y coordinate of the second entity's bounding box.
     * @param {integer} r2 - Ending x coordinate of the second entity's bounding box.
     * @param {integer} b2 - Ending y coordinate of the second entity's bounding box.
     * @return {boolean} - Whether the bounding boxes collide.
     */
    function _rectCollides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
                 b <= y2 || y > b2);
    }

    /**
     * @description This function returns whether the bounding boxes of two images
     * collide with each other. This function uses _rectCollides() for calculation.
     * @memberof CollisionChecker
     * @param {array} pos - Starting positions of the first entity's bounding box. First member of
     * the array is the x coordinate, and the second member is the y coordinate.
     * @param {array} size - Size of the first entity's bounding box. First member of the array
     * is the length, and the second member is the width.
     * @param {array} pos - Starting positions of the second entity's bounding box. First member of
     * the array is the x coordinate, and the second member is the y coordinate.
     * @param {array} size - Size of the second entity's bounding box. First member of the array
     * is the length, and the second member is the width.
     * @return {boolean} - Whether the bounding boxes collide.
     */
    function boxCollides(pos, size, pos2, size2) {
        return _rectCollides(pos[0], pos[1],
                        pos[0] + size[0], pos[1] + size[1],
                        pos2[0], pos2[1],
                        pos2[0] + size2[0], pos2[1] + size2[1]);
    }


    /*
     * @description This is a private function which returns an array containing
     * alpha channel vlaues of the image data. It redraws the sprite of the unit
     * on another canvas off-screen and gets the alpha channel of the imageData.
     * @memberof CollisionChecker
     * @param {object} unit - Any of the objects of classes Player, Enemy, or any object
     * which extends InGameObject.
     * @param {minX} - Lower left x coordinate of the sprite.
     * @param {maxY} - Lower left y coordinate of the sprite.
     * @param {maxX} - Upper right x coordinate of the sprite.
     * @param {minY} - Upper right y coordinate of the sprite.
     * @return {array} - An array constaining alpha channel values of the image.
     */
    function _getCollisionMask(unit, minX, minY, maxX, maxY) {
        var collisionMask = [];
        // Create an off-screen canvas to redraw the image separately
        var cvs = document.createElement('canvas');
        cvs.width = 808;
        cvs.height = 909;
        var ctx = cvs.getContext('2d');
        ctx.drawImage(Resources.get(unit.sprite), unit.x, unit.y);
        var imageData = ctx.getImageData(minX, minY, maxX-minX, maxY-minY);

        for (var i = 3; i < imageData.data.length; i += 4) {
            collisionMask.push(imageData.data[i]);
        }

        return collisionMask;
    }

    /**
     * @description This function checks whether two entities collide with each other. This
     * function is used to check whether the player came in contact with other
     * entities such as gems and enemies.
     * @memberof CollisionChecker
     * @param {object} entity1 - Any of the objects of classes Player, Enemy, or any object
     * which extends InGameObject.
     * @param {object} entity2 - Any of the objects of classes Player, Enemy, or any object
     * which extends InGameObject.
     * @return {boolean} - Whether the two entities collide.
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
            var collisionMask1 = _getCollisionMask(entity1, minX, minY, maxX, maxY);
            var collisionMask2 = _getCollisionMask(entity2, minX, minY, maxX, maxY);
            for (var i = 0; i < collisionMask1.length; i ++){
                if (collisionMask1[i] >= alphaThreshold  && collisionMask2[i] >= alphaThreshold) {
                    return true;
                }
            }
        }
        catch (e) {
            // do nothing
        }
        return false;
    }

    window.CollisionChecker = {
        'collidesWith': collidesWith,
        'boxCollides': boxCollides
    };
})();