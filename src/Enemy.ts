import {Weapon} from "./Weapon";
import Phaser from "phaser";
import Main from "./scenes/Game";
import {GameState} from "./GameState";
import {Defender} from "./Defender";
import CollisionStartEvent = Phaser.Physics.Matter.Events.CollisionStartEvent;
import {Body} from "matter";

export class Enemy extends Phaser.GameObjects.Container {
    sprite: Phaser.GameObjects.Sprite
    protected healthPoints: number = 10
    protected maxHealthPoints: number = 10
    protected bar: Phaser.GameObjects.Graphics
    private gameState = GameState.instance
    public AttackPower: number = 3
    public AttackDelay: number = 500
    public isAttack: boolean = false
    public isDead: boolean = false

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
    ) {
        super(scene, x, y)

        this.sprite = scene.physics.add.sprite(0, 0, texture)
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

        this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, _1: number, _2: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            this.Damage(1)
        })

        this.gameState.enemies.add(this)
        this.depth = this.y
    }

    public Damage(delta: number){
        this.healthPoints -= delta
        this.redrawHealthBar()

        if(this.healthPoints <=0) {
            this.Die();
        }
    }

    private Die() {
        this.isDead = true
        this.gameState.enemies.delete(this)
        this.destroy(true)

        this.gameState.Money += 1 + Math.floor(5 * Math.random())
    }

    private redrawHealthBar() {
        this.bar.clear()

        if(this.healthPoints != this.maxHealthPoints) {
            this.bar.fillStyle(0xCCCCCC, 0.5)
            this.bar.fillRect(0, -8, 32, 4)

            this.bar.fillStyle(0xFF0000, 0.7)
            this.bar.fillRect(0, -8, (this.healthPoints / this.maxHealthPoints) * 32, 4)
        }
    }

    preUpdate(time: number, delta: number) {
        if(this.isAttack) return;

        this.x -= 0.05 * delta

        for(const defender of GameState.instance.defenders){
            if(Phaser.Geom.Intersects.RectangleToRectangle(defender.sprite.getBounds(), this.sprite.getBounds())){
                this.Attack(defender)
                return
            }

        }

    }


    private Attack(defender: Defender) {
        this.isAttack = true
        this.sprite.once('animationcomplete', () => {
            if(defender.isDead || this.isDead) return;

            defender.Damage(this.AttackPower)
            setTimeout(() => this.Attack(defender), this.AttackDelay)
        })
        this.sprite.anims?.play('Attack')
    }
}