(function () {
    window.GAME = {
        objects: [],
        start,
        mainMenu: () => {
            document.querySelectorAll('.ui').forEach(element => {
                element.classList.add('hidden')
            })
            document.getElementById('main-menu').classList.remove('hidden')
        },
        showAbout: () => {
            document.querySelectorAll('.ui').forEach(element => {
                element.classList.add('hidden')
            })
            document.getElementById('about').classList.remove('hidden')
        }
    }
    let timeoutsToCleanOnDestroy = []

    const platformLevelHeight = 100;
    const platformLevels = 6;

    function start () {
        let currentLevel = 0;

        function getTimeoutMs () {
            return 4000 - (speed * 5)
        }


        if (window.GAME.currentGame) {
            timeoutsToCleanOnDestroy.forEach(clearTimeout)
            window.GAME.currentGame.destroy(true)
            window.GAME.currentGame = null
        }

        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 2200 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        const game = new Phaser.Game(config);
        window.GAME.currentGame = game
        window.GAME.gameOver = () => {
            if (backgroundMusic) {
                backgroundMusic.stop();
            }
            game.pause();
            document.getElementById('main-menu').classList.remove('hidden')

        }
        const backgrounds = [];
        let ground;
        let player;
        let spaceBar;
        let speed = 20;
        let backgroundMusic;
        const platforms = []

        const playerStatus = {
            inSecondJump: false,
            currentLevel: 0
        }

        function preload() {
            this.load.image('background_0', 'assets/background_0.jpg');
            this.load.image('background_1', 'assets/background_1.png');
            this.load.image('background_2', 'assets/background_2.png');
            this.load.spritesheet('player', 'assets/player-jump.png', { frameWidth: 40, frameHeight: 40 });
            this.load.image('ground', 'assets/ground.png');
            this.load.audio('background_music', 'assets/background_music.mp3');
        }

        function create() {
            // this.scene.pause()
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


            player = this.physics.add.sprite(200, 538, 'player');
            player.body.setFriction(0, 0);
            player.setBodySize(32, 32)
            player.setBounce(0);
            player.setCollideWorldBounds(true);
            player.name = 'player'
            // this.physics.add.collider(player, ground);
            this.physics.add.collider(player, ground, (player, ground) => {
                playerStatus.inSecondJump = false
                playerStatus.currentLevel = 0
            });


            spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            const addPlatform = () => {
                if (Math.random() < .05) {
                    timeoutsToCleanOnDestroy.push(setTimeout(addPlatform, getTimeoutMs()))
                    return
                }
                const playerLevel = playerStatus.currentLevel || 0
                const rand = 3 * (Math.random() - 0.5)
                let platformLevel = playerLevel + Math.floor(rand)
                platformLevel = platformLevel < 0 ? 0: platformLevel;
                const y = 600 - (platformLevel * platformLevelHeight) - 48
                const platform = this.physics.add.sprite( 1200, y, 'ground');
                platform.setImmovable(true);
                platform.body.allowGravity = false;
                platform.setVelocityX(-20*speed)
                platform.displayWidth = 300;
                platform.body.setFriction(0, 0);
                // platform.body.setSize(300, platform.displayHeight); // Ajustar el cuerpo de colisión
                this.physics.add.collider(player, platform, () => {
                    if (player.body.touching.right) {
                        GAME.gameOver()
                        return
                    }
                    if (player.body.touching.down) {
                        playerStatus.currentLevel = platformLevel
                        playerStatus.inSecondJump = false
                    }
                });

                platforms.push(platform)


                timeoutsToCleanOnDestroy.push(setTimeout(addPlatform, getTimeoutMs()))
            }
            addPlatform()

            document.getElementById('main-menu').classList.add('hidden')

            backgroundMusic = this.sound.add('background_music');
            backgroundMusic.play({ loop: true });

            this.anims.create({
                key: 'rotate',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 25,
                repeat: 1
            });
        }

        function update() {
            moveBackgrounds()
            player.setVelocityX(0);

            if (spaceBar.isDown && !playerStatus.jumpBlocked && !playerStatus.inSecondJump) {
                playerStatus.jumpBlocked = true
                if (!player.body.touching.down) {
                    playerStatus.inSecondJump = true
                }
                player.setVelocityY(-800);

                setTimeout(() => {
                    playerStatus.jumpBlocked = false
                }, 300)

                player.anims.play('rotate');
            }
        }

        function moveBackgrounds () {
            for (let i = 0; i < backgrounds.length; i++) {
                const background = backgrounds[i]
                background.tile.tilePositionX += background.speedFactor * speed;
            }
        }
    }
})()
