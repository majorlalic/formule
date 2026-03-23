import Resolver from "/matrix/common/core/resolver.js";
import { buildTunnel3dScene } from "/matrix/templates/tunnel3d/builder.js";

Vue.use(antd);

const SAMPLE_TUNNELS = [
    {
        id: "demo-3d-1",
        name: "金龙隧道",
        length: 1600,
        startMil: 3200,
    },
    {
        id: "demo-3d-2",
        name: "青岩隧道",
        length: 2200,
        startMil: 12500,
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
        selectTunnel(item) {
            this.selectedId = item.id;
            const scene = buildTunnel3dScene([], {
                sceneId: item.id,
                sceneName: item.name,
                length: item.length,
                startMil: item.startMil,
            });
            this.sceneMessage = JSON.stringify(scene, null, 2);
            if (!resolver) {
                resolver = new Resolver("scene", scene, this);
            } else {
                resolver.initScene(scene);
            }
        },
        eleClick(ele) {
            console.log("[tunnel3d] click", ele);
        },
        startMockLoop() {},
    },
});
