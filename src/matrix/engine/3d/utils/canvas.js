import { ICONS, Colors } from "../../../common/core/const.js";

/**
 * 点标记半径
 */
const PointRadius = 40;

/**
 * 根据url获取image
 * @param {String} url
 * @returns
 */
const loadImage = (url, isOnline = false) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        if (isOnline) {
            const request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "blob";
            request.onload = (e) => {
                let pwin = window;
                image.src = (pwin.URL || pwin.webkitURL).createObjectURL(request.response);
                image.onload = () => {
                    resolve(image);
                };
            };
            request.send();
        } else {
            image.src = url;
            image.onload = () => {
                resolve(image);
            };
        }
    });
};

const popImageUrl = "./dep/imgs/pop.png";
const cameraImageUrl = "./dep/imgs/device/camera.svg";
/**
 * 获取弹窗canvas
 * @param {*} url
 * @param {*} name
 * @param {*} time
 * @param {*} type
 * @returns
 */
export const getPopCanvas = (url, name, time, type) => {
    return Promise.all([loadImage(popImageUrl), loadImage(cameraImageUrl), loadImage(url, true)])
        .then((datas) => {
            if (datas.length == 3) {
                let popImage = datas[0];
                let deviceImage = datas[1];
                let picImage = datas[2];
                return Promise.resolve(buildPopCanvas(popImage, deviceImage, picImage, name, time, type));
            }
        })
        .catch((e) => {
            console.error(e);
        });
};

/**
 * 根据参数生成摄像机弹窗的canvas
 * @param {Image} popImage
 * @param {Image} deviceImage
 * @param {Image} picImage
 * @param {String} name
 * @param {String} time
 * @param {String} type
 * @returns
 */
const buildPopCanvas = (popImage, deviceImage, picImage, name, time, type) => {
    const radius = 32,
        popHeight = 175,
        popWidth = 300,
        width = 300,
        height = 175 + radius,
        center = radius / 2;

    const deviceXOffset = 17;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    // 1. 绘制图标
    canvas.width = popWidth;
    canvas.height = popHeight + radius;
    ctx.beginPath();
    // 外圈
    ctx.arc(center + deviceXOffset, popHeight + center, center - 1, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    // 内圈
    ctx.arc(center + deviceXOffset, popHeight + center, center - 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#0198ff";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    // 设备图标
    ctx.drawImage(deviceImage, 6 + deviceXOffset, popHeight + 6, 20, 20);
    // 边框
    ctx.drawImage(popImage, 0, 0, popWidth, popHeight);
    // 图片本体
    ctx.drawImage(picImage, 10, 10, popWidth - 21, popHeight - 35);

    ctx.font = "14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(time, 20, popHeight - 30);
    ctx.fillText(`${type} ${name}`, 170, popHeight - 30);

    return canvas;
};

export const deviceCanvasMap = new Map();

/**
 * 初始化设备画布映射
 */
const initDeviceCanvasMap = () => {
    // 预设的颜色
    const colors = Object.values(Colors);
    ICONS.forEach(({ value, url }) => {
        var image = new Image();
        // 设置图片路径
        image.src = url;
        image.onload = () => {
            // 初始化多个状态的canvas
            let res = {};
            colors.forEach((color) => {
                res[color] = getCanvasByImageAndColor(image, color);
            });
            deviceCanvasMap.set(`${value}`, res);
        };
    });
};
initDeviceCanvasMap();

/**
 * 根据图标和颜色生成画布
 * @param {Image} image
 * @param {String} color
 * @returns
 */
const getCanvasByImageAndColor = (image, color) => {
    let center = PointRadius / 2;
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = PointRadius;
    canvas.height = PointRadius;

    // 外圈
    ctx.beginPath();
    ctx.arc(center, center, center - 1, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // 内圈
    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // 中心图标
    ctx.drawImage(image, 10, 10, 20, 20);
    return canvas;
};

/**
 * 根据设备类型获取canvas对象
 * @param {String} icon
 * @param {String} color 颜色
 * @returns
 */
export const getDeviceCanvas = (icon, color = Colors.Normal) => {
    return new Promise((resolve, reject) => {
        // 没有找到该图标
        if (!icon) {
            icon = ICONS[0].value;
        }

        if (deviceCanvasMap.has(icon)) {
            let colorObj = deviceCanvasMap.get(icon);
            if (colorObj.hasOwnProperty(color)) {
                // 存在图标和颜色
                resolve(colorObj[color]);
            } else {
                // 没有找到该图标对应的颜色
                let url = ICONS.find((i) => i.value == icon).url;

                var image = new Image();
                // 设置图片路径
                image.src = url;
                image.onload = () => {
                    // 缓存该颜色
                    colorObj[color] = getCanvasByImageAndColor(image, color);
                    resolve(colorObj[color]);
                };
            }
        }

        return deviceCanvasMap.get(`${icon}`)[color];
    });
};

export const getNameTexture = (text, width, height, color = "white") => {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    context.font = "bold 34px serif";
    context.textAlign = "center";
    context.fillStyle = color;
    context.textBaseline = "middle";
    context.fillText(text, width / 2, height / 2, width);
    return canvas;
};
