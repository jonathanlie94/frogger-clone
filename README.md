Frogger Clone
===============================

Check out the game live [here](https://frogger-clone-v1.herokuapp.com/)

PLEASE run this on a simple server, e.g. python -m SimpleHTTPServer, and access the game from there. This is important so that the canvas allows loading of some of the images for certain collision detection utilities, when detecting bounding boxes and pixel-perfect collisions between players and the enemies and other objects.

Instructions on how to play the game:

Win the game's levels by crossing the player to the water without colliding into any of the enemy bugs. Each time the player collides with an enemy bug, their life is reduced by 1 and they must restart from their original position. The game is over when the player's lives reach 0. The player must also pick up some objects along the way, Here are the objects:

- HEART - Gives the player extra 1 life.
- KEY - The player MUST pick up this object before they are able to proceed to the next level.
- ROCK - These objects are not pickables. They serve as obstacles; the player cannot pass through rocks.
- GEM - Gives the player scores. Different gem colors give players different scores.
	- Blue: 5000,
	- Orange: 2000,
	- Green: 500

Select your preferred character sprite and difficulty. The difficulty affects the game in the following ways:
- The number of objects such as hearts, keys, rocks, and gems are scaled according to the difficulty. The number of these objects also increase as the player reaches higher levels as well.
- The movement speed of the player is scaled with each difficulty as well.