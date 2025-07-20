import http from "/common/js/http.js";
import { getServerUrl } from "/common/js/utils.js";
import { SERVERS } from "/common/js/const.js";
import { scenes } from "../js/mock.js";

class VisualApi {
    constructor() {
        this._urlPrefix = getServerUrl(SERVERS.SECURITY);
    }

    getAreaTree = () => {
        return http.get(`${this._urlPrefix}api/Area/GetChildNode`);
    };

    /**
     * 根据场景id查询场景信息
     * @param {String | Number} sceneId 场景id
     * @returns
     */
    getSceneById(sceneId) {
        return new Promise((resolve, reject) => {
            let scene = scenes.find((i) => i.id == sceneId);
            if (scene) {
                resolve(scene);
            } else {
                reject("未查询到场景, 请联系管理员");
            }
        });
    }
}

export default new VisualApi();
