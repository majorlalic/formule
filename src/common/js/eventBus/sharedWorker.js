const ports = [];

addEventListener("connect",e => {
    const port = e.ports[0];

    if (ports.indexOf(port) == -1) {
        ports.push(port);
        port.start();
    }

    port.addEventListener("message", e => {
        if(e.data == null || e.data == undefined) return;
        let { type, body, from,windowTime} = e.data;
        switch(type) {
            default:
                emitEvent(type, body, from,windowTime, port);
            break;
        }
    })
})

function emitEvent(type, body, from,windowTime, selfPort) {
    ports.forEach(port => {
            port.postMessage( { type, body, from,windowTime})
    })
}