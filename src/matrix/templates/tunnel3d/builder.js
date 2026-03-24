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
const DEVICE_TYPE_MAP = {
    smoke_sensor: { icon: "smoke", color: "#58d7ff" },
    camera: { icon: "camera", color: "#58d7ff" },
    door: { icon: "door", color: "#58d7ff" },
    line_device: { icon: "radar", color: "#ffd24a" },
};

const normalizeDirection = (direction) => {
    if (direction === 0 || direction === "0") return -1;
    if (direction === 1 || direction === "1") return 1;
    if (direction === 2 || direction === "2") return 0;
    if (typeof direction === "string") {
        if (direction.includes("左")) return 1;
        if (direction.includes("右")) return -1;
        if (direction.includes("中")) return 0;
    }
    return 1;
};

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

    const edgeZ = LANE_GAP / 2 + FLOOR_WIDTH / 2;
    const deviceElements = (devices || []).map((device, index) => {
        const type = device?.deviceTypeId || device?.type || "camera";
        const typeMeta = DEVICE_TYPE_MAP[type] || DEVICE_TYPE_MAP.camera;
        const rawMil = device?.sort != null
            ? toNum(device.sort, 0)
            : device?.mil != null
            ? toNum(device.mil, startMil)
            : 0;
        const relativeMil =
            rawMil >= startMil ? Math.max(0, rawMil - startMil) : Math.max(0, rawMil);
        const x = Math.min(length, relativeMil) * LENGTH_SCALE;
        const direction = normalizeDirection(device?.direction ?? device?.dir);
        const markerColor = device?.color || typeMeta.color;

        return {
            id: `tunnel-device-${device?.id || index + 1}`,
            name: device?.name || device?.deviceTypeName || `设备${index + 1}`,
            type: ElementType.TunnelDeviceMarker3D,
            color: markerColor,
            visible: true,
            layer: ["device"],
            zIndex: 3,
            graph: {
                position: {
                    x,
                    y: 0.13,
                    z: direction === 0 ? 0 : direction * edgeZ,
                },
                icon: device?.icon || typeMeta.icon,
                markerColor,
            },
            data: {
                origin: device,
                mil: startMil + relativeMil,
            },
            conf: {
                nameMode: NameModes.Hidden,
                actions: [],
                trigger: [],
            },
        };
    });

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
        elements: [tunnelElement, ...deviceElements],
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
