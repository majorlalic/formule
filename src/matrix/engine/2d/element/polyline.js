import Element2d from "./element2d.js";
/**
 * 折线
 * {
 *     type:ElementType.Polyline,
 * }
 */
export default class Polyline extends Element2d {
    constructor(ele) {
        super(ele);
    }

    async init(ele) {
        super.init();

        this.line = this._getMesh(ele.graph.positions);
        this.group.add(this.line);

        let center = this._getLineCenter(this.line);
        this.initName(center);
    }

    changeColor(color) {
        this.color = color;
        let line = this._findLayerById("body");
        if (line) {
            line.stroke(this.color);
        }
    }

    /**
     * 获取线对象
     * @param {Array<{x,y}>} positions
     * @returns
     */
    _getMesh(positions) {
        let arr = positions.flatMap((p) => [p.x, p.y]);
        return new Konva.Line({
            points: arr,
            stroke: this.color,
            strokeWidth: 5,
            lineCap: "round",
            lineJoin: "round",
            tension: 0,
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
