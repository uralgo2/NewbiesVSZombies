import {Weapon} from "./Weapon";

export class Carbine extends Weapon {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'gun_0', 'gun-gunshot-01', 'gun-reload')
    }
}