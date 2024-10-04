import * as BABYLON from '@babylonjs/core';
import { Bullet } from '../Bullet';

export class MachineGun {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.fireRate = 100; // milliseconds
        this.ammo = 100; // Initial ammo count for machine gun
    }

    shoot() {
        if (this.ammo <= 0) return;

        console.log("Machine Gun fired!");
    }

    setVisibility(visible) {
       
    }
}