<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="760px"
    custom-class="pipe-edit-dialog"
    append-to-body
    @close="onClose"
  >
    <el-form
      ref="editForm"
      :model="editForm"
      :rules="rules"
      label-width="148px"
      label-position="left"
      size="small"
      class="pipe-edit-form"
    >
      <div class="edit-section">
        <div class="edit-section-title">{{ $t("lang.pipe_basic_info") }}</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('lang.pipeline_no')" prop="pipelineNo">
              <el-input
                v-model="editForm.pipelineNo"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.pipe_name')" prop="pipelineName">
              <el-input
                v-model="editForm.pipelineName"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.pipeline_start')">
              <el-input
                v-model="editForm.startPoint"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.pipeline_end')">
              <el-input
                v-model="editForm.endPoint"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.working_medium')">
              <el-input
                v-model="editForm.workingMedium"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.pipe_owner')">
              <el-input
                v-model="editForm.responsiblePerson"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="edit-section">
        <div class="edit-section-title">{{ $t("lang.spec_material") }}</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_nominal_diameter')">
              <el-input
                :value="editForm.nominalDiameter"
                class="has-unit-mm"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('nominalDiameter', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_mm")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_outer_diameter')">
              <el-input
                :value="editForm.outerDiameter"
                class="has-unit-mm"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('outerDiameter', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_mm")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_wall_thickness')">
              <el-input
                :value="editForm.wallThickness"
                class="has-unit-mm"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('wallThickness', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_mm")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.material')">
              <el-input
                v-model="editForm.material"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.spec_code')">
              <el-input
                v-model="editForm.specCode"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="edit-section">
        <div class="edit-section-title">{{ $t("lang.design_runtime") }}</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_design_pressure')">
              <el-input
                :value="editForm.designPressure"
                class="has-unit-mpa"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('designPressure', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_mpa")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_design_temperature')">
              <el-input
                :value="editForm.designTemperature"
                class="has-unit-c"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('designTemperature', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_celsius")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_operating_pressure')">
              <el-input
                :value="editForm.operatingPressure"
                class="has-unit-mpa"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('operatingPressure', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_mpa")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('lang.form_operating_temperature')">
              <el-input
                :value="editForm.operatingTemperature"
                class="has-unit-c"
                :placeholder="$t('cm.pleaseEnter')"
                @input="val => setNumberField('operatingTemperature', val)"
              >
                <span slot="suffix" class="input-unit">{{
                  $t("lang.unit_celsius")
                }}</span>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('lang.iso_code')">
              <el-input
                v-model="editForm.isoCode"
                :placeholder="$t('cm.pleaseEnter')"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <span slot="footer">
      <el-button size="small" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        type="primary"
        size="small"
        :loading="saving"
        @click="onSave"
        >{{ $t("cm.save") }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
function emptyForm() {
  return {
    pipelineNo: "",
    pipelineName: "",
    startPoint: "",
    endPoint: "",
    workingMedium: "",
    responsiblePerson: "",
    nominalDiameter: "",
    outerDiameter: "",
    wallThickness: "",
    material: "",
    specCode: "",
    designPressure: "",
    designTemperature: "",
    operatingPressure: "",
    operatingTemperature: "",
    isoCode: ""
  };
}

export default {
  name: "PipeFormDialog",
  props: {
    title: {
      type: String,
      default: ""
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      editForm: emptyForm()
    };
  },
  computed: {
    rules() {
      return {
        pipelineNo: [
          {
            required: true,
            whitespace: true,
            message: this.$t("cm.pleaseEnter") + this.$t("lang.pipeline_no"),
            trigger: "blur"
          }
        ],
        pipelineName: [
          {
            required: true,
            whitespace: true,
            message: this.$t("cm.pleaseEnter") + this.$t("lang.pipe_name"),
            trigger: "blur"
          }
        ]
      };
    }
  },
  methods: {
    emptyToStr(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined) return "";
      return val;
    },
    sanitizeNumber(val) {
      if (val === "" || val === null || val === undefined) return "";
      let str = String(val).replace(/[^\d.-]/g, "");
      const negative = str.charAt(0) === "-";
      str = str.replace(/-/g, "");
      const dotIndex = str.indexOf(".");
      if (dotIndex !== -1) {
        str =
          str.slice(0, dotIndex + 1) +
          str.slice(dotIndex + 1).replace(/\./g, "");
      }
      if (negative) str = "-" + str;
      return str;
    },
    setNumberField(key, val) {
      this.editForm[key] = this.sanitizeNumber(val);
    },
    toNumber(value) {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    },
    open(data) {
      const source = data || {};
      this.editForm = {
        pipelineNo: source.pipelineNo || "",
        pipelineName: source.pipelineName || "",
        startPoint: source.startPoint || "",
        endPoint: source.endPoint || "",
        workingMedium: source.workingMedium || "",
        responsiblePerson: source.responsiblePerson || "",
        nominalDiameter: this.emptyToStr(source.nominalDiameter),
        outerDiameter: this.emptyToStr(source.outerDiameter),
        wallThickness: this.emptyToStr(source.wallThickness),
        material: source.material || "",
        specCode: source.specCode || "",
        designPressure: this.emptyToStr(source.designPressure),
        designTemperature: this.emptyToStr(source.designTemperature),
        operatingPressure: this.emptyToStr(source.operatingPressure),
        operatingTemperature: this.emptyToStr(source.operatingTemperature),
        isoCode: source.isoCode || ""
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
      this.editForm = emptyForm();
    },
    getPayload() {
      return {
        pipelineNo: (this.editForm.pipelineNo || "").trim(),
        pipelineName: (this.editForm.pipelineName || "").trim(),
        startPoint: this.editForm.startPoint,
        endPoint: this.editForm.endPoint,
        workingMedium: this.editForm.workingMedium,
        responsiblePerson: (this.editForm.responsiblePerson || "").trim(),
        nominalDiameter: this.toNumber(this.editForm.nominalDiameter),
        outerDiameter: this.toNumber(this.editForm.outerDiameter),
        wallThickness: this.toNumber(this.editForm.wallThickness),
        material: this.editForm.material,
        specCode: this.editForm.specCode,
        designPressure: this.toNumber(this.editForm.designPressure),
        designTemperature: this.toNumber(this.editForm.designTemperature),
        operatingPressure: this.toNumber(this.editForm.operatingPressure),
        operatingTemperature: this.toNumber(this.editForm.operatingTemperature),
        isoCode: this.editForm.isoCode
      };
    },
    onSave() {
      this.$refs.editForm.validate(valid => {
        if (!valid) return;
        this.$emit("save", this.getPayload());
      });
    }
  }
};
</script>

<style lang="less" scoped>
.pipe-edit-form {
  .edit-section {
    margin-bottom: 2px;
  }
  .edit-section + .edit-section {
    position: relative;
    margin-top: 8px;
    padding-top: 10px;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 11px;
      right: 15px;
      height: 1px;
      background: #ebeef5;
    }
  }
  .edit-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2329;
    margin: 4px 0 6px;
    padding-left: 8px;
    line-height: 16px;
    border-left: 3px solid #2f6bff;
  }
  .el-form-item {
    margin-bottom: 18px;
  }
  .input-unit {
    color: #8a8f99;
    font-size: 12px;
    padding-right: 4px;
  }
}
</style>
<style lang="less">
.pipe-edit-dialog {
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
    padding: 10px 20px 2px;
    max-height: 70vh;
    overflow-y: auto;
  }
  .el-dialog__footer {
    padding: 8px 16px 10px;
    border-top: 1px solid #f0f2f5;
  }
  .pipe-edit-form .el-form-item {
    margin-bottom: 18px;
  }
  .pipe-edit-form .el-form-item__label {
    position: relative;
    text-align: left !important;
    padding: 0 8px 0 12px;
  }
  .pipe-edit-form .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
    position: absolute;
    left: 0;
    margin-right: 0;
  }
  .pipe-edit-form .edit-section + .edit-section {
    position: relative;
    margin-top: 8px;
    padding-top: 10px;
  }
  .pipe-edit-form .edit-section + .edit-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 11px;
    right: 15px;
    height: 1px;
    background: #ebeef5;
  }
  .has-unit-mm .el-input__inner {
    padding-right: 40px;
  }
  .has-unit-mpa .el-input__inner {
    padding-right: 58px;
  }
  .has-unit-c .el-input__inner {
    padding-right: 40px;
  }
}
</style>
