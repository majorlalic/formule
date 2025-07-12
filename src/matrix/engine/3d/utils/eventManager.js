import * as THREE from "three";

// 节流
function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
        const now = Date.now();
        if (now - last > delay) {
            last = now;
            fn.apply(this, args);
        }
    };
}

/**
 * 事件管理器 当前项目使用方式2
 * @example
 * // 方式1: 在添加到时间管理器时绑定事件, 方便统一管理
 * eventManager.add(group, {
 *   onClick: (e) => console.log("Clicked:", e.object.name),
 *   onHover: (e) => console.log("Hover:", e.object.name),
 *   onHoverOut: () => console.log("Hover out"),
 * });
 *
 * // 方式2: 在对象的userData中定义事件, 对象即行为
 * group.userData.onClick = (e) => {console.log("click", this.name);};
 * eventManager.add(group);
 */
export default class EventManager {
    constructor(camera, domId) {
        this.camera = camera;
        this.domElement = document.getElementById(domId);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.lastHoverTarget = null;
        this.registeredObjects = new Set();
        this.eventMap = new Map();

        this._onClick = this._handleClick.bind(this);
        this._onMouseMove = throttle(this._handleMouseMove.bind(this), 200);

        this.domElement.addEventListener("click", this._onClick);
        this.domElement.addEventListener("mousemove", this._onMouseMove);
    }

    add(object3D, handlers = {}) {
        this.registeredObjects.add(object3D);
        this.eventMap.set(object3D, handlers);
    }

    remove(object3D) {
        this.registeredObjects.delete(object3D);
        this.eventMap.delete(object3D);
    }

    dispose() {
        this.domElement.removeEventListener("click", this._onClick);
        this.domElement.removeEventListener("mousemove", this._onMouseMove);
        this.registeredObjects.clear();
    }

    _getIntersects(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const allObjects = Array.from(this.registeredObjects);
        return this.raycaster.intersectObjects(allObjects, true);
    }

    _findEventTarget(object) {
        while (object) {
            // 注册式优先：从 eventMap 中查找
            if (this.eventMap?.has?.(object)) {
                return {
                    object,
                    ...this.eventMap.get(object),
                };
            }

            // 兼容属性式：从 userData 中查找
            const ud = object.userData || {};
            if (ud.onClick || ud.onHover || ud.onHoverOut) {
                return {
                    object,
                    onClick: ud.onClick,
                    onHover: ud.onHover,
                    onHoverOut: ud.onHoverOut,
                };
            }

            object = object.parent;
        }

        return null;
    }

    _handleClick(event) {
        const intersects = this._getIntersects(event);
        if (intersects.length === 0) return;

        const hit = intersects[0].object;
        const listener = this._findEventTarget(hit);
        if (listener?.onClick) {
            listener.onClick(intersects[0], event);
        }
    }

    _handleMouseMove(event) {
        const intersects = this._getIntersects(event);
        const currentHit = intersects.length > 0 ? intersects[0].object : null;
        const currentTarget = currentHit ? this._findEventTarget(currentHit) : null;

        // 比较实际绑定事件的object是否变化，而不是 raycaster 命中的 object, 避免hover和hoverout来回触发
        const currentEventOwner = currentTarget?.object || null;
        const lastEventOwner = this.lastHoverTarget?.object || null;

        if (lastEventOwner && lastEventOwner !== currentEventOwner) {
            this.lastHoverTarget?.onHoverOut?.();
        }

        if (currentEventOwner && lastEventOwner !== currentEventOwner) {
            currentTarget?.onHover?.(intersects[0], event);
        }

        this.lastHoverTarget = currentTarget;
    }
}
