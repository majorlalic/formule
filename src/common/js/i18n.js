import VueI18n from "/dep/js/vue-i18n.esm.browser.min.js";
import http from "../../common/js/http.js";

/**
 * 从指定js中获取其中定义定义的变量
 * @param {String} url
 */
const getObjectFromJs = (url) => {
    return new Promise((resolve, reject) => {
        http.loadScript(url).then((data) => {
            const scriptText = data;

            // 创建一个 Blob 对象并生成一个 URL
            const blob = new Blob([scriptText], { type: "application/javascript" });
            const scriptUrl = URL.createObjectURL(blob);

            // 创建一个新的 <script> 元素
            const scriptElement = document.createElement("script");
            scriptElement.src = scriptUrl;
            scriptElement.onload = () => {
                // 确保脚本被执行
                URL.revokeObjectURL(scriptUrl); // 释放 Blob URL

                if (typeof getValue != "undefined") {
                    let value = getValue();
                    resolve(value);
                }
            };

            // 处理脚本加载错误
            scriptElement.onerror = (e) => {
                reject(e);
            };

            // 将 <script> 元素添加到文档中
            document.head.appendChild(scriptElement);
        });
    });
};

let languages = [
    {
        url: "/common/langs/zh.js",
        name: "Chinese",
    },
    {
        url: "/common/langs/en.js",
        name: "English",
    },
];

export const getI18n = () => {
    return new Promise((resolve, reject) => {
        let requests = [];
        languages.forEach((item) => {
            requests.push(getObjectFromJs(item.url));
        });
        Promise.all(requests).then((res) => {
            let msgs = {};
            for (let i = 0; i < res.length; i++) {
                msgs[languages[i].name] = res[i];
            }
            let i18n = new VueI18n({
                locale: window.localStorage.getItem("locale") ?? languages[0].name, // 将要切换的语言
                messages: msgs,
            });
            resolve(i18n);
        });
    });
};
