import {start} from '/src/index.ts'
import {GameState} from "./GameState";
import Main from "./scenes/Game";

YaGames.init({
    orientation: {
        value: 'landscape',
        lock: true
    }
}).then(ysdk => {
    const menu = document.querySelector('.menu')
    const startBtn = menu.querySelector('.start')
    const loseMenu = document.querySelector('.lose.menu')
    const restartBtn = loseMenu.querySelector('.start')
    const ui = document.querySelector('.ui')
    start(ysdk)

    restartBtn.onclick = () => {
        loseMenu.classList.add('hidden')
        ui.classList.remove('hidden')
        const gameState = GameState.instance;
        gameState.isActive = true
        gameState.game.scene.remove('background')
        gameState.game.scene.add('main', Main, true)
    }

    startBtn.onclick = () => {
        menu.classList.add('hidden')
        ui.classList.remove('hidden')
        const gameState = GameState.instance;
        gameState.isActive = true
        gameState.game.scene.remove('background')
        gameState.game.scene.run('main')
    }
});