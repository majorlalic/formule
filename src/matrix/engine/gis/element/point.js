import ElementGis from "./elementGis.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";

/**
 * 点
 * {
 *      type: ElementType.Point,
 *      icon: "camera",
 *      position: {
 *          lat: 43.37311218382002,
 *          lng: 88.12957763671876,
 *      },
 * }
 */
export default class Point extends ElementGis {
    constructor(ele, map) {
        super(ele, map);
    }

    async init(ele) {
        super.init();

        this.initName(ele.graph.position);

        this.point = await this._getMesh(ele.graph.icon, ele.graph.position);
        this.group.addLayer(this.point);
    }

    async changeColor(color) {
        this.color = color;
        if (this.point) {
            const icon = await this._getIcon(this.graph.icon, color);
            this.point.setIcon(icon);
        }
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 0) {
        // TODO 动画移动需引用第三方L.Marker.movingMarker, 有这个需求再做吧
        if (this.point) {
            this.point.setLatLng(position);
        }

        if (this.nameTag) {
            this.nameTag.setLatLng(position);
        }
    }

    /**
     * 获取图标
     * @param {String} iconName 图标名称
     * @param {{lat, lng}} position 位置
     * @returns
     */
    async _getMesh(iconName, position) {
        const icon = await this._getIcon(iconName, this.color);
        // 使用 L.marker 创建一个点并设置图标
        return L.marker(position, { icon: icon, customId: "body" });
    }

    async _getIcon(icon, color) {
        let canvas = await getDeviceCanvas(icon, color, true);
        return L.icon({
            iconUrl: canvas.toDataURL(), // 使用 canvas 的图像数据
            iconSize: [canvas.width, canvas.height], // 图标大小由 canvas 决定
            iconAnchor: [canvas.width / 2, canvas.height / 2], // 锚点在图标的中心
        });
    }
}
