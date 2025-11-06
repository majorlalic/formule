import { ModuleNames, EventNames, InteractionType } from "./const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { SceneDef } from "./def/sceneDef.js";
import { ElementDef } from "./def/element/elementDef.js";
import { Action, ElementData } from "./def/typeDef.js";
import { collectPlaceholders, setData, initFrame, deepClone } from "./utils.js";
import { ActionDispatcher } from "./action-dispatcher.js";

const eventBus = EventBusWorker.getInstance(ModuleNames.Resolver);
let actionDispatcher;

/**
 * 解释器
 * @author wujiaqi
 */
export default class Resolver {
    // 业务id映射
    bussinessIdMap = new Map();
    // 图元id映射
    eleMap = new Map();
    // 占位符映射
    placeholderMap = new Map();

    /**
     * 初始化场景
     * @param {String} containerId 容器id
     * @param {SceneDef} scene 场景
     */
    constructor(containerId, scene, app) {
        this.app = app;
        // TODO 模拟数据 接口实现

        this.containerId = containerId;
        this.eventBus = eventBus;
        this.scene = scene;

        // 初始化场景
        this.initScene(scene);

        // 订阅事件
        this._initEvent();
        // 初始化动作处理器
        actionDispatcher = new ActionDispatcher(this, eventBus);
    }

    /**
     * 初始化场景
     * @param {SceneDef} scene
     */
    initScene(scene) {
        let cloneScene = deepClone(scene);
        // 重置图元映射
        this.bussinessIdMap = new Map();
        this.eleMap = new Map();
        this.placeholderMap = new Map();

        initFrame(this.containerId, cloneScene).then(({ id, type, conf, elements }) => {
            eventBus.postMessage(EventNames.InitScene, conf, elements);
            this._handleEleMap(elements);
        });
    }

    _initEvent() {
        // TODO 针对短时间多次触发需添加节流逻辑
        eventBus.on(EventNames.EleEvent, (type, ele, position) => {
            // console.log(type, ele, position);
            this._handeAction(type, ele, position);
        });

        // 处理数据变化
        eventBus.on(EventNames.DataChange, (datas) => {
            this._handleData(datas);
        });

        // 图层操作
        eventBus.on(EventNames.LayerChange, (layers) => {
            this._handleLayer(layers);
        });
    }

    /**
     * 处理图元信息
     * @param {Array<ElementDef>} eles
     */
    _handleEleMap(eles) {
        let map = new Map();
        eles.forEach((ele) => {
            if (ele?.conf?.bussinessId) {
                this.bussinessIdMap.set(ele.conf.bussinessId, ele.id);
            }

            // 从data和conf属性中获取占位属性
            let placeholders = collectPlaceholders(ele.data);
            placeholders.forEach(({ key, path }) => {
                if (map.has(key)) {
                    map.get(key).push({
                        id: ele.id,
                        path,
                    });
                } else {
                    map.set(key, [
                        {
                            id: ele.id,
                            path,
                        },
                    ]);
                }
            });
            this.eleMap.set(ele.id, ele);
        });
        this.placeholderMap = map;
    }

    /**
     * 接收多种形式的数据变动
     * @param {*} datas 
     * [
            {
                id: "129846712984321",
                data: {
                    valueA: 1,
                },
            },
            {
                bussinessId: "19824718923",
                data: {
                    valueB: 2,
                },
            },
            {
                "${dataPoint1}": 124124142131,
            },
        ];
     */
    _handleData(datas) {
        let eleDatas = [];
        datas.forEach((item, index) => {
            const keys = Object.keys(item);
            if ("id" in item && "data" in item) {
                eleDatas.push({
                    id: item.id,
                    data: item.data,
                });
            } else if ("bussinessId" in item && "data" in item) {
                let id = this.bussinessIdMap.get(item.bussinessId);
                if (id) {
                    eleDatas.push({
                        id: id,
                        data: item.data,
                    });
                }
            } else if (keys.find((key) => /^\$\{.+\}$/.test(key))) {
                // key 是类似 ${xxx} 的格式
                let arrs = keys.filter((key) => /^\$\{.+\}$/.test(key)).map((key) => key.match(/^\$\{(.+)\}$/)[1]);
                arrs.forEach((keyItem) => {
                    if (this.placeholderMap.has(keyItem)) {
                        let eles = this.placeholderMap.get(keyItem);
                        eles.forEach((ele) => {
                            let data = {};
                            data[ele.path.join("|")] = item["${" + keyItem + "}"];
                            let eleData = {
                                id: ele.id,
                                data,
                            };
                            eleDatas.push(eleData);
                        });
                    }
                });
            } else {
                console.error(`${item} 是未知类型`);
            }
        });

        // 处理自定义事件
        this._handleCustomEvent(eleDatas);

        // 统一发送给场景去处理
        eventBus.postMessage(EventNames.EleDataChange, eleDatas);
    }

    /**
     * 处理图层变化
     * ['device', 'area']
     * @param {Array<String>} layers
     */
    _handleLayer(layers) {
        eventBus.postMessage(EventNames.ChangeLayer, layers);
    }

    /**
     * 处理自定义事件
     * @param {Array<ElementData>} datas
     */
    _handleCustomEvent(eleDatas) {
        eleDatas.forEach(({ id, data }) => {
            let ele = this.eleMap.get(id);
            // 更新ele属性
            if (!ele) {
                return;
            }
            setData(ele.data, data);

            // 处理自定义事件
            let actions = ele?.conf?.trigger.filter((i) => i?.type == InteractionType.Custom) || [];
            actions.forEach((action) => {
                this._handeAction(action.actionType, ele, null, action);
            });
        });
    }

    /**
     * 处理图元交互事件
     * @param {InteractionType} type 类型
     * @param {ElementDef} ele 图元
     * @param {{clientX, clientY}} position 点击位置
     * @param {Action} action 动作 未传入动作时, 根据类型查找
     */
    _handeAction(type, ele, position, action = ele?.conf?.trigger.find((i) => i.type == type)) {
        // 给动作分发器处理
        actionDispatcher.dispatch(ele, action, position);
    }
}
