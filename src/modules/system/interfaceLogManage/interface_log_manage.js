import breadcrumb from "@/components/common/breadcrumb";
import logManageApi from "./api";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: "sys.system_manage" },
        { name: "sys.interface_log_manage" }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,
      logPageSize: 10,
      logPageCurrent: 1,
      logPageTotal: 0,
      logDetailDialogVisible: false,
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      logTableData: [],
      logQueryModel: {
        requestUrl: "",
        reqTraceId: "",
        requestUser: "",
        interactionType: "",
        costTime: "",
        callbackDetailCostTime: "",
        callbackResultCostTime: "",
      },

      // 详情弹窗数据集
      logData: {},
      interactionTypeOption: [
        {
          value: "GET",
          label: "GET"
        },
        {
          value: "POST",
          label: "POST"
        }
      ],
      testCode: "",
      logDialogTitle: "",
      listLoading: false,
      //搜索字段
      queryFields: [
        { name: 'requestUrl', label: '', labelKey: 'sys.request_url', value: '', type: 'input', display: true, order: 1 },
        { name: 'reqTraceId', label: '', labelKey: 'sys.request_id', value: '', type: 'input', display: true, order: 2 },
        { name: 'requestUser', label: '', labelKey: 'sys.request_user', value: '', type: 'personal', display: true, order: 3 },
        { name: 'interactionType', label: '', labelKey: 'sys.action_type', value: '', type: 'select', display: true, order: 4, fieldMap: [
          { value: "1", label: "同步" },
          { value: "2", label: "异步回调" }
        ] },
        { name: 'costTime', label: '', labelKey: 'sys.cost_time', value: '', type: 'input', display: true, order: 5 },
        { name: 'year', label: '', labelKey: 'sys.log_year', value: new Date().getFullYear().toString(), type: 'dateYear', display: true, order: 6 },
        { name: 'month', label: '', labelKey: 'sys.log_month', value: (new Date().getMonth() + 1).toString().padStart(2, '0'), type: 'dateMonth', display: true, order: 7 },
      ],
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  mounted() {
    // 初始化
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.logSearch();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
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
      //除去搜索条件前后空格内容
      this.formName = this.formName.trim();
      this.searchParams = {
        categoryIds: [],
        formName: this.formName,
        status: this.status,
        createDateFrom: this.formDate === null ? "" : this.formDate[0],
        createDateTo: this.formDate === null ? "" : this.formDate[1],
        dataModelName: this.dataModelName,
        searchType: "2"
      };
      this.logListQuery();
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    logSearch() {
      let _this = this;
      let params = {
        pageIndex: 1,
        size: _this.logPageSize
      };
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      _this.logQueryModel.requestUrl = queryForm.requestUrl.trim();
      _this.logQueryModel.reqTraceId = queryForm.reqTraceId.trim();
      _this.logQueryModel.requestUser = queryForm.requestUser;
      _this.logQueryModel.interactionType = queryForm.interactionType;
      _this.logQueryModel.costTime = queryForm.costTime.trim();
      _this.logQueryModel.year = queryForm.year;
      _this.logQueryModel.month = queryForm.month;
      params = Object.assign(params, _this.logQueryModel);
      _this.logListQuery(params);
    },
    logReset() {
      let _this = this;
      _this.logQueryModel.requestUrl = "";
      _this.logQueryModel.reqTraceId = "";
      _this.logQueryModel.requestUser = "";
      _this.logQueryModel.interactionType = "";
      _this.logQueryModel.costTime = "";
      _this.logQueryModel.callbackDetailCostTime = "";
      _this.logQueryModel.callbackResultCostTime = "";
    },
    logPageSizeChange(size) {
      let _this = this;
      let params = {
        current: 1,
        size: size
      };
      _this.logPageSize = size;
      _this.logPageCurrent = 1;
      params = Object.assign(params, _this.logQueryModel);
      _this.logListQuery(params);
    },
    logPageCurrentChange(current) {
      let _this = this;
      let params = {
        current: current,
        size: _this.logPageSize
      };
      _this.logPageCurrent = current;
      params = Object.assign(params, _this.logQueryModel);
      _this.logListQuery(params);
    },
    logListQuery(params) {
      let _this = this;
      if (!params) {
        params = {
          current: _this.logPageCurrent,
          size: _this.logPageSize
        };
        params = Object.assign(params, _this.logQueryModel);
      }
      _this.listLoading = true;
      logManageApi.pageLogListAPI(params).then(res => {
        if (res.code === "0") {
          _this.logTableData = res.data.records;
          _this.logPageTotal = res.data.total;
          _this.listLoading = false;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
          _this.listLoading = false;
          _this.logTableData = [];
          _this.logPageSize = 10;
          _this.logPageCurrent = 1;
          _this.logPageTotal = 0;
        }
      });
    },
    // 详情页面打开
    handleClick(row) {
      let _this = this;
      _this.logData = _this.deepClone(row);
      _this.logDialogTitle = "sys.interface_log_detail";
      _this.logDetailDialogVisible = true;
      logManageApi.logDetailAPI(_this.logData.logId).then((result) => {
        if (result.code == '0') {
          _this.logData.requestParam = result.data.requestParam;
          _this.logData.resultBody = result.data.resultBody;
          _this.logData.visitNum = result.data.visitNum
        }
      })
    },
    // 回调详情页面打开
    handleCallBackClick(row) {
      let _this = this;
      // 获取回调日志
      _this.listLoading = true;
      logManageApi.getCallBackLogAPI(row).then(res => {
        if (res.code === "0") {
          _this.logData = _this.deepClone(res.data);
          _this.logDialogTitle = "sys.callback_log_detail";
          _this.logDetailDialogVisible = true;
          _this.listLoading = false;
        } else {
          _this.$message({
            message: res.msg,
            type: "warning"
          });
          _this.listLoading = false;
        }
      });
    },
    //关闭弹窗
    logDetailClose() {
      let _this = this;
      _this.$refs["logDetailForm"].resetFields();
      _this.clearLogData();
      _this.logDetailDialogVisible = false;
    },
    clearLogData() {
      let _this = this;
      _this.logData = {};
    },
  }
};
