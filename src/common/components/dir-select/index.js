//@ sourceURL=dir-select.js
(async function () {
    const { getDirByKey } = await import("/common/js/dir.js");
    return {
        props: {
            dirType: {
                type: String,
                default: "",
            },
            value: {
                type: String,
                default: "",
            },
            placeholder: {
                type: String,
                default: "请选择",
            }
        },
        data() {
            return {
                options: [],
            };
        },
        watch: {
            value: {
                deep: true,
                immediate: true,
                handler(newVal, oldVal) {
                    this.$emit('update:value', newVal);
                },
            },
        },
        async mounted() {
            // this.initSelect();
            this.options = await getDirByKey(this.dirType);
        },
        methods: {
            initSelect() {
                let dirObj = Storage.get("dir");
                if (dirObj && dirObj.hasOwnProperty(this.dirType)) {
                    this.options = dirObj[this.dirType];
                } else {
                    this.queryDirs().then((obj) => {
                        if (obj.hasOwnProperty(this.dirType)) {
                            this.options = obj[this.dirType];
                        } else {
                            console.warn(`字典表不存在${this.dirType}, 请联系管理员`);
                        }
                    });
                }
            },
            queryDirs() {
                return new Promise((resolve, reject) => {
                    dataCenterApi.queryDirs().then((data) => {
                        // 对字典分类
                        let dirObj = {};
                        data.forEach((item) => {
                            // 存在
                            if (dirObj.hasOwnProperty(item.type)) {
                                dirObj[item.type].push({
                                    key: item.key,
                                    value: item.value,
                                });
                            } else {
                                dirObj[item.type] = [
                                    {
                                        key: item.key,
                                        value: item.value,
                                    },
                                ];
                            }
                        });
                        Storage.set("dir", dirObj);
                        resolve(dirObj);
                    });
                });
            },
        },
    };
})();
