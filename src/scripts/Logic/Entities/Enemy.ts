import Phaser from "phaser";
import {Defender} from "./Defender";
import Entity from "./Entity";
import Utils from "../../Utils";
import {Page} from "../../../page";
import {AnimatedParticle} from "../../AnimatedParticle";
import {GameState} from "../../GameState";
import Main from "../../../scenes/Game";

export interface EnemyData {
    knockBackProtection: number
    scale: number
    health: number
    name: string
    reward: number
    attackPower: number
    attackDelay: number
    speed: number
    texture: string
    deathSound: string
    hitSound: string
}

export class Enemy extends Entity {
    public isUnderAttack: boolean = false
    public AttackPower: number = 3
    public AttackDelay: number = 500
    public isAttack: boolean = false
    protected attackedDefender: Defender | null = null
    protected tag: string
    protected score: number
    protected reward?: number
    protected speed: number
    protected baseReward: number
    private knockable: boolean = true
    public knockBackProtection: number
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        tag: string,
        hitSound: string,
        deathSound: string,
        maxHealth: number,
        baseReward: number,
        speed: number = 0.1,
        score: number = 1,
        reward: number | undefined = undefined,
        scale: number = 5,
        knockBackProtection: number = 0
    ) {
        super(scene, x, y, texture, 0xFF0000, hitSound, deathSound, scale)

        this.knockBackProtection = knockBackProtection
        this.speed = speed
        this.score = score
        this.tag = tag
        this.reward = reward
        this.baseReward = baseReward
        this.Walk();

        this.Sprite.setInteractive()

        this.Sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, _1: number, _2: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            this.Damage(1, undefined!)
        })

        this.gameState.enemies.add(this)

        this.healthPoints = this.maxHealthPoints = maxHealth
    }

    protected Walk() {
        this.Sprite.anims.play({
            key: this.Sprite.texture.key + 'Walk',
            repeat: -1
        })
    }
    public Damage(delta: number, attacker: Entity) {
        if(!this.isUnderAttack && this.knockable && this.knockBackProtection !== 1) {
            this.isUnderAttack = true
            this.knockable = false

            const knockBackProtectionMod = Math.abs(this.knockBackProtection-1)
            const xVals = [this.x,Math.min(this.x + 2 * this.scale * knockBackProtectionMod, this.scene.scale.width-16*this.scale)]
            const yVals = [this.y, this.y - 4 * this.scale, this.y]

            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                ease: Phaser.Math.Easing.Sine.InOut,
                duration: 500,
                onUpdate: tween => {
                    if (this.IsDead) return tween.complete()

                    const v = tween.getValue()
                    const x = Phaser.Math.Interpolation.CatmullRom(xVals, v)
                    const y = Phaser.Math.Interpolation.CatmullRom(yVals, v)

                    this.setPosition(x, y)
                },
                onComplete: () => {
                    this.isUnderAttack = false
                    this.setPosition(this.x, yVals[0])
                    if(!this.IsDead)
                        this.scene.time.delayedCall(100, () => this.knockable = true)
                }
            })
        }

        super.Damage(delta, attacker);
    }

    preUpdate(time: number, delta: number) {
        if(this.isUnderAttack) return
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
        const directionY = target.y - 16*(5/this.scale-1) - this.y

        const magnitude = Math.sqrt(directionX**2 + directionY**2)

        this.x += (directionX / magnitude) * this.speed * delta
        this.y += (directionY / magnitude) * this.speed * delta

        this.depth = this.y + 32*this.scale

        if(Phaser.Geom.Intersects.RectangleToRectangle(target.Sprite.getBounds(), this.Sprite.getBounds())){
            this.Attack(target, true)
        }
    }

    protected Die() {

        this.gameState.enemies.delete(this)
        const reward = this.reward ?? 1 + Math.floor(this.baseReward * (this.scene as Main).waves.currentWave!.random());

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
        const xVals = [this.x+16*this.scale, 400, 200, to.x+5]
        const yVals = [this.y+16*this.scale, to.y+5]

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

            defender.Damage(this.AttackPower, this)
            setTimeout(() => this.Attack(defender), this.AttackDelay)
        })
        this.Sprite.anims?.play( this.Sprite.texture.key + 'Attack')
    }

    public setMaxHealth(number: number) {
        this.healthPoints = this.maxHealthPoints = number
    }

    static createFromDescription(
        enemyData: EnemyData,
        scene: Phaser.Scene,
        x: number,
        y: number,
        tag: string,
        score: number = 1,
        reward: number | undefined = undefined,
        scale: number | undefined = undefined
    ): Enemy {
        return new Enemy(
            scene,
            x,
            y,
            enemyData.texture,
            tag,
            enemyData.hitSound,
            enemyData.deathSound,
            enemyData.health,
            enemyData.reward,
            enemyData.speed,
            score,
            reward,
            scale ?? enemyData.scale,
           enemyData.knockBackProtection
        )
    }
}