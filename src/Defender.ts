import {Weapon} from "./Weapon";
import Phaser from "phaser";
import Main, {between} from "./scenes/Game";
import {GameState} from "./GameState";
import {Enemy} from "./Enemy";

export class Defender extends Phaser.GameObjects.Container {
    sprite: Phaser.GameObjects.Sprite
    protected weapon: Weapon
    protected healthPoints: number = 20
    protected maxHealthPoints: number = 20
    bar: Phaser.GameObjects.Graphics
    public TimeToDetectEnemy: number = 1000
    private gameState = GameState.instance
    public isDead: boolean = false
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        weapon: Weapon,
    ) {
        super(scene, x, y)

        this.sprite = scene.physics.add.sprite(0, 0, texture)
            .setOrigin(0)
            .setScale(2)
        this.weapon = weapon
        weapon.x = 8
        weapon.y = 12
        weapon.play('Gun_0_Idle')
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

        this.gameState.defenders.add(this)
        this.depth = this.y
        this.sprite.setInteractive({draggable: true})
        scene.input.setDraggable(this.sprite)
        this.sprite.on('drag',  (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number)=> {

            this.x = between(pointer.x - 16 * 5, 0, 300);
            this.depth = this.y = between(pointer.y - 16 * 5, 98, 550);

        });
    }

    public Idle(){
        this.sprite.anims.play({
            key: 'Idle',
            repeat: -1,
            frameRate: 4,
        })

        this.weapon.setPosition(8, 12)
    }

    public Shoot(){
        if(this.isDead) return
        if(this.weapon.AmmoCount === 0)
            return this.Reload()

        let has = false

        const halfHeight = this.sprite.displayHeight*this.scale / 2
        for(let enemy of this.gameState.enemies){
            if(enemy.y >= this.y - halfHeight  && enemy.y <= this.y + halfHeight
            && enemy.x < this.scene.game.scale.width - enemy.sprite.displayHeight*enemy.scale /2) {
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
            const rect = new Phaser.Geom.Rectangle(enemy.x, enemy.y, 2, enemy.sprite.displayHeight*enemy.scale)
            const isIntersects = intersect(line, rect)
            if(isIntersects)
            {
                enemisToShoot.push(enemy.sprite)
            }
        }

        const closest = this.scene.physics.closest(this.sprite, enemisToShoot) as Phaser.GameObjects.Sprite

        if(closest?.parentContainer)
            (closest?.parentContainer as Enemy).Damage(this.weapon.Damage)

        this.sprite.anims.play({
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

    public Damage(delta: number){
        this.healthPoints -= delta
        this.redrawHealthBar()
        console.log(this.healthPoints)
        if(this.healthPoints <= 0)
        {
            this.Die()
        }
    }
    public Reload(){
        this.weapon.ReloadSound.play()
        this.weapon.AmmoCount = this.weapon.AmmoCapacity
        setTimeout(() => this.Shoot(), this.weapon.ReloadDuration)
    }

    private redrawHealthBar() {
        this.bar.clear()

        if(this.healthPoints != this.maxHealthPoints) {
            this.bar.fillStyle(0xCCCCCC, 0.5)
            this.bar.fillRect(0, -8, 32, 4)

            this.bar.fillStyle(0x00FF00, 0.7)
            this.bar.fillRect(0, -8, (this.healthPoints / this.maxHealthPoints) * 32, 4)
        }
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

    private Die() {
        this.isDead = true
        this.destroy(true)
        this.gameState.defenders.delete(this)

        if(!this.gameState.defenders.size){
            this.gameState.LoseGame()
        }
    }
}