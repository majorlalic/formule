//@ sourceURL=generic-table.js
(function () {
    return {
        props: {
            containerId: {
                type: String,
                default: "table-content",
            },
            columns: {
                type: Array,
                default: [],
            },
            rowKey: {
                type: String,
                default: "id",
            },
            request: {
                type: Function,
            },
            params: {
                type: Object,
            },
            hasIndex: {
                type: Boolean,
                default: false,
            },
            hasSelect: {
                type: Boolean,
                default: false,
            },
            rowForeach: {
                type: Function,
            },
        },
        data() {
            return {
                datas: [],
                pagination: {},
                height: 0,
                hasScroll: false,

                expandedRowKeys: [],

                isLoad: true,
                selectedRowKeys: [],
            };
        },
        watch: {
            datas: {
                handler(newVal, old) {
                    if (newVal.length == old.length) {
                        return;
                    }

                    let containerHeight = document.getElementById(this.containerId).clientHeight;
                    console.log(containerHeight, "height: ");

                    this.$nextTick(() => {
                        let actualHeight = document
                            .getElementById(this.containerId)
                            .querySelector(".ant-table-body table .ant-table-tbody").clientHeight;
                        this.hasScroll = actualHeight > containerHeight - 106;
                        console.log(
                            this.hasScroll +
                                " actualHeight: " +
                                actualHeight +
                                " containerHeight: " +
                                (containerHeight - 106)
                        );
                    });
                },
            },
        },
        computed: {
            slots() {
                if (!this.columns) return [];
                var arr = [];
                this.columns.forEach((p) => {
                    if (p.scopedSlots && p.scopedSlots != null) {
                        arr.push(p.scopedSlots.customRender);
                    }
                });
                return arr;
            },
        },
        mounted() {
            if (this.hasIndex) {
                this.columns.unshift({
                    title: this.$t("序号"),
                    dataIndex: "index",
                    width: "100px",
                    align: "center",
                });
            }
            this.pagination = {
                total: 0,
                pageSize: 10,
                current: 1,
                pageSizeOptions: [10, 20],
                showSizeChanger: true,
                showTotal: (total, range) => {
                    return this.$t("pagination", {
                        total,
                        start: range[0],
                        end: range[1],
                    });
                },
            };
            this.resize();
        },
        methods: {
            query(isResetPage = true, pageChange) {
                if (pageChange) {
                    this.params.pageNumber = this.pagination.current;
                    this.params.pageSize = this.pagination.pageSize;
                } else {
                    // 搜索条件变更后, 分页参数需重置
                    if (isResetPage) {
                        this.params.pageNumber = 1;
                        if (this.hasSelect) {
                            this.selectedRowKeys = [];
                            this.$emit("on-select-change", []);
                        }
                    }
                    this.pagination.current = this.params.pageNumber;
                    this.pagination.pageSize = this.params.pageSize;
                }

                // 参数记忆
                localStorage.setItem(location.href.replace(location.origin, ""), JSON.stringify(this.params));

                this.isLoad = true;
                // 发起请求
                this.request(this.params)
                    .then((res) => {
                        if (res.list?.length > 0 && !!!res.rows) {
                            res.rows = res.list;
                        }
                        if (!res.rows) res.rows = [];

                        // 列渲染
                        if (this.rowForeach) {
                            this.rowForeach(res.rows);
                        }

                        // 序号
                        for (let i = 0; i < res?.rows?.length; i++) {
                            res.rows[i].index = this.pagination.pageSize * (this.pagination.current - 1) + i + 1;
                        }

                        this.datas = res.rows;
                        this.pagination.total = res.total || res.totalCount;
                    })
                    .finally(() => {
                        this.isLoad = false;
                    });
            },
            onChangePage(pagination) {
                this.pagination = pagination;
                this.query(null, true);
            },
            onSelectChange(selectedRowKeys) {
                if (!this.hasSelect) {
                    return;
                }
                console.log("selectedRowKeys changed: ", selectedRowKeys);
                this.selectedRowKeys = selectedRowKeys;
                this.$emit("on-select-change", selectedRowKeys);
            },
            resize() {
                this.$nextTick(() => {
                    // 42列头 64分页
                    let containerHeight = document.getElementById(this.containerId).clientHeight;
                    this.height = containerHeight - 106;
                });
            },
        },
    };
})();
