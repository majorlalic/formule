import { ElementData } from "./def/typeDef.js";
import { ElementDef } from "./def/elementDef.js";
import { SceneDef } from "./def/sceneDef.js";
import { SceneType,SceneTypeMeta } from "./const.js";

/**
 * 批量更新属性
 * @param {ElementDef} obj
 * @param {Array<ElementData>} datas
 */
export const setData = (obj, data) => {
    for (const key in data) {
        setValueByPath(obj, key, data[key]);
    }
};

/**
 * 更新单个属性
 * @param {ElementDef} obj
 * @param {String} path
 * @param {String | Number} value
 */
export const setValueByPath = (obj, path, value) => {
    path = path.split("|");

    let ref = obj;
    for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
        if (ref === undefined) {
            throw new Error(`路径有误: ${path.slice(0, i + 1).join(".")}`);
        }
    }
    ref[path[path.length - 1]] = value;
};

/**
 * 检查propObj是否包含requireArr定义的属性
 * @param {Object} propObj
 * @param {Array<String>} requireArr
 */
export const checkProps = (propObj, requireArr) => {
    if (typeof propObj !== "object" || propObj === null) return false;
    if (!Array.isArray(requireArr)) return false;

    return requireArr.every((key) => propObj.hasOwnProperty(key));
};

/**
 * 深度克隆
 * @param {Object} obj
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * 根据场景类型初始化容器
 * @param {String} containerId 容器id
 * @param {SceneDef} scene 场景类型
 */
export const initFrame = (containerId, scene) => {
    return new Promise((resolve, reject) => {
        let { id, type, conf, elements } = scene;

        if (SceneType[type] == undefined) {
            console.error(`未找到场景类型: ${type}`);
            return;
        }
        let dir = SceneTypeMeta[type].dir;

        const parts = location.href.replace(location.origin, "").split("/");
        let systemName;
        if (parts.length > 2) {
            systemName = parts[1];
        }
        let url = `/${systemName}/matrix/engine/${dir}/index.html`;

        let container = document.getElementById(containerId);
        if (!container) {
            console.error(`未找到 ID 为 ${containerId} 的容器元素`);
            return;
        } else {
            container.innerHTML = "";
        }
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.overflow = "hidden";
        iframe.addEventListener("load", function () {
            console.log("iframe 加载完成");
            // 零延迟defer, 不加延迟场景有概率收不到initScene消息
            setTimeout(() => {
                resolve(scene);
            }, 0);
        });

        container.appendChild(iframe);
    });
};

/**
 * 执行规则表达式或脚本
 * @param {string|function} expr 规则表达式或脚本
 * @param {{data:Object,payload:Object,ele:Object}} context
 * @returns {boolean}
 */
export const evalRule = (expr, context = {}) => {
    if (typeof expr === "function") {
        try {
            return !!expr(context);
        } catch (err) {
            console.error("[evalRule] 规则函数执行失败:", err);
            return false;
        }
    }
    if (typeof expr !== "string" || !expr.trim()) return false;

    const code = expr.trim();
    try {
        const fn = new Function(
            "data",
            "payload",
            "ele",
            "tag",
            `return (${code});`
        );
        return !!fn(
            context.data || {},
            context.payload || {},
            context.ele || {},
            context.tag || (() => undefined)
        );
    } catch (err) {
        console.error("[evalRule] 规则表达式执行失败:", err);
        return false;
    }
};

/**
 * 判断数组是否有相同部分
 * @param {Array<Object>} arr1
 * @param {Array<Object>} arr2
 */
export const hasSameElement = (arr1, arr2) => {
    return arr1.some((item) => arr2.includes(item));
};

/**
 * 将颜色代码转为rgba
 * @param {String} hex 颜色代码
 * @param {Number} alpha 透明度
 * @returns
 */
export const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * 验证场景配置
 * @param {SceneDef} scene
 */
export const validateScene = (scene) => {
    return true;
};

/**
 * 导出数据为 json 文件
 * @param {Object} data json 数据
 * @param {String} filename 文件名
 */
export const downloadJson = (data, filename = "data.json") => {
    // 将对象转换为 JSON 字符串（格式化）
    const jsonStr = JSON.stringify(data, null, 2);

    // 创建 Blob 对象
    const blob = new Blob([jsonStr], { type: "application/json" });

    // 创建临时链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // 模拟点击下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
