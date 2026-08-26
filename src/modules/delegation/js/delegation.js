import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";

const MOCK_LIST = [
  { id: 1, code: "s11", pipeName: "Condensate line", type: "弯头", owner: "张三", updateTime: "2020-05-20 10:20:45", status: "published", desc: "凝结水管线弯头" },
  { id: 2, code: "ZABF002", pipeName: "Condensate line", type: "管线", owner: "李四", updateTime: "2020-05-20 10:20:45", status: "pending", desc: "凝结水管线" },
  { id: 3, code: "ZABF003", pipeName: "Condensate line", type: "弯头", owner: "王五", updateTime: "2020-06-12 09:18:22", status: "published", desc: "凝结水管线弯头" },
  { id: 4, code: "ZABF004", pipeName: "Feedwater line", type: "三通", owner: "张三", updateTime: "2020-07-01 14:05:10", status: "pending", desc: "给水管线三通" },
  { id: 5, code: "ZABF005", pipeName: "Feedwater line", type: "法兰", owner: "李四", updateTime: "2020-07-08 16:32:01", status: "published", desc: "给水管线法兰" },
  { id: 6, code: "ZABF006", pipeName: "Main steam line", type: "管线", owner: "王五", updateTime: "2020-08-11 11:11:11", status: "published", desc: "主蒸汽管线" },
  { id: 7, code: "ZABF007", pipeName: "Main steam line", type: "弯头", owner: "张三", updateTime: "2020-08-15 08:40:00", status: "pending", desc: "主蒸汽管线弯头" },
  { id: 8, code: "ZABF008", pipeName: "Condensate line", type: "法兰", owner: "李四", updateTime: "2020-09-03 13:26:45", status: "published", desc: "凝结水管线法兰" },
  { id: 9, code: "ZABF009", pipeName: "LP heater line", type: "管线", owner: "王五", updateTime: "2020-09-20 10:20:45", status: "pending", desc: "低压加热器管线" },
  { id: 10, code: "ZABF010", pipeName: "LP heater line", type: "三通", owner: "张三", updateTime: "2020-10-02 17:08:19", status: "published", desc: "低压加热器管线三通" },
  { id: 11, code: "ZABF011", pipeName: "Condensate line", type: "管线", owner: "李四", updateTime: "2020-10-18 09:55:33", status: "published", desc: "凝结水管线" },
  { id: 12, code: "ZABF012", pipeName: "Feedwater line", type: "弯头", owner: "王五", updateTime: "2020-11-05 15:21:08", status: "pending", desc: "给水管线弯头" }
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
        { name: "lang.asset_manage" },
        { name: "lang.pipe_component_database" }
      ],
      allList: MOCK_LIST.slice(),
      tableData: [],
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.resource_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "type",
          label: "",
          labelKey: "lang.type_query",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "", labelKey: "lang.type_elbow", value: "弯头" },
            { label: "", labelKey: "lang.type_pipeline", value: "管线" },
            { label: "", labelKey: "lang.type_tee", value: "三通" },
            { label: "", labelKey: "lang.type_flange", value: "法兰" }
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
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.current - 1) * this.size + index + 1;
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
        type: queryForm.type || ""
      };
    },
    search() {
      this.current = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      const { keyword, type } = this.getQueryParams();
      const filtered = this.allList.filter(item => {
        const matchKeyword = !keyword
          ? true
          : [item.code, item.pipeName, item.desc, item.owner]
              .join(" ")
              .toLowerCase()
              .indexOf(keyword.toLowerCase()) !== -1;
        const matchType = !type ? true : item.type === type;
        return matchKeyword && matchType;
      });
      this.total = filtered.length;
      const start = (this.current - 1) * this.size;
      this.tableData = filtered.slice(start, start + this.size);
      this.loading = false;
    },
    viewRow(row) {
      this.$message.info(this.$t("cm.look") + "：" + row.code);
    },
    updateRow(row) {
      this.$message.info(this.$t("cm.update") + "：" + row.code);
    },
    handleMore(command, row) {
      if (command === "edit") {
        this.updateRow(row);
        return;
      }
      if (command === "delete") {
        this.$confirm(this.$t("cm.delete") + " " + row.code + " ?", this.$t("cm.tips"), {
          confirmButtonText: this.$t("cm.confirm"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning"
        })
          .then(() => {
            this.allList = this.allList.filter(item => item.id !== row.id);
            if ((this.current - 1) * this.size >= this.allList.length && this.current > 1) {
              this.current -= 1;
            }
            this.getList();
            this.$message.success(this.$t("cm.success"));
          })
          .catch(() => {});
      }
    },
    exportList() {
      if (!this.tableData.length) {
        this.$message.warning(this.$t("cm.nodata"));
        return;
      }
      this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
    },
    triggerImport() {
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.$message.success(this.$t("lang.batch_import") + this.$t("cm.success"));
      e.target.value = "";
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
