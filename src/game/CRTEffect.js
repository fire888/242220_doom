import * as BABYLON from '@babylonjs/core';

export class CRTEffect {
    constructor(scene) {
        this.scene = scene;
        this.postProcess = null;
        this.setupPostProcess();
    }

    setupPostProcess() {
        BABYLON.Effect.ShadersStore["crtVertexShader"] = `
            precision highp float;
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 worldViewProjection;
            varying vec2 vUV;
            void main() {
                gl_Position = worldViewProjection * vec4(position, 1.0);
                vUV = uv;
            }
        `;

        BABYLON.Effect.ShadersStore["crtFragmentShader"] = `
            precision highp float;
            varying vec2 vUV;
            uniform sampler2D textureSampler;
            uniform float time;

            vec2 curve(vec2 uv) {
                uv = (uv - 0.5) * 2.0;
                uv *= 1.1;
                uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
                uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
                uv = (uv / 2.0) + 0.5;
                uv = uv * 0.92 + 0.04;
                return uv;
            }

            void main() {
                vec2 uv = curve(vUV);
                vec3 col;

                // Check if the pixel is outside the curved area
                if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                    col = vec3(0.0);
                } else {
                    col = texture2D(textureSampler, vec2(uv.x, uv.y)).rgb;

                    // RGB shift
                    float shift = 0.001; // Tripled the shift amount
                    col.r = texture2D(textureSampler, vec2(uv.x + shift, uv.y)).r;
                    col.g = texture2D(textureSampler, vec2(uv.x, uv.y)).g;
                    col.b = texture2D(textureSampler, vec2(uv.x - shift, uv.y)).b;

                    // Vignette effect
                    float vignette = (1.0 - dot(uv - 0.5, uv - 0.5) * 0.8) * 1.0;
                    col *= vignette;
                    
                    // Add scanlines
                    float hscanline = sin(uv.y * 1200.0) * 0.03;  
                    float vscanline = sin(uv.x * 1200.0) * 0.01;  
                    col -= vec3(hscanline + vscanline);
                }

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        this.postProcess = new BABYLON.PostProcess(
            "crtEffect",
            "crt",
            ["time"],
            null,
            1.0,
            null,
            BABYLON.Texture.BILINEAR_SAMPLINGMODE,
            this.scene.getEngine(),
            false
        );

        this.postProcess.onApply = (effect) => {
            effect.setFloat("time", this.scene.getEngine().getDeltaTime() / 1000.0);
        };
    }

    enable() {
        this.scene.activeCamera.attachPostProcess(this.postProcess);
    }

    disable() {
        this.scene.activeCamera.detachPostProcess(this.postProcess);
    }
}