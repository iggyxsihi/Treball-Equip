var config = {
    type: Phaser.CANVAS,
    parent: 'content',
    width: 1280,
    height: 768, 
    physics: {
        default: 'arcade'
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var path;
var pausat = false;
var turrets;
var enemies;
var vides;//vida
var txt;//diners
var reanudar;
var diners = 200;
var ENEMY_SPEED = 1/10000;

var BULLET_DAMAGE = 50;

var map =  [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1],
            [ 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1],
            [ 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, -1, -1],
            [ 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, 0, 0, 0, 0, 0],
            [ 0, 0, 0, -1, -1, -1, 0, 0, -1, -1, -1, 0, -1, -1, -1, -1, -1, 0, 0, 0],
            [ -1, -1, -1, -1, -1, -1, 0, 0, -1, -1, -1, 0, -1, -1, -1, -1, -1, 0, 0, 0],
            [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, 0, 0, 0],
            [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, -1, -1, -1, 0, 0, 0],
            [ 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, 0, 0, 0, -1, -1, -1, 0, 0, 0],
            [ 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0],
            [ 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 ,0, 0, 0],
            [ 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,-1, 0, 0, 0]];

function preload() {    
    this.load.image('torre', '../imatges/torre.png');
    this.load.image('bala', '../imatges/bala.png');
    this.load.image('enemic', '../imatges/enemic.png');
    this.load.image('mapa', '../imatges/towerDefenseMap.png');
    this.load.image('vida', '../imatges/cor.png');
    this.load.image('moneda', '../imatges/moneda.png');
}

var Enemy = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Enemy (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemic', 'enemy');

            this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
            this.hp = 0;
            this.initialHp = 100;
            this.hpIncrease = 5;
        },

        startOnPath: function ()
        {
            this.follower.t = 0;
            this.hp = this.initialHp;
            
            path.getPoint(this.follower.t, this.follower.vec);
            
            this.setPosition(this.follower.vec.x, this.follower.vec.y);            
        },
        receiveDamage: function(damage) {
            this.hp -= damage;           
            
            // if hp drops below 0 we deactivate this enemy
            if(this.hp <= 0) {
                diners += 25;
                this.setActive(false);
                this.setVisible(false);      
            }
        },
        update: function (time, delta)
        {
            this.follower.t += ENEMY_SPEED * delta;
            path.getPoint(this.follower.t, this.follower.vec);
            
            this.setPosition(this.follower.vec.x, this.follower.vec.y);

            if (this.follower.t >= 1)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

});

var Life = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Life (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'vida', 'life');
    },
    place: function (i,j) {
        this.y = 500;
        this.x = 500;
    },
    update: function(){

    }

});

function getEnemy(x, y, distance) {
    var enemyUnits = enemies.getChildren();
    for(var i = 0; i < enemyUnits.length; i++) {       
        if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) < distance)
            return enemyUnits[i];
    }
    return false;
} 

var Turret = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Turret (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'torre', 'turret');
            this.nextTic = 0;
        },
        place: function(i, j) {            
            this.y = i * 64 + 64/2;
            this.x = j * 64 + 64/2;
            map[i][j] = 1;            
        },
        fire: function() {
            var enemy = getEnemy(this.x, this.y, 300);
            if(enemy) {
                var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                addBullet(this.x, this.y, angle);
                this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
            }
        },
        update: function (time, delta)
        {
            if(time > this.nextTic) {
                this.fire();
                this.nextTic = time + 1000;
            }
        }
});
    
var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bala', 'bullet');

            this.incX = 0;
            this.incY = 0;
            this.lifespan = 0;

            this.speed = Phaser.Math.GetSpeed(600, 1);
        },

        fire: function (x, y, angle)
        {
            this.setActive(true);
            this.setVisible(true);
            //  Bullets fire from the middle of the screen to the given x/y
            this.setPosition(x, y);
            
        //  we don't need to rotate the bullets as they are round
        //    this.setRotation(angle);

            this.dx = Math.cos(angle);
            this.dy = Math.sin(angle);

            this.lifespan = 2000;
        },

        update: function (time, delta)
        {
            this.lifespan -= delta;

            this.x += this.dx * (this.speed * delta);
            this.y += this.dy * (this.speed * delta);

            if (this.lifespan <= 0)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });
 
function create() {
    keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.add.image(640, 384, 'mapa');
    vides = 3;//vida
    var cor1 = this.add.image(1120, 25, 'vida');//vida
    var cor2 = this.add.image(1180, 25, 'vida');//vida
    var cor3 = this.add.image(1240, 25, 'vida');//vida
    cor1.setScale(0.04); //vida
    cor2.setScale(0.04);//vida
    cor3.setScale(0.04);//vida
    var monedes = this.add.image(885, 25, 'moneda');
    monedes.setScale(0.7);
    var graphics = this.add.graphics();    
    drawLines(graphics);
    path = this.add.path(-112, 416);
    path.lineTo(288, 416);
    path.lineTo(288, 160);
    path.lineTo(608, 160);
    path.lineTo(608, 480); 
    path.lineTo(480, 480); 
    path.lineTo(480, 672);  
    path.lineTo(992, 672);
    path.lineTo(992, 352);
    path.lineTo(864, 352);
    path.lineTo(864, 96);
    path.lineTo(1328, 96);
    path.draw(graphics);

    txt = this.add.text(900, 10, diners, { fontSize: '32px', fill: '#000' });
    
    enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    
    turrets = this.add.group({ classType: Turret, runChildUpdate: true });
    
    bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    
    this.nextEnemy = 0;
    
    this.physics.add.overlap(enemies, bullets, damageEnemy);
    
    this.input.on('pointerdown', placeTurret);
}

function damageEnemy(enemy, bullet) {  
    if (enemy.active === true && bullet.active === true) {
        bullet.setActive(false);
        bullet.setVisible(false);    
        
        enemy.receiveDamage(BULLET_DAMAGE);
    }
}

function drawLines(graphics) {
    graphics.lineStyle(1, 0x0000ff, 0);
    for(var i = 0; i < 16; i++) {
        graphics.moveTo(0, i * 64);
        //graphics.lineTo(1280, i * 64);
    }
    for(var j = 0; j < 20; j++) {
        graphics.moveTo(j * 64, 0);
        //graphics.lineTo(j * 64, 768);
    }
    graphics.strokePath();
}
function enemicarrivaFi(enemy){//vida//vida
/*     if(this.enemy.x == 1328 && this.enemy.y ==96 ){
        vides-=1;
    } */
    if(vides==0){//vida//vida
        return true;//vida
    }
}//vida

var enemyRate = 2000;
function update(time, delta) {
    txt.setText(diners);
    if (Phaser.Input.Keyboard.JustDown(keyP)) {
        if(!pausat) {
            pausat = !pausat;
            this.scene.pause();
        }
    }
    if(enemicarrivaFi(enemy)){//vida
        this.scene.pause();//vida
        
    }
    if (time > this.nextEnemy)
    {
        var enemy = enemies.get();
        if (enemy)
        {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.startOnPath();
            this.nextEnemy = time + enemyRate;
            if(enemyRate > 200) enemyRate *= 0.97; // disminueix el temps entre enemics
            enemy.initialHp += enemy.hpIncrease; // augment progressiu de la vida dels enemics
        }       
    }
}

function canPlaceTurret(i, j) {
    return map[i][j] === 0;
}

function placeTurret(pointer) {
    var i = Math.floor(pointer.y/64);
    var j = Math.floor(pointer.x/64);
    if(canPlaceTurret(i, j) && diners>=100) {
        var turret = turrets.get();
        if (turret)
        {
            turret.setActive(true);
            turret.setVisible(true);
            turret.place(i, j);
            diners-=100;
        }   
    }
}

function addBullet(x, y, angle) {
    var bullet = bullets.get();
    if (bullet)
    {
        bullet.fire(x, y, angle);
    }
}