import {
    Scene,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Texture,
    EquiRectangularCubeTexture,
    Color3,
    PointLight
} from "@babylonjs/core";
import { Monster } from './Monster';

export class Level {
    constructor(scene) {
        this.scene = scene;
        this.roomHeight = 6;   
        this.roomWidth = 40; 
        this.roomDepth = 40;   
        this.monsters = [];
        this.createSkybox();
        this.createRoom();
        this.addLighting();
        this.createMonsters();
    }

    createSkybox() {
        const skybox = MeshBuilder.CreateBox("skyBox", {size: 1000.0}, this.scene);  
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skyboxMaterial.reflectionTexture = new EquiRectangularCubeTexture(
            "/assets/textures/skybox.png",
            this.scene,
            1024
        );
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skybox.infiniteDistance = true;
        skybox.material = skyboxMaterial;
    }

    createRoom() {
        // Create floor
        const floorMaterial = new StandardMaterial("floorMaterial", this.scene);
        floorMaterial.diffuseTexture = new Texture("./assets/textures/526.png", this.scene);
        floorMaterial.diffuseTexture.uScale = 20;  
        floorMaterial.diffuseTexture.vScale = 20;  
        floorMaterial.bumpTexture = new Texture("./assets/textures/526_n.png", this.scene);
        floorMaterial.bumpTexture.uScale = 20;  
        floorMaterial.bumpTexture.vScale = 20;  
        const floor = MeshBuilder.CreateGround("floor", {width: this.roomWidth, height: this.roomDepth}, this.scene);
        floor.material = floorMaterial;
        floor.checkCollisions = true;

        // Create walls
        const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseTexture = new Texture("./assets/textures/430.png", this.scene);
        wallMaterial.diffuseTexture.uScale = 12;  
        wallMaterial.diffuseTexture.vScale = 2;    
        wallMaterial.bumpTexture = new Texture("./assets/textures/430_n.png", this.scene);
        wallMaterial.bumpTexture.uScale = 12;  
        wallMaterial.bumpTexture.vScale = 2;

        const createWall = (name, width, height, depth, position, rotation) => {
            const wall = MeshBuilder.CreateBox(name, {width, height, depth}, this.scene);
            wall.position = position;
            wall.rotation = rotation;
            wall.material = wallMaterial;
            wall.checkCollisions = true;
            return wall;
        };

        // Front and back walls
        this.frontWall = createWall("frontWall", this.roomWidth, this.roomHeight, 1, new Vector3(0, this.roomHeight / 2, this.roomDepth / 2), new Vector3(0, 0, 0));
        this.backWall = createWall("backWall", this.roomWidth, this.roomHeight, 1, new Vector3(0, this.roomHeight / 2, -this.roomDepth / 2), new Vector3(0, 0, 0));

        // Left and right walls (rotated)
        this.leftWall = createWall("leftWall", this.roomDepth, this.roomHeight, 1, new Vector3(-this.roomWidth / 2, this.roomHeight / 2, 0), new Vector3(0, Math.PI / 2, 0));
        this.rightWall = createWall("rightWall", this.roomDepth, this.roomHeight, 1, new Vector3(this.roomWidth / 2, this.roomHeight / 2, 0), new Vector3(0, Math.PI / 2, 0));

        for (let i = 0; i < 7000; i++) {
            const x = Math.random() * this.roomWidth - this.roomWidth / 2;
            const z = Math.random() * this.roomDepth - this.roomDepth / 2;
            const y = -5 - Math.random() * 10; // Position cubes below the floor

            const cube = MeshBuilder.CreateBox(`undergroundCube${i}`, { size: 1 }, this.scene);
            cube.position = new Vector3(x, y, z);
            cube.checkCollisions = true;
        }

    }

    addLighting() {
        // Add a point light to create a creepy atmosphere
        const light = new PointLight("pointLight", new Vector3(0, this.roomHeight - 2, 0), this.scene);
        light.intensity = 0.7;  
        light.diffuse = new Color3(1, 0.5, 0.5);  // Reddish light for a doom-like feel
    }

    createMonsters() {
        // Create 5 monsters at random positions
        for (let i = 0; i < 5; i++) { 
            const randomX = Math.random() * 18 - 9; // Random X between -9 and 9
            const randomZ = Math.random() * 18 - 9; // Random Z between -9 and 9
            const position = new Vector3(randomX, 2, randomZ);
            const monster = new Monster(this.scene, position);
            this.monsters.push(monster);
        }
    }

    update() {
        // Update level logic here (e.g., moving platforms, dynamic elements)
        // Monster updates are handled in their own animate method
    }

    dispose() {
        this.monsters.forEach(monster => monster.dispose());
        // Dispose of other level resources if necessary
    }
}