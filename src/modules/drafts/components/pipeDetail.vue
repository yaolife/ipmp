<template>
  <div class="pipe-detail" v-loading="loading">
    <div class="pipe-detail-back">
      <el-button
        size="small"
        icon="el-icon-arrow-left"
        @click="$emit('back')"
        >{{ $t("cm.return") }}</el-button
      >
    </div>
    <div class="pipe-detail-header">
      <div class="pipe-detail-crumb">
        <span>{{ $t("lang.asset_data") }}</span>
        <span class="crumb-sep">/</span>
        <span>{{ $t("lang.asset_object") }}</span>
      </div>
      <div class="pipe-detail-title-row">
        <div class="pipe-detail-title">
          <h2>{{ displayVal(detail.pipelineName || detail.pipelineNo) }}</h2>
        </div>
        <div class="pipe-detail-actions">
          <el-button
            v-if="activeTab === 'basic'"
            type="primary"
            size="small"
            @click="openEdit"
            >{{ $t("lang.edit_info") }}</el-button
          >
          <el-button size="small" @click="exportCurrent">{{
            $t("cm.export")
          }}</el-button>
          <el-button size="small" @click="locatePipeline">{{
            $t("lang.locate")
          }}</el-button>
        </div>
      </div>
    </div>
    <el-tabs v-model="activeTab" class="pipe-detail-tabs">
      <el-tab-pane :label="$t('lang.tab_basic')" name="basic">
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-icon files">
              <i class="el-icon-folder"></i>
            </div>
            <div class="stat-text">
              <div class="stat-label">{{ $t("lang.related_files") }}</div>
              <div class="stat-value">{{ stats.files }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon maintain">
              <i class="el-icon-tickets"></i>
            </div>
            <div class="stat-text">
              <div class="stat-label">{{ $t("lang.maintenance_records") }}</div>
              <div class="stat-value">{{ stats.maintenance }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon monitor">
              <i class="el-icon-data-line"></i>
            </div>
            <div class="stat-text">
              <div class="stat-label">{{ $t("lang.monitor_points") }}</div>
              <div class="stat-value">{{ stats.points }}</div>
            </div>
          </div>
        </div>
        <div class="panel-card">
          <div class="section-title">{{ $t("lang.main_model") }}</div>
          <div class="model-row">
            <div class="model-thumb">
              <i class="el-icon-picture-outline"></i>
            </div>
            <div class="model-right">
              <div class="model-meta">
                <div class="model-meta-col">
                  <div class="info-item">
                    <label>{{ $t("lang.model_name") }}</label>
                    <span>{{ displayVal(detail.pipelineNo) }}</span>
                  </div>
                  <div class="info-item">
                    <label>{{ $t("lang.model_code") }}</label>
                    <span>{{ displayVal(detail.modelCode) }}</span>
                  </div>
                  <div class="info-item">
                    <label>{{ $t("lang.file_format") }}</label>
                    <span>{{ displayVal(detail.fileFormat) }}</span>
                  </div>
                </div>
                <div class="model-meta-col">
                  <div class="info-item">
                    <label>{{ $t("lang.current_version") }}</label>
                    <span>{{ displayVal(detail.version) }}</span>
                  </div>
                  <div class="info-item">
                    <label>{{ $t("lang.update_time") }}</label>
                    <span>{{ displayVal(detail.modifyDate) }}</span>
                  </div>
                </div>
              </div>
              <el-button type="primary" size="small" @click="viewModel">{{
                $t("lang.view_model")
              }}</el-button>
            </div>
          </div>
        </div>
        <div class="panel-card">
          <div class="info-columns">
            <div class="info-col">
              <div class="section-title">{{ $t("lang.pipe_basic_info") }}</div>
              <div class="info-item">
                <label>{{ $t("lang.pipeline_no") }}</label>
                <span>{{ displayVal(detail.pipelineNo) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.pipe_name") }}</label>
                <span>{{ displayVal(detail.pipelineName) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.pipeline_start") }}</label>
                <span>{{ displayVal(detail.startPoint) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.pipeline_end") }}</label>
                <span>{{ displayVal(detail.endPoint) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.working_medium") }}</label>
                <span class="medium-text">{{
                  displayVal(detail.workingMedium)
                }}</span>
              </div>
            </div>
            <div class="info-col">
              <div class="section-title">{{ $t("lang.spec_material") }}</div>
              <div class="info-item">
                <label>{{ $t("lang.nominal_diameter") }}</label>
                <span>{{ displayVal(detail.nominalDiameter) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.outer_diameter") }}</label>
                <span>{{ displayVal(detail.outerDiameter) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.wall_thickness") }}</label>
                <span>{{ displayVal(detail.wallThickness) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.material") }}</label>
                <span>{{ displayVal(detail.material) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.spec_code") }}</label>
                <span>{{ displayVal(detail.specCode) }}</span>
              </div>
            </div>
            <div class="info-col">
              <div class="section-title">{{ $t("lang.design_runtime") }}</div>
              <div class="info-item">
                <label>{{ $t("lang.design_pressure") }}</label>
                <span>{{ displayVal(detail.designPressure) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.design_temperature") }}</label>
                <span>{{ displayVal(detail.designTemperature) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.operating_pressure") }}</label>
                <span>{{ displayVal(detail.operatingPressure) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.operating_temperature") }}</label>
                <span>{{ displayVal(detail.operatingTemperature) }}</span>
              </div>
              <div class="info-item">
                <label>{{ $t("lang.iso_code") }}</label>
                <span>{{ displayVal(detail.isoCode) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('lang.tab_maintenance')" name="maintenance">
        <div class="panel-card empty-tab">{{ $t("cm.nodata") }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('lang.tab_monitor')" name="monitor">
        <div class="panel-card empty-tab">{{ $t("cm.nodata") }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('lang.tab_safety')" name="safety">
        <div class="panel-card empty-tab">{{ $t("cm.nodata") }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('lang.tab_predict')" name="predict">
        <div class="panel-card empty-tab">{{ $t("cm.nodata") }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('lang.tab_files')" name="files">
        <div class="panel-card empty-tab">{{ $t("cm.nodata") }}</div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      :title="$t('lang.edit_device_params')"
      :visible.sync="editVisible"
      width="760px"
      custom-class="pipe-edit-dialog"
      append-to-body
      @close="editVisible = false"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="148px"
        label-position="left"
        size="small"
        class="pipe-edit-form"
      >
        <div class="edit-section">
          <div class="edit-section-title">{{ $t("lang.pipe_basic_info") }}</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('lang.pipeline_no')">
                <el-input
                  v-model="editForm.pipelineNo"
                  :placeholder="$t('cm.pleaseEnter')"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="$t('lang.pipe_name')">
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
          </el-row>
        </div>
        <div class="edit-section">
          <div class="edit-section-title">{{ $t("lang.spec_material") }}</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item :label="$t('lang.form_nominal_diameter')">
                <el-input
                  v-model="editForm.nominalDiameter"
                  class="has-unit-mm"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.outerDiameter"
                  class="has-unit-mm"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.wallThickness"
                  class="has-unit-mm"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.designPressure"
                  class="has-unit-mpa"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.designTemperature"
                  class="has-unit-c"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.operatingPressure"
                  class="has-unit-mpa"
                  :placeholder="$t('cm.pleaseEnter')"
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
                  v-model="editForm.operatingTemperature"
                  class="has-unit-c"
                  :placeholder="$t('cm.pleaseEnter')"
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
        <el-button size="small" @click="editVisible = false">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="saving"
          @click="saveEdit"
          >{{ $t("cm.save") }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "PipeDetail",
  props: {
    pipelineId: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      activeTab: "basic",
      detail: {},
      editVisible: false,
      editForm: {
        pipelineNo: "",
        pipelineName: "",
        startPoint: "",
        endPoint: "",
        workingMedium: "",
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
      },
      stats: {
        files: 0,
        maintenance: 0,
        points: 0
      }
    };
  },
  watch: {
    pipelineId: {
      immediate: true,
      handler(val) {
        if (val) this.loadDetail();
      }
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    displayVal(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined || val === "") return "/";
      if (typeof val === "number") {
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
      }
      if (/^-?\d+\.\d+$/.test(String(val))) {
        return String(Number(val));
      }
      return val;
    },
    loadDetail() {
      if (!this.pipelineId) return;
      this.loading = true;
      api
        .getPipelineDetail(this.pipelineId)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
          } else {
            this.detail = {};
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.detail = {};
        });
    },
    exportCurrent() {
      if (!this.detail.id) return;
      api
        .exportPipelines({ ids: [this.detail.id] }, "管道详情.xlsx")
        .then(() => {
          this.$message.success(this.$t("cm.export") + this.$t("cm.success"));
        })
        .catch(err => {
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    locatePipeline() {
      this.$message.info(this.$t("lang.locate"));
    },
    viewModel() {
      this.$message.info(this.$t("lang.view_model"));
    },
    openEdit() {
      this.editForm = {
        pipelineNo: this.detail.pipelineNo || "",
        pipelineName: this.detail.pipelineName || "",
        startPoint: this.detail.startPoint || "",
        endPoint: this.detail.endPoint || "",
        workingMedium: this.detail.workingMedium || "",
        nominalDiameter: this.emptyToStr(this.detail.nominalDiameter),
        outerDiameter: this.emptyToStr(this.detail.outerDiameter),
        wallThickness: this.emptyToStr(this.detail.wallThickness),
        material: this.detail.material || "",
        specCode: this.detail.specCode || "",
        designPressure: this.emptyToStr(this.detail.designPressure),
        designTemperature: this.emptyToStr(this.detail.designTemperature),
        operatingPressure: this.emptyToStr(this.detail.operatingPressure),
        operatingTemperature: this.emptyToStr(this.detail.operatingTemperature),
        isoCode: this.detail.isoCode || ""
      };
      this.editVisible = true;
    },
    emptyToStr(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined) return "";
      return val;
    },
    toNumber(value) {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    },
    buildUpdatePayload() {
      return {
        id: this.detail.id,
        directoryId: this.detail.directoryId,
        pipelineNo: this.editForm.pipelineNo,
        pipelineName: this.editForm.pipelineName,
        startPoint: this.editForm.startPoint,
        endPoint: this.editForm.endPoint,
        workingMedium: this.editForm.workingMedium,
        nominalDiameter: this.toNumber(this.editForm.nominalDiameter),
        outerDiameter: this.toNumber(this.editForm.outerDiameter),
        wallThickness: this.toNumber(this.editForm.wallThickness),
        material: this.editForm.material,
        specCode: this.editForm.specCode,
        designPressure: this.toNumber(this.editForm.designPressure),
        designTemperature: this.toNumber(this.editForm.designTemperature),
        operatingPressure: this.toNumber(this.editForm.operatingPressure),
        operatingTemperature: this.toNumber(this.editForm.operatingTemperature),
        isoCode: this.editForm.isoCode,
        responsiblePerson: this.detail.responsiblePerson
      };
    },
    saveEdit() {
      if (!this.detail.id) return;
      this.saving = true;
      api
        .updatePipeline(this.buildUpdatePayload())
        .then(res => {
          this.saving = false;
          if (this.isSuccessCode(res && res.code)) {
            this.editVisible = false;
            this.$message.success(this.$t("cm.success"));
            this.loadDetail();
            this.$emit("updated");
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.saving = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.pipe-detail {
  height: 100%;
  overflow: auto;
  background: #f4f6f9;
  padding: 4px 4px 8px;
  box-sizing: border-box;
}
.pipe-detail-back {
  margin-bottom: 8px;
}
.pipe-detail-crumb {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  .crumb-sep {
    margin: 0 6px;
  }
}
.pipe-detail-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pipe-detail-title {
  display: flex;
  align-items: center;
  h2 {
    margin: 0 10px 0 0;
    font-size: 22px;
    font-weight: 600;
    color: #1f2329;
    line-height: 32px;
  }
}
.pipe-detail-tabs {
  /deep/ .el-tabs__header {
    margin-bottom: 16px;
    background: transparent;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e6e8eb;
  }
  /deep/ .el-tabs__item {
    height: 40px;
    line-height: 40px;
    color: #606266;
    font-size: 14px;
  }
  /deep/ .el-tabs__item.is-active {
    color: #2f6bff;
    font-weight: 600;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #2f6bff;
    height: 2px;
  }
}
.stat-row {
  display: flex;
  gap: 16px;
  margin: 0 0 16px;
}
.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.06);
}
.stat-icon {
  width: 44px;
  height: 44px;
  margin-right: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  &.files {
    background: #e8f1ff;
    color: #2f6bff;
  }
  &.maintain {
    background: #e8f8ef;
    color: #22c55e;
  }
  &.monitor {
    background: #f1ebff;
    color: #8b5cf6;
  }
}
.stat-text {
  min-width: 0;
}
.stat-label {
  font-size: 13px;
  color: #8a8f99;
  line-height: 18px;
  margin-bottom: 2px;
}
.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
  line-height: 28px;
}
.panel-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.06);
  padding: 18px 20px 16px;
  margin-bottom: 16px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 16px;
  padding-left: 10px;
  line-height: 16px;
  border-left: 4px solid #2f6bff;
}
.model-row {
  display: flex;
  align-items: flex-start;
}
.model-thumb {
  width: 148px;
  height: 148px;
  margin-right: 28px;
  border-radius: 6px;
  background: #111;
  color: #8fb3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  flex-shrink: 0;
}
.model-right {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}
.model-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 48px;
  margin-bottom: 16px;
}
.model-meta-col .info-item {
  margin-bottom: 14px;
}
.info-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 0;
}
.info-col {
  min-width: 0;
  padding: 0 24px;
  .info-item {
    margin-bottom: 14px;
  }
  &:first-child {
    padding-left: 0;
  }
  &:last-child {
    padding-right: 0;
  }
  & + .info-col {
    border-left: 1px solid #f0f2f5;
  }
}
.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  line-height: 22px;
  label {
    width: 130px;
    color: #8a8f99;
    flex-shrink: 0;
  }
  span {
    color: #1f2329;
    word-break: break-all;
  }
}
.medium-text {
  color: #22c55e !important;
}
.empty-tab {
  padding: 72px 0;
  text-align: center;
  color: #909399;
}
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
    margin-bottom: 4px;
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
    margin-bottom: 4px;
  }
  .pipe-edit-form .el-form-item__label {
    text-align: left !important;
    padding: 0 8px 0 11px;
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
