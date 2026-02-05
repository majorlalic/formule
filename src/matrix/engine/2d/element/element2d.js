import { ElementDef } from "../../../common/core/def/elementDef.js";
import { NameModes } from "../../../common/core/const.js";

/**
 * 二维图元基类
 * @author wujiaqi
 */
export default class Element2d extends ElementDef {
    constructor(ele, ctx) {
        super(ele, ctx);
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
            this._nameOffset = {
                x: position?.x || 0,
                y: position?.y || 0,
            };
            this._nameVisibleFlag = nameMode != NameModes.Hover;
            if (this.scene?.nameLayer) {
                this.scene.nameLayer.add(this.nameTag);
                this._syncNamePosition();
            } else {
                this.group.add(this.nameTag);
            }
            if (nameMode == NameModes.Hover) {
                this._applyNameVisibility();
            }
        }
    }

    /**
     * 显示/隐藏名称
     * @param {Boolean} isShow
     */
    toggleName(isShow) {
        this._nameVisibleFlag = isShow;
        this._applyNameVisibility();
        if (this.scene?.nameLayer) {
            this.scene.nameLayer.batchDraw();
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
        this._applyNameVisibility();
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
        if (this.nameTag && this.scene?.nameLayer) {
            const targetX = position.x + (this._nameOffset?.x || 0);
            const targetY = position.y + (this._nameOffset?.y || 0);
            this.nameTag.to({
                x: targetX,
                y: targetY,
                duration: duration,
                easing: Konva.Easings.EaseInOut,
            });
        }
    }

    /**
     * 闪烁
     * @param {Number} interval 间隔(ms)
     * @param {Number} times 次数(0=一直闪)
     */
    blink(interval = 300, times = 0) {
        this.stopBlink();
        this._blinkOriginalVisible = this.visible !== false;
        let count = 0;
        this._blinkTimer = setInterval(() => {
            const nextVisible = !this.group.visible();
            this.changeVisible(nextVisible);
            count += 1;
            if (times > 0 && count >= times * 2) {
                this.stopBlink();
            }
        }, interval);
    }

    /**
     * 停止闪烁
     */
    stopBlink() {
        if (this._blinkTimer) {
            clearInterval(this._blinkTimer);
            this._blinkTimer = null;
        }
        if (this._blinkOriginalVisible !== undefined) {
            this.changeVisible(this._blinkOriginalVisible);
            this._blinkOriginalVisible = undefined;
        }
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
        if (this.scene?.nameLayer) {
            this._syncNamePosition();
        }
        this.group.getLayer().batchDraw();
        if (this.scene?.nameLayer) {
            this.scene.nameLayer.batchDraw();
        }
    }

    _findLayerById(name) {
        return this.group.findOne(`.${name}`);
    }

    _syncNamePosition() {
        if (!this.nameTag || !this.scene?.nameLayer) return;
        const pos = this.group.position();
        const x = pos.x + (this._nameOffset?.x || 0);
        const y = pos.y + (this._nameOffset?.y || 0);
        this.nameTag.position({ x, y });
        this._applyNameVisibility();
    }

    _applyNameVisibility() {
        if (!this.nameTag) return;
        const show = this.visible !== false && this._nameVisibleFlag !== false;
        this.nameTag.visible(show);
    }
}
