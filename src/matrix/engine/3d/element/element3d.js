import { getCanvasTextWidth, moveToWorldPosition } from "../utils/tools.js";
import { getNameTexture } from "../utils/canvas.js";
import * as THREE from "three";
import { ElementDef } from "../../../common/core/def/elementDef.js";
import { NameModes } from "../../../common/core/const.js";

const NameHeight = 50;
/**
 * 三维图元基类
 * @author wujiaqi
 */
export default class Element3d extends ElementDef {
    constructor(ele) {
        super(ele);
    }

    /**
     * 初始化
     */
    init(ele) {
        this.group = new THREE.Group();
    }

    /**
     * 初始化名称
     * @param {Object} positon 位置
     */
    initName(positon) {
        let nameMode = this.conf?.nameMode || NameModes.Permanent;
        if (nameMode != NameModes.Hidden) {
            this.nameSprite = this._getName(this.name, positon);
            // 标记该sprite为label
            this.nameSprite.isName = true;
            this.group.add(this.nameSprite);
            if (nameMode == NameModes.Hover) {
                this.toggleName(false);
            }
        }
    }

    /**
     * 显示/隐藏名称
     * @param {Boolean} isShow
     */
    toggleName(isShow) {
        if (this.nameSprite) {
            this.nameSprite.visible = isShow;
        }
    }

    changeName(name) {
        if (this.nameSprite) {
            this.name = name;
            this._updateName(this.nameSprite, this.name, this.color);
        }
    }

    changeColor(color) {
        this.color = color;
        throw new Error("Method 'changeColor' must be implemented.");
    }

    changeVisible(visible) {
        this.visible = visible;
        this.group.visible = this.visible;
    }

    /**
     * 修改位置
     * @param {{x,y,z}} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 2000) {
        moveToWorldPosition(this.group, position, duration);
    }

    /**
     * 绑定事件
     * event交由对象定义
     */
    // _bindEvent() {
    //     this.group.userData.onClick = (e) => {
    //         console.log("click", this.name);
    //     };
    //     this.group.userData.onHover = (e) => {
    //         console.log("hover", this.name);
    //     };
    //     this.group.userData.onHoverOut = () => {
    //         console.log("hoverOut", this.name);
    //     };
    // }

    _updateName(sprite, value, color) {
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

    _getName(value, { x, y, z } = { x: 0, y: 0.5, z: 0 }) {
        if (/\$\{[^}]+\}/.test(value)) {
            value = this.name.replace(/\$\{[^}]+\}/g, "暂无数据");
        }
        let width = getCanvasTextWidth(value);
        let canvas = getNameTexture(value, width, NameHeight);

        var spriteMaterial = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas),
            sizeAttenuation: false,
            side: THREE.DoubleSide,
        });

        // 创建精灵对象
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(width / NameHeight, 1, 1);
        sprite.scale.multiplyScalar(0.03);
        sprite.name = "name";

        // 向上偏移一丢丢
        sprite.position.copy({ x: x, y: y, z: z });
        return sprite;
    }

    findLayerById(name) {
        return this.group.children.find((i) => i.name == name);
    }
}
