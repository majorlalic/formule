import { InteractionType, ActionType } from "./const.js";
import { setData, evalRule } from "./utils.js";

/**
 * 动作引擎：执行 actions 与自定义 trigger
 * @author wujiaqi
 */
export default class ActionEngine {
    constructor(actionDispatcher, dataPointStore) {
        this.actionDispatcher = actionDispatcher;
        this.dataPointStore = dataPointStore;
    }

    apply(eleMap, eleDatas) {
        eleDatas.forEach(({ id, data, payload }) => {
            let ele = eleMap.get(id);
            if (!ele) return;

            // 写回 data，供 actions 判断与图元行为使用
            setData(ele.data, data);

            // 自定义事件
            let customActions =
                ele?.conf?.trigger?.filter(
                    (i) => i?.type == InteractionType.Custom
                ) || [];
            customActions.forEach((action) => {
                this._dispatch(ele, action);
            });

            // 数据驱动 actions
            const actions = ele?.conf?.actions || [];
            actions.forEach((action) => {
                if (!action?.when || !action?.do) return;
                const ok = evalRule(action.when, {
                    data: ele.data,
                    payload: payload || {},
                    ele,
                    tag: (key) => this.dataPointStore.get(key),
                });
                if (!ok) return;
                this._applyAction(action, ele, payload || {});
            });
        });
    }

    _applyAction(rule, ele, payload) {
        const resolvedParams = this._resolveParams(
            rule.params || {},
            ele,
            payload || {}
        );
        const action = {
            actionType: ActionType.RunEleBehavior,
            actionOptions: {
                behaviorName: rule.do,
                behaviorParam: resolvedParams,
            },
        };
        this._dispatch(ele, action);
    }

    _dispatch(ele, action) {
        this.actionDispatcher.dispatch(ele, action, null);
    }

    _resolveParams(params, ele, payload) {
        const resolveValue = (value) => {
            if (typeof value !== "string") return value;
            let raw = value;
            if (raw.startsWith("@") || raw.startsWith("$")) {
                raw = raw.slice(1);
            }
            if (raw.startsWith("data.")) {
                return this._getValueByDotPath(ele.data, raw.slice(5));
            }
            if (raw.startsWith("payload.")) {
                return this._getValueByDotPath(payload, raw.slice(8));
            }
            if (raw.startsWith("tag.")) {
                return this.dataPointStore.get(raw.slice(4));
            }
            return value;
        };

        const walk = (input) => {
            if (Array.isArray(input)) {
                return input.map((item) => walk(item));
            }
            if (input && typeof input === "object") {
                const out = {};
                Object.keys(input).forEach((key) => {
                    out[key] = walk(input[key]);
                });
                return out;
            }
            return resolveValue(input);
        };

        return walk(params);
    }

    _getValueByDotPath(obj, path) {
        if (!path) return undefined;
        return path.split(".").reduce((acc, key) => acc?.[key], obj);
    }
}
