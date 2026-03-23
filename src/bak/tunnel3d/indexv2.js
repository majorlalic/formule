import * as THREE from "three";

import { init as three_init } from "./three.init.js";
import { init as road_init, getTotalLength } from "./road.init.js";
import { init as car_lib_init, updateCars as updateCarsByData } from "./car.js";
import { MouseEventListener } from "./mouse-event-listener.js";
import { MockCarData } from "./mock.js";
import {
    CAR_EVENT_CAMERA_FOLLOW,
    CAR_EVENT_CAMERA_FOLLOW_END,
    DEVICE_MENU_SELECTED_CHANGED,
    DEVICE_ITEM_SELECTED_CHANGED,
    TUNNEL_CHANNEL_NAME,
    DEVICE_MARKER_SELECTED,
} from "./tunnel3d_const.js";
import { initDevice3dScene } from "./device3d.js";
import { getDeviceDefinesByDeviceType } from "./device_define.js";
import {
    controlFengji,
    controlZhaoming,
    controlshengguang,
    initListener,
} from "./device_control.js";
import http from "../js/common/http.js";
import { getUrlParam } from "../js/common/util.js";
import { addWaterPool, initPresureDevice } from "./device3d.js";
import { STATUS } from "./const.js";

// 个性化设置
const targetInitPosition = new THREE.Vector3(0, 0, 0);
const cameraDir = new THREE.Vector3()
    .copy(targetInitPosition)
    .sub({ x: 500, y: 100, z: 51 });
const { camera, controls, scene, renderer } = three_init();
// scene.background = new THREE.Color("rgb(35, 40, 65)"); //深蓝色
scene.background = new THREE.Color("#232632");
// targetInitPosition.set(0, 0, 0);
camera.position.copy(targetInitPosition).sub(cameraDir);
controls.target.copy(targetInitPosition);
controls.enabled = true;
controls.enablePan = true;
controls.zoomSpeed = 2.0;
controls.minDistance = 40;
controls.maxDistance = 300;
// controls.maxPolarAngle = Math.PI / 3;
window.scene = scene;

// 初始化事件交互机制
const MouseIntesectArray = [];
new MouseEventListener(renderer.domElement, camera, MouseIntesectArray);

camera.position.copy({
    x: 42.05731065146336,
    y: 97.86179077476213,
    z: 102.89587157318564,
});
controls.target.copy({
    x: 85.18784115792154,
    y: -2.2504622639869345e-17,
    z: -66.10953438942744,
});

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
// let carGroup = car_lib_init(camera, controls, scene, renderer, leftTransMil2Pixel, rightTransMil2Pixel, "car_list");

// 只对车辆做事件监听
// new MouseEventListener(renderer.domElement, camera, carGroup.children);

// 模拟车辆数据
// new MockCarData((data) => {
//     updateCarsByData(data.Cars, data.UpdateTimeDelta);
// })

// 里程滑动条
const slider = document.querySelector(".slider");
slider.max = getTotalLength();
slider.value = 4956;

const currentCameraDir = new THREE.Vector3();
slider.oninput = (e) => {
    let value = parseInt(e.target.value);

    currentCameraDir.copy(controls.target).sub(camera.position);

    controls.target.setX(value);
    camera.position.copy(controls.target).sub(currentCameraDir);
};
document.addEventListener("keydown", (e) => {
    let step;
    if (e.code == "ArrowRight") {
        step = 10;
    } else if (e.code == "ArrowLeft") {
        step = -10;
    } else {
        return;
    }

    let value = parseInt(slider.value) + step;

    currentCameraDir.copy(controls.target).sub(camera.position);

    controls.target.setX(value);
    camera.position.copy(controls.target).sub(currentCameraDir);
});

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
});

function followControls() {
    slider.value = controls.target.x;
    requestAnimationFrame(followControls);
}
followControls();

const token =
    "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE3MTgwOTUwOTksImV4cCI6MTcxODE4MTQ5OSwiaXNzIjoiaHR0cDovLzEwLjExLjIuMjA1OjUwMDIiLCJhdWQiOlsiV2VTYWZlIiwiaHR0cDovLzEwLjExLjIuMjA1OjUwMDIvcmVzb3VyY2VzIl0sImNsaWVudF9pZCI6Indlc2VjdXJpdHktZnJvbnQiLCJzdWIiOiIyIiwiYXV0aF90aW1lIjoxNzE4MDY2NTc4LCJpZHAiOiJsb2NhbCIsInRlbmFudCI6IjEiLCJyb2xlcyI6IkFkbWluIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSJdfQ.g6Jv1F5e71_oTXa1PLPFgGaI0NY5cUOJRY77-TKP1bFHq1emVwZJwbpFl7O3JtsuLpSMkRkJb9pxnGl-CLMDwJIyqY_l3_HVE-JqkQK56PIrHwlWRTuUtO8CnfLXPkC0aKnixQBhXgdHwmyZfNqHN8Rdjx5zZEMAA7OI2-pNIodAgAFLM6OySLA6R7RPfmgReq5561xsWkjG0FXYem4fiRD2UuOSOcGlk9OL2X7BOCKylddXP8JA5XXPmJssJQssp-i6fI0ODuSoFI0l2_oL98LNR7rf7iei4kwGHT7GvJSSznjlemHsFemz_CkIfoTDepM8SMyDLA0FSMI5xFuvig";
const urlPrefix = "http://10.11.2.59:5000/";
// 初始化设备、告警面板
var app = new Vue({
    el: "#app",
    data: {
        /**
         * 隧道列表
         */
        tunnelOptions: [
            {
                value: "1",
                label: "金龙隧道",
            },
        ],
        selectTunnel: "",
        /**
         * 设备菜单
         */
        deviceMenu: [
            {
                name: "火灾报警",
                subItems: [
                    {
                        name: "手报",
                        deviceType: "manualalarm",
                        available: true,
                        count: 0,
                    },
                    {
                        name: "消报",
                        deviceType: "indoorhydrant",
                        available: true,
                        count: 0,
                    },
                    {
                        name: "灭火器",
                        deviceType: "extinguisher",
                        available: true,
                        count: 0,
                    },
                    {
                        name: "声报",
                        deviceType: "sondlightalarm",
                        available: true,
                        control: false,
                        count: 0,
                    },
                    {
                        name: "2支装灭火器箱",
                        deviceType: "extinguisherbox",
                        available: true,
                        control: false,
                        count: 0,
                    },
                ],
            },
            {
                name: "消防控制",
                subItems: [
                    // {
                    //     name: "无线液位传感器",
                    //     deviceType: "wireless_pressure_sensor",
                    //     available: true,
                    //     count: 0,
                    // },
                    {
                        name: "无线水压传感器",
                        deviceType: "pressurepickup",
                        available: true,
                        count: 0,
                    },
                    // {
                    //     name: "消报",
                    //     deviceType: "",
                    //     available: false,
                    // },
                    // {
                    //     name: "应急照明",
                    //     deviceType: "",
                    //     available: false,
                    // },
                    // {
                    //     name: "疏散指示",
                    //     deviceType: "",
                    //     available: false,
                    // },
                ],
            },
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
            {
                time: "2022-01-01 12:00:00",
                typeName: "火警",
                content: "进入K13-360至K13-860区间",
                deviceName: "温感ZK4+350",
                deviceType: "wengantanceqi",
            },
            {
                time: "2022-01-01 12:00:00",
                typeName: "异常",
                content: "进入K13-360至K13-860区间",
                deviceName: "温感ZK5+400",
                deviceType: "wengantanceqi",
            },
            {
                time: "2022-01-01 12:00:00",
                typeName: "火警",
                content: "进入K13-360至K13-860区间",
                deviceName: "温感ZK6+450",
                deviceType: "wengantanceqi",
            },
        ],
        selectedAlarm: null,

        /**
         * 漫游
         */
        onTrip: false,
        pausing: false,

        videoUrl: null,

        types: [],
        assetsToalNum: 0,
        checkedType: [],

        areaId: "",

        selectTypeCount: 0,
    },
    mounted() {
        this.queryTunnels();

        this.channel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

        this.channel.addEventListener("message", (e) => {
            if (e.data.type == DEVICE_MARKER_SELECTED) {
                let {
                    markerName,
                    deviceType,
                    id,
                    deviceNum,
                    deviceName,
                    iotStatus,
                } = e.data;
                this.selectedMenu = this.selectedMenus.filter(
                    (e) => e.deviceType == deviceType
                )[0];
                this.$nextTick(() => {
                    this.deviceList.forEach((device) => {
                        if (device.name == markerName) {
                            this.chooseDevice(device);
                            if(parent){
                                parent.deviceClick(id, deviceNum, deviceName, iotStatus);
                            }
                            this.deviceListScroll2Target(device);
                        }
                    });
                });
            }
        });
        // https://wesafe.wutos.com:86/wesafe/DataVisual/VisualTemplate.json?v=1 图标
    },
    watch: {
        selectedMenu: function () {
            if (this.selectedMenu) {
                this.deviceList.length = 0;
                const dfs = getDeviceDefinesByDeviceType(
                    this.selectedMenu.deviceType,
                    this.selectedMenu.deviceList
                );
                dfs.forEach((df) => {
                    this.deviceList.push({
                        name: df.name,
                        deviceType: df.deviceType,
                        control: df.control,
                        id: df.id,
                        deviceNum: df.deviceNum,
                        iotStatus: df.iotStatus,
                    });
                });
                this.selectedDevice = null;
                this.selectedMenu4DeviceIndex =
                    this.selectedMenus.indexOf(this.selectedMenu) + "";
                this.selectTypeCount = this.selectedMenu.count;
            } else {
                this.deviceList.length = 0;
            }
        },
    },
    methods: {
        queryDevice(areaId, deviceType, callback) {
            $.ajax({
                url: `${urlPrefix}BusinessQuery/GetResult`,
                type: "post",
                data: {
                    queryName: "networkBuilding.getDeviceList",
                    Cid: deviceType,
                    AreaId: areaId,
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(
                        "Authorization",
                        localStorage.getItem("token") || token
                    );
                },
                success: (res) => {
                    if (callback) {
                        callback(res);
                    }
                },
            });
        },
        queryTypes(areaId) {
            $.ajax({
                url: `${urlPrefix}VisualAssests/AssestTypeNew?AreaID=${areaId}`,
                type: "get",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(
                        "Authorization",
                        localStorage.getItem("token") || token
                    );
                },
                success: (data) => {
                    this.initTypes(data);
                    this.init3d();
                },
            });
        },
        init3d() {
            initDevice3dScene(scene, controls, camera, MouseIntesectArray);
            // 设备三维模型交互
            initListener(this, scene);
        },
        changeTunnel(val){
            this.selectTunnel = val;
            let url = location.href.substring(0, location.href.indexOf('.html') + 5);
            location.href = `${url}?areaId=${this.selectTunnel}`;
        },
        queryTunnels() {
            //
            $.ajax({
                url: `${urlPrefix}officearea/GetAllOfficeArea`,
                type: "get",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(
                        "Authorization",
                        localStorage.getItem("token") || token
                    );
                },
                success: (data) => {
                    data = JSON.parse(data);
                    data.forEach((item) => {
                        item.value = item.Id;
                        item.label = item.Name;
                    });

                    this.tunnelOptions = data;
                    if (this.tunnelOptions.length > 0) {
                        let areaId = getUrlParam("areaId");
                        if(areaId){
                            let target = this.tunnelOptions.find(i => i.value == areaId);
                            if(target){
                                this.selectTunnel = target.value;
                            }
                        }else{
                            this.selectTunnel = this.tunnelOptions[1].value;
                        }

                       
                        // // 设备类型
                        this.queryTypes(this.selectTunnel);
                        // 液位
                        this.queryDevice(
                            this.selectTunnel,
                            "A.C.A.A.A",
                            (devices) => {
                                addWaterPool(devices);
                            }
                        );
                        // 水压
                        this.queryDevice(
                            this.selectTunnel,
                            "A.C.E.B.A",
                            (devices) => {
                                initPresureDevice(devices);
                            }
                        );
                    }
                },
            });
        },
        checkType(item) {
            item.active = !item.active;
            if (item.active) {
                this.selectedMenus.push({
                    deviceType: item.visualTemplate,
                    available: true,
                    control: false,
                    count: item.assestPointNum,
                });
            } else {
                this.selectedMenus = this.selectedMenus.filter(
                    (i) => i.deviceType != item.visualTemplate
                );
            }
            this.flushMenusChange();
        },
        initTypes(types) {
            // 初始化类型列表中的count
            this.deviceMenu.forEach((i) => {
                i.subItems.forEach((item) => {
                    let target = types.find(
                        (i) => i.visualTemplate == item.deviceType
                    );
                    if (target) {
                        item.count = target.assestPointNum;
                        item.deviceList = target.deviceList;
                    } else {
                        item.count = 0;
                        item.deviceList = [];
                    }
                    this.chooseMenu(item);
                });
            });

            let all = 0;
            types.forEach((item) => {
                item.active = true;
                item.icon = "";

                // 总数
                all += item.assestPointNum;

                item.icon = templates.find(
                    (i) => i.name == item.visualTemplate
                ).icon_vector;
                // 处理本地启动时图标展示问题
                // if (window.location.hostname == "localhost") {
                //     item.icon = "http://localhost:4500" + item.icon;
                // }
            });
            this.types = types;
            this.assetsToalNum = all;
        },
        changeSelectedMenu(value) {
            this.selectedMenu = this.selectedMenus[value];
        },
        inMenu(menu) {
            return this.selectedMenus.indexOf(menu) >= 0;
        },

        chooseMenu(menu) {
            if (this.inMenu(menu)) {
                //反选
                this.selectedMenus = this.selectedMenus.filter(
                    (m) => m != menu
                );
                this.flushMenusChange();
                this.selectedMenu =
                    this.selectedMenus[this.selectedMenus.length - 1];
            } else {
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
                    this.selectedMenu4Device.push({
                        value: i,
                        label: this.selectedMenus[i].name,
                    });
                }

                if (!this.inMenu(this.selectedMenu)) {
                    this.selectedMenu =
                        this.selectedMenus[this.selectedMenu4DeviceIndex];
                } else {
                    this.selectedMenu4DeviceIndex =
                        this.selectedMenus.indexOf(this.selectedMenu) + "";
                }
            }

            this.channel.postMessage({
                type: DEVICE_MENU_SELECTED_CHANGED,
                // selectedTypes: this.selectedMenus.map((e) => e.deviceType),
                selectedTypes: this.selectedMenus,
            });
        },

        setMenu(menu) {
            if (!this.inMenu(menu)) {
                this.selectedMenus.push(menu);
                this.flushMenusChange();
            }

            this.selectedMenu = menu;
        },

        chooseDevice(device) {
            if (this.selectedDevice == device) {
                return;
            }

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
                deviceNum: device.deviceNum,
                id: device.id,
                iotStatus: device.iotStatus,
            });

            this.selectedDevice = device;
            this.selectedAlarm = null;
        },
        showVideo(url) {
            this.videoUrl = url;
        },

        chooseAlarm(alarm) {
            if (this.selectedAlarm == alarm) {
                return;
            }

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
            });
        },

        deviceListScroll2Target(device) {
            return;
            //找到选中元素所在位置
            const index = this.deviceList.findIndex(
                (d) => d.name == device.name
            );
            const container = this.$refs.deviceList.children[index];
            if (container) {
                // 滚动到目标元素
                container.scrollIntoView({ behavior: "smooth" });
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
        startTrip() {
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
            })();
        },
        pauseTrip() {
            this.pausing = true;
        },
        continueTrip() {
            this.pausing = false;
        },
        endTrip() {
            this.onTrip = false;
            this.pausing = false;
        },
    },
});

window.app = app;
