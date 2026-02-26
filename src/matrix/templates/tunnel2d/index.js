import Resolver from "/matrix/common/core/resolver.js";
import { downloadJson } from "/matrix/common/core/utils.js";
import { ICONS } from "/matrix/common/core/const.js";
import { buildTunnelScene } from "./builder.js";

Vue.use(antd);

const DEFAULT_FORM = {
    startMil: 0,
    endMil: 2000,
    offsetLeft: 80,
    offsetRight: 80,
    offsetTop: 20,
    offsetBottom: 20,
    minDeviceSpacing: 80,
    showStartEndLabel: true,
    mockCount: 100,
};

const TUNNEL_BACKGROUND = {
    startUrl: "/common/images/tunnel_start.png",
    centerUrl: "/common/images/tunnel_center.png",
    endUrl: "/common/images/tunnel_end.png",
};

const DEFAULT_STATE_MAP = {
    "-1": "#2F7CEE",
    0: "#7B7A82",
    1: "#7B7A82",
    2: "#FF3040",
};

const DEFAULT_TYPE_MAP = {
    "A.B.A.A": {
        elementType: "Point",
        icon: "smoke",
        offset: 40,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.B.A.B": {
        elementType: "Point",
        icon: "temp",
        offset: 80,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.B.B": {
        elementType: "Point",
        icon: "handle",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.B.A.G": {
        elementType: "Point",
        icon: "fire",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.B.C.A": {
        elementType: "Point",
        icon: "soundLight",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.B.A.H": {
        elementType: "Point",
        icon: "camera",
        offset: 120,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "B.A.A":{
        elementType: "Point",
        icon: "camera",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "A.D.A": {
        elementType: "Point",
        icon: "fireAlarm",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
    },
    "D.B.F": {
        elementType: "TextLine",
        offset: 0,
        offsetCenter: 0,
        stateMap: { "-1": "#2F7CEE", 0: "#7B7A82", 1: "#7B7A82", 2: "#FF3040" },
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
        bgPartsSize: {
            start: { width: 0, height: 0 },
            center: { width: 0, height: 0 },
            end: { width: 0, height: 0 },
        },
        loadBgSeq: 0,
        typeEditorVisible: false,
        typeRows: [],
        iconOptions: ICONS,
        typeColumns: [
            { title: "deviceTypeId", dataIndex: "deviceTypeId", key: "deviceTypeId", width: 160 },
            { title: "elementType", dataIndex: "elementType", key: "elementType", scopedSlots: { customRender: "elementType" } },
            { title: "icon", dataIndex: "icon", key: "icon", className: "icon-cell", scopedSlots: { customRender: "icon" } },
            { title: "offset", dataIndex: "offset", key: "offset", scopedSlots: { customRender: "offset" } },
            { title: "offsetCenter", dataIndex: "offsetCenter", key: "offsetCenter", scopedSlots: { customRender: "offsetCenter" } },
            { title: "stateMap", dataIndex: "stateMapText", key: "stateMapText", scopedSlots: { customRender: "stateMap" } },
        ],
    },
    mounted() {
        this.loadBgSize();
        this.syncTypeMapWithDevices();
    },
    watch: {
        devicesText() {
            this.syncTypeMapWithDevices();
        },
    },
    methods: {
        parseLooseJson(text) {
            const raw = (text || "").trim();
            if (!raw) return [];
            try {
                return JSON.parse(raw);
            } catch (e) {
                // Fallback: allow JS object/array literals in textarea
                try {
                    // eslint-disable-next-line no-new-func
                    return new Function(`return (${raw});`)();
                } catch (err) {
                    return null;
                }
            }
        },
        loadImageSize(url) {
            return new Promise((resolve) => {
                if (!url) {
                    resolve(null);
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    resolve({
                        width: img.width || 0,
                        height: img.height || 0,
                    });
                };
                img.onerror = () => resolve(null);
                img.src = url;
            });
        },
        async loadBgSize() {
            const seq = this.loadBgSeq + 1;
            this.loadBgSeq = seq;

            const [startSize, centerSize, endSize] = await Promise.all([
                this.loadImageSize(TUNNEL_BACKGROUND.startUrl),
                this.loadImageSize(TUNNEL_BACKGROUND.centerUrl),
                this.loadImageSize(TUNNEL_BACKGROUND.endUrl),
            ]);
            if (this.loadBgSeq !== seq) return;

            const hasSegment =
                startSize?.width > 0 && centerSize?.width > 0 && endSize?.width > 0;

            if (hasSegment) {
                this.bgPartsSize = {
                    start: startSize,
                    center: centerSize,
                    end: endSize,
                };
                this.bgSize = {
                    width: startSize.width + centerSize.width + endSize.width,
                    height: Math.max(
                        startSize.height || 0,
                        centerSize.height || 0,
                        endSize.height || 0,
                        220
                    ),
                };
                return;
            }

            this.bgPartsSize = {
                start: { width: 0, height: 0 },
                center: { width: 0, height: 0 },
                end: { width: 0, height: 0 },
            };
            this.bgSize = {
                width: 1200,
                height: 220,
            };
        },
        parseDevices() {
            const parsed = this.parseLooseJson(this.devicesText);
            if (parsed == null) {
                this.$message.error("设备数据解析失败");
                return [];
            }
            return Array.isArray(parsed) ? parsed : [parsed];
        },
        parseTypeMap(silent = false) {
            try {
                return JSON.parse(this.typeMapText || "{}");
            } catch (e) {
                if (!silent) {
                    this.$message.error("类型映射 JSON 解析失败");
                }
                return {};
            }
        },
        syncTypeMapWithDevices() {
            const parsed = this.parseLooseJson(this.devicesText);
            if (parsed == null) return;
            const devices = Array.isArray(parsed) ? parsed : [parsed];
            const currentMap = this.parseTypeMap(true);
            const nextMap = this.buildTypeMapByDevices(devices, currentMap);
            const nextText = JSON.stringify(nextMap, null, 2);
            if (nextText !== this.typeMapText) {
                this.typeMapText = nextText;
            }
        },
        buildTypeMapByDevices(devices = [], currentMap = {}) {
            const { typeIds, leftRightIndex, centerIndex } = this.getTypeIndexMaps(devices);
            const map = {};
            typeIds.forEach((typeId) => {
                const current = currentMap[typeId] || {};
                const fallback = DEFAULT_TYPE_MAP[typeId] || {};
                const elementType =
                    this.normalizeElementType(fallback.elementType) ||
                    this.normalizeElementType(current.elementType) ||
                    "Point";
                const hasLeftRight = leftRightIndex.has(typeId);
                const hasCenter = centerIndex.has(typeId);
                const item = {
                    elementType,
                    offset: Number.isFinite(current.offset)
                        ? current.offset
                        : hasLeftRight
                        ? leftRightIndex.get(typeId) * 30
                        : 0,
                    offsetCenter: Number.isFinite(current.offsetCenter)
                        ? current.offsetCenter
                        : hasCenter
                        ? this.getDefaultOffsetCenter(centerIndex.get(typeId))
                        : 0,
                    stateMap:
                        fallback.stateMap && typeof fallback.stateMap === "object"
                            ? { ...fallback.stateMap }
                            : current.stateMap && typeof current.stateMap === "object"
                            ? current.stateMap
                            : { ...DEFAULT_STATE_MAP },
                };
                const nameMode = fallback.nameMode || current.nameMode;
                if (nameMode) {
                    item.nameMode = nameMode;
                }
                if (elementType === "Point") {
                    item.icon = current.icon || fallback.icon || "default";
                }
                map[typeId] = item;
            });
            return map;
        },
        getTypeIndexMaps(devices = []) {
            const typeIds = [];
            const allTypeSet = new Set();
            const leftRightTypes = [];
            const centerTypes = [];
            devices.forEach((dev) => {
                const typeId = dev.deviceTypeId || dev.type;
                if (!typeId) return;
                if (!allTypeSet.has(typeId)) {
                    allTypeSet.add(typeId);
                    typeIds.push(typeId);
                }
                const dir = this.normalizeDirection(dev?.direction ?? dev?.dir);
                if (dir === 2) {
                    if (!centerTypes.includes(typeId)) centerTypes.push(typeId);
                    return;
                }
                if (!leftRightTypes.includes(typeId)) leftRightTypes.push(typeId);
            });
            return {
                typeIds,
                leftRightIndex: new Map(leftRightTypes.map((typeId, index) => [typeId, index])),
                centerIndex: new Map(centerTypes.map((typeId, index) => [typeId, index])),
            };
        },
        openTypeEditor() {
            const devices = this.parseDevices();
            const { typeIds, leftRightIndex, centerIndex } = this.getTypeIndexMaps(devices);
            const typeMap = this.parseTypeMap();
            const keys = typeIds;
            const rows = keys.map((key, index) => {
                const current = typeMap[key] || {};
                const fallback = DEFAULT_TYPE_MAP[key] || {};
                const elementType =
                    this.normalizeElementType(fallback.elementType) ||
                    this.normalizeElementType(current.elementType) ||
                    "Point";
                const offset = Number.isFinite(current.offset)
                    ? current.offset
                    : leftRightIndex.has(key)
                    ? leftRightIndex.get(key) * 30
                    : index * 30;
                const offsetCenter =
                    Number.isFinite(current.offsetCenter)
                        ? current.offsetCenter
                        : centerIndex.has(key)
                        ? this.getDefaultOffsetCenter(centerIndex.get(key))
                        : 0;
                const stateMap =
                    fallback.stateMap ||
                    current.stateMap ||
                    { ...DEFAULT_STATE_MAP };
                return {
                    deviceTypeId: key,
                    elementType,
                    icon: current.icon || fallback.icon || "default",
                    offset,
                    offsetCenter,
                    stateMapText: JSON.stringify(stateMap),
                };
            });
            this.typeRows = rows;
            this.typeEditorVisible = true;
        },
        saveTypeEditor() {
            const currentTypeMap = this.parseTypeMap(true);
            const map = {};
            for (const row of this.typeRows) {
                let stateMap = null;
                try {
                    stateMap = JSON.parse(row.stateMapText || "{}");
                } catch (e) {
                    this.$message.error(`stateMap 解析失败: ${row.deviceTypeId}`);
                    return;
                }
                const fallback = DEFAULT_TYPE_MAP[row.deviceTypeId] || {};
                const current = currentTypeMap[row.deviceTypeId] || {};
                const elementType =
                    this.normalizeElementType(row.elementType) || "Point";
                const item = {
                    elementType,
                    offset: Number(row.offset) || 0,
                    offsetCenter: Number(row.offsetCenter) || 0,
                    stateMap,
                };
                const nameMode = fallback.nameMode || current.nameMode;
                if (nameMode) {
                    item.nameMode = nameMode;
                }
                if (elementType === "Point") {
                    item.icon = row.icon || "default";
                }
                map[row.deviceTypeId] = item;
            }
            this.typeMapText = JSON.stringify(map, null, 2);
            this.typeEditorVisible = false;
        },
        getDefaultOffsetCenter(index) {
            if (index === 0) return 0;
            const step = Math.ceil(index / 2) * 30;
            return index % 2 === 1 ? -step : step;
        },
        normalizeDirection(direction) {
            if (direction === 0 || direction === 1 || direction === 2) return direction;
            if (typeof direction === "string") {
                if (direction.includes("左")) return 1;
                if (direction.includes("右")) return 0;
                if (direction.includes("中")) return 2;
            }
            return 1;
        },
        normalizeElementType(value) {
            if (!value) return "";
            if (value === "Line") return "Polyline";
            return value;
        },
        buildScene() {
            const deviceTypeMap = this.parseTypeMap();
            const sceneEl = document.getElementById("scene");
            const scene = buildTunnelScene(this.parseDevices(), {
                ...this.form,
                backgroundStartUrl: TUNNEL_BACKGROUND.startUrl,
                backgroundCenterUrl: TUNNEL_BACKGROUND.centerUrl,
                backgroundEndUrl: TUNNEL_BACKGROUND.endUrl,
                tunnelWidth: this.bgSize.width,
                tunnelHeight: this.bgSize.height,
                backgroundStartWidth: this.bgPartsSize.start.width,
                backgroundCenterWidth: this.bgPartsSize.center.width,
                backgroundEndWidth: this.bgPartsSize.end.width,
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
            const parsed = this.parseLooseJson(this.devicesText);
            if (parsed == null) {
                this.$message.error("设备数据格式错误");
                return;
            }
            const formatted = JSON.stringify(parsed, null, 2);
            this.devicesText = formatted;
        },
    },
});
