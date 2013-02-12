draw_screen = function() {
	var canvas = document.getElementById('game');
	var CANVAS_WIDTH = canvas.width;
	var CANVAS_HEIGHT = canvas.height;
	var ctx = canvas.getContext('2d');
	var spritesheet = new Image();
	spritesheet.src = "pacman10-hp-sprite.png"

	ctx.drawImage(spritesheet, 322, 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	ctx.drawImage(spritesheet, 84, 4, 13, 14, 150, 5, 13, 14);
	ctx.drawImage(spritesheet, 83, 83, 14, 14, 200, 5, 14, 14);
};