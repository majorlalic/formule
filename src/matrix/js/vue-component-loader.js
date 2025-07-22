const componentCache = new Map();
let idCounter = 0;

/**
 * 加载组件
 * @param {String} url 组件文件路径
 * @author wujiaiq
 */
export async function loadVueComponent(url) {
    if (componentCache.has(url)) {
        return componentCache.get(url);
    }

    const res = await fetch(url);
    const html = await res.text();

    // 分离html,js,less
    const templateMatch = /<template>([\s\S]*?)<\/template>/.exec(html);
    const scriptMatch = /<script>([\s\S]*?)<\/script>/.exec(html);
    const styleMatch = /<style.*?lang=["']less["'].*?>([\s\S]*?)<\/style>/.exec(html);

    const template = templateMatch?.[1]?.trim();
    let script = scriptMatch?.[1]?.trim();
    const style = styleMatch?.[1]?.trim();

    if (style) {
        const styleEl = document.createElement("style");
        styleEl.type = "text/less";
        styleEl.innerHTML = style;
        document.head.appendChild(styleEl);
        await less.refreshStyles();
    }

    const childComponentTags = [...template.matchAll(/<([a-zA-Z0-9-]+)[^>]*?\s+src=["'](.+?\.html)["'][^>]*?>/g)];

    const children = {};

    // 加载子组件
    for (const match of childComponentTags) {
        const tagName = match[1];
        const childUrl = new URL(match[2], url).toString();
        const childComponent = await loadVueComponent(childUrl);
        children[tagName] = childComponent;
    }

    script = script.replace(
        /import\s+(\{[^}]+\}|\w+)\s+from\s+['"](.+?)['"]/g,
        (match, imports, path) => `const ${imports} = await import('${path}')`
    );

    script = script.replace(/export\s+default/, "return");

    // 包覆async
    const asyncWrapper = `
        return (async () => {
        ${script}
        })()
    `;

    const component = await new Function(asyncWrapper)();
    component.template = template;

    if (!component.name) {
        component.name = "dynamic-component-" + ++idCounter;
    }

    if (!component.components) {
        component.components = {};
    }

    Object.assign(component.components, children);

    componentCache.set(url, component);

    return component;
}

/**
 * 通过组件文件路径在页面挂载
 * @param {String} url 组件文件路径
 * @param {Object} propsData 组件属性
 * @param {Object} listeners 事件监听
 */
export const mountComponent = async (url, propsData = {}, listeners = {}) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const comp = await loadVueComponent(url);
    const CompClass = Vue.extend(comp);

    const attr = {
        propsData,
    };
    if (window.app) {
        attr.parent = app;
    }

    const instance = new CompClass(attr);

    // 绑定外部事件监听器
    for (const [event, handler] of Object.entries(listeners)) {
        instance.$on(event, handler);
    }

    instance.$mount(container);

    return instance; // 可选：返回实例以供后续操作
};
