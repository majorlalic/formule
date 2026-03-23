import * as THREE from "three";
import {TUNNEL_CHANNEL_NAME, CAR_EVENT_ROTATION_CHANGE, CAR_EVENT_POSITION_CHANGE}  from  "./tunnel3d_const.js";
import { TWEEN } from "three/addons/libs/tween.module.min.js";

const channel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

const car_move_tween_group = new TWEEN.Group()
/**
 * @returns 
 */
function moveTo(car, target, delta) {

    if (target.distanceTo(car.position) < 1) {
        return ;
    }

    if (car._moveTween) {
        car._moveTween.stop();
        car_move_tween_group.remove(car._moveTween);
    }


    car._dir = (car._dir || new THREE.Vector3()).subVectors(target, car.position);
    var vector = car._dir;

	// 计算绕 Y 轴的旋转角度
	var yaw = Math.atan2(vector.x, vector.z);
	// 计算绕 X 轴的旋转角度
	var pitch = Math.atan2(vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z));
	// 创建 Euler 对象
    car._euler = (car._eular || new THREE.Euler(0, 0, 0, 'YXZ')).set(pitch, yaw, 0, "YXZ");

    car.setRotationFromEuler(car._euler);
    
    channel.postMessage({ type: CAR_EVENT_ROTATION_CHANGE, data: car.name });

    const tween = new TWEEN.Tween(car.position, car_move_tween_group)
        .to(target, delta)
        .onUpdate((coords) => {
            channel.postMessage({ type: CAR_EVENT_POSITION_CHANGE, data: car.name });
        });

    car._moveTween = tween;

    tween.start() // Start the tween immediately.
}

function update() {
    car_move_tween_group.update();

    requestAnimationFrame(update);
}


update();

export { moveTo, update };