import {Weapon} from "../Weapons/Weapon";
import Phaser from "phaser";
import Main from "../../../scenes/Game";
import {GameState} from "../../GameState";
import {Defender} from "./Defender";
import CollisionStartEvent = Phaser.Physics.Matter.Events.CollisionStartEvent;
import {Body} from "matter";
import Entity from "./Entity";
import Utils from "../../Utils";

export class Enemy extends Entity {
    public AttackPower: number = 3
    public AttackDelay: number = 500
    public isAttack: boolean = false
    protected attackedDefender: Defender | null = null

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
    ) {
        super(scene, x, y, texture)

        this.Walk();

        this.Sprite.setInteractive()

        this.Sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, _1: number, _2: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            this.Damage(1)
        })

        this.gameState.enemies.add(this)

        this.healthPoints = this.maxHealthPoints = 10
    }

    protected Walk() {
        this.Sprite.anims.play({
            key: 'Walk',
            repeat: -1
        })
    }

    preUpdate(time: number, delta: number) {
        if(this.isAttack) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.attackedDefender!.Sprite.getBounds(), this.Sprite.getBounds()))
                return
            else {
                this.isAttack = false
                this.Walk()
            }
        }

        const target = Utils.Closest(this as Entity, this.gameState.defenders.values()) as Defender

        if(!target) return

        const directionX = target.x - this.x
        const directionY = target.y - this.y

        const magnitude = Math.sqrt(directionX**2 + directionY**2)

        this.x += directionX / magnitude
        this.y += directionY / magnitude

        if(Phaser.Geom.Intersects.RectangleToRectangle(target.Sprite.getBounds(), this.Sprite.getBounds())){
            this.Attack(target, true)
        }
    }

    protected Die() {
        super.Die();

        this.gameState.enemies.delete(this)
        this.gameState.Money += 1 + Math.floor(5 * Math.random())
    }

    private Attack(defender: Defender, force: boolean = false) {
        if(!force && !this.isAttack) return
        else this.isAttack = true

        this.attackedDefender = defender

        this.Sprite.once('animationcomplete', () => {
            if(this.IsDead || defender.IsDead) return this.isAttack = false

            defender.Damage(this.AttackPower)
            setTimeout(() => this.Attack(defender), this.AttackDelay)
        })
        this.Sprite.anims?.play('Attack')
    }
}