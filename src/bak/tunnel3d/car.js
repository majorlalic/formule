import * as THREE from "three";
import { GLTFLoader } from '../dep/three/examples/jsm/loaders/GLTFLoader.js';

import { moveTo as CarMoveTo } from "./car_move.js";

import { addWave, removeWave } from "./car_lib_wave.js";

import { TUNNEL_CHANNEL_NAME, CAR_LIST_CHANGE } from "./tunnel3d_const.js";
import { cancelFollow, followCar } from "./car_lib_camera_follow.js";
import { addCphMarker, removeCphMarker } from "./car_lib_cphmarker.js";
import MiniMap from "./mini_map.js";

const tunnelChannel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);

// 车辆实例组
let carGroup = new THREE.Group();
carGroup.name = "car_group";

// 车辆实例，key: carId,  value: THTEE.Object3d
let carInst = {};

let camera, controls, scene, renderer, leftTransMil2Pixel, rightTransMil2Pixel, carListVue;

function init(_camera, _controls, _scene, _renderer, _leftTransMil2Pixel, _rightTransMil2Pixel, containerId) {
    camera = _camera;
    controls = _controls;
    scene = _scene;
    renderer = _renderer;
    leftTransMil2Pixel = _leftTransMil2Pixel; 
    rightTransMil2Pixel = _rightTransMil2Pixel;

    scene.add(carGroup);

    if (containerId) {
        carListVue = bindVue(containerId);
    }

    return carGroup;
}

function bindVue(containerId) {
    
    return new Vue({
        el: "#" + containerId,
        data() {
            return {
                // [{id, label}]
                carList: [],

                selectedCar: {}
            }
        },
        mounted() {
            tunnelChannel.addEventListener("message", (e)=> {
                if (e.type == CAR_LIST_CHANGE) {
                    this.updateCarList(e.carList);
                }
            })
        },
        methods: {
            carClick(item) {
                this.selectedCar = item;
                let obj = carInst[item.id];

                carClick(obj);
                
            },
            updateCarList(list) {
                this.carList = list;
            }
        }
    })
}

const carFrontDom = document.getElementById("car_front");
const carBackDom = document.getElementById("car_back");
let selectedCar, carFrontMiniMap, carBackMiniMap;

function carClick(car) {

    if (selectedCar) {
        cancelCarSelect();
    }

    selectedCar = car;

    // 定位到车的位置并且随动
    followCar(car, camera, controls);

    // 生成波纹
    addWave(car);

    // 添加maker
    addCphMarker(car);

    // 添加视图
    carFrontDom.style.display = "block";
    if (!carFrontMiniMap) {
        carFrontMiniMap = new MiniMap(scene, carFrontDom, car.position, new THREE.Vector3(-30, 50, 0))
    }
    carFrontMiniMap.setTargetPosition(car.position);


    carBackDom.style.display = "block";
    if(!carBackMiniMap) {
        carBackMiniMap = new MiniMap(scene, carBackDom, car.position, new THREE.Vector3(30, 50, 0));
    }
    carBackMiniMap.setTargetPosition(car.position);
    

    document.addEventListener('contextmenu', cancelCarSelect);
}

function cancelCarSelect() {


    cancelFollow();
    removeWave(selectedCar);

    removeCphMarker(selectedCar);

    carFrontDom.style.display = "none";
    carBackDom.style.display = "none";

    selectedCar = null;
    document.removeEventListener('contextmenu', cancelCarSelect);
}


function isLeft(direction) {
    return direction == 0;
}

/**
 * 
 * let data = 
 * [{
            Id: carId++,
            IsNew: true,
            WN: getRandomFromArr(LANES),
            MIL: getRandomFromRanges(MILS),
            Speed: 24.0,
            UpdateTime: "2022-05-04T14:38:18.8074613+08:00",
            Type: 0 | 1,
            Direction: 0 | 1,
    }]
 */
function updateCars(data, updateTimeDelta = 0) {

    //标记已有的车是否消失
    let carExist = {};
    for (let key in carInst) {
        carExist[key] = false;
    }


    data.forEach(e => {
        if (e.IsNew) {
            // 新增
            addCar(e);
        } else {
            // 更新车辆
            carExist[e.Id] = true;
            updateCar(e, updateTimeDelta);
        }
    })

    // 去除消失的车辆
    for (let id in carExist) {
        if (!carExist[id]) {
            carInst[id].removeFromParent();
            delete carInst[id];
        }
    }

    let carList = [];
    for (let id in carInst) {
        carList.push({
            id: id,
            label: carInst[id].name
        })
    }

    tunnelChannel.postMessage({ type: CAR_LIST_CHANGE, carList: carList });

}
/**
 * 
 * {
        Id: carId++,
        IsNew: true,
        WN: getRandomFromArr(LANES),
        MIL: getRandomFromRanges(MILS),
        Speed: 24.0,
        UpdateTime: "2022-05-04T14:38:18.8074613+08:00",
        Type: 0,
        Direction: 0,
    }
 */

function updateCar(info, updateTimeDelta) {
    const car = carInst[info.Id];
    if (car) {
        car._targetMovePosition = car._targetMovePosition || new THREE.Vector3();
        car._lastInfo = info;

        if (isLeft(info.Direction)) {
            leftTransMil2Pixel(info.WN, info.MIL, car._targetMovePosition);
        }else {
            rightTransMil2Pixel(info.WN, info.MIL, car._targetMovePosition);
        }

        CarMoveTo(car, car._targetMovePosition, updateTimeDelta);
        setTimeout( ()=> {
            car.visible = true;
        }, 60)

    }

}


/**
 * 
 * {
        Id: 1,
        IsNew: true,
        WN: getRandomFromArr(LANES),
        MIL: getRandomFromRanges(MILS),
        Speed: 24.0,
        UpdateTime: "2022-05-04T14:38:18.8074613+08:00",
        Type: 0,
        Direction: 0,
    }
 */
function addCar(info) {

    CarModel.getInst(info.Type, (car) => {

        if (isLeft(info.Direction) ){
            leftTransMil2Pixel(info.WN, info.MIL, car.position);

        }else {
            rightTransMil2Pixel(info.WN, info.MIL, car.position);
        }

        car.name = info.CarNo;
        car.CarId = info.Id;
        carGroup.add(car);

        car.visible = false;
        carInst[info.Id] = car;

    });

}

const loader = new GLTFLoader();
// 车模型，  key: carType,  value: THTEE.Object3d
const carsTemplate = {};
const CarModel = {

    // 回调参数：inst;
    getInst(carType, callback) {

        if (carsTemplate[carType] === true) {
            setTimeout(() => { CarModel.getInst(carType, callback); }, 500);
            return;
        }
        if (carsTemplate[carType]) {

            callback(carsTemplate[carType].clone());

        } else {
            carsTemplate[carType] = true;
            loader.load(`./tunnel3d/models/${carType}/scene.gltf`, function (gltf) {

                let obj = gltf.scene;
                obj = CarModel.wrapAndAdopter(carType, obj);
                obj.name = carType;

                carsTemplate[carType] = obj;
                callback(obj.clone());

            });
        }

    },

    /**
     * 大小适配，旋转模板到以【z轴】为正方向
     */
    wrapAndAdopter(type, obj) {
        if (type == "0") {
            obj.rotateY(Math.PI / 2);
            obj.position.y = 0;
        }

        if (type == "1") {

            obj = obj.getObjectByName("Object_2");
            obj.geometry.center();
            obj.geometry.rotateX(- Math.PI / 2);
            obj.geometry.rotateY(Math.PI);
            obj.geometry.translate(0, 5, -5);
            obj.geometry.scale(0.2, 0.2, 0.1);
            obj.removeFromParent();
        }


        let c = new THREE.Group();
        c.add(obj);
        c.name = type;

        return c;
    }
}



export { init, updateCars }