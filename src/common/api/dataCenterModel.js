import { AlarmSystem } from "../js/const.js";

export class AlarmPageParam {
    /**
     * 设备列表分页参数
     * @param {Number} pageNumber 页数
     * @param {Number} pageSize 分页大小
     * @param {AlarmSystem} systemId 系统分类
     * @param {Number} orgId 机构id
     * @param {String} keyword 关键词
     * @param {Date} startTime 开始时间
     * @param {Date} endTime 结束时间
     * @param {String} status 警情状态
     */
    constructor(
        pageNumber = 1,
        pageSize = 10,
        systemId = AlarmSystem.BOUNDARY,
        orgId = "",
        keyword = "",
        startTime = "",
        endTime = "",
        status = ""
    ) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.systemId = systemId;
        this.orgId = orgId;
        this.keyword = keyword;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }
}

export class PlatformPageParam {
    /**
     * 设备列表分页参数
     * @param {Number} pageNumber 页数
     * @param {Number} pageSize 分页大小
     * @param {String} keyword 关键字
     * @param {String} orgId 机构id
     */
    constructor(pageNumber = 1, pageSize = 10, keyword = "", orgId = "") {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.keyword = keyword;
        this.orgId = orgId;
    }
}

export class DevicePageParam {
    /**
     * 设备列表分页参数
     * @param {Number} pageNumber 页数
     * @param {Number} pageSize 分页大小
     * @param {String} keyword 关键字
     * @param {String} orgId 机构id
     * @param {String} systemId 所属系统id
     */
    constructor(pageNumber = 1, pageSize = 10, keyword = "", orgId = "", systemId = "") {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.keyword = keyword;
        this.orgId = orgId;
        this.systemId = systemId;
    }
}

export class VisitorPageParam {
    /**
     * 人员出入记录分页参数
     * @param {*} pageNumber 页数
     * @param {*} pageSize 分页大小
     * @param {*} cardNum 卡号
     * @param {*} orgId 机构Id
     * @param {*} name 人员姓名
     * @param {*} phoneNum 电话号码
     * @param {*} position 设备位置
     * @param {*} type 进出类型
     * @param {*} visitorType 人员类型
     * @param {*} starTime 事件开始时间
     * @param {*} endTime 事件结束时间
     */
    constructor(pageNumber = 1, pageSize = 10, cardNum = null, orgId = null, name = null, phoneNum = null, position = null, type = undefined, visitorType = undefined, startTime = null, endTime = null) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.cardNum = cardNum;
        this.orgId = orgId;
        this.name = name;
        this.phoneNum = phoneNum;
        this.position = position;
        this.type = type;
        this.visitorType = visitorType;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

export class SyncPageParam {
    /**
     * 人员出入记录分页参数
     * @param {*} pageNumber 页数
     * @param {*} pageSize 分页大小
     * @param {String} type 同步类型
     * @param {String} orgId 机构id
     * @param {*} startTime 事件开始时间
     * @param {*} endTime 事件结束时间
     */
    constructor(pageNumber = 1, pageSize = 10, orgId = null, type = null, startTime = null, endTime = null) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.orgId = orgId;
        this.type = type;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
export class ScorePageParam {
    /**
     * 人员出入记录分页参数
     * @param {*} pageNumber 页数
     * @param {*} pageSize 分页大小
     * @param {String} orgId 机构id
     * @param {*} startTime 事件开始时间
     * @param {*} endTime 事件结束时间
     */
    constructor(pageNumber = 1, pageSize = 10, orgId = null, startTime = null, endTime = null) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.orgId = orgId;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
