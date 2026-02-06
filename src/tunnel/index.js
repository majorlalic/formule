import Resolver from "/matrix/common/core/resolver.js";
import tunnelApi from "./api/tunnelApi.js";

Vue.use(antd);

let resolver;
const app = new Vue({
    el: "#app",
    data: {
        tunnels: [],
        selectedId: "",
        currentTunnelName: "",
        loading: false,
        sceneLoading: false,
    },
    mounted() {
        this.loadTunnels();
    },
    methods: {
        async loadTunnels() {
            this.loading = true;
            try {
                const res = await tunnelApi.getTunnel();
                const list = Array.isArray(res?.[0]) ? res[0] : res || [];
                this.tunnels = list;
                if (list.length) {
                    this.selectTunnel(list[0]);
                }
            } catch (err) {
                this.$message.error("分区数据加载失败");
            } finally {
                this.loading = false;
            }
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
            try {
                const scene = await this.fetchSceneById(id);
                if (!scene) return;
                this.centerSceneInView(scene);
                if (!resolver) {
                    resolver = new Resolver("scene", scene, this);
                } else {
                    resolver.initScene(scene);
                }
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
                    this.$message.error("场景文件未找到");
                    return null;
                }
                return await res.json();
            } catch (err) {
                this.$message.error("场景加载失败");
                return null;
            }
        },
        centerSceneInView(scene) {
            const sceneEl = document.getElementById("scene");
            if (!sceneEl || !scene?.elements?.length) return;
            const rect = sceneEl.getBoundingClientRect();
            const viewWidth = rect.width || 1200;
            const viewHeight = rect.height || 220;
            const bg =
                scene.elements.find((ele) => ele.id === "tunnel-bg") ||
                scene.elements.find((ele) => ele.type === "Picture");
            if (!bg?.graph) return;
            const repeatX = bg.graph.repeatXTimes || 1;
            const repeatY = bg.graph.repeatYTimes || 1;
            const width = (bg.graph.width || 0) * repeatX;
            const height = (bg.graph.height || 0) * repeatY;
            const centerX = (bg.graph.x || 0) + width / 2;
            const centerY = (bg.graph.y || 0) + height / 2;
            const offsetX = viewWidth / 2 - centerX;
            const offsetY = viewHeight / 2 - centerY;
            scene.conf = scene.conf || {};
            scene.conf.view = {
                ...(scene.conf.view || {}),
                offsetX,
                offsetY,
            };
        },
    },
});

window.app = app;
window.resolver = resolver;
