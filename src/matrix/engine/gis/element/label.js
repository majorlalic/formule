import ElementGis from "./elementGis.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";

/**
 * 点
 * {
 *      type: ElementType.Label,
 *      position: {
 *          lat: 43.37311218382002,
 *          lng: 88.12957763671876,
 *      },
 * }
 */
export default class Label extends ElementGis {
    constructor(ele, map) {
        super(ele, map);
    }

    init(ele) {
        super.init();

        this.initName(this.graph.position);

        this.text = this._getMesh(this.graph.value || '', ele.graph.position, this.color, ele.graph.bgShadow);
        this.group.addLayer(this.text);
    }

    changeColor(color) {
        this.color = color;
        if (this.text) {
            this.text.setIcon(this._getIcon(this.graph.value, color, this.graph.bgShadow));
        }
    }

    changeValue(value) {
        this.graph.value = value;
        if (this.text) {
            this.text.setIcon(this._getIcon(this.graph.value, this.color, this.graph.bgShadow));
        }
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 0) {
        let body = this._findLayerById("body");
        body.setLatLng(position);
    }

    /**
     * 获取主体
     * @param {String} value 文本内容
     * @param {{lat, lng}} position 位置
     * @param {String} color 颜色
     * @param {Boolean} bgShadow 是否有文本背景
     * @returns
     */
    _getMesh(value, position, color, bgShadow) {
        return L.marker(position, {
            icon: this._getIcon(value, color, bgShadow),
            customId: "body",
        });
    }

    /**
     * 获取icon
     * @param {String} value 文本内容
     * @param {String} color 颜色
     * @param {Boolean} bgShadow 是否有文本背景
     * @returns
     */
    _getIcon(value, color, bgShadow) {
        return L.divIcon({
            className: "", // 设为空，避免默认样式影响
            html: `<div class='element-text ${bgShadow ? "bgShadow" : ""}' style='color: ${color}'> ${value}</div>`,
        });
    }
}
