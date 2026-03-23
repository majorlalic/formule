import * as THREE from 'three';

function addCphMarker(car) {

    let ca = document.createElement("canvas");
    let width = 200;
    let height = 50;
    let radio = height / width;

    ca.width = width;
    ca.height = height;
    let con = ca.getContext("2d");
    con.fillStyle = "#0198ff";
    con.fillRect(0, 0, width, height);

    con.font = "32px serif";
    con.textAlign = "center";
    con.fillStyle = "white";
    con.textBaseline = "middle"
    con.fillText(car.name, width / 2, height / 2);

    let cph = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(ca), transparent: true, side: THREE.FrontSide, color: "white", depthTest: false }));

    cph.scale.set(5, radio * 5, 1);
    cph.position.setY(6);

    car.add(cph);
    car._cph = cph;

}

function removeCphMarker(car) {
    car.remove(car._cph);
    car._cph.geometry.dispose();
    car._cph.material.dispose();
    car._cph = null;
}


export { addCphMarker, removeCphMarker }