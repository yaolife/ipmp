import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";

const MOCK_LIST = [
  {
    id: 1,
    tab: "record",
    hangerNo: "ZABP-H-001",
    unitNo: "1号机",
    systemNo: "ABP",
    hangerCategory: "支吊架",
    hangerType: "管道防甩击装置",
    islandType: "常规岛",
    planNo: "JH-2026-001",
    overhaulStatus: "热态",
    overhaulResult: "正常",
    inspector: "[P645360]曾国梁",
    factory: "5090",
    overhaulType: "计划检修",
    defectDesc: "无明显缺陷",
    handleMeasure: "按规程检查，状态正常",
    recordTime: "2026-08-20 09:18:22",
    updateTime: "2026-08-20 10:02:11"
  },
  {
    id: 2,
    tab: "record",
    hangerNo: "ZABP-H-014",
    unitNo: "1号机",
    systemNo: "ABP",
    hangerCategory: "支吊架",
    hangerType: "弹簧支吊架",
    islandType: "常规岛",
    planNo: "JH-2026-002",
    overhaulStatus: "冷态",
    overhaulResult: "正常",
    inspector: "[P645360]曾国梁",
    factory: "5090",
    overhaulType: "计划检修",
    defectDesc: "弹簧指示略有偏移",
    handleMeasure: "现场复位并复测载荷",
    recordTime: "2026-08-18 14:26:08",
    updateTime: "2026-08-18 15:41:36"
  },
  {
    id: 3,
    tab: "record",
    hangerNo: "ZABF-H-008",
    unitNo: "2号机",
    systemNo: "ABF",
    hangerCategory: "支吊架",
    hangerType: "刚性支吊架",
    islandType: "核岛",
    planNo: "JH-2026-006",
    overhaulStatus: "静态",
    overhaulResult: "异常",
    inspector: "[P631038]杨旭",
    factory: "5090",
    overhaulType: "临时检修",
    defectDesc: "连接螺栓松动，局部锈蚀",
    handleMeasure: "紧固螺栓并做防锈处理",
    recordTime: "2026-08-16 11:03:45",
    updateTime: "2026-08-16 16:20:19"
  },
  {
    id: 4,
    tab: "record",
    hangerNo: "ZABP-H-021",
    unitNo: "1号机",
    systemNo: "ABP",
    hangerCategory: "支吊架",
    hangerType: "管道防甩击装置",
    islandType: "常规岛",
    planNo: "JH-2026-009",
    overhaulStatus: "热态",
    overhaulResult: "正常",
    inspector: "[P612001]李四",
    factory: "5090",
    overhaulType: "计划检修",
    defectDesc: "/",
    handleMeasure: "例行检查，无处理项",
    recordTime: "2026-08-12 08:42:17",
    updateTime: "2026-08-12 09:10:04"
  },
  {
    id: 5,
    tab: "record",
    hangerNo: "ZRE-H-003",
    unitNo: "2号机",
    systemNo: "ARE",
    hangerCategory: "支吊架",
    hangerType: "弹簧支吊架",
    islandType: "核岛",
    planNo: "JH-2026-011",
    overhaulStatus: "冷态",
    overhaulResult: "正常",
    inspector: "[P645360]曾国梁",
    factory: "5091",
    overhaulType: "计划检修",
    defectDesc: "保温层局部破损",
    handleMeasure: "更换破损保温并复原标识",
    recordTime: "2026-08-08 13:15:39",
    updateTime: "2026-08-08 17:28:52"
  },
  {
    id: 6,
    tab: "record",
    hangerNo: "ZABP-H-033",
    unitNo: "1号机",
    systemNo: "ABP",
    hangerCategory: "支吊架",
    hangerType: "刚性支吊架",
    islandType: "常规岛",
    planNo: "JH-2026-015",
    overhaulStatus: "热态",
    overhaulResult: "异常",
    inspector: "[P612001]李四",
    factory: "5090",
    overhaulType: "临时检修",
    defectDesc: "限位块间隙超差",
    handleMeasure: "调整限位间隙并记录复测值",
    recordTime: "2026-08-05 16:51:02",
    updateTime: "2026-08-06 09:07:28"
  },
  {
    id: 7,
    tab: "inspect",
    hangerNo: "ZABP-H-001",
    unitNo: "1号机",
    systemNo: "ABP",
    hangerCategory: "支吊架",
    hangerType: "管道防甩击装置",
    islandType: "常规岛",
    planNo: "XJ-2026-021",
    overhaulStatus: "热态",
    overhaulResult: "正常",
    inspector: "[P645360]曾国梁",
    factory: "5090",
    overhaulType: "日常巡检",
    defectDesc: "外观完好",
    handleMeasure: "巡检通过",
    recordTime: "2026-08-25 08:12:40",
    updateTime: "2026-08-25 08:20:16"
  },
  {
    id: 8,
    tab: "inspect",
    hangerNo: "ZABF-H-008",
    unitNo: "2号机",
    systemNo: "ABF",
    hangerCategory: "支吊架",
    hangerType: "刚性支吊架",
    islandType: "核岛",
    planNo: "XJ-2026-028",
    overhaulStatus: "静态",
    overhaulResult: "异常",
    inspector: "[P631038]杨旭",
    factory: "5090",
    overhaulType: "日常巡检",
    defectDesc: "发现轻微渗油痕迹",
    handleMeasure: "已上报并列入跟踪项",
    recordTime: "2026-08-22 10:36:11",
    updateTime: "2026-08-22 11:02:47"
  },
  {
    id: 9,
    tab: "inspect",
    hangerNo: "ZRE-H-003",
    unitNo: "2号机",
    systemNo: "ARE",
    hangerCategory: "支吊架",
    hangerType: "弹簧支吊架",
    islandType: "核岛",
    planNo: "XJ-2026-033",
    overhaulStatus: "冷态",
    overhaulResult: "正常",
    inspector: "[P612001]李四",
    factory: "5091",
    overhaulType: "日常巡检",
    defectDesc: "/",
    handleMeasure: "巡检通过",
    recordTime: "2026-08-19 15:08:53",
    updateTime: "2026-08-19 15:16:20"
  }
];

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: "lang.overhaul_manage" },
        { name: "lang.overhaul_record_manage" }
      ],
      allList: MOCK_LIST.slice(),
      tableData: [],
      activeTab: "record",
      detailVisible: false,
      currentRow: {},
      queryFields: [
        {
          name: "hangerNo",
          label: "",
          labelKey: "lang.hanger_no",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "unitNo",
          label: "",
          labelKey: "lang.unit_no",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "1号机", value: "1号机" },
            { label: "2号机", value: "2号机" }
          ]
        },
        {
          name: "systemNo",
          label: "",
          labelKey: "lang.system_no",
          value: "",
          type: "select",
          display: true,
          order: 3,
          fieldMap: [
            { label: "ABP", value: "ABP" },
            { label: "ABF", value: "ABF" },
            { label: "ARE", value: "ARE" }
          ]
        },
        {
          name: "hangerCategory",
          label: "",
          labelKey: "lang.hanger_category",
          value: "",
          type: "select",
          display: true,
          order: 4,
          fieldMap: [{ label: "支吊架", value: "支吊架" }]
        },
        {
          name: "hangerType",
          label: "",
          labelKey: "lang.hanger_type",
          value: "",
          type: "select",
          display: true,
          order: 5,
          fieldMap: [
            { label: "管道防甩击装置", value: "管道防甩击装置" },
            { label: "弹簧支吊架", value: "弹簧支吊架" },
            { label: "刚性支吊架", value: "刚性支吊架" }
          ]
        },
        {
          name: "islandType",
          label: "",
          labelKey: "lang.island_type",
          value: "",
          type: "select",
          display: true,
          order: 6,
          fieldMap: [
            { label: "常规岛", value: "常规岛" },
            { label: "核岛", value: "核岛" }
          ]
        },
        {
          name: "planNo",
          label: "",
          labelKey: "lang.plan_no",
          value: "",
          type: "input",
          display: true,
          order: 7
        },
        {
          name: "overhaulStatus",
          label: "",
          labelKey: "lang.overhaul_status",
          value: "",
          type: "select",
          display: true,
          order: 8,
          fieldMap: [
            { label: "热态", value: "热态" },
            { label: "冷态", value: "冷态" },
            { label: "静态", value: "静态" }
          ]
        },
        {
          name: "overhaulResult",
          label: "",
          labelKey: "lang.overhaul_result",
          value: "",
          type: "select",
          display: true,
          order: 9,
          fieldMap: [
            { label: "正常", value: "正常" },
            { label: "异常", value: "异常" }
          ]
        },
        {
          name: "inspector",
          label: "",
          labelKey: "lang.overhaul_inspector",
          value: "",
          type: "input",
          display: true,
          order: 10
        },
        {
          name: "factory",
          label: "",
          labelKey: "lang.factory",
          value: "",
          type: "select",
          display: true,
          order: 11,
          fieldMap: [
            { label: "5090", value: "5090" },
            { label: "5091", value: "5091" }
          ]
        }
      ],
      current: 1,
      size: 10,
      total: 0,
      loading: false,
      maxTableHeight: 0
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  watch: {
    activeTab() {
      this.current = 1;
      this.getList();
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.current - 1) * this.size + index + 1;
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
        hangerNo: (queryForm.hangerNo || "").trim(),
        unitNo: queryForm.unitNo || "",
        systemNo: queryForm.systemNo || "",
        hangerCategory: queryForm.hangerCategory || "",
        hangerType: queryForm.hangerType || "",
        islandType: queryForm.islandType || "",
        planNo: (queryForm.planNo || "").trim(),
        overhaulStatus: queryForm.overhaulStatus || "",
        overhaulResult: queryForm.overhaulResult || "",
        inspector: (queryForm.inspector || "").trim(),
        factory: queryForm.factory || ""
      };
    },
    search() {
      this.current = 1;
      this.getList();
    },
    matchField(value, keyword) {
      if (!keyword) return true;
      return String(value || "")
        .toLowerCase()
        .indexOf(String(keyword).toLowerCase()) !== -1;
    },
    getList() {
      this.loading = true;
      const params = this.getQueryParams();
      const filtered = this.allList.filter(item => {
        if (item.tab !== this.activeTab) return false;
        return (
          this.matchField(item.hangerNo, params.hangerNo) &&
          this.matchField(item.unitNo, params.unitNo) &&
          this.matchField(item.systemNo, params.systemNo) &&
          this.matchField(item.hangerCategory, params.hangerCategory) &&
          this.matchField(item.hangerType, params.hangerType) &&
          this.matchField(item.islandType, params.islandType) &&
          this.matchField(item.planNo, params.planNo) &&
          this.matchField(item.overhaulStatus, params.overhaulStatus) &&
          this.matchField(item.overhaulResult, params.overhaulResult) &&
          this.matchField(item.inspector, params.inspector) &&
          this.matchField(item.factory, params.factory)
        );
      });
      this.total = filtered.length;
      const start = (this.current - 1) * this.size;
      this.tableData = filtered.slice(start, start + this.size);
      this.loading = false;
      this.$nextTick(() => {
        this.initMaxHeight();
      });
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
