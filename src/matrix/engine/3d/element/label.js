import { getNameTexture } from "../utils/canvas.js";
import { getCanvasTextWidth } from "../utils/tools.js";
import Element3d from "./element3d.js";
import * as THREE from "three";

/**
 * 文字标签
 * 通过读取name显示动态数据
 */
const NameHeight = 50;
export default class Label extends Element3d {
    constructor(ele) {
        super(ele);
    }

    /**
     * 初始化
     */
    init(ele) {
        super.init();

        this.initName();

        this.mesh = this._getMesh(ele.data.value || '');
        this.group.add(this.mesh);
        this.group.position.copy(ele.graph.position);
    }

    changeColor(color) {
        if (this.mesh) {
            this._updateValue(sprite, this.name, color);
        }
    }

    changeValue(value) {
        if(this.mesh){
            this._updateValue(this.mesh, value, this.color);
        }
    }

    _updateValue(sprite, value, color) {
        let width = getCanvasTextWidth(value);
        let canvas = getNameTexture(value, width, NameHeight, color);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        // 替换 Sprite 的贴图
        sprite.material.map = texture;

        // 每次修改 canvas 内容后，记得标记更新
        texture.needsUpdate = true;
        sprite.scale.set(width / NameHeight, 1, 1);
        sprite.scale.multiplyScalar(0.03);
    }

    _getMesh(value) {
        if (/\$\{[^}]+\}/.test(value)) {
            value = "暂无数据";
        }
        let width = getCanvasTextWidth(value);
        let canvas = getNameTexture(value, width, NameHeight, this.color);

        var spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas),
            sizeAttenuation: false,
            side: THREE.DoubleSide,
        });

        // 创建精灵对象
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(width / NameHeight, 1, 1);
        sprite.scale.multiplyScalar(0.03);
        sprite.name = "body";

        return sprite;
    }
}
