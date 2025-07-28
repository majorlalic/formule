import { ElementDef } from "./element/elementDef.js";
import { ElementData } from "./typeDef.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import {
    InteractionType,
    ModuleNames,
    EventNames,
    NameModes,
    ElementBehaviors,
    SceneType,
} from "../../js/const.js";
import { checkProps, fillTemplate, hasSameElement } from "../utils.js";
import { generateUUID } from "/common/js/utils.js";

/**
 * 场景类定义
 * @author wujiaqi
 */
export class SceneDef {
    /**
     * @type {String} 场景id
     */
    id;

    /**
     * @type {String} 场景类型
     */
    type;

    /**
     * @type {String} 场景配置
     */
    conf;

    /**
     * @type {Array<ElementDef>} 图元集合
     */
    elements;

    constructor(containerId) {
        this.initEventBus();
        this.containerId = containerId;
        this.eleMap = new Map();
    }

    initEventBus() {
        this.eventBus = EventBusWorker.getInstance(ModuleNames.Scene);
        this.eventBus.on(EventNames.InitScene, this.initScene.bind(this));
        this.eventBus.on(
            EventNames.EleDataChange,
            this.setDataBatch.bind(this)
        );
        this.eventBus.on(EventNames.ChangeAnchor, this.changeAnchor.bind(this));
        this.eventBus.on(EventNames.ChangeLayer, this.changeLayer.bind(this));
        this.eventBus.on(
            EventNames.RunEleBehavior,
            this.runEleBehavior.bind(this)
        );
        this.eventBus.on(
            EventNames.ChangeEleColor,
            this.changeEleColor.bind(this)
        );
        this.eventBus.on(
            EventNames.ChangePosition,
            this.changePosition.bind(this)
        );
        this.eventBus.on(
            EventNames.ChangeVisible,
            this.changeVisible.bind(this)
        );
         this.eventBus.on(
            EventNames.SelectEle,
            this.selectEle.bind(this)
        );
    }

    /**
     * 初始化场景
     * @param {Object} conf 场景配置
     * @param {Array<ElementDef>} elements 图元数组
     */
    initScene(conf, elements) {
        throw new Error("Method 'initScene' must be implemented.");
    }

    /**
     * 修改场景锚点
     * @param {Object} anchor 锚点配置
     */
    changeAnchor(anchor) {
        throw new Error("Method 'changeAnchor' must be implemented.");
    }

    /**
     * 修改位置
     * @param {String} eleId 图元id
     * @param {Object} position 位置
     */
    changePosition(eleId, position) {
        let ele = this.eleMap.get(eleId);
        if (ele) {
            ele.changePosition(position);
        } else {
            console.log(`未找到id为${id}的图元`);
        }
    }

    /**
     * 修改图元状态
     * @param {String} id 图元id
     * @param {String} color 图元颜色
     */
    changeEleColor(id, color) {
        let ele = this.eleMap.get(id);
        if (ele) {
            ele.changeColor(color);
        } else {
            console.log(`未找到id为${id}的图元`);
        }
    }

    /**
     * 修改是否可见
     * @param {String} id 图元id
     * @param {Boolean} visible 可见
     */
    changeVisible(id, visible) {
        let ele = this.eleMap.get(id);
        if (ele) {
            ele.changeVisible(visible);
        } else {
            console.log(`未找到id为${id}的图元`);
        }
    }

    /**
     * 执行图元行为
     * @param {ElementDef} eleId 图元
     * @param {String} behaviorName 行为名称
     * @param {Object} behaviorParam 行为参数
     */
    runEleBehavior(eleId, behaviorName, behaviorParam) {
        // 1. 查找图元
        let ele = this.eleMap.get(eleId);
        if (!ele) {
            console.log(`未找到id为${eleId}的图元`);
            return;
        }

        // 2. 校验图元动作定义
        if (!ElementBehaviors.hasOwnProperty(behaviorName)) {
            console.log(
                `图元动作尚未定义${behaviorName}, 请在ElementBehaviors中定义`
            );
            return;
        }

        // 3. 查找图元是否定义该行为
        if (
            !typeof ele[behaviorName] === "function" ||
            typeof ele[behaviorName] === "undefined"
        ) {
            console.log(`当期图元${ele.id}不存在${behaviorName}, 请联系管理员`);
            return;
        }

        let behavior = ElementBehaviors[behaviorName];

        // 4. 校验必要参数
        if (!checkProps(behaviorParam, behavior.scheme.map(i => i.field))) {
            console.log(
                `${behaviorName}缺少必须参数, behaviorParam必须包括${behavior.scheme.map(i => i.field).join(
                    ","
                )}`
            );
            return;
        }

        // 5. 处理参数中的模板
        let paramObj = {};
        for (const key in behaviorParam) {
            const param = behaviorParam[key];
            if (typeof param === "string" && /\$\{[^}]+\}/.test(param)) {
                paramObj[key] = fillTemplate(param, ele);
            } else {
                paramObj[key] = param;
            }
        }

        // TODO 如何保证参数的顺序
        // 6. 执行动作
        ele[behavior.name](...Object.values(paramObj));
    }

    /**
     * 图层切换
     * @param {Array<String>} layers
     */
    changeLayer(layers) {
        for (const [key, value] of this.eleMap) {
            value.visible = hasSameElement(value?.layer || [], layers || []);
        }
    }

    /**
     * 处理图元交互事件
     * @param {ElementDef} ele 图元
     * @param {InteractionType} type 交互类型
     * @param {Event} event 事件
     */
    handleEleEvent(ele, type, event) {
        // TODO 根据配置判断是否为内部事件
        let nameMode = ele?.conf?.nameMode;

        if (nameMode && nameMode == NameModes.Hover) {
            if (type == InteractionType.Hover) {
                ele.toggleName(true);
            } else if (type == InteractionType.HoverOut) {
                ele.toggleName(false);
            }
        }

        // if (type != InteractionType.Click) {
        //     return;
        // }

        this.eventBus.postMessage(
            EventNames.EleEvent,
            type,
            {
                id: ele.id,
                name: ele.name,
                color: ele.color,
                conf: ele.conf,
                data: ele.data,
            },
            {
                clientX: event?.clientX || event?.layerPoint?.x,
                clientY: event?.clientY || event?.layerPoint?.y,
            } // leaflet的event略有不同
        );
    }

    /**
     * 批量修改图元属性
     * @param {Array<ElementData>} datas
     */
    setDataBatch(eleDatas) {
        eleDatas.forEach(({ id, data }) => {
            let ele = this.eleMap.get(id);
            if (ele) {
                ele.setData(data);
            }
        });
    }
}

/**
 * 获取新的场景
 * @param {SceneType.name} type 场景类型
 * @param {String} name 场景名称
 */
export const getNewScene = (type, name) => {
    let conf = {};
    //TODO 根据场景类型初始化配置
    if (type == SceneType.Gis.name) {
        conf = {
            center: [43.0367, 88.84643],
            minZoom: 5,
            maxZoom: 18,
            zoom: 9,
            zoomControl: false,
            isSite: true,
        };
    } else if (type == SceneType.ThreeD.name) {
        conf = {
            position: {
                camera: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                target: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
            },
        };
    }
    return {
        id: generateUUID(10),
        name,
        type,
        conf,
        elements: [],
        anchors: [],
        layers: [],
    };
};
