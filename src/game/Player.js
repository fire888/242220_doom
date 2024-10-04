import * as BABYLON from '@babylonjs/core';
import { Pistol } from './Weapon/Pistol';
import { MachineGun } from './Weapon/MachineGun';

export class Player {
    constructor(scene, canvas) {
        this.scene = scene;
        this.camera = new BABYLON.FreeCamera("playerCamera", new BABYLON.Vector3(0, 1.6, -5), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.applyGravity = true;
        this.camera.checkCollisions = true;
        this.camera.minZ = 0.01;
        this.camera.ellipsoid = new BABYLON.Vector3(1, 0.8, 1);
        this.camera.angularSensibility = 1 / 0.002; // Adjust this value to change sensitivity
        this.camera.inertia = 0; // Disable mouse damping

        this.weapons = [
            new Pistol(this.scene, this.camera),
            new MachineGun(this.scene, this.camera)
        ];
        this.currentWeaponIndex = 0;
        this.updateWeaponVisibility();
        
        this.setupInput();
    }

    setupInput() {
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    if (kbInfo.event.key === " ") {
                        this.shoot();
                    } else if (kbInfo.event.key === "q") {
                        this.switchWeapon();
                    }
                    break;
            }
        });

        
        // Add mouse click event listener
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 0) {
                this.shoot();
            }
        });

        // WASD movement
        this.inputMap = {};
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
    }

    attachControl() {
        this.camera.attachControl(this.canvas, true);
        this.controlEnabled = true;
    }

    detachControl() {
        this.camera.detachControl();
        this.controlEnabled = false;
    }
    
    shoot() {
        const start = this.camera.position.clone();
        const forward = this.camera.getDirection(BABYLON.Vector3.Forward());
        this.weapons[this.currentWeaponIndex].shoot(start, forward);
    }

    switchWeapon() {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        console.log(`Switched to ${this.weapons[this.currentWeaponIndex].constructor.name}`);
        this.updateWeaponVisibility();
    }

    updateWeaponVisibility() {
        this.weapons.forEach((weapon, index) => {
            if (weapon.setVisibility) {
                weapon.setVisibility(index === this.currentWeaponIndex);
            }
        });
    }

    update() {
        // WASD movement
        let moveVector = BABYLON.Vector3.Zero();

        if (this.inputMap["w"]) {
            moveVector.addInPlace(this.camera.getDirection(BABYLON.Vector3.Forward()));
        }
        if (this.inputMap["s"]) {
            moveVector.addInPlace(this.camera.getDirection(BABYLON.Vector3.Backward()));
        }
        if (this.inputMap["a"]) {
            moveVector.addInPlace(this.camera.getDirection(BABYLON.Vector3.Left()));
        }
        if (this.inputMap["d"]) {
            moveVector.addInPlace(this.camera.getDirection(BABYLON.Vector3.Right()));
        } 

        // Normalize the movement vector
        if (moveVector.length() > 0) {
            moveVector.normalize();
        }

        // Set the Y component to 0 to restrict movement to XZ plane
        moveVector.y = 0;

        // Scale the movement and apply it to the camera position
        const scaledMove = moveVector.scale(0.1);  // Adjust 0.1 to change movement speed
        this.camera.position.addInPlace(scaledMove);
    }
}