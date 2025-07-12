import { getUrlParam } from "../js/utils.js";

const reconnectInterval = 5000; // 5秒重连一次
const maxRetries = 10; // 最大重试次数

class AlarmServer {
  constructor(url,callback) {
    this.socket = null;
    this.callback = callback;
    this.retryCount = 0;

    // 构造 WebSocket URL
    const userId = getUrlParam("userId");
    const roleIds = getUrlParam("roleIds");
    const wsUrl = `${url}?userId=${userId}&roleIds=${roleIds}`;
    this.init(wsUrl);
  }

  init(url) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket连接已建立");
      this.retryCount = 0; // 重连成功后重置重试次数
    };

    this.socket.onerror = error => {
      console.error("WebSocket错误:", error.message || error);
    };

    this.socket.onclose = event => {
      console.log("WebSocket连接已关闭:", event);
      if (!event.wasClean && this.retryCount < maxRetries) {
        this.retryCount++;
        console.log(`连接丢失，正在尝试重连... (尝试次数: ${this.retryCount})`);
        setTimeout(() => this.init(url), reconnectInterval); // 修复重连逻辑
      } else if (this.retryCount >= maxRetries) {
        console.log("已达到最大重试次数，停止重连");
      }
    };

    // 接收到消息时的处理
    this.socket.onmessage = event => {
      console.log("收到消息:", event.data);

      // 解析消息并调用回调函数
      try {
        const message = JSON.parse(event.data);
        if (this.callback) {
          this.callback(message);
        }
      } catch (error) {
        console.error("解析消息时出错:", error);
      }
    };
  }
}

export default AlarmServer;