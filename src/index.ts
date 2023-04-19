import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/Game';
import {GameState} from "./scripts/GameState";
import BackgroundScene from "./scenes/BackgroundScene";
export function start(ysdk: any) {
    console.log(ysdk)
    GameState.instance.YandexSDK = ysdk
    ysdk.features.LoadingAPI?.ready()
    ysdk.adv.getBannerAdvStatus().then(({ stickyAdvIsShowing , reason }: any) => {
        if (stickyAdvIsShowing) {
            // реклама показывается
        } else if(reason) {
            // реклама не показывается
            console.log(reason)
        } else {
            ysdk.adv.showBannerAdv()
        }
    })
    ysdk.adv.showFullscreenAdv({
        callbacks: {
            onClose: function(wasShown: any) {
                // some action after close
            },
            onError: function(error: any) {
                // some action on error
            }
        }
    })
}
