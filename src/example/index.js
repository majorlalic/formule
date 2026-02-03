import Resolver from "/matrix/common/core/resolver.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { ModuleNames, EventNames, Colors } from "/matrix/common/core/const.js";
import { loadVueComponent } from "/matrix/common/core/vue-component-loader.js";
import {
    InteractionType,
    PopComponent,
    ActionType,
    ElementType,
    SceneType,
} from "../matrix/common/core/const.js";
// import { scene } from "./mock.js";
import { scenes } from "/matrix/common/core/mock.js";
import { scene } from "./mock.js";

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
        count: 0,
    },
    components: {
        // "live-video": () => loadVueComponent("/matrix/components/live-video.html"),
    },
    created: function () {},
    mounted: function () {
        // TODO 模拟数据 接口实现
        // let scene = scenes[1];

        resolver = new Resolver("scene", scene);
        this.layers = scene?.layers || [];

        let presures = this.presure(0);
        console.log("presures", presures);

        scene.elements = [...scene.elements, ...presures];

        setTimeout(() => {
            this.mockData();
        }, 3000);
    },
    methods: {
        test(x,y){
            eventBus.postMessage(EventNames.CenterChange, {
                x,
                y
            });
        },
        layerChange(layer) {
            layer.checked = !layer.checked;
            let checked = this.layers
                .filter((i) => i.checked)
                .map((i) => i.name);
            eventBus.postMessage(EventNames.LayerChange, checked);
        },
        mockData() {
            this.count += 1;
            let datas = [
                {
                    dataPoint1: this.count % 30,
                    speed_ms: (this.count % 20) + 5,
                    temp_c: 60 + (this.count % 50),
                    device_state: this.count % 4,
                    device_online: this.count % 6 !== 0,
                    alarm: this.count % 5 === 0,
                    flow: this.count % 15,
                },
            ];
            eventBus.postMessage(EventNames.DataChange, datas);
            setTimeout(() => {
                this.mockData();
            }, 1000);
        },
        presure(count) {
            let obj = {
                id: "8912749812734",
                name: "数据点1",
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
                    value: "",
                },
                bindings: [
                    { tag: "dataPoint1", to: "data.value" },
                ],
                conf: {
                    showName: true,
                    actions: [
                        {
                            when: "data.value != null",
                            do: "changeValue",
                            params: {
                                value: "@data.value",
                            },
                        },
                    ],
                    trigger: [
                        {
                            type: InteractionType.Click,
                            actionType: ActionType.PopComponent,
                            actionOptions: {
                                name: "LineChart",
                                props: {
                                    bussinessId: "",
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
