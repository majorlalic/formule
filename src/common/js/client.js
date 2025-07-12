import { ClientMsg, ClientConfig, Bounds, CameraLinkageInfo, ClientCache, AlarmPopView } from "./client-dep.js";
import { generateUUID } from "./utils.js";

/**
 * 给客户端容器发送消息
 * @param {String} messageName
 * @param {Object} messageContent
 * @param {Boolean} isContentStr 消息体是否为字符串(不需要序列化)
 */
const postMessage = (messageName, messageContent = "", isContentStr = false) => {
    if (window.top?.chrome?.webview) {
        console.log(messageName,messageContent,isContentStr);
        
        window.top.chrome.webview.postMessage(
            JSON.stringify({
                MessageName: messageName,
                MessageContent: isContentStr ? messageContent : JSON.stringify(messageContent),
            })
        );
    } else {
        console.log("未能检测到webview, 请检查使用环境");
    }
};

/**
 * 读取缓存数据
 * @param {String} messageId 唯一id, 用于接收时识别是否为本次请求
 * @param {Array<String>} keys 缓存项数组
 */
const readCacheItems = (messageId, keys) => {
    postMessage(ClientMsg.readCacheItems, {
        MessageId: messageId,
        Keys: keys,
    });
};

/**
 * 读取缓存数据
 * @param {String} messageId 唯一id, 用于接收时识别是否为本次请求
 */
const readLocalSettingItems = (messageId) => {
    postMessage(ClientMsg.readLocalSettingItems, {
        MessageId: messageId,
        Names: ClientConfig,
    });
};

/**
 * 向客户端写入缓存
 * @param {Array<ClientCache>} items
 */
const writeCacheItems = (items) => {
    let messageContent = {
        MessageId: generateUUID(),
        Items: items,
    };
    postMessage(ClientMsg.writeCacheItems, messageContent);
};

/**
 * 向客户端写入配置
 * @param {Array<ClientCache>} items
 */
const writeLocalSettingItems = (items) => {
    let messageContent = {
        MessageId: generateUUID(),
        Items: items,
    };
    postMessage(ClientMsg.writeLocalSettingItems, messageContent);
};

/**
 * 通知客户端关闭登录小窗, 打开大窗显示首页
 */
const loginSuccess = () => {
    clientLog("登录成功!");
    let items = [
        {
            key: "token",
            value: window.localStorage.getItem("token"),
            IsEncryptStored: false,
        },
        {
            key: "realPlayerServerAddress",
            value: window.localStorage.getItem("wscwebapi"),
            IsEncryptStored: false,
        },
    ];
    // 写入token和url供客户端使用
    writeCacheItems(items);

    //给客户端发送当前使用语言的消息
    postMessage(ClientMsg.initLanguage, { locale: window.localStorage.getItem("locale") });

    postMessage(ClientMsg.loginSuccess);
};

/**
 * 显示单个实时预览窗口
 * @param {String} Title 标题
 * @param {String} DeviceId 摄像机设备id
 */
const singleRealTimePreview = (Title = "实时预览", DeviceId) => {
    postMessage(ClientMsg.singleRealTimePreview, {
        Title,
        DeviceId,
    });
};

/**
 * 显示单个录像回放窗口
 * @param {String} Title 标题
 * @param {String} DeviceId 摄像机设备id
 */
const singleVideoPlayback = (Title = "录像回放", DeviceId) => {
    postMessage(ClientMsg.singleVideoPlayback, {
        Title,
        DeviceId,
    });
};

/**
 * 显示实时预览界面
 * @param {Bounds} bounds 上左右下的边距
 */
const realTimePreview = (bounds) => {
    postMessage(ClientMsg.realTimePreview, {
        bounds,
    });
};

/**
 * 显示视频轮询
 * @param {Bounds} bounds 上左右下的边距
 */
const realPlayerPolling = (bounds) => {
    postMessage(ClientMsg.realPlayerPolling, {
        bounds,
    });
};

/**
 * 显示录像回放界面
 * @param {Bounds} bounds 上左右下的边距
 */
const videoPlayback = (bounds) => {
    postMessage(ClientMsg.videoPlayback, {
        bounds,
    });
};

/**
 * 隐藏视频界面
 */
const hideRealPlayer = () => {
    postMessage(ClientMsg.hideRealPlayer);
};

/**
 * 在客户端记录日志 存在/weblog中
 * @param {String} content 内容
 */
const clientLog = (content) => {
    console.log(content);
    postMessage(ClientMsg.clientLog, content, true);
};

/**
 * 通知客户端登录页完成加载
 */
const loginReady = () => {
    postMessage(ClientMsg.loginReady);
};

/**
 * 弹出联动实时预览窗口
 * @param {Array<CameraLinkageInfo>} cameraLinkageInfo
 */
const showLinkagePreview = (cameraLinkageInfos) => {
    postMessage(ClientMsg.showLinkagePreview, {
        cameraLinkageInfos,
    });
};

/**
 * 初始化报警详情界面
 * @param {AlarmPopView} alarmPopViewAttr
 */
const initAlarmDetailsView = (alarmPopViewAttr) => {
    postMessage(ClientMsg.initAlarmDetailsView, alarmPopViewAttr);
};

/**
 * 显示报警详情界面
 */
const showAlarmDetailsView = () => {
    postMessage(ClientMsg.showAlarmDetailsView);
};

/**
 * 视频全屏
 */
const videoFullScreen = () => {
    postMessage(ClientMsg.videoFullScreen);
};

/**
 * 隐藏报警详情界面
 */
const hideAlarmDetailsView = () => {
    postMessage(ClientMsg.hideAlarmDetailsView);
};

/**
 * 设置报警详情页面联动实时预览参数
 * @param {Array<CameraLinkageInfo>} cameraLinkageInfo
 */
const setAlarmDetailsLinkagePreview = (cameraLinkageInfos) => {
    postMessage(ClientMsg.setAlarmDetailsLinkagePreview, {
        linkageInfos: cameraLinkageInfos,
    });
};

/**
 * 显示报警详情界面并设置联动实时预览参数
 * @param {Array<CameraLinkageInfo>} cameraLinkageInfo
 */
const setLinkagePreview = (cameraLinkageInfos) => {
    postMessage(ClientMsg.setLinkagePreview, {
        linkageInfos: cameraLinkageInfos,
    });
};
// 隐藏报警详情视频回放
const hideAlarmDetailsBackPlayPanel = ()=>{
    postMessage(ClientMsg.hideAlarmDetailsBackPlayPanel);
}
// 显示报警详情视频回放
const setBackPlayPanel = (cameraLinkageInfos,time) => {
    postMessage(ClientMsg.setBackPlayPanel,
        {
		linkageInfos: cameraLinkageInfos,
        alarmDateTime:  time,
	}
    );
};

/**
 * 隐藏报警详情界面并设置联动实时预览参数
 * @param {Array<CameraLinkageInfo>} cameraLinkageInfo
 */
const hideAlarmDetailsPreviewPanel = () => {
    postMessage(ClientMsg.hideAlarmDetailsPreviewPanel);
};

/**
 * 显示桌面
 */
const showDesktop = () => {
    postMessage(ClientMsg.showDesktop);
};

/**
 * 系统退出
 */
const systemExit = () => {
    postMessage(ClientMsg.systemExit);
};

/**
 * 返回到登录
 */
const backToLogin = () => {
    postMessage(ClientMsg.backToLogin);
};

/**
 * 触发报警音
 */
const triggerAlarmSound = () => {
    postMessage(ClientMsg.triggerAlarmSound);
};

/**
 * 停止当前报警音
 */
const stopAlarmSound = () => {
    postMessage(ClientMsg.stopAlarmSound);
};

/**
 * 报警音消音
 */
const silenceAlarmSound = () => {
    postMessage(ClientMsg.silenceAlarmSound);
};

/**
 * 初始化视频模块
 */
const initVideoModule = () => {
    postMessage(ClientMsg.initVideoModule);
}

/**
 * 通过本地默认程序打开指定路径
 * @param {String} url 完整url
 */
const openPathByExplorer = (url) => {
    postMessage(ClientMsg.openPathByExplorer, url);
};

/**
 * 通过本地默认程序打开指定路径
 * @param {String} alarmDateTimeStr yyyy-MM-dd HH:mm:ss
 * @param {Array<CameraLinkageInfo>} cameraLinkageInfo
 */
const showLinkageBackPlay = (alarmDateTime, cameraLinkageInfos) => {
    postMessage(ClientMsg.showLinkageBackPlay, {
        alarmDateTime,
        cameraLinkageInfos,
    });
};

export {
    showLinkagePreview,
    initAlarmDetailsView,
    showAlarmDetailsView,
    hideAlarmDetailsView,
    hideAlarmDetailsBackPlayPanel,
    setLinkagePreview,
    setAlarmDetailsLinkagePreview,
    readCacheItems,
    writeCacheItems,
    setBackPlayPanel,
    loginSuccess,
    singleRealTimePreview,
    singleVideoPlayback,
    realTimePreview,
    realPlayerPolling,
    videoPlayback,
    hideRealPlayer,
    clientLog,
    loginReady,
    showDesktop,
    systemExit,
    backToLogin,
    triggerAlarmSound,
    stopAlarmSound,
    silenceAlarmSound,
    readLocalSettingItems,
    writeLocalSettingItems,
    openPathByExplorer,
    showLinkageBackPlay,
    hideAlarmDetailsPreviewPanel,
    videoFullScreen,
    initVideoModule
};
