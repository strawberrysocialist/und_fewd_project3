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

function get_new_position(position, movement, width, wrap) {
  var new_position = (wrap) ?
    (position + movement) % width :
    position;
  return new_position;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Prototype class
var Entity = function(type, sprite, x, y, wrap) {
  this.set_type(type);
  this.set_sprite(sprite);
  this.set_position(x, y);
  this.set_wrap_move(wrap);
};
Entity.prototype.set_type = function(type) {
  console.log('Entering ' + this.type + '.set_type');
  this.type = type;
};
Entity.prototype.set_sprite = function(sprite) {
  console.log('Entering ' + this.type + '.set_sprite');
  this.sprite = sprite;
};
Entity.prototype.set_position = function(x, y) {
  console.log('Entering ' + this.type + '.set_position');
  this.x_pos = (x > 0) ? x : 0;
  this.y_pos = (y > 0) ? y : 0;
};
Entity.prototype.set_wrap_move = function(wrap) {
  console.log('Entering ' + this.type + '.set_wrap_move');
  this.wrap = wrap;
};
Entity.prototype.render = function() {
  console.log('Entering ' + this.type + '.render');
  ctx.drawImage(Resources.get(this.sprite), this.x_pos, this.y_pos);
};

// Enemies our player must avoid
//var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
//    this.sprite = 'images/enemy-bug.png';
//};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
//Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
//};

// Draw the enemy on the screen, required method for game
//Enemy.prototype.render = function() {
//    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
//};

var Enemy = function(sprite, x, y) {
  Entity.call(this, 'Enemy', sprite, x, y, true);
};
Enemy.prototype = Object.create(Entity.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function(dt) {
  console.log('Entering ' + this.type + '.update');
  var movement = options.move_by * dt;
  this.x_pos = get_new_position(this.x_pos, movement, options.width, this.wrap);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(sprite, x, y) {
  Entity.call(this, 'Player', sprite, x, y, false);
};
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {
  console.log('Entering ' + this.type + '.update');
  var movement = 1;
  if (this.move_x !== 0) {
    movement = this.move_x * 101;
    this.x_pos += movement;
  }
  if (this.move_y !== 0) {
    movement = this.move_y * 83;
    this.y_pos += movement;
  }
};
Player.prototype.handleInput = function(keyCode) {
  console.log('Received ' + keyCode);
  switch (keyCode) {
    case "left":
      this.move_x = -1;
      break;
    case "up":
      this.move_y = -1;
      break;
    case "right":
      this.move_x = 1;
      break;
    case "down":
      this.move_y = 1;
      break;
    default:
      break;
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var x = 0;
var y = 0;
var allEnemies = [];
for (i = 1; i < 4; i++) {
  y = i * options.space_height;
  var enemies_per_row = Math.floor(options.num_enemies / 3);
  for (i = 0; i < enemies_per_row; i++) {
    x = getRandomInt(0, options.width) * options.space_width;
    allEnemies.push(new Enemy('images/enemy-bug.png', x, y));
  }
  if (options.num_enemies % 3 !== 0) {
    x = getRandomInt(0, options.width) * options.space_width;
    allEnemies.push(new Enemy('images/enemy-bug.png', x, 2));
  }
}

x = 2;
y = 5;
var player = new Player(options.player_image, x, y);

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
