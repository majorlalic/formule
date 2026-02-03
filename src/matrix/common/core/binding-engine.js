/**
 * 绑定引擎：解析 bindings 并将数据点更新映射为图元数据变更
 * @author wujiaqi
 */
export default class BindingEngine {
    constructor(dataPointStore) {
        this.dataPointStore = dataPointStore;
    }

    build(eles) {
        // 建立 tag -> bindings 的索引，方便快速路由
        let bindingMap = new Map();
        eles.forEach((ele) => {
            (ele?.bindings || []).forEach((binding) => {
                if (!binding?.tag || !binding?.to) return;
                if (!bindingMap.has(binding.tag)) {
                    bindingMap.set(binding.tag, []);
                }

                const hasCalc = !!binding.calc;
                const hasMap = !!binding.map;
                const hasRange = Array.isArray(binding.range);
                const count = [hasCalc, hasMap, hasRange].filter(Boolean).length;
                if (count > 1) {
                    console.warn(
                        "binding 只允许使用 calc/map/range 其中一个，已按优先级 calc > map > range 处理：",
                        binding
                    );
                }

                let calcFn = null;
                if (hasCalc) {
                    try {
                        calcFn = new Function("value", "prev", "tag", binding.calc);
                    } catch (err) {
                        console.error("[BindingEngine] binding.calc 编译失败:", binding.calc, err);
                    }
                }

                bindingMap.get(binding.tag).push({
                    id: ele.id,
                    to: binding.to,
                    calc: binding.calc || "",
                    calcFn,
                    map: binding.map || null,
                    range: binding.range || null,
                    defaultValue: binding.default,
                    throttleMs: binding.throttleMs || 0,
                });
            });
        });
        return bindingMap;
    }

    applyTagUpdate(tag, value, bindingMap) {
        // 将单个数据点更新转换成 eleDatas
        let bindings = bindingMap.get(tag) || [];
        if (bindings.length === 0) return [];

        let eleDatas = [];
        bindings.forEach(({ id, to, calc, calcFn, map, range, defaultValue }) => {
            let dataPath = this._normalizeDataPath(to);
            if (!dataPath) {
                console.warn(`bindings.to 仅支持 data 路径: ${to}`);
                return;
            }
            const computed = this._applyBindingValue(
                value,
                tag,
                calc,
                calcFn,
                map,
                range
            );
            const finalValue =
                computed === undefined ? defaultValue : computed;
            if (finalValue === undefined) return;
            let data = {};
            data[dataPath] = finalValue;
            eleDatas.push({
                id,
                data,
                payload: { [tag]: value },
            });
        });

        return eleDatas;
    }

    _normalizeDataPath(path) {
        if (!path || typeof path !== "string") return null;
        if (path.startsWith("data.")) {
            return path.slice(5).replace(/\./g, "|");
        }
        if (path.startsWith("data|")) {
            return path.slice(5);
        }
        return null;
    }

    _applyBindingValue(value, tag, calc, calcFn, map, range) {
        if (calc) {
            try {
                const fn = calcFn || new Function("value", "prev", "tag", calc);
                return fn(
                    value,
                    this.dataPointStore.getPrev(tag),
                    (key) => this.dataPointStore.get(key)
                );
            } catch (err) {
                console.error("[BindingEngine] binding.calc 执行失败:", calc, err);
                return undefined;
            }
        }

        if (map && typeof map === "object") {
            return map[value];
        }

        if (Array.isArray(range)) {
            for (const r of range) {
                if (r == null) continue;
                if (r.hasOwnProperty("gt") && !(value > r.gt)) continue;
                if (r.hasOwnProperty("gte") && !(value >= r.gte)) continue;
                if (r.hasOwnProperty("lt") && !(value < r.lt)) continue;
                if (r.hasOwnProperty("lte") && !(value <= r.lte)) continue;
                if (r.hasOwnProperty("eq") && !(value === r.eq)) continue;
                return r.value;
            }
            return undefined;
        }

        return value;
    }
}
