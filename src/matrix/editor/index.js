import { loadVueComponent } from "/matrix/js/vue-component-loader.js";
import {
    ModuleNames,
    EventNames,
    InteractionType,
    SceneType,
} from "../js/const.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";
import { getNewScene, SceneDef } from "../js/def/sceneDef.js";
import { ElementDef } from "../js/def/element/elementDef.js";
import { Action, ElementData } from "../js/def/typeDef.js";
import {
    collectPlaceholders,
    setData,
    initFrame,
    deepClone,
    validateScene,
    downloadJson,
} from "../js/utils.js";
import { SCENE } from "./scene1.js";
import { mountComponent } from "../js/vue-component-loader.js";

const eventBus = EventBusWorker.getInstance(ModuleNames.Editor);
// 图元id映射
let eleMap;

Vue.use(antd);
var app = new Vue({
    el: "#app",
    provide() {
        return {
            eventBus,
        };
    },
    data: {
        scene: {},
        curEle: {
            id: "",
            name: "",
            type: "Polyline",
            color: "#FFFFFF",
            zIndex: "",
            graph: {},
        },
        types: [
            {
                key: "Point",
                label: "点",
            },
            {
                key: "Polyline",
                label: "线",
            },
            {
                key: "Polygon",
                label: "面",
            },
            {
                key: "Modal",
                label: "模型",
            },
            {
                key: "Label",
                label: "文本",
            },
            {
                key: "Picture",
                label: "图片",
            },
        ],
        eles: [],

        createType: "",

        showCreateScene: false,
        sceneTypes: [],
        newScene: {
            name: "",
            type: "",
        },
    },
    components: {
        "ele-type": () =>
            loadVueComponent("/matrix/editor/components/ele-type.html"),
        "color-selector": () =>
            loadVueComponent("/matrix/editor/components/color-selector.html"),
        "graph-editor": () =>
            loadVueComponent("/matrix/editor/components/graph-editor.html"),
    },
    created: function () {},
    mounted: function () {
        this.scene = SCENE;

        // 初始化场景
        this.initScene(this.scene);

        // 订阅事件
        this._initEvent();

        Object.keys(SceneType).forEach((key) => {
            this.sceneTypes.push({
                key,
                name: key,
                label: key,
            });
        });
    },
    methods: {
        /**
         * 打开创建场景对话框
         */
        popCreateScene() {
            if (this.scene.hasOwnProperty("id")) {
                let _this = this;
                let confirm = this.$confirm({
                    title: "当前已存在场景，创建新场景将丢失改动",
                    content: "请确认已导出场景配置，点击确认将继续创建场景",
                    okText: "确认",
                    cancelText: "取消",
                    onOk() {
                        confirm.destroy();
                        _this.showCreateScene = true;
                    },
                    onCancel() {
                        confirm.destroy();
                    },
                });
            } else {
                this.showCreateScene = true;
            }
        },
        /**
         * 创建场景
         */
        createScene() {
            this.showCreateScene = false;
            this.scene = getNewScene(this.newScene.type, this.newScene.name);
            this.initScene(this.scene);
            this.newScene.type = "";
            this.newScene.name = "";
        },
        /**
         * 选择图元类型
         * @param {String} type
         */
        selectType(type) {
            this.createType = type;
        },
        /**
         * 初始化场景
         * @param {SceneDef} scene
         */
        initScene(scene) {
            let cloneScene = deepClone(scene);
            initFrame("scene", cloneScene).then(
                ({ id, type, conf, elements }) => {
                    eventBus.postMessage(EventNames.InitScene, conf, elements);
                    eleMap = new Map();
                    elements.forEach((ele) => {
                        eleMap.set(ele.id, ele);
                    });

                    // 重置图元列表
                    this.eles = elements.map((ele) => {
                        return {
                            id: ele.id,
                            name: ele.name,
                            type: ele.type,
                            visible: ele.visible,
                            lock: false,
                        };
                    });
                    // 重置当前选中图元
                    this.curEle = null;
                }
            );
        },
        /**
         * 订阅事件
         */
        _initEvent() {
            eventBus.on(EventNames.EleEvent, (type, ele, position) => {
                // 图元点击选中， 图元被拖动？
                if (type === InteractionType.Click) {
                    this.selectEle(ele);
                }
            });

            this.initFileEvent();
        },
        initFileEvent() {
            document
                .getElementById("jsonFileInput")
                .addEventListener("change", (event) => {
                    const file = event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();

                    reader.onload = (e) => {
                        try {
                            const jsonString = e.target.result;
                            const jsonObj = JSON.parse(jsonString);
                            if (validateScene(jsonObj)) {
                                this.scene = jsonObj;
                                this.initScene(jsonObj);
                            }
                        } catch (err) {
                            console.error("JSON 解析失败:", err);
                        }
                    };

                    reader.onerror = (err) => {
                        console.error("文件读取失败:", err);
                    };

                    reader.readAsText(file);
                });
        },
        createEle() {},
        /**
         * 选中图元
         * @param {ElementDef} ele
         */
        selectEle(ele) {
            let target = this.scene.elements.find((item) => item.id === ele.id);
            if (!target) {
                return;
            }
            this.curEle = target;
        },
        importScene() {
            document.getElementById("jsonFileInput").click();
        },
        exportScene() {
            if (this.scene) {
                downloadJson(this.scene, `${this.scene?.name || "data"}.json`);
            }
        },
    },
});

window.app = app;
