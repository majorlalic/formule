import { NameModes } from "../../../common/core/const.js";
import { ElementDef } from "../../../common/core/def/elementDef.js";

/**
 * 二维图元基类
 * @author wujiaqi
 */
export default class ElementGis extends ElementDef {
    constructor(ele, map) {
        super(ele);
        this.map = map;
    }

    /**
     * 初始化
     */
    init() {
        this.group = L.layerGroup([]);
    }

    /**
     * 初始化名称
     * @param {{lat, lng}} position 位置
     */
    initName(position) {
        let nameMode = this.conf.nameMode || NameModes.Permanent;
        if (nameMode != NameModes.Hidden) {
            this.nameTag = this._getName(this.name, position);
            this.group.addLayer(this.nameTag);
            if (nameMode == NameModes.Hover) {
                // 添加成功后立即隐藏
                this.nameTag.once("add", () => {
                    this.toggleName(false);
                });
            }
        }
    }

    /**
     * 显示/隐藏名称
     * @param {Boolean} isShow
     */
    toggleName(isShow) {
        if (this.nameTag) {
            this.nameTag.getElement().style.display = isShow ? "" : "none";
        }
    }

    /**
     * 修改颜色回调
     */
    changeColor(color) {
        throw new Error("Method 'colorChange' must be implemented.");
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 2) {
        throw new Error("Method 'changePosition' must be implemented.");
    }

    /**
     * 修改可见回调
     */
    changeVisible() {
        if (this.visible) {
            if (!this.map.hasLayer(this.group)) {
                this.map.addLayer(this.group);
            }
        } else {
            if (this.map.hasLayer(this.group)) {
                this.map.removeLayer(this.group);
            }
        }
    }

    /**
     * 获取text对象
     * @param {String} value
     * @param {Number} y 向上偏移像素
     * @returns
     */
    _getName(value, position) {
        let marker = L.marker(position, {
            icon: this._getNameIcon(value),
            customId: "name",
        });
        return marker;
    }

    _getNameIcon(value) {
        return L.divIcon({
            className: "", // 设为空，避免默认样式影响
            html: `<div class='element-name bgShadow'> ${value}</div>`,
        });
    }

    _findLayerById(name) {
        let found = null;
        this.group.eachLayer((layer) => {
            if (layer.options.customId === name) {
                found = layer;
            }
        });
        return found;
    }
}
