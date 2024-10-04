import * as BABYLON from '@babylonjs/core';
import { BloodAnimation } from './BloodAnimation';

export class Monster {
    static spriteManager = null;

    constructor(scene, position) {
        this.scene = scene;
        this.position = position;
        this.speed = 0.01;
        this.state = 0;
        this.horizontalRadius = 3;
        this.verticalRadius = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.verticalAngle = Math.random() * Math.PI * 2;
        this.centerPosition = position.clone();
        this.health = 5;
        this.isDead = false;

        this.createSprite();
        this.createCollider();
        this.animate();
    }

    createSprite() {
        const spriteManagerName = "cacoDemonManager";

        if (!Monster.spriteManager) {
            Monster.spriteManager = new BABYLON.SpriteManager(
                spriteManagerName,
                "assets/textures/cacodemon.png",
                100,  // Capacity
                { width: 1510 / 5, height: 2114 / 7 },  // Sprite size
                this.scene
            );
        }

        this.sprite = new BABYLON.Sprite("cacodemon", Monster.spriteManager);
        this.sprite.position = this.position;
        this.sprite.width = 2;  // Adjust size as needed
        this.sprite.height = 2;

        // Set up animation
        this.sprite.cellIndex = 0;
        this.sprite.invertU = false;  // For mirroring
    }

    createCollider() {
        this.collider = BABYLON.MeshBuilder.CreateSphere("monsterCollider", { diameter: 2 }, this.scene);
        this.collider.position = this.position;
        this.collider.isVisible = false;
        this.collider.checkCollisions = true;
        this.collider.monster = this; // Reference to the monster for collision handling
    }

    normalizeAngle(angle) {
        // Ensure the angle is within the range [0, 2π)
        angle = angle % (2 * Math.PI);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        // Normalize the angle to be between -PI and PI
        if(angle > Math.PI) {
            angle = angle - 2 * Math.PI; 
        }
        return angle;
    }

    animate() {
        let frameCount = 0;
        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isDead) {
                return;
            }

            // Update position
            this.angle += this.speed;
            this.angle = this.angle % (Math.PI * 2);

            this.verticalAngle += this.speed * 0.5;
            if (this.verticalAngle > Math.PI * 2) this.verticalAngle -= Math.PI * 2;

            const newX = this.centerPosition.x + Math.cos(this.angle) * this.horizontalRadius;
            const newZ = this.centerPosition.z + Math.sin(this.angle) * this.horizontalRadius;
            const newY = this.centerPosition.y + Math.sin(this.verticalAngle) * this.verticalRadius;

            this.sprite.position = new BABYLON.Vector3(newX, newY, newZ);

            // Update rotation
            const camera = this.scene.activeCamera;
            const directionToCamera = camera.position.subtract(this.sprite.position);
            let angleToCamera = Math.atan2(directionToCamera.x, directionToCamera.z);
   
            // Calculate the relative angle between monster's facing direction and camera
            let relativeAngle = this.normalizeAngle(this.angle + angleToCamera + Math.PI);

            // Determine sprite column based on relative angle
            this.sprite.invertU = relativeAngle < 0;
            let column = Math.floor(5 * (1 - Math.abs(relativeAngle) / Math.PI));

            // Animate sprite
            frameCount++;
            if (frameCount % 10 === 0) {  // Change frame every 10 renders
                this.state = (this.state + 1) % 6;
                this.sprite.cellIndex = this.state * 5 + column;
            }
            // Update collider position
            this.collider.position = this.sprite.position;
        });
    }
 
    hit(hitPosition) {
        console.log("Monster hit!");
        new BloodAnimation(this.scene, hitPosition);
        
        if (!this.isDead) {
            this.health -= 1;
            if (this.health <= 0) {
                this.die();
            }
        }
    }

    die() {
        this.isDead = true;
        this.state = 6;
        this.sprite.cellIndex = this.state * 5; // Start death animation

        let deathFrame = 0;
        let deathInterval = setInterval(() => {
            deathFrame++;
            if (deathFrame <= 4) {
                this.sprite.cellIndex = this.state * 5 + deathFrame;
            } else {
                clearInterval(deathInterval);
            }
        }, 100); // Change frame every 100ms

        // Disable collisions
        this.collider.checkCollisions = false;

        // animate fall
        const startY = this.sprite.position.y;
        const duration = 200; // 1 second
        const startTime = Date.now();

        const fallAnimation = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
 
            this.sprite.position.y = 0.9 * progress + startY * (1 - progress);
            this.collider.position = this.sprite.position;

            if (progress < 1) {
                requestAnimationFrame(fallAnimation);
            }
        };

        fallAnimation();
    }

    dispose() {
        if (this.sprite) {
            this.sprite.dispose();
        }
        if (this.collider) {
            this.collider.dispose();
        }
    }

    static disposeManager() {
        if (Monster.spriteManager) {
            Monster.spriteManager.dispose();
            Monster.spriteManager = null;
        }
    }
}