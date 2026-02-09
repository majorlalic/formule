import Resolver from "/matrix/common/core/resolver.js";
import tunnelApi from "./api/tunnelApi.js";
import EventBusWorker from "/common/js/eventBus/eventBusWorker.js";

const eventBus = EventBusWorker.getInstance('tunnel');

Vue.use(antd);

let resolver;
const TUNNEL_STATE_POLL_MS = 5000;
const DEVICE_STATE_POLL_MS = 5000;
const DP_VALUE_POLL_MS = 5000;
const app = new Vue({
    el: "#app",
    data: {
        tunnels: [],
        selectedId: "",
        currentTunnelName: "",
        loading: false,
        sceneLoading: false,
        alarmTunnelIds: [],
        stateTimer: null,
        deviceStateTimer: null,
        sceneStateIds: [],
        dpValueTimer: null,
        sceneDpIds: [],
        sceneMessage: "",
        resizeTimer: null,
    },
    mounted() {
        this.loadTunnels();
        this.bindResize();
    },
    beforeDestroy() {
        this.stopTunnelStateLoop();
        this.stopDeviceStateLoop();
        this.stopDpValueLoop();
        this.unbindResize();
    },
    methods: {
        eleClick(ele){
            console.log(ele);
            eventBus.postMessage("click_ELement",  ele);
        },
        bindResize() {
            this.unbindResize();
            this._onResize = () => {
                if (this.resizeTimer) {
                    window.clearTimeout(this.resizeTimer);
                }
                this.resizeTimer = window.setTimeout(() => {
                    if (this.selectedId) {
                        this.loadScene(this.selectedId);
                    }
                }, 200);
            };
            window.addEventListener("resize", this._onResize);
        },
        unbindResize() {
            if (this._onResize) {
                window.removeEventListener("resize", this._onResize);
                this._onResize = null;
            }
            if (this.resizeTimer) {
                window.clearTimeout(this.resizeTimer);
                this.resizeTimer = null;
            }
        },
        async loadTunnels() {
            this.loading = true;
            try {
                const res = await tunnelApi.getTunnel();
                const list = Array.isArray(res?.[0]) ? res[0] : res || [];
                this.tunnels = list;
                if (list.length) {
                    this.selectTunnel(list[0]);
                }
                await this.refreshTunnelState();
                this.startTunnelStateLoop();
            } catch (err) {
                this.$message.error("分区数据加载失败");
            } finally {
                this.loading = false;
            }
        },
        async refreshTunnelState() {
            try {
                const res = await tunnelApi.getTunnelState();
                const list = Array.isArray(res?.[0]) ? res[0] : res || [];
                this.alarmTunnelIds = list
                    .map((item) => item.areaId || item.id)
                    .filter(Boolean);
            } catch (err) {
                this.alarmTunnelIds = [];
            }
        },
        startTunnelStateLoop() {
            this.stopTunnelStateLoop();
            this.stateTimer = window.setInterval(() => {
                this.refreshTunnelState();
            }, TUNNEL_STATE_POLL_MS);
        },
        stopTunnelStateLoop() {
            if (this.stateTimer) {
                window.clearInterval(this.stateTimer);
                this.stateTimer = null;
            }
        },
        isAlarmTunnel(id) {
            return this.alarmTunnelIds.includes(id);
        },
        async selectTunnel(item) {
            if (!item?.id) return;
            this.selectedId = item.id;
            this.currentTunnelName =
                item.fullName || item.name || item.id;
            await this.loadScene(item.id);
        },
        async loadScene(id) {
            this.sceneLoading = true;
            this.sceneMessage = "";
            try {
                const scene = await this.fetchSceneById(id);
                if (!scene) {
                    this.clearSceneContainer();
                    this.stopDeviceStateLoop();
                    this.sceneStateIds = [];
                    this.stopDpValueLoop();
                    this.sceneDpIds = [];
                    return;
                }
                this.sceneStateIds = this.extractSceneStateIds(scene);
                this.sceneDpIds = this.extractSceneDpIds(scene);
                if (!resolver) {
                    resolver = new Resolver("scene", scene, this);
                } else {
                    resolver.initScene(scene);
                }
                await this.refreshDeviceState();
                this.startDeviceStateLoop();
                await this.refreshDpValue();
                this.startDpValueLoop();
            } finally {
                this.sceneLoading = false;
            }
        },
        async fetchSceneById(id) {
            try {
                const res = await fetch(`./scene/${id}.json`, {
                    cache: "no-store",
                });
                if (!res.ok) {
                    this.sceneMessage = "场景文件未找到";
                    return null;
                }
                return await res.json();
            } catch (err) {
                this.sceneMessage = "场景加载失败";
                return null;
            }
        },
        clearSceneContainer() {
            const sceneEl = document.getElementById("scene");
            if (sceneEl) {
                sceneEl.innerHTML = "";
            }
            resolver = null;
        },
        async refreshDeviceState() {
            if (!this.selectedId || !resolver || !this.sceneStateIds.length) return;
            try {
                const res = await tunnelApi.getDeviceState(this.selectedId);
                const list = Array.isArray(res?.[0]) ? res[0] : res || [];
                const alarmMap = list.reduce((acc, item) => {
                    const id = item.deviceId || item.id;
                    if (!id) return acc;
                    const value = item.contentClass;
                    if (value === undefined || value === null) return acc;
                    acc[id] = acc[id] === undefined ? value : Math.max(acc[id], value);
                    return acc;
                }, {});
                const data = {};
                this.sceneStateIds.forEach((id) => {
                    const value = Object.prototype.hasOwnProperty.call(alarmMap, id)
                        ? alarmMap[id]
                        : -1;
                    data[`state-${id}`] = value;
                });
                resolver.pushData([data]);
            } catch (err) {
                // ignore polling errors
            }
        },
        extractSceneStateIds(scene) {
            if (!scene?.elements?.length) return [];
            const ids = new Set();
            scene.elements.forEach((ele) => {
                if (!Array.isArray(ele.bindings)) return;
                ele.bindings.forEach((binding) => {
                    const tag = binding?.tag || "";
                    if (tag.startsWith("state-")) {
                        ids.add(tag.slice("state-".length));
                    }
                });
            });
            return Array.from(ids);
        },
        extractSceneDpIds(scene) {
            if (!scene?.elements?.length) return [];
            const ids = new Set();
            scene.elements.forEach((ele) => {
                const dpId = ele?.data?.origin?.dpId;
                if (dpId) ids.add(dpId);
                if (!Array.isArray(ele.bindings)) return;
                ele.bindings.forEach((binding) => {
                    const tag = binding?.tag || "";
                    if (tag && !tag.startsWith("state-")) {
                        ids.add(tag);
                    }
                });
            });
            return Array.from(ids);
        },
        startDeviceStateLoop() {
            this.stopDeviceStateLoop();
            this.deviceStateTimer = window.setInterval(() => {
                this.refreshDeviceState();
            }, DEVICE_STATE_POLL_MS);
        },
        stopDeviceStateLoop() {
            if (this.deviceStateTimer) {
                window.clearInterval(this.deviceStateTimer);
                this.deviceStateTimer = null;
            }
        },
        async refreshDpValue() {
            if (!this.sceneDpIds.length || !resolver) return;
            try {
                const res = await tunnelApi.getDpValue(this.sceneDpIds);
                const list = Array.isArray(res?.[0]) ? res[0] : res || [];
                const data = list.reduce((acc, item) => {
                    const id = item.dataPointId || item.id;
                    if (!id) return acc;
                    const remark = item.remark || "";
                    const value = item.value ?? "";
                    const unit = item.unit || "";
                    const text = remark
                        ? `${value}${unit}`
                        : `${value}${unit}`;
                    acc[id] = text;
                    return acc;
                }, {});
                if (Object.keys(data).length) {
                    resolver.pushData([data]);
                }
            } catch (err) {
                // ignore polling errors
            }
        },
        startDpValueLoop() {
            this.stopDpValueLoop();
            this.dpValueTimer = window.setInterval(() => {
                this.refreshDpValue();
            }, DP_VALUE_POLL_MS);
        },
        stopDpValueLoop() {
            if (this.dpValueTimer) {
                window.clearInterval(this.dpValueTimer);
                this.dpValueTimer = null;
            }
        },
    },
});

window.app = app;
window.resolver = resolver;
