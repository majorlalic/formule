import ElementGis from "./elementGis.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";

/**
 * 线
 * {
 *      type: ElementType.Polyline,
 *      positions: [
 *          
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
 *      ],
 *      weight: 5
 * }
 */
const LINE_WEIGHT = 5;
export default class Polyline extends ElementGis {
    constructor(ele, map) {
        super(ele, map);
    }

    init(ele) {
        super.init();

        this.polyline = this._getMesh(ele.graph.positions, ele.graph?.weight || LINE_WEIGHT);
        let center = this.polyline.getBounds().getCenter();
        this.group.addLayer(this.polyline);

        this.initName(center);
    }

    changeColor(color) {
        this.color = color;
        if (this.polyline) {
            this.polyline.setStyle({ color: this.color });
        }
    }

    /**
     * 修改位置
     * @param {Object} positons 目标位置
     * @param {Number} duration 时间
     */
    changePosition(positions, duration = 0) {
        // TODO 动画移动需引用第三方L.Marker.movingMarker, 有这个需求再做吧
        if (this.polyline) {
            this.polyline.setLatLngs(positions);

            let center = this.polyline.getBounds().getCenter();
            if (this.nameTag) {
                this.nameTag.setLatLng(center);
            }
        }
    }

    /**
     * 获取主体
     * @param {Array<{lat, lng}>} latlngs
     * @param {Number} weight 线条宽度
     * @returns
     */
    _getMesh(latlngs, weight = LINE_WEIGHT) {
        // 创建并添加折线
        return L.polyline(latlngs, {
            color: this.color, // 线条颜色
            weight: weight, // 线条宽度
            opacity: 1, // 透明度
            lineJoin: "round", // 线条连接方式
            lineCap: "round", // 线条端点样式
            customId: "body",
        });
    }
}
