import {GameState} from "./GameState";

export class AnimatedParticle extends Phaser.GameObjects.Particles.Particle {
    protected t: number = 0
    protected i: number = 0
    protected coinAnimation
    protected totalFrames
    constructor(emitter: Phaser.GameObjects.Particles.ParticleEmitter) {
        super(emitter)
        this.coinAnimation = GameState.instance.CoinAnimation!
        this.totalFrames = this.coinAnimation.getTotalFrames()
    }


    update(delta: number, step: number, processors: any[]) {
        const result = super.update(delta, step, processors)

        this.t += delta
        if (this.t >= this.coinAnimation.msPerFrame) {
            this.i += 1

            if (this.i > this.totalFrames) this.i = 0

            const frame = this.coinAnimation.frames[this.i]

            if(frame)
                this.frame = frame.frame
            this.t -= this.coinAnimation.msPerFrame
        }
        return result;
    }
}