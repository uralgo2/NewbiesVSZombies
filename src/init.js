import {start} from '/src/index.ts'
import {GameState} from "./scripts/GameState";
import Main from "./scenes/Game";
import {Page} from "./page";
import Phaser from "phaser";
import config from "./config";

YaGames.init({
    orientation: {
        value: 'landscape',
        lock: true
    }
}).then(ysdk => {
    Page.Init('#ui')

    start(ysdk)
});

window.navigateTo = function (to){
    if(to === -1)
        return Page.Back()
    Page.NavigateTo(to)
}

window.startGame = function (){
    GameState.instance.game.scene.add('main', Main, true)
    GameState.instance.game.canvas.classList.remove('hidden')
    Page.NavigateTo('inGameUI')
}

window.startupGame = function (){
    const game = GameState.instance.game = new Phaser.Game(
        Object.assign(config, {
            scene: [Main]
        })
    )
    Page.NavigateTo('inGameUI')
}

window.changeTexture = function (event){
    GameState.instance.ChangeTexture(event)
}