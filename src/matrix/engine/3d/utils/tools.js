import * as THREE from "three";
import { TWEEN } from "three/addons/libs/tween.module.min.js";

export const getCanvasTextWidth = (text) => {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = "30px serif";
    return context.measureText(text).width + 20;
};

export const getCenterPoint = (points) => {
    const numPoints = points.length;
    if (numPoints === 0) {
        return new THREE.Vector3(0, 0, 0);
    }
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    // 累加所有点位的坐标
    for (let i = 0; i < numPoints; i++) {
        sumX += points[i].x;
        sumY += points[i].y;
        sumZ += points[i].z;
    }
    // 计算中心点位的坐标
    const centerX = sumX / numPoints;
    const centerY = sumY / numPoints;
    const centerZ = sumZ / numPoints;

    return new THREE.Vector3(centerX, centerY, centerZ);
};

/**
 * 本地坐标转世界坐标
 * @param target 被修改坐标的目标
 * @param {{x,y,z}} position 坐标
 */
export const getWorldPositon = (target, { x, y, z }) => {
    const localPos = new THREE.Vector3(x, y, z); // 你的局部坐标
    return target.localToWorld(localPos.clone());
};

export const moveToWorldPosition = (object3D, targetPosition, duration) => {
    if (!object3D || !targetPosition) return;

    // 兼容 {x, y, z} 对象或 Vector3 实例
    const target = targetPosition.isVector3
        ? targetPosition.clone()
        : new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);

    // 转换为 object3D.parent 的本地坐标
    const localTarget = object3D.parent ? object3D.parent.worldToLocal(target) : target;

    // Tween 动画
    new TWEEN.Tween(object3D.position)
        .to({ x: localTarget.x, y: localTarget.y, z: localTarget.z }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
};
