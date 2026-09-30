// =====================================================
// STICKMAN MONSTER HUNTER
// Ishlab chiqaruvchi: ULUG‘BEK.R
// =====================================================

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// =====================================================
// CANVAS
// =====================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// =====================================================
// GAME
// =====================================================

const keys = {};

let paused = false;

let gameOver = false;

let lastTime = 0;

let spawnTimer = 0;

let bossTimer = 0;

let screenShake = 0;

let particles = [];

let arrows = [];

let enemies = [];


// =====================================================
// PLAYER
// =====================================================

const player = {

    x: 220,

    y: 0,

    width: 42,

    height: 85,

    vx: 0,

    vy: 0,

    speed: 4.5,

    jump: 13,

    grounded: true,

    facing: 1,

    hp: 100,

    maxHp: 100,

    level: 1,

    xp: 0,

    coins: 100,

    damage: 20,

    arrowSpeed: 12,

    skin: "classic",

    walkTime: 0,

    shooting: 0,

    invincible: 0

};


// =====================================================
// WORLD
// =====================================================

const groundHeight = 70;

let zone = "forest";

let zoneName = "🌲 O‘RMON ZONASI";


// =====================================================
// SKINS
// =====================================================

const skins = {

    classic: "#eeeeee",

    fire: "#ff3b22",

    ice: "#55dfff",

    gold: "#ffd22e"

};

let ownedSkins = {

    classic: true,

    fire: false,

    ice: false,

    gold: false

};


// =====================================================
// ZONES
// =====================================================

let ownedZones = {

    forest: true,

    city: false,

    lava: false,

    dark: false

};


// =====================================================
// BOSS
// =====================================================

let boss = {

    active: false,

    x: 0,

    y: 0,

    hp: 600,

    maxHp: 600,

    type: "dragon",

    attackTimer: 0

};


// =====================================================
// INPUT
// =====================================================

document.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (
        e.key === " " ||
        e.key.toLowerCase() === "w"
    ) {

        jump();

    }

    if (
        e.key.toLowerCase() === "f"
    ) {

        shoot();

    }

    if (
        e.key.toLowerCase() === "b"
    ) {

        openShop();

    }

});


document.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

});


// =====================================================
// MOBILE
// =====================================================

function holdButton(id, key) {

    const button =
        document.getElementById(id);

    if (!button) return;

    button.addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            keys[key] = true;

        },
        { passive: false }
    );

    button.addEventListener(
        "touchend",
        e => {

            e.preventDefault();

            keys[key] = false;

        },
        { passive: false }
    );

    button.addEventListener(
        "mousedown",
        () => {

            keys[key] = true;

        }
    );

    button.addEventListener(
        "mouseup",
        () => {

            keys[key] = false;

        }
    );

}

holdButton("leftBtn", "a");
holdButton("rightBtn", "d");


function buttonAction(id, action) {

    const button =
        document.getElementById(id);

    if (!button) return;

    button.addEventListener(
        "touchstart",
        e => {

            e.preventDefault();

            action();

        },
        { passive: false }
    );

    button.addEventListener(
        "click",
        action
    );

}

buttonAction(
    "jumpBtn",
    jump
);

buttonAction(
    "attackBtn",
    shoot
);


// =====================================================
// JUMP
// =====================================================

function jump() {

    if (paused || gameOver) return;

    if (!player.grounded) return;

    player.vy =
        -player.jump;

    player.grounded =
        false;

}


// =====================================================
// PLAYER MOVEMENT
// =====================================================

function updatePlayer(dt) {

    if (paused || gameOver) return;


    let moving = false;


    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        player.vx =
            -player.speed;

        player.facing =
            -1;

        moving = true;

    }


    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        player.vx =
            player.speed;

        player.facing =
            1;

        moving = true;

    }


    if (!moving) {

        player.vx *= .75;

    }


    player.x +=
        player.vx;


    player.x =
        Math.max(
            20,
            Math.min(
                canvas.width - 50,
                player.x
            )
        );


    if (moving) {

        player.walkTime +=
            dt * .012;

    }


    // Gravity

    player.vy +=
        0.65;

    player.y +=
        player.vy;


    const floor =
        canvas.height -
        groundHeight -
        player.height;


    if (player.y >= floor) {

        player.y =
            floor;

        player.vy =
            0;

        player.grounded =
            true;

    }


    if (player.invincible > 0) {

        player.invincible -= dt;

    }


    if (player.shooting > 0) {

        player.shooting -= dt;

    }

}


// =====================================================
// SHOOT
// =====================================================

function shoot() {

    if (paused || gameOver) return;

    if (player.shooting > 0) return;


    player.shooting =
        180;


    arrows.push({

        x:
            player.x +
            (player.facing === 1 ? 38 : -38),

        y:
            player.y +
            42,

        vx:
            player.facing *
            player.arrowSpeed,

        damage:
            player.damage,

        angle:
            player.facing === 1
                ? 0
                : Math.PI

    });


    createParticles(
        player.x +
        player.facing * 35,

        player.y + 42,

        "#ffd75c",

        5
    );

}


// =====================================================
// ARROWS
// =====================================================

function updateArrows(dt) {

    for (
        let i = arrows.length - 1;
        i >= 0;
        i--
    ) {

        const arrow =
            arrows[i];


        arrow.x +=
            arrow.vx;


        // Enemy collision

        let hit = false;


        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];


            if (
                distance(
                    arrow.x,
                    arrow.y,
                    enemy.x,
                    enemy.y
                ) < 38
            ) {

                enemy.hp -=
                    arrow.damage;

                createHitEffect(
                    arrow.x,
                    arrow.y
                );

                hit = true;


                if (enemy.hp <= 0) {

                    killEnemy(j);

                }

                break;

            }

        }


        // Boss collision

        if (
            boss.active &&
            distance(
                arrow.x,
                arrow.y,
                boss.x,
                boss.y
            ) < 75
        ) {

            boss.hp -=
                arrow.damage;

            createHitEffect(
                arrow.x,
                arrow.y
            );

            hit = true;


            if (boss.hp <= 0) {

                killBoss();

            }

        }


        if (
            hit ||
            arrow.x < -100 ||
            arrow.x > canvas.width + 100
        ) {

            arrows.splice(i, 1);

        }

    }

}


// =====================================================
// ENEMIES
// =====================================================

function spawnEnemy() {

    const fromLeft =
        Math.random() < .5;


    const types = [

        {
            type: "zombie",
            hp: 50,
            speed: 1.15,
            damage: 8,
            color: "#6ac45d"
        },

        {
            type: "monster",
            hp: 80,
            speed: 1.5,
            damage: 12,
            color: "#d53c45"
        },

        {
            type: "beast",
            hp: 110,
            speed: 1.8,
            damage: 16,
            color: "#8e5bff"
        }

    ];


    let data =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];


    enemies.push({

        type:
            data.type,

        x:
            fromLeft
                ? -60
                : canvas.width + 60,

        y:
            canvas.height -
            groundHeight -
            55,

        hp:
            data.hp,

        maxHp:
            data.hp,

        speed:
            data.speed,

        damage:
            data.damage,

        color:
            data.color,

        direction:
            fromLeft
                ? 1
                : -1,

        attackTimer: 0,

        walkTime:
            Math.random() * 10

    });

}


// =====================================================
// ENEMY AI
// =====================================================

function updateEnemies(dt) {

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        const dx =
            player.x -
            enemy.x;


        if (
            Math.abs(dx) > 45
        ) {

            enemy.direction =
                dx > 0
                    ? 1
                    : -1;

            enemy.x +=
                enemy.speed *
                enemy.direction;

            enemy.walkTime +=
                dt * .01;

        } else {

            enemy.attackTimer +=
                dt;


            if (
                enemy.attackTimer >
                900
            ) {

                damagePlayer(
                    enemy.damage
                );

                enemy.attackTimer =
                    0;

            }

        }


        if (
            enemy.x < -150 ||
            enemy.x > canvas.width + 150
        ) {

            enemies.splice(i, 1);

        }

    }

}


// =====================================================
// KILL ENEMY
// =====================================================

function killEnemy(index) {

    const enemy =
        enemies[index];


    createHitEffect(
        enemy.x,
        enemy.y
    );


    player.coins +=
        enemy.type === "beast"
            ? 30
            : 15;


    gainXP(
        enemy.type === "beast"
            ? 40
            : 25
    );


    if (
        Math.random() < .35
    ) {

        createLoot(
            enemy.x,
            enemy.y
        );

    }


    enemies.splice(
        index,
        1
    );

}


// =====================================================
// BOSS
// =====================================================

function spawnBoss() {

    if (boss.active) return;


    boss.active = true;

    boss.hp =
        boss.maxHp;

    boss.x =
        canvas.width / 2;

    boss.y =
        canvas.height -
        groundHeight -
        130;


    document.getElementById(
        "bossBar"
    ).style.display =
        "block";


    showMessage(
        "👑 BOSS PAYDO BO‘LDI!"
    );

}


function updateBoss(dt) {

    if (!boss.active) return;


    const dx =
        player.x -
        boss.x;


    if (
        Math.abs(dx) > 130
    ) {

        boss.x +=
            Math.sign(dx) *
            1.1;

    }


    boss.attackTimer +=
        dt;


    if (
        boss.attackTimer >
        1300
    ) {

        damagePlayer(20);

        boss.attackTimer =
            0;

        createParticles(
            boss.x,
            boss.y,
            "#ff3030",
            15
        );

    }


    document.getElementById(
        "bossHp"
    ).style.width =
        (
            boss.hp /
            boss.maxHp *
            100
        ) + "%";

}


function killBoss() {

    boss.active = false;


    document.getElementById(
        "bossBar"
    ).style.display =
        "none";


    player.coins +=
        250;


    gainXP(
        200
    );


    createHitEffect(
        boss.x,
        boss.y
    );


    showMessage(
        "👑 BOSS YENGILDI! +250 💰"
    );

}


// =====================================================
// PLAYER DAMAGE
// =====================================================

function damagePlayer(amount) {

    if (
        player.invincible > 0
    ) return;


    player.hp -=
        amount;


    player.invincible =
        700;


    screenShake =
        10;


    createParticles(
        player.x,
        player.y + 35,
        "#ff2222",
        10
    );


    updateHUD();


    if (
        player.hp <= 0
    ) {

        player.hp = 0;

        endGame();

    }

}


// =====================================================
// XP
// =====================================================

function gainXP(amount) {

    player.xp +=
        amount;


    const needed =
        player.level * 100;


    if (
        player.xp >= needed
    ) {

        player.xp -=
            needed;

        player.level++;

        player.damage +=
            5;

        player.maxHp +=
            10;

        player.hp =
            player.maxHp;


        showMessage(
            "⭐ LEVEL " +
            player.level +
            "!"
        );

    }


    updateHUD();

}


// =====================================================
// LOOT
// =====================================================

function createLoot(x, y) {

    particles.push({

        type: "loot",

        x: x,

        y: y,

        life: 6000,

        maxLife: 6000

    });

}


// =====================================================
// PARTICLES
// =====================================================

function createParticles(
    x,
    y,
    color,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            type: "particle",

            x: x,

            y: y,

            vx:
                (Math.random() - .5) * 8,

            vy:
                (Math.random() - .5) * 8,

            color: color,

            life: 500,

            maxLife: 500

        });

    }

}


function createHitEffect(x, y) {

    screenShake =
        7;


    createParticles(
        x,
        y,
        "#ffd43b",
        18
    );

}


// =====================================================
// PARTICLE UPDATE
// =====================================================

function updateParticles(dt) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.life -=
            dt;


        if (
            p.type === "particle"
        ) {

            p.x +=
                p.vx;

            p.y +=
                p.vy;

            p.vy +=
                .15;

        }


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


// =====================================================
// DRAW BACKGROUND
// =====================================================

function drawBackground() {

    let skyColor =
        "#0b2340";


    if (zone === "city") {

        skyColor =
            "#17171f";

    }

    if (zone === "lava") {

        skyColor =
            "#35100a";

    }

    if (zone === "dark") {

        skyColor =
            "#090414";

    }


    ctx.fillStyle =
        skyColor;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Moon

    ctx.beginPath();

    ctx.arc(
        canvas.width - 100,
        80,
        35,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#fff1b0";

    ctx.shadowBlur =
        25;

    ctx.shadowColor =
        "#fff1b0";

    ctx.fill();

    ctx.shadowBlur =
        0;


    // Stars

    for (
        let i = 0;
        i < 35;
        i++
    ) {

        const x =
            (i * 97) %
            canvas.width;

        const y =
            (i * 43) %
            (canvas.height * .45);

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );

    }


    // Trees / zone background

    if (
        zone === "forest"
    ) {

        drawTrees();

    }

    if (
        zone === "city"
    ) {

        drawCity();

    }

    if (
        zone === "lava"
    ) {

        drawLava();

    }

    if (
        zone === "dark"
    ) {

        drawDarkWorld();

    }


    // Ground

    ctx.fillStyle =
        zone === "lava"
            ? "#35130b"
            : "#152617";

    ctx.fillRect(
        0,
        canvas.height -
        groundHeight,
        canvas.width,
        groundHeight
    );


    ctx.fillStyle =
        zone === "lava"
            ? "#d34a1c"
            : "#315c2b";

    ctx.fillRect(
        0,
        canvas.height -
        groundHeight,
        canvas.width,
        8
    );

}


function drawTrees() {

    for (
        let x = -30;
        x < canvas.width;
        x += 150
    ) {

        const base =
            canvas.height -
            groundHeight;


        ctx.fillStyle =
            "#38200f";

        ctx.fillRect(
            x + 45,
            base - 130,
            24,
            130
        );


        ctx.fillStyle =
            "#0c3c20";

        ctx.beginPath();

        ctx.arc(
            x + 55,
            base - 145,
            55,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


function drawCity() {

    for (
        let x = 0;
        x < canvas.width;
        x += 110
    ) {

        const h =
            100 +
            (x % 180);


        ctx.fillStyle =
            "#252735";

        ctx.fillRect(
            x,
            canvas.height -
            groundHeight -
            h,
            90,
            h
        );

    }

}


function drawLava() {

    ctx.fillStyle =
        "#7b1f0d";

    for (
        let x = 0;
        x < canvas.width;
        x += 100
    ) {

        ctx.fillRect(
            x,
            canvas.height -
            groundHeight +
            25,
            60,
            15
        );

    }

}


function drawDarkWorld() {

    ctx.fillStyle =
        "#17082b";

    ctx.fillRect(
        0,
        canvas.height -
        groundHeight -
        160,
        canvas.width,
        160
    );

}


// =====================================================
// DRAW STICKMAN
// =====================================================

function drawPlayer() {

    const x =
        player.x;

    const bottom =
        player.y;


    const headX =
        x + 21;

    const headY =
        bottom + 18;


    let color =
        skins[
            player.skin
        ];


    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible / 80
        ) % 2 === 0
    ) {

        color =
            "#ffffff";

    }


    ctx.save();


    // Direction

    ctx.translate(
        headX,
        0
    );

    ctx.scale(
        player.facing,
        1
    );

    ctx.translate(
        -headX,
        0
    );


    // Walking legs

    let legSwing = 0;

    if (
        Math.abs(player.vx) > .4 &&
        player.grounded
    ) {

        legSwing =
            Math.sin(
                player.walkTime * 12
            ) * 10;

    }


    // Legs

    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        5;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        headX,
        bottom + 55
    );

    ctx.lineTo(
        headX - 12 + legSwing,
        bottom + 82
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        headX,
        bottom + 55
    );

    ctx.lineTo(
        headX + 12 - legSwing,
        bottom + 82
    );

    ctx.stroke();


    // Body

    ctx.beginPath();

    ctx.moveTo(
        headX,
        bottom + 30
    );

    ctx.lineTo(
        headX,
        bottom + 58
    );

    ctx.stroke();


    // Head

    ctx.beginPath();

    ctx.arc(
        headX,
        headY,
        15,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        color;

    ctx.fill();

    ctx.strokeStyle =
        "#111";

    ctx.lineWidth =
        3;

    ctx.stroke();


    // Black eyes

    ctx.fillStyle =
        "#000000";


    ctx.beginPath();

    ctx.arc(
        headX - 6,
        headY - 2,
        2.8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        headX + 6,
        headY - 2,
        2.8,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Arms

    const shooting =
        player.shooting > 0;


    ctx.strokeStyle =
        color;

    ctx.lineWidth =
        5;


    if (shooting) {

        // Kamon tortilgan holat

        ctx.beginPath();

        ctx.moveTo(
            headX,
            bottom + 35
        );

        ctx.lineTo(
            headX + 24,
            bottom + 43
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            headX,
            bottom + 35
        );

        ctx.lineTo(
            headX + 27,
            bottom + 25
        );

        ctx.stroke();

    } else {

        // Oddiy yurish

        const armSwing =
            player.grounded
                ? Math.sin(
                    player.walkTime * 12
                ) * 8
                : 0;


        ctx.beginPath();

        ctx.moveTo(
            headX,
            bottom + 35
        );

        ctx.lineTo(
            headX + armSwing + 17,
            bottom + 52
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            headX,
            bottom + 35
        );

        ctx.lineTo(
            headX - armSwing - 15,
            bottom + 50
        );

        ctx.stroke();

    }


    // Bow

    drawBow(
        headX + 26,
        bottom + 40
    );


    ctx.restore();

}


// =====================================================
// BOW
// =====================================================

function drawBow(x, y) {

    ctx.strokeStyle =
        "#d28a3a";

    ctx.lineWidth =
        4;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        27,
        -Math.PI / 2,
        Math.PI / 2
    );

    ctx.stroke();


    // String

    ctx.strokeStyle =
        "#eeeeee";

    ctx.lineWidth =
        1.5;

    ctx.beginPath();

    ctx.moveTo(
        x - 27,
        y
    );

    ctx.lineTo(
        x + 27,
        y
    );

    ctx.stroke();


    // Arrow direction line

    if (
        player.shooting > 0
    ) {

        ctx.strokeStyle =
            "#fff";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            x - 25,
            y
        );

        ctx.lineTo(
            x + 36,
            y
        );

        ctx.stroke();

    }

}


// =====================================================
// DRAW ENEMY
// =====================================================

function drawEnemy(enemy) {

    const x =
        enemy.x;

    const y =
        enemy.y;


    ctx.save();


    ctx.translate(
        x,
        y
    );


    ctx.scale(
        enemy.direction,
        1
    );


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        58,
        30,
        7,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        enemy.color;

    ctx.beginPath();

    ctx.arc(
        0,
        25,
        28,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Head

    ctx.beginPath();

    ctx.arc(
        0,
        -10,
        23,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#000";


    ctx.beginPath();

    ctx.arc(
        -8,
        -12,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        8,
        -12,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Arms

    ctx.strokeStyle =
        enemy.color;

    ctx.lineWidth =
        8;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        -20,
        18
    );

    ctx.lineTo(
        -40,
        38
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        20,
        18
    );

    ctx.lineTo(
        40,
        38
    );

    ctx.stroke();


    // HP bar

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        -30,
        -45,
        60,
        6
    );


    ctx.fillStyle =
        "#ff2525";

    ctx.fillRect(
        -30,
        -45,
        60 *
        (
            enemy.hp /
            enemy.maxHp
        ),
        6
    );


    ctx.restore();

}


// =====================================================
// DRAW BOSS
// =====================================================

function drawBoss() {

    if (!boss.active)
        return;


    ctx.save();


    ctx.translate(
        boss.x,
        boss.y
    );


    const pulse =
        Math.sin(
            performance.now() / 150
        ) * 3;


    // Aura

    ctx.fillStyle =
        "rgba(255,0,0,.15)";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        80 + pulse,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Body

    ctx.fillStyle =
        "#641313";

    ctx.beginPath();

    ctx.arc(
        0,
        20,
        55,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Head

    ctx.fillStyle =
        "#a92828";

    ctx.beginPath();

    ctx.arc(
        0,
        -45,
        43,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Horns

    ctx.fillStyle =
        "#e5e5e5";

    ctx.beginPath();

    ctx.moveTo(
        -30,
        -75
    );

    ctx.lineTo(
        -55,
        -115
    );

    ctx.lineTo(
        -10,
        -82
    );

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        30,
        -75
    );

    ctx.lineTo(
        55,
        -115
    );

    ctx.lineTo(
        10,
        -82
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle =
        "#ffff00";


    ctx.beginPath();

    ctx.arc(
        -15,
        -48,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        15,
        -48,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Arms

    ctx.strokeStyle =
        "#641313";

    ctx.lineWidth =
        15;

    ctx.lineCap =
        "round";


    ctx.beginPath();

    ctx.moveTo(
        -40,
        10
    );

    ctx.lineTo(
        -80,
        50
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        40,
        10
    );

    ctx.lineTo(
        80,
        50
    );

    ctx.stroke();


    ctx.restore();

}


// =====================================================
// DRAW ARROWS
// =====================================================

function drawArrows() {

    ctx.lineWidth =
        4;

    ctx.lineCap =
        "round";


    for (
        const arrow of arrows
    ) {

        ctx.save();

        ctx.translate(
            arrow.x,
            arrow.y
        );

        ctx.rotate(
            arrow.angle
        );


        // Shaft

        ctx.strokeStyle =
            "#d49b52";

        ctx.beginPath();

        ctx.moveTo(
            -30,
            0
        );

        ctx.lineTo(
            18,
            0
        );

        ctx.stroke();


        // Arrow head

        ctx.fillStyle =
            "#e6e6e6";

        ctx.beginPath();

        ctx.moveTo(
            28,
            0
        );

        ctx.lineTo(
            14,
            -7
        );

        ctx.lineTo(
            14,
            7
        );

        ctx.closePath();

        ctx.fill();


        // Direction trail

        ctx.strokeStyle =
            "rgba(255,220,100,.45)";

        ctx.lineWidth =
            2;

        ctx.beginPath();

        ctx.moveTo(
            -35,
            0
        );

        ctx.lineTo(
            -8,
            0
        );

        ctx.stroke();


        ctx.restore();

    }

}


// =====================================================
// DRAW PARTICLES
// =====================================================

function drawParticles() {

    for (
        const p of particles
    ) {

        if (
            p.type === "particle"
        ) {

            const alpha =
                p.life /
                p.maxLife;


            ctx.globalAlpha =
                alpha;

            ctx.fillStyle =
                p.color;

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.globalAlpha =
                1;

        }


        if (
            p.type === "loot"
        ) {

            const pulse =
                Math.sin(
                    performance.now() /
                    150
                ) * 4;


            ctx.fillStyle =
                "#b84dff";

            ctx.shadowBlur =
                15;

            ctx.shadowColor =
                "#b84dff";

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y - pulse,
                9,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur =
                0;

        }

    }

}


// =====================================================
// DRAW
// =====================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    if (
        screenShake > 0
    ) {

        ctx.translate(
            (Math.random() - .5) *
            screenShake,

            (Math.random() - .5) *
            screenShake
        );

        screenShake *=
            .85;

    }


    drawBackground();


    // Loot

    drawParticles();


    // Enemies

    for (
        const enemy of enemies
    ) {

        drawEnemy(enemy);

    }


    // Boss

    drawBoss();


    // Player

    drawPlayer();


    // Arrows

    drawArrows();


    ctx.restore();

}


// =====================================================
// SPAWN SYSTEM
// =====================================================

function updateSpawning(dt) {

    spawnTimer +=
        dt;


    if (
        spawnTimer > 1600
    ) {

        spawnEnemy();

        spawnTimer =
            0;

    }


    bossTimer +=
        dt;


    if (
        bossTimer > 30000 &&
        !boss.active
    ) {

        spawnBoss();

        bossTimer =
            0;

    }

}


// =====================================================
// HUD
// =====================================================

function updateHUD() {

    document.getElementById(
        "hpText"
    ).textContent =
        Math.ceil(player.hp);


    document.getElementById(
        "maxHpText"
    ).textContent =
        player.maxHp;


    document.getElementById(
        "hpBar"
    ).style.width =
        (
            player.hp /
            player.maxHp *
            100
        ) + "%";


    document.getElementById(
        "levelText"
    ).textContent =
        player.level;


    document.getElementById(
        "xpBar"
    ).style.width =
        (
            player.xp /
            (player.level * 100) *
            100
        ) + "%";


    document.getElementById(
        "coinsText"
    ).textContent =
        player.coins;


    document.getElementById(
        "damageText"
    ).textContent =
        player.damage;


    document.getElementById(
        "enemyText"
    ).textContent =
        enemies.length;


    document.getElementById(
        "shopCoins"
    ).textContent =
        player.coins;

}


// =====================================================
// MESSAGE
// =====================================================

let messageTimer;

function showMessage(text) {

    const el =
        document.getElementById(
            "message"
        );


    el.textContent =
        text;


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(() => {

            el.textContent =
                "";

        }, 1500);

}


// =====================================================
// SHOP
// =====================================================

function openShop() {

    paused = true;

    document.getElementById(
        "shop"
    ).style.display =
        "block";

    updateHUD();

}


function closeShop() {

    paused = false;

    document.getElementById(
        "shop"
    ).style.display =
        "none";

}


document.getElementById(
    "shopBtn"
).addEventListener(
    "click",
    openShop
);


document.getElementById(
    "closeShop"
).addEventListener(
    "click",
    closeShop
);


// =====================================================
// SHOP TABS
// =====================================================

document.querySelectorAll(
    ".tab"
).forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".tab"
                )
                .forEach(
                    t =>
                        t.classList.remove(
                            "active"
                        )
                );


            document
                .querySelectorAll(
                    ".shop-content"
                )
                .forEach(
                    c =>
                        c.classList.remove(
                            "active"
                        )
                );


            tab.classList.add(
                "active"
            );


            document.getElementById(
                tab.dataset.tab
            ).classList.add(
                "active"
            );

        }
    );

});


// =====================================================
// SKINS
// =====================================================

document.querySelectorAll(
    "[data-skin]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const skin =
                button.dataset.skin;

            const price =
                Number(
                    button.dataset.price
                );


            if (
                !ownedSkins[skin]
            ) {

                if (
                    player.coins < price
                ) {

                    showMessage(
                        "💰 Coin yetarli emas!"
                    );

                    return;

                }


                player.coins -=
                    price;

                ownedSkins[skin] =
                    true;

            }


            player.skin =
                skin;


            showMessage(
                "🎭 Skin tanlandi!"
            );


            updateHUD();

        }
    );

});


// =====================================================
// ZONES
// =====================================================

document.querySelectorAll(
    "[data-zone]"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const selected =
                button.dataset.zone;


            const price =
                Number(
                    button.dataset.price ||
                    0
                );


            if (
                !ownedZones[selected]
            ) {

                if (
                    player.coins < price
                ) {

                    showMessage(
                        "💰 Coin yetarli emas!"
                    );

                    return;

                }


                player.coins -=
                    price;

                ownedZones[selected] =
                    true;

            }


            zone =
                selected;


            const names = {

                forest:
                    "🌲 O‘RMON ZONASI",

                city:
                    "🧟 ZOMBI SHAHRI",

                lava:
                    "🌋 AJDARLAR VODIYSI",

                dark:
                    "🌑 QORONG‘U DUNYO"

            };


            zoneName =
                names[selected];


            document.getElementById(
                "zoneName"
            ).textContent =
                zoneName;


            closeShop();

            showMessage(
                zoneName
            );


            updateHUD();

        }
    );

});


// =====================================================
// SHOP ITEMS
// =====================================================

document.getElementById(
    "buyBow"
).addEventListener(
    "click",
    () => {

        if (
            player.coins < 200
        ) {

            showMessage(
                "💰 Coin yetarli emas!"
            );

            return;

        }


        player.coins -=
            200;

        player.damage +=
            10;


        updateHUD();

        showMessage(
            "🏹 Kamon kuchaydi!"
        );

    }
);


document.getElementById(
    "buyHp"
).addEventListener(
    "click",
    () => {

        if (
            player.coins < 250
        ) {

            showMessage(
                "💰 Coin yetarli emas!"
            );

            return;

        }


        player.coins -=
            250;

        player.maxHp +=
            25;

        player.hp =
            player.maxHp;


        updateHUD();

        showMessage(
            "❤️ MAX HP +25"
        );

    }
);


document.getElementById(
    "buyArrow"
).addEventListener(
    "click",
    () => {

        if (
            player.coins < 300
        ) {

            showMessage(
                "💰 Coin yetarli emas!"
            );

            return;

        }


        player.coins -=
            300;

        player.arrowSpeed +=
            4;


        updateHUD();

        showMessage(
            "⚡ O‘Q TEZLASHDI!"
        );

    }
);


// =====================================================
// PAUSE
// =====================================================

document.getElementById(
    "pauseBtn"
).addEventListener(
    "click",
    () => {

        paused =
            !paused;

        showMessage(
            paused
                ? "⏸ PAUSE"
                : "▶ DAVOM ETDI"
        );

    }
);


// =====================================================
// GAME OVER
// =====================================================

function endGame() {

    gameOver =
        true;

    paused =
        true;


    document.getElementById(
        "gameOver"
    ).style.display =
        "flex";

}


document.getElementById(
    "restartBtn"
).addEventListener(
    "click",
    restart
);


function restart() {

    player.hp =
        player.maxHp;

    player.x =
        220;

    player.y =
        0;

    player.vx =
        0;

    player.vy =
        0;


    enemies =
        [];

    arrows =
        [];

    particles =
        [];


    boss.active =
        false;

    boss.hp =
        boss.maxHp;


    document.getElementById(
        "bossBar"
    ).style.display =
        "none";


    gameOver =
        false;

    paused =
        false;


    document.getElementById(
        "gameOver"
    ).style.display =
        "none";


    updateHUD();

}


// =====================================================
// DISTANCE
// =====================================================

function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.sqrt(
        Math.pow(
            x1 - x2,
            2
        ) +
        Math.pow(
            y1 - y2,
            2
        )
    );

}


// =====================================================
// GAME LOOP
// =====================================================

function gameLoop(time) {

    const dt =
        Math.min(
            40,
            time - lastTime
        );


    lastTime =
        time;


    if (!paused) {

        updatePlayer(dt);

        updateArrows(dt);

        updateEnemies(dt);

        updateBoss(dt);

        updateParticles(dt);

        updateSpawning(dt);

    }


    updateHUD();

    draw();


    requestAnimationFrame(
        gameLoop
    );

}


// =====================================================
// START
// =====================================================

updateHUD();

showMessage(
    "🏹 OVCHI STICKMAN!"
);

requestAnimationFrame(
    gameLoop
);
