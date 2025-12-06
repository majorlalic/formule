import { ElementDef } from "../../../common/core/def/elementDef.js";
import { NameModes } from "../../../common/core/const.js";

/**
 * 二维图元基类
 * @author wujiaqi
 */
export default class Element2d extends ElementDef {
    constructor(ele) {
        super(ele);
    }

    /**
     * 初始化
     */
    init() {
        this.group = new Konva.Group();
    }

    /**
     * 初始化名称
     * @param {{lat, lng}} position 位置
     */
    initName(position) {
        let nameMode = this.conf.nameMode || NameModes.Permanent;
        if (nameMode != NameModes.Hidden) {
            this.nameTag = this._getName(this.name, position);
            this.group.add(this.nameTag);
            if (nameMode == NameModes.Hover) {
                this.nameTag.visible(false);
            }
        }
    }

    /**
     * 显示/隐藏名称
     * @param {Boolean} isShow
     */
    toggleName(isShow) {
        if (this.nameTag) {
            this.nameTag.visible(isShow);
        }
    }

    /**
     * 修改颜色回调
     * @param {String} color
     */
    changeColor(color) {
        this.color = color;
        throw new Error("Method 'changeColor' must be implemented.");
    }

    /**
     * 修改可见回调
     */
    changeVisible(visible) {
        this.visible = visible;
        this.group.visible(this.visible);
        this.draw();
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 2) {
        this.group.to({
            x: position.x,
            y: position.y,
            duration: duration, // 动画时长 秒
            easing: Konva.Easings.EaseInOut, // 缓动
        });
    }

    _updateName(textObj, name) {
        textObj.text(name);
        // textObj.fill(color);
        textObj.offsetX(textObj.width() / 2);
        this.draw();
    }

    /**
     * 获取text对象
     * @param {String} value
     * @param {{x,y}} position 位置
     * @param {Number} y 向上偏移像素
     * @returns
     */
    _getName(value, position, y = 26) {
        var text = new Konva.Text({
            name: "name",
            text: value,
            fontSize: 16,
            fontFamily: "Calibri",
            fill: "#fff",
            x: position?.x || 0,
            y: position?.y || 0,
        });
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() + y); // 让它在图标上方
        return text;
    }

    /**
     * 通知场景需要更新, 貌似不调也ok
     */
    draw() {
        this.group.getLayer().batchDraw();
    }

    _findLayerById(name) {
        return this.group.findOne(`.${name}`);
    }
}
