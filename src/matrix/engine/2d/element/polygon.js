import Element2d from "./element2d.js";
import { hexToRgba } from "../../../common/core/utils.js";
/**
 * 面
 * {
 * type:ElementType.Polyline,
 * }
 */
export default class Polygon extends Element2d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    init(ele) {
        super.init();

        this.polygon = this._getMesh(ele.graph.positions);
        this.group.add(this.polygon);

        let center = this._getLineCenter(this.polygon);
        this.initName(center);
    }

    changeColor(color) {
        this.color = color;
        if (this.polygon) {
            this.polygon.stroke(this.color);
            this.polygon.fill(hexToRgba(this.color, 0.2));
        }
    }

    _getMesh(positions) {
        let arr = positions.flatMap((p) => [p.x, p.y]);
        return new Konva.Line({
            points: arr,
            stroke: this.color,
            strokeWidth: 5,
            fill: hexToRgba(this.color, 0.2),
            lineCap: "round",
            lineJoin: "round",
            closed: true,
            name: "body",
        });
    }

    /**
     * 获取线的中心点
     * @param {Konva.Line} line 线
     * @returns {x,y}
     */
    _getLineCenter(line) {
        const points = line.points();
        let sumX = 0,
            sumY = 0;
        const numPoints = points.length / 2;

        for (let i = 0; i < points.length; i += 2) {
            sumX += points[i];
            sumY += points[i + 1];
        }

        return {
            x: sumX / numPoints,
            y: sumY / numPoints,
        };
    }
}
