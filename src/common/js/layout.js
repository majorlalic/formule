import EventBusWorker, { LAYOUT_EVENTS, SCREEN_NAMES } from "/common/js/eventBus/eventBusWorker.js";

/**
 * 托盘服务
 * 通过eventBus将托盘操作请求发送到localServer
 */
export class Layout {
    constructor() {
        if (Layout.instance) {
            return Layout.instance;
        } else {
            const eventBus = EventBusWorker.getInstance(SCREEN_NAMES.Gis);
            this._eventBus = eventBus;
            Layout.instance = this;
        }
    }

    /**
     * 弹窗
     * @param {PopWinParam} param
     */
    popWin(param) {
        this._eventBus.postMessage(LAYOUT_EVENTS.PopWin, param);
    }

    /**
     * 弹窗关闭
     */
    closeWin() {
        this._eventBus.postMessage(LAYOUT_EVENTS.CloseWin, null);
    }

    /**
     * 通知数字变化
     * @param {Number} num
     */
    noticeNumChange(param) {
        this._eventBus.postMessage(LAYOUT_EVENTS.NoticeNumChange, num);
    }

    /**
     * 语音播报
     * @param {MessageParam} param
     */
    message(param) {
        this._eventBus.postMessage(LAYOUT_EVENTS.Message, param);
    }

    /**
     * 打开实时预览
     * @param {RealTimeParam} realTimeParam
     */
    showLinkagePreview = (realTimeParam) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.ShowLinkagePreview, realTimeParam);
    };

    /**
     * 关闭实时预览
     */
    hideLinkagePreview = () => {
        this._eventBus.postMessage(LAYOUT_EVENTS.HideLinkagePreview, {});
    };

    /**
     * 打开视频回放
     * @param { PlayBackParam } playBackParam
     */
    showLinkageBackPlay = (playBackParam) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.ShowLinkageBackPlay, playBackParam);
    };

    /**
     * 关闭实时回放
     * @param {Bounds} bounds 上左右下的边距
     */
    hideLinkageBackPlay = () => {
        this._eventBus.postMessage(LAYOUT_EVENTS.HideLinkageBackPlay, {});
    };

    /**
     * 关闭实时回放
     * @param {Bounds} bounds 上左右下的边距
     */
    realTimePreview = (bounds) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.RealTimePreview, bounds);
    };

    /**
     * 关闭实时回放
     * @param {Bounds} bounds 上左右下的边距
     */
    videoPlayback = (bounds) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.VideoPlayback, bounds);
    };

    /**
     * 显示实时预览界面
     * @param {Bounds} bounds 上左右下的边距
     */
    realPlayerPolling = (bounds) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.RealPlayerPolling, bounds);
    };

    /**
     * 隐藏视频界面(实时预览,录像回放共用的弹窗)
     */
    hideRealPlayer = () => {
        this._eventBus.postMessage(LAYOUT_EVENTS.HideRealPlayer, {});
    };

    /**
     * 弹出单个实时预览窗口
     * @param {String} title 摄像头名称
     * @param {String} deviceId 摄像头id
     */
    singleRealTimePreview = (title, deviceId) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.SingleRealTimePreview, title, deviceId);
    };

    /**
     * 弹出单个录像回放窗口
     * @param {String} title 摄像头名称
     * @param {String} deviceId 摄像头id
     */
    singleRealTimePreview = (title, deviceId) => {
        this._eventBus.postMessage(LAYOUT_EVENTS.SingleRealTimePreview, title, deviceId);
    };
}

export default new Layout();

export class PopWinParam {
    constructor(url, width, height, param) {
        this.url = url;
        this.width = width;
        this.height = height;
        this.param = param;
    }
}

class MessageParam {
    constructor(type, content) {
        this.type = type;
        this.content = content;
    }
}

export class Bounds {
    constructor(topOffset, leftOffset, width, height) {
        this.TopOffset = topOffset;
        this.LeftOffset = leftOffset;
        this.Width = width;
        this.Height = height;
    }
}

class CameraInfo {
    constructor(name, cameraId, presetNumer) {
        this.Name = name;
        this.CameraId = cameraId;
        this.PresetNumer = presetNumer;
    }
}

/**
 * 实时预览
 */
export class RealTimeParam {
    /**
     * @param{Bounds} bounds
     * @param{Array<CameraInfo>} cameraList
     */
    constructor(bounds, cameraList) {
        this.CameraLinkageInfos = cameraList;
        this.Bounds = bounds;
    }
}

/**
 * 回放
 */
export class PlayBackParam {
    /**
     * @param{Bounds} bounds
     * @param{Array<CameraInfo>} cameraList
     * @param{String} alarmDateTime
     */
    constructor(bounds, cameraList, alarmDateTime) {
        this.CameraLinkageInfos = cameraList;
        this.Bounds = bounds;
        this.alarmDateTime = alarmDateTime;
    }
}
