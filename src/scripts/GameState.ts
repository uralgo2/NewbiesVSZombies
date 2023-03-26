import {Defender} from "./Logic/Entities/Defender";
import {Enemy} from "./Logic/Entities/Enemy";
import BackgroundScene from "../scenes/BackgroundScene";
import {Page} from "../page";

class Obstacle {
}

export class GameState {
    public defenders: Set<Defender> = new Set<Defender>()
    public enemies: Set<Enemy> = new Set<Enemy>()
    public enemiesPool: Set<Enemy> = new Set<Enemy>()
    public obstacles: Set<Obstacle> = new Set<Obstacle>()
    private _money: number = 0
    public isActive: boolean = false
    public isLost: boolean = false
    public game: Phaser.Game | undefined
    public ZombieNewbieTexture: string = 'zombie-newbie-1'
    public get Money() {
        return this._money
    }
    public set Money(value: number){
        this._money = value


        const ui = document.querySelector('.ui')!
        const moneyText = ui.querySelector('#money_text')!
        moneyText.textContent = value.toString()
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
        this.game?.scene.add('background', BackgroundScene, true)
        this.Money = 0
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