import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TWEEN } from "three/addons/libs/tween.module.min.js";
import { TransformControls } from "/dep/js/three/examples/jsm/controls/TransformControls.js";


let container, camera, controls, scene, renderer, transform;

let stats;

const init = (containerId) => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#090711");

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById(containerId);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(10, 10, 10);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => {
        // console.log("cameraConf", {
        //     position: camera.position,
        //     target: controls.target,
        // });
    });

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 10000;

    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);

    window.addEventListener("resize", onWindowResize);

    initHelper();

    initLight();

    initTransformControls();

    animate();

    stats = new Stats();
    stats.showPanel(0); // 0: fps
    document.body.appendChild(stats.dom);

    return { camera, controls, scene, renderer, transform };
};

const initHelper = () => {
    const axesHelper = new THREE.AxesHelper(8);
    scene.add(axesHelper);
};

/**
 * 初始化光源
 */
const initLight = () => {
    // 8. 添加光源 (颜色，强度)
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(200, 200, 200);
    scene.add(light);

    // 8. 添加光源 (颜色，强度)
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-200, 200, -200);
    scene.add(light2);

    // 环境光
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
};

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
};

const initTransformControls = () => {
    transform = new TransformControls(
        camera,
        renderer.domElement
    );
    scene.add(transform);
    transform.addEventListener("dragging-changed", (event) => {
        controls.enabled = !event.value;
    });
};

const animate = () => {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();

    render();
};

const render = () => {
    if (stats) {
        stats.begin();
    }
    renderer.render(scene, camera);
    if (stats) {
        stats.end();
    }
};

export { init };
