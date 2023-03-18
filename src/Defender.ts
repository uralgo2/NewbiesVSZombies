import {Weapon} from "./Weapon";
import Phaser from "phaser";
import Demo from "./scenes/Game";

export class Defender extends Phaser.GameObjects.Container {
    protected sprite: Phaser.GameObjects.Sprite
    protected weapon: Weapon
    protected healthPoints: number = 15
    protected maxHealthPoints: number = 20
    protected bar: Phaser.GameObjects.Graphics
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        weapon: Weapon
    ) {
        super(scene, x, y)

        this.sprite = scene.add.sprite(0, 0, texture)
            .setOrigin(0)
            .setScale(2)
        this.weapon = weapon
        weapon.x = 8
        weapon.y = 12

        this.x = x
        this.y = y
        this.bar = scene.add.graphics()


        this.sprite.addToUpdateList()
        this.weapon.addToUpdateList()
        this.bar.addToUpdateList()
        this.addToUpdateList()

        scene.add.existing(this)
        this.add([this.sprite, weapon, this.bar])


        this.redrawHealthBar()
        this.sprite.anims.play('Idle')
    }


    public Shoot(){
        if(this.weapon.AmmoCount === 0)
            return this.Reload()

        this.weapon.AmmoCount -= 1

        const intersect = Phaser.Geom.Intersects.LineToRectangle
        const line = new Phaser.Geom.Line(this.x+12*this.scale, this.y+12*this.scale, 1280, this.y+12*this.scale)

        for (const enemy of (this.scene as Demo).enemies) {
            const rect = new Phaser.Geom.Rectangle(enemy.x, enemy.y, 2, enemy.sprite.displayHeight*this.scale)
            const isIntersects = intersect(line, rect)
            if(isIntersects)
            {
                enemy.Damage(this.weapon.Damage)
                break
            }
        }

        this.sprite.anims.play({
            key: 'Fire',
        })

        this.weapon.setPosition(12, 4)
        this.weapon.once('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, go: Phaser.GameObjects.GameObject) => {
            this.weapon.anims.play('Gun_0_Idle')

            if(!this.weapon.AmmoCount) {
                this.sprite.anims.play({
                    key: 'Idle',
                    repeat: -1,
                    frameRate: 4,
                })

                this.weapon.setPosition(8, 12)
            }

            setTimeout(() => this.Shoot(), this.weapon.ShootDelay)
        })
        this.weapon.anims.play({
            key: 'Gun_0_Fire',
            frameRate: this.weapon.ShootDuration
        })
        this.weapon.ShootSound.play()
    }

    public Damage(delta: number){
        this.healthPoints -= delta
        this.redrawHealthBar()
    }
    public Reload(){
        this.weapon.ReloadSound.play()
        this.weapon.AmmoCount = this.weapon.AmmoCapacity
        setTimeout(() => this.Shoot(), this.weapon.ReloadDuration)
    }

    private redrawHealthBar() {
        this.bar.clear()

        this.bar.fillStyle(0xCCCCCC, 0.5)
        this.bar.fillRect(0, -8, 32, 4)

        this.bar.fillStyle(0x00FF00, 0.7)
        this.bar.fillRect(0, -8, (this.healthPoints/this.maxHealthPoints)*32, 4)
    }


    preUpdate(time: number, delta: number) {
    }
}