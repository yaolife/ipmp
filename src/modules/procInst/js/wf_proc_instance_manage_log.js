//引入组件
import api from "../api";
import { throttle } from "@/utils/funcUtil";
import breadcrumb from "@/components/common/breadcrumb";
import cmsg from "@/components/common/message";
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent";
import WfRadioSelect from "@/components/wfSelect/wf-radio-select.vue";
import { CgnBpmnMap } from "psc-module";
import * as Utils from "@/utils/Utils";
// import personSelect from "@@/components/easy-cud-person-select";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    api,
    breadcrumb,
    WfRadioSelect,
    CgnBpmnMap,
    // personSelect
    queryForm
  },
  //初始化查询任务实例
  mounted() {
    this.queryProcInstLogList(true);
    this.initMaxHeight();
    this.getFwAuth();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  data() {
    return {
      iconArrow: "el-icon-arrow-down",
      commonTemplateNameDisabled: false,
      filters: Utils.Filters.splitTime,
      hasIcon: false,
      brandLog: [
        { name: "wm.workflow_manage" },
        { name: "wm.proc_instance_manage_log" }
      ],
      listLoading: true,
      entityDialogVisible: false,
      //分类的弹框是否显示
      procInstId: "",
      processId: "",
      currentTaskUser: "", // 当前任务执行人
      dealTaskUser: "", // 已处理人
      applyUser: "", //申请人
      operaterUser: "", //操作人
      //查询任务实例列表属性
      ReqProcInstDto: {
        procTitle: "",
        procName: "", //流程名
        indstanceId: "", //实例id
        moduleItem: "", //业务模块
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
        { value: "proc", label: "flow.proc_instance" },
        { value: "task", label: "flow.task_instance" }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      instDateStart: ["", ""],
      showOperaterUser: false,
      initUserId: "",
      flowVO: {
        pscUrl: envConfig.PSC_ROOT || "/api",
        procInstId: "",
        accessToken: "",
        tenantId: "",
        appId: "",
        procDefId: ""
      },
      configflowDialogVisible: false,
      multipleSelection: [],
      //搜索字段
      queryFields: [
        { name: 'procTitle', label: '', labelKey: 'wm.procSubject', value: '', type: 'input', display: true, order: 1 },
        { name: 'procName', label: '', labelKey: 'wm.procName', value: '', type: 'input', display: true, order: 2 },
        { name: 'moduleItem', label: '', labelKey: 'flow.moduleItem', value: '', type: 'select', display: true, order: 3, fieldMap: [
          { value: "proc", labelKey: "flow.proc_instance" },
          { value: "task", labelKey: "flow.task_instance" }
        ] },
        { name: 'operaterUserId', label: '', labelKey: 'flow.operater', value: '', type: 'personal', display: true, order: 4 },
        { name: 'startTimeBegin', label: '', labelKey: 'flow.operat_time', value: '', type: 'dateRange', relation: 'startTimeEnd', display: true, order: 5 },

      ],
    };
  },
  methods: {
    closeOperaterUserDialog() {
      this.showOperaterUser = false;
      this.initUserId = "";
    },
    clearOperaterUser() {
      this.ReqProcInstDto.operaterUserId = "";
      this.showOperaterUser = false;
      this.initUserId = "";
    },
    showOperaterUserDialog() {
      this.$refs.startUserInput.blur();
      this.initUserId = this.ReqProcInstDto.operaterUserId;
      this.showOperaterUser = true;
    },
    commitOperaterUser() {
      let actParticipantData = this.$refs.operaterUserId.getData();
      this.operaterUser = "";
      this.ReqProcInstDto.operaterUserId = "";
      if (actParticipantData) {
        let userData = actParticipantData.get("userData");
        if (userData && userData.length === 8) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            let userDataIdsStr = userData[1][0];
            let userDataNamesStr = userData[1][1];
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            for (let i = 0; i < userDataIds.length; i++) {
              this.operaterUser +=
                (i === 0 ? "" : ",") +
                "[" +
                userDataIds[i] +
                "]" +
                userDataNames[i];
              this.ReqProcInstDto.operaterUserId +=
                (i === 0 ? "" : ",") + userDataIds[i];
            }
          }
        }
      }
      this.closeOperaterUserDialog();
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    initMaxHeight() {
      calcHeight(this);
    },

    initForm() {
      this.listLoading = true;
      this.queryProcInstLogList(true).then(res => {
        if (res.code === "0") {
          this.tableData = res.records;
          this.total = res.total;
          this.listLoading = false;
        }
      });
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

    //流程实例列表
    queryProcInstLogList(init) {
      this.listLoading = true;
      let params = {};
      if (init) {
        params.pageIndex = 1;
        params.pageSize = 10;
      } else {
        params.pageIndex = this.tablePage.pageIndex;
        params.pageSize = this.tablePage.pageSize;
      }
      let tablePageParam = {
        current: this.tablePage.pageIndex,
        size: this.tablePage.pageSize
      };
      let p = { ...this.ReqProcInstDto, ...params, ...tablePageParam };
      api
        .getProcInstLoglistAPI(p)
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
      // this.ReqProcInstDto.operaterUserId = this.operaterUser.userId;
      // (this.ReqProcInstDto.startTimeBegin =
      //   this.instDateStart === null ? "" : this.instDateStart[0]), //流程发起时间-开始
      //   (this.ReqProcInstDto.startTimeEnd =
      //     this.instDateStart === null ? "" : this.instDateStart[1]), //流程发起时间-结束
      //   this.queryProcInstLogList(true);
      let queryForm = this.$refs.queryForm.getQueryForm();
      this.ReqProcInstDto.procTitle = queryForm.procTitle.trim();
      this.ReqProcInstDto.procName = queryForm.procName.trim();
      this.ReqProcInstDto.operaterUserId = queryForm.operaterUserId;
      this.ReqProcInstDto.moduleItem = queryForm.moduleItem;
      this.ReqProcInstDto.operaterUserId = queryForm.operaterUserId;
      this.ReqProcInstDto.startTimeBegin = queryForm.startTimeBegin;
      this.ReqProcInstDto.startTimeEnd = queryForm.startTimeEnd;
      this.queryProcInstLogList(true);
    },
    //点击重置按钮
    resetTaskInst() {
      this.ReqProcInstDto.moduleItem = ""; //业务模块
      this.instDateStart = ["", ""];
      this.ReqProcInstDto.procTitle = "";
      this.$refs.logProcSelect.clearValue("");
      this.ReqProcInstDto.procName = "";
      this.ReqProcInstDto.operaterUserId = ""; //发起人ID
      // this.operaterUser = "";
      this.$refs.personSelect.clear()
    },

    //改变每页显示多少条数据
    changeSize(pageSize) {
      this.tablePage.pageSize = pageSize;
      this.tablePage.pageIndex = 1;
      this.queryProcInstLogList();
    },
    //改变页数
    changeCurrentPage(current) {
      this.tablePage.pageIndex = current;
      this.queryProcInstLogList();
    },
    cancel() {
      (this.comment = ""),
        (this.procInstId = ""),
        (this.processId = ""),
        (this.entityDialogVisible = false);
    },

    formatDate(row, column) {
      let value = row[column.property];

      if (null == value) {
        return null;
      }

      return this.formatWithSeperator(value, "-", ":");
    },

    formatWithSeperator(datetime, dateSeprator, timeSeprator) {
      if (datetime != null) {
        let dateMat = null;
        dateMat = new Date(datetime);
        if (!dateMat.getFullYear()) {
          dateMat = new Date(datetime.replace(/-/g, "/"));
        }
        const year = dateMat.getFullYear();
        const month =
          dateMat.getMonth() + 1 < 10
            ? "0" + (dateMat.getMonth() + 1)
            : dateMat.getMonth() + 1;
        const day =
          dateMat.getDate() < 10 ? "0" + dateMat.getDate() : dateMat.getDate();
        const hh =
          dateMat.getHours() < 10
            ? "0" + dateMat.getHours()
            : dateMat.getHours();
        const mm =
          dateMat.getMinutes() < 10
            ? "0" + dateMat.getMinutes()
            : dateMat.getMinutes();
        const ss =
          dateMat.getSeconds() < 10
            ? "0" + dateMat.getSeconds()
            : dateMat.getSeconds();
        const timeFormat =
          year +
          dateSeprator +
          month +
          dateSeprator +
          day +
          " " +
          hh +
          timeSeprator +
          mm +
          timeSeprator +
          ss;
        return timeFormat;
      }
    },
    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.ReqProcInstDto.procTitle = "";
      _this.commonTemplateNameDisabled = !!val;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },

    processCheckCallback: function (data) {
      this.ReqProcInstDto.procName = data.label;
    }
  }
};
