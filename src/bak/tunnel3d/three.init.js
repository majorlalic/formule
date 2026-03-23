import * as THREE from 'three';
import { OrbitControls } from '../dep/three/examples/jsm/controls/OrbitControls.js';

let container, camera, controls, scene, renderer;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe4effa);
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.001);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMappingExposure = 20;  
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(50, 50, 40);

    // controls

    controls = new OrbitControls(camera, renderer.domElement);

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.minDistance = 1;
    controls.maxDistance = 10000;

    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0 ,0)

    // lights

    const dirLight1 = new THREE.DirectionalLight(0xffffff);
    dirLight1.position.set(4000, 4000, 4000);
    scene.add(dirLight1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    //

    window.addEventListener('resize', onWindowResize);


    // initHelper();

    animate();

    return { camera, controls, scene, renderer }

}

function  initHelper() {
    const axesHelper = new THREE.AxesHelper(500);
    scene.add(axesHelper);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    render();

}




function render() {

    renderer.render(scene, camera);

}


export { init }
