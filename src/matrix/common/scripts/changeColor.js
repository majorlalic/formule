//@ sourceURL=changeColor.js
import { Colors } from "/matrix/common/core/const.js";

export async function run({ ele, dispatcher }) {
    if (ele.data.state == 0) {
        dispatcher.changeColor(ele, Colors.Normal);
    } else if (ele.data.state == 1) {
        dispatcher.changeColor(ele, Colors.Error);
    }
}
