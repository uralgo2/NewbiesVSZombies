import Phaser, {Game} from 'phaser';
import {Defender} from "../Defender";
import {Carbine} from "../weapons/Carbine";
import {Enemy} from "../Enemy";
import {GameState} from "../GameState";

const MAX_NEWBIE_ZOMBIE_HP = 32

export function between (num: number, x: number, y: number) {
  return Math.min(y, Math.max(x, num))
}

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
    this.load.aseprite('zombie-newbie', 'assets/zombie-newbie3.png', 'assets/zombie-newbie3.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')

    this.load.image('background', 'assets/background.png');

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
          between(this.input.activePointer.x-16*5, 0, 300),
          between(this.input.activePointer.y-16*5, 98, 550),
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

  let difficult = 5000;
    const spawn = () => {
      if(document.hasFocus()) {
        difficult *= 0.95
        difficult = between(difficult, 800, 5000)

        const enemy = new Enemy(this, 1280, between(Math.random() * 720 - 16 * 5, 98, 550), 'zombie-newbie')
        enemy.setScale(5)
      }
      setTimeout(spawn, difficult)
    }

    spawn()
    this.resize()
    this.scale.on('resize', () => {
      this.resize();

    });
  }

  private resize() {
    const canvas = document.querySelector('#game canvas') as HTMLCanvasElement
    const offsetLeft = canvas.style.marginLeft
    const offsetTop = canvas.style.marginTop

    const ui = document.querySelector('.ui') as HTMLElement

    ui.style.paddingLeft = offsetLeft
    ui.style.paddingTop = offsetTop
  }
}
