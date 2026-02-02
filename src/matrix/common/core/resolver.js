import { ModuleNames, EventNames, InteractionType, ActionType } from "./const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { SceneDef } from "./def/sceneDef.js";
import { ElementDef } from "./def/elementDef.js";
import { Action, ElementData } from "./def/typeDef.js";
import { setData, initFrame, deepClone, evalRule } from "./utils.js";
import { ActionDispatcher } from "./action-dispatcher.js";
import DataPointStore from "./data-point-store.js";

const eventBus = EventBusWorker.getInstance(ModuleNames.Resolver);
let actionDispatcher;

/**
 * 解释器
 * @author wujiaqi
 */
export default class Resolver {
    // 图元id映射
    eleMap = new Map();
    // 数据点绑定映射
    bindingMap = new Map();
    // 数据点订阅取消函数
    bindingUnsubs = [];

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
        this.dataPointStore = new DataPointStore();

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
        this.eleMap = new Map();
        this.bindingMap = new Map();
        this._clearBindingSubscriptions();

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
        let bindingMap = new Map();
        eles.forEach((ele) => {
            // 绑定数据点
            (ele?.bindings || []).forEach((binding) => {
                if (!binding?.tag || !binding?.to) return;
                if (!bindingMap.has(binding.tag)) {
                    bindingMap.set(binding.tag, []);
                }
                bindingMap.get(binding.tag).push({
                    id: ele.id,
                    to: binding.to,
                    throttleMs: binding.throttleMs || 0,
                });
            });
            this.eleMap.set(ele.id, ele);
        });
        this.bindingMap = bindingMap;
        this._initBindingSubscriptions();
    }

    /**
     * 接收多种形式的数据变动
     * @param {*} datas 
     * [
     *     {
     *         "device.001.temp": 78.5,
     *         "device.001.status": "online",
     *     },
     * ];
     */
    _handleData(datas) {
        let tagUpdates = {};
        datas.forEach((item, index) => {
            const keys = Object.keys(item);
            if ("id" in item && "data" in item) {
                console.warn("已移除 id/data 更新路径，请改用数据点绑定。", item);
                return;
            }
            if ("bussinessId" in item && "data" in item) {
                console.warn(
                    "已移除 bussinessId/data 更新路径，请改用数据点绑定。",
                    item
                );
                return;
            }
            if (keys.find((key) => /^\$\{.+\}$/.test(key))) {
                console.warn("已移除 ${} 占位符更新路径，请改用数据点绑定。", item);
                return;
            }
            keys.forEach((key) => {
                tagUpdates[key] = item[key];
            });
        });

        // 数据点更新 -> 通过订阅触发绑定与规则
        this.dataPointStore.bulkSet(tagUpdates);
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
     * 处理自定义事件与规则
     * @param {Array<ElementData>} datas
     */
    _handleCustomEvent(eleDatas) {
        eleDatas.forEach(({ id, data, payload }) => {
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

            // 处理规则
            let rules = ele?.conf?.rules || [];
            rules.forEach((rule) => {
                if (!rule) return;

                if (rule.script) {
                    this._runRuleScript(rule.script, ele, payload || {});
                    return;
                }

                if (!rule?.when || !rule?.do) {
                    return;
                }
                const ok = evalRule(rule.when, {
                    data: ele.data,
                    payload: payload || {},
                    ele,
                    tag: (key) => this.dataPointStore.get(key),
                });
                if (!ok) return;
                this._applyRuleAction(rule, ele, payload || {});
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

    _normalizeDataPath(path) {
        if (!path || typeof path !== "string") return null;
        if (path.startsWith("data.")) {
            return path.slice(5).replace(/\./g, "|");
        }
        if (path.startsWith("data|")) {
            return path.slice(5);
        }
        return null;
    }

    _applyTagUpdate(tag, value) {
        let bindings = this.bindingMap.get(tag) || [];
        if (bindings.length === 0) return;

        let eleDatas = [];
        bindings.forEach(({ id, to }) => {
            let dataPath = this._normalizeDataPath(to);
            if (!dataPath) {
                console.warn(`bindings.to 仅支持 data 路径: ${to}`);
                return;
            }
            let data = {};
            data[dataPath] = value;
            eleDatas.push({
                id,
                data,
                payload: { [tag]: value },
            });
        });

        if (eleDatas.length === 0) return;
        this._handleCustomEvent(eleDatas);
        eventBus.postMessage(EventNames.EleDataChange, eleDatas);
    }

    _resolveRuleParams(params, ele, payload) {
        const resolveValue = (value) => {
            if (typeof value !== "string") return value;
            let raw = value;
            if (raw.startsWith("@") || raw.startsWith("$")) {
                raw = raw.slice(1);
            }
            if (raw.startsWith("data.")) {
                return this._getValueByDotPath(ele.data, raw.slice(5));
            }
            if (raw.startsWith("payload.")) {
                return this._getValueByDotPath(payload, raw.slice(8));
            }
            if (raw.startsWith("tag.")) {
                return this.dataPointStore.get(raw.slice(4));
            }
            return value;
        };

        const walk = (input) => {
            if (Array.isArray(input)) {
                return input.map((item) => walk(item));
            }
            if (input && typeof input === "object") {
                const out = {};
                Object.keys(input).forEach((key) => {
                    out[key] = walk(input[key]);
                });
                return out;
            }
            return resolveValue(input);
        };

        return walk(params);
    }

    _getValueByDotPath(obj, path) {
        if (!path) return undefined;
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }

    _applyRuleAction(rule, ele, payload) {
        const resolvedParams = this._resolveRuleParams(
            rule.params || {},
            ele,
            payload || {}
        );
        const action = {
            actionType: ActionType.RunEleBehavior,
            actionOptions: {
                behaviorName: rule.do,
                behaviorParam: resolvedParams,
            },
        };
        this._handeAction(ActionType.RunEleBehavior, ele, null, action);
    }

    _runRuleScript(script, ele, payload) {
        if (typeof script !== "string" || !script.trim()) return;
        try {
            const fn = new Function(
                "data",
                "payload",
                "ele",
                "tag",
                "dispatch",
                script
            );
            const dispatch = (doName, params = {}) => {
                this._applyRuleAction({ do: doName, params }, ele, payload);
            };
            const result = fn(
                ele.data,
                payload,
                ele,
                (key) => this.dataPointStore.get(key),
                dispatch
            );
            if (!result) return;
            if (Array.isArray(result)) {
                result.forEach((item) => {
                    if (item?.do) {
                        this._applyRuleAction(item, ele, payload);
                    }
                });
                return;
            }
            if (result?.do) {
                this._applyRuleAction(result, ele, payload);
            }
        } catch (err) {
            console.error("[Resolver] 规则脚本执行失败:", err);
        }
    }

    _clearBindingSubscriptions() {
        this.bindingUnsubs.forEach((unsub) => unsub());
        this.bindingUnsubs = [];
    }

    _initBindingSubscriptions() {
        this._clearBindingSubscriptions();
        for (const [tag, bindings] of this.bindingMap.entries()) {
            let throttleMs = 0;
            bindings.forEach((binding) => {
                if (binding.throttleMs && binding.throttleMs > 0) {
                    throttleMs =
                        throttleMs === 0
                            ? binding.throttleMs
                            : Math.min(throttleMs, binding.throttleMs);
                }
            });
            const unsub = this.dataPointStore.subscribe(
                tag,
                (value) => this._applyTagUpdate(tag, value),
                { throttleMs }
            );
            this.bindingUnsubs.push(unsub);
        }
    }
}
