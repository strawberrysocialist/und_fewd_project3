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
  return Math.floor(Math.random() * (max - min)) + min;
}

// Prototype class
var Entity = function(type, sprite) {
  this.set_type(type);
  this.set_sprite(sprite);
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
  //console.log('Entering ' + this.type + '.set_position');
  this.x_pos = x;
  this.y_pos = y;
};
Entity.prototype.render = function() {
  //console.log('Entering ' + this.type + '.render');
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
  this.set_position(0, getRandomInt(1, 3));
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
  this.col = 3;
  this.row = 6;
  this.move_x = 0;
  this.move_y = 0;
  this.move = false;
  this.reset();
};
// Set up delegation to Entity
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;
// Customize Player Class
// Place Player in starting position centered at the bottom.
Player.prototype.reset = function() {
  var x = (this.col - 1) * options.space_width;
  var y = (this.row - 1) * options.space_height;
  console.log('Resetting Player to ' + x + ',' + y);
  this.set_position(x, y);
};
Player.prototype.atBound = function() {
  return this.row === 1 ||
         this.row === 6 ||
         this.col === 1 ||
         this.col === 5;
};
Player.prototype.inBound = function(col_num, row_num) {
  return col_num >= 1 &&
         col_num <= 5 &&
         row_num >= 1 &&
         row_num <= 6;
};
Player.prototype.won = function() {
  return this.row === 1;
};
Player.prototype.setDirection = function(move_axis, direction_value) {
  if (move_axis === 'x') {
    this.move_x = direction_value;
    this.move_y = 0;
  }
  else if (move_axis === 'y') {
    this.move_x = 0;
    this.move_y = direction_value;
  }
};
Player.prototype.toggleMove = function() {
  this.move = ! this.move;
};
Player.prototype.handleInput = function(keyCode) {
  //if (! this.atBound()) {
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
        break;
    }
    console.log('Received ' + keyCode +
                ' set move factors to ' +
                this.move_x + ',' +  this.move_y);
    this.toggleMove();
  //}
};
Player.prototype.update = function() {
  //console.log('Entering ' + this.type + '.update');
  if (this.move) {
    /*
    if (this.move_x !== 0) {
      console.log('X Pos ' + this.x_pos + ' + Move X ' + this.move_x + ' Width ' +  options.space_width + ' (' + this.move_x * options.space_width + ')' + '=' + this.x_pos + this.move_x * options.space_width);
      //this.x_pos += this.move_x * options.space_width;
    }
    if (this.move_y !== 0) {
      console.log('Y Pos ' + this.y_pos + ' + Move Y ' + this.move_y + ' Width ' +  options.space_width + ' (' + this.move_y * options.space_width + ')' + '=' + this.y_pos + this.move_y * options.space_width);
      //this.y_pos += this.move_y * options.space_height;
    }
    */
    var new_col = this.col + this.move_x * 1;
    var new_row = this.row + this.move_y * 1;
    console.log(this.col + this.move_x * 1);
    console.log(this.row + this.move_y * 1);
    if (this.inBound(new_col, new_row)) {
      this.col += this.move_x * 1;
      this.row += this.move_y * 1;
      this.x_pos += this.move_x * options.space_width;
      this.y_pos += this.move_y * options.space_height;
    }
    this.toggleMove();
  }
};

// Place all enemy objects in an array called allEnemies
var allEnemies = [];
// Distribute enemies over each of the three rows.
for (i = 0; i < options.num_enemies; i++) {
    //var enemy = new Enemy('images/enemy-bug.png');
    //enemy.generate();
    //allEnemies.push(enemy);
}

// Place the player object in a variable called player
var player = new Player(options.player_image);

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
