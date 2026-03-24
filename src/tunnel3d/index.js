import Resolver from "/matrix/common/core/resolver.js";
import { buildTunnel3dScene } from "/matrix/templates/tunnel3d/builder.js";

Vue.use(antd);

const SAMPLE_TUNNELS = [
    {
        id: "demo-3d-1",
        name: "胜利隧道设备样例",
        source: "/formule/tunnel/scene/2018197149602418688.json",
    },
];

let resolver;

new Vue({
    el: "#app",
    data: {
        tunnels: SAMPLE_TUNNELS,
        selectedId: "",
        sceneMessage: "",
    },
    mounted() {
        if (this.tunnels.length) {
            this.selectTunnel(this.tunnels[0]);
        }
        this.startMockLoop();
    },
    methods: {
        async selectTunnel(item) {
            this.selectedId = item.id;
            const tunnelData = item.source
                ? await this.loadTunnelSceneData(item.source)
                : {
                    devices: item.devices || [],
                    length: item.length,
                    startMil: item.startMil,
                    name: item.name,
                };
            const devices = tunnelData.devices || [];
            const scene = buildTunnel3dScene(devices, {
                sceneId: item.id,
                sceneName: tunnelData.name || item.name,
                length: tunnelData.length,
                startMil: tunnelData.startMil,
            });
            this.sceneMessage = JSON.stringify(scene, null, 2);
            if (!resolver) {
                resolver = new Resolver("scene", scene, this);
            } else {
                resolver.initScene(scene);
            }
        },
        async loadTunnelSceneData(url) {
            const res = await fetch(url);
            const scene = await res.json();
            const rawDevices = (scene.elements || [])
                .filter((ele) => ele?.data?.origin)
                .map((ele) => {
                    const origin = ele.data.origin || {};
                    return {
                        id: origin.id || ele.id,
                        name: origin.name || ele.name,
                        deviceTypeId: origin.deviceTypeId,
                        deviceTypeName: origin.deviceTypeName,
                        direction: origin.direction,
                        mil: Number(origin.sort),
                        icon: ele.graph?.icon,
                        color: ele.color,
                    };
                })
                .filter((item) => Number.isFinite(item.mil));
            const milValues = rawDevices.map((item) => item.mil).sort((a, b) => a - b);
            const startMil = milValues[0] || 0;
            const endMil = milValues[milValues.length - 1] || startMil;
            return {
                name: scene.name || "隧道设备样例",
                startMil,
                length: Math.max(100, endMil - startMil),
                devices: rawDevices,
            };
        },
        eleClick(ele) {
            console.log("[tunnel3d] click", ele);
        },
        startMockLoop() {},
    },
});
