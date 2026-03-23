import * as THREE from "three";
/**
 * 
 * @param {*} width canvas长
 * @param {*} height canvas宽
 * @param {*} lineWidth 标尺线宽
 * @param {*} k  canvas的放大系数，防止因视角大小导致canvas贴图失真
 * @returns 
 */
function createScale(width = 100, height = 10, lineWidth = 8, k = 8) {

    let ca = document.createElement("canvas");

    ca.width = width * k;
    ca.height = height * 8;
    let con = ca.getContext("2d");

    con.fillStyle = "skyblue";

    let i = 0;
    while (i <= width * k) {

        if (i % (10 * k) == 0) {
            // 长标识
            con.fillRect(i - lineWidth / 2, 0, lineWidth, height * k);

        } else if (i % (5 * k) == 0) {

            // 短标识
            con.fillRect(i - lineWidth / 2, 0, lineWidth, height * k / 2);
        }

        i += k;
    }

    let ruler = new THREE.Mesh(new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ca), transparent: true, side: THREE.FrontSide, color: "white" }));
    ruler.rotateX(-Math.PI / 2);
    ruler.position.set(width / 2, 0, height / 2);
    return ruler;
}

export { createScale }
