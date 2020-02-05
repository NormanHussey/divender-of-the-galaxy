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
game.wave = 0;
game.waveEnemies = [];
game.over = false;
game.keys = {};

game.playerStats = {};
game.playerStats.start = {};
game.playerStats.start.x = game.board.width / 2;
game.playerStats.start.y = game.board.height - 100;
game.playerStats.$healthDisplay = $('#health');
game.playerStats.$maxHealthDisplay = $('#maxHealth');
game.playerStats.$scoreDisplay = $('#score');
game.playerStats.$waveDisplay = $('#wave');
game.playerStats.score = 0;

game.enemyShips = [];
game.enemyShips.push('url("./assets/greenShip.gif")');
game.enemyShips.push('url("./assets/sleekBlueShip.gif")');
game.enemyShips.push('url("./assets/bigGreenShip.gif")');
game.enemyShips.push('url("./assets/bigRedShip.gif")');
game.enemyShips.push('url("./assets/bigBlueShip.gif")');
game.enemyShips.push('url("./assets/biggerRedShip.gif")');


game.updatingActors = [];

class Actor {
    constructor(x, y, element, type, deploy = true) {
        this.position = {
            x: x,
            y: y,
        };
        this.$element = $(element);
        this.type = type;
        if (deploy) {
            this.deploy();
        }
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

    deploy() {
        game.board.$element.append(this.$element);
        this.$element.css('--x', this.position.x + 'px');
        this.$element.css('--y', this.position.y + 'px');
        this.width = this.$element.width();
        this.height = this.$element.height();
        game.updatingActors.push(this);
    }

    checkCollision(avoidance = 0) {
        for (let i = 0; i < game.updatingActors.length; i++) {
            const actor = game.updatingActors[i];
            if (actor !== this) {
                const actorLeft = actor.left - avoidance;
                const actorRight = actor.right + avoidance;
                const actorTop = actor.top - avoidance;
                const actorBottom = actor.bottom + avoidance;
                if (actorLeft < this.right && actorRight > this.left && actorTop < this.bottom && actorBottom > this.top ) {
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
    constructor(x, y, element, direction, speed, damage = 1, colour = 'yellow', firedBy, decayDistance = 200) {
        const type = 'bullet';
        super(x, y, element, type);
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.colour = colour;
        this.firedBy = firedBy;
        // this.$element.css('background-color', this.colour);
        this.decayDistance = decayDistance;
        this.startY = y;
    }

    update() {
        if ((this.direction === 1 && this.position.y >= this.startY + this.decayDistance) || (this.direction === -1 && this.position.y <= this.startY - this.decayDistance)) {
            game.deleteActor(this);
        } else {
            if (this.position.y < this.height || this.bottom > game.board.height - this.height) {
                game.deleteActor(this);
            } else {
                super.update();
            }
        }
    }

    move() {
        this.position.y += (game.speed * (this.speed * 2) * this.direction);
    }

    handleCollision(collider) {
        if (collider.actor.health) {
            collider.actor.health -= this.damage;
            collider.actor.hitBy = this.firedBy;
            collider.actor.showHit();
        }
        game.deleteActor(this);
    }

    drawSelf() {
        super.drawSelf();
        if (this.direction === 1) {
            this.$element.css('--angle', '180deg');
        }
    }
}

class Ship extends Actor {
    constructor(x, y, element, type, deploy = true, maxHealth = 3) {
        super(x, y, element, type, deploy);
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        this.movement = 0;
        this.direction = -1;
        this.speed = 1;
        this.colour = 'yellow';
    }

    // rotate(direction) {
    //     this.angle += (Math.PI / 180) * 100 * direction;
    //     this.$element.css('--angle', this.angle + 'deg');
    // }

    showHit() {
        this.$element.css('--colour', 'rgba(255, 0, 0, 0.4)');
        const thisActor = this;
        setTimeout(function () {
            thisActor.$element.css('--colour', 'rgba(0, 0, 0, 0)');
        }, 200);
    }

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
        if (collider.actor.type !== 'bullet') {
            this.hitBy = collider.actor.type;
            this.health -= (collider.actor.health * collider.actor.speed);
            collider.actor.showHit();
            return collider.collideFrom;
        }
    }

    checkHealth() {
        if (this.health <= 0) {
            this.health = 0;
            if (this.type === 'player') {
                game.over = true;
            } else {
                if (this.hitBy === 'player') {
                    game.playerStats.score += this.maxHealth * 10;
                }
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
            bulletY = this.bottom + 14;
        } else {
            bulletY = this.position.y - 14;
        };
        const bulletDiv = '<div class="bullet">';
        const newBullet = new Bullet(this.position.x + this.width / 2, bulletY, bulletDiv, this.direction, this.speed, 1, colour, this.type);
    }

};

class Enemy extends Ship {
    constructor(x, y, element, type, maxHealth, colour, maxSpeed = 1, reloadSpeed = 150, intelligence = 1, shipNumber = 0) {
        super(x, y, element, type, false, maxHealth);
        this.direction = 1;
        this.colour = colour;
        this.maxSpeed = maxSpeed;
        this.speed = maxSpeed;
        this.reloadCounter = 0;
        this.reloadSpeed = reloadSpeed;
        this.intelligence = intelligence;
        this.$element.css('--imgUrl', game.enemyShips[shipNumber]);
    }

    findTarget(movementLimitation) {
        const distance = this.intelligence * 10;
        if (game.player.position.y >= this.position.y - distance && game.player.position.y <= this.position.y + distance) {
            if (game.player.position.x < this.position.x && movementLimitation !== 'left') {
                this.position.x -= game.speed * this.speed;
            } else if (game.player.position.x > this.position.x && movementLimitation !== 'right') {
                this.position.x += game.speed * this.speed;
            }
        }
    }

    chooseToFire() {
        if (this.intelligence <= 1) {
            this.fire(this.colour);
        } else {
            const playerX = game.player.position.x;
            const playerHalfWidth = game.player.width / 2;
            if (this.position.x >= playerX - playerHalfWidth && this.position.x <= playerX + playerHalfWidth) {
                this.fire(this.colour);
            }
        }
    }

    fire() {
        super.fire(this.colour);
        this.reloadCounter -= this.reloadSpeed;
    }

    move(movementLimitation) {
        if (movementLimitation !== 'bottom') {
            this.position.y += game.speed * this.speed;
        }
        this.avoidCollision();
        this.findTarget(movementLimitation);
    }

    avoidCollision() {
        const incomingCollision = this.checkCollision(this.intelligence);
        switch (incomingCollision.collideFrom) {
            case 'left':
                this.position.x += game.speed * this.speed;
                break;

            case 'right':
                this.position.x -= game.speed * this.speed;
                break;

            case 'top':
                this.position.y += game.speed * this.speed;
                break;

            case 'bottom':
                this.position.y -= game.speed * this.speed;
                break;
        }
        this.drawSelf();
    }

    update() {
        if (this.position.y > game.board.height - this.height) {
            game.deleteActor(this);
        };

        super.update();
        this.reloadCounter++;
        if (this.reloadCounter >= this.reloadSpeed) {
            this.chooseToFire();
        }
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
        };
    });
};

game.checkInput = function () {
    if (game.keys[37]) { // left
        if (game.player.left > 0) {
            game.player.inputMove(-4);
        }
    }

    if (game.keys[39]) { // right
        if (game.player.right < game.board.width) {
            game.player.inputMove(4);
        }
    }

    if (game.keys[38]) { // up
        game.speed += 0.1;
    }

    if (game.keys[40]) { // down
        if (game.speed > 1.1) {
            game.speed -= 0.1;
        }
    }
};

game.chooseRandomColour = function (transparency = 1) {
    const red = Math.floor(Math.random() * 255);
    const green = Math.floor(Math.random() * 255);
    const blue = Math.floor(Math.random() * 255);
    return `rgba(${red}, ${green}, ${blue}, ${transparency})`;
};

game.randomIntInRange = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

game.spawnEnemy = function (minHealth, maxHealth, maxSpeed, fastestReloadSpeed, slowestReloadSpeed, minIntelligence, maxIntelligence) {
    const x = game.randomIntInRange(0, game.board.width - 25);
    // const colour = game.chooseRandomColour();
    const health = game.randomIntInRange(minHealth, maxHealth);
    const speed = game.randomIntInRange(2, maxSpeed);
    const reloadSpeed = game.randomIntInRange(fastestReloadSpeed, slowestReloadSpeed);
    const intelligence = game.randomIntInRange(minIntelligence, maxIntelligence);
    let colour;
    if (intelligence === 1) {
        colour = "blue";
    } else if (intelligence === 2) {
        colour = 'green';
    } else {
        colour = game.chooseRandomColour();
    }
    const shipNumber = game.randomIntInRange(0, game.enemyShips.length - 1);
    return new Enemy (x, 10, '<div class="ship">', 'enemy', health, colour, speed, reloadSpeed, intelligence, shipNumber);
};

game.newWave = function () {
    game.wave++;
    const numberOfEnemies = 10 + game.wave;
    const maxHealth = Math.ceil(1 + (game.wave / 10));
    const minHealth = Math.floor(1 + (game.wave / 10));
    const maxSpeed = 2 + (game.wave / 4);
    const fastestReloadSpeed = 100 / game.wave;
    const slowestReloadSpeed = 100;
    const maxIntelligence = game.wave;
    let minIntelligence = game.wave - 2;
    if (minIntelligence < 1) {
        minIntelligence = 1;
    }

    for (let i = 0; i < numberOfEnemies; i++) {
        const newEnemy = game.spawnEnemy(minHealth, maxHealth, maxSpeed, fastestReloadSpeed, slowestReloadSpeed, minIntelligence, maxIntelligence);
        newEnemy.deployed = false;
        game.waveEnemies.push(newEnemy);
    }
    game.currentWaveEnemy = 0;
    let spawnInterval = 3000 - (game.wave * 100);
    if (spawnInterval < 100) {
        spawnInterval = 100;
    }
    game.deploymentInterval = setInterval(game.deployEnemy, spawnInterval);
    game.speed += game.wave / 10;
};

game.deployEnemy = function () {
    const currentEnemy = game.waveEnemies[game.currentWaveEnemy];
    if (currentEnemy && !currentEnemy.deployed) {
        currentEnemy.deploy();
        currentEnemy.deployed = true;
    }
    game.currentWaveEnemy++;
    if (game.currentWaveEnemy >= game.waveEnemies.length) {
        game.currentWaveEnemy = 0;
    }
}

game.checkWave = function () {
    if (game.waveEnemies.length === 0) {
        clearInterval(game.deploymentInterval);
        game.newWave();
    }
};

game.removeFromArray = function (item, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            array.splice(i, 1);
        }
    }
};

game.probability = function (n) {
    const randomChance = Math.random();
    return n > 0 && randomChance <= n;
}

game.deleteActor = function (actor) {
    game.removeFromArray(actor, game.updatingActors);
    if (actor.type === 'enemy') {
        game.removeFromArray(actor, game.waveEnemies);
        if (actor.health > 0) {
            actor.position.y = 10;
            actor.deployed = false;
            game.waveEnemies.push(actor);
        }
    }
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
    game.playerStats.$waveDisplay.text(game.wave);
};

game.update = function () {
    game.checkWave();
    game.checkInput();
    game.updateActors();
    if (!game.over) {
        game.board.move(0, game.speed);
    } else {
        if (!localStorage.highScore || localStorage.highScore < game.playerStats.score) {
            localStorage.setItem('highScore', game.playerStats.score);
        }
    }
    game.updateDisplay();
    requestAnimationFrame(game.update);
};

game.init = function() {
    const currentHighScore = localStorage.getItem('highScore');
    console.log(currentHighScore);
    game.player = new Ship (game.playerStats.start.x, game.playerStats.start.y, '<div class="ship">', 'player', true, 25);
    // setInterval(this.spawnEnemy, 1000);
    game.addEventListeners();
    window.requestAnimationFrame(game.update);
};

$(function() {
    game.init();
});
