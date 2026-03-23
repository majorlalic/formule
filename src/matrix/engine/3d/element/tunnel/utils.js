import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const DEFAULT_COLORS = {
    shell: "#2d8fe8",
    floor: "#1b2438",
    line: "#f6be3a",
    ring: "#4ed9ff",
    billboardBg: "#0b1220",
    billboardBorder: "#59d8ff",
};

const textureLoader = new THREE.TextureLoader();
const fontLoader = new FontLoader();
let roadTextureCache = null;
let scaleFontPromise = null;

export function createHalfTube({
    radius = 6,
    length = 1000,
    color = DEFAULT_COLORS.shell,
    opacity = 0.2,
    thickness = 0.18,
}) {
    const outerRadius = radius + thickness;
    const shape = new THREE.Shape();
    shape.moveTo(-outerRadius, 0);
    shape.absarc(0, 0, outerRadius, Math.PI, 0, true);
    shape.lineTo(radius, 0);
    shape.absarc(0, 0, radius, 0, Math.PI, false);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: length,
        bevelEnabled: false,
        curveSegments: 48,
        steps: 1,
    });
    geometry.rotateY(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

export function createFloor({
    length = 1000,
    width = 10.5,
    color = DEFAULT_COLORS.floor,
}) {
    const texture = getRoadTexture();
    const material = texture
        ? new THREE.MeshPhongMaterial({
              map: texture,
              color: "#ffffff",
              transparent: true,
              opacity: 0.96,
          })
        : new THREE.MeshPhongMaterial({
              color,
              transparent: true,
              opacity: 0.92,
          });
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.22, width),
        material
    );
    mesh.position.set(length / 2, -0.12, 0);
    return mesh;
}

export function createRoadEdgeLine(length = 1000, color = "#7bd7ff") {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(length, 0, 0),
    ]);
    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
    });
    return new THREE.Line(geometry, material);
}

export function createRing({
    radius = 6.05,
    color = DEFAULT_COLORS.ring,
    thickness = 0.08,
}) {
    return createHalfTube({
        radius,
        length: thickness,
        color,
        opacity: 0.78,
        thickness: 0.05,
    });
}

export function createBillboard({
    title = "Tunnel Notice",
    subtitle = "",
    width = 3.8,
    height = 1.1,
    background = DEFAULT_COLORS.billboardBg,
    border = DEFAULT_COLORS.billboardBorder,
    foreground = "#ffffff",
}) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = background;
    roundRect(ctx, 10, 10, 1004, 300, 24);
    ctx.fill();

    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    roundRect(ctx, 18, 18, 988, 284, 20);
    ctx.stroke();

    ctx.fillStyle = foreground;
    ctx.font = "bold 68px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(title || ""), 512, subtitle ? 126 : 160);

    if (subtitle) {
        ctx.fillStyle = "#9cc7ff";
        ctx.font = "42px sans-serif";
        ctx.fillText(String(subtitle), 512, 214);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        material
    );
    return mesh;
}

export function createKilometerLabel(text, color = "#9ad7ff") {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(5, 12, 24, 0.7)";
    roundRect(ctx, 8, 8, 496, 112, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(95, 214, 255, 0.9)";
    ctx.lineWidth = 4;
    roundRect(ctx, 12, 12, 488, 104, 16);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture,
            depthTest: false,
            transparent: true,
        })
    );
}

export async function createExtrudedScaleText(text, color = "#7bd7ff") {
    const font = await loadScaleFont();
    const geometry = new TextGeometry(text, {
        font,
        size: 0.95,
        depth: 0.22,
        curveSegments: 10,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.025,
        bevelSegments: 4,
    });
    geometry.center();
    geometry.rotateX(-Math.PI / 2);

    const materials = [
        new THREE.MeshPhongMaterial({
            color: "#dffcff",
            emissive: "#6fd8ff",
            shininess: 90,
        }),
        new THREE.MeshPhongMaterial({
            color,
            emissive: "#237ea3",
            shininess: 50,
        }),
    ];

    return new THREE.Mesh(geometry, materials);
}

export function createScaleRuler({
    width = 100,
    meterWidth = width,
    meterOffset = 0,
    startMil = 0,
    totalLength = meterWidth,
    height = 5,
    majorLineWidth = 8,
    minorLineWidth = 4,
    scaleFactor = 8,
    color = "#7bd7ff",
    opacity = 0.95,
    minorStep = 100,
    majorStep = 500,
}) {
    const canvas = document.createElement("canvas");
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;

    const totalMeters = Math.max(1, Math.round(meterWidth));
    for (let value = 0; value <= totalMeters; value += minorStep) {
        const x = (value / totalMeters) * canvas.width;
        const absoluteMeter = meterOffset + value;
        const absoluteMil = startMil + absoluteMeter;
        const isMajor =
            absoluteMeter === 0 ||
            absoluteMeter === totalLength ||
            absoluteMil % majorStep === 0;
        const tickHeight = isMajor
            ? height * scaleFactor
            : height * scaleFactor * 0.58;
        const lineWidth = isMajor ? majorLineWidth : minorLineWidth;
        ctx.fillRect(x - lineWidth / 2, 0, lineWidth, tickHeight);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        material
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(width / 2, 0, height / 2);
    return mesh;
}

export function createAnimatedLine({
    length = 1000,
    color = DEFAULT_COLORS.line,
    radius = 0.16,
    speed = 1,
    segmentLength = 0.16,
    repeat = 10,
}) {
    const curve = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(length, 0, 0)
    );
    const geometry = new THREE.TubeGeometry(curve, 512, radius, 8, false);
    const uniforms = {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float time;
            uniform vec3 color;
            void main() {
                float travel = fract(vUv.x * ${repeat.toFixed(1)} - time);
                float centerDist = abs(travel - 0.5);
                float alpha = 1.0 - smoothstep(0.0, ${segmentLength.toFixed(3)}, centerDist);
                alpha = pow(alpha, 1.7);
                gl_FragColor = vec4(color, alpha * 0.95);
                if (gl_FragColor.a < 0.1) discard;
            }
        `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.onBeforeRender = () => {
        uniforms.time.value += 0.012 * speed;
    };
    return mesh;
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}

export function formatMilestone(value = 0) {
    const meters = Math.max(0, Number(value) || 0);
    const km = Math.floor(meters / 1000);
    const meter = Math.round(meters % 1000);
    return `K${km}+${String(meter).padStart(3, "0")}`;
}

function getRoadTexture() {
    if (!roadTextureCache) {
        roadTextureCache = textureLoader.load(resolveAssetUrl("/tunnel3d/road.png"));
        roadTextureCache.colorSpace = THREE.SRGBColorSpace;
        roadTextureCache.wrapS = THREE.RepeatWrapping;
        roadTextureCache.wrapT = THREE.RepeatWrapping;
    }
    roadTextureCache.repeat.set(64, 1);
    return roadTextureCache;
}

function loadScaleFont() {
    if (!scaleFontPromise) {
        scaleFontPromise = new Promise((resolve, reject) => {
            fontLoader.load(
                resolveAssetUrl("/tunnel3d/fonts/droid_sans_mono_regular.typeface.json"),
                resolve,
                undefined,
                reject
            );
        });
    }
    return scaleFontPromise;
}

function resolveAssetUrl(path) {
    const pathname = window.location.pathname || "";
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
        return `/${parts[0]}${path}`;
    }
    return path;
}
