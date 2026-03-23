import * as THREE from "three";
import { DEVICE_ITEM_SELECTED_CHANGED, DEVICE_MARKER_SELECTED, DEVICE_MENU_SELECTED_CHANGED, TUNNEL_CHANNEL_NAME } from "./tunnel3d_const.js";
import { getDeviceDefinesByDeviceType } from "./device_define.js";
import { TWEEN } from "three/addons/libs/tween.module.min.js";
import { getWaterValue } from "./device_control.js";

const device_animate_tween_group = new TWEEN.Group();
const loader = new THREE.ImageLoader();
const device3dChannel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

function initDevice3dScene(scene, controls, camera, MouseIntesectArray) {

    const DeviceList = {};
    const { textMarker, setTitle, setValue } = genWaterPanel();

    device3dChannel.addEventListener("message", e => {

        /**
         * 处理菜单切换事件
         * 1、隐藏上次选择的设备组
         * 2、初始化/展示这次的设备组
         * 3、判断当前设备选中效果是否适用
         */
        if (e.data.type == DEVICE_MENU_SELECTED_CHANGED) {
            let { selectedTypes } = e.data;

            for (let type in DeviceList) {
                DeviceList[type].visible = selectedTypes.indexOf(type) != -1;
            }

            selectedTypes.filter(e => !DeviceList[e]).forEach(newDeviceType => {

                let deviceGroup = initDevice3d(newDeviceType);
                DeviceList[newDeviceType] = deviceGroup;
                scene.add(deviceGroup);

                // 添加点击事件
                MouseIntesectArray.push(deviceGroup);
                for (let i in deviceGroup.children) {
                    let item = deviceGroup.children[i];

                    const data = {
                        type: DEVICE_MARKER_SELECTED,
                        markerName: item.name,
                        deviceType: newDeviceType
                    }

                    item.addEventListener('click', (e) => {
                        device3dChannel.postMessage(data)
                    })
                }
            })

            dealSelectedDeviceWithSelectedTypes(selectedTypes);

            return;
        }

        /**
         * 处理设备选中事件
         * 1、上次选中marker停止特效
         * 2、移动到当前marker位置
         * 3、这次选中marker开始特效
         */
        if (e.data.type == DEVICE_ITEM_SELECTED_CHANGED) {

            const { newDeviceName, newDeviceType } = e.data;

            onDeviceSelected(newDeviceName, newDeviceType);

            return;
        }

    })
    let controlsMoveTween = null;
    const cameraDir = new THREE.Vector3();
    let lastBlinkDeviceType, lastBlinkMarkr;
    function dealSelectedDeviceWithSelectedTypes(types) {
        if (types.indexOf(lastBlinkDeviceType) >= 0) {
            return;
        }

        onDeviceSelected();
    }
    function onDeviceSelected(newDeviceName, newDeviceType) {

        if (lastBlinkMarkr) {
            unblink(lastBlinkMarkr);
            device_animate_tween_group.remove(controlsMoveTween);
        }

        lastBlinkMarkr?.remove(textMarker);

        if (newDeviceName) {
            const marker = scene.getObjectByName(newDeviceName);

            cameraDir.copy(camera.position).sub(controls.target);
            const temp = { x: controls.target.x };
            controlsMoveTween = new TWEEN.Tween(temp, device_animate_tween_group)
                .to({ x: marker.position.x }, 200)
                .onUpdate((coords) => {
                    controls.target.setX(coords.x);
                    camera.position.copy(controls.target).add(cameraDir);
                }).start();

            blink(marker);

            if (newDeviceType == "shuiweijiance") {
                textMarker.position.y = 2;
                marker.add(textMarker);

                setTitle(marker.name);
                let requestWater = false;
                textMarker.onBeforeRender = () => {
                    if (requestWater) return;
                    requestWater = true;

                    getWaterValue(e => {
                        if (!e) {
                            e = "--";
                        } else {
                            e = parseFloat(e).toFixed(3);
                        }
                        setValue(e + "m");
                        setTimeout(() => {
                            requestWater = false;

                        }, 2000);
                    }, () => {
                        setTimeout(() => {
                            requestWater = false;

                        }, 2000);
                    });



                }
            }

            lastBlinkMarkr = marker;
            lastBlinkDeviceType = newDeviceType;
        }

    }
}

const markerLight = new THREE.PointLight("red", 1, 50, 0.2);
let startBlinkTime = 0;
/**
 * 
 * @param {Object3d} object
 */
const blink = (obj) => {

    startBlinkTime = performance.now();
    obj.add(markerLight);
    obj.onBeforeRender = () => {

        if ((performance.now() - startBlinkTime) % 1000 < 500) {
            markerLight.visible = true;
            obj.material.map = obj.material.blinkMap;
            obj.material.map.needsUpdate = true;
        } else {
            markerLight.visible = false;
            obj.material.map = obj.material.originalMap;
            obj.material.map.needsUpdate = true;
        }
    }

}
const unblink = (obj) => {
    obj.remove(markerLight);
    const m = obj.material;
    m.map = m.originalMap;
    m.needsUpdate = true;
    delete (obj.onBeforeRender);
}


function genWaterPanel() {
    const cornerRadius = 20;
    const width = 480;
    const height = 180;
    const canvas = document.createElement(`canvas`);
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    const spriteMaterial = new THREE.SpriteMaterial({
        depthTest: true,
        map: new THREE.CanvasTexture(canvas)
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(width, height, 1).divideScalar(width).multiplyScalar(4);

    let text = "--m";
    let title = "11";
    let backgroundImage;

    loader.load(
        // resource URL
        "./tunnel3d/img/bg.png",

        // onLoad callback
        function (image) {
            backgroundImage = image;
        }
    );

    function flushCanvas() {
        // drawRoundedRect(ctx, 0, 0, width, height, cornerRadius);

        ctx.drawImage(backgroundImage, 0, 0, width, height);

        ctx.fillStyle = '#2963C6';
        ctx.fill();

        ctx.font = 'bold 50px 宋体'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'start';
        ctx.textBaseline = "top";
        //第一行
        let firstTitle = title.substring(0, 4);
        //第二行
        let lastTitle = title.substring(4, title.length);
        ctx.fillText(firstTitle, 65, 20);
        ctx.font = 'bold 40px 宋体'
        ctx.fillText(lastTitle, 65, 90);

        // 设置字体相关样式
        ctx.font = 'bold 60px 宋体'
        // 样色
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center';
        ctx.textBaseline = "right";

        let firstText = text.substring(0, text.length - 1);
        let lastText = text.substring(text.length - 1, text.length);
        // 居中画文字
        ctx.fillStyle = '#F6A523'
        ctx.textAlign = 'right';
        ctx.fillText(firstText, width - 20, 30);

        ctx.font = 'bold 40px 宋体'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(lastText, width - 20, 85);

        ctx.beginPath();
        ctx.arc(40, 40, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#FBA625'; // 设置填充颜色
        ctx.fill();
        spriteMaterial.map.needsUpdate = true;
    }


    function setTitle(_title) {
        title = _title;
        flushCanvas();
    }

    function setValue(value) {
        text = value;
        flushCanvas();
    }

    return { textMarker: sprite, setTitle, setValue };
}

// 绘制带有圆角的矩形
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}


function update() {
    device_animate_tween_group.update();

    requestAnimationFrame(update);
}
update();


function initDevice3d(deviceType) {


    const dfs = getDeviceDefinesByDeviceType(deviceType);
    if (dfs == null) {
        console.error("无此类型设备: " + deviceType);
        return;
    }

    const deviceGroup = new THREE.Group();
    deviceGroup.name = deviceType + "组";

    /**
     * {spriteUrl: [SpriteMaterial]}
     */
    const imageCache = {};

    dfs.forEach(df => {

        const spriteMaterial = new THREE.SpriteMaterial({
            depthTest: false,
        });

        if (!imageCache[df.spriteImage]) {

            imageCache[df.spriteImage] = [spriteMaterial];

            // load a image resource
            loader.load(
                // resource URL
                df.spriteImage,

                // onLoad callback
                function (image) {
                    const canvas = drawCanvas(image, df.color);
                    const blinkCanvas = drawCanvas(image, "red");

                    const texture = new THREE.CanvasTexture(canvas);
                    const blinkTextur = new THREE.CanvasTexture(blinkCanvas);

                    for (const m of imageCache[df.spriteImage]) {
                        m.map = texture;
                        m.originalMap = texture;
                        m.blinkMap = blinkTextur;
                        m.needsUpdate = true;
                    }
                }
            );

        } else {
            imageCache[df.spriteImage].push(spriteMaterial);
        }

        const s = new THREE.Sprite(spriteMaterial);
        s.name = df.name;
        s.position.copy(df.position);
        s.userData.deviceDefine = df;

        if (df.size) {
            df.size.z = 1;
            s.scale.copy(df.size);
        }
        s.scale.multiplyScalar(3);

        deviceGroup.add(s);

    })

    return deviceGroup;

}

function drawCanvas(image, backgroundColor) {
    const radius = 200;
    const center = radius / 2;
    const canvas = document.createElement(`canvas`);
    const ctx = canvas.getContext("2d");
    canvas.width = radius;
    canvas.height = radius;

    ctx.beginPath();
    ctx.arc(center, center, center - 1, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, 2 * Math.PI);
    ctx.fillStyle = backgroundColor || '#0198ff';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.drawImage(image, radius / 9, radius / 9, radius / 9 * 7, radius / 9 * 7);

    return canvas
}


export {
    initDevice3dScene
}