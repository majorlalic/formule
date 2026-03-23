import { registerElement } from "../../../common/core/registry/elementRegistry.js";
import { SceneType } from "../../../common/core/const.js";

import Point from "./point.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Label from "./label.js";
import Modal from "./modal.js";
import Tunnel3D from "./tunnel3d.js";
import TunnelDeviceMarker3D from "./tunnel-device-marker3d.js";

const elements3d = {
    Point,
    Polygon,
    Polyline,
    Modal,
    Label,
    Tunnel3D,
    TunnelDeviceMarker3D,
};

Object.entries(elements3d).forEach(([name, Cls]) => {
    registerElement(SceneType.ThreeD, name, (conf, ctx) => new Cls(conf, ctx));
});
