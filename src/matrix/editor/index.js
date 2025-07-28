import { loadVueComponent } from "/matrix/js/vue-component-loader.js";
import {
    ModuleNames,
    EventNames,
    InteractionType,
    SceneType,
    ActionTypes,
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
import { SCENE3D } from "./3d.js";
import { SCENE2D } from "./2d.js";
import { SCENEGIS } from "./gis.js";
import { mountComponent } from "../js/vue-component-loader.js";
import { ActionDispatcher } from "../js/action-dispatcher.js";

const eventBus = EventBusWorker.getInstance(ModuleNames.Editor);
// 图元id映射
let eleMap;
// 动作分发器
let actionDispatcher;

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
        curEle: null,

        createType: "",
    },
    components: {
        "ele-type": () =>
            loadVueComponent("/matrix/editor/components/ele-type.html"),
        "ele-list": () =>
            loadVueComponent("/matrix/editor/components/ele-list.html"),
        "ele-attr": () =>
            loadVueComponent("/matrix/editor/components/ele-attr.html"),
        "ele-data": () =>
            loadVueComponent("/matrix/editor/components/ele-data.html"),
        "ele-conf": () =>
            loadVueComponent("/matrix/editor/components/ele-conf.html"),
        "scene-conf": () =>
            loadVueComponent("/matrix/editor/components/scene-conf.html"),
        "scene-anchor": () =>
            loadVueComponent("/matrix/editor/components/scene-anchor.html"),
        "scene-layer": () =>
            loadVueComponent("/matrix/editor/components/scene-layer.html"),
    },
    created: function () {},
    mounted: function () {
        this.scene = SCENE3D;

        // 初始化场景
        this.initScene(this.scene);

        // 订阅事件
        this._initEvent();

        // 初始化动作处理器
        actionDispatcher = new ActionDispatcher(eventBus);
    },
    computed: {},
    methods: {
        /**
         * 选择图元类型
         * @param {String} type
         */
        selectType(type) {
            this.createType = type;
        },
        /**
         * 打开创建场景对话框
         */
        createScene() {
            let _this = this;
            if (this.scene.hasOwnProperty("id")) {
                let confirm = this.$confirm({
                    title: "当前已存在场景，创建新场景将丢失改动",
                    content: "请确认已导出场景配置，点击确认将继续创建场景",
                    okText: "确认",
                    cancelText: "取消",
                    onOk() {
                        confirm.destroy();
                        _this.popCreateScene();
                    },
                    onCancel() {
                        confirm.destroy();
                    },
                });
            } else {
                this.popCreateScene();
            }
        },
        popCreateScene() {
            let _this = this;
            mountComponent(
                "/matrix/editor/components/scene-creator.html",
                {},
                {
                    create(scene) {
                        this.scene = scene;
                        _this.initScene(scene);
                    },
                }
            );
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
        /**
         * 初始化文件上传事件
         */
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
        getEleById(id) {
            let target = this.scene.elements.find((item) => item.id == id);
            if (!target) {
                this.$message.error(`找不到id为${id}的图元, 请联系管理员`);
                return;
            }
            return target;
        },
        /**
         * 选中图元
         * @param {ElementDef} ele
         */
        selectEle(ele) {
            let target = this.getEleById(ele.id);
            this.curEle = target;
            eventBus.postMessage(EventNames.SelectEle, target);
        },
        /**
         * 修改图元可见性
         * @param {ElementDef} ele
         * @param {Boolean} visible
         */
        changeEleVisible(ele, visible) {
            let target = this.getEleById(ele.id);
            target.visible = visible;
            actionDispatcher.dispatch(target, {
                actionType: ActionTypes.ChangeVisible.name,
                actionOptions: {
                    visible,
                },
            });
        },
        /**
         * 导入场景
         */
        importScene() {
            document.getElementById("jsonFileInput").click();
        },
        /**
         * 导出当前场景
         */
        exportScene() {
            if (this.scene) {
                this.$message.info("场景配置正在导出, 请查看下载文件");
                downloadJson(this.scene, `${this.scene?.name || "data"}.json`);
            } else {
                this.$message.warn("暂无场景");
            }
        },
        preview(){
            window.open('')
        }
    },
});

window.app = app;
