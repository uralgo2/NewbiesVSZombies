import {Weapon} from "../Weapons/Weapon";
import Phaser from "phaser";
import Main from "../../../scenes/Game";
import {GameState} from "../../GameState";
import {Enemy} from "./Enemy";
import Utils from "../../Utils";
import Entity from "./Entity";

export class Defender extends Entity {
    protected weapon: Weapon
    public TimeToDetectEnemy: number = 1000
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        weapon: Weapon,
        scale: number = 5
    ) {
        super(scene, x, y, texture, 0x00FF00, 'hit', undefined, scale)

        this.weapon = weapon
        weapon.x = 8
        weapon.y = 12
        weapon.play('Gun_0_Idle')

        this.x = x
        this.y = y

        this.weapon.addToUpdateList()

        this.add(this.weapon)

        this.Sprite.anims.play('Idle')

        this.gameState.defenders.add(this)

        this.Sprite.setInteractive({draggable: true})

        scene.input.setDraggable(this.Sprite)
        this.Sprite.on('drag',  (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number)=> {

            this.x = Utils.Between(pointer.x - 16 * 5, -16*2.5, 480-16*5);
            this.y = Utils.Between(pointer.y - 16 * 5, 98, 720-16*5);
            this.depth = this.y + 32*this.scale
        });
    }

    public Idle(){
        this.Sprite.anims.play({
            key: 'Idle',
            repeat: -1,
            frameRate: 4,
        })

        this.weapon.setPosition(8, 12)
    }

    public Shoot(){
        if(this.IsDead) return
        if(this.weapon.AmmoCount === 0)
            return this.Reload()

        let has = false

        const halfHeight = this.Sprite.displayHeight*this.scale / 2
        for(let enemy of this.gameState.enemies){
            if(enemy.y >= this.y - halfHeight  && enemy.y <= this.y + halfHeight
            && enemy.x < this.scene.game.scale.width - enemy.Sprite.displayHeight*enemy.scale /2) {
                has = true
                break
            }
        }

        if(!has) return this.WaitForEnemies(true)

        this.weapon.AmmoCount -= 1

        const intersect = Phaser.Geom.Intersects.LineToRectangle
        const line = new Phaser.Geom.Line(this.x+12*this.scale, this.y+12*this.scale, 1280, this.y+12*this.scale)

        const enemisToShoot = []
        for (const enemy of this.gameState.enemies) {
            const rect = new Phaser.Geom.Rectangle(enemy.x, enemy.y, 2, enemy.Sprite.displayHeight*enemy.scale)
            const isIntersects = intersect(line, rect)
            if(isIntersects)
            {
                enemisToShoot.push(enemy)
            }
        }

        const closest = Utils.Closest(this as Entity, enemisToShoot.values())

        if(closest)
            (closest as Enemy).Damage(this.weapon.Damage, this)

        this.Sprite.anims.play({
            key: 'Fire',
        })

        this.weapon.setPosition(12, 4)
        this.weapon.once('animationcomplete', (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, go: Phaser.GameObjects.GameObject) => {
            this.weapon.anims.play('Gun_0_Idle')

            if(!this.weapon.AmmoCount) this.Idle()

            setTimeout(() => this.Shoot(), this.weapon.ShootDelay)
        })
        this.weapon.anims.play({
            key: 'Gun_0_Fire',
            frameRate: this.weapon.ShootDuration
        })
        this.weapon.ShootSound.play()
    }

    public Reload(){
        this.weapon.ReloadSound.play()
        this.weapon.AmmoCount = this.weapon.AmmoCapacity
        setTimeout(() => this.Shoot(), this.weapon.ReloadDuration)
    }

    preUpdate(time: number, delta: number) {
    }

    public WaitForEnemies(force: boolean = false) {
        if(force || !GameState.instance.enemies.size) {
            this.Idle()
            return setTimeout(() => this.WaitForEnemies(), this.TimeToDetectEnemy)
        }

        this.Shoot()
    }

    protected Die() {
        super.Die()

        this.gameState.defenders.delete(this)

        if(!this.gameState.defenders.size){
            this.gameState.LoseGame()
        }
    }
}