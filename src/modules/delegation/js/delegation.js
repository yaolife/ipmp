import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";
import componentFormDialog from "../components/componentFormDialog.vue";
import componentConfirmDialog from "../components/componentConfirmDialog.vue";

export default {
  components: {
    breadcrumb,
    queryForm,
    componentFormDialog,
    componentConfirmDialog
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
      if (!row) return "";
      const files = row.files;
      if (Array.isArray(files) && files.length) {
        const first = files[0] || {};
        return first.id || first.fileId || "";
      }
      return row.fileId || row.sysFileId || "";
    },
    getAbsoluteFileUrl(row) {
      const file = ((row && row.files) || [])[0] || {};
      return String(file.absoluteFileUrl || (row && row.absoluteFileUrl) || "").trim();
    },
    fetchComponentDetail(id) {
      if (!id) {
        return Promise.reject({ msg: this.$t("cm.fail") });
      }
      return api.getComponentDetail(id).then(res => {
        if (this.isSuccessCode(res && res.code) && res.data) {
          return this.mergeFileMeta(res.data);
        }
        const err = { msg: (res && res.msg) || this.$t("cm.fail") };
        this.$message.error(err.msg);
        return Promise.reject(err);
      });
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
      const files = (row && row.files) || [];
      const meta = file || files[0] || {};
      const fileSuffix = meta.fileSuffix || row.fileSuffix || "";
      const fileSize =
        meta.fileSize != null
          ? meta.fileSize
          : row.fileSize != null
            ? row.fileSize
            : null;
      return {
        ...row,
        fileId: meta.id || this.getFileId(row),
        originalName: meta.originalName || row.originalName || "",
        fileSuffix,
        fileSize,
        absoluteFileUrl: meta.absoluteFileUrl || row.absoluteFileUrl || "",
        remark: row.remark || meta.remark || "",
        modelFormat: fileSuffix || "-",
        modelSize:
          fileSize === null || fileSize === undefined || fileSize === ""
            ? "-"
            : fileSize + "kb"
      };
    },
    fillFileMeta(records) {
      const rows = (records || []).slice();
      const ids = [];
      rows.forEach(row => {
        if (Array.isArray(row.files) && row.files.length) return;
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
      this.fetchComponentDetail(row && row.id)
        .then(detail => {
          this.$refs.componentFormDialog &&
            this.$refs.componentFormDialog.open(detail);
        })
        .catch(() => {});
    },
    saveComponent(payload) {
      const dialog = this.$refs.componentFormDialog;
      const isEdit = !!payload.id;
      const body = {
        componentName: payload.componentName,
        remark: payload.remark,
        fileSize: payload.fileSize,
        originalName: payload.originalName,
        fileSuffix: payload.fileSuffix
      };
      if (payload.fileId) {
        body.fileIds = [payload.fileId];
      }
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
    getRelativeFileUrl(row) {
      const file = ((row && row.files) || [])[0] || {};
      return String(file.fileUrl || "").trim();
    },
    saveBlobAsFile(blob, filename) {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = filename || "模型文件";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    },
    fetchFileBlob(url) {
      if (!url) return Promise.reject(new Error("empty url"));
      return fetch(url, { credentials: "omit" }).then(res => {
        if (!res.ok) {
          throw new Error("download fail");
        }
        return res.blob();
      });
    },
    downloadByFile(row) {
      const url = this.getAbsoluteFileUrl(row);
      if (!url) {
        this.$message.warning(this.$t("lang.no_file_to_download"));
        return Promise.reject({ msg: this.$t("lang.no_file_to_download") });
      }
      const filename = row.originalName || row.componentName || "模型文件";
      const relativeUrl = this.getRelativeFileUrl(row);
      return this.fetchFileBlob(url)
        .catch(() => this.fetchFileBlob(relativeUrl))
        .then(blob => {
          this.saveBlobAsFile(blob, filename);
        })
        .catch(() => {
          const iframe = document.createElement("iframe");
          iframe.style.cssText =
            "position:absolute;left:-9999px;width:0;height:0;border:0;visibility:hidden;";
          iframe.src = url;
          document.body.appendChild(iframe);
          setTimeout(() => {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          }, 30000);
        });
    },
    previewRow(row) {
      this.fetchComponentDetail(row && row.id)
        .then(detail => {
          const url = this.getAbsoluteFileUrl(detail);
          if (!url) {
            this.$message.warning(this.$t("lang.no_file_to_preview"));
            return;
          }
          window.open(url, "_blank");
        })
        .catch(() => {});
    },
    downloadRow(row) {
      this.fetchComponentDetail(row && row.id)
        .then(detail => {
          if (!this.getAbsoluteFileUrl(detail)) {
            this.$message.warning(this.$t("lang.no_file_to_download"));
            return;
          }
          this.$refs.componentConfirmDialog &&
            this.$refs.componentConfirmDialog.open("download", detail);
        })
        .catch(() => {});
    },
    batchDownload() {
      if (!this.multipleSelection.length) {
        this.$message.warning(this.$t("lang.select_download_item"));
        return;
      }
      const rows = this.multipleSelection
        .map(row => this.mergeFileMeta(row))
        .filter(item => this.getAbsoluteFileUrl(item));
      if (!rows.length) {
        this.$message.warning(this.$t("lang.no_file_to_download"));
        return;
      }
      this.$refs.componentConfirmDialog &&
        this.$refs.componentConfirmDialog.open("download", rows);
    },
    deleteRow(row) {
      this.fetchComponentDetail(row && row.id)
        .then(detail => {
          if (!this.getAbsoluteFileUrl(detail)) {
            this.$message.warning(this.$t("lang.no_model_file"));
            return;
          }
          this.$refs.componentConfirmDialog &&
            this.$refs.componentConfirmDialog.open("delete", detail);
        })
        .catch(() => {});
    },
    onConfirmAction({ type, rows }) {
      if (type === "delete") {
        this.doDeleteRow(rows && rows[0]);
        return;
      }
      this.doDownloadRows(rows || []);
    },
    doDownloadRows(rows) {
      const dialog = this.$refs.componentConfirmDialog;
      const list = (rows || []).filter(item => this.getAbsoluteFileUrl(item));
      if (!list.length) {
        dialog && dialog.finish();
        this.$message.warning(this.$t("lang.no_file_to_download"));
        return;
      }
      const isBatch = list.length > 1;
      list
        .reduce((promise, row, index) => {
          return promise.then(() => {
            return new Promise(resolve => {
              setTimeout(resolve, index === 0 ? 0 : 300);
            }).then(() => this.downloadByFile(row));
          });
        }, Promise.resolve())
        .then(() => {
          dialog && dialog.close();
          this.$message.success(
            (isBatch ? this.$t("lang.batch_download") : this.$t("cm.download")) +
              this.$t("cm.success")
          );
        })
        .catch(err => {
          dialog && dialog.finish();
          if (err && err.msg === this.$t("lang.no_file_to_download")) return;
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    doDeleteRow(row) {
      const dialog = this.$refs.componentConfirmDialog;
      if (!row || !row.id) {
        dialog && dialog.finish();
        return;
      }
      api
        .deleteComponents({ ids: [row.id] })
        .then(res => {
          dialog && dialog.finish();
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
            dialog && dialog.close();
            this.getList();
            this.$message.success(this.$t("cm.success"));
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          dialog && dialog.finish();
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
