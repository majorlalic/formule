/**
 * 脚本执行器
 * @author wujiaqi
 */
export default class ScriptExecutor {
    constructor() {
        this._cache = new Map();
    }

    /**
     * 动态加载一个模块脚本并执行其默认导出或 run 方法
     * @param {string} url 模块脚本路径
     * @param {object} data 传给模块的参数
     * @param {object} options 可选配置项
     * @returns {Promise<any>} 模块执行结果
     */
    async executeScript(url, data = {}, options = {}) {
        const {
            useCache = true,
            exportName = "run", // 模块导出的函数名
            onSuccess = null,
            onError = null,
        } = options;

        try {
            let mod;

            if (useCache && this._cache.has(url)) {
                mod = this._cache.get(url);
            } else {
                mod = await import(/* @vite-ignore */ url);
                if (useCache) this._cache.set(url, mod);
            }

            if (!mod || typeof mod[exportName] !== "function") {
                throw new Error(`模块未导出函数: ${exportName}`);
            }

            const result = await mod[exportName](data);
            onSuccess?.(result);
            return result;
        } catch (err) {
            console.error("[ScriptExecutor] 执行模块失败:", err);
            onError?.(err);
            throw err;
        }
    }

    /**
     * 清除模块缓存
     * @param {string} url
     */
    clearCache(url) {
        this._cache.delete(url);
    }

    /**
     * 清除所有模块缓存
     */
    clearAllCache() {
        this._cache.clear();
    }
}
