import Phaser from "phaser";
import {Enemy, EnemyData} from "../Entities/Enemy";

export class EnemyFactory {
    protected enemies: Map<string, EnemyData>
    protected scene: Phaser.Scene
    constructor(scene: Phaser.Scene) {
        this.scene = scene
        this.enemies = new Map<string, EnemyData>()
    }
    public addDescription(enemyName: string){
        const enemyDesc = this.scene.cache.json.get(enemyName) as EnemyData
        this.enemies.set(enemyDesc.name, enemyDesc)
    }

    public add(
        name: string,
        x: number,
        y: number,
        tag: string,
        score: number = 1,
        reward: number | undefined = undefined,
        scale: number | undefined = undefined
    ): Enemy {

        if(!this.enemies.has(name)) throw new Error(`Enemy with name ${name} does not exist`)

        return Enemy.createFromDescription(this.enemies.get(name)!, this.scene, x, y, tag, score, reward, scale);
    }

    public getDescription(enemy: string) {
        return this.enemies.get(enemy)!
    }
}