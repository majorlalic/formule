import { SceneDef } from "../../js/def/sceneDef.js";
import { ElementType, InteractionType } from "../../js/const.js";
import { ElementDef } from "../../js/def/element/elementDef.js";
import Picture from "./element/picture.js";
import Point from "./element/point.js";
import Polyline from "./element/polyline.js";
import Polygon from "./element/polygon.js";
import Label from "./element/label.js";
import PointLine from "./element/pointLine.js";
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
        });

        this.stage = stage;
        let eleLayer = new Konva.Layer();

        // 创建一个大组，里面是内容图元
        this.layerGroup = new Konva.Group({
            draggable: true,
        });
        eleLayer.add(this.layerGroup);

        this._initConf(conf);

        this.stage.add(eleLayer);
        eleLayer.draw();
        this._initElements(elements);

        this.stage.on("click", (e) => {
            const { x, y } = stage.getPointerPosition(); // 获取点击位置的坐标
            console.log("x:", x, "y:", y);
        });

        setInterval(() => {
            console.log(this.getPosition());
        }, 2000);
        
    }

    /**
     * 初始化场景配置
     * @param {Object} conf
     */
    _initConf(conf) {
        let { position } = conf;
        if (position) {
            this.layerGroup.position({
                x: this.stage.width() / 2 + position.x,
                y: this.stage.height() / 2 + position.y,
            });
        }
    }

    /**
     * 初始化图元
     * @param {Array<ElementDef>} elements
     */
    _initElements(elements) {
        elements.forEach((ele) => {
            let type = ele.type;

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
                case ElementType.Picture:
                    target = new Picture(ele);
                    break;
                case ElementType.PointLine:
                    target = new PointLine(ele);
                    break;
                default:
                    console.warn(`gis场景暂未实现${type}类型`);
                    return;
            }
            target.group.zIndex = ele.zIndex || 1;
            this.layerGroup.add(target.group);
            this.eleMap.set(ele.id, target);

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

        this._sortLayerChildrenByZIndex(this.layerGroup);
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
    _sortLayerChildrenByZIndex(group) {
        const children = group.getChildren();

        const sorted = children.slice().sort((a, b) => {
            const za = typeof a.zIndex === "number" ? a.zIndex : 0;
            const zb = typeof b.zIndex === "number" ? b.zIndex : 0;
            return za - zb;
        });

        sorted.forEach((child) => child.moveToTop());
        group.getLayer().batchDraw();
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
        this.layerGroup.add(group);
        imageObj.src = url;
    }

    getPosition() {
        const stageCenter = {
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
        };

        const groupPos = this.layerGroup.position();

        return {
            x: groupPos.x - stageCenter.x,
            y: groupPos.y - stageCenter.y,
        };
    }
}
