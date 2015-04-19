var options = {
  'width': 505,
  'height': 606,
  'space_width': 101,
  'space_height': 83,
  'lives': 3,
  'num_enemies': 4,
  'move_by': 75,
  'increase_move_by': 100,
  'default_player_image': 'images/char-boy.png',
  'player_images': [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png',
    'images/char-boy.png'
  ],
  'max_items': 4,
  'item_info': {
    'images/Gem Blue.png' : {'points': 10, 'lives': 0, 'blocking': false},
    'images/Gem Green.png' : {'points': 25, 'lives': 0, 'blocking': false},
    'images/Gem Orange.png' : {'points': 1, 'lives': 0, 'blocking': false},
    'images/Heart.png' : {'points': 0, 'lives': 1, 'blocking': false},
    'images/Key.png' : {},
    'images/Rock.png' : {'points': 0, 'lives': 0, 'blocking': true},
    'images/Selector.png' : {},
    'images/Star.png' : {'points': 50, 'lives': 0, 'blocking': false}
  }
};

function getRandomInt(min, max) {
  var number = Math.floor(Math.random() * (max - min)) + min;
  //console.log('Enemy in row ' + number);
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
  // Get a random y coordinate within the range of stone rows.
  this.row = getRandomInt(2, 5);
  var y = (this.row - 1)  * options.space_height;
  // Offset the y value a bit so it is centered.
  var y_center_in_row = y - options.space_height / 4;
  this.setPosition(0, y_center_in_row);
};

Enemy.prototype.isOffScreen = function() {
  return this.x_pos > options.width;
};

Enemy.prototype.onCollision = function(i) {
  var collided = player.row == this.row && player.col == this.col;
  if (collided) {
    console.log('Enemy' + i + ' at (' + this.row + ', ' + this.col + ') hit Player!');
    ui.showDialog('An Enemy got you!' );
  }
  return collided;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  this.x_pos += options.move_by * (6 - this.row) * dt;
  this.col = Math.trunc(this.x_pos / options.space_width) + 1;
  // Preemptively reset column if the Enemy just went off screen
  //  and pending generate() call will re-spawn in column 1.
  this.col = this.col == 6 ? 1 : this.col;
  if (this.isOffScreen()) this.generate();
};

// Our player
var Player = function(sprite) {
  Entity.call(this, 'Player', sprite);
  this.reset(true);
};

// Set up delegation to Entity
Player.prototype = Object.create(Entity.prototype);
Player.prototype.constructor = Player;

// Customize Player Class
// Place Player at starting position.
Player.prototype.reset = function(newGame) {
  // Place Player in starting position centered at the bottom.
  this.col = 3;
  this.row = 6;
  this.move_x = 0;
  this.move_y = 0;
  this.move = false;
  this.setPosition((this.col - 1) * options.space_width,
                    (this.row - 1) * options.space_height);

  // If this is a new game set the initial lives available.
  if (newGame) {
    this.resetLives();
    this.updateLives(options.lives);
  }
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

Player.prototype.resetLives = function() {
  this.remainingLives = 0;
};

Player.prototype.updateLives = function(lives) {
  if (typeof this.remainingLives === 'undefined') {
    this.remainingLives = 0;
  }
  this.remainingLives += lives;
  $('#lives').html(this.remainingLives);
};

Player.prototype.onCollision = function() {
  this.isHit = true;
  this.updateLives(-1);
  this.reset();
  return this.isHit;
};

Player.prototype.isLifeOver = function() {
  var lifeFinished = this.isHit || this.hasWon();
  game_over = this.hasWon() || this.remainingLives === 0;

  if (this.isHit && game_over) {
    ui.showDialog('Oops, you died...');
  }

  return lifeFinished;
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
    case 'left':
      this.setDirection('x', -1);
      break;
    case 'right':
      this.setDirection('x', 1);
      break;
    case 'up':
      this.setDirection('y', -1);
      break;
    case 'down':
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
    ui.hideDialog();
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
  if (isGameOver()) {
    start(true);
  }
};

var Item = function(sprite) {
  Entity.call(this, 'Item', sprite);
};

// Set up delegation to Entity
Item.prototype = Object.create(Entity.prototype);
Item.prototype.constructor = Item;

Item.prototype.generate = function() {
  // Get a random x coordinate within any column.
  this.col = getRandomInt(1, 5);
  var x = (this.col - 1)  * options.space_height;
  // Offset the y value a bit so it is centered.
  var x_center_in_col = x - options.space_height / 4;

  // Get a random y coordinate within any row.
  this.row = getRandomInt(1, 6);
  var y = (this.row - 1)  * options.space_height;
  // Offset the y value a bit so it is centered.
  var y_center_in_row = y - options.space_height / 4;
  this.setPosition(x_center_in_col, y_center_in_row);
};

Item.prototype.setDuration = function() {
  this.duration = getRandomInt(1000, 15000);
};

Item.prototype.isDurationOver = function(dt) {
  this.duration -= dt;
  return this.duration > 0;
};

Item.prototype.onCollision = function(i) {
  var collided = player.row == this.row && player.col == this.col;
  if (collided) {
    console.log('Player collided with Item' + i + ' at (' + this.row + ', ' + this.col + ') !');
  }
  return collided;
};

var UI = function(doc) {
  this.doc = doc;
  this.$holder = $('#menu');
  this.$newGameButton = $('#new_game');
  this.$pointsDisplay = $('#points');
  this.$livesDisplay = $('#lives');
};

UI.prototype.hasDialog = function() {
  /*
  // Used if storing as a DOM object
  if (typeof this.$dialog === 'undefined') {
    this.createDialog();
  }
  return typeof this.$dialog != 'undefined';
  */
  // Used if storing as a jQuery object
  if ($('#dialog').length === 0) {
    this.createDialog();
  }
  return $('#dialog').length > 0;
};

UI.prototype.createDialog = function() {
  /*
  // Adding via DOM approach
  var node = this.doc.createElement('p');
  node.id = 'dialog';
  this.doc.getElementById('menu').appendChild(node);
  */
 
  // Adding via jQuery approach
  $('<h3>').appendTo(this.$holder).prop('id', 'dialog');

  this.$dialog = $('#dialog');
};

UI.prototype.showDialog = function(prompt) {
  if (this.hasDialog()) {
    this.$dialog.html(prompt);
  }
};

UI.prototype.hideDialog = function() {
  this.showDialog(' ');
};

function checkCollisions() {
  var isCollision = false;
  // Check if collided with an Enemy.
  for (i = 0; i < allEnemies.length; i++) {
    var enemy = allEnemies[i];
    isCollision = enemy.onCollision(i);
    if (isCollision) {
      player.hit = enemy;
      // Bail out of for loop.
      break;
    }
  }

  // Check if collided with an Item.
  for (i = 0; i < allItems.length; i++) {
    var item = allItems[i];
    // Bail out of for loop if collided.
    if (item.onCollision(i)) break;
  }

  return isCollision;
}

function isGameOver() {
  var restart = false;
  if (player.isLifeOver() && game_over) {
    var prompt = 'Do you want to play again?';
    var result = '';
    if (player.hasWon()) {
      console.log('Player Won!');
      result = 'Congratulations, you won! ';
    }
    else {
      result = 'Sorry, but an Enemy got you. ';
    }
    ui.showDialog(result);
    restart = confirm(result + prompt);
  }
  return restart;
}

function start(restart) {
  // Only create a new UI on first start.
  if (typeof ui === 'undefined') {
    ui = new UI(this.document);
  }

  // Place all enemy objects in an array called allEnemies
  allEnemies = [];
  // Distribute enemies over each of the three rows.
  for (i = 0; i < options.num_enemies; i++) {
      var enemy = new Enemy('images/enemy-bug.png');
      enemy.generate();
      allEnemies.push(enemy);
  }

  // Only create a new player on first start.
  if (typeof player === 'undefined') {
    // Place the player object in a variable called player
    player = new Player(options.default_player_image);

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
  }
  // Completely reset the current Player if playing again.
  else {
    player.reset(restart);
  }

  game_over = false;
}

var allEnemies;
var allItems;
var player;
var game_over;
var ui;

start();
