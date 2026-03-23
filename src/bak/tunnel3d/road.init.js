import * as THREE from "three";

import { create as movieScreenCreate } from "./road_lib_moviescreen.js";
import { createRoadRing } from "./road_lib_decorate_ring.js";
import { createAnimateTop, createTop } from "./road_lib_top.js";
import { createScale } from "./road_lib_scale.js";
import { createScaleText } from "./road_lib_scale_text.js";
import { createFlyline } from "./road_lib_flyline.js";


// 每一个道路板块的参数
const roadOffset = 1;
const roadWidth = 4; //单条道路宽度
const roadWidthNum = 4; // 道路一共num条道
const size = roadOffset * 2 + roadWidth * roadWidthNum; // 板块大小
const thickness = size / 1000;
const roadNum = 482; // 板块个数
const roadGap = 4;

function isLeft(dir) {
    return dir == "left";
}

/**
 * 
 * @param {"left" | "right"} dir 方向
 * @returns 
 */
function init(dir = "left") {

    const group = new THREE.Group();
    group.name = "road";

    // 构造单块地板
    const texture = new THREE.TextureLoader().load('./tunnel3d/road.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    const cube = new THREE.Mesh(new THREE.BoxGeometry(size, thickness, size), new THREE.MeshLambertMaterial({ map: texture }));
    cube.position.set(0, -thickness / 2, 0);

    // 构造单个圆环
    const ring = createRoadRing(size);

    // 构造单个标识牌
    const movieScreen = movieScreenCreate(size);

    // 偏移构造整体场景
    const offset = new THREE.Vector3();
    for (let i = 0; i < roadNum; i++) {
        offset.set(i * size, 0, 0);

        // 偏移地板
        let c = cube.clone();
        c.position.add(offset);
        group.add(c);


        if (i % 4 == 0) {
            // 偏移环
            c = ring.clone();
            c.position.add(offset);
            group.add(c);


        }

        if (i % 8 == 0) {
            // 偏移标识牌
            c = movieScreen.clone();
            c.position.add(offset);
            group.add(c);
        }

    }

    // 构造顶部
    const cylinder = createTop(size, roadNum);
    group.add(cylinder);


    // 构造路边飞线
    const l1 = createFlyline(size, roadNum);
    group.add(l1);
    const l2 = createFlyline(size, roadNum);
    group.add(l2);

    if (isLeft(dir)) {
        l1.position.z = - size / 2 + roadOffset - 0.2;
        l1.position.y = 0.1;
        l1.position.x = -size / 2;

        l2.position.z = size / 2 - roadOffset + 0.2;
        l2.position.y = 0.1;
        l2.position.x = -size / 2;
    }else {
        l1.rotateY(Math.PI);
        l1.position.z = - size / 2 + roadOffset - 0.2;
        l1.position.y = 0.1;
        l1.position.x = size* roadNum - size / 2;

        l2.rotateY(Math.PI);
        l2.position.z = size / 2 - roadOffset + 0.2;
        l2.position.y = 0.1;
        l2.position.x = size * roadNum - size / 2;
    }

    if (isLeft(dir)) {

        // 构造标尺线
        const width = 100;
        const height = 10;
        const ruler = createScale(width, height);
        ruler.position.set(width / 2 - size / 2, 0, height / 2 + size / 2);
        const scale = Math.ceil(size * roadNum / width);
        for (let i = 0; i < scale; i++) {
            let c = ruler.clone();
            offset.set(width * i, 0, 0);
            c.position.add(offset);
            group.add(c);
        }

        // 构造标尺上的文字
        createScaleText(size, roadNum, scaleTextGroup => {
            scaleTextGroup.position.z = size + height / 2 + 2;
            group.add(scaleTextGroup);
        }
        )
    }


    // 地板中心线
    const z2 = isLeft(dir) ? size / 2 : - size / 2;
    const y0 = thickness / 2;
    const x0 = 0;
    const xmax = size * roadNum;
    const centerLine = new THREE.Line3(new THREE.Vector3(x0, y0, z2), new THREE.Vector3(xmax, y0, z2));

    function project2CenterLine(position, target) {

        centerLine.closestPointToPoint(position, false, target);
    }

    /**
     * const MILS = [
        [3570, 5250],
        [16590, 19123],
    ];
    */
    function transMil2Pixel(roadNo, mil, targetPosition = new THREE.Vector3()) {
        let z = roadOffset + roadWidth / 2 + roadNo * roadWidth + roadGap / 2;

        if (!isLeft(dir)) {
            z = -z;
        }

        targetPosition.set(mil, 0, z);

        return targetPosition;
    }


    //向下平移，保持路面在y=0的平面上。
    group.position.x = size / 2;
    if (isLeft(dir)) {
        group.position.z = size / 2 + roadGap / 2;
    } else {
        group.position.z = - size / 2 - roadGap / 2;
    }

    return {
        road: group,
        project2CenterLine,
        transMil2Pixel
    };

}


function getTotalLength() {
    return size * roadNum;
}

export { init, getTotalLength };