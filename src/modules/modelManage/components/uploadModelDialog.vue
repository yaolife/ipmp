<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="760px"
    custom-class="upload-model-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div slot="title" class="upload-dialog-header">
      <div class="dialog-kicker">MODEL RESOURCE / UPLOAD</div>
      <div class="dialog-title">{{ $t("lang.upload_model_file") }}</div>
      <div class="dialog-subtitle">{{ $t("lang.upload_model_tip") }}</div>
    </div>
    <div v-if="pendingFile" class="current-file">
      <div class="current-file-info">
        <i class="el-icon-document"></i>
        <span class="file-name" :title="pendingFile.name">{{
          pendingFile.name
        }}</span>
        <span class="file-size">{{ formatFileSize(pendingFile.size) }}</span>
      </div>
      <el-button size="small" :disabled="saving" @click="triggerFileSelect">{{
        $t("lang.reselect_file")
      }}</el-button>
    </div>
    <el-upload
      v-else
      drag
      action=""
      class="upload-dropzone"
      :auto-upload="false"
      :show-file-list="false"
      :limit="1"
      :accept="acceptAttr"
      :on-change="onFileChange"
      :on-exceed="onFileExceed"
      :disabled="saving"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">{{ $t("lang.upload_model_drag_hint") }}</div>
      <div class="upload-drop-hint">{{ $t("lang.upload_model_size_hint") }}</div>
      <div class="upload-type-hint">{{ $t("lang.upload_model_type_hint") }}</div>
      <div class="upload-type-tags">
        <span class="upload-type-tag">ZIP</span>
        <span class="upload-type-tag">TAR</span>
        <span class="upload-type-tag">TAR.GZ / TGZ</span>
        <span class="upload-type-tag">7Z</span>
      </div>
    </el-upload>
    <input
      ref="fileInput"
      type="file"
      :accept="acceptAttr"
      style="display: none"
      @change="onHiddenFileChange"
    />
    <el-form
      ref="editForm"
      :model="editForm"
      :rules="rules"
      label-position="top"
      size="small"
      class="upload-model-form"
    >
      <el-form-item :label="$t('lang.model_name')" prop="modelName">
        <el-input
          v-model="editForm.modelName"
          :placeholder="$t('lang.model_name_example')"
          maxlength="100"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.version_no')" prop="versionNo">
        <el-input
          v-model="editForm.versionNo"
          :placeholder="$t('lang.version_no_example')"
          maxlength="32"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="upload-advice">
      <span class="upload-advice-dot"></span>
      <div>
        <div class="upload-advice-title">{{ $t("lang.upload_check_title") }}</div>
        <div>{{ $t("lang.upload_check_tip") }}</div>
      </div>
    </div>
    <span slot="footer">
      <el-button size="small" :disabled="saving" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        type="primary"
        size="small"
        :loading="saving"
        :disabled="saving"
        @click="submit"
        >{{ $t("lang.start_upload") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
const ACCEPT_EXTS = ["zip", "tar", "tgz", "gz", "7z"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

function emptyForm() {
  return {
    modelName: "",
    versionNo: "V0.1"
  };
}

function getArchiveExt(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.endsWith(".tar.gz") || lower.endsWith(".tgz")) return "tgz";
  const matched = lower.match(/\.([^.]+)$/);
  return matched ? matched[1] : "";
}

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
  name: "UploadModelDialog",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      pendingFile: null,
      editForm: emptyForm()
    };
  },
  computed: {
    acceptAttr() {
      return ".zip,.tar,.tgz,.gz,.7z";
    },
    rules() {
      return {
        modelName: [
          {
            required: true,
            whitespace: true,
            message: this.$t("cm.pleaseEnter") + this.$t("lang.model_name"),
            trigger: "blur"
          }
        ]
      };
    }
  },
  methods: {
    formatFileSize,
    open() {
      this.saving = false;
      this.pendingFile = null;
      this.editForm = emptyForm();
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.editForm && this.$refs.editForm.clearValidate();
      });
    },
    close() {
      this.dialogVisible = false;
    },
    finishSave() {
      this.saving = false;
    },
    onClose() {
      this.saving = false;
      this.pendingFile = null;
      this.editForm = emptyForm();
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    triggerFileSelect() {
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    onHiddenFileChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) this.applyFile(file);
    },
    onFileChange(file, fileList) {
      if (fileList && fileList.length > 1) fileList.splice(0, 1);
      const raw = file && (file.raw || file);
      if (raw) this.applyFile(raw);
    },
    onFileExceed(files) {
      const file = files && files[0];
      if (file) this.applyFile(file);
    },
    applyFile(file) {
      const ext = getArchiveExt(file.name);
      if (ACCEPT_EXTS.indexOf(ext) === -1) {
        this.$message.warning(this.$t("lang.model_file_type_invalid"));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.$message.warning(this.$t("lang.file_size_invalid"));
        return;
      }
      this.pendingFile = file;
      if (!this.editForm.modelName) {
        this.editForm.modelName = String(file.name || "").replace(
          /\.(tar\.gz|tgz|zip|tar|7z|gz)$/i,
          ""
        );
      }
    },
    submit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return;
        if (!this.pendingFile) {
          this.$message.warning(this.$t("lang.please_upload_model"));
          return;
        }
        this.saving = true;
        const formData = new FormData();
        formData.append("file", this.pendingFile);
        formData.append("modelName", (this.editForm.modelName || "").trim());
        formData.append("versionNo", this.editForm.versionNo || "V0.1");
        formData.append("status", "1");
        this.$emit("save", { formData });
      });
    }
  }
};
</script>

<style lang="less">
.upload-model-dialog {
  border-radius: 12px;
  overflow: hidden;
  .el-dialog__header {
    height: auto;
    line-height: normal;
    overflow: visible;
    padding: 20px 24px 0;
    border-bottom: none;
  }
  .el-dialog__headerbtn {
    top: 18px;
    right: 20px;
  }
  .el-dialog__body {
    padding: 16px 24px 8px;
  }
  .el-dialog__footer {
    padding: 8px 24px 20px;
  }
  .upload-dropzone .el-upload {
    width: 100%;
  }
  .upload-dropzone .el-upload-dragger {
    width: 100%;
    height: auto;
    min-height: 168px;
    padding: 28px 16px 20px;
    background: #f5f9ff;
    border: 1px dashed #8eb8ff;
    border-radius: 8px;
  }
  .upload-dropzone .el-upload-dragger:hover {
    border-color: #409eff;
  }
  .upload-dropzone .el-icon-upload {
    margin: 0 0 8px;
    font-size: 48px;
    color: #409eff;
    line-height: 1;
  }
  .upload-dropzone .el-upload__text {
    margin-top: 4px;
    font-size: 14px;
    color: #303133;
    line-height: 22px;
  }
}
</style>
<style lang="less" scoped>
.upload-dialog-header {
  padding-right: 24px;
}
.dialog-kicker {
  font-size: 12px;
  color: #909399;
  letter-spacing: 0.6px;
  line-height: 18px;
}
.dialog-title {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
  line-height: 26px;
}
.dialog-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
  line-height: 20px;
}
.current-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #f5f9ff;
  border: 1px dashed #8eb8ff;
  border-radius: 8px;
}
.current-file-info {
  display: flex;
  align-items: center;
  min-width: 0;
  i {
    margin-right: 8px;
    color: #409eff;
  }
}
.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}
.file-size {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.upload-drop-hint,
.upload-type-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  line-height: 18px;
}
.upload-type-hint {
  color: #606266;
}
.upload-type-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 12px;
}
.upload-type-tag {
  margin: 0 4px 4px;
  padding: 2px 10px;
  border: 1px solid #b3d4ff;
  border-radius: 12px;
  color: #409eff;
  font-size: 12px;
  line-height: 20px;
  background: #fff;
}
.upload-model-form {
  margin-top: 16px;
  /deep/ .el-form-item {
    margin-bottom: 14px;
  }
  /deep/ .el-form-item__label {
    padding-bottom: 4px;
    line-height: 20px;
    color: #606266;
  }
}
.upload-advice {
  display: flex;
  align-items: flex-start;
  margin-top: 4px;
  padding: 10px 12px;
  background: #fff6eb;
  border-radius: 6px;
  color: #8a6d3b;
  font-size: 12px;
  line-height: 18px;
}
.upload-advice-dot {
  width: 8px;
  height: 8px;
  margin: 5px 8px 0 0;
  border-radius: 50%;
  background: #e6a23c;
  flex-shrink: 0;
}
.upload-advice-title {
  margin-bottom: 2px;
  font-weight: 600;
}
</style>
