import Point from "./point.js";

/**
 * 带圈的点
 * {
 *      type: ElementType.CirclePoint,
 *      icon: "camera",
 *      radius: 20000,
 *      position: {
 *          lat: 43.37311218382002,
 *          lng: 88.12957763671876,
 *      },
 * }
 */
export default class CirclePoint extends Point {
    constructor(ele, map) {
        super(ele, map);
    }

    async init(ele) {
        super.init(ele);

        this.circle = this._getCircle(ele.graph.position, this.color, ele.graph.radius);
        this.group.addLayer(this.circle);
    }

    async changeColor(color) {
        this.color = color;
        if (this.circle) {
            this.circle.setStyle({
                color: color, // 边框颜色
                fillColor: color, // 填充颜色
            });
        }
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 0) {
        super.changePosition(position, duration);
        if (this.circle) {
            this.circle.setLatLng(position);
        }
    }

    _getCircle(position, color, radius) {
        return L.circle(position, {
            color, // 边框颜色
            fillColor: color, // 填充颜色
            fillOpacity: 0.2, // 填充透明度
            radius: radius, // 半径（米）
            customId: "circle",
        });
    }
}
