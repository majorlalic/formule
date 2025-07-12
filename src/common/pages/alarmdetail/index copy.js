import { getUrlParam, getToken } from "../common/js/utils.js";
import { getI18n } from "../common/js/i18n.js";
import { useFrame } from "../common/components/frame-page.js";
import WeSecurityApi from "../common/api/weSecurityApi.js";
import layout, { PlayBackParam, RealTimeParam } from "/common/js/layout.js";
import { DataStatisticsParam } from "../common/api/weSecuritymodel.js";
import AlarmServer from "../common/api/alarmServer.js";
import EventBusWorker, {
  SCREEN_NAMES,
  LAYOUT_EVENTS,
} from "../common/js/eventBus/eventBusWorker.js";
import {
  hideAlarmDetailsView,
  showVideoPaly,
  hideAlarmDetailsLinkagePreview,
  setLinkagePreview,
  hideAlarmDetailsPreviewPanel,
} from "../common/js/client.js";

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
      { key: 3, name: "警情快照" },
    ],
    selectedTabKey: 1,
    alarmId: "",
    isDetail: false,
    alarm: {},
    mapId: null,
    cameraId: null,
    file: {},
    areaId: null,
    alarmlist: [],
    message: "",
    isShowList: true,
    param: null,
    eventsTotal: 1,
    eventsIndex: 1,
    eventBus: null,
    alarmTime: null,
    isExistCamera: false,
    isVideoTrayReady: false,
    token: "",
  },
  created() {
    this.alarmId = getUrlParam("id");
    this.isDetail = !!getUrlParam("id");
    console.log("this.alarmId", this.alarmId);
    var comefrom = getUrlParam("from");
    if (comefrom == "alarmlist") {
      this.isShowList = false;
    }
    this.param = new DataStatisticsParam();
    this.param.pageSize = 20;
    this.param.alarmStatus = 0;
    this.eventBus = EventBusWorker.getInstance(SCREEN_NAMES.AlarmPop);
    // 没有id则说明是列表告警页,使用插件弹窗
    if (!this.isDetail) {
      this.getUrlToken();
    }
  },
  mounted() {
    // 有id则为详情页
    if (this.alarmId != "") {
      this.show();
      this.initPageEvent();
    }
    this.hideLinkage();
    setTimeout(() => {
      this.isVideoTrayReady = localStorage.getItem("videoServerReady")
        ? eval(localStorage.getItem("videoServerReady"))
        : false;
      if (!this.isDetail) {
        this.isVideoTrayReady = true;
        // 连接Socket
        const  url = getUrlParam("ws") || "ws://10.11.2.81:5002/";
        new AlarmServer(url,this.handleAlarmWs);
      }
    }, 1000);
  },
  watch: {
    selectedTabKey: {
      handler() {
        this.tabChange();
      },
    },
  },
  computed: {
    // getPlaySrc() {
    //   switch (this.selectedTabKey) {
    //     case 1:
    //       return `/wesecurity/dataVisual/indoormap/index.html?mapId=${this.mapId}&areaId=${this.areaId}&businessId=${this.alarm?.device?.id}`;
    //     case 2:
    //       return `/wesecurity/commonPage/video/Video_hkdp.html?showTool=0&assestId=${this.cameraId}&token=${getToken()}`;
    //     default:
    //       return "";
    //   }
    // },
  },
  methods: {

    // 存在新告警时,无感刷新
    handleAlarmWs(message) {
        let { alarmNoticeVoList, untreatedCount } = message;
        if (!alarmNoticeVoList || !alarmNoticeVoList?.length) {
          return;
        }
      const param = this.param;
      const newlyData = [];
      const idList = this.alarmlist.map((a) => a.id);
      // 无感刷新列表
      WeSecurityApi.GetUnHandleAlarmPageData(param).then((res) => {
        // 通过id判断数据是否存在与idList,存在则忽略否则push到newlyData
        res.rows.forEach((a) => {
          if (!idList.includes(a.id)) {
            a.img = this.getSystemImg(a.belongSystem);
            newlyData.push(a);
          }
        });
        // 把数据推送到列表
        if (newlyData.length > 0) {
          this.alarmlist = [...newlyData, ...this.alarmlist];
        }
      });
    },
    getUrlToken() {
      this.token =
        getUrlParam("token") ||
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZDE3MGZiMjM2MzQ2MTkxZWI0ZTllNjBjMTIxNDMzIiwidHlwIjoiSldUIn0.eyJuYmYiOjE3NDY3Njk3ODUsImV4cCI6MTc0Njg1NjE4NSwiaXNzIjoiaHR0cDovLzEwLjExLjIuODU6NTAwMiIsImF1ZCI6WyJXZVNhZmUiLCJodHRwOi8vMTAuMTEuMi44NTo1MDAyL3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJmYXN0dmlldy1sb2NhbCIsInN1YiI6IjIiLCJhdXRoX3RpbWUiOjE3NDY3Njk3ODUsImlkcCI6ImxvY2FsIiwidGVuYW50IjoiMSIsInJvbGVzIjpbIkFkbWluIiwiZWQ1OWRiNDQ2ZDE0NGI3NTk3NTdhYjQzNWFmN2I5NzAiXSwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSJdfQ.Vv2VXenddOPpFxbq2WU37gwOdzTYluCYzNoPn7vG9mPeGUV9Cb0eLanqi4l3KRpCZTkbU_axP5CIqzCK_DmMUSgzvu-IO5vAJYtKs1tSGcUj_l8DcHBVtd4QrzU3NVksF763iV58kyAaQLEeik6TaGf7z119YtcKtxHreC_-cOji6NNrv6Wk1kw8ELTqNwrkdB8sfVv2eww18tm-r_pABHPkWAWyPWcAwP5YKYjOhg7IfQNswTxN-jtreDL-K0or4wk8EVwOCIMATQzgg7tyCpbT3_QzCXzxUMpUfLmo3fyfflIqwSc06Ewk_YPKzdGF8UBxkH0i85Xn0kpHRQi0pQ";
      localStorage.setItem("token", JSON.stringify(this.token));
      const wscwebapi = {
        // id: "wscwebapi",
        // name: "wesecuritywebapi",
        // resourceUrl: "http://10.11.2.85:5888/",
        // systemId: "wesecurity",
      };
      const localStorageApi = getUrlParam("wscwebapi");
      localStorage.setItem(
        "wscwebapi",
        localStorageApi || JSON.stringify(wscwebapi)
      );
      this.getAlarmList(true);
    },
    wakeTray() {
      window.open("wutosvideoplayerassistant://");
    },
    downloadTray() {
      window.open(
        location.origin + "/fastview/downloads/WutosVideoPlayerAssistant.exe"
      );
    },
    initPageEvent() {
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

      this.eventBus.on(LAYOUT_EVENTS.VideoWndActivated, () => {
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
    show() {
      WeSecurityApi.getGisAlarmById(this.alarmId).then((data) => {
        this.alarm = data;
        this.alarm.events = this.alarm.events.reverse();
        this.message = this.alarm.auditMessage;
        this.areaId = data?.area?.id;
        this.mapId = "XYYC_LHGF_2";
        this.cameraId = "29077545240494242";
        this.eventsTotal = this.alarm.events.length;
        this.eventsIndex = 1;
        this.alarmTime = this.alarm.createdOn;
        this.visiable = true;
        this.tabChange();
      });
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
      if (this.alarmId == item.id) {
        return;
      }
      this.alarmId = item.id;
      this.alarmTime = item.createdOn;
      this.visiable = true;
      this.message = ""
      this.show();
    },
    isExistCamFn() {
      this.isExistCamera = this.getCameraParam().length > 0;
      return this.isExistCamera;
    },
    tabChange() {
      const hasCamera = this.isExistCamFn();
      const cameraList = this.getCameraParam();
      this.$nextTick(() => {
        if (this.selectedTabKey == 1) {
          this.hideVideo();
          if (!hasCamera) return;
          this.showPreview(cameraList);
        } else if (this.selectedTabKey == 2) {
          this.hidePreview();
          if (!hasCamera) return;
          this.showVideo(cameraList);
        } else {
          this.hideLinkage();
        }
      });
    },
    hide() {
      this.selectedTabKey = 1;
      this.alarm = {};
      this.mapId = null;
      this.cameraId = null;
      this.file = {};
      this.visiable = false;
      this.hideLinkage();
      //   layout.closeWin();
    },
    uploadClick() {
      $("#file").click();
    },
    fileChange() {
      var files = document.getElementById("file").files;
      if (files.length > 0) this.file = files[0];
    },
    handleAlarm(isFalseAlarm) {
      var par = {
        alarmIds: this.alarm.id,
        isFalseAlarm,
        message: this.message,
      };
      WeSecurityApi.handleAlarm(par).then((res) => {
        this.$message.info("处警成功");
        this.eventBus.postMessage("refreshAlarmList");
        if (this.isShowList) {
          this.getAlarmList(true);
        } else {
          this.hide();
        }
        const TYPES = { SUCCESS: "success", WARN: "warning", ERROR: "error" };
        window.parent.postMessage(
          {
            type: "message",
            param: { type: TYPES.SUCCESS, content: "处警成功" },
          },
          window.location.origin
        );
      });
    },
    getAlarmList(isCheckFirst = false) {
      WeSecurityApi.GetUnHandleAlarmPageData(this.param).then((res) => {
        res.rows.forEach((a) => {
          a.img = this.getSystemImg(a.belongSystem);
        });
        this.alarmlist = [...this.alarmlist, ...res.rows];
        if (this.alarmlist.length == res.rows.length && !isCheckFirst) {
          this.$message.warn("没有更多数据了");
        }
        if (this.alarmlist.length > 0) {
          this.visiable = true;
          this.alarmId = this.alarmlist[0].id;
          this.show();
        }
        if (this.alarmlist.length == 0) {
          this.visiable = false;
          this.hideLinkage();
        }
      });
    },
    refreshAlarm() {
      this.param.pageNumber = 1;
      this.param.pageSize = 20;
      this.getAlarmList(true);
    },
    getMore() {
      this.param.pageNumber += 1;
      this.getAlarmList();
    },
    getSystemImg(name) {
      switch (name) {
        case "出入系统":
          return "crxt";
        case "泄漏系统":
          return "xlxt";
        case "周界系统":
          return "zjxt";
        case "消防系统":
          return "xfxt";
        case "视频系统":
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
        // hideAlarmDetailsLinkagePreview();
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
        const time   = this.alarmTime
        showVideoPaly(cameraList,time);
      }
    },
    // 隐藏录像
    hideVideo() {
      if (this.isDetail) {
        layout.hideLinkageBackPlay();
      } else {
        hideAlarmDetailsLinkagePreview();
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
