var options = {
  'player_image': 'images/char-boy.png',
  'num_enemies': 6,
  'move_by': 100,
  'increase_move_by': 100,
  'width': 505,
  'height': 606,
  'space_width': 101,
  'space_height': 83
};

function getRandomInt(min, max) {
  var number = Math.floor(Math.random() * (max - min)) + min;
  console.log('Enemy in row ' + number);
  return number;
  //return Math.floor(Math.random() * (max - min)) + min;
}

// Prototype class
var Entity = function(type, sprite) {
  this.setType(type);
  this.setSprite(sprite);
};
Entity.prototype.setType = function(type) {
  this.type = type;
};
Entity.prototype.setSprite = function(sprite) {
  this.sprite = sprite;
};
Entity.prototype.setPosition = function(x, y) {
  this.x_pos = x;
  this.y_pos = y;
};
Entity.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x_pos, this.y_pos);
};

// Enemies our player must avoid
var Enemy = function(sprite) {
  Entity.call(this, 'Enemy', sprite);
};
// Set up delegation to Entity
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;
// Customize Enemy Class
// Place an Enemy in a random row.
Enemy.prototype.generate = function() {
  this.setPosition(0, getRandomInt(2, 4 + 1));
};
Enemy.prototype.isOffScreen = function() {
  console.log('isOffScreen ' + this.x_pos > options.width);
  return this.x_pos > options.width;
};
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  //console.log('Entering ' + this.type + '.update');
  this.x_pos += options.move_by * dt;
  if (this.isOffScreen) this.generate();
};

// Our player
var Player = function(sprite) {
  Entity.call(this, 'Player', sprite);
  this.reset();
};
// Set up delegation to Entity
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;
// Customize Player Class
// Place Player in starting position centered at the bottom.
Player.prototype.reset = function() {
  this.col = 3;
  this.row = 6;
  this.move_x = 0;
  this.move_y = 0;
  this.move = false;
  this.setPosition((this.col - 1) * options.space_width,
                    (this.row - 1) * options.space_height);
};
// Check to see if Player's new column and row position is in bounds.
Player.prototype.inBound = function(col_num, row_num) {
  return col_num >= 1 &&
         col_num <= 5 &&
         row_num >= 1 &&
         row_num <= 6;
};
Player.prototype.hasWon = function() {
  return this.row === 1;
};
Player.prototype.isHit = function() {
  // TODO
  return false;
};
Player.prototype.isDone = function() {
  return this.hasWon() || this.isHit();
};
// Set the axis ('x' or 'y') and direction of movement (+/- 1).
Player.prototype.setDirection = function(move_axis, direction_value) {
  if (move_axis.toLowerCase() === 'x') {
    this.move_x = direction_value;
    this.move_y = 0;
  } else if (move_axis.toLowerCase() === 'y') {
    this.move_x = 0;
    this.move_y = direction_value;
  } else {
    new Error('Player.setDirection received an ' +
              'invalid value for move_axis, ' +
              move_axis +
              '. Valid values are "x" or "y" only.');
  }
};
// Switch movement on/off after one keypress/update cycle.
// Player only moves once unlike Enemies who move continuously.
Player.prototype.toggleMove = function() {
  this.move = ! this.move;
};
// Set appropriate actions depending on key pressed.
Player.prototype.handleInput = function(keyCode) {
  switch (keyCode) {
    case "left":
      this.setDirection('x', -1);
      break;
    case "right":
      this.setDirection('x', 1);
      break;
    case "up":
      this.setDirection('y', -1);
      break;
    case "down":
      this.setDirection('y', 1);
      break;
    default:
      // No-Op
      break;
  }
  console.log('Received ' + keyCode +
              ' set move factors to ' +
              this.move_x + ',' +  this.move_y);
  this.toggleMove();
};
// Update Player's position (both column,row and x,y).
Player.prototype.update = function() {
  // Ensure Player is supposed to move on this cycle.
  if (this.move) {
    // Determine the next position (column,row).
    var new_col = this.col + this.move_x * 1;
    var new_row = this.row + this.move_y * 1;
    if (this.inBound(new_col, new_row)) {
      this.col = new_col;
      this.row = new_row;
      this.x_pos += this.move_x * options.space_width;
      this.y_pos += this.move_y * options.space_height;
    }
    // Switch movement off after movement completed.
    this.toggleMove();
  }
};
Player.prototype.render = function() {
  Entity.prototype.render.call(this);
  if (this.isDone() && !game_over) {
    game_over = true;
    var prompt = 'Do you want to play again?';
    if (this.hasWon()) {
      console.log('Player Won!');
      prompt = 'Congratulations, you won! ' + prompt;
    }
    else {
      prompt = 'Sorry, but an Enemy got you. ' + prompt;
    }
    switch (confirm(prompt)) {
      case (true):
        //Engine.init();
        break;
      default:
        break;
    }
  }
};

function start() {
  // Place all enemy objects in an array called allEnemies
  allEnemies = [];
  // Distribute enemies over each of the three rows.
  for (i = 0; i < options.num_enemies; i++) {
      var enemy = new Enemy('images/enemy-bug.png');
      enemy.generate();
      allEnemies.push(enemy);
  }

  // Place the player object in a variable called player
  player = new Player(options.player_image);

  // This listens for key presses and sends the keys to your
  // Player.handleInput() method. You don't need to modify this.
  document.addEventListener('keyup', function(e) {
      var allowedKeys = {
          37: 'left',
          38: 'up',
          39: 'right',
          40: 'down'
      };

      player.handleInput(allowedKeys[e.keyCode]);
  });

  game_over = false;
}

var allEnemies;
var player;
var game_over;

start();
