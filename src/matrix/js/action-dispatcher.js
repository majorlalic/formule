import { ActionTypes, PopComponents, EventNames } from "./const.js";
import { checkProps, fillTemplate } from "./utils.js";
import { mountComponent } from "/matrix/js/vue-component-loader.js";
import { ElementDef } from "./def/element/elementDef.js";
import { Action } from "./def/typeDef.js";
import visualApi from "../api/visualApi.js";
import Resolver from "./resolver.js";
import ScriptExecutor from "./script-executor.js";

const scriptExecutor = new ScriptExecutor();
/**
 * 动作调度器
 * @author wujiaqi
 */
export class ActionDispatcher {
    /**
     * 初始化构造
     * @param {Resolver} resolver 解释器
     */
    constructor(resolver, eventBus) {
        this.eventBus = eventBus;
        this.resolver = resolver;

        // 如需新增动作处理逻辑, 请在此添加
        this.handlers = {
            [ActionTypes.OpenUrl.name]: (ele, action) => this.openUrl(ele, action?.actionOptions?.url),
            [ActionTypes.ChangeColor.name]: (ele, action) => this.changeColor(ele, action?.actionOptions?.color),
            [ActionTypes.PopComponent.name]: (ele, action, position) =>
                this.popComponent(ele, action?.actionOptions?.name, action?.actionOptions?.props, position),
            [ActionTypes.ChangeScene.name]: (ele, action) => this.changeScene(action?.actionOptions?.sceneId),
            [ActionTypes.ExecuteScript.name]: (ele, action) => this.executeScript(ele, action?.actionOptions?.url),
            [ActionTypes.ChangeAnchor.name]: (ele, action) => this.changeAnchor(action?.actionOptions?.anchorId),
            [ActionTypes.ChangePosition.name]: (ele, action) =>
                this.changePosition(ele, action?.actionOptions?.position, action?.actionOptions?.duration),
            [ActionTypes.ChangeVisible.name]: (ele, action) => this.changeVisible(ele, action?.actionOptions?.visible),
            [ActionTypes.RunEleBehavior.name]: (ele, action) =>
                this.runEleBehavior(ele, action?.actionOptions?.behaviorName, action?.actionOptions?.behaviorParam),
        };
    }

    /**
     * 处理动作
     * @param {ElementDef} ele 图元
     * @param {Action} action 动作 未传入动作时, 根据类型查找
     * @param {{clientX, clientY}} position 点击位置
     */
    dispatch(ele, action, position) {
        if (!!!action) {
            return;
        }
        let actionType = ActionTypes[action.actionType];
        if (!actionType) {
            console.warn(`尚未配置${action.actionType}, 请在ActionTypes在配置该动作`);
        }

        // 1. 校验动作参数
        if (!checkProps(action.actionOptions, actionType.scheme)) {
            console.warn(
                `动作${action.actionType}必须传递${actionType.scheme.join(",")}属性, 请在actionOptions传递指定参数`
            );
            return;
        }

        // 2. 执行动作
        const handler = this.handlers[action.actionType];
        if (handler) {
            handler(ele, action, position);
        } else {
            console.warn(`Unknown action type: ${action.actionType}`);
        }
    }

    /**
     * 打开组件弹窗
     * @param {ElementDef} ele 图元
     * @param {String} compName 组件名称
     * @param {Object} props 组件属性
     */
    popComponent(ele, compName = "", props = {}, position) {
        // TODO 同一个图元能多次触发同一个组件
        // 未指定组件
        if (!compName) {
            console.warn(`id:${ele.id}, actionType: popComponent, actionOptions缺少'name'组件名`);
            return;
        }

        // 组件未定义
        if (!PopComponents[compName]) {
            console.warn(`组件${compName}未定义, 请在const.js的PopComponents中定义组件`);
            return;
        }

        let component = PopComponents[compName];

        // 校验组件所需属性
        if (!checkProps(props, component.props)) {
            console.warn(
                `组件${component.name}必须传递${component.props.join(",")}属性, 请在actionOptions.props传递指定参数`
            );
            return;
        }

        // 交互时所处的屏幕位置
        let clientX = position ? position.clientX : 0;
        let clientY = position ? position.clientY : 0;

        let componentProps = {
            id: ele.id,
            name: ele.name,
            centerX: clientX,
            centerY: clientY,
        };

        // 动态注入参数
        component.props.forEach((propKey) => {
            let propValue = ele.data[propKey] || "";
            // 填充占位符
            if (typeof propValue === "string" && /\$\{[^}]+\}/.test(propValue)) {
                propValue = fillTemplate(propValue, ele);
            }
            componentProps[propKey] = propValue;
        });

        // TODO component.props 动态添加参数
        mountComponent(component.url, componentProps);
    }

    /**
     * 打开新窗口
     * @param {ElementDef} ele 图元
     * @param {String} url 页面地址
     */
    openUrl(ele, url = "") {
        // 填充占位符参数
        url = fillTemplate(url, ele);
        window.open(url);
    }

    /**
     * 执行脚本
     * @param {ElementDef} ele 图元
     * @param {String} scriptName 脚本名称 在const.js中定义
     */
    executeScript(ele, url = "") {
        if (!url) {
            return;
        }
        scriptExecutor.executeScript(
            url,
            {
                ele,
                dispatcher: this,
            },
            {
                // beforeLoad: () => console.log("准备加载脚本"),
                // afterInjectData: (key, data) => console.log("注入图元数据与动作分发器的引用:", key, data),
                // onSuccess: () => console.log("加载成功"),
                onSuccess: () => console.log("执行成功"),
                onError: (err) => console.error("加载失败", err),
            }
        );
    }

    /**
     * 切换场景
     * @param {String} sceneId 场景id
     */
    changeScene(sceneId = "") {
        if (!this.resolver) {
            this.$message.error("缺少resolver对象");
            return;
        }
        visualApi.getSceneById(sceneId).then((scene) => {
            this.resolver.initScene(scene);
        });
    }

    /**
     * 切换锚点
     * @param {String} anchorId 锚点id
     */
    changeAnchor(anchorId = "") {
        let anchors = this.resolver.scene?.anchors;
        if (!anchors || anchors.length == 0) {
            console.error(`场景未配置锚点, 请前往anchors中配置`);
            return;
        }
        let anchor = anchors.find((i) => i.id == anchorId);
        if (anchor) {
            this.eventBus.postMessage(EventNames.ChangeAnchor, anchor);
        }
    }

    /**
     * 切换图元位置
     * @param {ElementDef} ele 图元
     * @param {Object} position 位置
     * @param {Number} duration 时间
     */
    changePosition(ele, position, duration = 0) {
        this.eventBus.postMessage(EventNames.ChangePosition, ele.id, position, duration);
    }

    /**
     * 修改图元是否可见
     * @param {ElementDef} ele 图元
     * @param {Boolean} visible 是否可见
     */
    changeVisible(ele, visible) {
        this.eventBus.postMessage(EventNames.ChangeVisible, ele.id, visible);
    }

    /**
     * 修改图元状态
     * @param {ElementDef} ele
     * @param {String} color 颜色
     */
    changeColor(ele, color = "") {
        this.eventBus.postMessage(EventNames.ChangeEleColor, ele.id, color);
    }

    /**
     * 执行图元行为
     * @param {ElementDef} ele 图元
     * @param {String} behaviorName 行为名称
     * @param {Object} behaviorParam 行为参数
     */
    runEleBehavior(ele, behaviorName, behaviorParam) {
        this.eventBus.postMessage(EventNames.RunEleBehavior, ele.id, behaviorName, behaviorParam);
    }
}
