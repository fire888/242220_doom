import * as BABYLON from '@babylonjs/core';
import { Decal } from './Decal';

export class Bullet {
    static spriteManager;

    constructor(scene, startPosition, direction, options = {}) {
        this.scene = scene;
        this.startPosition = startPosition;
        this.direction = direction.normalize();
        this.speed = options.speed || 150;
        this.lifespan = options.lifespan || 5000; // milliseconds
        this.isDisposed = false;

        this.createSprite();
        this.animate();
        this.checkCollisions();
        this.setLifespan();
    }

    createSprite() {
        if (!Bullet.spriteManager) {
            Bullet.spriteManager = new BABYLON.SpriteManager(
                "bulletManager",
                "assets/textures/bullet.png",
                100,  // Capacity
                { width: 26, height: 22 },  // Sprite size
                this.scene
            );
        }

        this.sprite = new BABYLON.Sprite("bullet", Bullet.spriteManager);
        this.sprite.position = this.startPosition;
        this.sprite.width = 0.4;   
        this.sprite.height = 0.4;   
        
        // Set up animation
        this.sprite.cellIndex = 0;
        this.sprite.playAnimation(0, 3, true, 20);  // Play frames 0 to 3 in a loop, 20ms per frame
    }

    animate() {
        const frameRate = 60;
        const animationObservable = this.scene.onBeforeRenderObservable.add(() => {
            if (this.isDisposed) {
                this.scene.onBeforeRenderObservable.remove(animationObservable);
                return;
            }

            this.sprite.position.addInPlace(this.direction.scale(this.speed / frameRate));
        });
    }

    checkCollisions() { 
        const checkCollision = () => {
            if (this.isDisposed) return;

            const ray = new BABYLON.Ray(this.sprite.position, this.direction, 10.0);
            
            // Get all meshes in the scene
            const meshes = this.scene.meshes;

            let closestHit = null;
            let closestDistance = Infinity;

            for (const mesh of meshes) {
                // Perform ray intersection with the mesh
                const hit = ray.intersectsMesh(mesh, false);

                if (hit.hit && hit.distance < closestDistance) {
                    closestHit = hit;
                    closestDistance = hit.distance;
                }
            }

            if (closestHit) {
                console.log("Hit object:", closestHit.pickedMesh.name);
                if (closestHit.pickedMesh.monster) {
                    closestHit.pickedMesh.monster.hit(closestHit.pickedPoint);
                } else {
                    this.createDecal(closestHit);
                }
            }  

            requestAnimationFrame(checkCollision);
        };

        checkCollision();
    }

    createDecal(hit) {
        if (hit.pickedPoint && hit.getNormal) {
            new Decal(this.scene, hit);
        }
    }

    setLifespan() {
        setTimeout(() => {
            this.dispose();
        }, this.lifespan);
    }

    dispose() {
        if (!this.isDisposed) {
            this.isDisposed = true;
            if (this.sprite) {
                this.sprite.dispose();
            }
        }
    }
}