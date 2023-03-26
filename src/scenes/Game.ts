import Phaser, {Game} from 'phaser';
import {Defender} from "../scripts/Logic/Entities/Defender";
import {Carbine} from "../scripts/Logic/Weapons/Carbine";
import {Enemy} from "../scripts/Logic/Entities/Enemy";
import {GameState} from "../scripts/GameState";
import Utils from "../scripts/Utils";

const MAX_NEWBIE_ZOMBIE_HP = 32



export default class Main extends Phaser.Scene {
  private isFire = false
  private zombieHP = MAX_NEWBIE_ZOMBIE_HP
  private shootSound: Phaser.Sound.BaseSound | undefined
  public enemies: Set<Enemy> = new Set<Enemy>()
  constructor() {
    super('main');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('zombie-newbie-3', 'assets/zombie-newbie3.png', 'assets/zombie-newbie3.json')
    this.load.aseprite('zombie-newbie-2', 'assets/zombie-newbie2.png', 'assets/zombie-newbie2.json')
    this.load.aseprite('zombie-newbie-1', 'assets/zombie-newbie.png', 'assets/zombie-newbie.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')

    this.load.image('background', 'assets/background.png');

    this.load.audio('gun-gunshot-01', 'assets/sounds/gun-gunshot-01.mp3')
    this.load.audio('gun-gunshot-02', 'assets/sounds/gun-gunshot-02.mp3')
    this.load.audio('gun-reload', 'assets/sounds/gun-cocking-03.mp3')
  }

  create() {
    const onBlur = this.onBlur.bind(this)
    const onFocus = this.onFocus.bind(this)

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    this.anims.createFromAseprite('zombie-newbie-3')
    this.anims.createFromAseprite('zombie-newbie-2')
    this.anims.createFromAseprite('zombie-newbie-1')
    this.anims.createFromAseprite('newbie')
    this.anims.createFromAseprite('gun_0')

    const defender = new Defender(this, 16, 98, 'newbie', new Carbine(this, 0, 0))

    this.shootSound = this.sound.add('gun-gunshot-01', {
      loop: false,
    })
    defender.Shoot()
    defender.setInteractive()
    defender.setScale(5)

    this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
      if(e.key !== ' ') return
      if(GameState.instance.Money < 20) {
        GameState.instance.NotEnoughMoney()
        return
      }
      GameState.instance.Money -= 20

      const defender = new Defender(
          this,
          Utils.Between(this.input.activePointer.x-16*5, 0, 300),
          Utils.Between(this.input.activePointer.y-16*5, 98, 550),
          'newbie',
          new Carbine(this, 0, 0)
      )
      defender.WaitForEnemies()

      defender.setScale(5)
    })

    const background = this.add.image(0, 200, 'background')

    background.depth = 0

    background.setOrigin(0)
    background.setScale(10)

    console.log(GameState.instance)
  let difficult = 5000
    const spawn = () => {
      if(document.hasFocus()) {
        difficult *= 0.95
        difficult = Utils.Between(difficult, 800, 5000)

        const enemy = new Enemy(this, 1280, Utils.Between(Math.random() * 720 - 16 * 5, 98, 550), GameState.instance.ZombieNewbieTexture)

        enemy.setScale(5)
      }
      setTimeout(spawn, difficult)
    }

    spawn()
    this.resize()
    this.scale.on('resize', () => {
      this.resize();

    });

    this.events.once('destroy', () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)

    })
  }
  private onFocus() {
    console.log('focus')
    this.game.scene.run('main')
  }

  private onBlur() {
      console.log('blur')
      this.game.scene.pause('main')
  }

  private resize() {
    const canvas = document.querySelector('#game canvas') as HTMLCanvasElement
    const { marginLeft, marginTop, width, height } = canvas.style
    const ui = document.querySelector('#inGameUI') as HTMLElement

    ui.style.left = marginLeft
    ui.style.top = marginTop
    ui.style.width = width
    ui.style.height = height
  }
}
