import * as THREE from 'three';

const vs = `
		varying vec3 vPosition;
		void main(){
			vPosition=position;
			gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;
const fs = `
		varying vec3 vPosition;
		uniform vec3 u_color;
		uniform float r_radius;
		uniform float u_ring;

		void main(){
			float pct = distance( vec2( vPosition.x, vPosition.y ), vec2(0.0));
			if( pct > r_radius || pct < (r_radius - u_ring )){
				gl_FragColor = vec4(1.0,0.0,0.0,0);
			}else{
				float dis = (pct - (r_radius - u_ring)) / (r_radius - u_ring);
				gl_FragColor = vec4(u_color, dis);
			}
		}
	`;

//maxRadius 圆半径
//initRadius 初始圆半径
//ring 圆环大小
//color 颜色 THREE.Vector3
//speed 速度

function scatterCircle(maxRadius, initRadius, ring, color, speed = 0.05) {
    const uniform = {
        u_color: { value: color },
        r_radius: { value: initRadius },
        u_ring: {
            value: ring,
        },
    };


    const geometry = new THREE.CircleGeometry(maxRadius, 120);

    var material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        side: THREE.DoubleSide,
        uniforms: uniform,
        transparent: true,
        depthWrite: false,
    });
    const circle = new THREE.Mesh(geometry, material);
    circle.rotateX(Math.PI / 2);

    circle.onBeforeRender = function () {
        uniform.r_radius.value += speed ;
        if (uniform.r_radius.value >= maxRadius) {
            uniform.r_radius.value = initRadius;
        }
        
    }

    return  circle;
}


function addWave(car) {
    let c = scatterCircle(5, 1, 1, new THREE.Color("yellow"), 0.05);
    c.position.setY(0.2); // 防止与路面重叠，撕面
    car.add(c);
    car._wave = c;
}

function removeWave(car) {
    car.remove(car._wave);
    car._wave.material.dispose();
    car._wave.geometry.dispose();
    car._wave = null;
}

export { addWave, removeWave };