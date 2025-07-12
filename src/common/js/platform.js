import http from "./http.js";
import Storage from "./Storage.js";
import { getToken } from "./utils.js";
import dataCenterApi from "../api/dataCenterApi.js";

const TokenExpire = 60 * 60 * 24; // 一天过期

/**
 * 根据平台id获取下级平台的token
 * @param {String} platformId 平台id
 * @returns
 */
export const getTokenByPlatformId = async (platformId) => {
    const url = await getConfByPlatformId(platformId, CONF_NAMES.exchangeToken);
    return new Promise((resolve, reject) => {
        let token = Storage.get(`token-${platformId}`);
        if (token) {
            resolve(token);
        } else {
            exchangeToken(url).then((data) => {
                if (data && data.length > 0) {
                    Storage.set(
                        `token-${platformId}`,
                        data[0].accessToken,
                        TokenExpire
                    );
                    resolve(data[0].accessToken);
                } else {
                    reject("未能获取到token,请联系管理员");
                }
            });
        }
    });
};

/**
 * 向下级平台换取token
 * @param {*} url
 * @returns
 */
export const exchangeToken = async (url) => {
    var token = getToken();
    if (token.indexOf("Bearer ") > -1) {
        token = token;
    }
    url = url.replace("${token}", token);
    return http.post(url, {});
};

/**
 * 请求子平台接口-get
 * @param {String} platformId 平台id
 * @param {String} url 请求路径
 * @returns
 */
export const httpGet = async (platformId, url) => {
    const token = await getTokenByPlatformId(platformId);
    return http.get(url, null, {
        Authorization: token,
    });
};

/**
 * 请求子平台接口-post
 * @param {String} platformId 平台id
 * @param {String} url 请求路径
 * @param {Object} params 请求参数
 * @returns
 */
export const httpPost = async (platformId, url, params) => {
    const token = await getTokenByPlatformId(platformId);
    return http.post(url, params, {
        Authorization: token,
    });
};

/**
 * 根据平台id获取配置
 * @param {String} platformId
 * @param {String} confName
 */
export const getConfByPlatformId = async (platformId, confName) => {
    return new Promise(async (resolve, reject) => {
        let platformCache = Storage.get(`conf-${platformId}`);
        let platform;
        if (platformCache) {
            platform = platformCache;
        } else {
            platform = await dataCenterApi.queryPlatformById(platformId);
            // 一小时过期
            Storage.set(`conf-${platformId}`, platform, 60 * 60);
        }
        if (platform && platform?.confs?.length > 0) {
            if (confName) {
                let target = platform.confs.find((i) => i.confName == confName);
                if (target) {
                    resolve(target.address);
                } else {
                    reject("未查询到相关平台配置，请联系管理员");
                }
            } else {
                resolve(platform.confs);
            }
        } else {
            reject("未查询到相关平台配置，请联系管理员");
        }
    });
};

/**
 * @enum
 * @readonly
 */
export const CONF_NAMES = {
    exchangeToken: "exchangeToken", // 换取token
    getAlarmInfo: "getAlarmInfo", // 查询警情详情
    autoSign: 'autoSign',// 自动登录
    redirectUrl: 'redirectUrl', // 跳转子平台地址
    handleAlarm: 'handleAlarm' // 处警
};
