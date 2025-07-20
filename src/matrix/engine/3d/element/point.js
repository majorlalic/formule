import { getDeviceCanvas } from "../utils/canvas.js";
import * as THREE from "three";
import Element3d from "./element3d.js";
import { ElementType } from "/matrix/js/const.js";

/**
 * 点
 * {
 *      type: ElementType.Point,
 *      icon: "camera",
 *      position: {
 *          x: 5,
 *          y: 5,
 *          z: 5,
 *      },
 * }
 */
export default class Point extends Element3d {
    nameHeight = 50;

    constructor(ele) {
        super(ele);
    }

    async init(ele) {
        super.init();

        this.initName();

        this.pointSprite = await this._getMesh(ele.graph.icon);
        this.group.add(this.pointSprite);

        this.group.position.copy(ele.graph.position);
    }

    async changeColor(color) {
        if (this.pointSprite) {
            let canvas = await getDeviceCanvas(this.graph.icon, color, true);
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            this.pointSprite.material.map = texture;
            texture.needsUpdate = true;
        }
    }

    async _getMesh(icon) {
        let canvas = await getDeviceCanvas(icon, this.color, true);
        let texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        let spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            sizeAttenuation: false,
            depthTest: false,
            side: THREE.DoubleSide,
        });
        // 需复制一份材质, 避免影响同类型的设备
        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.name = "body";
        sprite.scale.set(0.05, 0.05, 0.05);
        return sprite;
    }
}