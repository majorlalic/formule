import Resolver from "/matrix/common/core/resolver.js";
import { buildTunnel3dScene } from "./builder.js";
import { downloadJson } from "/matrix/common/core/utils.js";

Vue.use(antd);

let resolver;
const SAMPLE_DEVICES = [
    {
        id: "1001",
        name: "烟感 1",
        deviceTypeId: "smoke_sensor",
        sort: 200,
        direction: "左洞",
    },
    {
        id: "1002",
        name: "摄像机 1",
        deviceTypeId: "camera",
        sort: 600,
        direction: "左洞",
    },
    {
        id: "1003",
        name: "风机 1",
        deviceTypeId: "line_device",
        sort: 950,
        direction: "右洞",
    },
    {
        id: "1004",
        name: "门禁 1",
        deviceTypeId: "door",
        sort: 1320,
        direction: "右洞",
    },
];

new Vue({
    el: "#app",
    data: {
        form: {
            length: 1600,
            startMil: 3200,
        },
        devicesText: JSON.stringify(SAMPLE_DEVICES, null, 2),
        jsonText: "",
    },
    mounted() {
        this.preview();
    },
    methods: {
        buildScene() {
            const scene = buildTunnel3dScene(this.parseDevices(), this.form);
            this.jsonText = JSON.stringify(scene, null, 2);
            return scene;
        },
        parseDevices() {
            try {
                const parsed = JSON.parse(this.devicesText || "[]");
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (err) {
                this.$message.error("设备 JSON 解析失败");
                return [];
            }
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
