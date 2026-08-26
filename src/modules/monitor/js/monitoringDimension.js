import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import queryForm from "@/components/common/queryForm";
import addMonitoringDimension from "../components/addMonitoringDimension.vue";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm,
    addMonitoringDimension
  },
  data() {
    return {
      title: "",
      parentId: "",
      isDisabled: false,
      codeList: [],
      loading: false,
      detailObj: null,
      selectnum: "0",
      hasIcon: false,
      parentMonitoringDimensionList: [],
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
          label: "维度名称",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "monitorCode",
          label: "监控码",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "id",
          label: "维度ID",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 3
        }
      ]
    };
  },
  methods: {
    async handUpLoad(fileobj) {
      try {
        const param = new FormData();
        param.append("file", fileobj.file);
        param.append("moduleId", this.$route.query.id);
        const { data } = await api.importDimensionExcel(param);
        if (data.code !== "0") {
          this.$message.error(data.errors ? data.errors : data.msg);
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
      let params = {
        moduleId: this.$route.query.id
      };
      api.monitorDimensionExportExcel(params).then(result => {
        const blob = new Blob([result.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "监控维度.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
    downloadTemplate() {
      let params = "";
      api.downloadExcelTemplate(params).then(result => {
        const blob = new Blob([result.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "监控维度导入模板.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
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
    handleEditMonitoringDimension: function(row) {
      this.title = "编辑维度";
      this.detailObj = { ...row };
      this.parentId = "";
      this.$refs.monitoringDimensionRef.visible = true;
    },
    handleAddMonitoringDimension: function(id) {
      this.parentId = id || "";
      this.title = "创建维度";
      this.detailObj = null;
      this.$refs.monitoringDimensionRef.visible = true;
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
          let params = { id: row.id };
          api
            .deleteDimes(params)
            .then(result => {
              if (result.data.code == "0") {
                _this.$message({
                  message: _this.$t("dict.deletesuccess"),
                  type: "success"
                });
                _this.search();
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
      this.showMonitoringDimension(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringDimension(params);
    },
    //上一页
    prePage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringDimension(params);
    },
    nextPage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showMonitoringDimension(params);
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
      this.showMonitoringDimension(params);
    },
    //重置操作
    resetData: function() {
      this.$refs.queryForm.resetQueryForm();
    },
    showMonitoringDimension: function(params) {
      params['moduleId'] = this.$route.query.id || "";

      var _this = this;
      this.loading = true;
      api
        .dimensionGetPageList(params)
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
          console.log('err', err)
          _this.$message({
            message: err,
            type: "warning"
          });
        });
      this.loading = false;
    },
    getPageList(code) {
      let _this = this;
      let params = {
        pageSize: 100,
        pageIndex: 1,
        code
      };
      api
        .getPageList(params)
        .then(result => {
          if (result.data.code == "0") {
            this.codeList = (result.data.result ||[]).map(item => {
              return {
                label: `${item.name}-${item.code}`,
                value: item.code
              };
            });
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
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
    console.log(1111111111)
    this.showMonitoringDimension(params);
    this.initMaxHeight();
    this.getPageList("");
  }
};
