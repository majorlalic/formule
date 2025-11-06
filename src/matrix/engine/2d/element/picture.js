import Element2d from "./element2d.js";

/**
 * 图片
 * {
 *     type: ElementType.Image,
 *     position: {
 *         x: 50,
 *         y: 50,
 *     },
 *     url: "/matrix/engine/2d/image/bg.png",
 *     width: 106,
 *     height: 118,
 *  }
 */
export default class Picture extends Element2d {
    constructor(ele) {
        super(ele);
    }

    async init(ele) {
        super.init();

        let { x, y, url, width, height } = ele.graph;
        let repeatXTimes = ele.graph?.repeatXTimes || 1;
        let repeatYTimes = ele.graph?.repeatYTimes || 1;

        this.initName({
            x: x + width / 2,
            y: y,
        });

        var imageObj = new Image();
        imageObj.onload = () => {
            // var image = new Konva.Image({
            //     x: x,
            //     y: y,
            //     image: imageObj,
            //     width,
            //     height,
            //     name: "body",
            // });

            // this.group.add(image);

            const rect = new Konva.Rect({
                x: x,
                y: y,
                width: width * repeatXTimes,
                height: height * repeatYTimes,
                fillPatternImage: imageObj,
                fillPatternRepeat: "repeat",
                // fillPatternOffsetY: imageObj.height,
            });

            this.group.add(rect);
        };
        imageObj.src = url;
    }

    async changeColor(color) {
        this.color = color;
    }
}
