import { Storage } from "./Storage.js";
import { ACCESS_TOKEN_KEY, MessageType } from "./const.js";
import axios from "./axios.js";
import { getToken, popMessage } from "./utils.js";

let token = getToken();

// 设置请求头和请求路径
axios.defaults.timeout = 20000;
axios.defaults.headers.post["Content-Type"] = "application/json;charset=UTF-8";
axios.interceptors.request.use(
    (config) => {
        // 避免报警列表弹窗获取不到token,每次获取token
        const token =  getToken();
        if (token ){
            //@ts-ignore
            config.headers.token = token;
            //@ts-ignore
            config.headers.Authorization =token;
        }
        return config;
    },
    (error) => {
        return error;
    }
);
// 响应拦截
axios.interceptors.response.use((res) => {
    if (res.data.code === 111) {
        Storage.set(ACCESS_TOKEN_KEY, "");
        // token过期操作
    }
    return res;
});

const http = {
    get(url, params, headers = {}) {
        return new Promise((resolve, reject) => {
            axios
                .get(url, { params }, { headers })
                .then((res) => {
                    if (res.data.code == 0 || res.data.code == 1 || res.data.code == 200 || res.data.success) {
                        resolve(res.data.data || res.data.result || res.data);
                    } else {
						popMessage(res.data.msg?.replace('服务器内部错误: ',''), MessageType.WARN);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    
                    reject(err.response.data);
                });
        });
    },
    login_get(url, params, headers = {}) {
        return new Promise((resolve, reject) => {
            axios
                .get(url, { params }, { headers })
                .then((res) => {
                    if (res.status == 200 ) {
                        resolve(res.data|| res.data.data || res.data);
                    } else {
						popMessage(res.data.msg?.replace('服务器内部错误: ',''), MessageType.WARN);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    
                    reject(err.response.data);
                });
        });
    },
    post(url, params, headers = {}, data) {
        return new Promise((resolve, reject) => {
            axios
                .post(url, params ? JSON.stringify(params) : data, { headers })
                // ResType<any> | SsoResType<any>
                .then((res) => {
                    if (res.data.code == 0 || res.data.code == 1 || res.data.code == 200 || res.data.success) {
                        resolve(res.data.data || res.data.result || res.data);
                    } else {
						popMessage(res.data.msg?.replace('服务器内部错误: ',''), MessageType.WARN);
                    }
                })
                .catch((err) => {
                    reject(err?.response?.data);
                });
        });
    },
    httpFormPost({ url, data = {}, params = {}, headers = {} }) {
        return new Promise((resolve, reject) => {
            axios({
                url,
                method: "post",
                transformRequest: [
                    function (data) {
                        let ret = "";
                        for (let it in data) {
                            ret += encodeURIComponent(it) + "=" + encodeURIComponent(data[it]) + "&";
                        }
                        return ret;
                    },
                ],
                // 发送的数据
                data,
                // url参数
                params,
                headers,
            }).then(res => {
                if (res ?.data ?.code == 0) {
                    resolve(res.data.data);
                } else if (res ?.data ?.success) {
                    resolve(res.data);
                } else {
                    reject();
                }
            });
        });
    },
    
    upload(url, file) {
        return new Promise((resolve, reject) => {
            axios
                .post(url, file, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                .then((res) => {
                    resolve(res.data.data || res.data.result || res.data);
                })
                .catch((err) => {
                    reject(err.data);
                });
        });
    },
    download(url) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        iframe.onload = function () {
            document.body.removeChild(iframe);
        };
        document.body.appendChild(iframe);
    },
    loadScript(url) {
        return new Promise((resolve, reject) => {
            axios
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((err) => {
                    reject(err.data);
                });
        });
    },
};
export default http;
