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
    {
        name: "建筑",
        value: "building",
        url: "/common/images/icons/building.svg",
    },
    { name: "区域", value: "area", url: "/common/images/icons/area.svg" },
    { name: "人脸识别", value: "face", url: "/common/images/icons/face.svg" },
    { name: "道闸", value: "brake", url: "/common/images/icons/brake.svg" },
    { name: "雷达", value: "radar", url: "/common/images/icons/radar.svg" },
    { name: "无人机", value: "uav", url: "/common/images/icons/uav.svg" },
    {
        name: "指挥中心",
        value: "center",
        url: "/common/images/icons/center.svg",
    },
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
};

/**
 * 图元类型
 * @enum
 * @readonly
 */
export const ElementType = {
    Point: "Point",
    Polyline: "Polyline",
    TextLine: "TextLine",
    Polygon: "Polygon",
    Label: "Label",
    Modal: "Modal",
    Picture: "Picture",
    CirclePoint: "CirclePoint",
    PointLine: "PointLine",
};

/**
 * 场景类型
 * @enum
 * @readonly
 */
export const SceneType = {
    Gis: "Gis",
    ThreeD: "ThreeD",
    TwoD: "TwoD",
};

/**
 * 场景支持的图元 & 图元graph所需的属性
 * @enum
 * @readonly
 */
export const SceneTypeMeta = {
    [SceneType.Gis]: {
        dir: "gis",
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "latlng", label: "坐标" },
            ],
            [ElementType.Polyline]: [
                { field: "positions", type: "latlng-array", label: "坐标" },
            ],
            [ElementType.Polygon]: [
                { field: "positions", type: "latlng-array", label: "坐标" },
            ],
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
    [SceneType.ThreeD]: {
        dir: "3d",
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "vector3", label: "坐标" },
            ],
            [ElementType.Polyline]: [
                { field: "positions", type: "vector3-array", label: "坐标" },
            ],
            [ElementType.Polygon]: [
                { field: "positions", type: "vector3-array", label: "坐标" },
            ],
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
    [SceneType.TwoD]: {
        dir: "2d",
        supportElementTypes: {
            [ElementType.Point]: [
                { field: "icon", type: "icon", label: "图标" },
                { field: "position", type: "vector2", label: "坐标" },
            ],
            [ElementType.Polyline]: [
                { field: "positions", type: "vector2-array", label: "坐标" },
            ],
            [ElementType.TextLine]: [
                { field: "positions", type: "vector2-array", label: "坐标" },
            ],
            [ElementType.Polygon]: [
                { field: "positions", type: "vector2-array", label: "坐标" },
            ],
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
    Timer: "Timer", // 循环
};

/**
 * 动作类型
 * @enum
 * @readonly
 */
export const ActionType = {
    PopComponent: "PopComponent", // 弹窗
    OpenUrl: "OpenUrl", // 打开地址
    ChangeColor: "ChangeColor", // 修改颜色
    ExecuteScript: "ExecuteScript", // 执行脚本
    ChangeScene: "ChangeScene", // 切换场景
    ChangeAnchor: "ChangeAnchor", // 切换锚点
    ChangePosition: "ChangePosition", // 修改图元位置
    ChangeVisible: "ChangeVisible", // 显示/隐藏图元
    RunEleBehavior: "RunEleBehavior", // 显示/隐藏图元
};

/**
 * 动作类型参数
 * @enum
 * @readonly
 */
export const ActionTypeMeta = {
    [ActionType.PopComponent]: {
        scheme: ["name", "props"],
    }, // 弹窗
    [ActionType.OpenUrl]: {
        scheme: ["url"],
    }, // 打开地址
    [ActionType.ChangeColor]: {
        scheme: ["color"],
    }, // 修改颜色
    [ActionType.ExecuteScript]: {
        scheme: ["url"],
    }, // 执行脚本
    [ActionType.ChangeScene]: {
        scheme: ["sceneId"],
    }, // 切换场景
    [ActionType.ChangeAnchor]: {
        scheme: ["anchorId"],
    }, // 切换锚点
    [ActionType.ChangePosition]: {
        scheme: ["position"],
    }, // 修改图元位置
    [ActionType.ChangeVisible]: {
        scheme: ["visible"],
    }, // 显示/隐藏图元
    [ActionType.RunEleBehavior]: {
        scheme: ["behaviorName", "behaviorParam"],
    }, // 显示/隐藏图元
};

/**
 * 图元行为
 * @enum
 * @readonly
 */
export const ElementBehavior = {
    ChangeColor: "changeColor", // 修改状态
    ChangeVisible: "changeVisible", // 显示/隐藏图元
    ChangePosition: "changePosition", // 修改图元位置
    ChangeValue: "changeValue", // 修改图元值
    Blink: "blink", // 闪烁
    StopBlink: "stopBlink", // 停止闪烁
};

/**
 * 图元行为参数
 * @enum
 * @readonly
 */
export const ElementBehaviorMeta = {
    [ElementBehavior.ChangeColor]: {
        scheme: ["color"],
    }, // 修改状态
    [ElementBehavior.ChangeVisible]: {
        scheme: ["visible"],
    }, // 显示/隐藏图元
    [ElementBehavior.ChangePosition]: {
        scheme: ["position"],
    }, // 修改图元位置
    [ElementBehavior.ChangeValue]: {
        scheme: ["value"],
    }, // 修改图元值
    [ElementBehavior.Blink]: {
        scheme: [],
    }, // 闪烁
    [ElementBehavior.StopBlink]: {
        scheme: [],
    }, // 停止闪烁
};

/**
 * 弹窗组件 组件的路径, 组件要求的参数
 * @enum
 * @readonly
 */
export const PopComponent = {
    LiveCamera: "LiveCamera",
    LineChart: "LineChart",
    StationInfo: "StationInfo",
};

/**
 * 弹窗组件 组件的路径, 组件要求的参数
 * @enum
 * @readonly
 */
export const PopComponentMeta = {
    [PopComponent.LiveCamera]: {
        url: "/matrix/common/components/live-video.html",
        props: ["bussinessId", "bussinessType"],
    },
    [PopComponent.LineChart]: {
        url: "/matrix/common/components/line-chart.html",
        props: ["bussinessId", "bussinessType"],
    },
    [PopComponent.StationInfo]: {
        url: "/matrix/common/components/station-info.html",
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
        url: "/matrix/common/scripts/testScript.js",
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
