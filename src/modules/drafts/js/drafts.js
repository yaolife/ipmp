import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import { Filters } from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
import osUtil from "@/utils/osUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";
import store from "@/store";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [{ name: "lang.asset_manage" }, { name: "lang.pipe_database" }],
      selectnum: "0",
      isSelected: [],
      is_collapse: false,
      tableData: [],
      objData: {
        id: ""
      },
      modelVO: {
        processName: "",
        createDate: "",
        createDateEnd: ""
      },
      queryFields: [
        { name: 'processName', label: '', labelKey: 'workbench.process_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'createDate', label: '', labelKey: 'workbench.create_date', relation: 'createDateEnd', value: '', type: 'dateRange', display: true, order: 2 },
      ],
      delModel: {
        id: "",
        customForm: null
      },
      createDate: null,
      currentPage: 1,
      current: 1,
      pageSize: 10,
      size: 10,
      total: 0,
      multipleSelection: [],
      show: false,
      loading: false,
      fullscreenLoading: false,
      maxTableHeight: 0
    };
  },

  watch: {
    /**
     * 切换语言时重新查询表单
     */
    "$i18n.locale"() {
      this.search();
    }
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },

  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    checkSelected: function (val) {
      //val 为更新后的值
      if (val == true) {
        let rows = this.tableData;
        rows.forEach(row => {
          this.$refs.multipleSelection.toggleRowSelection(row, true);
        });
      } else {
        this.$refs.multipleSelection.clearSelection();
      }
    },

    handleClick(row) {
      let params = {
        processInfoId: row.processInfoId,
        flowStatus: row.flowStatus
      };
      api.checkDrafts(params).then(res => {
        if (res.code === "0") {
          row.procNode = 1;
          // row.procNode = 3;
          sessionStorage.removeItem("procItem");
          sessionStorage.setItem("procItem", JSON.stringify(row));
          if (row.formUrl) {
            this.$router.push({
              path: row.formUrl,
              query: {
                actId: row.actId,
                procNode: row.procNode,
                procVersion: row.procVersion,
                procId: row.procId,
                id: row.procTaskId,//待确定
                actInstId: row.actInstId,//待确定
                procInstId: row.procInstId,
                procName: row.procName,
                r: Math.random(),
                flowStatus: row.flowStatus
              }
            });
          } else {
            //打开页签
            this.openTab({
              path: "/workbench/view",
              query: {
                // item: row
                procName: row.procName,
                r: Math.random()
              }
            });
          }
        } else {
          this.$alert(res.msg);
          this.search();
        }
      });
    },
    //改变每页显示数
    handleSizeChange: function (size) {
      let params = {
        current: 1,
        size: size
      };
      this.size = size;
      this.current = 1;
      //params = Object.assign(params,this.searchParams);
      this.getFlowList(params);
    },

    //翻页
    handleCurrentChange: function (current) {
      let params = {
        current: current,
        size: this.size
      };
      this.current = current;
      this.getFlowList(params);
    },

    delClick(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("cm.is_delete"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          let params = {};
          _this.delModel.id = row.processInfoId;
          if (row.formUrl) {
            _this.delModel.customForm = 1
          } else {
            _this.delModel.customForm = 0
          }
          params = Object.assign(params, _this.delModel);
          this.fullscreenLoading = true;
          console.log(params, 'params')
          api
            .deleteMyDraftsV2({ reqDeleteDraftDtoList: params })
            .then(result => {
              this.fullscreenLoading = false;
              if (result.code == "0") {
                let params = {
                  pageIndex: 1,
                  size: this.size
                };
                _this.$message({
                  message: result.msg,
                  type: "success"
                });
                _this.resetData();
                _this.getFlowList(params);
              } else {
                _this.$message({
                  message: result.msg,
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
          this.fullscreenLoading = false;
        });
    },

    batchDel: function (rows) {
      //进行批量删除操作
      let _this = this;
      console.log(_this.multipleSelection, '_this.multipleSelection')
      if (_this.multipleSelection.length > 0) {
        _this
          .$confirm(this.$t("workbench.delete_batch"), _this.$t("cm.tips"), {
            type: "warning",
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default"
          })
          .then(() => {
            let arr = [];
            for (var i = 0; i < _this.multipleSelection.length; i++) {
              if (_this.multipleSelection[i].formUrl) {
                arr.push({
                  customForm: 1,
                  id: _this.multipleSelection[i].processInfoId
                })
              } else {
                arr.push({
                  customForm: 0,
                  id: _this.multipleSelection[i].processInfoId
                })

              }
            }
            this.fullscreenLoading = true;
            api
              .deleteMyDraftsV2({ reqDeleteDraftDtoList: arr })
              .then(result => {
                this.fullscreenLoading = false;
                if (result.code == "0") {
                  let params = {
                    pageIndex: 1,
                    size: this.size
                  };
                  _this.$message({
                    message: result.msg,
                    type: "success"
                  });
                  _this.resetData();
                  _this.getFlowList(params);
                } else {
                  _this.$message({
                    message: result.msg,
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
      } else {
        _this.$message({
          message: "tm.no_any_selected",
          type: "warning"
        });
      }
    },
    handleSelectionChange: function (val) {
      this.multipleSelection = val;
      this.selectnum = val.length;
    },

    //普通搜索
    search: function () {
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.current = 1;
      //除去搜索条件前后空格内容
      this.modelVO.processName = queryForm.processName.trim();
      this.modelVO.createDate = queryForm.createDate;
      this.modelVO.createDateEnd = queryForm.createDateEnd;

      let params = {
        pageIndex: 1,
        size: 10
      };
      params = Object.assign(params, this.modelVO);
      this.getFlowList(params);
    },
    //重置操作
    resetData: function () {
      this.multipleSelection = [];
      this.modelVO.processName = "";
      this.modelVO.createDate = "";
      this.modelVO.createDateEnd = "";
    },

    //获取列表
    getFlowList: function (params) {
      this.values = false;
      this.loading = true;
      if (!params) {
        params = {
          current: this.current,
          size: this.size
        };
      }
      let _this = this;
      api.pageListAPI(params).then(res => {
        this.loading = false;
        if (res.code === "0") {
          _this.tableData = res.records;
          _this.total = res.total;
          //设置草稿菜单数量标记
          let count = res.total > 99 ? '99+' : res.total;
          //提交到store
          store.commit('setBadgeCount', { name: 'draftCount', count: count });
        }
      });
    },
    //日期拼接
    dateGet(param) {
      if (param) {
        return Filters.timeFormat(param, "yyyy/MM/dd HH:mm");
      }
    }
  },

  mounted() {
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    let params = {
      pageIndex: 1,
      size: 10
    };
    this.getFlowList(params);
    window.refreshAllTaskCount = this.getFlowList;
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
