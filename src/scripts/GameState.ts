import {Defender} from "./Logic/Entities/Defender";
import {Enemy} from "./Logic/Entities/Enemy";
import BackgroundScene from "../scenes/BackgroundScene";
import {Page} from "../page";

class Obstacle {
}

export class GameState {
    public draggingDefender: Defender | null = null
    public defenders: Set<Defender> = new Set<Defender>()
    public enemies: Set<Enemy> = new Set<Enemy>()
    public enemiesPool: Set<Enemy> = new Set<Enemy>()
    public obstacles: Set<Obstacle> = new Set<Obstacle>()
    private _money: number = 0
    public isActive: boolean = false
    public isLost: boolean = false
    public game: Phaser.Game | undefined
    public ZombieNewbieTexture: string = 'zombie-newbie-1'
    public NewbiePriceModificator: number = 1.8
    private _newbieCost: number = 20
    public CoinAnimation: Phaser.Animations.Animation | null = null
    public CoinParticlesTarget: Phaser.GameObjects.GameObject | null = null
    public CoinParticles: Phaser.GameObjects.Particles.ParticleEmitterManager | null = null
    private _score: number = 0
    public YandexSDK: any
    public get Money() {
        return this._money
    }
    public get Score() {
        return this._score
    }
    public set Score(value) {
        this._score = value
        //console.log('score: ', value)
        this.game?.scene.getScene('main')
            .events.emit(`updateScore`, this._score)
    }
    public set Money(value: number){
        this._money = value


        const ui = document.querySelector('.ui')!
        const moneyText = ui.querySelector('#money_text')!
        moneyText.textContent = value.toString()
    }
    public get NewbieCost(){
        return this._newbieCost
    }
    public set NewbieCost(value: number){
        document.querySelector('#newbie-item .price')!.textContent
            = String(this._newbieCost = value)
    }
    private static _instance: GameState = new GameState()

    public static get instance(): GameState {
        return GameState._instance
    }

    public Save(): boolean {
        return true
    }

    public Load(): boolean {
        return true
    }

    LoseGame() {
        Page.NavigateTo('restartMenu')

        this.isLost = true
        this.enemies.clear()
        this.enemiesPool.clear()
        this.defenders.clear()
        this.game?.scene.remove('main')
        this.Money = 0
        this.NewbieCost = 20
        this.game?.canvas.classList.add('hidden')


        this.YandexSDK.adv.showFullscreenAdv({
            callbacks: {
                onClose: function(wasShown: any) {
                    // some action after close
                },
                onError: function(error: any) {
                    // some action on error
                }
            }
        })
    }

    NotEnoughMoney() {
        const ui = document.querySelector('.ui')!
        const notEnoughText = ui.querySelector('#not_enough_money_text')! as HTMLElement
        notEnoughText.classList.add('start-animation')
        notEnoughText.classList.remove('hidden')
        notEnoughText.onanimationend = () => {
            notEnoughText.classList.remove('start-animation')
            notEnoughText.classList.add('hidden')
        }
    }

    ChangeTexture(texture: string){

        this.ZombieNewbieTexture = texture
        for (const enemy of this.enemies) {
            enemy.Sprite.setTexture(texture)
        }
    }
}