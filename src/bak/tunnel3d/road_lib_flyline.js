import * as THREE from "three";

class FlyLine extends THREE.Group {
    /**
     * curveOrObject 路径 THREE.Curve实例或者bufferGeo/geo实例
     * 
     * color 颜色
     * segFlag 设置分段标记 （周期）
     * alphaTest 启用透明测试
     * radius 半径只有首参数为curve可用
    */
    /**
     * 
     * @param {*} curveOrObject 
     * @param {*} options 
     */
    constructor(curveOrObject, options) {
        super()

        let color = options && options.color || 0xffffff
        let alphaTest = options && options.alphaTest || true
        let radius = options && options.radius || 1

        this.mesh = null
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

        let geo

        if (curveOrObject instanceof THREE.Curve) {
            geo = new THREE.TubeGeometry(curveOrObject, 1000, 0.15 * radius, 4)
        } else if (curveOrObject instanceof THREE.BufferGeometry) {
            geo = curveOrObject
        } else {
            throw new Error('please ensure first argument correct')
        }

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
            blending: THREE.AdditiveBlending
        })
        this.mesh = new THREE.Mesh(geo, shaderMat)
        this.mesh.onBeforeRender = () => {
            let time = uniforms.time.value + 0.1
            uniforms.time.value = time
        }
        this.add(this.mesh)
    }

    dispose() {
        this.remove(this.mesh)
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
    }

}


function createFlyline(size, roadNum) {

    const l = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(size * roadNum, 0, 0));

    const c = new THREE.CurvePath();
    c.add(l);

    let lines = new FlyLine(c, { color: "hsl(51, 98%, 61%)", alphaTest: false });

    return lines;
}
export { createFlyline }