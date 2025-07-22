import ElementGis from "./elementGis.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";

/**
 * 线
 * {
 *      type: ElementType.Polygon,
 *      positions: [
 *          {
 *              lat: 43.37710501700073,
 *              lng: 88.41796875000001,
 *          },
 *          {
 *              lat: 43.16512263158296,
 *              lng: 88.95904541015625,
 *          },
 *          {
 *              lat: 43.177141346631714,
 *              lng: 89.57977294921876,
 *          }
 *      ]
 * }
 */
const LINE_WEIGHT = 5;
export default class Polygon extends ElementGis {
    constructor(ele, map) {
        super(ele, map);
    }

    init(ele) {
        super.init();

        this.polygon = this._getMesh(ele.graph.positions);
        let center = this.polygon.getBounds().getCenter();
        this.group.addLayer(this.polygon);

        this.initName(center);
    }

    changeColor(color) {
        this.color = color;
        if (this.polygon) {
            this.polygon.setStyle({ color: color });
        }
    }

    /**
     * 修改位置
     * @param {Object} positons 目标位置
     * @param {Number} duration 时间
     */
    changePosition(positions, duration = 0) {
        // TODO 动画移动需引用第三方L.Marker.movingMarker, 有这个需求再做吧
        if (this.polygon) {
            this.polygon.setLatLngs(positions);
            let center = this.polygon.getBounds().getCenter();

            if(this.nameTag){
                this.nameTag.setLatLng(center);
            }
        }
    }

    /**
     * 获取主体
     * @param {Array<{lat, lng}>} latlngs
     * @returns
     */
    _getMesh(latlngs) {
        // 创建并添加折线
        return L.polygon(latlngs, {
            color: this.color, // 线条颜色
            weight: LINE_WEIGHT, // 线条宽度
            opacity: 1, // 透明度
            lineJoin: "round", // 线条连接方式
            lineCap: "round", // 线条端点样式
            customId: "body",
        });
    }
}
