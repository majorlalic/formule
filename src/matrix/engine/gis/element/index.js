import { registerElement } from "../../../common/core/registry/elementRegistry.js";
import { SceneType } from "../../../common/core/const.js";

import Point from "./point.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import Label from "./label.js";
import CirclePoint from "./circlePoint.js";

const elementsGis = {
    Point,
    Polygon,
    Polyline,
    CirclePoint,
    Label,
};

Object.entries(elementsGis).forEach(([name, Cls]) => {
  registerElement(SceneType.Gis, name, (conf, ctx) => new Cls(conf, ctx));
});