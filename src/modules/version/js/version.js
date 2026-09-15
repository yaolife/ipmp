import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import queryForm from "@/components/common/queryForm";
import addVersion from "../components/addVersion.vue";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm,
    addVersion
  },
  data() {
    return {
      title: "",
      isDisabled: false,
      loading: false,
      detailObj: null,
      selectnum: "0",
      hasIcon: false,
      parentVersionList: [],
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
          name: "version",
          label: "版本号",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "parentVersion",
          label: "父级版本",
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
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    selectableMethod(row) {
      return !row.parent;
    },
    backPage() {
      window.history.back()
    },
    //版本调整记录
    handleVersionRecord(row) {
      this.openTab({
        path: "/versionRecord",
        query: {
          id: row.id
        }
      });
    },
    //版本比对
    handleVersionComparison() {
      this.openTab({
        path: "/versionComparison",
        query: {
          id: this.$route.query.id || ""
        }
      });
    },
    handleEditVersion: function(row) {
      this.title = "编辑版本";
      this.detailObj = { ...row };
      this.isDisabled = true;
      this.$refs.addVersionRef.visible = true;
    },
    handleAddVersion: function() {
      this.title = "创建版本";
      this.detailObj = null;
      this.isDisabled = false;
      this.$refs.addVersionRef.visible = true;
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
      this.showVersionList(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionList(params);
    },
    //上一页
    prePage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionList(params);
    },
    nextPage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionList(params);
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
          let params = { ids };
          api
            .deleteVersion(params)
            .then(result => {
              if (result.data.code !== "1") {
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
          let params = { ids };
          api
            .deleteVersion(params)
            .then(result => {
              if (result.data.code !== "1") {
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
      this.showVersionList(params);
    },
    //重置操作
    resetData: function() {
      this.$refs.queryForm.resetQueryForm();
      this.getVersionsUrl();
    },
    showVersionList: function(params) {
      var _this = this;
      params.projectId = this.$route.query.id || "";
      this.loading = true;
      api
        .getPageList(params)
        .then(result => {
          if (result.data.code !== "1") {
            var data = result.data;
            _this.tableData = data.records;
            // _this.pageSize = data.pageDto.pageSize;
            // _this.pageIndex = data.pageDto.currentPage;
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
    },
    getVersionsUrl() {
      let _this = this;
      let params = {
        projectId: this.$route.query.id
      };
      api
        .getVersions(params)
        .then(result => {
          console.log(result)
          if (result.data.code !== "1") {
            let obj = {
              label: "......",
              value: "---"
            };
            let arr = result.data.records.map(item => {
              return {
                label: item,
                value: item
              };
            });
            arr.push(obj);
            this.parentVersionList = [...arr];
            this.queryFields.forEach(item => {
              if (item.name === "parentVersion") {
                item.fieldMap = [...this.parentVersionList];
              }
            });
          }
        })
        .catch(err => {
          console.log(1111, err)
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
    this.showVersionList(params);
    this.initMaxHeight();
    this.getVersionsUrl();
  }
};
