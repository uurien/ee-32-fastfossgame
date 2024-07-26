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

    function playerPlatformColliderCallback (self, player, playerStatus) {
        if (player.body.touching.right) {
            GAME.gameOver()
            return
        }
        if (player.body.touching.down) {
            playerStatus.inSecondJump = false
        }
    }

    function createPlatform (self, playerSprite, playerStatus, speed, level, x = 1150) {
        const width = 300
        const y = 600 - (level * platformLevelHeight) - 48

        const platform = self.physics.add.sprite( x, y, 'ground');
        platform.setImmovable(true);
        platform.body.allowGravity = false;
        platform.setVelocity(-20 * speed, 0)
        platform.displayWidth = width;
        platform.body.setFriction(0, 0);


        self.physics.add.collider(playerSprite, platform, () => {
            playerPlatformColliderCallback(self, playerSprite, playerStatus)
        });

        return platform;
    }

    function createAlien (self, playerSprite, playerStatus, speed, level, x = 1150) {
        const y = 600 - (level * platformLevelHeight) - 80
        const deltaX = Math.floor(50 + (Math.random() * 100))
        const deltaY = Math.floor(Math.random() * 70)
        const alien = self.physics.add.sprite(x + deltaX, y - deltaY, 'alien');
        alien.body.allowGravity = false;
        alien.setVelocityX(-22 * speed)
        // platform.displayWidth = width;
        alien.body.setFriction(0, 0);
        alien.anims.play('alienmovement')

        self.physics.add.collider(playerSprite, alien, () => {
            GAME.gameOver()
        });

        return alien;
    }

    function createSpikes (self, playerSprite, playerStatus, speed, level, x = 1150) {
        const width = 300
        const y = 600 - (level * platformLevelHeight) - 48

        const platform = self.physics.add.sprite( x, y, 'spike');
        platform.setImmovable(true);
        platform.body.allowGravity = false;
        platform.setVelocityX(-20 * speed, 0)
        platform.displayWidth = width;
        platform.displayHeight = 32;
        platform.body.setFriction(0, 0);


        self.physics.add.collider(playerSprite, platform, () => {
            GAME.gameOver()
        });

        return platform;
    }

    function createSection (self, sections, playerSprite, playerStatus, speed, previousSection) {
        const platforms = []
        let level
        const previousLevel = previousSection.level

        if (!previousLevel || previousLevel <= 1) {
            level = Math.random() < .5 ? previousLevel : previousLevel + 1;
        } else {
            const rand = Math.random();
            if (rand < (1/3)) {
                level = previousLevel - 1
            } else if (rand < (2/3)) {
                level = previousLevel
            } else {
                level = previousLevel + 1
            }
        }

        level = level > 4 ? 4 : level;
        const newX = previousSection.platforms[0].x + previousSection.platforms[0].displayWidth
        const platform = createPlatform(self, playerSprite, playerStatus, speed, level, newX)
        platforms.push(platform)

        const rand = Math.random()
        const hasSpikes = (previousSection.platforms.length > 0 && rand < .7) || rand < .4
        if (hasSpikes) {
            platforms.push(createSpikes(self, playerSprite, playerStatus, speed, 0, newX))
        }
        const section = { platforms, level }
        if (Math.random() < .4) {
            // TODO add marcianito
            const alien = createAlien(self, playerSprite, playerStatus, speed, level)
            section.aliens = [ alien ];
        }

        sections.push({ platforms, level })
    }

    function createFirstSection (self, sections, playerSprite, playerStatus, speed) {
        const platforms = []
        const platform = createPlatform(self, playerSprite, playerStatus, speed, 1, 1200)
        const spikes = createSpikes(self, playerSprite, playerStatus, speed, 0, 1200)

        platforms.push(platform)
        platforms.push(spikes)

        sections.push({ platforms, level: 1 })
    }

    function getFirstSectionRightPoint (sections) {
        const platform = sections[0].platforms[0]
        return platform.x + platform.displayWidth
    }

    function getLastSectionRightPoint (sections) {
        const platform = sections[sections.length - 1].platforms[0]
        return platform.x + platform.displayWidth
    }

    function updatePlatforms (self, playerSprite, playerStatus, sections, speed) {
       while (sections.length > 0 && getFirstSectionRightPoint(sections) < 0) {
           const section = sections.shift();
           section.platforms.forEach(platform => platform.destroy())
           section.aliens?.forEach(alien => alien.destroy())
       }

       while (sections.length > 0 && getLastSectionRightPoint(sections) < 1200) {
           createSection(self, sections, playerSprite, playerStatus, speed, sections[sections.length - 1])
       }
    }

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
            render: {
                antialias: true,
                roundPixels: true
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
        const sections = []

        const playerStatus = {
            inSecondJump: false,
            currentLevel: 0
        }

        function preload() {
            this.load.image('background_0', 'assets/background_0.jpg');
            this.load.image('background_1', 'assets/background_1.png');
            this.load.image('background_2', 'assets/background_2.png');
            this.load.image('spike', 'assets/spike.png');
            this.load.spritesheet('player', 'assets/player-jump.png', { frameWidth: 40, frameHeight: 40 });
            this.load.spritesheet('alien', 'assets/alien.png', { frameWidth: 27, frameHeight: 29 });
            this.load.image('ground', 'assets/ground.png');
            this.load.audio('background_music', 'assets/background_music.mp3');
        }

        function create() {
            this.physics.world.roundPixels = true;

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

            ground = this.add.tileSprite(0, this.sys.canvas.height - 32, this.sys.canvas.width, 32, 'ground');
            ground.setOrigin(0, 0);
            this.physics.add.existing(ground, true);


            player = this.physics.add.sprite(200, 538, 'player');
            player.body.setFriction(0, 0);
            player.setBodySize(32, 32)
            player.setBounce(0);
            // player.setCollideWorldBounds(true);
            player.name = 'player'
            // this.physics.add.collider(player, ground);
            this.physics.add.collider(player, ground, (player, ground) => {
                playerStatus.inSecondJump = false
                playerStatus.currentLevel = 0
            });


            spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            createFirstSection(this, sections, player, playerStatus, speed)

            document.getElementById('main-menu').classList.add('hidden')

            backgroundMusic = this.sound.add('background_music');
            backgroundMusic.play({ loop: true });

            this.anims.create({
                key: 'rotate',
                frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
                frameRate: 25,
                repeat: 1
            });

            this.anims.create({
                key: 'alienmovement',
                frames: this.anims.generateFrameNumbers('alien', { start: 0, end: 1 }),
                frameRate: 3,
                repeat: -1
            });
        }

        function syncSections (self, sections) {
            for (let i = 1; i < sections.length; i++) {
                const prevSection = sections[i-1]
                const section = sections[i]
                const prevPlatform = prevSection.platforms[0]
                section.platforms.forEach(platform => {
                    platform.x = prevPlatform.x + prevPlatform.displayWidth
                })
            }
        }

        function update() {
            moveBackgrounds()
            updatePlatforms(this,  player, playerStatus, sections, speed)
            syncSections(this, sections)

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
