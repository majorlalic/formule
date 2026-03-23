import * as THREE from "three";

/**
 * 基于mp4的动态标识牌
 * @param {*} size 
 * @returns 
 */
function create(size) {
    const videoW = 466;
    const videoH = 64;
    const videoRatio = videoH / videoW;
    const video = document.createElement('video');
    video.src = "./tunnel3d/electron_notice.mp4";
    video.width = videoW;
    video.height = videoH;
    video.muted = true;
    video.play();
    video.loop = true;
    const videoTexture = new THREE.VideoTexture(video);
    let geo = new THREE.BoxGeometry(1, videoRatio, 0.0001);
    const movieScreen = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: videoTexture }));
    movieScreen.position.set(0, size / 2 - 2, 0);
    movieScreen.scale.multiplyScalar(size / 2);
    movieScreen.rotateY(Math.PI / 2);
    movieScreen.position.setX(-size / 2);

    return movieScreen;
}

export {create}
