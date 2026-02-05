import Resolver from "/matrix/common/core/resolver.js";
import { downloadJson } from "/matrix/common/core/utils.js";
import { buildTunnelScene } from "./builder.js";

Vue.use(antd);

const DEFAULT_FORM = {
    startMil: 0,
    endMil: 2000,
    offsetLeft: 80,
    offsetRight: 80,
    offsetTop: 20,
    offsetBottom: 20,
    backgroundUrl: "/common/images/tunnel.png",
    showStartEndLabel: true,
    mockCount: 100,
};

const DEFAULT_TYPE_MAP = {
    smoke_sensor: {
        elementType: "Point",
        icon: "radar",
        offset: 40,
        offsetCenter: 0,
    },
    camera: {
        elementType: "Point",
        icon: "camera",
        offset: 80,
        offsetCenter: 0,
    },
    door: {
        elementType: "Point",
        icon: "door",
        offset: 120,
        offsetCenter: 0,
    },
    line_device: {
        elementType: "Polyline",
        offset: 0,
        offsetCenter: 0,
    },
};

const SAMPLE_DEVICES = [
    { id: "1001", name: "烟感 1", dir: 1, mil: 200, type: "smoke_sensor", dp: "1001-state" },   
    { id: "1002", name: "摄像机 1", dir: 0, mil: 450, type: "camera", dp: "1002-state" },
    { id: "1003", name: "风机 1", dir: 1, mil: 820, type: "line_device", dp: "1003-state" },
    { id: "1004", name: "门禁 1", dir: 0, mil: 1200, type: "door", dp: "1004-state" },
];

let resolver;

new Vue({
    el: "#app",
    data: {
        form: { ...DEFAULT_FORM },
        devicesText: JSON.stringify(SAMPLE_DEVICES, null, 2),
        typeMapText: JSON.stringify(DEFAULT_TYPE_MAP, null, 2),
        elementCount: 0,
        bgSize: { width: 1200, height: 220 },
    },
    mounted() {
        this.loadBgSize();
    },
    watch: {
        "form.backgroundUrl": function () {
            this.loadBgSize();
        },
    },
    methods: {
        loadBgSize() {
            const img = new Image();
            img.onload = () => {
                this.bgSize = {
                    width: img.width || 1200,
                    height: img.height || 220,
                };
            };
            img.src = this.form.backgroundUrl;
        },
        parseDevices() {
            try {
                return JSON.parse(this.devicesText || "[]");
            } catch (e) {
                this.$message.error("设备数据 JSON 解析失败");
                return [];
            }
        },
        parseTypeMap() {
            try {
                return JSON.parse(this.typeMapText || "{}");
            } catch (e) {
                this.$message.error("类型映射 JSON 解析失败");
                return {};
            }
        },
        buildScene() {
            const deviceTypeMap = this.parseTypeMap();
            const sceneEl = document.getElementById("scene");
            const scene = buildTunnelScene(this.parseDevices(), {
                ...this.form,
                tunnelWidth: this.bgSize.width,
                tunnelHeight: this.bgSize.height,
                sceneWidth: sceneEl?.clientWidth || this.bgSize.width,
                sceneHeight: sceneEl?.clientHeight || this.bgSize.height,
                deviceTypeMap,
            });
            this.elementCount = scene.elements.length;
            return scene;
        },
        preview() {
            const scene = this.buildScene();
            if (!resolver) {
                resolver = new Resolver("scene", scene);
            } else {
                resolver.initScene(scene);
            }
        },
        download() {
            const scene = this.buildScene();
            downloadJson(scene, "tunnel-scene.json");
        },
        mockDevices() {
            const count = Math.max(1, Number(this.form.mockCount) || 1);
            const types = Object.keys(this.parseTypeMap());
            const startMil = Number(this.form.startMil) || 0;
            const endMil = Number(this.form.endMil) || startMil + 1;
            const minMil = Math.min(startMil, endMil);
            const maxMil = Math.max(startMil, endMil);
            const span = Math.max(1, maxMil - minMil);
            const devices = [];
            const pairCount = Math.floor(count / 2);
            for (let i = 0; i < pairCount; i += 1) {
                const type = types[i % types.length] || "smoke_sensor";
                const mil = Math.round(
                    minMil + (span * i) / Math.max(1, pairCount - 1)
                );
                const baseId = 1000 + i * 2;
                devices.push({
                    id: String(baseId),
                    name: `设备 ${i + 1}-上`,
                    dir: 1,
                    mil,
                    type,
                    dp: `${baseId}-state`,
                });
                devices.push({
                    id: String(baseId + 1),
                    name: `设备 ${i + 1}-下`,
                    dir: 0,
                    mil,
                    type,
                    dp: `${baseId + 1}-state`,
                });
                if (i % 3 === 0) {
                    const centerId = baseId + 10000;
                    devices.push({
                        id: String(centerId),
                        name: `设备 ${i + 1}-中`,
                        dir: 2,
                        mil,
                        type,
                        dp: `${centerId}-state`,
                    });
                }
            }
            if (count % 2 === 1) {
                const type = types[pairCount % types.length] || "smoke_sensor";
                const mil = Math.round(
                    minMil + (span * pairCount) / Math.max(1, pairCount)
                );
                const baseId = 1000 + pairCount * 2;
                devices.push({
                    id: String(baseId),
                    name: `设备 ${pairCount + 1}-上`,
                    dir: 1,
                    mil,
                    type,
                    dp: `${baseId}-state`,
                });
            }
            this.devicesText = JSON.stringify(devices, null, 2);
        },
        formatDevices() {
            try {
                const formatted = JSON.stringify(
                    JSON.parse(this.devicesText || "[]"),
                    null,
                    2
                );
                this.devicesText = formatted;
            } catch (e) {
                this.$message.error("设备数据 JSON 格式错误");
            }
        },
    },
});
