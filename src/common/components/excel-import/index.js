(function () {
    return {
        props: {
            batchImport: { type: Function, default: () => { } },//导入处理方法
            successCallback: { type: Function, defaut: () => { } },//导入成功后回调
        },
        data() {
            return {
                visible: false,
                importFile: null,
                importLoading: false,
                importModalShowInfo: false,//批量导入用户模态框返回信息是否显示
                infoTips: [],
                showSpin: false,
            }
        },
        methods: {
            openImportModal() {
                this.visible = true;
            },
            /**
             * 关闭上传模态框
             */
            closeImportModal() {
                this.infoTips = [];
                this.importFile = null;
                var file = document.getElementById('userImportFileInput');
                file.value = '';
                this.visible = false;
                this.$emit('close');
            },
            /**
            * 选择导入文件触发
            * @param $event
            */
            selectImportFile($event) {
                var target = $event.target;
                var file = target.files[0];
                this.importFile = file;
                this.checkImportFile(file);
            },
            /**
             * 检查导入文件
             * @param file
             * @returns {boolean}
             */
            checkImportFile(file) {
                var result = true;
                if (!file) {
                    this.$message.warning(this.$t("导入文件不能为空！"));
                    result = false;
                } else {
                    var fileName = file.name;
                    var index = fileName.lastIndexOf('.');
                    var extension = fileName.substring(index + 1);
                    if (extension.toLocaleLowerCase() != 'xls' && extension.toLocaleLowerCase() != 'xlsx') {
                        this.$message.warning(this.$t("目前只支持xlsx和xls格式的excel文件,请下载导入模版后重试"));
                        result = false;
                    }
                }
                return result;
            },
            confirmImport() {
                if (this.checkImportFile(this.importFile)) {
                    this.importLoading = true;
                    var myform = new FormData();
                    myform.append('file', this.importFile);


                    this.batchImport(myform).then(
                        res => {
                            this.importLoading = false;
                            if (res.code == 500) {
                                this.$message.warning(this.$t("导入失败"));
                                this.infoTips = res.msg.split(";");
                                this.importModalShowInfo = true;
                            }
                            else {
                                this.$message.warning(this.$t("导入成功"));
                                this.closeImportModal();
                                this.successCallback();
                            }
                        },
                        err => {
                            this.importLoading = false;
                            this.$message.warning(this.$t("导入失败，请重试"));
                        }
                    );
                }
            },
        },
    };
})();
