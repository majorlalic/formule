import * as THREE from "three";

export default class MiniMap {
    camera; scene; renderer; targetPosition; cameraDir; container

    /**
     * 
     * @param {*} scene 
     * @param {*} container 
     * @param {*} targetPosition 
     * @param {*} cameraDir 
     */
    constructor(scene, container, targetPosition, cameraDir) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.container = container;
        container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
        this.camera.position.set(50, 50, 40);

        this.scene = scene;

        this.targetPosition = targetPosition;

        this.cameraDir = cameraDir;

        this.render();
    }

    setTargetPosition(targetPosition) {
        this.targetPosition = targetPosition;
    }

    render() {

        this.camera.position.copy(this.targetPosition);
        this.camera.position.add(this.cameraDir);
        this.camera.lookAt(this.targetPosition);

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.render());
    }

}