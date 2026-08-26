import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import queryForm from "@/components/common/queryForm";
import addMonitoringCode from "../components/addMonitoringCode.vue";
import { calcHeight } from "@/utils/funcUtil";
import dict from "@/mixins/dict";

export default {
  components: {
    breadcrumb,
    queryForm,
    addMonitoringCode
  },
  mixins: [dict],
  data() {
    return {
      title: "",
      isEffectiveList: [],
      targetList: [],
      loading: false,
      detailObj: null,
      selectnum: "0",
      hasIcon: false,
      parentMonitoringCodeList: [],
      brand: [{ name: "tm.template_manage" }, { name: "tm.email_template" }],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      isSelected: [],
      is_collapse: false,
      dialogDetails: false,
      tableData: [],
      objData: {
        id: ""
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      multipleSelection: [],
      show: false,
      maxTableHeight: 0,
      pageDetailsSize: 10,
      detailCurrent: 1,
      //搜索字段
      queryFields: [
        {
          name: "name",
          label: "监控名称",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "code",
          label: "监控码",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "target",
          label: "监控目标",
          labelKey: "",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: []
        },
        {
          name: "effective",
          label: "使用状态",
          labelKey: "",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: []
        }
      ]
    };
  },
  methods: {
    async handUpLoad(fileobj) {
      try {
        const param = new FormData();
        param.append("file", fileobj.file);
        const { data } = await api.importCodeExcel(param);
        if (data.code !== "0") {
          this.$message.error(data.errors || "失败");
          reutrn;
        }
        this.$message.success(data.msg);
        this.$refs.upload.clearFiles();
        this.resetData();
      } catch (error) {
        this.$message.error(data.msg);
      }
    },
    exportData() {
      let params = this.$refs.queryForm.getQueryForm();
      params["ids"] = this.multipleSelection.map(d => d.id);
      api.monitorCodeExportExcel(params).then(result => {
        const blob = new Blob([result.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "监控码.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
    downloadTemplate() {
      let params = "";
      api.downloadExcelCodeTemplate(params).then(result => {
        const blob = new Blob([result.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "监控码导入模板.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
    copyToClipboard(item) {
      const el = document.createElement("textarea");
      el.value = item;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$message.success("复制成功！");
    },
    getEffective(item) {
      let str = "";
      if (item === "N") {
        str = "失效";
      } else if (item === "Y") {
        str = "生效";
      }
      return str;
    },
    getTarget(item) {
      let str = item;
      this.targetList.forEach(i => {
        if (i.value === item) {
          str = i.label;
        }
      });
      return str;
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    selectableMethod(row) {
      return !row.parent;
    },

    //生效 失效
    batchUpdateEffective(row, effective) {
      let _this = this;
      let ids = [];
      if (row) {
        ids = [row.id];
      } else {
        ids = this.multipleSelection.map(item => {
          return item.id;
        });
      }
      this.$confirm(
        `确认是否生效或
        失效`,
        "提示",
        { type: "warning" }
      )
        .then(res => {
          let params = { ids, effective };
          api
            .batchUpdateEffective(params)
            .then(result => {
              if (result.data.code == "0") {
                _this.$message({
                  message: "操作成功",
                  type: "success"
                });
                _this.resetData();
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              _this.$message({
                message: err,
                type: "warning"
              });
            });
        })
        .catch(() => {});
    },
    handleEditMonitoringCode: function(row) {
      this.title = "编辑监控码";
      this.detailObj = { ...row };
      this.$refs.monitoringCodeRef.visible = true;
    },
    handleAddMonitoringCode: function() {
      this.title = "创建监控码";
      this.detailObj = null;
      this.$refs.monitoringCodeRef.visible = true;
    },
    //每页条目数变化
    handleSizeChange(pageSize) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: this.currentPage,
        pageSize: pageSize,
        ...queryForm
      };
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.showMonitoringCodeList(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringCodeList(params);
    },
    //上一页
    prePage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringCodeList(params);
    },
    nextPage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringCodeList(params);
    },
    delClick(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("tm.delete_tips"), _this.$t("tm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let ids = [row.id];
          let params = ids;
          api
            .deleteCodes(params)
            .then(result => {
              if (result.data.code == "0") {
                _this.$message({
                  message: _this.$t("dict.deletesuccess"),
                  type: "success"
                });
                _this.resetData();
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              _this.$message({
                message: err,
                type: "warning"
              });
            });
        })
        .catch(() => {
          //取消操作
        });
    },
    batchDel: function(rows) {
      //进行批量删除操作
      let _this = this;
      _this
        .$confirm(this.$t("tm.delete_batch"), _this.$t("tm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let ids = this.multipleSelection.map(item => {
            return item.id;
          });
          let params = ids;
          api
            .deleteCodes(params)
            .then(result => {
              if (result.data.code == "0") {
                _this.$message({
                  message: _this.$t("dict.deletesuccess"),
                  type: "success"
                });
                _this.resetData();
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              _this.$message({
                message: err,
                type: "warning"
              });
            });
        })
        .catch(() => {
          //取消操作
        });
    },
    handleSelectionChange: function(val) {
      this.multipleSelection = val;
      if (val && val.length) {
        this.selectnum = val.length;
      } else {
        this.selectnum = 0;
      }
    },
    //普通搜索
    search: function() {
      let _this = this;
      this.currentPage = 1;
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringCodeList(params);
    },
    //重置操作
    resetData: function() {
      this.$refs.queryForm.resetQueryForm();
    },
    showMonitoringCodeList: function(params) {
      var _this = this;
      params.projectId = this.$route.query.id || "";
      this.loading = true;
      api
        .getPageList(params)
        .then(result => {
          if (result.data.code == "0") {
            var data = result.data;
            _this.tableData = data.records;
            _this.total = data.total;
            this.loading = false;
          } else {
            _this.$message({
              message: result.data.msg,
              type: "warning"
            });
            this.loading = false;
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
      this.loading = false;
    }
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  created() {},
  mounted() {
    let params = {
      pageIndex: 1,
      pageSize: this.pageSize
    };
    this.dictTreeItem("isEffective").then(res => {
      this.isEffectiveList = res;
      this.queryFields.forEach(item => {
        if (item.name === "effective") {
          item.fieldMap = this.isEffectiveList;
        }
      });
    });
    this.dictTreeItem("monitoringTarget").then(res => {
      this.targetList = res;
      this.queryFields.forEach(item => {
        if (item.name === "target") {
          item.fieldMap = this.targetList;
        }
      });
    });
    this.showMonitoringCodeList(params);
    this.initMaxHeight();
  }
};
