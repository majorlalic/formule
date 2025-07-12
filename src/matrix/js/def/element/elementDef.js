import { monitorAttr, setData, resolveMetaPlaceholders } from "../../utils.js";

/**
 * 图元类定义
 * @author wujiaiq
 */
export class ElementDef {
    /**
     * @type {String} 图元id
     */
    id;
    /**
     * @type {String} 名称
     */
    name;
    /**
     * @type {String} 颜色
     */
    color;
    /**
     * @type {Boolean} 显示状态
     */
    visible;
    /**
     * @type {Number} 层级
     */
    zIndex;
    /**
     * @type {Number} 图层
     */
    layer;
    /**
     * @type {Object} 图形配置
     */
    graph;
    /**
     * @type {Object} 扩展属性
     */
    data;
    /**
     * @type {String} 图元配置
     */
    conf;

    constructor(ele) {
        // 将属性赋给this
        Object.assign(this, ele);
        this.init(ele);
    }

    /**
     * 初始化
     */
    init() {
        throw new Error("Method 'init' must be implemented.");
    }

    initName() {
        throw new Error("Method 'initName' must be implemented.");
    }

    /**
     * 显示/隐藏名称
     * @param {Boolean} isShow
     */
    toggleName(isShow) {
        throw new Error("Method 'toggleName' must be implemented.");
    }

    /**
     * 修改颜色回调
     */
    changeColor(color) {
        throw new Error("Method 'changeColor' must be implemented.");
    }

    /**
     * 修改可见回调
     */
    changeVisible(visible) {
        throw new Error("Method 'changeVisible' must be implemented.");
    }

    /**
     * 修改位置
     * @param {Object} positon 目标位置
     * @param {Number} duration 时间
     */
    changePosition(position, duration = 2000) {
        throw new Error("Method 'changePosition' must be implemented.");
    }

    /**
     * 根据key,value设置扩展属性
     * @param {Object} data
     */
    setData(data) {
        // 将扩展属性更新到图元对象中
        setData(this.data, data, this.meta);
    }
}
