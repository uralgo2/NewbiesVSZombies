import {GameState} from "./scripts/GameState";
import {Defender} from "./scripts/Logic/Entities/Defender";
import {Carbine} from "./scripts/Logic/Weapons/Carbine";

export class Page {
    private static _m_history: string[] = []
    private static _m_currentRoute: string = 'mainMenu'
    private static DEFAULT_PATH: string = 'inGameUI'
    private static _m_root: HTMLElement
    public static GetDOMElementPoint(selector: string){
        const mainScene = GameState.instance.game?.scene.getScene('main')!

        const elem = document.querySelector(selector)! as HTMLElement

        const x = mainScene.scale.transformX(elem.getBoundingClientRect().x)
        const y = mainScene.scale.transformY(elem.getBoundingClientRect().y)
        return {x, y}
        //return {x: elem.getBoundingClientRect().x, y: elem.getBoundingClientRect().y}
    }
    public static Init(root: string){
        this._m_root = document.querySelector(root)!

        const dragImage = this._m_root.querySelector('#newbie-drag-image')! as HTMLImageElement

        const game = GameState.instance

        dragImage.ondragstart = (event) => {
            //const mainScene = game.game?.scene.getScene('main')!
            /*game.draggingDefender = new Defender(
                mainScene,
                event.x,
                event.y,
                'newbie',
                new Carbine(mainScene, 0, 0))
*/
            //game.draggingDefender.setScale(5)
        }

        function createDefender(x: number, y: number, mainScene: Phaser.Scene) {
            if (x > 380 || y < 98 || y > 550) return;
            if (game.Money < game.NewbieCost) {
                game.NotEnoughMoney()
                return
            }
            game.Money -= game.NewbieCost

            game.NewbieCost = Math.ceil(game.NewbieCost * game.NewbiePriceModificator)


            const defender = new Defender(
                mainScene,
                x - 16 * 5,
                y - 16 * 5,
                'newbie',
                new Carbine(mainScene, 0, 0))

            defender.setScale(5)
            defender.WaitForEnemies()
        }

        dragImage.ontouchend = (event) => {
            const mainScene = game.game?.scene.getScene('main')!
            const x = mainScene.scale.transformX(event.changedTouches.item(0)!.pageX)
            const y = mainScene.scale.transformY(event.changedTouches.item(0)!.pageY)

            createDefender(x, y, mainScene)

        }
        dragImage.ondragend = (event) => {
            const mainScene = game.game?.scene.getScene('main')!
            const x = mainScene.scale.transformX(event.pageX)
            const y = mainScene.scale.transformY(event.pageY)

            createDefender(x, y, mainScene)
        }
    }

    public static NavigateTo(to: string){
        this._m_history.push(this._m_currentRoute)

        this._m_currentRoute = to

        this.ReRender()
    }

    public static Back(){
        this._m_currentRoute = this._m_history.pop() || this.DEFAULT_PATH

        this.ReRender()
    }

    private static ReRender() {
        for (let child of this._m_root.children) {
            child.classList.add('hidden')
        }

        this._m_root.querySelector(`#${this._m_currentRoute}`)!
            .classList.remove('hidden')
    }
}