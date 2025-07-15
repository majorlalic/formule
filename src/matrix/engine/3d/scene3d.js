import { SceneDef } from "../../js/def/sceneDef.js";
import { ElementType, InteractionType } from "../../js/const.js";
import { init } from "./init.js";

import * as THREE from "three";
import { TWEEN } from "three/addons/libs/tween.module.min.js";

import Point from "./element/point.js";
import Polygon from "./element/polygon.js";
import Polyline from "./element/polyline.js";
import Label from "./element/label.js";
import EventManager from "./utils/eventManager.js";
import { ElementDef } from "../../js/def/element/elementDef.js";
import Modal from "./element/modal.js";

/**
 * 三维场景
 * 使用three.js实现 https://threejs.org/
 * @author wujiaqi
 */
export default class Scene3d extends SceneDef {
    constructor(containerId) {
        super(containerId);
    }

    /**
     * 初始化场景
     * @param {Object} conf 场景配置
     * @param {Array<ElementDef>} elements 图元数组
     */
    initScene(conf, elements) {
        // 基础初始化
        let { camera, controls, scene, renderer, raycaster, mouse } = init(this.containerId);
        this.camera = camera;
        this.scene = scene;
        this.controls = controls;
        this.raycaster = raycaster;

        this.eleGroup = new THREE.Group();
        this.scene.add(this.eleGroup);

        // 初始化交互
        this.eventManager = new EventManager(this.camera, this.containerId);

        // 初始化场景配置
        this._initConf(conf);

        // 初始化图元
        this._initElements(elements);
    }

    /**
     * 初始化图元
     * @param {Array<ElementDef>} elements
     */
    _initElements(elements) {
        

        elements.forEach((ele) => {
            let { type } = ele.graph;

            let target;
            switch (type) {
                case ElementType.Point:
                    target = new Point(ele);
                    break;
                case ElementType.Polyline:
                    target = new Polyline(ele);
                    break;
                case ElementType.Polygon:
                    target = new Polygon(ele);
                    break;
                case ElementType.Label:
                    target = new Label(ele);
                    break;
                case ElementType.Modal:
                    target = new Modal(ele);
                    break;
                default:
                    console.warn(`gis场景暂未实现${type}类型`);
                    return;
            }
            this.eleGroup.add(target.group);
            this.eleMap.set(ele.id, target);

            // 统一管理
            if (ele.conf?.trigger && ele.conf?.trigger?.length != 0) {
                this.eventManager.add(target.group, {
                    onClick: (intersects, e) => this.handleEleEvent(target, InteractionType.Click, e),
                    onHover: (intersects, e) => this.handleEleEvent(target, InteractionType.Hover, e),
                    onHoverOut: () => this.handleEleEvent(target, InteractionType.HoverOut),
                });
            }

            // 对象内管理
            // this.eventManager.add(target.group);
        });
    }

    /**
     * 修改场景锚点
     * @param {Object} anchor 锚点配置
     */
    changeAnchor(anchor) {
        let position = anchor.position;
        this._move2Anchor(position.camera, position.target);
    }

    /**
     * 初始化场景配置
     * @param {Object} conf
     */
    _initConf(conf) {
        if (conf.hasOwnProperty("position")) {
            let { position } = conf;
            this._move2Anchor(position.camera, position.target);
        }
    }

    /**
     * 移动到指定视角
     * @param {{x,y,z}} cameraPosition
     * @param {{x,y,z}} controlTarget
     */
    _move2Anchor(cameraPosition, controlTarget) {
        this.controls.target.copy(controlTarget);
        new TWEEN.Tween(this.camera.position)
            .to(cameraPosition, 2000) // 设置动画时间（毫秒）
            .easing(TWEEN.Easing.Quadratic.InOut) // 设置缓动函数
            .onUpdate(() => {
                // this.camera.updateProjectionMatrix();
            })
            .start(); // 开始动画
    }

    logVision() {
        console.log({
            camera: this.camera.position,
            target: this.controls.target,
        });
    }
}
