import * as BABYLON from '@babylonjs/core';
import { Bullet } from '../Bullet';
import { AdvancedDynamicTexture, Image, Control } from "@babylonjs/gui";

export class Pistol {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.ammo = 50; // Initial ammo count for pistol
        this.isAnimating = false;
        this.currentFrame = 0;
        this.framesHold = 4;
        this.totalFrames = 4;
        this.setupGunSprite();
    }

    setupGunSprite() {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Pistol");
        this.pistolImage = new Image("pistol");
        this.pistolImage.width = `${parseInt(800 / 1.25)}px`;
        this.pistolImage.height = `${parseInt(420 / 1.25)}px`;
        this.pistolImage.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.pistolImage.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.pistolImage.top = `${parseInt(50 / 1.25)}px`;
        this.pistolImage.source = "./assets/textures/pistol.png";
        this.pistolImage.cellId = 0;
        this.pistolImage.cellWidth = 800;
        this.pistolImage.cellHeight = 420;
        this.advancedTexture.addControl(this.pistolImage);
    }

    shoot() {
        if (this.isAnimating || this.ammo <= 0) return;

        console.log("Pistol fired!");
        this.ammo--;

        const startPosition = this.camera.position.clone();
        const direction = this.camera.getDirection(new BABYLON.Vector3(0, 0, 1));
        
        // Bullets start under the pistol
        startPosition.addInPlace(direction.scale(1.0)).addInPlace(new BABYLON.Vector3(0, -0.15, 0));
        new Bullet(this.scene, startPosition, direction);
        this.animateGun();
    }

    animateGun() {
        this.isAnimating = true;
        this.currentFrame = 0;
        this.updateGunSprite();
        this.animationInterval = setInterval(() => {
            this.currentFrame++;
            if (this.currentFrame >= this.totalFrames * this.framesHold) {
                clearInterval(this.animationInterval);
                this.isAnimating = false;
                this.currentFrame = 0;
            }
            this.updateGunSprite();
        }, 1000 / 60); // 60 FPS
    }

    updateGunSprite() {
        const frameToShow = Math.floor(this.currentFrame / this.framesHold);
        this.pistolImage.cellId = frameToShow;
        //console.log(`Frame: ${this.currentFrame}, Showing: ${frameToShow}`);
    }

    setVisibility(visible) {
        if (this.pistolImage) {
            this.pistolImage.isVisible = visible;
        }
    }

    dispose() {
        if (this.advancedTexture) {
            this.advancedTexture.dispose();
        }
        clearInterval(this.animationInterval);
    }
}