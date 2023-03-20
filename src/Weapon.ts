export class Weapon extends Phaser.GameObjects.Sprite {
    public AmmoType: string = '9mm'
    public AmmoCapacity: number = 30
    public ShootDelay: number = 500
    public ReloadDuration: number = 1500 // seconds
    public AmmoCount: number = 30
    public ShootDuration: number = 48
    public ShootSoundName: string
    public ShootSound: Phaser.Sound.BaseSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
    public ReloadSoundName: string
    public ReloadSound: Phaser.Sound.BaseSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound
    Damage: number = 2
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        shootSound: string,
        reloadSound: string,
    ) {
        super(scene, x, y, texture)

        this.setOrigin(0)
        this.ShootSoundName = shootSound
        this.ShootSound = scene.sound.add(shootSound, {
            loop: false,
        })
        this.ReloadSoundName = reloadSound
        this.ReloadSound = scene.sound.add(reloadSound, {
            loop: false,
        })
    }


}