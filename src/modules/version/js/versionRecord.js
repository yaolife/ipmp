import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import queryForm from "@/components/common/queryForm";
import addVersionCord from "../components/addVersionCord.vue";
import impactItems from "../components/impactItems.vue";
import { calcHeight } from "@/utils/funcUtil";
import dict from "@/mixins/dict";

export default {
  components: {
    breadcrumb,
    queryForm,
    addVersionCord,
    impactItems
  },
  mixins: [dict],
  data() {
    return {
      title: "",
      isDisabled: false,
      loading: false,
      detailObj: null,
      detailimpactItemsObj: null,
      selectnum: "0",
      hasIcon: false,
      impactTypeList: [],
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
          name: "describe",
          label: "版本调整说明",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1
        }
      ]
    };
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    backPage() {
      window.history.back()
    },
    handleImpactItems(row) {
      this.detailimpactItemsObj = { ...row };
      this.$refs.impactItemsRef.visible = true;
    },
    handleEditVersion: function(row) {
      this.title = "编辑版本调整记录";
      this.detailObj = { ...row };
      this.isDisabled = true;
      this.$refs.addVersionCordRef.visible = true;
    },
    handleAddVersion: function() {
      this.title = "创建版本调整记录";
      this.detailObj = null;
      this.isDisabled = false;
      this.$refs.addVersionCordRef.visible = true;
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
      this.showVersionRecordList(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionRecordList(params);
    },
    //上一页
    prePage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionRecordList(params);
    },
    nextPage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showVersionRecordList(params);
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
            .deleteAdjust(params)
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
            .deleteAdjust(params)
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
      this.showVersionRecordList(params);
    },
    //重置操作
    resetData: function() {
      this.$refs.queryForm.resetQueryForm();
    },
    showVersionRecordList: function(params) {
      var _this = this;
      params.versionId = this.$route.query.id || "";
      this.loading = true;
      api
        .adjustGetPageList(params)
        .then(result => {
          if (result.data.code !== "1") {
            var data = result.data;
            _this.tableData = data.records;
            // _this.pageSize = data.pageDto.pageSize;
            // _this.pageIndex = data.pageDto.currentPage;
            _this.total =  data.total;
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
    this.showVersionRecordList(params);
    this.dictTreeItem("impactType").then(res => {
      this.impactTypeList = res;
    });
    this.initMaxHeight();
  }
};
