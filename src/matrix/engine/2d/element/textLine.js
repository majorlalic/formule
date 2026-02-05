import Element2d from "./element2d.js";

/**
 * 文本线
 * {
 *     type: ElementType.TextLine,
 *     positions: [{ x, y }, { x, y }],
 * }
 */
export default class TextLine extends Element2d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    init(ele) {
        super.init();

        this.line = this._getMesh(ele.graph.positions);
        this.group.add(this.line);

        const center = this._getLineCenter(this.line);
        this.initName(center);

        this._isTextDown = this.data?.isTextDown !== false;
        this.text = this._getText(this.data?.value ?? "-");
        this.group.add(this.text);
        this._updateTextPosition(center);
    }

    changeColor(color) {
        this.color = color;
        if (this.line) {
            this.line.stroke(this.color);
        }
        this.draw();
    }

    changeValue(value) {
        if (!this.text) return;
        this.text.text(value ?? "");
        const center = this._getLineCenter(this.line);
        this._updateTextPosition(center);
        this.draw();
    }

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

    _getText(value) {
        const text = new Konva.Text({
            text: value || "",
            fontSize: 16,
            fontFamily: "Calibri",
            fill: "#fff",
        });
        text.offsetX(text.width() / 2);
        return text;
    }

    _getLineCenter(line) {
        if (!line) return { x: 0, y: 0 };
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

    _updateTextPosition(center) {
        if (!this.text) return;
        const gap = 8;
        const y = this._isTextDown
            ? center.y + gap
            : center.y - gap - this.text.height();
        this.text.position({ x: center.x, y });
        this.text.offsetX(this.text.width() / 2);
    }
}
