import Phaser from "phaser";
import {GameState} from "../../GameState";

export default class Entity extends Phaser.GameObjects.Container {
    public Sprite: Phaser.GameObjects.Sprite
    public IsDead: boolean = false
    protected healthPoints: number = 10
    protected maxHealthPoints: number = 10
    protected healthBarColor: number
    protected bar: Phaser.GameObjects.Graphics
    protected gameState = GameState.instance

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        healthBarColor: number = 0xFF0000
    ) {
        super(scene, x, y)
        this.healthBarColor = healthBarColor
        this.Sprite = scene.add.sprite(0, 0, texture)
            .setOrigin(0)
            .setScale(2)

        this.x = x
        this.y = y
        this.bar = scene.add.graphics()


        this.Sprite.addToUpdateList()
        this.bar.addToUpdateList()
        this.addToUpdateList()

        scene.add.existing(this)

        this.add([this.Sprite, this.bar])

        this.redrawHealthBar()
        this.depth = this.y
    }

    public Damage(delta: number){
        this.healthPoints -= delta
        this.redrawHealthBar()
        this.Sprite.setTint(0xFF6666)

        const prevHP = this.healthPoints

        setTimeout(() => {
            if(this.IsDead || this.healthPoints !== prevHP) return

            this.Sprite.clearTint()
        }, 200)
        if(this.healthPoints <=0) {
            this.Die();
        }
    }

    protected Die() {
        this.IsDead = true
        this.destroy(true)
    }
    protected redrawHealthBar() {
        this.bar.clear()

        if(this.healthPoints != this.maxHealthPoints) {
            this.bar.fillStyle(0xCCCCCC, 0.5)
            this.bar.fillRect(0, -8, 32, 4)

            this.bar.fillStyle(this.healthBarColor, 0.7)
            this.bar.fillRect(0, -8, (this.healthPoints / this.maxHealthPoints) * 32, 4)
        }
    }
}