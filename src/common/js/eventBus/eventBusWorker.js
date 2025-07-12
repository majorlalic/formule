export { SCREEN_NAMES } from "./screenNames.js";
export { EVENT_NAMES, LAYOUT_EVENTS } from "./eventNames.js";

// 一些私有方法和属性的 Symbol;
const topicSymbol = Symbol("topic");
const handlerMap = Symbol("handlerMap");
const addEventListener = Symbol("addEventListener");
const checkBeforeAction = Symbol("checkBeforeAction");
const onWorkerMessage = Symbol("onWorkerMessage");
const reservedTopics = ["all", "All", "*", "."];
const windowTime = sessionStorage.getItem("windowTime")
// sharedWorker对象
const worker = new SharedWorker("/common/js/eventBus/sharedWorker.js", { name: "AppEventBusWorker" });
worker.port.start();

export default class EventBusWorker {
    static MAP = new Map();

    /**
     * 通过名称获取eventBus对象，若已存在则返回
     * @param {SCREEN_NAMES} topic 名称，唯一标识符
     * @return {EventBusWorker}
     */
    static getInstance(topic) {
        if (EventBusWorker.MAP.has(topic)) {
            return EventBusWorker.MAP.get(topic);
        }
        let eventBus = new EventBusWorker(topic);
        EventBusWorker.MAP.set(topic, eventBus);

        return eventBus;
    }

    // 当前所属实例的topic
    [topicSymbol];

    //保存所有事件回调
    [handlerMap];

    /**
     * @class EventBusWorker
     */
    constructor(topic) {
        if (!topic) throw new Error("必须指定一个topic");
        if (reservedTopics.includes(topic))
            throw new Error(`你订阅的主题${topic}为系统保留主题，请换一个易于辨识的主题`);
        if (!Reflect.has(window, "SharedWorker")) {
            console.warn(
                "当前浏览器环境不支持ShareWorker Api, 多页面通信能力无法使用，请考虑升级到支持此接口的浏览器, 详情参考：https://caniuse.com/?search=SharedWorker"
            );
        }

        this[topicSymbol] = topic;
        this[handlerMap] = {};

        worker.port.addEventListener("message", this[onWorkerMessage]);
        document.body.onbeforeunload = (e) => worker.port.postMessage({ type: "close-port" });
    }

    // 保存事件订阅者信息
    [addEventListener](eventName, callback, once = false) {
        this[checkBeforeAction](eventName, callback);
        let handlers = this[handlerMap][eventName] || ((this[handlerMap][eventName] = []), this[handlerMap][eventName]);
        if (handlers.every((h) => h.callback !== callback && !h.once)) {
            handlers.push({ callback, once });
        }
    }

    // 校验相关参数是否符合要求
    [checkBeforeAction](name, callback) {
        if (!name || Object.prototype.toString.call(name) !== "[object String]")
            throw new Error("事件名称无效:" + name);
        if (!callback || typeof callback !== "function") throw new Error("事件监听函数无效，请提供一个正确的监听函数");
    }

    // 处理来自sharedWorker的消息
    [onWorkerMessage] = (e) => {
        let { body, type } = e.data || {};
        if (!type)
            return console.error("事件总线收到一条消息，但是消息未定义类型，没有合适的方法处理，因此将被丢弃:", e);
        body = body || [];
        this.emit(type, ...(!!body[Symbol.iterator] ? body : [body]));
    };

    /**
     * 在本实例所属窗口内触发一个事件，仅仅会触发本页面中的监听回调
     * @param {EVENT_NAMES} eventName
     * @param data
     */
    emit(eventName, ...data) {
        let handlers = this[handlerMap][eventName];
        if (handlers && handlers.length > 0) {
            for (let i = 0; handlers[i]; i++) {
                const [handler] = handlers[i].once ? handlers.splice(i--, 1) : [handlers[i]];
                handler.callback(...data);
            }
        }
    }

    /**
     *  监听一个事件
     * @param {EVENT_NAMES} eventName
     * @param callback
     */
    on(eventName, callback) {
        this[addEventListener](eventName, callback, false);
    }

    /**
     *  取消监听事件
     * @param {EVENT_NAMES} eventName
     * @param callback
     */
    off(eventName, callback) {
        this[checkBeforeAction](eventName, callback, ["All"]);
        let handlers = this[handlerMap][eventName] || ((this[handlerMap][eventName] = []), this[handlerMap][eventName]);
        const index = handlers.findIndex((h) => h.callback == callback && !h.once);
        handlers.splice(index, 1);
    }

    // 一次性监听某个事件
    /**
     * 一次性监听某个事件
     * @param {EVENT_NAMES} eventName
     * @param callback
     */
    once(eventName, callback) {
        this[addEventListener](eventName, callback, true);
    }

    /**
     * 触发一个全局事件
     * @param {EVENT_NAMES} eventName
     * @param data
     */
    postMessage(eventName, ...data) {
        this[checkBeforeAction](eventName, () => {});
        if (worker) {
            worker.port.postMessage({ type: eventName, from: this[topicSymbol], body: data, windowTime: windowTime });
        }
    }
}
