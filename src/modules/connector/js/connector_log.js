import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import api from "../api";
import * as funcUtil from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function() {
    return {
      filters: funcUtil.splitTime,
      hasIcon: false,
      brand: [{ name: "sys.system_manage" }, { name: "hc.http_connector" }],
      maxTableHeight: 0,
      advShow: 0,
      queryParams: {
        requestUrl: "",
        requestUserNo: "",
        requestType: "",
        interactionType: "",
        startTime: "",
        endTime: "",
        costTime: 0,
        yearDateTime: "",
        monthDateTime: "",
        successFlag: "",
        classId: "",
        connectorId: "",
        requestId: ""
      },
      searchLoading: false,
      classData: [],
      connectorData: [],
      actionData: [],

      logPageSize: 10,
      logPageCurrent: 1,
      logPageTotal: 0,
      //列表
      logListData: [],
      listLoading: false,
      //详情
      detailData: {},
      detailShow: false,
      detailLoading: false,
      //搜索字段
      queryFields: [
        { name: 'requestUrl', label: '', labelKey: 'sys.request_url', value: '', type: 'input', display: true, order: 1 },
        { name: 'requestUserNo', label: '', labelKey: 'hc.http_request_user', value: '', type: 'personal', display: true, order: 2 },
        { name: 'costTime', label: '', labelKey: 'hc.http_cost_time', value: '', type: 'input', display: true, order: 3 },
        { name: 'successFlag', label: '', labelKey: 'cm.state', value: '', type: 'select', display: true, order: 4, fieldMap: [
          { labelKey: "cm.success", value: "0" },
          { labelKey: "cm.fail", value: "1" }
        ] },
        { name: 'yearDateTime', label: '', labelKey: 'sys.log_year', value: new Date().getFullYear().toString(), type: 'dateYear', display: true, order: 5 },
        { name: 'monthDateTime', label: '', labelKey: 'sys.log_month', value: (new Date().getMonth() + 1).toString().padStart(2, '0'), type: 'dateMonth', display: true, order: 6 }
      ],
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  mounted() {
    //计算高度
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    //初始化查询
    this.initSearch();
    //获取日志列表
    this.getLogList();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  watch: {},
  methods: {
    //加载数据列表
    getLogList() {
      let _this = this;
      let params = {
        pageNumber: _this.logPageCurrent,
        pageSize: _this.logPageSize
      };
      params = Object.assign(params, _this.queryParams);
      _this.listLoading = true;
      api
        .getLogListAPI(params)
        .then(res => {
          _this.listLoading = false;
          if (res.code === "0") {
            _this.logListData = res.data.records;
            _this.logPageTotal = res.data.total;
          } else {
            _this.logListData = [];
            _this.logPageTotal = 0;
            _this.$message({ type: "error", message: res.msg });
          }
        })
        .catch(err => {
          _this.listLoading = false;
          _this.$message({ type: "error", message: err.msg });
        });
    },
    //查看详情
    getLogDetail(row) {
      let _this = this;
      _this.detailShow = true;
      _this.detailLoading = true;
      let date = new Date(row.startTime.replace(/-/g, "/"));
      let month = date.getMonth() + 1;
      month = month >= 10 ? month.toString() : "0" + month.toString();
      let params = {
        id: row.id,
        yearDateTime: date.getFullYear().toString(),
        monthDateTime: month
      };
      api
        .getLogDetailAPI(params)
        .then(res => {
          _this.detailLoading = false;
          if (res.code === "0") {
            _this.detailData = res.data;
          } else {
            _this.$message({ type: "error", message: res.msg });
          }
        })
        .catch(err => {
          _this.detailLoading = false;
          _this.$message({ type: "error", message: err.msg });
        });
    },
    //选择分类
    getClassList() {
      this.searchLoading = true;
      api
        .getClassAPI()
        .then(res => {
          this.searchLoading = false;
          if (res.code == "0") {
            this.classData = res.data;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          this.searchLoading = false;
          this.$message.error(err.msg);
        });
    },
    //选择连接器
    getConnectorList(save) {
      if (save !== true) {
        this.queryParams.connectorId = "";
        this.queryParams.requestId = "";
      }
      if (this.queryParams.classId === "") {
        this.connectorData = [];
        this.actionData = [];
        return;
      }
      let params = {
        classId: this.queryParams.classId,
        pageNumber: 1,
        pageSize: 1000
      };
      this.searchLoading = true;
      api
        .getListAPI(params)
        .then(res => {
          this.searchLoading = false;
          if (res.code == "0") {
            this.connectorData = res.data.records;
            //this.queryParams.connectorId = this.connectorData[0].connectorId
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          this.searchLoading = false;
          this.$message.error(err.msg);
        });
    },
    //选择动作
    getActionList() {
      this.queryParams.requestId = "";
      if (this.queryParams.connectorId === "") {
        this.actionData = [];
        return;
      }
      let params = {
        connectorId: this.queryParams.connectorId
      };
      this.searchLoading = true;
      api
        .getDetailAPI(params)
        .then(res => {
          this.searchLoading = false;
          if (res.code == "0") {
            this.actionData = res.data.cudConnectorDetailVOList;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          this.searchLoading = false;
          this.$message.error(err.msg);
        });
    },
    //列表搜索
    logSearch() {
      let _this = this;
      let queryForm = this.$refs.queryForm.getQueryForm();
      //除去搜索条件前后空格内容
      _this.queryParams.requestUrl = queryForm.requestUrl.trim();
      _this.queryParams.requestUserNo = queryForm.requestUserNo.trim();
      // _this.queryParams.startTime = queryForm.startTime.trim();
      // _this.queryParams.endTime = queryForm.endTime.trim();
      _this.queryParams.costTime =
        parseInt(queryForm.costTime) > 0
          ? parseInt(queryForm.costTime)
          : 0;
      _this.queryParams.successFlag = queryForm.successFlag;
      _this.queryParams.yearDateTime = queryForm.yearDateTime;
      _this.queryParams.monthDateTime = queryForm.monthDateTime;
      _this.getLogList();
    },
    //重置搜索
    logReset() {
      let _this = this;
      _this.queryParams.requestUrl = "";
      _this.queryParams.requestUserNo = "";
      _this.queryParams.requestType = "";
      _this.queryParams.interactionType = "";
      _this.queryParams.startTime = "";
      _this.queryParams.endTime = "";
      _this.queryParams.costTime = "";
      _this.queryParams.successFlag = "";
      _this.queryParams.classId = "";
      _this.queryParams.connectorId = "";
      _this.queryParams.requestId = "";
    },
    //分页调整
    logPageSizeChange(size) {
      let _this = this;
      _this.logPageSize = size;
      _this.logPageCurrent = 1;
      _this.getLogList();
    },
    //切换分页
    logPageCurrentChange(current) {
      let _this = this;
      _this.logPageCurrent = current;
      _this.getLogList();
    },
    //计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //初始化查询
    initSearch() {
      //获取当前年月
      let date = new Date();
      this.queryParams.yearDateTime = date.getFullYear().toString();
      let month = date.getMonth() + 1;
      if (month >= 10) month = month.toString();
      else month = "0" + month.toString();
      this.queryParams.monthDateTime = month;
      //获取搜索分类
      this.getClassList();
      //获取连接器ID
      if (this.$route.query.connectorId && this.$route.query.classId) {
        this.queryParams.classId = this.$route.query.classId;
        this.queryParams.connectorId = this.$route.query.connectorId;
        this.getConnectorList(true); //保留保留搜索条件
      }
    },
    //格式化时间
    dateFormat(time) {
      if (time) {
        let dateMat = null;
        dateMat = new Date(time);
        if (!dateMat.getFullYear()) {
          dateMat = new Date(time.replace(/-/g, "/"));
        }
        var year = dateMat.getFullYear();
        var month =
          dateMat.getMonth() + 1 < 10
            ? "0" + (dateMat.getMonth() + 1)
            : dateMat.getMonth() + 1;
        var day =
          dateMat.getDate() < 10 ? "0" + dateMat.getDate() : dateMat.getDate();
        var hours =
          dateMat.getHours() < 10
            ? "0" + dateMat.getHours()
            : dateMat.getHours();
        var minutes =
          dateMat.getMinutes() < 10
            ? "0" + dateMat.getMinutes()
            : dateMat.getMinutes();
        var seconds =
          dateMat.getSeconds() < 10
            ? "0" + dateMat.getSeconds()
            : dateMat.getSeconds();
        var milSeconds =
          dateMat.getMilliseconds() < 10
            ? "0" + dateMat.getMilliseconds()
            : dateMat.getMilliseconds();
        // 拼接
        return (
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes
          //  +
          // ":" +
          // seconds +
          // ":" +
          // milSeconds
        );
      }
    }
  }
};
