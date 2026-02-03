/**
 * 数据点订阅管理
 * @author wujiaqi
 */
export default class SubscriptionManager {
    constructor(dataPointStore) {
        this.dataPointStore = dataPointStore;
        this.unsubs = [];
    }

    clear() {
        this.unsubs.forEach((unsub) => unsub());
        this.unsubs = [];
    }

    setBindings(bindingMap, onTagUpdate) {
        // 根据 bindings 注册订阅，统一处理节流
        this.clear();
        for (const [tag, bindings] of bindingMap.entries()) {
            let throttleMs = 0;
            bindings.forEach((binding) => {
                if (binding.throttleMs && binding.throttleMs > 0) {
                    throttleMs =
                        throttleMs === 0
                            ? binding.throttleMs
                            : Math.min(throttleMs, binding.throttleMs);
                }
            });
            const unsub = this.dataPointStore.subscribe(
                tag,
                (value) => onTagUpdate(tag, value),
                { throttleMs }
            );
            this.unsubs.push(unsub);
        }
    }
}
