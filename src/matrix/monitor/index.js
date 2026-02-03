import { ElementType, EventNames, ModuleNames, InteractionType } from "../common/core/const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { setData } from "../common/core/utils.js";
import { isJSON } from "/common/js/utils.js";

const LOG_MAX_COUNT = 1000;

const eventBus = EventBusWorker.getInstance(ModuleNames.Resolver);
const eleMap = new Map();
let bindingMap = new Map();

var app = new Vue({
    el: "#app",
    data: {
        eleTypes: [],
        eles: [],
        datas: [],
        dataMap: {},
        columns: [],
        logs: [],
        logColumns: [],
    },
    components: {},
    created: function () {},
    mounted: function () {
        this.initEvent();

        this.columns = [
            {
                title: "键",
                dataIndex: "key",
                key: "key",
                width: 100,
                align: "center",
            },
            {
                title: "值",
                dataIndex: "value",
                key: "value",
                align: "center",
            },
            {
                title: "操作",
                dataIndex: "operate",
                key: "operate",
                align: "center",
                scopedSlots: { customRender: "operate" },
            },
        ];
        this.logColumns = [
            {
                title: "时间",
                dataIndex: "time",
                key: "time",
                width: 150,
                align: "center",
            },
            {
                title: "事件源",
                dataIndex: "origin",
                key: "origin",
                align: "center",
            },
            {
                title: "事件类型",
                dataIndex: "type",
                key: "type",
                align: "center",
            },
            {
                title: "动作",
                dataIndex: "action",
                key: "action",
                align: "center",
            },
        ];

        for (const key in ElementType) {
            this.eleTypes.push({
                key: ElementType[key],
                value: ElementType[key],
                label: key,
            });
        }
    },
    methods: {
        formattedJson(value) {
            if (isJSON(value)) {
                let obj = JSON.parse(value);
                return JSON.stringify(obj, null, 2);
            }
            return value;
        },
        lightEle(record) {
            this.eles.forEach((item) => {
                item.isLight = false;
            });
            if (bindingMap.has(record.key)) {
                let arr = bindingMap.get(record.key) || [];
                arr.forEach((item) => {
                    let target = this.eles.find((i) => i.id == item.id);
                    if (target) {
                        target.isLight = true;
                    }
                });
            }
        },
        getEleAttr(data) {
            let res = [];
            for (const key in data) {
                res.push({
                    key,
                    value: data[key],
                });
            }
            return res;
        },
        getEleBindings(ele) {
            return ele?.bindings || [];
        },
        initEvent() {
            // TODO 针对短时间多次触发需添加节流逻辑
            eventBus.on(EventNames.EleEvent, (type, ele, position) => {
                console.log(type, ele, position);
                this._handeAction(type, ele, position);
            });

            // 接收图元配置信息
            eventBus.on(EventNames.InitScene, (conf,eles) => {
                this._handleEleMap(eles);
            });

            // 处理数据变化
            eventBus.on(EventNames.DataChange, (datas) => {
                this._handleData(datas);
            });
        },
        /**
         * 处理图元交互事件
         * @param {InteractionType} type 类型
         * @param {ElementDef} ele 图元
         * @param {{clientX, clientY}} position 点击位置
         * @param {Action} action 动作 未传入动作时, 根据类型查找
         */
        _handeAction(type, ele, position, action = ele?.conf?.trigger.find((i) => i.type == type)) {
            this.logAction(ele, action);
        },
        /**
         * 处理图元交互事件
         * @param {ElementDef} ele 图元
         * @param {Action} action 动作 未传入动作时, 根据类型查找
         */
        logAction(ele, action) {
            this.logs.unshift({
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                type: Object.keys(InteractionType).find((key) => InteractionType[key] === action.type),
                origin: ele.name,
                action: action.actionType,
            });

            if (this.logs.length > LOG_MAX_COUNT) {
                this.logs.pop();
            }
        },
        _handleEleMap(eles) {
            let map = new Map();
            console.log(eles);
            this.datas = [];
            this.dataMap = {};
            this.logs = [];
            this.eles = [];

            eles.forEach((ele) => {
                this.$set(ele, "isLight", false);
                this.eles.push(ele);

                (ele?.bindings || []).forEach((binding) => {
                    if (!binding?.tag) return;
                    if (!map.has(binding.tag)) {
                        map.set(binding.tag, []);
                    }
                    map.get(binding.tag).push({
                        id: ele.id,
                        to: binding.to,
                        calc: binding.calc || "",
                        map: binding.map || null,
                        range: binding.range || null,
                        defaultValue: binding.default,
                    });
                });
                eleMap.set(ele.id, ele);
            });

            // 数据列表
            for (const [key] of map) {
                this.datas.push({ key, value: "" });
            }
            bindingMap = map;
        },
        /**
             * 接收多种形式的数据变动
             * @param {*} datas 
             * [
                    {
                        id: "129846712984321",
                        data: {
                            status: 1,
                        },
                    },
                    {
                        bussinessId: "19824718923",
                        data: {
                            status: 2,
                        },
                    },
                    {
                        "${dataPoint1}": 124124142131,
                    },
                ];
             */
        _handleData(datas) {
            datas.forEach((item) => {
                Object.keys(item).forEach((key) => {
                    this.dataMap[key] = item[key];
                    this._applyBindingUpdate(key, item[key]);
                });
            });

            this.datas = Object.keys(this.dataMap).map((key) => ({
                key,
                value: this.dataMap[key],
            }));
        },
        /**
         * 处理自定义事件
         * @param {Array<ElementData>} datas
         */
        _applyBindingUpdate(tag, value) {
            const bindings = bindingMap.get(tag) || [];
            bindings.forEach((binding) => {
                const ele = this.eles.find((i) => i.id === binding.id);
                if (!ele) return;
                const dataPath = this._normalizeDataPath(binding.to);
                if (!dataPath) return;
                const computed = this._applyBindingValue(
                    value,
                    binding.calc,
                    binding.map,
                    binding.range
                );
                const finalValue =
                    computed === undefined
                        ? binding.defaultValue
                        : computed;
                if (finalValue === undefined) return;
                let data = {};
                data[dataPath] = finalValue;
                setData(ele.data, data);
            });
        },

        _normalizeDataPath(path) {
            if (!path || typeof path !== "string") return null;
            if (path.startsWith("data.")) {
                return path.slice(5).replace(/\./g, "|");
            }
            if (path.startsWith("data|")) {
                return path.slice(5);
            }
            return null;
        },

        _applyBindingValue(value, calc, map, range) {
            if (calc) {
                try {
                    const fn = new Function("value", "prev", "tag", calc);
                    return fn(value, undefined, () => undefined);
                } catch (err) {
                    console.error("[Monitor] binding.calc 执行失败:", calc, err);
                    return undefined;
                }
            }
            if (map && typeof map === "object") {
                return map[value];
            }
            if (Array.isArray(range)) {
                for (const r of range) {
                    if (r == null) continue;
                    if (r.hasOwnProperty("gt") && !(value > r.gt)) continue;
                    if (r.hasOwnProperty("gte") && !(value >= r.gte)) continue;
                    if (r.hasOwnProperty("lt") && !(value < r.lt)) continue;
                    if (r.hasOwnProperty("lte") && !(value <= r.lte)) continue;
                    if (r.hasOwnProperty("eq") && !(value === r.eq)) continue;
                    return r.value;
                }
            }
            return value;
        },
    },
});

window.monitor = app;
