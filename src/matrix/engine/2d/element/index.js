import { registerElement } from "../../../common/core/registry/elementRegistry.js";
import { SceneType } from "../../../common/core/const.js";

import Point from "./point.js";
import Polygon from "./polygon.js";
import Polyline from "./polyline.js";
import TextLine from "./textLine.js";
import Label from "./label.js";
import Picture from "./picture.js";
import PointLine from "./pointLine.js";

const elements2d = {
    Point,
    Polygon,
    Polyline,
    TextLine,
    PointLine,
    Picture,
    Label,
};

Object.entries(elements2d).forEach(([name, Cls]) => {
  registerElement(SceneType.TwoD, name, (conf, ctx) => new Cls(conf, ctx));
});
