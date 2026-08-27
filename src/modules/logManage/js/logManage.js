import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";

const MOCK_LIST = [
  { id: 1, time: "2026-08-27 10:21:08", level: "ERROR", module: "pipe", operator: "张三", ip: "192.168.0.21", cost: 1280, traceId: "tr-8a21c9", requestId: "req-10021", message: "导入管道数据失败：目录名称无法唯一映射", detail: "DIRECTORY_ID 匹配失败，同名资源目录存在多条记录。" },
  { id: 2, time: "2026-08-27 10:18:42", level: "WARN", module: "pipe", operator: "李四", ip: "192.168.0.36", cost: 420, traceId: "tr-7c10ab", requestId: "req-10018", message: "批量导入存在 3 条跳过记录", detail: "跳过原因为必填字段为空：管道名称、责任人。" },
  { id: 3, time: "2026-08-27 10:12:15", level: "INFO", module: "pipe", operator: "张三", ip: "192.168.0.21", cost: 86, traceId: "tr-6b90de", requestId: "req-10012", message: "查询资源目录树成功", detail: "GET /api/model-resource-directories/tree?type=0，返回 19 个节点。" },
  { id: 4, time: "2026-08-27 09:58:33", level: "INFO", module: "component", operator: "王五", ip: "10.12.8.14", cost: 64, traceId: "tr-5a11ef", requestId: "req-10008", message: "导出管道元件清单", detail: "导出文件 component_20260827.xlsx，共 12 条。" },
  { id: 5, time: "2026-08-27 09:41:09", level: "DEBUG", module: "hanger", operator: "李四", ip: "192.168.0.36", cost: 22, traceId: "tr-49cc01", requestId: "req-10005", message: "支吊架列表筛选条件变更", detail: "keyword=ZABF, type=管线。" },
  { id: 6, time: "2026-08-27 09:22:47", level: "ERROR", module: "auth", operator: "赵六", ip: "10.8.3.19", cost: 15, traceId: "tr-38bb12", requestId: "req-10002", message: "登录失败：账号或密码错误", detail: "连续失败 2 次，剩余可尝试 3 次。" },
  { id: 7, time: "2026-08-27 09:05:11", level: "INFO", module: "auth", operator: "张三", ip: "192.168.0.21", cost: 31, traceId: "tr-27aa23", requestId: "req-09998", message: "用户登录成功", detail: "登录来源：Web，浏览器 Chrome。" },
  { id: 8, time: "2026-08-26 18:40:26", level: "WARN", module: "component", operator: "王五", ip: "10.12.8.14", cost: 210, traceId: "tr-16ee34", requestId: "req-09980", message: "元件状态从已发布回退为待审核", detail: "记录编号 ZABF002，操作原因：图纸版本更新。" },
  { id: 9, time: "2026-08-26 17:16:03", level: "INFO", module: "pipe", operator: "李四", ip: "192.168.0.36", cost: 540, traceId: "tr-05dd45", requestId: "req-09966", message: "下载 Condensate line 模型文件", detail: "文件 condensate-line.rvm，大小 24.6MB。" },
  { id: 10, time: "2026-08-26 16:02:58", level: "DEBUG", module: "pipe", operator: "张三", ip: "192.168.0.21", cost: 18, traceId: "tr-f4cc56", requestId: "req-09951", message: "切换资源目录节点", detail: "选中节点：低压给水加热器系统。" },
  { id: 11, time: "2026-08-26 15:28:40", level: "ERROR", module: "hanger", operator: "王五", ip: "10.12.8.14", cost: 980, traceId: "tr-e3bb67", requestId: "req-09940", message: "支吊架附件上传超时", detail: "连接对象存储超时，已重试 2 次。" },
  { id: 12, time: "2026-08-26 14:11:22", level: "INFO", module: "component", operator: "李四", ip: "192.168.0.36", cost: 73, traceId: "tr-d2aa78", requestId: "req-09922", message: "查看管道元件详情", detail: "记录编号 s11，类型 弯头。" },
  { id: 13, time: "2026-08-26 11:09:55", level: "WARN", module: "auth", operator: "赵六", ip: "10.8.3.19", cost: 12, traceId: "tr-c19989", requestId: "req-09901", message: "会话即将过期", detail: "剩余有效时间 5 分钟。" },
  { id: 14, time: "2026-08-26 10:33:18", level: "INFO", module: "hanger", operator: "张三", ip: "192.168.0.21", cost: 91, traceId: "tr-b08890", requestId: "req-09888", message: "查询支吊架数据库列表", detail: "返回 0 条，筛选条件为空。" },
  { id: 15, time: "2026-08-26 09:16:44", level: "DEBUG", module: "component", operator: "王五", ip: "10.12.8.14", cost: 9, traceId: "tr-a07701", requestId: "req-09870", message: "重置查询表单", detail: "清空 keyword、type 条件。" }
];

const LEVEL_TAG = {
  ERROR: "danger",
  WARN: "warning",
  INFO: "success",
  DEBUG: "info"
};

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [{ name: "lang.log_manage" }, { name: "lang.log_list" }],
      allList: MOCK_LIST.slice(),
      tableData: [],
      activeLevel: "",
      detailVisible: false,
      currentRow: {},
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.log_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "level",
          label: "",
          labelKey: "lang.log_level",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "", labelKey: "lang.log_level_error", value: "ERROR" },
            { label: "", labelKey: "lang.log_level_warn", value: "WARN" },
            { label: "", labelKey: "lang.log_level_info", value: "INFO" },
            { label: "", labelKey: "lang.log_level_debug", value: "DEBUG" }
          ]
        },
        {
          name: "module",
          label: "",
          labelKey: "lang.log_module",
          value: "",
          type: "select",
          display: true,
          order: 3,
          fieldMap: [
            { label: "", labelKey: "lang.log_module_pipe", value: "pipe" },
            { label: "", labelKey: "lang.log_module_hanger", value: "hanger" },
            { label: "", labelKey: "lang.log_module_component", value: "component" },
            { label: "", labelKey: "lang.log_module_auth", value: "auth" }
          ]
        }
      ],
      current: 1,
      size: 10,
      total: 0,
      multipleSelection: [],
      loading: false,
      maxTableHeight: 0
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    },
    levelCounts() {
      const counts = { ALL: this.allList.length, ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
      this.allList.forEach(item => {
        if (counts[item.level] !== undefined) counts[item.level] += 1;
      });
      return counts;
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.current - 1) * this.size + index + 1;
    },
    levelTagType(level) {
      return LEVEL_TAG[level] || "info";
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
      this.size = size;
      this.current = 1;
      this.getList();
    },
    handleCurrentChange(current) {
      this.current = current;
      this.getList();
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
    filterByLevel(level) {
      this.activeLevel = this.activeLevel === level ? "" : level;
      this.current = 1;
      this.getList();
    },
    search() {
      this.current = 1;
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      if (queryForm.level) this.activeLevel = queryForm.level;
      this.getList();
    },
    getList() {
      this.loading = true;
      const { keyword, level, module } = this.getQueryParams();
      const filtered = this.allList.filter(item => {
        const matchKeyword = !keyword
          ? true
          : [item.message, item.operator, item.ip, item.traceId]
              .join(" ")
              .toLowerCase()
              .indexOf(keyword.toLowerCase()) !== -1;
        const matchLevel = !level ? true : item.level === level;
        const matchModule = !module ? true : item.module === module;
        return matchKeyword && matchLevel && matchModule;
      });
      this.total = filtered.length;
      const start = (this.current - 1) * this.size;
      this.tableData = filtered.slice(start, start + this.size);
      this.loading = false;
    },
    viewRow(row) {
      this.currentRow = row;
      this.detailVisible = true;
    },
    exportList() {
      if (!this.tableData.length) {
        this.$message.warning(this.$t("cm.nodata"));
        return;
      }
      this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
    },
    refreshList() {
      this.getList();
      this.$message.success(this.$t("cm.refresh"));
    }
  },
  mounted() {
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.getList();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
