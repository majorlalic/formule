//@ sourceURL=org-tree.js
(async function () {
    const { transformData2Ant, flatArr } = await import("/common/js/utils.js");
    const { default: dataCenterApi } = await import("/common/api/dataCenterApi.js");
    return {
        props: {
            value: {
                type: String,
                default: "",
            },
        },
        data() {
            return {
                treeData: [],
            };
        },
        watch: {
            value: {
                deep: true,
                immediate: true,
                handler(newVal, oldVal) {
                    this.$emit("update:value", newVal);
                    this.$emit("change", newVal);
                },
            },
        },
        mounted() {
            this.init();
        },
        methods: {
            getMinimalIds(ids) {
                if (this.flatArr?.length > 0) {
                    let removeIds = [];
                    ids.forEach(id => {
                        // 包含其父元素, 则添加到移除列表
                        if(ids.includes(this.flatArr.find(i => i.id == id).parentId)){
                            removeIds.push(id);
                        }
                    });
                    return ids.filter(i => !removeIds.includes(i));
                } else {
                    return ids;
                }
            },
            init() {
                dataCenterApi.queryOrgTree().then((data) => {
                    this.treeData = transformData2Ant(data, this.selectableType);
                    this.flatArr = flatArr(data, "children");
                    // 初始化时没值, 则赋予初始值
                    if (!this.value) {
                        let target = this.getSelectableItem(this.treeData[0]);
                        if (target) {
                            this.value = target.key;
                        }
                    }
                });
            },
            getSelectableItem(node) {
                if (!node) return null;

                if (node.selectable) {
                    return node;
                }

                if (node.children && Array.isArray(node.children)) {
                    for (const child of node.children) {
                        const result = this.getSelectableItem(child);
                        if (result) return result;
                    }
                }

                return null;
            },
        },
    };
})();
