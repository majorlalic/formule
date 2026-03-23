import Resolver from "/matrix/common/core/resolver.js";
import { buildTunnel3dScene } from "./builder.js";
import { downloadJson } from "/matrix/common/core/utils.js";

Vue.use(antd);

let resolver;

new Vue({
    el: "#app",
    data: {
        form: {
            length: 1600,
            startMil: 3200,
        },
        jsonText: "",
    },
    mounted() {
        this.preview();
    },
    methods: {
        buildScene() {
            const scene = buildTunnel3dScene([], this.form);
            this.jsonText = JSON.stringify(scene, null, 2);
            return scene;
        },
        preview() {
            const scene = this.buildScene();
            if (!scene) return;
            if (!resolver) {
                resolver = new Resolver("scene", scene, this);
            } else {
                resolver.initScene(scene);
            }
        },
        download() {
            const scene = this.buildScene();
            if (!scene) return;
            downloadJson(scene, "tunnel3d-scene.json");
        },
        eleClick(ele) {
            console.log("[tunnel3d-template] click", ele);
        },
    },
});
