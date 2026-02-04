import {
    SceneType,
    ElementType,
    Colors,
    NameModes,
} from "/matrix/common/core/const.js";

const DEFAULT_DEVICE_TYPES = {
    smoke_sensor: { elementType: ElementType.Point, icon: "radar" },
    camera: { elementType: ElementType.Point, icon: "camera" },
    door: { elementType: ElementType.Point, icon: "door" },
    line_device: { elementType: ElementType.Polyline },
};

const DEFAULT_OPTIONS = {
    sceneId: "tunnel-2d",
    sceneName: "隧道场景",
    startMil: 0,
    endMil: 2000,
    tunnelWidth: 1200,
    tunnelHeight: 220,
    offsetLeft: 40, 
    offsetRight: 40,
    offsetTop: 20,
    offsetBottom: 20,
    typeGap: 40,
    backgroundUrl: "/common/images/tunnel.png",
    showStartEndLabel: true,
    deviceTypeMap: DEFAULT_DEVICE_TYPES,
    bindingTarget: "data.state",
    labelNameMode: NameModes.Hover,
};

const genId = (prefix, index) => `${prefix}-${index}`;

/**
 * 生成隧道场景配置
 * @param {Array<Object>} devices
 * @param {Object} options
 */
export function buildTunnelScene(devices = [], options = {}) {
    const opt = { ...DEFAULT_OPTIONS, ...options };
    const length = Math.max(1, opt.endMil - opt.startMil);
    const usableWidth = Math.max(
        1,
        opt.tunnelWidth - opt.offsetLeft - opt.offsetRight
    );
    const pxPerMil = usableWidth / length;

    const topY = opt.offsetTop;
    const bottomY = Math.max(opt.offsetTop, opt.tunnelHeight - opt.offsetBottom);

    const elements = [];

    elements.push({
        id: "tunnel-bg",
        name: "隧道背景",
        color: Colors.Default,
        visible: true,
        layer: [],
        zIndex: 1,
        type: ElementType.Picture,
        graph: {
            url: opt.backgroundUrl,
            width: opt.tunnelWidth,
            height: opt.tunnelHeight,
            x: 0,
            y: 0,
            repeatXTimes: 1,
            repeatYTimes: 1,
        },
        data: {},
        conf: {
            nameMode: NameModes.Hidden,
            actions: [],
            trigger: [],
        },
    });

    if (opt.showStartEndLabel) {
        elements.push({
            id: "tunnel-start",
            name: "起点里程",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 2,
            type: ElementType.Label,
            graph: {
                position: { x: opt.offsetLeft, y: Math.max(0, opt.offsetTop - 20) },
                value: `${opt.startMil}m`,
            },
            data: { value: `${opt.startMil}m` },
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                ],
                trigger: [],
            },
        });
        elements.push({
            id: "tunnel-end",
            name: "终点里程",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 2,
            type: ElementType.Label,
            graph: {
                position: { x: opt.offsetLeft + usableWidth, y: Math.max(0, opt.offsetTop - 20) },
                value: `${opt.endMil}m`,
            },
            data: { value: `${opt.endMil}m` },
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                ],
                trigger: [],
            },
        });
    }

    const typeOrder = Array.from(
        new Set(devices.map((d) => d.type))
    );
    const typeIndexMap = new Map(
        typeOrder.map((type, idx) => [type, idx])
    );
    const stepY = Math.max(1, Number(opt.typeGap) || 1);

    devices.forEach((dev, index) => {
        const typeMeta = opt.deviceTypeMap[dev.type] || {};
        const elementType = typeMeta.elementType || ElementType.Point;
        const x = opt.offsetLeft + (dev.mil - opt.startMil) * pxPerMil;
        const idx = typeIndexMap.get(dev.type) || 0;
        const baseY = topY + stepY * idx;
        const mirrorY = bottomY - stepY * idx;
        const y = dev.dir === 1 ? baseY : mirrorY;

        if (elementType === ElementType.Polyline) {
            elements.push({
                id: dev.id || genId("line", index),
                name: dev.name || "线形设备",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                type: ElementType.Polyline,
                graph: {
                    positions: [
                        { x: x - 12, y },
                        { x: x + 12, y },
                    ],
                },
                data: {
                    state: 0,
                },
                bindings: dev.dp
                    ? [
                          {
                              tag: dev.dp,
                              to: opt.bindingTarget,
                              default: 0,
                          },
                      ]
                    : [],
                conf: {
                    nameMode: opt.labelNameMode,
                    actions: [],
                    trigger: [],
                },
            });
            return;
        }

        elements.push({
            id: dev.id || genId("point", index),
            name: dev.name || "设备",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 3,
            type: ElementType.Point,
            graph: {
                icon: typeMeta.icon || "default",
                position: { x, y },
            },
            data: {
                state: 0,
            },
            bindings: dev.dp
                ? [
                      {
                          tag: dev.dp,
                          to: opt.bindingTarget,
                          default: 0,
                      },
                  ]
                : [],
            conf: {
                nameMode: opt.labelNameMode,
                actions: [],
                trigger: [],
            },
        });
    });

    return {
        id: opt.sceneId,
        name: opt.sceneName,
        type: SceneType.TwoD,
        conf: {
            draggable: true,
            dragDirection: ["x"],
        },
        elements,
        anchors: [],
        layers: [],
    };
}
