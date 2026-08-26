/*
 * @Author: P623437
 * @Date: 2021-09-08 14:27:25
 * @LastEditors: P623437
 * @LastEditTime: 2022-04-15 16:23:42
 * @Description: 流程模板管理
 */
//引入组件
import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import cmsg from "@/components/common/message";
import PersonSelect from "@/components/asc/PersonSelect";
import WfRadioSelect from "@/components/wfSelect/wf-radio-select.vue";
import { CgnBpmnMap } from "psc-module";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    PersonSelect,
    api,
    WfRadioSelect,
    CgnBpmnMap
  },
  //初始化查询任务实例
  mounted() {
    this.queryProcInstList(true);
    this.initMaxHeight();
    this.getDataBase();
    this.getFwAuth();
  },
  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "wm.workflow_manage" },
        { name: "wm.workflow_proc_manage" }
      ],
      listLoading: true,
      entityDialogVisible: false,
      //分类的弹框是否显示
      comment: "",
      procInstId: "",
      processId: "",
      user: "",
      currentTaskUser: "", // 当前任务执行人
      dealTaskUser: "", // 已处理人
      applyUser: "", //申请人
      //查询任务实例列表属性
      ReqProcInstDto: {
        procName: "", //流程名
        procSubject: "", //工作主题
        apply_company: "", //申请公司
        cost_company: "", //费用公司
        priority: "", // 优先级
        startUserId: "", //发起人ID
        status: "", //状态
        currentTaskStep: "", //当前任务环节
        dealTaskStep: "", //已处理任务环节
        exception_status: "", //异常状态
        selectSource: "", //选择库
        processKpi: "", //流程KPI
        totalProcessTime: "", //总流程时间
        startTimeBegin: "", //流程发起时间-开始
        startTimeEnd: "", //流程发起时间-结束
        dataSource: "", //归档库
        pageIndex: 1, //当前页
        pageSize: 10 //每页条数
      },
      activeName: [],
      processTableData: [],
      dataSourceList: [],
      //分页
      tablePage: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      },
      options: [
        { value: "0", label: "运行中" },
        { value: "1", label: "已挂起" },
        { value: "2", label: "已完成" },
        { value: "3", label: "已作废" },
        { value: "4", label: "待扫描" }
      ],

      companys: [
        { value: "0", label: "公司1" },
        { value: "1", label: "公司2" },
        { value: "2", label: "公司3" },
        { value: "3", label: "公司4" },
        { value: "4", label: "公司5" }
      ],

      prioritys: [
        { value: "0", label: "普通" },
        { value: "1", label: "加急" }
      ],
      exception_statuses: [
        { value: "0", label: "技术异常" },
        { value: "1", label: "业务异常" }
      ],

      selectSources: [
        { value: "0", label: "选择库1" },
        { value: "1", label: "选择库2" },
        { value: "2", label: "选择库3" }
      ],

      totalProcessTimes: [
        { value: "0", label: "30" },
        { value: "1", label: "60" },
        { value: "2", label: "120" }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      instDateStart: ["", ""],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      flowVO: {
        pscUrl: envConfig.PSC_ROOT || "/api",
        procInstId: "",
        accessToken: "",
        tenantId: "",
        appId: "",
        procDefId: ""
      },
      configflowDialogVisible: false,
      multipleSelection: []
    };
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    initMaxHeight() {
      calcHeight(this);
    },

    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },

    //高级搜索
    search: function () {
      (this.ReqProcInstDto.startTimeBegin =
        this.instDateStart === null ? "" : this.instDateStart[0]), //流程发起时间-开始
        (this.ReqProcInstDto.startTimeEnd =
          this.instDateStart === null ? "" : this.instDateStart[1]), //流程发起时间-结束
        this.initForm();
    },

    initForm() {
      this.listLoading = true;
      this.queryProcInstList(true).then(res => {
        if (res.code === "0") {
          this.tableData = res.records;
          this.total = res.total;
          this.listLoading = false;
        }
      });
    },

    //查看流程图
    showFlow(row) {
      this.flowVO.procDefId = row.processId;
      this.flowVO.procInstId = row.id;
      this.configflowDialogVisible = true;
    },
    // 权限信息取得
    getFwAuth() {
      let _this = this;
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
    onElementEvent(e) { },
    onRenderComplete(e) { },

    getDataBase() {
      api
        .getDataBaseConfigApi()
        .then(result => {
          if (result.data.code === "0") {
            if (result.data.data["dataSource"]) {
              this.dataSourceList = result.data.data["dataSource"];
            }
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },

    //流程实例列表
    queryProcInstList(init) {
      this.listLoading = true;
      let params = {};
      if (init) {
        params.pageIndex = 1;
        params.pageSize = 10;
      } else {
        params.pageIndex = this.tablePage.pageIndex;
        params.pageSize = this.tablePage.pageSize;
      }
      this.user = document.getElementById("startUserId").value;
      let completerId = document
        .getElementById("startUserId")
        .value.substr(1, this.user.indexOf("]") - 1);
      this.ReqProcInstDto.startUserId = completerId;
      let p = { ...this.ReqProcInstDto, ...params };
      api
        .getProcInstlistAPI(p)
        .then(result => {
          this.listLoading = false;
          //填充数据
          this.processTableData = result.records;
          this.tablePage.pageIndex = result.current;
          this.tablePage.pageSize = result.size;
          this.tablePage.total = result.total;
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(this);
        });
    },
    //点击查询按钮
    searchTaskInstList() {
      (this.ReqProcInstDto.startTimeBegin =
        this.instDateStart === null ? "" : this.instDateStart[0]), //流程发起时间-开始
        (this.ReqProcInstDto.startTimeEnd =
          this.instDateStart === null ? "" : this.instDateStart[1]), //流程发起时间-结束
        this.queryProcInstList(true);
    },
    //点击重置按钮
    resetTaskInst() {
      this.ReqProcInstDto.procName = ""; //流程名
      this.ReqProcInstDto.procSubject = ""; //工作主题
      this.ReqProcInstDto.startUserId = ""; //发起人ID
      this.ReqProcInstDto.status = ""; //状态
      this.ReqProcInstDto.startTimeBegin = ""; //流程发起时间-开始
      this.ReqProcInstDto.startTimeEnd = ""; //流程发起时间-结束
      this.ReqProcInstDto.dataSource = ""; //归档库
      this.instDateStart = ["", ""];
      this.user = "";

    },
    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryProcInstList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.tablePage.pageIndex = current;
      this.queryProcInstList();
    },

    //关闭弹窗
    entityDialogHandleClose() {
      (this.comment = ""),
        (this.procInstId = ""),
        (this.processId = ""),
        (this.entityDialogVisible = false);
    },
    //打开弹窗
    abandonDialogHandleOpen(row) {
      this.procInstId = row.id;
      this.processId = row.processId;
      this.entityDialogVisible = true;
    },
    cancel() {
      (this.comment = ""),
        (this.procInstId = ""),
        (this.processId = ""),
        (this.entityDialogVisible = false);
    },
    // 流程实例-编辑
    procInstUpdate: function (row) {
      this.$router.push({
        path: "/wf_proc_instance_manage_update",
        query: { row: row }
      });
    },
    // 流程实例-作废提交
    procInstAbandon: function () {
      let param = {};
      param.comment = this.comment;
      param.procInsID = this.procInstId;
      param.processId = this.processId;
      api.abandonProcInstAPI(param).then(res => {
        let data = res;
        if (data.code === "0") {
          this.$message({
            showClose: true,
            message: data.msg,
            type: "success"
          });
          this.cancel();
          this.queryProcInstList();
        } else {
          this.$message({
            showClose: true,
            message: data.msg,
            type: "warning"
          });
        }
      });
    },

    // 流程实例 - 终止
    procInstTerminate(row) {
      this.$confirm("确定终止此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "confirm_cancel",
        confirmButtonClass: "confirm_sure"
      })
        .then(() => {
          let param = {};
          // param.comment = this.comment; //原因  -后续有需要加上终止原因
          param.procInsID = row.id;
          api
            .terminateProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
              } else {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "warning"
                });
              }
            })
            .catch(e => {
              cmsg.httpCatchErrorMessage(this);
            });
        })
        .catch(() => {
          cmsg.cancelMessage(this);
        });
    },

    // 流程实例-挂起
    procInstHangup(row) {
      this.$confirm("确定挂起此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "confirm_cancel",
        confirmButtonClass: "confirm_sure"
      })
        .then(() => {
          let param = {};
          // param.comment = this.comment; //原因  -后续有需要加上挂起原因
          param.procInsID = row.id;
          api
            .hangupProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
              } else {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "warning"
                });
              }
            })
            .catch(e => {
              cmsg.httpCatchErrorMessage(this);
            });
        })
        .catch(() => {
          cmsg.cancelMessage(this);
        });
    },
    // 流程实例-恢复
    procInstRecover(row) {
      this.$confirm("确定恢复此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "confirm_cancel",
        confirmButtonClass: "confirm_sure"
      })
        .then(() => {
          let param = {};
          // param.comment = this.comment; //原因  -后续有需要加上恢复原因
          param.procInsID = row.id;
          api
            .recoverProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList();
              } else {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "warning"
                });
              }
            })
            .catch(e => {
              cmsg.httpCatchErrorMessage(this);
            });
        })
        .catch(() => {
          cmsg.cancelMessage(this);
        });
    },
    // 流程实例-激活
    procInstActive(row) {
      this.$confirm("确定激活此流程实例？", "提示", {
        type: "warning",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "confirm_cancel",
        confirmButtonClass: "confirm_sure"
      })
        .then(() => {
          let param = {};
          // param.comment = this.comment; //原因  -后续有需要加上恢复原因
          param.procInstId = row.id;
          param.processId = row.processId;
          api
            .activeProcInstAPI(param)
            .then(res => {
              let data = res;
              if (data.code === "0") {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "success"
                });
                this.queryProcInstList(true);
              } else {
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: "warning"
                });
              }
            })
            .catch(e => {
              cmsg.httpCatchErrorMessage(this);
            });
        })
        .catch(() => {
          cmsg.cancelMessage(this);
        });
    },
    moreCommandHandler(command) {
      let param = command.param;
      switch (command.optFlag) {
        case "abandon":
          this.abandonDialogHandleOpen(param);
          break;
        case "terminate":
          this.procInstTerminate(param);
          break;
        case "hangup":
          this.procInstHangup(param);
          break;
        case "recover":
          this.procInstRecover(param);
          break;
        case "active":
          this.procInstActive(param);
          break;
        default:
          break;
      }
    },
    beforeMoreCommandHandler(optFlag, param) {
      return {
        optFlag: optFlag,
        param: param
      };
    }
  }
};
