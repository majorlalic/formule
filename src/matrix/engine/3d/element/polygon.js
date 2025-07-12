import Element3d from "./element3d.js";

/**
 * 多边形类型定义
 */
export default class Polygon extends Element3d {
    constructor(ele) {
        super(ele);
    }

    /**
     * 初始化
     */
    init(ele) {
        super.init();

        this.initName();
        
        this.group.position.copy(ele.graph.position);
        // 多边形实现
    }
}
