/**
 * 数据点存储中心
 * @author wujiaqi
 */
export default class DataPointStore {
    constructor() {
        this._map = new Map();
    }

    /**
     * 设置单个数据点
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        this._map.set(key, value);
    }

    /**
     * 批量设置数据点
     * @param {Object} payload
     */
    bulkSet(payload = {}) {
        Object.entries(payload).forEach(([key, value]) => {
            this._map.set(key, value);
        });
    }

    /**
     * 获取数据点
     * @param {string} key
     */
    get(key) {
        return this._map.get(key);
    }
}
