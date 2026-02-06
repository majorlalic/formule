import { SceneDef } from "../../common/core/def/sceneDef.js";
import { InteractionType, SceneType } from "../../common/core/const.js";
import { ElementDef } from "../../common/core/def/elementDef.js";
import { createElement } from "../../common/core/registry/elementRegistry.js";
import "./element/index.js"; // 注册图元
/**
 * 二维场景
 * 使用konva实现 https://konvajs.org/
 * @author wujiaqi
 */
export default class Scene2d extends SceneDef {
    constructor(containerId) {
        super(containerId);
    }

    /**
     * 初始化场景
     * @param {Object} conf 场景配置
     * @param {Array<ElementDef>} elements 图元数组
     */
    initScene(conf, elements) {
        let container = document.getElementById(this.containerId);
        var stage = new Konva.Stage({
            container: this.containerId, // id of container <div>
            width: container.offsetWidth,
            height: container.offsetHeight,
            draggable: conf?.draggable || false
        });

        this.stage = stage;
        this.eleLayer = new Konva.Layer();
        this.nameLayer = new Konva.Layer();
        this.nameLayer.listening(false);

        this._initConf(conf);

        this.stage.add(this.eleLayer);
        this.stage.add(this.nameLayer);
        this.eleLayer.draw();
        this.nameLayer.draw();
        this._initElements(elements);

        this.stage.on("click", (e) => {
            const { x, y } = stage.getPointerPosition(); // 获取点击位置的坐标
            console.log("x:", x, "y:", y);
        });
    }

    /**
     * 初始化场景配置
     * @param {Object} conf
     */
    _initConf(conf) {
        if (conf?.view) {
            const view = conf.view;
            const scale = Number(view.scale);
            if (Number.isFinite(scale) && scale > 0) {
                this.stage.scale({ x: scale, y: scale });
            }
            const offsetX = Number(view.offsetX);
            const offsetY = Number(view.offsetY);
            if (Number.isFinite(offsetX) || Number.isFinite(offsetY)) {
                this.stage.position({
                    x: Number.isFinite(offsetX) ? offsetX : this.stage.x(),
                    y: Number.isFinite(offsetY) ? offsetY : this.stage.y(),
                });
            }
        }
        if (conf.draggable) {
            this._openDragAndZoom(this.stage, conf?.dragDirection);
        }
    }

    _openDragAndZoom(stage, dragDirection = ['x','y']) {
        let options = {};
        const scaleBy = options.scaleBy || 1.05;
        const minScale = options.minScale || 0.2;
        const maxScale = options.maxScale || 5;
        const enableAnimation = options.enableAnimation !== false; // 默认开启动画
        const animationDuration = options.animationDuration || 0.2;

        // 启用拖拽
        stage.draggable(true);

        let containX = dragDirection.includes('x');
        let containY = dragDirection.includes('y');
        stage.dragBoundFunc(function (pos) {
            return {
                x: containX ? pos.x : this.x(), 
                y: containY ? pos.y : this.y(),
            };
        });

        // 鼠标滚轮缩放
        stage.on("wheel", (e) => {
            e.evt.preventDefault();

            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            let newScale =
                direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            newScale = Math.max(minScale, Math.min(maxScale, newScale));

            // 计算鼠标点对应的世界坐标
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            // 新位置：保证缩放后鼠标指向不偏移
            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };

            if (enableAnimation) {
                // 平滑动画缩放
                if (stage._zoomTween) stage._zoomTween.pause();

                const tween = new Konva.Tween({
                    node: stage,
                    duration: animationDuration,
                    scaleX: newScale,
                    scaleY: newScale,
                    x: newPos.x,
                    y: newPos.y,
                    easing: Konva.Easings.EaseInOut,
                    onFinish: () => (stage._zoomTween = null),
                });

                stage._zoomTween = tween;
                tween.play();
            } else {
                // 立即缩放
                stage.scale({ x: newScale, y: newScale });
                stage.position(newPos);
                stage.batchDraw();
            }
        });

        // 双击重置视图
        stage.on("dblclick", () => {
            if (enableAnimation) {
                const tween = new Konva.Tween({
                    node: stage,
                    duration: animationDuration,
                    scaleX: 1,
                    scaleY: 1,
                    x: 0,
                    y: 0,
                    easing: Konva.Easings.EaseInOut,
                });
                tween.play();
            } else {
                stage.scale({ x: 1, y: 1 });
                stage.position({ x: 0, y: 0 });
                stage.batchDraw();
            }
        });
    }

    /**
     * 初始化图元
     * @param {Array<ElementDef>} elements
     */
    _initElements(elements) {
        elements.forEach((ele) => {
            const target = createElement(SceneType.TwoD, ele, { scene: this });
            if (!target) return;
            target.group.zIndex = ele.zIndex || 1;
            this.eleLayer.add(target.group);
            this.eleMap.set(ele.id, target);
            if (typeof target._syncNamePosition === "function") {
                target._syncNamePosition();
            }

            // 统一管理
            // if (ele.conf?.trigger && ele.conf?.trigger?.length != 0) {
            //     this.eventManager.add(target.group, {
            //         onClick: (intersects, e) => this.handleEleEvent(target, InteractionType.Click, e),
            //         onHover: (intersects, e) => this.handleEleEvent(target, InteractionType.Hover, e),
            //         onHoverOut: () => this.handleEleEvent(target, InteractionType.HoverOut),
            //     });
            // }

            target.group.on("mouseover", (e) => {
                this.handleEleEvent(target, InteractionType.Hover, e);
            });
            target.group.on("mouseout", (e) => {
                this.handleEleEvent(target, InteractionType.HoverOut, e);
            });
            target.group.on("mousedown", (e) => {
                this.handleEleEvent(target, InteractionType.Click, e.evt);
            });

            // 对象内管理
            // this.eventManager.add(target.group);
        });

        this._sortLayerChildrenByZIndex(this.eleLayer);
    }

    /**
     * 修改场景锚点
     * @param {Object} anchor 锚点配置
     */
    changeAnchor(anchor) {
        throw new Error("Method 'changeAnchor' must be implemented.");
    }

    /**
     * Konva不能像css一样用数值设置zIndex, 只有moveToTop等方法
     * 将group内的所有图元根据zIndex属性显示层级
     * @param {*} group
     */
    _sortLayerChildrenByZIndex(layer) {
        const children = layer.getChildren();

        const sorted = children.slice().sort((a, b) => {
            const za = typeof a.zIndex === "number" ? a.zIndex : 0;
            const zb = typeof b.zIndex === "number" ? b.zIndex : 0;
            return za - zb;
        });

        sorted.forEach((child) => child.moveToTop());
        layer.batchDraw();
    }

    /**
     * 初始化背景
     * @param {{ x, y, url, width, height }} background
     * @returns
     */
    _initBackground(background) {
        if (!!!background) {
            return;
        }
        var imageObj = new Image();
        let { x, y, url, width, height } = background;
        let group = new Konva.Group();
        imageObj.onload = () => {
            var image = new Konva.Image({
                x: x,
                y: y,
                image: imageObj,
                width,
                height,
            });
            group.add(image);
        };
        group.zIndex = -1;
        this.eleLayer.add(group);
        imageObj.src = url;
    }
}
