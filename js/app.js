// Enemies our player must avoid

var Enemy = function () {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    var maxY = 5;
    this.x = -1;
    this.y = Math.floor(Math.random() * maxY) + 1;
    this.speed = 1;
    // console.log(this.x, this.y);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += dt * this.speed;
    if (this.x >= Engine.numCols)
        Game.allEnemies.splice(Game.allEnemies.indexOf(this), 1);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x * Engine.colSize, this.y * Engine.imgHeight - 11, Engine.colSize, Engine.rowSize);
};

//var ccc=1;
Enemy.createEnemy = function () {
    if (Game.allEnemies.length > 5) return;
    if (Math.random() < 0.6) return;
    var enemy = new Enemy();
    enemy.speed = Math.random() * 6;
    if (enemy.speed < 0.5) enemy.speed = 0.5;

    //enemy.y=ccc++;
    //enemy.x=0;
    // console.log(enemy.x, enemy.y, enemy.speed);
    //if(ccc>6) ccc=0;
    Game.allEnemies.push(enemy);
};



// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
function Player() {
    this.sprite = 'images/char-pink-girl.png';
    this.x = 4;
    this.y = 6;
    this.dx = 0;
    this.dy = 0;
    this.cnt = 0;
    this.score = 0;
    this.levelScore=0;
    this.life = 1;
    this.hasKey=false;
    this.escape=false;
}

Player.prototype.init=function() {
    this.x = 4;
    this.y = 6;
    this.dx = 0;
    this.dy = 0;
    this.cnt = 0;
   
    this.hasKey=false;
    this.escape=false;
    
}

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x * Engine.colSize, this.y * Engine.imgHeight - 15, Engine.colSize, Engine.rowSize);
    Engine.scoreEl.innerHTML=this.score;
    Engine.lifeEl.innerHTML=this.life;
}

Player.prototype.update = function () {
    if (this.cnt === 0) {
    this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    this.x += this.dx;
    this.y += this.dy;
    (this.dx !== 0 || this.dy !== 0) && this.cnt++;
    if (this.cnt === 8) this.dx = this.dy = 0;
}

Player.prototype.handleInput = function (dir) {
    if (!dir) return;
    var d = 8;

    switch (dir) {
        case 'left': if (this.x > 0) this.dx = -1 / d; break;
        case 'right': if (this.x < Engine.numCols - 1) this.dx = 1 / d; break;
        case 'up': if (this.y > 0) this.dy = -1 / d; break;
        case 'down': if (this.y < Engine.numRows - 1) this.dy = 1 / d; break;
        default: return;
    }
    this.cnt = 0;
}


var Prize = function (info) {
    this.info = info;
    this.x = Math.floor(Math.random() * Engine.numCols);
    this.y = 1 + Math.floor(Math.random() * (Engine.numRows - 3));
    //console.log("prize: ", this.x, this.y);
}

//type=1 - points;
//type=2 - life;
//type=3 - key;
//type=4 - door;
Prize.types = [ { name: "Gem Blue", type: 1, value: 10,  sprite: 'images/Gem Blue.png' },
                { name: "Gem Green", type: 1, value: 20, sprite: 'images/Gem Green.png' },
                { name: "Gem Orange", type: 1, value: 30, sprite: 'images/Gem Orange.png' },
                { name: "Star", type: 1, value: 50,       sprite: 'images/Star.png' },
                { name: "Heart", type: 2, value: 50,      sprite: 'images/Heart.png' },
                { name: "Key", type: 3, value: 50,        sprite: 'images/Key.png' },
                { name: "Selector", type: 4, value: 50,   sprite: 'images/Selector.png' }]; //Selector / door always the last


Prize.create=function() {
    if (Game.allPrizes.length>5 || Game.allPrizes.length>1 && Math.random()<0.5) return;
    
    var max=4;
    if (Game.player.levelScore<100)
      max=3;
    else if(Game.player.levelScore>250){
      if (Prize.keyShown)
          max=5;
        else max=6;}

    var ind=Math.floor(Math.random()*max);
    var prize=new Prize(Prize.types[ind]);
    if (prize.info.type===3)
       Prize.keyShown=true;
    Game.allPrizes.push(prize);
}; 

Prize.createDoor=function() {
    var prize=new Prize(Prize.types[Prize.types.length-1]);
    prize.y=0;
    Game.allPrizes.push(prize); 
}

Prize.keyShown=false;


Prize.prototype.render=function() {
    ctx.drawImage(Resources.get(this.info.sprite), this.x * Engine.colSize+10, this.y * Engine.imgHeight+5, Engine.colSize*0.7, Engine.rowSize*0.7);
}



// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var Game={
    tm: null,
    tmPrize: null,
    player: new Player(),

    
    init: function(){
        this.allEnemies=[];
        this.allPrizes=[];
        Prize.keyShown=false;
        this.player.init();
        this.start();
    },

    start: function() {
        this.tm = setInterval(Enemy.createEnemy, 500);
        Enemy.createEnemy();
        Enemy.createEnemy();
        this.tmPrize=setInterval(Prize.create, 5000);
        Prize.create();
        Prize.create();

    },

    stop: function () { 
        clearInterval(this.tm);
        this.tm=null;
        clearInterval(this.tmPrize);
        this.tmPrize=null;
    }
};

Game.init();
// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    Game.player.handleInput(allowedKeys[e.keyCode]);
});

Game.rulesEl=document.querySelector("section.rules");

document.querySelector("header .rules").addEventListener("click", function() {
    Game.rulesEl.classList.remove("hide");
});

document.querySelector("section.rules .close span").addEventListener("click", function() {
    Game.rulesEl.classList.add("hide");
});
