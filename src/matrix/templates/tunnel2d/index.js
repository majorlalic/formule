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
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    camera: {
        elementType: "Point",
        icon: "camera",
        offset: 80,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    door: {
        elementType: "Point",
        icon: "door",
        offset: 120,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    line_device: {
        elementType: "TextLine",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
        nameMode: "Hidden",
    },
};

const SAMPLE_DEVICES = [
    {
        id: "1001",
        name: "烟感 1",
        deviceNum: "F010001",
        iotCode: "0.12.7",
        sort: 200,
        deviceTypeId: "smoke_sensor",
        deviceTypeName: "烟感",
        visualTemplate: null,
        dpId: "1001-value,1001-value2",
        direction: "左洞",
    },
    {
        id: "1002",
        name: "摄像机 1",
        deviceNum: "F010002",
        iotCode: "0.12.8",
        sort: 450,
        deviceTypeId: "camera",
        deviceTypeName: "摄像机",
        visualTemplate: null,
        dpId: "1002-value",
        direction: "右洞",
    },
    {
        id: "1003",
        name: "风机 1",
        deviceNum: "F010003",
        iotCode: "0.12.9",
        sort: 820,
        deviceTypeId: "line_device",
        deviceTypeName: "风机",
        visualTemplate: null,
        dpId: "1003-value",
        direction: "左洞",
    },
    {
        id: "1004",
        name: "门禁 1",
        deviceNum: "F010004",
        iotCode: "0.12.10",
        sort: 1200,
        deviceTypeId: "door",
        deviceTypeName: "门禁",
        visualTemplate: null,
        dpId: "1004-value",
        direction: "中导洞",
    },
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
                const dpId =
                    i % 4 === 0
                        ? `${baseId}-value,${baseId}-value2`
                        : `${baseId}-value`;
                devices.push({
                    id: String(baseId),
                    name: `设备 ${i + 1}-上`,
                    deviceNum: `F01${baseId}`,
                    iotCode: `0.12.${i + 1}`,
                    sort: mil,
                    deviceTypeId: type,
                    deviceTypeName: type,
                    visualTemplate: null,
                    dpId,
                    direction: "左洞",
                });
                devices.push({
                    id: String(baseId + 1),
                    name: `设备 ${i + 1}-下`,
                    deviceNum: `F01${baseId + 1}`,
                    iotCode: `0.12.${i + 1}`,
                    sort: mil,
                    deviceTypeId: type,
                    deviceTypeName: type,
                    visualTemplate: null,
                    dpId,
                    direction: "右洞",
                });
                if (i % 3 === 0) {
                    const centerId = baseId + 10000;
                    devices.push({
                        id: String(centerId),
                        name: `设备 ${i + 1}-中`,
                        deviceNum: `F01${centerId}`,
                        iotCode: `0.12.${i + 1}`,
                        sort: mil,
                        deviceTypeId: type,
                        deviceTypeName: type,
                        visualTemplate: null,
                        dpId: `${centerId}-value`,
                        direction: "中导洞",
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
                    deviceNum: `F01${baseId}`,
                    iotCode: `0.12.${pairCount + 1}`,
                    sort: mil,
                    deviceTypeId: type,
                    deviceTypeName: type,
                    visualTemplate: null,
                    dpId: `${baseId}-value`,
                    direction: "左洞",
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
