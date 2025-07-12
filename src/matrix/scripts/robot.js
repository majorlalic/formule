//@ sourceURL=testScript.js
export async function run({ ele, dispatcher }) {
    setTimeout(() => {
       dispatcher.changePosition(ele,50, 1000); 
    }, 2000);
}
