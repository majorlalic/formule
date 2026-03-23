import { DEVICE_MARKER_SELECTED, TUNNEL_CHANNEL_NAME } from "./tunnel3d_const.js";
import * as THREE from "three";

const apikey = '6606700976c04825ae81b09288268cee';
const url = "http://10.11.2.205:5888/api/Linkage/CommonLinkage";

const fengji_id_true = "1"; //风机id
const fengji_id_false = "2"; //风机id
const zhaoming_id_true = "3"; //照明id
const zhaoming_id_false = "4"; //照明id
const shengguang_id_true = "5"; // 声光id
const shengguang_id_false = "6"; // 声光id

const video_url = "http://10.11.2.205:8089/wesecurity/commonPage/video/Video_hkdp.html?fullscreen=1&isAlarm=0&assestId=1747795408236711936";
const water_url = "http://10.11.2.205:5000/api/services/app/device/GetPageList?AssestType=A.C.A.A.B&Limit=10&Offset=0&Keyword=F005158"

function control(id) {
    $.ajax({
        url,
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('apikey', apikey);
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ id }),
        success: function (res) {
            if (res.code == 200) {
                alert("操作成功");
            } else {
                alert("操作失败" + res.msg);
            }
        },
        error: function (err) {
            console.error(err);
        }

    })
}

function getWaterValue(success, fail) {
    $.ajax({
        url: water_url,
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader('apikey', apikey);
        },
        contentType: "application/json; charset=utf-8",
        success: function (res) {

            if (res.code == 200) {
                const value = res.data.rows[0].extAttrs.filter(e => e.name == '液位')[0].value;
                success(value);
            } else {
                console.error("水位获取失败" + res.msg);
                fail();
            }
        },
        error: function (err) {
            console.error(err);
            fail();
        }

    })
}

const channel = new BroadcastChannel(TUNNEL_CHANNEL_NAME);
let lastSelectedMarker = null;
function initListener(vueObj, scene) {
    channel.addEventListener("message", e => {
        if (e.data.type == DEVICE_MARKER_SELECTED) {
            let { deviceType, markerName } = e.data;
            const marker = scene.getObjectByName(markerName);

            if (deviceType == "shexiangji") {
                vueObj.showVideo(video_url);
                return;
            }
            lastSelectedMarker = marker;
        }
    })

}

function controlFengji(bool) {
    if (bool) {
        control(fengji_id_true)
    } else {
        control(fengji_id_false)
    }
}

function controlZhaoming(bool) {
    if (bool) {
        control(zhaoming_id_true)
    } else {
        control(zhaoming_id_false)
    }
}


function controlshengguang(bool) {
    if (bool) {
        control(shengguang_id_true)
    } else {
        control(shengguang_id_false)
    }
}



export { initListener, controlFengji, controlZhaoming, controlshengguang, getWaterValue }