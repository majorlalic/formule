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
};

/**
 * 事件名称
 * @enum
 * @readonly
 */
export const EventNames = {
  InitScene: "InitScene", // 初始化场景: 解释器 -> 场景
  EleEvent: "SendEleEvent", // 发送图元交互事件: 场景 -> 解释器
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
  Gis: {
    name: "Gis",
    dir: "gis",
    supportElementTypes: [
      ElementType.Point,
      ElementType.Polyline,
      ElementType.Polygon,
      ElementType.Label,
      ElementType.CirclePoint,
    ],
  },
  ThreeD: {
    name: "ThreeD",
    dir: "3d",
    supportElementTypes: [
      ElementType.Point,
      ElementType.Polyline,
      ElementType.Polygon,
      ElementType.Label,
      ElementType.Modal,
    ],
  },
  TwoD: {
    name: "TwoD",
    dir: "2d",
    supportElementTypes: [
      ElementType.Point,
      ElementType.Polyline,
      ElementType.Polygon,
      ElementType.Label,
      ElementType.Picture,
    ],
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
    scheme: ["name", "props"],
  }, // 弹窗
  OpenUrl: {
    name: "OpenUrl",
    scheme: ["url"],
  }, // 打开地址
  ChangeColor: {
    name: "ChangeColor",
    scheme: ["color"],
  }, // 修改颜色
  ExecuteScript: {
    name: "ExecuteScript",
    scheme: ["url"],
  }, // 执行脚本
  ChangeScene: {
    name: "ChangeScene",
    scheme: ["sceneId"],
  }, // 切换场景
  ChangeAnchor: {
    name: "ChangeAnchor",
    scheme: ["anchorId"],
  }, // 切换锚点
  ChangePosition: {
    name: "ChangePosition",
    scheme: ["position"],
  }, // 修改图元位置
  ChangeVisible: {
    name: "ChangeVisible",
    scheme: ["visible"],
  }, // 显示/隐藏图元
  RunEleBehavior: {
    name: "RunEleBehavior",
    scheme: ["behaviorName", "behaviorParam"],
  }, // 显示/隐藏图元
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
