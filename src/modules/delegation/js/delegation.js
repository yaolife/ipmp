import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";

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
      tableData: [],
      queryFields: [
        {
          name: "componentName",
          label: "",
          labelKey: "lang.component_name",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "componentType",
          label: "",
          labelKey: "lang.component_type",
          value: "",
          type: "input",
          display: true,
          order: 2
        },
        {
          name: "responsiblePerson",
          label: "",
          labelKey: "lang.pipe_owner",
          value: "",
          type: "input",
          display: true,
          order: 3
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
    isSuccessCode(code) {
      return code === 0 || code === "0";
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
    getQueryParams(withPage = true) {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      const params = {};
      if (withPage) {
        params.current = this.current;
        params.size = this.size;
      }
      const componentName = (queryForm.componentName || "").trim();
      const componentType = (queryForm.componentType || "").trim();
      const responsiblePerson = (queryForm.responsiblePerson || "").trim();
      if (componentName) params.componentName = componentName;
      if (componentType) params.componentType = componentType;
      if (responsiblePerson) params.responsiblePerson = responsiblePerson;
      return params;
    },
    search() {
      this.current = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      api
        .pageComponents(this.getQueryParams())
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.tableData = data.records || [];
            this.total = data.total || 0;
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
          this.$nextTick(() => {
            this.initMaxHeight();
          });
        })
        .catch(() => {
          this.loading = false;
          this.tableData = [];
          this.total = 0;
        });
    },
    viewRow() {},
    downloadRow(row) {
      api
        .exportComponents(
          { ids: [row.id] },
          (row.componentName || "管道元件") + ".xlsx"
        )
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    deleteRow(row) {
      this.$confirm(
        this.$t("cm.delete") +
          " " +
          (row.componentName || row.componentType) +
          " ?",
        this.$t("cm.tips"),
        {
          confirmButtonText: this.$t("cm.confirm"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning"
        }
      )
        .then(() => {
          return api.deleteComponents({ ids: [row.id] });
        })
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            if (
              (this.current - 1) * this.size >= this.total - 1 &&
              this.current > 1
            ) {
              this.current -= 1;
            }
            this.getList();
            this.$message.success(this.$t("cm.success"));
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {});
    },
    exportList() {
      const params = this.getQueryParams(false);
      if (this.multipleSelection.length) {
        params.ids = this.multipleSelection.map(item => item.id);
      }
      api
        .exportComponents(params, "管道元件数据.xlsx")
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    downloadTemplate() {
      api
        .downloadComponentTemplate()
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    triggerImport() {
      this.$refs.importInput && this.$refs.importInput.click();
    },
    onImportFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      this.loading = true;
      api
        .importComponents(formData)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.$message.success(
              this.$t("lang.import_result") +
                " " +
                (data.successCount || 0) +
                "/" +
                (data.total || 0)
            );
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
        });
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
