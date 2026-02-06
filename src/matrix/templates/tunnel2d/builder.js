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
const normalizeDirection = (direction) => {
    if (direction === 0 || direction === 1 || direction === 2) return direction;
    if (typeof direction === "string") {
        if (direction.includes("左")) return 1;
        if (direction.includes("右")) return 0;
        if (direction.includes("中")) return 2;
    }
    return 1;
};

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
    const sceneWidth = Number(opt.sceneWidth) || opt.tunnelWidth;
    const sceneHeight = Number(opt.sceneHeight) || opt.tunnelHeight;
    const originX = (sceneWidth - opt.tunnelWidth) / 2;
    const originY = (sceneHeight - opt.tunnelHeight) / 2;
    const usableWidth = Math.max(
        1,
        opt.tunnelWidth - opt.offsetLeft - opt.offsetRight
    );

    const topY = originY + opt.offsetTop;
    const bottomY = Math.max(
        originY + opt.offsetTop,
        originY + opt.tunnelHeight - opt.offsetBottom
    );

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
                    x: originX + opt.offsetLeft,
                    y: Math.max(0, originY + opt.offsetTop - 20),
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
                    x: originX + opt.offsetLeft + usableWidth,
                    y: Math.max(0, originY + opt.offsetTop - 20),
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

    const typeOrder = Array.from(
        new Set(normalizedDevices.map((d) => d.type))
    );
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
        const x = originX + opt.offsetLeft + stepX * index;
        const y = dir === 1 ? baseY : mirrorY;
        const bindings = [];
        const data = { origin: dev.origin };
        if (elementType === ElementType.TextLine) {
            data.isTextDown = dir !== 1;
        }
        if (elementType === ElementType.TextLine) {
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
            const segStart = originX + opt.offsetLeft + segmentW * index;
            const segEnd = originX + opt.offsetLeft + segmentW * (index + 1);
            const lineColor = Colors.Normal;
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
            const segStart = originX + opt.offsetLeft + segmentW * index;
            const segEnd = originX + opt.offsetLeft + segmentW * (index + 1);
            elements.push({
                id: dev.id || genId(`textline-${type}-${dir}`, index),
                name: dev.name || "线形设备",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
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
            const x = originX + opt.offsetLeft + stepX * index;
            const y = centerY;
            const bindings = [];
            const data = { origin: dev.origin };
            if (elementType === ElementType.TextLine) {
                data.isTextDown = true;
            }
            if (elementType === ElementType.TextLine) {
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
                const segStart = originX + opt.offsetLeft + segmentW * index;
                const segEnd = originX + opt.offsetLeft + segmentW * (index + 1);
                const lineColor = Colors.Normal;
                elements.push({
                    id: dev.id || genId(`line-${group.type}-2`, index),
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
                const segStart = originX + opt.offsetLeft + segmentW * index;
                const segEnd = originX + opt.offsetLeft + segmentW * (index + 1);
                elements.push({
                    id: dev.id || genId(`textline-${group.type}-2`, index),
                    name: dev.name || "线形设备",
                    color: Colors.Normal,
                    visible: true,
                    layer: [],
                    zIndex: 3,
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
