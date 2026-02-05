import Resolver from "/matrix/common/core/resolver.js";
import { buildTunnelScene } from "/matrix/templates/tunnel2d/builder.js";
import tunnelApi from "./api/tunnelApi.js";

let resolver;
var app = new Vue({
    el: "#app",
    provide() {
        return {};
    },
    data: {
        areaId: "",
        devices: [],
        dpIds: [],
        refreshTimer: null,
    },
    components: {},
    created: function () {},
    mounted: function () {
        this.initMockScene();
    },
    methods: {
        ensureSceneEl() {
            let sceneEl = document.getElementById("scene");
            if (!sceneEl) {
                const appEl = document.getElementById("app");
                sceneEl = document.createElement("div");
                sceneEl.id = "scene";
                appEl.appendChild(sceneEl);
            }
            return sceneEl;
        },
        collectDpIds(devices) {
            const res = [];
            const seen = new Set();
            for (let i = 0; i < devices.length; i += 1) {
                const dpId = devices[i]?.dpId;
                const list = Array.isArray(dpId)
                    ? dpId
                    : typeof dpId === "string"
                    ? dpId.split(",")
                    : [];
                for (let j = 0; j < list.length; j += 1) {
                    const item = String(list[j]).trim();
                    if (!item || seen.has(item)) continue;
                    seen.add(item);
                    res.push(item);
                }
            }
            return res;
        },
        async initMockScene() {
            const sceneEl = this.ensureSceneEl();
            const [tunnelRes, tunnelStateRes] = await Promise.all([
                tunnelApi.getTunnel(),
                tunnelApi.getTunnelState(),
            ]);
            const tunnelList = Array.isArray(tunnelRes?.[0])
                ? tunnelRes[0]
                : tunnelRes || [];
            const stateList = Array.isArray(tunnelStateRes)
                ? tunnelStateRes
                : [];
            const areaId =
                stateList[0]?.areaId || tunnelList[0]?.id || "";
            if (!areaId) return;
            this.areaId = areaId;
            const devices = (await tunnelApi.getDevice(areaId)) || [];
            this.devices = Array.isArray(devices) ? devices : [];
            this.dpIds = this.collectDpIds(this.devices);

            const rect = sceneEl.getBoundingClientRect();
            const width = rect.width || 1200;
            const height = rect.height || 220;
            const scene = buildTunnelScene(this.devices, {
                sceneWidth: width,
                sceneHeight: height,
                tunnelWidth: width,
                tunnelHeight: height,
            });
            resolver = new Resolver("scene", scene, this);

            this.startMockLoop();
        },
        startMockLoop() {
            if (this.refreshTimer) clearInterval(this.refreshTimer);
            this.refreshTimer = setInterval(() => {
                this.refreshMockData();
            }, 2000);
            this.refreshMockData();
        },
        async refreshMockData() {
            if (!resolver || !this.areaId) return;
            const updates = [];

            if (this.dpIds.length) {
                const dpValues = await tunnelApi.getDpValue(
                    this.dpIds.join(",")
                );
                const dpUpdate = {};
                if (Array.isArray(dpValues)) {
                    for (let i = 0; i < dpValues.length; i += 1) {
                        const item = dpValues[i];
                        const key = item?.dataPointId;
                        if (!key) continue;
                        const num = Number(item?.value);
                        dpUpdate[key] = Number.isFinite(num)
                            ? num
                            : item?.value ?? null;
                    }
                }
                if (Object.keys(dpUpdate).length) updates.push(dpUpdate);
            }

            const stateRes = await tunnelApi.getDeviceState(this.areaId);
            const alarmSet = new Set(
                Array.isArray(stateRes)
                    ? stateRes.map((item) => item?.deviceId).filter(Boolean)
                    : []
            );
            if (this.devices.length) {
                const stateUpdate = {};
                for (let i = 0; i < this.devices.length; i += 1) {
                    const dev = this.devices[i];
                    if (!dev?.id) continue;
                    stateUpdate[`state-${dev.id}`] = alarmSet.has(dev.id)
                        ? 2
                        : 1;
                }
                updates.push(stateUpdate);
            }

            if (updates.length) resolver.pushData(updates);
        },
    },
});

window.app = app;
window.resolver = resolver;
