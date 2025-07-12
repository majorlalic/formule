(async function () {
    const http = await import('/common/js/http.js');
    const { getDataCenterUrl } = await import('/common/js/utils.js');
    return {
        props: {
            /**
            * 开启搜索
            */
            searchTree: { type: Boolean, default: false },
            /**
             * 数据请求地址
             */
            dataUrl: { type: String, default: '' },
            /**
             * 节点前是否添加复选框
             */
            checkable: { type: Boolean, default: false },
            /**右键菜单 { key: '1', title: "asdas" } 注意需要配置node节点的canContextMenu 属性，必须配置为true才显示，没有配置或者为false不显示*/
            menus: { type: Array, default: [] },
            /**右键菜单回调 */
            contextMenuClickCall: { type: Function, default: () => { } },
            requestType: { type: String, default: 'get' },
            /**
             * 是否展示右键菜单,默认不展示
             */
            contextMenuShow: { type: Function, default: node => false },
        },
        data() {
            return {
                treeData: [],
                selectedKeys: [],
                expandedKeys: [],
                searchValue: '',
                checkedKeys: [],
            };
        },
        watch: {
            checkedKeys: {
                handler(newVal, oldVal) {
                    this.$emit('checkedkeyschanged', newVal);
                }
            }
        },
        computed: {

        },
        mounted() {
        },
        methods: {
            getData() {
                if (!this.dataUrl.startsWith('http') && !this.dataUrl.startsWith('https'))
                    this.dataUrl = `${getDataCenterUrl()}${this.dataUrl}`;

                //接口调用成功回调
                var callback = data => {
                    this.generateTree(data);
                    this.$emit('after-get-treedata', this.treeData);
                };
                if (this.requestType.toLowerCase() == 'post') {
                    http.default.post(this.dataUrl, {}).then(data => {
                        callback(data);
                    });
                } else {
                    http.default.get(this.dataUrl, {}).then(data => {
                        callback(data);
                    });
                }
            },
            generateTree(data) {
                if (!data) {
                    return;
                }
                data.forEach(p => {
                    this.dataHandle(p);
                });
                this.treeData = data;
            },
            /**
            * 处理树
            * @param {*} data 
            */
            dataHandle(data) {
                data.scopedSlots = {
                    title: "custom"
                };
                data.key = data.id;
                data.title = data.name;
                data.canContextMenu = this.contextMenuShow(data);
                for (let j = 0; j < data.children.length; j++) {
                    if (data.children[j].children && data.children[j].children.length > 0) {
                        this.dataHandle(data.children[j])
                    } else {
                        data.children[j].scopedSlots = {
                            title: "custom"
                        };
                        data.children[j].key = data.children[j].id;
                        data.children[j].title = data.children[j].name;
                        data.children[j].canContextMenu = this.contextMenuShow(data.children[j]);
                    }
                }
            },
            onExpand(expandedKeys, node) {
                this.expandedKeys = expandedKeys;
            },
            onSearchValueChanged(e) {
                var expandedKeys = [];
                if (this.searchValue) {
                    this.treeData.forEach(node => {
                        this.searchTreeData(node, expandedKeys);
                    });
                }
                this.expandedKeys = expandedKeys;
            },
            searchTreeData(node, expandedKeys) {
                if (!node.children)
                    return;

                if (node.children.length > 0) {
                    node.children.forEach(p => {
                        this.searchTreeData(p, expandedKeys);
                    });
                }
                if (node.children.some(p => p.title.indexOf(this.searchValue) > -1)) {
                    expandedKeys.push(node.key);
                }
            },
            setCheckedKeys(keys) {
                this.checkedKeys = keys;
            },
            /**查找节点,内部方法 */
            _getNode(key, tree) {
                let resultNode;
                for (let i = 0; i < tree.length; i++) {
                    const node = tree[i];
                    if (node.key == key)
                        resultNode = node;
                    if (node.children) {
                        if (node.children.some(item => item.key === key)) {
                            resultNode = node.children.filter(item => item.key === key)[0];
                        } else if (this._getNode(key, node.children)) {
                            resultNode = this._getNode(key, node.children);
                        }
                    }
                }
                return resultNode;
            },
            /**
             * 外部调用
             * @param {*} treeKey 
             */
            getNode(treeKey) {
                return this._getNode(treeKey, this.treeData);
            },
            onContextMenuClick(treeKey, menuKey) {
                var node = this._getNode(treeKey, this.treeData);
                this.contextMenuClickCall(treeKey, menuKey, node);
            },
            onTreeSelected(selectedKeys, e) {
                var node = this._getNode(selectedKeys[0], this.treeData);
                this.$emit('on-tree-selected', selectedKeys[0], node);
            }
        },
    };
})();
