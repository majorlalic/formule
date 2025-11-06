import * as THREE from "three";
import { TransformControls } from "/dep/js/three/examples/jsm/controls/TransformControls.js";

export class TubePathEditor {
    constructor(scene, camera, renderer, orbitControls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.orbitControls = orbitControls;

        this.pathPoints = [];
        this.pointObjects = [];
        this.controls = [];
        this.tubeMesh = null;
        this.onUpdate = null;
    }

    enable(tubeMesh, pathPoints, onUpdate) {
        this.disable(); // 清除旧的

        this.tubeMesh = tubeMesh;
        this.pathPoints = pathPoints;
        this.onUpdate = onUpdate;

        for (let i = 0; i < pathPoints.length; i++) {
            const point = pathPoints[i];
            const pointObj = new THREE.Object3D();
            pointObj.position.copy(point);
            this.scene.add(pointObj);
            this.pointObjects.push(pointObj);

            const ctrl = new TransformControls(this.camera, this.renderer.domElement);
            ctrl.attach(pointObj);
            ctrl.setMode("translate");
            this.scene.add(ctrl);
            this.controls.push(ctrl);

            // 拖动回调
            ctrl.addEventListener("objectChange", () => {
                this.pathPoints[i].copy(pointObj.position);
                this.updateTube();
            });

            // 拖动时禁用 OrbitControls
            ctrl.addEventListener("dragging-changed", (e) => {
                this.orbitControls.enabled = !e.value;
            });
        }
    }

    updateTube() {
        const newCurve = new THREE.CatmullRomCurve3(this.pathPoints);
        const newGeometry = new THREE.TubeGeometry(newCurve, 2, 0.1, 8, false);

        this.tubeMesh.geometry.dispose();
        this.tubeMesh.geometry = newGeometry;

        if (typeof this.onUpdate === "function") {
            this.onUpdate(newGeometry);
        }
    }

    disable() {
        this.controls.forEach((ctrl) => {
            this.scene.remove(ctrl);
            ctrl.dispose?.();
        });
        this.controls = [];

        this.pointObjects.forEach((obj) => {
            this.scene.remove(obj);
        });
        this.pointObjects = [];

        this.tubeMesh = null;
        this.pathPoints = [];
        this.onUpdate = null;
    }
}
