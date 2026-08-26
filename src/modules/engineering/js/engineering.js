import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import queryForm from "@/components/common/queryForm";
import addEngineering from "../components/addEngineering.vue";
import { calcHeight } from "@/utils/funcUtil";
import dict from "@/mixins/dict";

export default {
  components: {
    breadcrumb,
    queryForm,
    addEngineering
  },
  mixins: [dict],
  data() {
    return {
      title: "",
      loading: false,
      detailObj: null,
      selectnum: "0",
      engineeringTypeList: [],
      hasIcon: false,
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
      pageSize: 12,
      total: 0,
      multipleSelection: [],
      show: false,
      maxTableHeight: 0,
      pageDetailsSize: 10,
      detailCurrent: 1,
      //搜索字段
      queryFields: [
        {
          name: "projectName",
          label: "工程名称",
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
    isDisabled(item, fonSize, className) {
      const dom = document.querySelector(`.${className}`);
      if (dom) {
        const g = className === "cardName" ? 0 : 70;
        const w = dom.offsetWidth - g;
        const t = className === "cardName" ? item : this.getType(item);
        const w1 = this.getTextWidth(t, fonSize);
        return w >= w1;
      } else {
        return true;
      }
    },
    getTextWidth(text, font) {
      var span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.whiteSpace = "nowrap";
      span.style.font = font;
      span.textContent = text;
      document.body.appendChild(span);
      var width = span.offsetWidth;
      document.body.removeChild(span);
      return width;
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    getType(item) {
      let str = item;
      this.engineeringTypeList.forEach(i => {
        if (i.value === item) {
          str = i.label;
        }
      });
      return str;
    },
    handleEditEngineering: function(row) {
      this.title = "编辑工程基础信息";
      this.detailObj = { ...row };
      this.$refs.addEngineeringRef.visible = true;
    },
    handleAddEngineering: function() {
      this.title = "创建工程基础信息";
      this.detailObj = null;
      this.$refs.addEngineeringRef.visible = true;
    },
    handleCard(row) {
      this.openTab({
        path: "/version",
        query: {
          id: row.id
        }
      });
    },
    //每页条目数变化
    handleSizeChange(pageSize) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: this.currentPage,
        pageSize: pageSize,
        projectName: queryForm.projectName
      };
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.showEngineeringList(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        projectName: queryForm.projectName
      };
      this.showEngineeringList(params);
    },
    //上一页
    prePage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        projectName: queryForm.projectName
      };
      this.showEngineeringList(params);
    },
    nextPage: function(currentPage) {
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        pageIndex: currentPage,
        pageSize: this.pageSize,
        projectName: queryForm.projectName
      };
      this.showEngineeringList(params);
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
            .deleteProject(params)
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
            .deleteProject(params)
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
    handleSelectionChange: function() {
      let arr = this.tableData.filter(item => {
        return item.isSelected;
      });
      this.multipleSelection = arr;
      this.selectnum = arr.length;
    },
    //普通搜索
    search: function() {
      let _this = this;
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.currentPage = 1;
      let params = {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        ...queryForm
      };
      this.showEngineeringList(params);
    },
    //重置操作
    resetData: function() {
      this.$refs.queryForm.resetQueryForm();
    },
    showEngineeringList: function(params) {
      var _this = this;
      this.loading = true;
      api
        .getPageList(params)
        .then(result => {
          if (result.data.code === "0") {
            var data = result.data;
            data.records.forEach(item => {
              item.isSelected = false;
            });
            _this.tableData = data.records;
            _this.total = data.total;
            _this.handleSelectionChange();
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
    }
  },
  computed: {},
  created() {},
  mounted() {
    let params = {
      pageIndex: 1,
      pageSize: this.pageSize
    };
    this.showEngineeringList(params);
    this.dictTreeItem("engineeringType").then(res => {
      this.engineeringTypeList = res;
    });
    this.initMaxHeight();
  }
};
