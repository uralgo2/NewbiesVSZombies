import Phaser, {Game} from 'phaser';
import {Defender} from "../scripts/Logic/Entities/Defender";
import {Carbine} from "../scripts/Logic/Weapons/Carbine";
import {Enemy} from "../scripts/Logic/Entities/Enemy";
import {GameState} from "../scripts/GameState";
import Utils from "../scripts/Utils";
import {Waves} from "../scripts/Logic/Waves/Waves";
import {Wave} from "../scripts/Logic/Waves/Wave";
import {EnemyFactory} from "../scripts/Logic/Factory/EnemyFactory";

const MAX_NEWBIE_ZOMBIE_HP = 32



export default class Main extends Phaser.Scene {
  private isFire = false
  private zombieHP = MAX_NEWBIE_ZOMBIE_HP
  private shootSound: Phaser.Sound.BaseSound | undefined
  public enemies: EnemyFactory = new EnemyFactory(this)
  public waves = new Waves(this)
  constructor() {
    super('main');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('zombie-newbie1', 'assets/zombie-newbie1.png', 'assets/zombie-newbie1.json')
    this.load.aseprite('zombie-newbie2', 'assets/zombie-newbie2.png', 'assets/zombie-newbie2.json')
    this.load.aseprite('zombie-newbie3', 'assets/zombie-newbie3.png', 'assets/zombie-newbie3.json')
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
    this.load.json('wave4', 'assets/waves/wave04.json')
    this.load.json('wave5', 'assets/waves/wave05.json')
    this.load.json('wave6', 'assets/waves/wave06.json')
    this.load.json('wave7', 'assets/waves/wave07.json')
    this.load.json('wave8', 'assets/waves/wave08.json')
    this.load.json('wave9', 'assets/waves/wave09.json')
    this.load.json('wave10', 'assets/waves/wave10.json')
    this.load.json('test', 'assets/waves/test.json')

    this.load.json('zombie-newbie', 'assets/enemies/zombie-newbie.json')
    this.load.json('zombie-newbie-baby', 'assets/enemies/zombie-newbie-baby.json')
    this.load.json('zombie-newbie-giant', 'assets/enemies/zombie-newbie-giant.json')
  }

  private gameState = GameState.instance;

  create() {
    this.waves.loadWave('test')
    this.waves.loadWave('wave1')
    this.waves.loadWave('wave2')
    this.waves.loadWave('wave3')
    this.waves.loadWave('wave4')
    this.waves.loadWave('wave5')
    this.waves.loadWave('wave6')
    this.waves.loadWave('wave7')
    this.waves.loadWave('wave8')
    this.waves.loadWave('wave9')
    this.waves.loadWave('wave10')

    this.enemies.addDescription('zombie-newbie')
    this.enemies.addDescription('zombie-newbie-baby')
    this.enemies.addDescription('zombie-newbie-giant')

    this.anims.createFromAseprite('zombie-newbie1')
    this.anims.createFromAseprite('zombie-newbie2')
    this.anims.createFromAseprite('zombie-newbie3')
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

    this.input.keyboard.on('keydown', (e: KeyboardEvent) => {
      if(e.key !== ' ') return


    })

    const waveBtn = document.querySelector('#wave-start-button')! as HTMLButtonElement

    waveBtn.disabled = false
    if(this.waves.hasNext()) {
      waveBtn.textContent = 'Начать волну'
    }
    else {
      waveBtn.classList.add('inf-game')
      waveBtn.textContent = 'Начать бесконечную игру'
    }

    // @ts-ignore
    window['startWave'] = () => {
      if (this.waves.currentWave && !this.waves.currentWave.isEnded) return

      if(!this.waves.next()) {
        this.waves.startInfinityGame()
      }
    }
    const background = this.add.image(0, 200, 'background')

    background.depth = 0

    background.setOrigin(0)
    background.setScale(10)

    this.resize()

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

    this.scale.on('resize', () => {
      this.resize();

    });

    this.events.once('destroy', () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)

    })

    const onBlur = this.onBlur.bind(this)
    const onFocus = this.onFocus.bind(this)

    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)
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
    const defenderPlacementArea = document.querySelector('#defenderPlacementArea')! as HTMLDivElement
    const { marginLeft, marginTop, width, height } = canvas.style
    const ui = document.querySelector('#inGameUI') as HTMLElement
    //@ts-ignore
    const { topBase, heightBase, widthBase } = defenderPlacementArea.style

    defenderPlacementArea.style.top = `calc(${topBase} * ${this.scale.displayScale.y})`
    defenderPlacementArea.style.height = `calc(${heightBase} * ${this.scale.displayScale.y})`
    defenderPlacementArea.style.width = `calc(${widthBase} * ${this.scale.displayScale.x})`


    ui.style.left = marginLeft
    ui.style.top = marginTop
    ui.style.width = width
    ui.style.height = height
  }
}
