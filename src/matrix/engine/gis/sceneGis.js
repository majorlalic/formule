import { SceneDef } from "../../js/def/sceneDef.js";
import { ElementType, InteractionType } from "../../js/const.js";
import { ElementDef } from "../../js/def/element/elementDef.js";
import Point from "./element/point.js";
import Polyline from "./element/polyline.js";
import Polygon from "./element/polygon.js";
import Label from "./element/label.js";
import CirclePoint from "./element/circlePoint.js";
/**
 * 二维场景
 * 使用konva实现 https://konvajs.org/
 * @author wujiaqi
 */
export default class SceneGis extends SceneDef {
    constructor(containerId) {
        super(containerId);
    }

    /**
     * 初始化场景
     * @param {Object} conf 场景配置
     * @param {Array<ElementDef>} elements 图元数组
     */
    initScene(conf, elements) {
        this.map = this._initMap(conf);
        this.eleGroup = L.layerGroup([]).addTo(this.map);
        this._initElements(elements);
    }

    /**
     * 初始化场景配置
     * @param {Object} conf
     */
    _initMap(conf) {
        let { center, minZoom, maxZoom, zoom, zoomControl, isSite } = conf;
        var map = L.map(this.containerId, {
            center: center,
            zoom,
            minZoom,
            maxZoom,
            zoomControl,
        });
        L.tileLayer
            .chinaProvider("TianDiTu.Normal.Map", {
                maxZoom: 18,
                minZoom: 1,
            })
            .addTo(map);

        L.tileLayer
            .chinaProvider("TianDiTu.Normal.Annotion", {
                maxZoom: 18,
                minZoom: 1,
            })
            .addTo(map);

        if (isSite) {
            L.tileLayer
                .chinaProvider("TianDiTu.Satellite.Map", {
                    maxZoom: 18,
                    minZoom: 1,
                })
                .addTo(map);
        }

        map.on("click", function (e) {
            console.log("lat:", e.latlng.lat, ",lng:", e.latlng.lng); // [维度:lat, 经度:lng]
        });

        return map;
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
                    target = new Point(ele, this.map);
                    break;
                case ElementType.Polyline:
                    target = new Polyline(ele, this.map);
                    break;
                case ElementType.Polygon:
                    target = new Polygon(ele, this.map);
                    break;
                case ElementType.Label:
                    target = new Label(ele, this.map);
                    break;
                case ElementType.CirclePoint:
                    target = new CirclePoint(ele, this.map);
                    break;
                default:
                    console.warn(`gis场景暂未实现${type}类型`);
                    return;
            }

            this.eleGroup.addLayer(target.group);
            this.eleMap.set(ele.id, target);

            // TODO group内layer尚未就绪, 需延迟等待
            setTimeout(() => {
                this._addListenerToGroup(target.group, {
                    [InteractionType.Click]: (e) => this.handleEleEvent(target, InteractionType.Click, e),
                    [InteractionType.Hover]: (e) => this.handleEleEvent(target, InteractionType.Hover, e),
                    [InteractionType.HoverOut]: (e) => this.handleEleEvent(target, InteractionType.HoverOut, e),
                });
            }, 100);
        });
    }

    /**
     * 修改场景锚点
     * @param {Object} anchor 锚点配置
     */
    changeAnchor(anchor) {
        let { center, zoom } = anchor;
        this.map.setView(center, zoom);
    }

    /**
     * 打印当前中心和缩放
     */
    getCenterAndZoom() {
        console.log("中心:", this.map.getCenter());
        console.log("zoom:", this.map.getZoom());
    }

    _addListenerToGroup(group, callbackObj) {
        group.eachLayer((layer) => {
            if (typeof layer.on === "function") {
                layer.on("click", (e) => callbackObj[InteractionType.Click](e));
                layer.on("mouseover", (e) => callbackObj[InteractionType.Hover](e));
                layer.on("mouseout", (e) => callbackObj[InteractionType.HoverOut](e));
            }
        });
    }
}
