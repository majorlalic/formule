import * as THREE from "three";

/**
 * 道路装饰环
 */

function createRoadRing(size) {
    
    let ring = new THREE.Group();
    let seg = 16;
    let width = 0.1;
    const material = new THREE.MeshBasicMaterial({ color: "#05a0fa", side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const geometry = new THREE.RingGeometry(size / 2, size / 2 + 0.1, seg, 1, 0, Math.PI);
    const mesh1 = new THREE.Mesh(geometry, material);
    mesh1.translateZ(- width / 2);
    ring.add(mesh1);

    const mesh2 = new THREE.Mesh(geometry, material);
    mesh2.translateZ(width / 2);
    ring.add(mesh2);

    const topring = new THREE.CylinderGeometry(size / 2 + 0.1, size / 2 + 0.1, width, seg, 1, true, Math.PI / 2, Math.PI);
    topring.rotateX(Math.PI / 2);
    const mesh3 = new THREE.Mesh(
        topring,
        material)
    ring.add(mesh3);
    ring.position.setX(-size / 2);
    ring.rotateY(Math.PI / 2);

    return ring;
}

export {createRoadRing}
