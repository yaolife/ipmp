import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api/api.js";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [{ name: "lang.log_manage" }, { name: "lang.log_list" }],
      tableData: [],
      activeLevel: "",
      detailVisible: false,
      currentRow: {},
      queryFields: [
        {
          name: "callType",
          label: "",
          labelKey: "关联系统",
          value: "",
          type: "select",
          display: true,
          order: 1,
          fieldMap: [
            { label: "本系统", labelKey: "CALL_SYSTEM", value: "CALL_SYSTEM" },
            { label: "在线监测平台", labelKey: "在线监测平台", value: "在线监测平台" },
            { label: "IOTDB系统", labelKey: "IOTDB系统", value: "IOTDB系统" },
            { label: "SAP系统", labelKey: "SAP系统", value: "SAP系统" },
            { label: "Idoc系统", labelKey: "Idoc系统", value: "Idoc系统" }
          ]
        },
        {
          name: "methodArgs",
          label: "",
          labelKey: "请求参数",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "operTitle",
          label: "",
          labelKey: "业务模块",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "logType",
          label: "",
          labelKey: "业务类型",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "methodName",
          label: "",
          labelKey: "接口名称",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "operUser",
          label: "",
          labelKey: "操作用户",
          value: "",
          type: "input",
          display: true,
          order: 2
        },

        {
          name: "requestTimeStart",
          label: "",
          labelKey: "请求时间",
          value: [],
          relation: "requestTimeEnd",
          type: "dateRange",
          display: true,
          order: 2
        },
        {
          name: "responseStatus",
          label: "",
          labelKey: "响应状态",
          value: "",
          type: "select",
          display: true,
          order: 3,
          fieldMap: [
            { label: "成功", labelKey: "SUCCESS", value: "SUCCESS" },
            { label: "失败", labelKey: "ERROR", value: "ERROR" }
          ]
        }
      ],
      currentNo: 1,
      sizeNo: 10,
      total: 0,
      multipleSelection: [],
      tableLoading: false,
      maxTableHeight: 0
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    },
  },
  methods: {
    fetchData() {
      this.tableLoading = true;
      this.tableData = [];
      // 直接调用封装好的方法，自动合并表单参数+分页参数
      const fullQueryParams = this.buildFullQueryParams();
      api.getApiLogListAPI(fullQueryParams)
        .then(result => {
          if (result.data.code === '0') {
            this.tableData = result.data.data.records;
            this.total = result.data.data.total;
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error(result.data.msg || '获取数据失败');
          }
        })
        .catch(error => {
          this.$message.error('请求失败，请稍后重试');
        })
        .finally(() => {
          // 无论成功失败都关闭loading，避免之前代码里提前置为false的bug
          this.tableLoading = false;
        });
    },
    // 单独封装的公共参数组装方法
    buildFullQueryParams() {
      // 1. 先获取查询表单的所有筛选条件
      const formParams = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};

      // 2. 自动拼接分页参数，和你后端MyBatis-Plus的分页参数命名完全对齐
      const pageParams = {
        pageNum: this.currentNo,  // 当前页码
        pageSize: this.sizeNo       // 每页条数
      };

      // 3. 兼容全环境实现：合并对象+自动过滤空值，完全替代Object.fromEntries写法
      const mergedParams = {...formParams, ...pageParams};
      const filteredParams = {};
      Object.keys(mergedParams).forEach(key => {
        const value = mergedParams[key];
        // 和原来的过滤规则完全一致：空字符串、null、undefined全部排除
        if (value !== '' && value !== null && value !== undefined) {
          filteredParams[key] = value;
        }
      });
      return filteredParams;
    },
    toPercentNumMs(num) {
      if (!num) {
        return '0ms';
      }
      // 处理非数字输入
      if (typeof num !== 'number' || isNaN(num)) {
        return num + 'ms';
      }
      // 转换为百分比并保留两位小
      return num.toFixed(0) + 'ms';
    },
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.currentNo - 1) * this.sizeNo + index + 1;
    },

    moduleLabel(module) {
      const map = {
        pipe: "lang.log_module_pipe",
        hanger: "lang.log_module_hanger",
        component: "lang.log_module_component",
        auth: "lang.log_module_auth"
      };
      return map[module] ? this.$t(map[module]) : module;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleSizeChange(size) {
      this.sizeNo = size;
      this.currentNo = 1;
      this.fetchData();
    },
    handleCurrentChange(current) {
      this.currentNo = current;
      this.fetchData();
    },
    getQueryParams() {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      return {
        keyword: (queryForm.keyword || "").trim(),
        level: this.activeLevel || "",
        module: queryForm.module || ""
      };
    },
    search() {
      this.currentNo = 1;
      this.fetchData();
    },

    viewRow(row) {
      this.currentNoRow = row;
      this.detailVisible = true;
    },
    exportList() {
      if (!this.tableData.length) {
        this.$message.warning(this.$t("cm.nodata"));
        return;
      }
      this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
    },

  },
  mounted() {
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.fetchData();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
