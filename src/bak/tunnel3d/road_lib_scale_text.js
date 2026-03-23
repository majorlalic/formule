import * as THREE from "three";
import { FontLoader } from '../dep/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../dep/three/examples/jsm/geometries/TextGeometry.js';

function createScaleText(size, roadNum, callback) {

    let bevelEnabled = true,

        font = undefined,

        fontHeight = 0.5,
        fontSize = 4,

        curveSegments = 4,

        bevelThickness = 0.1,
        bevelSize = 0.1;

    const group = new THREE.Group();
    group.name = "scaleText";

    const loader = new FontLoader();
    loader.load('./tunnel3d/fonts/droid_sans_mono_regular.typeface.json', function (response) {

        font = response;


        const divideBy = 100; //每xx米一个标记
        const scale = Math.ceil(roadNum * size / divideBy);

        const materials = [
            new THREE.MeshPhongMaterial({ color: "skyblue", flatShading: true }), // front
            new THREE.MeshPhongMaterial({ color: "skyblue" }) // side
        ];


        let i = 0;

        while (i <= scale) {

            let text = i * divideBy / 1000 + "km";

            let textGeo = new TextGeometry(text, {

                font: font,

                size: fontSize,
                height: fontHeight,
                curveSegments: curveSegments,

                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: bevelEnabled

            });

            const textMesh1 = new THREE.Mesh(textGeo, materials);

            textMesh1.rotateX(-Math.PI / 2);

            // textMesh1.scale.multiplyScalar(0.5);


            textMesh1.position.x = i * divideBy - 10;
            textMesh1.position.y = 0;
            // textMesh1.position.z = size + height / 2 + 2;

            group.add(textMesh1);

            i++;
        }

        callback(group);

    });
}

export { createScaleText }