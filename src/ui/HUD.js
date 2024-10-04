import { AdvancedDynamicTexture, Rectangle, Control, Ellipse, Image, TextBlock } from "@babylonjs/gui";

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.createCrosshair();
        this.setupAmmoCounter();
        this.setupFPSCounter();
    }

    createCrosshair() {
        const crosshair = new Ellipse();
        crosshair.width = "10px";
        crosshair.height = "10px";
        crosshair.color = "white";
        crosshair.thickness = 2;
        this.advancedTexture.addControl(crosshair);
    }

    setupAmmoCounter() {
        this.ammoCount = 0;

        // Create a container for the ammo counter
        this.ammoContainer = new Rectangle();
        this.ammoContainer.width = "100px";
        this.ammoContainer.height = "50px";
        this.ammoContainer.cornerRadius = 0;
        this.ammoContainer.thickness = 0;
        this.ammoContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.ammoContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.ammoContainer.left = -10;
        this.ammoContainer.top = -10;
        this.advancedTexture.addControl(this.ammoContainer);

        this.ammoSprites = [];
        this.updateAmmoCounter(30);  // Initial ammo count
    }

    setupFPSCounter() {
        this.fpsText = new TextBlock();
        this.fpsText.text = "FPS: 0";
        this.fpsText.color = "white";
        this.fpsText.fontSize = 24;
        this.fpsText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.fpsText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.fpsText.top = "10px";
        this.fpsText.left = "-10px";
        this.advancedTexture.addControl(this.fpsText);
    }

    updateFPSCounter() {
        const fps = Math.round(1000 / this.scene.getEngine().getDeltaTime());
        this.fpsText.text = `FPS: ${fps}`;
    }

    updateAmmoCounter(ammoCount) {
        if(this.ammoCount === ammoCount) return;

        this.ammoCount = ammoCount;

        // Clear previous ammo sprites
        this.ammoSprites.forEach(sprite => {
            this.ammoContainer.removeControl(sprite);
            sprite.dispose();
        });
        this.ammoSprites = [];

        // Create new ammo sprites
        const numberString = ammoCount.toString();
        const digitWidth = 32;  // Width of each digit sprite
        const digitHeight = 32;  // Height of eammoCount.toStringch digit sprite
        const totalWidth = numberString.length * digitWidth;

        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            if (isNaN(digit)) continue;

            const spriteTexture = new Image();
            spriteTexture.width = `${digitWidth}px`;
            spriteTexture.height = `${digitHeight}px`;
            spriteTexture.left = `${i * digitWidth - totalWidth / 2}px`;  // Center the digits
            spriteTexture.top = "0px";
            spriteTexture.source = `./assets/textures/digits.png`;
            spriteTexture.cellId = digit;
            spriteTexture.cellWidth = 64;
            spriteTexture.cellHeight = 64;

            this.ammoContainer.addControl(spriteTexture);
            this.ammoSprites.push(spriteTexture);
        }
    }

    update(ammoCount) {  
        this.updateAmmoCounter(ammoCount);
        this.updateFPSCounter();
        // Update other HUD elements here if needed
    }

    dispose() {
        this.advancedTexture.dispose();
        this.ammoSprites.forEach(sprite => sprite.dispose());
    }
}