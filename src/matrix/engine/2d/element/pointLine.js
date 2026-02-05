import Element2d from "./element2d.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";
/**
 * 折线
 * {
 *     type: ElementType.PointLine,
 *     line: [
 *         {
 *             x: 1250,
 *             y: 348,
 *         },
 *         {
 *             x: 982,
 *             y: 545,
 *         },
 *         {
 *             x: 1263,
 *             y: 553,
 *         },
 *         {
 *             x: 974,
 *             y: 750,
 *         },
 *     ],
 *     position: -10,
 *     icon: 'uav',
 * }
 */
export default class PointLine extends Element2d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    async init(ele) {
        super.init();

        this.line = this._getMesh(ele.graph.positions);
        this.group.add(this.line);

        let pointPosition = this._getPointAtPercent(this.line, ele.graph.percent);
        let center = this._getLineCenter(this.line);
        this.initName(center);

        // 图标
        this.point = await this._getPoint(ele.graph.icon, pointPosition);
        this.group.add(this.point);

    }

    /**
     * 修改位置
     * @param {Number} percent 目标位置
     * @param {Number} duration 时间
     */
    changePosition(percent, duration = 2) {
        if (this.line && this.point) {
            let pointPosition = this._getPointAtPercent(this.line, percent);
            this.point.to({
                x: pointPosition.x,
                y: pointPosition.y,
                duration: duration, // 动画时长 秒
                easing: Konva.Easings.EaseInOut, // 缓动
            });
        }
    }

    async changeColor(color) {
        this.color = color;
        if (this.point) {
            let canvas = await getDeviceCanvas(this.graph.icon, this.color, true);
            point.image(canvas);
            this.draw();
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
     * 获取图标
     * @param {String} icon 图标名称
     * @param {{x,y}} position 位置
     * @returns
     */
    async _getPoint(icon, position) {
        let canvas = await getDeviceCanvas(icon, this.color, true);
        const canvasImage = new Konva.Image({
            name: "body",
            image: canvas, // 直接用缓存 canvas
            width: canvas.width,
            height: canvas.height,
            x: position.x,
            y: position.y,
            offset: {
                x: canvas.width / 2,
                y: canvas.height / 2,
            },
        });
        return canvasImage;
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

    /**
     * 获取折线的百分比坐标
     * @param {Konva.line} line 线
     * @param {Number} percent 百分比
     * @returns
     */
    _getPointAtPercent(line, percent) {
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        percent = percent / 100;
        const points = line.points();
        const segments = [];
        let totalLength = 0;

        // 计算每段的长度
        for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i],
                y1 = points[i + 1];
            const x2 = points[i + 2],
                y2 = points[i + 3];
            const len = Math.hypot(x2 - x1, y2 - y1);
            segments.push({ x1, y1, x2, y2, len });
            totalLength += len;
        }

        // 寻找目标位置
        let targetLen = totalLength * percent;
        let accumulated = 0;

        for (const seg of segments) {
            if (accumulated + seg.len >= targetLen) {
                const remaining = targetLen - accumulated;
                const t = remaining / seg.len;

                // 插值计算目标点
                const x = seg.x1 + (seg.x2 - seg.x1) * t;
                const y = seg.y1 + (seg.y2 - seg.y1) * t;
                return { x, y };
            }
            accumulated += seg.len;
        }

        // 如果超过总长度，返回最后一个点
        const last = segments[segments.length - 1];
        return { x: last.x2, y: last.y2 };
    }
}
