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
    backgroundStartUrl: "/common/images/tunnel_start.png",
    backgroundCenterUrl: "/common/images/tunnel_center.png",
    backgroundEndUrl: "/common/images/tunnel_end.png",
    backgroundStartWidth: 0,
    backgroundCenterWidth: 0,
    backgroundEndWidth: 0,
    minDeviceSpacing: 80,
    showStartEndLabel: true,
    deviceTypeMap: DEFAULT_DEVICE_TYPES,
    bindingTarget: "data.state",
    labelNameMode: NameModes.Hover,
};

const genId = (prefix, index) => `${prefix}-${index}`;
const normalizeDirection = (direction) => {
    if (direction === 0 || direction === 1 || direction === 2) return direction;
    if (typeof direction === "string") {
        if (direction.includes("左")) return 1;
        if (direction.includes("右")) return 0;
        if (direction.includes("中")) return 2;
    }
    return 1;
};

const numOr = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const normalizeDimension = (value, fallback = 0, min = 0) =>
    Math.max(min, numOr(value, fallback));

/**
 * 生成隧道场景配置
 * @param {Array<Object>} devices
 * @param {Object} options
 */
export function buildTunnelScene(devices = [], options = {}) {
    const opt = { ...DEFAULT_OPTIONS, ...options };
    const normalizedDevices = (devices || []).map((dev) => {
        const dpIds =
            typeof dev?.dpId === "string"
                ? dev.dpId
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                : Array.isArray(dev?.dpId)
                ? dev.dpId
                : [];
        return {
            ...dev,
            dir: normalizeDirection(dev?.direction ?? dev?.dir),
            type: dev?.deviceTypeId ?? dev?.type,
            sort: Number.isFinite(dev?.sort) ? dev.sort : dev?.mil || 0,
            dpIds,
            origin: dev,
        };
    });

    const minDeviceSpacing = normalizeDimension(opt.minDeviceSpacing, 80, 1);
    const groupCountMap = normalizedDevices.reduce((acc, dev) => {
        const key = `${dev.type || "unknown"}-${dev.dir}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const maxTrackDeviceCount = Math.max(
        1,
        ...Object.values(groupCountMap).map((count) => Number(count) || 0)
    );
    const minUsableWidthByDensity =
        maxTrackDeviceCount > 1
            ? (maxTrackDeviceCount - 1) * minDeviceSpacing
            : 1;

    const offsetLeft = normalizeDimension(opt.offsetLeft, 40, 0);
    const offsetRight = normalizeDimension(opt.offsetRight, 40, 0);
    const offsetTop = normalizeDimension(opt.offsetTop, 20, 0);
    const offsetBottom = normalizeDimension(opt.offsetBottom, 20, 0);

    const baseTunnelWidth = normalizeDimension(opt.tunnelWidth, 1200, 1);
    const baseSceneWidth = normalizeDimension(
        opt.sceneWidth,
        baseTunnelWidth,
        baseTunnelWidth
    );
    const baseSceneHeight = normalizeDimension(
        opt.sceneHeight,
        opt.tunnelHeight,
        opt.tunnelHeight
    );

    const minTunnelWidthByDensity =
        minUsableWidthByDensity + offsetLeft + offsetRight;
    const targetTunnelWidth = Math.max(baseTunnelWidth, minTunnelWidthByDensity);

    const startBgUrl = opt.backgroundStartUrl || opt.tunnelStartUrl;
    const centerBgUrl = opt.backgroundCenterUrl || opt.tunnelCenterUrl;
    const endBgUrl = opt.backgroundEndUrl || opt.tunnelEndUrl;

    const startBgWidth = normalizeDimension(opt.backgroundStartWidth, 0, 0);
    const centerBgWidth = normalizeDimension(opt.backgroundCenterWidth, 0, 0);
    const endBgWidth = normalizeDimension(opt.backgroundEndWidth, 0, 0);

    const useSegmentBackground =
        Boolean(startBgUrl && centerBgUrl && endBgUrl) && centerBgWidth > 0;

    let tunnelWidth = targetTunnelWidth;
    let centerRepeatXTimes = 1;
    if (useSegmentBackground) {
        const fixedWidth = startBgWidth + endBgWidth;
        const targetCenterWidth = Math.max(1, targetTunnelWidth - fixedWidth);
        centerRepeatXTimes = Math.max(1, Math.ceil(targetCenterWidth / centerBgWidth));
        tunnelWidth = fixedWidth + centerBgWidth * centerRepeatXTimes;
    }

    const sceneWidth = Math.max(baseSceneWidth, tunnelWidth);
    const sceneHeight = baseSceneHeight;
    const originX = (sceneWidth - tunnelWidth) / 2;
    const originY = (sceneHeight - opt.tunnelHeight) / 2;
    const usableWidth = Math.max(1, tunnelWidth - offsetLeft - offsetRight);

    const topY = originY + offsetTop;
    const bottomY = Math.max(originY + offsetTop, originY + opt.tunnelHeight - offsetBottom);

    const elements = [];

    if (useSegmentBackground) {
        if (startBgWidth > 0) {
            elements.push({
                id: "tunnel-bg-start",
                name: "隧道背景-起始",
                color: Colors.Default,
                visible: true,
                layer: [],
                zIndex: 1,
                type: ElementType.Picture,
                graph: {
                    url: startBgUrl,
                    width: startBgWidth,
                    height: opt.tunnelHeight,
                    x: originX,
                    y: originY,
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
        }

        const centerX = originX + startBgWidth;
        elements.push({
            id: "tunnel-bg",
            name: "隧道背景",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 1,
            type: ElementType.Picture,
            graph: {
                url: centerBgUrl,
                width: centerBgWidth,
                height: opt.tunnelHeight,
                x: centerX,
                y: originY,
                repeatXTimes: centerRepeatXTimes,
                repeatYTimes: 1,
            },
            data: {},
            conf: {
                nameMode: NameModes.Hidden,
                actions: [],
                trigger: [],
            },
        });

        if (endBgWidth > 0) {
            elements.push({
                id: "tunnel-bg-end",
                name: "隧道背景-末端",
                color: Colors.Default,
                visible: true,
                layer: [],
                zIndex: 1,
                type: ElementType.Picture,
                graph: {
                    url: endBgUrl,
                    width: endBgWidth,
                    height: opt.tunnelHeight,
                    x: centerX + centerBgWidth * centerRepeatXTimes,
                    y: originY,
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
        }
    } else {
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
                width: tunnelWidth,
                height: opt.tunnelHeight,
                x: originX,
                y: originY,
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
    }

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
                position: {
                    x: originX + offsetLeft,
                    y: Math.max(0, originY + offsetTop - 20),
                },
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
                position: {
                    x: originX + offsetLeft + usableWidth,
                    y: Math.max(0, originY + offsetTop - 20),
                },
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

    const typeOrder = Array.from(new Set(normalizedDevices.map((d) => d.type)));
    typeOrder.forEach((type) => {
        const typeMeta = opt.deviceTypeMap[type] || {};
        const elementType = typeMeta.elementType || ElementType.Point;
        const offsetY = Number(typeMeta.offset) || 0;
        const offsetCenter = Number(typeMeta.offsetCenter) || 0;
        const baseY = topY + offsetY;
        const mirrorY = bottomY - offsetY;
        const centerY = (topY + bottomY) / 2 + offsetCenter;

        [1, 0].forEach((dir) => {
            const list = normalizedDevices
                .filter((d) => d.type === type && d.dir === dir)
                .sort((a, b) => {
                    const aSort = Number.isFinite(a?.sort) ? a.sort : 0;
                    const bSort = Number.isFinite(b?.sort) ? b.sort : 0;
                    return aSort - bSort;
                });
            const count = list.length;
            const stepX = count > 1 ? usableWidth / (count - 1) : 0;
            const segmentW = count > 0 ? usableWidth / count : usableWidth;

            list.forEach((dev, index) => {
                const x = originX + offsetLeft + stepX * index;
                const y = dir === 1 ? baseY : mirrorY;
                const bindings = [];
                const data = { origin: dev.origin };
                if (elementType === ElementType.TextLine) {
                    data.isTextDown = dir !== 1;
                    data.value = "-";
                }
                if (dev.dpIds?.length) {
                    dev.dpIds.forEach((dpId, dpIndex) => {
                        const key = dpIndex === 0 ? "value" : `value${dpIndex + 1}`;
                        data[key] = null;
                        bindings.push({
                            tag: dpId,
                            to: `data.${key}`,
                        });
                    });
                }
                const stateKey = `state-${dev.id}`;
                data.color = null;
                const stateMap =
                    typeMeta.stateMap || {
                        "-1": "#2F7CEE",
                        0: "#7B7A82",
                        1: "#7B7A82",
                        2: "#FF3040",
                    };
                bindings.push({
                    tag: stateKey,
                    to: "data.color",
                    map: stateMap,
                });
                const actions = [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                    {
                        when: "data.color != null",
                        do: "changeColor",
                        params: { color: "@data.color" },
                    },
                ];

                if (elementType === ElementType.Polyline) {
                    const segStart = originX + offsetLeft + segmentW * index;
                    const segEnd = originX + offsetLeft + segmentW * (index + 1);
                    const lineColor = Colors.Normal;
                    elements.push({
                        id: dev.id || genId(`line-${type}-${dir}`, index),
                        name: dev.name || "线形设备",
                        color: lineColor,
                        visible: true,
                        layer: [],
                        zIndex: 2,
                        type: ElementType.Polyline,
                        graph: {
                            positions: [
                                { x: segStart, y },
                                { x: segEnd, y },
                            ],
                        },
                        data,
                        bindings,
                        conf: {
                            nameMode: typeMeta.nameMode || opt.labelNameMode,
                            actions,
                            trigger: [],
                        },
                    });
                    return;
                }

                if (elementType === ElementType.TextLine) {
                    const segStart = originX + offsetLeft + segmentW * index;
                    const segEnd = originX + offsetLeft + segmentW * (index + 1);
                    elements.push({
                        id: dev.id || genId(`textline-${type}-${dir}`, index),
                        name: dev.name || "线形设备",
                        color: Colors.Normal,
                        visible: true,
                        layer: [],
                        zIndex: 2,
                        type: ElementType.TextLine,
                        graph: {
                            positions: [
                                { x: segStart, y },
                                { x: segEnd, y },
                            ],
                        },
                        data,
                        bindings,
                        conf: {
                            nameMode: typeMeta.nameMode || opt.labelNameMode,
                            actions,
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
                    data,
                    bindings,
                    conf: {
                        nameMode: typeMeta.nameMode || opt.labelNameMode,
                        actions,
                        trigger: [],
                    },
                });
            });
        });
    });

    const centerListByType = typeOrder.map((type) => ({
        type,
        list: normalizedDevices
            .filter((d) => d.type === type && d.dir === 2)
            .sort((a, b) => {
                const aSort = Number.isFinite(a?.sort) ? a.sort : 0;
                const bSort = Number.isFinite(b?.sort) ? b.sort : 0;
                return aSort - bSort;
            }),
    }));

    centerListByType.forEach((group) => {
        const typeMeta = opt.deviceTypeMap[group.type] || {};
        const elementType = typeMeta.elementType || ElementType.Point;
        const offsetCenter = Number(typeMeta.offsetCenter) || 0;
        const centerY = (topY + bottomY) / 2 + offsetCenter;
        const list = group.list;
        const count = list.length;
        const stepX = count > 1 ? usableWidth / (count - 1) : 0;
        const segmentW = count > 0 ? usableWidth / count : usableWidth;

        list.forEach((dev, index) => {
            const x = originX + offsetLeft + stepX * index;
            const y = centerY;
            const bindings = [];
            const data = { origin: dev.origin };
            if (elementType === ElementType.TextLine) {
                data.isTextDown = true;
                data.value = "-";
            }
            if (dev.dpIds?.length) {
                dev.dpIds.forEach((dpId, dpIndex) => {
                    const key = dpIndex === 0 ? "value" : `value${dpIndex + 1}`;
                    data[key] = null;
                    bindings.push({
                        tag: dpId,
                        to: `data.${key}`,
                    });
                });
            }
            const stateKey = `state-${dev.id}`;
            data.color = null;
            const stateMap =
                typeMeta.stateMap || {
                    "-1": "#2F7CEE",
                    0: "#7B7A82",
                    1: "#7B7A82",
                    2: "#FF3040",
                };
            bindings.push({
                tag: stateKey,
                to: "data.color",
                map: stateMap,
            });
            const actions = [
                {
                    when: "data.value != null",
                    do: "changeValue",
                    params: { value: "@data.value" },
                },
                {
                    when: "data.color != null",
                    do: "changeColor",
                    params: { color: "@data.color" },
                },
            ];

            if (elementType === ElementType.Polyline) {
                const segStart = originX + offsetLeft + segmentW * index;
                const segEnd = originX + offsetLeft + segmentW * (index + 1);
                const lineColor = Colors.Normal;
                elements.push({
                    id: dev.id || genId(`line-${group.type}-2`, index),
                    name: dev.name || "线形设备",
                    color: lineColor,
                    visible: true,
                    layer: [],
                    zIndex: 2,
                    type: ElementType.Polyline,
                    graph: {
                        positions: [
                            { x: segStart, y },
                            { x: segEnd, y },
                        ],
                    },
                    data,
                    bindings,
                    conf: {
                        nameMode: typeMeta.nameMode || opt.labelNameMode,
                        actions,
                        trigger: [],
                    },
                });
                return;
            }

            if (elementType === ElementType.TextLine) {
                const segStart = originX + offsetLeft + segmentW * index;
                const segEnd = originX + offsetLeft + segmentW * (index + 1);
                elements.push({
                    id: dev.id || genId(`textline-${group.type}-2`, index),
                    name: dev.name || "线形设备",
                    color: Colors.Normal,
                    visible: true,
                    layer: [],
                    zIndex: 2,
                    type: ElementType.TextLine,
                    graph: {
                        positions: [
                            { x: segStart, y },
                            { x: segEnd, y },
                        ],
                    },
                    data,
                    bindings,
                    conf: {
                        nameMode: typeMeta.nameMode || opt.labelNameMode,
                        actions,
                        trigger: [],
                    },
                });
                return;
            }

            elements.push({
                id: dev.id || genId(`point-${group.type}-2`, index),
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
                data,
                bindings,
                conf: {
                    nameMode: typeMeta.nameMode || opt.labelNameMode,
                    actions,
                    trigger: [],
                },
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
            view: {
                centerOn: "tunnel-bg",
            },
        },
        elements,
        anchors: [],
        layers: [],
    };
}
