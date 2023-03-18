import {Weapon} from "./Weapon";
import Phaser from "phaser";
import Demo from "./scenes/Game";

export class Enemy extends Phaser.GameObjects.Container {
    sprite: Phaser.GameObjects.Sprite
    protected healthPoints: number = 20
    protected maxHealthPoints: number = 20
    protected bar: Phaser.GameObjects.Graphics
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
    ) {
        super(scene, x, y)

        this.sprite = scene.add.sprite(0, 0, texture)
            .setOrigin(0)
            .setScale(2)

        this.x = x
        this.y = y
        this.bar = scene.add.graphics()


        this.sprite.addToUpdateList()
        this.bar.addToUpdateList()
        this.addToUpdateList()

        scene.add.existing(this)

        this.add([this.sprite, this.bar])

        this.redrawHealthBar()
        this.sprite.anims.play({
            key:'Walk',
            repeat: -1
        })

        this.sprite.setInteractive()

        this.sprite.on('pointerdown', () => {
            this.Damage(1)
        })
    }

    public Damage(delta: number){
        this.healthPoints -= delta
        this.redrawHealthBar()

        if(this.healthPoints <=0) {
            this.removeFromUpdateList()
            this.removeFromDisplayList();
            (this.scene as Demo).enemies.delete(this)
        }
    }

    private redrawHealthBar() {
        this.bar.clear()

        this.bar.fillStyle(0xCCCCCC, 0.5)
        this.bar.fillRect(0, -8, 32, 4)

        this.bar.fillStyle(0xFF0000, 0.7)
        this.bar.fillRect(0, -8, (this.healthPoints/this.maxHealthPoints)*32, 4)

    }

    preUpdate(time: number, delta: number) {
       if(this.x > 200)
            this.x -= 0.05 * delta
    }


}