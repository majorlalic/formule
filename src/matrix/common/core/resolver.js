import { ModuleNames, EventNames } from "./const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { initFrame, deepClone } from "./utils.js";
import { ActionDispatcher } from "./action-dispatcher.js";
import DataPointStore from "./data-point-store.js";
import BindingEngine from "./binding-engine.js";
import ActionEngine from "./action-engine.js";
import SubscriptionManager from "./subscription-manager.js";

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
        // 数据点存储中心
        this.dataPointStore = new DataPointStore();
        // 数据点与图元绑定，数据驱动引擎
        this.bindingEngine = new BindingEngine(this.dataPointStore);
        // 订阅管理器
        this.subscriptionManager = new SubscriptionManager(this.dataPointStore);

        // 初始化场景
        this.initScene(scene);

        // 订阅事件
        this._initEvent();
        // 初始化动作处理器
        actionDispatcher = new ActionDispatcher(this, eventBus);
        // 动作驱动引擎
        this.actionEngine = new ActionEngine(actionDispatcher, this.dataPointStore);
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
        this.subscriptionManager.clear();

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
        // 绑定索引、订阅注册
        this.eleMap = new Map();
        eles.forEach((ele) => this.eleMap.set(ele.id, ele));
        this.bindingMap = this.bindingEngine.build(eles);
        this.subscriptionManager.setBindings(this.bindingMap, (tag, value) =>
            this._onTagUpdate(tag, value)
        );
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
            keys.forEach((key) => {
                tagUpdates[key] = item[key];
            });
        });

        // 数据点更新 -> 通过订阅触发绑定与动作
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

    _handleCustomEvent(eleDatas) {
        this.actionEngine.apply(this.eleMap, eleDatas);
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

    _onTagUpdate(tag, value) {
        // 单个数据点触发 bindings + actions
        const eleDatas = this.bindingEngine.applyTagUpdate(
            tag,
            value,
            this.bindingMap
        );
        if (eleDatas.length === 0) return;
        this._handleCustomEvent(eleDatas);
        eventBus.postMessage(EventNames.EleDataChange, eleDatas);
    }
}
