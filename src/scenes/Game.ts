import Phaser from 'phaser';
import {Defender} from "../Defender";
import {Carbine} from "../weapons/Carbine";
import {Enemy} from "../Enemy";

const MAX_NEWBIE_ZOMBIE_HP = 32
export default class Demo extends Phaser.Scene {
  private isFire = false
  private zombieHP = MAX_NEWBIE_ZOMBIE_HP
  private shootSound: Phaser.Sound.BaseSound | undefined
  public enemies: Set<Enemy> = new Set<Enemy>()
  constructor() {
    super('main');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('zombie-newbie', 'assets/zombie-newbie.png', 'assets/zombie-newbie.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')

    this.load.audio('gun-gunshot-01', 'assets/sounds/gun-gunshot-01.mp3')
    this.load.audio('gun-gunshot-02', 'assets/sounds/gun-gunshot-02.mp3')
    this.load.audio('gun-reload', 'assets/sounds/gun-cocking-03.mp3')
  }

  create() {
    window.addEventListener('blur', () => {
      console.log('blur')
      this.game.scene.pause('main')
    })

    window.addEventListener('focus', () => {
      console.log('focus')
      this.game.scene.run('main')
    })

    this.anims.createFromAseprite('zombie-newbie')
    this.anims.createFromAseprite('newbie')
    this.anims.createFromAseprite('gun_0')

    const enemy = new Enemy(this, 600, 48, 'zombie-newbie')
    const defender = new Defender(this, 16, 48, 'newbie', new Carbine(this, 0, 0))

    this.shootSound = this.sound.add('gun-gunshot-01', {
      loop: false,
    })
    defender.Shoot()

    defender.setScale(5)
    enemy.setScale(5)

    this.enemies.add(enemy)
  }


  private fire(newbie: Phaser.GameObjects.Sprite, gun: Phaser.GameObjects.Sprite){
    this.isFire = true

    newbie.anims.play('Fire')

    gun.setPosition(28, 20)
    gun.once('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, go: Phaser.GameObjects.GameObject) => {
      newbie.anims.play({
        key: 'Idle',
        repeat: -1,
        frameRate: 4,
      })
      gun.anims.play('Gun_0_Idle')
      this.isFire = false

      gun.setPosition(24, 28)
    })
    gun.anims.play('Gun_0_Fire')
    this.shootSound!.play()


  }

  private redrawHealthBar(bar: Phaser.GameObjects.Graphics) {
    bar.fillStyle(0xCCCCCC)
    bar.fillRect(48, 8, 32, 4)

    bar.fillStyle(0xFF0000)
    bar.fillRect(48, 8, (this.zombieHP/MAX_NEWBIE_ZOMBIE_HP)*32, 4)

  }
}
