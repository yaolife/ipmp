<template>
  <el-dialog
    :title="$t('lang.edit_model_info')"
    :visible.sync="dialogVisible"
    width="720px"
    custom-class="edit-model-info-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="dialog-subtitle">{{ $t("lang.edit_model_info_tip") }}</div>
    <el-form
      ref="editForm"
      :model="editForm"
      :rules="rules"
      label-width="100px"
      label-position="left"
      size="small"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item :label="$t('lang.model_name')" prop="modelName">
            <el-input
              v-model="editForm.modelName"
              maxlength="100"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('lang.model_code')" prop="modelCode">
            <el-input
              v-model="editForm.modelCode"
              maxlength="64"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('lang.model_type')" prop="modelType">
            <el-select
              v-model="editForm.modelType"
              :placeholder="$t('cm.pleaseSelect')"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="item in modelTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('lang.version_no')" prop="versionNo">
            <el-input v-model="editForm.versionNo" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('lang.coordinate_system')" prop="coordinateSystem">
            <el-select
              v-model="editForm.coordinateSystem"
              :placeholder="$t('cm.pleaseSelect')"
              style="width: 100%"
              filterable
              allow-create
            >
              <el-option
                v-for="item in coordinateOptions"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('lang.enable_status')" prop="status">
            <el-select v-model="editForm.status" style="width: 100%">
              <el-option :label="$t('lang.status_enabled')" value="1"></el-option>
              <el-option :label="$t('lang.status_disabled')" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item :label="$t('lang.remark')" prop="remark">
            <el-input
              type="textarea"
              v-model="editForm.remark"
              :placeholder="$t('lang.remark_placeholder')"
              :rows="3"
              maxlength="500"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer">
      <el-button size="small" :disabled="saving" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        type="primary"
        size="small"
        :loading="saving"
        @click="submit"
        >{{ $t("lang.confirm_modify") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
const COORDINATE_OPTIONS = ["厂区局部坐标系", "大地坐标系", "站区坐标系"];
const MODEL_TYPE_OPTIONS = ["管道模型", "支吊架模型", "元件模型"];

function emptyForm() {
  return {
    id: "",
    modelName: "",
    modelCode: "",
    modelType: "",
    coordinateSystem: "",
    versionNo: "",
    status: "1",
    fileIds: [],
    remark: ""
  };
}

function splitFileIds(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

export default {
  name: "EditModelInfoDialog",
  data() {
    return {
      dialogVisible: false,
      saving: false,
      editForm: emptyForm(),
      coordinateOptions: COORDINATE_OPTIONS,
      modelTypeOptions: MODEL_TYPE_OPTIONS
    };
  },
  computed: {
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
    open(detail) {
      const source = detail || {};
      this.saving = false;
      this.editForm = {
        id: source.id || "",
        modelName: source.modelName || "",
        modelCode: source.modelCode || "",
        modelType: source.modelType || "",
        coordinateSystem: source.coordinateSystem || "",
        versionNo: source.versionNo || "",
        status: source.status === 0 || source.status === "0" ? "0" : "1",
        fileIds: splitFileIds(source.fileIds),
        remark: source.remark || ""
      };
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
      this.editForm = emptyForm();
    },
    submit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return;
        this.saving = true;
        this.$emit("save", {
          id: this.editForm.id,
          modelName: (this.editForm.modelName || "").trim(),
          modelCode: (this.editForm.modelCode || "").trim(),
          modelType: (this.editForm.modelType || "").trim(),
          coordinateSystem: this.editForm.coordinateSystem || "",
          versionNo: (this.editForm.versionNo || "").trim(),
          status: this.editForm.status,
          fileIds: this.editForm.fileIds.slice(),
          remark: this.editForm.remark || ""
        });
      });
    }
  }
};
</script>

<style lang="less">
.edit-model-info-dialog {
  border-radius: 8px;
  .el-dialog__body {
    padding: 8px 24px 4px;
  }
}
</style>
<style lang="less" scoped>
.dialog-subtitle {
  margin-bottom: 16px;
  font-size: 13px;
  color: #909399;
}
</style>
