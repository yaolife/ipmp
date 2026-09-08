<template>
  <el-dialog
    :title="$t('lang.replace_model_file_title')"
    :visible.sync="dialogVisible"
    width="560px"
    custom-class="replace-model-file-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="dialog-subtitle">{{ $t("lang.replace_model_file_tip") }}</div>
    <el-form label-width="90px" size="small">
      <el-form-item :label="$t('lang.model_no')">
        <el-input :value="form.modelNo" disabled></el-input>
      </el-form-item>
    </el-form>
    <div class="file-section-title">{{ $t("lang.current_model_file") }}</div>
    <div class="file-card">
      <div class="file-card-main">
        <i class="el-icon-document file-icon"></i>
        <div class="file-card-info">
          <div class="file-card-name" :title="form.originalName">
            {{ form.originalName || $t("lang.model_file") }}
          </div>
          <div class="file-card-meta">
            {{ fileMetaText }}
          </div>
        </div>
        <el-tag size="mini" type="success" effect="plain">{{
          $t("lang.current_model_tag")
        }}</el-tag>
      </div>
      <div class="file-card-actions">
        <el-button
          size="small"
          type="success"
          plain
          :disabled="!previewUrl"
          @click="preview"
          >{{ $t("lang.enable_preview") }}</el-button
        >
        <el-button size="small" :disabled="uploading || saving" @click="triggerFileSelect">{{
          $t("lang.replace_file")
        }}</el-button>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      :accept="acceptAttr"
      style="display: none"
      @change="onFileChange"
    />
    <div class="replace-tip">
      ※{{ $t("lang.replace_file_tip") }}
    </div>
    <span slot="footer">
      <el-button size="small" :disabled="saving" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        type="primary"
        size="small"
        :loading="saving"
        :disabled="!replaced || uploading || saving"
        @click="submit"
        >{{ $t("lang.next_step") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import api from "../api";

const ACCEPT_EXTS = ["glb", "gltf", "obj", "fbx", "rvt", "ifc"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
const FILE_DIRECTORY = "modelFile";

function getExt(name) {
  const matched = String(name || "")
    .trim()
    .match(/\.([^.]+)$/);
  return matched ? matched[1].toLowerCase() : "";
}

function formatStoredFileSize(kb) {
  const n = Number(kb);
  if (kb === null || kb === undefined || kb === "" || isNaN(n) || n < 0) {
    return "-";
  }
  if (n === 0) return "0KB";
  if (n >= 1024) {
    const mb = n / 1024;
    return (mb >= 100 ? mb.toFixed(0) : mb.toFixed(1).replace(/\.0$/, "")) + "MB";
  }
  return n + "KB";
}

function emptyForm() {
  return {
    id: "",
    modelNo: "",
    originalName: "",
    fileSuffix: "",
    fileSize: null,
    versionNo: "",
    fileIds: [],
    resourceDirectoryId: "",
    remark: "",
    absoluteFileUrl: "",
    fileUrl: ""
  };
}

export default {
  name: "ReplaceModelFileDialog",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      uploading: false,
      replaced: false,
      form: emptyForm()
    };
  },
  computed: {
    acceptAttr() {
      return ACCEPT_EXTS.map(item => "." + item).join(",");
    },
    previewUrl() {
      return this.form.absoluteFileUrl || this.form.fileUrl || "";
    },
    fileMetaText() {
      const suffix = this.form.fileSuffix
        ? "." + String(this.form.fileSuffix).replace(/^\./, "")
        : "-";
      const version = this.form.versionNo
        ? this.$t("lang.current_version") + " " + this.form.versionNo
        : "";
      const size = formatStoredFileSize(this.form.fileSize);
      return [suffix, version, this.$t("lang.model_size") + " " + size]
        .filter(Boolean)
        .join(" | ");
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    open(detail) {
      const source = detail || {};
      this.saving = false;
      this.uploading = false;
      this.replaced = false;
      this.form = Object.assign(emptyForm(), {
        id: source.id || "",
        modelNo: source.modelNo || source.modelCode || source.id || "",
        originalName: source.originalName || "",
        fileSuffix: source.fileSuffix || getExt(source.originalName),
        fileSize: source.fileSize,
        versionNo: source.versionNo || "",
        fileIds: Array.isArray(source.fileIds)
          ? source.fileIds.slice()
          : [],
        resourceDirectoryId: source.resourceDirectoryId || "",
        remark: source.remark || "",
        absoluteFileUrl: source.absoluteFileUrl || "",
        fileUrl: source.fileUrl || ""
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
      this.uploading = false;
      this.replaced = false;
      this.form = emptyForm();
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },
    preview() {
      if (!this.previewUrl) {
        this.$message.warning(this.$t("lang.no_file_to_preview"));
        return;
      }
      window.open(this.previewUrl, "_blank");
    },
    triggerFileSelect() {
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
      this.uploading = true;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", FILE_DIRECTORY);
      api
        .uploadSysFile(formData)
        .then(res => {
          this.uploading = false;
          if (!this.isSuccessCode(res && res.code) || !res.data) {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            return;
          }
          const data = res.data || {};
          this.form.fileIds = [data.id];
          this.form.originalName = data.originalName || file.name;
          this.form.fileSuffix = data.fileSuffix || ext;
          this.form.fileSize = Math.max(1, Math.round(file.size / 1024));
          this.form.absoluteFileUrl = data.absoluteFileUrl || "";
          this.form.fileUrl = data.fileUrl || "";
          this.replaced = true;
        })
        .catch(err => {
          this.uploading = false;
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    submit() {
      if (!this.replaced) {
        this.$message.warning(this.$t("lang.please_upload_model"));
        return;
      }
      if (this.uploading) {
        this.$message.warning(this.$t("lang.file_uploading"));
        return;
      }
      this.saving = true;
      this.$emit("save", {
        id: this.form.id,
        fileIds: this.form.fileIds.slice(),
        resourceDirectoryId: this.form.resourceDirectoryId,
        remark: this.form.remark || ""
      });
    }
  }
};
</script>

<style lang="less">
.replace-model-file-dialog {
  border-radius: 8px;
  .el-dialog__body {
    padding: 8px 24px 12px;
  }
}
</style>
<style lang="less" scoped>
.dialog-subtitle {
  margin-bottom: 16px;
  font-size: 13px;
  color: #909399;
  line-height: 20px;
}
.file-section-title {
  margin: 4px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.file-card {
  padding: 14px 16px;
  background: #f7f8fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.file-card-main {
  display: flex;
  align-items: center;
}
.file-icon {
  margin-right: 10px;
  font-size: 28px;
  color: #409eff;
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
.replace-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
  line-height: 18px;
}
</style>
