import {ObjectFactory} from "./ObjectFactory";
import Entity from "../Entities/Entity";

export class EntityFactory implements ObjectFactory<Entity> {
    protected scene: Phaser.Scene
    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    add(x: number, y: number, texture: string): Entity {
        const entity = new Entity(this.scene, x, y, texture);

        this.scene.add.existing(entity)

        return entity;
    }

    make(x: number, y: number, texture: string): Entity {
        const entity = new Entity(this.scene, x, y, texture);


        return entity;
    }

}