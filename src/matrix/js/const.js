/**
 * 图标
 * @enum
 * @readonly
 */
export const ICONS = [
    { name: "默认", value: "default", url: "/common/images/icons/default.svg" },
    { name: "光纤", value: "fiber", url: "/common/images/icons/fiber.svg" },
    { name: "摄像机", value: "camera", url: "/common/images/icons/camera.svg" },
    { name: "门禁", value: "door", url: "/common/images/icons/door.svg" },
    { name: "建筑", value: "building", url: "/common/images/icons/building.svg" },
    { name: "区域", value: "area", url: "/common/images/icons/area.svg" },
    { name: "人脸识别", value: "face", url: "/common/images/icons/face.svg" },
    { name: "道闸", value: "brake", url: "/common/images/icons/brake.svg" },
    { name: "雷达", value: "radar", url: "/common/images/icons/radar.svg" },
    { name: "无人机", value: "uav", url: "/common/images/icons/uav.svg" },
    { name: "指挥中心", value: "center", url: "/common/images/icons/center.svg" },
    { name: "营区", value: "camp", url: "/common/images/icons/camp.svg" },
    { name: "场站", value: "station", url: "/common/images/icons/station.svg" },
];

/**
 * 消息总线模块名称
 * @enum
 * @readonly
 */
export const ModuleNames = {
    Resolver: "Resolver",
    Scene: "Scene",
    Editor: "Editor",
};

/**
 * 事件名称
 * @enum
 * @readonly
 */
export const EventNames = {
    InitScene: "InitScene", // 初始化场景: 解释器 -> 场景
    EleEvent: "SendEleEvent", // 发送图元交互事件: 场景 -> 解释器，编辑器
    DataChange: "DataChange", // 数据变化 外部 -> 解释器
    LayerChange: "LayerChange", // 用户操作图层 外部 -> 解释器
    EleDataChange: "EleDataChange", // 图元属性变化  解释器 -> 场景
    ChangeEleColor: "ChangeEleColor", // 修改图元颜色  解释器 -> 场景
    ChangeAnchor: "ChangeAnchor", // 修改场景锚点 解释器 -> 场景
    ChangePosition: "ChangePosition", // 修改图元位置 解释器 -> 场景
    ChangeVisible: "ChangeVisible", // 修改图元可见 解释器 -> 场景
    ChangeLayer: "ChangeLayer", // 修改图层 解释器 -> 场景
    RunEleBehavior: "RunEleBehavior", // 执行图元行为 解释器 -> 场景

    SelectEle: "SelectEle", // 选中图元 编辑器 -> 场景
};

/**
 * 图元类型
 * @enum
 * @readonly
 */
export const ElementType = {
    Point: "Point",
    Polyline: "Polyline",
    Polygon: "Polygon",
    Label: "Label",
    Modal: "Modal",
    Picture: "Picture",
    CirclePoint: "CirclePoint",
    PointLine: "PointLine",
};

/**
 * 场景类型 & 场景支持的图元 & 图元graph所需的属性
 * @enum
 * @readonly
 */
export const SceneType = {
    Gis: {
        name: "Gis",
        dir: "gis",
        conf: [
            { field: "center", type: "latlng", label: "中心位置" },
            { field: "minZoom", type: "number", label: "最小缩放" },
            { field: "maxZoom", type: "number", label: "最大缩放" },
            { field: "zoom", type: "number", label: "缩放级别" },
            { field: "zoomControl", type: "boolean", label: "缩放控制" },
            { field: "isSite", type: "boolean", label: "卫星图层" },
        ],
        anchor: [
            { field: "center", type: "latlng", label: "地图中心", default: { lat: 0, lng: 0 } },
            { field: "zoom", type: "number", label: "缩放级别", default: 12 },
        ],
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "latlng", label: "坐标" },
            ],
            [ElementType.Polyline]: [{ field: "positions", type: "latlng-array", label: "坐标" }],
            [ElementType.Polygon]: [{ field: "positions", type: "latlng-array", label: "坐标" }],
            [ElementType.Label]: [
                { field: "position", type: "latlng", label: "坐标" },
                { field: "value", type: "string", label: "值" },
            ],
            [ElementType.CirclePoint]: [
                { field: "position", type: "latlng", label: "坐标" },
                { field: "icon", type: "icon", label: "图标" },
                { field: "radius", type: "number", label: "半径(m)" },
            ],
        },
    },
    ThreeD: {
        name: "ThreeD",
        dir: "3d",
        conf: [
            { field: "camera", type: "vector3", label: "镜头位置" },
            { field: "target", type: "vector3", label: "镜头目标" },
        ],
        anchor: [
            { field: "camera", type: "vector3", label: "镜头位置", default: { x: 0, y: 0, z: 0 } },
            { field: "target", type: "vector3", label: "镜头目标", default: { x: 0, y: 0, z: 0 } },
        ],
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "vector3", label: "坐标" },
            ],
            [ElementType.Polyline]: [{ field: "positions", type: "vector3-array", label: "坐标" }],
            [ElementType.Polygon]: [{ field: "positions", type: "vector3-array", label: "坐标" }],
            [ElementType.Label]: [
                { field: "position", type: "vector3", label: "坐标" },
                { field: "value", type: "string", label: "值" },
            ],
            [ElementType.Modal]: [
                { field: "path", type: "string", label: "模型路径" },
                { field: "position", type: "vector3", label: "位置" },
                { field: "scale", type: "number", label: "缩放级别" },
            ],
        },
    },
    TwoD: {
        name: "TwoD",
        dir: "2d",
        conf: [{ field: "position", type: "vector2", label: "镜头位置" }],
        anchor: [{ field: "position", type: "vector2", label: "镜头位置", default: { x: 0, y: 0 } }],
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "vector2", label: "坐标" },
            ],
            [ElementType.Polyline]: [{ field: "positions", type: "vector2-array", label: "坐标" }],
            [ElementType.Polygon]: [{ field: "positions", type: "vector2-array", label: "坐标" }],
            [ElementType.Label]: [
                { field: "position", type: "vector2", label: "坐标" },
                { field: "value", type: "string", label: "值" },
            ],
            [ElementType.Picture]: [
                { field: "x", type: "number", label: "x坐标(px)" },
                { field: "y", type: "number", label: "y坐标(px)" },
                { field: "url", type: "string", label: "图片地址" },
                { field: "width", type: "number", label: "宽度(px)" },
                { field: "height", type: "number", label: "高度(px)" },
            ],
            [ElementType.PointLine]: [
                { field: "line", type: "vector2-array", label: "线坐标" },
                { field: "percent", type: "number", label: "百分比" },
                { field: "icon", type: "icon", label: "图标" },
            ],
        },
    },
};

/**
 * 常用颜色
 * Chrome浏览器4色, 觉得不好看肯定是你审美问题doge
 */
export const Colors = {
    Normal: "#2F7CEE",
    Warning: "#FABE11",
    Error: "#E43D30",
    Online: "#249544",
    Offline: "#7B7A82",
    Default: "#FFFFFF",
};

/**
 * 交互类型
 * @enum
 * @readonly
 */
export const InteractionType = {
    Click: "Click",
    Hover: "Hover",
    HoverOut: "HoverOut",
    Custom: "Custom",
};

/**
 * 动作类型, 获取动作范围和强制要求的参数
 * @enum
 * @readonly
 */
export const ActionTypes = {
    PopComponent: {
        name: "PopComponent",
        label: "弹窗组件",
        scheme: [
            { field: "name", type: "string", label: "组件名称" },
            { field: "props", type: "object", label: "组件属性" },
        ],
    }, // 弹窗
    OpenUrl: {
        name: "OpenUrl",
        label: "打开地址",
        scheme: [{ field: "url", type: "string", label: "地址" }],
    }, // 打开地址
    ChangeColor: {
        name: "ChangeColor",
        label: "修改颜色",
        scheme: [{ field: "color", type: "string", label: "颜色" }],
    }, // 修改颜色
    ExecuteScript: {
        name: "ExecuteScript",
        label: "执行脚本",
        scheme: [{ field: "url", type: "string", label: "脚本地址" }],
    }, // 执行脚本
    ChangeScene: {
        name: "ChangeScene",
        label: "切换场景",
        scheme: [{ field: "sceneId", type: "string", label: "场景id" }],
    }, // 切换场景
    ChangeAnchor: {
        name: "ChangeAnchor",
        label: "切换锚点",
        scheme: [{ field: "anchorId", type: "string", label: "锚点id" }],
    }, // 切换锚点
    ChangePosition: {
        name: "ChangePosition",
        label: "修改图元位置",
        scheme: [{ field: "position", type: "object", label: "位置" }],
    }, // 修改图元位置
    ChangeVisible: {
        name: "ChangeVisible",
        label: "显示/隐藏图元",
        scheme: [{ field: "visible", type: "boolean", label: "可见" }],
    }, // 显示/隐藏图元
    RunEleBehavior: {
        name: "RunEleBehavior",
        label: "执行自定义行为",
        scheme: [
            { field: "behaviorName", type: "string", label: "行为名称" },
            { field: "behaviorParam", type: "object", label: "行为参数" },
        ],
    }, // 执行自定义行为
};

/**
 * 图元行为
 * 有个小坑, 这里首字母都是小写
 * @enum
 * @readonly
 */
export const ElementBehaviors = {
    changeColor: {
        name: "changeColor",
        scheme: ["color"],
    }, // 修改状态
    changeVisible: {
        name: "changeVisible",
        scheme: ["visible"],
    }, // 显示/隐藏图元
    changePosition: {
        name: "changePosition",
        scheme: ["position"],
    }, // 修改图元位置
    changeValue: {
        name: "changeValue",
        scheme: ["value"],
    }, // 修改图元值
};

/**
 * 弹窗组件 组件的路径, 组件要求的参数
 * @enum
 * @readonly
 */
export const PopComponents = {
    "live-camera": {
        name: "live-camera",
        url: "/matrix/components/live-video.html",
        props: ["bussinessId", "bussinessType"],
    },
    "line-chart": {
        name: "line-chart",
        url: "/matrix/components/line-chart.html",
        props: ["bussinessId", "bussinessType"],
    },
    "station-info": {
        name: "station-info",
        url: "/matrix/components/station-info.html",
        props: ["company", "address", "zone"],
    },
};

/**
 * 可执行脚本
 * @enum
 * @readonly
 */
export const Scripts = {
    test: {
        url: "/matrix/scripts/testScript.js",
    },
};

/**
 * 组件主题
 * @enum
 * @readonly
 */
export const Theme = {
    Light: "Light",
    Dark: "Dark",
};

/**
 * 图元名称展示模式
 * @enum
 * @readonly
 */
export const NameModes = {
    Permanent: "Permanent", // 常显
    Hover: "Hover", // 鼠标悬浮时显示
    Hidden: "Hidden", // 不显示
};
