import http from "../../common/js/http.js";
import { getServerUrl } from "../../common/js/utils.js";
import { SERVERS } from "../../common/js/const.js";
import {
    PlatformPageParam,
    AlarmPageParam,
    SyncPageParam,
    ScorePageParam,
    DevicePageParam,
} from "./dataCenterModel.js";

class DataCenterApi {
    constructor() {
        this._urlPrefix = getServerUrl(SERVERS.DATACENTER);
        // this._urlPrefix = "http://localhost:4702/"
    }

    /**
     * 查询字典表
     */
    queryDirs = () => {
        return http.get(`${this._urlPrefix}wutos/datacenter/dir/list`);
    };

    /**
     * 分页查询字典表
     */
    queryDirPage = (param) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/dir/page`, param);
    };

    /**
     * 根据类型查询所有
     * @param {String} type 字典类型
     * @returns
     */
    queryDirByType = (type) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/dir/getTypeList?type=` + type);
    };

    /**
     * 保存字典
     */
    saveDir = (dir) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/dir/save`, dir);
    };

    /**
     * 修改字典
     * @param {Object} dir
     */
    updateDir = (dir) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/dir/update`, dir);
    };

    /**
     * 删除字典
     * @param {String} dirId
     */
    deleteDir = (dirId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/dir/remove/${dirId}`);
    };

    /**
     * 查询机构树
     * @returns
     */
    queryOrgTree = () => {
        return http.get(`${this._urlPrefix}wutos/datacenter/org/orgBuildTree`);
    };

    /**
     * 查询事件树
     * @returns
     */
    queryEventTree = () => {
        return http.get(`${this._urlPrefix}eventtype/eventBuildTree`);
    };

    /**
     * 保存机构
     */
    saveOrg = (org) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/org/save`, org);
    };

    /**
     * 修改机构
     * @param {Object} org
     */
    updateOrg = (org) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/org/update`, org);
    };

    /**
     * 删除机构
     * @param {String} orgId
     */
    deleteOrg = (orgId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/org/remove/${orgId}`);
    };

    /**
     * 向上移动机构
     */
    moveUpOrg = (orgId) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/org/sort?id=${orgId}&direction=up`);
    };

    /**
     * 向下移动机构
     */
    moveDownOrg = (orgId) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/org/sort?id=${orgId}&direction=down`);
    };

    /**
     * 平台分页查询
     * @param {PlatformPageParam} param
     * @returns
     */
    queryPlatform = (param = new PlatformPageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/platform/page`, param);
    };

    savePlatform = (platform) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/platform/save`, platform);
    };

    savePlatformConf = (platformconf) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/platformconf/save`, platformconf);
    };

    updatePlatform = (platform) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/platform/update`, platform);
    };

    deletePlatform = (platformId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/platform/remove/${platformId}`);
    };

    queryPlatformById = (platformId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/platform/getInfo/${platformId}`);
    };

    /**
     * 警情分页查询
     * @param {AlarmPageParam} param
     * @returns
     */
    queryAlarm = (param = new AlarmPageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/alarm/page`, param);
    };

    getUnHandleAlarm = (param) => {
        this._urlPrefix = getServerUrl(SERVERS.DATACENTER);
        console.log("getUnHandleAlarm", this._urlPrefix);

        return http.post(`${this._urlPrefix}wutos/datacenter/alarm/getUnHandlePage`, param);
    };

    /**
     * 根据警情id获取告警文书
     * @param {String} id
     */
    getListByAlarmId = (id) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/alarmlog/getListByAlarmId/${id}`);
    };

    /**
     * 数据同步分页查询
     * @param {SyncPageParam} param
     * @returns
     */
    querySync = (param = new SyncPageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/sync/page`, param);
    };

    /**
     * 评分分页查询
     * @param {ScorePageParam} param
     * @returns
     */
    queryScorePage = (param = new ScorePageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/score/page`, param);
    };

    /**
     * 设备分页查询
     * @param {DevicePageParam} param
     * @returns
     */
    queryDevice = (param = new DevicePageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/device/page`, param);
    };

    /**
     * 设备状态查询
     * @param {DevicePageParam} param
     * @returns
     */
    deviceStatus = (param = new DevicePageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/device/getListCount`, param);
    };
    /**
     * 查询警情统计
     * @param {AlarmPageParam} param
     */
    getAlarmStatusCount = (param = new AlarmPageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/alarm/getAlarmStatusCount`, param);
    };

    queryVisitor = (param = new VisitorPageParam()) => {
        return http.post(`${this._urlPrefix}wutos/datacenter/visitor/page`, param);
    };

    /**
     * 根据机构id查询接入设备统计信息
     * @param {String} orgId
     */
    getDeviceCountByOrg = (orgId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/device/deviceCountByOrg?id=${orgId}`);
    };

    /**
     * 获取该机构下所有场站的评分
     * @param {String} orgId
     */
    getCardData = (orgId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/device/getDeviceStatusAndAlarm?id=${orgId}`);
    };

    /**
     * 生成该机构评分
     * @param {String} orgId
     */
    getScore = (orgId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/score/getScore?id=${orgId}`);
    };

    // 数据统计接口
    // 告警统计
    alarmStatistics = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/alarmStatistics?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 告警设备统计
    deviceAndAlarm = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/deviceAndAlarm?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 报警趋势分析
    alarmTrendAnalysis = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/alarmTrendAnalysis?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 设备类型统计
    percentageOfDeviceTypes = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/PercentageOfDeviceTypes?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };
    // 设备状态统计
    deviceStatusStatistics = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/deviceStatusStatistics?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 消防 设备状态统计
    deviceOnlineAndOfflineStatistics = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/deviceOnlineAndOfflineStatistics?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 消防报警类型占比
    proportionOfAlarmTypes = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/proportionOfAlarmTypes?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 今日人员出入情况统计
    personnelInAndOut = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/personnelInAndOut?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 泄漏设备异常状态频次
    deviceAbnormalFrequency = ({ systemId, orgId, startTime, endTime }) => {
        return http.get(
            `${this._urlPrefix}wutos/datacenter/datastatistics/deviceAbnormalFrequency?systemId=${systemId}&orgId=${orgId}&startTime=${startTime}&endTime=${endTime}&`
        );
    };

    // 获取该机构最新的评分情况
    getNewestScore = (id) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/score/getNewestScore?id=${id}`);
    };

    /**
     * 设备总览
     * @param orgId
     * @returns {Promise | Promise<unknown>}
     */
    deviceCount = ({ orgId }) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/deviceCount?orgId=${orgId}`);
    };

    /**
     * 告警处置
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    alarmDisposition = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/alarmDisposition?${params.toString()}`);
    };

    /**
     * 告警频发
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    alarmFrequent = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({});
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        if (orgId) params.append("orgId", orgId);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/alarmFrequent?${params.toString()}`);
    };

    /**
     * 警情占比
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    alarmProportion = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/alarmProportion?${params.toString()}`);
    };

    /**
     * 区域警情
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    areaAlarm = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/areaAlarm?${params.toString()}`);
    };

    /**
     * 人员出入
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    visitor = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/visitor?${params.toString()}`);
    };

    /**
     * 接入设备
     * @param orgId
     * @returns {Promise | Promise<unknown>}
     */
    accessDevice = ({ orgId }) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/accessDevice?orgId=${orgId}`);
    };

    /**
     * 运维告警
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    opsAlarm = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/opsAlarm?${params.toString()}`);
    };

    /**
     * 最新告警
     * @param orgId
     * @param startTime
     * @param endTime
     * @returns {Promise | Promise<unknown>}
     */
    newestAlarm = ({ orgId, startTime, endTime }) => {
        const params = new URLSearchParams({ orgId });
        if (startTime) params.append("startTime", startTime);
        if (endTime) params.append("endTime", endTime);
        return http.get(`${this._urlPrefix}wutos/datacenter/overview/newestAlarm?${params.toString()}`);
    };

    /**
     * 根据角色id获取对应的权限
     * @param {Number} roleId
     * @returns
     */
    getAreaAuthByRoleId = (roleId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/auth/getAreaAuthByRoleId?roleId=${roleId}`);
    };

    /**
     * 保存角色权限
     * @param {Number} roleId
     * @param {Array<{areaId,type}>} data
     * @returns
     */
    saveAreaAuth = (roleId, data) => {
        var params = {
            roleId,
            list: data,
        };
        return http.post(`${this._urlPrefix}wutos/datacenter/auth/saveAreaAuth`, params);
    };
    /**
     * 保存角色事件权限
     * @param {Number} roleId
     * @param {Array<{eventId,type}>} data
     * @returns
     */
    saveEventAuth = (roleId, data) => {
        var params = {
            roleId,
            list: data,
        };
        return http.post(`${this._urlPrefix}wutos/datacenter/auth/event/saveEventAuth`, params);
    };

    /**
     * 修改警情状态为已处警，使未处警信息查询不到该条记录
     * @param {String} alarmId
     * @returns
     */
    handleAlarmPre = (alarmId) => {
        return http.get(`${this._urlPrefix}wutos/datacenter/alarm/handleAlarmPre?id=${alarmId}`);
    };

    /**
     * 根据角色id获取对应的权限
     * @param {Number} roleId
     * @returns
     */
    getEventAuthByRoleId(roleId) {
        return http.get(`${this._urlPrefix}wutos/datacenter/auth/event/getEventAuthByRoleId?roleId=${roleId}`);
    }
}

export default new DataCenterApi();
