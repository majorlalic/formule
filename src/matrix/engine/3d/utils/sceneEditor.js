import * as THREE from "three";
import { TransformControls } from "/dep/js/three/examples/jsm/controls/TransformControls.js";
import { TubePathEditor } from "./tubePathEditor.js";

export class SceneEditor {
    constructor(scene, camera, renderer, orbitControls) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.orbitControls = orbitControls;

        this.transformCtrl = new TransformControls(camera, renderer.domElement);
        scene.add(this.transformCtrl);

        this.transformCtrl.addEventListener("dragging-changed", (e) => {
            this.orbitControls.enabled = !e.value;
        });

        this.tubePathEditor = new TubePathEditor(scene, camera, renderer, orbitControls);

        this.currentElement = null;
    }

    enterEdit(element) {
        if (this.currentElement) {
            this.currentElement.disableEdit(this);
        }

        this.currentElement = element;
        element.enableEdit(this);
    }

    exitEdit() {
        if (this.currentElement) {
            this.currentElement.disableEdit(this);
            this.currentElement = null;
        }
    }
}
