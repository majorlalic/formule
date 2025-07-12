import { Dir } from "./const.js";
import Storage from "./Storage.js";
import dataCenterApi from "/common/api/dataCenterApi.js";

/**
 * 根据key获取字典表
 * @param {Dir} key
 * @returns
 */
export const getDirByKey = (key) => {
    return new Promise((resolve, reject) => {
        let dirObj = Storage.get("dir");
        if (dirObj && dirObj.hasOwnProperty(key)) {
            resolve(dirObj[key]);
        } else {
            queryDirs().then((obj) => {
                if (obj.hasOwnProperty(key)) {
                    resolve(obj[key]);
                } else {
                    console.warn(`字典表不存在${key}, 请联系管理员`);
                }
            });
        }
    });
};

/**
 * 请求字典表
 */
export const queryDirs = () => {
    return new Promise((resolve, reject) => {
        dataCenterApi.queryDirs().then((data) => {
            // 对字典分类
            let dirObj = {};
            data.forEach((item) => {
                // 存在
                if (dirObj.hasOwnProperty(item.type)) {
                    dirObj[item.type].push({
                        key: item.key,
                        value: item.value,
                    });
                } else {
                    dirObj[item.type] = [
                        {
                            key: item.key,
                            value: item.value,
                        },
                    ];
                }
            });
            Storage.set("dir", dirObj);
            resolve(dirObj);
        });
    });
};
