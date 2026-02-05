import Element2d from "./element2d.js";
/**
 * text
 * {
 *    type:ElementType.Label,
 * }
 */
export default class Label extends Element2d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    init(ele) {
        super.init();

        this.initName();

        this.text = this._getMesh(this.graph?.value || '');
        this.group.add(this.text);
        this.group.position(ele.graph.position);
    }

    changeColor(color) {
        if (this.text) {
            this.color = color; 
            this.text.fill(color);
        }
    }

    changeValue(value) {
        this.graph.value = value;
        if (this.text) {
            this.text.text(value);
            // textObj.fill(color);
            this.text.offsetX(this.text.width() / 2);
            this.draw();
        }
    }

    _getMesh(value) {
        let text = new Konva.Text({
            text: value || "",
            fontSize: 16,
            fontFamily: "Calibri",
            fill: this.color,
            name: "body",
        });
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2); // 让它在图标上方
        return text;
    }
}
