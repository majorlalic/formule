import { SERVERS, ACCESS_TOKEN_KEY, MessageType, MEMORY, PageType } from "./const.js";
import Storage from "./Storage.js";

/**
 * 获取后台服务url
 * @param {SERVERS} serverName
 * @returns
 */
export const getServerUrl = (serverName) => {
    let target = Storage.getOrigin(serverName);
    if (target) {
        if (isJSON(target)) {
            let server = JSON.parse(target);
            return server.resourceUrl;
        } else {
            return target;
        }
    } else {
        console.error(`${serverName}未注册, 请在sso中配置`);
    }
};

export const getSSOApi = () => {
    return getServerUrl(SERVERS.SSO);
};

export const getDataCenterUrl = () => {
    return getServerUrl(SERVERS.DATACENTER);
};

export const getRealPlayerUrl = () => {
    return getServerUrl(SERVERS.RealPlayer);
};

/**
 * 获取token
 * @returns
 */
export const getToken = () => {
    return `Bearer ${localStorage.getItem(ACCESS_TOKEN_KEY)?.replaceAll('"', "")}`;
    // return "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE3Mzg5NzYzNzQsImV4cCI6MTczOTA2Mjc3NCwiaXNzIjoiaHR0cDovLzEwLjExLjIuODU6NTAwMiIsImF1ZCI6WyJXZVNhZmUiLCJodHRwOi8vMTAuMTEuMi44NTo1MDAyL3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJmYXN0dmlldyIsInN1YiI6IjIiLCJhdXRoX3RpbWUiOjE3Mzg5NzYzNzQsImlkcCI6ImxvY2FsIiwidGVuYW50IjoiMSIsInJvbGVzIjoiQWRtaW4iLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl19.HbYmoCcleJ3WazLN1ss-Bse1PA4ZFXw4HShOcsjIOwfwgI7s-PimPLBIr5uPuyYSKklD0B4_fCqN8AYTttDKgPRVaK5DWGZychh4B_NLQ1hHfwuslm5NEvPZ36reVpxwunn5vpJjCrYfsYnZUToj-_eXj50529oHdUicANwd8dM06WUQ00LpPpAw1o_r9MDBEMrnjBS_D89Xvm2CClrCQY6_ueDy-RBCAcsVLqiP5ovO6ajjxmxfdrWFpIpamknAzj8lKRVXe-15wM3DoAxCHM-ri1g99SGxuM7IJWberDgTVojgugIXAls8dCosNDLqAIPlwd-_g4ePkbaYqTKWmw";
};

/**
 * 从页面url中根据key获取值
 * @param {string} name 参数key
 * @returns
 */
export const getUrlParam = (name,url=null) => {
    if (!name) {
        return "";
    }
    var hashes =url ? url.slice(url.indexOf("?") + 1).split("&"): window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
    for (var i = 0; i < hashes.length; i++) {
        var hash = hashes[i].split("=");
        if (hash[0].toUpperCase() == name.toUpperCase()) {
            return hash[1];
        }
    }
    return "";
};

/**
 * 弹出消息
 * @param {String} text
 * @param {MessageType} type
 */
export const popMessage = (text, type) => {
    if (app && app.$message) {
        app.$message[type](text);
    } else {
        console.error("请引入ant-design");
    }
};

/**
 * 延迟执行
 * @param {Number} ms 毫秒
 * @returns
 */
export const delay = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

/**
 * 判断字符串是否为json对象
 * @param {String} jsonStr
 * @returns
 */
export const isJSON = (jsonStr) => {
    try {
        JSON.parse(jsonStr);
        return true;
    } catch (e) {
        return false;
    }
};

export const callParentFunction = (funName, ...params) => {
    if (self == top) {
        return;
    }
    parent.postMessage(
        {
            funName,
            params: [...params],
        },
        "*"
    );
};

export const goBack = () => {
    window.history.go(-1);
};

/**
 * 跳转
 * @param {*} url
 */
export const goTo = (url) => {
    // 外壳
    var cs = getUrlParam("framework");
    // 从url中获取token
    if (cs == "cs") {
        addParam(url, "framework", cs);
        addParam(url, "token", getToken());
    }
    // 主题
    let theme = getUrlParam("theme");
    if (theme) {
        addParam(href, "theme", theme);
    }
    window.location.href = url;
};

/**
 * 列表跳转详情页
 * @param {String} id
 * @param {PageType} type
 * @param {String} url
 */
export const goInfo = (id, type, url = "../info/index.html") => {
    if (id) {
        url = addParam(url, "id", id);
    }
    url = addParam(url, "type", type);
    let key = location.href.replace(location.origin, "");
    // 只有在页面跳转后才使之前缓存的参数记忆生效(加上MEMORY前缀), 避免单纯的页面刷新也产生记忆
    localStorage.setItem(MEMORY + key, localStorage.getItem(key));
    localStorage.removeItem(key);
    goTo(url);
};

/**
 * 详情页跳转列表页
 * @param {*} url
 */
export const goList = (url = "../list/index.html") => {
    goTo(url);
};

/**
 * url中添加参数
 * @param {String} url
 * @param {String} name
 * @param {String} value
 * @returns
 */
export const addParam = (url, name, value) => {
    if (url.indexOf("?") > -1) {
        url += "&" + name + "=" + value;
    } else {
        url += "?" + name + "=" + value;
    }
    return url;
};

/**
 * 获取当前列表页的参数记忆
 * @returns
 */
export const getMemoryParam = () => {
    let key = MEMORY + location.href.replace(location.origin, "");
    let target = localStorage.getItem(key);
    // 阅后即焚
    localStorage.removeItem(key);
    return target ? JSON.parse(target) : "";
};

/**
 * 判断对象加载完毕, 初衷是在组件加载好后立即调用方法
 * @param {Object} obj
 * @param {String} target
 * @returns
 */
export const existPromise = (obj, target) => {
    // 尝试5次后停止
    const times = 5;
    // 尝试间隔100ms
    const gap = 100;
    let index = 0;
    return new Promise((resolve, reject) => {
        const checkExist = () => {
            if (obj[target]) {
                resolve(obj); // 对象存在，resolve 并返回对象
            } else {
                if (index < times) {
                    index++;
                    setTimeout(checkExist, gap); // 对象不存在，递归调用 checkExistence
                }
            }
        };

        checkExist(); // 开始检查
    });
};

/**
 * 邮箱格式校验
 * @param {*} email
 * @returns
 */
export const mailValidate = (email) => {
    var regemail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    return regemail.test(email);
};

/**
 * 手机号码校验
 * @param {*} phone
 * @returns
 */
export const telphoneValidate = (phone) => {
    var regphone = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    return regphone.test(phone);
};

/**
 * 监听指定容器大小变化
 * @param {String} id
 * @param {Function} callback
 */
export const containerObserver = (id, callback) => {
    const div = document.querySelector(`#${id}`);

    // 创建 ResizeObserver 实例
    const resizeObserver = new ResizeObserver((entries) => {
        callback(entries);
    });

    // 监听元素
    resizeObserver.observe(div);
};

export const transformData2Ant = (arr, selectableType = "") => {
    let types = selectableType.split(",");
    arr.forEach((element) => {
        element.key = element.id;
        element.value = element.id;
        element.title = element.name;
        if (selectableType == "" || types.includes(element.orgType)) {
            element.selectable = true;
            element.disabled = false;
        } else {
            element.selectable = false;
            element.disabled = true;
        }

        if (element.children && element.children.length > 0) {
            transformData2Ant(element.children, selectableType);
        }
    });
    return arr;
};

/**
 * 获取数组所有摊平的属性
 * @param {Array} arr
 * @param {String} attrName
 * @param {Array} res
 * @returns
 */
export const flatArr = (arr, attrName, res = []) => {
    arr.forEach((item) => {
        res.push({
            id: item.id,
            path: item.path,
            parentId: item.parentId,
        });
        if (item[attrName] && item[attrName].length > 0) {
            flatArr(item[attrName], attrName, res);
        }
    });
    return res;
};

export const toMenuHref = (url) => {
    window.top.location.href = url;
};

/**
 * 四舍五入并转为百分比
 * @param {String | Number} value
 * @returns
 */
export const roundPercent = (up, down, decimal = 0) => {
    if (down == 0) {
        return 100;
    }
    let value = up / down;
    if (value == 0 || value == 1) {
        return value * 100;
    }
    return (value * 100).toFixed(decimal);
};
/**
 * 根据入参,向上下取整,并转化为百分比
 * @param {String | Number} value
 * @param {Number} total
 * @param {0 | 1} RoundingType 0:向下取整,1:向上取整
 */
export const roundPercentAndType = (value, total, RoundingType) => {
  if (total == 0) {
    return 100;
  }
  const price = value / total;
  if (price == 0 || price == 1) {
    return price * 100;
  }
  if (RoundingType == 0) {
    return Math.floor(price * 100);
  } else {
    return Math.ceil(price * 100);
  }
};
/**
 * 将文字复制到剪切板
 * @param {String} value
 * @returns
 */
export const copyToClipboard = (text) => {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            console.log("内容已复制到剪切板");
        })
        .catch((err) => {
            console.error("复制失败:", err);
        });
};

export const generateUUID = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let uuid = "";
    for (let i = 0; i < 32; i++) {
        uuid += chars[Math.floor(Math.random() * chars.length)];
    }
    return uuid;
};

export const getPositionById = (id) => {
    const frame = window.top.document.querySelector("iframe.frame-iframe").getBoundingClientRect();

    const element = document.getElementById(id);
    if (!element) {
        console.warn(`未发现该元素, id: ${id}`);
        return null;
    }

    const rect = element.getBoundingClientRect();

    // 屏幕左侧 + 地址栏任务栏 + 框架页 + 实际div
    // 返回元素在显示器中的位置
    // return {
    //     bounds: {
    //         topOffset: Math.round(
    //             window.screenY + (window.top.outerHeight - window.top.innerHeight) + frame.top + rect.top - 7
    //         ), // 距离显示器顶部的距离
    //         leftOffset: Math.round(window.screenX + frame.left + rect.left + 13), // 距离显示器左侧的距离
    //         width: Math.round(rect.width), // 元素的宽度
    //         height: Math.round(rect.height), // 元素的高度
    //     },
    // };

    // 其他人好我就好 QVQ
    return {
        bounds: {
            topOffset: Math.round(
                window.screenY + (window.top.outerHeight - window.top.innerHeight) + frame.top + rect.top
            ), // 距离显示器顶部的距离
            leftOffset: Math.round(window.screenX + frame.left + rect.left), // 距离显示器左侧的距离
            width: Math.round(rect.width), // 元素的宽度
            height: Math.round(rect.height), // 元素的高度
        },
    };
};
// 获取当前主题
export const getTheme = () => {
    return localStorage.getItem("wutosTheme") || "base";
};
// 用于获取html元素的变化构造函数
export const GetHtmlClassName = function (callback) {
  const targetNode = document.documentElement;
  const config = {
    attributeFilter: ["class"],
    childList: false,
    subtree: false,
  };
    this.themeClass = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        callback(mutation.target.className);
      }
    }
  };
  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(this.themeClass);

  // 以上述配置开始观察目标节点
  observer.observe(targetNode, config);

};
export const getTextColor = (dark,base) => { 
    return getTheme() === "dark" ? dark : base;
};
