import * as THREE from 'three';

/**
 * 模拟鼠标事件
 * 现支持的事件：click mousemove  
 *  TODO 加入mousein mouseout事件 
 */

export class MouseEventListener {

    intersects;

    constructor(dom, camera, object3dArray) {

        dom.addEventListener("click", event => {

            flushIntersects(event);

            if (this.intersects.length != 0) {

                for (let i in this.intersects) {

                    let obj = this.intersects[i].object;

                    if (dealEvent(obj, "click")) {
                        break;
                    }

                }
                
            }
        });


        function dealEvent(obj, eventName) {

            // 处理visible
            let show = obj.visible;
            obj.traverseAncestors(e => { show = show && e.visible })
            
            if (show) {

                obj.dispatchEvent({
                    type: eventName,
                    target: obj,
                    clickTarget: obj,
                })

                // 向父级传递事件
                obj.traverseAncestors(e => {
                    e.dispatchEvent({
                        type: eventName,
                        target: e,
                        clickTarget: obj,
                    });
                })
            }

            return show;
        }


        /**
         *
         */
        let lastIntercectObject = null;

        // dom.addEventListener("mousemove", event => {

        //     flushIntersects(event);

        //     if (this.intersects.length != 0) {
        //         let obj = this.intersects[0].object;
        //         // 向父级传递事件
        //         while (obj) {
        //             obj.dispatchEvent({
        //                 "type": "mousemove",
        //                 "target": obj
        //             });

        //             obj = obj.parent;
        //         }
        //     }
        // });

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const scope = this;

        function flushIntersects(event) {

            pointer.x = (event.clientX / dom.clientWidth) * 2 - 1;
            pointer.y = - (event.clientY / dom.clientHeight) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            scope.intersects = raycaster.intersectObjects(object3dArray);

        }
 
    }



}
