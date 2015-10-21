var UIComponent = function(x, y, width, height, clickCB) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.clickCB = clickCB;
	this.state = 'default';
	this.isClicking = false;
};

UIComponent.prototype.update = function(mousePosition,
	mousePressed) {
	if (mousePosition.x >= this.x &&
		mousePosition.x <= this.x + this.width &&
	    mousePosition.y >= this.y &&
	    mousePosition.y <= this.y + this.height) {
		this.state = 'hover';

			// check for click
			if (mousePressed) {
		    	this.state = 'active';

		        if (typeof this.clickCB === 'function' &&
		        	!this.isClicking) {
		      		this.clickCB();
		      		this.isClicking = true;
		        }
			}
	  	else {
	        this.isClicking = false;
	  	}
	}
	else {
		this.state = 'default';
	}
};

/**
* A button with hover and active states.
* @param {string}  text  - Text on the button.
* @param {object}  colors - Default, hover, and active colors.
*
* @param {object} colors.default - Default colors.
* @param {string} colors.default.top - Top default button color.
* @param {string} colors.default.bottom - Bottom default button color.
*
* @param {object} colors.hover - Hover colors.
* @param {string} colors.hover.top - Top hover button color.
* @param {string} colors.hover.bottom - Bottom hover button color.
*
* @param {object} colors.active - Active colors.
* @param {string} colors.active.top - Top active button color.
* @param {string} colors.active.bottom - Bottom active button color.
*/
var Button = function(x, y, width, height, clickCB, text, colors) {
	UIComponent.call(this, x, y, width, height, clickCB);
	this.text = text;
	this.colors = colors;
};
Button.prototype = Object.create(UIComponent.prototype);
Button.prototype.constructor = Button;

Button.prototype.render = function() {

	var colors = this.colors[this.state];

	// button
	ctx.fillStyle = colors;
	ctx.fillRect(this.x, this.y, this.width, this.height);

	// text
	ctx.font = '16pt Avenir';
	ctx.fillStyle = '#FFF';
	ctx.textAlign = 'start';
	var size = ctx.measureText(this.text);
	var x = this.x + (this.width - size.width) / 2;
	var y = this.y + (this.height - 15) / 2 + 12;

	ctx.fillText(this.text, x, y);
};

var DifficultyButton = function(x, y, width, height, clickCB, text, colors, difficultyValue) {
	Button.call(this, x, y, width, height, clickCB, text, colors);
	this.isSelected = false;
	this.difficultyValue = difficultyValue;
}
DifficultyButton.prototype = Object.create(Button.prototype);
DifficultyButton.prototype.constructor = DifficultyButton;

DifficultyButton.prototype.render = function() {
	Button.prototype.render.call(this);
	if (this.isSelected) {
		ctx.strokeStyle = '#01579b';
		ctx.lineWidth = '2';
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}
}

var Character = function(x, y, width, height, clickCB, sprite) {
	UIComponent.call(this, x, y, width, height, clickCB);
	this.sprite = "images/" + sprite + ".png";
	this.name = sprite;
	this.isSelected = false;
};
Character.prototype = Object.create(UIComponent.prototype);
Character.prototype.constructor = Character;

Character.prototype.render = function() {
	if (this.isSelected) {
		ctx.drawImage(Resources.get('images/selector.png'),
			this.x, this.y);
	}
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

	if (this.state == 'hover') {
		ctx.strokeStyle = '#01579b';
		ctx.lineWidth = '2';
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}

	if (this.state == 'active') {
		ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'
	}
}