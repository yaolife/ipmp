import queryForm from "@/components/common/queryForm";
import { throttle, calcHeight } from "@/utils/funcUtil";
import {
  ANALYST_OPTIONS,
  stressRecords,
  createStressRecord,
  updateStressRecord,
  removeStressRecord
} from "../mock";

function emptyForm() {
  return {
    id: "",
    analysisName: "",
    analysisNo: "",
    description: "",
    analyst: "",
    versionNo: "V1.0",
    status: "draft"
  };
}

export default {
  name: "PipeStressAnalysis",
  components: {
    queryForm
  },
  data() {
    return {
      tableData: [],
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.stress_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "status",
          label: "",
          labelKey: "lang.status",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "", labelKey: "lang.all_option", value: "" },
            { label: "", labelKey: "lang.status_published", value: "published" },
            { label: "", labelKey: "lang.status_pending", value: "pending" },
            { label: "", labelKey: "lang.status_draft", value: "draft" }
          ]
        },
        {
          name: "analyst",
          label: "",
          labelKey: "lang.analyst",
          value: "",
          type: "select",
          display: true,
          order: 3,
          fieldMap: [{ label: "", labelKey: "lang.all_option", value: "" }].concat(
            ANALYST_OPTIONS.map(name => ({ label: name, value: name }))
          )
        }
      ],
      analystOptions: ANALYST_OPTIONS,
      current: 1,
      size: 10,
      total: 0,
      loading: false,
      maxTableHeight: 0,
      formVisible: false,
      formMode: "create",
      form: emptyForm(),
      previewVisible: false,
      previewRow: null,
      importVisible: false,
      importFiles: []
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    },
    formRules() {
      return {
        analysisName: [
          { required: true, message: this.$t("cm.pleaseEnter"), trigger: "blur" }
        ],
        analysisNo: [
          { required: true, message: this.$t("cm.pleaseEnter"), trigger: "blur" }
        ],
        analyst: [
          { required: true, message: this.$t("cm.pleaseSelect"), trigger: "change" }
        ],
        versionNo: [
          { required: true, message: this.$t("cm.pleaseEnter"), trigger: "blur" }
        ],
        status: [
          { required: true, message: this.$t("cm.pleaseSelect"), trigger: "change" }
        ]
      };
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    statusText(status) {
      const labels = {
        published: "lang.status_published",
        pending: "lang.status_pending",
        draft: "lang.status_draft"
      };
      return this.$t(labels[status] || "lang.status_draft");
    },
    statusTagType(status) {
      if (status === "published") return "success";
      if (status === "pending") return "warning";
      return "info";
    },
    getQueryParams() {
      const query = this.$refs.queryForm ? this.$refs.queryForm.getQueryForm() : {};
      return {
        keyword: (query.keyword || "").trim().toLowerCase(),
        status: query.status || "",
        analyst: query.analyst || ""
      };
    },
    filteredRecords() {
      const query = this.getQueryParams();
      return stressRecords.filter(row => {
        if (query.status && row.status !== query.status) return false;
        if (query.analyst && row.analyst !== query.analyst) return false;
        if (!query.keyword) return true;
        const text = [row.analysisName, row.analysisNo, row.description]
          .join(" ")
          .toLowerCase();
        return text.indexOf(query.keyword) !== -1;
      });
    },
    search() {
      this.current = 1;
      this.getList();
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
    getList() {
      this.loading = true;
      const rows = this.filteredRecords();
      const maxPage = Math.max(1, Math.ceil(rows.length / this.size) || 1);
      if (this.current > maxPage) this.current = maxPage;
      const start = (this.current - 1) * this.size;
      this.total = rows.length;
      this.tableData = rows.slice(start, start + this.size);
      this.loading = false;
      this.$nextTick(() => {
        this.initMaxHeight();
      });
    },
    openCreate() {
      this.formMode = "create";
      this.form = emptyForm();
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.stressForm && this.$refs.stressForm.clearValidate();
      });
    },
    openEdit(row) {
      this.formMode = "edit";
      this.form = Object.assign(emptyForm(), row);
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.stressForm && this.$refs.stressForm.clearValidate();
      });
    },
    saveForm() {
      this.$refs.stressForm.validate(valid => {
        if (!valid) return;
        const payload = Object.assign({}, this.form);
        if (this.formMode === "edit") {
          updateStressRecord(payload);
          this.$message.success(this.$t("cm.edit_succ"));
        } else {
          createStressRecord(payload);
          this.current = 1;
          this.$message.success(this.$t("cm.savesuccess"));
        }
        this.formVisible = false;
        this.getList();
      });
    },
    openPreview(row) {
      this.previewRow = Object.assign({}, row);
      this.previewVisible = true;
    },
    deleteRow(row) {
      this.$confirm(this.$t("cm.is_delete"), this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.delete"),
        cancelButtonText: this.$t("cm.cancel"),
        type: "warning"
      })
        .then(() => {
          removeStressRecord(row.id);
          this.$message.success(this.$t("cm.deletesuccess"));
          this.getList();
        })
        .catch(() => {});
    },
    exportRow(row) {
      const headers = [
        this.$t("lang.analysis_name"),
        this.$t("lang.analysis_no"),
        this.$t("lang.analysis_desc"),
        this.$t("lang.analyst"),
        this.$t("lang.analysis_version"),
        this.$t("lang.analysis_time"),
        this.$t("lang.status")
      ];
      const values = [
        row.analysisName,
        row.analysisNo,
        row.description,
        row.analyst,
        row.versionNo,
        row.analysisTime,
        this.statusText(row.status)
      ].map(value => '"' + String(value || "").replace(/"/g, '""') + '"');
      const content = "\uFEFF" + headers.join(",") + "\n" + values.join(",");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (row.analysisName || "stress-analysis") + ".csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    openImport() {
      this.importFiles = [];
      this.importVisible = true;
    },
    onImportChange(file, fileList) {
      this.importFiles = fileList;
    },
    onImportRemove(file, fileList) {
      this.importFiles = fileList;
    },
    confirmImport() {
      if (!this.importFiles.length) {
        this.$message.warning(this.$t("lang.select_import_file"));
        return;
      }
      this.importFiles.forEach(item => {
        const fileName = (item.name || "").replace(/\.[^.]+$/, "");
        createStressRecord({
          analysisName: fileName || this.$t("lang.pipe_stress_analysis"),
          description: item.name || "",
          status: "draft"
        });
      });
      this.importVisible = false;
      this.importFiles = [];
      this.current = 1;
      this.$message.success(this.$t("cm.savesuccess"));
      this.getList();
    }
  },
  mounted() {
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.getList();
  },
  activated() {
    this.getList();
    this.initMaxHeight();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
