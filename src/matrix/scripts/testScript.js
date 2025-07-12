//@ sourceURL=testScript.js
export async function run({ ele, dispatcher }) {
    if (ele.data.value % 2 == 0) {
        dispatcher.changeColor(ele, "#2F7CEE");
    } else {
        dispatcher.changeColor(ele, "#FABE11");
    }
}
