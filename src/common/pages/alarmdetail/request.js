import dataCenterApi from "../../api/dataCenterApi.js";
import { getConfByPlatformId, httpGet, httpPost, CONF_NAMES } from "../../js/platform.js";

export const getAlarmInfo = (platformId, alarmId) => {
    return new Promise((resolve, reject) => {
        // 获取警情信息的url
        getConfByPlatformId(platformId, CONF_NAMES.getAlarmInfo)
            .then((url) => {
                url = url.replace("${id}", alarmId);
                // 发起请求
                return httpGet(platformId, url);
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

/**
 * 处警
 * @param {*} platformId 
 * @param {*} alarmId 
 * @param {*} isFalseAlarm 
 * @param {*} message 
 * @returns 
 */
export const handleAlarm = (platformId, alarmId, isFalseAlarm, message) => {
    return new Promise((resolve, reject) => {
        // 1.获取警情信息的url
        getConfByPlatformId(platformId, CONF_NAMES.handleAlarm)
            .then((url) => {
                let param = {
                    alarmIds: alarmId,
                    isFalseAlarm,
                    message
                }
                // 2.发起请求
                return httpPost(platformId, url, param);
            })
            .then((data) => {
                // 3.中心平台修改警情状态为已处警，使未处警信息查询不到该条记录
                return dataCenterApi.handleAlarmPre(alarmId);
            })
            .then((data) => {
                if(data == 1){
                    resolve();
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
}

