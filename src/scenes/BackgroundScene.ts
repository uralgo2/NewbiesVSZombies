import Phaser from 'phaser';
import {Defender} from "../scripts/Logic/Entities/Defender";
import {Carbine} from "../scripts/Logic/Weapons/Carbine";
import {Enemy} from "../scripts/Logic/Entities/Enemy";
import {GameState} from "../scripts/GameState";

const MAX_NEWBIE_ZOMBIE_HP = 32
export default class BackgroundScene extends Phaser.Scene {
  private shootSound: Phaser.Sound.BaseSound | undefined
  constructor() {
    super('background');
  }

  preload() {
    this.load.aseprite('newbie', 'assets/newbie.png', 'assets/newbie.json')
    this.load.aseprite('gun_0', 'assets/gun_0.png', 'assets/gun_0.json')

    this.load.image('background', 'assets/background.png');

    this.load.audio('gun-gunshot-01', 'assets/sounds/gun-gunshot-01.mp3')
    this.load.audio('gun-gunshot-02', 'assets/sounds/gun-gunshot-02.mp3')
    this.load.audio('gun-reload', 'assets/sounds/gun-cocking-03.mp3')
  }

  create() {
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

    this.events.once('destroy', function (){
      console.log(arguments)
      defender.destroy(true)
      GameState.instance.defenders.clear()
    })
  }

}
