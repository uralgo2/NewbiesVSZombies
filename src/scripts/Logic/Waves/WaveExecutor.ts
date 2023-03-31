import {Wave} from "./Wave";
import Phaser from "phaser";
import {Enemy} from "../Entities/Enemy";
import eventsCenter from "../Events/EventsCenter";

enum Registers {
    ElapsedTime,
}
enum OpCodes {
    Spawn,
    Reward,
    OnEnd,

}
export class WaveExecutor {
    protected scene: Phaser.Scene
    protected game: Phaser.Game

    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.game = scene.game
    }
    private addEnemySpawnOnDeath(enemy: Enemy, deathTag: string){
        eventsCenter.once(`enemy-death#${deathTag}`, () => {
            this.scene.add.existing(enemy)
        })
    }
    public executeWave(wave: Wave){

    }
}