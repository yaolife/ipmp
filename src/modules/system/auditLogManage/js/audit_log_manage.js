import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import auditLogManageAPI from "../api/index.js";
import cmsg from "@/components/common/message";
import * as funcUtil from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      filters: funcUtil.splitTime,
      hasIcon: false,
      brand: [{ name: "sys.system_manage" }, { name: "sys.audit_log_manage" }],
      maxTableHeight: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      activeName: "configure",
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      status: [
        { key: "0", label: "新增", value: 0 },
        { key: "1", label: "修改", value: 1 },
        { key: "2", label: "删除", value: 2 }
      ],
      //配置搜索对象
      advanceModel: {
        moduleName: "",
        operateType: "",
        operateUser: "",
        operateContent: "",
        timeHorizon: ["", ""],
        createDateFrom: "",
        createDateTo: ""
      },
      //运行搜索对象
      runModel: {
        workThemeByTop: "", //单独搜索
        workTheme: "",
        procName: "",
        actName: "",
        operateUser: "",
        timeHorizon: ["", ""],
        createDateFrom: "",
        createDateTo: ""
      },
      //配置Table Loading
      configTableLoading: false,
      //运行Table Loading
      runTableLoading: false,
      //配置Table数据
      auditLogConfigTableData: [],
      //运行Table数据
      auditLogRunTableData: [],
      //配置详情弹出窗
      dialogConfigVisible: false,
      //运行详情弹出窗
      dialogRunVisible: false,
      //配置详情数据
      detailConfigData: {
        operateOldData: "",
        operateNewData: "",
        operateUser: "",
        operateTime: ""
      },
      //运行详情数据
      detailRunData: {
        dataJson: ""
      },
      //Tab名称
      tabName: "configure",
      //折叠板展开，上面的搜索禁用
      fold: false,
      foldPeizhi: false,
      //搜索字段
      queryFields1: [
        { name: 'moduleName', label: '', labelKey: 'sys.model_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'operateType', label: '', labelKey: 'sys.operate_type', value: '', type: 'select', display: true, order: 2, fieldMap: [
          { label: "新增", value: "0" },
          { label: "修改", value: "1" },
          { label: "删除", value: "2" }
        ] },
        { name: 'operateUser', label: '', labelKey: 'sys.operate_user', value: '', type: 'personal', display: true, order: 3 },
        { name: 'operateContent', label: '', labelKey: 'sys.operate_content', value: '', type: 'input', display: true, order: 4 },
        { name: 'createDateFrom', label: '', labelKey: 'sys.operate_time', value: '', type: 'dateRange', relation: 'createDateTo', display: true, order: 5 },
      ],
      queryFields2: [
        { name: 'workTheme', label: '', labelKey: 'sys.work_theme', value: '', type: 'input', display: true, order: 1 },
        { name: 'procName', label: '', labelKey: 'sys.proc_name', value: '', type: 'input', display: true, order: 2 },
        { name: 'actName', label: '', labelKey: 'sys.act_name', value: '', type: 'input', display: true, order: 2, },
        { name: 'operateUser', label: '', labelKey: 'sys.operate_user', value: '', type: 'personal', display: true, order: 3 },
        { name: 'createDateFrom', label: '', labelKey: 'sys.operate_time', value: '', type: 'dateRange', relation: 'createDateTo', display: true, order: 4 },
      ],
    };
  },
  methods: {
    //动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //tab点击
    handleClick(tab) {
      this.resetActivePosition(this.$refs.tabs.$el);
      let _this = this;
      _this.tabName = tab.name;
      if (tab.name === "running") {
        _this.currentPage = 1;
        _this.pageSize = 10;
        _this.total = 0;
        _this.initRunTableData();
      } else {
        _this.currentPage = 1;
        _this.pageSize = 10;
        _this.total = 0;
        _this.initConfigTableData();
      }
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },
    resetActivePosition($el) {
      this.$nextTick(() => {
        const activeEl = $el.querySelector(".el-tabs__item.is-active");
        const lineEl = $el.querySelector(".el-tabs__active-bar");
        const style = getComputedStyle(activeEl);
        const pl = style.paddingLeft.match(/\d+/)[0] * 1;
        const pr = style.paddingRight.match(/\d+/)[0] * 1;
        const w = style.width.match(/\d+/)[0] * 1;
        lineEl.style.transform =
          "translateX(" + (activeEl.offsetLeft + pl - 6) + "px)";
        lineEl.style.width = w - pl - pr + "px";
      });
    },
    //展开或关闭折叠
    advanceSearchPeizhi(val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      if (_this.iconArrow == "el-icon-arrow-up") {
        _this.foldPeizhi = true;
      } else {
        if (_this.iconArrow == "el-icon-arrow-down") {
          _this.foldPeizhi = false;
        }
      }
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },
    //展开或关闭折叠
    advanceSearch(val) {
      let _this = this;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      if (_this.iconArrow == "el-icon-arrow-up") {
        _this.fold = true;
      } else {
        if (_this.iconArrow == "el-icon-arrow-down") {
          _this.fold = false;
        }
      }
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },
    //条件搜索
    search() {
      let _this = this;
      let queryForm = _this.$refs.queryForm1.getQueryForm();
      _this.advanceModel.createDateFrom = queryForm.createDateFrom;
      _this.advanceModel.createDateTo = queryForm.createDateTo;
      //除去搜索条件前后空格内容
      _this.advanceModel.moduleName = queryForm.moduleName.trim();
      _this.advanceModel.operateUser = queryForm.operateUser;
      _this.advanceModel.operateContent = queryForm.operateContent.trim();
      _this.advanceModel.operateType = queryForm.operateType;
      _this.initConfigTableData();
    },
    searchRun() {
      let _this = this;
      let queryForm = _this.$refs.queryForm2.getQueryForm();
      _this.runModel.createDateFrom = queryForm.createDateFrom;
      _this.runModel.createDateTo = queryForm.createDateTo;
      //除去搜索条件前后空格内容
      _this.runModel.workTheme = queryForm.workTheme.trim();
      _this.runModel.procName = queryForm.procName.trim();
      _this.runModel.actName = queryForm.actName.trim();
      _this.runModel.operateUser = queryForm.operateUser.trim();
      _this.initRunTableData();
    },
    //重置条件
    reset() {
      let _this = this;
      /*配置搜索条件*/
      _this.advanceModel.moduleName = "";
      _this.advanceModel.operateType = "";
      _this.advanceModel.operateUser = "";
      _this.advanceModel.operateContent = "";
      _this.advanceModel.timeHorizon = ["", ""];
      _this.advanceModel.createDateFrom = "";
      _this.advanceModel.createDateTo = "";
      /*运行搜索条件*/
      _this.runModel.workThemeByTop = "";
      _this.runModel.workTheme = "";
      _this.runModel.procName = "";
      _this.runModel.actName = "";
      _this.runModel.operateUser = "";
      _this.runModel.timeHorizon = ["", ""];
      _this.runModel.createDateFrom = "";
      _this.runModel.createDateTo = "";
    },
    //配置Table数据
    initConfigTableData() {
      let _this = this;
      let param = {
        current: _this.currentPage,
        size: _this.pageSize
      };
      //合并
      param = Object.assign(param, _this.advanceModel);
      _this.configTableLoading = true;
      auditLogManageAPI
        .searchAuditLogConfigInfo(param)
        .then(res => {
          if (res.code === "0") {
            _this.auditLogConfigTableData = res.records;
            _this.total = res.total;
            _this.configTableLoading = false;
          } else {
            _this.$message({
              message: res.msg,
              type: "error"
            });
            _this.configTableLoading = false;
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(_this);
          _this.configTableLoading = false;
        });
    },
    //运行Table数据
    initRunTableData() {
      let _this = this;
      let param = {
        current: _this.currentPage,
        size: _this.pageSize
      };
      //合并
      param = Object.assign(param, _this.runModel);
      _this.runTableLoading = true;
      auditLogManageAPI
        .searchAuditLogRunInfo(param)
        .then(res => {
          if (res.code === "0") {
            // console.info(res);
            _this.auditLogRunTableData = res.records;
            _this.total = res.total;
            _this.runTableLoading = false;
          } else {
            _this.$message({
              message: res.msg,
              type: "error"
            });
            _this.runTableLoading = false;
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(_this);
          _this.runTableLoading = false;
        });
    },
    //更改显示条数
    changeSize(size) {
      let _this = this;
      _this.pageSize = size;
      if (_this.tabName === "configure") {
        _this.initConfigTableData();
      } else {
        _this.initRunTableData();
      }
    },
    //更改当前页
    changeCurrentPage(current) {
      let _this = this;
      _this.currentPage = current;
      if (_this.tabName === "configure") {
        _this.initConfigTableData();
      } else {
        _this.initRunTableData();
      }
    },
    //上一页
    prePage(current) {
      let _this = this;
      _this.currentPage = current;
      if (_this.tabName === "configure") {
        _this.initConfigTableData();
      } else {
        _this.initRunTableData();
      }
    },
    //下一页
    nextPage(current) {
      let _this = this;
      _this.currentPage = current;
      if (_this.tabName === "configure") {
        _this.initConfigTableData();
      } else {
        _this.initRunTableData();
      }
    },
    //配置查看详情
    viewConfigDetails(data) {
      let _this = this;
      _this.dialogConfigVisible = true;
      _this.detailConfigData.operateOldData = data.operateOldData;
      _this.detailConfigData.operateNewData = data.operateNewData;
      _this.detailConfigData.operateUser = data.createUserName;
      _this.detailConfigData.operateTime = data.createDateTimeStr;
    },
    //运行查看详情
    viewRunDetails(data) {
      let _this = this;
      _this.dialogRunVisible = true;
      _this.detailRunData.dataJson = data.dataJson;
    },
    //配置弹窗关闭
    dialogConfigClose() {
      let _this = this;
      _this.dialogConfigVisible = false;
      _this.detailConfigData.operateOldData = "";
      _this.detailConfigData.operateNewData = "";
      _this.detailConfigData.operateUser = "";
      _this.detailConfigData.operateTime = "";
    },
    //运行弹窗关闭
    dialogRunClose() {
      let _this = this;
      _this.dialogRunVisible = false;
      _this.detailRunData.dataJson = "";
    }
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  mounted() {
    // 初始化
    this.initMaxHeight();
    //初始化Table数据
    this.initConfigTableData();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
