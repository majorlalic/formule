/**
 * 事件名称
 * @enum
 * @readonly
 */
export const LAYOUT_EVENTS = {
    PopWin: "popWin", // 根据url弹窗
    CloseWin: "closeWin", // 关闭弹窗
    NoticeNumChange: "noticeNumChange", // 通知数字变更
    Message: "message", // 消息提示
    ShowLinkagePreview: "showLinkagePreview", // 打开摄像头实时预览
    HideLinkagePreview: "hideLinkagePreview", // 关闭实时预览
    ShowLinkageBackPlay: "showLinkageBackPlay", // 打开视频回放
    HideLinkageBackPlay: "hideLinkageBackPlay", // 关闭视频回放

    RealTimePreview: "showRealPlayerPreviewModule", // 显示实时预览界面
    VideoPlayback: "showRealPlayerBackPlayModule", // 显示录像回放界面
    RealPlayerPolling: "showRealPlayerPollingModule", // 视频轮询窗口
    HideRealPlayer: "hideRealPlayerModule", // 隐藏视频界面(实时预览,录像回放共用的弹窗)

    VideoWndActivated: "videoWndActivated",
    VideoWndDeactivated: "videoWndDeactivated",

    VideoServerReady: "videoServerReady", // 视频程序已启动

    SingleRealTimePreview: "showSingleRealPlayerRealPlaying", // 弹出单个实时预览窗口
    SingleVideoPlayback: "showSingleRealPlayerBackPlaying" // 弹出单个录像回放窗口
};

/**
 * 事件名称
 * @enum
 * @readonly
 */
export const EVENT_NAMES = {
    NoticeNumChange: "noticeNumChange", // 消息数变化通知
};
