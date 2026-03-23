import { getTotalLength } from "./road.init.js";
const DeviceMetaInfo = {
    "fengji": {
        spriteImage: "./tunnel3d/device_img/fengji.png",
        spacing: 50,
        startPosX: 0,
        offset: { x: 0, y: 8, z: 8 },
        name: "风机",
        control: true, //可操控
    },
    "shengguang": {
        spriteImage: "./tunnel3d/device_img/AudibleAlarm.png",
        spacing: 50,
        startPosX: 0,
        offset: { x: 0, y: 8, z: 16 },
        name: "声光",
        control: true, //可操控
    },
    "zhaomingdeng": {
        spriteImage: "./tunnel3d/device_img/zhaomingdeng.png",
        spacing: 50,
        startPosX: 0,
        offset: { x: 0, y: 5, z: 2 },
        name: "照明",
        control: true, //可操控
    },
    "wengantanceqi": {
        spriteImage: "./tunnel3d/device_img/wengantanceqi.png",
        spacing: 50,
        startPosX: 0,
        offset: { x: 0, y: 8, z: 12 },
        name: "温感",
        color: "blue",
        control: false, //不可操控
    },
    "shexiangji": {
        spriteImage: "./tunnel3d/device_img/shexiangji.png",
        spacing: 80,
        startPosX: 0,
        offset: { x: 0, y: 8, z: 16 },
        name: "摄像机",
        color: "blue",
        control: false, //不可操控
    },
    "shuiweijiance": {
        spriteImage: "./tunnel3d/device_img/water.png",
        spacing: 80,
        startPosX: 0,
        offset: { x: 0, y: 2, z: 1 },
        name: "水位监测",
        color: "green",
        control: false, //不可操控
    },
}

class DeviceItemDefine {
    spriteImage;
    position;
    name;
    deviceType;
    color;
    control;
    constructor(spriteImage, position, name, deviceType, color, control) {
        this.spriteImage = spriteImage;
        this.position = position;
        this.name = this.genName(name);
        this.deviceType = deviceType;
        this.color = color;
        this.control = !!control;
    }

    genName(name) {
        const x = this.position.x;
        const km = Math.floor(x / 1000);
        const m = Math.ceil(x % 1000);

        name = name + "ZK" + km;

        if (m != 0) {
            return name + "+" + m;
        }else {
            return name;
        }
    }
}

function getDeviceDefinesByDeviceType(deviceType) {

    const arr = [];

    const info = DeviceMetaInfo[deviceType];
    if (info == null) {
        return null;
    }

    let i = info.startPosX;
    const totalLen = getTotalLength();

    while (i < totalLen) {

        const position = { x: i + info.offset.x, y: info.offset.y, z: info.offset.z };

        arr.push(new DeviceItemDefine(info.spriteImage, position, info.name, deviceType, info.color, info.control));

        i += info.spacing;
    }

    return arr;
}

export {
    getDeviceDefinesByDeviceType
}