import Phaser, {Game} from 'phaser';
import {Defender} from "../scripts/Logic/Entities/Defender";
import {Carbine} from "../scripts/Logic/Weapons/Carbine";
import {Enemy} from "../scripts/Logic/Entities/Enemy";
import {GameState} from "../scripts/GameState";
import Utils from "../scripts/Utils";
import {Waves} from "../scripts/Logic/Waves/Waves";
import {Wave} from "../scripts/Logic/Waves/Wave";

const MAX_NEWBIE_ZOMBIE_HP = 32



export default class Main extends Phaser.Scene {
  private isFire = false
  private zombieHP = MAX_NEWBIE_ZOMBIE_HP
  private shootSound: Phaser.Sound.BaseSound | undefined
  public enemies: Set<Enemy> = new Set<Enemy>()
  public waves = new Waves(this)
  constructor() {
    super('main');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('zombie-newbie-3', 'assets/zombie-newbie3.png', 'assets/zombie-newbie3.json')
    this.load.aseprite('zombie-newbie-2', 'assets/zombie-newbie2.png', 'assets/zombie-newbie2.json')
    this.load.aseprite('zombie-newbie-1', 'assets/zombie-newbie.png', 'assets/zombie-newbie.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')
    this.load.aseprite('coin', 'assets/coin.png', 'assets/coin.json')

    this.load.image('background', 'assets/background.png');

    this.load.audio('gun-gunshot-01', 'assets/sounds/gun-gunshot-01.mp3')
    this.load.audio('gun-gunshot-02', 'assets/sounds/gun-gunshot-02.mp3')
    this.load.audio('gun-reload', 'assets/sounds/gun-cocking-03.mp3')
    this.load.audio('hit', 'assets/sounds/hit.mp3')
    this.load.audio('zombie-death', 'assets/sounds/zombie-death.mp3')
    this.load.audio('zombie-hit', 'assets/sounds/zombie-hurt.mp3')

    this.load.json('wave1', 'assets/waves/wave01.json')
    this.load.json('wave2', 'assets/waves/wave02.json')
    this.load.json('wave3', 'assets/waves/wave03.json')
  }

  private gameState = GameState.instance;

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
    this.anims.createFromAseprite('coin')

    this.gameState.CoinAnimation = this.anims.get('CoinSpin')
    this.gameState.CoinParticlesTarget = this.add.rectangle(0, 0)
    this.gameState.CoinParticles = this.add.particles('coin').setDepth(10000)

    this.sound.add('gun-gunshot-01', {
      loop: false,
    })
    this.sound.add('gun-reload', {
      loop: false,
    })
    this.sound.add('hit', {
      loop: false,
    })
    this.sound.add('zombie-death', {
      loop: false,
    })
    this.sound.add('zombie-hit', {
      loop: false,
    })

    const defender = new Defender(this, 16, 98, 'newbie', new Carbine(this, 0, 0))

    defender.Shoot()
    defender.setInteractive()
    defender.setScale(5)

    this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
      if(e.key !== ' ') return


    })

    const waveBtn = document.querySelector('#wave-start-button')! as HTMLButtonElement
    // @ts-ignore
    window['startWave'] = () => {
      if (this.waves.currentWave && !this.waves.currentWave.isEnded) return

      if(!this.waves.next()) {
        this.waves.startInfinityGame()
      }
    }

    this.events.on('wave-start', (wave: Wave) => {
      waveBtn.disabled = true
      waveBtn.textContent = `Волна: ${wave.id}`
    })

    this.events.on('infinity-game-start', (wave: Wave) => {
      waveBtn.classList.remove('inf-game')
      waveBtn.disabled = true
      waveBtn.textContent = `Бесконечная игра`
    })

    this.events.on('wave-end', (wave: Wave) => {
      waveBtn.disabled = false
      if(this.waves.hasNext()) {
        waveBtn.textContent = 'Начать волну'
      }
      else {
        waveBtn.classList.add('inf-game')
        waveBtn.textContent = 'Начать бесконечную игру'
      }
    })


    const background = this.add.image(0, 200, 'background')

    background.depth = 0

    background.setOrigin(0)
    background.setScale(10)

    this.resize()
    this.scale.on('resize', () => {
      this.resize();

    });

    this.events.once('destroy', () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)

    })

    this.waves.loadWave('wave1')
    this.waves.loadWave('wave2')
    this.waves.loadWave('wave3')
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
