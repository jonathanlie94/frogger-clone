/**
 * @description A simple image loading utility. It eases the process of loading
 * image files so that they can be used within your game. It also includes
 * a simple "caching" layer so it will reuse cached images if you attempt
 * to load the same image multiple times.
 * @namespace Resources
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    /**
     * @description A publicly accessible image loading function. It accepts
     * an array of strings pointing to image files or a string for a single
     * image. It will then call our private image loading function accordingly.
     * @memberof Resources
     * @param {array|string} urlOrArr - Array of images / string containing url of image
     */
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            /* If the developer passed in an array of images
             * loop through each value and call our image
             * loader on that image file
             */
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        } else {
            /* The developer did not pass an array to this function,
             * assume the value is a string and call our image loader
             * directly.
             */
            _load(urlOrArr);
        }
    }

    /**
     * @description A private image loader function, and it is
     * called by the public image loader function.
     * @memberof Resources
     * @param {string} url - The url of the resource.
     */
    function _load(url) {
        if(resourceCache[url]) {
            /* If this URL has been previously loaded it will exist within
             * our resourceCache array. Just return that image rather
             * re-loading the image.
             */
            return resourceCache[url];
        } else {
            /* This URL has not been previously loaded and is not present
             * within our cache; we'll need to load this image.
             */
            var img = new Image();
            img.onload = function() {
                /* Once our image has properly loaded, add it to our cache
                 * so that we can simply return this image if the developer
                 * attempts to load this file in the future.
                 */
                resourceCache[url] = img;

                /* Once the image is actually loaded and properly cached,
                 * call all of the onReady() callbacks we have defined.
                 */
                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };

            /* Set the initial cache value to false, this will change when
             * the image's onload event handler is called. Finally, point
             * the images src attribute to the passed in URL.
             */
            resourceCache[url] = false;
            img.src = url;
        }
    }

    /**
     * @description This is used by developer's to grab references to images they know
     * have been previously loaded. If an image is cached, this functions
     * the same as calling load() on that URL.
     * @memberof Resources
     * @param {string} url - The url of the resource.
     * @return {object} - An image object from resourceCache.
     */
    function get(url) {
        return resourceCache[url];
    }

    /**
     * @description Determines if all of the images that have been requested
     * for loading have in fact been completed loaded.
     * @memberof Resources
     */
    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    /**
     * @description Add a function to the callback stack that is called
     * when all requested images are properly loaded.
     * @memberof Resources
     * @param {funcCallback} func - The function that is passed on to the queue, which should
     * be run after the resources have finished loading.
     */
    function onReady(func) {
        readyCallbacks.push(func);
    }

    /**
     * @description This is the function that is passed on to the queue of callback functions that
     * should be run after resources are ready (finished loading).
     * @callback funcCallback
     */

    /* This object defines the publicly accessible functions available to
     * developers by creating a global Resources object.
     */
    window.Resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();
