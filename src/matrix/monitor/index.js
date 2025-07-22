import { ElementType, EventNames, ModuleNames, InteractionType, ActionTypes } from "../js/const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { SceneDef } from "../js/def/sceneDef.js";
import { ElementDef } from "../js/def/element/elementDef.js";
import { Action, ElementData } from "../js/def/typeDef.js";
import { collectPlaceholders, setData, checkProps, fillTemplate } from "../js/utils.js";
import { isJSON } from "/common/js/utils.js";

const LOG_MAX_COUNT = 1000;

const eventBus = EventBusWorker.getInstance(ModuleNames.Resolver);
const eleMap = new Map();
let placeholderMap = new Map();
const bussinessIdMap = new Map();

var app = new Vue({
    el: "#app",
    data: {
        eleTypes: [],
        eles: [],
        datas: [],
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
            if (placeholderMap.has(record.key)) {
                let arr = placeholderMap.get(record.key) || [];
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
            this.logs = [];
            this.eles = [];

            eles.forEach((ele) => {
                this.$set(ele, "isLight", false);
                this.eles.push(ele);

                if (ele?.conf?.bussinessId) {
                    bussinessIdMap.set(ele.conf.bussinessId, ele.id);
                }

                // 从data和conf属性中获取占位属性
                let placeholders = collectPlaceholders({ data: ele.data });
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
                eleMap.set(ele.id, ele);
            });

            // 数据列表
            for (const [key, value] of map) {
                this.datas.push({
                    key,
                    value: "",
                });
            }
            placeholderMap = map;
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
            let eleDatas = [];
            datas.forEach((item, index) => {
                const keys = Object.keys(item);
                if ("id" in item && "data" in item) {
                    eleDatas.push({
                        id: item.id,
                        data: item.data,
                    });
                } else if ("bussinessId" in item && "data" in item) {
                    let id = bussinessIdMap.get(item.bussinessId);
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
                        // 更新数据列表
                        let target = this.datas.find((i) => i.key == keyItem);
                        if (target) {
                            target.value = item["${" + keyItem + "}"];
                        }

                        if (placeholderMap.has(keyItem)) {
                            let eles = placeholderMap.get(keyItem);
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

            this._handleCustomEvent(eleDatas);
        },
        /**
         * 处理自定义事件
         * @param {Array<ElementData>} datas
         */
        _handleCustomEvent(eleDatas) {
            eleDatas.forEach(({ id, data }) => {
                let ele = this.eles.find((i) => id == i.id);
                if (ele) {
                    setData(ele, data);
                }

                // 处理自定义事件
                let actions = ele?.conf?.trigger.filter((i) => i?.type == InteractionType.Custom) || [];
                actions.forEach((action) => {
                    this.logAction(ele, action);
                });
            });
        },
    },
});

window.monitor = app;
