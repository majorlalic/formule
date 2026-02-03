/**
 * 数据点存储中心
 * @author wujiaqi
 */
export default class DataPointStore {
    constructor() {
        this._map = new Map();
        this._subs = new Map();
        this._prev = new Map();
    }

    /**
     * 设置单个数据点
     * @param {string} key
     * @param {*} value
     */
    set(key, value, options = {}) {
        this._map.set(key, value);
        if (options.emit !== false) {
            this._notify(key, value);
        }
    }

    /**
     * 批量设置数据点
     * @param {Object} payload
     */
    bulkSet(payload = {}, options = {}) {
        const changed = new Map();
        Object.entries(payload).forEach(([key, value]) => {
            this._prev.set(key, this._map.get(key));
            this._map.set(key, value);
            changed.set(key, value);
        });

        if (options.emit !== false) {
            this._emitChanged(changed);
        }
    }

    /**
     * 获取数据点
     * @param {string} key
     */
    get(key) {
        return this._map.get(key);
    }

    getPrev(key) {
        return this._prev.get(key);
    }

    /**
     * 订阅数据点变化
     * @param {string} key
     * @param {(value:any, key:string)=>void} callback
     * @param {{throttleMs?:number}} options
     */
    subscribe(key, callback, options = {}) {
        if (!key || typeof callback !== "function") return () => {};
        const throttleMs = Number(options.throttleMs) || 0;
        const sub = {
            callback,
            throttleMs,
            timer: null,
            pending: undefined,
        };
        if (!this._subs.has(key)) {
            this._subs.set(key, new Set());
        }
        this._subs.get(key).add(sub);
        return () => {
            const set = this._subs.get(key);
            if (!set) return;
            set.delete(sub);
            if (set.size === 0) {
                this._subs.delete(key);
            }
        };
    }

    _notify(key, value) {
        const set = this._subs.get(key);
        if (!set || set.size === 0) return;
        set.forEach((sub) => {
            if (!sub.throttleMs) {
                sub.callback(value, key);
                return;
            }
            sub.pending = value;
            if (sub.timer) return;
            sub.timer = setTimeout(() => {
                sub.timer = null;
                const latest = sub.pending;
                sub.pending = undefined;
                sub.callback(latest, key);
            }, sub.throttleMs);
        });
    }

    _emitChanged(changed) {
        for (const [key, value] of changed.entries()) {
            this._notify(key, value);
        }
    }
}
