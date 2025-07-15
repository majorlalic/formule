import Resolver from "/matrix/js/resolver.js";
import { scenes } from "/matrix/js/mock.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { ModuleNames, EventNames, Colors } from "/matrix/js/const.js";
import { loadVueComponent } from "/matrix/js/vue-component-loader.js";
import { InteractionType, PopComponents, ActionTypes, ElementType } from "../matrix/js/const.js";

const eventBus = EventBusWorker.getInstance(ModuleNames.Scene);

let resolver;
var app = new Vue({
    el: "#app",
    provide() {
        return {
            eventBus,
        };
    },
    data: {
        orgId: "",
        layers: [],
    },
    components: {
        // "live-video": () => loadVueComponent("/matrix/components/live-video.html"),
    },
    created: function () {},
    mounted: function () {
        // TODO 模拟数据 接口实现
        let scene = scenes[0];
        resolver = new Resolver("scene", scene);
        this.layers = scene?.layers || [];

        let presures = this.presure(0);
        console.log("presures",presures);
        
        scene.elements = [...scene.elements, ...presures];

        setTimeout(() => {
            this.mockData();
        }, 3000);
    },
    methods: {
        layerChange(layer) {
            layer.checked = !layer.checked;
            let checked = this.layers.filter((i) => i.checked).map((i) => i.name);
            eventBus.postMessage(EventNames.LayerChange, checked);
        },
        mockData() {
            let datas = [
                {
                    id: "5123163512",
                    data: {
                        visible: false,
                        color: "#ff3040",
                    },
                },
                {
                    bussinessId: "19824718923",
                    data: {
                        color: "#7B7A82",
                    },
                },
                {
                    "${dataPoint1}": 0,
                    "${testPoint3}": 14123123,
                    "${testPoint4}": 5234123123,
                    "${512116351141232-position}": 60,
                },
            ];

            eventBus.postMessage(EventNames.DataChange, datas);

            this.count = 1;
            this.mockDataPoint();
        },
        mockDataPoint() {
            let datas = [
                {
                    "${dataPoint1}": ++this.count,
                    "${testPoint3}": moment().format("YYYY-MM-DD HH:mm:ss"),
                    "${129846712984321-state}": this.count,
                },
            ];
            eventBus.postMessage(EventNames.DataChange, datas);
            setTimeout(() => {
                this.mockDataPoint();
            }, 1000);
        },
        presure(count) {
            let obj = {
                id: "8912749812734",
                name: "数据点1-${data.value}",
                color: Colors.Normal,
                graph: {
                    type: ElementType.Label,
                    position: {
                        x: 5,
                        y: 5,
                        z: 0,
                    },
                },
                data: {
                    value: "${dataPoint1}",
                },
                conf: {
                    showName: true,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.PopComponent.name,
                            actionOptions: {
                                name: "line-chart",
                                props: {
                                    bussinessId: "${bussinessId}",
                                    bussinessType: "",
                                },
                                theme: "default",
                            },
                        },
                    ],
                },
            };

            let res = [];
            for (let i = 0; i < count; i++) {
                let copy = JSON.parse(JSON.stringify(obj));
                copy.id = +copy.id + i;
                copy.graph.position.x = +(Math.random() * 10).toFixed(2);
                copy.graph.position.y = +(Math.random() * 10).toFixed(2);
                copy.graph.position.z = +(Math.random() * 10).toFixed(2);
                res.push(copy);
            }
            return res;
        },
    },
});

window.app = app;
window.resolver = resolver;
