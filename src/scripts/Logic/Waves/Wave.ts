import {Enemy} from "../Entities/Enemy";
import {BossEnemy} from "../Entities/BossEnemy";
import {GameState} from "../../GameState";
import Utils from "../../Utils";
import Main from "../../../scenes/Game";
export interface EnemyData {
    id: string
    enemy: string
    spawn: {
        count?: number
        delay?: number
        afterDeath?: string
        time?: number
        score?: number
        y?: number | { min: number, max: number } | 'random'
        btwDelay?: number
    }
    getScore?: number
    reward?: number
    scale: number | undefined
}
export interface WaveData {
    id: string
    enemies: EnemyData[]
    reward?: number
}
export interface Task {
    scale: number | undefined
    id: string
    enemy: string
    count: number
    afterDeath?: string
    onScore?: number
    onTime?: number
    delay?: number
    btwDelay?: number
    reward?: number
    y?: number | { min: number, max: number } | 'random'
    getScore: number
}
export class Wave {
    protected reward: number
    id: string
    protected tasks: Task[] = []
    protected scene: Main
    protected totalScore: number = 0
    public random: () => number
    public isEnded: boolean = false
    constructor(scene: Main, id: string, reward: number = 20) {
        this.scene = scene
        this.id = id
        this.reward = reward
        // @ts-ignore
        this.random = new Math.seedrandom('wave' + id)
    }
    public addTask(task: Task){
        this.totalScore += task.getScore * task.count
        this.tasks.push(task)
    }
    public save(): void {

    }
    public start(): void {
        console.log('wave ', this.id, ' started')
        console.log('spawn', this.tasks)

        this.scene.events.emit('wave-start', this)

        const deathListener = () => {
            if(this.tasks.length || GameState.instance.enemies.size) return

            console.log('wave ended')
            GameState.instance.Money += this.reward
            this.scene.events.emit('wave-end', this)
            this.isEnded = true
            this.scene.events.removeListener('death', deathListener)
        }
        for (const task of this.tasks) {
            console.log('task', task)
            const spawnOne = (id: string) => {
                const scale = task.scale ?? this.scene.enemies.getDescription(task.enemy).scale;
                const y = typeof task.y === 'number' ? task.y
                    : task.y === 'random' || task.y === undefined ? Utils.Between(this.random() * 720 - 16 * scale, 98+16*(5/scale -1), 550)
                        : Utils.Between(this.random() * 720 - 16 * scale, task.y.min, task.y.max)

                const enemy = this.scene.enemies.add(task.enemy, 1280, y, id, task.getScore, task.reward, task.scale)
            }
            const spawnEnemy = () => {
                if(!task.btwDelay) this.tasks = this.tasks.filter((_task) => _task !== task)

                console.log('spawn', task , task.btwDelay)

                for (let i = 0; i < task.count - 1; i++) {
                    const id = task.id + '-' + i.toString()
                    if(task.btwDelay)
                        this.scene.time.delayedCall(task.btwDelay * (i + 1), spawnOne, [id])
                    else spawnOne(id)
                }

                const id = task.id
                if(task.btwDelay)
                    this.scene.time.delayedCall(task.btwDelay * task.count, (id: string) => {
                        this.tasks = this.tasks.filter((_task) => _task !== task)
                        spawnOne(id)
                    }, [id])
                else spawnOne(id)
            }

            if(task.onTime !== undefined)
            {
                this.scene.time.delayedCall(task.onTime, spawnEnemy)
            }
            else if(task.onScore !== undefined){
                const listener = (score: number) => {
                    if(score >= task.onScore!) {
                        spawnEnemy()
                        this.scene.events.removeListener('updateScore', listener)
                    }
                }
                const delayListener = (score: number) => {
                    if(score >= task.onScore!) {
                        this.scene.time.delayedCall(task.delay!, spawnEnemy)
                        this.scene.events.removeListener('updateScore', delayListener)
                    }
                }

                if(task.delay !== undefined)
                    this.scene.events.on(`updateScore`, delayListener)
                else
                    this.scene.events.on(`updateScore`, listener)
            }
            else if(task.afterDeath !== undefined){
                if(task.delay !== undefined){
                    console.log(task.delay)
                    this.scene.events.once(`death#${task.afterDeath}`, () => {
                        this.scene.time.delayedCall(task.delay!, spawnEnemy)
                    })
                }
                else
                    this.scene.events.once(`death#${task.afterDeath}`, spawnEnemy)
            }
        }

        this.scene.events.on('death', deathListener)
    }
}