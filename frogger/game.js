// Your work goes here...

var CANVAS_WIDTH = 399;
var CANVAS_HEIGHT = 565;
var CANVAS_INSET = 0;
var ROW_COUNT = 13; // Number of rows in the game the frog can be in
var DYING_TIME = 40; // Frames that frog will show dead symbol
var FRAME_INTERVAL = 30; // Time (ms) between each game loop frame
var ROW_HEIGHT = 36; // The height of each row you can move to in the game
var SCORE_PER_ROW = 10;
var SCORE_PER_LEVEL = 50;
var SCORE_PER_FIVE_LEVELS = 1000;
var POINTS_PER_NEXT_LIFE = 10000;
var TIME_PER_LEVEL = 1000;
var LEVEL_UP_ALERT_TIMER = 50;
var current_high_score = 0;

var clamp = function(val, min, max) {
	if (val < min) {
		return min;
	} else if (val > max) {
		return max;
	} else {
		return val;
	}
};

function Frogger() {
	var game = this;
	this.doneLoading = function() {
		// Nothing!
	};
	var loadedImageCount = 0;
	var spritesheet = new Image();
	var dead_frog = new Image();
	var level_up = new Image();
	this.game_over = new Image();
	spritesheet.src = "assets/frogger_sprites.png";
	dead_frog.src = "assets/dead_frog.png";
	level_up.src = "assets/level_up.png";
	this.game_over.src = "assets/game_over.png";
	var loaded = function() {
		loadedImageCount++;
		if (loadedImageCount > 3) {
			game.doneLoading();
		}
	};

	spritesheet.onload = loaded;
	dead_frog.onload = loaded;
	level_up.onload = loaded;
	this.game_over.onload = loaded;

	var y_for_row_index = function(index) {
		return 490 - (index * ROW_HEIGHT);
	};

	function Vehicle() {
		this.x = 100;
		this.y = y_for_row_index(1);
		this.sx = 10; // X position on sprite sheet
		this.sy = 268; // Y position on sprite sheet
		this.width = 28;
		this.height = 20;
		this.direction = "left"; // "right" or "left"
		this.speed = 2;

		this.update_logic = function() {
			if (this.direction == "right") {
				this.x += this.speed;
			} else if (this.direction == "left") {
				this.x -= this.speed;
			}
			if (this.x < 0 - this.width && this.direction == "left") {
				this.x = CANVAS_WIDTH + this.width;
			}
			if (this.x > CANVAS_WIDTH + this.width && this.direction == "right") {
				this.x = 0 - this.width;
			}
		};

		this.draw_vehicle = function(ctx) {
			ctx.drawImage(spritesheet, this.sx, this.sy,
				this.width, this.height, this.x, this.y,
				this.width, this.height);
		};
	};

	function FloatingLog() {
		this.x = 150;
		this.y = y_for_row_index(7);
		this.sx = 7; // X position on sprite sheet
		this.sy = 231; // Y position on sprite sheet
		this.width = 84;
		this.height = 22;
		this.direction = "right"; // "right" or "left"
		this.speed = 2;
		// 0 - small, 1 - medium, 2 - large
		this.logsize = Math.floor((Math.random() * 3));
		if (this.logsize == 0) {
			this.sx = 7;
			this.sy = 231;
			this.width = 84;
		} else if (this.logsize == 1) {
			this.sx = 7;
			this.sy = 199;
			this.width = 116;
		} else if (this.logsize == 2) {
			this.sx = 7;
			this.sy = 166;
			this.width = 178;
		}

		this.update_logic = function() {
			if (this.direction == "right") {
				this.x += this.speed;
			} else if (this.direction == "left") {
				this.x -= this.speed;
			}
			if (this.x < 0 - 178 && this.direction == "left") {
				this.x = CANVAS_WIDTH;
			}
			if (this.x > CANVAS_WIDTH && this.direction == "right") {
				this.x = 0 - 178;
			}
		};

		this.draw_log = function(ctx) {
			ctx.drawImage(spritesheet, this.sx, this.sy,
				this.width, this.height, this.x, this.y,
				this.width, this.height);
		};
	};

	function Frog() {
		this.width = 25; // Used for collision
		this.height = 25; // ""
		this.direction = "up"; // "up", "right", "down", or "left"
		this.isJumping = false;
		this.x_initial = (CANVAS_WIDTH / 2) - (this.width / 2);
		this.y_initial = y_for_row_index(0) + ((ROW_HEIGHT - this.height) / 2);
		this.x = this.x_initial;
		this.y = this.y_initial;
		this.jumpspeed = 6;
		this.currentJumpDistance = 0;
		this.logUnderFrog = null;
		this.isDying = false;
		this.dyingTimer = 0;

		this.reset_location = function() {
			this.x = this.x_initial;
			this.y = this.y_initial;
			this.isDying = false;
			this.dyingTimer = 0;
			this.direction = "up";
			this.isJumping = false;
			this.logUnderFrog = null;
			this.currentJumpDistance = 0;
		};

		this.kill = function() {
			if (!this.isDying) {
				this.isDying = true;
				this.dyingTimer = DYING_TIME;
			}
		};

		this.update_logic = function() {
			if (this.isDying) {
				this.y -= 1;
				this.dyingTimer -= 1;
				if (this.dyingTimer <= 0) {
					this.dyingTimer = 0;
					this.isDying = false;
					this.reset_location();
				}
			}
			if (this.logUnderFrog && !this.isDying) {
				if (this.logUnderFrog.direction == "right") {
					this.x += this.logUnderFrog.speed;
				} else {
					this.x -= this.logUnderFrog.speed;
				}
			}
			if (this.isJumping && !this.isDying) {
				if (this.direction == "up") {
					this.y -= this.jumpspeed;
				} else if (this.direction == "right") {
					this.x += this.jumpspeed;
				} else if (this.direction == "down") {
					this.y += this.jumpspeed;
				} else if (this.direction == "left") {
					this.x -= this.jumpspeed;
				}
				this.currentJumpDistance -= this.jumpspeed;
				if (this.currentJumpDistance <= 0) {
					this.currentJumpDistance = 0;
					this.isJumping = false;
					// Landed on ground/log

				}
			}
			this.y = clamp(this.y, y_for_row_index(ROW_COUNT-1),
				y_for_row_index(0) + (ROW_HEIGHT - this.height) / 2);
			this.x = clamp(this.x, 0, CANVAS_WIDTH - this.width);
		};

		this.jump_frog = function() {
			if (!this.isJumping) {
				this.isJumping = true;
				this.currentJumpDistance = ROW_HEIGHT;
			}
		};

		this.draw_frog = function(ctx) {
			if (this.isDying) {
				ctx.drawImage(dead_frog, this.x, this.y);
			} else {
				if (this.direction == "up") {
					if (this.isJumping) {
						ctx.drawImage(spritesheet, 45, 367, 23, 25, this.x, this.y, 23, 25);
					} else {
						ctx.drawImage(spritesheet, 12, 369, 23, 17, this.x, this.y, 23, 17);
					}
				} else if (this.direction == "down") {
					if (this.isJumping) {
						ctx.drawImage(spritesheet, 113, 367, 23, 25, this.x, this.y, 23, 25);
					} else {
						ctx.drawImage(spritesheet, 80, 370, 23, 17, this.x, this.y, 23, 17);
					}
				} else if (this.direction == "left") {
					if (this.isJumping) {
						ctx.drawImage(spritesheet, 112, 339, 25, 22, this.x, this.y, 25, 22);
					} else {
						ctx.drawImage(spritesheet, 82, 336, 17, 23, this.x, this.y, 17, 23);
					}
				} else if (this.direction == "right") {
					if (this.isJumping) {
						ctx.drawImage(spritesheet, 43, 336, 25, 22, this.x, this.y, 25, 22);
					} else {
						ctx.drawImage(spritesheet, 12, 335, 17, 23, this.x, this.y, 17, 23);
					}
				}
			}
		};
	};

	this.frog = new Frog();
	this.frog.reset_location();
	this.currentLives = 5;
	this.levelNumber = 1;
	this.currentTime = (TIME_PER_LEVEL - (this.levelNumber * 50));
	this.currentHighestRow = 0;
	this.score = 0;
	this.pointsUntilNextLife = POINTS_PER_NEXT_LIFE;
	this.levelUpAlertTimer = 0;

	this.initialize_obstacles = function() {
		this.logs = [];
		this.vehicles = [];

		// Create vehicles
		for (var i = 0; i < 5; i++) {
			var rand_x = Math.random() * CANVAS_WIDTH;
			var kind = i % 4;
			var carCount = Math.floor(this.levelNumber / 2.0) + 1;
			for (var j = 0; j < carCount; j++) {
				var veh = new Vehicle();
				veh.x = (rand_x + (j * veh.width * 4)) % CANVAS_WIDTH;
				veh.y = y_for_row_index(i+1) + (ROW_HEIGHT - veh.height) / 2;
				veh.speed = (kind+4)/3;
				if (kind == 1) {
					veh.sx = 46;
					veh.sy = 266;
					veh.width = 28;
					veh.height = 24;
					veh.direction = "right";
				} else if (kind == 2) {
					veh.sx = 106;
					veh.sy = 304;
					veh.width = 45;
					veh.height = 17;
					veh.direction = "left";
				} else if (kind == 3) {
					veh.sx = 11;
					veh.sy = 302;
					veh.width = 24;
					veh.height = 21;
					veh.direction = "right";
				}
				this.vehicles.push(veh);
			}
		}

		// Create logs
		for (var i = 0; i < 5; i++) {
			var rand_x = Math.random() * CANVAS_WIDTH;
			for (var j = 0; j < 2; j++) {
				var log = new FloatingLog();
				log.x = (rand_x + (j * 178)) % CANVAS_WIDTH;
				log.y = y_for_row_index(i+7) + (ROW_HEIGHT - log.height) / 2;
				log.speed = (i+4)/3;
				if (i % 2 == 0) {
					log.direction = "right";
				} else {
					log.direction = "left";
				}
				this.logs.push(log);
			}
		}
	};

	this.move_frog = function(direction) {
		if (!this.frog.isJumping &&
			!this.frog.isDying && 
			!this.is_gameover()) {
			this.frog.direction = direction;
			this.frog.jump_frog();
		}
	};

	this.is_gameover = function() {
		return (this.currentLives <= 0 && !this.frog.isDying);
	};

	this.check_collision = function(x1, y1, w1, h1, x2, y2, w2, h2) {
		// Check for collision
		if (x1 + w1 < x2 ||
			y1 + h1 < y2 ||
			x1 > x2 + w2 ||
			y1 > y2 + h2) {
			return false;
		} else {
			return true;
		}
	};

	this.check_collisions = function() {
		if (!this.frog.isDying) {
			for (var i = 0; i < this.vehicles.length; i++) {
			var vehicle = this.vehicles[i];
			if (this.check_collision(this.frog.x, this.frog.y,
					this.frog.width, this.frog.height,
					vehicle.x, vehicle.y,
					vehicle.width, vehicle.height)) {
					this.kill_frog();
					break;
				}
			}
			for (var i = 0; i < this.logs.length; i++) {
			var log = this.logs[i];
			if (this.check_collision(this.frog.x, this.frog.y,
					this.frog.width, this.frog.height,
					log.x, log.y,
					log.width, log.height)) {
					this.frog.logUnderFrog = log;
					break;
				}
				// No log
				this.frog.logUnderFrog = null;
			}
		}
	};

	this.update_score = function() {
		if (!this.frog.isDying) {
			for (var i = 0; i < ROW_COUNT; i++) {
				if (this.frog.y - this.frog.height/2 <= y_for_row_index(i) && i > this.currentHighestRow) {
					this.score += SCORE_PER_ROW;
					this.pointsUntilNextLife -= SCORE_PER_ROW;
					this.currentHighestRow = i;
				}
			}
		}
		if (current_high_score < this.score) {
			current_high_score = this.score;
		}
		if (this.pointsUntilNextLife <= 0) {
			this.pointsUntilNextLife = POINTS_PER_NEXT_LIFE;
			if (this.currentLives < 4) {
				this.currentLives++;
			}
		}
	};

	this.check_for_level_up = function() {
		if (!this.frog.isDying &&
			!this.frog.isJumping &&
			this.frog.y - this.frog.height/2 <= y_for_row_index(ROW_COUNT-1)) {
			this.score += SCORE_PER_LEVEL;
			this.frog.reset_location();
			if (this.levelNumber % 5 == 0) {
				this.score += SCORE_PER_FIVE_LEVELS;
				this.pointsUntilNextLife -= SCORE_PER_FIVE_LEVELS;
			}
			this.levelNumber++;
			this.initialize_obstacles();
			this.currentTime = TIME_PER_LEVEL - (this.levelNumber * 50);
			this.currentHighestRow = 0;
			this.levelUpAlertTimer = LEVEL_UP_ALERT_TIMER;
		}
	};

	this.kill_frog = function() {
		this.frog.kill();
		this.currentLives--;
		this.currentTime = TIME_PER_LEVEL - (this.levelNumber * 50);
	}

	this.step_logic = function() {
		// Update frog
		this.frog.update_logic();

		// Update vehicles
		for (var i = 0; i < this.vehicles.length; i++) {
			var vehicle = this.vehicles[i];
			vehicle.update_logic();
		}

		// Update logs
		for (var i = 0; i < this.logs.length; i++) {
			var log = this.logs[i];
			log.update_logic();
		}

		// Check collisions between frog and objects
		this.check_collisions();

		// Make sure frog is on a log
		if (this.frog.y - this.frog.height/2 <= y_for_row_index(7) &&
			this.frog.y - ROW_HEIGHT > y_for_row_index(ROW_COUNT-1) &&
			!this.frog.logUnderFrog &&
			!this.frog.isDying) {
			this.kill_frog();
		}

		this.update_score();

		this.check_for_level_up();

		// Check to see if time has run out
		if (this.currentTime > 0 && !this.frog.isDying) {
			this.currentTime -= 1;
		} else if (!this.frog.isDying) {
			this.kill_frog();
		}

		if (this.levelUpAlertTimer > 0) {
			this.levelUpAlertTimer -= 1;
		} else {
			this.levelUpAlertTimer = 0;
		}
	};

	this.draw_screen = function() {
		var canvas = document.getElementById('game');
		var ctx = canvas.getContext('2d');
		// Clear the screen
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw water
		ctx.fillStyle = "#191970";
		ctx.fillRect(CANVAS_INSET,
			CANVAS_INSET,
			CANVAS_WIDTH - (CANVAS_INSET * 2),
			CANVAS_HEIGHT - (CANVAS_INSET * 2));

		// Draw road
		ctx.fillStyle = "#000000";
		ctx.fillRect(CANVAS_INSET,
			CANVAS_HEIGHT / 2,
			CANVAS_WIDTH - (CANVAS_INSET * 2),
			(CANVAS_HEIGHT / 2) - CANVAS_INSET);

		// Draw header
		ctx.drawImage(spritesheet, 13, 13, 320, 33,
			CANVAS_INSET + 10, CANVAS_INSET + 8, 320, 33);

		// Draw grass bank
		ctx.drawImage(spritesheet, 0, 56, 399, 54,
			CANVAS_INSET, CANVAS_INSET + 46, 399, 54);

		// Draw roadsides
		ctx.drawImage(spritesheet, 0, 120, 399, 34,
			CANVAS_INSET, y_for_row_index(6), 399, 34);
		ctx.drawImage(spritesheet, 0, 120, 399, 34,
			CANVAS_INSET, CANVAS_INSET + 490, 399, 34);

		// Draw HUD
		ctx.fillStyle = "rgb(50, 220, 50)";
		ctx.font = "24px Helvetica-Bold";
		ctx.fillText("Level " + this.levelNumber, 105, 544);
		ctx.font = "14px Helvetica-Bold";
		ctx.fillText("Score " + this.score + "   " + "Highscore " + current_high_score,
			2, 560);

		// Draw time rectangle
		if (!this.frog.isDying && !this.is_gameover()) {
			var perTime = (this.currentTime / (TIME_PER_LEVEL - (this.levelNumber * 50)));
			var green = 100 + (155 * perTime);
			var red = 100 + (155 - (155 * perTime));
			ctx.fillStyle = "rgb(" + Math.floor(red) + "," + Math.floor(green) + ", 0)";
			ctx.strokeStyle = "#cb630a";
			var timeXstart = CANVAS_WIDTH/2 + 40;
			ctx.fillRect(timeXstart - 4, 528, (CANVAS_WIDTH-timeXstart) * perTime, 30);
			ctx.strokeRect(timeXstart - 4, 528, (CANVAS_WIDTH-timeXstart), 30);
		}

		for (var i = 0; i < this.currentLives; i++) {
			ctx.drawImage(spritesheet, 12, 335, 19, 24, 4 + (i * 20), 527, 16, 21);
		}

		// Draw vehicles
		for (var i = 0; i < this.vehicles.length; i++) {
			var vehicle = this.vehicles[i];
			vehicle.draw_vehicle(ctx);
		}

		// Draw logs
		for (var i = 0; i < this.logs.length; i++) {
			var log = this.logs[i];
			log.draw_log(ctx);
		}

		if (!this.is_gameover()) {
			this.frog.draw_frog(ctx);
		}

		if (this.levelUpAlertTimer > 0) {
			ctx.drawImage(level_up, 0, 0, 345, 37,
				CANVAS_WIDTH/2 - level_up.width/2, CANVAS_HEIGHT/2 + this.levelUpAlertTimer, 345, 37);
		}
	};
};

// Jump in function from HTML
function start_game() {
	var game = new Frogger();
	game.initialize_obstacles();

	var intervalLoop = null;

	var game_loop = function() {
		game.step_logic();
		game.draw_screen();

		if (game.is_gameover()) {
			clearInterval(intervalLoop);
			var canvas = document.getElementById('game');
			var ctx = canvas.getContext('2d');
			ctx.drawImage(game.game_over, CANVAS_WIDTH/2 - 200, CANVAS_HEIGHT/2 + 50);
		}

	};

	game.doneLoading = function() {
		// Start the game loop in an interval
		intervalLoop = setInterval(game_loop, FRAME_INTERVAL);
	}

	checkArrows = function(e) {
		e = e || window.event;
		if (e.keyCode == "37") {
			game.move_frog("left");
		} else if (e.keyCode == "38") {
			game.move_frog("up");
		} else if (e.keyCode == "39") {
			game.move_frog("right");
		} else if (e.keyCode == "40") {
			game.move_frog("down");
		}
	};

	document.onkeydown = checkArrows;
	document.getElementById('game').onclick = function() {
		if (game.is_gameover()) {
			// Restart the game on click
			game = new Frogger();
			game.initialize_obstacles();
			intervalLoop = setInterval(game_loop, FRAME_INTERVAL);
		}
	}

	addSwipeListener(document.getElementById('game'), function(e) {
		game.move_frog(e.direction);
    });

	document.getElementById('game').focus();
};