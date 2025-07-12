import { getUrlParam, getToken } from "/common/js/utils.js";
import { getI18n } from "/common/js/i18n.js";
import { useFrame } from "/common/components/frame-page.js";
import dataCenterApi from "../../api/dataCenterApi.js";
import { getAlarmInfo, handleAlarm } from "./request.js";
import layout, { PlayBackParam, RealTimeParam } from "/common/js/layout.js";
// import { MessageType } from "../../js/const.js";
import Storage from "/common/js/Storage.js";
import AlarmServer from "../../api/alarmServer.js";
import EventBusWorker, {
  LAYOUT_EVENTS,
  SCREEN_NAMES,
} from "/common/js/eventBus/eventBusWorker.js";
import {
  hideAlarmDetailsView,
  setBackPlayPanel,
  hideAlarmDetailsBackPlayPanel,
  setLinkagePreview,
  hideAlarmDetailsPreviewPanel,
} from "../../js/client.js";
const eventBus = EventBusWorker.getInstance(SCREEN_NAMES.Gis);
useFrame(Vue);
// 国际化(按需)
const i18n = await getI18n();

let time = 0;
let timeout = 100;
var app = new Vue({
  i18n: i18n,
  el: "#app",
  data: {
    visiable: false,
    tabs: [
      { key: 1, name: "实时监控" },
      { key: 2, name: "录像回放" },
      { key: 3, name: "录像抓拍" },
    ],
    selectedTabKey: 1,
    alarmId: "",
    isDetail: false,
    alarm: {},
    areaId: null,
    alarmlist: [],
    message: "",
    isShowList: true,
    param: null,
    eventsTotal: 1,
    eventsIndex: 1,
    alarmTime: null,
    isExistCamera: false,
    isVideoTrayReady: false,
  },
  created() {
    this.alarmId = getUrlParam("id");
    this.isDetail = !!getUrlParam("id");
    var comefrom = getUrlParam("from");
    if (comefrom == "alarmlist") {
      this.isShowList = false;
    }
    const theme = getUrlParam("wutosTheme")
    // 以插件新式打开时，设置主题
    if(theme){
      document.documentElement.className = theme
    }
    console.log(window.location.href);
  },
  mounted() {
    // 单个警情直接查, 多个列表
    if (!this.alarmId) {
      // 没有id则说明是列表告警页,使用插件弹窗
      this.param = {
        pageNumber: 1,
        pageSize: 10,
        status: "0,1",
      };
      this.getUrlToken();
    } else {
      // 需要先查询平台
      let alarm = Storage.get(this.alarmId);
      if (alarm) {
        this.changeAlarm(alarm);
        Storage.remove(this.alarmId);
      }
      window.addEventListener("message", (event) => {
        let { type, data } = event.data;
        switch (type) {
          case "popClose":
            this.popClose(data);
            break;
        }
        console.log("Message from parent:", event.data);
      });
      this.initPageEvent();
    }

    setTimeout(() => {
      this.isVideoTrayReady = localStorage.getItem("videoServerReady")
        ? eval(localStorage.getItem("videoServerReady"))
        : false;
      // 如果是列表页,则必定有插件
      if (!this.isDetail) {
        this.isVideoTrayReady = true;
        const url = getUrlParam("ws");
        new AlarmServer(url, this.handleAlarmWs);
      }
    }, 1000);
  },
  watch: {
    selectedTabKey: {
      handler(newVal, oldVal) {
        this.tabChange(newVal);
      },
    },
  },
  computed: {
    imgStyleData() {
      if (this.isDetail) {
        // 通过this.isDetail判断打开方式,设置宽高
        return {
          width: "680px",
          height: "370px",
          "object-fit": "contain",
        };
      } else {
        return {
          width: "580px",
          height: "370px",
          "object-fit": "contain",
        };
      }
    },
  },
  methods: {
    // 存在新告警时,无感刷新
    handleAlarmWs(message) {
      let { alarmNoticeVoList, untreatedCount } = message;
      // 当报警或者处警时刷新页面
      if (untreatedCount == this.alarmlist.length) {
        return;
      }
      const addOrDecrease = untreatedCount >  this.alarmlist.length ? "add" : "decrease";
      // 无感刷新列表
      dataCenterApi.getUnHandleAlarm(this.param).then((res) => {
        res.list.forEach((a) => {
          a.img = this.getSystemImg(a.system);
        });
        this.alarmlist = res.list;
        if (this.alarmlist.length == 0) {
          this.clearForm();
          return;
        }
        if ((this.alarmlist.length == 1) || addOrDecrease==="decrease") {
          this.changeAlarm(this.alarmlist[0]);
        }
      });
    },
    getUrlToken() {
      this.token =
        getUrlParam("token") ||
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE3NDY3Njk3ODUsImV4cCI6MTc0Njg1NjE4NSwiaXNzIjoiaHR0cDovLzEwLjExLjIuODU6NTAwMiIsImF1ZCI6WyJXZVNhZmUiLCJodHRwOi8vMTAuMTEuMi44NTo1MDAyL3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJmYXN0dmlldy1sb2NhbCIsInN1YiI6IjIiLCJhdXRoX3RpbWUiOjE3NDY3Njk3ODUsImlkcCI6ImxvY2FsIiwidGVuYW50IjoiMSIsInJvbGVzIjpbIkFkbWluIiwiZWQ1OWRiNDQ2ZDE0NGI3NTk3NTdhYjQzNWFmN2I5NzAiXSwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSJdfQ.Vv2VXenddOPpFxbq2WU37gwOdzTYluCYzNoPn7vG9mPeGUV9Cb0eLanqi4l3KRpCZTkbU_axP5CIqzCK_DmMUSgzvu-IO5vAJYtKs1tSGcUj_l8DcHBVtd4QrzU3NVksF763iV58kyAaQLEeik6TaGf7z119YtcKtxHreC_-cOji6NNrv6Wk1kw8ELTqNwrkdB8sfVv2eww18tm-r_pABHPkWAWyPWcAwP5YKYjOhg7IfQNswTxN-jtreDL-K0or4wk8EVwOCIMATQzgg7tyCpbT3_QzCXzxUMpUfLmo3fyfflIqwSc06Ewk_YPKzdGF8UBxkH0i85Xn0kpHRQi0pQ";
      localStorage.setItem("token", JSON.stringify(this.token));
      localStorage.setItem("accessToken", JSON.stringify(this.token));
      const wscwebapi = {
        // id: "wscwebapi",
        // name: "wesecuritywebapi",
        // resourceUrl: "http://10.11.2.85:5888/",
        // systemId: "wesecurity",
      };
      const a = decodeURI(window.location.href);
      const localStorageApi = getUrlParam("wscwebapi", a);
      const dataCenterApi = getUrlParam("dataCenterApi", a);
      localStorage.setItem(
        "wesecurityApi",
        localStorageApi || JSON.stringify(wscwebapi)
      );
      localStorage.setItem("dataCenterApi", dataCenterApi);
      this.getAlarmList(true);
    },
    wakeTray() {
      window.open("wutosvideoplayerassistant://");
    },
    downloadTray() {
      window.open(
        location.origin + "/downloads/WutosVideoPlayerAssistant.2.0.0.2.exe"
      );
    },
    initPageEvent() {
      // 页面被切换时移除视频模块
      window.addEventListener("beforeunload", () => {
        this.hideLinkage();
      });

      window.addEventListener("unload", () => {
        this.hideLinkage();
      });

      window.addEventListener("focus", () => {
        this.tabChange();
      });

      window.addEventListener("blur", () => {
        this.handleBlur();
      });

      window.top.addEventListener("focus", () => {
        this.tabChange();
      });

      window.top.addEventListener("blur", () => {
        this.handleParentBlur();
      });
      // 切换页面隐藏时视频
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.tabChange();
        } else {
          this.hideLinkage();
        }
      });
      eventBus.on(LAYOUT_EVENTS.VideoWndActivated, () => {
        time = Date.now();
      });
    },
    getCameraParam() {
      let CameraLinkageInfos = [];
      if (this.alarm && this.alarm.events?.length > 0) {
        let cameras = this.alarm.events.flatMap((i) => i.cameras).flat();
        cameras.forEach((item) => {
          let exist = CameraLinkageInfos.find(
            (i) => i.CameraId == item.cameraId
          );
          if (!exist) {
            CameraLinkageInfos.push({
              Name: item.name,
              CameraId: item.cameraId,
              PresetNumer: item.presetId,
            });
          }
        });
      }
      if (CameraLinkageInfos.length > 0) return CameraLinkageInfos;
      if (
        this.alarm.device &&
        this.alarm.device.deviceTypeId.startsWith("B.A")
      ) {
        CameraLinkageInfos.push({
          Name: this.alarm.device.name,
          CameraId: this.alarm.device.id,
        });
      }
      return CameraLinkageInfos;
    },
    getBounds(id) {
      const iframe = parent.document.getElementById("alarm-pop");
      const iframeRect = iframe.getBoundingClientRect();
      const element = document.getElementById(id);
      const rect = element.getBoundingClientRect();
      return {
        TopOffset: Math.round(
          window.screenY +
            (window.top.outerHeight - window.top.innerHeight) +
            iframeRect.top +
            rect.top
        ),
        LeftOffset: Math.round(window.screenX + iframeRect.left + rect.left),
        Width: element.clientWidth,
        Height: element.clientHeight,
      };
    },
    popClose() {
      if (
        this.selectedTabKey == 2 &&
        $("#videobox").length > 0 &&
        $("#videobox")[0].contentWindow &&
        typeof $("#videobox")[0].contentWindow.hidePluginWindow === "function"
      ) {
        $("#videobox")[0].contentWindow.hidePluginWindow();
      }
    },
    add() {
      if (this.eventsIndex < this.eventsTotal) {
        this.eventsIndex++;
      }
    },
    minx() {
      if (this.eventsIndex > 1) {
        this.eventsIndex--;
      }
    },
    changeAlarm(item) {
      this.alarmId = item.id;
      this.platformId = item.platformId;
      this.visiable = true;
      this.alarmTime = item.createdOn;

      if (item.platformId && item.thirdId) {
        this.queryAlarm(item.platformId, item.thirdId);
      }
    },
    isExistCamFn() {
      this.isExistCamera = this.getCameraParam().length > 0;
      return this.isExistCamera;
    },
    tabChange() {
      const hasCamera = this.isExistCamFn();
      const cameraList = this.getCameraParam();
      console.log("执行", this.selectedTabKey);

      this.$nextTick(() => {
        if (this.selectedTabKey == 1) {
          this.hideLinkage();
          if (!hasCamera) return;
          this.showPreview(cameraList);
        } else if (this.selectedTabKey == 2) {
          this.hideLinkage();
          if (!hasCamera) return;
          this.showVideo(cameraList);
        } else {
          this.hideLinkage();
        }
      });
    },
    // 获取当前报警的录像抓拍
    getAlarmSnap(data) {
      if (!data || data == "") {
        return false;
      }
      const param = JSON.parse(data) || null;
      // 判断param是否为数组,且length!==0
      if (param && param.length !== 0) {
        return param[0]?.Value;
      }
      return false;
    },
    queryAlarm(platformId, alarmId) {
      getAlarmInfo(platformId, alarmId)
        .then((data) => {
          this.alarm = data;
          this.hideLinkage();
          // 如果没有值,且当前key在图片上,修改到预览
          if (!this.getAlarmSnap(data.extra) && this.selectedTabKey == 3) {
            this.selectedTabKey = 1;
          }
          this.tabChange();
        })
        .catch((err) => {
          this.$message.warn(err);
        });
    },
    hide() {
      this.selectedTabKey = 1;
      this.alarm = {};
      this.visiable = false;

      layout.closeWin();
    },
    handleAlarm(isFalseAlarm) {
      handleAlarm(this.platformId, this.alarm.id, isFalseAlarm, this.message)
        .then(() => {
          this.$message.info("处警成功");
          this.getAlarmList(true);
          this.clearForm();
        })
        .catch((errr) => {
          this.$message.error("处警失败");
        });
    },
    clearForm() {
      this.message = "";
      this.alarm = {};
      this.visiable = false;
      this.hideLinkage();
    },
    getAlarmList(isCheckFirst = false) {
      dataCenterApi.getUnHandleAlarm(this.param).then((res) => {
        res.list.forEach((a) => {
          a.img = this.getSystemImg(a.system);
        });
        if (this.alarmlist.length == res.list.length && !isCheckFirst) {
          this.$message.warn("没有更多数据了");
        }
        this.alarmlist = res.list;
        if (isCheckFirst && this.alarmlist.length > 0) {
          this.changeAlarm(this.alarmlist[0]);
        }
      });
    },
    refreshAlarm() {
      this.param.pageNumber = 1;
      this.param.pageSize = 20;
      this.getAlarmList(true);
    },
    getMore() {
      this.param.pageSize += 10;
      this.getAlarmList();
    },
    getSystemImg(name) {
      switch (name) {
        case "3":
          return "crxt";
        case "2":
          return "xlxt";
        case "0":
          return "zjxt";
        case "1":
          return "xfxt";
        case "4":
          return "spxt";
        default:
          return "zjxt";
      }
    },
    getRealTimeParam() {
      var param = new RealTimeParam();
      param.Bounds = this.getBounds("media-content");
      let cameras = this.getCameraParam();
      param.CameraLinkageInfos = cameras;
      return param;
    },
    getPlayBackParam() {
      var param = new PlayBackParam();
      param.Bounds = this.getBounds("media-content");
      param.CameraLinkageInfos = this.getCameraParam();
      var time = new Date(this.alarmTime).setSeconds(
        new Date(this.alarmTime).getSeconds() - 20
      );
      param.alarmDateTime = moment(time).format("YYYY-MM-DD HH:mm:ss");
      return param;
    },

    cancel() {
      // this.hideLinkage();
      if (this.isDetail) {
        this.hideLinkage();
        layout.closeWin();
      } else {
        hideAlarmDetailsView();
      }
    },
    hideLinkage() {
      if (this.isDetail) {
        layout.hideLinkagePreview();
        layout.hideLinkageBackPlay();
      } else {
        hideAlarmDetailsPreviewPanel();
        hideAlarmDetailsBackPlayPanel();
      }
    },
    // 显示预览
    showPreview(cameraList) {
      if (this.isDetail) {
        const param = this.getRealTimeParam();
        layout.showLinkagePreview(param);
      } else {
        setLinkagePreview(cameraList);
      }
    },
    // 隐藏预览
    hidePreview() {
      if (this.isDetail) {
        layout.hideLinkagePreview();
      } else {
        hideAlarmDetailsPreviewPanel();
      }
    },
    // 显示录像回放
    showVideo(cameraList) {
      if (this.isDetail) {
        const param = this.getPlayBackParam();
        layout.showLinkageBackPlay(param);
      } else {
        const time= moment(this.alarmTime).subtract(20, 'second').format("YYYY-MM-DD HH:mm:ss");
        setBackPlayPanel(cameraList, time);
      }
    },
    // 隐藏录像
    hideVideo() {
      if (this.isDetail) {
        layout.hideLinkageBackPlay();
      } else {
        hideAlarmDetailsBackPlayPanel();
      }
    },
    handleBlur() {
      if (time && Date.now() - time > timeout * 4) {
        this.hideLinkage();
        time = 0;
      } else {
        setTimeout(() => {
          if (time && Date.now() - time > timeout * 4) {
            if (!document.hasFocus()) {
              this.hideLinkage();
            }
          }
          time = 0;
        }, timeout);
      }
    },
    handleParentBlur() {
      let now = Date.now();
      if (time && now - time > timeout * 4) {
        this.hideLinkage();
        time = 0;
      } else {
        setTimeout(() => {
          if (time && Date.now() - time > timeout * 4) {
            if (!document.hasFocus()) {
              this.hideLinkage();
            }
          }
          time = 0;
        }, timeout);
      }
    },
  },
  destory() {},
});

window.app = app;
