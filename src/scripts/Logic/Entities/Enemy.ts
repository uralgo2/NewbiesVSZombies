import Phaser from "phaser";
import {Defender} from "./Defender";
import Entity from "./Entity";
import Utils from "../../Utils";
import {Page} from "../../../page";
import {AnimatedParticle} from "../../AnimatedParticle";
import {GameState} from "../../GameState";
import Main from "../../../scenes/Game";

export class Enemy extends Entity {
    public AttackPower: number = 3
    public AttackDelay: number = 500
    public isAttack: boolean = false
    protected attackedDefender: Defender | null = null
    protected tag: string
    protected score: number
    protected reward?: number
    protected speed: number = 0.1

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        tag: string,
        score: number = 1,
        reward: number | undefined = undefined,
    ) {
        super(scene, x, y, texture, 0xFF0000, 'zombie-hit', 'zombie-death')

        this.score = score
        this.tag = tag
        this.reward = reward
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

        this.x += (directionX / magnitude) * this.speed * delta
        this.y += (directionY / magnitude) * this.speed * delta

        if(Phaser.Geom.Intersects.RectangleToRectangle(target.Sprite.getBounds(), this.Sprite.getBounds())){
            this.Attack(target, true)
        }
    }

    protected Die() {

        this.gameState.enemies.delete(this)
        const reward = this.reward ?? 1 + Math.floor(5 * (this.scene as Main).waves.currentWave!.random());

        this.gameState.Money += reward
        const particleEmitter = this.gameState.CoinParticles!.createEmitter({
            x: this.x+16*5,
            y: this.y+16*5,
            quantity: reward,
            speed: { random: [50, 100] },
            lifespan: { random: [0, 200]},
            scale: 4,
            //@ts-ignore
            particleClass: AnimatedParticle
        })

        const to = Page.GetDOMElementPoint('#coin_icon')
        const xVals = [this.x+16*5, 400, 200, to.x+5]
        const yVals = [this.y+16*5, to.y+5]

        const time = this.scene.time

        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            ease: Phaser.Math.Easing.Sine.InOut,
            duration: 1000*(this.x/700),
            onUpdate: tween => {
                const v = tween.getValue()
                const x = Phaser.Math.Interpolation.CatmullRom(xVals, v)
                const y = Phaser.Math.Interpolation.CatmullRom(yVals, v)

                particleEmitter.setPosition(x, y)
            },
            onComplete: () => {

                particleEmitter.setAlpha({start: 1, end: 0.0, ease: 'Linear'})
                particleEmitter.setSpeed({random: [200, 500]})
                particleEmitter.setLifespan({random: [500, 2000]})

                particleEmitter.explode(reward*5, to.x+5, to.y+5)

                time.delayedCall(2000, () => {
                    //particleEmitter.stop()
                    this.gameState.CoinParticles!.removeEmitter(particleEmitter)
                })
            }
        })
        this.scene.events.emit(`death#${this.tag}`)
        this.scene.events.emit(`death`, this)
        GameState.instance.Score += this.score
        super.Die();
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

    public setMaxHealth(number: number) {
        this.healthPoints = this.maxHealthPoints = number
    }
}