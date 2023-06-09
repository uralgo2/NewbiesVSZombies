import {Task, Wave, WaveData} from "./Wave";
import Phaser from "phaser";
import Utils from "../../Utils";
import {Enemy} from "../Entities/Enemy";
import {GameState} from "../../GameState";
import Main from "../../../scenes/Game";

export class Waves {
    protected waves: Map<string, Wave>
    protected wavesStack: Wave[] = []
    protected scene: Main
    public currentWave?: Wave
    public isInifnityGame = false

    constructor(scene: Main) {
        this.waves = new Map<string, Wave>()
        this.scene = scene
    }
    public next(){
        const wave = this.wavesStack.pop()

        if(!wave) return false

        GameState.instance.Score = 0
        this.currentWave = wave
        wave.start()

        return true
    }
    public hasNext(){
        return !!this.wavesStack.length
    }
    public get(id: string){
        return this.waves.get(id)
    }
    public loadWave(name: string){
        const waveData = this.scene.cache.json.get(name) as WaveData
        const wave = new Wave(this.scene, waveData.id, waveData.reward ?? 20)

        for (const enemyData of waveData.enemies) {
            const task: Task = {
                afterDeath: enemyData.spawn.afterDeath,
                count: enemyData.spawn.count ?? 1,
                enemy: enemyData.enemy,
                id: enemyData.id,
                onScore: enemyData.spawn.score,
                onTime: enemyData.spawn.time,
                y: enemyData.spawn.y,
                getScore: enemyData.getScore ?? 1,
                reward: enemyData.reward,
                delay: enemyData.spawn.delay,
                btwDelay: enemyData.spawn.btwDelay,
                scale: enemyData.scale
            }

            wave.addTask(task)
        }
        this.waves.set(waveData.id, wave)
        this.wavesStack.unshift(wave)
        return wave
    }

    public startInfinityGame() {
        this.isInifnityGame = true
        let difficult = 3000
        let score = 1
        let id = 0
        this.scene.events.emit('infinity-game-start', this)
        const spawn = () => {
            if (document.hasFocus()) {
                score += 1
                difficult *= 0.99
                difficult = Utils.Between(difficult, 500, 5000)

                const x = 1280
                const y = Utils.Between(Math.random() * 720 - 16 * 5, 98, 550)
                const tag = (id++).toString()

                const enemy =this.scene.enemies.add('zombie-newbie', x, y, tag)

                const hp = Math.round(Utils.Between(10 + (score / 10), 10, 40))

                //console.log(hp)
                enemy.setMaxHealth(hp)
                enemy.setScale(5)
            }
            setTimeout(spawn, difficult)
        }

        spawn()
    }

}