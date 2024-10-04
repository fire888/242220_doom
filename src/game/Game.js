import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/meshBuilder";
//import "@babylonjs/inspector";

import { Level } from './Level';
import { Player } from './Player';
import { HUD } from '../ui/HUD';
import { SoundManager } from '../audio/SoundManager';
import { CRTEffect } from './CRTEffect';   

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        
        this.scene.collisionsEnabled = true;
        
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        
        this.soundManager = new SoundManager(this.scene);
        this.level = new Level(this.scene);
        this.player = new Player(this.scene, this.canvas);
        this.hud = new HUD(this.scene);
      
        // Create and enable the CRT effect
        this.crtEffect = new CRTEffect(this.scene);
        this.crtEffect.enable();

        this.activateInspector();
        this.setupPointerLock();
    }

    setupPointerLock() {
        // On click, request pointer lock
        this.canvas.addEventListener("click", () => {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
            if(this.canvas.requestPointerLock) {
                this.canvas.requestPointerLock();
            }
        });

        // Event listener for pointer lock state changes
        const pointerlockchange = () => {
            this.controlEnabled = (document.mozPointerLockElement === this.canvas || document.webkitPointerLockElement === this.canvas || document.msPointerLockElement === this.canvas || document.pointerLockElement === this.canvas);
            if (!this.controlEnabled) {
                this.player.detachControl();
            } else {
                this.player.attachControl();
            }
        };

        // Event listener for pointer lock errors
        const pointerlockerror = () => {
            console.log("Pointer lock failed");
        };

        // Hook pointer lock state change events
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);

        // Hook pointer lock error events
        document.addEventListener("pointerlockerror", pointerlockerror, false);
        document.addEventListener("mozpointerlockerror", pointerlockerror, false);
        document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
        document.addEventListener("mspointerlockerror", pointerlockerror, false);
    }

    
    start() {
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    update() {
        if (this.player) this.player.update();
        if (this.level) this.level.update();
        if (this.hud) this.hud.update(this.player.weapons[this.player.currentWeaponIndex].ammo);
    }

    cleanup() {
        if (this.player) this.player.dispose();
        if (this.level) this.level.dispose();
        if (this.hud) this.hud.dispose();
        if (this.soundManager) this.soundManager.dispose();
        if (this.crtEffect) this.crtEffect.disable();  
        if (this.scene) this.scene.dispose();
        if (this.engine) this.engine.dispose();

        window.removeEventListener('resize', this.engine.resize);
    }
 
    activateInspector() {
        window.addEventListener("keydown", (ev) => {
            if (ev.key === "i") {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });
    }
}