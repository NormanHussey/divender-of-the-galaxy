const game = {};

game.board = {
    $element: $('.playArea'),
    top: 0,
    left: 0,
    width: $('.playArea').width(),
    height: $('.playArea').height(),
    move: function(x, y) {
        const newX = parseInt(this.$element.css('--bgX')) + x;
        const newY = parseInt(this.$element.css('--bgY')) + y;
        this.$element.css('--bgX', newX + 'px');
        this.$element.css('--bgY', newY + 'px');
    }
};

game.speed = 1;
game.over = false;
game.keys = {};

game.playerStats = {};
game.playerStats.start = {};
game.playerStats.start.x = game.board.width / 2;
game.playerStats.start.y = game.board.height - 100;
game.playerStats.$healthDisplay = $('#health');
game.playerStats.$maxHealthDisplay = $('#maxHealth');
game.playerStats.$scoreDisplay = $('#score');
game.playerStats.score = 0;


game.updatingActors = [];

class Actor {
    constructor(x, y, element, type) {
        this.position = {
            x: x,
            y: y,
        };
        this.$element = $(element);
        this.type = type;
        game.board.$element.append(this.$element);
        this.$element.css('--x', this.position.x + 'px');
        this.$element.css('--y', this.position.y + 'px');
        this.width = this.$element.width();
        this.height = this.$element.height();
        game.updatingActors.push(this);
    }

    get top() {
        return this.position.y;
    }

    get left() {
        return this.position.x;
    }

    get bottom() {
        return this.position.y + this.height;
    }

    get right() {
        return this.position.x + this.width;
    }

    get centreX() {
        this.position.x + this.width / 2;
    }

    get centreY() {
        this.position.x + this.height / 2;
    }

    checkCollision() {
        for (let i = 0; i < game.updatingActors.length; i++) {
            const actor = game.updatingActors[i];
            if (actor !== this) {
                if (actor.left < this.right && actor.right > this.left && actor.top < this.bottom && actor.bottom > this.top ) {
                    const collider = {};
                    collider.actor = actor;
                    if (actor.bottom >= (this.top - 1) && actor.bottom <= (this.top + 1)) {
                        collider.collideFrom = 'top';
                    } else if (actor.top <= (this.bottom + 1) && actor.top >= (this.bottom - 1)) {
                        collider.collideFrom = 'bottom';
                    } else if (actor.left <= (this.right + 1) && actor.left >= (this.right - 1)) {
                        collider.collideFrom = 'right';
                    } else {
                        collider.collideFrom = 'left';
                    }
                    return collider;
                };
            };
        };
        return false;
    }

    handleCollision(collider) {
        // do something
        console.log(collider);
    }

    move() {
        // do something
    }

    update() {
        let movementLimitation = false;
        const collidingObject = this.checkCollision();
        if (collidingObject) {
            movementLimitation = this.handleCollision(collidingObject);
        }
        this.move(movementLimitation);
        this.drawSelf();
    }

    drawSelf() {
        this.$element.css('--x', this.position.x + 'px');
        this.$element.css('--y', this.position.y + 'px');
    }
}


class Bullet extends Actor {
    constructor(x, y, element, direction, speed, damage = 1, colour = 'yellow') {
        const type = 'bullet';
        super(x, y, element, type);
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.colour = colour;
        this.$element.css('background-color', this.colour);
    }

    update() {
        if (this.position.y < this.height || this.bottom > game.board.height - this.height) {
            game.deleteActor(this);
        };
        super.update();
    }

    move() {
        this.position.y += (game.speed * (this.speed * 2) * this.direction);
    }

    handleCollision(collider) {
        if (collider.actor.health) {
            collider.actor.health -= this.damage;
        }
        game.deleteActor(this);
    }
}

class Ship extends Actor {
    constructor(x, y, element, type, maxHealth = 3) {
        super(x, y, element, type);
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.movement = 0;
        this.direction = -1;
        this.speed = 1;
    }

    // rotate(direction) {
    //     this.angle += (Math.PI / 180) * 100 * direction;
    //     this.$element.css('--angle', this.angle + 'deg');
    // }

    inputMove(movement) {
        this.movement = movement;
    }

    move(movementLimitation) {
        if (movementLimitation) {
            if (movementLimitation === 'left' && this.direction < 0) {
                return false;
            } else if (movementLimitation === 'right' && this.direction > 0) {
                return false;
            }
        } else {
            const proposedMovement = this.position.x + this.movement;
            if (proposedMovement >= game.board.left && proposedMovement <= (game.board.width - this.width)) {
                this.position.x = proposedMovement;
            }
            this.movement = 0;
        }
    }

    handleCollision(collider) {
        // console.log(this.type, this.health);
        if (collider.actor.type !== 'bullet') {
            this.health -= (collider.actor.health * collider.actor.speed);
            return collider.collideFrom;
        }
    }

    checkHealth() {
        if (this.health <= 0) {
            this.health = 0;
            if (this.type === 'player') {
                game.over = true;
            } else {
                game.playerStats.score += this.maxHealth * 10;
            }
            game.deleteActor(this);
        }
    }

    update() {
        super.update();
        this.checkHealth();
    }

    fire(colour = 'yellow') {
        let bulletY;
        if (this.direction === 1) {
            bulletY = this.bottom + 5;
        } else {
            bulletY = this.position.y - 5;
        };
        const bulletDiv = '<div class="bullet">';
        const newBullet = new Bullet(this.position.x + this.width / 2, bulletY, bulletDiv, this.direction, this.speed, 1, colour);
    }

};

class Enemy extends Ship {
    constructor(x, y, element, type, maxHealth, colour, maxSpeed = 1, reloadSpeed = 150, intelligence = 1) {
        super(x, y, element, type, maxHealth);
        this.direction = 1;
        this.colour = colour;
        this.$element.css('background-color', this.colour);
        this.maxSpeed = maxSpeed;
        this.speed = maxSpeed;
        this.reloadCounter = 0;
        this.reloadSpeed = reloadSpeed;
        this.intelligence = intelligence;
    }

    findTarget() {
        if (game.player.position.x < this.position.x) {
            this.position.x -= game.speed * this.speed;
        } else if (game.player.position.x > this.position.x) {
            this.position.x += game.speed * this.speed;
        }
    }

    move(movementLimitation) {
        if (!movementLimitation) {
            this.position.y += game.speed * this.speed;
            if (this.intelligence > 1) {
                this.findTarget();
            }
        }
    }

    update() {
        if (this.position.y > game.board.height - this.height) {
            game.deleteActor(this);
        };

        this.reloadCounter++;
        if (this.reloadCounter >= this.reloadSpeed) {
            this.fire(this.colour);
            this.reloadCounter = 0;
        }
        super.update();
    }

};

game.addEventListeners = function () {
    game.board.$element.mousemove(function (e) {
        game.player.inputMove((e.pageX - this.offsetLeft) - game.player.position.x);
    });
    
    $(window).on("keydown", function (e) {
        game.keys[e.keyCode] = true;
    });
    
    $(window).on("keyup", function (e) {
        game.keys[e.keyCode] = false;
    });
    
    $(window).on('keypress', function (e) {
        // console.log(e.which);
        if (!game.over) {
            switch (e.which) {
                case 32: // space bar
                    game.player.fire();
                    break;
            }
        }
    });
    
    $(window).on('click', function (e) {
        if (!game.over) {
            game.player.fire();
        }
    });
};

game.checkInput = function () {
    if (game.keys[37]) { // left
        if (game.player.left > 0) {
            game.player.inputMove(-4);
        };
    };

    if (game.keys[39]) { // right
        if (game.player.right < game.board.width) {
            game.player.inputMove(4);
        };
    };

    if (game.keys[38]) { // up
        game.speed += 0.1;
    };

    if (game.keys[40]) { // down
        if (game.speed > 1.1) {
            game.speed -= 0.1;
        };
    };
};

game.chooseRandomColour = function () {
    const red = Math.floor(Math.random() * 255);
    const green = Math.floor(Math.random() * 255);
    const blue = Math.floor(Math.random() * 255);
    return "rgb(" + String(red) +", " + String(green) + ", " + String(blue) + ")";
}

game.randomIntInRange = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

game.spawnEnemy = function () {
    const x = game.randomIntInRange(0, game.board.width - 25);
    const colour = game.chooseRandomColour();
    const health = game.randomIntInRange(1, 5);
    const speed = game.randomIntInRange(2, 4);
    const reloadSpeed = game.randomIntInRange(50, 200);
    const intelligence = game.randomIntInRange(1, 2);
    const enemy = new Enemy (x, 10, '<div class="ship">', 'enemy', health, colour, speed, reloadSpeed, intelligence);
};

game.removeFromArray = function (item, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
        };
    };
};

game.deleteActor = function (actor) {
    game.removeFromArray(actor, game.updatingActors);
    actor.$element.remove();
    delete actor;
};

game.updateActors = function () {
    for (let i = 0; i < game.updatingActors.length; i++) {
        game.updatingActors[i].update();
    }
};

game.updateDisplay = function () {
    game.playerStats.$healthDisplay.text(game.player.health);
    game.playerStats.$maxHealthDisplay.text(game.player.maxHealth);
    game.playerStats.$scoreDisplay.text(game.playerStats.score);
};

game.update = function () {
    game.checkInput();
    game.updateActors();
    if (!game.over) {
        game.board.move(0, game.speed);
    }
    game.updateDisplay();
    requestAnimationFrame(game.update);
};

game.init = function() {
    game.player = new Ship (game.playerStats.start.x, game.playerStats.start.y, '<div class="ship">', 'player', 5);
    // const enemy1 = new Enemy (game.board.width / 2 - 200, 10, '<div class="ship">', 'enemy', 1, 'blue', 2, 100);
    // const enemy2 = new Enemy (game.board.width / 2 - 100, 10, 2, 'green', 100);
    // const enemy3 = new Enemy (game.board.width / 2, 10, 3, 'magenta', 50);
    // const enemy4 = new Enemy (game.board.width / 2 + 100, 10, 3, 'green', 100);
    // const enemy5 = new Enemy (game.board.width / 2 + 200, 10, 1, 'blue', 150);
    setInterval(this.spawnEnemy, 1000);
    game.addEventListeners();
    window.requestAnimationFrame(game.update);
};

$(function() {
    game.init();
});
