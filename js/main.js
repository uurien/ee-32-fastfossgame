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
                gravity: { y: 1200 },
                debug: true
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    //
    // setInterval(() => {
    //     speed += .2;
    // }, 5000)

    const game = new Phaser.Game(config);
    const backgrounds = [];
    let ground;
    let player;
    let spaceBar;
    let speed = 10;
    const platforms = []
    function preload() {
        this.load.image('background_0', 'assets/background_0.jpg');
        this.load.image('background_1', 'assets/background_1.png');
        this.load.image('background_2', 'assets/background_2.png');
        // this.load.image('sky', 'assets/Fondo_noche.ase');
        this.load.image('player', 'assets/player.png');  // Asegúrate de tener esta imagen en la carpeta assets
        this.load.image('ground', 'assets/ground.png');  // Asegúrate de tener esta imagen en la carpeta assets

    }

    function create() {
        let background = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'background_0');
        background.setOrigin(0, 0);
        background.setScrollFactor(0);
        backgrounds.push({
            tile: background,
            speedFactor: 0.01
        })
        let background1 = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'background_1');
        background1.setOrigin(0, 0);
        background1.setScrollFactor(0);
        backgrounds.push({
            tile: background1,
            speedFactor: 0.03
        })
        let background2 = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'background_2');
        background2.setOrigin(0, 0);
        background2.setScrollFactor(0);
        backgrounds.push({
            tile: background2,
            speedFactor: 0.06
        })

//        grown = this.physics.add.staticImage(0, 568, 'platform').setScale(2).refreshBody();
        ground = this.add.tileSprite(0, this.sys.canvas.height - 32, this.sys.canvas.width, 32, 'ground');
        ground.setOrigin(0, 0);
        this.physics.add.existing(ground, true);


        player = this.physics.add.sprite(200, 238, 'player');
        player.body.setFriction(0, 0);
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, ground);


        spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const addPlatform = () => {
            const platform = this.physics.add.sprite( 1200, 500, 'ground');
            platform.setImmovable(true);
            platform.body.allowGravity = false;
            platform.setVelocityX(-200)
            platform.displayWidth = 300;
            platform.body.setFriction(0, 0);
            // platform.body.setSize(300, platform.displayHeight); // Ajustar el cuerpo de colisión
            this.physics.add.collider(player, platform);

            platforms.push(platform)
        }
        addPlatform()
        setInterval(addPlatform, 5_000)

    }

    function update() {
        moveBackgrounds()
        // for (let i = 0; i < platforms.length; i++) {
        //     const platform = platforms[i]
        //     // console.log(platform.tilePositionX)
        //     // platform.tilePositionX += speed;
        // }
        player.setVelocityX(0);

        if (spaceBar.isDown && player.body.touching.down) {
            console.log('ey')
            player.setVelocityY(-530);  // Ajusta el valor para cambiar la altura del salto
        }
    }

    function moveBackgrounds () {
        for (let i = 0; i < backgrounds.length; i++) {
            const background = backgrounds[i]
            background.tile.tilePositionX += background.speedFactor * speed;
        }
    }
})()
