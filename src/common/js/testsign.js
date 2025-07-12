
const API_KEY = "c0ca7898b9c811ef8710005056831e5d"; // 示例 API Key
const SECRET = "1885f341b9c911ef8710005056831e5d1885f341b9c911ef8710005056831e5d1"; // 示例 SECRET

// 计算签名
function generateSignature(apiKey, timestamp, secret) {
    // 将 apiKey、timestamp 和请求体参数拼接
    const queryString = `${apiKey}#${secret}#${timestamp}`;

    // 使用 SHA-256 哈希生成签名（你也可以选择其他算法）
    const encoder = new TextEncoder();
    const data = encoder.encode(queryString);
    return crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
        // 转换为十六进制字符串
        let hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
    });
}

// 发送 POST 请求
async function sendPostRequest(url, bodyParams) {
    // 生成时间戳
    const timestamp = Date.now();

    // 生成签名
    const signature = await generateSignature(API_KEY, timestamp, SECRET);

    // 创建请求头
    const headers = {
        "Content-Type": "application/json",
        apiKey: API_KEY, // 将 apiKey 放在请求头
        timestamp: timestamp.toString(), // 时间戳放在请求头
        signature: signature, // 签名放在请求头
    };

    // 请求体参数，转为 JSON 格式
    const body = JSON.stringify(bodyParams);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        });

        // 检查响应状态
        if (response.ok) {
            const data = await response.json();
            console.log("Response:", data);
        } else {
            console.error("HTTP error", response.status);
        }
    } catch (error) {
        console.error("Request failed", error);
    }
}

// 示例请求体参数
const bodyParams = [
    // {
    //     orgid: "c9b27db4807244e2bf9fbb415db2d09a",
    //     type: "acsDevice_open_timeout",
    //     position: "模拟报警位置",
    //     lat: "1231.232",
    //     lng: "252.232",
    //     occurtime: moment().format("YYYY-MM-DD HH:mm:ss"),
    //     detail: "模拟报警详情",
    // },
];

// 发送请求
const url = "http://10.11.2.81:4703/wutos/api/alarm/synchroAlarmData";
sendPostRequest(url, bodyParams);
