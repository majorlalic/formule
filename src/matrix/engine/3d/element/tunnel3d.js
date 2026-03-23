import * as THREE from "three";
import Element3d from "./element3d.js";
import {
    createAnimatedLine,
    createExtrudedScaleText,
    createFloor,
    createHalfTube,
    createRoadEdgeLine,
    createRing,
    createScaleRuler,
    formatMilestone,
} from "./tunnel/utils.js";

const DEFAULT_GRAPH = {
    length: 1200,
    startMil: 0,
    position: { x: 0, y: 0, z: 0 },
};

const LANE_GAP = 14;
const FLOOR_WIDTH = 10.2;
const LENGTH_SCALE = 1 / 3;

export default class Tunnel3d extends Element3d {
    constructor(ele, ctx) {
        super(ele, ctx);
    }

    init(ele) {
        super.init();
        const graph = { ...DEFAULT_GRAPH, ...(ele.graph || {}) };
        this.graph = graph;
        this.group.position.copy(graph.position || { x: 0, y: 0, z: 0 });

        const leftBore = this._createBore(1);
        const rightBore = this._createBore(-1);
        this.group.add(leftBore);
        this.group.add(rightBore);

        this.group.add(this._createMilestoneGroup());
    }

    changeColor(color) {
        this.color = color;
        this.group.traverse((child) => {
            if (child.material && child.name === "tunnel-shell") {
                child.material.color = new THREE.Color(color);
            }
        });
    }

    _createBore(direction) {
        const graph = this.graph;
        const bore = new THREE.Group();
        const displayLength = graph.length * LENGTH_SCALE;
        const shellRadius = FLOOR_WIDTH / 2;
        const centerDistance = Math.max(
            LANE_GAP,
            FLOOR_WIDTH + 3
        );
        const zOffset = (centerDistance / 2) * direction;
        const edgeOffset = FLOOR_WIDTH / 2;

        const shell = createHalfTube({
            radius: shellRadius,
            length: displayLength,
            color: this.color || "#0f4d6b",
        });
        shell.name = "tunnel-shell";
        shell.position.z = zOffset;
        bore.add(shell);

        const floor = createFloor({
            length: displayLength,
            width: FLOOR_WIDTH,
        });
        floor.position.z = zOffset;
        bore.add(floor);

        const edgeLeft = createRoadEdgeLine(displayLength);
        edgeLeft.position.set(0, 0.13, zOffset - edgeOffset);
        bore.add(edgeLeft);

        const edgeRight = createRoadEdgeLine(displayLength);
        edgeRight.position.set(0, 0.13, zOffset + edgeOffset);
        bore.add(edgeRight);

        const ringSpacing = 80;
        const ringThickness = 0.08;
        for (let x = 0; x <= graph.length; x += ringSpacing) {
            const ring = createRing({ radius: shellRadius, thickness: ringThickness });
            ring.position.set(x * LENGTH_SCALE - ringThickness / 2, 0, zOffset);
            bore.add(ring);
        }

        const lineLeft = createAnimatedLine({
            length: displayLength,
            color: "#f7c648",
            radius: 0.18,
            speed: direction > 0 ? 1 : -1,
            segmentLength: 0.06,
            repeat: 12,
        });
        lineLeft.position.set(0, 0.15, zOffset - edgeOffset + 0.35);
        bore.add(lineLeft);

        const lineRight = createAnimatedLine({
            length: displayLength,
            color: "#f7c648",
            radius: 0.18,
            speed: direction > 0 ? 1 : -1,
            segmentLength: 0.06,
            repeat: 12,
        });
        lineRight.position.set(0, 0.15, zOffset + edgeOffset - 0.35);
        bore.add(lineRight);

        return bore;
    }

    _createMilestoneGroup() {
        const group = new THREE.Group();
        const rulerWidth = 1000;
        const rulerHeight = 4.8;
        const rulerZ = LANE_GAP / 2 + FLOOR_WIDTH / 2 + 0.25;

        for (let x = 0; x < this.graph.length; x += rulerWidth) {
            const currentWidth = Math.min(rulerWidth, this.graph.length - x);
            const ruler = createScaleRuler({
                width: currentWidth * LENGTH_SCALE,
                meterWidth: currentWidth,
                meterOffset: x,
                startMil: this.graph.startMil,
                totalLength: this.graph.length,
                height: rulerHeight,
                minorStep: 100,
                majorStep: 1000,
            });
            ruler.position.set(
                (x + currentWidth / 2) * LENGTH_SCALE,
                0.03,
                rulerZ + rulerHeight / 2
            );
            group.add(ruler);
        }

        for (let x = 0; x <= this.graph.length; x += 100) {
            const totalMil = this.graph.startMil + x;
            createExtrudedScaleText(`${(totalMil / 1000).toFixed(1)}km`).then(
                (label) => {
                    const isMajor =
                        x === 0 ||
                        x === this.graph.length ||
                        totalMil % 1000 === 0;
                    if (isMajor) {
                        label.scale.setScalar(1.25);
                    } else {
                        label.scale.set(0.62, 0.78, 0.62);
                    }
                    label.position.set(
                        x * LENGTH_SCALE,
                        0.02,
                        rulerZ + rulerHeight + (isMajor ? 1.55 : 0.12)
                    );
                    group.add(label);
                }
            ).catch((err) => {
                console.error("[Tunnel3d] 里程文字创建失败:", err);
            });
        }
        return group;
    }
}
