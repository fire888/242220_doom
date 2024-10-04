import { Sound } from '@babylonjs/core/Audio/sound';

export class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    loadSound(name, url) {
        this.sounds[name] = new BABYLON.Sound(name, url, this.scene, null, {
            loop: false,
            autoplay: false
        });
    }

    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }

    stopSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].stop();
        }
    }
}