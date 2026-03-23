import * as THREE from "three";

/**
 * 构造隧道顶部
 * @param {*} size 
 * @param {*} roadNum 
 * @returns 
 */
function createTop(size, roadNum) {
    const cygeo = new THREE.CylinderGeometry(size / 2, size / 2, size, 32, 1, true, Math.PI / 2, Math.PI);
    cygeo.rotateX(Math.PI / 2);
    cygeo.rotateY(Math.PI / 2);
    const cylinder = new THREE.Mesh(
        cygeo,
        new THREE.MeshBasicMaterial({ color: "#05a0fa", transparent: true, opacity: 0.2, side: THREE.BackSide })
    );

    cylinder.scale.setX(roadNum);
    cylinder.position.setX(roadNum * size / 2 - size / 2);
    return cylinder;
}

/**
 * 构造动态的隧道顶部（未完成）
 * @param {*} size 
 * @param {*} roadNum 
 * @returns 
 */
function createAnimateTop(size, roadNum) {
    const color = "#05a0fa";
    const alphaTest = true;

    let v_shader = `
                #pragma vscode_glsllint_stage: vert
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`

    let alpha = alphaTest ? '#define ALPHATEST' : ''
    let f_shader = `
                #pragma vscode_glsllint_stage: frag
                ${alpha}
                #define PI 3.141592
                uniform float time;
                varying vec2 vUv;
                uniform vec3 color;
                void main() {
                    float alpha;
                    if (vUv.x > PI * 0.5 ){
                        alpha = 0.0;
                    } else {
                        alpha = sin(vUv.x*500.0 + time );
                    }
                    gl_FragColor = vec4(color, alpha);
                    #ifdef ALPHATEST
                    if(gl_FragColor.a < 0.3){
                        discard;
                    }
                    #endif
                }`

    let geo = new THREE.CylinderGeometry(size / 2, size / 2, size, 32, 1, true, Math.PI / 2, Math.PI);

    const uniforms = {
        time: {
            value: 0.0
        },
        color: {
            value: new THREE.Color(color)
        }
    }
    let shaderMat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: v_shader,
        fragmentShader: f_shader,
        transparent: true,
        // blending: THREE.AdditiveBlending
    })

    const mesh = new THREE.Mesh(geo, shaderMat)
    mesh.onBeforeRender = () => {
        let time = uniforms.time.value + 0.1
        uniforms.time.value = time
    }

    mesh.scale.setX(roadNum);
    mesh.position.setX(roadNum * size / 2 - size / 2);
    
    return mesh;
}

export { createTop, createAnimateTop }