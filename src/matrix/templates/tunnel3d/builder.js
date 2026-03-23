import {
    ElementType,
    NameModes,
    SceneType,
} from "/matrix/common/core/const.js";

const DEFAULT_TUNNEL = {
    sceneId: "tunnel-3d",
    sceneName: "3D隧道场景",
    length: 1600,
    startMil: 3200,
    position: { x: 0, y: 0, z: 0 },
    cameraHeight: 18,
};

const LANE_GAP = 14;
const FLOOR_WIDTH = 10.2;
const LENGTH_SCALE = 1 / 3;

export function buildTunnel3dScene(devices = [], options = {}) {
    const tunnel = { ...DEFAULT_TUNNEL, ...options };
    const length = Math.max(100, toNum(tunnel.length, DEFAULT_TUNNEL.length));
    const displayLength = length * LENGTH_SCALE;
    const startMil = toNum(tunnel.startMil, DEFAULT_TUNNEL.startMil);

    const tunnelElement = {
        id: "tunnel-main",
        name: tunnel.sceneName,
        type: ElementType.Tunnel3D,
        color: tunnel.color || "#0f4d6b",
        visible: true,
        layer: ["tunnel"],
        zIndex: 1,
        graph: {
            position: tunnel.position,
            length,
            startMil,
        },
        data: {
            length,
            startMil,
        },
        conf: {
            nameMode: NameModes.Hidden,
            actions: [],
            trigger: [],
        },
    };

    return {
        id: tunnel.sceneId,
        name: tunnel.sceneName,
        type: SceneType.ThreeD,
        conf: {
            position: {
                camera: {
                    x: displayLength / 2,
                    y: toNum(tunnel.cameraHeight, DEFAULT_TUNNEL.cameraHeight),
                    z: LANE_GAP * 2.2,
                },
                target: {
                    x: displayLength / 2,
                    y: FLOOR_WIDTH * 0.3,
                    z: 0,
                },
            },
        },
        elements: [tunnelElement],
        anchors: [
            {
                id: "tunnel-center",
                name: "隧道中心",
                position: {
                    camera: {
                        x: displayLength / 2,
                        y: toNum(tunnel.cameraHeight, DEFAULT_TUNNEL.cameraHeight),
                        z: LANE_GAP * 2.2,
                    },
                    target: {
                        x: displayLength / 2,
                        y: FLOOR_WIDTH * 0.3,
                        z: 0,
                    },
                },
            },
        ],
    };
}

function toNum(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}
