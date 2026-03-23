/**
 * Demo: 直接属性绑定（不走 action）
 * - 支持 color / visible / name / graph.value
 * - 支持单变量转换与多变量合成
 * - 支持脚本独立定义与复用
 */

const scriptRegistry = {
    statusToColor({ value }) {
        if (value >= 85) return "#E43D30";
        if (value >= 70) return "#FABE11";
        return "#2F7CEE";
    },

    composeName({ values }) {
        const speed = Number(values.speed_ms || 0);
        const pressure = Number(values.pressure_kpa || 0);
        return `泵组A | ${speed.toFixed(1)}m/s | ${pressure.toFixed(0)}kPa`;
    },

    formatGraphValue({ values }) {
        const flow = Number(values.flow || 0);
        const speed = Number(values.speed_ms || 0);
        return `流量 ${flow.toFixed(1)}L/s  线速 ${(speed * 3.6).toFixed(1)}km/h`;
    },
};

const demoScene = {
    elements: [
        {
            id: "pump-a",
            name: "泵组A",
            color: "#2F7CEE",
            visible: true,
            graph: {
                value: "--",
            },
        },
    ],
};

const directBindings = [
    {
        id: "pump-a",
        to: "color",
        tag: "temp_c",
        script: "statusToColor",
    },
    {
        id: "pump-a",
        to: "visible",
        tag: "device_online",
        calc: "return !!value;",
    },
    {
        id: "pump-a",
        to: "name",
        tags: ["speed_ms", "pressure_kpa"],
        script: "composeName",
    },
    {
        id: "pump-a",
        to: "graph.value",
        tags: ["flow", "speed_ms"],
        script: "formatGraphValue",
    },
];

function compile(binding) {
    if (!binding.calc) return null;
    try {
        return new Function("value", "values", "tag", binding.calc);
    } catch (err) {
        console.error("[direct-binding-demo] calc 编译失败:", binding, err);
        return null;
    }
}

function setByPath(obj, path, value) {
    const keys = path.split(".");
    let ref = obj;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        if (ref[key] == null || typeof ref[key] !== "object") {
            ref[key] = {};
        }
        ref = ref[key];
    }
    ref[keys[keys.length - 1]] = value;
}

function createDirectBindingRuntime(scene, bindings, scripts) {
    const eleMap = new Map(scene.elements.map((ele) => [ele.id, ele]));
    const tagStore = new Map();

    const normalized = bindings.map((binding) => ({
        ...binding,
        tags: binding.tags || (binding.tag ? [binding.tag] : []),
        calcFn: compile(binding),
    }));

    const deps = new Map();
    normalized.forEach((binding) => {
        binding.tags.forEach((tag) => {
            if (!deps.has(tag)) deps.set(tag, []);
            deps.get(tag).push(binding);
        });
    });

    function compute(binding) {
        const values = {};
        binding.tags.forEach((tag) => {
            values[tag] = tagStore.get(tag);
        });
        const firstTag = binding.tags[0];
        const value = firstTag ? values[firstTag] : undefined;

        if (binding.script) {
            const scriptFn = scripts[binding.script];
            if (typeof scriptFn !== "function") {
                console.warn(`[direct-binding-demo] 脚本不存在: ${binding.script}`);
                return undefined;
            }
            return scriptFn({ value, values, tag: (k) => tagStore.get(k), binding });
        }

        if (binding.calcFn) {
            return binding.calcFn(value, values, (k) => tagStore.get(k));
        }

        if (binding.map && typeof binding.map === "object") {
            return binding.map[value];
        }

        return value;
    }

    function applyBinding(binding) {
        const ele = eleMap.get(binding.id);
        if (!ele) return;

        const out = compute(binding);
        if (out === undefined) return;
        setByPath(ele, binding.to, out);
    }

    function pushData(patch = {}) {
        const touched = new Set();
        Object.entries(patch).forEach(([tag, value]) => {
            tagStore.set(tag, value);
            const list = deps.get(tag) || [];
            list.forEach((binding) => touched.add(binding));
        });

        touched.forEach((binding) => applyBinding(binding));
    }

    return {
        pushData,
        getElement: (id) => eleMap.get(id),
        snapshot: () => JSON.parse(JSON.stringify(scene)),
    };
}

export function runDirectBindingDemo() {
    const runtime = createDirectBindingRuntime(
        JSON.parse(JSON.stringify(demoScene)),
        directBindings,
        scriptRegistry
    );

    console.log("[before]", runtime.getElement("pump-a"));

    runtime.pushData({
        temp_c: 88,
        device_online: true,
        speed_ms: 5.8,
        pressure_kpa: 132,
        flow: 18.6,
    });

    console.log("[after-1]", runtime.getElement("pump-a"));

    runtime.pushData({
        temp_c: 65,
        device_online: false,
        speed_ms: 3.2,
        pressure_kpa: 110,
        flow: 9.4,
    });

    console.log("[after-2]", runtime.getElement("pump-a"));
    return runtime.snapshot();
}

export { createDirectBindingRuntime, directBindings, demoScene, scriptRegistry };
