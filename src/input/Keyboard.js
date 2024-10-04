export class Keyboard {
    constructor() {
        this.keys = {};
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    isKeyDown(keyCode) {
        return this.keys[keyCode] === true;
    }

    getMovementVector() {
        const moveVector = { x: 0, z: 0 };
        if (this.isKeyDown('KeyW')) moveVector.z += 1;
        if (this.isKeyDown('KeyS')) moveVector.z -= 1;
        if (this.isKeyDown('KeyA')) moveVector.x -= 1;
        if (this.isKeyDown('KeyD')) moveVector.x += 1;
        return moveVector;
    }

    isStrafing() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    }

    cleanup() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
}