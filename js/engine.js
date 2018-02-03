/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your Game.player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your Game.player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;
        var canvasInfo={
            rowSize: 90,
            colSize: 50,
            numRows: 8,
            numCols: 12
            
             };
        canvasInfo.vtransp= Math.round(50*canvasInfo.rowSize/171);    
        canvasInfo.imgHeight= Math.round((171-40)/171*canvasInfo.rowSize)-canvasInfo.vtransp;
       
        
       // var numRows = 8;
       // var numCols = 12;

    canvas.width = canvasInfo.numCols*canvasInfo.colSize;
    canvas.height = canvasInfo.numRows*canvasInfo.imgHeight+canvasInfo.vtransp;//canvasInfo.imgHeight+canvasInfo.vtransp+3;
    doc.body.appendChild(canvas);
    canvasInfo.scoreEl=document.querySelector(".game.score .val");
    canvasInfo.lifeEl=document.querySelector(".game.life .val");


   

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (checkCollisions())
           reset();
    }

    function  checkCollisions() {
        for(var i=0; i<Game.allEnemies.length; i++) {
            if (Math.abs(Game.player.x-Game.allEnemies[i].x)<0.9 && Math.abs(Game.player.y-Game.allEnemies[i].y)<0.9){
                //console.log("Game.player: ", Game.player.x, Game.player.y, "   enemy: ", Game.allEnemies[i].x, Game.allEnemies[i].y);
                return true;}
        }

        //check prizes
        for (var i=Game.allPrizes.length-1; i>-1; i--) {
            if(Math.abs(Game.player.x-Game.allPrizes[i].x) < 0.9 && Math.abs(Game.player.y-Game.allPrizes[i].y) < 0.9) {
                //console.log("Game.player: ", Game.player.x, Game.player.y, "   prize: ", Game.allPrizes[i].x, Game.allPrizes[i].y, JSON.stringify(Game.allPrizes[i].info));
                Game.player.score+=Game.allPrizes[i].info.value;
                Game.player.levelScore+=Game.allPrizes[i].info.value;
                
                switch (Game.allPrizes[i].info.type){
                    case 2: Game.player.life++; break;
                    case 3:  Game.player.hasKey=true; Prize.createDoor(); break;
                    case 4: Game.player.escape=true; reset(); return;
                  }
                  Game.allPrizes.splice(i,1);
                  
             }
        }

        if (Game.player.y<1)
          return true;  //in water and not escape
    }

    /* This is called by the update function and loops through all of the
     * objects within your Game.allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * Game.player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        Game.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        Game.player.update();
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ];
           
           var row, col;
           
        
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < canvasInfo.numRows; row++) {   
            for (col = 0; col < canvasInfo.numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * canvasInfo.colSize, row * canvasInfo.imgHeight, canvasInfo.colSize, canvasInfo.rowSize);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and Game.player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the Game.allEnemies array and call
         * the render function you have defined.
         */
        Game.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        
        Game.allPrizes.forEach(function(prize) {
            prize.render();
        });

        Game.player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    
    function reset() {
        if(Game.player.hasKey && Game.player.escape){
          Game.player.score+=250;
          Game.player.levelScore=0;
        }
        else if (Game.player.life>1) {
            Game.player.life--;
            Game.player.levelScore-=100;
            Game.player.score-=100;
        }
        else {Game.player.score=0;
            Game.player.levelScore=0;
        }

        Game.init();
        init();   
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-pink-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Star.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Selector.png'

    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    return canvasInfo;
})(this);
