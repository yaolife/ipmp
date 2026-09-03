<template>
  <div class="directory-detail" v-loading="loading">
    <div class="detail-topbar">
      <div class="detail-crumb">
        <span>{{ $t("lang.pipe_data_manage") }}</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span>{{ $t("lang.pipe_database") }}</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span class="crumb-current">{{ $t("lang.add_edit_component") }}</span>
      </div>
      <div class="detail-top-actions">
        <el-button size="small" @click="$emit('back')">{{
          $t("cm.cancel")
        }}</el-button>
      </div>
    </div>

    <div class="detail-head-card">
      <div class="detail-head-left">
        <h2>{{ $t("lang.component_detail_title") }}</h2>
        <p>{{ $t("lang.component_detail_tip") }}</p>
      </div>
      <div class="type-select">
        <label>{{ $t("lang.component_type") }}</label>
        <el-select :value="'pipe'" disabled size="small">
          <el-option
            :label="$t('lang.component_type_pipe')"
            value="pipe"
          ></el-option>
        </el-select>
      </div>
    </div>

    <div class="detail-body-card">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane :label="$t('lang.screen_tab_basic')" name="basic">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.basic_identity") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.component_no") }}</label>
                  <el-input :value="displayVal(detail.specCode || detail.name)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.component_name") }}</label>
                  <el-input
                    :value="displayVal(detail.pipelineName || detail.name)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.kks_code") }}</label>
                  <el-input :value="displayVal(detail.kksCode)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.belong_unit") }}</label>
                  <el-input :value="displayVal(detail.unitName)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.system_no") }}</label>
                  <el-input :value="displayVal(detail.systemNo)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.safety_area") }}</label>
                  <el-input :value="displayVal(detail.safetyArea)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.room_no") }}</label>
                  <el-input :value="displayVal(detail.roomNo)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.island_type") }}</label>
                  <el-input :value="displayVal(detail.islandType)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_owner") }}</label>
                  <el-input
                    :value="displayVal(detail.responsiblePerson)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.location_belong") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipeline_on_line") }}</label>
                  <el-input :value="displayVal(detail.pipelineNo)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.flow_coord") }}</label>
                  <el-input
                    :value="displayVal(detail.flowCoord)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.flow_drawing_no") }}</label>
                  <el-input
                    :value="displayVal(detail.flowDrawingNo)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.iso_drawing_no") }}</label>
                  <el-input :value="displayVal(detail.isoCode)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.install_drawing_no") }}</label>
                  <el-input
                    :value="displayVal(detail.installDrawingNo)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.install_inner_code") }}</label>
                  <el-input
                    :value="displayVal(detail.installInnerCode)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.hierarchy_locate") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.parent_system_no") }}</label>
                  <el-input
                    :value="displayVal(detail.parentSystemNo)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.system_no") }}</label>
                  <el-input
                    :value="displayVal(detail.systemCode)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.system_depth") }}</label>
                  <el-input :value="displayVal(detail.levelNo)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.system_name_label") }}</label>
                  <el-input
                    :value="displayVal(detail.systemName)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.parent_location_no") }}</label>
                  <el-input
                    :value="displayVal(detail.parentLocationNo)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.location_no") }}</label>
                  <el-input
                    :value="displayVal(detail.locationNo)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.location_depth") }}</label>
                  <el-input
                    :value="displayVal(detail.locationDepth)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.location_name") }}</label>
                  <el-input
                    :value="displayVal(detail.locationName)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.device_no") }}</label>
                  <el-input :value="displayVal(detail.deviceNo)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.orientation") }}</label>
                  <el-input
                    :value="displayVal(detail.orientation)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.plant_unit") }}</label>
                  <el-input :value="displayVal(detail.plantUnit)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.process_name") }}</label>
                  <el-input :value="displayVal(detail.processName)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.drawing_no") }}</label>
                  <el-input :value="displayVal(detail.drawingNo)" disabled></el-input>
                </div>
              </el-col>
            </el-row>

            <div class="private-wrap">
              <div class="private-title">{{ $t("lang.private_attrs") }}</div>
              <el-table
                :data="privateAttrs"
                border
                size="small"
                :empty-text="$t('cm.nodata')"
              >
                <el-table-column
                  :label="$t('lang.attr_name')"
                  prop="name"
                  min-width="160"
                ></el-table-column>
                <el-table-column
                  :label="$t('lang.attr_value')"
                  prop="value"
                  min-width="160"
                ></el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.tab_tech_params')" name="technical">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.run_condition") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.work_pressure") }}</label>
                  <el-input
                    :value="displayVal(detail.operatingPressure)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.work_temperature") }}</label>
                  <el-input
                    :value="displayVal(detail.operatingTemperature)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.design_pressure_mpa") }}</label>
                  <el-input
                    :value="displayVal(detail.designPressure)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.design_temperature_c") }}</label>
                  <el-input
                    :value="displayVal(detail.designTemperature)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_nominal_inch") }}</label>
                  <el-input
                    :value="displayVal(detail.nominalDiameter)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_outer_diameter_mm") }}</label>
                  <el-input
                    :value="displayVal(detail.outerDiameter)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_wall_thickness_mm") }}</label>
                  <el-input
                    :value="displayVal(detail.wallThickness)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_material") }}</label>
                  <el-input :value="displayVal(detail.material)" disabled></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.pipe_center_elevation") }}</label>
                  <el-input
                    :value="displayVal(detail.centerElevation)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.fluid_medium") }}</label>
                  <el-input
                    :value="displayVal(detail.workingMedium)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.flow_velocity") }}</label>
                  <el-input
                    :value="displayVal(detail.flowVelocity)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.thermal_displacement") }}</label>
                  <el-input
                    :value="displayVal(detail.thermalDisplacement)"
                    disabled
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.tab_related_segment')" name="related">
          <div class="empty-tab">{{ $t("cm.nodata") }}</div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.maintenance_records')" name="maintenance">
          <div class="empty-tab">{{ $t("cm.nodata") }}</div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "DirectoryDetail",
  props: {
    directoryId: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      activeTab: "basic",
      detail: {},
      privateAttrs: []
    };
  },
  watch: {
    directoryId: {
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
      if (val === null || val === undefined || val === "") return "";
      if (typeof val === "number") {
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
      }
      if (/^-?\d+\.\d+$/.test(String(val))) {
        return String(Number(val));
      }
      return val;
    },
    loadDetail() {
      if (!this.directoryId) return;
      this.loading = true;
      this.activeTab = "basic";
      api
        .getResourceDirectoryDetail(this.directoryId)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
            this.privateAttrs = Array.isArray(this.detail.privateAttrs)
              ? this.detail.privateAttrs
              : [];
          } else {
            this.detail = {};
            this.privateAttrs = [];
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.detail = {};
          this.privateAttrs = [];
        });
    }
  }
};
</script>

<style lang="less" scoped>
.directory-detail {
  height: 100%;
  overflow: auto;
  background: #f4f6f9;
  padding: 4px 4px 8px;
  box-sizing: border-box;
}
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.detail-crumb {
  font-size: 13px;
  color: #909399;
  .crumb-sep {
    margin: 0 6px;
    font-size: 12px;
  }
  .crumb-current {
    color: #1f2329;
    font-weight: 500;
  }
}
.detail-head-card,
.detail-body-card {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  margin-bottom: 12px;
}
.detail-head-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  gap: 16px;
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2329;
    line-height: 28px;
  }
  p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #909399;
  }
}
.type-select {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  label {
    font-size: 13px;
    color: #1f2329;
    white-space: nowrap;
  }
  /deep/ .el-select {
    flex: 1;
  }
}
.detail-body-card {
  padding: 0 20px 20px;
}
.detail-tabs {
  /deep/ .el-tabs__header {
    margin-bottom: 16px;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e6e8eb;
  }
  /deep/ .el-tabs__item {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: #606266;
  }
  /deep/ .el-tabs__item.is-active {
    color: #1a6fc4;
    font-weight: 600;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #1a6fc4;
    height: 2px;
  }
}
.section-block {
  margin-bottom: 8px;
  padding-top: 4px;
  & + .section-block {
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #e6e8eb;
  }
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 16px;
  padding-left: 10px;
  line-height: 16px;
  border-left: 4px solid #1a6fc4;
}
.form-grid {
  .el-col {
    margin-bottom: 16px;
  }
}
.field {
  label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
    line-height: 18px;
  }
  /deep/ .el-input.is-disabled .el-input__inner {
    color: #1f2329;
    background: #fff;
  }
}
.private-wrap {
  margin-top: 8px;
}
.private-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
.empty-tab {
  padding: 72px 0;
  text-align: center;
  color: #909399;
}
</style>
