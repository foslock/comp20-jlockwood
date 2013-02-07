// Your work goes here...

function Frogger() {
	function Frog() {
		this.x_initial = 10;
		this.y_initial = 10;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;

		this.reset_location = function() {
			this.x = this.x_initial;
			this.y = this.y_initial;
		}
	};

	function Vehicle() {
		this.x = 0;
		this.y = 0;
		this.height = 0;
		this.width = 0;
		this.direction = 0; // Either 0 for "right" or 1 for "left"
		this.speed = 0;

		this.update_logic = function() {
			if (this.direction == 0) {
				this.x += this.speed;
			} else {
				this.x -= this.speed;
			}
		};
	};

	this.frog = new Frog();
	this.currentLives = 3;
	this.levelNumber = 1;
	this.currentTime = 0;
	veh = new Vehicle();
	this.vehicles = [veh];
	this.logs = [];

	this.is_gameover = function() {
		return (this.currentLives <= 0);
	};

	this.reset_frog = function() {
		this.frog.reset_location();
	};

	this.check_collision = function(frog, vehicle) {
		// Check for collision
		return false;
	}

	this.check_collisions = function() {
		for (vehicle in this.vehicles) {
			if (this.check_collision(this.frog, vehicle)) {
				this.reset_frog();
				this.currentLives--;
			}
		}
	};

	this.step_logic = function() {
		console.log("Logic!");
		this.check_collisions();
	};

	this.draw_screen = function() {
		console.log("Draw!");
	};
};

// Jump in function from HTML
function start_game() {
	console.log("Starting game...");
	game = new Frogger();
	game.step_logic();
	game.draw_screen();
};