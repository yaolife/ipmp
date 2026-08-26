import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
// import PersonSelect from '@/components/asc/PersonSelect'
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
import { CgnBpmnMap } from "psc-module";
import { Filters } from "@/utils/Utils";
import { throttle } from "@/utils/funcUtil";
// import personSelect from "@@/components/easy-cud-person-select";
import osUtil from "@/utils/osUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    // personSelect,
    CgnBpmnMap,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: "workbench.workbench" },
        { name: "workbench.my_concern" }
      ],
      selectnum: "0",
      loading: false,
      fullscreenLoading: false,
      commonTemplateName: "",
      isSelected: [],
      is_collapse: false,
      dialogDetails: false,
      tableData: [],
      objData: {
        id: ""
      },
      objeDataToDetails: {
        templateCode: "",
        templateContent: ""
      },
      modelVO: {
        procTitle: "",
        processName: "",
        startUser: "",
        createDate: "",
        createDateEnd: ""
      },
      queryFields: [
        { name: 'processName', label: '', labelKey: 'workbench.process_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'startUser', label: '', labelKey: 'workbench.start_user', value: '', type: 'personal', display: true, order: 2 },
        { name: 'createDate', label: '', labelKey: 'workbench.create_date', relation: 'createDateEnd', value: '', type: 'dateRange', display: true, order: 3 },
      ],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      templateCode: "",
      templateName: "",
      templateStatus: "",
      templateType: "",
      createDate: null,
      currentPage: 1,
      current: 1,
      pageSize: 10,
      size: 10,
      total: 0,
      multipleSelection: [],
      configflowDialogVisible: false,
      show: false,
      flowVO: {
        pscUrl: envConfig.PSC_ROOT || "/api",
        procInstId: "",
        accessToken: "",
        tenantId: "",
        appId: "",
        procDefId: ""
      },
      //流程参数
      pscUrl: envConfig.PSC_ROOT || "/api", // 指定psc域名地址，必填
      maxTableHeight: 0,
      showDialog: false
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
  mounted() {
    let params = {
      pageIndex: 1,
      size: 10
    };
    this.getFlowList(params);
    this.getFwAuth();
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    let _this = this;
    // 监听名为 "my_Concern" 的广播频道
    const myChannel = new BroadcastChannel("my_Concern");
    // 监听该频道并处理消息
    myChannel.onmessage = function (event) {
      _this.refreshList()
    };
  },
  methods: {
    refreshList() {
      let params = {
        pageIndex: 1,
        size: 10
      };
      this.getFlowList(params)
    },
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
    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        clearTimeout(timer)
        _this.initMaxHeight();
      }, 335);
    },
    handleClick(row) {
      row.procNode = 7;
      row.flowStatus = 2;
      row.actId = row.procActId;
      row.concernId = row.processInfoId;
      row.procName = row.processName;
      sessionStorage.removeItem("procItem");
      sessionStorage.setItem("procItem", JSON.stringify(row));

      if (row.customFormPath) {
        this.$router.push({
          path: row.customFormPath,
          query: {
            actId: row.actId,
            procNode: row.procNode,
            procVersion: row.procVersion,//待确定
            procId: row.procId,
            id: row.procTaskId,//待确定
            actInstId: row.actInstId,//待确定
            procInstId: row.procInstId,
            procName: row.procName,
            processInfoId:row.processInfoId,
            r: Math.random()
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
    },
    //查看流程图
    showFlow(row) {
      this.flowVO.procDefId = row.procId;
      this.flowVO.procInstId = row.procInstId;
      this.configflowDialogVisible = true;
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

    onRenderComplete(actInstTrack) {
      console.log("onRenderComplete", actInstTrack);
    },
    onElementEvent() { },

    delClick(row) {
      let _this = this;
      _this
        .$confirm(
          _this.$t("workbench.do_cancel_concern"),
          _this.$t("cm.tips"),
          {
            type: "warning",
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default"
          }
        )
        .then(() => {
          let id = row.processInfoId;
          let params = {
            ids: id
          };
          this.fullscreenLoading = true;
          api
            .deleteMyConcern(params)
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
              this.fullscreenLoading = false;
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

    batchDel: function (rows) {
      //进行批量删除操作
      let _this = this;
      if (_this.multipleSelection.length > 0) {
        _this
          .$confirm(
            this.$t("workbench.do_cancel_concerns"),
            _this.$t("cm.tips"),
            {
              type: "warning",
              confirmButtonText: _this.$t("cm.confirm"),
              cancelButtonText: _this.$t("cm.cancel"),
              cancelButtonClass: "btn-second",
              confirmButtonClass: "btn-default"
            }
          )
          .then(() => {
            let ids = "";
            for (var i = 0; i < _this.multipleSelection.length; i++) {
              ids = ids + _this.multipleSelection[i].processInfoId;
              if (i != _this.multipleSelection.length - 1) {
                ids = ids + ",";
              }
            }
            let params = {
              ids: ids
            };
            this.fullscreenLoading = true;
            api
              .deleteMyConcern(params)
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
                this.fullscreenLoading = false;
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
      this.modelVO.procTitle = "";
      //除去搜索条件前后空格内容
      this.modelVO.processName = queryForm.processName.trim();
      this.modelVO.startUser = queryForm.startUser;
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
      this.modelVO.procTitle = "";
      this.modelVO.processName = "";
      this.modelVO.createDate = "";
      this.modelVO.startUser = "";
    },

    //获取列表
    getFlowList(params) {
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
        }
      });
    },
    //日期拼接
    dateGet(param) {
      if (param) {
        return Filters.timeFormat(param, "yyyy/MM/dd HH:mm");
      }
    },
    // 权限信息取得
    getFwAuth() {
      let _this = this;
      //let id = row.procId
      api.postWfAuthAPI().then(res => {
        if (res.code === "0") {
          let data = res.data;
          _this.flowVO.tenantId = data.tenantId; // 租户ID
          _this.flowVO.appId = data.appId; // 应用ID，必填

          _this.flowVO.accessToken = data.accessToken; // 访问Token，必填
          // _this.flowVO.pscUrl = "/api";
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
        }
      });
    },
  },


  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
