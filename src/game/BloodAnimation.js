import * as BABYLON from '@babylonjs/core';

export class BloodAnimation {
    static spriteManager = null;

    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.createSprite();
        this.animate();
    }

    createSprite() {
        if (!BloodAnimation.spriteManager) {
            BloodAnimation.spriteManager = new BABYLON.SpriteManager(
                "bloodManager",
                "assets/textures/blood.png",
                100,  // Capacity
                256,  // Sprite size
                this.scene
            );
        }

        this.sprite = new BABYLON.Sprite("blood", BloodAnimation.spriteManager);
        this.sprite.position = this.position;
        this.sprite.width = 1;
        this.sprite.height = 1;

        // Add random rotation
        this.sprite.angle = Math.random() * Math.PI * 2;
    }

    animate() {
        this.sprite.playAnimation(0, 3, false, 100, () => {
            this.dispose();
        });
    }

    dispose() {
        if (this.sprite) {
            this.sprite.dispose();
        }
    }

    static disposeManager() {
        if (BloodAnimation.spriteManager) {
            BloodAnimation.spriteManager.dispose();
            BloodAnimation.spriteManager = null;
        }
    }
}