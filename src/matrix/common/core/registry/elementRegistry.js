// 图元注册表：按 (sceneType, elementType) 注册工厂方法
const elementRegistry = new Map(); // key: `${sceneType}:${elementType}`

/**
 * 注册图元类型
 * @param {string} sceneType - 场景类型，如 "ThreeD" / "TwoD" / "Gis"
 * @param {string} elementType - 图元类型，如 "Point" / "Polygon"
 * @param {function} factory - 工厂函数 (conf, context) => ElementInstance
 */
export function registerElement(sceneType, elementType, factory) {
    const key = `${sceneType}:${elementType}`;
    elementRegistry.set(key, factory);
}

/**
 * 创建图元实例
 * @param {string} sceneType
 * @param {object} elementConf
 * @param {object} context
 * @returns {object|null}
 */
export function createElement(sceneType, elementConf, context) {
    const key = `${sceneType}:${elementConf.type}`;
    const factory = elementRegistry.get(key);
    if (!factory) {
        console.warn(`未注册的图元类型: ${key}`);
        return null;
    }
    return factory(elementConf, context);
}

/**
 * 获取指定场景下支持的图元类型列表
 * @param {string} sceneType
 * @returns {string[]}
 */
export function listElementTypes(sceneType) {
    const prefix = `${sceneType}:`;
    const result = [];
    for (const key of elementRegistry.keys()) {
        if (key.startsWith(prefix)) {
            result.push(key.slice(prefix.length));
        }
    }
    return result;
}
