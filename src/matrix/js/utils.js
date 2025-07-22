import { ElementData } from "./def/typeDef.js";
import { ElementDef } from "./def/element/elementDef.js";
import { SceneDef } from "./def/sceneDef.js";
import { SceneType } from "./const.js";

export const collectPlaceholders = (obj) => {
    const regex = /\$\{([^}]+)\}/g;
    const placeholders = [];

    function recurse(current, path = []) {
        if (Array.isArray(current)) {
            current.forEach((item, i) => recurse(item, path.concat(i)));
        } else if (typeof current === "object" && current !== null) {
            for (const key in current) {
                recurse(current[key], path.concat(key));
            }
        } else if (typeof current === "string") {
            let match;
            while ((match = regex.exec(current))) {
                placeholders.push({
                    path: [...path], // 复制路径
                    key: match[1], // ${key} 中的 key
                });
            }
        }
    }

    recurse(obj);
    return placeholders;
};

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
 * 用对象属性替换字符串中的 ${key} 占位符
 * @param {String} str - 含有占位符的字符串
 * @param {Object} obj - 用于替换的属性对象
 * @returns {String} - 替换后的字符串
 */
export const fillTemplate = (str, obj) => {
    return str.replace(/\$\{([\w$.]+)\}/g, (match, path) => {
        const value = path.split(".").reduce((acc, key) => {
            return acc && acc.hasOwnProperty(key) ? acc[key] : undefined;
        }, obj);
        return value !== undefined ? value : match; // 如果找不到，保留原占位符
    });
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
        let dir = SceneType[type].dir;

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
 * 获取对象中value为${}结构的属性映射表, 并初始化使用了模板的属性
 * @param {ElementDef} ele 图元
 * @param {Map} handlerMap 属性变化的回调函数映射
 * @returns
 */
export const monitorAttr = (ele, handlerMap) => {
    const meta = new Map();

    for (const [key, value] of Object.entries(ele)) {
        if (typeof value === "string" && /\$\{[^}]+\}/.test(value)) {
            meta.set(key, value);
            fillTemplateSelf(ele, key, value);
        }
    }

    for (const key of Object.keys(handlerMap)) {
        let internalValue = ele[key];

        Object.defineProperty(ele, key, {
            get() {
                return internalValue;
            },
            set(newVal) {
                if (newVal !== internalValue) {
                    internalValue = newVal;
                    handlerMap[key]?.(); // 执行对应的回调
                }
            },
            configurable: true,
            enumerable: true,
        });
    }

    return meta;
};

/**
 * 初始化属性中的占位符
 * @param {ElementDef} ele 图元
 * @param {String} key 属性key
 * @param {String} str 属性值
 */
export const fillTemplateSelf = (ele, key, str) => {
    // 提取 ${} 中的路径
    const regex = /\$\{([^}]+)\}/g;
    const matches = [...str.matchAll(regex)];

    matches.forEach((match) => {
        const path = match[1]; // 如 data.value

        // 解析路径并获取对应属性值
        const value = path.split(".").reduce((acc, key) => acc?.[key], ele);
        // 如果属性没有占位符, 直接赋值
        if (!regex.test(value)) {
            ele[key] = str.replace(match[0], value);
        }
    });
};

export const resolveMetaPlaceholders = (ele, data) => {
    // const resolved = {};

    if (!(ele.meta instanceof Map)) return;

    for (const [key, value] of ele.meta.entries()) {
        const replaced = value.replace(/\$\{([^}]+)\}/g, (_, expression) => {
            // const result = getValueByPath(data, expression);
            const result = expression
                .split(".")
                .reduce((acc, key) => acc?.[key], data);
            return result != null ? result : "";
        });
        // resolved[key] = replaced;
        ele[key] = replaced;
    }

    // return resolved;
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
