
(function() {
    /* This function is used by boxCollides() to check whether the
     * two boxes collide or not
     */
    function _rectCollides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
                 b <= y2 || y > b2);
    }

    /* This function return whether the bounding boxes of two images
     * collide with each other.
     */
    function boxCollides(pos, size, pos2, size2) {
        return _rectCollides(pos[0], pos[1],
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
            var collisionMask1 = _getCollisionMask(entity1, minX, minY, maxX, maxY);
            var collisionMask2 = _getCollisionMask(entity2, minX, minY, maxX, maxY);
            for (var i = 0; i < collisionMask1.length; i ++){
                if (collisionMask1[i] >= alphaThreshold  && collisionMask2[i] >= alphaThreshold) {
                    return true;
                }
            };
        }
        catch (e) {
            // do nothing
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
    function _getCollisionMask(unit, minX, minY, maxX, maxY) {
        var collisionMask = [];
        // Create an off-screen canvas to redraw the image separately
        var cvs = document.createElement('canvas');
        cvs.width = 808;
        cvs.height = 909;
        var ctx = cvs.getContext('2d');
        ctx.drawImage(Resources.get(unit.sprite), unit.x, unit.y);
        var imageData = ctx.getImageData(minX, minY, maxX-minX, maxY-minY);

        for (var x = 3; x < imageData.data.length; x += 4) {
            collisionMask.push(imageData.data[x]);
        };

        return collisionMask;
    }

    window.CollisionChecker = {
        'collidesWith': collidesWith,
        'boxCollides': boxCollides
    };
})();