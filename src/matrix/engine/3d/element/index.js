import { registerElement } from "../../../common/core/registry/elementRegistry.js";
import { SceneType } from "../../../common/core/const.js";

import Point from "./point.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Label from "./label.js";
import Modal from "./modal.js";

const elements3d = {
    Point,
    Polygon,
    Polyline,
    Modal,
    Label,
};

Object.entries(elements3d).forEach(([name, Cls]) => {
    registerElement(SceneType.ThreeD, name, (conf, ctx) => new Cls(conf, ctx));
});
