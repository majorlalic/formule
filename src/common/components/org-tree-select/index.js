//@ sourceURL=org-tree-select.js
(async function () {
    const { transformData2Ant } = await import("/common/js/utils.js");
    const { default: dataCenterApi } = await import("/common/api/dataCenterApi.js");
    return {
        props: {
            value: {
                type: String,
                default: "",
            },
            placeholder: {
                type: String,
                default: "请选择机构",
            },
            selectableType: {
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
            init() {
                dataCenterApi.queryOrgTree().then((data) => {
                    this.treeData = transformData2Ant(data, this.selectableType);
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
