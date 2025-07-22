import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import Element3d from "./element3d.js";

/**
 * 图元-点类型定义
 * @type {PointDef}
 * {
 *      type: ElementType.Modal,
 *      path: './modal/LGGK/LGGK.dae',
 *      position: {
 *          x: 1,
 *          y: -0.2,
 *          z: 2,
 *      },
 *      scale: 5
 * }
 */
export default class Modal extends Element3d {
    constructor(ele) {
        super(ele);
    }

    async init(ele) {
        super.init();
        
        this.initName();

        let { path, position, scale } = ele.graph;
        let modal = await this._getMesh(path, scale);
        modal.visible = true;
        this.group.add(modal);
        this.group.position.copy(ele.graph.position);
    }

    _getMesh(path, scale) {
        // TODO 处理模型格式
        return new Promise((resolve, reject) => {
            // 添加模型
            const loader = new ColladaLoader();
            // loader.load("./modal/GD/GD.dae", collada => {

            loader.load(path, (collada) => {
                var avatar = collada.scene;
                avatar.name = "body";
                avatar.scale.multiplyScalar(scale);
                resolve(avatar);
            });
        });
    }
}
