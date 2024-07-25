(function () {
    window.GAME = {
        objects: []
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    setInterval(() => {
        speed += .2;
    }, 500)

    const game = new Phaser.Game(config);
    let background;
    let ground;
    let player;
    let spaceBar;
    let speed = 0.1;

    function preload() {
        this.load.image('sky', 'assets/sky.png');
        // this.load.image('sky', 'assets/Fondo_noche.ase');
        this.load.image('player', 'assets/player.png');  // Asegúrate de tener esta imagen en la carpeta assets
        this.load.image('ground', 'assets/player.png');  // Asegúrate de tener esta imagen en la carpeta assets

    }

    function create() {
        background = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'sky');
        background.setOrigin(0, 0);
        background.setScrollFactor(0);

//        grown = this.physics.add.staticImage(0, 568, 'platform').setScale(2).refreshBody();
        ground = this.add.tileSprite(0, this.sys.canvas.height - 32, this.sys.canvas.width, 32, 'ground');
        ground.setOrigin(0, 0);
        this.physics.add.existing(ground, true);


        player = this.physics.add.sprite(200, 538, 'player');
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);


        spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    }

    function update() {
        background.tilePositionX += speed;

        player.setVelocityX(0);

        console.log(`${JSON.stringify(player.body.touching)}`)
        if (spaceBar.isDown && player.body.touching.down) {
            console.log('ey')
            player.setVelocityY(-330);  // Ajusta el valor para cambiar la altura del salto
        }
    }
})()
