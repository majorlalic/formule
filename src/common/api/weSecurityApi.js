import http from "../../common/js/http.js";
import { getServerUrl } from "../../common/js/utils.js";
import { SERVERS } from "../../common/js/const.js";

class WeSecurityApi {
    constructor() {
        this._urlPrefix = getServerUrl(SERVERS.SECURITY);
        // this._urlPrefix = "http://10.11.2.85:5000/";
    }

    getAreaTree = () => {
        return http.get(`${this._urlPrefix}api/Area/GetChildNode`);
    }

    getListValue = (key) => {
        return http.get(`${this._urlPrefix}api/ListValue/GetListValue`, { list: key });
    };

    /**
     * 设备状态统计设备数量
     * @param {*} params 
     * @returns 
     */
    getDeviceCount = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetDeviceCount`, params);
    };

    /**
     * 设备状态分页数据
     * @param {*} params 
     * @returns 
     */
    getDevicePageData = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetDevicePageData`, params);
    };

    /**
     * 报警数量统计
     * @param {*} params 
     * @returns 
     */
    getAlarmStatusCount = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmStatusCount`, params);
    };

    /**
     * 报警分页数据
     * @param {*} params 
     * @returns 
     */
    getAlarmPageData = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmPageData`, params);
    };


    ///未处理告警
    GetUnHandleAlarmPageData = () => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmPageData?alarmStatus=0`);
    };

    getAlarmTrendAnalysis = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmTrendAnalysis`, params);
    };

    getDeviceTypesAnalysis = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetDeviceTypesAnalysis`, params);
    };

    getAlarmTimeAnalysis = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmTimeAnalysis`, params);
    };

    getAlarmTypesAnalysis = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmTypesAnalysis`, params);
    };

    getAccessCount = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAccessCount`, params);
    };

    getAccessTypesAnalysis = (params = new DataStatisticsParam()) => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAccessTypesAnalysis`, params);
    };

    getResult = (queryName) => {
        const formData = new FormData();
        formData.append('queryName', queryName);
        return http.post(`${this._urlPrefix}api/BusinessQuery/GetResult`, null, null, formData);
    }

    getUnHandleAlarmPageData = () => {
        return http.get(`${this._urlPrefix}api/DataStatistics/GetAlarmPageData?alarmStatus=0`);
    }

    getGisAlarmById = (id) => {
        return http.get(`${this._urlPrefix}api/Alarm/GetGisAlarmById?id=${id}`, null);
    };

    handleAlarm = (par) => {
        return http.post(`${this._urlPrefix}api/Alarm/Handle`, par);
    };
}

export default new WeSecurityApi();
