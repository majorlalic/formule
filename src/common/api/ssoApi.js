import http from "../../common/js/http.js";
import axios from "../js/axios.js";
class SsoApi {
  constructor() {
    // this._urlPrefix = getServerUrl(SERVERS.SECURITY);
    // this._urlPrefix = "http://10.11.2.81:5002/";
    this._urlPrefix = "http://10.11.2.81:5002/";
  }
  login = ({ data, headers }) => {
    return http.httpFormPost({
      url: `${this._urlPrefix}api/TokenAppAuth/AppLogin`,
      data,
      headers,
    });
  };
  // 多环境获取配置
  getPlatformConfig(){
    axios({
      method: "get",
      url: "../../../conf/public_new.json"
    })
      .then((res) => {
       if(res.status!==200){
        throw "请在conf文件夹下添加public_new.json配置文件";
       }
       this._urlPrefix = res.data.SSOHost
      })
      .catch(() => {
        throw "请在conf文件夹下添加public_new.json配置文件";
      });
  };
  configInfo = () => {
   return  axios({
      method: "get",
      url: `${this._urlPrefix}AppCenter/ConfigInfo/`
    })
      .then((res) => {
       if(res.status==200){
        return res.data;
       }
      })
      .catch(() => {
        throw "AppCenter/ConfigInfo失败";
      });
  };
    getUrl = ()=>{
    return this._urlPrefix
  }
}
export default new SsoApi();
// 登录
