<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="640px"
    custom-class="component-form-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="dialog-subtitle">{{ dialogTip }}</div>
    <div class="form-section">
      <div class="form-section-title">
        {{ isEdit ? $t("lang.latest_model") : $t("lang.model_file") }}
      </div>
      <div v-if="displayFile" class="current-file">
        <div class="current-file-info">
          <i class="el-icon-document"></i>
          <span class="file-name" :title="displayFile.name">{{
            displayFile.name
          }}</span>
          <span class="file-size">{{ displayFile.sizeText }}</span>
        </div>
        <el-button size="small" @click="triggerFileSelect">{{
          isEdit ? $t("lang.replace_model_file") : $t("lang.reselect_file")
        }}</el-button>
      </div>
      <el-upload
        v-else
        drag
        action=""
        :auto-upload="false"
        :show-file-list="false"
        :limit="1"
        accept=".rvt,.ifc,.fbx,.obj,.glb"
        :on-change="onFileChange"
        :on-exceed="onFileExceed"
        :disabled="saving"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">{{ $t("lang.upload_model_hint") }}</div>
        <div class="el-upload__tip" slot="tip">
          {{ $t("lang.upload_model_accept") }}
        </div>
      </el-upload>
      <input
        ref="fileInput"
        type="file"
        accept=".rvt,.ifc,.fbx,.obj,.glb"
        style="display: none"
        @change="onHiddenFileChange"
      />
    </div>
    <el-form
      ref="editForm"
      :model="editForm"
      :rules="rules"
      label-width="90px"
      label-position="left"
      size="small"
      class="component-edit-form"
    >
      <div class="form-section">
        <div class="form-section-title">{{ $t("lang.basic_info") }}</div>
        <el-form-item :label="$t('lang.component_name')" prop="componentName">
          <el-input
            v-model="editForm.componentName"
            :placeholder="$t('lang.component_name_example')"
            maxlength="100"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.remark')" prop="remark">
          <el-input
            type="textarea"
            v-model="editForm.remark"
            :placeholder="$t('lang.remark_placeholder')"
            :rows="4"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer">
      <el-button size="small" :disabled="saving" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        v-if="!isEdit"
        size="small"
        :loading="saving && saveType === 'draft'"
        :disabled="saving"
        @click="submit('draft')"
        >{{ $t("lang.save_draft") }}</el-button
      >
      <el-button
        type="primary"
        size="small"
        :loading="saving && saveType !== 'draft'"
        :disabled="saving"
        @click="submit(isEdit ? 'save' : 'confirm')"
        >{{ isEdit ? $t("cm.save") : $t("lang.confirm_add") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import api from "../api";

const ACCEPT_EXTS = ["rvt", "ifc", "fbx", "obj", "glb"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
const FILE_DIRECTORY = "modelFile";

function emptyForm() {
  return {
    id: "",
    componentName: "",
    remark: "",
    fileId: "",
    fileSize: null,
    originalName: "",
    fileSuffix: ""
  };
}

function getExt(name) {
  const matched = String(name || "")
    .trim()
    .match(/\.([^.]+)$/);
  return matched ? matched[1].toLowerCase() : "";
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
  name: "ComponentFormDialog",
  data() {
    return {
      dialogVisible: false,
      isEdit: false,
      saving: false,
      saveType: "",
      pendingFile: null,
      editForm: emptyForm()
    };
  },
  computed: {
    dialogTitle() {
      return this.isEdit
        ? this.$t("lang.edit_pipe_component")
        : this.$t("lang.add_pipe_component");
    },
    dialogTip() {
      return this.isEdit
        ? this.$t("lang.edit_component_tip")
        : this.$t("lang.add_component_tip");
    },
    displayFile() {
      if (this.pendingFile) {
        return {
          name: this.pendingFile.name,
          sizeText: formatFileSize(this.pendingFile.size)
        };
      }
      if (this.editForm.originalName || this.editForm.fileId) {
        return {
          name: this.editForm.originalName || this.$t("lang.model_file"),
          sizeText: formatFileSize(this.editForm.fileSize)
        };
      }
      return null;
    },
    rules() {
      return {
        componentName: [
          {
            required: true,
            whitespace: true,
            message:
              this.$t("cm.pleaseEnter") + this.$t("lang.component_name"),
            trigger: "blur"
          }
        ]
      };
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    open(row) {
      const source = row || {};
      this.isEdit = !!source.id;
      this.saveType = "";
      this.pendingFile = null;
      this.editForm = {
        id: source.id || "",
        componentName: source.componentName || "",
        remark: source.remark || "",
        fileId: source.fileId || "",
        fileSize: source.fileSize == null ? null : source.fileSize,
        originalName: source.originalName || "",
        fileSuffix: source.fileSuffix || ""
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.editForm && this.$refs.editForm.clearValidate();
      });
    },
    close() {
      this.dialogVisible = false;
    },
    onClose() {
      this.saving = false;
      this.saveType = "";
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
      const ext = getExt(file.name);
      if (ACCEPT_EXTS.indexOf(ext) === -1) {
        this.$message.warning(this.$t("lang.file_type_invalid"));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.$message.warning(this.$t("lang.file_size_invalid"));
        return;
      }
      this.pendingFile = file;
    },
    submit(type) {
      this.$refs.editForm.validate(valid => {
        if (!valid) return;
        if (type === "confirm" && !this.pendingFile && !this.editForm.fileId) {
          this.$message.warning(this.$t("lang.please_upload_model"));
          return;
        }
        this.saveType = type;
        this.saving = true;
        this.ensureFileUploaded()
          .then(fileData => {
            this.$emit("save", {
              id: this.editForm.id,
              componentName: (this.editForm.componentName || "").trim(),
              remark: (this.editForm.remark || "").trim(),
              fileId: fileData.fileId || "",
              fileSize: fileData.fileSize,
              originalName: fileData.originalName || "",
              fileSuffix: fileData.fileSuffix || "",
              oldFileId: this.editForm.fileId || "",
              draft: type === "draft"
            });
          })
          .catch(err => {
            this.saving = false;
            this.saveType = "";
            this.$message.error((err && err.msg) || this.$t("cm.fail"));
          });
      });
    },
    finishSave() {
      this.saving = false;
      this.saveType = "";
    },
    ensureFileUploaded() {
      if (!this.pendingFile) {
        return Promise.resolve({
          fileId: this.editForm.fileId,
          fileSize: this.editForm.fileSize,
          originalName: this.editForm.originalName,
          fileSuffix: this.editForm.fileSuffix
        });
      }
      const formData = new FormData();
      formData.append("file", this.pendingFile);
      formData.append("directory", FILE_DIRECTORY);
      if ((this.editForm.remark || "").trim()) {
        formData.append("remark", this.editForm.remark.trim());
      }
      return api.uploadSysFile(formData).then(res => {
        if (!this.isSuccessCode(res && res.code) || !res.data) {
          return Promise.reject({ msg: (res && res.msg) || this.$t("cm.fail") });
        }
        const data = res.data || {};
        return {
          fileId: data.id || "",
          fileSize: this.pendingFile.size,
          originalName: data.originalName || this.pendingFile.name,
          fileSuffix: data.fileSuffix || getExt(this.pendingFile.name)
        };
      });
    }
  }
};
</script>

<style lang="less" scoped>
.dialog-subtitle {
  margin: -4px 0 16px;
  color: #909399;
  font-size: 13px;
  line-height: 20px;
}
.form-section {
  margin-bottom: 8px;
}
.form-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 12px;
  padding-left: 8px;
  line-height: 16px;
  border-left: 3px solid #2f6bff;
}
.current-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
}
.current-file-info {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #303133;
}
.current-file-info .el-icon-document {
  margin-right: 8px;
  color: #2f6bff;
  font-size: 16px;
}
.file-name {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  margin-left: 12px;
  color: #909399;
}
.component-edit-form {
  /deep/ .el-form-item__label {
    text-align: left;
    padding-right: 8px;
  }
}
/deep/ .el-upload {
  width: 100%;
}
/deep/ .el-upload-dragger {
  width: 100%;
  height: 148px;
}
</style>
<style lang="less">
.component-form-dialog {
  border-radius: 8px;
  overflow: hidden;
  .el-dialog__header {
    height: 40px !important;
    line-height: 40px !important;
    padding: 0 16px !important;
    overflow: hidden;
    border-bottom: 1px solid #ebebeb;
  }
  .el-dialog__headerbtn {
    top: 0 !important;
    right: 12px;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
  }
  .el-dialog__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 40px;
    color: #1f2329;
  }
  .el-dialog__body {
    padding: 12px 20px 4px;
  }
  .el-dialog__footer {
    padding: 8px 16px 12px;
    border-top: 1px solid #f0f2f5;
  }
}
</style>
