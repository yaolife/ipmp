import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";
import componentFormDialog from "../components/componentFormDialog.vue";

function formatFileSize(bytes) {
  if (bytes === 0) return "0B";
  const n = Number(bytes);
  if (bytes === null || bytes === undefined || bytes === "" || isNaN(n) || n < 0) {
    return "-";
  }
  if (n < 1024) return n + "B";
  if (n < 1024 * 1024) {
    const kb = n / 1024;
    return (kb >= 100 ? kb.toFixed(0) : kb.toFixed(1).replace(/\.0$/, "")) + "KB";
  }
  if (n < 1024 * 1024 * 1024) {
    const mb = n / (1024 * 1024);
    return (mb >= 100 ? mb.toFixed(0) : mb.toFixed(1).replace(/\.0$/, "")) + "MB";
  }
  const gb = n / (1024 * 1024 * 1024);
  return gb.toFixed(1).replace(/\.0$/, "") + "GB";
}

export default {
  components: {
    breadcrumb,
    queryForm,
    componentFormDialog
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
    getFileId(row) {
      return (row && (row.fileId || row.sysFileId)) || "";
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
      if (componentName) params.componentName = componentName;
      return params;
    },
    mergeFileMeta(row, file) {
      const meta = file || {};
      const fileSuffix = meta.fileSuffix || row.fileSuffix || "";
      const fileSize =
        meta.fileSize != null
          ? meta.fileSize
          : row.fileSize != null
            ? row.fileSize
            : null;
      return {
        ...row,
        fileId: meta.id || row.fileId || row.sysFileId || "",
        originalName: meta.originalName || row.originalName || "",
        fileSuffix,
        fileSize,
        remark: row.remark || meta.remark || "",
        modelFormat: fileSuffix ? String(fileSuffix).replace(/^\./, "").toUpperCase() : "-",
        modelSize: formatFileSize(fileSize)
      };
    },
    fillFileMeta(records) {
      const rows = (records || []).slice();
      const ids = [];
      rows.forEach(row => {
        const id = this.getFileId(row);
        if (id && ids.indexOf(id) === -1) ids.push(id);
      });
      if (!ids.length) {
        return Promise.resolve(rows.map(row => this.mergeFileMeta(row)));
      }
      return api
        .listSysFiles({ ids })
        .then(res => {
          const files = this.isSuccessCode(res && res.code)
            ? res.data || []
            : [];
          const map = {};
          (files || []).forEach(item => {
            if (item && item.id) map[item.id] = item;
          });
          return rows.map(row => this.mergeFileMeta(row, map[this.getFileId(row)]));
        })
        .catch(() => rows.map(row => this.mergeFileMeta(row)));
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
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.total = data.total || 0;
            return this.fillFileMeta(data.records || []);
          }
          this.tableData = [];
          this.total = 0;
          this.$message.error((res && res.msg) || this.$t("cm.fail"));
          return [];
        })
        .then(rows => {
          this.loading = false;
          if (Array.isArray(rows)) this.tableData = rows;
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
    openCreate() {
      this.$refs.componentFormDialog && this.$refs.componentFormDialog.open();
    },
    editRow(row) {
      const open = data => {
        this.$refs.componentFormDialog && this.$refs.componentFormDialog.open(data);
      };
      const fileId = this.getFileId(row);
      if (fileId && !row.originalName) {
        api
          .listSysFiles({ ids: [fileId] })
          .then(res => {
            const file =
              this.isSuccessCode(res && res.code) && res.data && res.data[0];
            open(this.mergeFileMeta(row, file || null));
          })
          .catch(() => open(row));
        return;
      }
      open(row);
    },
    saveComponent(payload) {
      const dialog = this.$refs.componentFormDialog;
      const isEdit = !!payload.id;
      const body = {
        componentName: payload.componentName,
        remark: payload.remark,
        fileId: payload.fileId,
        fileSize: payload.fileSize,
        originalName: payload.originalName,
        fileSuffix: payload.fileSuffix
      };
      const req = isEdit
        ? api.updateComponent({
            id: payload.id,
            ...body
          })
        : api.createComponent(body);
      req
        .then(res => {
          dialog && dialog.finishSave();
          if (this.isSuccessCode(res && res.code)) {
            if (
              isEdit &&
              payload.oldFileId &&
              payload.fileId &&
              payload.oldFileId !== payload.fileId
            ) {
              api.deleteSysFiles({ ids: [payload.oldFileId] }).catch(() => {});
            }
            dialog && dialog.close();
            this.$message.success(this.$t("cm.success"));
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          dialog && dialog.finishSave();
        });
    },
    downloadByFile(row) {
      const fileId = this.getFileId(row);
      if (!fileId) {
        this.$message.warning(this.$t("lang.no_file_to_download"));
        return Promise.reject({ msg: this.$t("lang.no_file_to_download") });
      }
      const filename = row.originalName || row.componentName || "模型文件";
      return api.downloadSysFile(fileId, filename);
    },
    downloadRow(row) {
      this.downloadByFile(row)
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          if (err && err.msg === this.$t("lang.no_file_to_download")) return;
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    batchDownload() {
      if (!this.multipleSelection.length) {
        this.$message.warning(this.$t("lang.select_download_item"));
        return;
      }
      const rows = this.multipleSelection.filter(item => this.getFileId(item));
      if (!rows.length) {
        this.$message.warning(this.$t("lang.no_file_to_download"));
        return;
      }
      rows
        .reduce((promise, row, index) => {
          return promise.then(() => {
            return new Promise(resolve => {
              setTimeout(resolve, index === 0 ? 0 : 300);
            }).then(() => this.downloadByFile(row));
          });
        }, Promise.resolve())
        .then(() => {
          this.$message.success(
            this.$t("lang.batch_download") + this.$t("cm.success")
          );
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    deleteRow(row) {
      this.$confirm(
        this.$t("lang.delete_component_confirm"),
        this.$t("lang.delete_component_title"),
        {
          confirmButtonText: this.$t("lang.confirm_delete"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning",
          confirmButtonClass: "el-button--danger"
        }
      )
        .then(() => {
          return api.deleteComponents({ ids: [row.id] });
        })
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            const fileId = this.getFileId(row);
            if (fileId) {
              api.deleteSysFiles({ ids: [fileId] }).catch(() => {});
            }
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
