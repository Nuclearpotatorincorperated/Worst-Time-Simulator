let scene;

let background;
let bgSpeed = 0.5;

let isInvincible = false;
let invincibilityDuration = 3000; // duration in milliseconds

let bgm;
let sans;

let player;
let playerProjectiles;
let bulletSpeed = 1000;

let hardMode = false;

let enemyCount = 9;
let enemies;
let enemyProjectiles;
let enemySpacing = 500 / enemyCount;
let enemyOffsetX = 0;

let elapsedTime = 0;
let explosions;

let keyUp;
let keyDown;
let keyLeft;
let keyRight;
let keyUpAlt;
let keyDownAlt;
let keyLeftAlt;
let keyRightAlt;
let keyFire;

let gameOver = false;

let score = 0;
let popupContainer;
let popupWnd;
let btnRetry;
let missionFailedTitle;
let scoreTxt;
let hudText;
let playerSizeMod = 1.1;
if (hardMode) {
    playerSizeMod = 1.5
}


function preload() {
    scene = this;
    scene.load.spritesheet("player", "/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/SoulRed.png", { frameWidth: 16, frameHeight: 16 });
    scene.load.spritesheet("playerBullet", "/resources/player-bullet.png", { frameWidth: 5, frameHeight: 13 });
    scene.load.spritesheet("enemy", "/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/Gaster Blasters.png", { frameWidth: 32, frameHeight: 50 });
    scene.load.spritesheet("enemyBullet", "/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/White.png", { frameWidth: 5, frameHeight: 20 });
    scene.load.spritesheet("explosion", "/resources/explosion-sprite.png", { frameWidth: 16, frameHeight: 16 });
    scene.load.image("popupWnd", "/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/Black.png");
    scene.load.image("btnRetry", "/resources/btnRetry.png");
    scene.load.image('sans', "/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/Sans.png");
    scene.load.audio('bgm', ['/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/An Enigmatic Encounter.mp3']);
}

function create() {
    // animations
    createAnimation();

    // groups
    playerProjectiles = scene.add.group();
    enemies = scene.add.group();
    enemyProjectiles = scene.add.group();
    explosions = scene.add.group();

    // Sans
    createSans();
    
    // player
    createPlayer();

    // Enemies
    createEnemies();
    
    // explosion effect
    createVfx();

    // popup window
    createPopupWindow();

    hudText = scene.add.text(10, 10, 'Score: ' + score);
    
    // check for collisions
    scene.physics.add.overlap(enemies, playerProjectiles, defeatEnemies);
    scene.physics.add.overlap(enemies, player, meleeEnemies);
    scene.physics.add.overlap(player, enemyProjectiles, playerLoses);
    scene.physics.add.overlap(player, sans, playerLoses);

    // music
    bgm = new Audio('/res/f76a44cf-176d-49b0-b4fd-8f3b91dd4cff/An Enigmatic Encounter.mp3');
    bgm.loop = true; // Loop the audio
    bgm.volume = 0.5; // Set volume (0.0 to 1.0)

    // game controls
    keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyUp = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyDown = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyLeftAlt = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyRightAlt = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    keyUpAlt = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    keyDownAlt = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    keyFire = true; // Assuming this means bullets can be fired immediately
}


function createAnimation() {
    // player animation
    scene.anims.create({
        key: 'forward',
        frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
        frameRate: 12,
        repeat: -1
    });
    
    // bullet animation
    scene.anims.create({
        key: "bullet_anim",
        frames: scene.anims.generateFrameNumbers("playerBullet", { start: 0, end: 1 }),
        frameRate: 12,
        repeat: -1
    });

    // enemy animation
    scene.anims.create({
        key: "enemy_anim",
        frames: scene.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
        frameRate: 12,
        repeat: -1
    });

    // enemy bullet animation
    scene.anims.create({
        key: "enemyBullet_anim",
        frames: scene.anims.generateFrameNumbers("enemyBullet", { start: 0, end: 1 }),
        frameRate: 12,
        repeat: -1
    });
}

function createPlayer() {
    player = scene.physics.add.sprite(256, 600, "player");
    player.setScale(playerSizeMod);
    player.setCollideWorldBounds(true);
    player.anims.play("forward");
}

function createSans() {
    sans = scene.physics.add.sprite(256, 150, "sans");
    sans.setScale(0.75);
}

function createEnemies() {
    // create enemies
    for (let i = 0; i < enemyCount; i++) {
        let enemy = scene.physics.add.sprite(0, 100, "enemy");
        enemy.x = enemyOffsetX + (i * enemySpacing);
        enemy.y = 0;
        enemy.depth = 0;
        enemy.setScale(1.2);
        enemy.startX = enemy.x;
        enemy.speedY = (Math.random() * 10) + 0.5;
        scene.physics.world.enableBody(enemy);
        enemy.anims.play("enemy_anim");
        
        // setup fireInterval
        enemy.fireInterval = (Math.random() * 10) + 0.001;
        enemy.timedEvent = scene.time.addEvent({
            delay: enemy.fireInterval,
            args: [enemy],
            callback: enemyFire,
            callbackScope: scene,
            repeat: -1
        });
        
        enemies.add(enemy);
    }
}

function createPopupWindow() {
    popupContainer = scene.add.container();
    popupContainer.x = 256;
    popupContainer.y = 350;
    popupWnd = scene.add.sprite(0, 0, "popupWnd");
    popupWnd.setScale(2)
    popupContainer.add(popupWnd);
    
    textConfig = { fontSize: '64px', color: '#ffffff', fontFamily: 'Comic Sans MS' };
    scoreTxt = scene.add.text(-20, -20, '0', textConfig);
    popupContainer.add(scoreTxt);

    popupContainer.visible = false;
    popupContainer.depth = 100;
}

function handleClick(pointer, gameObject) {
    if (gameObject === btnRetry) {
        retryGame();
    }
}

function update() {
    if (!gameOver) {
        // update player
        updatePlayer();
      
        // update enemies
        updateEnemies();
        
        elapsedTime += 0.02;
    }
}

function updatePlayer() {
    // horizontal control
    if (keyLeft.isDown || keyLeftAlt.isDown)  {
        player.setVelocityX(-160);
        bgm.play();
    } else if (keyRight.isDown || keyRightAlt.isDown) {
        player.setVelocityX(160);
        bgm.play();
    } else {
        player.setVelocityX(0);
    }

    // vertical control
    if (keyUp.isDown || keyUpAlt.isDown) {
        player.setVelocityY(-160);
        bgm.play();
    } else if (keyDown.isDown || keyDownAlt.isDown) {
        player.setVelocityY(160);
        bgm.play();
    } else {
        player.setVelocityY(0);
    }
    
    // check for firing bullets
    if (Phaser.Input.Keyboard.JustDown(keyFire)) {
        fire();
    }

    // check for out of screen bullet, then delete it
    for (let i = 0; i < playerProjectiles.getChildren().length; i++) {
        let bullet = playerProjectiles.getChildren()[i];
        if (bullet.y < -16) {
            bullet.destroy();
        }
    }
}

function updateEnemies() {
    // update enemies
    for (let i = 0; i < enemies.getChildren().length; i++) {
        let enemy = enemies.getChildren()[i];
        enemy.x = enemy.startX + (Math.sin(elapsedTime) * 32);
        enemy.y += enemy.speedY;

        if (enemy.y > config.height) {
            enemy.speedY = (Math.random() * 10) + 0.5;
            enemy.y = 0;
        }
    }

    // check for out of screen enemy's bullets, then delete them
    for (let i = 0; i < enemyProjectiles.getChildren().length; i++) {
        let bullet = enemyProjectiles.getChildren()[i];
        if (bullet.y > game.config.height) {
            bullet.destroy();
        }
    }
}

function createVfx() {
    // explosion
    scene.anims.create({
        key: "explosion_anim",
        frames: scene.anims.generateFrameNumbers("explosion", { start: 0, end: 4 }),
        frameRate: 18,
        repeat: 0
    });
}

function fire() {
    let bullet = scene.physics.add.sprite(player.x, player.y - 20, "playerBullet");
    bullet.anims.play("bullet_anim");
    scene.physics.world.enableBody(bullet);
    bullet.body.velocity.y = -bulletSpeed;
    bullet.setScale(1.5);

    playerProjectiles.add(bullet);
}

function defeatEnemies(enemy, bullet) {
    score++;
    hudText.text = "Score: " + score;
    scoreTxt.text = score;

    // add explosion
    let explosion = scene.add.sprite(bullet.x, bullet.y, "explosion");
    explosion.anims.play("explosion_anim");
    explosion.setScale(2.5);
    explosions.add(explosion);
    explosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, destroyExplosion);

    bullet.destroy();

    // reset enemy
    enemy.y = -30;
    enemy.speedY = (Math.random() * 10) + 0.5;
}

function killPlayer(player) {
    let explosion = scene.add.sprite(player.x, player.y, "explosion");
    explosion.anims.play("explosion_anim");
    explosion.setScale(2.5);
    explosions.add(explosion);
    explosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, destroyExplosion);

    gameOver = true;
    pauseGame();
}

function meleeEnemies(enemy, player) {
    score++;
    hudText.text = "Score: " + score;
    scoreTxt.text = score;

    // reset enemy
    enemy.y = -30;
    enemy.speedY = (Math.random() * 10) + 0.5;
    if (Math.random() <= 0.1 && hardMode) {
        killPlayer(player);
    }
}

function enemyFire(enemy) {
    if (enemy.active) {
        let bullet = scene.physics.add.sprite(enemy.x, enemy.y, "enemyBullet");
        scene.physics.world.enableBody(bullet);
        bullet.body.velocity.y = bulletSpeed;
        bullet.setScale(1.5);
    
        enemyProjectiles.add(bullet);
    }
}

function playerLoses(player, bullet) {
    let explosion = scene.add.sprite(player.x, player.y, "explosion");
    explosion.anims.play("explosion_anim");
    explosion.setScale(2.5);
    explosions.add(explosion);
    explosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, destroyExplosion);
    
    bullet.destroy();

    gameOver = true;
    pauseGame();
}

function destroyExplosion(anim, texture, sprite) {
    sprite.destroy(); 
}

function pauseGame() {
    popupContainer.visible = true;

    scoreTxt.text = score;

    // Stop player
    player.setVelocityX(0);
    player.setVelocityY(0);
    player.visible = false;

    // Stop enemies
    enemies.getChildren().forEach(enemy => {
        enemy.setVelocityY(0); // Stop the enemy's vertical movement
        enemy.setVelocityX(0); // Stop the enemy's horiziontal movement
        if (enemy.timedEvent) {
            enemy.timedEvent.paused = true; // Pause the enemy's firing event
        }
    });
}
function retryGame() {
    // destroy enemies
    for (let i = enemies.getChildren().length - 1; i >= 0; i--) {
        let enemy = enemies.getChildren()[i];
        enemy.destroy();
    }

    // reset player
    player.x = 256;
    player.y = 600;
    player.visible = true;

    // reset enemies
    createEnemies();

    score = 0;

    
    gameOver = false;
    popupContainer.visible = false;
}

let config = {
    type: Phaser.AUTO,
    width: 512,
    height: 720,
    parent: "gameContainer",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}
let game = new Phaser.Game(config);