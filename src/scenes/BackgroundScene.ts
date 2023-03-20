import Phaser from 'phaser';
import {Defender} from "../Defender";
import {Carbine} from "../weapons/Carbine";
import {Enemy} from "../Enemy";
import {GameState} from "../GameState";

const MAX_NEWBIE_ZOMBIE_HP = 32
export default class BackgroundScene extends Phaser.Scene {
  private shootSound: Phaser.Sound.BaseSound | undefined
  constructor() {
    super('background');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('zombie-newbie', 'assets/zombie-newbie.png', 'assets/zombie-newbie.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')

    this.load.image('background', 'assets/background.png');

    this.load.audio('gun-gunshot-01', 'assets/sounds/gun-gunshot-01.mp3')
    this.load.audio('gun-gunshot-02', 'assets/sounds/gun-gunshot-02.mp3')
    this.load.audio('gun-reload', 'assets/sounds/gun-cocking-03.mp3')
  }

  create() {
    this.anims.createFromAseprite('zombie-newbie')
    this.anims.createFromAseprite('newbie')
    this.anims.createFromAseprite('gun_0')

    const defender = new Defender(this, 16, 120, 'newbie', new Carbine(this, 0, 0))

    this.shootSound = this.sound.add('gun-gunshot-01', {
      loop: false,
    })

    defender.Idle()
    defender.setScale(5)

    const background = this.add.image(0, 200, 'background')

    background.depth = 0

    background.setOrigin(0)
    background.setScale(10)

    defender.bar.clear()

    this.events.once('destroy', function (){
      console.log(arguments)
      defender.destroy(true)
      GameState.instance.defenders.clear()
    })
  }

}
