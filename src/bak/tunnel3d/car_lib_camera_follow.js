import * as THREE from 'three';
import { TUNNEL_CHANNEL_NAME, CAR_EVENT_CAMERA_FOLLOW, CAR_EVENT_CAMERA_FOLLOW_END } from './tunnel3d_const.js';

let camera, controls, target;


const tunnelChannel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

function followCar(car, _camera, _controls) {
    camera = _camera;
    controls = _controls;

    target = car;

    tunnelChannel.postMessage({ type: CAR_EVENT_CAMERA_FOLLOW });
};

function cancelFollow() {
    target = null;
    dir = null;
    tunnelChannel.postMessage({ type: CAR_EVENT_CAMERA_FOLLOW_END });
}


let dir;
function animate() {

    if (target) {

        if (!dir) {
            dir = new THREE.Vector3(1, 1, 0).normalize().multiplyScalar(20);
        }else {
            dir.copy(camera.position).sub(controls.target);
        }

        camera.position.copy(target.position).add(dir);
        controls.target.copy(target.position);
    }

    requestAnimationFrame(animate);
}
animate(); 

export { followCar, cancelFollow }