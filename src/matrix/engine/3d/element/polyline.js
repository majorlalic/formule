import * as THREE from "three";
import Element3d from "./element3d.js";
import { getCenterPoint } from "../utils/tools.js";

/**
 * 折线
 * {
 *      type: ElementType.Polyline,
 *      positions: [
 *          {
 *              x: 5,
 *              y: 0,
 *              z: 0,
 *          },
 *          {
 *              x: 5,
 *              y: 0,
 *              z: 5,
 *          },
 *      ],
 * }
 */
export default class Polyline extends Element3d {
    constructor(ele) {
        super(ele);
    }

    /**
     * 初始化
     */
    init(ele) {
        super.init();

        let center = getCenterPoint(ele.graph.positions);
        this.initName(center);

        this.polygon = this._getMesh(ele.graph.positions);
        this.group.add(this.polygon);
    }

    changeColor(color) {
        if (this.polygon) {
            this.polygon.material.color.set(color);
        }
    }

    _getMesh(positions) {
        // 定义点位数组
        const points = [];
        positions.forEach(({ x, y, z }) => {
            points.push(new THREE.Vector3(x, y, z));
        });

        // 创建曲线
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 2, 0.1, 8, false);

        let material = new THREE.MeshBasicMaterial({
            color: this.color,
            side: THREE.DoubleSide,
        });

        // 创建曲线网格
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = "body";
        return mesh;
    }
}
