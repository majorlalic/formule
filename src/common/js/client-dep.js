export const ClientConfig = [
    "IsOpenAlarmNotifySound", //
    "IsAutoAlarmPop", // 报警自动弹窗
];

// 客户端消息类型
export const ClientMsg = {
    readCacheItems: "readCacheItems", // 读缓存
    writeCacheItems: "writeCacheItems", // 写缓存
    loginSuccess: "loginSuccess", // 登录成功
    realTimePreview: "showRealPlayerPreviewModule", // 显示实时预览界面
    videoPlayback: "showRealPlayerBackPlayModule", // 显示录像回放界面
    singleRealTimePreview: "showSingleRealPlayerRealPlaying", // 弹出单个实时预览窗口
    singleVideoPlayback: "showSingleRealPlayerBackPlaying", // 弹出单个录像回放窗口
    realPlayerPolling: "showRealPlayerPollingModule", // 视频轮询窗口
    hideRealPlayer: "hideRealPlayerModule", // 隐藏视频界面(实时预览,录像回放共用的弹窗)
    clientLog: "webViewOutputLog", // 客户端日志
    loginReady: "loginLoadingCompleted", // 登录页完成加载
    showLinkagePreview: "showLinkagePreview", // 弹出联动实时预览窗口
    initAlarmDetailsView: "initAlarmDetailsView", // 初始化报警详情界面
    showAlarmDetailsView: "showAlarmDetailsView", // 显示报警详情界面
    videoFullScreen: "videoFullScreen", // 视频全屏
    hideAlarmDetailsView: "hideAlarmDetailsView", // 隐藏报警详情界面
    setLinkagePreview: "showAlarmDetailsViewAndSetLinkagePreview", // 显示报警详情界面并设置联动实时预览参数
    hideAlarmDetailsPreviewPanel:"hideAlarmDetailsPreviewPanel", // 隐藏报警详情界面中的联动实时预览窗口
    setBackPlayPanel:"showAlarmDetailsBackPlayViewAndSetLinkage",// 显示报警详情并设置联动实时视频回放
    hideAlarmDetailsBackPlayPanel:"hideAlarmDetailsBackPlayPanel", // 隐藏报警详情视频回放
    showDesktop: "showDesktop", // 显示桌面
    systemExit: "systemExit", // 退出系统
    backToLogin: "backToLogin", // 返回登录页
    triggerAlarmSound: "triggerAlarmSound", // 触发报警音
    stopAlarmSound: "stopAlarmSound", // 停止当前报警音
    silenceAlarmSound: "silenceAlarmSound", // 报警音消音
    readLocalSettingItems: "readLocalSettingItems", // 读取本地配置项
    writeLocalSettingItems: "writeLocalSettingItems", // 写入本地配置项
    openPathByExplorer: "openPathByExplorer", // 通过本地默认程序打开指定路径
    showLinkageBackPlay: "showLinkageBackPlay", // 弹出报警联动回放窗口
    setAlarmDetailsLinkagePreview: "setAlarmDetailsLinkagePreview", // 设置报警详情页面联动实时预览参数
    initLanguage: "initLanguage", //初始化语言
    initVideoModule: "initVideoModule", // 初始化视频模块
};

export class CameraLinkageInfo {
    name = "";
    cameraId = "";
    presetNumber = "";
}

// 边界定位
export class Bounds {
    topOffset = 0;
    leftOffset = 0;
    width = 0;
    height = 0;
}

// 客户端缓存dto
export class ClientCache {
    key = "";
    value = "";
    IsEncryptStored = false;
}

export class AlarmPopView {
    url = "";
    bounds = new Bounds();
    linkagePreviewBounds = new Bounds();
}

export class HandleAlarmParam {
    alarmIds = "";
    isFalseAlarm = true;
    message = "";
}
