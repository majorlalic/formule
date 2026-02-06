import Element2d from "./element2d.js";
import { getDeviceCanvas } from "../../3d/utils/canvas.js";

/**
 * 点
 * {
 *      type: ElementType.Point,
 *      icon: "camera",
 *      position: {
 *          x: 5,
 *          y: 5
 *      },
 * }
 */
export default class Point extends Element2d {
    constructor(ele, ctx) {
        super(ele, ctx);
        this.iconScale = 2 / 3;
    }

    async init(ele) {
        super.init();

        // 名称
        this.initName();

        // 图标
        this.point = await this._getMesh(ele.graph.icon);
        this.group.add(this.point);

        this.group.position(ele.graph.position);
        this.draw();
    }

    /**
     * 颜色变化回调
     */
    async changeColor(color) {
        this.color = color;
        if(this.point){
            let canvas = await getDeviceCanvas(this.graph.icon, this.color, true);
            this.point.image(canvas);
            this.draw();
        }
    }

    /**
     * 获取图标
     * @param {*} icon
     * @returns
     */
    async _getMesh(icon) {
        let canvas = await getDeviceCanvas(icon, this.color, true);
        const width = canvas.width * this.iconScale;
        const height = canvas.height * this.iconScale;
        const canvasImage = new Konva.Image({
            name: "body",
            image: canvas, // 直接用缓存 canvas
            width,
            height,
            offset: {
                x: width / 2,
                y: height / 2,
            },
        });
        return canvasImage;
    }
}
