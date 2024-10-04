import * as BABYLON from '@babylonjs/core';

export class Decal {
    static textureAtlas = null;

    constructor(scene, hit, size = 0.3, lifespan = 100000) {
        this.scene = scene;
        this.hit = hit;
        this.size = size;
        this.lifespan = lifespan;

        this.loadTextureAtlas();
        this.createDecal();
        this.setLifespan();
    }

    loadTextureAtlas() {
        if (!Decal.textureAtlas) {
            Decal.textureAtlas = new BABYLON.Texture("./assets/textures/decals.png", this.scene);
            Decal.textureAtlas.hasAlpha = true;
        }
    }

    createDecal() {
        const position = this.hit.pickedPoint;
        const normal = this.hit.getNormal(true);

        // Create a plane for the decal
        this.plane = BABYLON.MeshBuilder.CreatePlane("decal", { size: this.size }, this.scene);
        this.plane.position = position;

        // Create material for the decal
        const decalMaterial = new BABYLON.StandardMaterial("decalMaterial", this.scene);
        decalMaterial.diffuseTexture = Decal.textureAtlas.clone();
        decalMaterial.diffuseTexture.hasAlpha = true;
        decalMaterial.useAlphaFromDiffuseTexture = true;
        decalMaterial.zOffset = -0.1; // Slight offset to prevent z-fighting

        // Set up UV coordinates for a random sprite from the 8x8 grid
        const randomSprite = Math.floor(Math.random() * 64);
        const grid = 8;
        const row = Math.floor(randomSprite / grid);
        const col = randomSprite % grid;
        decalMaterial.diffuseTexture.uScale = 1/grid;
        decalMaterial.diffuseTexture.vScale = 1/grid;
        decalMaterial.diffuseTexture.uOffset = col/grid;
        decalMaterial.diffuseTexture.vOffset = row/grid;
        
        this.plane.material = decalMaterial;

        // Make the decal face the surface
        const invertedNormal = normal.scale(-1);
        this.plane.lookAt(position.add(invertedNormal));

        // Add random rotation around the normal axis for variety
        const randomAngle = Math.random() * Math.PI * 2;
        this.plane.rotate(normal, randomAngle, BABYLON.Space.WORLD);

        // Move the decal slightly towards the camera to avoid z-fighting
        this.plane.position.addInPlace(normal.scale(0.01));
    }

    setLifespan() {
        setTimeout(() => {
            this.fadeOut();
        }, this.lifespan); // Start fading out 1 second before lifespan ends
    }

    fadeOut() {
        const fadeOutAnimation = new BABYLON.Animation(
            "fadeOut",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: 1 },
            { frame: 30, value: 0 }
        ];

        fadeOutAnimation.setKeys(keys);

        this.plane.animations.push(fadeOutAnimation);

        this.scene.beginAnimation(this.plane, 0, 30, false, 1, () => {
            this.dispose();
        });
    }

    dispose() {
        if (this.plane) {
            this.plane.dispose();
        }
    }

    static disposeTextureAtlas() {
        if (Decal.textureAtlas) {
            Decal.textureAtlas.dispose();
            Decal.textureAtlas = null;
        }
    }
}