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
        <span class="save-status">
          <i class="status-dot"></i>
          {{ $t("lang.pending_save") }}
        </span>
        <el-button size="small" @click="$emit('back')">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="saving"
          :disabled="saving"
          @click="onSaveClick"
          >{{ $t("cm.save") }}</el-button
        >
      </div>
    </div>

    <div class="detail-head-card">
      <div class="detail-head-left">
        <h2>{{ $t("lang.pipe_detail") }}</h2>
        <p>{{ $t("lang.pipe_detail_tip") }}</p>
      </div>
    </div>

    <div class="detail-body-card">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane :label="$t('lang.screen_tab_basic')" name="basic">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.basic_identity") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in basicIdentityFields"
                :key="item.key"
              >
                <div class="field">
                  <label>
                    {{ $t(item.label) }}
                    <span v-if="item.required" class="req">*</span>
                  </label>
                  <el-select
                    v-if="item.type === 'select'"
                    v-model="form[item.key]"
                    size="small"
                    clearable
                  >
                    <el-option
                      v-for="opt in getFieldOptions(item)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-else
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.location_belong") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in locationFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.hierarchy_locate") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in hierarchyFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>

            <div class="private-panel">
              <div class="sub-label">{{ $t("lang.private_attrs") }}</div>
              <div class="private-table-wrap">
                <el-table
                  :data="privateAttrs"
                  class="private-table"
                  size="small"
                  :empty-text="$t('cm.nodata')"
                >
                  <el-table-column
                    :label="$t('lang.attr_name')"
                    min-width="200"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row.name"
                        size="small"
                        placeholder="key"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('lang.attr_value')"
                    min-width="200"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row.value"
                        size="small"
                        placeholder="value"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('cm.operate')"
                    width="88"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="delete-link"
                        @click="removePrivateAttr(scope.$index)"
                        >{{ $t("cm.delete") }}</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-button
                size="small"
                icon="el-icon-plus"
                class="add-attr-btn"
                @click="addPrivateAttr"
                >{{ $t("lang.add_private_attr") }}</el-button
              >

              <div class="image-panel">
                <div class="sub-label">{{ $t("lang.image_upload_path") }}</div>
                <div class="image-list">
                  <div
                    class="image-thumb is-empty"
                    v-if="!imagePreviews.length"
                  >
                    <i class="el-icon-picture-outline"></i>
                    <span>{{ $t("lang.example_image") }} 1</span>
                  </div>
                  <div
                    class="image-thumb"
                    v-for="(img, idx) in imagePreviews"
                    :key="img.id || idx"
                  >
                    <img v-if="img.url" :src="img.url" alt="" />
                    <span v-else>{{ img.name }}</span>
                    <i class="el-icon-close" @click="removeImage(idx)"></i>
                  </div>
                </div>
                <div class="image-actions">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden-file"
                    @change="onImageFiles"
                  />
                  <div class="file-picker" @click="triggerImageInput">
                    <el-button size="small" icon="el-icon-upload2">{{
                      $t("lang.select_file")
                    }}</el-button>
                    <span class="file-hint">{{ imageFileHint }}</span>
                  </div>
                  <el-input
                    v-model="form.imagePaths"
                    size="small"
                    class="path-input"
                    :placeholder="$t('lang.image_path_placeholder')"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.remark_section") }}</div>
            <el-input
              type="textarea"
              v-model="form.remark"
              :rows="4"
              :placeholder="$t('lang.remark_placeholder')"
            ></el-input>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.tab_tech_params')" name="technical">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.run_condition") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in technicalFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.status_source") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.data_status") }}</label>
                  <el-select v-model="form.dataStatus" size="small">
                    <el-option
                      v-for="opt in dataStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.data_source") }}</label>
                  <el-select v-model="form.dataSource" size="small" clearable>
                    <el-option
                      v-for="opt in dataSourceOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.update_time") }}</label>
                  <el-input
                    :value="form.modifyDate"
                    size="small"
                    disabled
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.tab_related_segment')" name="related">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.related_segment_list") }}</div>
            <div class="toolbar-row">
              <el-input
                v-model="segmentKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                :placeholder="$t('lang.search_segment_placeholder')"
                class="toolbar-search"
              ></el-input>
              <el-select
                v-model="segmentTypeFilter"
                size="small"
                class="toolbar-select"
              >
                <el-option
                  :label="$t('lang.all_types')"
                  value=""
                ></el-option>
                <el-option
                  v-for="opt in relationTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
              <el-button
                size="small"
                icon="el-icon-plus"
                class="ml-auto"
                @click="addSegment"
                >{{ $t("lang.add_segment") }}</el-button
              >
            </div>
            <el-table
              :data="filteredSegments"
              border
              size="small"
              :empty-text="$t('cm.nodata')"
              @selection-change="onSegmentSelectionChange"
            >
              <el-table-column type="selection" width="46"></el-table-column>
              <el-table-column
                :label="$t('lang.segment_no')"
                min-width="130"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.segmentNo" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_name')"
                min-width="140"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.segmentName" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_start')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.startPoint" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_end')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.endPoint" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.relation_type')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.relationType" size="mini">
                    <el-option
                      v-for="opt in relationTypeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.data_integrity')"
                min-width="110"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.integrity" size="mini">
                    <el-option
                      v-for="opt in integrityOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.relation_status')"
                min-width="110"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.status" size="mini">
                    <el-option
                      v-for="opt in relationStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('cm.operate')"
                width="80"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="removeSegment(scope.row)"
                    >{{ $t("lang.remove_item") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="batch-bar">
              <span>{{ $t("lang.selected_count") }} {{ selectedSegments.length }}</span>
              <div>
                <el-button type="primary" size="small" @click="batchConfirmSegments">{{
                  $t("lang.batch_confirm")
                }}</el-button>
                <el-button size="small" @click="batchRemoveSegments">{{
                  $t("lang.batch_remove")
                }}</el-button>
              </div>
            </div>
            <div class="relate-hint">{{ $t("lang.relate_hint") }}</div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lang.maintenance_records')" name="maintenance">
          <div class="section-block">
            <div class="section-title">{{ $t("lang.maintenance_records") }}</div>
            <div class="stat-grid">
              <div class="mini-stat">
                <p>{{ $t("lang.maintenance_total") }}</p>
                <strong>{{ maintenanceStats.total }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.last_maintenance_date") }}</p>
                <strong>{{ maintenanceStats.lastDate }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.next_plan_maintenance") }}</p>
                <strong>{{ maintenanceStats.nextDate }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.abnormal_count") }}</p>
                <strong class="danger">{{ maintenanceStats.abnormal }}</strong>
              </div>
            </div>
            <div class="toolbar-row filter-row">
              <div class="field compact">
                <label>{{ $t("lang.start_date") }}</label>
                <el-date-picker
                  v-model="maintenanceQuery.startDate"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.end_date") }}</label>
                <el-date-picker
                  v-model="maintenanceQuery.endDate"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.maintenance_round") }}</label>
                <el-input
                  v-model="maintenanceQuery.round"
                  size="small"
                  :placeholder="$t('lang.round_placeholder')"
                ></el-input>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.status") }}</label>
                <el-select v-model="maintenanceQuery.status" size="small">
                  <el-option :label="$t('lang.all_option')" value=""></el-option>
                  <el-option
                    v-for="opt in maintenanceStatusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  ></el-option>
                </el-select>
              </div>
              <div class="filter-actions">
                <el-button type="primary" size="small" @click="applyMaintenanceFilter">{{
                  $t("cm.query")
                }}</el-button>
                <el-button size="small" @click="resetMaintenanceFilter">{{
                  $t("cm.reset")
                }}</el-button>
              </div>
            </div>
            <el-table
              :data="filteredMaintenance"
              border
              size="small"
              :empty-text="$t('cm.nodata')"
            >
              <el-table-column type="selection" width="46"></el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_date')"
                prop="date"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_round')"
                prop="round"
                min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_content')"
                prop="content"
                min-width="140"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_items')"
                prop="items"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_method')"
                prop="method"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.defect_desc')"
                prop="defect"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.handle_status')"
                prop="handleStatus"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.reinspect_after')"
                prop="reinspect"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.report_no')"
                prop="reportNo"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.measured_load')"
                prop="measuredLoad"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.measured_scale')"
                prop="measuredScale"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.status')"
                min-width="90"
              >
                <template slot-scope="scope">
                  <span :class="['status-tag', statusClass(scope.row.status)]">{{
                    scope.row.status || "/"
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_unit')"
                prop="unit"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.sign_name')"
                prop="sign"
                min-width="80"
              ></el-table-column>
              <el-table-column
                :label="$t('cm.operate')"
                width="120"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="editMaintenance(scope.row)"
                    >{{ $t("cm.edit") }}</el-button
                  >
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="removeMaintenance(scope.row)"
                    >{{ $t("cm.delete") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.add_maintenance") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_date") }}</label>
                  <el-date-picker
                    v-model="maintenanceForm.date"
                    type="date"
                    size="small"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_round") }}</label>
                  <el-input v-model="maintenanceForm.round" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.report_no") }}</label>
                  <el-input v-model="maintenanceForm.reportNo" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.status") }}</label>
                  <el-select v-model="maintenanceForm.status" size="small">
                    <el-option
                      v-for="opt in maintenanceStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.inspect_items_multi") }}</label>
                  <el-checkbox-group
                    v-model="maintenanceForm.itemList"
                    class="check-group"
                  >
                    <el-checkbox
                      v-for="opt in inspectItemOptions"
                      :key="opt"
                      :label="opt"
                      >{{ opt }}</el-checkbox
                    >
                  </el-checkbox-group>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.inspect_method") }}</label>
                  <el-select v-model="maintenanceForm.method" size="small" clearable>
                    <el-option
                      v-for="opt in inspectMethodOptions"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.handle_status") }}</label>
                  <el-select v-model="maintenanceForm.handleStatus" size="small">
                    <el-option
                      v-for="opt in handleStatusOptions"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.defect_desc") }}</label>
                  <el-input
                    v-model="maintenanceForm.defect"
                    size="small"
                    :placeholder="$t('lang.defect_placeholder')"
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.reinspect_after") }}</label>
                  <el-input
                    v-model="maintenanceForm.reinspect"
                    size="small"
                    :placeholder="$t('lang.reinspect_placeholder')"
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.measured_load") }}</label>
                  <el-input v-model="maintenanceForm.measuredLoad" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.measured_scale") }}</label>
                  <el-input v-model="maintenanceForm.measuredScale" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_unit") }}</label>
                  <el-input v-model="maintenanceForm.unit" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.sign_name") }}</label>
                  <el-input v-model="maintenanceForm.sign" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="field">
                  <label>{{ $t("lang.inspect_content") }}</label>
                  <el-input
                    type="textarea"
                    :rows="3"
                    v-model="maintenanceForm.content"
                    :placeholder="$t('lang.inspect_content_placeholder')"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
            <div class="form-actions">
              <el-button type="primary" size="small" @click="saveMaintenance">{{
                $t("lang.save_record")
              }}</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { debounce } from "@/utils/funcUtil";

function emptyForm() {
  return {
    specCode: "",
    pipelineName: "",
    name: "",
    kksCode: "",
    unitName: "",
    systemNo: "",
    safetyArea: "",
    roomNo: "",
    islandType: "",
    responsiblePerson: "",
    pipelineNo: "",
    flowCoord: "",
    flowDrawingNo: "",
    isoCode: "",
    installDrawingNo: "",
    installInnerCode: "",
    parentSystemNo: "",
    systemCode: "",
    levelNo: "",
    systemName: "",
    parentLocationNo: "",
    locationNo: "",
    locationDepth: "",
    locationName: "",
    deviceNo: "",
    orientation: "",
    plantUnit: "",
    processName: "",
    drawingNo: "",
    remark: "",
    imagePaths: "",
    startPoint: "",
    endPoint: "",
    operatingPressure: "",
    operatingTemperature: "",
    designPressure: "",
    designTemperature: "",
    nominalDiameter: "",
    outerDiameter: "",
    wallThickness: "",
    material: "",
    centerElevation: "",
    workingMedium: "",
    flowVelocity: "",
    thermalDisplacement: "",
    dataStatus: "已发布",
    dataSource: "",
    modifyDate: ""
  };
}

function emptyMaintenance() {
  return {
    id: "",
    date: "",
    round: "",
    reportNo: "",
    status: "正常",
    itemList: [],
    items: "",
    method: "",
    handleStatus: "无需处理",
    defect: "",
    reinspect: "",
    measuredLoad: "",
    measuredScale: "",
    unit: "",
    sign: "",
    content: ""
  };
}

let rowSeed = 1;
function nextId() {
  rowSeed += 1;
  return "row-" + Date.now() + "-" + rowSeed;
}

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
      saving: false,
      activeTab: "basic",
      detail: {},
      form: emptyForm(),
      privateAttrs: [{ name: "", value: "" }],
      imagePreviews: [],
      relatedSegments: [],
      selectedSegments: [],
      segmentKeyword: "",
      segmentTypeFilter: "",
      maintenanceRecords: [],
      maintenanceFilter: {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      },
      maintenanceQuery: {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      },
      maintenanceForm: emptyMaintenance(),
      basicIdentityFields: [
        { key: "specCode", label: "lang.component_no", required: true },
        { key: "pipelineName", label: "lang.component_name", required: true },
        { key: "kksCode", label: "lang.kks_code" },
        { key: "unitName", label: "lang.belong_unit", required: true },
        { key: "systemNo", label: "lang.system_no" },
        { key: "safetyArea", label: "lang.safety_area" },
        { key: "roomNo", label: "lang.room_no" },
        { key: "islandType", label: "lang.island_type", type: "select" },
        { key: "responsiblePerson", label: "lang.pipe_owner" }
      ],
      locationFields: [
        { key: "pipelineNo", label: "lang.pipeline_on_line" },
        { key: "flowCoord", label: "lang.flow_coord" },
        { key: "flowDrawingNo", label: "lang.flow_drawing_no" },
        { key: "isoCode", label: "lang.iso_drawing_no" },
        { key: "installDrawingNo", label: "lang.install_drawing_no" },
        { key: "installInnerCode", label: "lang.install_inner_code" }
      ],
      hierarchyFields: [
        {
          key: "parentSystemNo",
          label: "lang.parent_system_no",
          placeholder: "如 6VVP"
        },
        { key: "systemCode", label: "lang.system_no", placeholder: "如 VVP" },
        {
          key: "levelNo",
          label: "lang.system_depth",
          placeholder: "层级深度"
        },
        {
          key: "systemName",
          label: "lang.system_name_label",
          placeholder: "如 主蒸汽系统"
        },
        { key: "parentLocationNo", label: "lang.parent_location_no" },
        { key: "locationNo", label: "lang.location_no" },
        { key: "locationDepth", label: "lang.location_depth" },
        { key: "locationName", label: "lang.location_name" },
        { key: "deviceNo", label: "lang.device_no" },
        { key: "orientation", label: "lang.orientation", placeholder: "如 N/E/S/W" },
        { key: "plantUnit", label: "lang.plant_unit" },
        { key: "processName", label: "lang.process_name" },
        { key: "drawingNo", label: "lang.drawing_no" }
      ],
      technicalFields: [
        { key: "operatingPressure", label: "lang.work_pressure" },
        { key: "operatingTemperature", label: "lang.work_temperature" },
        { key: "designPressure", label: "lang.design_pressure_mpa" },
        { key: "designTemperature", label: "lang.design_temperature_c" },
        { key: "nominalDiameter", label: "lang.pipe_nominal_inch" },
        { key: "outerDiameter", label: "lang.pipe_outer_diameter_mm" },
        { key: "wallThickness", label: "lang.pipe_wall_thickness_mm" },
        { key: "material", label: "lang.pipe_material" },
        { key: "centerElevation", label: "lang.pipe_center_elevation" },
        { key: "workingMedium", label: "lang.fluid_medium" },
        { key: "flowVelocity", label: "lang.flow_velocity" },
        { key: "thermalDisplacement", label: "lang.thermal_displacement" }
      ]
    };
  },
  computed: {
    islandOptions() {
      return [
        { label: this.$t("lang.conventional_island"), value: "常规岛" },
        { label: this.$t("lang.nuclear_island"), value: "核岛" }
      ];
    },
    dataStatusOptions() {
      return [
        { label: this.$t("lang.status_draft"), value: "草稿" },
        { label: this.$t("lang.status_published"), value: "已发布" },
        { label: this.$t("lang.status_pending"), value: "待审核" },
        { label: this.$t("lang.status_disabled"), value: "已停用" }
      ];
    },
    dataSourceOptions() {
      return [
        { label: this.$t("lang.source_3d"), value: "三维模型导入" },
        { label: this.$t("lang.source_base"), value: "基础库同步" },
        { label: this.$t("lang.source_manual"), value: "手动录入" }
      ];
    },
    relationTypeOptions() {
      return [
        { label: this.$t("lang.relation_install"), value: "安装位置" },
        { label: this.$t("lang.relation_medium"), value: "介质连通" },
        { label: this.$t("lang.relation_support"), value: "支撑关联" },
        { label: this.$t("lang.relation_measure"), value: "测量关联" }
      ];
    },
    integrityOptions() {
      return [
        { label: this.$t("lang.integrity_complete"), value: "完整" },
        { label: this.$t("lang.integrity_pending"), value: "待补" },
        { label: this.$t("lang.integrity_missing"), value: "缺失" }
      ];
    },
    relationStatusOptions() {
      return [
        { label: this.$t("lang.status_confirmed"), value: "已确认" },
        { label: this.$t("lang.status_unconfirmed"), value: "待确认" }
      ];
    },
    maintenanceStatusOptions() {
      return [
        { label: this.$t("lang.pipe_status_normal"), value: "正常" },
        { label: this.$t("lang.status_abnormal"), value: "异常" },
        { label: this.$t("lang.status_to_confirm"), value: "待确认" }
      ];
    },
    inspectItemOptions() {
      return ["超声", "硬度", "金相", "表面", "测厚", "其他"];
    },
    inspectMethodOptions() {
      return ["UT", "RT", "PT", "MT", "TOFD", "相控阵", "硬度", "金相", "测厚"];
    },
    handleStatusOptions() {
      return ["无需处理", "返修", "更换", "监控运行"];
    },
    imageFileHint() {
      if (!this.imagePreviews.length) {
        return this.$t("lang.no_file_chosen");
      }
      if (this.imagePreviews.length === 1) {
        return this.imagePreviews[0].name;
      }
      return this.imagePreviews.length + this.$t("lang.files_selected");
    },
    filteredSegments() {
      const keyword = (this.segmentKeyword || "").trim().toLowerCase();
      const type = this.segmentTypeFilter;
      return this.relatedSegments.filter(item => {
        const matchType = !type || item.relationType === type;
        if (!keyword) return matchType;
        const text = [item.segmentNo, item.segmentName].join(" ").toLowerCase();
        return matchType && text.indexOf(keyword) !== -1;
      });
    },
    filteredMaintenance() {
      const query = this.maintenanceFilter;
      return this.maintenanceRecords.filter(item => {
        if (query.startDate && item.date && item.date < query.startDate) {
          return false;
        }
        if (query.endDate && item.date && item.date > query.endDate) {
          return false;
        }
        if (
          query.round &&
          (item.round || "").toLowerCase().indexOf(query.round.toLowerCase()) === -1
        ) {
          return false;
        }
        if (query.status && item.status !== query.status) return false;
        return true;
      });
    },
    maintenanceStats() {
      const list = this.maintenanceRecords;
      const dates = list.map(item => item.date).filter(Boolean).sort();
      return {
        total: list.length,
        lastDate: dates.length ? dates[dates.length - 1] : "/",
        nextDate: "/",
        abnormal: list.filter(item => item.status === "异常").length
      };
    }
  },
  created() {
    this._debouncedSave = debounce(this.saveDetail, 400);
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
    getFieldOptions(item) {
      if (item.key === "islandType") return this.islandOptions;
      return [];
    },
    normalizeText(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined) return "";
      return val;
    },
    fillForm(detail) {
      const form = emptyForm();
      Object.keys(form).forEach(key => {
        if (detail[key] !== undefined && detail[key] !== null) {
          form[key] = this.normalizeText(detail[key]);
        }
      });
      if (!form.pipelineName) form.pipelineName = detail.name || "";
      if (!form.specCode) form.specCode = detail.specCode || detail.name || "";
      if (!form.systemCode) form.systemCode = detail.systemNo || "";
      this.form = form;
    },
    normalizeAttrs(list) {
      if (Array.isArray(list) && list.length) {
        return list.map(item => ({
          name: item.name || item.key || "",
          value: item.value == null ? "" : item.value
        }));
      }
      return [{ name: "", value: "" }];
    },
    normalizeSegments(list) {
      if (!Array.isArray(list)) return [];
      return list.map(item => ({
        id: item.id || nextId(),
        segmentNo: item.segmentNo || item.pipelineNo || "",
        segmentName: item.segmentName || item.pipelineName || item.name || "",
        startPoint: item.startPoint || "",
        endPoint: item.endPoint || "",
        relationType: item.relationType || "安装位置",
        integrity: item.integrity || "完整",
        status: item.status || "待确认"
      }));
    },
    normalizeMaintenance(list) {
      if (!Array.isArray(list)) return [];
      return list.map(item => ({
        id: item.id || nextId(),
        date: item.date || item.maintainDate || "",
        round: item.round || "",
        content: item.content || "",
        items: item.items || "",
        method: item.method || "",
        defect: item.defect || "",
        handleStatus: item.handleStatus || "",
        reinspect: item.reinspect || "",
        reportNo: item.reportNo || "",
        measuredLoad: item.measuredLoad || "",
        measuredScale: item.measuredScale || "",
        status: item.status || "正常",
        unit: item.unit || "",
        sign: item.sign || ""
      }));
    },
    resetLocalState() {
      this.form = emptyForm();
      this.privateAttrs = [{ name: "", value: "" }];
      this.imagePreviews = [];
      this.relatedSegments = [];
      this.selectedSegments = [];
      this.segmentKeyword = "";
      this.segmentTypeFilter = "";
      this.maintenanceRecords = [];
      this.maintenanceForm = emptyMaintenance();
      this.resetMaintenanceFilter();
    },
    loadDetail() {
      if (!this.directoryId) return;
      this.loading = true;
      this.activeTab = "basic";
      this.resetLocalState();
      api
        .getResourceDirectoryDetail(this.directoryId)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
            this.fillForm(this.detail);
            this.privateAttrs = this.normalizeAttrs(this.detail.privateAttrs);
            this.relatedSegments = this.normalizeSegments(
              this.detail.relatedSegments
            );
            this.maintenanceRecords = this.normalizeMaintenance(
              this.detail.maintenanceRecords
            );
            if (this.detail.imagePaths) {
              this.form.imagePaths = this.detail.imagePaths;
            }
          } else {
            this.detail = {};
            this.resetLocalState();
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.detail = {};
          this.resetLocalState();
        });
    },
    triggerImageInput() {
      this.$refs.imageInput && this.$refs.imageInput.click();
    },
    addPrivateAttr() {
      this.privateAttrs.push({ name: "", value: "" });
    },
    removePrivateAttr(index) {
      this.privateAttrs.splice(index, 1);
      if (!this.privateAttrs.length) {
        this.privateAttrs.push({ name: "", value: "" });
      }
    },
    onImageFiles(event) {
      const files = event.target.files || [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = window.URL.createObjectURL(file);
        this.imagePreviews.push({
          id: nextId(),
          name: file.name,
          url,
          file
        });
      }
      event.target.value = "";
    },
    removeImage(index) {
      const item = this.imagePreviews[index];
      if (item && item.url && item.url.indexOf("blob:") === 0) {
        window.URL.revokeObjectURL(item.url);
      }
      this.imagePreviews.splice(index, 1);
    },
    addSegment() {
      this.relatedSegments.push({
        id: nextId(),
        segmentNo: "",
        segmentName: "",
        startPoint: "",
        endPoint: "",
        relationType: "安装位置",
        integrity: "待补",
        status: "待确认"
      });
    },
    removeSegment(row) {
      this.relatedSegments = this.relatedSegments.filter(item => item.id !== row.id);
    },
    onSegmentSelectionChange(val) {
      this.selectedSegments = val || [];
    },
    batchConfirmSegments() {
      if (!this.selectedSegments.length) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      const ids = this.selectedSegments.map(item => item.id);
      this.relatedSegments.forEach(item => {
        if (ids.indexOf(item.id) !== -1) item.status = "已确认";
      });
    },
    batchRemoveSegments() {
      if (!this.selectedSegments.length) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      const ids = this.selectedSegments.map(item => item.id);
      this.relatedSegments = this.relatedSegments.filter(
        item => ids.indexOf(item.id) === -1
      );
      this.selectedSegments = [];
    },
    applyMaintenanceFilter() {
      this.maintenanceFilter = Object.assign({}, this.maintenanceQuery);
    },
    resetMaintenanceFilter() {
      this.maintenanceQuery = {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      };
      this.maintenanceFilter = Object.assign({}, this.maintenanceQuery);
    },
    editMaintenance(row) {
      this.maintenanceForm = Object.assign(emptyMaintenance(), row, {
        itemList: row.items ? String(row.items).split(/[、,，]/).filter(Boolean) : []
      });
    },
    removeMaintenance(row) {
      this.maintenanceRecords = this.maintenanceRecords.filter(
        item => item.id !== row.id
      );
      if (this.maintenanceForm.id === row.id) {
        this.maintenanceForm = emptyMaintenance();
      }
    },
    saveMaintenance() {
      const form = this.maintenanceForm;
      const record = Object.assign({}, form, {
        id: form.id || nextId(),
        items: (form.itemList || []).join("、")
      });
      const index = this.maintenanceRecords.findIndex(item => item.id === record.id);
      if (index >= 0) {
        this.$set(this.maintenanceRecords, index, record);
      } else {
        this.maintenanceRecords.unshift(record);
      }
      this.maintenanceForm = emptyMaintenance();
      this.$message.success(this.$t("cm.savesuccess"));
    },
    statusClass(status) {
      if (status === "异常") return "is-error";
      if (status === "待确认") return "is-warn";
      return "is-success";
    },
    onSaveClick() {
      if (this.saving) return;
      this._debouncedSave && this._debouncedSave();
    },
    toNumber(val) {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    },
    toText(val) {
      if (val === null || val === undefined) return "";
      return val;
    },
    buildUpdatePayload() {
      const form = this.form || {};
      return {
        id: this.detail.id || this.directoryId,
        pipelineNo: this.toText(form.pipelineNo),
        pipelineName: this.toText(form.pipelineName),
        startPoint: this.toText(form.startPoint),
        endPoint: this.toText(form.endPoint),
        workingMedium: this.toText(form.workingMedium),
        nominalDiameter: this.toNumber(form.nominalDiameter),
        outerDiameter: this.toNumber(form.outerDiameter),
        wallThickness: this.toNumber(form.wallThickness),
        material: this.toText(form.material),
        specCode: this.toText(form.specCode),
        designPressure: this.toNumber(form.designPressure),
        designTemperature: this.toNumber(form.designTemperature),
        operatingPressure: this.toNumber(form.operatingPressure),
        operatingTemperature: this.toNumber(form.operatingTemperature),
        isoCode: this.toText(form.isoCode)
      };
    },
    saveDetail() {
      if (this.saving) return;
      const payload = this.buildUpdatePayload();
      if (!payload.id) return;
      this.saving = true;
      api
        .updateResourceDirectory(payload)
        .then(res => {
          this.saving = false;
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.savesuccess"));
            this.$emit("updated");
            this.loadDetail();
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
.detail-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  background: #f4f6f9;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 4px 10px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
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
  /deep/ .el-select,
  /deep/ .el-date-editor {
    width: 100%;
  }
  /deep/ .el-input.is-disabled .el-input__inner {
    color: #1f2329;
    background: #fff;
  }
}
.req {
  color: #ef4444;
  margin-left: 2px;
}
.private-panel {
  margin-top: 8px;
}
.sub-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 18px;
}
.private-table-wrap {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  /deep/ .el-table {
    font-size: 13px;
  }
  /deep/ .el-table::before,
  /deep/ .el-table--group::after,
  /deep/ .el-table--border::after {
    display: none;
  }
  /deep/ .el-table th {
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
    font-size: 13px;
    height: 40px;
    padding: 0;
    border-bottom: 1px solid #e2e8f0;
  }
  /deep/ .el-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  /deep/ .el-table .cell {
    padding: 0 12px;
    overflow: visible;
  }
  /deep/ .el-input {
    width: 100%;
    display: block;
  }
  /deep/ .el-input__inner {
    width: 100%;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    border-color: #e2e8f0;
    box-sizing: border-box;
  }
  /deep/ .el-table__row:last-child td {
    border-bottom: none;
  }
}
.delete-link {
  color: #ef4444 !important;
  padding: 0 !important;
  &:hover {
    text-decoration: underline;
  }
}
.add-attr-btn {
  margin-top: 10px;
  color: #1f2937;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  &:hover,
  &:focus {
    color: #1a6fc4;
    border-color: #1a6fc4;
    background: #f8fbff;
  }
}
.image-panel {
  margin-top: 20px;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.image-thumb {
  position: relative;
  width: 96px;
  height: 96px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 12px;
  color: #64748b;
  gap: 4px;
  i.el-icon-picture-outline {
    font-size: 22px;
    color: #94a3b8;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .el-icon-close {
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
    background: rgba(15, 23, 42, 0.55);
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    padding: 2px;
  }
}
.image-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hidden-file {
  display: none;
}
.file-picker {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 36px;
  padding: 0 8px 0 4px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  gap: 8px;
  &:hover {
    border-color: #1a6fc4;
  }
  /deep/ .el-button {
    border: none;
    background: transparent;
    padding: 0 8px;
    color: #334155;
    font-weight: 500;
  }
}
.file-hint {
  font-size: 12px;
  color: #94a3b8;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path-input {
  flex: 1;
  min-width: 200px;
  /deep/ .el-input__inner {
    height: 36px;
    line-height: 36px;
    border-color: #e2e8f0;
    border-radius: 6px;
  }
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.toolbar-search {
  width: 240px;
}
.toolbar-select {
  width: 160px;
}
.ml-auto {
  margin-left: auto;
}
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
}
.relate-hint {
  margin-top: 12px;
  padding: 16px;
  text-align: center;
  color: #909399;
  font-size: 13px;
  border: 1px dashed #e6e8eb;
  border-radius: 8px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.mini-stat {
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  padding: 12px;
  p {
    margin: 0 0 6px;
    font-size: 12px;
    color: #909399;
  }
  strong {
    font-size: 18px;
    color: #1f2329;
  }
  .danger {
    color: #ef4444;
  }
}
.filter-row {
  padding: 12px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  align-items: flex-end;
}
.field.compact {
  min-width: 160px;
}
.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.status-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  &.is-success {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
  &.is-warn {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }
  &.is-error {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
}
.check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 4px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
