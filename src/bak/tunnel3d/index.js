import * as THREE from "three";

import { init as three_init } from "./three.init.js";
import { init as road_init, getTotalLength } from "./road.init.js";
import { init as car_lib_init, updateCars as updateCarsByData } from "./car.js";
import { MouseEventListener } from "./mouse-event-listener.js";
import { MockCarData } from "./mock.js";
import { CAR_EVENT_CAMERA_FOLLOW, CAR_EVENT_CAMERA_FOLLOW_END, DEVICE_MENU_SELECTED_CHANGED, DEVICE_ITEM_SELECTED_CHANGED, TUNNEL_CHANNEL_NAME, DEVICE_MARKER_SELECTED } from "./tunnel3d_const.js";
import { initDevice3dScene } from "./device3d.js";
import { getDeviceDefinesByDeviceType } from "./device_define.js";
import { controlFengji, controlZhaoming, controlshengguang, initListener } from "./device_control.js";

// 个性化设置
const targetInitPosition = new THREE.Vector3(4915, 0, 0);
const cameraDir = new THREE.Vector3().copy(targetInitPosition).sub({ x: 4887, y: 39, z: 51 });
const { camera, controls, scene, renderer, } = three_init();
// scene.background = new THREE.Color("rgb(35, 40, 65)"); //深蓝色
scene.background = new THREE.Color("black");
// targetInitPosition.set(0, 0, 0);
camera.position.copy(targetInitPosition).sub(cameraDir);
controls.target.copy(targetInitPosition);
controls.enabled = true;
controls.enablePan = false;
controls.zoomSpeed = 2.0;
controls.minDistance = 40;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI / 3;
window.scene = scene;

// 初始化事件交互机制
const MouseIntesectArray = [];
new MouseEventListener(renderer.domElement, camera, MouseIntesectArray);

// 初始化道路
let leftTransMil2Pixel, rightTransMil2Pixel;
{
    let { road, transMil2Pixel } = road_init("left");
    scene.add(road);
    leftTransMil2Pixel = transMil2Pixel;
}


{
    let { road, transMil2Pixel } = road_init("right");
    scene.add(road);
    rightTransMil2Pixel = transMil2Pixel;
}

//初始化车辆库
let carGroup = car_lib_init(camera, controls, scene, renderer, leftTransMil2Pixel, rightTransMil2Pixel, "car_list");

// 只对车辆做事件监听
new MouseEventListener(renderer.domElement, camera, carGroup.children);

// 模拟车辆数据
new MockCarData((data) => {
    updateCarsByData(data.Cars, data.UpdateTimeDelta);
})



// 里程滑动条
const slider = document.querySelector('.slider');
slider.max = getTotalLength();
slider.value = 4956;

const currentCameraDir = new THREE.Vector3();
slider.oninput = (e) => {
    let value = parseInt(e.target.value);

    currentCameraDir.copy(controls.target).sub(camera.position);

    controls.target.setX(value);
    camera.position.copy(controls.target).sub(currentCameraDir);
}
document.addEventListener("keydown", e => {
    let step;
    if (e.code == "ArrowRight") {
        step = 10;
    }else if (e.code == "ArrowLeft") {
        step = -10;
    }else {
        return;
    }

    let value = parseInt(slider.value) + step;

    currentCameraDir.copy(controls.target).sub(camera.position);

    controls.target.setX(value);
    camera.position.copy(controls.target).sub(currentCameraDir);
    
})

const sliderChannel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);
sliderChannel.addEventListener("message", (e) => {

    if (e.data.type === CAR_EVENT_CAMERA_FOLLOW) {
        slider.disabled = true;
        return;
    }

    if (e.data.type === CAR_EVENT_CAMERA_FOLLOW_END) {
        slider.disabled = false;
        return;
    }
})

function followControls() {
    slider.value = controls.target.x;
    requestAnimationFrame(followControls);
}
followControls()


// 初始化设备、告警面板
new Vue({
    el: "#app",
    data: {

        /**
         * 隧道列表
         */
        tunnelOptions: [
            {
                value: "1",
                label: "金龙隧道",
            }
        ],
        selectTunnel: "1",

        /**
         * 设备菜单
         */
        deviceMenu: [
            {
                name: "火灾报警",
                subItems: [
                    {
                        name: "手报",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "烟感",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "感温光栅",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "温感探测器",
                        deviceType: "wengantanceqi",
                        available: true,
                        control: false,
                    }
                ]
            },
            {
                name: "消防控制",
                subItems: [
                    {
                        name: "消防水泵",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "淋雨阀",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "消报",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "应急照明",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "疏散指示",
                        deviceType: "",
                        available: false,
                    }
                ]
            },
            {
                name: "环境控制",
                subItems: [
                    {
                        name: "风机",
                        deviceType: "fengji",
                        available: true,
                        control: true,
                    },
                    {
                        name: "照明",
                        deviceType: "zhaomingdeng",
                        available: true,
                        control: true,
                    },
                    {
                        name: "声光报警器",
                        deviceType: "shengguang",
                        available: true,
                        control: true,
                    },
                    {
                        name: "阀门",
                        deviceType: "",
                        available: false,
                    }
                ]
            },
            {
                name: "环境监控",
                subItems: [
                    {
                        name: "CO监测",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "H2S监测",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "O2监测",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "水位监测",
                        deviceType: "shuiweijiance",
                        available: true,
                    },
                    {
                        name: "温湿度监测",
                        deviceType: "",
                        available: false,
                    }
                ]
            },
            {
                name: "应急通讯",
                subItems: [
                    {
                        name: "应急电话",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "应急广播",
                        deviceType: "",
                        available: false,
                    }
                ]
            },
            {
                name: "视频监控",
                subItems: [
                    {
                        name: "摄像机",
                        deviceType: "shexiangji",
                        available: true,
                    }
                ]
            },
            {
                name: "交通诱导",
                subItems: [
                    {
                        name: "情报板",
                        deviceType: "",
                        available: false,
                    },
                    {
                        name: "信号灯",
                        deviceType: "",
                        available: false,
                    }
                ]
            }
        ],
        selectedMenus: [],

        /**
         * 设备列表
         */
        selectedMenu4Device: [],
        selectedMenu4DeviceIndex: null,
        selectedMenu: null,
        deviceList: [],
        selectedDevice: null,

        /**
        * 告警列表
        */
        alarmList: [
            //[{time, typeName, content, deviceName, deviceType}]
            { time: "2022-01-01 12:00:00", typeName: "火警", content: "进入K13-360至K13-860区间", deviceName: "温感ZK4+350", deviceType: "wengantanceqi" },
            { time: "2022-01-01 12:00:00", typeName: "异常", content: "进入K13-360至K13-860区间", deviceName: "温感ZK5+400", deviceType: "wengantanceqi" },
            { time: "2022-01-01 12:00:00", typeName: "火警", content: "进入K13-360至K13-860区间", deviceName: "温感ZK6+450", deviceType: "wengantanceqi" }
        ],
        selectedAlarm: null,

        /**
         * 漫游
         */
        onTrip: false,
        pausing: false,

        videoUrl: null,

    },
    mounted() {
        this.channel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

        // 设备三维模型交互
        initDevice3dScene(scene, controls, camera, MouseIntesectArray);
        initListener(this, scene);


        this.channel.addEventListener("message", (e) => {
            if (e.data.type == DEVICE_MARKER_SELECTED) {
                let { markerName, deviceType } = e.data;
                this.selectedMenu = this.selectedMenus.filter(e => e.deviceType == deviceType)[0];
                this.$nextTick(()=> {
                    this.deviceList.forEach(device => {
                        if (device.name == markerName) {
                            this.chooseDevice(device);
                            this.deviceListScroll2Target(device);
                        }
                    })
                })
                
            }
        })

    },

    watch: {

        selectedMenu: function() {
            if (this.selectedMenu) {
                this.deviceList.length = 0;
                const dfs = getDeviceDefinesByDeviceType(this.selectedMenu.deviceType);
                dfs.forEach(df => {
                    this.deviceList.push({
                        name: df.name,
                        deviceType: df.deviceType,
                        control: df.control,
                    })
                })
                this.selectedDevice = null;
                this.selectedMenu4DeviceIndex = this.selectedMenus.indexOf(this.selectedMenu) + "";

            }else {
                this.deviceList.length = 0;
            }
            
        }
    },
    methods: {

        changeSelectedMenu(value) {
            this.selectedMenu = this.selectedMenus[value];
        },
        inMenu(menu) {
            return this.selectedMenus.indexOf(menu) >= 0;
        },

        chooseMenu(menu) {

            if (this.inMenu(menu)) {
                //反选
                this.selectedMenus = this.selectedMenus.filter(m => m != menu);
                this.flushMenusChange();
                this.selectedMenu = this.selectedMenus[this.selectedMenus.length - 1];
            }else {
                this.selectedMenus.push(menu);
                this.flushMenusChange();
                this.selectedMenu = menu;
            }

        },

        flushMenusChange() {

            if (this.selectedMenus.length == 0) {
                this.selectedMenu4Device.length = 0;
                this.selectedMenu = null;
                this.deviceList.length = 0;
                this.selectedDevice = null;

            } else {
                this.selectedMenu4Device.length = 0;
                for (let i in this.selectedMenus) {
                    this.selectedMenu4Device.push({ value: i, label: this.selectedMenus[i].name });
                }

                if (!this.inMenu(this.selectedMenu)) {
                    this.selectedMenu = this.selectedMenus[this.selectedMenu4DeviceIndex];
                } else {
                    this.selectedMenu4DeviceIndex = this.selectedMenus.indexOf(this.selectedMenu) + "";
                }
            }

            this.channel.postMessage({
                type: DEVICE_MENU_SELECTED_CHANGED,
                selectedTypes: this.selectedMenus.map(e => e.deviceType),
            })
        },

        setMenu(menu) {
            if (!this.inMenu(menu)) {
                this.selectedMenus.push(menu);
                this.flushMenusChange();
            }

            this.selectedMenu = menu;
        },

        chooseDevice(device) {

            if (this.selectedDevice == device) { return; }

            if (this.onTrip) {
                alert("漫游时禁止操作");
                return;
            }

            const { name } = device;

            this.channel.postMessage({
                type: DEVICE_ITEM_SELECTED_CHANGED,
                oldDeviceName: this.selectedDevice?.name,
                newDeviceName: name,
                newDeviceType: device.deviceType,
            });

            this.selectedDevice = device;
            this.selectedAlarm = null;

        },
        showVideo(url) {
            this.videoUrl = url;
        },
        
        chooseAlarm(alarm) {

            if (this.selectedAlarm == alarm) { return; }

            if (this.onTrip) {
                alert("漫游时禁止操作");
                return;
            }

            let deviceMenu = null;

            for (const menu of this.deviceMenu) {
                let matched = false;
                for (const item of menu.subItems) {
                    if (item.deviceType == alarm.deviceType) {
                        matched = true;
                        deviceMenu = item;
                        break;
                    }
                }
                if (matched) break;
            }

            this.setMenu(deviceMenu);
            this.$nextTick(() => {
                for (const device of this.deviceList) {
                    if (device.name == alarm.deviceName) {
                        this.chooseDevice(device);

                        this.deviceListScroll2Target(device);
                        this.selectedAlarm = alarm;
                        break;
                    }
                }
            })

        },

        deviceListScroll2Target(device) {
            //找到选中元素所在位置
            const index = this.deviceList.findIndex(d => d.name == device.name);
            const container = this.$refs.deviceList.children[index];
            if (container) {
                // 滚动到目标元素
                container.scrollIntoView({ behavior: 'smooth' });
            }

        },
        deviceControl(bool) {
            const { deviceType } = this.selectedDevice;
            if (deviceType == "fengji") {
                controlFengji(bool);
                return;
            }

            if (deviceType == "shengguang") {
                controlshengguang(bool);
                return;
            }

            if (deviceType == "zhaomingdeng") {
                controlZhaoming(bool);
            }
        },
        startTrip(){
            this.onTrip = true;
            this.pausing = false;

            controls.target.x = 0;
            camera.position.x = -camera.position.y * 2;
            camera.position.z = 0;

            const dir = new THREE.Vector3(0, 0, 0);

            const that = this;


            (function move() {

                if (!that.pausing) {
                    dir.copy(controls.target).sub(camera.position);
                    controls.target.x += 1;
                    camera.position.copy(controls.target).sub(dir);
                }

                if (controls.target.x > getTotalLength()) {
                    that.endTrip();
                }

                if (that.onTrip) {
                    requestAnimationFrame(move);
                }
                
            })()
            
        },
        pauseTrip(){
            this.pausing = true;
        },
        continueTrip(){
            this.pausing = false;
        },
        endTrip(){
            this.onTrip = false;
            this.pausing = false;
        },

    }
})