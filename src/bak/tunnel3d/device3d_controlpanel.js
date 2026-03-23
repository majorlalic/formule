import * as THREE from "three";

function createSwitchMarker(text, backgroundColor) {
    // 首先，创建一个canvas元素，设置其宽高和位置
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // 然后，创建一个2D上下文，用于绘制canvas
    const ctx = canvas.getContext('2d');

    // 接着，绘制圆形图标
    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, Math.PI * 2);
    ctx.fillStyle = backgroundColor || 'green';
    ctx.fill();

    // 绘制白字
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(text, 30, 70);

    const spriteMaterial = new THREE.SpriteMaterial({
        depthTest: true,
        map: new THREE.CanvasTexture(canvas)
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(width, height, 1).divideScalar(width).multiplyScalar(4);

    const dir = new THREE.Vector3(1, 0, 0);
    sprite.onBeforeRender = function (renderer, scene, camera) {
        dir.set(1, 0, 0);
        vector.applyQuaternion(camera.quaternion);
        
    }
    return sprite;

}



