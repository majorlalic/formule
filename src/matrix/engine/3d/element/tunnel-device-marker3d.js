import * as THREE from "three";
import Element3d from "./element3d.js";
import { getDeviceCanvas } from "../utils/canvas.js";

const DEFAULT_GRAPH = {
    position: { x: 0, y: 1.8, z: 0 },
    icon: "camera",
    poleHeight: 1.4,
    size: 0.12,
    markerColor: null,
};

export default class TunnelDeviceMarker3d extends Element3d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    async init(ele) {
        super.init();
        const graph = { ...DEFAULT_GRAPH, ...(ele.graph || {}) };
        this.graph = graph;

        this.initName({
            x: 0,
            y: 0.32,
            z: 0,
        });

        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, graph.poleHeight, 8),
            new THREE.MeshPhongMaterial({
                color: "#5bcdf6",
                emissive: "#123247",
            })
        );
        pole.position.y = graph.poleHeight / 2 - 0.05;
        this.group.add(pole);

        this.pointSprite = await this._createSprite(graph.icon);
        this.pointSprite.position.y = graph.poleHeight + 0.1;
        this.group.add(this.pointSprite);

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.18, 0.08, 16),
            new THREE.MeshPhongMaterial({
                color: "#0f2038",
                emissive: "#0a1e2d",
            })
        );
        this.group.add(base);

        this.group.position.copy(graph.position);
    }

    async changeColor(color) {
        this.color = color;
        if (!this.pointSprite) return;
        const canvas = await getDeviceCanvas(this.graph.icon, color, true);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.pointSprite.material.map = texture;
        this.pointSprite.material.needsUpdate = true;
        if (this.nameSprite) {
            this._updateName(this.nameSprite, this.name, color);
        }
    }

    async _createSprite(icon) {
        const canvas = await getDeviceCanvas(
            icon,
            this.graph.markerColor || this.color || "#2F7CEE",
            true
        );
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: false,
                depthTest: false,
                transparent: true,
            })
        );
        sprite.name = "body";
        sprite.scale.setScalar(this.graph.size);
        return sprite;
    }
}

