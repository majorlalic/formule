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
const DEFAULT_LINE_COLORS = ["#29c6ff", "#ff9d00", "#7cff5a", "#ff5abf"];

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
    const usableWidth = Math.max(
        1,
        opt.tunnelWidth - opt.offsetLeft - opt.offsetRight
    );

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
    typeOrder.forEach((type) => {
        const typeMeta = opt.deviceTypeMap[type] || {};
        const elementType = typeMeta.elementType || ElementType.Point;
        const offsetY = Number(typeMeta.offset) || 0;
        const baseY = topY + offsetY;
        const mirrorY = bottomY - offsetY;

        [1, 0].forEach((dir) => {
            const list = devices
                .filter((d) => d.type === type && d.dir === dir)
                .sort((a, b) => {
                    const aMil = Number.isFinite(a?.mil) ? a.mil : 0;
                    const bMil = Number.isFinite(b?.mil) ? b.mil : 0;
                    return aMil - bMil;
                });
            const count = list.length;
            const stepX = count > 1 ? usableWidth / (count - 1) : 0;
            const segmentW = count > 0 ? usableWidth / count : usableWidth;

            list.forEach((dev, index) => {
        const x = opt.offsetLeft + stepX * index;
        const y = dir === 1 ? baseY : mirrorY;

        if (elementType === ElementType.Polyline) {
            const segStart = opt.offsetLeft + segmentW * index;
            const segEnd = opt.offsetLeft + segmentW * (index + 1);
            const lineColors =
                typeMeta.lineColors && typeMeta.lineColors.length
                    ? typeMeta.lineColors
                    : DEFAULT_LINE_COLORS;
            const lineColor =
                lineColors[index % lineColors.length] ||
                dev.color ||
                Colors.Normal;
            elements.push({
                id: dev.id || genId(`line-${type}-${dir}`, index),
                name: dev.name || "线形设备",
                color: lineColor,
                visible: true,
                layer: [],
                zIndex: 3,
                type: ElementType.Polyline,
                graph: {
                    positions: [
                        { x: segStart, y },
                        { x: segEnd, y },
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
            id: dev.id || genId(`point-${type}-${dir}`, index),
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
