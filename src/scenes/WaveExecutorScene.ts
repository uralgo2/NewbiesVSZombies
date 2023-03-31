import Phaser from 'phaser';
import {WaveExecutor} from "../scripts/Logic/Waves/WaveExecutor";

export default class BackgroundScene extends Phaser.Scene {
    private waveExecutor: WaveExecutor
    constructor() {
        super('wave-executor');

        this.waveExecutor = new WaveExecutor(this)
    }

    preload() {
    }

    create() {
    }

}
