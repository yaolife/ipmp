<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="800px"
    custom-class="replace-model-file-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div slot="title" class="replace-dialog-header">
      <div class="replace-dialog-title">{{ $t("lang.replace_model_file_title") }}</div>
      <div class="replace-dialog-subtitle">{{ $t("lang.replace_model_file_tip") }}</div>
    </div>
    <el-form label-position="top" size="small" class="replace-form">
      <el-form-item :label="$t('lang.model_code')">
        <el-input :value="form.modelNo" disabled></el-input>
      </el-form-item>
      <el-form-item :label="$t('lang.model_transform_params')">
        <el-input
          v-model="form.transform"
          :placeholder="$t('lang.model_transform_placeholder')"
        ></el-input>
      </el-form-item>
    </el-form>
    <template v-if="hasCurrentFile">
      <div class="file-section-title">{{ $t("lang.current_model_file") }}</div>
      <div class="file-card">
        <div class="file-card-main">
          <div class="file-type-badge">{{ displaySuffix }}</div>
          <div class="file-card-info">
            <div class="file-card-name" :title="displayName">
              {{ displayName }}
            </div>
            <div class="file-card-meta">{{ fileMetaText }}</div>
          </div>
          <el-tag size="mini" type="success" effect="plain">{{
            $t("lang.current_in_use")
          }}</el-tag>
        </div>
        <div class="file-card-actions">
          <el-button
            size="small"
            :disabled="saving"
            @click="triggerFileSelect"
            >{{ $t("lang.replace_file") }}</el-button
          >
        </div>
      </div>
    </template>
    <div v-else class="file-upload-empty" @click="triggerFileSelect">
      <i class="el-icon-upload"></i>
      <div>{{ $t("lang.select_replace_file") }}</div>
      <div v-if="pendingFile" class="pending-file-name" :title="pendingFile.name">
        {{ pendingFile.name }}
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      :accept="acceptAttr"
      style="display: none"
      @change="onFileChange"
    />
    <div class="replace-tip">{{ $t("lang.replace_file_tip") }}</div>
    <span slot="footer">
      <el-button size="small" :disabled="saving" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        type="primary"
        size="small"
        :loading="saving"
        :disabled="!pendingFile || saving"
        @click="submit"
        >{{ $t("lang.next_step") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
const ACCEPT_EXTS = ["glb", "gltf", "obj", "fbx", "rvt", "ifc", "udsmesh"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

function getExt(name) {
  const matched = String(name || "")
    .trim()
    .match(/\.([^.]+)$/);
  return matched ? matched[1].toLowerCase() : "";
}

function formatStoredFileSize(kb) {
  const n = Number(kb);
  if (kb === null || kb === undefined || kb === "" || isNaN(n) || n < 0) {
    return "";
  }
  if (n === 0) return "0KB";
  if (n >= 1024) {
    const mb = n / 1024;
    return (mb >= 100 ? mb.toFixed(0) : mb.toFixed(1).replace(/\.0$/, "")) + "MB";
  }
  return n + "KB";
}

function getFileList(source) {
  if (Array.isArray(source && source.file)) return source.file.filter(Boolean);
  if (Array.isArray(source && source.files)) return source.files.filter(Boolean);
  return [];
}

function emptyForm() {
  return {
    id: "",
    modelNo: "",
    originalName: "",
    fileSuffix: "",
    fileSize: null,
    absoluteFileUrl: "",
    fileUrl: "",
    transform: ""
  };
}

export default {
  name: "ReplaceModelFileDialog",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      hasCurrentFile: false,
      pendingFile: null,
      form: emptyForm()
    };
  },
  computed: {
    acceptAttr() {
      return ACCEPT_EXTS.map(item => "." + item).join(",");
    },
    displayName() {
      if (this.pendingFile) return this.pendingFile.name;
      return this.form.originalName || this.form.modelNo || this.$t("lang.model_file");
    },
    displaySuffix() {
      const ext = this.pendingFile
        ? getExt(this.pendingFile.name)
        : String(this.form.fileSuffix || "").replace(/^\./, "");
      return (ext || "-").toUpperCase();
    },
    fileMetaText() {
      const suffix = this.displaySuffix;
      let sizeText = this.$t("lang.file_size_unknown");
      if (this.pendingFile) {
        const kb = Math.max(1, Math.round(this.pendingFile.size / 1024));
        sizeText = this.$t("lang.model_size") + " " + formatStoredFileSize(kb);
      } else if (formatStoredFileSize(this.form.fileSize)) {
        sizeText = this.$t("lang.model_size") + " " + formatStoredFileSize(this.form.fileSize);
      }
      return [suffix, sizeText].filter(Boolean).join(" · ");
    }
  },
  methods: {
    open(detail) {
      const source = detail || {};
      const fileList = getFileList(source);
      const current = fileList[0] || {};
      this.saving = false;
      this.pendingFile = null;
      this.hasCurrentFile = fileList.length > 0;
      this.form = Object.assign(emptyForm(), {
        id: source.id || "",
        modelNo: source.modelNo || source.nodeName || source.modelCode || "",
        originalName: current.originalName || "",
        fileSuffix: current.fileSuffix || getExt(current.originalName),
        fileSize: current.fileSize,
        absoluteFileUrl: current.absoluteFileUrl || "",
        fileUrl: current.fileUrl || "",
        transform: source.transform || current.transform || ""
      });
      this.dialogVisible = true;
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
      this.hasCurrentFile = false;
      this.form = emptyForm();
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    triggerFileSelect() {
      if (this.saving) return;
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const ext = getExt(file.name);
      if (ACCEPT_EXTS.indexOf(ext) === -1) {
        this.$message.warning(this.$t("lang.item_file_type_invalid"));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.$message.warning(this.$t("lang.file_size_invalid"));
        return;
      }
      this.pendingFile = file;
    },
    submit() {
      if (!this.pendingFile) {
        this.$message.warning(this.$t("lang.please_upload_model"));
        return;
      }
      if (!this.form.id) {
        this.$message.warning(this.$t("lang.select_resource_node"));
        return;
      }
      this.saving = true;
      this.$emit("save", {
        nodeId: this.form.id,
        file: this.pendingFile,
        transform: this.form.transform
      });
    }
  }
};
</script>

<style lang="less">
.replace-model-file-dialog {
  border-radius: 12px;
  .el-dialog__header {
    padding: 20px 24px 0;
    border-bottom: none;
  }
  .el-dialog__headerbtn {
    top: 20px;
    right: 20px;
  }
  .el-dialog__body {
    padding: 12px 24px 8px;
  }
  .el-dialog__footer {
    padding: 8px 24px 20px;
  }
}
</style>
<style lang="less" scoped>
.replace-dialog-header {
  padding-right: 28px;
}
.replace-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
  line-height: 26px;
}
.replace-dialog-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
  line-height: 20px;
}
.replace-form {
  /deep/ .el-form-item {
    margin-bottom: 4px;
  }
  /deep/ .el-form-item__label {
    padding-bottom: 0;
    line-height: 18px;
    color: #606266;
  }
  /deep/ .el-input.is-disabled .el-input__inner {
    background: #f7f8fa;
    color: #303133;
  }
}
.file-section-title {
  display: flex;
  align-items: center;
  margin: 4px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.file-section-title::before {
  content: "";
  width: 3px;
  height: 14px;
  margin-right: 8px;
  background: #409eff;
  border-radius: 2px;
}
.file-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5ebf3;
  border-radius: 12px;
}
.file-card-main {
  display: flex;
  align-items: center;
}
.file-type-badge {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #ecf5ff;
  border-radius: 8px;
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  word-break: break-all;
  padding: 0 4px;
}
.file-card-info {
  flex: 1;
  min-width: 0;
}
.file-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-card-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.file-card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.file-upload-empty {
  padding: 28px 16px;
  text-align: center;
  color: #909399;
  background: #f5f9ff;
  border: 1px dashed #8eb8ff;
  border-radius: 12px;
  cursor: pointer;
  i {
    font-size: 36px;
    color: #409eff;
  }
}
.pending-file-name {
  margin-top: 8px;
  color: #303133;
  font-size: 13px;
}
.replace-tip {
  margin-top: 12px;
  padding: 10px 12px;
  background: #ecf5ff;
  border-radius: 8px;
  color: #409eff;
  font-size: 12px;
  line-height: 18px;
}
</style>
