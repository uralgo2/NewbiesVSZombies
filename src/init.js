import {start} from '/src/index.ts'
import {GameState} from "./scripts/GameState";
import Main from "./scenes/Game";
import {Page} from "./page";

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
    GameState.instance.game.scene.remove('background')
    GameState.instance.game.scene.add('main', Main, true)
    Page.NavigateTo('inGameUI')
}

window.changeTexture = function (event){
    GameState.instance.ChangeTexture(event)
}

window.createDefender = function (event){
    console.log(event)
}