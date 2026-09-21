import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import api from "../api";
import uploadModelDialog from "../components/uploadModelDialog.vue";
import editModelInfoDialog from "../components/editModelInfoDialog.vue";
import modelLibraryDialog from "../components/modelLibraryDialog.vue";

function splitFileIds(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

export default {
  name: "ModelManage",
  components: {
    breadcrumb,
    queryForm,
    uploadModelDialog,
    editModelInfoDialog,
    modelLibraryDialog
  },
  data: function() {
    return {
      hasIcon: false,
      brand: [
        { name: "lang.asset_manage" },
        { name: "lang.pipe_component_database" },
        { name: "lang.model_manage" }
      ],
      tableData: [],
      queryFields: [
        {
          name: "keyword",
          label: "",
          labelKey: "lang.model_keyword",
          value: "",
          type: "input",
          display: true,
          order: 1
        },
        {
          name: "modelType",
          label: "",
          labelKey: "lang.model_type",
          value: "",
          type: "select",
          display: true,
          order: 2,
          fieldMap: [
            { label: "", labelKey: "lang.all_option", value: "" },
            { label: "管道模型", value: "管道模型" },
            { label: "支吊架模型", value: "支吊架模型" },
            { label: "元件模型", value: "元件模型" }
          ]
        },
        {
          name: "status",
          label: "",
          labelKey: "lang.status",
          value: "",
          type: "select",
          display: true,
          order: 3,
          fieldMap: [
            { label: "", labelKey: "lang.all_option", value: "" },
            { label: "", labelKey: "lang.status_enabled", value: "1" },
            { label: "", labelKey: "lang.status_disabled", value: "0" }
          ]
        }
      ],
      current: 1,
      size: 10,
      total: 0,
      multipleSelection: [],
      loading: false,
      maxTableHeight: 0,
      statusUpdating: false
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
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    isEnabled(status) {
      return status === 1 || status === "1";
    },
    getFirstFile(row) {
      const files = (row && row.files) || [];
      return files[0] || {};
    },
    mapRow(row) {
      const file = this.getFirstFile(row);
      const suffix = file.fileSuffix || "";
      return Object.assign({}, row, {
        fileFormat: suffix ? "." + String(suffix).replace(/^\./, "") : "-",
        originalName: file.originalName || row.modelName || "",
        fileId: file.id || splitFileIds(row.fileIds)[0] || "",
        absoluteFileUrl: file.absoluteFileUrl || "",
        fileUrl: file.fileUrl || ""
      });
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
      const params = {
        current: this.current,
        size: this.size
      };
      const keyword = (queryForm.keyword || "").trim();
      const modelType = (queryForm.modelType || "").trim();
      const status = queryForm.status;
      if (keyword) params.keyword = keyword;
      if (modelType) params.modelType = modelType;
      if (status === 0 || status === "0" || status === 1 || status === "1") {
        params.status = String(status);
      }
      return params;
    },
    search() {
      this.current = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      api
        .pageModelResources(this.getQueryParams())
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            const data = res.data || {};
            this.total = data.total || 0;
            this.tableData = (data.records || []).map(item => this.mapRow(item));
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
          this.$nextTick(() => {
            this.initMaxHeight();
          });
        })
        .catch(err => {
          this.loading = false;
          this.tableData = [];
          this.total = 0;
          this.$message.error(this.getRequestErrorMsg(err));
        });
    },
    getRequestErrorMsg(err) {
      const res = err && err.response && err.response.data;
      return (
        (res && (res.msg || res.error || res.message)) ||
        (err && err.msg) ||
        this.$t("cm.fail")
      );
    },
    fetchDetail(id) {
      if (!id) return Promise.reject({ msg: this.$t("cm.fail") });
      return api.getModelResourceDetail(id).then(res => {
        if (this.isSuccessCode(res && res.code) && res.data) {
          return this.mapRow(res.data);
        }
        const err = { msg: (res && res.msg) || this.$t("cm.fail") };
        this.$message.error(err.msg);
        return Promise.reject(err);
      });
    },
    openUpload() {
      this.$refs.uploadDialog && this.$refs.uploadDialog.open();
    },
    createModel(payload) {
      const dialog = this.$refs.uploadDialog;
      const formData = payload && payload.formData;
      if (!formData) {
        dialog && dialog.finishSave();
        return;
      }
      api
        .uploadModelResource(formData)
        .then(res => {
          dialog && dialog.finishSave();
          if (this.isSuccessCode(res && res.code)) {
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
    editRow(row) {
      this.fetchDetail(row && row.id)
        .then(detail => {
          this.$refs.libraryDialog && this.$refs.libraryDialog.open(detail);
        })
        .catch(() => {});
    },
    openEditModel(model) {
      this.fetchDetail(model && model.id)
        .then(detail => {
          this.$refs.editInfoDialog && this.$refs.editInfoDialog.open(detail);
        })
        .catch(() => {});
    },
    updateModel(payload) {
      const dialog = this.$refs.editInfoDialog;
      api
        .updateModelResource(payload)
        .then(res => {
          dialog && dialog.finishSave();
          if (this.isSuccessCode(res && res.code)) {
            dialog && dialog.close();
            this.$message.success(this.$t("cm.edit_succ"));
            this.getList();
            if (this.$refs.libraryDialog) {
              this.$refs.libraryDialog.updateModel(res.data || payload);
            }
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          dialog && dialog.finishSave();
        });
    },
    onStatusChange(row, enabled) {
      if (this.statusUpdating) return;
      const nextStatus = enabled ? "1" : "0";
      const message = enabled
        ? this.$t("lang.enable_model_confirm")
        : this.$t("lang.disable_model_confirm");
      const title = enabled
        ? this.$t("lang.enable_model_title")
        : this.$t("lang.disable_model_title");
      this.$confirm(message, title, {
        confirmButtonText: enabled
          ? this.$t("cm.confirm")
          : this.$t("lang.confirm_disable"),
        cancelButtonText: this.$t("cm.cancel"),
        type: "warning"
      })
        .then(() => {
          this.statusUpdating = true;
          return api.updateModelResourceStatus({
            id: row.id,
            status: nextStatus
          });
        })
        .then(res => {
          this.statusUpdating = false;
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.success"));
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.statusUpdating = false;
        });
    },
    getFileIds(row) {
      const fromFiles = ((row && row.files) || [])
        .map(item => item && item.id)
        .filter(Boolean);
      if (fromFiles.length) return fromFiles;
      return splitFileIds(row && row.fileIds);
    },
    downloadByRow(row) {
      const fileIds = this.getFileIds(row);
      const filename = row.originalName || row.modelName || "模型文件";
      if (fileIds[0]) {
        return api.downloadSysFile(fileIds[0], filename);
      }
      const url = row.absoluteFileUrl || row.fileUrl;
      if (!url) {
        return Promise.reject({ msg: this.$t("lang.no_file_to_download") });
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return Promise.resolve();
    },
    downloadRow(row) {
      this.fetchDetail(row && row.id)
        .then(detail => this.downloadByRow(detail))
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    batchDownload() {
      if (!this.multipleSelection.length) {
        this.$message.warning(this.$t("lang.select_download_model"));
        return;
      }
      const tasks = this.multipleSelection.map(row => this.downloadByRow(row));
      Promise.all(tasks)
        .then(() => {
          this.$message.success(this.$t("cm.download") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    deleteRow(row) {
      const name = [row.modelName, row.versionNo].filter(Boolean).join(" ");
      this.$confirm(
        this.$t("lang.delete_model_confirm").replace(
          "{name}",
          name || row.id || ""
        ),
        this.$t("lang.delete_model_title"),
        {
          confirmButtonText: this.$t("cm.delete"),
          cancelButtonText: this.$t("cm.cancel"),
          type: "warning",
          confirmButtonClass: "el-button--danger"
        }
      )
        .then(() => api.deleteModelResources({ ids: [row.id] }))
        .then(res => {
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.deletesuccess"));
            this.getList();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getList();
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  activated() {
    this.getList();
    this.initMaxHeight();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};
