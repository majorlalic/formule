import * as THREE from "three";
import Element3d from "./element3d.js";
import { getDeviceIconCanvas } from "../utils/canvas.js";
import { resolveAssetUrl } from "./tunnel/utils.js";

const DEFAULT_GRAPH = {
    position: { x: 0, y: 0.13, z: 0 },
    icon: "camera",
    poleHeight: 4.3,
    size: 1.36,
    markerColor: null,
    iconSize: 1.32,
};

const textureLoader = new THREE.TextureLoader();
let buttonTexture;

function getButtonTexture() {
    if (!buttonTexture) {
        buttonTexture = textureLoader.load(resolveAssetUrl("/tunnel3d/btn.png"));
        buttonTexture.colorSpace = THREE.SRGBColorSpace;
    }
    return buttonTexture;
}

export default class TunnelDeviceMarker3d extends Element3d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    async init(ele) {
        super.init();
        const graph = { ...DEFAULT_GRAPH, ...(ele.graph || {}) };
        this.graph = graph;
        this.group.position.copy(graph.position);

        const line = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.014, graph.poleHeight, 8),
            new THREE.MeshBasicMaterial({
                color: graph.markerColor || this.color || "#58d7ff",
                transparent: true,
                opacity: 0.95,
            })
        );
        line.name = "device-line";
        line.position.y = graph.poleHeight / 2;
        line.renderOrder = 20;
        this.group.add(line);

        this.panel = this._createPanel();
        this.panel.position.y = graph.poleHeight + 0.36;
        this.panel.renderOrder = 21;
        this.group.add(this.panel);

        this.pointSprite = await this._createSprite(graph.icon);
        this.pointSprite.position.set(0, graph.poleHeight + 0.36, 0.01);
        this.pointSprite.renderOrder = 22;
        this.group.add(this.pointSprite);
    }

    async changeColor(color) {
        this.color = color;
        this.group.traverse((child) => {
            if (child.material?.color && child.name === "device-line") {
                child.material.color = new THREE.Color(color);
            }
            if (child.material?.color && child.name === "device-panel") {
                child.material.color = new THREE.Color(color);
            }
        });
        if (!this.pointSprite) return;
        const canvas = await getDeviceIconCanvas(this.graph.icon, color, true);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.pointSprite.material.map = texture;
        this.pointSprite.material.needsUpdate = true;
    }

    async _createSprite(icon) {
        const canvas = await getDeviceIconCanvas(
            icon,
            this.graph.markerColor || this.color || "#2F7CEE"
        );
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                sizeAttenuation: true,
                depthTest: false,
                transparent: true,
            })
        );
        sprite.name = "device-icon";
        sprite.scale.setScalar(this.graph.iconSize);
        return sprite;
    }

    _createPanel() {
        const material = new THREE.SpriteMaterial({
            map: getButtonTexture(),
            color: this.graph.markerColor || this.color || "#58d7ff",
            transparent: true,
            depthTest: false,
            sizeAttenuation: true,
        });
        const panel = new THREE.Sprite(material);
        panel.name = "device-panel";
        panel.scale.set(this.graph.size * 0.875, this.graph.size, 1);
        return panel;
    }
}
