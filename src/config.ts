import Phaser from 'phaser'
export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#33A5E7',
  pixelArt: true,
  orientation: Phaser.Scale.LANDSCAPE,
  scale: {
    width: 1280,
    height: 720,
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 0,
        x: 0
      },
      debug: false
    }
  }
};
