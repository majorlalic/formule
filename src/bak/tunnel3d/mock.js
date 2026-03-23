import { getRandomFromArr, getRandomFromRanges, randomCph } from "./util.js";

// 车总数
const COUNT = 100;
// 车距离
const DISTANCE = 10;
// 车道范围
const LANES = [0, 1, 2, 3];
// 里程范围
const MILS = [
	[1, 8600]
];
// 变道可能性
const probability = 0.2;
// 模拟车辆
let cars = [];
// 车辆id, 用于模拟数据的自增车辆id
let carId = 1;
// 每帧的时间间隔
const frameDelay = 500;

export class MockCarData {
	constructor(receiveDataFunc) {
        this.mockCarData(true, receiveDataFunc);
	}

    getNextLane(lanes, lane) {
        // 概率变道
        if (Math.random() <= probability) {
            let index = lanes.findIndex(i => i == lane);
            if (index == 0) {
                return ++index;
            } else if (index == lanes.length - 1) {
                return --index;
            } else {
                // 随机上下变道
                return Math.random() > 0.4 ? ++index : --index;
            }
        } else {
            // 保持车道不变
            return lane;
        }
    }

    getNextMil(mils, mil, distance, isLeft) {
        let res = -1;
        for (let i = 0; i < mils.length; i++) {
            let next = mil - distance;
            if(isLeft){
                next = mil + distance
            }
            if (next >= mils[i][0] && next <= mils[i][1]) {
                res = next;
            }
        }
        return res;
    }

    mockCarData(isInit = false, receiveDataFunc) {
        if (isInit) {
            for (let i = 0; i < COUNT; i++) {
                cars.push({
                    Id: carId++,
                    IsNew: true,
                    WN: getRandomFromArr(LANES),
                    MIL: getRandomFromRanges(MILS),
                    Speed: 24.0,
                    UpdateTime: "2022-05-04T14:38:18.8074613+08:00",
                    Type: Math.random() > 0.5? 0: 1,
                    Direction: Math.random() > 0.5 ? 0 : 1,
                    CarNo: randomCph()
                });
            }
        } else {
            // 移除超出里程的车, 更新车辆的里程和车道
            for (let i = 0; i < cars.length; i++) {
                const car = cars[i];
                let nextMil = this.getNextMil(MILS, car.MIL, DISTANCE, car.Direction);
                // 里程已无法推进, 移除该车 time to say goodbye
                if (nextMil == -1) {
                    // console.log(`### 移除车辆`);
                    cars.splice(i, 1);
                    continue;
                }

                // 标记为非新出现的车
                car.IsNew = false;
                // 车道变化
                car.WN = this.getNextLane(LANES, car.WN);
                // 里程变化
                car.MIL = nextMil;
                // 其他属性暂且不变
            }

            // 部分车辆移除后, 需添加车辆
            if (cars.length < COUNT) {
                // console.log(`### 添加了(${COUNT - cars.length})辆车`);
                for (let i = 0; i < COUNT - cars.length; i++) {
                    // 多个起点随机出发
                    cars.push({
                        Id: carId++,
                        IsNew: true,
                        WN: getRandomFromArr(LANES),
                        MIL: getRandomFromRanges(MILS),
                        Speed: 24.0,
                        UpdateTime: "2022-05-04T14:38:18.8074613+08:00",
                        Type: Math.random() > 0.5? 0: 1,
                        Direction: Math.random() > 0.5 ? 0 : 1,
                        CarNo: randomCph()
                    });
                }
            }
        }

        let data = {
            ZS: 7,
            ZX: 0,
            YS: 8,
            YX: 0,
            GTZ: 8,
            GTY: 7,
            GTZAvgSpeed: 24.0,
            GTYAvgSpeed: 26.285714285714285,
            Cars: cars,

            UpdateTimeDelta: frameDelay
        };

        receiveDataFunc(data);

        setTimeout(() => {
            this.mockCarData(false, receiveDataFunc);
        }, frameDelay);
    }
}