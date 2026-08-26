import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import performanceLogManageApi from "../api/index.js";
import cmsg from "@/components/common/message";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function() {
    return {
      hasIcon: false,
      brand: [
        { name: "sys.system_manage" },
        { name: "sys.performance_log_manage" }
      ],
      maxTableHeight: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      status: [
        { key: "0", label: "加载", value: 0 },
        { key: "1", label: "验证", value: 1 },
        { key: "2", label: "提交", value: 2 }
      ],
      statusCateGory: [
        { key: "0", label: "流程", value: "proc" },
        { key: "1", label: "表单", value: "form" },
        { key: "2", label: "组件", value: "component" }
      ],
      //配置搜索对象
      performanceModel: {
        procIdByTop: "", //高级搜索上的
        procId: "",
        procTitle: "",
        procName: "",
        extendType: "",
        extendClassName: "",
        formId: "",
        consumingTime: "",
        operateUser: "",
        timeHorizon: ["", ""],
        createDateFrom: "",
        createDateTo: ""
      },
      //Table Loading
      tableLoading: true,
      //Table数据
      performanceLogTableData: [],
      // 查看详情弹窗
      detailDialogVisible: false,
      // 详情弹窗数据集
      detailData: {},
      //折叠板展开，上面的搜索禁用
      fold: false,
      //搜索字段
      queryFields: [
        {
          name: "procId",
          label: "",
          labelKey: "sys.proc_id",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "procTitle",
          label: "",
          labelKey: "sys.proc_title",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "procName",
          label: "",
          labelKey: "sys.proc_name",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "extendClassName",
          label: "",
          labelKey: "sys.extend_class_name",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "extendType",
          label: "",
          labelKey: "sys.extend_type",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "consumingTime",
          label: "",
          labelKey: "sys.consuming_time",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "operateUser",
          label: "",
          labelKey: "sys.operate_user",
          value: "",
          type: "personal",
          display: true,
          order: 3
        },
        {
          name: "createDateFrom",
          label: "",
          labelKey: "sys.operate_time",
          value: "",
          type: "dateRange",
          relation: "createDateTo",
          display: true,
          order: 5
        }
      ]
    };
  },
  methods: {
    //动态计算高度
    initMaxHeight() {
      calcHeight(this);
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
        clearTimeout(timer);
      }, 335);
    },
    //条件搜索
    search() {
      let _this = this;
      let queryForm = _this.$refs.queryForm.getQueryForm();
      _this.performanceModel.createDateFrom = queryForm.createDateFrom;
      _this.performanceModel.createDateTo = queryForm.createDateTo;
      //除去搜索条件前后空格内容
      _this.performanceModel.procId = queryForm.procId.trim();
      _this.performanceModel.procTitle = queryForm.procTitle.trim();
      _this.performanceModel.procName = queryForm.procName.trim();
      _this.performanceModel.extendClassName = queryForm.extendClassName.trim();
      _this.performanceModel.extendType = queryForm.extendType;
      _this.performanceModel.consumingTime = queryForm.consumingTime.trim();
      _this.performanceModel.operateUser = queryForm.operateUser.trim();
      _this.initTableData();
    },
    // 查看详情
    handleViewDetail(row) {
      let _this = this;
      _this.detailDialogVisible = true;
      performanceLogManageApi.getPerformanceLogDetail(row.performanceLogId).then(res => {
        if (res.code === "0") {
          _this.detailData = res.data;
        }
      });
    },
    // 获取扩展类型标签
    getExtendTypeLabel(value) {
      const type = this.status.find(item => item.value == value);
      return type ? type.label : value;
    },
    //重置条件
    reset() {
      let _this = this;
      _this.performanceModel.procIdByTop = "";
      _this.performanceModel.procId = "";
      _this.performanceModel.procTitle = "";
      _this.performanceModel.operateUser = "";
      _this.performanceModel.procName = "";
      _this.performanceModel.extendType = "";
      _this.performanceModel.extendClassName = "";
      _this.performanceModel.formId = "";
      _this.performanceModel.consumingTime = "";
      _this.performanceModel.timeHorizon = ["", ""];
      _this.performanceModel.createDateFrom = "";
      _this.performanceModel.createDateTo = "";
    },
    //配置Table数据
    initTableData() {
      let _this = this;
      let param = {
        current: _this.currentPage,
        size: _this.pageSize
      };
      //合并
      param = Object.assign(param, _this.performanceModel);
      _this.tableLoading = true;
      performanceLogManageApi
        .searchPerformanceLogInfo(param)
        .then(res => {
          if (res.code === "0") {
            // console.info(res);
            _this.performanceLogTableData = res.records;
            _this.total = res.total;
            _this.tableLoading = false;
          } else {
            _this.$message({
              message: res.msg,
              type: "error"
            });
            _this.tableLoading = false;
          }
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(_this);
          _this.tableLoading = false;
        });
    },
    //更改显示条数
    changeSize(size) {
      let _this = this;
      _this.pageSize = size;
      _this.initTableData();
    },
    //更改当前页
    changeCurrentPage(current) {
      let _this = this;
      _this.currentPage = current;
      _this.initTableData();
    },
    //上一页
    prePage(current) {
      let _this = this;
      _this.currentPage = current;
      _this.initTableData();
    },
    //下一页
    nextPage(current) {
      let _this = this;
      _this.currentPage = current;
      _this.initTableData();
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
    this.initTableData();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
