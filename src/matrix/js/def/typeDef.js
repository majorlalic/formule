import { InteractionType, ActionTypes } from "../const.js";
/**
 * 动作
 */
export class Action {
    /**
     * @type {InteractionType} 交互类型
     */
    type;
    /**
     * @type {ActionTypes} 动作类型
     */
    actionType;
    /**
     * @type {Object} 动作参数
     */
    actionOptions;
}

/**
 * 图元数据
 */
export class ElementData {
    /**
     * @type {String} 场景id
     */
    id;

    /**
     * @type {Object} 数据对象
     */
    data;
}
